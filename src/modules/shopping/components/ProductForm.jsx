/**
 * Composant ProductForm - Formulaire d'ajout/édition de produit personnalisé
 */

import { useEffect } from 'react'
import { Modal, Input, Select, Button } from '../../../components/common'
import { useForm } from '../../../hooks'
import { SHOPPING_CATEGORIES } from '../data/defaultProducts'

const defaultValues = {
  name: '',
  categoryId: '',
}

const ProductForm = ({ isOpen, onClose, onSave, initialData }) => {
  const isEditing = Boolean(initialData?.id)

  const {
    values,
    errors,
    handleChange,
    setFieldError,
    reset,
    handleSubmit,
  } = useForm(defaultValues, async (data) => {
    // Validation
    if (!data.name.trim()) {
      setFieldError('name', 'Le nom est requis')
      throw new Error('Validation failed')
    }

    if (!data.categoryId) {
      setFieldError('categoryId', 'La catégorie est requise')
      throw new Error('Validation failed')
    }

    onSave({
      ...data,
      name: data.name.trim(),
    })
  })

  // Initialiser le formulaire
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name || '',
          categoryId: initialData.categoryId || '',
        })
      } else {
        reset(defaultValues)
      }
    }
  }, [isOpen, initialData, reset])

  const categoryOptions = SHOPPING_CATEGORIES.map((c) => ({
    value: c.id,
    label: `${c.icon} ${c.label}`,
  }))

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Modifier le produit' : 'Ajouter un produit'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nom du produit"
          name="name"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Ex: Lait d'amande bio"
          autoFocus
          required
        />

        <Select
          label="Catégorie"
          name="categoryId"
          value={values.categoryId}
          onChange={handleChange}
          error={errors.categoryId}
          options={categoryOptions}
          placeholder="Sélectionner une catégorie"
          required
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
  )
}

export default ProductForm