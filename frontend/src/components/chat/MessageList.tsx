import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Loader2, Sparkles, Brain, BookOpen } from 'lucide-react'
import { cn } from '../../utils/cn'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  source?: 'gemini' | 'knowledge_base'
  isStreaming?: boolean
}

interface MessageListProps {
  messages: ChatMessage[]
  onCopy?: (content: string) => void
}

const markdownComponents = {
  p: ({ children, ...props }: any) => <p {...props} className="mb-2 last:mb-0 whitespace-pre-wrap break-words">{children}</p>,
  strong: ({ children, ...props }: any) => <strong {...props} className="font-semibold">{children}</strong>,
  em: ({ children, ...props }: any) => <em {...props} className="italic">{children}</em>,
  code: ({ children, ...props }: any) => <code {...props} className="bg-charcoal-100 dark:bg-charcoal-800 px-1.5 py-0.5 rounded text-sm font-mono text-emerald-700 dark:text-emerald-300">{children}</code>,
  pre: ({ children, ...props }: any) => <pre {...props} className="bg-charcoal-900 dark:bg-charcoal-950 p-3 rounded-xl overflow-x-auto mb-2"><code className="text-charcoal-100 dark:text-charcoal-100 text-sm font-mono">{children.props.children}</code></pre>,
  ul: ({ children, ...props }: any) => <ul {...props} className="list-disc list-inside space-y-1 mb-2 ml-2">{children}</ul>,
  ol: ({ children, ...props }: any) => <ol {...props} className="list-decimal list-inside space-y-1 mb-2 ml-2">{children}</ol>,
  li: ({ children, ...props }: any) => <li {...props} className="whitespace-pre-wrap break-words">{children}</li>,
  blockquote: ({ children, ...props }: any) => <blockquote {...props} className="border-l-4 border-emerald-500 pl-4 italic text-charcoal-600 dark:text-charcoal-400 my-2">{children}</blockquote>,
  a: ({ children, href, ...props }: any) => <a href={href} {...props} className="text-emerald-600 dark:text-emerald-400 underline hover:text-emerald-700 dark:hover:text-emerald-300" target="_blank" rel="noopener noreferrer">{children}</a>,
  hr: () => <hr className="border-charcoal-200 dark:border-charcoal-700 my-3" />,
}

export default function MessageList({ messages, onCopy }: MessageListProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite" aria-label="Chat messages">
      <AnimatePresence>
        {messages.map((message, index) => (
          <motion.div
            key={`${message.role}-${index}-${message.timestamp}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'flex gap-3',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {/* Assistant Avatar */}
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-forest-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
            )}

            <div className={cn(
              'max-w-[75%] sm:max-w-[85%]',
              message.role === 'user' ? 'order-2' : 'order-1'
            )}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  'chat-bubble relative',
                  message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'
                )}
              >
                {message.role === 'user' ? (
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                ) : (
                  <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                )}

                {/* Source badge */}
                {message.role === 'assistant' && message.source && (
                  <div className={cn(
                    'absolute bottom-full right-0 mb-1.5 px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1',
                    message.source === 'gemini'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-600 text-white'
                  )}>
                    {message.source === 'gemini' ? <Brain className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
                    {message.source === 'gemini' ? 'Gemini 2.5 Flash' : 'Knowledge Base'}
                  </div>
                )}

                {/* Streaming indicator */}
                {message.isStreaming && (
                  <motion.span
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="inline-flex items-center gap-1 text-xs opacity-70"
                  >
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Thinking...</span>
                  </motion.span>
                )}
              </motion.div>

              {/* Message meta */}
              <div className="flex items-center gap-2 mt-1.5 px-1">
                <time className="text-caption text-charcoal-400 dark:text-charcoal-500" dateTime={message.timestamp}>
                  {formatTime(message.timestamp)}
                </time>
                {message.role === 'assistant' && !message.isStreaming && onCopy && (
                  <button
                    onClick={() => onCopy(message.content)}
                    className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
                    aria-label="Copy message"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* User Avatar */}
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-charcoal-200 dark:bg-charcoal-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-body-sm font-medium text-charcoal-600 dark:text-charcoal-400">You</span>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Scroll anchor */}
      <div id="chat-bottom" />
    </div>
  )
}