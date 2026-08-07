import { CATEGORIES } from '@config/panels'
import { useI18n } from '@context/I18nContext'

const CategoryTabs = ({ activeCategory, onCategoryChange }) => {
    const { t } = useI18n()
    return (
        <div className="category-tabs sticky top-0 z-10 flex gap-1 py-3 px-0 bg-bg-dark/95 backdrop-blur-sm section-divider overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[768px]:py-2">
            {CATEGORIES.map(cat => (
                <button
                    key={cat.id}
                    className={`relative py-2 px-3 bg-transparent border-0 text-[0.8rem] font-medium cursor-pointer transition-colors duration-200 whitespace-nowrap max-[768px]:py-2 max-[768px]:px-2.5 max-[768px]:text-[0.75rem] ${
                        activeCategory === cat.id
                            ? 'text-text-primary after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-accent after:rounded-full'
                            : 'text-text-primary hover:text-text-secondary'
                    }`}
                    onClick={() => onCategoryChange(cat.id)}
                >
                    {t(cat.nameKey)}
                </button>
            ))}
        </div>
    )
}

export default CategoryTabs