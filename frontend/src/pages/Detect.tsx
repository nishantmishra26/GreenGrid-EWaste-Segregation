import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, RotateCcw, AlertCircle } from 'lucide-react'
import UploadZone from '../components/detect/UploadZone'
import ModelSelector from '../components/detect/ModelSelector'
import ResultsPanel from '../components/detect/ResultsPanel'
import ComparisonView from '../components/detect/ComparisonView'
import { predictApi, PredictionResponse, ComparisonResponse } from '../lib/api'
import { cn } from '../utils/cn'

const MODEL_OPTIONS = [
  { id: 'efficientnetb0', name: 'EfficientNetB0' },
  { id: 'resnet50', name: 'ResNet50' },
  { id: 'mobilenetv2', name: 'MobileNetV2' },
]

export default function Detect() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<'efficientnetb0' | 'resnet50' | 'mobilenetv2'>('efficientnetb0')
  const [result, setResult] = useState<PredictionResponse | null>(null)
  const [comparisonResults, setComparisonResults] = useState<ComparisonResponse['results'] | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComparing, setIsComparing] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
    }
  }, [imageUrl])

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }, [])

  const handleFileSelect = useCallback((file: File | null) => {
    setError(null)
    if (!file) {
      setSelectedFile(null)
      setImageUrl(null)
      setResult(null)
      setComparisonResults(null)
      return
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image.')
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.')
      return
    }

    setSelectedFile(file)
    if (imageUrl) URL.revokeObjectURL(imageUrl)
    setImageUrl(URL.createObjectURL(file))
    setResult(null)
    setComparisonResults(null)
  }, [imageUrl])

  const handlePredict = useCallback(async () => {
    if (!selectedFile || isProcessing) return

    setIsProcessing(true)
    setError(null)

    try {
      const response = await predictApi.single(selectedFile, selectedModel)
      setResult(response.data)
      showToast('Analysis complete!', 'success')
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to analyze image. Please try again.'
      setError(message)
      showToast(message, 'error')
    } finally {
      setIsProcessing(false)
    }
  }, [selectedFile, selectedModel, showToast])

  const handleCompare = useCallback(async () => {
    if (!selectedFile || isComparing) return

    setIsComparing(true)
    setError(null)

    try {
      const response = await predictApi.compare(selectedFile)
      setComparisonResults(response.data.results)
      setShowComparison(true)
      showToast('Comparison complete!', 'success')
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to compare models. Please try again.'
      setError(message)
      showToast(message, 'error')
    } finally {
      setIsComparing(false)
    }
  }, [selectedFile, showToast])

  const handleModelSelect = useCallback((modelId: string) => {
    setSelectedModel(modelId as any)
    if (result) {
      // Re-predict with new model
      handlePredict()
    }
  }, [result, handlePredict])

  const handleRetry = useCallback(() => {
    setSelectedFile(null)
    setImageUrl(null)
    setResult(null)
    setComparisonResults(null)
    setError(null)
  }, [])

  const handleCloseComparison = useCallback(() => {
    setShowComparison(false)
  }, [])

  // Auto-predict when file is selected
  useEffect(() => {
    if (selectedFile && !result && !isProcessing) {
      handlePredict()
    }
  }, [selectedFile, result, isProcessing, handlePredict])

  return (
    <div className="min-h-screen">
      <section className="section-sm pt-8 pb-12">
        <div className="container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center mb-10"
          >
            <span className="badge-primary mb-4">AI Detection</span>
            <h1 className="font-display text-display-md text-charcoal-900 dark:text-white mb-4">
              Classify E-Waste Instantly
            </h1>
            <p className="text-body-md text-charcoal-600 dark:text-charcoal-400 max-w-xl mx-auto">
              Upload a photo of electronic waste. Choose your model. Get instant classification with confidence scores, top-3 predictions, and Grad-CAM attention maps.
            </p>
          </motion.div>

          {/* Main Content */}
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Left Column - Upload & Model Selector */}
              <div className="lg:col-span-1 space-y-6">
                {/* Upload Zone */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="card-elevated p-6 sticky top-24"
                >
                  <UploadZone
                    onFileSelect={handleFileSelect}
                    selectedFile={selectedFile}
                    isProcessing={isProcessing}
                    error={error}
                  />
                </motion.div>

                {/* Model Selector */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="card-elevated p-6 sticky top-24"
                >
                  <ModelSelector
                    selectedModel={selectedModel}
                    onModelChange={handleModelSelect}
                    disabled={isProcessing || isComparing}
                  />
                </motion.div>

                {/* Info Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="card p-5 border-emerald-200 dark:border-emerald-800"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-display text-heading-sm text-charcoal-900 dark:text-white mb-2">
                        Tips for Best Results
                      </h4>
                      <ul className="space-y-2 text-body-sm text-charcoal-600 dark:text-charcoal-400">
                        <li className="flex items-start gap-2">• Clear, well-lit photo of the item</li>
                        <li className="flex items-start gap-2">• Single e-waste item centered in frame</li>
                        <li className="flex items-start gap-2">• Avoid heavy shadows or reflections</li>
                        <li className="flex items-start gap-2">• Minimum 224x224px resolution</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Right Column - Results */}
              <div className="lg:col-span-2 space-y-6">
                <AnimatePresence mode="wait">
                  {result ? (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <ResultsPanel
                        result={result}
                        imageUrl={imageUrl}
                        selectedModel={selectedModel}
                        onCompare={handleCompare}
                        onRetry={handleRetry}
                        isLoading={isProcessing}
                      />
                    </motion.div>
                  ) : selectedFile && isProcessing ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="card-elevated p-8 text-center"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full mx-auto mb-4"
                      />
                      <p className="text-body-md text-charcoal-600 dark:text-charcoal-400">
                        Analyzing with {MODEL_OPTIONS.find(m => m.id === selectedModel)?.name}...
                      </p>
                      <p className="text-caption text-charcoal-500 dark:text-charcoal-500 mt-1">
                        This usually takes less than a second
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card-elevated p-12 text-center"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-charcoal-100 dark:bg-charcoal-800 flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-charcoal-400 dark:text-charcoal-500" />
                      </div>
                      <h3 className="font-display text-heading-md text-charcoal-900 dark:text-white mb-2">
                        Ready to Analyze
                      </h3>
                      <p className="text-body-md text-charcoal-600 dark:text-charcoal-400 max-w-sm mx-auto">
                        Upload an e-waste image from the left panel to see instant classification results here.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Modal */}
      {showComparison && (
        <ComparisonView
          results={comparisonResults || {}}
          onClose={handleCloseComparison}
          selectedModel={selectedModel}
          onModelSelect={handleModelSelect}
          imageUrl={imageUrl}
        />
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={cn(
              'fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 max-w-sm',
              toast.type === 'success' ? 'bg-emerald-600 text-white' :
              toast.type === 'error' ? 'bg-red-600 text-white' :
              'bg-charcoal-900 text-white'
            )}
          >
            <span className="text-body-sm">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}