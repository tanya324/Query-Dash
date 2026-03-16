import { useState } from 'react'
import LandingPage   from './pages/LandingPage'
import UploadPage    from './pages/UploadPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  const [page, setPage]                 = useState('landing')
  const [initialQuery, setInitialQuery] = useState('')
  const [sessionId, setSessionId]       = useState(null)

  const handleGetAccess = (query) => {
    setInitialQuery(query || '')
    setPage('upload')
  }

  const handleStartQuerying = (sid) => {
    setSessionId(sid)
    setPage('dashboard')
  }

  if (page === 'landing')   return <LandingPage   onGetAccess={handleGetAccess} />
  if (page === 'upload')    return <UploadPage     onStartQuerying={handleStartQuerying} />
  return                           <DashboardPage  initialQuery={initialQuery} sessionId={sessionId} />
}
