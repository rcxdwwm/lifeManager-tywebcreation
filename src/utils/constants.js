/**
 * Constantes globales de l'application Life Manager
 */

// Version de l'application et des données
export const APP_VERSION = '1.0.0'
export const DATA_VERSION = 1

// Préfixe pour les clés localStorage
export const STORAGE_PREFIX = 'life-manager'

// Clés de stockage
export const STORAGE_KEYS = {
  THEME: `${STORAGE_PREFIX}-theme`,
  TODOS: `${STORAGE_PREFIX}-todos`,
  BOOKS: `${STORAGE_PREFIX}-books`,
  VEHICLES: `${STORAGE_PREFIX}-vehicles`,
  INTERVENTIONS: `${STORAGE_PREFIX}-interventions`,
  SETTINGS: `${STORAGE_PREFIX}-settings`,
  DATA_VERSION: `${STORAGE_PREFIX}-data-version`,
}

// Priorités des tâches
export const PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
}

export const PRIORITY_LABELS = {
  [PRIORITIES.HIGH]: 'Haute',
  [PRIORITIES.MEDIUM]: 'Moyenne',
  [PRIORITIES.LOW]: 'Basse',
}

export const PRIORITY_COLORS = {
  [PRIORITIES.HIGH]: 'danger',
  [PRIORITIES.MEDIUM]: 'warning',
  [PRIORITIES.LOW]: 'primary',
}

// Catégories par défaut des tâches
export const DEFAULT_TODO_CATEGORIES = [
  { id: 'work', label: 'Travail', color: 'primary' },
  { id: 'personal', label: 'Personnel', color: 'success' },
  { id: 'urgent', label: 'Urgent', color: 'danger' },
  { id: 'shopping', label: 'Courses', color: 'warning' },
  { id: 'health', label: 'Santé', color: 'accent' },
  { id: 'other', label: 'Autre', color: 'neutral' },
]

// Statuts de lecture des livres
export const BOOK_STATUS = {
  TO_READ: 'to-read',
  READING: 'reading',
  READ: 'read',
  ABANDONED: 'abandoned',
}

export const BOOK_STATUS_LABELS = {
  [BOOK_STATUS.TO_READ]: 'À lire',
  [BOOK_STATUS.READING]: 'En cours',
  [BOOK_STATUS.READ]: 'Lu',
  [BOOK_STATUS.ABANDONED]: 'Abandonné',
}

export const BOOK_STATUS_COLORS = {
  [BOOK_STATUS.TO_READ]: 'neutral',
  [BOOK_STATUS.READING]: 'primary',
  [BOOK_STATUS.READ]: 'success',
  [BOOK_STATUS.ABANDONED]: 'danger',
}

// Genres de livres par défaut
export const DEFAULT_BOOK_GENRES = [
  'Roman',
  'Science-Fiction',
  'Fantasy',
  'Thriller',
  'Policier',
  'Biographie',
  'Histoire',
  'Sciences',
  'Développement personnel',
  'Philosophie',
  'Psychologie',
  'Technique',
  'Bande dessinée',
  'Manga',
  'Jeunesse',
  'Autre',
]

// Types de carburant
export const FUEL_TYPES = [
  { id: 'petrol', label: 'Essence' },
  { id: 'diesel', label: 'Diesel' },
  { id: 'electric', label: 'Électrique' },
  { id: 'hybrid', label: 'Hybride' },
  { id: 'hybrid-plugin', label: 'Hybride rechargeable' },
  { id: 'lpg', label: 'GPL' },
  { id: 'other', label: 'Autre' },
]

// Types d'intervention véhicule
export const INTERVENTION_TYPES = [
  { id: 'inspection', label: 'Contrôle technique', icon: 'ClipboardCheck' },
  { id: 'insurance', label: 'Assurance', icon: 'Shield' },
  { id: 'oil-change', label: 'Vidange moteur', icon: 'Droplet' },
  { id: 'filters', label: 'Filtres', icon: 'Filter' },
  { id: 'oil-filter', label: 'Filtre à huile', icon: 'Filter1' },
  { id: 'petrol-filter', label: 'Filtre à gasoil/essence', icon: 'Filter2' },
  { id: 'air-filter', label: 'Filtre à air', icon: 'Filter3' },
  { id: 'air-conditionning-filter', label: 'Filtre de climatisation', icon: 'Filter4' },
  { id: 'service', label: 'Révision', icon: 'Wrench' },
  { id: 'AT-oil-change', label: 'Vidange boite auto', icon: 'Droplet1' },
  { id: 'timing belt', label: 'Courroie de distribution + pompe à eau', icon: 'Engine1' },
  { id: 'accessory belt', label: 'Courroie d\'accessoires', icon: 'Engine2' },
  { id: 'filter-particles', label: 'FAP nettoyage', icon: 'Exhaust' },
  { id: 'brake fluid', label: 'Liquide de frein + purge', icon: 'Fluid' },
  { id: 'brakes-disc', label: 'Disques de freins', icon: 'Disc' },
  { id: 'brakes-pads', label: 'Plaquettes de freins', icon: 'Pad' },
  { id: 'tires', label: 'Pneus', icon: 'Tire' },
  { id: 'air-conditionning', label: 'Climatisation', icon: 'Environment' },
  { id: 'battery', label: 'Batterie', icon: 'Battery' },
  { id: 'windshield', label: 'Pare brise', icon: 'car' },
  { id: 'lights', label: 'Éclairage', icon: 'Lightbulb' },
  { id: 'bodywork', label: 'Carrosserie', icon: 'Car1' },
  { id: 'other', label: 'Autre', icon: 'MoreHorizontal' },
]

// Dates et temps
export const DATE_FORMATS = {
  SHORT: 'dd/MM/yyyy',
  LONG: 'dd MMMM yyyy',
  WITH_TIME: 'dd/MM/yyyy HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
}

// Limites
export const LIMITS = {
  MAX_DOCUMENTS_PER_INTERVENTION: 5,
  MAX_DOCUMENT_SIZE_MB: 2,
  MAX_NOTES_LENGTH: 5000,
  MAX_TITLE_LENGTH: 200,
}