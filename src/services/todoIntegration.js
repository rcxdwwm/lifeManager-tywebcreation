/**
 * Service d'intégration Todo
 * Permet à tout module d'ajouter des tâches liées
 */

import { STORAGE_KEYS, PRIORITIES } from '../utils/constants'
import { generateId } from '../utils/helpers'

/**
 * Lire les todos depuis localStorage
 * @returns {Array}
 */
const getTodos = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TODOS)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Sauvegarder les todos dans localStorage
 * @param {Array} todos
 */
const saveTodos = (todos) => {
  localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos))
  // Émettre un événement pour la synchronisation
  window.dispatchEvent(
    new CustomEvent('local-storage-change', {
      detail: { key: STORAGE_KEYS.TODOS, value: todos },
    })
  )
}

/**
 * Ajouter une tâche depuis un autre module
 * @param {string} sourceModule - Nom du module source (ex: 'library', 'vehicles')
 * @param {string} sourceId - ID de l'élément source
 * @param {object} todoData - Données de la tâche
 * @returns {object} - La tâche créée
 */
export const addTodoFromModule = (sourceModule, sourceId, todoData) => {
  const todos = getTodos()
  const now = new Date().toISOString()

  const newTodo = {
    id: generateId(),
    title: todoData.title,
    description: todoData.description || '',
    category: todoData.category || 'other',
    priority: todoData.priority || PRIORITIES.MEDIUM,
    dueDate: todoData.dueDate || null,
    completed: false,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    // Lien vers le module source
    sourceModule,
    sourceId,
  }

  todos.push(newTodo)
  saveTodos(todos)

  return newTodo
}

/**
 * Mettre à jour une tâche liée à un module
 * @param {string} sourceModule - Nom du module source
 * @param {string} sourceId - ID de l'élément source
 * @param {object} updates - Mises à jour à appliquer
 * @returns {object|null} - La tâche mise à jour ou null
 */
export const updateTodoFromSource = (sourceModule, sourceId, updates) => {
  const todos = getTodos()
  const index = todos.findIndex(
    (t) => t.sourceModule === sourceModule && t.sourceId === sourceId
  )

  if (index === -1) return null

  todos[index] = {
    ...todos[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  saveTodos(todos)
  return todos[index]
}

/**
 * Supprimer les tâches liées à un élément source
 * @param {string} sourceModule - Nom du module source
 * @param {string} sourceId - ID de l'élément source
 * @returns {number} - Nombre de tâches supprimées
 */
export const removeTodosBySource = (sourceModule, sourceId) => {
  const todos = getTodos()
  const initialLength = todos.length

  const filteredTodos = todos.filter(
    (t) => !(t.sourceModule === sourceModule && t.sourceId === sourceId)
  )

  saveTodos(filteredTodos)
  return initialLength - filteredTodos.length
}

/**
 * Récupérer les tâches liées à un élément source
 * @param {string} sourceModule - Nom du module source
 * @param {string} sourceId - ID de l'élément source
 * @returns {Array}
 */
export const getTodosBySource = (sourceModule, sourceId) => {
  const todos = getTodos()
  return todos.filter(
    (t) => t.sourceModule === sourceModule && t.sourceId === sourceId
  )
}

/**
 * Récupérer toutes les tâches d'un module
 * @param {string} sourceModule - Nom du module source
 * @returns {Array}
 */
export const getTodosByModule = (sourceModule) => {
  const todos = getTodos()
  return todos.filter((t) => t.sourceModule === sourceModule)
}

/**
 * Vérifier si une tâche existe pour une source donnée
 * @param {string} sourceModule
 * @param {string} sourceId
 * @returns {boolean}
 */
export const hasTodoForSource = (sourceModule, sourceId) => {
  const todos = getTodos()
  return todos.some(
    (t) => t.sourceModule === sourceModule && t.sourceId === sourceId && !t.completed
  )
}

/**
 * Créer un rappel de maintenance véhicule
 * @param {object} vehicle - Véhicule concerné
 * @param {object} intervention - Intervention avec rappel
 * @returns {object|null}
 */
export const createVehicleReminder = (vehicle, intervention) => {
  if (!intervention.nextDueDate && !intervention.nextDueMileage) {
    return null
  }

  let title = ''
  let description = ''

  if (intervention.nextDueDate) {
    title = `${intervention.type} - ${vehicle.name}`
    description = `Rappel: ${intervention.type} à effectuer sur ${vehicle.name} (${vehicle.licensePlate})`
  }

  if (intervention.nextDueMileage) {
    const kmRemaining = intervention.nextDueMileage - vehicle.currentMileage
    if (kmRemaining > 0) {
      description += description
        ? `\nProchain passage à ${intervention.nextDueMileage.toLocaleString()} km (dans ~${kmRemaining.toLocaleString()} km)`
        : `Rappel: ${intervention.type} à ${intervention.nextDueMileage.toLocaleString()} km`
    }
  }

  if (!title) {
    title = `${intervention.type} - ${vehicle.name}`
  }

  return addTodoFromModule('vehicles', intervention.id, {
    title,
    description,
    category: 'urgent',
    priority: PRIORITIES.HIGH,
    dueDate: intervention.nextDueDate,
  })
}

/**
 * Créer un rappel de lecture
 * @param {object} book - Livre concerné
 * @param {Date|string} reminderDate - Date du rappel
 * @returns {object}
 */
export const createReadingReminder = (book, reminderDate) => {
  return addTodoFromModule('library', book.id, {
    title: `Lire: ${book.title}`,
    description: `Rappel de lecture pour "${book.title}" de ${book.author}`,
    category: 'personal',
    priority: PRIORITIES.LOW,
    dueDate: reminderDate,
  })
}

export default {
  addTodoFromModule,
  updateTodoFromSource,
  removeTodosBySource,
  getTodosBySource,
  getTodosByModule,
  hasTodoForSource,
  createVehicleReminder,
  createReadingReminder,
}