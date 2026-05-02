
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import NotificationToast from './NotificationToast';
import styles from '../styles/Layout.module.css';


const Layout = () => {
    return (
        <div className={styles.layout}>
            <Navbar />
            <NotificationToast />
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
