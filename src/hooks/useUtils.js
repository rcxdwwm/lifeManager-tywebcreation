/**
 * Hooks utilitaires supplémentaires
 */

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Hook pour gérer un état booléen avec toggle
 * @param {boolean} initialValue - Valeur initiale
 * @returns {[boolean, { toggle: Function, setTrue: Function, setFalse: Function }]}
 */
export const useBoolean = (initialValue = false) => {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => setValue((v) => !v), [])
  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])

  return [value, { toggle, setTrue, setFalse, setValue }]
}

/**
 * Hook pour gérer un modal/dialog
 * @param {boolean} initialOpen - État initial
 * @returns {object}
 */
export const useModal = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [data, setData] = useState(null)

  const open = useCallback((modalData = null) => {
    setData(modalData)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    // Délai pour l'animation de fermeture
    setTimeout(() => setData(null), 200)
  }, [])

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  return { isOpen, data, open, close, toggle }
}

/**
 * Hook pour debouncer une valeur
 * @param {*} value - Valeur à debouncer
 * @param {number} delay - Délai en ms
 * @returns {*}
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook pour détecter les clics extérieurs
 * @param {Function} handler - Callback à appeler
 * @returns {React.RefObject}
 */
export const useClickOutside = (handler) => {
  const ref = useRef(null)

  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return
      }
      handler(event)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [handler])

  return ref
}

/**
 * Hook pour détecter la pression sur Escape
 * @param {Function} handler - Callback à appeler
 */
export const useEscapeKey = (handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (event.key === 'Escape') {
        handler(event)
      }
    }

    document.addEventListener('keydown', listener)
    return () => document.removeEventListener('keydown', listener)
  }, [handler])
}

/**
 * Hook pour détecter si on est sur mobile
 * @returns {boolean}
 */
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

/**
 * Hook pour gérer un formulaire simple
 * @param {object} initialValues - Valeurs initiales
 * @param {Function} onSubmit - Callback de soumission
 * @returns {object}
 */
export const useForm = (initialValues = {}, onSubmit = null) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setIsDirty(true)
    // Effacer l'erreur du champ modifié
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }, [])

  const setValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    setIsDirty(true)
  }, [])

  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({ ...prev, [name]: error }))
  }, [])

  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues)
    setErrors({})
    setIsDirty(false)
  }, [initialValues])

  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault()
      if (!onSubmit) return

      setIsSubmitting(true)
      try {
        await onSubmit(values)
        setIsDirty(false)
      } catch (err) {
        if (err.errors) {
          setErrors(err.errors)
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    [values, onSubmit]
  )

  return {
    values,
    errors,
    isSubmitting,
    isDirty,
    handleChange,
    setValue,
    setFieldError,
    reset,
    handleSubmit,
    setValues,
    setErrors,
  }
}

/**
 * Hook pour la pagination
 * @param {Array} items - Éléments à paginer
 * @param {number} itemsPerPage - Éléments par page
 * @returns {object}
 */
export const usePagination = (items = [], itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(items.length / itemsPerPage)

  const paginatedItems = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const goToPage = useCallback(
    (page) => {
      const validPage = Math.min(Math.max(1, page), totalPages)
      setCurrentPage(validPage)
    },
    [totalPages]
  )

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1)
  }, [currentPage, goToPage])

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1)
  }, [currentPage, goToPage])

  // Reset à la page 1 si les items changent
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [items.length, totalPages, currentPage])

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    startIndex: (currentPage - 1) * itemsPerPage + 1,
    endIndex: Math.min(currentPage * itemsPerPage, items.length),
    totalItems: items.length,
  }
}

/**
 * Hook pour le tri
 * @param {Array} items - Éléments à trier
 * @param {object} initialConfig - Configuration initiale { key, direction }
 * @returns {object}
 */
export const useSort = (items = [], initialConfig = { key: null, direction: 'asc' }) => {
  const [sortConfig, setSortConfig] = useState(initialConfig)

  const sortedItems = [...items].sort((a, b) => {
    if (!sortConfig.key) return 0

    const aVal = a[sortConfig.key]
    const bVal = b[sortConfig.key]

    if (aVal === bVal) return 0
    if (aVal === null || aVal === undefined) return 1
    if (bVal === null || bVal === undefined) return -1

    let comparison = 0
    if (typeof aVal === 'string') {
      comparison = aVal.localeCompare(bVal, 'fr', { sensitivity: 'base' })
    } else {
      comparison = aVal < bVal ? -1 : 1
    }

    return sortConfig.direction === 'asc' ? comparison : -comparison
  })

  const requestSort = useCallback((key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }, [])

  return {
    sortedItems,
    sortConfig,
    requestSort,
  }
}

/**
 * Hook pour le filtrage
 * @param {Array} items - Éléments à filtrer
 * @param {string} searchField - Champ de recherche principal
 * @returns {object}
 */
export const useFilter = (items = [], searchField = 'title') => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({})

  const debouncedSearch = useDebounce(searchTerm, 300)

  const filteredItems = items.filter((item) => {
    // Recherche textuelle
    if (debouncedSearch) {
      const searchValue = item[searchField]?.toLowerCase() || ''
      if (!searchValue.includes(debouncedSearch.toLowerCase())) {
        return false
      }
    }

    // Filtres additionnels
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          if (!value.includes(item[key])) return false
        } else if (item[key] !== value) {
          return false
        }
      }
    }

    return true
  })

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
    setSearchTerm('')
  }, [])

  return {
    filteredItems,
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    clearFilters,
    hasActiveFilters: searchTerm !== '' || Object.values(filters).some((v) => v),
  }
}

/**
 * Hook pour la confirmation avant action
 * @returns {object}
 */
export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
    confirmText: 'Confirmer',
    cancelText: 'Annuler',
    variant: 'danger',
  })

  const confirm = useCallback(
    ({
      title = 'Confirmation',
      message,
      onConfirm,
      onCancel = null,
      confirmText = 'Confirmer',
      cancelText = 'Annuler',
      variant = 'danger',
    }) => {
      setConfirmState({
        isOpen: true,
        title,
        message,
        onConfirm,
        onCancel,
        confirmText,
        cancelText,
        variant,
      })
    },
    []
  )

  const handleConfirm = useCallback(() => {
    confirmState.onConfirm?.()
    setConfirmState((prev) => ({ ...prev, isOpen: false }))
  }, [confirmState])

  const handleCancel = useCallback(() => {
    confirmState.onCancel?.()
    setConfirmState((prev) => ({ ...prev, isOpen: false }))
  }, [confirmState])

  return {
    ...confirmState,
    confirm,
    handleConfirm,
    handleCancel,
  }
}