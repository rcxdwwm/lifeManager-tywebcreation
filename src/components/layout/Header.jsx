/**
 * Composant Header de l'application
 */

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Sun, Moon, Download, Upload, Trash2, Info } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import { useIsMobile, useModal, useBoolean, useLocalStorage } from '../../hooks'
import { downloadJSON, generateExportFilename, readJSONFile } from '../../utils/helpers'
import { getModuleByPath } from '../../config/modules'
import { Modal, Button, ConfirmDialog } from '../common'
import { STORAGE_PREFIX } from '../../utils/constants'

const Header = ({ onMenuClick, isSidebarOpen }) => {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const { exportAllData, importAllData, clearAllData, stats } = useApp()
  const { toast } = useToast()
  const isMobile = useIsMobile()
  
  const settingsModal = useModal()
  const [clearConfirmOpen, { setTrue: openClearConfirm, setFalse: closeClearConfirm }] = useBoolean(false)

  // État pour la note d'information (partagé avec Dashboard)
  const [showInfoNote, setShowInfoNote] = useLocalStorage(`${STORAGE_PREFIX}-show-backup-info`, true)

  // Obtenir le titre de la page actuelle
  const currentModule = getModuleByPath(location.pathname)
  const pageTitle = currentModule?.name || 'Life Manager'

  // Réafficher la note d'information
  const handleShowInfo = () => {
    setShowInfoNote(true)
    toast.info('Note d\'information réactivée sur le tableau de bord')
  }

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
      settingsModal.close()
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'import")
      console.error(error)
    }

    // Reset le champ file
    e.target.value = ''
  }

  // Effacer toutes les données
  const handleClearAll = () => {
    clearAllData()
    closeClearConfirm()
    settingsModal.close()
    toast.success('Toutes les données ont été supprimées')
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-surface-900/80 backdrop-blur-lg border-b border-surface-200 dark:border-surface-800">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Gauche: Menu + Titre */}
          <div className="flex items-center gap-4">
            {isMobile && (
              <button
                onClick={onMenuClick}
                className="p-2 -ml-2 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
                aria-label={isSidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              >
                {isSidebarOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            )}

            <div>
              <h1 className="text-xl font-display font-bold text-surface-900 dark:text-white">
                {pageTitle}
              </h1>
              {!isMobile && stats.todos.overdue > 0 && (
                <p className="text-xs text-danger">
                  {stats.todos.overdue} tâche{stats.todos.overdue > 1 ? 's' : ''} en retard
                </p>
              )}
            </div>
          </div>

          {/* Droite: Actions */}
          <div className="flex items-center gap-2">
            {/* Bouton info - visible seulement si la note est masquée */}
            {!showInfoNote && (
              <button
                onClick={handleShowInfo}
                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                aria-label="Afficher les informations importantes"
                title="Afficher la note d'information"
              >
                <Info className="h-5 w-5" />
              </button>
            )}

            {/* Toggle thème */}
            <button
              onClick={toggleTheme}
              className="p-2 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
              aria-label={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {/* Bouton données */}
            <button
              onClick={settingsModal.open}
              className="p-2 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
              aria-label="Gestion des données"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Modal de gestion des données */}
      <Modal
        isOpen={settingsModal.isOpen}
        onClose={settingsModal.close}
        title="Gestion des données"
        description="Exportez, importez ou supprimez vos données"
        size="sm"
      >
        <div className="space-y-4">
          {/* Stats rapides */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-surface-50 dark:bg-surface-900 rounded-xl">
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-primary-600">
                {stats.todos.total}
              </p>
              <p className="text-xs text-surface-500">Tâches</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-accent-500">
                {stats.books.total}
              </p>
              <p className="text-xs text-surface-500">Livres</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-success">
                {stats.vehicles.count}
              </p>
              <p className="text-xs text-surface-500">Véhicules</p>
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
        </div>
      </Modal>

      {/* Confirmation de suppression */}
      <ConfirmDialog
        isOpen={clearConfirmOpen}
        onClose={closeClearConfirm}
        onConfirm={handleClearAll}
        title="Supprimer toutes les données ?"
        message="Cette action est irréversible. Toutes vos tâches, livres et véhicules seront définitivement supprimés."
        confirmText="Tout supprimer"
        variant="danger"
      />
    </>
  )
}

export default Header