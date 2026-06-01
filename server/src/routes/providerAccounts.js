const { Router } = require('express');
const { pool } = require('../db');
const router = Router();

router.get('/', async (req, res) => {
  try {
    let q = `SELECT pa.*, p.name as provider_name FROM provider_accounts pa
             LEFT JOIN providers p ON pa.provider_id = p.id WHERE 1=1`;
    const params = [];
    if (req.query.platform) { params.push(req.query.platform); q += ` AND pa.platform=$${params.length}`; }
    if (req.query.status) { params.push(req.query.status); q += ` AND pa.status=$${params.length}`; }
    if (req.query.search) { params.push(`%${req.query.search}%`); q += ` AND (pa.email ILIKE $${params.length} OR pa.platform ILIKE $${params.length})`; }
    q += ' ORDER BY pa.created_at DESC';
    const result = await pool.query(q, params);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const { provider_id, email, password, platform, order_number, duration, purchase_date, expiry_date, purchase_price, status, notes } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO provider_accounts (provider_id,email,password,platform,order_number,duration,purchase_date,expiry_date,purchase_price,status,notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [provider_id || null, email, password, platform, order_number, duration, purchase_date || null, expiry_date || null, purchase_price || null, status || 'active', notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  const { provider_id, email, password, platform, order_number, duration, purchase_date, expiry_date, purchase_price, status, notes } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch current email before updating
    const current = await client.query('SELECT email FROM provider_accounts WHERE id=$1', [req.params.id]);
    const oldEmail = current.rows[0]?.email;

    // 2. Update provider_accounts
    const result = await client.query(
      `UPDATE provider_accounts SET provider_id=$1,email=$2,password=$3,platform=$4,order_number=$5,duration=$6,
       purchase_date=$7,expiry_date=$8,purchase_price=$9,status=$10,notes=$11 WHERE id=$12 RETURNING *`,
      [provider_id || null, email, password, platform, order_number, duration, purchase_date || null, expiry_date || null, purchase_price || null, status, notes, req.params.id]
    );

    const emailChanged = oldEmail && oldEmail !== email;

    // 3. Cascade to profile_groups linked to this account
    if (emailChanged) {
      // Save old email to history before overwriting
      await client.query(
        `UPDATE profile_groups
         SET email=$1, password=$2,
             previous_emails = array_append(
               COALESCE(previous_emails, '{}'),
               $3
             )
         WHERE account_source='provider' AND account_id=$4`,
        [email, password, oldEmail, req.params.id]
      );
    } else {
      await client.query(
        `UPDATE profile_groups SET password=$1
         WHERE account_source='provider' AND account_id=$2`,
        [password, req.params.id]
      );
    }

    // 4. Cascade to full_account_sales linked to this account
    await client.query(
      `UPDATE full_account_sales SET email=$1, password=$2
       WHERE account_source='provider' AND account_id=$3`,
      [email, password, req.params.id]
    );

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: e.message });
  } finally { client.release(); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM provider_accounts WHERE id=$1', [req.params.id]);
    res.status(204).end();
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
