import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import PasswordField from '../components/PasswordField'
import { ExternalLink, Plus, ChevronDown, ChevronUp } from 'lucide-react'

export default function Herramientas() {
  const herramientas = useAppStore((s) => s.herramientas)
  const updateHerramienta = useAppStore((s) => s.updateHerramienta)
  const addHerramienta = useAppStore((s) => s.addHerramienta)
  const [expandedId, setExpandedId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [newH, setNewH] = useState({ nombre: '', emoji: '🔧', descripcion: '', costo: 0, quien: 'Russell', url: '', usuario: '', password: '', notas: '' })

  const costoTotal = herramientas.reduce((sum, h) => sum + (h.costo || 0), 0)

  function handleAdd(e) {
    e.preventDefault()
    addHerramienta({ ...newH, costo: parseFloat(newH.costo) || 0 })
    setNewH({ nombre: '', emoji: '🔧', descripcion: '', costo: 0, quien: 'Russell', url: '', usuario: '', password: '', notas: '' })
    setShowForm(false)
  }

  return (
    <div style={{ padding: '20px 16px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h1 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 28 }}>Herramientas</h1>
        <button onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
          <Plus size={15} /> Nueva
        </button>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
        Herramientas de Pixel Nova · Costo total: <span style={{ color: '#F5C518', fontWeight: 600 }}>${costoTotal.toLocaleString()} MXN/mes</span>
      </p>

      {showForm && (
        <form onSubmit={handleAdd} className="card" style={{ padding: 16, marginBottom: 16, borderRadius: 12 }}>
          <div style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 16, color: 'var(--text-muted)', marginBottom: 12 }}>NUEVA HERRAMIENTA</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 10 }}>
              <input value={newH.emoji} onChange={(e) => setNewH({...newH, emoji: e.target.value})} placeholder="🔧" style={{ textAlign: 'center', fontSize: 22 }} maxLength={4} />
              <input value={newH.nombre} onChange={(e) => setNewH({...newH, nombre: e.target.value})} placeholder="Nombre" required />
            </div>
            <input value={newH.descripcion} onChange={(e) => setNewH({...newH, descripcion: e.target.value})} placeholder="Para qué sirve" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input type="number" value={newH.costo} onChange={(e) => setNewH({...newH, costo: e.target.value})} placeholder="Costo MXN/mes" />
              <select value={newH.quien} onChange={(e) => setNewH({...newH, quien: e.target.value})}>
                <option>Russell</option><option>Diego</option><option>Russell / Diego</option>
              </select>
            </div>
            <input value={newH.url} onChange={(e) => setNewH({...newH, url: e.target.value})} placeholder="URL" />
            <input value={newH.usuario} onChange={(e) => setNewH({...newH, usuario: e.target.value})} placeholder="Usuario / Email" />
            <PasswordField value={newH.password} onChange={(v) => setNewH({...newH, password: v})} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" style={{ flex: 1, background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, padding: '8px', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Guardar</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, background: 'var(--bg-hover)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px', cursor: 'pointer', fontSize: 14 }}>Cancelar</button>
            </div>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {herramientas.map((h) => {
          const isExpanded = expandedId === h.id
          return (
            <div key={h.id} className="card" style={{ borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => setExpandedId(isExpanded ? null : h.id)}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{h.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{h.nombre}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.descripcion}</div>
                </div>
                <div style={{ display: 'flex', flex: 'column', alignItems: 'flex-end', gap: 4, marginRight: 8, flexShrink: 0 }}>
                  {h.costo > 0 ? (
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#F5C518' }}>${h.costo}/mes</span>
                  ) : (
                    <span style={{ fontSize: 12, color: '#22C55E', fontWeight: 600 }}>Gratis</span>
                  )}
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{h.quien}</span>
                </div>
                {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
              </div>

              {isExpanded && (
                <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                    <div>
                      <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>Usuario / Email</label>
                      <input value={h.usuario || ''} onChange={(e) => updateHerramienta(h.id, { usuario: e.target.value })} style={{ fontSize: 13 }} placeholder="—" />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>Contraseña</label>
                      <PasswordField value={h.password} onChange={(v) => updateHerramienta(h.id, { password: v })} />
                    </div>
                    {h.url && (
                      <a href={h.url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--accent)', fontSize: 13, textDecoration: 'none' }}>
                        <ExternalLink size={14} /> {h.url.replace('https://', '')}
                      </a>
                    )}
                    {h.notas && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', background: 'var(--bg-base)', padding: '8px 10px', borderRadius: 6, borderLeft: '3px solid var(--border)' }}>
                        {h.notas}
                      </div>
                    )}
                    {h.costoDescripcion && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>💰 {h.costoDescripcion}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
