/**
 * Composant BookStats - Statistiques de lecture
 */

import { useMemo } from 'react'
import { BookOpen, Star, Calendar, TrendingUp } from 'lucide-react'
import { Card } from '../../../components/common'
import {
  BOOK_STATUS,
  BOOK_STATUS_LABELS,
  BOOK_STATUS_COLORS,
} from '../../../utils/constants'

const BookStats = ({ books }) => {
  const stats = useMemo(() => {
    // Statistiques par statut
    const byStatus = Object.entries(BOOK_STATUS).reduce((acc, [key, value]) => {
      acc[value] = books.filter((b) => b.status === value).length
      return acc
    }, {})

    // Statistiques par genre
    const byGenre = books.reduce((acc, book) => {
      const genre = book.genre || 'Non classé'
      acc[genre] = (acc[genre] || 0) + 1
      return acc
    }, {})

    // Top genres
    const topGenres = Object.entries(byGenre)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    // Livres lus cette année
    const currentYear = new Date().getFullYear()
    const booksThisYear = books.filter((b) => {
      if (b.status !== BOOK_STATUS.READ || !b.endDate) return false
      return new Date(b.endDate).getFullYear() === currentYear
    }).length

    // Livres lus par mois cette année
    const booksByMonth = Array(12).fill(0)
    books.forEach((book) => {
      if (book.status === BOOK_STATUS.READ && book.endDate) {
        const date = new Date(book.endDate)
        if (date.getFullYear() === currentYear) {
          booksByMonth[date.getMonth()]++
        }
      }
    })

    // Note moyenne
    const ratedBooks = books.filter((b) => b.rating)
    const avgRating =
      ratedBooks.length > 0
        ? ratedBooks.reduce((sum, b) => sum + b.rating, 0) / ratedBooks.length
        : 0

    // Pages totales lues
    const totalPagesRead = books
      .filter((b) => b.status === BOOK_STATUS.READ && b.pageCount)
      .reduce((sum, b) => sum + b.pageCount, 0)

    // Auteurs les plus lus
    const byAuthor = books.reduce((acc, book) => {
      const author = book.author || 'Inconnu'
      acc[author] = (acc[author] || 0) + 1
      return acc
    }, {})

    const topAuthors = Object.entries(byAuthor)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    return {
      byStatus,
      byGenre,
      topGenres,
      booksThisYear,
      booksByMonth,
      avgRating,
      totalPagesRead,
      topAuthors,
      total: books.length,
    }
  }, [books])

  const months = [
    'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
    'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc',
  ]

  const maxBooksInMonth = Math.max(...stats.booksByMonth, 1)

  return (
    <div className="space-y-6">
      {/* Stats principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BookOpen}
          label="Total"
          value={stats.total}
          color="primary"
        />
        <StatCard
          icon={TrendingUp}
          label="Lus cette année"
          value={stats.booksThisYear}
          color="success"
        />
        <StatCard
          icon={Star}
          label="Note moyenne"
          value={stats.avgRating.toFixed(1)}
          suffix="/ 5"
          color="warning"
        />
        <StatCard
          icon={Calendar}
          label="Pages lues"
          value={stats.totalPagesRead.toLocaleString()}
          color="accent"
        />
      </div>

      {/* Graphiques et détails */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Répartition par statut */}
        <Card>
          <Card.Header>
            <Card.Title>Répartition par statut</Card.Title>
          </Card.Header>

          <div className="space-y-3">
            {Object.entries(BOOK_STATUS_LABELS).map(([status, label]) => {
              const count = stats.byStatus[status] || 0
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0
              const colorClasses = {
                [BOOK_STATUS.TO_READ]: 'bg-surface-400',
                [BOOK_STATUS.READING]: 'bg-primary-500',
                [BOOK_STATUS.READ]: 'bg-success',
                [BOOK_STATUS.ABANDONED]: 'bg-danger',
              }

              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-surface-700 dark:text-surface-300">
                      {label}
                    </span>
                    <span className="text-surface-500">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colorClasses[status]} rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Top genres */}
        <Card>
          <Card.Header>
            <Card.Title>Top genres</Card.Title>
          </Card.Header>

          {stats.topGenres.length > 0 ? (
            <div className="space-y-3">
              {stats.topGenres.map(([genre, count], index) => {
                const maxCount = stats.topGenres[0][1]
                const percentage = (count / maxCount) * 100

                return (
                  <div key={genre}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-surface-700 dark:text-surface-300">
                        {genre}
                      </span>
                      <span className="text-surface-500">{count}</span>
                    </div>
                    <div className="h-2 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-surface-500 text-center py-4">
              Aucun genre enregistré
            </p>
          )}
        </Card>

        {/* Lectures par mois */}
        <Card className="lg:col-span-2">
          <Card.Header>
            <Card.Title>Lectures terminées par mois ({new Date().getFullYear()})</Card.Title>
          </Card.Header>

          <div className="flex items-end justify-between h-40 gap-2">
            {stats.booksByMonth.map((count, index) => {
              const height = maxBooksInMonth > 0 ? (count / maxBooksInMonth) * 100 : 0

              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-xs text-surface-500">{count || ''}</span>
                  <div
                    className="w-full bg-primary-500 rounded-t transition-all hover:bg-primary-600"
                    style={{ height: `${Math.max(height, count > 0 ? 5 : 0)}%` }}
                  />
                  <span className="text-xs text-surface-400">{months[index]}</span>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Top auteurs */}
        <Card className="lg:col-span-2">
          <Card.Header>
            <Card.Title>Auteurs les plus lus</Card.Title>
          </Card.Header>

          {stats.topAuthors.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {stats.topAuthors.map(([author, count], index) => (
                <div
                  key={author}
                  className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-900 rounded-lg"
                >
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-surface-900 dark:text-white truncate text-sm">
                      {author}
                    </p>
                    <p className="text-xs text-surface-500">
                      {count} livre{count > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-surface-500 text-center py-4">
              Aucun auteur enregistré
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}

const StatCard = ({ icon: Icon, label, value, suffix, color }) => {
  const colors = {
    primary: 'bg-primary-50 dark:bg-primary-900/30 text-primary-600',
    success: 'bg-success-light dark:bg-green-900/30 text-success',
    warning: 'bg-warning-light dark:bg-amber-900/30 text-warning',
    accent: 'bg-accent-100 dark:bg-accent-900/30 text-accent-600',
  }

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-surface-500 dark:text-surface-400 mb-1">
            {label}
          </p>
          <p className="text-3xl font-display font-bold text-surface-900 dark:text-white">
            {value}
            {suffix && (
              <span className="text-lg text-surface-400 ml-1">{suffix}</span>
            )}
          </p>
        </div>
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  )
}

export default BookStats