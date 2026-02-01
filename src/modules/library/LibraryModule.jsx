/**
 * Module Bibliothèque - Composant principal
 * Affichage en tableau, trié par titre
 */

import { useState, useMemo, useCallback } from 'react'
import { Plus, BookOpen, BarChart3, List } from 'lucide-react'
import { useBooks } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import { useModal, useFilter } from '../../hooks'
import {
  Button,
  Card,
  SearchInput,
  Badge,
  Select,
} from '../../components/common'
import BookTable from './components/BookTable'
import BookForm from './components/BookForm'
import BookStats from './components/BookStats'
import {
  BOOK_STATUS,
  BOOK_STATUS_LABELS,
} from '../../utils/constants'

const LibraryModule = () => {
  const { items: books, add, update, remove } = useBooks()
  const { toast } = useToast()
  const formModal = useModal()

  // Vue: liste ou stats
  const [view, setView] = useState('list')

  // Filtres
  const [statusFilter, setStatusFilter] = useState('')
  const [genreFilter, setGenreFilter] = useState('')

  // Filtrage et recherche
  const { filteredItems, searchTerm, setSearchTerm } = useFilter(books, 'title')

  // Appliquer les filtres supplémentaires
  const displayedBooks = useMemo(() => {
    let result = filteredItems

    if (statusFilter) {
      result = result.filter((b) => b.status === statusFilter)
    }

    if (genreFilter) {
      result = result.filter((b) => b.genre === genreFilter)
    }

    return result
  }, [filteredItems, statusFilter, genreFilter])

  // Stats
  const stats = useMemo(
    () => ({
      total: books.length,
      toRead: books.filter((b) => b.status === BOOK_STATUS.TO_READ).length,
      reading: books.filter((b) => b.status === BOOK_STATUS.READING).length,
      read: books.filter((b) => b.status === BOOK_STATUS.READ).length,
      abandoned: books.filter((b) => b.status === BOOK_STATUS.ABANDONED).length,
    }),
    [books]
  )

  // Genres utilisés
  const usedGenres = useMemo(() => {
    const genres = new Set(books.map((b) => b.genre).filter(Boolean))
    return Array.from(genres).sort()
  }, [books])

  // Handlers
  const handleAdd = useCallback(() => {
    formModal.open(null)
  }, [formModal])

  const handleEdit = useCallback(
    (book) => {
      formModal.open(book)
    },
    [formModal]
  )

  const handleSave = useCallback(
    (data) => {
      if (formModal.data) {
        update(formModal.data.id, data)
        toast.success('Livre modifié')
      } else {
        add(data)
        toast.success('Livre ajouté')
      }
      formModal.close()
    },
    [formModal, add, update, toast]
  )

  const handleDelete = useCallback(
    (id) => {
      remove(id)
      toast.success('Livre supprimé')
    },
    [remove, toast]
  )

  const handleStatusChange = useCallback(
    (id, status) => {
      const updates = { status }

      if (status === BOOK_STATUS.READING) {
        updates.startDate = new Date().toISOString()
      } else if (status === BOOK_STATUS.READ) {
        updates.endDate = new Date().toISOString()
      }

      update(id, updates)
      toast.success(`Statut mis à jour: ${BOOK_STATUS_LABELS[status]}`)
    },
    [update, toast]
  )

  const resetFilters = useCallback(() => {
    setStatusFilter('')
    setGenreFilter('')
    setSearchTerm('')
  }, [setSearchTerm])

  const hasActiveFilters = statusFilter || genreFilter || searchTerm

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header avec stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Badge variant="primary" size="lg">
            {stats.reading} en cours
          </Badge>
          <Badge variant="neutral" size="lg">
            {stats.toRead} à lire
          </Badge>
          <Badge variant="success" size="lg">
            {stats.read} lu{stats.read > 1 ? 's' : ''}
          </Badge>
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
              onClick={() => setView('stats')}
              className={`p-2 rounded-md transition-colors ${
                view === 'stats'
                  ? 'bg-white dark:bg-surface-700 shadow-sm'
                  : 'text-surface-500 hover:text-surface-700'
              }`}
              aria-label="Statistiques"
            >
              <BarChart3 className="h-4 w-4" />
            </button>
          </div>

          <Button onClick={handleAdd} leftIcon={Plus}>
            Ajouter un livre
          </Button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      {view !== 'stats' && (
        <Card padding="sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Rechercher un livre..."
              className="flex-1"
            />

            <div className="flex items-center gap-2">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: '', label: 'Tous les statuts' },
                  ...Object.entries(BOOK_STATUS_LABELS).map(([value, label]) => ({
                    value,
                    label,
                  })),
                ]}
                placeholder=""
                className="w-40"
              />

              <Select
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                options={[
                  { value: '', label: 'Tous les genres' },
                  ...usedGenres.map((g) => ({ value: g, label: g })),
                ]}
                placeholder=""
                className="w-40"
              />

              {hasActiveFilters && (
                <Button variant="ghost" size="md" onClick={resetFilters}>
                  Réinitialiser
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Contenu principal */}
      {view === 'stats' ? (
        <BookStats books={books} />
      ) : (
        <BookTable
          books={displayedBooks}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Modal de formulaire */}
      <BookForm
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        onSave={handleSave}
        initialData={formModal.data}
      />
    </div>
  )
}

export default LibraryModule