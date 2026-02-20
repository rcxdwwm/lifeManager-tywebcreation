/**
 * Composant TodoList - Liste des tâches
 */

import { useMemo } from 'react'
import { CheckSquare } from 'lucide-react'
import { EmptyState } from '../../../components/common'
import TodoItem from './TodoItem'
import { groupBy, sortBy } from '../../../utils/helpers'

const TodoList = ({
  todos,
  onEdit,
  onDelete,
  onToggleComplete,
  emptyMessage = 'Aucune tâche',
  groupByDate = true,
}) => {
  // Grouper par date si demandé
  const groupedTodos = useMemo(() => {
    if (!groupByDate) {
      return { all: sortBy(todos, 'dueDate', 'asc') }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)

    const groups = {
      overdue: [],
      today: [],
      tomorrow: [],
      thisWeek: [],
      later: [],
      noDueDate: [],
    }

    todos.forEach((todo) => {
      if (todo.completed) {
        groups.later.push(todo)
        return
      }

      if (!todo.dueDate) {
        groups.noDueDate.push(todo)
        return
      }

      const dueDate = new Date(todo.dueDate)
      dueDate.setHours(0, 0, 0, 0)

      if (dueDate < today) {
        groups.overdue.push(todo)
      } else if (dueDate.getTime() === today.getTime()) {
        groups.today.push(todo)
      } else if (dueDate.getTime() === tomorrow.getTime()) {
        groups.tomorrow.push(todo)
      } else if (dueDate < nextWeek) {
        groups.thisWeek.push(todo)
      } else {
        groups.later.push(todo)
      }
    })

    // Trier chaque groupe par date
    Object.keys(groups).forEach((key) => {
      groups[key] = groups[key].sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate) - new Date(b.dueDate)
      })
    })

    return groups
  }, [todos, groupByDate])

  if (todos.length === 0) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="Aucune tâche"
        description={emptyMessage}
      />
    )
  }

  const groupLabels = {
    overdue: { label: 'En retard', color: 'text-danger' },
    today: { label: "Aujourd'hui", color: 'text-primary-600' },
    tomorrow: { label: 'Demain', color: 'text-warning' },
    thisWeek: { label: 'Cette semaine', color: 'text-surface-600' },
    later: { label: 'Plus tard', color: 'text-surface-500' },
    noDueDate: { label: 'Sans échéance', color: 'text-surface-400' },
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedTodos).map(([groupKey, groupTodos]) => {
        if (groupTodos.length === 0) return null

        const groupInfo = groupLabels[groupKey] || {
          label: groupKey,
          color: 'text-surface-600',
        }

        return (
          <div key={groupKey}>
            {groupByDate && (
              <h3
                className={`text-sm font-semibold mb-3 ${groupInfo.color} dark:opacity-80`}
              >
                {groupInfo.label}
                <span className="ml-2 text-surface-400 font-normal">
                  ({groupTodos.length})
                </span>
              </h3>
            )}

            <div className="space-y-2">
              {groupTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onEdit={() => onEdit(todo)}
                  onDelete={() => onDelete(todo.id)}
                  onToggleComplete={(completed) =>
                    onToggleComplete(todo.id, completed)
                  }
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TodoList