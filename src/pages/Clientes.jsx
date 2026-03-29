import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { useConfigStore } from '../store/useConfigStore'
import { useIsAdmin } from '../store/useIsAdmin'
import { Plus, ChevronRight, Phone, Mail } from 'lucide-react'

function getPaymentStatus(cliente) {
  const pendientes = cliente.pagos.filter((p) => p.estado === 'PENDIENTE')
  if (!pendientes.length) return 'ok'
  const now = new Date()
  const sorted = pendientes.sort((a, b) => new Date(a.fechaEsperada) - new Date(b.fechaEsperada))
  const next = new Date(sorted[0].fechaEsperada)
  const diffDays = Math.round((next - now) / 86400000)
  if (diffDays < 0) return 'vencido'
  if (diffDays <= 5) return 'proximo'
  return 'ok'
}

const statusColor = { ok: '#22C55E', proximo: '#F5C518', vencido: '#EF4444' }

export default function Clientes() {
  const navigate = useNavigate()
  const clientes = useAppStore((s) => s.clientes)
  const addCliente = useAppStore((s) => s.addCliente)
  const precios = useConfigStore((s) => s.precios)
  const isAdmin = useIsAdmin()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nombre: '', propietario: '', telefono: '', email: '', paquete: 'Básico' })

  function handleAdd(e) {
    e.preventDefault()
    addCliente({ ...form, estado: 'ACTIVO', pagos: [], cuentas: [], diasGrabacion: [], notas: '', noIncluye: [] })
    setForm({ nombre: '', propietario: '', telefono: '', email: '', paquete: 'Básico' })
    setShowForm(false)
  }

  return (
    <div style={{ padding: '20px 16px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 28 }}>Clientes</h1>
        {isAdmin && <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--accent)', color: 'white',
            border: 'none', borderRadius: 8, padding: '8px 16px',
            cursor: 'pointer', fontSize: 14, fontWeight: 600,
          }}
        >
          <Plus size={16} /> Nuevo
        </button>}
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="card" style={{ padding: 20, marginBottom: 20, borderRadius: 12 }}>
          <div style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 18, marginBottom: 16, color: 'var(--text-muted)' }}>NUEVO CLIENTE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} placeholder="Nombre del negocio" required />
            <input value={form.propietario} onChange={(e) => setForm({...form, propietario: e.target.value})} placeholder="Propietario" />
            <input value={form.telefono} onChange={(e) => setForm({...form, telefono: e.target.value})} placeholder="Teléfono" />
            <input value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder="Email" />
            <select value={form.paquete} onChange={(e) => setForm({...form, paquete: e.target.value})}>
              <option value="Básico">Básico — ${precios.basico.toLocaleString()} MXN/mes</option>
              <option value="Pro">Pro — ${precios.pro.toLocaleString()} MXN/mes</option>
              <option value="Premium">Premium — ${precios.premium.toLocaleString()} MXN/mes</option>
            </select>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" style={{ flex: 1, background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, padding: '10px', cursor: 'pointer', fontWeight: 600 }}>Crear cliente</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, background: 'var(--bg-hover)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px', cursor: 'pointer' }}>Cancelar</button>
            </div>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {clientes.map((cliente) => {
          const pStatus = getPaymentStatus(cliente)
          const pendientes = cliente.pagos.filter((p) => p.estado === 'PENDIENTE')
          const proxPago = pendientes.sort((a,b) => new Date(a.fechaEsperada) - new Date(b.fechaEsperada))[0]

          return (
            <div
              key={cliente.id}
              className="card card-hover"
              onClick={() => navigate(`/clientes/${cliente.id}`)}
              style={{ padding: '16px 20px', borderRadius: 12, cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: statusColor[pStatus],
                      flexShrink: 0,
                    }} />
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>{cliente.nombre}</h3>
                  </div>
                  {cliente.descripcion && (
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, marginLeft: 20 }}>{cliente.descripcion}</p>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginLeft: 20 }}>
                    <span style={{ fontSize: 12, background: 'rgba(107,47,160,0.2)', color: '#A78BFA', padding: '2px 8px', borderRadius: 4 }}>
                      Paquete {cliente.paquete}
                    </span>
                    <span style={{ fontSize: 12, background: 'rgba(59,158,255,0.1)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 4 }}>
                      {cliente.estado}
                    </span>
                  </div>
                  {proxPago && (
                    <div style={{ marginTop: 8, marginLeft: 20, fontSize: 12, color: statusColor[pStatus] }}>
                      Próximo pago: ${proxPago.monto.toLocaleString()} · {new Date(proxPago.fechaEsperada).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>
                <ChevronRight size={18} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 4 }} />
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                {cliente.telefono && (
                  <a href={`https://wa.me/${cliente.telefono.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#25D366', textDecoration: 'none' }}>
                    <Phone size={13} /> WhatsApp
                  </a>
                )}
                {cliente.email && (
                  <a href={`mailto:${cliente.email}`} onClick={(e) => e.stopPropagation()}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>
                    <Mail size={13} /> Email
                  </a>
                )}
              </div>
            </div>
          )
        })}
        {clientes.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            No hay clientes aún. Agrega uno con el botón +.
          </div>
        )}
      </div>
    </div>
  )
}
