import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

// Use relative URLs to go through Vite proxy
export const api = axios.create({
  baseURL: '',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('[API Response Interceptor]', response.status, response.config.url)
    return response
  },
  (error: AxiosError) => {
    console.error('[API Error]', error.response?.status, error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Types matching backend exactly
export interface PredictionResponse {
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

export interface ComparisonResponse {
  results: Record<string, {
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
  }>
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface ChatRequest {
  message: string
  history?: ChatMessage[]
  context_category?: string
}

export interface ChatResponse {
  response: string
  source: 'gemini' | 'knowledge_base'
  context_used?: string
}

export interface GuideCategory {
  category: string
  icon: string
  hazards: string[]
  materials: string[]
  process: string
  disposal: string
  reuse: string
  donation: string
  repair: string
  safety: string
  steps: string[]
}

export interface ModelInfo {
  id: string
  display_name: string
  accuracy: number
  description: string
  preprocess: string
}

export interface ModelsResponse {
  models: ModelInfo[]
  default: string
}

export interface HealthResponse {
  status: string
  models_loaded: number
  gemini_configured: boolean
}

// API Functions
export const predictApi = {
  single: (file: File, model: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('model', model)
    return api.post<PredictionResponse>('/api/predict', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  compare: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<ComparisonResponse>('/api/predict/compare', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export const chatApi = {
  send: (message: string, history?: ChatMessage[], contextCategory?: string) =>
    api.post<ChatResponse>('/api/chat', { message, history, context_category: contextCategory }),
}

export const guideApi = {
  getAll: () => api.get<{ categories: string[] }>('/api/guide'),
  getCategory: (category: string) => api.get<GuideCategory>(`/api/guide/${encodeURIComponent(category)}`),
}

export const modelsApi = {
  getAll: () => api.get<ModelsResponse>('/api/models'),
}

export const healthApi = {
  check: () => api.get<HealthResponse>('/api/health'),
}