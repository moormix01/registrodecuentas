const { Router } = require('express');
const { pool } = require('../db');
const router = Router();

router.get('/search', async (req, res) => {
  try {
    const q = `%${req.query.q || ''}%`;
    const result = await pool.query(`
      SELECT id, email, password, platform, duration, 'own' as source, status,
             start_date, end_date, NULL::text[] as previous_emails
      FROM own_accounts
      WHERE email ILIKE $1 OR platform ILIKE $1
      UNION ALL
      SELECT id, email, password, platform, duration, 'provider' as source, status,
             purchase_date as start_date, expiry_date as end_date, NULL::text[] as previous_emails
      FROM provider_accounts
      WHERE email ILIKE $1 OR platform ILIKE $1
      ORDER BY email ASC LIMIT 20
    `, [q]);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Search profile groups by current OR previous email (for guarantee lookups)
router.get('/search-profile', async (req, res) => {
  try {
    const q = req.query.q || '';
    const result = await pool.query(`
      SELECT
        pg.id,
        pg.email,
        pg.password,
        pg.platform,
        pg.duration,
        pg.previous_emails,
        pg.profiles_count,
        pg.account_source,
        COUNT(ps.id) as sold_profiles
      FROM profile_groups pg
      LEFT JOIN profile_sales ps ON pg.id = ps.group_id
      WHERE
        pg.email ILIKE $1
        OR pg.platform ILIKE $1
        OR EXISTS (
          SELECT 1 FROM unnest(COALESCE(pg.previous_emails, '{}')) AS pe
          WHERE pe ILIKE $1
        )
      GROUP BY pg.id
      ORDER BY pg.created_at DESC
      LIMIT 20
    `, [`%${q}%`]);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
