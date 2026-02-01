/**
 * Contexte principal de l'application
 * Gère les données de tous les modules
 * Avec système de backup automatique
 */

import { createContext, useContext, useEffect, useMemo, useCallback, useState } from 'react'
import { useLocalStorageCollection, checkDataVersion } from '../hooks/useLocalStorage'
import { STORAGE_KEYS } from '../utils/constants'

const AppContext = createContext(null)

const BACKUP_KEY = 'life-manager-auto-backup'

export const AppProvider = ({ children }) => {
  const [backupAvailable, setBackupAvailable] = useState(false)
  const [backupInfo, setBackupInfo] = useState(null)

  // Vérifier la version des données au montage
  useEffect(() => {
    checkDataVersion()
  }, [])

  // Collections de données
  const todosCollection = useLocalStorageCollection(STORAGE_KEYS.TODOS, [])
  const booksCollection = useLocalStorageCollection(STORAGE_KEYS.BOOKS, [])
  const vehiclesCollection = useLocalStorageCollection(STORAGE_KEYS.VEHICLES, [])
  const interventionsCollection = useLocalStorageCollection(
    STORAGE_KEYS.INTERVENTIONS,
    []
  )

  // Vérifier si un backup existe avec plus de données que l'état actuel
  useEffect(() => {
    try {
      const backupStr = localStorage.getItem(BACKUP_KEY)
      if (!backupStr) return

      const backup = JSON.parse(backupStr)
      const backupTotal = 
        (backup.todos?.length || 0) + 
        (backup.books?.length || 0) + 
        (backup.vehicles?.length || 0) + 
        (backup.interventions?.length || 0)

      const currentTotal = 
        todosCollection.items.length + 
        booksCollection.items.length + 
        vehiclesCollection.items.length + 
        interventionsCollection.items.length

      // Si le backup a plus de données ET que l'état actuel est vide ou presque
      if (backupTotal > 0 && currentTotal === 0 && backupTotal > currentTotal) {
        setBackupAvailable(true)
        setBackupInfo({
          date: backup.timestamp,
          todos: backup.todos?.length || 0,
          books: backup.books?.length || 0,
          vehicles: backup.vehicles?.length || 0,
          interventions: backup.interventions?.length || 0,
        })
        console.log('⚠️ Backup disponible avec', backupTotal, 'éléments')
      }
    } catch (e) {
      console.warn('Erreur lecture backup:', e)
    }
  }, [
    todosCollection.items.length,
    booksCollection.items.length,
    vehiclesCollection.items.length,
    interventionsCollection.items.length,
  ])

  // Créer un backup automatique
  const createBackup = useCallback(() => {
    try {
      const backup = {
        timestamp: new Date().toISOString(),
        todos: todosCollection.items,
        books: booksCollection.items,
        vehicles: vehiclesCollection.items,
        interventions: interventionsCollection.items,
      }
      
      const total = 
        backup.todos.length + 
        backup.books.length + 
        backup.vehicles.length + 
        backup.interventions.length

      // Ne sauvegarder que s'il y a des données
      if (total > 0) {
        localStorage.setItem(BACKUP_KEY, JSON.stringify(backup))
        console.log('💾 Backup automatique:', total, 'éléments')
      }
    } catch (e) {
      console.warn('Erreur création backup:', e)
    }
  }, [
    todosCollection.items,
    booksCollection.items,
    vehiclesCollection.items,
    interventionsCollection.items,
  ])

  // Backup automatique à chaque changement (avec debounce)
  useEffect(() => {
    const timer = setTimeout(createBackup, 2000)
    return () => clearTimeout(timer)
  }, [createBackup])

  // Restaurer depuis le backup
  const restoreFromBackup = useCallback(() => {
    try {
      const backupStr = localStorage.getItem(BACKUP_KEY)
      if (!backupStr) {
        throw new Error('Aucun backup disponible')
      }

      const backup = JSON.parse(backupStr)
      
      if (backup.todos) todosCollection.replaceAll(backup.todos)
      if (backup.books) booksCollection.replaceAll(backup.books)
      if (backup.vehicles) vehiclesCollection.replaceAll(backup.vehicles)
      if (backup.interventions) interventionsCollection.replaceAll(backup.interventions)

      setBackupAvailable(false)
      setBackupInfo(null)
      
      console.log('✅ Données restaurées depuis le backup')
      return true
    } catch (e) {
      console.error('Erreur restauration:', e)
      return false
    }
  }, [todosCollection, booksCollection, vehiclesCollection, interventionsCollection])

  // Ignorer le backup (l'utilisateur veut repartir à zéro)
  const dismissBackup = useCallback(() => {
    setBackupAvailable(false)
    setBackupInfo(null)
  }, [])

  // Statistiques globales calculées
  const stats = useMemo(() => {
    const todos = todosCollection.items
    const books = booksCollection.items
    const vehicles = vehiclesCollection.items
    const interventions = interventionsCollection.items

    // Tâches
    const pendingTodos = todos.filter((t) => !t.completed).length
    const completedTodos = todos.filter((t) => t.completed).length
    const overdueTodos = todos.filter((t) => {
      if (t.completed || !t.dueDate) return false
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return new Date(t.dueDate) < today
    }).length

    // Livres
    const readingBooks = books.filter((b) => b.status === 'reading').length
    const toReadBooks = books.filter((b) => b.status === 'to-read').length
    const readBooks = books.filter((b) => b.status === 'read').length

    // Véhicules
    const totalVehicles = vehicles.length
    const totalInterventions = interventions.length
    const totalCosts = interventions.reduce((sum, i) => sum + (i.cost || 0), 0)

    // Rappels à venir (dans les 30 prochains jours)
    const upcomingReminders = interventions.filter((i) => {
      if (!i.nextDueDate) return false
      const dueDate = new Date(i.nextDueDate)
      const today = new Date()
      const thirtyDaysFromNow = new Date(today)
      thirtyDaysFromNow.setDate(today.getDate() + 30)
      return dueDate >= today && dueDate <= thirtyDaysFromNow
    }).length

    return {
      todos: {
        pending: pendingTodos,
        completed: completedTodos,
        overdue: overdueTodos,
        total: todos.length,
      },
      books: {
        reading: readingBooks,
        toRead: toReadBooks,
        read: readBooks,
        total: books.length,
      },
      vehicles: {
        count: totalVehicles,
        interventions: totalInterventions,
        totalCosts,
        upcomingReminders,
      },
    }
  }, [
    todosCollection.items,
    booksCollection.items,
    vehiclesCollection.items,
    interventionsCollection.items,
  ])

  // Export de toutes les données
  const exportAllData = () => {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        todos: todosCollection.items,
        books: booksCollection.items,
        vehicles: vehiclesCollection.items,
        interventions: interventionsCollection.items,
      },
    }
  }

  // Import de toutes les données
  const importAllData = (data) => {
    if (!data || !data.data) {
      throw new Error('Format de données invalide')
    }

    const { todos, books, vehicles, interventions } = data.data

    if (todos) todosCollection.replaceAll(todos)
    if (books) booksCollection.replaceAll(books)
    if (vehicles) vehiclesCollection.replaceAll(vehicles)
    if (interventions) interventionsCollection.replaceAll(interventions)
  }

  // Effacer toutes les données
  const clearAllData = () => {
    todosCollection.clearAll()
    booksCollection.clearAll()
    vehiclesCollection.clearAll()
    interventionsCollection.clearAll()
  }

  const value = {
    // Collections
    todos: todosCollection,
    books: booksCollection,
    vehicles: vehiclesCollection,
    interventions: interventionsCollection,

    // Stats
    stats,

    // Export/Import
    exportAllData,
    importAllData,
    clearAllData,

    // Backup
    backupAvailable,
    backupInfo,
    restoreFromBackup,
    dismissBackup,

    // État de chargement global
    isLoading:
      todosCollection.loading ||
      booksCollection.loading ||
      vehiclesCollection.loading ||
      interventionsCollection.loading,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp doit être utilisé dans un AppProvider')
  }
  return context
}

// Hooks spécifiques pour chaque collection
export const useTodos = () => {
  const { todos } = useApp()
  return todos
}

export const useBooks = () => {
  const { books } = useApp()
  return books
}

export const useVehicles = () => {
  const { vehicles } = useApp()
  return vehicles
}

export const useInterventions = () => {
  const { interventions } = useApp()
  return interventions
}

export default AppContext