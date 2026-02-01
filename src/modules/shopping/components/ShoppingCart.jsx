/**
 * Composant ShoppingCart - Panier de courses
 */

import { ShoppingCart as CartIcon, Trash2, Share2, PlayCircle } from 'lucide-react'
import { Card, Button, Badge } from '../../../components/common'
import { SHOPPING_CATEGORIES } from '../data/defaultProducts'
import ProductItem from './ProductItem'

const UNIT_LABELS = {
  '': '',
  'piece': 'pièce(s)',
  'boite': 'boîte',
  'barquette': 'barquette',
  'sachet': 'sachet',
  'filet': 'filet',
  'bouteille': 'bouteille',
  'pack': 'pack',
  'pot': 'pot',
  'g': 'g',
  'kg': 'kg',
  'ml': 'ml',
  'cl': 'cl',
  'L': 'L',
}

const ShoppingCart = ({
  cartItems = [],
  onRemoveItem,
  onUpdateQuantity,
  onUpdateUnit,
  onClearCart,
  onStartShopping,
  onShare,
}) => {
  // Grouper les items par catégorie
  const itemsByCategory = cartItems.reduce((acc, item) => {
    const categoryId = item.categoryId || 'other'
    if (!acc[categoryId]) {
      acc[categoryId] = []
    }
    acc[categoryId].push(item)
    return acc
  }, {})

  const totalProducts = cartItems.length  // Nombre de produits différents

  // Formater l'affichage quantité + unité
  const formatItemDisplay = (item) => {
    const unitLabel = UNIT_LABELS[item.unit] || ''
    if (item.quantity === 1 && !item.unit) {
      return ''
    }
    return `${item.quantity} ${unitLabel}`.trim()
  }

  if (cartItems.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <CartIcon className="h-12 w-12 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
          <p className="text-surface-500 dark:text-surface-400">
            Votre panier est vide
          </p>
          <p className="text-sm text-surface-400 dark:text-surface-500 mt-1">
            Sélectionnez des produits dans les catégories
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
            <CartIcon className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <Card.Title>Mon panier</Card.Title>
            <Card.Description>
              {totalProducts} produit{totalProducts > 1 ? 's' : ''}
            </Card.Description>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={Trash2}
            onClick={onClearCart}
            className="text-danger hover:bg-danger-light"
          >
            Vider
          </Button>
        </div>
      </Card.Header>

      {/* Liste par catégorie */}
      <div className="space-y-4">
        {Object.entries(itemsByCategory).map(([categoryId, items]) => {
          const category = SHOPPING_CATEGORIES.find((c) => c.id === categoryId)
          return (
            <div key={categoryId}>
              <div className="flex items-center gap-2 mb-2">
                <span>{category?.icon || '📦'}</span>
                <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                  {category?.label || 'Autre'}
                </span>
                <Badge variant="neutral" size="sm">
                  {items.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {items.map((item) => {
                  const quantityDisplay = formatItemDisplay(item)
                  return (
                    <div 
                      key={item.productId}
                      className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-lg"
                    >
                      <button
                        onClick={() => onRemoveItem(item.productId)}
                        className="w-6 h-6 rounded-full bg-danger/10 text-danger hover:bg-danger/20 flex items-center justify-center flex-shrink-0 transition-colors"
                        aria-label="Retirer du panier"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                      
                      <span className="flex-1 text-surface-900 dark:text-surface-100">
                        {item.name}
                      </span>
                      
                      {quantityDisplay && (
                        <span className="text-sm text-primary-600 dark:text-primary-400 font-medium bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded">
                          {quantityDisplay}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-surface-200 dark:border-surface-700">
        <Button
          variant="primary"
          className="flex-1"
          leftIcon={PlayCircle}
          onClick={onStartShopping}
        >
          Commencer les courses
        </Button>
        <Button
          variant="secondary"
          leftIcon={Share2}
          onClick={onShare}
        >
          Partager
        </Button>
      </div>
    </Card>
  )
}

export default ShoppingCart