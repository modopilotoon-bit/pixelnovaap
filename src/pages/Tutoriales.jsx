import { useState } from 'react'
import { tutoriales } from '../data/tutoriales'
import { ChevronLeft } from 'lucide-react'

const difColors = { 'Fácil': '#22C55E', 'Media': '#F5C518' }

export default function Tutoriales() {
  const [selected, setSelected] = useState(null)

  if (selected) {
    const t = tutoriales.find((x) => x.id === selected)
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, position: 'sticky', top: 0, background: 'var(--bg-base)', paddingTop: 4, paddingBottom: 12, borderBottom: '1px solid var(--border)', zIndex: 10 }}>
          <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 }}>
            <ChevronLeft size={18} /> Tutoriales
          </button>
        </div>

        <div style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 26, lineHeight: 1.1, marginBottom: 8 }}>{t.titulo}</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, background: 'rgba(59,158,255,0.1)', color: 'var(--accent)', padding: '3px 8px', borderRadius: 4 }}>{t.categoria}</span>
          <span style={{ fontSize: 12, background: `${difColors[t.dificultad]}22`, color: difColors[t.dificultad], padding: '3px 8px', borderRadius: 4 }}>{t.dificultad}</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.setup}</span>
        </div>

        {/* Objetivo */}
        <section style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--accent)', fontWeight: 600, marginBottom: 8 }}>🎯 Objetivo</div>
          <p style={{ fontSize: 15, color: 'var(--text-main)', lineHeight: 1.6 }}>{t.objetivo}</p>
        </section>

        {/* Equipo */}
        {t.equipo?.length > 0 && (
          <section style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#F5C518', fontWeight: 600, marginBottom: 8 }}>📦 Equipo necesario</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {t.equipo.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: '#22C55E', fontSize: 16, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 14, color: 'var(--text-main)' }}>{item}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Cuándo grabar */}
        {t.cuandoGrabar?.length > 0 && (
          <section style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#E85D1A', fontWeight: 600, marginBottom: 8 }}>⏱ Cuándo grabar</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {t.cuandoGrabar.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 12px', background: 'rgba(232,93,26,0.08)', borderRadius: 8, borderLeft: '3px solid #E85D1A' }}>
                  <span style={{ fontSize: 14, color: 'var(--text-main)' }}>→ {item}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pasos */}
        <section style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--accent)', fontWeight: 600, marginBottom: 12 }}>📋 Pasos</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {t.pasos.map((paso, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, background: 'var(--bg-card)', borderRadius: 10, padding: '12px 14px', fontSize: 14, lineHeight: 1.6, color: 'var(--text-main)', border: '1px solid var(--border)' }}>
                  {paso}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Diego edición */}
        {t.edicionDiego?.length > 0 && (
          <section style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#A78BFA', fontWeight: 600, marginBottom: 8 }}>🎬 Diego en edición (CapCut)</div>
            <div style={{ background: 'rgba(107,47,160,0.1)', border: '1px solid rgba(107,47,160,0.3)', borderRadius: 12, padding: 16 }}>
              {t.edicionDiego.map((item, i) => (
                <div key={i} style={{ fontSize: 14, color: 'var(--text-main)', marginBottom: i < t.edicionDiego.length - 1 ? 10 : 0, paddingLeft: 8, borderLeft: '2px solid rgba(167,139,250,0.5)', lineHeight: 1.5 }}>
                  → {item}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tips */}
        {t.tips?.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#34D399', fontWeight: 600, marginBottom: 8 }}>💡 Tips</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {t.tips.map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', background: 'rgba(52,211,153,0.08)', borderRadius: 8, borderLeft: '3px solid #34D399' }}>
                  <span style={{ fontSize: 14, color: 'var(--text-main)', lineHeight: 1.5 }}>{tip}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    )
  }

  return (
    <div style={{ padding: '20px 16px', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 28, marginBottom: 6 }}>Tutoriales</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Guías para usar el Samsung A55 en el restaurante</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {tutoriales.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelected(t.id)}
            style={{ textAlign: 'left', width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg-hover)' }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>{t.titulo}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, background: 'rgba(59,158,255,0.1)', color: 'var(--accent)', padding: '2px 6px', borderRadius: 4 }}>{t.categoria}</span>
                  <span style={{ fontSize: 11, background: `${difColors[t.dificultad]}22`, color: difColors[t.dificultad], padding: '2px 6px', borderRadius: 4 }}>{t.dificultad}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.setup}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {t.objetivo}
                </p>
              </div>
              <span style={{ color: 'var(--accent)', fontSize: 18, flexShrink: 0 }}>›</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
