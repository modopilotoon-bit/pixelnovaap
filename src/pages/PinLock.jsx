import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '../store/useAppStore'

const DEFAULT_PIN_KEY = 'pixelnova-pin'
const ATTEMPTS_KEY = 'pixelnova-attempts'
const LOCK_UNTIL_KEY = 'pixelnova-lock-until'

function getStoredPin() {
  try {
    const stored = localStorage.getItem(DEFAULT_PIN_KEY)
    return stored ? atob(stored) : '1234'
  } catch {
    return '1234'
  }
}

export default function PinLock() {
  const unlock = useAppStore((s) => s.unlock)
  const [digits, setDigits] = useState([])
  const [shake, setShake] = useState(false)
  const [error, setError] = useState('')
  const [lockSeconds, setLockSeconds] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    const lockUntil = parseInt(localStorage.getItem(LOCK_UNTIL_KEY) || '0')
    const now = Date.now()
    if (lockUntil > now) {
      const secs = Math.ceil((lockUntil - now) / 1000)
      setLockSeconds(secs)
      startCountdown(secs)
    }
  }, [])

  function startCountdown(secs) {
    setLockSeconds(secs)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setLockSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          localStorage.removeItem(LOCK_UNTIL_KEY)
          localStorage.removeItem(ATTEMPTS_KEY)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  function handleDigit(d) {
    if (lockSeconds > 0) return
    if (digits.length >= 4) return
    const newDigits = [...digits, d]
    setDigits(newDigits)
    setError('')
    if (newDigits.length === 4) {
      setTimeout(() => checkPin(newDigits.join('')), 100)
    }
  }

  function handleDelete() {
    setDigits((prev) => prev.slice(0, -1))
    setError('')
  }

  function checkPin(entered) {
    const correct = getStoredPin()
    if (entered === correct) {
      localStorage.removeItem(ATTEMPTS_KEY)
      localStorage.removeItem(LOCK_UNTIL_KEY)
      unlock()
    } else {
      const attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0') + 1
      localStorage.setItem(ATTEMPTS_KEY, String(attempts))
      setShake(true)
      setDigits([])
      setTimeout(() => setShake(false), 600)
      if (attempts >= 5) {
        const lockUntil = Date.now() + 60000
        localStorage.setItem(LOCK_UNTIL_KEY, String(lockUntil))
        localStorage.removeItem(ATTEMPTS_KEY)
        startCountdown(60)
        setError('Demasiados intentos. Bloqueado 60s.')
      } else {
        setError(`PIN incorrecto · ${5 - attempts} intentos restantes`)
      }
    }
  }

  const keys = ['1','2','3','4','5','6','7','8','9','','0','⌫']

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--bg-base)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: 24,
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <div style={{
          fontFamily: 'Bebas Neue, cursive',
          fontSize: 48,
          color: 'var(--accent)',
          letterSpacing: 2,
          lineHeight: 1,
        }}>
          PixelNova
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, letterSpacing: 2, textTransform: 'uppercase' }}>
          OS
        </div>
      </div>

      <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, letterSpacing: 1 }}>
        {lockSeconds > 0 ? `Bloqueado por ${lockSeconds}s` : 'Ingresa tu PIN'}
      </div>

      {/* Dots */}
      <div
        className={shake ? 'shake' : ''}
        style={{ display: 'flex', gap: 16, marginBottom: 16 }}
      >
        {[0,1,2,3].map((i) => (
          <div key={i} style={{
            width: 16, height: 16,
            borderRadius: '50%',
            background: i < digits.length ? 'var(--accent)' : 'var(--border)',
            border: `2px solid ${i < digits.length ? 'var(--accent)' : 'var(--text-muted)'}`,
            transition: 'all 0.15s',
          }} />
        ))}
      </div>

      {/* Error */}
      <div style={{ height: 20, marginBottom: 20, fontSize: 13, color: '#EF4444', textAlign: 'center' }}>
        {error}
      </div>

      {/* Keypad */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 72px)',
        gap: 12,
      }}>
        {keys.map((key, i) => {
          if (key === '') return <div key={i} />
          return (
            <button
              key={i}
              onClick={() => key === '⌫' ? handleDelete() : handleDigit(key)}
              disabled={lockSeconds > 0}
              style={{
                width: 72, height: 72,
                borderRadius: '50%',
                background: key === '⌫' ? 'transparent' : 'var(--bg-card)',
                border: `1px solid ${key === '⌫' ? 'transparent' : 'var(--border)'}`,
                color: key === '⌫' ? 'var(--text-muted)' : 'var(--text-main)',
                fontSize: key === '⌫' ? 22 : 24,
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 600,
                cursor: lockSeconds > 0 ? 'not-allowed' : 'pointer',
                opacity: lockSeconds > 0 ? 0.4 : 1,
                transition: 'background 0.1s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseDown={(e) => e.currentTarget.style.background = key === '⌫' ? 'transparent' : 'var(--bg-hover)'}
              onMouseUp={(e) => e.currentTarget.style.background = key === '⌫' ? 'transparent' : 'var(--bg-card)'}
              onTouchStart={(e) => e.currentTarget.style.background = key === '⌫' ? 'transparent' : 'var(--bg-hover)'}
              onTouchEnd={(e) => e.currentTarget.style.background = key === '⌫' ? 'transparent' : 'var(--bg-card)'}
            >
              {key}
            </button>
          )
        })}
      </div>
    </div>
  )
}
