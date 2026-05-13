import { useEffect, useState } from 'react';
import { Plus, Search, Copy, Pencil, Trash2, Check, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { api, statusClass, statusLabel, copyToClipboard, autoStatus } from '../lib/api';
import PlatformSelect from '../components/PlatformSelect';
import AccountSearch from '../components/AccountSearch';

const EMPTY_GROUP = { email: '', password: '', platform: '', duration: '', profiles_count: 1, sale_price: '', account_source: 'manual', account_id: null, notes: '' };
const EMPTY_SALE = { order_number: '', client_name: '', purchase_date: '', expiry_date: '', status: 'active', notes: '' };

export default function ProfileSales() {
  const [groups, setGroups] = useState([]);
  const [sales, setSales] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [modal, setModal] = useState(null);
  const [editSale, setEditSale] = useState(null);
  const [form, setForm] = useState(EMPTY_GROUP);
  const [saleForm, setSaleForm] = useState(EMPTY_SALE);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    const [g, s] = await Promise.all([
      api.get('/profile-groups').catch(() => []),
      api.get('/profile-sales').catch(() => [])
    ]);
    setGroups(g || []);
    setSales((s || []).map(x => ({ ...x, status: autoStatus(x.expiry_date) })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCopy = (text, key) => { copyToClipboard(text); setCopied(key); setTimeout(() => setCopied(null), 1500); };
  const salesForGroup = (gid) => sales.filter(s => s.group_id === gid);
  const filteredGroups = groups.filter(g =>
    !search || g.platform.toLowerCase().includes(search.toLowerCase()) || g.email.toLowerCase().includes(search.toLowerCase())
  );

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

  const saveGroup = async () => {
    if (!form.email || !form.password || !form.platform) { setError('Correo, contraseña y plataforma son requeridos'); return; }
    setSaving(true); setError('');
    try {
      await api.post('/profile-groups', form);
      setModal(null); load();
    } catch (e) { setError(e.message || 'Error al guardar'); }
    setSaving(false);
  };

  const saveSale = async () => {
    setSaving(true); setError('');
    try {
      const payload = {
        order_number: saleForm.order_number || null,
        client_name: saleForm.client_name || null,
        purchase_date: saleForm.purchase_date || null,
        expiry_date: saleForm.expiry_date || null,
        status: autoStatus(saleForm.expiry_date) || 'active',
        notes: saleForm.notes || null,
      };
      const res = await api.put(`/profile-sales/${editSale.id}`, payload);
      if (res) { setEditSale(null); load(); }
    } catch (e) { setError(e.message || 'Error al guardar'); }
    setSaving(false);
  };

  const delGroup = async (id) => { await api.delete(`/profile-groups/${id}`); setConfirmDel(null); load(); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-orbitron text-lg font-bold text-white">Ventas de Perfiles</h2>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(226,232,240,0.4)' }}>Cuentas compartidas por perfil</p>
        </div>
        <button onClick={() => { setForm(EMPTY_GROUP); setError(''); setModal('add'); }} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Plus size={15} /> Nueva cuenta grupal
        </button>
      </div>

      <div className="card-neon p-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(0,212,255,0.5)' }} />
          <input className="input-neon pl-9 text-sm" placeholder="Buscar por plataforma o correo..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center" style={{ color: 'rgba(226,232,240,0.4)' }}>Cargando...</div>
      ) : filteredGroups.length === 0 ? (
        <div className="card-neon p-12 text-center space-y-3">
          <Users size={36} className="mx-auto" style={{ color: 'rgba(0,212,255,0.3)' }} />
          <p style={{ color: 'rgba(226,232,240,0.4)' }}>No hay grupos de perfiles registrados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGroups.map(group => {
            const groupSales = salesForGroup(group.id);
            const isOpen = expanded[group.id];
            return (
              <div key={group.id} className="card-neon overflow-hidden">
                <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]"
                  onClick={() => setExpanded(e => ({ ...e, [group.id]: !e[group.id] }))}>
                  <div className="flex items-center gap-3 min-w-0">
                    {isOpen ? <ChevronDown size={16} style={{ color: '#00d4ff' }} /> : <ChevronRight size={16} style={{ color: 'rgba(226,232,240,0.3)' }} />}
                    <span className="platform-badge">{group.platform}</span>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-xs text-white truncate">{group.email}</span>
                      <button onClick={e => { e.stopPropagation(); handleCopy(group.email, `ge${group.id}`); }} className="btn-secondary p-1">
                        {copied === `ge${group.id}` ? <Check size={11} style={{ color: '#10b981' }} /> : <Copy size={11} />}
                      </button>
                      <button onClick={e => { e.stopPropagation(); handleCopy(group.password, `gp${group.id}`); }} className="btn-secondary p-1 text-xs flex items-center gap-1">
                        {copied === `gp${group.id}` ? <Check size={11} style={{ color: '#10b981' }} /> : <Copy size={11} />}
                        Pass
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {group.sale_price && (
                      <span className="text-xs font-bold" style={{ color: '#10b981' }}>${group.sale_price}</span>
                    )}
                    <span className="text-xs font-medium" style={{ color: 'rgba(226,232,240,0.5)' }}>
                      {groupSales.filter(s => s.client_name).length}/{group.profiles_count} perfiles
                    </span>
                    <button onClick={e => { e.stopPropagation(); setConfirmDel({ type: 'group', id: group.id }); }} className="btn-danger p-1.5">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t" style={{ borderColor: 'rgba(0,212,255,0.08)' }}>
                    <table>
                      <thead><tr>
                        <th>#</th><th>Pedido</th><th>Cliente</th><th>Compra</th><th>Vence</th><th>Estado</th><th></th>
                      </tr></thead>
                      <tbody>
                        {groupSales.map((sale, idx) => (
                          <tr key={sale.id}>
                            <td className="text-xs font-medium" style={{ color: 'rgba(0,212,255,0.7)' }}>{idx + 1}</td>
                            <td className="font-mono text-xs">{sale.order_number || '-'}</td>
                            <td className="font-medium text-sm">{sale.client_name || <span style={{ color: 'rgba(226,232,240,0.3)' }}>Sin asignar</span>}</td>
                            <td className="text-xs">{sale.purchase_date ? new Date(sale.purchase_date).toLocaleDateString('es') : '-'}</td>
                            <td className="text-xs">{sale.expiry_date ? new Date(sale.expiry_date).toLocaleDateString('es') : '-'}</td>
                            <td><span className={statusClass(sale.status)}>{statusLabel(sale.status)}</span></td>
                            <td>
                              <button onClick={() => {
                                setSaleForm({
                                  order_number: sale.order_number || '',
                                  client_name: sale.client_name || '',
                                  purchase_date: sale.purchase_date?.split('T')[0] || '',
                                  expiry_date: sale.expiry_date?.split('T')[0] || '',
                                  status: sale.status || 'active',
                                  notes: sale.notes || '',
                                });
                                setEditSale(sale);
                                setError('');
                              }} className="btn-secondary p-1.5">
                                <Pencil size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modal === 'add' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal-box p-6">
            <h3 className="font-semibold text-white mb-1">Nueva cuenta grupal</h3>
            <p className="text-xs mb-4" style={{ color: 'rgba(226,232,240,0.4)' }}>Busca una cuenta existente o ingresa los datos manualmente</p>

            <div className="mb-4">
              <label className="block text-xs mb-1.5" style={{ color: 'rgba(226,232,240,0.5)' }}>Buscar cuenta existente</label>
              <AccountSearch onSelect={handleAccountSelect} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(226,232,240,0.5)' }}>Correo</label>
                <input className="input-neon text-sm" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value, account_source: 'manual', account_id: null }))} />
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
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(226,232,240,0.5)' }}>Cantidad de perfiles</label>
                <input type="number" min="1" max="20" className="input-neon text-sm" value={form.profiles_count} onChange={e => setForm(f => ({ ...f, profiles_count: parseInt(e.target.value) || 1 }))} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(226,232,240,0.5)' }}>Precio de venta (total)</label>
                <input type="number" step="0.01" className="input-neon text-sm" placeholder="$0.00" value={form.sale_price || ''} onChange={e => setForm(f => ({ ...f, sale_price: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(226,232,240,0.5)' }}>Notas</label>
                <textarea className="input-neon text-sm" rows={2} value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>

            {error && <p className="text-xs mt-3 text-center" style={{ color: '#ef4444' }}>{error}</p>}
            <div className="flex gap-3 mt-5">
              <button onClick={saveGroup} disabled={saving} className="btn-primary flex-1 py-2.5 text-sm">
                {saving ? 'Creando...' : 'Crear grupo'}
              </button>
              <button onClick={() => setModal(null)} className="btn-secondary flex-1 py-2.5 text-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {editSale && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditSale(null)}>
          <div className="modal-box p-6">
            <h3 className="font-semibold text-white mb-5">Editar perfil #{editSale.id}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(226,232,240,0.5)' }}>Número de pedido</label>
                <input className="input-neon text-sm" value={saleForm.order_number} onChange={e => setSaleForm(f => ({ ...f, order_number: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(226,232,240,0.5)' }}>Nombre del cliente</label>
                <input className="input-neon text-sm" value={saleForm.client_name} onChange={e => setSaleForm(f => ({ ...f, client_name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(226,232,240,0.5)' }}>Fecha de compra</label>
                <input type="date" className="input-neon text-sm" value={saleForm.purchase_date} onChange={e => setSaleForm(f => ({ ...f, purchase_date: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(226,232,240,0.5)' }}>Fecha de vencimiento</label>
                <input type="date" className="input-neon text-sm" value={saleForm.expiry_date} onChange={e => setSaleForm(f => ({ ...f, expiry_date: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(226,232,240,0.5)' }}>Notas</label>
                <textarea className="input-neon text-sm" rows={2} value={saleForm.notes} onChange={e => setSaleForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            {error && <p className="text-xs mt-3 text-center" style={{ color: '#ef4444' }}>{error}</p>}
            <div className="flex gap-3 mt-5">
              <button onClick={saveSale} disabled={saving} className="btn-primary flex-1 py-2.5 text-sm">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => setEditSale(null)} className="btn-secondary flex-1 py-2.5 text-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {confirmDel && (
        <div className="modal-overlay">
          <div className="modal-box p-6 max-w-sm text-center">
            <Trash2 size={32} className="mx-auto mb-3" style={{ color: '#ef4444' }} />
            <p className="text-white font-medium mb-1">¿Eliminar este grupo?</p>
            <p className="text-xs mb-5" style={{ color: 'rgba(226,232,240,0.4)' }}>Se eliminarán todos los perfiles asociados</p>
            <div className="flex gap-3">
              <button onClick={() => delGroup(confirmDel.id)} className="btn-danger flex-1 py-2.5 text-sm">Eliminar</button>
              <button onClick={() => setConfirmDel(null)} className="btn-secondary flex-1 py-2.5 text-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
