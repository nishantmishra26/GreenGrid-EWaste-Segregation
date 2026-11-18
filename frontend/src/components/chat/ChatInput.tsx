import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, Paperclip, Smile, X } from 'lucide-react'
import { cn } from '../../utils/cn'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

const quickPrompts = [
  'How do I recycle a lithium-ion battery?',
  'What e-waste can I put in curbside recycling?',
  'Where can I recycle old cables and wires?',
  'How to prepare a phone for recycling?',
  'What are R2 and e-Stewards certifications?',
  'Can I recycle a broken microwave?',
]

export default function ChatInput({ onSend, disabled, placeholder = 'Ask about e-waste recycling...' }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [showPrompts, setShowPrompts] = useState(true)
  const [inputHeight, setInputHeight] = useState(48)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const promptsRef = useRef<HTMLDivElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const height = Math.min(textareaRef.current.scrollHeight, 160)
      textareaRef.current.style.height = `${height}px`
      setInputHeight(height)
    }
  }, [message])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSend(message.trim())
      setMessage('')
      setShowPrompts(false)
    }
  }, [message, disabled, onSend])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e)
    }
  }, [handleSubmit])

  const handlePromptClick = useCallback((prompt: string) => {
    setMessage(prompt)
    setShowPrompts(false)
    textareaRef.current?.focus()
  }, [])

  const handleClear = useCallback(() => {
    setMessage('')
    textareaRef.current?.focus()
  }, [])

  return (
    <div className="border-t border-charcoal-200 dark:border-charcoal-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl">
      {/* Quick Prompts */}
      <AnimatePresence>
        {showPrompts && message === '' && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            ref={promptsRef}
            className="p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-label text-charcoal-500 dark:text-charcoal-500">Quick questions</span>
              <button
                onClick={() => setShowPrompts(false)}
                className="p-1 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300 transition-colors"
                aria-label="Hide prompts"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2" role="listbox" aria-label="Quick prompts">
              {quickPrompts.map((prompt, index) => (
                <motion.button
                  key={prompt}
                  onClick={() => handlePromptClick(prompt)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="btn-ghost btn-sm px-3 py-1.5 text-left min-w-0"
                  role="option"
                >
                  <span className="truncate">{prompt}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="relative flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowPrompts(false)}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className={cn(
                'input pr-16 resize-none bg-transparent border-0 shadow-none focus:ring-0 focus:border-transparent p-0',
                'text-body-md text-charcoal-900 dark:text-white placeholder:text-charcoal-400 dark:placeholder:text-charcoal-500',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              style={{ height: `${inputHeight}px`, minHeight: '48px', maxHeight: '160px' }}
              aria-label="Chat message"
              aria-describedby="chat-hint"
            />
            {message && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-12 top-1/2 -translate-y-1/2 p-1.5 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300 transition-colors"
                aria-label="Clear message"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className={cn(
              'btn-icon p-2.5 rounded-xl flex-shrink-0 transition-all duration-fast',
              message.trim() && !disabled
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800'
                : 'bg-charcoal-100 dark:bg-charcoal-800 text-charcoal-400 dark:text-charcoal-500 cursor-not-allowed'
            )}
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <p id="chat-hint" className="text-caption text-charcoal-500 dark:text-charcoal-500 mt-2 text-center">
          Press <kbd className="px-1.5 py-0.5 bg-charcoal-100 dark:bg-charcoal-800 rounded text-xs font-mono">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-charcoal-100 dark:bg-charcoal-800 rounded text-xs font-mono">Shift+Enter</kbd> for new line
        </p>
      </form>
    </div>
  )
}