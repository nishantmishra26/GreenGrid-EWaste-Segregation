import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, ChevronDown, Leaf, AlertTriangle, Recycle, Shield, Info } from 'lucide-react'
import CategoryTabs from '../components/guide/CategoryTabs'
import DetailSections from '../components/guide/DetailSections'
import { guideApi, GuideCategory } from '../lib/api'
import { cn } from '../utils/cn'

const ALL_CATEGORIES = [
  'Battery', 'Keyboard', 'Microwave', 'Mobile', 'Mouse',
  'PCB', 'Player', 'Printer', 'Television', 'Washing Machine'
]

const categoryDescriptions: Record<string, string> = {
  'Battery': 'Contains heavy metals and corrosive chemicals. Never dispose in regular trash.',
  'Keyboard': 'Plastic housing with circuit boards. Keys may contain mechanical switches.',
  'Microwave': 'High-voltage capacitor retains lethal charge. Professional disposal required.',
  'Mobile': 'Lithium-ion battery, rare earth metals, glass screen. High recycling value.',
  'Mouse': 'Plastic shell with PCB and optical sensor. Cable contains copper wiring.',
  'PCB': 'Fiberglass board with copper traces, components, and solder. Gold recovery possible.',
  'Player': 'Mixed plastics, circuit boards, display, and battery. Similar to phone recycling.',
  'Printer': 'Large plastic housing, circuit boards, ink/toner cartridges, motors, rollers.',
  'Television': 'CRT or flat-panel. Lead, mercury, and phosphor hazards require specialized recycling.',
  'Washing Machine': 'Large appliance with steel, copper, motors, and PCBs. High scrap value.',
}

export default function Guide() {
  const [categories, setCategories] = useState<string[]>([])
  const [categoryData, setCategoryData] = useState<Record<string, GuideCategory>>({})
  const [activeCategory, setActiveCategory] = useState<string>('Battery')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Load guide categories on mount
  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const response = await guideApi.getAll()
        const cats = response.data.categories
        setCategories(cats)
        // Set initial category from URL param if exists
        const params = new URLSearchParams(window.location.search)
        const urlCategory = params.get('category')
        if (urlCategory && cats.includes(urlCategory)) {
          setActiveCategory(urlCategory)
        } else if (cats.length > 0) {
          setActiveCategory(cats[0])
        }
      } catch (err: any) {
        setError('Failed to load recycling guide categories. Please try again.')
        console.error('[Guide] Error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchGuide()
  }, [])

  // Load category detail when active category changes
  useEffect(() => {
    if (!activeCategory) return

    const fetchCategory = async () => {
      try {
        const response = await guideApi.getCategory(activeCategory)
        setCategoryData(prev => ({ ...prev, [activeCategory]: response.data }))
      } catch (err: any) {
        console.error('[Guide] Category fetch error:', err)
      }
    }
    fetchCategory()
  }, [activeCategory])

  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category)
    // Update URL without reload
    const url = new URL(window.location.href)
    url.searchParams.set('category', category)
    window.history.pushState({}, '', url)
  }, [])

  const filteredCategories = ALL_CATEGORIES.filter(cat =>
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const currentCategoryData = categoryData[activeCategory] || {
    category: activeCategory,
    icon: '📦',
    hazards: [],
    materials: [],
    process: 'Process information not available.',
    disposal: 'Disposal information not available.',
    reuse: '',
    donation: '',
    repair: '',
    safety: '',
    steps: [],
  }

  if (isLoading) {
    return (
      <div className="min-h-screen section-sm">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full mx-auto mb-4"
              />
              <p className="text-body-md text-charcoal-600 dark:text-charcoal-400">Loading recycling guide...</p>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen section-sm">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center py-12">
            <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="font-display text-heading-lg text-charcoal-900 dark:text-white mb-2">Unable to Load Guide</h2>
            <p className="text-body-md text-charcoal-600 dark:text-charcoal-400 mb-6">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="section-sm pt-8 pb-12 relative overflow-hidden bg-hero-pattern">
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 20, ease: 'linear' }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent dark:from-emerald-900/5"
        />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="badge-secondary mb-4">Recycling Guide</span>
            <h1 className="font-display text-display-md text-charcoal-900 dark:text-white mb-4 text-balance">
              Category-Specific Recycling Guidance
            </h1>
            <p className="text-body-lg text-charcoal-600 dark:text-charcoal-400 max-w-xl mx-auto text-balance">
              Detailed disposal instructions, safety warnings, and certified recycler information for each e-waste type.
              All guidance based on EPA, Basel Convention, and industry best practices.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-sm pb-16">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            {/* Search & Category Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8"
            >
              {/* Search */}
              <div className="relative max-w-md mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" aria-hidden="true" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter categories..."
                  className="input pl-12"
                  aria-label="Filter categories"
                />
              </div>

              {/* Category Tabs */}
              <CategoryTabs
                categories={filteredCategories}
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
              />
            </motion.div>

            {/* Category Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8"
            >
              <div className="card-elevated p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-forest-600 flex items-center justify-center text-4xl flex-shrink-0">
                    {currentCategoryData.icon || '📱'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-3">
                      <h2 className="font-display text-heading-xl text-charcoal-900 dark:text-white">
                        {activeCategory}
                      </h2>
                      <span className="badge-primary">AI-Recognized Category</span>
                    </div>
                    <p className="text-body-md text-charcoal-600 dark:text-charcoal-400 leading-relaxed">
                      {categoryDescriptions[activeCategory] || 'Recycling information for this category.'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Detail Sections */}
            <DetailSections category={currentCategoryData} />
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="section-sm bg-charcoal-50/50 dark:bg-charcoal-950/50 border-t border-charcoal-200 dark:border-charcoal-800">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              className="card p-6 sm:p-8 border-emerald-200 dark:border-emerald-800"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Info className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-display text-heading-md text-charcoal-900 dark:text-white">
                  Important Disclaimer
                </h3>
              </div>
              <div className="text-left space-y-3 text-body-sm text-charcoal-600 dark:text-charcoal-400">
                <p>This guide provides general information based on publicly available recycling guidelines and industry best practices.</p>
                <p><strong>Always verify locally:</strong> Recycling acceptance varies by municipality, facility, and current regulations.</p>
                <p><strong>Hazardous items:</strong> Batteries, CRT monitors, mercury-containing devices, and refrigerants require special handling. Contact certified recyclers (R2, e-Stewards) for these items.</p>
                <p><strong>Data security:</strong> Erase all personal data from devices before recycling. Use certified data destruction services for sensitive information.</p>
                <p className="pt-2 border-t border-charcoal-200 dark:border-charcoal-700">
                  GreenGrid provides AI classification only — not professional disposal advice. Consult local authorities and certified recyclers for definitive guidance.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}