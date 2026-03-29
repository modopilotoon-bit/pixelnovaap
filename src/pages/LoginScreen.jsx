import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'

const PASSWORD = 'pixelnova2102'

const accounts = [
  { username: 'RUSSELL', label: 'Russell', role: 'Admin', color: '#3B9EFF', bg: 'rgba(59,158,255,0.12)', border: 'rgba(59,158,255,0.3)', initials: 'R' },
  { username: 'DIEGO', label: 'Diego', role: 'Editor', color: '#A78BFA', bg: 'rgba(107,47,160,0.12)', border: 'rgba(107,47,160,0.3)', initials: 'D' },
]

export default function LoginScreen() {
  const unlock = useAppStore((s) => s.unlock)
  const [selected, setSelected] = useState(null)
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)

  function handleLogin(e) {
    e.preventDefault()
    if (password === PASSWORD) {
      unlock(selected)
    } else {
      setError('Contraseña incorrecta')
      setShake(true)
      setPassword('')
      setTimeout(() => setShake(false), 600)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--bg-base)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: 24,
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 48, textAlign: 'center' }}>
        <div style={{
          fontFamily: 'Bebas Neue, cursive',
          fontSize: 52,
          letterSpacing: 3,
          lineHeight: 1,
          background: 'linear-gradient(135deg, #3B9EFF 0%, #6B2FA0 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          PixelNova
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, letterSpacing: 3, textTransform: 'uppercase' }}>
          OS · Cancún
        </div>
      </div>

      {!selected ? (
        /* Step 1: Select account */
        <div style={{ width: '100%', maxWidth: 340 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 24, textTransform: 'uppercase', letterSpacing: 1.5 }}>
            Selecciona tu cuenta
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {accounts.map((acc) => (
              <button
                key={acc.username}
                onClick={() => setSelected(acc.username)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '18px 20px',
                  borderRadius: 14,
                  background: acc.bg,
                  border: `1px solid ${acc.border}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  textAlign: 'left',
                  width: '100%',
                }}
                onMouseOver={(e) => { e.currentTarget.style.filter = 'brightness(1.2)' }}
                onMouseOut={(e) => { e.currentTarget.style.filter = 'none' }}
              >
                <div style={{
                  width: 44, height: 44,
                  borderRadius: '50%',
                  background: `${acc.color}25`,
                  border: `2px solid ${acc.color}50`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Bebas Neue, cursive',
                  fontSize: 22,
                  color: acc.color,
                  flexShrink: 0,
                }}>
                  {acc.initials}
                </div>
                <div>
                  <div style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 20, color: 'var(--text-main)', letterSpacing: 1 }}>{acc.label}</div>
                  <div style={{ fontSize: 11, color: acc.color, textTransform: 'uppercase', letterSpacing: 1, marginTop: 1 }}>
                    {acc.username === 'RUSSELL' ? 'Control total' : 'Solo lectura'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Step 2: Password */
        <div style={{ width: '100%', maxWidth: 320 }}>
          {/* Back button */}
          <button
            onClick={() => { setSelected(null); setPassword(''); setError('') }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            ← Cambiar cuenta
          </button>

          {/* Selected account display */}
          {(() => {
            const acc = accounts.find(a => a.username === selected)
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                <div style={{
                  width: 44, height: 44,
                  borderRadius: '50%',
                  background: `${acc.color}25`,
                  border: `2px solid ${acc.color}50`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Bebas Neue, cursive',
                  fontSize: 22,
                  color: acc.color,
                }}>
                  {acc.initials}
                </div>
                <div>
                  <div style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 22, color: 'var(--text-main)', letterSpacing: 1 }}>{acc.label}</div>
                  <div style={{ fontSize: 11, color: acc.color, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {acc.username === 'RUSSELL' ? 'Control total' : 'Solo lectura'}
                  </div>
                </div>
              </div>
            )
          })()}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5, display: 'block', marginBottom: 8 }}>
                Contraseña
              </label>
              <div className={shake ? 'shake' : ''} style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  autoFocus
                  autoComplete="current-password"
                  style={{ fontSize: 15, padding: '12px 44px 12px 14px', letterSpacing: showPass ? 0 : 4 }}
                  placeholder="••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12 }}
                >
                  {showPass ? 'Ocultar' : 'Ver'}
                </button>
              </div>
              {error && <div style={{ fontSize: 12, color: '#EF4444', marginTop: 8 }}>{error}</div>}
            </div>

            <button
              type="submit"
              disabled={!password}
              style={{
                background: password ? 'linear-gradient(135deg, #3B9EFF, #6B2FA0)' : 'var(--bg-hover)',
                color: password ? 'white' : 'var(--text-muted)',
                border: 'none',
                borderRadius: 10,
                padding: '14px',
                cursor: password ? 'pointer' : 'not-allowed',
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: 0.5,
                transition: 'all 0.15s',
              }}
            >
              Entrar
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
