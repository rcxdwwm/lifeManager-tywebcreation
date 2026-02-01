/**
 * Composant StarRating pour les notes 1-5
 */

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '../../utils/helpers'

const StarRating = ({
  value = 0,
  onChange,
  readonly = false,
  size = 'md',
  className = '',
}) => {
  const [hoverValue, setHoverValue] = useState(0)

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const handleClick = (rating) => {
    if (readonly) return
    // Toggle: si on clique sur la même note, on la désélectionne
    onChange?.(rating === value ? 0 : rating)
  }

  const handleMouseEnter = (rating) => {
    if (readonly) return
    setHoverValue(rating)
  }

  const handleMouseLeave = () => {
    setHoverValue(0)
  }

  const displayValue = hoverValue || value

  return (
    <div
      className={cn('inline-flex gap-1', className)}
      onMouseLeave={handleMouseLeave}
      role="group"
      aria-label={`Note: ${value} sur 5`}
    >
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => handleClick(rating)}
          onMouseEnter={() => handleMouseEnter(rating)}
          disabled={readonly}
          className={cn(
            'transition-all duration-150',
            !readonly && 'hover:scale-110 cursor-pointer',
            readonly && 'cursor-default'
          )}
          aria-label={`${rating} étoile${rating > 1 ? 's' : ''}`}
        >
          <Star
            className={cn(
              sizes[size],
              'transition-colors duration-150',
              rating <= displayValue
                ? 'fill-amber-400 text-amber-400'
                : 'fill-transparent text-surface-300 dark:text-surface-600'
            )}
          />
        </button>
      ))}
    </div>
  )
}

export default StarRating