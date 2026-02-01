/**
 * Composant Card réutilisable
 */

import { cn } from '../../utils/helpers'

const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'default',
  onClick,
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={cn(
        'card',
        hover && 'card-hover cursor-pointer',
        paddingClasses[padding],
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick(e)
              }
            }
          : undefined
      }
      {...props}
    >
      {children}
    </div>
  )
}

// Header de carte
Card.Header = ({ children, className = '' }) => (
  <div
    className={cn(
      'flex items-center justify-between pb-4 mb-4 border-b border-surface-200 dark:border-surface-700',
      className
    )}
  >
    {children}
  </div>
)

// Titre de carte
Card.Title = ({ children, className = '' }) => (
  <h3
    className={cn(
      'text-lg font-display font-semibold text-surface-900 dark:text-surface-100',
      className
    )}
  >
    {children}
  </h3>
)

// Description de carte
Card.Description = ({ children, className = '' }) => (
  <p className={cn('text-sm text-surface-500 dark:text-surface-400', className)}>
    {children}
  </p>
)

// Contenu de carte
Card.Content = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
)

// Footer de carte
Card.Footer = ({ children, className = '' }) => (
  <div
    className={cn(
      'flex items-center justify-end gap-3 pt-4 mt-4 border-t border-surface-200 dark:border-surface-700',
      className
    )}
  >
    {children}
  </div>
)

export default Card