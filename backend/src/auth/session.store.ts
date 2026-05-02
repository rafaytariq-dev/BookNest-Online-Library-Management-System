import session from 'express-session';
import { DataSource, Repository, LessThan } from 'typeorm';
import { Session } from './entities/session.entity';

export class TypeOrmStore extends session.Store {
    private repository: Repository<Session>;
    private cleanupInterval: NodeJS.Timeout;

    constructor(private dataSource: DataSource) {
        super();
        this.repository = this.dataSource.getRepository(Session);
        
        // Cleanup expired sessions every hour
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 3600000);
    }

    private async cleanup() {
        try {
            const now = Date.now();
            await this.repository.delete({
                expiredAt: LessThan(now),
            });
        } catch (error) {
            console.error('Session cleanup error:', error);
        }
    }

    get = (sid: string, callback: (err: any, session?: session.SessionData | null) => void): void => {
        this.repository
            .findOne({ where: { id: sid } })
            .then((sessionEntity) => {
                if (!sessionEntity) {
                    return callback(null, null);
                }
                
                if (sessionEntity.expiredAt < Date.now()) {
                    this.destroy(sid, () => {});
                    return callback(null, null);
                }
                
                try {
                    const data = JSON.parse(sessionEntity.json);
                    callback(null, data);
                } catch (error) {
                    callback(error);
                }
            })
            .catch((err) => callback(err));
    };

    set = (sid: string, sessionData: session.SessionData, callback?: (err?: any) => void): void => {
        const maxAge = (sessionData.cookie?.maxAge || 86400000); // Default 1 day
        const expiredAt = Date.now() + maxAge;
        
        const sessionEntity = {
            id: sid,
            json: JSON.stringify(sessionData),
            expiredAt,
        };

        this.repository
            .save(sessionEntity)
            .then(() => callback?.())
            .catch((err) => callback?.(err));
    };

    destroy = (sid: string, callback?: (err?: any) => void): void => {
        this.repository
            .delete({ id: sid })
            .then(() => callback?.())
            .catch((err) => callback?.(err));
    };

    touch = (sid: string, sessionData: session.SessionData, callback?: (err?: any) => void): void => {
        const maxAge = (sessionData.cookie?.maxAge || 86400000);
        const expiredAt = Date.now() + maxAge;

        this.repository
            .update({ id: sid }, { expiredAt })
            .then(() => callback?.())
            .catch((err) => callback?.(err));
    };

    clear = (callback?: (err?: any) => void): void => {
        this.repository
            .clear()
            .then(() => callback?.())
            .catch((err) => callback?.(err));
    };

    length = (callback: (err: any, length: number) => void): void => {
        this.repository
            .count({ where: { expiredAt: LessThan(Date.now()) } })
            .then((count) => callback(null, count))
            .catch((err) => callback(err, 0));
    };

    close(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
    }
}
