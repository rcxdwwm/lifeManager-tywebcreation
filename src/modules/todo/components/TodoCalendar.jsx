/**
 * Composant TodoCalendar - Vue calendrier des tâches
 */

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Card, Badge } from '../../../components/common'
import { cn, formatDate } from '../../../utils/helpers'

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

const TodoCalendar = ({ todos, onEdit, onAddForDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Navigation
  const goToPrevMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() - 1)
      return newDate
    })
  }

  const goToNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + 1)
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  // Générer les jours du calendrier
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // Ajuster pour commencer le lundi (0 = Lundi, 6 = Dimanche)
    let startDay = firstDay.getDay() - 1
    if (startDay < 0) startDay = 6

    const days = []

    // Jours du mois précédent
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      })
    }

    // Jours du mois courant
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      })
    }

    // Jours du mois suivant
    const remaining = 42 - days.length // 6 semaines
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      })
    }

    return days
  }, [currentDate])

  // Tâches par date
  const todosByDate = useMemo(() => {
    const map = {}
    todos.forEach((todo) => {
      if (todo.dueDate) {
        const dateKey = new Date(todo.dueDate).toDateString()
        if (!map[dateKey]) map[dateKey] = []
        map[dateKey].push(todo)
      }
    })
    return map
  }, [todos])

  // Tâches de la date sélectionnée
  const selectedDateTodos = useMemo(() => {
    if (!selectedDate) return []
    return todosByDate[selectedDate.toDateString()] || []
  }, [selectedDate, todosByDate])

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false
    return date1.toDateString() === date2.toDateString()
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Calendrier */}
      <Card className="lg:col-span-2" padding="none">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-700">
          <h2 className="text-lg font-display font-semibold text-surface-900 dark:text-white">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
            >
              Aujourd'hui
            </button>
            <button
              onClick={goToPrevMonth}
              className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
              aria-label="Mois précédent"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
              aria-label="Mois suivant"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Grille du calendrier */}
        <div className="p-4">
          {/* En-têtes des jours */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-surface-500 dark:text-surface-400 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Jours */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(({ date, isCurrentMonth }, index) => {
              const dateKey = date.toDateString()
              const dayTodos = todosByDate[dateKey] || []
              const isToday = isSameDay(date, today)
              const isSelected = isSameDay(date, selectedDate)
              const hasOverdue = dayTodos.some(
                (t) => !t.completed && date < today
              )

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    'relative aspect-square p-1 rounded-lg transition-all',
                    'hover:bg-surface-100 dark:hover:bg-surface-700',
                    !isCurrentMonth && 'text-surface-400 dark:text-surface-600',
                    isCurrentMonth && 'text-surface-900 dark:text-surface-100',
                    isToday && 'bg-primary-50 dark:bg-primary-900/30 font-semibold',
                    isSelected && 'ring-2 ring-primary-500 bg-primary-100 dark:bg-primary-900/50'
                  )}
                >
                  <span className="text-sm">{date.getDate()}</span>

                  {/* Indicateurs de tâches */}
                  {dayTodos.length > 0 && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {dayTodos.slice(0, 3).map((_, i) => (
                        <span
                          key={i}
                          className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            hasOverdue ? 'bg-danger' : 'bg-primary-500'
                          )}
                        />
                      ))}
                      {dayTodos.length > 3 && (
                        <span className="text-[8px] text-surface-500">
                          +{dayTodos.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Détail du jour sélectionné */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-surface-900 dark:text-white">
              {selectedDate
                ? formatDate(selectedDate, { weekday: 'long', day: 'numeric', month: 'long' })
                : 'Sélectionnez une date'}
            </h3>
            {selectedDate && (
              <p className="text-sm text-surface-500">
                {selectedDateTodos.length} tâche{selectedDateTodos.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {selectedDate && (
            <button
              onClick={() => onAddForDate(selectedDate.toISOString())}
              className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
              aria-label="Ajouter une tâche"
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>

        {selectedDate ? (
          selectedDateTodos.length > 0 ? (
            <div className="space-y-2">
              {selectedDateTodos.map((todo) => (
                <button
                  key={todo.id}
                  onClick={() => onEdit(todo)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg transition-colors',
                    'bg-surface-50 dark:bg-surface-900',
                    'hover:bg-surface-100 dark:hover:bg-surface-800',
                    todo.completed && 'opacity-60'
                  )}
                >
                  <p
                    className={cn(
                      'font-medium text-sm',
                      todo.completed && 'line-through text-surface-500'
                    )}
                  >
                    {todo.title}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <Badge
                      variant={todo.completed ? 'success' : 'neutral'}
                      size="sm"
                    >
                      {todo.completed ? 'Terminée' : 'En cours'}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-surface-500 dark:text-surface-400 py-8">
              Aucune tâche pour cette date
            </p>
          )
        ) : (
          <p className="text-center text-surface-500 dark:text-surface-400 py-8">
            Cliquez sur une date pour voir les tâches
          </p>
        )}
      </Card>
    </div>
  )
}

export default TodoCalendar