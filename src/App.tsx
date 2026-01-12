import { useState } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { Sidebar } from './components/Sidebar'
import { SchedulePage } from './components/SchedulePage'
import { SettingsPage } from './components/SettingsPage'
import './premium-glass.css'

function AppContent() {
  const [currentPage, setCurrentPage] = useState('schedule')

  const renderPage = () => {
    switch (currentPage) {
      case 'schedule':
        return <SchedulePage />
      case 'settings':
        return <SettingsPage />
      case 'teams':
      case 'projects':
        return (
          <div className="placeholder-page">
            <div className="placeholder-content">
              <h1>🚧 В разработке</h1>
              <p>Эта страница будет доступна в следующей версии</p>
            </div>
          </div>
        )
      default:
        return <SchedulePage />
    }
  }

  return (
    <div className="app-layout">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
