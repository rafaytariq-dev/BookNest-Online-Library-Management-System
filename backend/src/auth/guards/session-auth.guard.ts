import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class SessionAuthGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        // Check if route is public
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        
        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        
        // Check if user is authenticated via session
        if (!request.session?.user) {
            throw new UnauthorizedException('Please login to access this resource');
        }

        // Attach user to request for controllers
        request.user = request.session.user;
        
        return true;
    }
}
