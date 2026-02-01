/**
 * Composant TodoForm - Formulaire d'ajout/édition de tâche
 */

import { useEffect } from 'react'
import { Modal, Input, Select, Textarea, Button } from '../../../components/common'
import { useForm } from '../../../hooks'
import {
  PRIORITIES,
  PRIORITY_LABELS,
  DEFAULT_TODO_CATEGORIES,
} from '../../../utils/constants'

const defaultValues = {
  title: '',
  description: '',
  category: 'personal',
  priority: PRIORITIES.MEDIUM,
  dueDate: '',
  dueTime: '',
}

const TodoForm = ({ isOpen, onClose, onSave, initialData }) => {
  const isEditing = Boolean(initialData?.id)

  const {
    values,
    errors,
    handleChange,
    setValue,
    setFieldError,
    reset,
    handleSubmit,
  } = useForm(defaultValues, async (data) => {
    // Validation
    if (!data.title.trim()) {
      setFieldError('title', 'Le titre est requis')
      throw new Error('Validation failed')
    }

    // Formatage de la date
    const formattedData = {
      ...data,
      title: data.title.trim(),
      description: data.description.trim(),
      dueDate: data.dueDate || null,
      dueTime: data.dueTime || null,
    }

    onSave(formattedData)
  })

  // Initialiser le formulaire
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          title: initialData.title || '',
          description: initialData.description || '',
          category: initialData.category || 'personal',
          priority: initialData.priority || PRIORITIES.MEDIUM,
          dueDate: initialData.dueDate
            ? new Date(initialData.dueDate).toISOString().split('T')[0]
            : '',
          dueTime: initialData.dueTime || '',
        })
      } else {
        reset(defaultValues)
      }
    }
  }, [isOpen, initialData, reset])

  const priorityOptions = Object.entries(PRIORITY_LABELS).map(([value, label]) => ({
    value,
    label,
  }))

  const categoryOptions = DEFAULT_TODO_CATEGORIES.map((c) => ({
    value: c.id,
    label: c.label,
  }))

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Modifier la tâche' : 'Nouvelle tâche'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Titre"
          name="title"
          value={values.title}
          onChange={handleChange}
          error={errors.title}
          placeholder="Qu'avez-vous à faire ?"
          autoFocus
          required
        />

        <Textarea
          label="Description"
          name="description"
          value={values.description}
          onChange={handleChange}
          placeholder="Détails supplémentaires (optionnel)"
          rows={3}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Priorité"
            name="priority"
            value={values.priority}
            onChange={handleChange}
            options={priorityOptions}
          />

          <Select
            label="Catégorie"
            name="category"
            value={values.category}
            onChange={handleChange}
            options={categoryOptions}
          />
        </div>

        {/* Date et Heure d'échéance */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Date d'échéance"
            name="dueDate"
            type="date"
            value={values.dueDate}
            onChange={handleChange}
          />
          
          <Input
            label="Heure (optionnel)"
            name="dueTime"
            type="time"
            value={values.dueTime}
            onChange={handleChange}
            helperText="Pour les rendez-vous"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit">
            {isEditing ? 'Enregistrer' : 'Créer la tâche'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default TodoForm