/**
 * Composant App principal
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './components/layout'
import Dashboard from './modules/dashboard/Dashboard'
import SettingsPage from './components/modules/SettingsPage'
import TodoModule from './modules/todo'
import LibraryModule from './modules/library'
import VehiclesModule from './modules/vehicles'
import ShoppingModule from './modules/shopping/ShoppingModule'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Dashboard */}
        <Route index element={<Dashboard />} />

        {/* Modules */}
        <Route path="todo" element={<TodoModule />} />
        <Route path="shopping" element={<ShoppingModule />} />
        <Route path="library" element={<LibraryModule />} />
        <Route path="vehicles" element={<VehiclesModule />} />

        {/* Settings */}
        <Route path="settings" element={<SettingsPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App