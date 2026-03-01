import { createRoot } from 'react-dom/client'
import './styles/global.css'
import Router from './router.tsx'
import { AuthProvider } from './context/AuthContext'
import ErrorBoundary from './components/shared/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary fullPage>
    <AuthProvider>
      <Router />
    </AuthProvider>
  </ErrorBoundary>
)