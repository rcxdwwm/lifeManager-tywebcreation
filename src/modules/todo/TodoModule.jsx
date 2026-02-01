/**
 * Module Todo List - Composant principal
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Plus,
  Calendar as CalendarIcon,
  List,
  Filter,
  SlidersHorizontal,
} from 'lucide-react'
import { useTodos } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import { useModal, useFilter, useBoolean } from '../../hooks'
import {
  Button,
  Card,
  SearchInput,
  EmptyState,
  Badge,
  Select,
} from '../../components/common'
import TodoList from './components/TodoList'
import TodoForm from './components/TodoForm'
import TodoCalendar from './components/TodoCalendar'
import { PRIORITIES, PRIORITY_LABELS, DEFAULT_TODO_CATEGORIES } from '../../utils/constants'

const TodoModule = () => {
  const { items: todos, add, update, remove } = useTodos()
  const { toast } = useToast()
  const formModal = useModal()
  
  // Vue: liste ou calendrier
  const [view, setView] = useState('list')
  
  // Filtres
  const [showFilters, { toggle: toggleFilters }] = useBoolean(false)
  const [statusFilter, setStatusFilter] = useState('all') // all, active, completed
  const [priorityFilter, setPriorityFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  // Filtrage et recherche
  const {
    filteredItems,
    searchTerm,
    setSearchTerm,
  } = useFilter(todos, 'title')

  // Appliquer les filtres supplémentaires
  const displayedTodos = useMemo(() => {
    let result = filteredItems

    // Filtre par statut
    if (statusFilter === 'active') {
      result = result.filter((t) => !t.completed)
    } else if (statusFilter === 'completed') {
      result = result.filter((t) => t.completed)
    }

    // Filtre par priorité
    if (priorityFilter) {
      result = result.filter((t) => t.priority === priorityFilter)
    }

    // Filtre par catégorie
    if (categoryFilter) {
      result = result.filter((t) => t.category === categoryFilter)
    }

    return result
  }, [filteredItems, statusFilter, priorityFilter, categoryFilter])

  // Stats
  const stats = useMemo(() => ({
    total: todos.length,
    active: todos.filter((t) => !t.completed).length,
    completed: todos.filter((t) => t.completed).length,
    overdue: todos.filter((t) => {
      if (t.completed || !t.dueDate) return false
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return new Date(t.dueDate) < today
    }).length,
  }), [todos])

  // Handlers
  const handleAdd = useCallback(() => {
    formModal.open(null)
  }, [formModal])

  const handleEdit = useCallback((todo) => {
    formModal.open(todo)
  }, [formModal])

  const handleSave = useCallback((data) => {
    if (formModal.data) {
      // Édition
      update(formModal.data.id, data)
      toast.success('Tâche modifiée')
    } else {
      // Création
      add(data)
      toast.success('Tâche créée')
    }
    formModal.close()
  }, [formModal, add, update, toast])

  const handleDelete = useCallback((id) => {
    remove(id)
    toast.success('Tâche supprimée')
  }, [remove, toast])

  const handleToggleComplete = useCallback((id, completed) => {
    update(id, {
      completed,
      completedAt: completed ? new Date().toISOString() : null,
    })
  }, [update])

  const handleClearCompleted = useCallback(() => {
    const completedIds = todos.filter((t) => t.completed).map((t) => t.id)
    completedIds.forEach((id) => remove(id))
    toast.success(`${completedIds.length} tâche(s) supprimée(s)`)
  }, [todos, remove, toast])

  // Reset des filtres
  const resetFilters = useCallback(() => {
    setStatusFilter('all')
    setPriorityFilter('')
    setCategoryFilter('')
    setSearchTerm('')
  }, [setSearchTerm])

  const hasActiveFilters = statusFilter !== 'all' || priorityFilter || categoryFilter || searchTerm

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header avec stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Badge variant="neutral" size="lg">
            {stats.active} en cours
          </Badge>
          <Badge variant="success" size="lg">
            {stats.completed} terminée{stats.completed > 1 ? 's' : ''}
          </Badge>
          {stats.overdue > 0 && (
            <Badge variant="danger" size="lg">
              {stats.overdue} en retard
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle vue */}
          <div className="flex bg-surface-100 dark:bg-surface-800 rounded-lg p-1">
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-md transition-colors ${
                view === 'list'
                  ? 'bg-white dark:bg-surface-700 shadow-sm'
                  : 'text-surface-500 hover:text-surface-700'
              }`}
              aria-label="Vue liste"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`p-2 rounded-md transition-colors ${
                view === 'calendar'
                  ? 'bg-white dark:bg-surface-700 shadow-sm'
                  : 'text-surface-500 hover:text-surface-700'
              }`}
              aria-label="Vue calendrier"
            >
              <CalendarIcon className="h-4 w-4" />
            </button>
          </div>

          <Button onClick={handleAdd} leftIcon={Plus}>
            Nouvelle tâche
          </Button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Rechercher une tâche..."
            className="flex-1"
          />

          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? 'primary' : 'secondary'}
              size="md"
              leftIcon={SlidersHorizontal}
              onClick={toggleFilters}
            >
              Filtres
              {hasActiveFilters && (
                <span className="ml-1 w-2 h-2 bg-primary-400 rounded-full" />
              )}
            </Button>

            {hasActiveFilters && (
              <Button variant="ghost" size="md" onClick={resetFilters}>
                Réinitialiser
              </Button>
            )}
          </div>
        </div>

        {/* Filtres avancés */}
        {showFilters && (
          <div className="grid sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
            <Select
              label="Statut"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Tous' },
                { value: 'active', label: 'En cours' },
                { value: 'completed', label: 'Terminées' },
              ]}
              placeholder=""
            />

            <Select
              label="Priorité"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={[
                { value: '', label: 'Toutes' },
                ...Object.entries(PRIORITY_LABELS).map(([value, label]) => ({
                  value,
                  label,
                })),
              ]}
              placeholder=""
            />

            <Select
              label="Catégorie"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { value: '', label: 'Toutes' },
                ...DEFAULT_TODO_CATEGORIES.map((c) => ({
                  value: c.id,
                  label: c.label,
                })),
              ]}
              placeholder=""
            />
          </div>
        )}
      </Card>

      {/* Contenu principal */}
      {view === 'list' ? (
        <TodoList
          todos={displayedTodos}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleComplete={handleToggleComplete}
          emptyMessage={
            hasActiveFilters
              ? 'Aucune tâche ne correspond aux filtres'
              : 'Aucune tâche pour le moment'
          }
        />
      ) : (
        <TodoCalendar
          todos={displayedTodos}
          onEdit={handleEdit}
          onAddForDate={(date) => formModal.open({ dueDate: date })}
        />
      )}

      {/* Actions en bas */}
      {stats.completed > 0 && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearCompleted}
            className="text-surface-500 hover:text-danger"
          >
            Supprimer les tâches terminées ({stats.completed})
          </Button>
        </div>
      )}

      {/* Modal de formulaire */}
      <TodoForm
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        onSave={handleSave}
        initialData={formModal.data}
      />
    </div>
  )
}

export default TodoModule