import { useBooks } from '../context/BookContext';
import { useUser } from '../context/UserContext';
import BookCard from '../components/BookCard';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import styles from '../styles/HomePage.module.css';

const HomePage = () => {
    const { filteredBooks, loading, error } = useBooks();
    const { borrowedBooks } = useUser();

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading books...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>Error loading books: {error}</div>
            </div>
        );
    }

    // Get new arrivals (last 4 books or those marked as new arrivals)
    const newArrivals = filteredBooks
        .filter(book => book.isNewArrival)
        .slice(0, 4);
    
    // If no new arrivals marked, use last 4 books
    const displayNewArrivals = newArrivals.length > 0 
        ? newArrivals 
        : filteredBooks.slice(-4).reverse();

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>Welcome to BookNest</h1>
                    <p>Discover your next great read</p>
                </div>
                <div className={styles.controls}>
                    <SearchBar />
                    <FilterBar />
                </div>
            </header>

            <section className={styles.featuredSection}>
                <h2>New Arrivals</h2>
                <div className={styles.featuredGrid}>
                    {displayNewArrivals.map(book => {
                         const borrowedBook = borrowedBooks.find(b => b.bookId === book.id || b.id === book.id);
                         const status = borrowedBook 
                             ? (borrowedBook.status === 'Reserved' ? 'Reserved' : 'Borrowed')
                             : (book.availableCopies === 0 ? 'Out of Stock' : 'Available');
                         return <BookCard key={book.id} book={{ ...book, copies: book.availableCopies, status }} />;
                    })}
                </div>
            </section>

            <section className={styles.mainSection}>
                <h2>All Books</h2>

                {filteredBooks.length > 0 ? (
                    <div className={styles.grid}>
                        {filteredBooks.map(book => {
                            const borrowedBook = borrowedBooks.find(b => b.bookId === book.id || b.id === book.id);
                            const status = borrowedBook 
                                ? (borrowedBook.status === 'Reserved' ? 'Reserved' : 'Borrowed')
                                : (book.availableCopies === 0 ? 'Out of Stock' : 'Available');
                            return <BookCard key={book.id} book={{ ...book, copies: book.availableCopies, status }} />;
                        })}
                    </div>
                ) : (
                    <div className={styles.empty}>
                        <p>No books found matching your criteria.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default HomePage;
