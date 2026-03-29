export default function ProgressBar({ value, max, color, height = 6, showLabel = false, label = '' }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const resolvedPct = Math.round(pct)
  const barColor = color || (resolvedPct >= 80 ? '#22C55E' : resolvedPct >= 40 ? '#3B9EFF' : '#F5C518')

  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
          <span style={{ fontSize: 12, color: barColor, fontWeight: 700 }}>{value}/{max}</span>
        </div>
      )}
      <div style={{
        width: '100%',
        height,
        background: 'rgba(255,255,255,0.06)',
        borderRadius: height,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${barColor}88, ${barColor})`,
          borderRadius: height,
          transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: pct > 0 ? `0 0 8px ${barColor}55` : 'none',
        }} />
      </div>
    </div>
  )
}
