import { useEffect, useState } from 'react';
import { Plus, Search, Copy, Pencil, Trash2, Check, Package, RotateCcw } from 'lucide-react';
import { api, statusClass, statusLabel, copyToClipboard } from '../lib/api';
import PlatformSelect from '../components/PlatformSelect';

const EMPTY = { email: '', password: '', platform: '', duration: '', start_date: '', end_date: '', status: 'available', notes: '' };

function isExpired(end_date) {
  if (!end_date) return false;
  return new Date(end_date) < new Date();
}

export default function OwnStock() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [search, setSearch] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [copied, setCopied] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [confirmRelease, setConfirmRelease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [releasing, setReleasing] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    let url = '/own-accounts?';
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (filterPlatform) url += `platform=${encodeURIComponent(filterPlatform)}&`;
    if (filterStatus) url += `status=${encodeURIComponent(filterStatus)}&`;
    const data = await api.get(url).catch(() => []);
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [search, filterPlatform, filterStatus]);

  const handleCopy = (text, key) => {
    copyToClipboard(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const openAdd = () => { setForm(EMPTY); setError(''); setModal('add'); };
  const openEdit = (item) => {
    setForm({ ...item, start_date: item.start_date?.split('T')[0] || '', end_date: item.end_date?.split('T')[0] || '' });
    setError('');
    setModal('edit');
  };

  const save = async () => {
    if (!form.email || !form.password || !form.platform) { setError('Correo, contraseña y plataforma son requeridos'); return; }
    setSaving(true); setError('');
    try {
      if (modal === 'add') await api.post('/own-accounts', form);
      else await api.put(`/own-accounts/${form.id}`, form);
      setModal(null); load();
    } catch (e) { setError(e.message); }
    setSaving(false);
  };

  const del = async (id) => {
    await api.delete(`/own-accounts/${id}`);
    setConfirmDel(null); load();
  };

  const handleRelease = async (id) => {
    setReleasing(id);
    try {
      await api.patch(`/own-accounts/${id}/release`);
      setConfirmRelease(null);
      load();
    } catch (e) { /* silently reload */ load(); }
    setReleasing(null);
  };

  const PLATFORMS_FILTER = ['Netflix','Disney+','HBO Max','Crunchyroll','Prime Video','Spotify','Apple TV+','Paramount+','Star+','DIRECTV GO','YouTube Premium'];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-orbitron text-lg font-bold text-white">Stock Propio</h2>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(226,232,240,0.4)' }}>Cuentas streaming que son tuyas</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Plus size={15} /> Nueva cuenta
        </button>
      </div>

      <div className="card-neon p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(0,212,255,0.5)' }} />
          <input className="input-neon pl-9 text-sm" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-neon text-sm w-40" value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}>
          <option value="">Todas las plataformas</option>
          {PLATFORMS_FILTER.map(p => <option key={p}>{p}</option>)}
        </select>
        <select className="input-neon text-sm w-36" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="available">Disponible</option>
          <option value="sold">Vendida</option>
        </select>
      </div>

      <div className="card-neon overflow-hidden">
        {loading ? (
          <div className="p-12 text-center" style={{ color: 'rgba(226,232,240,0.4)' }}>Cargando...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package size={36} className="mx-auto" style={{ color: 'rgba(0,212,255,0.3)' }} />
            <p style={{ color: 'rgba(226,232,240,0.4)' }}>No hay cuentas registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead><tr>
                <th>Correo</th><th>Contraseña</th><th>Plataforma</th>
                <th>Duración</th><th>Vencimiento</th><th>Estado</th><th>Acciones</th>
              </tr></thead>
              <tbody>
                {items.map(item => {
                  const expired = isExpired(item.end_date);
                  return (
                    <tr key={item.id} style={expired ? { background: 'rgba(239,68,68,0.04)' } : {}}>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">{item.email}</span>
                          <button onClick={() => handleCopy(item.email, `e${item.id}`)} className="btn-secondary p-1">
                            {copied === `e${item.id}` ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">••••••</span>
                          <button onClick={() => handleCopy(item.password, `p${item.id}`)} className="btn-secondary p-1">
                            {copied === `p${item.id}` ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                          </button>
                        </div>
                      </td>
                      <td><span className="platform-badge">{item.platform}</span></td>
                      <td className="text-xs">{item.duration || '-'}</td>
                      <td className="text-xs">
                        {item.end_date ? (
                          <span style={expired ? { color: '#ef4444', fontWeight: 600 } : {}}>
                            {new Date(item.end_date).toLocaleDateString('es')}
                            {expired && ' ⚠ Vencida'}
                          </span>
                        ) : '-'}
                      </td>
                      <td><span className={statusClass(item.status)}>{statusLabel(item.status)}</span></td>
                      <td>
                        <div className="flex gap-1.5 flex-wrap">
                          {expired && (
                            <button
                              onClick={() => setConfirmRelease(item)}
                              title="Liberar cuenta (borrar fechas y volver a disponible)"
                              className="btn-secondary p-1.5 flex items-center gap-1 text-xs"
                              style={{ color: '#f59e0b', borderColor: 'rgba(245,158,11,0.3)' }}
                            >
                              <RotateCcw size={12} /> Liberar
                            </button>
                          )}
                          <button onClick={() => openEdit(item)} className="btn-secondary p-1.5"><Pencil size={13} /></button>
                          <button onClick={() => setConfirmDel(item.id)} className="btn-danger p-1.5"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal-box p-6">
            <h3 className="font-semibold text-white mb-5">{modal === 'add' ? 'Nueva cuenta' : 'Editar cuenta'}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(226,232,240,0.5)' }}>Correo</label>
                <input className="input-neon text-sm" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(226,232,240,0.5)' }}>Contraseña</label>
                <input className="input-neon text-sm" value={form.password || ''} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(226,232,240,0.5)' }}>Duración</label>
                <input className="input-neon text-sm" value={form.duration || ''} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(226,232,240,0.5)' }}>Plataforma</label>
                <PlatformSelect value={form.platform} onChange={val => setForm(f => ({ ...f, platform: val }))} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(226,232,240,0.5)' }}>Estado</label>
                <select className="input-neon text-sm" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="available">Disponible</option>
                  <option value="sold">Vendida</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(226,232,240,0.5)' }}>Fecha inicio</label>
                <input type="date" className="input-neon text-sm" value={form.start_date || ''} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(226,232,240,0.5)' }}>Fecha vencimiento</label>
                <input type="date" className="input-neon text-sm" value={form.end_date || ''} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(226,232,240,0.5)' }}>Notas</label>
                <textarea className="input-neon text-sm" rows={2} value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            {error && <p className="text-xs mt-3 text-center" style={{ color: '#ef4444' }}>{error}</p>}
            <div className="flex gap-3 mt-5">
              <button onClick={save} disabled={saving} className="btn-primary flex-1 py-2.5 text-sm">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => setModal(null)} className="btn-secondary flex-1 py-2.5 text-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm release */}
      {confirmRelease && (
        <div className="modal-overlay">
          <div className="modal-box p-6 max-w-sm text-center">
            <RotateCcw size={32} className="mx-auto mb-3" style={{ color: '#f59e0b' }} />
            <p className="text-white font-medium mb-1">¿Liberar esta cuenta?</p>
            <p className="text-sm mb-1" style={{ color: 'rgba(226,232,240,0.6)' }}>{confirmRelease.email}</p>
            <p className="text-xs mb-5" style={{ color: 'rgba(226,232,240,0.4)' }}>
              Se borrarán las fechas de inicio y vencimiento, y la cuenta quedará disponible para vender de nuevo.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleRelease(confirmRelease.id)}
                disabled={releasing === confirmRelease.id}
                className="btn-primary flex-1 py-2.5 text-sm"
                style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)', color: '#f59e0b' }}
              >
                {releasing === confirmRelease.id ? 'Liberando...' : 'Sí, liberar'}
              </button>
              <button onClick={() => setConfirmRelease(null)} className="btn-secondary flex-1 py-2.5 text-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {confirmDel && (
        <div className="modal-overlay">
          <div className="modal-box p-6 max-w-sm text-center">
            <Trash2 size={32} className="mx-auto mb-3" style={{ color: '#ef4444' }} />
            <p className="text-white font-medium mb-1">¿Eliminar esta cuenta?</p>
            <p className="text-xs mb-5" style={{ color: 'rgba(226,232,240,0.4)' }}>Esta acción no se puede deshacer</p>
            <div className="flex gap-3">
              <button onClick={() => del(confirmDel)} className="btn-danger flex-1 py-2.5 text-sm">Eliminar</button>
              <button onClick={() => setConfirmDel(null)} className="btn-secondary flex-1 py-2.5 text-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
