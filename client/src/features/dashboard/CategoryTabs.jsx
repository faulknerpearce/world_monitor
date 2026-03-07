import { CATEGORIES } from '@config/panels'
import './CategoryTabs.css'

const CategoryTabs = ({ activeCategory, onCategoryChange }) => {
    return (
        <div className="category-tabs">
            {CATEGORIES.map(cat => (
                <button
                    key={cat.id}
                    className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
                    onClick={() => onCategoryChange(cat.id)}
                >
                    <span className="tab-icon">{cat.icon}</span>
                    <span className="tab-name">{cat.name}</span>
                </button>
            ))}
        </div>
    )
}

export default CategoryTabs
