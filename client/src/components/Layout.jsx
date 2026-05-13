import { useState } from 'react';
import Sidebar from './Sidebar';
import StreamingBackground from './StreamingBackground';
import { Menu } from 'lucide-react';

export default function Layout({ page, setPage, onLogout, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ background: '#05050a' }}>
      <StreamingBackground />

      <Sidebar
        page={page}
        setPage={setPage}
        onLogout={onLogout}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="flex-1 md:ml-64 relative z-10 min-h-screen flex flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4"
          style={{ background: 'rgba(5,5,10,0.75)', borderBottom: '1px solid rgba(0,212,255,0.08)', backdropFilter: 'blur(10px)' }}>
          <button
            className="md:hidden btn-secondary p-2"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={18} />
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs" style={{ color: 'rgba(226,232,240,0.5)' }}>Sistema activo</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
