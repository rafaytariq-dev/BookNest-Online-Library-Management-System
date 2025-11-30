import { useLocation, Link } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { CheckCircle } from 'lucide-react';
import styles from '../styles/ConfirmationPage.module.css';

const ConfirmationPage = () => {
    const location = useLocation();
    const { reservationId, items } = location.state || {};

    if (!reservationId) {
        return (
            <div className={styles.error}>
                <p>No reservation found.</p>
                <Link to="/">Return Home</Link>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <CheckCircle size={64} color="#22c55e" className={styles.icon} />
                <h1>Reservation Confirmed!</h1>
                <p className={styles.message}>
                    Your books have been successfully reserved. Please show the QR code below at the library desk to pick up your books.
                </p>

                <div className={styles.qrSection}>
                    <div className={styles.qrWrapper}>
                        <QRCode value={reservationId} size={150} />
                    </div>
                    <p className={styles.resId}>ID: {reservationId}</p>
                </div>

                <div className={styles.details}>
                    <h3>Reserved Items ({items.length})</h3>
                    <ul>
                        {items.map(item => (
                            <li key={item.reservationId}>{item.title}</li>
                        ))}
                    </ul>
                </div>

                <p className={styles.emailNote}>
                    A confirmation email has been sent to your registered email address.
                </p>

                <Link to="/dashboard" className={styles.dashboardBtn}>
                    Go to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default ConfirmationPage;
