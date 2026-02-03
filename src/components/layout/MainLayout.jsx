/**
 * Layout principal de l'application
 */

import { useState, useCallback, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import { ToastContainer } from '../common'
import { cn } from '../../utils/helpers'
import { useIsMobile } from '../../hooks'

const MainLayout = () => {
  const isMobile = useIsMobile()
  
  // Sidebar ouverte par défaut sur mobile à chaque ouverture de l'app
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)

  // Ouvrir la sidebar sur mobile à chaque chargement initial de l'app
  useEffect(() => {
    if (isMobile && initialLoad) {
      setSidebarOpen(true)
      setInitialLoad(false)
    }
  }, [isMobile, initialLoad])

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev)
  }, [])

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false)
  }, [])

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      {/* Header - masqué quand sidebar ouverte sur mobile */}
      <div className={cn(
        sidebarOpen && isMobile ? 'hidden' : 'block'
      )}>
        <Header onMenuClick={toggleSidebar} isSidebarOpen={sidebarOpen} />
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main content - masqué quand sidebar ouverte sur mobile */}
      <main
        className={cn(
          'transition-all duration-300 min-h-[calc(100vh-4rem)]',
          'lg:ml-64',
          sidebarOpen && isMobile ? 'hidden' : 'block'
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