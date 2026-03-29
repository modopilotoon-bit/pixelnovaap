const STATUS_CONFIG = {
  'PENDIENTE':  { color: '#8B8B9B', bg: 'rgba(139,139,155,0.1)',  dot: '#6B6B7A' },
  'GRABADO':    { color: '#3B9EFF', bg: 'rgba(59,158,255,0.12)',  dot: '#3B9EFF' },
  'EN EDICIÓN': { color: '#F97316', bg: 'rgba(249,115,22,0.12)',  dot: '#F97316' },
  'LISTO':      { color: '#F5C518', bg: 'rgba(245,197,24,0.12)',  dot: '#F5C518' },
  'APROBADO':   { color: '#4ADE80', bg: 'rgba(74,222,128,0.12)', dot: '#4ADE80' },
  'PUBLICADO':  { color: '#22C55E', bg: 'rgba(34,197,94,0.14)',  dot: '#22C55E' },
  'PAGADO':     { color: '#22C55E', bg: 'rgba(34,197,94,0.14)',  dot: '#22C55E' },
  'VENCIDO':    { color: '#EF4444', bg: 'rgba(239,68,68,0.14)',  dot: '#EF4444' },
}

export default function StatusBadge({ status, size = 'sm' }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['PENDIENTE']
  const padding = size === 'sm' ? '3px 9px' : '5px 13px'
  const fontSize = size === 'sm' ? 11 : 13

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      background: cfg.bg,
      color: cfg.color,
      borderRadius: 99,
      padding,
      fontSize,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.4px',
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: size === 'sm' ? 5 : 7,
        height: size === 'sm' ? 5 : 7,
        borderRadius: '50%',
        background: cfg.dot,
        flexShrink: 0,
        boxShadow: `0 0 4px ${cfg.dot}`,
      }} />
      {status}
    </span>
  )
}
