const BASE = '/api';

async function req(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error del servidor');
  return data;
}

export const api = {
  get: (path) => req('GET', path),
  post: (path, body) => req('POST', path, body),
  put: (path, body) => req('PUT', path, body),
  delete: (path) => req('DELETE', path),
};

export const PLATFORMS = [
  'Netflix','Disney+','HBO Max','Crunchyroll','Prime Video',
  'Spotify','Apple TV+','Paramount+','Star+','DIRECTV GO','YouTube Premium','Otro'
];

export function statusLabel(status) {
  const map = {
    active: 'Activa', expiring: 'Por vencer', expired: 'Vencida',
    available: 'Disponible', sold: 'Vendida'
  };
  return map[status] || status;
}

export function statusClass(status) {
  const map = {
    active: 'status-active', expiring: 'status-expiring', expired: 'status-expired',
    available: 'status-available', sold: 'status-sold'
  };
  return map[status] || 'status-available';
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000*60*60*24));
}

export function autoStatus(expiryDate) {
  const days = daysUntil(expiryDate);
  if (days === null) return 'active';
  if (days < 0) return 'expired';
  if (days <= 7) return 'expiring';
  return 'active';
}

export function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {
    const el = document.createElement('textarea');
    el.value = text; document.body.appendChild(el);
    el.select(); document.execCommand('copy');
    document.body.removeChild(el);
  });
}
