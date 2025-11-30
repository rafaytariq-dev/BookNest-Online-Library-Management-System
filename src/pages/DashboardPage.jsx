import { useUser } from '../context/UserContext';
import { useBooks } from '../context/BookContext';
import { Book, Calendar, Clock, AlertCircle, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../styles/DashboardPage.module.css';

const DashboardPage = () => {
    const {
        user,
        borrowedBooks,
        wishlist,
        removeFromWishlist,
        history,
        cancelReservation,
        returnBook,
        setBorrowedBooks
    } = useUser();
    const { updateBookStatus, updateBookCopies } = useBooks();

    const handleReturn = (book) => {
        returnBook(book);
        updateBookStatus(book.id, 'Available');
        updateBookCopies(book.id, 1);
    };

    const handlePickup = (reservationId) => {
        setBorrowedBooks(prev => prev.map(book => {
            if (book.reservationId === reservationId) {
                return { ...book, status: 'Borrowed' };
            }
            return book;
        }));
    };

    const handleCancel = (book) => {
        cancelReservation(book.reservationId);
        updateBookCopies(book.id, 1);
    };

    const handleExtend = (bookId) => {
        setBorrowedBooks(prev => prev.map(book => {
            if (book.id === bookId) {
                if (book.extended) {
                    alert("You have already extended this loan once.");
                    return book;
                }
                // Add 7 days to due date
                const newDueDate = new Date(new Date(book.dueDate).getTime() + 7 * 24 * 60 * 60 * 1000);
                return { ...book, dueDate: newDueDate.toISOString(), extended: true };
            }
            return book;
        }));
    };

    const isOverdue = (dueDate) => {
        return new Date(dueDate) < new Date();
    };

    const getDaysRemaining = (dueDate) => {
        const diff = new Date(dueDate) - new Date();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const lifetimeBorrowed = borrowedBooks.length + history.length;

    return (
        <div className={styles.container}>
            <div className={styles.profileHeader}>
                <div className={styles.avatar}>
                    {user.name.charAt(0)}
                </div>
                <div className={styles.userInfo}>
                    <h1>{user.name}</h1>
                    <p>{user.email} • {user.memberId}</p>
                </div>
                <div className={styles.stats}>
                    <div className={styles.stat}>
                        <span className={styles.statValue}>{borrowedBooks.length}</span>
                        <span className={styles.statLabel}>Active Loans</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statValue}>{lifetimeBorrowed}</span>
                        <span className={styles.statLabel}>Lifetime Borrowed</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statValue}>{wishlist.length}</span>
                        <span className={styles.statLabel}>Wishlist</span>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <h2>Current Loans</h2>
                {borrowedBooks.length > 0 ? (
                    <div className={styles.grid}>
                        {borrowedBooks.map(book => {
                            const overdue = isOverdue(book.dueDate);
                            const daysLeft = getDaysRemaining(book.dueDate);
                            const isReserved = book.status === 'Reserved';

                            return (
                                <div key={book.reservationId} className={`${styles.card} ${overdue ? styles.overdue : ''}`}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.bookInfo}>
                                            <img src={book.cover} alt={book.title} className={styles.bookCover} />
                                            <div>
                                                <h3>{book.title}</h3>
                                                <span className={`${styles.statusBadge} ${isReserved ? styles.reservedBadge : ''}`}>
                                                    {isReserved ? 'Reserved' : 'Borrowed'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.cardBody}>
                                        <div className={styles.metaRow}>
                                            <Calendar size={16} />
                                            <span>{isReserved ? `Pickup: ${book.pickupDate}` : `Due: ${new Date(book.dueDate).toLocaleDateString()}`}</span>
                                        </div>
                                        {!isReserved && (
                                            <div className={styles.metaRow}>
                                                <Clock size={16} />
                                                <span className={overdue ? styles.textRed : ''}>
                                                    {overdue ? `Overdue by ${Math.abs(daysLeft)} days` : `${daysLeft} days remaining`}
                                                </span>
                                            </div>
                                        )}
                                        {overdue && (
                                            <div className={styles.fineAlert}>
                                                <AlertCircle size={16} />
                                                <span>Est. Fine: ${(Math.abs(daysLeft) * 2).toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.cardActions}>
                                        {isReserved ? (
                                            <>
                                                <button onClick={() => handleCancel(book)} className={styles.cancelBtn}>
                                                    Cancel Reservation
                                                </button>
                                                <button
                                                    onClick={() => handlePickup(book.reservationId)}
                                                    className={styles.pickupBtn}
                                                    disabled={book.pickupDate !== new Date().toISOString().split('T')[0]}
                                                    title={book.pickupDate !== new Date().toISOString().split('T')[0] ? `Available for pickup on ${book.pickupDate}` : 'Pickup now'}
                                                >
                                                    Pickup Book
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => handleExtend(book.id)} className={styles.extendBtn}>
                                                    Extend
                                                </button>
                                                <button onClick={() => handleReturn(book)} className={styles.returnBtn}>
                                                    Return
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className={styles.emptyState}>You have no books currently borrowed.</p>
                )}
            </div>

            <div className={styles.section}>
                <h2>Borrowing History</h2>
                {history.length > 0 ? (
                    <div className={styles.historyList}>
                        {history.map((book, index) => (
                            <div key={index} className={styles.historyItem}>
                                <div>
                                    <span className={styles.historyTitle}>{book.title}</span>
                                    <span className={styles.historyDate}>Returned: {new Date(book.returnedDate).toLocaleDateString()}</span>
                                </div>
                                <Link to={`/book/${book.id}`} className={styles.viewLink}>View Book</Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={styles.emptyState}>No borrowing history yet.</p>
                )}
            </div>

            <div className={styles.section}>
                <h2>Wishlist</h2>
                {wishlist.length > 0 ? (
                    <div className={styles.grid}>
                        {wishlist.map(book => (
                            <div key={book.id} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <h3>{book.title}</h3>
                                    <Link to={`/book/${book.id}`} className={styles.viewLink}>View</Link>
                                </div>
                                <div className={styles.cardBody}>
                                    <p className={styles.author}>{book.author}</p>
                                    <div className={styles.metaRow}>
                                        <Heart size={16} fill="#ff4444" color="#ff4444" />
                                        <span>Saved for later</span>
                                    </div>
                                </div>
                                <div className={styles.cardActions}>
                                    <button onClick={() => removeFromWishlist(book.id)} className={styles.removeBtn}>
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={styles.emptyState}>Your wishlist is empty.</p>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
