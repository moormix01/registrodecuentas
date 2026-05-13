export default function StatCard({ label, value, icon: Icon, color = 'cyan', sub }) {
  const colors = {
    cyan: { text: '#00d4ff', bg: 'rgba(0,212,255,0.08)', border: 'rgba(0,212,255,0.2)' },
    purple: { text: '#a855f7', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.2)' },
    green: { text: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
    yellow: { text: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
    red: { text: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
    pink: { text: '#ec4899', bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.2)' },
  };
  const c = colors[color] || colors.cyan;

  return (
    <div className="card-neon p-5 animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(226,232,240,0.5)' }}>{label}</p>
        {Icon && (
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: c.bg, border: `1px solid ${c.border}` }}>
            <Icon size={17} style={{ color: c.text }} />
          </div>
        )}
      </div>
      <p className="text-3xl font-bold mb-1" style={{ color: c.text }}>{value}</p>
      {sub && <p className="text-xs" style={{ color: 'rgba(226,232,240,0.4)' }}>{sub}</p>}
    </div>
  );
}
