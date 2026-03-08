import { CATEGORIES } from '@config/panels'
import { useI18n } from '@context/I18nContext'
import './CategoryTabs.css'

const CategoryTabs = ({ activeCategory, onCategoryChange }) => {
    const { t } = useI18n()
    return (
        <div className="category-tabs">
            {CATEGORIES.map(cat => (
                <button
                    key={cat.id}
                    className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
                    onClick={() => onCategoryChange(cat.id)}
                >
                    <span className="tab-icon">{cat.icon}</span>
                    <span className="tab-name">{t(cat.nameKey)}</span>
                </button>
            ))}
        </div>
    )
}

export default CategoryTabs
