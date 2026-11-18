import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useToastStore } from '../../stores/toast'
import { cn } from '../../utils/cn'

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

const colorMap = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-charcoal-900 dark:bg-charcoal-100 text-white dark:text-charcoal-900',
}

const iconColorMap = {
  success: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  error: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
}

export default function Toaster() {
  const { toasts, removeToast } = useToastStore()

  return (
    <AnimatePresence>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none" aria-live="polite" aria-label="Notifications">
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type]
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={cn(
                'pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-xl min-w-[300px] max-w-md',
                colorMap[toast.type]
              )}
              onMouseEnter={() => toast.pause?.()}
              onMouseLeave={() => toast.resume?.()}
            >
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', iconColorMap[toast.type])}>
                <Icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <p className="font-semibold text-body-sm mb-1">{toast.title}</p>
                )}
                <p className="text-body-sm opacity-90">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg opacity-70 hover:opacity-100 transition-opacity flex-shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
              {toast.duration && (
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: 0 }}
                  transition={{ duration: toast.duration, ease: 'linear' }}
                  className="absolute bottom-0 left-0 h-0.5 bg-white/30 rounded-bl-2xl rounded-br-2xl"
                />
              )}
            </motion.div>
          )
        })}
      </div>
    </AnimatePresence>
  )
}