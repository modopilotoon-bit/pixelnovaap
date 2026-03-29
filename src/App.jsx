import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from './store/useAppStore'
import { useFinanceStore } from './store/useFinanceStore'
import { useConfigStore } from './store/useConfigStore'
import LoginScreen from './pages/LoginScreen'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Clientes from './pages/Clientes'
import ClienteDetalle from './pages/ClienteDetalle'
import Contenido from './pages/Contenido'
import Tutoriales from './pages/Tutoriales'
import Herramientas from './pages/Herramientas'
import Finanzas from './pages/Finanzas'
import Brief from './pages/Brief'
import Ajustes from './pages/Ajustes'

export default function App() {
  const unlocked = useAppStore((s) => s.unlocked)
  const subscribeApp = useAppStore((s) => s.subscribeToFirebase)
  const subscribeFinance = useFinanceStore((s) => s.subscribeToFirebase)
  const subscribeConfig = useConfigStore((s) => s.subscribeToFirebase)

  useEffect(() => {
    if (unlocked) {
      subscribeApp()
      subscribeFinance()
      subscribeConfig()
    }
  }, [unlocked])

  if (!unlocked) return <LoginScreen />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="clientes/:id" element={<ClienteDetalle />} />
          <Route path="contenido" element={<Contenido />} />
          <Route path="tutoriales" element={<Tutoriales />} />
          <Route path="herramientas" element={<Herramientas />} />
          <Route path="finanzas" element={<Finanzas />} />
          <Route path="brief" element={<Brief />} />
          <Route path="ajustes" element={<Ajustes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
