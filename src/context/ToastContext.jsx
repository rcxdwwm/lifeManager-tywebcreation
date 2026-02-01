/**
 * Contexte de notifications Toast
 */

import { createContext, useContext, useCallback, useState } from 'react'
import { generateId } from '../utils/helpers'

const ToastContext = createContext(null)

// Durées par défaut selon le type
const DEFAULT_DURATIONS = {
  success: 3000,
  error: 5000,
  warning: 4000,
  info: 3000,
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  // Ajouter un toast
  const addToast = useCallback(
    ({ type = 'info', title, message, duration = null, action = null }) => {
      const id = generateId()
      const toast = {
        id,
        type,
        title,
        message,
        action,
        createdAt: Date.now(),
      }

      setToasts((prev) => [...prev, toast])

      // Auto-dismiss
      const timeout = duration || DEFAULT_DURATIONS[type] || 3000
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, timeout)

      return id
    },
    []
  )

  // Supprimer un toast
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Supprimer tous les toasts
  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  // Helpers pour les types courants
  const toast = {
    success: (message, options = {}) =>
      addToast({ type: 'success', message, ...options }),
    error: (message, options = {}) =>
      addToast({ type: 'error', message, ...options }),
    warning: (message, options = {}) =>
      addToast({ type: 'warning', message, ...options }),
    info: (message, options = {}) =>
      addToast({ type: 'info', message, ...options }),
  }

  const value = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    toast,
  }

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast doit être utilisé dans un ToastProvider')
  }
  return context
}

export default ToastContext