import { createContext, useState, useContext, useEffect } from 'react';
import { books as initialBooks } from '../data/books';

const BookContext = createContext();

export const useBooks = () => useContext(BookContext);

export const BookProvider = ({ children }) => {
    const [books, setBooks] = useState(() => {
        const savedBooks = localStorage.getItem('booknest_books');
        return savedBooks ? JSON.parse(savedBooks) : initialBooks;
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        localStorage.setItem('booknest_books', JSON.stringify(books));
    }, [books]);

    const categories = ['All', ...new Set(initialBooks.map(book => book.genre))];

    const filteredBooks = books.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || book.genre === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getBookById = (id) => books.find(book => book.id === parseInt(id));

    const updateBookStatus = (id, status) => {
        setBooks(prevBooks => prevBooks.map(book =>
            book.id === id ? { ...book, status } : book
        ));
    };

    const updateBookCopies = (id, amount) => {
        setBooks(prevBooks => prevBooks.map(book => {
            if (book.id === id) {
                const newCopies = book.copies + amount;
                return {
                    ...book,
                    copies: newCopies,
                    status: newCopies === 0 ? 'Borrowed' : book.status
                };
            }
            return book;
        }));
    };

    const addReview = (bookId, review) => {
        setBooks(prevBooks => prevBooks.map(book => {
            if (book.id === bookId) {
                const currentReviews = book.reviews || [];
                const newReviews = [...currentReviews, review];

                // Calculate new average rating
                const totalRating = newReviews.reduce((sum, r) => sum + r.rating, 0);
                const averageRating = (totalRating / newReviews.length).toFixed(1);

                return {
                    ...book,
                    reviews: newReviews,
                    rating: parseFloat(averageRating)
                };
            }
            return book;
        }));
    };

    return (
        <BookContext.Provider value={{
            books,
            filteredBooks,
            searchQuery,
            setSearchQuery,
            selectedCategory,
            setSelectedCategory,
            categories,
            getBookById,
            updateBookStatus,
            updateBookCopies,
            addReview
        }}>
            {children}
        </BookContext.Provider>
    );
};
