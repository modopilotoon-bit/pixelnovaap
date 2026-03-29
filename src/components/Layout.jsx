import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--bg-base)' }}>
      {/* Sidebar — visible only on desktop via CSS */}
      <Sidebar />

      {/* Main content */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        paddingBottom: '80px',
        minHeight: '100%',
      }}
        className="main-content"
      >
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />

      <style>{`
        @media (min-width: 768px) {
          .main-content {
            padding-bottom: 0 !important;
            margin-left: 240px;
          }
          .mobile-bottom-nav {
            display: none !important;
          }
          .desktop-sidebar-wrapper {
            display: block !important;
          }
        }
        @media (max-width: 767px) {
          .desktop-sidebar-wrapper {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
