import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, Target, Brain, TrendingUp, Award, Zap } from 'lucide-react'
import { cn } from '../../utils/cn'

interface ComparisonResult {
  model: string
  accuracy: number
  class: string
  confidence: number
  top3: Array<{ class: string; confidence: number; rank: number }>
  ood_detected: boolean
  ood_details: {
    is_ood: boolean
    max_confidence: number
    entropy: number
    normalized_entropy: number
    margin: number
    thresholds: {
      confidence: number
      entropy: number
      margin: number
      normalized_entropy: number
    }
  }
  error?: string
}

interface ComparisonViewProps {
  results: Record<string, ComparisonResult>
  onClose: () => void
  selectedModel: string
  onModelSelect: (modelId: string) => void
  imageUrl: string | null
}

const models = [
  { id: 'efficientnetb0', name: 'EfficientNetB0', icon: Brain, color: 'from-emerald-500 to-forest-600', accuracy: '97.8%' },
  { id: 'resnet50', name: 'ResNet50', icon: Award, color: 'from-blue-500 to-indigo-600', accuracy: '97.3%' },
  { id: 'mobilenetv2', name: 'MobileNetV2', icon: Zap, color: 'from-amber-500 to-orange-500', accuracy: '94.1%' },
]

const getConfidenceColor = (conf: number) => {
  if (conf >= 0.8) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500'
  if (conf >= 0.5) return 'text-amber-600 dark:text-amber-400 bg-amber-500'
  return 'text-red-600 dark:text-red-400 bg-red-500'
}

export default function ComparisonView({ results, onClose, selectedModel, onModelSelect, imageUrl }: ComparisonViewProps) {
  const sortedResults = models
    .map(model => ({
      modelId: model.id,
      modelInfo: model,
      result: results[model.id],
    }))
    .filter(item => item.result && !item.result.error)
    .map(item => ({
      ...item,
      result: item.result!,
    }))

  const errorModels = models
    .map(model => ({ modelId: model.id, modelInfo: model, error: results[model.id]?.error }))
    .filter(item => item.error)

  const agreement = sortedResults.length > 0 &&
    sortedResults.every(r => r.result.class === sortedResults[0].result.class) &&
    !sortedResults.some(r => r.result.ood_detected)
  const oodCount = sortedResults.filter(r => r.result.ood_detected).length

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="comparison-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-950 rounded-3xl shadow-xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-charcoal-200 dark:border-charcoal-800 sticky top-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl z-10 rounded-t-3xl">
            <div>
              <h2 id="comparison-title" className="font-display text-heading-lg text-charcoal-900 dark:text-white">
                Model Comparison
              </h2>
              <p className="text-body-sm text-charcoal-500 dark:text-charcoal-400 mt-1">
                Side-by-side results from all three fine-tuned models
              </p>
            </div>
            <button
              onClick={onClose}
              className="btn-icon p-2 rounded-xl text-charcoal-500 hover:text-charcoal-700 dark:text-charcoal-400 dark:hover:text-charcoal-200 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
              aria-label="Close comparison"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Summary Banner */}
          <div className="p-6 border-b border-charcoal-200 dark:border-charcoal-800 bg-charcoal-50/50 dark:bg-charcoal-900/50">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl',
                agreement && oodCount === 0
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                  : oodCount > 0
                  ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                  : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  agreement && oodCount === 0 ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                  oodCount > 0 ? 'bg-amber-100 dark:bg-amber-900/30' :
                  'bg-blue-100 dark:bg-blue-900/30'
                )}>
                  {agreement && oodCount === 0 && <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                  {oodCount > 0 && <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                  {!agreement && oodCount === 0 && <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                </div>
                <div>
                  <p className={cn('font-display text-heading-sm', agreement && oodCount === 0 ? 'text-emerald-800 dark:text-emerald-200' : oodCount > 0 ? 'text-amber-800 dark:text-amber-200' : 'text-blue-800 dark:text-blue-200')}>
                    {agreement && oodCount === 0 ? 'Full Agreement' : oodCount > 0 ? 'OOD Detected' : 'Mixed Predictions'}
                  </p>
                  <p className={cn('text-caption mt-0.5', agreement && oodCount === 0 ? 'text-emerald-700 dark:text-emerald-300' : oodCount > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-blue-700 dark:text-blue-300')}>
                    {agreement && oodCount === 0
                      ? `All models predict "${sortedResults[0].result.class}" with high confidence`
                      : oodCount > 0
                      ? `${oodCount} of ${sortedResults.length} models flag this as non-e-waste`
                      : 'Models disagree on classification — review individually'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Model Cards */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {sortedResults.map(({ modelId, modelInfo, result }, index) => {
                const isSelected = selectedModel === modelId

                return (
                  <motion.div
                    key={modelId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className={cn(
                      'relative card-elevated p-5 transition-all duration-fast',
                      isSelected ? 'ring-2 ring-emerald-500 shadow-glow' : ''
                    )}
                  >
                    {/* Model Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', `bg-gradient-to-br ${modelInfo.color}`)}>
                          <modelInfo.icon className="w-6 h-6 text-white" aria-hidden="true" />
                        </div>
                        <div>
                          <h3 className="font-display text-heading-sm text-charcoal-900 dark:text-white">
                            {modelInfo.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-caption text-charcoal-500 dark:text-charcoal-500 mt-0.5">
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{(result.accuracy * 100).toFixed(1)}%</span>
                            <span>•</span>
                            <span>Model Accuracy</span>
                          </div>
                        </div>
                      </div>
                      {result.ood_detected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-caption font-medium"
                        >
                          <Target className="w-3.5 h-3.5" />
                          OOD
                        </motion.div>
                      )}
                    </div>

                    {/* Selection Button */}
                    <button
                      onClick={() => onModelSelect(modelId)}
                      disabled={isSelected}
                      className={cn(
                        'w-full py-2.5 rounded-xl font-medium text-caption transition-colors',
                        isSelected
                          ? 'bg-emerald-500 text-white cursor-default'
                          : 'bg-charcoal-100 dark:bg-charcoal-800 text-charcoal-600 dark:text-charcoal-300 hover:bg-forest-50 dark:hover:bg-forest-900/20'
                      )}
                    >
                      {isSelected ? 'Selected Model' : 'Select This Model'}
                    </button>

                    {/* Prediction */}
                    <div className="mt-4 space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className={cn('font-display text-heading-md', getConfidenceColor(result.confidence).split(' ')[0])}>
                            {result.ood_detected ? '—' : (result.confidence * 100).toFixed(1) + '%'}
                          </span>
                          {result.ood_detected && (
                            <span className="text-caption text-amber-600 dark:text-amber-400 font-medium">Non-E-Waste</span>
                          )}
                        </div>
                        {!result.ood_detected && (
                          <>
                            <div className="progress-bar h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${result.confidence * 100}%` }}
                                transition={{ delay: 0.3 + index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                className={cn('progress-fill h-full', getConfidenceColor(result.confidence).split(' ')[2])}
                              />
                            </div>
                            <p className="font-display text-body-md text-charcoal-900 dark:text-white text-balance">
                              {result.class}
                            </p>
                          </>
                        )}
                        {result.ood_detected && (
                          <p className="text-caption text-amber-700 dark:text-amber-300 text-balance">
                            Image does not appear to contain e-waste
                          </p>
                        )}
                      </div>

                      {/* Top 3 Mini */}
                      {!result.ood_detected && (
                        <div className="pt-3 border-t border-charcoal-100 dark:border-charcoal-800 space-y-2">
                          <p className="text-caption text-charcoal-500 dark:text-charcoal-500 font-medium">Top 3:</p>
                          <div className="space-y-1.5">
                            {result.top3.map((pred, i) => (
                              <div key={pred.class} className="flex items-center justify-between gap-2 text-caption">
                                <span className={cn('truncate', i === 0 ? 'font-semibold text-charcoal-900 dark:text-white' : 'text-charcoal-600 dark:text-charcoal-400')}>
                                  {pred.class}
                                </span>
                                <span className={cn('font-mono font-semibold', getConfidenceColor(pred.confidence).split(' ')[0])}>
                                  {(pred.confidence * 100).toFixed(1)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Error models */}
            {errorModels.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4"
              >
                {errorModels.map(({ modelId, modelInfo, error }, index) => (
                  <motion.div
                    key={modelId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="card p-5 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', `bg-gradient-to-br ${modelInfo.color}`)}>
                        <modelInfo.icon className="w-6 h-6 text-white" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-display text-heading-sm text-charcoal-900 dark:text-white">
                          {modelInfo.name}
                        </h3>
                        <p className="text-caption text-red-600 dark:text-red-400 mt-0.5">
                          Error: {error}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Close Button */}
          <div className="p-6 border-t border-charcoal-200 dark:border-charcoal-800 bg-charcoal-50/50 dark:bg-charcoal-900/50 rounded-b-3xl">
            <button
              onClick={onClose}
              className="btn-secondary w-full sm:w-auto"
            >
              Done
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}