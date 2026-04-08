import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, VALID_USERS, getUserProfile, getOtherUser } from '../lib/supabase'

const AuthContext = createContext(null)
const SESSION_KEY = 'chispa_session'

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(null)
  const [loading, setLoading] = useState(true)
  const [otherUserLastSeen, setOtherUserLastSeen] = useState(null)
  const [otherUserActive, setOtherUserActive] = useState(false)

  const updateLastSeen = useCallback(async (uname) => {
    if (!uname || !supabase) return
    try {
      await supabase
        .from('profiles')
        .upsert({ username: uname, last_seen: new Date().toISOString() }, { onConflict: 'username' })
    } catch (_) {}
  }, [])

  const fetchOtherStatus = useCallback(async (uname) => {
    if (!uname) return
    try {
      const other = getOtherUser(uname)
      const { data } = await supabase
        .from('profiles')
        .select('last_seen')
        .eq('username', other)
        .maybeSingle()

      if (data?.last_seen) {
        const diff = (Date.now() - new Date(data.last_seen).getTime()) / (1000 * 60 * 60)
        setOtherUserActive(diff < 24)
        setOtherUserLastSeen(new Date(data.last_seen))
      }
    } catch (_) {}
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY)
    if (stored && VALID_USERS[stored]) {
      setUsername(stored)
      updateLastSeen(stored)
      fetchOtherStatus(stored)
    }
    setLoading(false)
  }, [updateLastSeen, fetchOtherStatus])

  // Refresh last_seen every minute
  useEffect(() => {
    if (!username) return
    const id = setInterval(() => {
      updateLastSeen(username)
      fetchOtherStatus(username)
    }, 60000)
    return () => clearInterval(id)
  }, [username, updateLastSeen, fetchOtherStatus])

  const login = (inputUsername, inputPassword) => {
    const key = inputUsername.trim().toLowerCase()
    const user = VALID_USERS[key]
    if (!user) throw new Error('Usuario no encontrado. Usa "mimmis" o "russell".')
    if (inputPassword !== user.password) throw new Error('Contraseña incorrecta.')
    localStorage.setItem(SESSION_KEY, key)
    setUsername(key)
    updateLastSeen(key)
    fetchOtherStatus(key)
  }

  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    setUsername(null)
  }

  const profile = username ? getUserProfile(username) : null

  return (
    <AuthContext.Provider value={{
      username,
      profile,
      loading,
      otherUserActive,
      otherUserLastSeen,
      login,
      logout,
      isLoggedIn: !!username,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
