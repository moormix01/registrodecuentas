const { Router } = require('express');
const { pool } = require('../db');
const router = Router();

router.get('/search', async (req, res) => {
  try {
    const q = `%${req.query.q || ''}%`;
    const result = await pool.query(`
      SELECT id, email, password, platform, duration, 'own' as source, status,
             start_date, end_date
      FROM own_accounts
      WHERE email ILIKE $1 OR platform ILIKE $1
      UNION ALL
      SELECT id, email, password, platform, duration, 'provider' as source, status,
             purchase_date as start_date, expiry_date as end_date
      FROM provider_accounts
      WHERE email ILIKE $1 OR platform ILIKE $1
      ORDER BY email ASC LIMIT 20
    `, [q]);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
