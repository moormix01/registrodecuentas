import { useState } from 'react';
import { Eye, EyeOff, Zap, Lock, User } from 'lucide-react';
import StreamingBackground from '../components/StreamingBackground';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    if (!onLogin(form.username, form.password)) {
      setError('Usuario o contraseña incorrectos');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ background: '#05050a' }}>
      <StreamingBackground />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 1 }}>
        <div className="w-96 h-96 rounded-full" style={{
          background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }} />
      </div>

      <div className="relative w-full max-w-md px-6 animate-fade-in" style={{ zIndex: 2 }}>
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(0,212,255,0.2))', border: '1px solid rgba(0,212,255,0.3)' }}>
              <Zap size={24} style={{ color: '#00d4ff' }} />
            </div>
          </div>
          <h1 className="font-orbitron text-2xl font-black mb-1" style={{
            background: 'linear-gradient(135deg, #00d4ff, #a855f7)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            JACK STREAMING
          </h1>
          <p className="text-xs mt-2" style={{ color: 'rgba(226,232,240,0.35)' }}>
            Sistema de Registro de Ventas
          </p>
        </div>

        <div className="p-8" style={{
          background: 'rgba(12,12,28,0.72)',
          border: '1px solid rgba(0,212,255,0.18)',
          borderRadius: 16,
          backdropFilter: 'blur(16px)',
          boxShadow: '0 0 40px rgba(168,85,247,0.1)'
        }}>
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(226,232,240,0.6)' }}>
                USUARIO
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(0,212,255,0.5)' }} />
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  className="input-neon pl-10"
                  placeholder="Ingresa tu usuario"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(226,232,240,0.6)' }}>
                CONTRASEÑA
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(0,212,255,0.5)' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input-neon pl-10 pr-10"
                  placeholder="Ingresa tu contraseña"
                  required
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgba(0,212,255,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg p-3 text-sm text-center"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-sm font-semibold"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
