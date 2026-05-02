import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import styles from '../styles/CheckoutPage.module.css';

const CheckoutPage = () => {
    const { cart, user, checkout } = useUser();
    const navigate = useNavigate();
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Redirect if cart is empty
    useEffect(() => {
        if (cart.length === 0) {
            navigate('/');
        }
    }, [cart.length, navigate]);

    const handleConfirm = async () => {
        if (!agreed) return;

        setLoading(true);
        setError('');
        
        try {
            const result = await checkout();
            
            if (result.success) {
                navigate('/confirmation', { 
                    state: { 
                        reservationId: result.reservationId, 
                        items: cart,
                        qrCode: result.qrCode,
                    } 
                });
            } else {
                setError(result.message || 'Checkout failed. Please try again.');
            }
        } catch (err) {
            setError('An error occurred during checkout. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1>Checkout Confirmation</h1>

            <div className={styles.card}>
                <h2>User Details</h2>
                <div className={styles.row}>
                    <span>Name:</span>
                    <strong>{user.name}</strong>
                </div>
                <div className={styles.row}>
                    <span>Email:</span>
                    <strong>{user.email}</strong>
                </div>
                <div className={styles.row}>
                    <span>Member ID:</span>
                    <strong>{user.memberId}</strong>
                </div>
            </div>

            <div className={styles.card}>
                <h2>Reservation Summary</h2>
                <p>You are reserving <strong>{cart.length}</strong> books.</p>
                <ul className={styles.list}>
                    {cart.map(item => (
                        <li key={item.reservationId}>
                            {item.title} (Pickup: {item.pickupDate})
                        </li>
                    ))}
                </ul>
            </div>

            <div className={styles.terms}>
                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                    />
                    <span>
                        I agree to the library terms and conditions. I understand that late returns will incur a fine of $2.00 per day.
                    </span>
                </label>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.actions}>
                <button onClick={() => navigate('/cart')} className={styles.backBtn} disabled={loading}>
                    Back to Cart
                </button>
                <button
                    onClick={handleConfirm}
                    disabled={!agreed || loading}
                    className={styles.confirmBtn}
                >
                    {loading ? 'Processing...' : 'Confirm Reservation'}
                </button>
            </div>
        </div>
    );
};

export default CheckoutPage;
