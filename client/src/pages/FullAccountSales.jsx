import { useEffect, useState } from 'react';
import { Plus, Search, Copy, Pencil, Trash2, Check, Crown } from 'lucide-react';
import { api, statusClass, statusLabel, copyToClipboard, autoStatus } from '../lib/api';
import PlatformSelect from '../components/PlatformSelect';
import AccountSearch from '../components/AccountSearch';

const EMPTY = { email: '', password: '', platform: '', order_number: '', client_name: '', duration: '', purchase_date: '', expiry_date: '', sale_price: '', account_source: 'manual', account_id: null, status: 'active', notes: '' };

export default function FullAccountSales() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [search, setSearch] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [copied, setCopied] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    let url = '/full-account-sales?';
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (filterPlatform) url += `platform=${encodeURIComponent(filterPlatform)}&`;
    if (filterStatus) url += `status=${encodeURIComponent(filterStatus)}&`;
    const data = await api.get(url).catch(() => []);
    setItems((data || []).map(i => ({ ...i, status: autoStatus(i.expiry_date) })));
    setLoading(false);
  };

  useEffect(() => { load(); }, [search, filterPlatform, filterStatus]);

  const handleCopy = (text, key) => { copyToClipboard(text); setCopied(key); setTimeout(() => setCopied(null), 1500); };

  const handleAccountSelect = (account) => {
    setForm(f => ({
      ...f,
      email: account.email,
      password: account.password,
      platform: account.platform,
      duration: account.duration || f.duration,
      account_source: account.source,
      account_id: account.id,
    }));
  };

  const openAdd = () => { setForm(EMPTY); setError(''); setModal('add'); };
  const openEdit = (item) => {
    setForm({ ...item, purchase_date: item.purchase_date?.split('T')[0] || '', expiry_date: item.expiry_date?.split('T')[0] || '' });
    setError('');
    setModal('edit');
  };

  const save = async () => {
    if (!form.email || !form.password || !form.platform) { setError('Correo, contraseña y plataforma son requeridos'); return; }
    setSaving(true); setError('');
    try {
      const payload = { ...form, status: autoStatus(form.expiry_date) };
      if (modal === 'add') await api.post('/full-account-sales', payload);
      else await api.put(`/full-account-sales/${form.id}`, payload);
      setModal(null); load();
    } catch (e) { setError(e.message || 'Error al guardar'); }
    setSaving(false);
  };

  const del = async (id) => { await api.delete(`/full-account-sales/${id}`); setConfirmDel(null); load(); };

  const PLATFORMS_FILTER = ['Netflix','Disney+','HBO Max','Crunchyroll','Prime Video','Spotify','Apple TV+','Paramount+','Star+','DIRECTV GO','YouTube Premium'];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-orbitron text-lg font-bold text-white">Ventas de Cuentas Completas</h2>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(226,232,240,0.4)' }}>Cuentas completas vendidas a un solo cliente</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Plus size={15} /> Nueva venta
        </button>
      </div>

      <div className="card-neon p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(0,212,255,0.5)' }} />
          <input className="input-neon pl-9 text-sm" placeholder="Buscar cliente, correo o pedido..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-neon text-sm w-40" value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}>
          <option value="">Todas</option>
          {PLATFORMS_FILTER.map(p => <option key={p}>{p}</option>)}
        </select>
        <select className="input-neon text-sm w-36" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Todos</option>
          <option value="active">Activa</option>
          <option value="expiring">Por vencer</option>
          <option value="expired">Vencida</option>
        </select>
      </div>

      <div className="card-neon overflow-hidden">
        {loading ? (
          <div className="p-12 text-center" style={{ color: 'rgba(226,232,240,0.4)' }}>Cargando...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Crown size={36} className="mx-auto" style={{ color: 'rgba(236,72,153,0.3)' }} />
            <p style={{ color: 'rgba(226,232,240,0.4)' }}>No hay ventas completas registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead><tr>
                <th>Cliente</th><th>Plataforma</th><th>Correo</th><th>Pass</th>
                <th>Pedido</th><th>Vence</th><th>Precio venta</th><th>Estado</th><th></th>
              </tr></thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td className="font-medium">{item.client_name || '-'}</td>
                    <td><span className="platform-badge">{item.platform}</span></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-xs truncate max-w-28">{item.email}</span>
                        <button onClick={() => handleCopy(item.email, `e${item.id}`)} className="btn-secondary p-1">
                          {copied === `e${item.id}` ? <Check size={11} style={{ color: '#10b981' }} /> : <Copy size={11} />}
                        </button>
                      </div>
                    </td>
                    <td>
                      <button onClick={() => handleCopy(item.password, `p${item.id}`)} className="btn-secondary p-1 flex items-center gap-1 text-xs">
                        {copied === `p${item.id}` ? <Check size={11} style={{ color: '#10b981' }} /> : <Copy size={11} />}
                        Copiar
                      </button>
                    </td>
                    <td className="font-mono text-xs">{item.order_number || '-'}</td>
                    <td className="text-xs">{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('es') : '-'}</td>
                    <td className="text-xs font-semibold" style={{ color: '#10b981' }}>{item.sale_price ? `$${item.sale_price}` : '-'}</td>
                    <td><span className={statusClass(item.status)}>{statusLabel(item.status)}</span></td>
                    <td>
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(item)} className="btn-secondary p-1.5"><Pencil size={13} /></button>
                        <button onClick={() => setConfirmDel(item.id)} className="btn-danger p-1.5"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal-box p-6">
            <h3 className="font-semibold text-white mb-1">{modal === 'add' ? 'Nueva venta completa' : 'Editar venta'}</h3>
            {modal === 'add' && (
              <p className="text-xs mb-4" style={{ color: 'rgba(226,232,240,0.4)' }}>Busca una cuenta existente o ingresa los datos manualmente</p>
            )}

            {modal === 'add' && (
              <div className="mb-4">
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(226,232,240,0.5)' }}>Buscar cuenta existente</label>
                <AccountSearch onSelect={handleAccountSelect} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(226,232,240,0.5)' }}>Nombre del cliente</label>
                <input className="input-neon text-sm" value={form.client_name || ''} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(226,232,240,0.5)' }}>Correo de la cuenta</label>
                <input className="input-neon text-sm" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value, account_source: 'manual', account_id: null }))} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(226,232,240,0.5)' }}>Contraseña</label>
                <input className="input-neon text-sm" value={form.password || ''} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(226,232,240,0.5)' }}>Número de pedido</label>
                <input className="input-neon text-sm" value={form.order_number || ''} onChange={e => setForm(f => ({ ...f, order_number: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(226,232,240,0.5)' }}>Plataforma</label>
                <PlatformSelect value={form.platform} onChange={val => setForm(f => ({ ...f, platform: val }))} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(226,232,240,0.5)' }}>Duración</label>
                <input className="input-neon text-sm" value={form.duration || ''} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(226,232,240,0.5)' }}>Precio de venta</label>
                <input type="number" step="0.01" className="input-neon text-sm" placeholder="$0.00" value={form.sale_price || ''} onChange={e => setForm(f => ({ ...f, sale_price: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(226,232,240,0.5)' }}>Fecha compra</label>
                <input type="date" className="input-neon text-sm" value={form.purchase_date || ''} onChange={e => setForm(f => ({ ...f, purchase_date: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(226,232,240,0.5)' }}>Fecha vencimiento</label>
                <input type="date" className="input-neon text-sm" value={form.expiry_date || ''} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} />
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

      {confirmDel && (
        <div className="modal-overlay">
          <div className="modal-box p-6 max-w-sm text-center">
            <Trash2 size={32} className="mx-auto mb-3" style={{ color: '#ef4444' }} />
            <p className="text-white font-medium mb-1">¿Eliminar esta venta?</p>
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
