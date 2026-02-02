/**
 * Configuration des modules de l'application
 * Facilement extensible pour de nouveaux modules
 */

import {
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  Car,
  ShoppingCart,
  Settings,
} from 'lucide-react'

export const MODULES_CONFIG = {
  dashboard: {
    id: 'dashboard',
    name: 'Tableau de bord',
    description: "Vue d'ensemble de toutes vos données",
    icon: LayoutDashboard,
    path: '/',
    enabled: true,
    order: 0,
    showInNav: true,
  },
  todo: {
    id: 'todo',
    name: 'Tâches',
    description: 'Gérez vos tâches et échéances',
    icon: CheckSquare,
    path: '/todo',
    enabled: true,
    order: 1,
    showInNav: true,
    color: 'primary',
  },
  shopping: {
    id: 'shopping',
    name: 'Courses',
    description: 'Gérez votre liste de courses',
    icon: ShoppingCart,
    path: '/shopping',
    enabled: true,
    order: 4,
    showInNav: true,
    color: 'warning',
  },
  library: {
    id: 'library',
    name: 'Bibliothèque',
    description: 'Suivez vos lectures',
    icon: BookOpen,
    path: '/library',
    enabled: true,
    order: 2,
    showInNav: true,
    color: 'accent',
  },
  vehicles: {
    id: 'vehicles',
    name: 'Véhicules',
    description: 'Gérez la maintenance de vos véhicules',
    icon: Car,
    path: '/vehicles',
    enabled: true,
    order: 3,
    showInNav: true,
    color: 'success',
  },
  settings: {
    id: 'settings',
    name: 'Paramètres',
    description: "Configuration de l'application",
    icon: Settings,
    path: '/settings',
    enabled: true,
    order: 99,
    showInNav: true,
  },
}

/**
 * Obtenir les modules activés triés par ordre
 * @returns {Array}
 */
export const getEnabledModules = () => {
  return Object.values(MODULES_CONFIG)
    .filter((m) => m.enabled)
    .sort((a, b) => a.order - b.order)
}

/**
 * Obtenir les modules pour la navigation
 * @returns {Array}
 */
export const getNavModules = () => {
  return getEnabledModules().filter((m) => m.showInNav)
}

/**
 * Obtenir un module par son ID
 * @param {string} moduleId
 * @returns {object|null}
 */
export const getModuleById = (moduleId) => {
  return MODULES_CONFIG[moduleId] || null
}

/**
 * Obtenir un module par son chemin
 * @param {string} path
 * @returns {object|null}
 */
export const getModuleByPath = (path) => {
  return Object.values(MODULES_CONFIG).find((m) => m.path === path) || null
}

export default MODULES_CONFIG