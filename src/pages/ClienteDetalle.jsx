import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { useConfigStore } from '../store/useConfigStore'
import { useIsAdmin } from '../store/useIsAdmin'
import StatusBadge from '../components/StatusBadge'
import PasswordField from '../components/PasswordField'
import ProgressBar from '../components/ProgressBar'
import { ArrowLeft, Phone, Mail, ExternalLink, Plus, Trash2, Check } from 'lucide-react'

const tabs = ['Información', 'Cuentas', 'Pagos', 'Contenido']

export default function ClienteDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const clientes = useAppStore((s) => s.clientes)
  const precios = useConfigStore((s) => s.precios)
  const isAdmin = useIsAdmin()
  const updateCliente = useAppStore((s) => s.updateCliente)
  const marcarPagado = useAppStore((s) => s.marcarPagado)
  const addPago = useAppStore((s) => s.addPago)
  const updateCuenta = useAppStore((s) => s.updateCuenta)
  const addCuenta = useAppStore((s) => s.addCuenta)
  const deleteCuenta = useAppStore((s) => s.deleteCuenta)
  const videos = useAppStore((s) => s.videos)

  const cliente = clientes.find((c) => c.id === id)
  const [activeTab, setActiveTab] = useState(0)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(cliente ? { ...cliente } : {})
  const [showAddPago, setShowAddPago] = useState(false)
  const [newPago, setNewPago] = useState({ concepto: '', monto: '', fechaEsperada: '' })
  const [showAddCuenta, setShowAddCuenta] = useState(false)
  const [newCuenta, setNewCuenta] = useState({ plataforma: '', usuario: '', password: '', url: '', notas: '' })
  const [confirmPagoId, setConfirmPagoId] = useState(null)

  if (!cliente) return (
    <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
      <p>Cliente no encontrado.</p>
      <button onClick={() => navigate('/clientes')} style={{ marginTop: 16, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>← Volver</button>
    </div>
  )

  const clienteVideos = videos.filter((v) => v.clienteId === id && v.mes === '2026-04')
  const totalPagado = cliente.pagos.filter((p) => p.estado === 'PAGADO').reduce((s, p) => s + p.monto, 0)
  const totalPendiente = cliente.pagos.filter((p) => p.estado !== 'PAGADO').reduce((s, p) => s + p.monto, 0)
  const mesesPagados = cliente.pagos.filter((p) => p.estado === 'PAGADO' && p.monto >= 3000).length

  function saveEditing() {
    updateCliente(id, form)
    setEditing(false)
  }

  function handleAddPago(e) {
    e.preventDefault()
    addPago(id, { ...newPago, monto: parseFloat(newPago.monto), estado: 'PENDIENTE', fechaPago: null })
    setNewPago({ concepto: '', monto: '', fechaEsperada: '' })
    setShowAddPago(false)
  }

  function handleAddCuenta(e) {
    e.preventDefault()
    addCuenta(id, newCuenta)
    setNewCuenta({ plataforma: '', usuario: '', password: '', url: '', notas: '' })
    setShowAddCuenta(false)
  }

  const inputStyle = { fontSize: 14, padding: '8px 12px' }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, background: 'var(--bg-base)', zIndex: 10 }}>
        <button onClick={() => navigate('/clientes')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{cliente.nombre}</h2>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Paquete {cliente.paquete} · {cliente.estado}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', overflowX: 'auto' }}>
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            style={{
              padding: '12px 20px',
              background: 'none', border: 'none',
              borderBottom: activeTab === i ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === i ? 'var(--accent)' : 'var(--text-muted)',
              cursor: 'pointer', fontSize: 14, fontWeight: activeTab === i ? 600 : 400,
              whiteSpace: 'nowrap',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ padding: '20px 16px' }}>

        {/* TAB 0: INFORMACIÓN */}
        {activeTab === 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              {editing ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={saveEditing} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Guardar</button>
                  <button onClick={() => { setEditing(false); setForm({ ...cliente }) }} style={{ background: 'var(--bg-hover)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 14 }}>Cancelar</button>
                </div>
              ) : (
                isAdmin && <button onClick={() => setEditing(true)} style={{ background: 'var(--bg-hover)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 14 }}>Editar</button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Nombre del negocio', field: 'nombre' },
                { label: 'Propietario', field: 'propietario' },
                { label: 'Teléfono', field: 'telefono' },
                { label: 'Email', field: 'email' },
                { label: 'Dirección', field: 'direccion' },
                { label: 'Instagram', field: 'instagram' },
                { label: 'TikTok', field: 'tiktok' },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>{label}</label>
                  {editing ? (
                    <input value={form[field] || ''} onChange={(e) => setForm({ ...form, [field]: e.target.value })} style={inputStyle} />
                  ) : (
                    <div style={{ fontSize: 14, color: form[field] ? 'var(--text-main)' : 'var(--text-muted)', padding: '8px 0' }}>
                      {form[field] || '—'}
                      {field === 'telefono' && form[field] && (
                        <a href={`https://wa.me/${form[field].replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{ marginLeft: 12, color: '#25D366', fontSize: 12 }}>
                          <Phone size={12} style={{ display: 'inline', marginRight: 4 }} /> WhatsApp
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}

              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>Paquete</label>
                {editing ? (
                  <select value={form.paquete || 'Básico'} onChange={(e) => setForm({ ...form, paquete: e.target.value })} style={inputStyle}>
                    <option value="Básico">Básico — ${precios.basico.toLocaleString()}/mes</option>
                    <option value="Pro">Pro — ${precios.pro.toLocaleString()}/mes</option>
                    <option value="Premium">Premium — ${precios.premium.toLocaleString()}/mes</option>
                  </select>
                ) : (
                  <div style={{ fontSize: 14, padding: '8px 0' }}>{form.paquete}</div>
                )}
              </div>

              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>Fecha inicio</label>
                {editing ? (
                  <input type="date" value={form.fechaInicio || ''} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} style={inputStyle} />
                ) : (
                  <div style={{ fontSize: 14, padding: '8px 0' }}>
                    {form.fechaInicio ? new Date(form.fechaInicio).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>Notas internas</label>
                {editing ? (
                  <textarea value={form.notas || ''} onChange={(e) => setForm({ ...form, notas: e.target.value })} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
                ) : (
                  <div style={{ fontSize: 14, color: form.notas ? 'var(--text-main)' : 'var(--text-muted)', padding: '8px 0', whiteSpace: 'pre-wrap' }}>{form.notas || '—'}</div>
                )}
              </div>

              {/* No incluye */}
              {cliente.noIncluye && cliente.noIncluye.length > 0 && (
                <div className="card" style={{ padding: 16, borderRadius: 12, background: 'rgba(232,93,26,0.05)', borderColor: 'rgba(232,93,26,0.2)' }}>
                  <div style={{ fontSize: 12, color: '#E85D1A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, fontWeight: 600 }}>⚠️ No incluye</div>
                  {cliente.noIncluye.map((item, i) => (
                    <div key={i} style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4, paddingLeft: 8, borderLeft: '2px solid rgba(232,93,26,0.4)' }}>
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 1: CUENTAS */}
        {activeTab === 1 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Cuentas del cliente</h3>
              {isAdmin && <button onClick={() => setShowAddCuenta(!showAddCuenta)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                <Plus size={14} /> Agregar
              </button>}
            </div>

            {showAddCuenta && (
              <form onSubmit={handleAddCuenta} className="card" style={{ padding: 16, marginBottom: 16, borderRadius: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input value={newCuenta.plataforma} onChange={(e) => setNewCuenta({...newCuenta, plataforma: e.target.value})} placeholder="Plataforma" required />
                  <input value={newCuenta.usuario} onChange={(e) => setNewCuenta({...newCuenta, usuario: e.target.value})} placeholder="Usuario / Email" />
                  <PasswordField value={newCuenta.password} onChange={(v) => setNewCuenta({...newCuenta, password: v})} />
                  <input value={newCuenta.url} onChange={(e) => setNewCuenta({...newCuenta, url: e.target.value})} placeholder="URL" />
                  <input value={newCuenta.notas} onChange={(e) => setNewCuenta({...newCuenta, notas: e.target.value})} placeholder="Notas" />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="submit" style={{ flex: 1, background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, padding: '8px', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Guardar</button>
                    <button type="button" onClick={() => setShowAddCuenta(false)} style={{ flex: 1, background: 'var(--bg-hover)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px', cursor: 'pointer', fontSize: 14 }}>Cancelar</button>
                  </div>
                </div>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(cliente.cuentas || []).map((cuenta) => (
                <div key={cuenta.id} className="card" style={{ padding: 16, borderRadius: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 600 }}>{cuenta.plataforma}</h4>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {cuenta.url && (
                        <a href={cuenta.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', display: 'flex' }}>
                          <ExternalLink size={15} />
                        </a>
                      )}
                      {isAdmin && <button onClick={() => deleteCuenta(id, cuenta.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', display: 'flex' }}>
                        <Trash2 size={15} />
                      </button>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 2 }}>Usuario</label>
                      {isAdmin
                        ? <input value={cuenta.usuario || ''} onChange={(e) => updateCuenta(id, cuenta.id, { usuario: e.target.value })} style={{ fontSize: 13 }} placeholder="—" />
                        : <div style={{ fontSize: 13, padding: '8px 0', color: cuenta.usuario ? 'var(--text-main)' : 'var(--text-muted)' }}>{cuenta.usuario || '—'}</div>
                      }
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 2 }}>Contraseña</label>
                      <PasswordField value={cuenta.password} onChange={isAdmin ? (v) => updateCuenta(id, cuenta.id, { password: v }) : undefined} readOnly={!isAdmin} />
                    </div>
                    {cuenta.notas && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>{cuenta.notas}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: PAGOS */}
        {activeTab === 2 && (
          <div>
            {/* Resumen */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div className="card" style={{ padding: 16, borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 28, color: '#22C55E' }}>${totalPagado.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Cobrado</div>
              </div>
              <div className="card" style={{ padding: 16, borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 28, color: '#F5C518' }}>${totalPendiente.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Pendiente</div>
              </div>
            </div>

            <div className="card" style={{ padding: 16, marginBottom: 20, borderRadius: 12 }}>
              <ProgressBar value={mesesPagados} max={3} showLabel label="Meses pagados del contrato" />
            </div>

            {/* Tabla de pagos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {cliente.pagos.map((pago) => {
                const isVencido = pago.estado === 'PENDIENTE' && new Date(pago.fechaEsperada) < new Date()
                const displayEstado = isVencido ? 'VENCIDO' : pago.estado
                return (
                  <div key={pago.id} className="card" style={{ padding: '14px 16px', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{pago.concepto}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {new Date(pago.fechaEsperada).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-main)', marginRight: 8 }}>
                      ${pago.monto.toLocaleString()}
                    </div>
                    <StatusBadge status={displayEstado} />
                    {pago.estado === 'PENDIENTE' && isAdmin && (
                      confirmPagoId === pago.id ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => { marcarPagado(id, pago.id); setConfirmPagoId(null) }}
                            style={{ background: '#22C55E', color: 'white', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Check size={12} /> Sí
                          </button>
                          <button onClick={() => setConfirmPagoId(null)} style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 12 }}>No</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmPagoId(pago.id)}
                          style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap' }}>
                          Marcar pagado
                        </button>
                      )
                    )}
                  </div>
                )
              })}
            </div>

            {/* Agregar pago */}
            {isAdmin && <button onClick={() => setShowAddPago(!showAddPago)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-hover)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 14, marginBottom: 12 }}>
              <Plus size={14} /> Agregar pago
            </button>}

            {showAddPago && (
              <form onSubmit={handleAddPago} className="card" style={{ padding: 16, borderRadius: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input value={newPago.concepto} onChange={(e) => setNewPago({...newPago, concepto: e.target.value})} placeholder="Concepto" required />
                  <input type="number" value={newPago.monto} onChange={(e) => setNewPago({...newPago, monto: e.target.value})} placeholder="Monto (MXN)" required />
                  <input type="date" value={newPago.fechaEsperada} onChange={(e) => setNewPago({...newPago, fechaEsperada: e.target.value})} required />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="submit" style={{ flex: 1, background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, padding: '8px', cursor: 'pointer', fontWeight: 600 }}>Guardar</button>
                    <button type="button" onClick={() => setShowAddPago(false)} style={{ flex: 1, background: 'var(--bg-hover)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px', cursor: 'pointer' }}>Cancelar</button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: CONTENIDO */}
        {activeTab === 3 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Videos · Abril 2026</h3>
              <button onClick={() => navigate('/contenido')} style={{ color: 'var(--accent)', background: 'none', border: '1px solid rgba(59,158,255,0.4)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}>
                Ver tracker completo
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {clienteVideos.map((v) => (
                <div key={v.id} className="card" style={{ padding: '12px 16px', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 8 }}>#{v.numero}</span>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{v.descripcion}</span>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{v.tipo} · {v.plataforma}</div>
                  </div>
                  <StatusBadge status={v.estado} />
                </div>
              ))}
              {clienteVideos.length === 0 && (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No hay videos este mes.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
