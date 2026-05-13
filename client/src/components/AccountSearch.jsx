import { useState, useEffect, useRef } from 'react';
import { Search, Package, ShoppingBag } from 'lucide-react';
import { api } from '../lib/api';

export default function AccountSearch({ onSelect, placeholder = 'Buscar cuenta por correo o plataforma...' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!query || query.length < 1) { setResults([]); setOpen(false); return; }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await api.get(`/accounts/search?q=${encodeURIComponent(query)}`);
        setResults(data || []);
        setOpen(true);
      } catch { setResults([]); }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const select = (account) => {
    onSelect(account);
    setQuery(account.email);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(0,212,255,0.5)' }} />
        <input
          className="input-neon pl-9 text-sm"
          placeholder={placeholder}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-t-transparent animate-spin"
            style={{ borderColor: '#00d4ff', borderTopColor: 'transparent' }} />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 rounded-lg overflow-hidden shadow-xl"
          style={{ background: '#0f0f1a', border: '1px solid rgba(0,212,255,0.2)' }}>
          {results.map((acc, i) => (
            <button
              key={i}
              type="button"
              onClick={() => select(acc)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors border-b"
              style={{ borderColor: 'rgba(255,255,255,0.04)' }}
            >
              <div className="flex-shrink-0">
                {acc.source === 'own'
                  ? <Package size={14} style={{ color: '#00d4ff' }} />
                  : <ShoppingBag size={14} style={{ color: '#a855f7' }} />
                }
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{acc.email}</p>
                <p className="text-xs" style={{ color: 'rgba(226,232,240,0.4)' }}>
                  {acc.platform} · {acc.source === 'own' ? 'Stock propio' : 'Proveedor'} · {acc.duration || 'Sin duración'}
                </p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{
                background: acc.source === 'own' ? 'rgba(0,212,255,0.1)' : 'rgba(168,85,247,0.1)',
                color: acc.source === 'own' ? '#00d4ff' : '#a855f7',
                border: `1px solid ${acc.source === 'own' ? 'rgba(0,212,255,0.2)' : 'rgba(168,85,247,0.2)'}`
              }}>
                {acc.source === 'own' ? 'Propio' : 'Proveedor'}
              </span>
            </button>
          ))}
        </div>
      )}

      {open && results.length === 0 && query.length > 0 && !loading && (
        <div className="absolute z-50 w-full mt-1 rounded-lg px-4 py-3 text-sm"
          style={{ background: '#0f0f1a', border: '1px solid rgba(0,212,255,0.2)', color: 'rgba(226,232,240,0.4)' }}>
          No se encontraron cuentas. Puedes ingresar los datos manualmente.
        </div>
      )}
    </div>
  );
}
