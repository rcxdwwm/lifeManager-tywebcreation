/**
 * Composant Sidebar de navigation
 */

import { NavLink } from 'react-router-dom'
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
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64',
          'bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800',
          'transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="flex flex-col h-full p-4">
          {/* Logo / Brand */}
          <div className="mb-6 px-4">
            {/* Logo entreprise */}
            <div className="flex justify-center mb-3">
              <img 
                src="/lifeManager-tywebcreation/icon-192.png" 
                alt="TyWebCreation Logo" 
                className="h-16 w-16 rounded-xl shadow-soft"
              />
            </div>
            <h2 className="text-2xl font-display font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
              Life Manager
            </h2>
            <p className="text-xs text-surface-500 mt-1">
              Organisez votre vie simplement
            </p>
          </div>

          {/* Navigation principale */}
          <div className="flex-1 space-y-1">
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
                      cn('nav-link', isActive && 'nav-link-active')
                    }
                  >
                    <Icon className="h-5 w-5" />
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
          <div className="pt-4 mt-4 border-t border-surface-200 dark:border-surface-700">
            <div className="text-center text-xs text-surface-400">
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
                      cn('nav-link', isActive && 'nav-link-active')
                    }
                  >
                    <Icon className="h-5 w-5" />
                    <span>{module.name}</span>
                  </NavLink>
                )
              })}
          </div>

          {/* Version */}
          <div className="mt-4 px-4 text-xs text-surface-400">
            Version 1.0.0
          </div>
        </nav>
      </aside>
    </>
  )
}

export default Sidebar