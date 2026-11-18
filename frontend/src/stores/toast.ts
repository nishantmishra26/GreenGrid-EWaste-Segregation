import { create } from 'zustand'

interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  title?: string
  message: string
  duration?: number
  pause?: () => void
  resume?: () => void
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearToasts: () => void
}

let toastId = 0

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${++toastId}-${Date.now()}`
    let pauseTimer: NodeJS.Timeout | null = null
    let resumeTimer: NodeJS.Timeout | null = null

    const newToast: Toast = {
      ...toast,
      id,
      pause: () => {
        if (pauseTimer) clearTimeout(pauseTimer)
      },
      resume: () => {
        if (toast.duration) {
          pauseTimer = setTimeout(() => {
            get().removeToast(id)
          }, toast.duration)
        }
      },
    }

    set((state) => ({ toasts: [...state.toasts, newToast] }))

    // Auto-remove after duration
    if (toast.duration) {
      resumeTimer = setTimeout(() => {
        get().removeToast(id)
      }, toast.duration)
    }

    return id
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },

  clearToasts: () => {
    set({ toasts: [] })
  },
}))

// Helper functions for easy usage
export const toast = {
  success: (message: string, title?: string, duration = 4000) =>
    useToastStore.getState().addToast({ type: 'success', message, title, duration }),
  error: (message: string, title?: string, duration = 6000) =>
    useToastStore.getState().addToast({ type: 'error', message, title, duration }),
  info: (message: string, title?: string, duration = 4000) =>
    useToastStore.getState().addToast({ type: 'info', message, title, duration }),
}