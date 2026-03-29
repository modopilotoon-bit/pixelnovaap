import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Video, BookOpen, Wrench, DollarSign, FileEdit, Settings } from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/contenido', icon: Video, label: 'Videos' },
  { to: '/finanzas', icon: DollarSign, label: 'Finanzas' },
  { to: '/brief', icon: FileEdit, label: 'Brief' },
  { to: '/herramientas', icon: Wrench, label: 'Tools' },
  { to: '/tutoriales', icon: BookOpen, label: 'Tutoriales' },
  { to: '/ajustes', icon: Settings, label: 'Ajustes' },
]

export default function BottomNav() {
  return (
    <nav
      className="mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '6px 0',
        zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom, 6px)',
      }}
    >
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            padding: '6px 8px',
            borderRadius: 10,
            color: isActive ? '#3B9EFF' : 'var(--text-muted)',
            background: isActive ? 'rgba(59,158,255,0.12)' : 'transparent',
            textDecoration: 'none',
            fontSize: 9,
            fontWeight: isActive ? 700 : 400,
            minWidth: 36,
            transition: 'all 0.15s',
          })}
        >
          <Icon size={19} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
