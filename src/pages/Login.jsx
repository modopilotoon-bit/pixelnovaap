import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

function Particles() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const particles = []
    const colors = ['#C9A84C', '#E8688A', '#6B1A2A', '#E8C87C', '#F4A0B5']

    for (let i = 0; i < 30; i++) {
      const el = document.createElement('div')
      const size = Math.random() * 4 + 2
      const color = colors[Math.floor(Math.random() * colors.length)]
      const duration = Math.random() * 15 + 10
      const delay = Math.random() * 12
      const isCircle = Math.random() > 0.3

      el.style.cssText = `
        position:absolute;
        width:${size}px;height:${size}px;
        background:${color};
        border-radius:${isCircle ? '50%' : '2px'};
        left:${Math.random() * 100}%;
        bottom:-20px;
        opacity:0;
        animation:floatParticle ${duration}s ${delay}s linear infinite;
        box-shadow:0 0 ${size * 2}px ${color};
        pointer-events:none;
        transform:rotate(${isCircle ? '0' : '45'}deg);
      `
      container.appendChild(el)
      particles.push(el)
    }
    return () => particles.forEach(p => p.remove())
  }, [])

  return <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }} />
}

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoggedIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoggedIn) navigate('/', { replace: true })
  }, [isLoggedIn, navigate])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password.trim()) {
      setError('Por favor completa todos los campos.')
      return
    }
    try {
      login(username.trim(), password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión.')
    }
  }

  return (
    <div
      className="relative min-h-dvh flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(180deg, #0D0608 0%, #1A0A0F 50%, #0D0608 100%)' }}
    >
      <Particles />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,26,42,0.3) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute bottom-1/3 left-1/4 pointer-events-none"
        style={{ width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)', filter: 'blur(30px)' }} />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4 select-none"
            style={{ filter: 'drop-shadow(0 0 20px rgba(201,168,76,0.6)) drop-shadow(0 0 40px rgba(201,168,76,0.3))' }}>
            ✨
          </div>
          <h1 className="text-5xl font-bold mb-3"
            style={{ fontFamily: 'Playfair Display, serif', background: 'linear-gradient(135deg, #C9A84C, #E8C87C, #C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Chispa
          </h1>
          <p className="text-base tracking-widest uppercase"
            style={{ color: '#B89FA8', letterSpacing: '0.2em', fontStyle: 'italic', fontFamily: 'Playfair Display, serif' }}>
            Conócete de verdad
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#B89FA8' }}>
              Usuario
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="mimmis o russell"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#B89FA8' }}>
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field pr-12"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                style={{ color: '#B89FA8', background: 'none', border: 'none', cursor: 'pointer' }} tabIndex={-1}>
                {showPassword
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl p-3 text-sm text-center"
              style={{ background: 'rgba(232,104,138,0.1)', border: '1px solid rgba(232,104,138,0.3)', color: '#E8688A' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary mt-2">
            Entrar →
          </button>
        </form>

        <p className="text-center text-xs mt-8" style={{ color: '#B89FA8', opacity: 0.5, fontStyle: 'italic' }}>
          Un espacio privado y sagrado para dos
        </p>
      </div>
    </div>
  )
}
