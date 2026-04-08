import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { isSupabaseConfigured } from './lib/supabase'
import LoadingScreen from './components/LoadingScreen'
import TopBar from './components/TopBar'
import Navigation from './components/Navigation'
import Login from './pages/Login'

const Inicio = lazy(() => import('./pages/Inicio'))
const Preguntas = lazy(() => import('./pages/Preguntas'))
const Dinamicas = lazy(() => import('./pages/Dinamicas'))
const Mapa = lazy(() => import('./pages/Mapa'))
const Memorias = lazy(() => import('./pages/Memorias'))

function ProtectedLayout() {
  const { isLoggedIn, loading, logout } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen />
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location }} replace />

  return (
    <div className="app-container">
      <TopBar onLogout={logout} />
      <main className="flex-1 overflow-y-auto" style={{ paddingBottom: '80px' }}>
        <Suspense fallback={
          <div className="flex items-center justify-center h-48">
            <div className="gold-pulse"><span /><span /><span /></div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/preguntas" element={<Preguntas />} />
            <Route path="/dinamicas" element={<Dinamicas />} />
            <Route path="/mapa" element={<Mapa />} />
            <Route path="/memorias" element={<Memorias />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Navigation />
    </div>
  )
}

function AuthRoute() {
  const { isLoggedIn, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (isLoggedIn) return <Navigate to="/" replace />
  return <Login />
}

function SetupScreen() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center"
      style={{ background: '#0D0608' }}>
      <div className="text-5xl mb-4" style={{ filter: 'drop-shadow(0 0 20px rgba(201,168,76,0.5))' }}>✨</div>
      <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#C9A84C' }}>Chispa</h1>
      <p className="text-sm mb-6" style={{ color: '#B89FA8', fontStyle: 'italic' }}>Conecta tu base de datos</p>
      <div className="card p-5 text-left max-w-sm w-full" style={{ border: '1px solid rgba(201,168,76,0.3)' }}>
        <p className="text-xs font-semibold mb-3" style={{ color: '#C9A84C' }}>Configura las variables de entorno en Netlify:</p>
        <code className="block text-xs leading-6" style={{ color: '#E8688A' }}>
          VITE_SUPABASE_URL<br/>
          VITE_SUPABASE_ANON_KEY
        </code>
        <p className="text-xs mt-3" style={{ color: '#B89FA8' }}>
          Corre <code style={{ color: '#C9A84C' }}>supabase/schema.sql</code> en tu proyecto de Supabase.
        </p>
      </div>
    </div>
  )
}

export default function App() {
  if (!isSupabaseConfigured) return <SetupScreen />

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<AuthRoute />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
