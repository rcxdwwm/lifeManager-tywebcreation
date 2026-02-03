/**
 * Composant Sidebar de navigation
 */

import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { getNavModules } from '../../config/modules'
import { useApp } from '../../context/AppContext'
import { cn } from '../../utils/helpers'

const Sidebar = ({ isOpen, onClose }) => {
  const modules = getNavModules()
  const { stats } = useApp()

  // Badges de notification par module
  const getModuleBadge = (moduleId) => {
    switch (moduleId) {
      case 'todo':
        return stats.todos.overdue > 0 ? stats.todos.overdue : null
      case 'vehicles':
        return stats.vehicles.upcomingReminders > 0
          ? stats.vehicles.upcomingReminders
          : null
      default:
        return null
    }
  }

  return (
    <>
      {/* Overlay mobile - masqué car sidebar plein écran */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full',
          // Plein écran sur mobile, 256px sur desktop
          'w-full sm:w-80 lg:w-64',
          // Position différente sur desktop (sous le header)
          'lg:top-16 lg:h-[calc(100vh-4rem)] lg:z-40',
          'bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800',
          'transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Bouton fermer - visible uniquement sur mobile */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-surface-500 hover:text-surface-700 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors lg:hidden"
          aria-label="Fermer le menu"
        >
          <X className="h-6 w-6" />
        </button>

        <nav className="flex flex-col h-full p-4 pt-16 lg:pt-4">
          {/* Logo / Brand */}
          <div className="mb-6 px-4 text-center">
            {/* Logo entreprise */}
            <div className="flex justify-center mb-3">
              <img 
                src={`${import.meta.env.BASE_URL}icon-192.png`}
                alt="TyWebCreation Logo" 
                className="h-24 w-24 lg:h-20 lg:w-20 rounded-xl shadow-soft transform transition-transform duration-300 hover:scale-110"
              />
            </div>
            <h2 className="text-3xl lg:text-2xl font-display font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
              Life Manager
            </h2>
            <p className="text-sm lg:text-xs text-surface-500 mt-1">
              Organisez votre vie simplement
            </p>
          </div>

          {/* Navigation principale */}
          <div className="flex-1 space-y-2 lg:space-y-1">
            {modules
              .filter((m) => m.id !== 'settings')
              .map((module) => {
                const Icon = module.icon
                const badge = getModuleBadge(module.id)

                return (
                  <NavLink
                    key={module.id}
                    to={module.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'nav-link text-lg lg:text-base py-3 lg:py-2',
                        isActive && 'nav-link-active'
                      )
                    }
                  >
                    <Icon className="h-6 w-6 lg:h-5 lg:w-5" />
                    <span className="flex-1">{module.name}</span>
                    {badge && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-danger text-white rounded-full">
                        {badge}
                      </span>
                    )}
                  </NavLink>
                )
              })}
          </div>

          {/* Copyright en bas */}
          <div className="pt-4 mt-4 border-t border-surface-200 dark:border-surface-700 mb-5">
            <div className="text-center text-sm lg:text-xs text-surface-400">
              <span>© {new Date().getFullYear()} </span>
              <a 
                href="https://tywebcreation.fr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-500 hover:text-primary-600 hover:underline"
              >
                TyWebCreation.fr
              </a>
            </div>
          </div>

          {/* Settings en bas */}
          <div className="pt-4 border-t border-surface-200 dark:border-surface-700">
            {modules
              .filter((m) => m.id === 'settings')
              .map((module) => {
                const Icon = module.icon
                return (
                  <NavLink
                    key={module.id}
                    to={module.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'nav-link text-lg lg:text-base py-3 lg:py-2',
                        isActive && 'nav-link-active'
                      )
                    }
                  >
                    <Icon className="h-6 w-6 lg:h-5 lg:w-5" />
                    <span>{module.name}</span>
                  </NavLink>
                )
              })}
          </div>

          {/* Version */}
          <div className="mt-4 px-4 text-sm lg:text-xs text-surface-400 text-center">
            Version 1.0.0
          </div>
        </nav>
      </aside>
    </>
  )
}

export default Sidebar