import { useBooks } from '../context/BookContext';
import styles from '../styles/FilterBar.module.css';

const FilterBar = () => {
    const { categories, selectedCategory, setSelectedCategory } = useBooks();

    return (
        <div className={styles.container}>
            {categories.map(category => (
                <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`${styles.button} ${selectedCategory === category ? styles.active : ''}`}
                >
                    {category}
                </button>
            ))}
        </div>
    );
};

export default FilterBar;
