import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authApi, usersApi, reservationsApi, cartApi } from '../services/api';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [history, setHistory] = useState([]);
    const [theme, setTheme] = useState('light');

    const [stats, setStats] = useState({
        activeLoans: 0,
        currentReservations: 0,
        lifetimeBorrowed: 0,
        wishlistCount: 0
    });
    // Notification system
    const [notifications, setNotifications] = useState([]);
    const addNotification = (message, type = 'error') => {
        setNotifications(prev => [
            ...prev,
            { id: Date.now() + Math.random(), message, type }
        ]);
    };
    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(note => note.id !== id));
    };

    // Load user-specific data via consolidated dashboard API
    const loadUserData = useCallback(async () => {
        try {
            const [dashboardData, cartData] = await Promise.all([
                usersApi.getDashboard(),
                cartApi.get()
            ]);

            // Map dashboard data to state
            setBorrowedBooks(dashboardData.borrowedBooks || []);
            setWishlist(dashboardData.wishlist || []);
            setHistory(dashboardData.history || []);
            setCart(cartData || []);
            setStats(dashboardData.stats || {
                activeLoans: 0,
                currentReservations: 0,
                lifetimeBorrowed: 0,
                wishlistCount: 0
            });

            // Theme is separate as it can be accessed without full dashboard
            try {
                const themeData = await usersApi.getTheme();
                if (themeData?.theme) {
                    setTheme(themeData.theme);
                }
            } catch (e) {
                // Theme preference not critical
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
            throw error;
        }
    }, []);

    // Check session on app load
    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await authApi.checkSession();
                if (response.authenticated && response.user) {
                    setUser(response.user);
                    // Load user data after authentication confirmed
                    await loadUserData();
                }
            } catch (error) {
                console.error('Session check failed:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, [loadUserData]);

    // Apply theme
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const login = async (email, password) => {
        try {
            const response = await authApi.login(email, password);
            if (response.success && response.user) {
                setUser(response.user);
                await loadUserData();
                return { success: true };
            }
            return { success: false, message: 'Login failed' };
        } catch (error) {
            return { success: false, message: error.message || 'Invalid email or password' };
        }
    };

    const signup = async (name, email, password) => {
        try {
            const response = await authApi.signup(name, email, password);
            if (response.success && response.user) {
                setUser(response.user);
                await loadUserData();
                return { success: true };
            }
            return { success: false, message: 'Signup failed' };
        } catch (error) {
            return { success: false, message: error.message || 'Email already registered' };
        }
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setCart([]);
            setBorrowedBooks([]);
            setWishlist([]);
            setHistory([]);
        }
    };

    const addToCart = async (book, details) => {
        // Enforce max 5 books in cart
        if (cart.length >= 5) {
            addNotification('You cannot borrow more than 5 books at a time.', 'error');
            return { success: false, message: 'You cannot borrow more than 5 books at a time.' };
        }
        try {
            const updatedCart = await cartApi.add({
                bookId: book.id,
                ...details
            });
            setCart(updatedCart);
            return { success: true };
        } catch (error) {
            addNotification(error.message, 'error');
            return { success: false, message: error.message };
        }
    };

    const removeFromCart = async (reservationId) => {
        try {
            const updatedCart = await cartApi.remove(reservationId);
            setCart(updatedCart);
        } catch (error) {
            console.error('Failed to remove from cart:', error);
        }
    };

    const clearCart = async () => {
        try {
            await cartApi.clear();
            setCart([]);
        } catch (error) {
            console.error('Failed to clear cart:', error);
        }
    };

    const addToWishlist = async (book) => {
        if (wishlist.find(item => item.id === book.id)) {
            return { success: false, message: 'Book already in wishlist' };
        }

        try {
            await usersApi.addToWishlist(book.id);
            setWishlist([...wishlist, book]);
            return { success: true };
        } catch (error) {
            // Handle 409 Conflict gracefully
            if (error.message?.includes('already in your wishlist')) {
                return { success: false, message: 'Book already in wishlist' };
            }
            console.error('Failed to add to wishlist:', error);
            return { success: false, message: error.message };
        }
    };

    const removeFromWishlist = async (bookId) => {
        try {
            await usersApi.removeFromWishlist(bookId);
            setWishlist(wishlist.filter(item => item.id !== bookId));
            // Refresh stats
            const dashboardData = await usersApi.getDashboard();
            setStats(dashboardData.stats || stats);
            return { success: true };
        } catch (error) {
            console.error('Failed to remove from wishlist:', error);
            return { success: false, message: error.message };
        }
    };

    const cancelReservation = async (reservationId) => {
        try {
            console.log('Calling reservationsApi.cancel with:', reservationId);
            const result = await reservationsApi.cancel(reservationId);
            console.log('reservationsApi.cancel result:', result);
            setBorrowedBooks(borrowedBooks.filter(item => item.id !== reservationId));
            // Refresh stats
            const dashboardData = await usersApi.getDashboard();
            setStats(dashboardData.stats || stats);
            return { success: true };
        } catch (error) {
            console.error('Failed to cancel reservation:', error);
            return { success: false, message: error.message };
        }
    };

    const returnBook = async (book) => {
        try {
            const reservationId = book.id; // book.id is now the reservation UUID
            await reservationsApi.return(reservationId);
            setBorrowedBooks(borrowedBooks.filter(item => item.id !== reservationId));
            // Refresh history and stats
            const [historyData, dashboardData] = await Promise.all([
                reservationsApi.getHistory(),
                usersApi.getDashboard()
            ]);
            setHistory(historyData || []);
            setStats(dashboardData.stats || stats);
            return { success: true };
        } catch (error) {
            console.error('Failed to return book:', error);
            return { success: false, message: error.message };
        }
    };

    const pickupBook = async (reservationId) => {
        try {
            await reservationsApi.pickup(reservationId);
            // Refresh active reservations and stats
            const [activeReservations, dashboardData] = await Promise.all([
                reservationsApi.getActive(),
                usersApi.getDashboard()
            ]);
            setBorrowedBooks(activeReservations || []);
            setStats(dashboardData.stats || stats);
            return { success: true };
        } catch (error) {
            console.error('Failed to pickup book:', error);
            return { success: false, message: error.message };
        }
    };

    const extendLoan = async (reservationId) => {
        try {
            await reservationsApi.extend(reservationId);
            // Refresh active reservations and stats
            const [activeReservations, dashboardData] = await Promise.all([
                reservationsApi.getActive(),
                usersApi.getDashboard()
            ]);
            setBorrowedBooks(activeReservations || []);
            setStats(dashboardData.stats || stats);
            return { success: true };
        } catch (error) {
            console.error('Failed to extend loan:', error);
            return { success: false, message: error.message };
        }
    };

    const checkout = async () => {
        try {
            const items = cart.map(item => ({
                bookId: item.id,
                pickupDate: item.pickupDate,
                duration: parseInt(item.duration),
            }));
            const response = await reservationsApi.checkout(items);
            if (response.success !== false) {
                await clearCart();
                // Refresh borrowed books and stats
                const [activeReservations, dashboardData] = await Promise.all([
                    reservationsApi.getActive(),
                    usersApi.getDashboard()
                ]);
                setBorrowedBooks(activeReservations || []);
                setStats(dashboardData.stats || stats);
                return {
                    success: true,
                    reservationId: response.reservationId,
                    qrCode: response.qrCode,
                    reservations: response.reservations,
                };
            }
            addNotification(response.errors?.[0]?.error || 'Checkout failed', 'error');
            return { success: false, message: response.errors?.[0]?.error || 'Checkout failed' };
        } catch (error) {
            addNotification(error.message || 'An error occurred', 'error');
            return { success: false, message: error.message || 'An error occurred' };
        }
    };

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);

        if (user) {
            try {
                await usersApi.updateTheme(newTheme);
            } catch (error) {
                console.error('Failed to update theme preference:', error);
            }
        }
    };

    const refreshUserData = useCallback(async () => {
        if (user) {
            await loadUserData();
        }
    }, [user, loadUserData]);

    return (
        <UserContext.Provider value={{
            user,
            loading,
            login,
            signup,
            logout,
            cart,
            addToCart,
            removeFromCart,
            borrowedBooks,
            wishlist,
            history,
            stats,
            theme,
            setTheme,
            checkout,
            pickupBook,
            extendLoan,
            returnBook,
            cancelReservation,
            addToWishlist,
            removeFromWishlist,
            clearCart,
            toggleTheme,
            refreshUserData,
            notifications,
            addNotification,
            removeNotification,
        }}>
            {children}
        </UserContext.Provider>
    );
};
