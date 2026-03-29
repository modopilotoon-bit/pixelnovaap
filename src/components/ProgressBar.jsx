export default function ProgressBar({ value, max, color = 'var(--accent)', height = 6, showLabel = false, label = '' }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
          <span style={{ fontSize: 12, color: 'var(--text-main)', fontWeight: 600 }}>{value}/{max}</span>
        </div>
      )}
      <div style={{
        width: '100%',
        height,
        background: 'var(--border)',
        borderRadius: height,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: color,
          borderRadius: height,
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  )
}
