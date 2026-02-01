/**
 * Composant Checkbox réutilisable
 */

import { forwardRef } from 'react'
import { Check } from 'lucide-react'
import { cn } from '../../utils/helpers'

const Checkbox = forwardRef(
  ({ label, checked, onChange, className = '', disabled = false, ...props }, ref) => {
    return (
      <label
        className={cn(
          'inline-flex items-center gap-3 cursor-pointer select-none',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          <div
            className={cn(
              'w-5 h-5 border-2 rounded transition-all duration-200',
              'border-surface-300 dark:border-surface-600',
              'peer-checked:border-primary-600 peer-checked:bg-primary-600',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 peer-focus-visible:ring-offset-2'
            )}
          />
          <Check
            className={cn(
              'absolute top-0.5 left-0.5 w-4 h-4 text-white',
              'transition-all duration-200',
              checked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            )}
          />
        </div>

        {label && (
          <span className="text-surface-700 dark:text-surface-300">{label}</span>
        )}
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export default Checkbox