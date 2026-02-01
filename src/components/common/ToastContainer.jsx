/**
 * Composant Toast container
 */

import { createPortal } from 'react-dom'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { cn } from '../../utils/helpers'

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const styles = {
  success: 'bg-success-light dark:bg-green-900/80 text-success-dark dark:text-green-200 border-success',
  error: 'bg-danger-light dark:bg-red-900/80 text-danger-dark dark:text-red-200 border-danger',
  warning: 'bg-warning-light dark:bg-amber-900/80 text-warning-dark dark:text-amber-200 border-warning',
  info: 'bg-primary-50 dark:bg-primary-900/80 text-primary-800 dark:text-primary-200 border-primary-500',
}

const ToastItem = ({ toast, onRemove }) => {
  const Icon = icons[toast.type]

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border shadow-soft-lg',
        'animate-slide-up',
        styles[toast.type]
      )}
      role="alert"
    >
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />

      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="font-semibold text-sm">{toast.title}</p>
        )}
        <p className={cn('text-sm', toast.title && 'mt-0.5 opacity-90')}>
          {toast.message}
        </p>

        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-sm font-medium underline hover:no-underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={() => onRemove(toast.id)}
        className="p-1 -m-1 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Fermer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

const ToastContainer = () => {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return createPortal(
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>,
    document.body
  )
}

export default ToastContainer