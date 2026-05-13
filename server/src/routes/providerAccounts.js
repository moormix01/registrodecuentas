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
  try {
    const result = await pool.query(
      `UPDATE provider_accounts SET provider_id=$1,email=$2,password=$3,platform=$4,order_number=$5,duration=$6,
       purchase_date=$7,expiry_date=$8,purchase_price=$9,status=$10,notes=$11 WHERE id=$12 RETURNING *`,
      [provider_id || null, email, password, platform, order_number, duration, purchase_date || null, expiry_date || null, purchase_price || null, status, notes, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM provider_accounts WHERE id=$1', [req.params.id]);
    res.status(204).end();
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
