import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useBooks } from '../context/BookContext';
import styles from '../styles/CheckoutPage.module.css';

const CheckoutPage = () => {
    const { cart, user, clearCart, setBorrowedBooks } = useUser();
    const { updateBookCopies } = useBooks();
    const navigate = useNavigate();
    const [agreed, setAgreed] = useState(false);

    if (cart.length === 0) {
        navigate('/');
        return null;
    }

    const handleConfirm = () => {
        if (!agreed) return;

        // Move items from cart to borrowed
        const newBorrowed = cart.map(item => ({
            ...item,
            borrowedDate: new Date().toISOString(),
            dueDate: new Date(new Date(item.pickupDate).getTime() + item.duration * 24 * 60 * 60 * 1000).toISOString(),
            status: 'Reserved', // Initially reserved until pickup
            extended: false
        }));

        setBorrowedBooks(prev => [...prev, ...newBorrowed]);

        // Update copies in BookContext
        cart.forEach(item => {
            updateBookCopies(item.id, -1);
        });

        // Generate reservation ID
        const reservationId = 'RES-' + Date.now().toString().slice(-6);

        // Clear cart and navigate to confirmation
        clearCart();
        navigate('/confirmation', { state: { reservationId, items: cart } });
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

            <div className={styles.actions}>
                <button onClick={() => navigate('/cart')} className={styles.backBtn}>
                    Back to Cart
                </button>
                <button
                    onClick={handleConfirm}
                    disabled={!agreed}
                    className={styles.confirmBtn}
                >
                    Confirm Reservation
                </button>
            </div>
        </div>
    );
};

export default CheckoutPage;
