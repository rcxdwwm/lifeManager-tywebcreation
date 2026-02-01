/**
 * Fonctions utilitaires générales
 */

import { v4 as uuidv4 } from 'uuid'

/**
 * Génère un identifiant unique
 * @returns {string} UUID v4
 */
export const generateId = () => uuidv4()

/**
 * Formate une date en français
 * @param {string|Date} date - Date à formater
 * @param {object} options - Options de formatage Intl
 * @returns {string} Date formatée
 */
export const formatDate = (date, options = {}) => {
  if (!date) return ''
  
  const defaultOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  }
  
  return new Intl.DateTimeFormat('fr-FR', defaultOptions).format(new Date(date))
}

/**
 * Formate une date courte (JJ/MM/AAAA)
 * @param {string|Date} date - Date à formater
 * @returns {string} Date formatée
 */
export const formatShortDate = (date) => {
  if (!date) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

/**
 * Formate une date relative (il y a X jours, dans X jours, etc.)
 * @param {string|Date} date - Date à comparer
 * @returns {string} Date relative formatée
 */
export const formatRelativeDate = (date) => {
  if (!date) return ''
  
  const now = new Date()
  const targetDate = new Date(date)
  const diffTime = targetDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Demain'
  if (diffDays === -1) return 'Hier'
  if (diffDays > 1 && diffDays <= 7) return `Dans ${diffDays} jours`
  if (diffDays < -1 && diffDays >= -7) return `Il y a ${Math.abs(diffDays)} jours`
  
  return formatShortDate(date)
}

/**
 * Vérifie si une date est aujourd'hui
 * @param {string|Date} date - Date à vérifier
 * @returns {boolean}
 */
export const isToday = (date) => {
  if (!date) return false
  const today = new Date()
  const targetDate = new Date(date)
  return (
    today.getDate() === targetDate.getDate() &&
    today.getMonth() === targetDate.getMonth() &&
    today.getFullYear() === targetDate.getFullYear()
  )
}

/**
 * Vérifie si une date est dans le passé
 * @param {string|Date} date - Date à vérifier
 * @returns {boolean}
 */
export const isPastDate = (date) => {
  if (!date) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(date) < today
}

/**
 * Vérifie si une date est dans le futur
 * @param {string|Date} date - Date à vérifier
 * @returns {boolean}
 */
export const isFutureDate = (date) => {
  if (!date) return false
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return new Date(date) > today
}

/**
 * Retourne le début du mois pour une date donnée
 * @param {Date} date - Date de référence
 * @returns {Date}
 */
export const startOfMonth = (date) => {
  const d = new Date(date)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Retourne la fin du mois pour une date donnée
 * @param {Date} date - Date de référence
 * @returns {Date}
 */
export const endOfMonth = (date) => {
  const d = new Date(date)
  d.setMonth(d.getMonth() + 1)
  d.setDate(0)
  d.setHours(23, 59, 59, 999)
  return d
}

/**
 * Formate un prix en euros
 * @param {number} price - Prix à formater
 * @returns {string} Prix formaté
 */
export const formatPrice = (price) => {
  if (typeof price !== 'number') return '0,00 €'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

/**
 * Formate un kilométrage
 * @param {number} km - Kilométrage
 * @returns {string} Kilométrage formaté
 */
export const formatMileage = (km) => {
  if (typeof km !== 'number') return '0 km'
  return new Intl.NumberFormat('fr-FR').format(km) + ' km'
}

/**
 * Tronque un texte à une longueur donnée
 * @param {string} text - Texte à tronquer
 * @param {number} maxLength - Longueur maximale
 * @returns {string} Texte tronqué
 */
export const truncate = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

/**
 * Capitalise la première lettre
 * @param {string} str - Chaîne à capitaliser
 * @returns {string}
 */
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Slugifie une chaîne
 * @param {string} str - Chaîne à slugifier
 * @returns {string}
 */
export const slugify = (str) => {
  if (!str) return ''
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Debounce une fonction
 * @param {Function} fn - Fonction à debouncer
 * @param {number} delay - Délai en ms
 * @returns {Function}
 */
export const debounce = (fn, delay = 300) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Throttle une fonction
 * @param {Function} fn - Fonction à throttler
 * @param {number} limit - Limite en ms
 * @returns {Function}
 */
export const throttle = (fn, limit = 300) => {
  let inThrottle
  return (...args) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Classe les éléments par groupes selon une clé
 * @param {Array} array - Tableau à grouper
 * @param {string|Function} key - Clé de groupage
 * @returns {Object}
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key]
    ;(result[groupKey] = result[groupKey] || []).push(item)
    return result
  }, {})
}

/**
 * Trie un tableau par une propriété
 * @param {Array} array - Tableau à trier
 * @param {string} key - Propriété de tri
 * @param {string} order - Ordre (asc ou desc)
 * @returns {Array}
 */
export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (aVal === bVal) return 0
    if (aVal === null || aVal === undefined) return 1
    if (bVal === null || bVal === undefined) return -1
    
    const comparison = aVal < bVal ? -1 : 1
    return order === 'asc' ? comparison : -comparison
  })
}

/**
 * Clone profond d'un objet
 * @param {*} obj - Objet à cloner
 * @returns {*}
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Vérifie si un objet est vide
 * @param {Object} obj - Objet à vérifier
 * @returns {boolean}
 */
export const isEmpty = (obj) => {
  if (!obj) return true
  if (Array.isArray(obj)) return obj.length === 0
  if (typeof obj === 'object') return Object.keys(obj).length === 0
  return false
}

/**
 * Génère un nom de fichier pour l'export
 * @param {string} prefix - Préfixe du nom
 * @param {string} extension - Extension du fichier
 * @returns {string}
 */
export const generateExportFilename = (prefix, extension = 'json') => {
  const date = new Date().toISOString().split('T')[0]
  return `${prefix}-${date}.${extension}`
}

/**
 * Télécharge des données en JSON
 * @param {*} data - Données à exporter
 * @param {string} filename - Nom du fichier
 */
export const downloadJSON = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Lit un fichier JSON uploadé
 * @param {File} file - Fichier à lire
 * @returns {Promise<*>}
 */
export const readJSONFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        resolve(data)
      } catch (error) {
        reject(new Error('Format de fichier invalide'))
      }
    }
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'))
    reader.readAsText(file)
  })
}

/**
 * Compresse une image en base64
 * @param {File} file - Fichier image
 * @param {number} maxWidth - Largeur maximale
 * @param {number} quality - Qualité (0-1)
 * @returns {Promise<string>}
 */
export const compressImage = (file, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = () => reject(new Error("Erreur de chargement de l'image"))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'))
    reader.readAsDataURL(file)
  })
}

/**
 * Calcule la taille approximative d'un objet en bytes
 * @param {*} obj - Objet à mesurer
 * @returns {number}
 */
export const getObjectSize = (obj) => {
  return new Blob([JSON.stringify(obj)]).size
}

/**
 * Formate une taille en bytes
 * @param {number} bytes - Taille en bytes
 * @returns {string}
 */
export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Classe CSS conditionnelle (comme clsx/classnames)
 * @param  {...any} args - Classes conditionnelles
 * @returns {string}
 */
export const cn = (...args) => {
  return args
    .flat()
    .filter((x) => typeof x === 'string')
    .join(' ')
    .trim()
}

/**
 * Formate une heure pour l'affichage
 * @param {string} time - Heure au format "HH:mm"
 * @returns {string} - Heure formatée (ex: "14h30")
 */
export const formatTime = (time) => {
  if (!time) return ''
  
  const [hours, minutes] = time.split(':')
  return `${hours}h${minutes}`
}

/**
 * Formate une date avec heure optionnelle
 * @param {string} date - Date ISO
 * @param {string} time - Heure au format "HH:mm" (optionnel)
 * @returns {string}
 */
export const formatDateWithTime = (date, time) => {
  if (!date) return ''
  
  const formattedDate = formatRelativeDate(date)
  
  if (time) {
    return `${formattedDate} à ${formatTime(time)}`
  }
  
  return formattedDate
  
}