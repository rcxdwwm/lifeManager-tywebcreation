/**
 * Composant Input réutilisable
 */

import { forwardRef } from 'react'
import { cn } from '../../utils/helpers'

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      className = '',
      containerClassName = '',
      type = 'text',
      ...props
    },
    ref
  ) => {
    const hasError = Boolean(error)

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label className="label" htmlFor={props.id || props.name}>
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {LeftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
              <LeftIcon className="h-5 w-5" />
            </div>
          )}

          <input
            ref={ref}
            type={type}
            className={cn(
              'input',
              hasError && 'input-error',
              LeftIcon && 'pl-10',
              RightIcon && 'pr-10',
              className
            )}
            {...props}
          />

          {RightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400">
              <RightIcon className="h-5 w-5" />
            </div>
          )}
        </div>

        {(error || helperText) && (
          <p
            className={cn(
              'mt-1.5 text-sm',
              hasError ? 'text-danger' : 'text-surface-500'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input