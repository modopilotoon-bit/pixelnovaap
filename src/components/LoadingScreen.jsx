export default function LoadingScreen() {
  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center gap-6"
      style={{ background: '#0D0608' }}
    >
      <div
        className="text-5xl"
        style={{ filter: 'drop-shadow(0 0 20px rgba(201,168,76,0.6))' }}
      >
        ✨
      </div>
      <div className="gold-pulse">
        <span /><span /><span />
      </div>
      <p
        className="text-sm"
        style={{
          color: '#B89FA8',
          fontStyle: 'italic',
          fontFamily: 'Playfair Display, serif',
        }}
      >
        Encendiendo la chispa...
      </p>
    </div>
  )
}
