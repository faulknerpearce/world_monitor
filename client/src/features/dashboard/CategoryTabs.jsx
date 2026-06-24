import { CATEGORIES } from '@config/panels'
import { useI18n } from '@context/I18nContext'

const CategoryTabs = ({ activeCategory, onCategoryChange }) => {
    const { t } = useI18n()
    return (
        <div className="flex gap-2 py-3 px-4 bg-panel-header-bg border border-border-glass rounded-lg overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[768px]:py-2 max-[768px]:px-3">
            {CATEGORIES.map(cat => (
                <button
                    key={cat.id}
                    className={`flex items-center gap-1.5 py-[0.45rem] px-3 bg-panel-item-bg border border-border-glass rounded-md text-text-secondary cursor-pointer transition-all duration-200 whitespace-nowrap text-[0.72rem] font-medium hover:bg-panel-item-hover hover:border-border-glass-hover hover:text-text-primary max-[768px]:py-[0.4rem] max-[768px]:px-2.5 max-[768px]:text-[0.65rem] ${activeCategory === cat.id ? '!bg-[rgba(99,102,241,0.15)] !border-[rgba(99,102,241,0.3)] !text-indigo-400' : ''}`}
                    onClick={() => onCategoryChange(cat.id)}
                >
                    <span className="text-[0.8rem]">{cat.icon}</span>
                    <span className="font-medium">{t(cat.nameKey)}</span>
                </button>
            ))}
        </div>
    )
}

export default CategoryTabs
