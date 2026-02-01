/**
 * Page Dashboard - Vue d'ensemble
 */

import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckSquare,
  BookOpen,
  Car,
  ShoppingCart,
  AlertTriangle,
  Calendar,
  ArrowRight,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { Card, Badge } from '../../components/common'
import { formatRelativeDate, formatPrice } from '../../utils/helpers'
import { STORAGE_PREFIX } from '../../utils/constants'

const Dashboard = () => {
  const { todos, books, vehicles, interventions, stats, backupAvailable, backupInfo, restoreFromBackup, dismissBackup } = useApp()

  // Récupérer le panier de courses
  const [shoppingCart] = useLocalStorage(`${STORAGE_PREFIX}-shopping-cart`, [])
  //const shoppingCount = shoppingCart.reduce((sum, item) => sum + (item.quantity || 1), 0)
  const shoppingCount = shoppingCart.length  // ← Nombre de produits, pas somme des quantités


  // Tâches urgentes (échéance proche ou en retard)
  const urgentTodos = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const weekFromNow = new Date(now)
    weekFromNow.setDate(now.getDate() + 7)

    return todos.items
      .filter((t) => {
        if (t.completed) return false
        if (!t.dueDate) return false
        const dueDate = new Date(t.dueDate)
        return dueDate <= weekFromNow
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5)
  }, [todos.items])

  // Livres en cours de lecture
  const currentlyReading = useMemo(() => {
    return books.items
      .filter((b) => b.status === 'reading')
      .slice(0, 3)
  }, [books.items])

  // Prochaines interventions véhicules
  const upcomingInterventions = useMemo(() => {
    const now = new Date()
    return interventions.items
      .filter((i) => i.nextDueDate && new Date(i.nextDueDate) >= now)
      .sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate))
      .slice(0, 3)
      .map((intervention) => ({
        ...intervention,
        vehicle: vehicles.items.find((v) => v.id === intervention.vehicleId),
      }))
  }, [interventions.items, vehicles.items])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Tâches en cours"
          value={stats.todos.pending}
          icon={CheckSquare}
          color="primary"
          link="/todo"
          subtitle={
            stats.todos.overdue > 0
              ? `${stats.todos.overdue} en retard`
              : 'Tout est à jour'
          }
          subtitleColor={stats.todos.overdue > 0 ? 'danger' : 'success'}
        />

        <StatCard
          title="Livres"
          value={stats.books.total}
          icon={BookOpen}
          color="accent"
          link="/library"
          subtitle={`${stats.books.reading} en lecture`}
        />

        <StatCard
          title="Véhicules"
          value={stats.vehicles.count}
          icon={Car}
          color="success"
          link="/vehicles"
          subtitle={formatPrice(stats.vehicles.totalCosts)}
        />

        <StatCard
          title="Courses"
          value={shoppingCount}
          icon={ShoppingCart}
          color="warning"
          link="/shopping"
          subtitle={shoppingCount > 0 ? `${shoppingCount} produit${shoppingCount > 1 ? 's' : ''}` : 'Liste vide'}
        />

        <StatCard
          title="Rappels"
          value={stats.vehicles.upcomingReminders}
          icon={Calendar}
          color="primary"
          link="/vehicles"
          subtitle="Dans les 30 jours"
        />
      </div>

      {backupAvailable && (
        <div className="mb-6 p-4 bg-warning-light dark:bg-amber-900/30 border border-warning dark:border-amber-700 rounded-xl">
          <h3 className="font-semibold text-warning-dark dark:text-amber-300 mb-2">
            📦 Données sauvegardées détectées
          </h3>
          <p className="text-sm text-warning-dark/80 dark:text-amber-300/80 mb-3">
            Un backup du {new Date(backupInfo?.date).toLocaleDateString('fr-FR')} contient :
            {backupInfo?.books > 0 && ` ${backupInfo.books} livre(s),`}
            {backupInfo?.todos > 0 && ` ${backupInfo.todos} tâche(s),`}
            {backupInfo?.vehicles > 0 && ` ${backupInfo.vehicles} véhicule(s)`}
          </p>
          <div className="flex gap-2">
            <button
              onClick={restoreFromBackup}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
            >
              Restaurer mes données
            </button>
            <button
              onClick={dismissBackup}
              className="px-4 py-2 bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-lg text-sm hover:bg-surface-300 dark:hover:bg-surface-600"
            >
              Ignorer
            </button>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tâches urgentes */}
        <Card>
          <Card.Header>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-danger-light dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-danger" />
              </div>
              <div>
                <Card.Title>Tâches prioritaires</Card.Title>
                <Card.Description>Échéances des 7 prochains jours</Card.Description>
              </div>
            </div>
            <Link
              to="/todo"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              Voir tout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Card.Header>

          {urgentTodos.length > 0 ? (
            <div className="space-y-3">
              {urgentTodos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} />
              ))}
            </div>
          ) : (
            <p className="text-surface-500 dark:text-surface-400 text-center py-6">
              🎉 Aucune tâche urgente !
            </p>
          )}
        </Card>

        {/* Lectures en cours */}
        <Card>
          <Card.Header>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent-100 dark:bg-accent-900/30 rounded-lg">
                <BookOpen className="h-5 w-5 text-accent-600" />
              </div>
              <div>
                <Card.Title>En cours de lecture</Card.Title>
                <Card.Description>{stats.books.reading} livre(s)</Card.Description>
              </div>
            </div>
            <Link
              to="/library"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              Voir tout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Card.Header>

          {currentlyReading.length > 0 ? (
            <div className="space-y-3">
              {currentlyReading.map((book) => (
                <BookItem key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <p className="text-surface-500 dark:text-surface-400 text-center py-6">
              📚 Aucun livre en cours
            </p>
          )}
        </Card>

        {/* Interventions à venir */}
        <Card className="lg:col-span-2">
          <Card.Header>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success-light dark:bg-green-900/30 rounded-lg">
                <Car className="h-5 w-5 text-success" />
              </div>
              <div>
                <Card.Title>Prochaines interventions véhicules</Card.Title>
                <Card.Description>Rappels de maintenance</Card.Description>
              </div>
            </div>
            <Link
              to="/vehicles"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              Voir tout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Card.Header>

          {upcomingInterventions.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingInterventions.map((intervention) => (
                <InterventionItem
                  key={intervention.id}
                  intervention={intervention}
                />
              ))}
            </div>
          ) : (
            <p className="text-surface-500 dark:text-surface-400 text-center py-6">
              🚗 Aucune intervention prévue
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}

// Composant StatCard
const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  link,
  subtitle,
  subtitleColor = 'neutral',
}) => {
  const colors = {
    primary: 'bg-primary-50 dark:bg-primary-900/30 text-primary-600',
    accent: 'bg-accent-100 dark:bg-accent-900/30 text-accent-600',
    success: 'bg-success-light dark:bg-green-900/30 text-success',
    warning: 'bg-warning-light dark:bg-amber-900/30 text-warning',
  }

  const subtitleColors = {
    neutral: 'text-surface-500',
    danger: 'text-danger',
    success: 'text-success',
  }

  return (
    <Link to={link}>
      <Card hover className="h-full">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-surface-500 dark:text-surface-400 mb-1">
              {title}
            </p>
            <p className="text-3xl font-display font-bold text-surface-900 dark:text-white">
              {value}
            </p>
            {subtitle && (
              <p className={`text-sm mt-1 ${subtitleColors[subtitleColor]}`}>
                {subtitle}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${colors[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </Card>
    </Link>
  )
}

// Composant TodoItem
const TodoItem = ({ todo }) => {
  const isOverdue =
    todo.dueDate && new Date(todo.dueDate) < new Date().setHours(0, 0, 0, 0)

  return (
    <div className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-900 rounded-lg">
      <div
        className={`w-2 h-2 rounded-full flex-shrink-0 ${
          isOverdue ? 'bg-danger' : 'bg-warning'
        }`}
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-surface-900 dark:text-surface-100 truncate">
          {todo.title}
        </p>
        <p className="text-sm text-surface-500 dark:text-surface-400">
          {formatRelativeDate(todo.dueDate)}
        </p>
      </div>
      <Badge variant={isOverdue ? 'danger' : 'warning'} size="sm">
        {isOverdue ? 'En retard' : 'Bientôt'}
      </Badge>
    </div>
  )
}

// Composant BookItem
const BookItem = ({ book }) => {
  const progress =
    book.pageCount && book.currentPage
      ? Math.round((book.currentPage / book.pageCount) * 100)
      : 0

  return (
    <div className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-900 rounded-lg">
      <div className="w-10 h-14 bg-accent-100 dark:bg-accent-900/50 rounded flex items-center justify-center flex-shrink-0">
        <BookOpen className="h-5 w-5 text-accent-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-surface-900 dark:text-surface-100 truncate">
          {book.title}
        </p>
        <p className="text-sm text-surface-500 dark:text-surface-400 truncate">
          {book.author}
        </p>
        {progress > 0 && (
          <div className="mt-2 h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
      {progress > 0 && (
        <span className="text-sm font-medium text-accent-600">{progress}%</span>
      )}
    </div>
  )
}

// Composant InterventionItem
const InterventionItem = ({ intervention }) => {
  return (
    <div className="p-4 bg-surface-50 dark:bg-surface-900 rounded-lg">
      <div className="flex items-start justify-between mb-2">
        <Badge variant="success" size="sm">
          {intervention.type}
        </Badge>
        <span className="text-xs text-surface-500">
          {formatRelativeDate(intervention.nextDueDate)}
        </span>
      </div>
      <p className="font-medium text-surface-900 dark:text-surface-100">
        {intervention.vehicle?.name || 'Véhicule inconnu'}
      </p>
      <p className="text-sm text-surface-500 dark:text-surface-400">
        {intervention.vehicle?.licensePlate}
      </p>
    </div>
  )
}

export default Dashboard