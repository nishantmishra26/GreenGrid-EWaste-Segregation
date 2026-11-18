import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, BarChart3, AlertTriangle, Info, ExternalLink, RefreshCw, Eye, Brain } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

interface PredictionResult {
  class_name: string
  confidence: number
  probabilities: Record<string, number>
  top3: Array<{ class: string; confidence: number; rank: number }>
  model_used: string
  model_accuracy: number
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
}

interface ResultsPanelProps {
  result: PredictionResult | null
  imageUrl: string | null
  selectedModel: string
  onCompare: () => void
  onRetry: () => void
  isLoading: boolean
}

const formatConfidence = (conf: number) => `${(conf * 100).toFixed(1)}%`

const getConfidenceColor = (conf: number, isDark = false) => {
  if (conf >= 0.8) return isDark ? 'text-emerald-300' : 'text-emerald-600'
  if (conf >= 0.5) return isDark ? 'text-amber-300' : 'text-amber-600'
  return isDark ? 'text-red-300' : 'text-red-600'
}

const getConfidenceBg = (conf: number) => {
  if (conf >= 0.8) return 'bg-emerald-500'
  if (conf >= 0.5) return 'bg-amber-500'
  return 'bg-red-500'
}

const getConfidenceLabelColor = (conf: number, isDark = false) => {
  if (conf >= 0.8) return isDark ? 'text-emerald-400' : 'text-emerald-700'
  if (conf >= 0.5) return isDark ? 'text-amber-400' : 'text-amber-700'
  return isDark ? 'text-red-400' : 'text-red-700'
}

const getOODReason = (oodDetails: PredictionResult['ood_details']): string => {
  const reasons: string[] = []
  if (oodDetails.max_confidence < oodDetails.thresholds.confidence) {
    reasons.push(`Low confidence (${(oodDetails.max_confidence * 100).toFixed(1)}% < ${(oodDetails.thresholds.confidence * 100).toFixed(0)}%)`)
  }
  if (oodDetails.entropy > oodDetails.thresholds.entropy) {
    reasons.push(`High entropy (${oodDetails.entropy.toFixed(2)} > ${oodDetails.thresholds.entropy})`)
  }
  if (oodDetails.margin < oodDetails.thresholds.margin) {
    reasons.push(`Small margin (${oodDetails.margin.toFixed(2)} < ${oodDetails.thresholds.margin})`)
  }
  if (oodDetails.normalized_entropy > oodDetails.thresholds.normalized_entropy) {
    reasons.push(`High normalized entropy (${oodDetails.normalized_entropy.toFixed(2)} > ${oodDetails.thresholds.normalized_entropy})`)
  }
  return reasons.length > 0 ? reasons.join('; ') : 'Image does not match any known e-waste category'
}

export default function ResultsPanel({ result, imageUrl, selectedModel, onCompare, onRetry, isLoading }: ResultsPanelProps) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkDark = () => setIsDark(document.documentElement.classList.contains('dark'))
    checkDark()
    const observer = new MutationObserver(checkDark)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  if (!result && !isLoading) return null

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="skeleton-card" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="skeleton skeleton-text h-8 w-3/4" />
          <div className="skeleton skeleton-text h-8 w-1/2" />
          <div className="skeleton skeleton-text h-8 w-1/2" />
        </div>
        <div className="skeleton h-48 rounded-xl" />
      </motion.div>
    )
  }

  if (!result) return null

  const isOOD = result.ood_detected
  const oodReason = getOODReason(result.ood_details)

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={result.class_name + result.model_used}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-6"
      >
        {/* OOD Warning Banner */}
        {isOOD && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            className="relative p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800"
            role="alert"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-display text-heading-sm text-amber-800 dark:text-amber-200 mb-1">
                  Non-E-Waste Image Detected
                </h4>
                <p className="text-body-sm text-amber-700 dark:text-amber-300 mb-2">
                  {oodReason}
                </p>
                <p className="text-caption text-amber-600 dark:text-amber-400">
                  Please upload a clear photo of electronic waste (batteries, phones, keyboards, cables, PCBs, etc.)
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Result Card */}
        <div className="result-card">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Image Preview */}
            <div className="lg:col-span-1">
              <div className="aspect-video rounded-xl overflow-hidden bg-charcoal-100 dark:bg-charcoal-800 relative">
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Analyzed e-waste image"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>

            {/* Prediction Details */}
            <div className="lg:col-span-2 space-y-5">
              {/* Primary Prediction */}
              <div className="space-y-4">
                <div className="flex items-baseline justify-between gap-4 flex-wrap">
                  <div>
                    <span className="badge-secondary mb-2">{result.model_used}</span>
                    <h2 className="font-display text-display-sm text-charcoal-900 dark:text-white text-balance">
                      {result.class_name}
                    </h2>
                  </div>
                  <div className="text-right">
                    <div className={cn('font-display text-display-md font-extrabold', getConfidenceColor(result.confidence, isDark))}>
                      {formatConfidence(result.confidence)}
                    </div>
                    <div className="text-caption text-charcoal-500 dark:text-charcoal-500">Confidence</div>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-caption">
                    <span className="text-charcoal-600 dark:text-charcoal-400">Confidence Level</span>
                    <span className={cn('font-semibold', getConfidenceLabelColor(result.confidence, isDark))}>
                      {result.confidence >= 0.8 ? 'High' : result.confidence >= 0.5 ? 'Medium' : 'Low'}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence * 100}%` }}
                      transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className={cn('progress-fill', getConfidenceBg(result.confidence))}
                    />
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-charcoal-600 dark:text-charcoal-400 pt-2 border-t border-charcoal-100 dark:border-charcoal-800">
                  <span className="flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-charcoal-400 dark:text-charcoal-500" />
                    <span className="font-medium">Model Accuracy:</span> {(result.model_accuracy * 100).toFixed(1)}%
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-charcoal-400 dark:text-charcoal-500" />
                    <span className="font-medium">Model:</span> {selectedModel}
                  </span>
                </div>
              </div>

              {/* Top 3 Predictions */}
              <div className="space-y-3 pt-4 border-t border-charcoal-100 dark:border-charcoal-800">
                <h4 className="font-display text-heading-sm text-charcoal-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Top 3 Predictions
                </h4>
                <div className="space-y-2">
                  {result.top3.map((prediction, index) => (
                    <motion.div
                      key={prediction.class}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="group"
                    >
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span className={cn('font-medium text-body-sm', prediction.class === result.class_name ? 'text-charcoal-900 dark:text-white' : 'text-charcoal-700 dark:text-charcoal-300')}>
                          {prediction.class}
                          {prediction.class === result.class_name && (
                            <motion.span
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="ml-1 text-emerald-500 dark:text-emerald-400"
                            >
                              ●
                            </motion.span>
                          )}
                        </span>
                        <span className={cn('font-mono font-semibold text-body-sm', getConfidenceColor(prediction.confidence, isDark))}>
                          {formatConfidence(prediction.confidence)}
                        </span>
                      </div>
                      <div className="progress-bar h-1.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${prediction.confidence * 100}%` }}
                          transition={{ delay: 0.4 + index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                          className={cn('progress-fill h-full', getConfidenceBg(prediction.confidence))}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onCompare}
              className="btn-secondary group"
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              Compare All Models
            </button>
            <button
              onClick={onRetry}
              className="btn-ghost"
              disabled={isLoading}
            >
              <Eye className="w-4 h-4" />
              Analyze Another
            </button>
          </div>

          {!isOOD && (
            <Link
              to={`/guide?category=${encodeURIComponent(result.class_name)}`}
              className="btn-primary group"
            >
              View Recycling Guide
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {/* Info Footer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-charcoal-50 dark:bg-charcoal-800/50 border border-charcoal-100 dark:border-charcoal-700"
        >
          <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <p className="text-caption text-charcoal-600 dark:text-charcoal-400">
            Results are AI predictions — not professional assessments. For hazardous materials (batteries, CRT monitors, etc.), consult certified e-waste recyclers (R2, e-Stewards certified).
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}