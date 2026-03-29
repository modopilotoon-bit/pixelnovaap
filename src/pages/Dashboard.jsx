import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { useFinanceStore } from '../store/useFinanceStore'
import ProgressBar from '../components/ProgressBar'
import { TrendingUp, Users, Video, Clock, Zap, ChevronRight } from 'lucide-react'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function formatDate() {
  return new Date().toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }).replace(/^\w/, (c) => c.toUpperCase())
}

function getDaysUntil(dateStr) {
  const target = new Date(dateStr)
  const now = new Date()
  now.setHours(0,0,0,0)
  target.setHours(0,0,0,0)
  return Math.round((target - now) / 86400000)
}

export default function Dashboard() {
  const navigate = useNavigate()
  const clientes = useAppStore((s) => s.clientes)
  const videos = useAppStore((s) => s.videos)
  const grabaciones = useAppStore((s) => s.grabaciones)
  const historias = useAppStore((s) => s.historias)
  const currentUser = useAppStore((s) => s.currentUser)
  const ingresos = useFinanceStore((s) => s.ingresos)
  const userName = currentUser ? currentUser.charAt(0) + currentUser.slice(1).toLowerCase() : ''

  const clientesActivos = clientes.filter((c) => c.estado === 'ACTIVO')
  const mesActual = '2026-04'

  const videosDelMes = videos.filter((v) => v.mes === mesActual && v.clienteId === 'nicos-house')
  const videosPublicados = videosDelMes.filter((v) => v.estado === 'PUBLICADO').length
  const grabacionesDelMes = grabaciones.filter((g) => g.mes === mesActual)
  const grabacionesRealizadas = grabacionesDelMes.filter((g) => g.completada).length
  const historiasDelMes = historias.find((h) => h.mes === mesActual && h.clienteId === 'nicos-house')

  const ingresosAbril = ingresos.filter((i) => i.mes === mesActual)
  const totalIngresos = ingresosAbril.reduce((sum, i) => sum + i.monto, 0)
  const totalCobrado = ingresosAbril.reduce((sum, i) => sum + i.cobrado, 0)
  const pendienteCobrar = totalIngresos - totalCobrado

  const grabacionesPendientes = grabacionesDelMes
    .filter((g) => !g.completada)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
  const proximaGrabacion = grabacionesPendientes[0]
  const diasGrabacion = proximaGrabacion ? getDaysUntil(proximaGrabacion.fecha) : null

  const pagosPendientes = clientes.flatMap((c) =>
    c.pagos.filter((p) => p.estado === 'PENDIENTE').map((p) => ({ ...p, clienteNombre: c.nombre }))
  ).sort((a, b) => new Date(a.fechaEsperada) - new Date(b.fechaEsperada))

  const proximaAcciones = [
    proximaGrabacion && {
      icon: '🎬',
      text: `Grabación ${proximaGrabacion.tipo}`,
      sub: diasGrabacion === 0 ? 'Hoy' : diasGrabacion === 1 ? 'Mañana' : `en ${diasGrabacion} días`,
      color: '#3B9EFF',
      bg: 'rgba(59,158,255,0.08)',
    },
    pagosPendientes[0] && {
      icon: '💰',
      text: `Cobrar $${pagosPendientes[0].monto.toLocaleString()} MXN`,
      sub: `${pagosPendientes[0].clienteNombre} · ${new Date(pagosPendientes[0].fechaEsperada).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}`,
      color: '#F5C518',
      bg: 'rgba(245,197,24,0.08)',
    },
    videosDelMes.filter((v) => v.estado === 'LISTO').length > 0 && {
      icon: '✅',
      text: `${videosDelMes.filter((v) => v.estado === 'LISTO').length} video(s) listos para aprobar`,
      sub: 'Revisar y aprobar',
      color: '#22C55E',
      bg: 'rgba(34,197,94,0.08)',
    },
    videosDelMes.filter((v) => v.estado === 'APROBADO').length > 0 && {
      icon: '📱',
      text: `${videosDelMes.filter((v) => v.estado === 'APROBADO').length} video(s) listos para publicar`,
      sub: 'Publicar en TikTok / Instagram',
      color: '#E85D1A',
      bg: 'rgba(232,93,26,0.08)',
    },
  ].filter(Boolean).slice(0, 4)

  const statCards = [
    { label: 'Ingresos del mes', value: `$${totalIngresos.toLocaleString()}`, icon: TrendingUp, color: '#22C55E', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' },
    { label: 'Por cobrar', value: `$${pendienteCobrar.toLocaleString()}`, icon: Clock, color: '#F5C518', bg: 'rgba(245,197,24,0.1)', border: 'rgba(245,197,24,0.2)' },
    { label: 'Videos publicados', value: `${videosPublicados}/${videosDelMes.length}`, icon: Video, color: '#3B9EFF', bg: 'rgba(59,158,255,0.1)', border: 'rgba(59,158,255,0.2)' },
    { label: 'Clientes activos', value: clientesActivos.length, icon: Users, color: '#A78BFA', bg: 'rgba(107,47,160,0.1)', border: 'rgba(107,47,160,0.2)' },
  ]

  return (
    <div style={{ padding: '24px 16px 16px', maxWidth: 820, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
          {formatDate()}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <h1 style={{
            fontFamily: 'Bebas Neue, cursive',
            fontSize: 38,
            lineHeight: 1,
            background: 'linear-gradient(120deg, #ffffff 40%, #3B9EFF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {getGreeting()}, {userName}
          </h1>
          {diasGrabacion !== null && (
            <div style={{
              padding: '8px 14px',
              background: 'rgba(59,158,255,0.1)',
              border: '1px solid rgba(59,158,255,0.3)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexShrink: 0,
            }}>
              <Zap size={14} color="#3B9EFF" />
              <div>
                <div style={{ fontSize: 10, color: '#3B9EFF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Próxima grab.</div>
                <div style={{ fontSize: 12, color: 'var(--text-main)', fontWeight: 600 }}>
                  {diasGrabacion === 0 ? 'Hoy' : diasGrabacion === 1 ? 'Mañana' : `en ${diasGrabacion} días`}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} style={{
              padding: '18px 16px',
              borderRadius: 14,
              background: card.bg,
              border: `1px solid ${card.border}`,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: -16, right: -16,
                width: 64, height: 64,
                background: `${card.color}18`,
                borderRadius: '50%',
              }} />
              <Icon size={15} color={card.color} style={{ marginBottom: 10 }} />
              <div style={{
                fontFamily: 'Bebas Neue, cursive',
                fontSize: 32,
                color: card.color,
                lineHeight: 1,
                marginBottom: 4,
              }}>
                {card.value}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{card.label}</div>
            </div>
          )
        })}
      </div>

      {/* Tracker del mes */}
      <div style={{
        padding: 20,
        borderRadius: 14,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        marginBottom: 14,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 16, letterSpacing: 1 }}>TRACKER DEL MES</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>Abril 2026 · Nico's House</div>
          </div>
          <button
            onClick={() => navigate('/contenido')}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'rgba(59,158,255,0.1)',
              color: 'var(--accent)',
              border: '1px solid rgba(59,158,255,0.25)',
              borderRadius: 8,
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Ver <ChevronRight size={12} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <ProgressBar value={videosPublicados} max={videosDelMes.length || 1} showLabel label="Videos publicados" />
          <ProgressBar value={grabacionesRealizadas} max={grabacionesDelMes.length || 2} showLabel label="Grabaciones realizadas" color="var(--success)" />
          <ProgressBar value={historiasDelMes?.publicadas || 0} max={20} showLabel label="Historias publicadas" color="#A78BFA" />
        </div>
      </div>

      {/* Próximas acciones */}
      {proximaAcciones.length > 0 && (
        <div style={{
          padding: 20,
          borderRadius: 14,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          marginBottom: 14,
        }}>
          <div style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 16, letterSpacing: 1, marginBottom: 14 }}>
            PRÓXIMAS ACCIONES
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {proximaAcciones.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px',
                background: item.bg,
                borderRadius: 10,
                border: `1px solid ${item.color}30`,
              }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>{item.text}</div>
                  <div style={{ fontSize: 11, color: item.color, marginTop: 2 }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accesos rápidos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {[
          { label: 'Clientes', icon: '👥', path: '/clientes', color: '#A78BFA', bg: 'rgba(107,47,160,0.08)' },
          { label: 'Contenido', icon: '🎬', path: '/contenido', color: '#3B9EFF', bg: 'rgba(59,158,255,0.08)' },
          { label: 'Finanzas', icon: '💰', path: '/finanzas', color: '#22C55E', bg: 'rgba(34,197,94,0.08)' },
          { label: 'Brief', icon: '✏️', path: '/brief', color: '#E85D1A', bg: 'rgba(232,93,26,0.08)' },
        ].map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              background: item.bg,
              border: `1px solid ${item.color}30`,
              borderRadius: 12,
              padding: '16px 14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              transition: 'all 0.15s',
              textAlign: 'left',
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.background = item.bg.replace('0.08', '0.15') }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = `${item.color}30`; e.currentTarget.style.background = item.bg }}
          >
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{item.label}</span>
            <ChevronRight size={13} color={item.color} style={{ marginLeft: 'auto' }} />
          </button>
        ))}
      </div>
    </div>
  )
}
