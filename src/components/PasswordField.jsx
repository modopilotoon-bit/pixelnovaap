import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function PasswordField({ value, onChange, placeholder = 'Contraseña', style = {}, readOnly = false }) {
  const [show, setShow] = useState(false)

  const decoded = (() => {
    try { return value ? atob(value) : '' } catch { return value || '' }
  })()

  return (
    <div style={{ position: 'relative', ...style }}>
      <input
        type={show ? 'text' : 'password'}
        value={decoded}
        onChange={readOnly ? undefined : (e) => onChange(btoa(e.target.value))}
        readOnly={readOnly}
        placeholder={placeholder}
        style={{ paddingRight: 40 }}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        style={{
          position: 'absolute',
          right: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          padding: 4,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}
