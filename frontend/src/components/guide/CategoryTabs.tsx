import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../utils/cn'

interface CategoryTabsProps {
  categories: string[]
  activeCategory: string
  onCategoryChange: (category: string) => void
}

const categoryIcons: Record<string, string> = {
  'Battery': '🔋',
  'Keyboard': '⌨️',
  'Microwave': '📱',
  'Mobile Phone': '📱',
  'Mouse': '🖱️',
  'PCB': '🟢',
  'Player': '🎮',
  'Printer': '🖨️',
  'Telephone': '☎️',
  'Wires': '🔌',
}

const categoryColors: Record<string, string> = {
  'Battery': 'from-amber-500 to-orange-500',
  'Keyboard': 'from-slate-500 to-slate-600',
  'Microwave': 'from-emerald-500 to-teal-500',
  'Mobile Phone': 'from-indigo-500 to-blue-500',
  'Mouse': 'from-rose-500 to-pink-500',
  'PCB': 'from-forest-500 to-emerald-600',
  'Player': 'from-violet-500 to-purple-500',
  'Printer': 'from-cyan-500 to-blue-500',
  'Telephone': 'from-amber-600 to-orange-600',
  'Wires': 'from-slate-600 to-zinc-600',
}

export default function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="E-waste categories"
        >
          {categories.map((category, index) => (
            <motion.button
              key={category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => onCategoryChange(category)}
              className={cn(
                'category-tab relative px-4 py-2.5 rounded-xl text-body-sm font-medium transition-all duration-fast',
                activeCategory === category
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-white dark:bg-charcoal-800 text-charcoal-600 dark:text-charcoal-300 hover:bg-forest-50 dark:hover:bg-forest-900/20 border border-charcoal-200 dark:border-charcoal-700'
              )}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              role="tab"
              aria-selected={activeCategory === category}
              aria-controls={`panel-${category.toLowerCase().replace(/\s+/g, '-')}`}
              id={`tab-${category.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg" aria-hidden="true">{categoryIcons[category] || '📦'}</span>
                {category}
              </span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: activeCategory === category ? 1 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
              />
            </motion.button>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Active indicator bar */}
      <AnimatePresence>
        {categories.map((category) => (
          <motion.div
            key={category}
            layoutId={`indicator-${category}`}
            className={cn(
              'absolute bottom-0 h-0.5 rounded-full bg-emerald-500',
              activeCategory === category ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}