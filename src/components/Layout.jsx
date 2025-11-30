import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import styles from '../styles/Layout.module.css';

const Layout = () => {
    return (
        <div className={styles.layout}>
            <Navbar />
            <main className={styles.main}>
                <Outlet />
            </main>
            <footer className={styles.footer}>
                <p>&copy; 2025 BookNest. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Layout;
