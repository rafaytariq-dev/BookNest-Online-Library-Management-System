import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import styles from '../styles/BookCard.module.css';

const BookCard = ({ book }) => {
    return (
        <Link to={`/book/${book.id}`} className={styles.card}>
            <div className={styles.imageContainer}>
                <img src={book.cover} alt={book.title} className={styles.image} />
                <div className={`${styles.status} ${styles[book.status.toLowerCase()]}`}>
                    {book.status}
                </div>
            </div>
            <div className={styles.content}>
                <h3 className={styles.title}>{book.title}</h3>
                <p className={styles.author}>{book.author}</p>
                <div className={styles.meta}>
                    <span className={styles.genre}>{book.genre}</span>
                    <div className={styles.rating}>
                        <Star size={16} fill="#FFD700" color="#FFD700" />
                        <span>{book.rating}</span>
                    </div>
                </div>
                <div className={styles.footer}>
                    <span className={styles.copies}>{book.copies} copies available</span>
                </div>
            </div>
        </Link>
    );
};

export default BookCard;
