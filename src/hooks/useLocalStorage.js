/**
 * Hook useLocalStorage optimisé
 * - Gestion des erreurs (quota dépassé)
 * - Synchronisation entre onglets
 * - Versioning des données pour migrations futures
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { DATA_VERSION, STORAGE_KEYS } from '../utils/constants'

/**
 * Vérifie si localStorage est disponible
 * @returns {boolean}
 */
const isLocalStorageAvailable = () => {
  try {
    const testKey = '__test__'
    window.localStorage.setItem(testKey, testKey)
    window.localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

/**
 * Calcule l'espace utilisé dans localStorage
 * @returns {{ used: number, total: number, percentage: number }}
 */
export const getStorageInfo = () => {
  let used = 0
  
  try {
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length * 2 // UTF-16 = 2 bytes par caractère
      }
    }
  } catch {
    // Ignorer les erreurs
  }
  
  // Estimation de la limite (~5MB pour la plupart des navigateurs)
  const total = 5 * 1024 * 1024
  
  return {
    used,
    total,
    percentage: Math.round((used / total) * 100),
  }
}

/**
 * Hook useLocalStorage
 * @param {string} key - Clé de stockage
 * @param {*} initialValue - Valeur initiale
 * @param {object} options - Options
 * @returns {[*, Function, { loading: boolean, error: Error|null, remove: Function }]}
 */
export const useLocalStorage = (key, initialValue, options = {}) => {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    syncTabs = true,
    onError = null,
  } = options

  // Référence pour éviter les problèmes de closure
  const keyRef = useRef(key)
  keyRef.current = key

  // État de chargement et erreur
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fonction pour lire la valeur du localStorage
  const readValue = useCallback(() => {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage non disponible')
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      if (item === null) {
        return initialValue
      }
      return deserialize(item)
    } catch (err) {
      console.warn(`Erreur lors de la lecture de "${key}":`, err)
      setError(err)
      onError?.(err)
      return initialValue
    }
  }, [key, initialValue, deserialize, onError])

  // État principal
  const [storedValue, setStoredValue] = useState(initialValue)

  // Initialisation au montage
  useEffect(() => {
    setLoading(true)
    try {
      const value = readValue()
      setStoredValue(value)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Fonction pour écrire dans localStorage
  const setValue = useCallback(
    (value) => {
      if (!isLocalStorageAvailable()) {
        console.warn('localStorage non disponible')
        return
      }

      try {
        // Supporter les fonctions de mise à jour (comme setState)
        const valueToStore = value instanceof Function ? value(storedValue) : value

        // Sauvegarder dans le state
        setStoredValue(valueToStore)

        // Sauvegarder dans localStorage
        const serialized = serialize(valueToStore)
        window.localStorage.setItem(key, serialized)

        // Émettre un événement custom pour la sync entre composants
        window.dispatchEvent(
          new CustomEvent('local-storage-change', {
            detail: { key, value: valueToStore },
          })
        )

        setError(null)
      } catch (err) {
        console.error(`Erreur lors de l'écriture de "${key}":`, err)
        setError(err)
        onError?.(err)

        // Vérifier si c'est une erreur de quota
        if (err.name === 'QuotaExceededError' || err.code === 22) {
          console.error('Quota localStorage dépassé!')
        }
      }
    },
    [key, storedValue, serialize, onError]
  )

  // Fonction pour supprimer la valeur
  const remove = useCallback(() => {
    if (!isLocalStorageAvailable()) return

    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
      
      window.dispatchEvent(
        new CustomEvent('local-storage-change', {
          detail: { key, value: null, removed: true },
        })
      )
    } catch (err) {
      console.error(`Erreur lors de la suppression de "${key}":`, err)
      setError(err)
    }
  }, [key, initialValue])

  // Synchronisation entre onglets
  useEffect(() => {
    if (!syncTabs) return

    const handleStorageChange = (e) => {
      if (e.key === keyRef.current && e.newValue !== null) {
        try {
          setStoredValue(deserialize(e.newValue))
        } catch {
          // Ignorer les erreurs de désérialisation
        }
      } else if (e.key === keyRef.current && e.newValue === null) {
        setStoredValue(initialValue)
      }
    }

    // Écouter les changements de storage (autres onglets)
    window.addEventListener('storage', handleStorageChange)

    // Écouter les changements custom (même onglet, autres composants)
    const handleCustomChange = (e) => {
      if (e.detail.key === keyRef.current && e.detail.key !== key) {
        setStoredValue(e.detail.removed ? initialValue : e.detail.value)
      }
    }
    window.addEventListener('local-storage-change', handleCustomChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('local-storage-change', handleCustomChange)
    }
  }, [syncTabs, deserialize, initialValue, key])

  return [
    storedValue,
    setValue,
    {
      loading,
      error,
      remove,
    },
  ]
}

/**
 * Hook pour gérer une collection avec CRUD
 * @param {string} key - Clé de stockage
 * @param {Array} initialValue - Valeur initiale
 * @returns {object} - Méthodes CRUD et données
 */
export const useLocalStorageCollection = (key, initialValue = []) => {
  const [items, setItems, { loading, error, remove: clearAll }] = useLocalStorage(
    key,
    initialValue
  )

  // Ajouter un élément
  const add = useCallback(
    (item) => {
      const now = new Date().toISOString()
      const newItem = {
        ...item,
        id: item.id || crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      }
      setItems((prev) => [...prev, newItem])
      return newItem
    },
    [setItems]
  )

  // Mettre à jour un élément
  const update = useCallback(
    (id, updates) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, ...updates, updatedAt: new Date().toISOString() }
            : item
        )
      )
    },
    [setItems]
  )

  // Supprimer un élément
  const remove = useCallback(
    (id) => {
      setItems((prev) => prev.filter((item) => item.id !== id))
    },
    [setItems]
  )

  // Récupérer un élément par ID
  const getById = useCallback(
    (id) => {
      return items.find((item) => item.id === id) || null
    },
    [items]
  )

  // Remplacer tous les éléments (pour import)
  const replaceAll = useCallback(
    (newItems) => {
      setItems(newItems)
    },
    [setItems]
  )

  return {
    items,
    add,
    update,
    remove,
    getById,
    replaceAll,
    clearAll,
    loading,
    error,
    count: items.length,
  }
}

/**
 * Vérifier et migrer les données si nécessaire
 */
export const checkDataVersion = () => {
  if (!isLocalStorageAvailable()) return

  try {
    const storedVersion = localStorage.getItem(STORAGE_KEYS.DATA_VERSION)
    const currentVersion = parseInt(storedVersion, 10) || 0

    if (currentVersion < DATA_VERSION) {
      // Ici on pourrait ajouter des migrations de données
      console.log(`Migration des données de v${currentVersion} vers v${DATA_VERSION}`)
      
      // Exemple de migration future :
      // if (currentVersion < 2) {
      //   migrateV1ToV2()
      // }

      localStorage.setItem(STORAGE_KEYS.DATA_VERSION, DATA_VERSION.toString())
    }
  } catch (err) {
    console.error('Erreur lors de la vérification de version:', err)
  }
}

export default useLocalStorage