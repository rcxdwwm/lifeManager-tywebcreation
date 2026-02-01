/**
 * Module Shopping - Liste de courses
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import { ShoppingCart, List, Search, Plus } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useToast } from '../../context/ToastContext'
import { useModal, useBoolean } from '../../hooks'
import {
  Button,
  Card,
  SearchInput,
} from '../../components/common'
import CategorySection from './components/CategorySection'
import ShoppingCartComponent from './components/ShoppingCart'
import ShoppingMode from './components/ShoppingMode'
import ShareModal from './components/ShareModal'
import ProductForm from './components/ProductForm'
import {
  SHOPPING_CATEGORIES,
  DEFAULT_PRODUCTS,
} from './data/defaultProducts'
import { STORAGE_PREFIX } from '../../utils/constants'

const STORAGE_KEYS = {
  CART: `${STORAGE_PREFIX}-shopping-cart`,
  CUSTOM_PRODUCTS: `${STORAGE_PREFIX}-shopping-custom-products`,
  CHECKED_ITEMS: `${STORAGE_PREFIX}-shopping-checked`,
}

const ShoppingModule = () => {
  const { toast } = useToast()
  
  // Données persistées
  const [cartItems, setCartItems] = useLocalStorage(STORAGE_KEYS.CART, [])
  const [customProducts, setCustomProducts] = useLocalStorage(STORAGE_KEYS.CUSTOM_PRODUCTS, [])
  const [checkedItems, setCheckedItems] = useLocalStorage(STORAGE_KEYS.CHECKED_ITEMS, [])

  // États locaux
  const [searchTerm, setSearchTerm] = useState('')
  const [view, setView] = useState('categories') // 'categories' | 'cart'
  
  // Refs pour scroll vers catégories
  const categoryRefs = useRef({})
  
  // Modals
  const [shoppingMode, { setTrue: openShoppingMode, setFalse: closeShoppingMode }] = useBoolean(false)
  const [shareModal, { setTrue: openShareModal, setFalse: closeShareModal }] = useBoolean(false)
  const productFormModal = useModal()

  // Filtrer les catégories selon la recherche
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) {
      return SHOPPING_CATEGORIES
    }

    const search = searchTerm.toLowerCase()
    return SHOPPING_CATEGORIES.filter((category) => {
      if (category.label.toLowerCase().includes(search)) {
        return true
      }
      const products = DEFAULT_PRODUCTS[category.id] || []
      const customCategoryProducts = customProducts.filter((p) => p.categoryId === category.id)
      const allProducts = [...products, ...customCategoryProducts]
      return allProducts.some((p) => p.name.toLowerCase().includes(search))
    })
  }, [searchTerm, customProducts])

  // Stats
  const stats = useMemo(() => {
    const totalProducts = cartItems.length  // Nombre de produits différents
    const totalUnits = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)  // Somme des quantités
    const totalChecked = checkedItems.length
    return {
      products: totalProducts,      // 2 produits (tomates + épinards)
      units: totalUnits,            // 15 unités (5 + 10)
      checked: totalChecked,
      remaining: totalProducts - totalChecked,
    }
  }, [cartItems, checkedItems])

  // Scroll vers la catégorie suivante
  const scrollToCategory = useCallback((categoryId) => {
    const element = categoryRefs.current[categoryId]
    if (element) {
      const yOffset = -80
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }, [])

  // Obtenir la catégorie suivante
  const getNextCategory = useCallback((currentCategoryId) => {
    const currentIndex = filteredCategories.findIndex((c) => c.id === currentCategoryId)
    if (currentIndex < filteredCategories.length - 1) {
      return filteredCategories[currentIndex + 1]
    }
    return null
  }, [filteredCategories])

  // Ajouter/retirer du panier
  const handleToggleCart = useCallback((product, categoryId) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.productId === product.id)
      if (existingIndex >= 0) {
        return prev.filter((item) => item.productId !== product.id)
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            categoryId: categoryId || product.categoryId,
            quantity: 1,
            unit: '',
            addedAt: new Date().toISOString(),
          },
        ]
      }
    })
  }, [setCartItems])

  // Mettre à jour la quantité
  const handleUpdateQuantity = useCallback((productId, quantity) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    )
  }, [setCartItems])

  // Mettre à jour l'unité
  const handleUpdateUnit = useCallback((productId, unit) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, unit } : item
      )
    )
  }, [setCartItems])

  // Retirer du panier
  const handleRemoveFromCart = useCallback((productId) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId))
    setCheckedItems((prev) => prev.filter((id) => id !== productId))
  }, [setCartItems, setCheckedItems])

  // Vider le panier
  const handleClearCart = useCallback(() => {
    setCartItems([])
    setCheckedItems([])
    toast.success('Panier vidé')
  }, [setCartItems, setCheckedItems, toast])

  // Cocher/décocher un article (mode courses)
  const handleToggleChecked = useCallback((productId) => {
    setCheckedItems((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId)
      }
      return [...prev, productId]
    })
  }, [setCheckedItems])

  // Réinitialiser les coches
  const handleResetChecked = useCallback(() => {
    setCheckedItems([])
    toast.info('Liste réinitialisée')
  }, [setCheckedItems, toast])

  // Ajouter un produit personnalisé
  const handleAddCustomProduct = useCallback((productData) => {
    const newProduct = {
      ...productData,
      id: `custom-${Date.now()}`,
      isCustom: true,
      createdAt: new Date().toISOString(),
    }
    setCustomProducts((prev) => [...prev, newProduct])
    toast.success('Produit ajouté')
    productFormModal.close()
  }, [setCustomProducts, toast, productFormModal])

  // Ajouter un produit personnalisé depuis une catégorie
  const handleAddCustomProductFromCategory = useCallback((productData) => {
    const newProduct = {
      ...productData,
      id: `custom-${Date.now()}`,
      isCustom: true,
      createdAt: new Date().toISOString(),
    }
    setCustomProducts((prev) => [...prev, newProduct])
    setCartItems((prev) => [
      ...prev,
      {
        productId: newProduct.id,
        name: newProduct.name,
        categoryId: newProduct.categoryId,
        quantity: 1,
        unit: '',
        addedAt: new Date().toISOString(),
      },
    ])
    toast.success('Produit ajouté au panier')
  }, [setCustomProducts, setCartItems, toast])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header avec stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
            <ShoppingCart className="h-4 w-4 text-primary-600" />
            <span className="font-medium text-primary-600">
              {stats.products} produit{stats.products > 1 ? 's' : ''}
            </span>
          </div>
          {stats.checked > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-success-light dark:bg-green-900/30 rounded-lg">
              <span className="font-medium text-success">
                {stats.checked} fait{stats.checked > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle vue */}
          <div className="flex bg-surface-100 dark:bg-surface-800 rounded-lg p-1">
            <button
              onClick={() => setView('categories')}
              className={`p-2 rounded-md transition-colors ${
                view === 'categories'
                  ? 'bg-white dark:bg-surface-700 shadow-sm'
                  : 'text-surface-500 hover:text-surface-700'
              }`}
              aria-label="Vue catégories"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('cart')}
              className={`p-2 rounded-md transition-colors relative ${
                view === 'cart'
                  ? 'bg-white dark:bg-surface-700 shadow-sm'
                  : 'text-surface-500 hover:text-surface-700'
              }`}
              aria-label="Vue panier"
            >
              <ShoppingCart className="h-4 w-4" />
              {stats.products > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                  {stats.products}
                </span>
              )}
            </button>
          </div>

          <Button
            onClick={() => productFormModal.open(null)}
            leftIcon={Plus}
            size="md"
          >
            Produit
          </Button>
        </div>
      </div>

      {/* Barre de recherche */}
      <Card padding="sm">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Rechercher un produit..."
        />
      </Card>

      {/* Contenu selon la vue */}
      {view === 'categories' ? (
        <div className="space-y-4">
          {filteredCategories.map((category, index) => {
            const nextCategory = getNextCategory(category.id)
            const isLast = index === filteredCategories.length - 1
            
            return (
              <div
                key={category.id}
                ref={(el) => (categoryRefs.current[category.id] = el)}
              >
                <CategorySection
                  category={category}
                  products={DEFAULT_PRODUCTS[category.id] || []}
                  customProducts={customProducts}
                  cartItems={cartItems}
                  onToggleCart={(product) => handleToggleCart(product, category.id)}
                  onUpdateQuantity={handleUpdateQuantity}
                  onUpdateUnit={handleUpdateUnit}
                  onAddCustomProduct={handleAddCustomProductFromCategory}
                  defaultExpanded={searchTerm.length > 0}
                  isLast={isLast}
                  onNextCategory={
                    nextCategory
                      ? () => scrollToCategory(nextCategory.id)
                      : undefined
                  }
                />
              </div>
            )
          })}

          {filteredCategories.length === 0 && (
            <Card>
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
                <p className="text-surface-500 dark:text-surface-400">
                  Aucun produit trouvé pour "{searchTerm}"
                </p>
              </div>
            </Card>
          )}
        </div>
      ) : (
        <ShoppingCartComponent
          cartItems={cartItems}
          onRemoveItem={handleRemoveFromCart}
          onUpdateQuantity={handleUpdateQuantity}
          onUpdateUnit={handleUpdateUnit}
          onClearCart={handleClearCart}
          onStartShopping={openShoppingMode}
          onShare={openShareModal}
        />
      )}

      {/* Mode courses (plein écran) */}
      {shoppingMode && (
        <ShoppingMode
          cartItems={cartItems}
          checkedItems={checkedItems}
          onToggleChecked={handleToggleChecked}
          onClose={closeShoppingMode}
          onShare={openShareModal}
          onReset={handleResetChecked}
        />
      )}

      {/* Modal de partage */}
      <ShareModal
        isOpen={shareModal}
        onClose={closeShareModal}
        cartItems={cartItems}
      />

      {/* Modal ajout produit */}
      <ProductForm
        isOpen={productFormModal.isOpen}
        onClose={productFormModal.close}
        onSave={handleAddCustomProduct}
        initialData={productFormModal.data}
      />
    </div>
  )
}

export default ShoppingModule