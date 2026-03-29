const statusStyles = {
  'PENDIENTE': { bg: '#1A1A24', color: '#6B6B7A', border: '#2A2A3A' },
  'GRABADO': { bg: '#0D2340', color: '#3B9EFF', border: '#1A3A60' },
  'EN EDICIÓN': { bg: '#2A1500', color: '#E85D1A', border: '#3A2000' },
  'LISTO': { bg: '#2A2000', color: '#F5C518', border: '#3A2E00' },
  'APROBADO': { bg: '#0D2A1A', color: '#4ADE80', border: '#1A3A28' },
  'PUBLICADO': { bg: '#0A2010', color: '#22C55E', border: '#1A3A20' },
  'PAGADO': { bg: '#0A2010', color: '#22C55E', border: '#1A3A20' },
  'VENCIDO': { bg: '#2A0A0A', color: '#EF4444', border: '#3A1010' },
}

export default function StatusBadge({ status, size = 'sm' }) {
  const style = statusStyles[status] || statusStyles['PENDIENTE']
  const padding = size === 'sm' ? '3px 8px' : '5px 12px'
  const fontSize = size === 'sm' ? 11 : 13

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      background: style.bg,
      color: style.color,
      border: `1px solid ${style.border}`,
      borderRadius: 6,
      padding,
      fontSize,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      whiteSpace: 'nowrap',
    }}>
      {status === 'PUBLICADO' && '✓ '}
      {status}
    </span>
  )
}
