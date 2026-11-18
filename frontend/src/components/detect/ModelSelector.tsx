import { motion } from 'framer-motion'
import { Cpu, Zap, Check, Timer, Award, Shield } from 'lucide-react'
import { cn } from '../../utils/cn'

interface ModelInfo {
  id: string
  name: string
  accuracy: string
  description: string
  icon: typeof Cpu
  speed: string
  recommended?: boolean
}

const models: ModelInfo[] = [
  {
    id: 'efficientnetb0',
    name: 'EfficientNetB0',
    accuracy: '97.8%',
    description: 'Highest accuracy. Best for critical classification where precision matters most.',
    icon: Cpu,
    speed: '~800ms',
    recommended: true,
  },
  {
    id: 'resnet50',
    name: 'ResNet50',
    accuracy: '97.3%',
    description: 'Balanced performance. Reliable general-purpose model with strong feature extraction.',
    icon: Award,
    speed: '~1.1s',
  },
  {
    id: 'mobilenetv2',
    name: 'MobileNetV2',
    accuracy: '94.1%',
    description: 'Fastest inference. Optimized for speed on resource-constrained environments.',
    icon: Zap,
    speed: '~400ms',
  },
]

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (modelId: string) => void
  disabled?: boolean
}

export default function ModelSelector({ selectedModel, onModelChange, disabled }: ModelSelectorProps) {
  const selectedModelInfo = models.find(m => m.id === selectedModel)

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="font-display text-heading-sm text-charcoal-900 dark:text-white">
          Select Model
        </h3>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <span className="badge-primary text-caption font-medium">
            {selectedModelInfo?.accuracy} accuracy
          </span>
        </div>
      </div>

      {/* Vertical stack on mobile, horizontal on desktop */}
      <div className="space-y-4 sm:grid sm:grid-cols-3 sm:gap-4" role="radiogroup" aria-label="Select detection model">
        {models.map((model, index) => (
          <motion.button
            key={model.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => !disabled && onModelChange(model.id)}
            disabled={disabled}
            className={cn(
              'card-interactive relative overflow-hidden',
              selectedModel === model.id
                ? 'border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-md'
                : 'border border-charcoal-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 hover:border-forest-400 hover:bg-forest-50/50 dark:hover:bg-forest-900/20',
              disabled && 'opacity-50 cursor-not-allowed',
              'p-5 sm:p-6 min-h-[160px] sm:min-h-[180px] flex flex-col'
            )}
            whileHover={{ y: -2, boxShadow: '0 12px 32px rgba(15, 23, 42, 0.1)' }}
            whileTap={{ scale: 0.98 }}
            role="radio"
            aria-checked={selectedModel === model.id}
            aria-label={`${model.name} - ${model.accuracy} accuracy`}
          >
            {/* Selection indicator ring */}
            {selectedModel === model.id && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-white" />
              </motion.div>
            )}

            {/* Model header */}
            <div className="flex items-start gap-4 relative z-10">
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                selectedModel === model.id
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'bg-charcoal-100 dark:bg-charcoal-800 text-charcoal-600 dark:text-charcoal-400'
              )}>
                <model.icon className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-body font-semibold text-body-md text-charcoal-900 dark:text-white truncate">
                    {model.name}
                  </span>
                  {model.recommended && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 500, damping: 20 }}
                      className="badge-primary text-xs px-2 py-0.5 whitespace-nowrap flex-shrink-0"
                    >
                      Recommended
                    </motion.span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-body-sm text-emerald-700 dark:text-emerald-300 font-semibold mt-1">
                  <Award className="w-4 h-4" aria-hidden="true" />
                  <span>{model.accuracy}</span>
                </div>
              </div>
            </div>

            {/* Speed indicator */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-charcoal-100 dark:border-charcoal-800 relative z-10">
              <div className="flex items-center gap-1.5 text-caption text-charcoal-500 dark:text-charcoal-500">
                <Timer className="w-4 h-4" aria-hidden="true" />
                <span className="font-mono">{model.speed}</span>
              </div>
              <div className="flex-1 h-2 bg-charcoal-100 dark:bg-charcoal-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: model.id === 'efficientnetb0' ? '100%' : model.id === 'resnet50' ? '75%' : '50%' }}
                  transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-forest-600 rounded-full"
                />
              </div>
            </div>

            {/* Description */}
            <p className="text-body-sm text-charcoal-600 dark:text-charcoal-400 line-clamp-3 mt-3 flex-1 relative z-10">
              {model.description}
            </p>
          </motion.button>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-caption text-charcoal-500 dark:text-charcoal-500 text-center"
      >
        All models fine-tuned on 3,900+ e-waste images across 10 categories. Switch models instantly to compare predictions.
      </motion.p>
    </div>
  )
}