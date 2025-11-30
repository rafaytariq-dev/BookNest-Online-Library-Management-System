import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Trash2, Calendar, Clock } from 'lucide-react';
import styles from '../styles/CartPage.module.css';

const CartPage = () => {
    const { cart, removeFromCart, clearCart } = useUser();
    const navigate = useNavigate();

    const calculateDueDate = (pickupDate, duration) => {
        const date = new Date(pickupDate);
        date.setDate(date.getDate() + parseInt(duration));
        return date.toLocaleDateString();
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };

    if (cart.length === 0) {
        return (
            <div className={styles.emptyContainer}>
                <h2>Your Reservation Cart is Empty</h2>
                <p>Browse our catalog to find books you'd like to read.</p>
                <Link to="/" className={styles.browseBtn}>Browse Books</Link>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1>Reservation Cart</h1>

            <div className={styles.grid}>
                <div className={styles.items}>
                    {cart.map(item => (
                        <div key={item.reservationId} className={styles.item}>
                            <img src={item.cover} alt={item.title} className={styles.image} />
                            <div className={styles.details}>
                                <h3>{item.title}</h3>
                                <p className={styles.author}>{item.author}</p>
                                <div className={styles.meta}>
                                    <div className={styles.metaItem}>
                                        <Calendar size={16} />
                                        <span>Pickup: {new Date(item.pickupDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className={styles.metaItem}>
                                        <Clock size={16} />
                                        <span>Duration: {item.duration} days</span>
                                    </div>
                                    <div className={styles.metaItem}>
                                        <span className={styles.label}>Due:</span>
                                        <span className={styles.value}>{calculateDueDate(item.pickupDate, item.duration)}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => removeFromCart(item.reservationId)}
                                className={styles.removeBtn}
                                aria-label="Remove from cart"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className={styles.summary}>
                    <h2>Summary</h2>
                    <div className={styles.summaryRow}>
                        <span>Total Books:</span>
                        <span>{cart.length}</span>
                    </div>
                    <div className={styles.policy}>
                        <h3>Late Return Policy</h3>
                        <p>A fine of $2.00 per day will be charged for each overdue book.</p>
                    </div>
                    <button onClick={handleCheckout} className={styles.checkoutBtn}>
                        Proceed to Checkout
                    </button>
                    <button onClick={clearCart} className={styles.clearBtn}>
                        Clear Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
