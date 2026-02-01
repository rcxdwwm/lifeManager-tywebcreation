/**
 * Composant ProductItem - Produit avec checkbox et sélecteurs unité/quantité
 */

import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown, Delete } from 'lucide-react'
import { cn } from '../../../utils/helpers'

// Options d'unités
const UNIT_OPTIONS = [
  { value: '', label: '-' },
  { value: 'piece', label: 'pièce(s)' },
  { value: 'boite', label: 'boîte' },
  { value: 'barquette', label: 'barquette' },
  { value: 'sachet', label: 'sachet' },
  { value: 'filet', label: 'filet' },
  { value: 'bouteille', label: 'bouteille' },
  { value: 'pack', label: 'pack' },
  { value: 'pot', label: 'pot' },
  { value: 'g', label: 'g' },
  { value: 'kg', label: 'kg' },
  { value: 'ml', label: 'ml' },
  { value: 'cl', label: 'cl' },
  { value: 'L', label: 'L' },
]

const ProductItem = ({ 
  product, 
  isInCart = false, 
  isChecked = false, 
  quantity = 1,
  unit = '',
  onToggleCart, 
  onToggleChecked,
  onUpdateQuantity,
  onUpdateUnit,
  variant = 'selector' // 'selector' | 'cart' | 'shopping'
}) => {
  const [showOptions, setShowOptions] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const dropdownRef = useRef(null)

  // Synchroniser inputValue avec quantity
  useEffect(() => {
    setInputValue(String(quantity))
  }, [quantity])

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Sauvegarder la valeur avant de fermer
        const numValue = parseInt(inputValue, 10)
        if (!isNaN(numValue) && numValue > 0) {
          onUpdateQuantity(numValue)
        }
        setShowOptions(false)
      }
    }

    if (showOptions) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showOptions, inputValue, onUpdateQuantity])

  // Gérer l'appui sur une touche du clavier
  const handleKeyPress = (key) => {
    if (key === 'C') {
      // Effacer tout
      setInputValue('')
    } else if (key === '⌫') {
      // Supprimer le dernier caractère
      setInputValue((prev) => prev.slice(0, -1) || '')
    } else {
      // Ajouter le chiffre
      setInputValue((prev) => {
        const newValue = prev + key
        // Limiter à 4 chiffres max
        if (newValue.length > 4) return prev
        return newValue
      })
    }
  }

  // Valider et fermer
  const handleValidate = () => {
    const numValue = parseInt(inputValue, 10)
    if (!isNaN(numValue) && numValue > 0) {
      onUpdateQuantity(numValue)
    } else if (inputValue === '') {
      // Si vide, garder la quantité actuelle
      // Ne rien faire
    } else {
      onUpdateQuantity(1)
    }
    setShowOptions(false)
  }

  // Formater l'affichage de la quantité
  const formatQuantityDisplay = () => {
    const unitLabel = unit ? UNIT_OPTIONS.find(u => u.value === unit)?.label || '' : ''
    
    if (quantity === 1 && !unit) {
      return ''
    }
    
    if (quantity === 1 && unit) {
      return `1 ${unitLabel}`
    }
    
    return `${quantity} ${unitLabel}`.trim()
  }

  const quantityDisplay = formatQuantityDisplay()
  
  if (variant === 'shopping') {
    // Mode courses : checkbox pour cocher au fur et à mesure
    return (
      <button
        onClick={onToggleChecked}
        className={cn(
          'w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left',
          isChecked
            ? 'bg-success-light dark:bg-green-900/30'
            : 'bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700'
        )}
      >
        <div
          className={cn(
            'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
            isChecked
              ? 'bg-success border-success text-white'
              : 'border-surface-300 dark:border-surface-600'
          )}
        >
          {isChecked && <Check className="h-4 w-4" />}
        </div>
        <span className={cn(
          'flex-1 text-surface-900 dark:text-surface-100',
          isChecked && 'line-through text-surface-500 dark:text-surface-400'
        )}>
          {product.name}
        </span>
        {quantityDisplay && (
          <span className={cn(
            'text-sm font-medium',
            isChecked 
              ? 'text-surface-400 dark:text-surface-500' 
              : 'text-primary-600 dark:text-primary-400'
          )}>
            {quantityDisplay}
          </span>
        )}
      </button>
    )
  }

  if (variant === 'cart') {
    // Mode panier : affiche avec conditionnement et quantité
    return (
      <div className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
        <button
          onClick={onToggleCart}
          className="w-6 h-6 rounded-full bg-danger/10 text-danger hover:bg-danger/20 flex items-center justify-center flex-shrink-0 transition-colors"
          aria-label="Retirer du panier"
        >
          <Delete className="h-3 w-3" />
        </button>
        
        <span className="flex-1 text-surface-900 dark:text-surface-100">
          {product.name}
        </span>
        
        {quantityDisplay && (
          <span className="text-sm text-primary-600 dark:text-primary-400 font-medium bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded">
            {quantityDisplay}
          </span>
        )}
      </div>
    )
  }

  // Mode sélection : bouton pour ajouter/retirer du panier avec options
  return (
    <div
      ref={dropdownRef}
      className={cn(
        'relative flex items-center gap-2 p-3 rounded-lg transition-all',
        isInCart
          ? 'bg-primary-50 dark:bg-primary-900/30 border-2 border-primary-500'
          : 'bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 border-2 border-transparent'
      )}
    >
      {/* Checkbox pour ajouter/retirer */}
      <button
        onClick={() => {
          if (!isInCart) {
            onToggleCart()
            setShowOptions(true)
            setInputValue('')
          } else {
            onToggleCart()
            setShowOptions(false)
          }
        }}
        className="flex items-center gap-3 flex-1 text-left min-w-0"
      >
        <div
          className={cn(
            'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
            isInCart
              ? 'bg-primary-500 border-primary-500 text-white'
              : 'border-surface-300 dark:border-surface-600'
          )}
        >
          {isInCart && <Check className="h-4 w-4" />}
        </div>
        <span className={cn(
          'flex-1 truncate',
          isInCart 
            ? 'text-primary-700 dark:text-primary-300 font-medium' 
            : 'text-surface-900 dark:text-surface-100'
        )}>
          {product.name}
        </span>
      </button>

      {/* Affichage quantité + bouton pour ouvrir options */}
      {isInCart && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowOptions(!showOptions)
            setInputValue('')
          }}
          className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-surface-700 rounded-md text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/50 transition-colors flex-shrink-0"
        >
          {quantityDisplay || '1'}
          <ChevronDown className={cn(
            'h-3 w-3 transition-transform',
            showOptions && 'rotate-180'
          )} />
        </button>
      )}

      {/* Dropdown options avec clavier numérique */}
      {isInCart && showOptions && (
        <>
          {/* Overlay pour fermer en cliquant dehors */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => {
              const numValue = parseInt(inputValue, 10)
              if (!isNaN(numValue) && numValue > 0) {
                onUpdateQuantity(numValue)
              }
              setShowOptions(false)
            }}
          />
          {/* Clavier numérique - centré à l'écran */}
          <div 
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-surface-800 rounded-xl shadow-2xl border border-surface-200 dark:border-surface-700 p-4 w-[280px] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Titre avec nom du produit */}
            <div className="text-center mb-3 pb-3 border-b border-surface-200 dark:border-surface-700">
              <p className="font-medium text-surface-900 dark:text-surface-100 truncate">
                {product.name}
              </p>
            </div>

            {/* Sélecteur d'unité */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5">
                Conditionnement
              </label>
              <select
                value={unit}
                onChange={(e) => {
                  onUpdateUnit(e.target.value)
                }}
                className="w-full px-3 py-2.5 bg-surface-50 dark:bg-surface-900 border border-surface-300 dark:border-surface-600 rounded-lg text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {UNIT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Affichage de la quantité saisie */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5">
                Quantité
              </label>
              <div className="bg-surface-100 dark:bg-surface-900 rounded-lg px-4 py-3 text-center">
                <span className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                  {inputValue || '0'}
                </span>
                {unit && (
                  <span className="text-lg text-surface-500 dark:text-surface-400 ml-2">
                    {UNIT_OPTIONS.find(u => u.value === unit)?.label || ''}
                  </span>
                )}
              </div>
            </div>

            {/* Clavier numérique */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKeyPress(key)}
                  className={cn(
                    'py-3 rounded-lg text-lg font-semibold transition-colors',
                    key === 'C'
                      ? 'bg-warning/20 text-warning hover:bg-warning/30'
                      : key === '⌫'
                      ? 'bg-danger/10 text-danger hover:bg-danger/20'
                      : 'bg-surface-100 dark:bg-surface-700 text-surface-900 dark:text-surface-100 hover:bg-surface-200 dark:hover:bg-surface-600 active:bg-surface-300'
                  )}
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Raccourcis rapides */}
            <div className="flex gap-2 mb-4">
              {[1, 2, 5, 10, 100, 500].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setInputValue(String(val))}
                  className={cn(
                    'flex-1 py-1.5 rounded-md text-xs font-medium transition-colors',
                    parseInt(inputValue, 10) === val
                      ? 'bg-primary-500 text-white'
                      : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-600'
                  )}
                >
                  {val}
                </button>
              ))}
            </div>

            {/* Bouton Valider */}
            <button
              type="button"
              onClick={handleValidate}
              className="w-full py-3 bg-primary-500 text-white rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors"
            >
              Valider
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default ProductItem
