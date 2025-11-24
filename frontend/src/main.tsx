import { createRoot } from 'react-dom/client'
import './styles/global.css'
import Router from './router.tsx'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <Router />
  </AuthProvider>
)