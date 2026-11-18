import { motion, useDragControls } from 'framer-motion'
import { Upload, Image, X, CheckCircle, AlertCircle } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { cn } from '../../utils/cn'

interface UploadZoneProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
  isProcessing: boolean
  error?: string
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export default function UploadZone({ onFileSelect, selectedFile, isProcessing, error }: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [dragCount, setDragCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Please upload a JPEG, PNG, or WebP image.'
    }
    if (file.size > MAX_SIZE) {
      return 'File size must be less than 10MB.'
    }
    return null
  }, [])

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      // Error handled by parent via onFileSelect with invalid file
      return
    }
    onFileSelect(file)
  }, [onFileSelect, validateFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
    setDragCount(0)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragCount(prev => prev + 1)
    setIsDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragCount(prev => prev - 1)
    if (dragCount <= 1) setIsDragActive(false)
  }, [dragCount])

  const handleClick = useCallback(() => {
    if (!isProcessing) fileInputRef.current?.click()
  }, [isProcessing])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
    e.target.value = ''
  }, [handleFileSelect])

  const removeFile = useCallback(() => {
    onFileSelect(null as any)
  }, [onFileSelect])

  if (selectedFile && !error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="aspect-video rounded-2xl overflow-hidden bg-charcoal-100 dark:bg-charcoal-800 relative">
          <img
            src={URL.createObjectURL(selectedFile)}
            alt="Preview of uploaded e-waste image"
            className="w-full h-full object-cover"
          />
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4"
                />
                <p className="text-body-md text-white font-medium">Analyzing with AI...</p>
                <p className="text-caption text-white/70 mt-1">This may take a few seconds</p>
              </div>
            </motion.div>
          )}
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3 text-sm text-charcoal-600 dark:text-charcoal-400">
            <Image className="w-5 h-5 text-emerald-500" />
            <span>{selectedFile.name}</span>
            <span className="text-charcoal-400">•</span>
            <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
          <button
            onClick={removeFile}
            disabled={isProcessing}
            className="btn-ghost btn-sm text-red-600 hover:text-red-700 dark:hover:text-red-400"
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Remove</span>
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'upload-zone',
        isDragActive && 'upload-zone.active',
        error && 'upload-zone.error'
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
      aria-label="Upload e-waste image"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-hidden="true"
        disabled={isProcessing}
      />

      <motion.div
        animate={{ y: isDragActive ? -4 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ scale: isDragActive ? 1.1 : 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400"
        >
          <Upload className="w-8 h-8" />
        </motion.div>

        <div className="text-center">
          <h3 className="font-display text-heading-md text-charcoal-900 dark:text-white">
            {isDragActive ? 'Drop your image here' : 'Upload E-Waste Image'}
          </h3>
          <p className="text-body-sm text-charcoal-600 dark:text-charcoal-400 mt-1 max-w-xs">
            {isDragActive
              ? 'Release to upload and analyze'
              : 'Drag & drop or click to select a JPG, PNG, or WebP file (max 10MB)'}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex flex-wrap items-center justify-center gap-2 text-caption text-charcoal-500 dark:text-charcoal-500"
        >
          <span className="badge-outline px-3 py-1">JPG</span>
          <span className="badge-outline px-3 py-1">PNG</span>
          <span className="badge-outline px-3 py-1">WebP</span>
          <span className="badge-outline px-3 py-1">≤ 10MB</span>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}