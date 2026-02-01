/**
 * Composant VehicleDetail - Détail d'un véhicule
 */

import { useState, useMemo } from 'react'
import {
  Plus,
  Gauge,
  Calendar,
  Wrench,
  Euro,
  AlertTriangle,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Card, Badge, Button, Input, ConfirmDialog } from '../../../components/common'
import { useBoolean, useForm } from '../../../hooks'
import {
  formatMileage,
  formatPrice,
  formatShortDate,
  formatRelativeDate,
  cn,
} from '../../../utils/helpers'
import { INTERVENTION_TYPES, FUEL_TYPES } from '../../../utils/constants'

const VehicleDetail = ({
  vehicle,
  interventions,
  onAddIntervention,
  onEditIntervention,
  onDeleteIntervention,
  onUpdateMileage,
}) => {
  const [showMileageEdit, { toggle: toggleMileageEdit, setFalse: hideMileageEdit }] = useBoolean(false)
  const [expandedIntervention, setExpandedIntervention] = useState(null)

  const fuelType = FUEL_TYPES.find((f) => f.id === vehicle.fuelType)

  // Stats
  const stats = useMemo(() => {
    const totalCost = interventions.reduce((sum, i) => sum + (i.cost || 0), 0)
    const thisYear = interventions.filter(
      (i) => new Date(i.date).getFullYear() === new Date().getFullYear()
    )
    const thisYearCost = thisYear.reduce((sum, i) => sum + (i.cost || 0), 0)

    // Prochains rappels - uniquement ceux avec showInReminders = true
    const upcomingReminders = interventions.filter((i) => {
      // Doit avoir showInReminders activé
      if (!i.showInReminders) return false
      
      // Doit avoir au moins une date ou un km de rappel
      if (!i.nextDueDate && !i.nextDueMileage) return false
      
      // Si date de rappel, vérifier qu'elle n'est pas passée
      if (i.nextDueDate) {
        const dueDate = new Date(i.nextDueDate)
        dueDate.setHours(0, 0, 0, 0)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (dueDate < today) return false
      }
      
      // Si kilométrage de rappel, vérifier qu'il n'est pas dépassé
      if (i.nextDueMileage && vehicle?.currentMileage) {
        if (i.nextDueMileage <= vehicle.currentMileage) return false
      }
      
      return true
    })

    return {
      totalCost,
      thisYearCost,
      totalInterventions: interventions.length,
      upcomingReminders,
    }
  }, [interventions, vehicle?.currentMileage])

  // Formulaire de kilométrage
  const { values, handleChange, handleSubmit } = useForm(
    { mileage: vehicle.currentMileage },
    (data) => {
      onUpdateMileage(parseInt(data.mileage, 10))
      hideMileageEdit()
    }
  )

  return (
    <div className="space-y-6">
      {/* Header véhicule */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-display font-bold text-surface-900 dark:text-white">
              {vehicle.name}
            </h2>
            <p className="text-surface-500 dark:text-surface-400">
              {vehicle.brand} {vehicle.model} {vehicle.year && `(${vehicle.year})`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="primary" size="lg">
              {vehicle.licensePlate}
            </Badge>
            {fuelType && (
              <Badge variant="neutral" size="lg">
                {fuelType.label}
              </Badge>
            )}
          </div>
        </div>

        {/* Kilométrage */}
        <div className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-900 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/50 rounded-xl">
              <Gauge className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-surface-500">Kilométrage actuel</p>
              {showMileageEdit ? (
                <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-1">
                  <Input
                    name="mileage"
                    type="number"
                    min="0"
                    value={values.mileage}
                    onChange={handleChange}
                    className="w-32"
                  />
                  <Button type="submit" size="sm">
                    OK
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={hideMileageEdit}>
                    Annuler
                  </Button>
                </form>
              ) : (
                <p className="text-2xl font-display font-bold text-surface-900 dark:text-white">
                  {formatMileage(vehicle.currentMileage)}
                </p>
              )}
            </div>
          </div>

          {!showMileageEdit && (
            <Button variant="ghost" size="sm" onClick={toggleMileageEdit}>
              Mettre à jour
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="text-center p-3 bg-surface-50 dark:bg-surface-900 rounded-xl">
            <Wrench className="h-5 w-5 text-surface-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-surface-900 dark:text-white">
              {stats.totalInterventions}
            </p>
            <p className="text-xs text-surface-500">Interventions</p>
          </div>

          <div className="text-center p-3 bg-surface-50 dark:bg-surface-900 rounded-xl">
            <Euro className="h-5 w-5 text-surface-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-surface-900 dark:text-white">
              {formatPrice(stats.totalCost)}
            </p>
            <p className="text-xs text-surface-500">Total dépensé</p>
          </div>

          <div className="text-center p-3 bg-surface-50 dark:bg-surface-900 rounded-xl">
            <Calendar className="h-5 w-5 text-surface-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-surface-900 dark:text-white">
              {formatPrice(stats.thisYearCost)}
            </p>
            <p className="text-xs text-surface-500">Cette année</p>
          </div>

          <div className="text-center p-3 bg-surface-50 dark:bg-surface-900 rounded-xl">
            <AlertTriangle className="h-5 w-5 text-warning mx-auto mb-1" />
            <p className="text-xl font-bold text-surface-900 dark:text-white">
              {stats.upcomingReminders.length}
            </p>
            <p className="text-xs text-surface-500">Rappels</p>
          </div>
        </div>
      </Card>

      {/* Rappels à venir */}
      {stats.upcomingReminders.length > 0 && (
        <Card className="border-warning bg-warning-light/30 dark:bg-amber-900/20">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h3 className="font-semibold text-surface-900 dark:text-white">
              Rappels à venir
            </h3>
          </div>
          <div className="space-y-2">
            {stats.upcomingReminders.map((intervention) => {
              const type = INTERVENTION_TYPES.find((t) => t.id === intervention.type)
              
              // Construire le texte du rappel
              const reminderParts = []
              if (intervention.nextDueDate) {
                reminderParts.push(formatRelativeDate(intervention.nextDueDate))
              }
              if (intervention.nextDueMileage) {
                const kmText = `à ${formatMileage(intervention.nextDueMileage)}`
                if (intervention.nextDueDate) {
                  reminderParts.push(`ou ${kmText}`)
                } else {
                  reminderParts.push(kmText)
                }
              }
              
              return (
                <div
                  key={intervention.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-surface-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-surface-900 dark:text-white">
                      {type?.label || intervention.type}
                    </p>
                    <p className="text-sm text-surface-500">
                      {reminderParts.join(' ')}
                    </p>
                  </div>
                  <Badge variant="warning" size="sm">
                    À prévoir
                  </Badge>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Historique des interventions */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
            Historique des interventions
          </h3>
          <Button size="sm" leftIcon={Plus} onClick={onAddIntervention}>
            Ajouter
          </Button>
        </div>

        {interventions.length > 0 ? (
          <div className="space-y-3">
            {interventions.map((intervention) => (
              <InterventionItem
                key={intervention.id}
                intervention={intervention}
                isExpanded={expandedIntervention === intervention.id}
                onToggle={() =>
                  setExpandedIntervention(
                    expandedIntervention === intervention.id ? null : intervention.id
                  )
                }
                onEdit={() => onEditIntervention(intervention)}
                onDelete={() => onDeleteIntervention(intervention.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-surface-500 dark:text-surface-400 py-8">
            Aucune intervention enregistrée
          </p>
        )}
      </Card>
    </div>
  )
}

// Composant InterventionItem
const InterventionItem = ({ intervention, isExpanded, onToggle, onEdit, onDelete }) => {
  const [deleteConfirmOpen, { setTrue: openDeleteConfirm, setFalse: closeDeleteConfirm }] = useBoolean(false)
  
  const type = INTERVENTION_TYPES.find((t) => t.id === intervention.type)

  const handleDelete = () => {
    closeDeleteConfirm()
    onDelete()
  }

  return (
    <>
      <div className="border border-surface-200 dark:border-surface-700 rounded-xl overflow-hidden">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between p-4 hover:bg-surface-50 dark:hover:bg-surface-900 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-surface-100 dark:bg-surface-800 rounded-lg">
              <Wrench className="h-4 w-4 text-surface-500" />
            </div>
            <div className="text-left">
              <p className="font-medium text-surface-900 dark:text-white">
                {type?.label || intervention.type}
              </p>
              <p className="text-sm text-surface-500">
                {formatShortDate(intervention.date)} • {formatMileage(intervention.mileage)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="success" size="sm">
              {formatPrice(intervention.cost)}
            </Badge>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-surface-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-surface-400" />
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 border-t border-surface-200 dark:border-surface-700 pt-4">
            {intervention.description && (
              <p className="text-sm text-surface-600 dark:text-surface-400 mb-3">
                {intervention.description}
              </p>
            )}

            {intervention.location && (
              <p className="text-sm text-surface-500 mb-3">
                📍 {intervention.location}
              </p>
            )}

            {intervention.notes && (
              <p className="text-sm text-surface-500 mb-3 italic">
                {intervention.notes}
              </p>
            )}

            {(intervention.nextDueDate || intervention.nextDueMileage) && (
              <div className="p-3 bg-warning-light/50 dark:bg-amber-900/30 rounded-lg mb-3">
                <p className="text-sm font-medium text-warning-dark dark:text-amber-300">
                  Prochain rappel:
                  {intervention.nextDueDate && (
                    <span className="ml-1">{formatShortDate(intervention.nextDueDate)}</span>
                  )}
                  {intervention.nextDueMileage && (
                    <span className="ml-1">
                      {intervention.nextDueDate ? ' ou ' : ''} à {formatMileage(intervention.nextDueMileage)}
                    </span>
                  )}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" leftIcon={Edit2} onClick={onEdit}>
                Modifier
              </Button>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={Trash2}
                onClick={openDeleteConfirm}
                className="text-danger hover:bg-danger-light dark:hover:bg-red-900/30"
              >
                Supprimer
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation de suppression */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={closeDeleteConfirm}
        onConfirm={handleDelete}
        title="Supprimer cette intervention ?"
        message="Cette intervention sera définitivement supprimée."
        confirmText="Supprimer"
        variant="danger"
      />
    </>
  )
}

export default VehicleDetail