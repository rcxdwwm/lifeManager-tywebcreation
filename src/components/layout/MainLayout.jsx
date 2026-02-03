/**
 * Layout principal de l'application
 */

import { useState, useCallback, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import { ToastContainer } from '../common'
import { cn } from '../../utils/helpers'
import { useIsMobile, useLocalStorage } from '../../hooks'
import { STORAGE_PREFIX } from '../../utils/constants'

const MainLayout = () => {
  const isMobile = useIsMobile()
  
  // Sauvegarde si l'utilisateur a déjà vu l'app (première visite)
  const [hasVisited, setHasVisited] = useLocalStorage(`${STORAGE_PREFIX}-has-visited`, false)
  
  // Sidebar ouverte par défaut sur mobile à la première visite
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Ouvrir la sidebar sur mobile à la première visite
  useEffect(() => {
    if (isMobile && !hasVisited) {
      setSidebarOpen(true)
    }
  }, [isMobile, hasVisited])

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev)
  }, [])

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false)
    // Marquer comme visité lors de la première fermeture
    if (!hasVisited) {
      setHasVisited(true)
    }
  }, [hasVisited, setHasVisited])

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      {/* Header */}
      <Header onMenuClick={toggleSidebar} isSidebarOpen={sidebarOpen} />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main content */}
      <main
        className={cn(
          'transition-all duration-300 min-h-[calc(100vh-4rem)]',
          'lg:ml-64' // Marge pour la sidebar sur desktop
        )}
      >
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  )
}

export default MainLayout