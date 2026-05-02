import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { booksApi } from '../services/api';

const BookContext = createContext();

export const useBooks = () => useContext(BookContext);

export const BookProvider = ({ children }) => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [categories, setCategories] = useState(['All']);

    // Fetch books from backend
    const fetchBooks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            if (searchQuery) params.search = searchQuery;
            if (selectedCategory && selectedCategory !== 'All') params.genre = selectedCategory;
            
            const data = await booksApi.getAll(params);
            setBooks(data || []);
        } catch (err) {
            console.error('Failed to fetch books:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, selectedCategory]);

    // Fetch categories from backend
    const fetchCategories = useCallback(async () => {
        try {
            const data = await booksApi.getCategories();
            setCategories(['All', ...(data || [])]);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Fetch books when search or category changes
    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    // Filtered books (filtering is done server-side, but keeping this for UI consistency)
    const filteredBooks = books;

    const getBookById = useCallback((id) => {
        return books.find(book => book.id === parseInt(id));
    }, [books]);

    // Fetch single book details from backend
    const fetchBookById = useCallback(async (id) => {
        try {
            const data = await booksApi.getById(id);
            return data;
        } catch (err) {
            console.error('Failed to fetch book:', err);
            return null;
        }
    }, []);

    const addReview = async (bookId, review) => {
        try {
            await booksApi.addReview(bookId, {
                rating: review.rating,
                comment: review.comment,
            });
            // Refresh books to get updated reviews
            await fetchBooks();
            return { success: true };
        } catch (err) {
            console.error('Failed to add review:', err);
            return { success: false, message: err.message };
        }
    };

    // These functions are kept for compatibility but now handled by backend
    const updateBookStatus = useCallback((id, status) => {
        // Status is now managed by backend, refresh books
        fetchBooks();
    }, [fetchBooks]);

    const updateBookCopies = useCallback((id, amount) => {
        // Copies are now managed by backend, refresh books
        fetchBooks();
    }, [fetchBooks]);

    return (
        <BookContext.Provider value={{
            books,
            filteredBooks,
            loading,
            error,
            searchQuery,
            setSearchQuery,
            selectedCategory,
            setSelectedCategory,
            categories,
            getBookById,
            fetchBookById,
            updateBookStatus,
            updateBookCopies,
            addReview,
            refreshBooks: fetchBooks,
        }}>
            {children}
        </BookContext.Provider>
    );
};
