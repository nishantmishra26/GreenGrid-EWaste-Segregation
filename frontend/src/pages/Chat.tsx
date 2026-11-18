import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Loader2, RotateCcw, Info, Brain, BookOpen, Trash2, Shield, AlertCircle, CheckCircle2, Zap } from 'lucide-react'
import MessageList from '../components/chat/MessageList'
import ChatInput from '../components/chat/ChatInput'
import { api, ChatMessage, ChatRequest, ChatResponse } from '../lib/api'
import { cn } from '../utils/cn'

const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content: `Welcome to GreenGrid AI Assistant! 🌱 I'm powered by **Gemini 2.5 Flash** with a curated knowledge base fallback.

I can help you with:
• **Recycling guidance** for specific e-waste categories
• **Disposal methods** and safety procedures
• **Finding certified recyclers** (R2, e-Stewards)
• **Regulations** and compliance questions
• **Data destruction** best practices

What would you like to know about e-waste recycling today?`,
  timestamp: new Date().toISOString(),
  source: 'knowledge_base',
}

const quickQuestions = [
  { text: 'How do I recycle a lithium-ion battery?', category: 'Battery' },
  { text: 'What e-waste can I put in curbside recycling?', category: null },
  { text: 'Where can I recycle old cables and wires?', category: null },
  { text: 'How to prepare a phone for recycling?', category: 'Mobile' },
  { text: 'What are R2 and e-Stewards certifications?', category: null },
  { text: 'Can I recycle a broken microwave?', category: 'Microwave' },
]

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
  const [isLoading, setIsLoading] = useState(false)
  const [contextCategory, setContextCategory] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showQuickQuestions, setShowQuickQuestions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Check for context category from URL (e.g., from detection result)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const category = params.get('category')
    if (category) {
      setContextCategory(category)
      // Add context message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `💡 **Context:** You're asking about **${category}** recycling. I'll prioritize information relevant to this category.`,
        timestamp: new Date().toISOString(),
        source: 'knowledge_base',
      }])
      // Clear URL param
      const url = new URL(window.location.href)
      url.searchParams.delete('category')
      window.history.replaceState({}, '', url)
    }
  }, [])

  const handleSend = useCallback(async (message: string) => {
    if (isLoading) return

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)
    setShowQuickQuestions(false)

    // Create abort controller for this request
    abortControllerRef.current = new AbortController()

    // Add streaming assistant message
    const streamingMessage: ChatMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
    }
    setMessages(prev => [...prev, streamingMessage])

    try {
      const request: ChatRequest = {
        message,
        history: messages.slice(-10), // Last 10 messages for context
        context_category: contextCategory || undefined,
      }

      const response = await api.post<ChatResponse>('/api/chat', request, {
        signal: abortControllerRef.current.signal,
      })

      // Replace streaming message with actual response
      setMessages(prev => prev.slice(0, -1).concat([{
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date().toISOString(),
        source: response.data.source,
      }]))
    } catch (err: any) {
      if (err.name === 'AbortError') return

      const message = err.response?.data?.detail || 'Failed to get response. Please try again.'
      setError(message)

      // Replace streaming message with error
      setMessages(prev => prev.slice(0, -1).concat([{
        role: 'assistant',
        content: `❌ **Error:** ${message}\n\nPlease try rephrasing your question or check your connection.`,
        timestamp: new Date().toISOString(),
        source: 'knowledge_base',
      }]))
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }, [isLoading, messages, contextCategory])

  const handleClear = useCallback(() => {
    setMessages([WELCOME_MESSAGE])
    setContextCategory(null)
    setError(null)
    setShowQuickQuestions(true)
  }, [])

  const handleRetry = useCallback(() => {
    if (messages.length >= 2) {
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
      if (lastUserMessage) {
        // Remove last assistant message and retry
        setMessages(prev => prev.slice(0, -1))
        handleSend(lastUserMessage.content)
      }
    }
  }, [messages, handleSend])

  const handleCopy = useCallback((content: string) => {
    navigator.clipboard.writeText(content)
    // Could add toast here
  }, [])

  const handleQuickQuestion = useCallback((question: string, category?: string | null) => {
    if (category && category !== contextCategory) {
      setContextCategory(category)
    }
    handleSend(question)
  }, [contextCategory, handleSend])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <section className="section-sm pt-8 pb-4 relative overflow-hidden bg-hero-pattern">
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
            <span className="badge-primary mb-4 flex items-center justify-center gap-2 mx-auto">
              <Sparkles className="w-4 h-4" />
              AI Assistant
            </span>
            <h1 className="font-display text-display-md text-charcoal-900 dark:text-white mb-4 text-balance">
              Ask Anything About E-Waste
            </h1>
            <p className="text-body-lg text-charcoal-600 dark:text-charcoal-400 max-w-xl mx-auto text-balance">
              Powered by Gemini 2.5 Flash with curated knowledge base fallback. Get instant answers about recycling, disposal, regulations, and more.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Context Banner */}
        {contextCategory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mx-4 mt-4 mb-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-body-sm text-emerald-800 dark:text-emerald-200 font-medium">
                  Active Context: <strong>{contextCategory}</strong>
                </span>
              </div>
              <button
                onClick={() => setContextCategory(null)}
                className="p-1 text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
                aria-label="Clear context"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mb-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <span className="text-body-sm text-red-800 dark:text-red-200 flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="p-1 text-red-600 hover:text-red-800 dark:hover:text-red-300 transition-colors"
              aria-label="Dismiss error"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Messages */}
        <div className="flex-1 min-h-0">
          <MessageList
            messages={messages}
            onCopy={handleCopy}
          />
          <div ref={messagesEndRef} />

          {/* Typing Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 pb-2 flex items-center gap-2 text-charcoal-500 dark:text-charcoal-400"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-forest-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-1.5 px-4 py-2 bg-charcoal-100 dark:bg-charcoal-800 rounded-2xl">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span className="text-body-sm">AI is thinking...</span>
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  .
                </motion.span>
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.15 }}
                >
                  .
                </motion.span>
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                >
                  .
                </motion.span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Quick Questions Panel */}
        {showQuickQuestions && messages.length === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mx-4 mb-4 p-4 rounded-2xl bg-charcoal-50 dark:bg-charcoal-900/50 border border-charcoal-200 dark:border-charcoal-800"
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-display text-heading-sm text-charcoal-900 dark:text-white">Quick Questions</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, i) => (
                <motion.button
                  key={q.text}
                  onClick={() => handleQuickQuestion(q.text, q.category)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="btn-ghost btn-sm px-3 py-1.5 text-left min-w-0"
                  style={{ maxWidth: '100%' }}
                >
                  <span className="truncate">{q.text}</span>
                  {q.category && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded">
                      {q.category}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
            <button
              onClick={() => setShowQuickQuestions(false)}
              className="text-caption text-charcoal-500 dark:text-charcoal-500 hover:text-charcoal-700 dark:hover:text-charcoal-300 mt-3 inline-flex items-center gap-1"
            >
              Hide suggestions <RotateCcw className="w-3 h-3" />
            </button>
          </motion.div>
        )}

        {/* Input */}
        <ChatInput
          onSend={handleSend}
          disabled={isLoading}
          placeholder={contextCategory ? `Ask about ${contextCategory} recycling...` : 'Ask about e-waste recycling...'}
        />
      </div>

      {/* Footer Actions */}
      <div className="border-t border-charcoal-200 dark:border-charcoal-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl">
        <div className="container px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-caption text-charcoal-500 dark:text-charcoal-500">
            <span className="flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-emerald-600" />
              Gemini 2.5 Flash
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-600" />
              Knowledge Base Fallback
            </span>
            {contextCategory && (
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-600" />
                Context: {contextCategory}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              className="btn-ghost btn-sm text-charcoal-600 dark:text-charcoal-400 hover:text-red-600 dark:hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}