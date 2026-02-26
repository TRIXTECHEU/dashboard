import { useState } from 'react'
import Sidebar from './Sidebar'
import OverviewPage from '../pages/OverviewPage'
import ChatLogsPage from '../pages/ChatLogsPage'
import AnalyticsPage from '../pages/AnalyticsPage'
import ClientsPage from '../pages/ClientsPage'

type Page = 'overview' | 'chat-logs' | 'analytics' | 'clients'

const pageTitles: Record<Page, string> = {
  overview: 'Přehled',
  analytics: 'Analytika',
  'chat-logs': 'Chat Logy',
  clients: 'Klienti',
}

export default function Layout() {
  const [currentPage, setCurrentPage] = useState<Page>('overview')

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <main className="ml-60 min-h-screen">
        {/* Top header bar */}
        <header className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-sm border-b border-gray-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">{pageTitles[currentPage]}</h2>
        </header>

        {/* Page content */}
        <div className="p-6">
          {currentPage === 'overview' && <OverviewPage />}
          {currentPage === 'analytics' && <AnalyticsPage />}
          {currentPage === 'chat-logs' && <ChatLogsPage />}
          {currentPage === 'clients' && <ClientsPage />}
        </div>
      </main>
    </div>
  )
}
