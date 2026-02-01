/**
 * Composant VehicleForm - Formulaire de véhicule
 */

import { useEffect } from 'react'
import { Modal, Input, Select, Button } from '../../../components/common'
import { useForm } from '../../../hooks'
import { FUEL_TYPES } from '../../../utils/constants'

const defaultValues = {
  name: '',
  brand: '',
  model: '',
  year: '',
  licensePlate: '',
  currentMileage: '',
  fuelType: '',
  purchaseDate: '',
}

const VehicleForm = ({ isOpen, onClose, onSave, initialData }) => {
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
    if (!data.brand.trim()) {
      setFieldError('brand', 'La marque est requise')
      throw new Error('Validation failed')
    }
    if (!data.licensePlate.trim()) {
      setFieldError('licensePlate', "L'immatriculation est requise")
      throw new Error('Validation failed')
    }

    // Formatage
    const formattedData = {
      ...data,
      name: data.name.trim(),
      brand: data.brand.trim(),
      model: data.model.trim(),
      licensePlate: data.licensePlate.trim().toUpperCase(),
      year: data.year ? parseInt(data.year, 10) : null,
      currentMileage: data.currentMileage ? parseInt(data.currentMileage, 10) : 0,
      purchaseDate: data.purchaseDate
        ? new Date(data.purchaseDate).toISOString()
        : null,
    }

    onSave(formattedData)
  })

  // Initialiser le formulaire
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name || '',
          brand: initialData.brand || '',
          model: initialData.model || '',
          year: initialData.year || '',
          licensePlate: initialData.licensePlate || '',
          currentMileage: initialData.currentMileage || '',
          fuelType: initialData.fuelType || '',
          purchaseDate: initialData.purchaseDate
            ? new Date(initialData.purchaseDate).toISOString().split('T')[0]
            : '',
        })
      } else {
        reset(defaultValues)
      }
    }
  }, [isOpen, initialData, reset])

  const fuelOptions = FUEL_TYPES.map((f) => ({
    value: f.id,
    label: f.label,
  }))

  const currentYear = new Date().getFullYear()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nom du véhicule"
          name="name"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Ex: Ma voiture principale"
          autoFocus
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Marque"
            name="brand"
            value={values.brand}
            onChange={handleChange}
            error={errors.brand}
            placeholder="Ex: Volkswagen"
            required
          />

          <Input
            label="Modèle"
            name="model"
            value={values.model}
            onChange={handleChange}
            placeholder="Ex: Tiguan"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Immatriculation"
            name="licensePlate"
            value={values.licensePlate}
            onChange={handleChange}
            error={errors.licensePlate}
            placeholder="AA-123-BB"
            required
          />

          <Input
            label="Année"
            name="year"
            type="number"
            min="1900"
            max={currentYear + 1}
            value={values.year}
            onChange={handleChange}
            placeholder={currentYear.toString()}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Carburant"
            name="fuelType"
            value={values.fuelType}
            onChange={handleChange}
            options={fuelOptions}
            placeholder="Sélectionner"
          />

          <Input
            label="Kilométrage actuel"
            name="currentMileage"
            type="number"
            min="0"
            value={values.currentMileage}
            onChange={handleChange}
            placeholder="0"
          />
        </div>

        <Input
          label="Date d'achat"
          name="purchaseDate"
          type="date"
          value={values.purchaseDate}
          onChange={handleChange}
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

export default VehicleForm