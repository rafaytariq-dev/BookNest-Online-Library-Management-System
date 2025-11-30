import { Search } from 'lucide-react';
import { useBooks } from '../context/BookContext';
import styles from '../styles/SearchBar.module.css';

const SearchBar = () => {
    const { searchQuery, setSearchQuery } = useBooks();

    return (
        <div className={styles.container}>
            <Search className={styles.icon} size={20} />
            <input
                type="text"
                placeholder="Search by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.input}
            />
        </div>
    );
};

export default SearchBar;
