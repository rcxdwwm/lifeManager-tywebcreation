/**
 * Composant CategorySection - Section de catégorie avec produits
 * Header flottant visible pendant le scroll
 */

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronUp, Plus, ArrowDown } from 'lucide-react'
import { cn } from '../../../utils/helpers'
import ProductItem from './ProductItem'

const CategorySection = ({
  category,
  products,
  customProducts = [],
  cartItems = [],
  onToggleCart,
  onUpdateQuantity,
  onUpdateUnit,
  onAddCustomProduct,
  defaultExpanded = false,
  onNextCategory,
  isLast = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProductName, setNewProductName] = useState('')
  const [showFloatingHeader, setShowFloatingHeader] = useState(false)
  
  const sectionRef = useRef(null)
  const headerRef = useRef(null)

  // Combiner produits par défaut et personnalisés
  const allProducts = [
    ...products,
    ...customProducts.filter((p) => p.categoryId === category.id),
  ]

  // Compter combien de produits sont dans le panier pour cette catégorie
  const inCartCount = allProducts.filter((p) =>
    cartItems.some((item) => item.productId === p.id)
  ).length

  // Détecter quand le header original n'est plus visible
  useEffect(() => {
    if (!isExpanded) {
      setShowFloatingHeader(false)
      return
    }

    const handleScroll = () => {
      if (!headerRef.current || !sectionRef.current) return

      const headerRect = headerRef.current.getBoundingClientRect()
      const sectionRect = sectionRef.current.getBoundingClientRect()
      
      const shouldShow = headerRect.bottom < 64 && sectionRect.bottom > 150
      
      setShowFloatingHeader(shouldShow)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [isExpanded])

  const handleAddProduct = (e) => {
    e.preventDefault()
    if (newProductName.trim()) {
      onAddCustomProduct({
        name: newProductName.trim(),
        categoryId: category.id,
      })
      setNewProductName('')
      setShowAddForm(false)
    }
  }

  const handleNextCategory = () => {
    setIsExpanded(false)
    setShowFloatingHeader(false)
    if (onNextCategory) {
      setTimeout(() => onNextCategory(), 100)
    }
  }

  const handleClose = () => {
    setIsExpanded(false)
    setShowFloatingHeader(false)
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <>
      {/* Header flottant fixe */}
      {showFloatingHeader && (
        <div className="fixed top-16 left-0 right-0 z-30 px-4 lg:pl-72 animate-slide-down">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-surface-800 rounded-xl shadow-lg border border-surface-200 dark:border-surface-700 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{category.icon}</span>
                  <div>
                    <h3 className="font-semibold text-surface-900 dark:text-surface-100 text-sm">
                      {category.label}
                    </h3>
                    <p className="text-xs text-surface-500">
                      {inCartCount > 0 ? (
                        <span className="text-primary-600 dark:text-primary-400 font-medium">
                          {inCartCount} sélectionné{inCartCount > 1 ? 's' : ''}
                        </span>
                      ) : (
                        'Aucun sélectionné'
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isLast && (
                    <button
                      onClick={handleNextCategory}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                    >
                      Suivant
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={handleClose}
                    className="p-1.5 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
                    aria-label="Fermer"
                  >
                    <ChevronUp className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section principale */}
      <div ref={sectionRef} className="bg-white dark:bg-surface-800 rounded-xl overflow-hidden shadow-soft">
        {/* Header catégorie cliquable */}
        <div ref={headerRef}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between p-4 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{category.icon}</span>
              <div className="text-left">
                <h3 className="font-semibold text-surface-900 dark:text-surface-100">
                  {category.label}
                </h3>
                <p className="text-sm text-surface-500 dark:text-surface-400">
                  {allProducts.length} produit{allProducts.length > 1 ? 's' : ''}
                  {inCartCount > 0 && (
                    <span className="text-primary-600 dark:text-primary-400 ml-2">
                      • {inCartCount} sélectionné{inCartCount > 1 ? 's' : ''}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {inCartCount > 0 && (
                <span className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-medium flex items-center justify-center">
                  {inCartCount}
                </span>
              )}
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-surface-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-surface-400" />
              )}
            </div>
          </button>
        </div>

        {/* Liste des produits */}
        {isExpanded && (
          <div className="px-4 pb-4 space-y-2">
            {/* Grille de produits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allProducts.map((product) => {
                const cartItem = cartItems.find((item) => item.productId === product.id)
                return (
                  <ProductItem
                    key={product.id}
                    product={product}
                    isInCart={Boolean(cartItem)}
                    quantity={cartItem?.quantity || 1}
                    unit={cartItem?.unit || ''}
                    onToggleCart={() => onToggleCart(product)}
                    onUpdateQuantity={(qty) => onUpdateQuantity(product.id, qty)}
                    onUpdateUnit={(unit) => onUpdateUnit(product.id, unit)}
                    variant="selector"
                  />
                )
              })}
            </div>

            {/* Bouton ajouter un produit */}
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-lg text-surface-500 dark:text-surface-400 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Ajouter un produit
              </button>
            ) : (
              <form onSubmit={handleAddProduct} className="flex gap-2">
                <input
                  type="text"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Nom du produit..."
                  className="flex-1 px-3 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-300 dark:border-surface-600 rounded-lg text-surface-900 dark:text-surface-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Ajouter
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setNewProductName('')
                  }}
                  className="px-4 py-2 bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-lg hover:bg-surface-300 dark:hover:bg-surface-600 transition-colors"
                >
                  Annuler
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default CategorySection