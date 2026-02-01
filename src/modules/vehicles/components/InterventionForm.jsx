/**
 * Composant InterventionForm - Formulaire d'intervention
 */

import { useEffect } from 'react'
import { Modal, Input, Select, Textarea, Button, Checkbox } from '../../../components/common'
import { useForm } from '../../../hooks'
import { INTERVENTION_TYPES } from '../../../utils/constants'

const defaultValues = {
  type: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  mileage: '',
  cost: '',
  location: '',
  notes: '',
  nextDueDate: '',
  nextDueMileage: '',
  showInReminders: false,
}

const InterventionForm = ({ isOpen, onClose, onSave, initialData, vehicle }) => {
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
    if (!data.type) {
      setFieldError('type', "Le type d'intervention est requis")
      throw new Error('Validation failed')
    }
    if (!data.date) {
      setFieldError('date', 'La date est requise')
      throw new Error('Validation failed')
    }

    // Formatage
    const formattedData = {
      vehicleId: initialData?.vehicleId || vehicle?.id,
      type: data.type,
      description: data.description.trim(),
      date: new Date(data.date).toISOString(),
      mileage: data.mileage ? parseInt(data.mileage, 10) : vehicle?.currentMileage || 0,
      cost: data.cost ? parseFloat(data.cost) : 0,
      location: data.location.trim() || null,
      notes: data.notes.trim() || null,
      nextDueDate: data.nextDueDate ? new Date(data.nextDueDate).toISOString() : null,
      nextDueMileage: data.nextDueMileage ? parseInt(data.nextDueMileage, 10) : null,
      showInReminders: data.showInReminders,
      documents: initialData?.documents || [],
    }

    onSave(formattedData)
  })

  // Initialiser le formulaire
  useEffect(() => {
    if (isOpen) {
      if (initialData?.id) {
        // Mode édition
        reset({
          type: initialData.type || '',
          description: initialData.description || '',
          date: initialData.date
            ? new Date(initialData.date).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          mileage: initialData.mileage || '',
          cost: initialData.cost || '',
          location: initialData.location || '',
          notes: initialData.notes || '',
          nextDueDate: initialData.nextDueDate
            ? new Date(initialData.nextDueDate).toISOString().split('T')[0]
            : '',
          nextDueMileage: initialData.nextDueMileage || '',
          showInReminders: initialData.showInReminders || false,
        })
      } else {
        // Mode création
        reset({
          ...defaultValues,
          mileage: vehicle?.currentMileage || '',
        })
      }
    }
  }, [isOpen, initialData, vehicle, reset])

  const typeOptions = INTERVENTION_TYPES.map((t) => ({
    value: t.id,
    label: t.label,
  }))

  const hasReminderData = values.nextDueDate || values.nextDueMileage

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Modifier l'intervention" : 'Nouvelle intervention'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Type d'intervention"
          name="type"
          value={values.type}
          onChange={handleChange}
          error={errors.type}
          options={typeOptions}
          placeholder="Sélectionner le type"
          required
        />

        <Input
          label="Description"
          name="description"
          value={values.description}
          onChange={handleChange}
          placeholder="Détails de l'intervention"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Date"
            name="date"
            type="date"
            value={values.date}
            onChange={handleChange}
            error={errors.date}
            required
          />

          <Input
            label="Kilométrage"
            name="mileage"
            type="number"
            min="0"
            value={values.mileage}
            onChange={handleChange}
            placeholder={vehicle?.currentMileage?.toString() || '0'}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Coût (€)"
            name="cost"
            type="number"
            min="0"
            step="0.01"
            value={values.cost}
            onChange={handleChange}
            placeholder="0.00"
          />

          <Input
            label="Lieu / Garage"
            name="location"
            value={values.location}
            onChange={handleChange}
            placeholder="Nom du garage"
          />
        </div>

        <Textarea
          label="Notes"
          name="notes"
          value={values.notes}
          onChange={handleChange}
          placeholder="Remarques, numéro de facture..."
          rows={2}
        />

        {/* Section Rappel - Toujours visible */}
        <div className="border-t border-surface-200 dark:border-surface-700 pt-4">
          <h4 className="font-medium text-surface-900 dark:text-white mb-3">
            Prochain rappel (optionnel)
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date du prochain rappel"
              name="nextDueDate"
              type="date"
              value={values.nextDueDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
            />

            <Input
              label="Kilométrage du prochain rappel"
              name="nextDueMileage"
              type="number"
              min={values.mileage || vehicle?.currentMileage || 0}
              value={values.nextDueMileage}
              onChange={handleChange}
              placeholder="Ex: 150000"
            />
          </div>

          {/* Case à cocher - visible uniquement si date ou km renseigné */}
          {hasReminderData && (
            <div className="mt-4">
              <Checkbox
                label="Afficher dans les rappels à venir"
                checked={values.showInReminders}
                onChange={() => setValue('showInReminders', !values.showInReminders)}
              />
              <p className="text-xs text-surface-500 ml-6 mt-1">
                Le rappel apparaîtra dans la section "Rappels à venir" du véhicule
              </p>
            </div>
          )}
        </div>

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

export default InterventionForm