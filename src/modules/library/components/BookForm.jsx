/**
 * Composant BookForm - Formulaire d'ajout/édition de livre
 * Avec option de scan ISBN
 */

import { useEffect, useState } from 'react'
import { Scan, Search, Loader2 } from 'lucide-react'
import {
  Modal,
  Input,
  Select,
  Textarea,
  Button,
  StarRating,
} from '../../../components/common'
import { useForm, useBoolean } from '../../../hooks'
import {
  BOOK_STATUS,
  BOOK_STATUS_LABELS,
  DEFAULT_BOOK_GENRES,
} from '../../../utils/constants'
import { fetchBookByISBN } from '../../../services/bookApi'
import BookScanner from './BookScanner'

const defaultValues = {
  title: '',
  author: '',
  isbn: '',
  genre: '',
  status: BOOK_STATUS.TO_READ,
  rating: 0,
  startDate: '',
  endDate: '',
  notes: '',
  coverUrl: '',
  pageCount: '',
  currentPage: '',
}

const BookForm = ({ isOpen, onClose, onSave, initialData }) => {
  const isEditing = Boolean(initialData?.id)
  
  // États pour le scanner et la recherche
  const [scannerOpen, { setTrue: openScanner, setFalse: closeScanner }] = useBoolean(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)

  const {
    values,
    errors,
    handleChange,
    setValue,
    setFieldError,
    reset,
    setValues,
    handleSubmit,
  } = useForm(defaultValues, async (data) => {
    // Validation
    if (!data.title.trim()) {
      setFieldError('title', 'Le titre est requis')
      throw new Error('Validation failed')
    }
    if (!data.author.trim()) {
      setFieldError('author', "L'auteur est requis")
      throw new Error('Validation failed')
    }

    // Formatage
    const formattedData = {
      ...data,
      title: data.title.trim(),
      author: data.author.trim(),
      isbn: data.isbn.trim() || null,
      pageCount: data.pageCount ? parseInt(data.pageCount, 10) : null,
      currentPage: data.currentPage ? parseInt(data.currentPage, 10) : null,
      rating: data.rating || null,
      startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
      endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
      coverUrl: data.coverUrl.trim() || null,
    }

    onSave(formattedData)
  })

  // Initialiser le formulaire
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          title: initialData.title || '',
          author: initialData.author || '',
          isbn: initialData.isbn || '',
          genre: initialData.genre || '',
          status: initialData.status || BOOK_STATUS.TO_READ,
          rating: initialData.rating || 0,
          startDate: initialData.startDate
            ? new Date(initialData.startDate).toISOString().split('T')[0]
            : '',
          endDate: initialData.endDate
            ? new Date(initialData.endDate).toISOString().split('T')[0]
            : '',
          notes: initialData.notes || '',
          coverUrl: initialData.coverUrl || '',
          pageCount: initialData.pageCount || '',
          currentPage: initialData.currentPage || '',
        })
      } else {
        reset(defaultValues)
      }
      setSearchError(null)
    }
  }, [isOpen, initialData, reset])

  // Gérer le scan d'un ISBN
  const handleScan = async (isbn) => {
    setIsSearching(true)
    setSearchError(null)
    
    try {
      const bookData = await fetchBookByISBN(isbn)
      
      if (bookData) {
        // Remplir le formulaire avec les données trouvées
        setValues({
          ...values,
          title: bookData.title || values.title,
          author: bookData.author || values.author,
          isbn: bookData.isbn || isbn,
          genre: bookData.genre || values.genre,
          coverUrl: bookData.coverUrl || values.coverUrl,
          pageCount: bookData.pageCount || values.pageCount,
        })
        closeScanner()
      } else {
        setSearchError('Livre non trouvé. Essayez de saisir les informations manuellement.')
        // Remplir au moins l'ISBN
        setValue('isbn', isbn)
        closeScanner()
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
      setSearchError('Erreur lors de la recherche. Veuillez réessayer.')
      setValue('isbn', isbn)
      closeScanner()
    } finally {
      setIsSearching(false)
    }
  }

  // Rechercher par ISBN saisi manuellement
  const handleManualSearch = async () => {
    if (!values.isbn.trim()) {
      setFieldError('isbn', 'Saisissez un ISBN')
      return
    }
    
    setIsSearching(true)
    setSearchError(null)
    
    try {
      const bookData = await fetchBookByISBN(values.isbn)
      
      if (bookData) {
        setValues({
          ...values,
          title: bookData.title || values.title,
          author: bookData.author || values.author,
          isbn: bookData.isbn || values.isbn,
          genre: bookData.genre || values.genre,
          coverUrl: bookData.coverUrl || values.coverUrl,
          pageCount: bookData.pageCount || values.pageCount,
        })
      } else {
        setSearchError('Livre non trouvé pour cet ISBN.')
      }
    } catch (error) {
      setSearchError('Erreur lors de la recherche.')
    } finally {
      setIsSearching(false)
    }
  }

  const statusOptions = Object.entries(BOOK_STATUS_LABELS).map(
    ([value, label]) => ({
      value,
      label,
    })
  )

  const genreOptions = DEFAULT_BOOK_GENRES.map((g) => ({
    value: g,
    label: g,
  }))

  return (
    <>
      <Modal
        isOpen={isOpen && !scannerOpen}
        onClose={onClose}
        title={isEditing ? 'Modifier le livre' : 'Ajouter un livre'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Boutons de scan/recherche pour un nouveau livre */}
          {!isEditing && (
            <div className="flex flex-col sm:flex-row gap-3 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
              <Button
                type="button"
                variant="primary"
                leftIcon={Scan}
                onClick={openScanner}
                className="flex-1"
              >
                Scanner le code-barres
              </Button>
              <div className="flex items-center gap-2 text-surface-400 text-sm">
                <span className="hidden sm:inline">ou</span>
              </div>
              <div className="flex-1 flex gap-2">
                <Input
                  name="isbn"
                  value={values.isbn}
                  onChange={handleChange}
                  placeholder="Saisir l'ISBN..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleManualSearch}
                  disabled={isSearching}
                  aria-label="Rechercher"
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Message d'erreur de recherche */}
          {searchError && (
            <div className="p-3 bg-warning-light dark:bg-amber-900/30 text-warning-dark dark:text-amber-300 rounded-lg text-sm">
              {searchError}
            </div>
          )}

          {/* Aperçu de la couverture si disponible */}
          {values.coverUrl && (
            <div className="flex justify-center">
              <img
                src={values.coverUrl}
                alt="Couverture"
                className="h-32 rounded-lg shadow-soft object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Titre"
              name="title"
              value={values.title}
              onChange={handleChange}
              error={errors.title}
              placeholder="Le titre du livre"
              autoFocus={isEditing}
              required
            />

            <Input
              label="Auteur"
              name="author"
              value={values.author}
              onChange={handleChange}
              error={errors.author}
              placeholder="Nom de l'auteur"
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Genre"
              name="genre"
              value={values.genre}
              onChange={handleChange}
              options={genreOptions}
              placeholder="Sélectionner un genre"
            />

            <Select
              label="Statut"
              name="status"
              value={values.status}
              onChange={handleChange}
              options={statusOptions}
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              label="ISBN"
              name="isbn"
              value={values.isbn}
              onChange={handleChange}
              placeholder="978-..."
            />

            <Input
              label="Nombre de pages"
              name="pageCount"
              type="number"
              min="1"
              value={values.pageCount}
              onChange={handleChange}
              placeholder="300"
            />

            <Input
              label="Page actuelle"
              name="currentPage"
              type="number"
              min="0"
              max={values.pageCount || undefined}
              value={values.currentPage}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Date de début"
              name="startDate"
              type="date"
              value={values.startDate}
              onChange={handleChange}
            />

            <Input
              label="Date de fin"
              name="endDate"
              type="date"
              value={values.endDate}
              onChange={handleChange}
            />
          </div>

          <Input
            label="URL de la couverture"
            name="coverUrl"
            type="url"
            value={values.coverUrl}
            onChange={handleChange}
            placeholder="https://..."
            helperText="Rempli automatiquement si trouvé via ISBN"
          />

          <div>
            <label className="label">Note</label>
            <StarRating
              value={values.rating}
              onChange={(rating) => setValue('rating', rating)}
            />
          </div>

          <Textarea
            label="Notes personnelles"
            name="notes"
            value={values.notes}
            onChange={handleChange}
            placeholder="Vos impressions, citations préférées..."
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {isEditing ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal du scanner */}
      <BookScanner
        isOpen={scannerOpen}
        onClose={closeScanner}
        onScan={handleScan}
        isLoading={isSearching}
      />
    </>
  )
}

export default BookForm