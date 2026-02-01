/**
 * Composant Badge réutilisable
 */

import { cn } from '../../utils/helpers'

const variants = {
  primary: 'badge-primary',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  neutral: 'badge-neutral',
  accent: 'bg-accent-100 dark:bg-accent-900/50 text-accent-700 dark:text-accent-300',
}

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
}

const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) => {
  return (
    <span
      className={cn('badge', variants[variant], sizes[size], className)}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full mr-1.5',
            variant === 'primary' && 'bg-primary-500',
            variant === 'success' && 'bg-success',
            variant === 'warning' && 'bg-warning',
            variant === 'danger' && 'bg-danger',
            variant === 'neutral' && 'bg-surface-400',
            variant === 'accent' && 'bg-accent-500'
          )}
        />
      )}
      {children}
    </span>
  )
}

export default Badge