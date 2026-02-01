/**
 * Contexte de thème (clair/sombre)
 * Avec support amélioré pour iOS Safari
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { STORAGE_KEYS } from '../utils/constants'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme doit être utilisé dans un ThemeProvider')
  }
  return context
}

// Fonction pour détecter le thème initial
const getInitialTheme = () => {
  // 1. Vérifier le localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME)
    if (stored === 'dark' || stored === 'light') {
      return stored
    }
  } catch (e) {
    console.warn('localStorage non disponible:', e)
  }
  
  // 2. Vérifier la préférence système
  if (typeof window !== 'undefined' && window.matchMedia) {
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')
    if (darkQuery.matches) {
      return 'dark'
    }
  }
  
  // 3. Par défaut: dark (pour correspondre au design souhaité)
  return 'dark'
}

// Fonction pour appliquer le thème au DOM
const applyTheme = (theme) => {
  const root = document.documentElement
  
  if (theme === 'dark') {
    root.classList.add('dark')
    root.style.colorScheme = 'dark'
  } else {
    root.classList.remove('dark')
    root.style.colorScheme = 'light'
  }
  
  // Mettre à jour la meta theme-color pour la barre de navigation mobile
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme === 'dark' ? '#1a1a1a' : '#f5f5f5')
  }
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme)

  // Appliquer le thème au montage et à chaque changement
  useEffect(() => {
    applyTheme(theme)
    
    // Sauvegarder la préférence
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme)
    } catch (e) {
      console.warn('Impossible de sauvegarder le thème:', e)
    }
  }, [theme])

  // Appliquer immédiatement au montage (pour iOS)
  useEffect(() => {
    applyTheme(theme)
  }, [])

  // Écouter les changements de préférence système
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e) => {
      // Ne changer que si l'utilisateur n'a pas fait de choix manuel
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.THEME)
        if (!stored) {
          setTheme(e.matches ? 'dark' : 'light')
        }
      } catch (err) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }
    
    // Utiliser addEventListener avec fallback pour anciens navigateurs
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else if (mediaQuery.addListener) {
      // Fallback pour Safari < 14
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  const isDark = theme === 'dark'

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeContext