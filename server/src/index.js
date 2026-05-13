const express = require('express');
const cors = require('cors');
const path = require('path');
const { migrate } = require('./db/migrate');
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
    if (process.env.GITHUB_TOKEN) {
      scheduleBackups(6); // backup cada 6 horas
    } else {
      console.warn('⚠️  GITHUB_TOKEN no configurado — backups automáticos desactivados');
    }
  });
}

start().catch(console.error);
