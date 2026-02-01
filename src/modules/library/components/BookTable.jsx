/**
 * Composant BookTable - Affichage des livres en tableau
 * Trié par ordre alphabétique du titre
 */

import { useMemo, useState } from 'react'
import { Edit2, Trash2, ChevronUp, ChevronDown, BookOpen } from 'lucide-react'
import { Badge, ConfirmDialog, StarRating } from '../../../components/common'
import { useBoolean } from '../../../hooks'
import { cn, formatShortDate } from '../../../utils/helpers'
import {
  BOOK_STATUS,
  BOOK_STATUS_LABELS,
  BOOK_STATUS_COLORS,
} from '../../../utils/constants'

const BookTable = ({ books, onEdit, onDelete, onStatusChange }) => {
  const [sortOrder, setSortOrder] = useState('asc') // 'asc' ou 'desc'
  const [deleteBook, setDeleteBook] = useState(null)
  const [deleteConfirmOpen, { setTrue: openDeleteConfirm, setFalse: closeDeleteConfirm }] = useBoolean(false)

  // Trier les livres par titre
  const sortedBooks = useMemo(() => {
    return [...books].sort((a, b) => {
      const titleA = (a.title || '').toLowerCase()
      const titleB = (b.title || '').toLowerCase()
      
      if (sortOrder === 'asc') {
        return titleA.localeCompare(titleB, 'fr')
      } else {
        return titleB.localeCompare(titleA, 'fr')
      }
    })
  }, [books, sortOrder])

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const handleDeleteClick = (book) => {
    setDeleteBook(book)
    openDeleteConfirm()
  }

  const handleConfirmDelete = () => {
    if (deleteBook) {
      onDelete(deleteBook.id)
    }
    closeDeleteConfirm()
    setDeleteBook(null)
  }

  // Icône de statut
  const getStatusIcon = (status) => {
    switch (status) {
      case BOOK_STATUS.READ:
        return '✓'
      case BOOK_STATUS.READING:
        return '📖'
      case BOOK_STATUS.TO_READ:
        return '📚'
      case BOOK_STATUS.ABANDONED:
        return '✗'
      default:
        return ''
    }
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
        <p className="text-surface-500 dark:text-surface-400">
          Aucun livre dans votre bibliothèque
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white dark:bg-surface-800 rounded-xl shadow-soft overflow-hidden">
        {/* Version desktop - Tableau */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-50 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700">
                <th className="text-left px-4 py-3">
                  <button
                    onClick={toggleSortOrder}
                    className="flex items-center gap-1 text-sm font-semibold text-surface-700 dark:text-surface-300 hover:text-primary-600 transition-colors"
                  >
                    Titre
                    {sortOrder === 'asc' ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-surface-700 dark:text-surface-300">
                  Auteur
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-surface-700 dark:text-surface-300">
                  Genre
                </th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-surface-700 dark:text-surface-300">
                  Note
                </th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-surface-700 dark:text-surface-300">
                  Statut
                </th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-surface-700 dark:text-surface-300">
                  Pages
                </th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-surface-700 dark:text-surface-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedBooks.map((book, index) => (
                <tr
                  key={book.id}
                  className={cn(
                    'border-b border-surface-100 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors',
                    index % 2 === 0 ? 'bg-white dark:bg-surface-800' : 'bg-surface-25 dark:bg-surface-800/50'
                  )}
                >
                  {/* Titre */}
                  <td className="px-4 py-3">
                    <span className="font-medium text-surface-900 dark:text-surface-100">
                      {book.title}
                    </span>
                  </td>

                  {/* Auteur */}
                  <td className="px-4 py-3 text-surface-600 dark:text-surface-400">
                    {book.author || '-'}
                  </td>

                  {/* Genre */}
                  <td className="px-4 py-3">
                    {book.genre ? (
                      <Badge variant="neutral" size="sm">
                        {book.genre}
                      </Badge>
                    ) : (
                      <span className="text-surface-400">-</span>
                    )}
                  </td>

                  {/* Note */}
                  <td className="px-4 py-3 text-center">
                    {book.rating ? (
                      <StarRating value={book.rating} readonly size="sm" />
                    ) : (
                      <span className="text-surface-400 text-sm">-</span>
                    )}
                  </td>

                  {/* Statut */}
                  <td className="px-4 py-3 text-center">
                    <select
                      value={book.status}
                      onChange={(e) => onStatusChange(book.id, e.target.value)}
                      className={cn(
                        'text-xs font-medium px-2 py-1 rounded-lg border-0 cursor-pointer',
                        'focus:outline-none focus:ring-2 focus:ring-primary-500',
                        book.status === BOOK_STATUS.READ && 'bg-success-light text-success dark:bg-green-900/30 dark:text-green-400',
                        book.status === BOOK_STATUS.READING && 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
                        book.status === BOOK_STATUS.TO_READ && 'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-400',
                        book.status === BOOK_STATUS.ABANDONED && 'bg-danger-light text-danger dark:bg-red-900/30 dark:text-red-400'
                      )}
                    >
                      {Object.entries(BOOK_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {getStatusIcon(value)} {label}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Pages */}
                  <td className="px-4 py-3 text-center text-sm text-surface-600 dark:text-surface-400">
                    {book.currentPage && book.pageCount ? (
                      <span>
                        {book.currentPage}/{book.pageCount}
                      </span>
                    ) : book.pageCount ? (
                      <span>{book.pageCount}</span>
                    ) : (
                      <span className="text-surface-400">-</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(book)}
                        className="p-2 text-surface-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                        aria-label="Modifier"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(book)}
                        className="p-2 text-surface-500 hover:text-danger hover:bg-danger-light dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Version mobile - Liste compacte */}
        <div className="md:hidden divide-y divide-surface-100 dark:divide-surface-700">
          {sortedBooks.map((book) => (
            <div key={book.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-surface-900 dark:text-surface-100 truncate">
                    {book.title}
                  </h4>
                  <p className="text-sm text-surface-500 dark:text-surface-400 truncate">
                    {book.author}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant={BOOK_STATUS_COLORS[book.status]} size="sm">
                      {BOOK_STATUS_LABELS[book.status]}
                    </Badge>
                    {book.rating && <StarRating value={book.rating} readonly size="sm" />}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(book)}
                    className="p-2 text-surface-500 hover:text-primary-600 rounded-lg"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(book)}
                    className="p-2 text-surface-500 hover:text-danger rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation de suppression */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          closeDeleteConfirm()
          setDeleteBook(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Supprimer ce livre ?"
        message={`"${deleteBook?.title}" sera définitivement supprimé de votre bibliothèque.`}
        confirmText="Supprimer"
        variant="danger"
      />
    </>
  )
}

export default BookTable