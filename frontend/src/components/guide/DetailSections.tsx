import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Recycle, Shield, Info, Zap, Leaf, Truck, Wrench, Home, BookOpen } from 'lucide-react'
import { cn } from '../../utils/cn'

interface GuideCategory {
  category: string
  icon: string
  hazards: string[]
  materials: string[]
  process: string
  disposal: string
  reuse: string
  donation: string
  repair: string
  safety: string
  steps: string[]
}

interface DetailSectionsProps {
  category: GuideCategory
}

const sections = [
  {
    id: 'overview',
    title: 'Overview',
    icon: Info,
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-200',
  },
  {
    id: 'hazards',
    title: 'Hazardous Components',
    icon: AlertTriangle,
    color: 'from-red-500 to-red-600',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-800 dark:text-red-200',
  },
  {
    id: 'process',
    title: 'Recycling Process',
    icon: Recycle,
    color: 'from-emerald-500 to-forest-600',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-800 dark:text-emerald-200',
  },
  {
    id: 'steps',
    title: 'Disposal Steps',
    icon: Truck,
    color: 'from-indigo-500 to-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    border: 'border-indigo-200 dark:border-indigo-800',
    text: 'text-indigo-800 dark:text-indigo-200',
  },
  {
    id: 'safety',
    title: 'Safety Warnings',
    icon: Shield,
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-800 dark:text-amber-200',
  },
  {
    id: 'preparation',
    title: 'Preparation Tips',
    icon: Wrench,
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    border: 'border-violet-200 dark:border-violet-800',
    text: 'text-violet-800 dark:text-violet-200',
  },
  {
    id: 'recyclers',
    title: 'Certified Recyclers',
    icon: BookOpen,
    color: 'from-cyan-500 to-teal-600',
    bg: 'bg-cyan-50 dark:bg-cyan-900/20',
    border: 'border-cyan-200 dark:border-cyan-800',
    text: 'text-cyan-800 dark:text-cyan-200',
  },
]

export default function DetailSections({ category }: DetailSectionsProps) {
  const contentMap: Record<string, React.ReactNode> = {
    overview: <p className="text-body-md leading-relaxed">{category.description}</p>,
    hazards: (
      <ul className="space-y-2">
        {category.hazards.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-charcoal-800 border border-charcoal-100 dark:border-charcoal-700"
          >
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span className="text-body-sm text-charcoal-700 dark:text-charcoal-300">{item}</span>
          </motion.li>
        ))}
      </ul>
    ),
    process: <p className="text-body-md leading-relaxed">{category.process}</p>,
    steps: (
      <ol className="space-y-3">
        {category.steps.map((step, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex gap-3 p-4 rounded-xl bg-white dark:bg-charcoal-800 border border-charcoal-100 dark:border-charcoal-700"
          >
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center font-display font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              {i + 1}
            </span>
            <span className="text-body-md text-charcoal-700 dark:text-charcoal-300 pt-1">{step}</span>
          </motion.li>
        ))}
      </ol>
    ),
    safety: (
      <div className="prose prose-charcoal dark:prose-invert max-w-none">
        {typeof category.safety === 'string' ? (
          <p className="text-body-md leading-relaxed">{category.safety}</p>
        ) : (
          <ul className="space-y-2">
            {category.safety.map((warning: string, i: number) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-charcoal-800 border border-charcoal-100 dark:border-charcoal-700"
              >
                <Shield className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-body-sm text-charcoal-700 dark:text-charcoal-300">{warning}</span>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    ),
    preparation: (
      <ul className="space-y-2">
        {category.reuse && (
          <motion.li
            key="reuse"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-charcoal-800 border border-charcoal-100 dark:border-charcoal-700"
          >
            <Leaf className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span className="text-body-sm text-charcoal-700 dark:text-charcoal-300"><strong>Reuse:</strong> {category.reuse}</span>
          </motion.li>
        )}
        {category.donation && (
          <motion.li
            key="donation"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-charcoal-800 border border-charcoal-100 dark:border-charcoal-700"
          >
            <Leaf className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span className="text-body-sm text-charcoal-700 dark:text-charcoal-300"><strong>Donation:</strong> {category.donation}</span>
          </motion.li>
        )}
        {category.repair && (
          <motion.li
            key="repair"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-charcoal-800 border border-charcoal-100 dark:border-charcoal-700"
          >
            <Leaf className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span className="text-body-sm text-charcoal-700 dark:text-charcoal-300"><strong>Repair:</strong> {category.repair}</span>
          </motion.li>
        )}
        {category.materials.length > 0 && (
          <motion.li
            key="materials"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-charcoal-800 border border-charcoal-100 dark:border-charcoal-700"
          >
            <Leaf className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span className="text-body-sm text-charcoal-700 dark:text-charcoal-300"><strong>Recoverable Materials:</strong> {category.materials.join(', ')}</span>
          </motion.li>
        )}
      </ul>
    ),
    recyclers: (
      <div className="space-y-3">
        <p className="text-body-md text-charcoal-700 dark:text-charcoal-300">
          Check local government websites and the <a href="https://www.e-stewards.org/find-a-recycler/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">e-Stewards</a> or <a href="https://sustainableelectronics.org/recyclers" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">R2</a> directories for certified e-waste recyclers in your area.
        </p>
        <p className="text-caption text-charcoal-500 dark:text-charcoal-500">
          Many retailers like Best Buy, Staples, and Home Depot also offer free e-waste drop-off programs. Always call ahead to verify current acceptance policies.
        </p>
      </div>
    ),
  }

  return (
    <AnimatePresence mode="wait">
      <div key={category.category} className="space-y-6">
        {sections.map((section, index) => {
          const content = contentMap[section.id]
          if (!content) return null

          const hasContent = section.id === 'hazards' ? category.hazards.length > 0 :
                             section.id === 'steps' ? category.steps.length > 0 :
                             section.id === 'safety' ? (typeof category.safety === 'string' ? category.safety.length > 0 : category.safety.length > 0) :
                             section.id === 'preparation' ? (category.reuse || category.donation || category.repair || category.materials.length > 0) :
                             section.id === 'recyclers' ? true :
                             true

          if (!hasContent) return null

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="card-elevated overflow-hidden"
            >
              <div className={cn('p-6 sm:p-8 border-b', section.border)}>
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', `bg-gradient-to-br ${section.color}`)}>
                    <section.icon className="w-5 h-5 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-heading-md text-charcoal-900 dark:text-white">
                    {section.title}
                  </h3>
                </div>
              </div>
              <div className="p-6 sm:p-8">
                {content}
              </div>
            </motion.div>
          )
        })}
      </div>
    </AnimatePresence>
  )
}