import { useAuth } from '../contexts/AuthContext'
import { getUserProfile, getOtherUser } from '../lib/supabase'
import { useState } from 'react'

export default function TopBar({ onLogout }) {
  const { username, otherUserActive, otherUserLastSeen } = useAuth()
  const [showMenu, setShowMenu] = useState(false)

  if (!username) return null

  const otherUsername = getOtherUser(username)
  const myProfile = getUserProfile(username)
  const otherProfile = getUserProfile(otherUsername)

  const getLastSeenText = () => {
    if (otherUserActive) return 'Activa hoy 🟢'
    if (!otherUserLastSeen) return 'Sin actividad reciente'
    const days = Math.floor((Date.now() - new Date(otherUserLastSeen).getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Activa hoy 🟢'
    if (days === 1) return 'Hace 1 día'
    return `Hace ${days} días`
  }

  return (
    <div
      className="flex items-center justify-between px-4 py-3 sticky top-0 z-50"
      style={{ background: 'rgba(13,6,8,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(61,26,36,0.5)' }}
    >
      {/* My identity */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
          style={{
            background: username === 'mimmis' ? 'rgba(232,104,138,0.2)' : 'rgba(201,168,76,0.2)',
            border: `1px solid ${username === 'mimmis' ? '#E8688A' : '#C9A84C'}40`,
          }}>
          {myProfile.avatar_emoji}
        </div>
        <div>
          <p className="text-sm font-semibold leading-none"
            style={{ color: username === 'mimmis' ? '#E8688A' : '#C9A84C' }}>
            {myProfile.display_name}
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#B89FA8' }}>Tú</p>
        </div>
      </div>

      {/* Center logo */}
      <div className="text-xl" style={{ filter: 'drop-shadow(0 0 8px rgba(201,168,76,0.5))' }}>✨</div>

      {/* Other user + menu */}
      <div className="flex items-center gap-2">
        <div className="text-right">
          <p className="text-sm font-semibold leading-none"
            style={{ color: otherUsername === 'mimmis' ? '#E8688A' : '#C9A84C' }}>
            {otherProfile.display_name}
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#B89FA8' }}>{getLastSeenText()}</p>
        </div>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
          style={{
            background: otherUsername === 'mimmis' ? 'rgba(232,104,138,0.2)' : 'rgba(201,168,76,0.2)',
            border: `1px solid ${otherUsername === 'mimmis' ? '#E8688A' : '#C9A84C'}40`,
          }}>
          {otherProfile.avatar_emoji}
        </div>

        <button
          onClick={() => setShowMenu(v => !v)}
          className="w-8 h-8 rounded-full flex items-center justify-center ml-1"
          style={{ background: 'rgba(61,26,36,0.5)', border: '1px solid rgba(61,26,36,0.8)', color: '#B89FA8', cursor: 'pointer' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
          </svg>
        </button>
      </div>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute top-14 right-4 z-50 rounded-xl overflow-hidden"
            style={{ background: '#1F0D14', border: '1px solid #3D1A24', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', minWidth: 160 }}>
            <button
              onClick={() => { setShowMenu(false); onLogout?.() }}
              className="w-full px-4 py-3 text-left text-sm flex items-center gap-2"
              style={{ color: '#E8688A', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'Inter, sans-serif' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Cerrar sesión
            </button>
          </div>
        </>
      )}
    </div>
  )
}
