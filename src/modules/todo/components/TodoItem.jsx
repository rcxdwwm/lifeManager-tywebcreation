/**
 * Composant TodoItem - Élément de tâche individuel
 */

import { useState } from 'react'
import { MoreVertical, Edit2, Trash2, Calendar, Clock, Link2 } from 'lucide-react'
import { Card, Badge, Checkbox, ConfirmDialog } from '../../../components/common'
import { useClickOutside, useBoolean } from '../../../hooks'
import { formatRelativeDate, formatTime, cn } from '../../../utils/helpers'
import { DEFAULT_TODO_CATEGORIES,} from '../../../utils/constants'

const TodoItem = ({ todo, onEdit, onDelete, onToggleComplete }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleteConfirmOpen, { setTrue: openDeleteConfirm, setFalse: closeDeleteConfirm }] = useBoolean(false)
  
  const menuRef = useClickOutside(() => setMenuOpen(false))

  const category = DEFAULT_TODO_CATEGORIES.find((c) => c.id === todo.category)
  const isOverdue =
    todo.dueDate &&
    !todo.completed &&
    new Date(todo.dueDate) < new Date().setHours(0, 0, 0, 0)

  const handleDelete = () => {
    closeDeleteConfirm()
    onDelete()
  }

  return (
    <>
      <Card
        padding="none"
        className={cn(
          'group transition-all',
          todo.completed && 'opacity-60'
        )}
      >
        <div className="flex items-start gap-4 p-4">
          {/* Checkbox */}
          <div className="pt-0.5">
            <Checkbox
              checked={todo.completed}
              onChange={(e) => onToggleComplete(e.target.checked)}
              aria-label={`Marquer "${todo.title}" comme ${
                todo.completed ? 'non terminée' : 'terminée'
              }`}
            />
          </div>

          {/* Contenu */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4
                className={cn(
                  'font-medium text-surface-900 dark:text-surface-100',
                  todo.completed && 'line-through text-surface-500'
                )}
              >
                {todo.title}
              </h4>

              {/* Menu actions */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1 -m-1 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-surface-800 rounded-lg shadow-soft-lg border border-surface-200 dark:border-surface-700 py-1 z-10 animate-scale-in">
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        onEdit()
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700"
                    >
                      <Edit2 className="h-4 w-4" />
                      Modifier
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        openDeleteConfirm()
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-danger hover:bg-danger-light dark:hover:bg-red-900/30"
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {todo.description && (
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 line-clamp-2">
                {todo.description}
              </p>
            )}

            {/* Métadonnées */}
            <div className="flex flex-wrap items-center gap-2 mt-3">

              {/* Catégorie */}
              {category && (
                <Badge variant="neutral" size="sm">
                  {category.label}
                </Badge>
              )}

              {/* Date et heure d'échéance */}
              {todo.dueDate && (
                <span
                  className={cn(
                    'flex items-center gap-1 text-xs',
                    isOverdue
                      ? 'text-danger font-medium'
                      : 'text-surface-500 dark:text-surface-400'
                  )}
                >
                  <Calendar className="h-3 w-3" />
                  {formatRelativeDate(todo.dueDate)}
                  {todo.dueTime && (
                    <>
                      <Clock className="h-3 w-3 ml-1" />
                      {formatTime(todo.dueTime)}
                    </>
                  )} 
                </span>
              )}

              {/* Lien vers module source */}
              {todo.sourceModule && (
                <span className="flex items-center gap-1 text-xs text-primary-600">
                  <Link2 className="h-3 w-3" />
                  {todo.sourceModule}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Confirmation de suppression */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={closeDeleteConfirm}
        onConfirm={handleDelete}
        title="Supprimer cette tâche ?"
        message={`"${todo.title}" sera définitivement supprimée.`}
        confirmText="Supprimer"
        variant="danger"
      />
    </>
  )
}

export default TodoItem