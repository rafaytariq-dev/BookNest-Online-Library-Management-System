import { useBooks } from '../context/BookContext';
import { useUser } from '../context/UserContext';
import BookCard from '../components/BookCard';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import styles from '../styles/HomePage.module.css';

const HomePage = () => {
    const { filteredBooks } = useBooks();
    const { borrowedBooks } = useUser();

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
                    {filteredBooks.slice(-4).reverse().map(book => {
                         const borrowedBook = borrowedBooks.find(b => b.id === book.id);
                         const status = borrowedBook ? borrowedBook.status : (book.copies === 0 ? 'Out of Stock' : 'Available');
                         return <BookCard key={book.id} book={{ ...book, status }} />;
                    })}
                </div>
            </section>

            <section className={styles.mainSection}>
                <h2>All Books</h2>

                {filteredBooks.length > 0 ? (
                    <div className={styles.grid}>
                        {filteredBooks.map(book => {
                            const borrowedBook = borrowedBooks.find(b => b.id === book.id);
                            const status = borrowedBook ? borrowedBook.status : (book.copies === 0 ? 'Out of Stock' : 'Available');
                            return <BookCard key={book.id} book={{ ...book, status }} />;
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
