import { motion } from 'framer-motion'
import { ArrowRight, Zap, Shield, Brain, Globe, Leaf, ArrowDownRight, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const features = [
  {
    icon: Brain,
    title: 'Multi-Model AI Detection',
    description: 'Choose between EfficientNetB0 (97.8%), ResNet50 (97.3%), and MobileNetV2 (94.1%) — all fine-tuned on 3,900+ e-waste images across 10 categories.',
    highlight: 'Real inference, not mock data',
  },
  {
    icon: Shield,
    title: 'Out-of-Distribution Detection',
    description: 'Multi-signal OOD detection (confidence, entropy, margin, normalized entropy) rejects non-e-waste images with explanations — no false classifications.',
    highlight: 'Honest AI that knows its limits',
  },
  {
    icon: Globe,
    title: 'Live Recycling Centre Finder',
    description: 'Search by address, ZIP, or city using OpenStreetMap/Overpass API. No fake data — results marked "verify locally" with acceptance status unknown.',
    highlight: 'Real-world data, transparent gaps',
  },
  {
    icon: Zap,
    title: 'Gemini 2.5 Flash Assistant',
    description: 'Ask anything about e-waste recycling, disposal methods, or regulations. Falls back to curated knowledge base when API unavailable.',
    highlight: 'Always-on guidance',
  },
  {
    icon: Leaf,
    title: 'Grad-CAM Visualization',
    description: 'See what the model focuses on with class activation maps — understand why predictions are made, not just what they are.',
    highlight: 'Explainable AI built-in',
  },
  {
    icon: CheckCircle,
    title: 'Production-Ready Architecture',
    description: 'FastAPI async backend with model caching, React 18 + Vite + Tailwind + Framer Motion frontend. Type-safe, tested, deployable.',
    highlight: 'Engineered for scale',
  },
]

const categories = [
  { name: 'Battery', emoji: '🔋', items: 420, color: 'from-amber-500 to-orange-500' },
  { name: 'Keyboard', emoji: '⌨️', items: 380, color: 'from-slate-500 to-slate-600' },
  { name: 'Microwave', emoji: '📱', items: 350, color: 'from-emerald-500 to-teal-500' },
  { name: 'Mobile Phone', emoji: '📱', items: 520, color: 'from-indigo-500 to-blue-500' },
  { name: 'Mouse', emoji: '🖱️', items: 310, color: 'from-rose-500 to-pink-500' },
  { name: 'PCB', emoji: '🟢', items: 450, color: 'from-forest-500 to-emerald-600' },
  { name: 'Player', emoji: '🎮', items: 280, color: 'from-violet-500 to-purple-500' },
  { name: 'Printer', emoji: '🖨️', items: 390, color: 'from-cyan-500 to-blue-500' },
  { name: 'Telephone', emoji: '☎️', items: 240, color: 'from-amber-600 to-orange-600' },
  { name: 'Wires', emoji: '🔌', items: 560, color: 'from-slate-600 to-zinc-600' },
]

const steps = [
  {
    number: '01',
    title: 'Upload Image',
    description: 'Drag & drop or click to upload any e-waste photo. Supports JPG, PNG, WebP up to 10MB.',
    icon: Leaf,
  },
  {
    number: '02',
    title: 'Select Model',
    description: 'Choose EfficientNetB0 for highest accuracy, ResNet50 for balance, or MobileNetV2 for speed.',
    icon: Brain,
  },
  {
    number: '03',
    title: 'Get Results',
    description: 'Instant classification with confidence scores, top-3 predictions, and Grad-CAM attention map.',
    icon: CheckCircle,
  },
  {
    number: '04',
    title: 'Recycle Responsibly',
    description: 'Read category-specific guidance, find nearby certified centres, and chat with our AI assistant.',
    icon: Globe,
  },
]

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative section overflow-hidden bg-hero-pattern">
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 20, ease: 'linear' }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent dark:from-emerald-900/5"
        />
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50/80 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 mb-8"
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-2 h-2 rounded-full bg-emerald-500"
              />
              <span className="text-label text-emerald-700 dark:text-emerald-300 font-semibold">
                GreenGrid v2.0 — Production Release
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-display-xl text-charcoal-900 dark:text-white mb-6 text-balance"
            >
              AI-Powered{' '}
              <span className="text-gradient">E-Waste Intelligence</span>
              {' '}for a Circular Future
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-body-lg text-charcoal-600 dark:text-charcoal-400 max-w-2xl mx-auto mb-10 text-balance"
            >
              Upload any e-waste photo. Get instant classification with 97.8% accuracy. Find certified recyclers. Chat with AI. All in one platform — no fake data, no false promises.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Link to="/detect" className="btn-primary btn-lg group">
                Start Detecting
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
              <Link to="/guide" className="btn-secondary btn-lg">
                Explore Recycling Guide
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center justify-center gap-8 text-sm text-charcoal-500 dark:text-charcoal-500"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>3,900+ training images</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>10 e-waste categories</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>3 fine-tuned models</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>Real API integrations</span>
              </div>
            </motion.div>
          </div>

          {/* Floating Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-[-60px] left-1/2 -translate-x-1/2 flex flex-wrap items-center justify-center gap-4 px-4 z-10"
          >
            <motion.div
              className="card-elevated p-4 sm:p-6 min-w-[200px] text-center"
              whileHover={{ y: -8, boxShadow: '0 24px 64px rgba(15, 23, 42, 0.15)' }}
            >
              <div className="text-4xl font-display font-extrabold text-gradient">97.8%</div>
              <div className="text-caption text-charcoal-500 dark:text-charcoal-500 mt-1">Top Model Accuracy</div>
            </motion.div>
            <motion.div
              className="card-elevated p-4 sm:p-6 min-w-[200px] text-center"
              whileHover={{ y: -8, boxShadow: '0 24px 64px rgba(15, 23, 42, 0.15)' }}
            >
              <div className="text-4xl font-display font-extrabold text-gradient">3,900+</div>
              <div className="text-caption text-charcoal-500 dark:text-charcoal-500 mt-1">Training Images</div>
            </motion.div>
            <motion.div
              className="card-elevated p-4 sm:p-6 min-w-[200px] text-center"
              whileHover={{ y: -8, boxShadow: '0 24px 64px rgba(15, 23, 42, 0.15)' }}
            >
              <div className="text-4xl font-display font-extrabold text-gradient">&lt; 1s</div>
              <div className="text-caption text-charcoal-500 dark:text-charcoal-500 mt-1">Inference Time</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-sm bg-charcoal-50/50 dark:bg-charcoal-950/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="badge-primary mb-4">How It Works</span>
            <h2 className="font-display text-display-md text-charcoal-900 dark:text-white mb-4">
              From Photo to Responsible Recycling in 4 Steps
            </h2>
            <p className="text-body-md text-charcoal-600 dark:text-charcoal-400">
              Simple, transparent, and powered by real AI — not marketing claims.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <div className="card-elevated p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-forest-600 flex items-center justify-center flex-shrink-0">
                      <step.icon className="w-6 h-6 text-white" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-label text-emerald-600 dark:text-emerald-400">{step.number}</span>
                      <h3 className="font-display text-heading-md text-charcoal-900 dark:text-white mt-1">{step.title}</h3>
                    </div>
                  </div>
                  <p className="text-body-sm text-charcoal-600 dark:text-charcoal-400">
                    {step.description}
                  </p>
                </div>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-8 right-[-24px] w-[48px] h-0.5 bg-gradient-to-r from-emerald-300 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="badge-primary mb-4">Why GreenGrid</span>
            <h2 className="font-display text-display-md text-charcoal-900 dark:text-white mb-4">
              Built Different: Honest AI for Real Impact
            </h2>
            <p className="text-body-md text-charcoal-600 dark:text-charcoal-400">
              Every feature serves a purpose. No mock data. No fake accuracy. No hidden limitations.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ delay: index * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="card-interactive p-6 group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-normal">
                  <feature.icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                </div>
                <h3 className="font-display text-heading-sm text-charcoal-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-body-sm text-charcoal-600 dark:text-charcoal-400 mb-3">
                  {feature.description}
                </p>
                <span className="text-caption text-emerald-600 dark:text-emerald-400 font-medium">
                  {feature.highlight}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="section-sm bg-charcoal-50/50 dark:bg-charcoal-950/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <span className="badge-secondary mb-4">Trained Categories</span>
            <h2 className="font-display text-display-md text-charcoal-900 dark:text-white mb-4">
              10 E-Waste Categories, 3,900+ Images
            </h2>
            <p className="text-body-md text-charcoal-600 dark:text-charcoal-400">
              Each category fine-tuned on real e-waste photographs. Model knows what it knows — and admits what it doesn&apos;t.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: index * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="card-interactive p-5 text-center group"
              >
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br group-hover:scale-110 transition-transform duration-normal flex items-center justify-center text-3xl"
                  style={{ background: category.color }}>
                  <span>{category.emoji}</span>
                </div>
                <h4 className="font-display text-heading-sm text-charcoal-900 dark:text-white mb-1">
                  {category.name}
                </h4>
                <p className="text-caption text-charcoal-500 dark:text-charcoal-500">
                  {category.items} training images
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mt-12"
          >
            <Link to="/detect" className="btn-primary btn-lg inline-flex items-center gap-2">
              Try Detection Now
              <ArrowDownRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-forest-600 to-emerald-700" />
        <div className="absolute inset-0 bg-hero-pattern opacity-20" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="font-display text-display-lg text-white mb-6 text-balance">
              Ready to Classify Your First Item?
            </h2>
            <p className="text-body-lg text-emerald-100 mb-8 max-w-xl mx-auto text-balance">
              Upload a photo, pick a model, get instant results. No account required. No data stored. Pure inference.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/detect" className="btn-lg bg-white text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100 group">
                Start Detection
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
              <Link to="/centers" className="btn-lg border-2 border-white text-white hover:bg-white/10 active:bg-white/20">
                Find Recycling Centres
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}