const { Router } = require('express');
const { pool } = require('../db');
const router = Router();

const PLATFORMS = ['netflix','spotify','disney','hbo','max','prime','amazon','youtube',
  'crunchyroll','twitch','paramount','apple','deezer','canva','duolingo','plex','mubi','vix'];

function extractPlatform(t) {
  const l = t.toLowerCase();
  return PLATFORMS.find(p => l.includes(p)) || null;
}
function extractDays(t) {
  const m = t.match(/(\d+)\s*d[ií]a/i);
  if (m) return parseInt(m[1]);
  if (/esta\s+semana/.test(t)) return 7;
  if (/este\s+mes/.test(t))   return 30;
  if (/mañana/.test(t))       return 1;
  return 7;
}
function extractEmails(t) {
  return [...t.matchAll(/[\w.+%-]+@[\w.-]+\.[a-z]{2,}/gi)].map(m => m[0]);
}
function detectIntent(text) {
  const l = text.toLowerCase().trim();
  if (/^\*+$|^★$|^menu$|^men[uú]$/.test(l))         return { intent: 'menu' };
  if (/elimina[r ]?\s*(todos?\s+los?\s+)?venci|borra[r ]?\s*(todos?\s+los?\s+)?venci|limpiar?\s*(los?\s+)?venci/.test(l))
                                                        return { intent: 'cleanup' };
  if (/venc|caduc|expirar|por\s+vencer|cu[aá]nto.*queda/.test(l))
                                                        return { intent: 'expiring', dias: extractDays(l) };
  if (/stock|inventario|cu[aá]ntas?\s+cuenta|hay\s+disponible/.test(l))
                                                        return { intent: 'stock' };
  if (/pedido|orden|historial/.test(l)) {
    const emails = extractEmails(text);
    const nameM  = text.match(/(?:de|del?)\s+([A-Za-záéíóúñÁÉÍÓÚÑ][A-Za-záéíóúñÁÉÍÓÚÑ\s]{2,24})(?:\s|$)/i);
    return { intent: 'search_orders', query: emails[0] || (nameM ? nameM[1].trim() : null) };
  }
  if (/actualiz|reemplaz|cambia[r ]?\s*(?:el\s+)?correo/.test(l)) {
    return { intent: 'update_email', emails: extractEmails(text) };
  }
  if (/hola|buenas|inicio/.test(l)) return { intent: 'greeting' };
  if (/ayuda|help|comandos|opciones/.test(l)) return { intent: 'help' };
  return { intent: 'unknown' };
}

// ─── Cleanup expired ──────────────────────────────────────────────────────────
router.post('/cleanup-expired', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const ownReset = await client.query(`
      UPDATE own_accounts SET status='available', end_date=NULL, start_date=NULL
      WHERE status='sold' AND end_date IS NOT NULL AND end_date < NOW()`);
    const provDel = await client.query(`
      DELETE FROM provider_accounts WHERE expiry_date IS NOT NULL AND expiry_date < NOW()`);
    const fullDel = await client.query(`
      DELETE FROM full_account_sales WHERE expiry_date IS NOT NULL AND expiry_date < NOW()`);
    const profDel = await client.query(`
      DELETE FROM profile_sales WHERE expiry_date IS NOT NULL AND expiry_date < NOW()`);
    await client.query('COMMIT');
    res.json({
      ok: true,
      ownRestored: ownReset.rowCount,
      providerDeleted: provDel.rowCount,
      fullDeleted: fullDel.rowCount,
      profilesDeleted: profDel.rowCount,
      total: ownReset.rowCount + provDel.rowCount + fullDel.rowCount + profDel.rowCount
    });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ ok: false, error: e.message });
  } finally { client.release(); }
});

// ─── Update email across all tables ──────────────────────────────────────────
router.post('/update-email', async (req, res) => {
  const { old: oldEmail, nuevo: newEmail } = req.body;
  if (!oldEmail || !newEmail) return res.status(400).json({ error: 'Faltan correos' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const log = [];
    for (const tbl of ['own_accounts','provider_accounts','full_account_sales','profile_groups']) {
      const r = await client.query(`UPDATE ${tbl} SET email=$1 WHERE email=$2 RETURNING id`, [newEmail, oldEmail]);
      if (r.rowCount > 0) log.push(`${tbl} (${r.rowCount})`);
    }
    await client.query('COMMIT');
    res.json({ ok: true, log });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ ok: false, error: e.message });
  } finally { client.release(); }
});

// ─── Chat message ─────────────────────────────────────────────────────────────
router.post('/message', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.json({ reply: 'Mensaje vacío.' });

  const { intent, dias, emails, query } = detectIntent(message);

  try {
    if (intent === 'menu')    return res.json({ reply: '¿Qué deseas hacer?', action: 'show_menu' });
    if (intent === 'cleanup') return res.json({ reply: '⚠️ Esto eliminará permanentemente todos los registros vencidos. No se puede deshacer. ¿Confirmas?', action: 'confirm_cleanup' });
    if (intent === 'greeting') return res.json({ reply: '¡Hola! 👋 Escribe **★** o **\\*** para ver el menú de opciones, o dime directamente qué necesitas.' });
    if (intent === 'help') return res.json({ reply: '📋 **Comandos disponibles:**\n\n• **★** o **\\*** — Menú visual de opciones\n• "Qué vence esta semana" — Ver vencimientos\n• "Qué vence en 15 días" — Vencimientos en N días\n• "Cuánto stock hay" — Ver inventario disponible\n• "Pedidos de correo@..." — Buscar pedidos por correo o nombre\n• "Reemplaza viejo@ por nuevo@" — Actualizar correo en todas las tablas\n• "Eliminar vencidos" — Limpiar todos los registros expirados de la base de datos' });

    if (intent === 'expiring') {
      const d = dias || 7;
      const [fa, ps, pa, oa] = await Promise.all([
        pool.query(`SELECT client_name, platform, expiry_date, EXTRACT(DAY FROM expiry_date - NOW())::int AS dias_rest FROM full_account_sales WHERE expiry_date IS NOT NULL AND status='active' AND expiry_date BETWEEN NOW() AND NOW() + ($1 || ' days')::INTERVAL ORDER BY expiry_date ASC`, [d]),
        pool.query(`SELECT ps.client_name, pg.platform, ps.expiry_date, EXTRACT(DAY FROM ps.expiry_date - NOW())::int AS dias_rest FROM profile_sales ps JOIN profile_groups pg ON ps.group_id=pg.id WHERE ps.expiry_date IS NOT NULL AND ps.status='active' AND ps.expiry_date BETWEEN NOW() AND NOW() + ($1 || ' days')::INTERVAL ORDER BY ps.expiry_date ASC`, [d]),
        pool.query(`SELECT email, platform, expiry_date, EXTRACT(DAY FROM expiry_date - NOW())::int AS dias_rest FROM provider_accounts WHERE expiry_date IS NOT NULL AND status='active' AND expiry_date BETWEEN NOW() AND NOW() + ($1 || ' days')::INTERVAL ORDER BY expiry_date ASC`, [d]),
        pool.query(`SELECT email, platform, end_date, EXTRACT(DAY FROM end_date - NOW())::int AS dias_rest FROM own_accounts WHERE status='sold' AND end_date IS NOT NULL AND end_date BETWEEN NOW() AND NOW() + ($1 || ' days')::INTERVAL ORDER BY end_date ASC`, [d]),
      ]);
      const total = fa.rowCount + ps.rowCount + pa.rowCount + oa.rowCount;
      if (total === 0) return res.json({ reply: `✅ No hay cuentas que venzan en los próximos **${d} días**.` });
      let reply = `📅 **Vencimientos en ${d} días** (${total} total):\n\n`;
      const fmt = r => r?.toISOString?.()?.slice(0,10) || r || '?';
      if (fa.rowCount) { reply += `**Cuentas completas (${fa.rowCount}):**\n`; fa.rows.forEach(r => reply += `• ${r.platform?.toUpperCase()||'?'} | ${r.client_name||'—'} | ${r.dias_rest}d → ${fmt(r.expiry_date)}\n`); reply += '\n'; }
      if (ps.rowCount) { reply += `**Perfiles (${ps.rowCount}):**\n`; ps.rows.forEach(r => reply += `• ${r.platform?.toUpperCase()||'?'} | ${r.client_name||'—'} | ${r.dias_rest}d → ${fmt(r.expiry_date)}\n`); reply += '\n'; }
      if (pa.rowCount) { reply += `**Proveedor (${pa.rowCount}):**\n`; pa.rows.forEach(r => reply += `• ${r.platform?.toUpperCase()||'?'} | ${r.email} | ${r.dias_rest}d\n`); reply += '\n'; }
      if (oa.rowCount) { reply += `**Stock propio venciendo (${oa.rowCount}):**\n`; oa.rows.forEach(r => reply += `• ${r.platform?.toUpperCase()||'?'} | ${r.email} | ${r.dias_rest}d\n`); }
      return res.json({ reply });
    }

    if (intent === 'stock') {
      const [oa, pa] = await Promise.all([
        pool.query(`SELECT platform, COUNT(*) AS n FROM own_accounts WHERE status='available' GROUP BY platform ORDER BY n DESC`),
        pool.query(`SELECT platform, COUNT(*) AS n FROM provider_accounts WHERE status='active' GROUP BY platform ORDER BY n DESC`),
      ]);
      let reply = '📦 **Stock disponible:**\n\n';
      if (pa.rowCount) { reply += '**Proveedor:**\n'; pa.rows.forEach(r => reply += `• ${r.platform?.toUpperCase()||'?'}: ${r.n}\n`); reply += '\n'; }
      else reply += '_Proveedor: sin stock_\n\n';
      if (oa.rowCount) { reply += '**Stock propio:**\n'; oa.rows.forEach(r => reply += `• ${r.platform?.toUpperCase()||'?'}: ${r.n}\n`); }
      else reply += '_Stock propio: sin cuentas disponibles_';
      return res.json({ reply });
    }

    if (intent === 'search_orders') {
      if (!query) return res.json({ reply: '¿De qué correo o cliente quieres los pedidos? Escríbelo en el chat.' });
      const pat = '%' + query + '%';
      const [fa, ps] = await Promise.all([
        pool.query(`SELECT order_number, platform, client_name, email, sale_price, purchase_date FROM full_account_sales WHERE email ILIKE $1 OR client_name ILIKE $1 OR order_number ILIKE $1 ORDER BY purchase_date DESC LIMIT 15`, [pat]),
        pool.query(`SELECT ps.order_number, pg.platform, ps.client_name, pg.email, ps.purchase_date FROM profile_sales ps JOIN profile_groups pg ON ps.group_id=pg.id WHERE pg.email ILIKE $1 OR ps.client_name ILIKE $1 OR ps.order_number ILIKE $1 ORDER BY ps.purchase_date DESC LIMIT 15`, [pat]),
      ]);
      const total = fa.rowCount + ps.rowCount;
      if (total === 0) return res.json({ reply: `🔍 No encontré pedidos para **"${query}"**.` });
      let reply = `🔍 **Pedidos para "${query}"** (${total}):\n\n`;
      const fmt = r => r?.toISOString?.()?.slice(0,10) || r || '?';
      if (fa.rowCount) { reply += `**Cuentas completas:**\n`; fa.rows.forEach(x => reply += `• ${x.platform?.toUpperCase()||'?'} | ${x.client_name||'—'} | Orden: **${x.order_number||'sin orden'}** | $${x.sale_price||'—'} | ${fmt(x.purchase_date)}\n`); reply += '\n'; }
      if (ps.rowCount) { reply += `**Perfiles:**\n`; ps.rows.forEach(x => reply += `• ${x.platform?.toUpperCase()||'?'} | ${x.client_name||'—'} | Orden: **${x.order_number||'sin orden'}** | ${fmt(x.purchase_date)}\n`); }
      return res.json({ reply });
    }

    if (intent === 'update_email') {
      if (!emails || emails.length < 2) return res.json({ reply: 'Para actualizar un correo necesito los dos.\nEjemplo: _"Reemplaza **viejo@correo.com** por **nuevo@correo.com**"_' });
      return res.json({ reply: `¿Confirmas cambiar **${emails[0]}** por **${emails[1]}** en todas las tablas?`, action: 'confirm_update_email', data: { old: emails[0], nuevo: emails[1] } });
    }

    return res.json({ reply: 'No entendí eso 🤔\n\nEscribe **\\*** para ver el menú de opciones, o **"ayuda"** para los comandos disponibles.' });
  } catch (e) {
    return res.json({ reply: '❌ Error: ' + e.message });
  }
});

module.exports = router;
