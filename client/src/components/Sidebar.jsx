import { LayoutDashboard, Package, ShoppingBag, Users, Crown, LogOut, X, Wifi } from 'lucide-react';

const LINKS = [
  { key: 'dashboard',           label: 'Dashboard',           icon: LayoutDashboard },
  { key: 'own-stock',           label: 'Stock Propio',        icon: Package },
  { key: 'provider-accounts',   label: 'Cuentas Proveedores', icon: ShoppingBag },
  { key: 'profile-sales',       label: 'Ventas de Perfiles',  icon: Users },
  { key: 'full-account-sales',  label: 'Ventas Completas',    icon: Crown },
];

export default function Sidebar({ page, setPage, onLogout, mobileOpen, setMobileOpen }) {
  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <aside className={`
        fixed top-0 left-0 h-full w-64 z-40 flex flex-col
        transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `} style={{ background: 'linear-gradient(180deg, #0a0a14 0%, #0d0d1f 100%)', borderRight: '1px solid rgba(0,212,255,0.1)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'rgba(0,212,255,0.1)' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Wifi size={18} className="neon-text-cyan" />
                <span className="font-orbitron text-xs font-bold neon-text-cyan tracking-widest">JACK</span>
              </div>
              <h1 className="font-orbitron text-sm font-bold text-white leading-tight">STREAMING</h1>
              <p className="font-orbitron text-xs" style={{ color: 'rgba(168,85,247,0.8)' }}>REGISTRO</p>
            </div>
            <button className="md:hidden btn-danger p-1" onClick={() => setMobileOpen(false)}>
              <X size={16} />
            </button>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {LINKS.map(({ key, label, icon: Icon }) => (
            <button key={key} className={`sidebar-link w-full text-left ${page === key ? 'active' : ''}`}
              onClick={() => { setPage(key); setMobileOpen(false); }}>
              <Icon size={17} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t" style={{ borderColor: 'rgba(0,212,255,0.1)' }}>
          <button onClick={onLogout} className="sidebar-link w-full text-left hover:text-red-400" style={{ color: 'rgba(226,232,240,0.5)' }}>
            <LogOut size={17} /><span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
