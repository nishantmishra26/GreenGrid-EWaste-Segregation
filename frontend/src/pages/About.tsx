import { motion } from 'framer-motion'
import { Cpu, Shield, Zap, Brain, Globe, Leaf, Award, Code, BookOpen, ExternalLink, GitBranch, Twitter, Linkedin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../utils/cn'

const stats = [
  { value: '97.8%', label: 'Top Model Accuracy', icon: Award, color: 'from-emerald-500 to-forest-600' },
  { value: '3,900+', label: 'Training Images', icon: Leaf, color: 'from-forest-500 to-emerald-600' },
  { value: '10', label: 'E-Waste Categories', icon: Cpu, color: 'from-blue-500 to-indigo-600' },
  { value: '3', label: 'Fine-Tuned Models', icon: Brain, color: 'from-violet-500 to-purple-600' },
]

const models = [
  {
    name: 'EfficientNetB0',
    accuracy: '97.8%',
    architecture: 'EfficientNet-B0 (TensorFlow/Keras)',
    inputSize: '224×224',
    parameters: '5.3M',
    description: 'Compound scaling model optimized for accuracy/efficiency balance. Best overall performance on e-waste classification.',
    trainingTime: '~4 hours on GPU',
    recommended: true,
  },
  {
    name: 'ResNet50',
    accuracy: '97.3%',
    architecture: 'ResNet-50 v1 (TensorFlow/Keras)',
    inputSize: '224×224',
    parameters: '25.6M',
    description: 'Deep residual network with skip connections. Strong feature extraction, reliable general-purpose performance.',
    trainingTime: '~6 hours on GPU',
    recommended: false,
  },
  {
    name: 'MobileNetV2',
    accuracy: '94.1%',
    architecture: 'MobileNetV2 (TensorFlow/Keras)',
    inputSize: '224×224',
    parameters: '3.5M',
    description: 'Inverted residual blocks with depthwise separable convolutions. Fastest inference for edge deployment.',
    trainingTime: '~3 hours on GPU',
    recommended: false,
  },
]

const features = [
  {
    icon: Shield,
    title: 'Multi-Signal OOD Detection',
    description: 'Combines confidence threshold (0.5), entropy (1.8), top-2 margin (0.15), and normalized entropy (0.85) to reliably reject non-e-waste images with explanations.',
  },
  {
    icon: Zap,
    title: 'Grad-CAM Visualization',
    description: 'Class activation maps show exactly which image regions drive predictions — built-in explainability for every classification.',
  },
  {
    icon: Globe,
    title: 'Live Recycling Data',
    description: 'OpenStreetMap/Overpass API integration with Nominatim geocoding. Known-chain fallbacks for major retailers. All results marked "verify locally".',
  },
  {
    icon: Brain,
    title: 'Gemini 2.5 Flash Assistant',
    description: 'Generative AI for recycling guidance with curated knowledge base fallback. Context-aware responses based on detected category.',
  },
  {
    icon: Code,
    title: 'Production Architecture',
    description: 'FastAPI async backend with model caching, React 18 + Vite + Tailwind + Framer Motion frontend. Type-safe, tested, containerizable.',
  },
  {
    icon: BookOpen,
    title: 'Transparent Limitations',
    description: 'Honest about acceptance verification gaps, model confidence thresholds, and API rate limits. No fake data, no hidden caveats.',
  },
]

const techStack = [
  { category: 'Backend', items: ['FastAPI', 'TensorFlow/Keras', 'Google GenAI SDK', 'HTTPX', 'Uvicorn', 'Pydantic'] },
  { category: 'Frontend', items: ['React 18', 'Vite', 'Tailwind CSS 3', 'Framer Motion', 'React Router 7', 'Axios', 'Leaflet'] },
  { category: 'ML/Models', items: ['EfficientNetB0', 'ResNet50', 'MobileNetV2', 'Transfer Learning', 'Grad-CAM', 'OOD Detection'] },
  { category: 'APIs/Data', items: ['Gemini 2.5 Flash', 'OpenStreetMap/Overpass', 'Nominatim', 'Custom Knowledge Base'] },
]

const team = [
  { name: 'GreenGrid Team', role: 'AI/ML Engineers & Full-Stack Developers', focus: 'E-waste classification, recycling intelligence, responsible AI' },
]

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="section relative overflow-hidden bg-hero-pattern">
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
            <span className="badge-secondary mb-4">About GreenGrid</span>
            <h1 className="font-display text-display-xl text-charcoal-900 dark:text-white mb-6 text-balance">
              Built for <span className="text-gradient">Real Impact</span>, Not Demos
            </h1>
            <p className="text-body-lg text-charcoal-600 dark:text-charcoal-400 max-w-xl mx-auto text-balance mb-8">
              Every component serves a purpose. Real models. Real APIs. Honest limitations. GreenGrid v2.0 is a production-ready e-waste intelligence platform.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/detect" className="btn-primary btn-lg">
                Try Detection
              </Link>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn-secondary btn-lg flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                View Source
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-sm bg-charcoal-50/50 dark:bg-charcoal-950/50">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="card-elevated p-6 text-center"
              >
                <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4', `bg-gradient-to-br ${stat.color}`)}>
                  <stat.icon className="w-7 h-7 text-white" aria-hidden="true" />
                </div>
                <div className="font-display text-display-md text-charcoal-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-body-sm text-charcoal-600 dark:text-charcoal-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Models Deep Dive */}
      <section className="section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="badge-primary mb-4">Models</span>
            <h2 className="font-display text-display-md text-charcoal-900 dark:text-white mb-4">
              Three Fine-Tuned Architectures
            </h2>
            <p className="text-body-md text-charcoal-600 dark:text-charcoal-400">
              All models trained on 3,900+ e-waste images across 10 categories using transfer learning with ImageNet weights.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {models.map((model, index) => (
              <motion.div
                key={model.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={cn('card-elevated p-6 relative overflow-hidden', model.recommended && 'ring-2 ring-emerald-500')}
              >
                {model.recommended && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring', stiffness: 500, damping: 20 }}
                    className="absolute top-4 right-4 badge-primary"
                  >
                    Recommended
                  </motion.div>
                )}

                <div className="mb-4">
                  <h3 className="font-display text-heading-lg text-charcoal-900 dark:text-white mb-2">
                    {model.name}
                  </h3>
                  <p className="text-body-md text-charcoal-600 dark:text-charcoal-400 mb-4">
                    {model.description}
                  </p>
                </div>

                <div className="space-y-3 mb-4 pt-4 border-t border-charcoal-100 dark:border-charcoal-800">
                  <div className="flex justify-between text-body-sm">
                    <span className="text-charcoal-500 dark:text-charcoal-400">Accuracy</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{model.accuracy}</span>
                  </div>
                  <div className="flex justify-between text-body-sm">
                    <span className="text-charcoal-500 dark:text-charcoal-400">Parameters</span>
                    <span className="font-mono font-medium text-charcoal-900 dark:text-white">{model.parameters}</span>
                  </div>
                  <div className="flex justify-between text-body-sm">
                    <span className="text-charcoal-500 dark:text-charcoal-400">Input Size</span>
                    <span className="font-mono font-medium text-charcoal-900 dark:text-white">{model.inputSize}</span>
                  </div>
                  <div className="flex justify-between text-body-sm">
                    <span className="text-charcoal-500 dark:text-charcoal-400">Training Time</span>
                    <span className="text-charcoal-900 dark:text-white">{model.trainingTime}</span>
                  </div>
                </div>

                <div className="text-caption text-charcoal-500 dark:text-charcoal-500">
                  <strong>Architecture:</strong> {model.architecture}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-sm bg-charcoal-50/50 dark:bg-charcoal-950/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="badge-secondary mb-4">Capabilities</span>
            <h2 className="font-display text-display-md text-charcoal-900 dark:text-white mb-4">
              What Makes GreenGrid Different
            </h2>
            <p className="text-body-md text-charcoal-600 dark:text-charcoal-400">
              Six core capabilities that go beyond basic classification.
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
                className="card-interactive p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-display text-heading-md text-charcoal-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-body-sm text-charcoal-600 dark:text-charcoal-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="badge-primary mb-4">Technology</span>
            <h2 className="font-display text-display-md text-charcoal-900 dark:text-white mb-4">
              Modern Stack, Production Ready
            </h2>
            <p className="text-body-md text-charcoal-600 dark:text-charcoal-400">
              Carefully chosen tools for performance, developer experience, and maintainability.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {techStack.map((stack, index) => (
              <motion.div
                key={stack.category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="card-elevated p-6"
              >
                <h3 className="font-display text-heading-md text-charcoal-900 dark:text-white mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  {stack.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {stack.items.map((item, i) => (
                    <span key={i} className="badge-secondary text-xs">
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Sources & Attribution */}
      <section className="section-sm bg-charcoal-50/50 dark:bg-charcoal-950/50 border-t border-charcoal-200 dark:border-charcoal-800">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="font-display text-heading-xl text-charcoal-900 dark:text-white mb-6 text-center">
              Data Sources & Attribution
            </h2>
            <div className="space-y-4">
              <div className="card p-6">
                <h3 className="font-display text-heading-md text-charcoal-900 dark:text-white mb-3 flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                  Training Data
                </h3>
                <p className="text-body-sm text-charcoal-600 dark:text-charcoal-400 mb-2">
                  E-waste image dataset: 3,900+ images across 10 categories (Battery, Keyboard, Microwave, Mobile Phone, Mouse, PCB, Player, Printer, Telephone, Wires).
                </p>
                <p className="text-caption text-charcoal-500 dark:text-charcoal-500">
                  Images sourced from public datasets and curated collections. Used under fair use for research/educational purposes.
                </p>
              </div>

              <div className="card p-6">
                <h3 className="font-display text-heading-md text-charcoal-900 dark:text-white mb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-600" />
                  Recycling Centre Data
                </h3>
                <p className="text-body-sm text-charcoal-600 dark:text-charcoal-400 mb-2">
                  <strong>OpenStreetMap/Overpass API:</strong> Live facility data from the global OSM community.
                </p>
                <p className="text-body-sm text-charcoal-600 dark:text-charcoal-400 mb-2">
                  <strong>Nominatim:</strong> Geocoding for address/ZIP/city search.
                </p>
                <p className="text-body-sm text-charcoal-600 dark:text-charcoal-400 mb-2">
                  <strong>Known-chain fallbacks:</strong> Representative locations for major retailers (Best Buy, Staples, Home Depot, Lowe's, etc.) marked as "verify locally".
                </p>
                <p className="text-caption text-charcoal-500 dark:text-charcoal-500">
                  All OSM data © OpenStreetMap contributors, available under ODbL.
                </p>
              </div>

              <div className="card p-6">
                <h3 className="font-display text-heading-md text-charcoal-900 dark:text-white mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-emerald-600" />
                  AI Services
                </h3>
                <p className="text-body-sm text-charcoal-600 dark:text-charcoal-400 mb-2">
                  <strong>Google Gemini 2.5 Flash:</strong> Generative AI for recycling guidance via google-genai SDK.
                </p>
                <p className="text-body-sm text-charcoal-600 dark:text-charcoal-400 mb-2">
                  <strong>Knowledge Base Fallback:</strong> Curated recycling information from EPA, Basel Convention, and industry guidelines.
                </p>
                <p className="text-caption text-charcoal-500 dark:text-charcoal-500">
                  Gemini API subject to Google AI Terms of Service. Knowledge base compiled from public sources.
                </p>
              </div>

              <div className="card p-6">
                <h3 className="font-display text-heading-md text-charcoal-900 dark:text-white mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  Recycling Guidelines
                </h3>
                <p className="text-body-sm text-charcoal-600 dark:text-charcoal-400 mb-2">
                  Based on EPA e-waste guidelines, Basel Convention, R2 Standard, e-Stewards certification requirements, and manufacturer take-back programs.
                </p>
                <p className="text-caption text-charcoal-500 dark:text-charcoal-500">
                  Always verify with local authorities and certified recyclers. GreenGrid provides information only — not professional disposal advice.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="section border-t border-charcoal-200 dark:border-charcoal-800">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              className="card p-8 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                <h3 className="font-display text-heading-lg text-charcoal-900 dark:text-white">
                  Important Disclaimer
                </h3>
              </div>
              <div className="text-left space-y-3 text-body-sm text-charcoal-700 dark:text-charcoal-300">
                <p><strong>GreenGrid v2.0 is a demonstration/educational platform.</strong> It provides AI-powered classification and information retrieval — not professional waste management advice.</p>
                <p><strong>Model predictions are probabilistic.</strong> Even at 97.8% accuracy, misclassifications occur. Always verify critical decisions with certified professionals.</p>
                <p><strong>Recycling centre data is not verified.</strong> OpenStreetMap data may be outdated or incomplete. "Acceptance unknown" means exactly that — call before visiting.</p>
                <p><strong>Hazardous materials require special handling.</strong> Batteries, CRT monitors, mercury devices, refrigerants, and PCB-containing equipment must go to certified recyclers (R2, e-Stewards).</p>
                <p><strong>Data privacy:</strong> No images or chats are stored. All inference happens server-side; no persistent logging of user content.</p>
                <p className="pt-2 border-t border-amber-200 dark:border-amber-800">
                  For production deployment: add authentication, rate limiting, audit logging, and professional waste management review.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
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
              Ready to Build on This?
            </h2>
            <p className="text-body-lg text-emerald-100 mb-8 max-w-xl mx-auto text-balance">
              Open source. Production-ready. Extensible architecture. Fork it, extend it, deploy it.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn-lg bg-white text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100 group flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                View on GitHub
              </a>
              <Link to="/detect" className="btn-lg border-2 border-white text-white hover:bg-white/10 active:bg-white/20">
                Try It Now
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}