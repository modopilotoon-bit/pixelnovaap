import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useIsAdmin } from '../store/useIsAdmin'
import StatusBadge from '../components/StatusBadge'
import ProgressBar from '../components/ProgressBar'
import { Plus, ChevronDown, ChevronUp, ExternalLink, Pencil, Trash2, Check, X } from 'lucide-react'

const ESTADOS = ['PENDIENTE', 'GRABADO', 'EN EDICIÓN', 'LISTO', 'APROBADO', 'PUBLICADO']

const tipoColors = {
  'Process': '#3B9EFF',
  'ASMR': '#A78BFA',
  'BTS': '#34D399',
  'Humor': '#F5C518',
  'Comparativa': '#FB923C',
  'Promo': '#F472B6',
}

export default function Contenido() {
  const videos = useAppStore((s) => s.videos)
  const avanzarEstado = useAppStore((s) => s.avanzarEstado)
  const updateVideo = useAppStore((s) => s.updateVideo)
  const deleteVideo = useAppStore((s) => s.deleteVideo)
  const addVideo = useAppStore((s) => s.addVideo)
  const grabaciones = useAppStore((s) => s.grabaciones)
  const toggleGrabacion = useAppStore((s) => s.toggleGrabacion)

  const [mesActual] = useState('2026-04')
  const [clienteId] = useState('nicos-house')
  const [expandedId, setExpandedId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [vista, setVista] = useState('lista')
  const [newVideo, setNewVideo] = useState({ descripcion: '', tipo: 'Process', plataforma: 'Ambas', responsable: 'Diego' })
  const [editDescId, setEditDescId] = useState(null)
  const [editDescValue, setEditDescValue] = useState('')
  const isAdmin = useIsAdmin()

  const videosMes = videos
    .filter((v) => v.mes === mesActual && v.clienteId === clienteId)
    .sort((a, b) => a.numero - b.numero)

  const publicados = videosMes.filter((v) => v.estado === 'PUBLICADO').length
  const grabsMes = grabaciones.filter((g) => g.mes === mesActual && g.clienteId === clienteId)
  const grabsRealizadas = grabsMes.filter((g) => g.completada).length

  function handleAdd(e) {
    e.preventDefault()
    addVideo({
      ...newVideo,
      clienteId,
      mes: mesActual,
      numero: videosMes.length + 1,
      estado: 'PENDIENTE',
      notas: '',
      link: '',
      fechaPublicacion: null,
    })
    setNewVideo({ descripcion: '', tipo: 'Process', plataforma: 'Ambas', responsable: 'Diego' })
    setShowForm(false)
  }

  return (
    <div style={{ padding: '20px 16px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 28 }}>Contenido</h1>
        {isAdmin && (
          <button onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            <Plus size={16} /> Video
          </button>
        )}
      </div>

      {/* Progress */}
      <div className="card" style={{ padding: 16, marginBottom: 20, borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 16, color: 'var(--text-muted)', letterSpacing: 1 }}>ABRIL 2026 · NICO'S HOUSE</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['lista', 'kanban'].map((v) => (
              <button key={v} onClick={() => setVista(v)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: vista === v ? 'var(--accent)' : 'var(--bg-hover)', color: vista === v ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontSize: 12, textTransform: 'capitalize' }}>
                {v}
              </button>
            ))}
          </div>
        </div>
        <ProgressBar value={publicados} max={videosMes.length} showLabel label="Videos publicados" />

        {/* Grabaciones */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Grabaciones del mes</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {grabsMes.map((g) => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => toggleGrabacion(g.id)} style={{
                  width: 20, height: 20, borderRadius: 4,
                  background: g.completada ? 'var(--success)' : 'var(--bg-base)',
                  border: `2px solid ${g.completada ? 'var(--success)' : 'var(--border)'}`,
                  cursor: 'pointer', color: 'white', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {g.completada && '✓'}
                </button>
                <span style={{ fontSize: 13, color: g.completada ? 'var(--text-muted)' : 'var(--text-main)', textDecoration: g.completada ? 'line-through' : 'none' }}>
                  {g.tipo} — {new Date(g.fecha + 'T12:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="card" style={{ padding: 16, marginBottom: 16, borderRadius: 12 }}>
          <div style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 16, color: 'var(--text-muted)', marginBottom: 12 }}>NUEVO VIDEO</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input value={newVideo.descripcion} onChange={(e) => setNewVideo({...newVideo, descripcion: e.target.value})} placeholder="Descripción del video" required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <select value={newVideo.tipo} onChange={(e) => setNewVideo({...newVideo, tipo: e.target.value})}>
                {['Process','ASMR','BTS','Humor','Comparativa','Promo'].map((t) => <option key={t}>{t}</option>)}
              </select>
              <select value={newVideo.plataforma} onChange={(e) => setNewVideo({...newVideo, plataforma: e.target.value})}>
                <option>Ambas</option><option>TikTok</option><option>Instagram</option>
              </select>
            </div>
            <select value={newVideo.responsable} onChange={(e) => setNewVideo({...newVideo, responsable: e.target.value})}>
              <option>Diego</option><option>Russell</option>
            </select>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" style={{ flex: 1, background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, padding: '8px', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Agregar</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, background: 'var(--bg-hover)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px', cursor: 'pointer', fontSize: 14 }}>Cancelar</button>
            </div>
          </div>
        </form>
      )}

      {/* Vista lista */}
      {vista === 'lista' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {videosMes.map((v) => {
            const isExpanded = expandedId === v.id
            const currentIdx = ESTADOS.indexOf(v.estado)
            const canAdvance = currentIdx < ESTADOS.length - 1

            return (
              <div key={v.id} className="card" style={{ borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, minWidth: 28 }}>#{v.numero}</span>
                  <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setExpandedId(isExpanded ? null : v.id)}>
                    {editDescId === v.id ? (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <input
                          value={editDescValue}
                          onChange={(e) => setEditDescValue(e.target.value)}
                          autoFocus
                          style={{ fontSize: 13, padding: '4px 8px', flex: 1 }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') { updateVideo(v.id, { descripcion: editDescValue }); setEditDescId(null) }
                            if (e.key === 'Escape') setEditDescId(null)
                          }}
                        />
                        <button onClick={() => { updateVideo(v.id, { descripcion: editDescValue }); setEditDescId(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#22C55E', display: 'flex' }}><Check size={14} /></button>
                        <button onClick={() => setEditDescId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={14} /></button>
                      </div>
                    ) : (
                      <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.descripcion}</div>
                    )}
                    <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: tipoColors[v.tipo] || 'var(--text-muted)', background: `${tipoColors[v.tipo]}22`, padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>{v.tipo}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.plataforma}</span>
                    </div>
                  </div>
                  <StatusBadge status={v.estado} />
                  {isAdmin && (
                    <button onClick={(e) => { e.stopPropagation(); setEditDescId(v.id); setEditDescValue(v.descripcion) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}>
                      <Pencil size={13} />
                    </button>
                  )}
                  {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => setExpandedId(null)} /> : <ChevronDown size={16} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => setExpandedId(v.id)} />}
                </div>

                {isExpanded && (
                  <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {canAdvance && (
                          <button onClick={() => avanzarEstado(v.id)} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                            → {ESTADOS[currentIdx + 1]}
                          </button>
                        )}
                      </div>
                      {isAdmin && (
                        <button onClick={() => deleteVideo(v.id)} style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Trash2 size={12} /> Eliminar
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
                      <div>
                        <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>Plataforma</label>
                        <select value={v.plataforma} onChange={(e) => updateVideo(v.id, { plataforma: e.target.value })} style={{ fontSize: 13 }}>
                          <option>Ambas</option><option>TikTok</option><option>Instagram</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>Edición</label>
                        <select value={v.responsable} onChange={(e) => updateVideo(v.id, { responsable: e.target.value })} style={{ fontSize: 13 }}>
                          <option>Diego</option><option>Russell</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>Notas / música / efectos</label>
                      <textarea value={v.notas} onChange={(e) => updateVideo(v.id, { notas: e.target.value })} rows={2} style={{ fontSize: 13, resize: 'none' }} placeholder="Ej: música dramática, sin texto, ASMR..." />
                    </div>

                    {v.estado === 'PUBLICADO' && (
                      <div style={{ marginTop: 10 }}>
                        <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>Link publicado</label>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input value={v.link} onChange={(e) => updateVideo(v.id, { link: e.target.value })} style={{ fontSize: 13 }} placeholder="https://..." />
                          {v.link && <a href={v.link} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', display: 'flex', flexShrink: 0 }}><ExternalLink size={16} /></a>}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Vista Kanban */}
      {vista === 'kanban' && (
        <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
          <div style={{ display: 'flex', gap: 12, minWidth: 'max-content' }}>
            {ESTADOS.map((estado) => {
              const cols = videosMes.filter((v) => v.estado === estado)
              return (
                <div key={estado} style={{ width: 180, flexShrink: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, padding: '4px 8px' }}>
                    <StatusBadge status={estado} /> <span style={{ marginLeft: 4, color: 'var(--text-muted)' }}>{cols.length}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {cols.map((v) => (
                      <div key={v.id} className="card" style={{ padding: '12px', borderRadius: 10 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>#{v.numero}</div>
                        <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>{v.descripcion}</div>
                        <div style={{ fontSize: 11, color: tipoColors[v.tipo] || 'var(--text-muted)', marginTop: 6 }}>{v.tipo}</div>
                        {ESTADOS.indexOf(v.estado) < ESTADOS.length - 1 && (
                          <button onClick={() => avanzarEstado(v.id)} style={{ marginTop: 8, width: '100%', background: 'rgba(59,158,255,0.15)', color: 'var(--accent)', border: '1px solid rgba(59,158,255,0.3)', borderRadius: 6, padding: '4px', cursor: 'pointer', fontSize: 11 }}>
                            → Avanzar
                          </button>
                        )}
                      </div>
                    ))}
                    {cols.length === 0 && (
                      <div style={{ height: 60, border: '1px dashed var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Vacío</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
