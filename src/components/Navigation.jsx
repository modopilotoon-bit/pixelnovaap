import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Inicio', emoji: '🏠' },
  { to: '/preguntas', label: 'Preguntas', emoji: '🃏' },
  { to: '/dinamicas', label: 'Dinámicas', emoji: '🎮' },
  { to: '/mapa', label: 'Mapa', emoji: '🗺️' },
  { to: '/memorias', label: 'Memorias', emoji: '📔' },
]

export default function Navigation() {
  return (
    <nav
      className="nav-safe sticky bottom-0 z-50"
      style={{
        background: 'rgba(13,6,8,0.97)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(61,26,36,0.6)',
      }}
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
        {tabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[60px] ${
                isActive ? 'opacity-100' : 'opacity-50 hover:opacity-75'
              }`
            }
            style={({ isActive }) => ({
              background: isActive ? 'rgba(201,168,76,0.12)' : 'transparent',
            })}
          >
            {({ isActive }) => (
              <>
                <span
                  className="text-xl leading-none"
                  style={{
                    filter: isActive
                      ? 'drop-shadow(0 0 6px rgba(201,168,76,0.6))'
                      : 'none',
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {tab.emoji}
                </span>
                <span
                  className="text-xs font-medium leading-none"
                  style={{
                    color: isActive ? '#C9A84C' : '#B89FA8',
                    fontSize: '0.65rem',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
