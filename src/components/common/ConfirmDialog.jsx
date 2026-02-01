/**
 * Composant ConfirmDialog pour les confirmations
 */

import { AlertTriangle, Info, AlertCircle } from 'lucide-react'
import Modal from './Modal'
import { cn } from '../../utils/helpers'

const icons = {
  danger: AlertTriangle,
  warning: AlertCircle,
  info: Info,
}

const iconStyles = {
  danger: 'text-danger bg-danger-light dark:bg-red-900/30',
  warning: 'text-warning bg-warning-light dark:bg-amber-900/30',
  info: 'text-primary-600 bg-primary-50 dark:bg-primary-900/30',
}

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmation',
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'danger',
  isLoading = false,
}) => {
  const Icon = icons[variant]

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showClose={false}>
      <div className="flex flex-col items-center text-center">
        <div
          className={cn(
            'w-14 h-14 rounded-full flex items-center justify-center mb-4',
            iconStyles[variant]
          )}
        >
          <Icon className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-display font-semibold text-surface-900 dark:text-surface-100 mb-2">
          {title}
        </h3>

        <p className="text-surface-600 dark:text-surface-400 mb-6">{message}</p>

        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 btn btn-md btn-secondary"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              'flex-1 btn btn-md',
              variant === 'danger' && 'btn-danger',
              variant === 'warning' && 'btn-primary',
              variant === 'info' && 'btn-primary'
            )}
          >
            {isLoading ? 'Chargement...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmDialog