import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { RouterProvider } from '@/utils/router'
import { registerComponents } from '@/utils/componentRouter'

// Import all page components
import HomePage from '@pages/index.page'
import TimePage from '@pages/time/Time.page'
import AlarmsPage from '@pages/alarms/Alarms.page'
import RemindersPage from '@pages/reminders/Reminders.page'
import SettingsPage from '@pages/settings/Settings.page'

// Register all routes
registerComponents({
  '/': HomePage,
  '/time': TimePage,
  '/time/Time': TimePage,
  '/alarms': AlarmsPage,
  '/alarms/Alarms': AlarmsPage,
  '/reminders': RemindersPage,
  '/reminders/Reminders': RemindersPage,
  '/events': RemindersPage, // Maps to reminders
  '/settings': SettingsPage,
  '/settings/Settings': SettingsPage,
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider>
      <App />
    </RouterProvider>
  </React.StrictMode>,
)
