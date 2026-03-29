import { useState } from 'react'
import { useFinanceStore } from '../store/useFinanceStore'
import { useConfigStore } from '../store/useConfigStore'
import { useIsAdmin } from '../store/useIsAdmin'
import ProgressBar from '../components/ProgressBar'
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react'

const categorias = ['Apps y herramientas', 'TikTok Ads', 'Transporte', 'Equipo', 'Otros']

export default function Finanzas() {
  const ingresos = useFinanceStore((s) => s.ingresos)
  const gastos = useFinanceStore((s) => s.gastos)
  const addIngreso = useFinanceStore((s) => s.addIngreso)
  const updateIngreso = useFinanceStore((s) => s.updateIngreso)
  const deleteIngreso = useFinanceStore((s) => s.deleteIngreso)
  const addGasto = useFinanceStore((s) => s.addGasto)
  const updateGasto = useFinanceStore((s) => s.updateGasto)
  const deleteGasto = useFinanceStore((s) => s.deleteGasto)

  const reparto = useConfigStore((s) => s.reparto)
  const socios = useConfigStore((s) => s.socios)
  const isAdmin = useIsAdmin()

  const [mesActual] = useState('2026-04')
  const [showAddIngreso, setShowAddIngreso] = useState(false)
  const [showAddGasto, setShowAddGasto] = useState(false)
  const [newIngreso, setNewIngreso] = useState({ concepto: '', monto: '', cobrado: '' })
  const [newGasto, setNewGasto] = useState({ nombre: '', monto: '', categoria: 'Apps y herramientas', fecha: '' })

  const [editIngresoId, setEditIngresoId] = useState(null)
  const [editIngresoData, setEditIngresoData] = useState({})
  const [editGastoId, setEditGastoId] = useState(null)
  const [editGastoData, setEditGastoData] = useState({})

  const ingMes = ingresos.filter((i) => i.mes === mesActual)
  const gastMes = gastos.filter((g) => g.mes === mesActual)

  const totalIngresos = ingMes.reduce((s, i) => s + i.monto, 0)
  const totalCobrado = ingMes.reduce((s, i) => s + (i.cobrado ?? i.monto), 0)
  const totalGastos = gastMes.reduce((s, g) => s + g.monto, 0)
  const disponible = totalIngresos - totalGastos
  const gana1 = Math.round(disponible * (reparto.russell / 100))
  const gana2 = Math.round(disponible * (reparto.diego / 100))

  const historial = [
    { mes: '2026-03', label: 'Marzo 2026', ingresado: 1750, gastado: 0, neto: 1750, s1: 1103, s2: 647 },
  ]

  function handleAddIngreso(e) {
    e.preventDefault()
    addIngreso({
      mes: mesActual,
      concepto: newIngreso.concepto,
      monto: parseFloat(newIngreso.monto),
      cobrado: parseFloat(newIngreso.cobrado || newIngreso.monto),
    })
    setNewIngreso({ concepto: '', monto: '', cobrado: '' })
    setShowAddIngreso(false)
  }

  function handleAddGasto(e) {
    e.preventDefault()
    addGasto({
      mes: mesActual,
      ...newGasto,
      monto: parseFloat(newGasto.monto),
      fecha: newGasto.fecha || new Date().toISOString().split('T')[0],
    })
    setNewGasto({ nombre: '', monto: '', categoria: 'Apps y herramientas', fecha: '' })
    setShowAddGasto(false)
  }

  function startEditIngreso(ing) {
    setEditIngresoId(ing.id)
    setEditIngresoData({ concepto: ing.concepto, monto: ing.monto, cobrado: ing.cobrado ?? ing.monto })
  }

  function saveEditIngreso() {
    updateIngreso(editIngresoId, {
      concepto: editIngresoData.concepto,
      monto: parseFloat(editIngresoData.monto),
      cobrado: parseFloat(editIngresoData.cobrado),
    })
    setEditIngresoId(null)
  }

  function startEditGasto(g) {
    setEditGastoId(g.id)
    setEditGastoData({ nombre: g.nombre, monto: g.monto, categoria: g.categoria, fecha: g.fecha })
  }

  function saveEditGasto() {
    updateGasto(editGastoId, {
      nombre: editGastoData.nombre,
      monto: parseFloat(editGastoData.monto),
      categoria: editGastoData.categoria,
      fecha: editGastoData.fecha,
    })
    setEditGastoId(null)
  }

  return (
    <div style={{ padding: '20px 16px', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 32, marginBottom: 4 }}>Finanzas</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>Abril 2026</p>

      {/* Resumen principal */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
        <div style={{ padding: '18px 16px', borderRadius: 14, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 34, color: '#22C55E' }}>${totalIngresos.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>Ingresos del mes</div>
        </div>
        <div style={{ padding: '18px 16px', borderRadius: 14, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 34, color: '#EF4444' }}>${totalGastos.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>Gastos operativos</div>
        </div>
      </div>

      {/* Progreso cobrado */}
      <div style={{ padding: 16, marginBottom: 14, borderRadius: 14, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <ProgressBar value={totalCobrado} max={totalIngresos || 1} showLabel label="Cobrado este mes" color="#22C55E" />
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
          Pendiente: <span style={{ color: '#F5C518', fontWeight: 700 }}>${(totalIngresos - totalCobrado).toLocaleString()}</span>
        </div>
      </div>

      {/* Reparto */}
      <div style={{ padding: 20, marginBottom: 14, borderRadius: 14, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 16, color: 'var(--text-muted)', letterSpacing: 1 }}>REPARTO DEL MES</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Editar en Ajustes</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div style={{ textAlign: 'center', padding: '16px 12px', background: 'rgba(59,158,255,0.1)', borderRadius: 12, border: '1px solid rgba(59,158,255,0.2)' }}>
            <div style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 36, color: 'var(--accent)' }}>${gana1.toLocaleString()}</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{socios.s1}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{reparto.russell}% del neto</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px 12px', background: 'rgba(107,47,160,0.1)', borderRadius: 12, border: '1px solid rgba(107,47,160,0.2)' }}>
            <div style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 36, color: '#A78BFA' }}>${gana2.toLocaleString()}</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{socios.s2}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{reparto.diego}% del neto</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          Neto disponible: <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>${disponible.toLocaleString()}</span>
          <span style={{ marginLeft: 8 }}>(${totalIngresos.toLocaleString()} − ${totalGastos.toLocaleString()})</span>
        </div>
      </div>

      {/* Ingresos */}
      <div style={{ padding: 16, marginBottom: 14, borderRadius: 14, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 16, color: 'var(--text-muted)', letterSpacing: 1 }}>INGRESOS</div>
          {isAdmin && (
            <button onClick={() => setShowAddIngreso(!showAddIngreso)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(34,197,94,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}><Plus size={12} /> Agregar</button>
          )}
        </div>

        {showAddIngreso && (
          <form onSubmit={handleAddIngreso} style={{ marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 8, padding: 14, background: 'var(--bg-base)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <input value={newIngreso.concepto} onChange={(e) => setNewIngreso({...newIngreso, concepto: e.target.value})} placeholder="Concepto / Cliente" required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input type="number" value={newIngreso.monto} onChange={(e) => setNewIngreso({...newIngreso, monto: e.target.value})} placeholder="Monto total" required />
              <input type="number" value={newIngreso.cobrado} onChange={(e) => setNewIngreso({...newIngreso, cobrado: e.target.value})} placeholder="Cobrado (opcional)" />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" style={{ flex: 1, background: '#22C55E', color: 'white', border: 'none', borderRadius: 8, padding: '8px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Guardar</button>
              <button type="button" onClick={() => setShowAddIngreso(false)} style={{ flex: 1, background: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px', cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
            </div>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {ingMes.map((ing) => (
            <div key={ing.id}>
              {editIngresoId === ing.id ? (
                <div style={{ padding: '12px', borderRadius: 10, background: 'var(--bg-base)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 4 }}>
                  <input value={editIngresoData.concepto} onChange={(e) => setEditIngresoData({...editIngresoData, concepto: e.target.value})} placeholder="Concepto" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <input type="number" value={editIngresoData.monto} onChange={(e) => setEditIngresoData({...editIngresoData, monto: e.target.value})} placeholder="Monto total" />
                    <input type="number" value={editIngresoData.cobrado} onChange={(e) => setEditIngresoData({...editIngresoData, cobrado: e.target.value})} placeholder="Cobrado" />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={saveEditIngreso} style={{ flex: 1, background: '#22C55E', color: 'white', border: 'none', borderRadius: 8, padding: '7px', cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><Check size={13} /> Guardar</button>
                    <button onClick={() => setEditIngresoId(null)} style={{ flex: 1, background: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><X size={13} /> Cancelar</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 2px', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{ing.concepto}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      Cobrado: <span style={{ color: '#22C55E' }}>${(ing.cobrado ?? ing.monto).toLocaleString()}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 20, color: '#22C55E' }}>${ing.monto.toLocaleString()}</span>
                    {isAdmin && <button onClick={() => startEditIngreso(ing)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}><Pencil size={13} /></button>}
                    {isAdmin && <button onClick={() => deleteIngreso(ing.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', display: 'flex', padding: 4 }}><Trash2 size={13} /></button>}
                  </div>
                </div>
              )}
            </div>
          ))}
          {ingMes.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>Sin ingresos registrados</p>}
        </div>
      </div>

      {/* Gastos */}
      <div style={{ padding: 16, marginBottom: 20, borderRadius: 14, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 16, color: 'var(--text-muted)', letterSpacing: 1 }}>GASTOS OPERATIVOS</div>
          {isAdmin && (
            <button onClick={() => setShowAddGasto(!showAddGasto)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}><Plus size={12} /> Agregar</button>
          )}
        </div>

        {showAddGasto && (
          <form onSubmit={handleAddGasto} style={{ marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 8, padding: 14, background: 'var(--bg-base)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <input value={newGasto.nombre} onChange={(e) => setNewGasto({...newGasto, nombre: e.target.value})} placeholder="Nombre del gasto" required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input type="number" value={newGasto.monto} onChange={(e) => setNewGasto({...newGasto, monto: e.target.value})} placeholder="Monto MXN" required />
              <input type="date" value={newGasto.fecha} onChange={(e) => setNewGasto({...newGasto, fecha: e.target.value})} />
            </div>
            <select value={newGasto.categoria} onChange={(e) => setNewGasto({...newGasto, categoria: e.target.value})}>
              {categorias.map((c) => <option key={c}>{c}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" style={{ flex: 1, background: '#EF4444', color: 'white', border: 'none', borderRadius: 8, padding: '8px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Guardar</button>
              <button type="button" onClick={() => setShowAddGasto(false)} style={{ flex: 1, background: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px', cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
            </div>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {gastMes.map((g) => (
            <div key={g.id}>
              {editGastoId === g.id ? (
                <div style={{ padding: '12px', borderRadius: 10, background: 'var(--bg-base)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 4 }}>
                  <input value={editGastoData.nombre} onChange={(e) => setEditGastoData({...editGastoData, nombre: e.target.value})} placeholder="Nombre" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <input type="number" value={editGastoData.monto} onChange={(e) => setEditGastoData({...editGastoData, monto: e.target.value})} placeholder="Monto" />
                    <input type="date" value={editGastoData.fecha} onChange={(e) => setEditGastoData({...editGastoData, fecha: e.target.value})} />
                  </div>
                  <select value={editGastoData.categoria} onChange={(e) => setEditGastoData({...editGastoData, categoria: e.target.value})}>
                    {categorias.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={saveEditGasto} style={{ flex: 1, background: '#EF4444', color: 'white', border: 'none', borderRadius: 8, padding: '7px', cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><Check size={13} /> Guardar</button>
                    <button onClick={() => setEditGastoId(null)} style={{ flex: 1, background: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><X size={13} /> Cancelar</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 2px', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{g.nombre}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{g.categoria} · {g.fecha}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 20, color: '#EF4444' }}>${g.monto.toLocaleString()}</span>
                    {isAdmin && <button onClick={() => startEditGasto(g)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}><Pencil size={13} /></button>}
                    {isAdmin && <button onClick={() => deleteGasto(g.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', display: 'flex', padding: 4 }}><Trash2 size={13} /></button>}
                  </div>
                </div>
              )}
            </div>
          ))}
          {gastMes.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>Sin gastos registrados</p>}
        </div>
      </div>

      {/* Historial */}
      <div>
        <div style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 18, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 12 }}>HISTORIAL</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {historial.map((h) => (
            <div key={h.mes} style={{ padding: '14px 16px', borderRadius: 14, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>{h.label}</span>
                <span style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 18, color: '#22C55E' }}>${h.neto.toLocaleString()} neto</span>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                <span>Ingresado: ${h.ingresado.toLocaleString()}</span>
                <span>Gastado: ${h.gastado.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, marginTop: 4 }}>
                <span style={{ color: 'var(--accent)' }}>{socios.s1}: ${h.s1.toLocaleString()}</span>
                <span style={{ color: '#A78BFA' }}>{socios.s2}: ${h.s2.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
