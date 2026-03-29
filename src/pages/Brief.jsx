import { useState, useRef } from 'react'
import { useAppStore } from '../store/useAppStore'
import { Download, Copy, Plus, X } from 'lucide-react'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export default function Brief() {
  const clientes = useAppStore((s) => s.clientes)
  const previewRef = useRef(null)

  const [form, setForm] = useState({
    clienteId: 'nicos-house',
    mes: 'Abril',
    año: '2026',
    productos: ['Mamastrosa', 'Hot dogs', 'Malteadas'],
    promociones: ['Martes de boneless 2x1'],
    novedades: '',
    tendencias: '',
    tomasEspeciales: 'Drive-thru en hora pico, close-ups de queso derritiéndose',
    notasCliente: 'Armando quiere mostrar el drive-thru y el ambiente del local',
    grabaciones: [
      'Miércoles 4:10 PM — Local activo con clientes (ambiente)',
      'Viernes 6:00 PM — Local tranquilo, tomas de producto',
    ],
  })

  const [showPreview, setShowPreview] = useState(false)
  const cliente = clientes.find((c) => c.id === form.clienteId)

  function addItem(field) {
    setForm((f) => ({ ...f, [field]: [...f[field], ''] }))
  }

  function updateItem(field, index, value) {
    setForm((f) => {
      const arr = [...f[field]]
      arr[index] = value
      return { ...f, [field]: arr }
    })
  }

  function removeItem(field, index) {
    setForm((f) => ({ ...f, [field]: f[field].filter((_, i) => i !== index) }))
  }

  function copyAsText() {
    const text = `
BRIEF DE CONTENIDO — ${form.mes} ${form.año}
${cliente?.nombre || 'Cliente'}
Generado por: PixelNova — Russell Molina

📦 PRODUCTOS A DESTACAR:
${form.productos.map((p) => `• ${p}`).join('\n')}

🎯 PROMOCIONES ACTIVAS:
${form.promociones.map((p) => `• ${p}`).join('\n')}

✨ NOVEDADES DEL MES:
${form.novedades || '(ninguna)'}

📱 TENDENCIAS IDENTIFICADAS:
${form.tendencias || '(ninguna)'}

🎬 TOMAS ESPECIALES:
${form.tomasEspeciales || '(ninguna)'}

💬 NOTAS DEL CLIENTE:
${form.notasCliente || '(ninguna)'}

📅 GRABACIONES CONFIRMADAS:
${form.grabaciones.map((g) => `• ${g}`).join('\n')}

---
Russell Molina · +52 983 213 5455 · PixelNova
`.trim()
    navigator.clipboard.writeText(text).then(() => alert('Brief copiado al portapapeles ✓'))
  }

  async function exportPNG() {
    if (!previewRef.current) return
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: '#111118',
        scale: 2,
        useCORS: true,
      })
      const link = document.createElement('a')
      link.download = `brief-${cliente?.nombre || 'cliente'}-${form.mes}-${form.año}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      alert('Error al exportar: ' + err.message)
    }
  }

  return (
    <div style={{ padding: '20px 16px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 28 }}>Brief Generador</h1>
        <button onClick={() => setShowPreview(!showPreview)} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
          {showPreview ? 'Editar' : 'Vista previa'}
        </button>
      </div>

      {!showPreview ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Cliente y mes */}
          <div className="card" style={{ padding: 16, borderRadius: 12 }}>
            <div style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 14, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 12 }}>CLIENTE Y PERÍODO</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <select value={form.clienteId} onChange={(e) => setForm({...form, clienteId: e.target.value})}>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <select value={form.mes} onChange={(e) => setForm({...form, mes: e.target.value})}>
                  {MESES.map((m) => <option key={m}>{m}</option>)}
                </select>
                <input value={form.año} onChange={(e) => setForm({...form, año: e.target.value})} placeholder="Año" />
              </div>
            </div>
          </div>

          {/* Productos */}
          <Section title="📦 PRODUCTOS A DESTACAR" color="var(--accent)">
            {form.productos.map((p, i) => (
              <ListItem key={i} value={p} onChange={(v) => updateItem('productos', i, v)} onRemove={() => removeItem('productos', i)} />
            ))}
            {form.productos.length < 5 && (
              <button onClick={() => addItem('productos')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px dashed var(--border)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
                <Plus size={13} /> Agregar producto
              </button>
            )}
          </Section>

          {/* Promociones */}
          <Section title="🎯 PROMOCIONES ACTIVAS" color="#E85D1A">
            {form.promociones.map((p, i) => (
              <ListItem key={i} value={p} onChange={(v) => updateItem('promociones', i, v)} onRemove={() => removeItem('promociones', i)} />
            ))}
            <button onClick={() => addItem('promociones')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px dashed var(--border)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
              <Plus size={13} /> Agregar promoción
            </button>
          </Section>

          {/* Texto libre */}
          {[
            { label: '✨ NOVEDADES DEL MES', field: 'novedades', color: '#22C55E' },
            { label: '📱 TENDENCIAS IDENTIFICADAS', field: 'tendencias', color: '#A78BFA' },
            { label: '🎬 TOMAS ESPECIALES', field: 'tomasEspeciales', color: '#F5C518' },
            { label: '💬 NOTAS DEL CLIENTE', field: 'notasCliente', color: '#34D399' },
          ].map(({ label, field, color }) => (
            <Section key={field} title={label} color={color}>
              <textarea
                value={form[field]}
                onChange={(e) => setForm({...form, [field]: e.target.value})}
                rows={3}
                style={{ resize: 'vertical', fontSize: 14 }}
                placeholder="Escribir aquí..."
              />
            </Section>
          ))}

          {/* Grabaciones */}
          <Section title="📅 GRABACIONES CONFIRMADAS" color="#3B9EFF">
            {form.grabaciones.map((g, i) => (
              <ListItem key={i} value={g} onChange={(v) => updateItem('grabaciones', i, v)} onRemove={() => removeItem('grabaciones', i)} />
            ))}
            <button onClick={() => addItem('grabaciones')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px dashed var(--border)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
              <Plus size={13} /> Agregar grabación
            </button>
          </Section>
        </div>
      ) : (
        <div>
          {/* Export buttons */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <button onClick={exportPNG} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              <Download size={16} /> Exportar PNG
            </button>
            <button onClick={copyAsText} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-hover)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 14 }}>
              <Copy size={16} /> Copiar texto
            </button>
          </div>

          {/* Brief visual preview */}
          <div ref={previewRef} style={{ background: '#111118', border: '1px solid #1E1E2E', borderRadius: 16, padding: 28, fontFamily: 'DM Sans, sans-serif' }}>
            {/* Header */}
            <div style={{ borderBottom: '2px solid #3B9EFF', paddingBottom: 16, marginBottom: 20 }}>
              <div style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 13, color: '#3B9EFF', letterSpacing: 3, marginBottom: 6 }}>BRIEF DE CONTENIDO</div>
              <div style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 36, color: 'white', lineHeight: 1 }}>PixelNova × {cliente?.nombre || 'Cliente'}</div>
              <div style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 22, color: '#6B6B7A', marginTop: 4 }}>{form.mes} {form.año}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <BriefSection title="📦 Productos" color="#3B9EFF" items={form.productos} />
              <BriefSection title="🎯 Promociones" color="#E85D1A" items={form.promociones} />
            </div>

            {form.novedades && <BriefTextSection title="✨ Novedades" color="#22C55E" text={form.novedades} />}
            {form.tendencias && <BriefTextSection title="📱 Tendencias" color="#A78BFA" text={form.tendencias} />}
            {form.tomasEspeciales && <BriefTextSection title="🎬 Tomas especiales" color="#F5C518" text={form.tomasEspeciales} />}
            {form.notasCliente && <BriefTextSection title="💬 Notas del cliente" color="#34D399" text={form.notasCliente} />}

            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 11, color: '#3B9EFF', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>📅 Grabaciones</div>
              {form.grabaciones.map((g, i) => (
                <div key={i} style={{ fontSize: 13, color: '#fff', padding: '6px 0', borderBottom: '1px solid #1E1E2E' }}>• {g}</div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #1E1E2E', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Russell Molina · PixelNova</div>
                <div style={{ fontSize: 12, color: '#6B6B7A' }}>+52 983 213 5455 · modopilotoon@gmail.com</div>
              </div>
              <div style={{ fontSize: 11, color: '#6B6B7A' }}>
                {new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, color, children }) {
  return (
    <div className="card" style={{ padding: 16, borderRadius: 12 }}>
      <div style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 14, color, letterSpacing: 1, marginBottom: 12 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  )
}

function ListItem({ value, onChange, onRemove }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input value={value} onChange={(e) => onChange(e.target.value)} style={{ flex: 1, fontSize: 14 }} />
      <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}>
        <X size={14} />
      </button>
    </div>
  )
}

function BriefSection({ title, color, items }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, color, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>{title}</div>
      {items.filter(Boolean).map((item, i) => (
        <div key={i} style={{ fontSize: 14, color: '#fff', padding: '4px 0', borderBottom: '1px solid #1E1E2E' }}>• {item}</div>
      ))}
    </div>
  )
}

function BriefTextSection({ title, color, text }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 11, color, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 14, color: '#D1D1D8', lineHeight: 1.6 }}>{text}</div>
    </div>
  )
}
