/**
 * Composant ShoppingMode - Mode courses plein écran
 */

import { useState, useMemo } from 'react'
import { X, Check, RotateCcw, Share2 } from 'lucide-react'
import { Button, Badge } from '../../../components/common'
import { SHOPPING_CATEGORIES } from '../data/defaultProducts'
import ProductItem from './ProductItem'

const ShoppingMode = ({
  cartItems = [],
  checkedItems = [],
  onToggleChecked,
  onClose,
  onShare,
  onReset,
}) => {
  const [filter, setFilter] = useState('all') // 'all' | 'remaining' | 'checked'

  // Grouper par catégorie
  const itemsByCategory = useMemo(() => {
    let items = cartItems

    // Filtrer si nécessaire
    if (filter === 'remaining') {
      items = items.filter((item) => !checkedItems.includes(item.productId))
    } else if (filter === 'checked') {
      items = items.filter((item) => checkedItems.includes(item.productId))
    }

    return items.reduce((acc, item) => {
      const categoryId = item.categoryId || 'other'
      if (!acc[categoryId]) {
        acc[categoryId] = []
      }
      acc[categoryId].push(item)
      return acc
    }, {})
  }, [cartItems, checkedItems, filter])

  const totalItems = cartItems.length
  const checkedCount = checkedItems.length
  const remainingCount = totalItems - checkedCount
  const progress = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0

  return (
    <div className="fixed inset-0 z-50 bg-surface-50 dark:bg-surface-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 px-4 py-3 safe-area-top">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
            🛒 Mode Courses
          </h1>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <X className="h-5 w-5 text-surface-500" />
          </button>
        </div>

        {/* Barre de progression */}
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-surface-600 dark:text-surface-400">
              {checkedCount} / {totalItems} articles
            </span>
            <span className="font-medium text-primary-600 dark:text-primary-400">
              {progress}%
            </span>
          </div>
          <div className="h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-500 text-white'
                : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400'
            }`}
          >
            Tous ({totalItems})
          </button>
          <button
            onClick={() => setFilter('remaining')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'remaining'
                ? 'bg-warning text-white'
                : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400'
            }`}
          >
            Restants ({remainingCount})
          </button>
          <button
            onClick={() => setFilter('checked')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'checked'
                ? 'bg-success text-white'
                : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400'
            }`}
          >
            Faits ({checkedCount})
          </button>
        </div>
      </div>

      {/* Liste des produits */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {Object.entries(itemsByCategory).length === 0 ? (
          <div className="text-center py-12">
            {filter === 'remaining' ? (
              <>
                <Check className="h-16 w-16 text-success mx-auto mb-4" />
                <p className="text-xl font-semibold text-surface-900 dark:text-surface-100">
                  Bravo ! 🎉
                </p>
                <p className="text-surface-500 dark:text-surface-400 mt-2">
                  Toutes vos courses sont faites !
                </p>
              </>
            ) : (
              <p className="text-surface-500 dark:text-surface-400">
                Aucun article dans cette catégorie
              </p>
            )}
          </div>
        ) : (
          Object.entries(itemsByCategory).map(([categoryId, items]) => {
            const category = SHOPPING_CATEGORIES.find((c) => c.id === categoryId)
            const categoryChecked = items.filter((item) =>
              checkedItems.includes(item.productId)
            ).length

            return (
              <div key={categoryId}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{category?.icon || '📦'}</span>
                  <span className="font-medium text-surface-900 dark:text-surface-100">
                    {category?.label || 'Autre'}
                  </span>
                  <Badge
                    variant={categoryChecked === items.length ? 'success' : 'neutral'}
                    size="sm"
                  >
                    {categoryChecked}/{items.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {items.map((item) => (
                    <ProductItem
                      key={item.productId}
                      product={{ id: item.productId, name: item.name }}
                      isChecked={checkedItems.includes(item.productId)}
                      quantity={item.quantity || 1}
                      onToggleChecked={() => onToggleChecked(item.productId)}
                      variant="shopping"
                    />
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer avec actions */}
      <div className="bg-white dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700 p-4 safe-area-bottom">
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            leftIcon={RotateCcw}
            onClick={onReset}
          >
            Réinitialiser
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            leftIcon={Share2}
            onClick={onShare}
          >
            Partager
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={onClose}
          >
            Terminer
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ShoppingMode