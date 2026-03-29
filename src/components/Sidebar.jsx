import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Video, BookOpen, Wrench, DollarSign, FileEdit, Settings, LogOut } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/contenido', icon: Video, label: 'Contenido' },
  { to: '/tutoriales', icon: BookOpen, label: 'Tutoriales' },
  { to: '/herramientas', icon: Wrench, label: 'Herramientas' },
  { to: '/finanzas', icon: DollarSign, label: 'Finanzas' },
  { to: '/brief', icon: FileEdit, label: 'Brief' },
]

export default function Sidebar() {
  const currentUser = useAppStore((s) => s.currentUser)
  const lock = useAppStore((s) => s.lock)
  const isAdmin = currentUser === 'RUSSELL'

  return (
    <aside
      className="desktop-sidebar-wrapper"
      style={{
        width: 240,
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid var(--border)' }}>
        <div style={{
          fontFamily: 'Bebas Neue, cursive',
          fontSize: 28,
          letterSpacing: 2,
          background: 'linear-gradient(135deg, #3B9EFF 0%, #6B2FA0 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          PixelNova
        </div>
        <div style={{
          fontSize: 10,
          color: 'var(--text-muted)',
          marginTop: 2,
          textTransform: 'uppercase',
          letterSpacing: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#22C55E',
            boxShadow: '0 0 6px #22C55E',
          }} />
          OS v1.0 · Activo
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 16px',
              margin: '2px 8px',
              borderRadius: 10,
              color: isActive ? '#ffffff' : 'var(--text-muted)',
              background: isActive
                ? 'linear-gradient(135deg, rgba(59,158,255,0.2) 0%, rgba(107,47,160,0.12) 100%)'
                : 'transparent',
              border: isActive ? '1px solid rgba(59,158,255,0.25)' : '1px solid transparent',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              transition: 'all 0.15s',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={16} color={isActive ? '#3B9EFF' : undefined} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: user + logout */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '8px' }}>
        {isAdmin && (
          <NavLink
            to="/ajustes"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 16px',
              borderRadius: 10,
              color: isActive ? '#ffffff' : 'var(--text-muted)',
              background: isActive
                ? 'linear-gradient(135deg, rgba(59,158,255,0.2) 0%, rgba(107,47,160,0.12) 100%)'
                : 'transparent',
              border: isActive ? '1px solid rgba(59,158,255,0.25)' : '1px solid transparent',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
            })}
          >
            {({ isActive }) => (
              <>
                <Settings size={16} color={isActive ? '#3B9EFF' : undefined} />
                <span>Ajustes</span>
              </>
            )}
          </NavLink>
        )}
        {/* User info + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', marginTop: 4 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: isAdmin ? 'rgba(59,158,255,0.2)' : 'rgba(107,47,160,0.2)',
            border: `1px solid ${isAdmin ? 'rgba(59,158,255,0.4)' : 'rgba(107,47,160,0.4)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Bebas Neue, cursive', fontSize: 14,
            color: isAdmin ? '#3B9EFF' : '#A78BFA',
            flexShrink: 0,
          }}>
            {currentUser?.[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)', textTransform: 'capitalize' }}>
              {currentUser?.toLowerCase()}
            </div>
            <div style={{ fontSize: 10, color: isAdmin ? '#3B9EFF' : '#A78BFA', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {isAdmin ? 'Admin' : 'Solo lectura'}
            </div>
          </div>
          <button
            onClick={lock}
            title="Cerrar sesión"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
