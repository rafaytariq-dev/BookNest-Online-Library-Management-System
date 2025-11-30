import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { BookOpen, ShoppingCart, User, Moon, Sun, Heart, LogOut, LogIn } from 'lucide-react';
import styles from '../styles/Navbar.module.css';

const Navbar = () => {
    const { cart, theme, toggleTheme, wishlist, user, logout } = useUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <Link to="/" className={styles.logo}>
                    <BookOpen size={24} />
                    <span>BookNest</span>
                </Link>

                <div className={styles.links}>
                    <Link to="/" className={styles.link}>Catalog</Link>
                    <Link to="/contact" className={styles.link}>Contact</Link>

                    {user ? (
                        <>
                            <Link to="/dashboard" className={styles.link}>
                                <User size={20} />
                                <span>Dashboard</span>
                            </Link>
                            <Link to="/cart" className={styles.link}>
                                <ShoppingCart size={20} />
                                {cart.length > 0 && <span className={styles.badge}>{cart.length}</span>}
                            </Link>
                            <Link to="/dashboard" className={styles.link}>
                                <Heart size={20} />
                                {wishlist.length > 0 && <span className={styles.badge}>{wishlist.length}</span>}
                            </Link>
                            <button onClick={handleLogout} className={styles.link} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <LogOut size={20} />
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className={styles.link}>
                            <LogIn size={20} />
                            <span>Login</span>
                        </Link>
                    )}

                    <button onClick={toggleTheme} className={styles.themeBtn} aria-label="Toggle Theme">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
