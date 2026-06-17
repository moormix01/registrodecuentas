import { useState, useRef, useEffect } from 'react';
import { Send, Star, Trash2 } from 'lucide-react';

const STAR_OPTIONS = [
  { ico: '📅', label: 'Vencimientos\nesta semana',  cmd: 'qué vence esta semana' },
  { ico: '📆', label: 'Vencimientos\neste mes',     cmd: 'qué vence este mes' },
  { ico: '📦', label: 'Ver Stock\nDisponible',      cmd: 'cuánto stock hay disponible' },
  { ico: '🔍', label: 'Buscar\nPedidos',            cmd: 'buscar pedidos' },
  { ico: '✏️', label: 'Actualizar\nCorreo',         cmd: 'actualizar correo' },
  { ico: '🗑️', label: 'Eliminar\nVencidos',         action: 'cleanup' },
  { ico: '📊', label: 'Resumen\nGeneral',           cmd: 'cuánto stock hay y qué vence esta semana' },
  { ico: '❓', label: 'Ayuda y\nComandos',          cmd: 'ayuda' },
];

function renderMd(text) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background:rgba(0,212,255,0.1);padding:1px 5px;border-radius:3px">$1</code>')
    .replace(/\n/g, '<br/>');
}

function Bubble({ msg }) {
  const isUser = msg.who === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} mb-4`}>
      <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-bold"
        style={isUser
          ? { background: 'linear-gradient(135deg,#7c3aed,#3b82f6)' }
          : { background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
        {isUser ? '👤' : '🤖'}
      </div>
      <div style={{ maxWidth: '80%' }}>
        <div className="text-sm leading-relaxed px-4 py-3 rounded-2xl"
          style={isUser
            ? { background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', color: '#fff', borderTopRightRadius: 4 }
            : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#e2e8f0', borderTopLeftRadius: 4 }}>
          <span dangerouslySetInnerHTML={{ __html: renderMd(msg.text) }} />
        </div>
      </div>
    </div>
  );
}

function StarMenu({ onSelect }) {
  return (
    <div className="mb-4">
      <p className="text-xs mb-3 font-medium" style={{ color: 'rgba(0,212,255,0.7)' }}>⭐ ¿Qué deseas hacer?</p>
      <div className="grid grid-cols-4 gap-2">
        {STAR_OPTIONS.map((opt, i) => (
          <button key={i} onClick={() => onSelect(opt)}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all hover:scale-105 active:scale-95"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,212,255,0.15)', color: '#e2e8f0' }}>
            <span style={{ fontSize: 22 }}>{opt.ico}</span>
            <span className="text-xs leading-tight" style={{ color: 'rgba(226,232,240,0.75)', whiteSpace:'pre-line' }}>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ConfirmCard({ msg, onConfirm, onCancel }) {
  return (
    <div className="mb-4 flex flex-col gap-3">
      <Bubble msg={msg} />
      <div className="flex gap-2 ml-11">
        <button onClick={onConfirm}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105 active:scale-95"
          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }}>
          ✓ Confirmar
        </button>
        <button onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105 active:scale-95"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(226,232,240,0.6)' }}>
          ✕ Cancelar
        </button>
      </div>
    </div>
  );
}

export default function Asistente() {
  const [messages, setMessages] = useState([
    { id: 0, who: 'bot', text: '¡Hola! 👋 Soy tu asistente de registro.\n\nEscribe **★** o **\\*** para ver las opciones, o dime directamente qué necesitas.' }
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [pendingCleanup, setPendingCleanup] = useState(null);
  const [pendingEmailUpdate, setPendingEmailUpdate] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, showMenu, pendingCleanup]);

  function addMsg(who, text) {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), who, text }]);
  }

  async function sendMessage(text) {
    const t = text.trim();
    if (!t || busy) return;
    setInput('');
    setShowMenu(false);
    setPendingCleanup(null);
    setPendingEmailUpdate(null);
    addMsg('user', t);
    setBusy(true);
    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: t })
      });
      const data = await res.json();
      if (data.action === 'show_menu') {
        addMsg('bot', data.reply);
        setShowMenu(true);
      } else if (data.action === 'confirm_cleanup') {
        setPendingCleanup({ msg: { id: Date.now(), who: 'bot', text: data.reply } });
      } else if (data.action === 'confirm_update_email') {
        setPendingEmailUpdate({ msg: { id: Date.now(), who: 'bot', text: data.reply }, data: data.data });
      } else {
        addMsg('bot', data.reply || 'Sin respuesta.');
      }
    } catch {
      addMsg('bot', '❌ Error de conexión. Intenta de nuevo.');
    } finally { setBusy(false); }
  }

  async function doCleanup() {
    setPendingCleanup(null);
    setBusy(true);
    addMsg('bot', '🔄 Limpiando registros vencidos...');
    try {
      const res = await fetch('/api/chat/cleanup-expired', { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        const t = data.total;
        if (t === 0) {
          addMsg('bot', '✅ No había registros vencidos que eliminar.');
        } else {
          addMsg('bot',
            `✅ **Limpieza completada** (${t} registros afectados):\n\n` +
            (data.ownRestored    ? `• Cuentas propias restauradas: **${data.ownRestored}**\n`    : '') +
            (data.providerDeleted? `• Proveedor eliminados: **${data.providerDeleted}**\n`         : '') +
            (data.fullDeleted    ? `• Ventas completas eliminadas: **${data.fullDeleted}**\n`      : '') +
            (data.profilesDeleted? `• Ventas de perfil eliminadas: **${data.profilesDeleted}**\n` : '')
          );
        }
      } else {
        addMsg('bot', '❌ Error al limpiar: ' + (data.error || 'desconocido'));
      }
    } catch {
      addMsg('bot', '❌ Error de conexión durante la limpieza.');
    } finally { setBusy(false); }
  }

  async function doEmailUpdate() {
    if (!pendingEmailUpdate) return;
    const { data } = pendingEmailUpdate;
    setPendingEmailUpdate(null);
    setBusy(true);
    addMsg('bot', `🔄 Actualizando correo **${data.old}** → **${data.nuevo}**...`);
    try {
      const res = await fetch('/api/chat/update-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const d = await res.json();
      if (d.ok) {
        addMsg('bot', d.log.length
          ? `✅ Correo actualizado en:\n${d.log.map(l => `• ${l}`).join('\n')}`
          : '✅ Actualizado (ninguna fila cambió — quizás el correo no existía).');
      } else {
        addMsg('bot', '❌ Error: ' + (d.error || 'desconocido'));
      }
    } catch {
      addMsg('bot', '❌ Error de conexión.');
    } finally { setBusy(false); }
  }

  function handleStarOption(opt) {
    setShowMenu(false);
    if (opt.action === 'cleanup') {
      addMsg('user', 'Eliminar vencidos');
      setPendingCleanup({ msg: { id: Date.now(), who: 'bot', text: '⚠️ Esto eliminará permanentemente todos los registros vencidos de la base de datos. No se puede deshacer. ¿Confirmas?' } });
    } else {
      sendMessage(opt.cmd);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }

  function handleInput(e) {
    const v = e.target.value;
    setInput(v);
    if (v === '*' || v === '★') {
      setInput('');
      setShowMenu(true);
      setPendingCleanup(null);
      setPendingEmailUpdate(null);
      addMsg('user', '★');
      addMsg('bot', '¿Qué deseas hacer?');
    }
  }

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <div className="mb-6">
        <h1 className="font-orbitron text-xl font-bold neon-text-cyan mb-1">Asistente IA</h1>
        <p className="text-sm" style={{ color: 'rgba(226,232,240,0.45)' }}>
          Escribe <strong style={{ color: 'rgba(0,212,255,0.8)' }}>★</strong> o <strong style={{ color: 'rgba(0,212,255,0.8)' }}>*</strong> para el menú de opciones
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 mb-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,212,255,0.2) transparent' }}>
        {messages.map(msg => <Bubble key={msg.id} msg={msg} />)}

        {showMenu && <StarMenu onSelect={handleStarOption} />}

        {pendingCleanup && (
          <ConfirmCard
            msg={pendingCleanup.msg}
            onConfirm={doCleanup}
            onCancel={() => { setPendingCleanup(null); addMsg('bot', 'Cancelado.'); }}
          />
        )}

        {pendingEmailUpdate && (
          <ConfirmCard
            msg={pendingEmailUpdate.msg}
            onConfirm={doEmailUpdate}
            onCancel={() => { setPendingEmailUpdate(null); addMsg('bot', 'Cancelado.'); }}
          />
        )}

        {busy && (
          <div className="flex gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-sm"
              style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>🤖</div>
            <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                  style={{ background: 'rgba(0,212,255,0.6)', animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="flex gap-3 sticky bottom-0 py-3"
        style={{ background: 'rgba(5,5,10,0.85)', backdropFilter: 'blur(8px)' }}>
        <button
          onClick={() => { setShowMenu(v => !v); inputRef.current?.focus(); }}
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
          style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', color: 'rgba(0,212,255,0.8)' }}
          title="Menú de opciones">
          <Star size={16} />
        </button>
        <div className="flex-1 flex gap-2 rounded-xl px-4 py-2 items-center"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <input
            ref={inputRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKey}
            placeholder="Escribe * para el menú o una consulta..."
            disabled={busy}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: '#e2e8f0' }}
          />
        </div>
        <button
          onClick={() => sendMessage(input)}
          disabled={busy || !input.trim()}
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: busy || !input.trim() ? 'rgba(0,212,255,0.05)' : 'linear-gradient(135deg,rgba(0,212,255,0.2),rgba(168,85,247,0.2))', border: '1px solid rgba(0,212,255,0.3)', color: 'rgba(0,212,255,0.9)' }}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
