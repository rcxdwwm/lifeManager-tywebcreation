/**
 * Composant Textarea réutilisable
 */

import { forwardRef } from 'react'
import { cn } from '../../utils/helpers'

const Textarea = forwardRef(
  (
    {
      label,
      error,
      helperText,
      className = '',
      containerClassName = '',
      rows = 4,
      maxLength,
      showCount = false,
      ...props
    },
    ref
  ) => {
    const hasError = Boolean(error)
    const currentLength = props.value?.length || 0

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label className="label" htmlFor={props.id || props.name}>
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          rows={rows}
          maxLength={maxLength}
          className={cn(
            'input resize-none',
            hasError && 'input-error',
            className
          )}
          {...props}
        />

        <div className="flex justify-between mt-1.5">
          {(error || helperText) && (
            <p
              className={cn(
                'text-sm',
                hasError ? 'text-danger' : 'text-surface-500'
              )}
            >
              {error || helperText}
            </p>
          )}

          {showCount && maxLength && (
            <p
              className={cn(
                'text-sm text-surface-400 ml-auto',
                currentLength >= maxLength && 'text-danger'
              )}
            >
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export default Textarea