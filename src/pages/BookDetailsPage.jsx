import { useParams, useNavigate } from 'react-router-dom';
import { useBooks } from '../context/BookContext';
import { useUser } from '../context/UserContext';
import { Star, Calendar, Book, User as UserIcon, Heart, ArrowLeft } from 'lucide-react';
import styles from '../styles/BookDetailsPage.module.css';
import { useState } from 'react';

const BookDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getBookById, addReview } = useBooks();
    const { addToCart, addToWishlist, wishlist, cart, borrowedBooks } = useUser();

    const book = getBookById(id);
    const [showReserveModal, setShowReserveModal] = useState(false);
    const [reservationData, setReservationData] = useState({
        pickupDate: '',
        duration: '7'
    });
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);

    if (!book) {
        return <div className={styles.error}>Book not found</div>;
    }

    const isInWishlist = wishlist.some(item => item.id === book.id);
    const isInCart = cart.some(item => item.id === book.id);
    const isBorrowed = borrowedBooks.some(item => item.id === book.id);

    const displayStatus = isBorrowed ? 'Borrowed' : (book.copies === 0 ? 'Out of Stock' : 'Available');

    const handleReserve = (e) => {
        e.preventDefault();
        addToCart(book, reservationData);
        setShowReserveModal(false);
        navigate('/cart');
    };

    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate());
    const minDateStr = minDate.toISOString().split('T')[0];

    return (
        <div className={styles.container}>
            <button onClick={() => navigate(-1)} className={styles.backBtn}>
                <ArrowLeft size={20} /> Back to Catalog
            </button>

            <div className={styles.content}>
                <div className={styles.imageSection}>
                    <img src={book.cover} alt={book.title} className={styles.image} />
                </div>

                <div className={styles.infoSection}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>{book.title}</h1>
                        <button
                            onClick={() => addToWishlist(book)}
                            className={`${styles.wishlistBtn} ${isInWishlist ? styles.active : ''}`}
                            disabled={isInWishlist}
                        >
                            <Heart size={24} fill={isInWishlist ? "currentColor" : "none"} />
                        </button>
                    </div>

                    <p className={styles.author}>by {book.author}</p>

                    <div className={styles.rating}>
                        <Star size={20} fill="#FFD700" color="#FFD700" />
                        <span>{book.rating} / 5.0</span>
                    </div>

                    <div className={styles.metaGrid}>
                        <div className={styles.metaItem}>
                            <span className={styles.label}>Genre</span>
                            <span className={styles.value}>{book.genre}</span>
                        </div>
                        <div className={styles.metaItem}>
                            <span className={styles.label}>Publisher</span>
                            <span className={styles.value}>{book.publisher}</span>
                        </div>
                        <div className={styles.metaItem}>
                            <span className={styles.label}>Year</span>
                            <span className={styles.value}>{book.year}</span>
                        </div>
                        <div className={styles.metaItem}>
                            <span className={styles.label}>Pages</span>
                            <span className={styles.value}>{book.pages}</span>
                        </div>
                        <div className={styles.metaItem}>
                            <span className={styles.label}>ISBN</span>
                            <span className={styles.value}>{book.isbn}</span>
                        </div>
                        <div className={styles.metaItem}>
                            <span className={styles.label}>Status</span>
                            <span className={`${styles.status} ${styles[displayStatus.toLowerCase().replace(/\s+/g, '')]}`}>
                                {displayStatus}
                            </span>
                        </div>
                    </div>

                    <div className={styles.description}>
                        <h3>Description</h3>
                        <p>{book.description}</p>
                    </div>

                    <div className={styles.actions}>
                        {displayStatus === 'Available' && !isInCart ? (
                            <button
                                className={styles.reserveBtn}
                                onClick={() => setShowReserveModal(true)}
                            >
                                Reserve Book
                            </button>
                        ) : isInCart ? (
                            <button className={styles.inCartBtn} disabled>
                                In Reservation Cart
                            </button>
                        ) : (
                            <button className={styles.unavailableBtn} disabled>
                                {displayStatus === 'Borrowed' ? 'Currently Borrowed' : (displayStatus === 'Reserved' ? 'Reserved' : 'Currently Unavailable')}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.reviewsSection}>
                <h2>Reviews & Ratings</h2>

                <div className={styles.addReview}>
                    <h3>Write a Review</h3>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        const comment = formData.get('comment');

                        addReview(book.id, {
                            id: Date.now(),
                            user: 'Current User',
                            rating,
                            comment,
                            date: new Date().toISOString()
                        });
                        e.target.reset();
                        setRating(5);
                    }}>
                        <div className={styles.ratingInput}>
                            <label>Rating:</label>
                            <div className={styles.starRating}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className={styles.starBtn}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                    >
                                        <Star
                                            size={24}
                                            fill={(hoverRating || rating) >= star ? "#FFD700" : "none"}
                                            color={(hoverRating || rating) >= star ? "#FFD700" : "currentColor"}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className={styles.commentInput}>
                            <textarea
                                name="comment"
                                placeholder="Share your thoughts about this book..."
                                required
                                rows="3"
                            ></textarea>
                        </div>
                        <button type="submit" className={styles.submitReviewBtn}>Submit Review</button>
                    </form>
                </div>

                <div className={styles.reviewsList}>
                    {book.reviews && book.reviews.length > 0 ? (
                        book.reviews.map(review => (
                            <div key={review.id} className={styles.reviewCard}>
                                <div className={styles.reviewHeader}>
                                    <span className={styles.reviewUser}>{review.user}</span>
                                    <div className={styles.reviewRating}>
                                        <Star size={16} fill="#FFD700" color="#FFD700" />
                                        <span>{review.rating}</span>
                                    </div>
                                </div>
                                <p className={styles.reviewDate}>{new Date(review.date).toLocaleDateString()}</p>
                                <p className={styles.reviewComment}>{review.comment}</p>
                            </div>
                        ))
                    ) : (
                        <p className={styles.noReviews}>No reviews yet. Be the first to review!</p>
                    )}
                </div>
            </div >

            {showReserveModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Reserve "{book.title}"</h2>
                        <form onSubmit={handleReserve}>
                            <div className={styles.formGroup}>
                                <label>Pickup Date (Min 24h from now)</label>
                                <input
                                    type="date"
                                    required
                                    min={minDateStr}
                                    value={reservationData.pickupDate}
                                    onChange={e => setReservationData({ ...reservationData, pickupDate: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Duration</label>
                                <select
                                    value={reservationData.duration}
                                    onChange={e => setReservationData({ ...reservationData, duration: e.target.value })}
                                >
                                    <option value="7">7 Days</option>
                                    <option value="14">14 Days</option>
                                    <option value="21">21 Days</option>
                                </select>
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setShowReserveModal(false)} className={styles.cancelBtn}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.confirmBtn}>
                                    Add to Cart
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div >
    );
};

export default BookDetailsPage;
