import { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedSession = sessionStorage.getItem('booknest_session');
        return savedSession ? JSON.parse(savedSession) : null;
    });

    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('booknest_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    const [borrowedBooks, setBorrowedBooks] = useState(() => {
        const savedBorrowed = localStorage.getItem('booknest_borrowed');
        return savedBorrowed ? JSON.parse(savedBorrowed) : [];
    });

    const [wishlist, setWishlist] = useState(() => {
        const savedWishlist = localStorage.getItem('booknest_wishlist');
        return savedWishlist ? JSON.parse(savedWishlist) : [];
    });

    const [history, setHistory] = useState(() => {
        const savedHistory = localStorage.getItem('booknest_history');
        return savedHistory ? JSON.parse(savedHistory) : [];
    });

    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('booknest_theme') || 'light';
    });

    useEffect(() => {
        if (user) {
            sessionStorage.setItem('booknest_session', JSON.stringify(user));
        } else {
            sessionStorage.removeItem('booknest_session');
        }
    }, [user]);

    useEffect(() => {
        localStorage.setItem('booknest_cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        localStorage.setItem('booknest_borrowed', JSON.stringify(borrowedBooks));
    }, [borrowedBooks]);

    useEffect(() => {
        localStorage.setItem('booknest_wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    useEffect(() => {
        localStorage.setItem('booknest_history', JSON.stringify(history));
    }, [history]);

    useEffect(() => {
        localStorage.setItem('booknest_theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const login = (email, password) => {
        const users = JSON.parse(localStorage.getItem('booknest_users') || '[]');
        const foundUser = users.find(u => u.email === email && u.password === password);

        if (foundUser) {
            const { password, ...userWithoutPass } = foundUser;
            setUser(userWithoutPass);
            return { success: true };
        }
        return { success: false, message: 'Invalid email or password' };
    };

    const signup = (name, email, password) => {
        const users = JSON.parse(localStorage.getItem('booknest_users') || '[]');

        if (users.find(u => u.email === email)) {
            return { success: false, message: 'Email already registered' };
        }

        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            memberId: `MEM-${new Date().getFullYear()}-${String(users.length + 1).padStart(3, '0')}`
        };

        users.push(newUser);
        localStorage.setItem('booknest_users', JSON.stringify(users));

        const { password: _, ...userWithoutPass } = newUser;
        setUser(userWithoutPass);
        return { success: true };
    };

    const logout = () => {
        setUser(null);
        setCart([]);
        // Optional: Clear other user-specific data if needed, but keeping for demo
    };

    const addToCart = (book, details) => {
        if (cart.length >= 5) {
            alert("You cannot reserve more than 5 books at a time.");
            return;
        }

        if (cart.some(item => item.id === book.id)) {
            alert("You already have this book in your cart.");
            return;
        }

        if (borrowedBooks.some(item => item.id === book.id)) {
            alert("You have already borrowed this book. Please return it before borrowing again.");
            return;
        }

        setCart([...cart, { ...book, ...details, reservationId: Date.now() }]);
    };

    const removeFromCart = (reservationId) => {
        setCart(cart.filter(item => item.reservationId !== reservationId));
    };

    const clearCart = () => setCart([]);

    const addToWishlist = (book) => {
        if (!wishlist.find(item => item.id === book.id)) {
            setWishlist([...wishlist, book]);
        }
    };

    const removeFromWishlist = (bookId) => {
        setWishlist(wishlist.filter(item => item.id !== bookId));
    };

    const cancelReservation = (reservationId) => {
        setBorrowedBooks(borrowedBooks.filter(item => item.reservationId !== reservationId));
    };

    const returnBook = (book) => {
        setBorrowedBooks(borrowedBooks.filter(item => item.id !== book.id));
        setHistory([...history, { ...book, returnedDate: new Date().toISOString() }]);
    };

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <UserContext.Provider value={{
            user,
            login,
            signup,
            logout,
            cart,
            addToCart,
            removeFromCart,
            clearCart,
            borrowedBooks,
            setBorrowedBooks,
            wishlist,
            addToWishlist,
            removeFromWishlist,
            history,
            cancelReservation,
            returnBook,
            theme,
            toggleTheme
        }}>
            {children}
        </UserContext.Provider>
    );
};
