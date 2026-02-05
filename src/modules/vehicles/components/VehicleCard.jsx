/**
 * Composant VehicleCard - Carte de véhicule
 */

import { useState } from 'react'
import { Car, MoreVertical, Edit2, Trash2, Gauge, Wrench } from 'lucide-react'
import { Card, Badge, ConfirmDialog } from '../../../components/common'
import { useClickOutside, useBoolean } from '../../../hooks'
import { cn, formatMileage } from '../../../utils/helpers'
import { FUEL_TYPES } from '../../../utils/constants'

const VehicleCard = ({
  vehicle,
  interventionsCount,
  isSelected,
  onClick,
  onEdit,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleteConfirmOpen, { setTrue: openDeleteConfirm, setFalse: closeDeleteConfirm }] = useBoolean(false)
  
  const menuRef = useClickOutside(() => setMenuOpen(false))

  const fuelType = FUEL_TYPES.find((f) => f.id === vehicle.fuelType)

  const handleDelete = () => {
    closeDeleteConfirm()
    onDelete()
  }

  return (
    <>
      <Card
        padding="none"
        hover
        className={cn(
          'cursor-pointer transition-all',
          isSelected && 'ring-2 ring-primary-500 border-primary-500'
        )}
        onClick={onClick}
      >
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  isSelected
                    ? 'bg-primary-100 dark:bg-primary-900/50'
                    : 'bg-surface-100 dark:bg-surface-800'
                )}
              >
                <Car
                  className={cn(
                    'w-6 h-6',
                    isSelected
                      ? 'text-primary-600'
                      : 'text-surface-500 dark:text-surface-400'
                  )}
                />
              </div>

              <div>
                <h3 className="font-semibold text-surface-900 dark:text-white">
                  {vehicle.name}
                </h3>
                <p className="text-sm text-surface-500 dark:text-surface-400">
                  {vehicle.brand} {vehicle.model}
                </p>
              </div>
            </div>

            {/* Menu */}
            <div
              className="relative"
              ref={menuRef}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
                aria-label="Actions"
              >
                <MoreVertical className="h-5 w-5" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-surface-800 rounded-lg shadow-soft-lg border border-surface-200 dark:border-surface-700 py-1 z-10 animate-scale-in">
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      onEdit()
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700"
                  >
                    <Edit2 className="h-4 w-4" />
                    Modifier
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      openDeleteConfirm()
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-danger hover:bg-danger-light dark:hover:bg-red-900/30"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Infos */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <Badge variant="neutral" size="sm">
              {vehicle.licensePlate}
            </Badge>

            {(vehicle.year || vehicle.month) && (
              <Badge variant="neutral" size="sm">
                {vehicle.month && vehicle.year 
                  ? `${String(vehicle.month).padStart(2, '0')}/${vehicle.year}`
                  : vehicle.month 
                    ? `${String(vehicle.month).padStart(2, '0')}/----`
                    : vehicle.year
                }
              </Badge>
            )}

            {fuelType && (
              <Badge variant="primary" size="sm">
                {fuelType.label}
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
            <div className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
              <Gauge className="h-4 w-4" />
              {formatMileage(vehicle.currentMileage)}
            </div>

            <div className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
              <Wrench className="h-4 w-4" />
              {interventionsCount} intervention{interventionsCount > 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </Card>

      {/* Confirmation de suppression */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={closeDeleteConfirm}
        onConfirm={handleDelete}
        title="Supprimer ce véhicule ?"
        message={`"${vehicle.name}" et toutes ses interventions seront définitivement supprimés.`}
        confirmText="Supprimer"
        variant="danger"
      />
    </>
  )
}

export default VehicleCard