/**
 * Page Paramètres
 */

import { useState } from 'react'
import {
  Sun,
  Moon,
  Download,
  Upload,
  Trash2,
  HardDrive,
  Info,
  ExternalLink,
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import { useBoolean } from '../../hooks'
import { getStorageInfo } from '../../hooks/useLocalStorage'
import { Card, Button, ConfirmDialog } from '../common'
import { downloadJSON, generateExportFilename, readJSONFile, formatBytes } from '../../utils/helpers'
import { APP_VERSION } from '../../utils/constants'

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme()
  const { exportAllData, importAllData, clearAllData, stats } = useApp()
  const { toast } = useToast()
  
  const [clearConfirmOpen, { setTrue: openClearConfirm, setFalse: closeClearConfirm }] = useBoolean(false)
  const [storageInfo] = useState(() => getStorageInfo())

  // Export des données
  const handleExport = () => {
    try {
      const data = exportAllData()
      const filename = generateExportFilename('life-manager-backup')
      downloadJSON(data, filename)
      toast.success('Données exportées avec succès')
    } catch (error) {
      toast.error("Erreur lors de l'export des données")
      console.error(error)
    }
  }

  // Import des données
  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const data = await readJSONFile(file)
      importAllData(data)
      toast.success('Données importées avec succès')
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'import")
      console.error(error)
    }

    e.target.value = ''
  }

  // Effacer toutes les données
  const handleClearAll = () => {
    clearAllData()
    closeClearConfirm()
    toast.success('Toutes les données ont été supprimées')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Apparence */}
      <Card>
        <Card.Header>
          <Card.Title>Apparence</Card.Title>
        </Card.Header>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-surface-900 dark:text-white">Thème</p>
              <p className="text-sm text-surface-500">
                Choisissez entre le mode clair et sombre
              </p>
            </div>

            <div className="flex bg-surface-100 dark:bg-surface-800 rounded-lg p-1">
              <button
                onClick={() => theme !== 'light' && toggleTheme()}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  theme === 'light'
                    ? 'bg-white dark:bg-surface-700 shadow-sm'
                    : 'text-surface-500 hover:text-surface-700'
                }`}
              >
                <Sun className="h-4 w-4" />
                <span className="text-sm">Clair</span>
              </button>
              <button
                onClick={() => theme !== 'dark' && toggleTheme()}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  theme === 'dark'
                    ? 'bg-white dark:bg-surface-700 shadow-sm'
                    : 'text-surface-500 hover:text-surface-700'
                }`}
              >
                <Moon className="h-4 w-4" />
                <span className="text-sm">Sombre</span>
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Données */}
      <Card>
        <Card.Header>
          <Card.Title>Gestion des données</Card.Title>
        </Card.Header>

        {/* Stats stockage */}
        <div className="mb-6 p-4 bg-surface-50 dark:bg-surface-900 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <HardDrive className="h-5 w-5 text-surface-400" />
            <span className="font-medium text-surface-900 dark:text-white">
              Stockage local
            </span>
          </div>

          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-surface-500">Espace utilisé</span>
              <span className="text-surface-700 dark:text-surface-300">
                {formatBytes(storageInfo.used)} / {formatBytes(storageInfo.total)}
              </span>
            </div>
            <div className="h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  storageInfo.percentage > 80 ? 'bg-danger' : 'bg-primary-500'
                }`}
                style={{ width: `${storageInfo.percentage}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary-600">{stats.todos.total}</p>
              <p className="text-xs text-surface-500">Tâches</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent-500">{stats.books.total}</p>
              <p className="text-xs text-surface-500">Livres</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success">{stats.vehicles.count}</p>
              <p className="text-xs text-surface-500">Véhicules</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="secondary"
            className="w-full justify-start"
            leftIcon={Download}
            onClick={handleExport}
          >
            Exporter toutes les données
          </Button>

          <label className="block">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <span className="btn btn-md btn-secondary w-full justify-start cursor-pointer">
              <Upload className="h-4 w-4" />
              Importer des données
            </span>
          </label>

          <Button
            variant="ghost"
            className="w-full justify-start text-danger hover:bg-danger-light dark:hover:bg-red-900/30"
            leftIcon={Trash2}
            onClick={openClearConfirm}
          >
            Supprimer toutes les données
          </Button>
        </div>

        <p className="text-xs text-surface-500 mt-4">
          Les données sont stockées localement dans votre navigateur. Exportez
          régulièrement vos données pour éviter toute perte.
        </p>
      </Card>

      {/* À propos */}
      <Card>
        <Card.Header>
          <Card.Title>À propos</Card.Title>
        </Card.Header>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">LM</span>
              </div>
              <div>
                <p className="font-semibold text-surface-900 dark:text-white">
                  Life Manager
                </p>
                <p className="text-sm text-surface-500">Version {APP_VERSION}</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-surface-600 dark:text-surface-400">
            Une application modulaire pour organiser votre vie : tâches, lectures,
            maintenance de véhicules et plus encore. Toutes vos données restent
            privées et stockées localement.
          </p>

          <div className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700">
            <Info className="h-4 w-4" />
            <span>Développé avec React et Tailwind CSS</span>
          </div>
        </div>
      </Card>

      {/* Confirmation de suppression */}
      <ConfirmDialog
        isOpen={clearConfirmOpen}
        onClose={closeClearConfirm}
        onConfirm={handleClearAll}
        title="Supprimer toutes les données ?"
        message="Cette action est irréversible. Toutes vos tâches, livres, véhicules et interventions seront définitivement supprimés."
        confirmText="Tout supprimer"
        variant="danger"
      />
    </div>
  )
}

export default SettingsPage