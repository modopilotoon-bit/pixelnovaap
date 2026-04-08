import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

export default function Celebration({ milestone, onClose }) {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    // Fire confetti
    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#C9A84C', '#E8688A', '#E8C87C', '#F4A0B5', '#6B1A2A'],
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#C9A84C', '#E8688A', '#E8C87C', '#F4A0B5', '#6B1A2A'],
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    frame()

    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-6"
      style={{ background: 'rgba(13,6,8,0.9)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="celebration-pop card card-glow p-8 text-center max-w-sm w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-6xl mb-4" style={{ lineHeight: 1.2 }}>
          {milestone.emoji}
        </div>
        <h2
          className="text-2xl font-bold mb-2"
          style={{
            fontFamily: 'Playfair Display, serif',
            background: 'linear-gradient(135deg, #C9A84C, #E8C87C)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {milestone.title}
        </h2>
        <p className="text-base mb-6" style={{ color: '#B89FA8' }}>
          {milestone.message}
        </p>
        <button
          onClick={onClose}
          className="btn-primary"
          style={{ maxWidth: 200, margin: '0 auto' }}
        >
          ¡Seguimos! ✨
        </button>
      </div>
    </div>
  )
}
