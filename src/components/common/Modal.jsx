/**
 * Composant Modal réutilisable
 */

import { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../utils/helpers'
import Button from './Button'

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[calc(100vw-2rem)]',
}

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  showClose = true,
  closeOnOverlay = true,
  closeOnEscape = true,
  className = '',
}) => {
  // Gérer la touche Escape
  const handleEscape = useCallback(
    (e) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose()
      }
    },
    [onClose, closeOnEscape]
  )

  // Bloquer le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, handleEscape])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={closeOnOverlay ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Container centré */}
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Modal */}
        <div
          className={cn(
            'relative w-full bg-white dark:bg-surface-800 rounded-2xl shadow-soft-lg',
            'animate-scale-in',
            sizes[size],
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showClose) && (
            <div className="flex items-start justify-between p-6 pb-0">
              <div>
                {title && (
                  <h2
                    id="modal-title"
                    className="text-xl font-display font-semibold text-surface-900 dark:text-surface-100"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
                    {description}
                  </p>
                )}
              </div>

              {showClose && (
                <button
                  onClick={onClose}
                  className="p-2 -m-2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700"
                  aria-label="Fermer"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 p-6 pt-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

// Composant pour les footers de modal courants
Modal.Footer = ({ onCancel, onConfirm, cancelText = 'Annuler', confirmText = 'Confirmer', confirmVariant = 'primary', isLoading = false }) => (
  <>
    <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
      {cancelText}
    </Button>
    <Button variant={confirmVariant} onClick={onConfirm} isLoading={isLoading}>
      {confirmText}
    </Button>
  </>
)

export default Modal