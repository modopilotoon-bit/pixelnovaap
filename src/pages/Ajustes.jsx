import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useConfigStore } from '../store/useConfigStore'
import { useIsAdmin } from '../store/useIsAdmin'
import { Check } from 'lucide-react'

function getStoredPin() {
  try { return localStorage.getItem('pixelnova-pin') ? atob(localStorage.getItem('pixelnova-pin')) : '1234' } catch { return '1234' }
}

export default function Ajustes() {
  const exportData = useAppStore((s) => s.exportData)
  const importData = useAppStore((s) => s.importData)
  const resetAll = useAppStore((s) => s.resetAll)

  const precios = useConfigStore((s) => s.precios)
  const updatePrecios = useConfigStore((s) => s.updatePrecios)
  const reparto = useConfigStore((s) => s.reparto)
  const updateReparto = useConfigStore((s) => s.updateReparto)
  const socios = useConfigStore((s) => s.socios)
  const updateSocios = useConfigStore((s) => s.updateSocios)

  const [pinStep, setPinStep] = useState(0)
  const [pinActual, setPinActual] = useState('')
  const [pinNuevo, setPinNuevo] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [pinMsg, setPinMsg] = useState('')

  const [resetStep, setResetStep] = useState(0)
  const [importMsg, setImportMsg] = useState('')

  // Precios edit state
  const [preciosEdit, setPreciosEdit] = useState({ ...precios })
  const [preciosSaved, setPreciosSaved] = useState(false)

  // Reparto edit state
  const [repartoEdit, setRepartoEdit] = useState({ ...reparto })
  const [sociosEdit, setSociosEdit] = useState({ ...socios })
  const [repartoSaved, setRepartoSaved] = useState(false)
  const isAdmin = useIsAdmin()

  function handleChangePinStep() {
    if (pinStep === 0) { setPinStep(1); setPinMsg(''); return }
    if (pinStep === 1) {
      if (pinActual !== getStoredPin()) { setPinMsg('❌ PIN actual incorrecto'); return }
      setPinStep(2); setPinMsg('')
      return
    }
    if (pinStep === 2) {
      if (pinNuevo.length !== 4 || !/^\d{4}$/.test(pinNuevo)) { setPinMsg('❌ El PIN debe ser 4 dígitos'); return }
      setPinStep(3); setPinMsg('')
      return
    }
    if (pinStep === 3) {
      if (pinConfirm !== pinNuevo) { setPinMsg('❌ Los PINs no coinciden'); return }
      localStorage.setItem('pixelnova-pin', btoa(pinNuevo))
      setPinStep(0); setPinActual(''); setPinNuevo(''); setPinConfirm('')
      setPinMsg('✅ PIN actualizado correctamente')
      return
    }
  }

  function handleExport() {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pixelnova-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        const ok = importData(ev.target.result)
        setImportMsg(ok ? '✅ Datos importados correctamente' : '❌ Error al importar: JSON inválido')
        setTimeout(() => setImportMsg(''), 3000)
      }
      reader.readAsText(file)
    }
    input.click()
  }

  function handleReset() {
    if (resetStep === 0) { setResetStep(1); return }
    if (resetStep === 1) { setResetStep(2); return }
    resetAll()
    setResetStep(0)
  }

  function savePrecios() {
    updatePrecios({
      basico: parseFloat(preciosEdit.basico) || precios.basico,
      pro: parseFloat(preciosEdit.pro) || precios.pro,
      premium: parseFloat(preciosEdit.premium) || precios.premium,
    })
    setPreciosSaved(true)
    setTimeout(() => setPreciosSaved(false), 2000)
  }

  function saveReparto() {
    const r = parseFloat(repartoEdit.russell)
    const d = parseFloat(repartoEdit.diego)
    if (isNaN(r) || isNaN(d) || r + d !== 100) return
    updateReparto({ russell: r, diego: d })
    updateSocios({ s1: sociosEdit.s1 || socios.s1, s2: sociosEdit.s2 || socios.s2 })
    setRepartoSaved(true)
    setTimeout(() => setRepartoSaved(false), 2000)
  }

  const sectionStyle = { padding: 20, marginBottom: 14, borderRadius: 14, background: 'var(--bg-card)', border: '1px solid var(--border)' }
  const sectionTitle = { fontFamily: 'Bebas Neue, cursive', fontSize: 16, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 14 }
  const inputStyle = { fontSize: 14, padding: '8px 12px' }
  const labelStyle = { fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }

  return (
    <div style={{ padding: '20px 16px', maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 32, marginBottom: 24 }}>Ajustes</h1>

      {/* Precios de paquetes — solo admin */}
      {isAdmin && <div style={sectionStyle}>
        <div style={sectionTitle}>💲 PRECIOS DE PAQUETES</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { key: 'basico', label: 'Básico' },
            { key: 'pro', label: 'Pro' },
            { key: 'premium', label: 'Premium' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label style={labelStyle}>{label} (MXN/mes)</label>
              <input
                type="number"
                value={preciosEdit[key]}
                onChange={(e) => setPreciosEdit({...preciosEdit, [key]: e.target.value})}
                style={inputStyle}
              />
            </div>
          ))}
          <button
            onClick={savePrecios}
            style={{ background: preciosSaved ? '#22C55E' : 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background 0.2s' }}
          >
            {preciosSaved ? <><Check size={14} /> Guardado</> : 'Guardar precios'}
          </button>
        </div>
      </div>}

      {/* Reparto de ganancias — solo admin */}
      {isAdmin && <div style={sectionStyle}>
        <div style={sectionTitle}>💸 REPARTO DE GANANCIAS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Nombre socio 1</label>
              <input value={sociosEdit.s1} onChange={(e) => setSociosEdit({...sociosEdit, s1: e.target.value})} style={inputStyle} placeholder="Russell" />
            </div>
            <div>
              <label style={labelStyle}>% Socio 1</label>
              <input type="number" min="0" max="100" value={repartoEdit.russell} onChange={(e) => setRepartoEdit({...repartoEdit, russell: e.target.value})} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Nombre socio 2</label>
              <input value={sociosEdit.s2} onChange={(e) => setSociosEdit({...sociosEdit, s2: e.target.value})} style={inputStyle} placeholder="Diego" />
            </div>
            <div>
              <label style={labelStyle}>% Socio 2</label>
              <input type="number" min="0" max="100" value={repartoEdit.diego} onChange={(e) => setRepartoEdit({...repartoEdit, diego: e.target.value})} style={inputStyle} />
            </div>
          </div>
          <div style={{ fontSize: 12, color: parseFloat(repartoEdit.russell) + parseFloat(repartoEdit.diego) === 100 ? '#22C55E' : '#EF4444' }}>
            Total: {(parseFloat(repartoEdit.russell) || 0) + (parseFloat(repartoEdit.diego) || 0)}% {(parseFloat(repartoEdit.russell) || 0) + (parseFloat(repartoEdit.diego) || 0) === 100 ? '✓' : '(debe sumar 100%)'}
          </div>
          <button
            onClick={saveReparto}
            disabled={(parseFloat(repartoEdit.russell) || 0) + (parseFloat(repartoEdit.diego) || 0) !== 100}
            style={{ background: repartoSaved ? '#22C55E' : 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: (parseFloat(repartoEdit.russell) || 0) + (parseFloat(repartoEdit.diego) || 0) !== 100 ? 0.5 : 1, transition: 'background 0.2s' }}
          >
            {repartoSaved ? <><Check size={14} /> Guardado</> : 'Guardar reparto'}
          </button>
        </div>
      </div>}

      {/* Cambiar PIN — solo admin */}
      {!isAdmin && (
        <div style={{ ...sectionStyle, background: 'rgba(107,47,160,0.05)', border: '1px solid rgba(107,47,160,0.2)' }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>
            Cuenta <span style={{ color: '#A78BFA', fontWeight: 700 }}>Diego</span> · Solo lectura
          </div>
        </div>
      )}
      {/* Cambiar PIN */}
      {isAdmin &&
      <div style={sectionStyle}>
        <div style={sectionTitle}>🔒 CAMBIAR PIN</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pinStep >= 1 && (
            <div>
              <label style={labelStyle}>PIN actual</label>
              <input type="password" value={pinActual} onChange={(e) => setPinActual(e.target.value)} maxLength={4} style={{ ...inputStyle, letterSpacing: 8, textAlign: 'center', maxWidth: 200, fontFamily: 'monospace' }} placeholder="••••" />
            </div>
          )}
          {pinStep >= 2 && (
            <div>
              <label style={labelStyle}>PIN nuevo (4 dígitos)</label>
              <input type="password" value={pinNuevo} onChange={(e) => setPinNuevo(e.target.value)} maxLength={4} style={{ ...inputStyle, letterSpacing: 8, textAlign: 'center', maxWidth: 200, fontFamily: 'monospace' }} placeholder="••••" />
            </div>
          )}
          {pinStep >= 3 && (
            <div>
              <label style={labelStyle}>Confirmar PIN nuevo</label>
              <input type="password" value={pinConfirm} onChange={(e) => setPinConfirm(e.target.value)} maxLength={4} style={{ ...inputStyle, letterSpacing: 8, textAlign: 'center', maxWidth: 200, fontFamily: 'monospace' }} placeholder="••••" />
            </div>
          )}
          {pinMsg && (
            <div style={{ fontSize: 13, color: pinMsg.startsWith('✅') ? '#22C55E' : '#EF4444' }}>{pinMsg}</div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleChangePinStep} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
              {pinStep === 0 ? 'Cambiar PIN' : pinStep === 3 ? 'Confirmar' : 'Continuar'}
            </button>
            {pinStep > 0 && (
              <button onClick={() => { setPinStep(0); setPinActual(''); setPinNuevo(''); setPinConfirm(''); setPinMsg('') }} style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontSize: 14 }}>Cancelar</button>
            )}
          </div>
        </div>
      </div>}

      {/* Backup */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>💾 BACKUP DE DATOS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>Exporta todos los datos como JSON. Guárdalo en un lugar seguro.</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={handleExport} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
              ⬇️ Exportar JSON
            </button>
            <button onClick={handleImport} style={{ background: 'var(--bg-hover)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 14 }}>
              ⬆️ Importar JSON
            </button>
          </div>
          {importMsg && <div style={{ fontSize: 13, color: importMsg.startsWith('✅') ? '#22C55E' : '#EF4444' }}>{importMsg}</div>}
        </div>
      </div>

      {/* Borrar datos */}
      <div style={{ ...sectionStyle, borderColor: resetStep > 0 ? 'rgba(239,68,68,0.4)' : 'var(--border)' }}>
        <div style={{ ...sectionTitle, color: resetStep > 0 ? '#EF4444' : 'var(--text-muted)' }}>🗑️ BORRAR TODOS LOS DATOS</div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>
          {resetStep === 0 && 'Elimina todos los clientes, videos, herramientas y datos. Esta acción no se puede deshacer.'}
          {resetStep === 1 && '⚠️ ¿Estás seguro? Todos los datos serán eliminados permanentemente.'}
          {resetStep === 2 && '🔴 ÚLTIMA CONFIRMACIÓN: Haz clic en "Borrar todo" para confirmar.'}
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleReset} style={{ background: resetStep > 0 ? '#EF4444' : 'var(--bg-hover)', color: resetStep > 0 ? 'white' : '#EF4444', border: `1px solid ${resetStep > 0 ? '#EF4444' : 'rgba(239,68,68,0.4)'}`, borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
            {resetStep === 0 ? 'Borrar datos...' : resetStep === 1 ? 'Sí, continuar' : '🗑️ Borrar todo'}
          </button>
          {resetStep > 0 && (
            <button onClick={() => setResetStep(0)} style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontSize: 14 }}>Cancelar</button>
          )}
        </div>
      </div>

      {/* Info */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>ℹ️ ACERCA DE</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
          {[
            { label: 'Versión', value: 'v1.0.0', color: 'var(--text-main)' },
            { label: 'Estudio', value: 'Pixel Nova — Cancún, MX', color: 'var(--text-main)' },
            { label: 'Contacto', value: '+52 983 213 5455', color: 'var(--accent)' },
            { label: 'Email', value: 'modopilotoon@gmail.com', color: 'var(--text-main)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <span>{label}</span>
              <span style={{ color, fontWeight: 600 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
