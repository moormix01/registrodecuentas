const { Router } = require('express');
const { pool } = require('../db');
const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        pg.*,
        COUNT(ps.id) as sold_profiles,
        COALESCE(
          oa.start_date,
          pa.purchase_date
        ) as start_date,
        COALESCE(
          oa.end_date,
          pa.expiry_date
        ) as end_date
      FROM profile_groups pg
      LEFT JOIN profile_sales ps ON pg.id = ps.group_id
      LEFT JOIN own_accounts oa ON pg.account_id = oa.id AND pg.account_source = 'own'
      LEFT JOIN provider_accounts pa ON pg.account_id = pa.id AND pg.account_source = 'provider'
      GROUP BY pg.id, oa.start_date, oa.end_date, pa.purchase_date, pa.expiry_date
      ORDER BY pg.created_at DESC
    `);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const { email, password, platform, duration, profiles_count, price_per_profile,
          account_source, account_id, notes, start_date, end_date } = req.body;
  const count = profiles_count || 1;
  const ppp = price_per_profile ? parseFloat(price_per_profile) : null;
  const sale_price = ppp ? (ppp * count).toFixed(2) : null;

  let resolvedStart = start_date || null;
  let resolvedEnd = end_date || null;

  if (account_id && (!resolvedStart || !resolvedEnd)) {
    try {
      if (account_source === 'own') {
        const r = await pool.query('SELECT start_date, end_date FROM own_accounts WHERE id=$1', [account_id]);
        if (r.rows[0]) {
          resolvedStart = resolvedStart || (r.rows[0].start_date ? r.rows[0].start_date.toISOString().split('T')[0] : null);
          resolvedEnd   = resolvedEnd   || (r.rows[0].end_date   ? r.rows[0].end_date.toISOString().split('T')[0]   : null);
        }
      } else if (account_source === 'provider') {
        const r = await pool.query('SELECT purchase_date, expiry_date FROM provider_accounts WHERE id=$1', [account_id]);
        if (r.rows[0]) {
          resolvedStart = resolvedStart || (r.rows[0].purchase_date ? r.rows[0].purchase_date.toISOString().split('T')[0] : null);
          resolvedEnd   = resolvedEnd   || (r.rows[0].expiry_date   ? r.rows[0].expiry_date.toISOString().split('T')[0]   : null);
        }
      }
    } catch (_) {}
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const group = await client.query(
      `INSERT INTO profile_groups (email,password,platform,duration,profiles_count,price_per_profile,sale_price,account_source,account_id,notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [email, password, platform, duration, count, ppp, sale_price, account_source || 'manual', account_id || null, notes]
    );
    const groupId = group.rows[0].id;

    for (let i = 0; i < count; i++) {
      await client.query(
        'INSERT INTO profile_sales (group_id, status, purchase_date, expiry_date) VALUES ($1, $2, $3, $4)',
        [groupId, 'active', resolvedStart, resolvedEnd]
      );
    }

    if (account_id && account_source === 'own') {
      await client.query("UPDATE own_accounts SET status='sold' WHERE id=$1", [account_id]);
    } else if (account_id && account_source === 'provider') {
      await client.query("UPDATE provider_accounts SET status='in_use' WHERE id=$1", [account_id]);
    }

    await client.query('COMMIT');
    res.status(201).json(group.rows[0]);
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: e.message });
  } finally { client.release(); }
});

// PUT /:id — edit a profile group (saves old email to history if it changes)
router.put('/:id', async (req, res) => {
  const { email, password, platform, duration, notes } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Fetch current email
    const current = await client.query('SELECT email FROM profile_groups WHERE id=$1', [req.params.id]);
    if (current.rows.length === 0) { res.status(404).json({ error: 'Grupo no encontrado' }); return; }
    const oldEmail = current.rows[0].email;

    let result;
    if (oldEmail && oldEmail !== email) {
      // Email changed — save old email to previous_emails history
      result = await client.query(
        `UPDATE profile_groups
         SET email=$1, password=$2, platform=$3, duration=$4, notes=$5,
             previous_emails = array_append(COALESCE(previous_emails, '{}'), $6)
         WHERE id=$7 RETURNING *`,
        [email, password, platform, duration, notes, oldEmail, req.params.id]
      );
    } else {
      // Only password/other fields changed
      result = await client.query(
        `UPDATE profile_groups SET email=$1, password=$2, platform=$3, duration=$4, notes=$5
         WHERE id=$6 RETURNING *`,
        [email, password, platform, duration, notes, req.params.id]
      );
    }

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: e.message });
  } finally { client.release(); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM profile_groups WHERE id=$1', [req.params.id]);
    res.status(204).end();
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
