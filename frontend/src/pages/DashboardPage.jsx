import { useUser } from '../context/UserContext';
import { useBooks } from '../context/BookContext';
import { Book, Calendar, Clock, AlertCircle, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../styles/DashboardPage.module.css';
import { useState } from 'react';

const DashboardPage = () => {
    const {
        user,
        loading,
        borrowedBooks,
        wishlist,
        removeFromWishlist,
        history,
        cancelReservation,
        returnBook,
        pickupBook,
        extendLoan,
        stats,
    } = useUser();
    const { refreshBooks } = useBooks();

    const [actionLoading, setActionLoading] = useState({});
    const [error, setError] = useState('');

    const handleReturn = async (book) => {
        const reservationId = book.id; // Always use reservationId
        setActionLoading(prev => ({ ...prev, [reservationId]: 'return' }));
        setError('');
        try {
            const result = await returnBook(book);
            if (result.success) {
                refreshBooks();
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Failed to return book');
        } finally {
            setActionLoading(prev => ({ ...prev, [reservationId]: null }));
        }
    };

    const handlePickup = async (reservationId) => {
        setActionLoading(prev => ({ ...prev, [reservationId]: 'pickup' }));
        setError('');
        try {
            const result = await pickupBook(reservationId);
            if (!result.success) {
                setError(result.message);
            }
        } catch (err) {
            setError('Failed to pickup book');
        } finally {
            setActionLoading(prev => ({ ...prev, [reservationId]: null }));
        }
    };

 

    const handleCancel = async (book) => {
        const reservationId = book.id; // Always use reservationId
        console.log('Cancel button clicked for reservationId:', reservationId, book);
        setActionLoading(prev => ({ ...prev, [reservationId]: 'cancel' }));
        setError('');
        try {
            const result = await cancelReservation(reservationId);
            if (result.success) {
                refreshBooks();
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Failed to cancel reservation');
        } finally {
            setActionLoading(prev => ({ ...prev, [reservationId]: null }));
        }
    };

    const handleExtend = async (reservationId) => {
        setActionLoading(prev => ({ ...prev, [reservationId]: 'extend' }));
        setError('');
        try {
            const result = await extendLoan(reservationId);
            if (!result.success) {
                setError(result.message);
            }
        } catch (err) {
            setError('Failed to extend loan');
        } finally {
            setActionLoading(prev => ({ ...prev, [reservationId]: null }));
        }
    };

    const handleRemoveFromWishlist = async (bookId) => {
        setActionLoading(prev => ({ ...prev, [`wishlist-${bookId}`]: true }));
        try {
            await removeFromWishlist(bookId);
        } catch (err) {
            setError('Failed to remove from wishlist');
        } finally {
            setActionLoading(prev => ({ ...prev, [`wishlist-${bookId}`]: null }));
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading dashboard...</div>;
    }

    if (!user) {
        return <div className={styles.error}>Please login to view your dashboard.</div>;
    }

    return (
        <div className={styles.container}>
            {error && <div className={styles.errorAlert}>{error}</div>}

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
                        <span className={styles.statValue}>{stats.activeLoans}</span>
                        <span className={styles.statLabel}>Active Loans</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statValue}>{stats.lifetimeBorrowed}</span>
                        <span className={styles.statLabel}>Lifetime Borrowed</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statValue}>{stats.wishlistCount}</span>
                        <span className={styles.statLabel}>Wishlist</span>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <h2>Current Loans</h2>
                {borrowedBooks.length > 0 ? (
                    <div className={styles.grid}>
                        {borrowedBooks.map(book => {
                            const isReserved = book.status === 'Reserved';
                            const reservationId = book.id; // This is the reservation UUID
                            const isLoading = actionLoading[reservationId];
                            const bookCover = book.cover || book.book?.cover;
                            const bookTitle = book.title || book.book?.title;
                            const pickupDate = book.pickupDate ? new Date(book.pickupDate).toLocaleDateString() : '';

                            return (
                                <div key={reservationId} className={`${styles.card} ${book.isOverdue && !isReserved ? styles.overdue : ''}`}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.bookInfo}>
                                            {bookCover && <img src={bookCover} alt={bookTitle} className={styles.bookCover} />}
                                            <div>
                                                <h3>{bookTitle}</h3>
                                                <span className={`${styles.statusBadge} ${isReserved ? styles.reservedBadge : ''}`}>
                                                    {isReserved ? 'Reserved' : 'Borrowed'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.cardBody}>
                                        <div className={styles.metaRow}>
                                            <Calendar size={16} />
                                            <span>{isReserved ? `Pickup: ${pickupDate}` : `Due: ${new Date(book.dueDate).toLocaleDateString()}`}</span>
                                        </div>
                                        {!isReserved && (
                                            <div className={styles.metaRow}>
                                                <Clock size={16} />
                                                <span className={book.isOverdue ? styles.textRed : ''}>
                                                    {book.isOverdue ? `Overdue by ${Math.abs(book.daysRemaining)} days` : `${book.daysRemaining} days remaining`}
                                                </span>
                                            </div>
                                        )}
                                        {book.isOverdue && !isReserved && (
                                            <div className={styles.fineAlert}>
                                                <AlertCircle size={16} />
                                                <span>Est. Fine: ${book.fineAmount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        {book.extended && (
                                            <div className={styles.metaRow}>
                                                <span className={styles.extendedBadge}>Extended</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.cardActions}>
                                        {isReserved ? (
                                            <>
                                                <button
                                                    onClick={() => handleCancel(book)}
                                                    className={styles.cancelBtn}
                                                    disabled={!!isLoading}
                                                >
                                                    {isLoading === 'cancel' ? 'Canceling...' : 'Cancel Reservation'}
                                                </button>
                                                <button
                                                    onClick={() => handlePickup(reservationId)}
                                                    className={styles.pickupBtn}
                                                    disabled={!!isLoading}
                                                    title="Pickup book"
                                                >
                                                    {isLoading === 'pickup' ? 'Processing...' : 'Pickup Book'}
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleExtend(reservationId)}
                                                    className={styles.extendBtn}
                                                    disabled={!!isLoading || book.extended}
                                                    title={book.extended ? 'Already extended once' : 'Extend loan by 7 days'}
                                                >
                                                    {isLoading === 'extend' ? 'Extending...' : 'Extend'}
                                                </button>
                                                <button
                                                    onClick={() => handleReturn(book)}
                                                    className={styles.returnBtn}
                                                    disabled={!!isLoading}
                                                >
                                                    {isLoading === 'return' ? 'Returning...' : 'Return'}
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
                        {history.map((book, index) => {
                            const bookId = book.bookId || book.book?.id || book.id;
                            const bookTitle = book.title || book.book?.title;
                            const returnedDate = book.returnedDate || book.returnedAt;

                            return (
                                <div key={index} className={styles.historyItem}>
                                    <div>
                                        <span className={styles.historyTitle}>{bookTitle}</span>
                                        <span className={styles.historyDate}>
                                            Returned: {returnedDate ? new Date(returnedDate).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                    {bookId && <Link to={`/book/${bookId}`} className={styles.viewLink}>View Book</Link>}
                                </div>
                            );
                        })}
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
                                    <button
                                        onClick={() => handleRemoveFromWishlist(book.id)}
                                        className={styles.removeBtn}
                                        disabled={actionLoading[`wishlist-${book.id}`]}
                                    >
                                        {actionLoading[`wishlist-${book.id}`] ? 'Removing...' : 'Remove'}
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
