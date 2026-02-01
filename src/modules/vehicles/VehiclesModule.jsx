/**
 * Module Véhicules - Composant principal
 */

import { useState, useMemo, useCallback } from 'react'
import { Plus, Car, Wrench } from 'lucide-react'
import { useVehicles, useInterventions } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import { useModal } from '../../hooks'
import { Button, Card, EmptyState, Badge } from '../../components/common'
import VehicleCard from './components/VehicleCard'
import VehicleForm from './components/VehicleForm'
import VehicleDetail from './components/VehicleDetail'
import InterventionForm from './components/InterventionForm'
import { formatPrice } from '../../utils/helpers'
import { removeTodosBySource } from '../../services/todoIntegration'

const VehiclesModule = () => {
  const { items: vehicles, add: addVehicle, update: updateVehicle, remove: removeVehicle } = useVehicles()
  const { items: interventions, add: addIntervention, update: updateIntervention, remove: removeIntervention } = useInterventions()
  const { toast } = useToast()

  // Modals
  const vehicleFormModal = useModal()
  const interventionFormModal = useModal()

  // Véhicule sélectionné pour afficher le détail
  const [selectedVehicleId, setSelectedVehicleId] = useState(null)

  // Stats globales
  const stats = useMemo(() => {
    const totalCosts = interventions.reduce((sum, i) => sum + (i.cost || 0), 0)
    const upcomingReminders = interventions.filter((i) => {
      if (!i.nextDueDate) return false
      const dueDate = new Date(i.nextDueDate)
      const today = new Date()
      const thirtyDaysFromNow = new Date(today)
      thirtyDaysFromNow.setDate(today.getDate() + 30)
      return dueDate >= today && dueDate <= thirtyDaysFromNow
    }).length

    return {
      totalVehicles: vehicles.length,
      totalInterventions: interventions.length,
      totalCosts,
      upcomingReminders,
    }
  }, [vehicles, interventions])

  // Véhicule sélectionné
  const selectedVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) || null
  }, [vehicles, selectedVehicleId])

  // Interventions du véhicule sélectionné
  const selectedVehicleInterventions = useMemo(() => {
    if (!selectedVehicleId) return []
    return interventions
      .filter((i) => i.vehicleId === selectedVehicleId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [interventions, selectedVehicleId])

  // Handlers Véhicules
  const handleAddVehicle = useCallback(() => {
    vehicleFormModal.open(null)
  }, [vehicleFormModal])

  const handleEditVehicle = useCallback((vehicle) => {
    vehicleFormModal.open(vehicle)
  }, [vehicleFormModal])

  const handleSaveVehicle = useCallback((data) => {
    if (vehicleFormModal.data) {
      updateVehicle(vehicleFormModal.data.id, data)
      toast.success('Véhicule modifié')
    } else {
      addVehicle(data)
      toast.success('Véhicule ajouté')
    }
    vehicleFormModal.close()
  }, [vehicleFormModal, addVehicle, updateVehicle, toast])

  const handleDeleteVehicle = useCallback((id) => {
    // Supprimer aussi toutes les interventions associées
    const vehicleInterventions = interventions.filter((i) => i.vehicleId === id)
    vehicleInterventions.forEach((intervention) => {
      removeIntervention(intervention.id)
      removeTodosBySource('vehicles', intervention.id)
    })
    
    removeVehicle(id)
    
    if (selectedVehicleId === id) {
      setSelectedVehicleId(null)
    }
    
    toast.success('Véhicule supprimé')
  }, [interventions, removeIntervention, removeVehicle, selectedVehicleId, toast])

  // Handlers Interventions
  const handleAddIntervention = useCallback((vehicleId) => {
    interventionFormModal.open({ vehicleId })
  }, [interventionFormModal])

  const handleEditIntervention = useCallback((intervention) => {
    interventionFormModal.open(intervention)
  }, [interventionFormModal])

  const handleSaveIntervention = useCallback((data) => {
    if (interventionFormModal.data?.id) {
      updateIntervention(interventionFormModal.data.id, data)
      toast.success('Intervention modifiée')
    } else {
      addIntervention(data)
      toast.success('Intervention ajoutée')
    }
    interventionFormModal.close()
  }, [interventionFormModal, addIntervention, updateIntervention, toast])

  const handleDeleteIntervention = useCallback((id) => {
    removeIntervention(id)
    removeTodosBySource('vehicles', id)
    toast.success('Intervention supprimée')
  }, [removeIntervention, toast])

  // Mise à jour du kilométrage
  const handleUpdateMileage = useCallback((vehicleId, mileage) => {
    updateVehicle(vehicleId, { currentMileage: mileage })
    toast.success('Kilométrage mis à jour')
  }, [updateVehicle, toast])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header avec stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Badge variant="primary" size="lg">
            {stats.totalVehicles} véhicule{stats.totalVehicles > 1 ? 's' : ''}
          </Badge>
          <Badge variant="neutral" size="lg">
            {stats.totalInterventions} intervention{stats.totalInterventions > 1 ? 's' : ''}
          </Badge>
          <Badge variant="success" size="lg">
            {formatPrice(stats.totalCosts)} dépensés
          </Badge>
          {stats.upcomingReminders > 0 && (
            <Badge variant="warning" size="lg">
              {stats.upcomingReminders} rappel{stats.upcomingReminders > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <Button onClick={handleAddVehicle} leftIcon={Plus}>
          Ajouter un véhicule
        </Button>
      </div>

      {/* Contenu principal */}
      {vehicles.length === 0 ? (
        <EmptyState
          icon={Car}
          title="Aucun véhicule"
          description="Ajoutez votre premier véhicule pour commencer à suivre sa maintenance"
          action={handleAddVehicle}
          actionText="Ajouter un véhicule"
        />
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Liste des véhicules */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
              Mes véhicules
            </h2>
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                interventionsCount={
                  interventions.filter((i) => i.vehicleId === vehicle.id).length
                }
                isSelected={selectedVehicleId === vehicle.id}
                onClick={() => setSelectedVehicleId(vehicle.id)}
                onEdit={() => handleEditVehicle(vehicle)}
                onDelete={() => handleDeleteVehicle(vehicle.id)}
              />
            ))}
          </div>

          {/* Détail du véhicule */}
          <div className="lg:col-span-2">
            {selectedVehicle ? (
              <VehicleDetail
                vehicle={selectedVehicle}
                interventions={selectedVehicleInterventions}
                onAddIntervention={() => handleAddIntervention(selectedVehicle.id)}
                onEditIntervention={handleEditIntervention}
                onDeleteIntervention={handleDeleteIntervention}
                onUpdateMileage={(mileage) => handleUpdateMileage(selectedVehicle.id, mileage)}
              />
            ) : (
              <Card className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Car className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
                  <p className="text-surface-500 dark:text-surface-400">
                    Sélectionnez un véhicule pour voir ses détails
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <VehicleForm
        isOpen={vehicleFormModal.isOpen}
        onClose={vehicleFormModal.close}
        onSave={handleSaveVehicle}
        initialData={vehicleFormModal.data}
      />

      <InterventionForm
        isOpen={interventionFormModal.isOpen}
        onClose={interventionFormModal.close}
        onSave={handleSaveIntervention}
        initialData={interventionFormModal.data}
        vehicle={selectedVehicle}
      />
    </div>
  )
}

export default VehiclesModule