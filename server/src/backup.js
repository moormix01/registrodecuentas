const https = require('https');
const { pool } = require('./db');

async function collectData() {
  const [own, providerAcc, profileGrp, profileSls, fullSls, provs] = await Promise.all([
    pool.query('SELECT * FROM own_accounts ORDER BY id'),
    pool.query('SELECT * FROM provider_accounts ORDER BY id'),
    pool.query('SELECT * FROM profile_groups ORDER BY id'),
    pool.query('SELECT * FROM profile_sales ORDER BY id'),
    pool.query('SELECT * FROM full_account_sales ORDER BY id'),
    pool.query('SELECT * FROM providers ORDER BY id'),
  ]);
  return {
    generated_at: new Date().toISOString(),
    own_accounts:       own.rows,
    providers:          provs.rows,
    provider_accounts:  providerAcc.rows,
    profile_groups:     profileGrp.rows,
    profile_sales:      profileSls.rows,
    full_account_sales: fullSls.rows,
  };
}

function githubRequest(method, path, token, repo, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'api.github.com',
      path: `/repos/${repo}/contents/${path}`,
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'jack-backup-bot',
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => (d += c));
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch { resolve({}); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function pushBackup() {
  const token = process.env.GITHUB_TOKEN;
  const repo  = process.env.GITHUB_REPO || 'registrowebjack/registrodecuentas';
  if (!token) { console.warn('[backup] GITHUB_TOKEN no configurado — backup omitido'); return; }

  try {
    const data    = await collectData();
    const date    = new Date().toISOString().replace('T', '_').slice(0, 16).replace(':', '-');
    const latest  = 'backups/backup_latest.json';
    const dated   = `backups/backup_${date}.json`;
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
    const msg     = `Backup automático ${new Date().toISOString()}`;

    for (const filePath of [latest, dated]) {
      let sha;
      try {
        const existing = await githubRequest('GET', filePath, token, repo, null);
        sha = existing.sha;
      } catch {}
      await githubRequest('PUT', filePath, token, repo, { message: msg, content, sha, branch: 'main' });
    }
    console.log(`[backup] ✅ Backup guardado en GitHub: ${dated}`);
  } catch (err) {
    console.error('[backup] ❌ Error al guardar backup:', err.message);
  }
}

function scheduleBackups(intervalHours = 6) {
  const ms = intervalHours * 60 * 60 * 1000;
  // Primera ejecución 2 minutos después de arrancar
  setTimeout(() => {
    pushBackup();
    setInterval(pushBackup, ms);
  }, 2 * 60 * 1000);
  console.log(`[backup] Programado cada ${intervalHours}h — primer backup en 2 min`);
}

module.exports = { pushBackup, scheduleBackups };
