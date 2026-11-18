import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, X, Sun, Moon, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '../../utils/cn'

const navigation = [
  { path: '/', label: 'Home', icon: Sparkles },
  { path: '/detect', label: 'Detect E-Waste', icon: Sparkles },
  { path: '/guide', label: 'Recycling Guide', icon: Sparkles },
  { path: '/chat', label: 'AI Assistant', icon: Sparkles },
  { path: '/about', label: 'About', icon: Sparkles },
]

export default function Layout() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    return false
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-normal ease-out-expo',
          scrolled ? 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-charcoal-200/50 dark:border-charcoal-800/50 shadow-sm' : 'bg-transparent'
        )}
      >
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-charcoal-900 dark:text-white" aria-label="GreenGrid Home">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-forest-600 flex items-center justify-center"
              >
                <span className="text-white font-display font-bold text-xl leading-none">♻</span>
              </motion.div>
              <span className="font-display font-extrabold text-heading-lg hidden sm:block">GreenGrid</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'nav-link relative overflow-hidden',
                    location.pathname === item.path ? 'nav-link-active' : 'nav-link-inactive'
                  )}
                >
                  <item.icon className="w-4 h-4" aria-hidden="true" />
                  {item.label}
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-900/30 rounded-xl"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                className="btn-icon p-2 rounded-xl text-charcoal-600 dark:text-charcoal-400 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden btn-icon p-2 rounded-xl text-charcoal-600 dark:text-charcoal-400 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <motion.div
            initial={false}
            animate={{ height: mobileMenuOpen ? 'auto' : 0, opacity: mobileMenuOpen ? 1 : 0, paddingTop: mobileMenuOpen ? '1rem' : 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden overflow-hidden border-t border-charcoal-200/50 dark:border-charcoal-800/50 px-4 pb-4"
          >
            <div className="flex flex-col gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'nav-link justify-start px-2 py-3',
                    location.pathname === item.path ? 'nav-link-active' : 'nav-link-inactive'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" aria-hidden="true" />
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16 lg:pt-20" id="main-content">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-charcoal-200 dark:border-charcoal-800 bg-charcoal-50/50 dark:bg-charcoal-950/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2 text-charcoal-900 dark:text-white mb-4" aria-label="GreenGrid Home">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-forest-600 flex items-center justify-center">
                  <span className="text-white font-display font-bold text-xl leading-none">♻</span>
                </div>
                <span className="font-display font-extrabold text-heading-lg">GreenGrid</span>
              </Link>
              <p className="text-body-md text-charcoal-600 dark:text-charcoal-400 max-w-sm mb-6">
                AI-powered e-waste intelligence platform. Classify, learn, and recycle responsibly.
              </p>
              <div className="flex items-center gap-4 text-sm text-charcoal-500 dark:text-charcoal-500">
                <span>v2.0.0</span>
                <span className="hidden sm:inline">•</span>
                <span>EfficientNetB0 • ResNet50 • MobileNetV2</span>
              </div>
            </div>

            <div>
              <h4 className="font-display font-semibold text-heading-sm text-charcoal-900 dark:text-white mb-4">Platform</h4>
              <nav className="flex flex-col gap-2">
                <Link to="/detect" className="text-body-sm text-charcoal-600 dark:text-charcoal-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Detect E-Waste</Link>
                <Link to="/guide" className="text-body-sm text-charcoal-600 dark:text-charcoal-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Recycling Guide</Link>
                <Link to="/chat" className="text-body-sm text-charcoal-600 dark:text-charcoal-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">AI Assistant</Link>
              </nav>
            </div>

            <div>
              <h4 className="font-display font-semibold text-heading-sm text-charcoal-900 dark:text-white mb-4">Resources</h4>
              <nav className="flex flex-col gap-2">
                <Link to="/about" className="text-body-sm text-charcoal-600 dark:text-charcoal-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">About GreenGrid</Link>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-body-sm text-charcoal-600 dark:text-charcoal-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">GitHub Repository</a>
                <a href="https://makersuite.google.com" target="_blank" rel="noopener noreferrer" className="text-body-sm text-charcoal-600 dark:text-charcoal-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Gemini API Docs</a>
                <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" className="text-body-sm text-charcoal-600 dark:text-charcoal-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">OpenStreetMap</a>
              </nav>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-charcoal-200 dark:border-charcoal-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-caption text-charcoal-500 dark:text-charcoal-500">
              GreenGrid v2.0 — Built for demonstration purposes. Verify recycling guidelines with local authorities and certified recyclers (R2, e-Stewards).
            </p>
            <div className="flex items-center gap-6">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-charcoal-500 dark:text-charcoal-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" aria-label="GitHub">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}