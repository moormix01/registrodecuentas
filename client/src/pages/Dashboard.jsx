import { useEffect, useState } from 'react';
import { Package, ShoppingBag, Users, Crown, DollarSign, AlertTriangle, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import StatCard from '../components/StatCard';
import { api, statusClass, statusLabel } from '../lib/api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/summary')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 rounded-full border-2 mx-auto animate-spin"
          style={{ borderColor: 'rgba(0,212,255,0.3)', borderTopColor: '#00d4ff' }} />
        <p className="text-sm" style={{ color: 'rgba(226,232,240,0.4)' }}>Cargando dashboard...</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="card-neon p-8 text-center">
      <p style={{ color: 'rgba(226,232,240,0.5)' }}>No se pudo cargar la información. Verifica la conexión con la base de datos.</p>
    </div>
  );

  const { ownAccounts, providerAccounts, sales, byPlatform, recentSales, expiringSoon } = data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-orbitron text-lg font-bold text-white mb-1">Dashboard</h2>
        <p className="text-sm" style={{ color: 'rgba(226,232,240,0.4)' }}>Resumen general del sistema</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Stock Propio" value={ownAccounts.total} icon={Package} color="cyan" sub={`${ownAccounts.available} disponibles`} />
        <StatCard label="Cuentas Proveedores" value={providerAccounts.total} icon={ShoppingBag} color="purple" sub={`${providerAccounts.active} activas`} />
        <StatCard label="Ventas Perfiles" value={sales.profileSales} icon={Users} color="green" sub={`${sales.profileActive} activas`} />
        <StatCard label="Ventas Completas" value={sales.fullSales} icon={Crown} color="pink" sub={`${sales.fullActive} activas`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Ingresos Totales"
          value={`$${(sales.totalRevenue || 0).toFixed(2)}`}
          icon={DollarSign}
          color="green"
          sub="Suma de todas las ventas"
        />
        <StatCard
          label="Costos (Proveedores)"
          value={`$${(sales.totalCost || 0).toFixed(2)}`}
          icon={TrendingDown}
          color="red"
          sub="Precio de compra a proveedores"
        />
        <StatCard
          label="Ganancia Neta"
          value={`$${(sales.netProfit || 0).toFixed(2)}`}
          icon={TrendingUp}
          color={sales.netProfit >= 0 ? 'green' : 'red'}
          sub="Ingresos − Costos"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
        <StatCard label="Por Vencer (7d)" value={providerAccounts.expiring} icon={AlertTriangle} color="yellow" sub="Cuentas proveedores" />
        <StatCard label="Vencidas" value={providerAccounts.expired} icon={Activity} color="red" sub="Cuentas proveedores" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {expiringSoon && expiringSoon.length > 0 && (
          <div className="card-neon p-5">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: '#f59e0b' }}>
              <AlertTriangle size={16} />
              Próximas a Vencer (7 días)
            </h3>
            <div className="space-y-2">
              {expiringSoon.map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <div>
                    <p className="text-sm text-white font-medium">{s.client_name || 'Sin nombre'}</p>
                    <p className="text-xs" style={{ color: 'rgba(226,232,240,0.4)' }}>{s.platform} · {s.type}</p>
                  </div>
                  <span className="status-expiring">{s.expiry_date ? new Date(s.expiry_date).toLocaleDateString('es') : '-'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {byPlatform && byPlatform.length > 0 && (
          <div className="card-neon p-5">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2 neon-text-cyan">
              <TrendingUp size={16} />
              Plataformas más vendidas
            </h3>
            <div className="space-y-3">
              {byPlatform.map((p, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">{p.platform}</span>
                    <span className="text-xs font-bold" style={{ color: '#00d4ff' }}>{p.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full"
                      style={{
                        width: `${(p.count / byPlatform[0].count) * 100}%`,
                        background: 'linear-gradient(90deg, #a855f7, #00d4ff)'
                      }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {recentSales && recentSales.length > 0 && (
        <div className="card-neon p-5">
          <h3 className="font-semibold text-sm mb-4 neon-text-cyan">Últimas ventas registradas</h3>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Plataforma</th>
                  <th>Tipo</th>
                  <th>Vence</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((s, i) => (
                  <tr key={i}>
                    <td className="font-medium">{s.client_name || '-'}</td>
                    <td><span className="platform-badge">{s.platform}</span></td>
                    <td className="text-xs capitalize" style={{ color: 'rgba(226,232,240,0.5)' }}>{s.type}</td>
                    <td className="text-xs">{s.expiry_date ? new Date(s.expiry_date).toLocaleDateString('es') : '-'}</td>
                    <td><span className={statusClass(s.status)}>{statusLabel(s.status)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(!recentSales || recentSales.length === 0) && (
        <div className="card-neon p-8 text-center">
          <p style={{ color: 'rgba(226,232,240,0.4)' }}>Aún no hay ventas registradas. Comienza agregando tu primera venta.</p>
        </div>
      )}
    </div>
  );
}
