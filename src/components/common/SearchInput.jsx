/**
 * Composant SearchInput avec debounce intégré
 */

import { useState, useEffect, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '../../utils/helpers'

const SearchInput = ({
  value,
  onChange,
  placeholder = 'Rechercher...',
  debounceMs = 300,
  className = '',
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value || '')

  // Sync avec la valeur externe
  useEffect(() => {
    setInternalValue(value || '')
  }, [value])

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onChange && internalValue !== value) {
        onChange(internalValue)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [internalValue, debounceMs, onChange, value])

  const handleClear = useCallback(() => {
    setInternalValue('')
    onChange?.('')
  }, [onChange])

  return (
    <div className={cn('relative', className)}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
        <Search className="h-5 w-5" />
      </div>

      <input
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className="input pl-10 pr-10"
        {...props}
      />

      {internalValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
          aria-label="Effacer la recherche"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}

export default SearchInput