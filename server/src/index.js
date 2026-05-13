const express = require('express');
const cors = require('cors');
const path = require('path');
const { migrate } = require('./db/migrate');
const { pool } = require('./db');
const routes = require('./routes');
const { scheduleBackups, pushBackup } = require('./backup');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Keep-alive endpoint — usado por UptimeRobot para evitar que Render duerma
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Backup manual on-demand
app.post('/api/backup/now', async (req, res) => {
  try {
    await pushBackup();
    res.json({ ok: true, message: 'Backup enviado a GitHub' });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.use('/api', routes);

// Auto-reset expired own_accounts back to available
async function resetExpiredAccounts() {
  try {
    const result = await pool.query(
      `UPDATE own_accounts
       SET status = 'available', end_date = NULL, start_date = NULL
       WHERE status = 'sold'
         AND end_date IS NOT NULL
         AND end_date < NOW()
       RETURNING id, email, platform`
    );
    if (result.rowCount > 0) {
      console.log(`[auto-reset] ${result.rowCount} cuenta(s) vencida(s) → disponible:`,
        result.rows.map(r => `${r.platform} ${r.email}`).join(', '));
    }
  } catch (err) {
    console.error('[auto-reset] Error:', err.message);
  }
}

// Serve frontend
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

async function start() {
  if (process.env.DATABASE_URL) {
    await migrate();
  } else {
    console.warn('⚠️  DATABASE_URL no configurado — la BD no estará disponible');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    // Verificar cuentas vencidas al arrancar y luego cada hora
    resetExpiredAccounts();
    setInterval(resetExpiredAccounts, 60 * 60 * 1000);

    if (process.env.GITHUB_TOKEN) {
      scheduleBackups(6); // backup cada 6 horas
    } else {
      console.warn('⚠️  GITHUB_TOKEN no configurado — backups automáticos desactivados');
    }
  });
}

start().catch(console.error);
