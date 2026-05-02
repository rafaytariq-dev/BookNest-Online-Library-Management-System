import { useUser } from '../context/UserContext';
import styles from '../styles/NotificationToast.module.css';

const NotificationToast = () => {
    const { notifications, removeNotification } = useUser();

    if (notifications.length === 0) return null;

    return (
        <div className={styles.container}>
            {notifications.map(note => (
                <div
                    key={note.id}
                    className={`${styles.toast} ${styles[note.type]}`}
                >
                    <span>{note.message}</span>
                    <button
                        onClick={() => removeNotification(note.id)}
                        className={styles.closeBtn}
                        aria-label="Close notification"
                    >
                        &times;
                    </button>
                </div>
            ))}
        </div>
    );
};

export default NotificationToast;
