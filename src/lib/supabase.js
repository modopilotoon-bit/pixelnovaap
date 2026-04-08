import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: { persistSession: false },
    realtime: { params: { eventsPerSecond: 10 } },
  }
)

// ─── HARDCODED USER CONFIG ────────────────────────────────────────────────

export const VALID_USERS = {
  mimmis: { password: 'pixelnova', display_name: 'Mimmis', avatar_emoji: '🌸', color: '#E8688A' },
  russell: { password: 'pixelnova', display_name: 'Russell', avatar_emoji: '⚡', color: '#C9A84C' },
}

export const USER_PROFILES = {
  mimmis: { username: 'mimmis', display_name: 'Mimmis', avatar_emoji: '🌸', color: '#E8688A' },
  russell: { username: 'russell', display_name: 'Russell', avatar_emoji: '⚡', color: '#C9A84C' },
}

export function getOtherUser(username) {
  return username === 'mimmis' ? 'russell' : 'mimmis'
}

export function getUserProfile(username) {
  return USER_PROFILES[username] || USER_PROFILES.mimmis
}
