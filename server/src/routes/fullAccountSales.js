const { Router } = require('express');
const { pool } = require('../db');
const router = Router();

router.get('/', async (req, res) => {
  try {
    let q = 'SELECT * FROM full_account_sales WHERE 1=1';
    const params = [];
    if (req.query.platform) { params.push(req.query.platform); q += ` AND platform=$${params.length}`; }
    if (req.query.status) { params.push(req.query.status); q += ` AND status=$${params.length}`; }
    if (req.query.search) { params.push(`%${req.query.search}%`); q += ` AND (client_name ILIKE $${params.length} OR email ILIKE $${params.length} OR order_number ILIKE $${params.length})`; }
    q += ' ORDER BY created_at DESC';
    const result = await pool.query(q, params);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const { email, password, platform, order_number, client_name, duration, purchase_date, expiry_date, sale_price, account_source, account_id, status, notes } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `INSERT INTO full_account_sales (email,password,platform,order_number,client_name,duration,purchase_date,expiry_date,sale_price,account_source,account_id,status,notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [email, password, platform, order_number, client_name, duration, purchase_date || null, expiry_date || null, sale_price || null, account_source || 'manual', account_id || null, status || 'active', notes]
    );

    if (account_id && account_source === 'own') {
      await client.query("UPDATE own_accounts SET status='sold' WHERE id=$1", [account_id]);
    } else if (account_id && account_source === 'provider') {
      await client.query("UPDATE provider_accounts SET status='in_use' WHERE id=$1", [account_id]);
    }

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: e.message });
  } finally { client.release(); }
});

router.put('/:id', async (req, res) => {
  const { email, password, platform, order_number, client_name, duration, purchase_date, expiry_date, sale_price, status, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE full_account_sales SET email=$1,password=$2,platform=$3,order_number=$4,client_name=$5,duration=$6,
       purchase_date=$7,expiry_date=$8,sale_price=$9,status=$10,notes=$11 WHERE id=$12 RETURNING *`,
      [email, password, platform, order_number, client_name, duration, purchase_date || null, expiry_date || null, sale_price || null, status, notes, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM full_account_sales WHERE id=$1', [req.params.id]);
    res.status(204).end();
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
