const { Router } = require('express');
const { pool } = require('../db');
const router = Router();

router.get('/', async (req, res) => {
  try {
    let q = 'SELECT * FROM own_accounts WHERE 1=1';
    const params = [];
    if (req.query.platform) { params.push(req.query.platform); q += ` AND platform=$${params.length}`; }
    if (req.query.status) { params.push(req.query.status); q += ` AND status=$${params.length}`; }
    if (req.query.search) { params.push(`%${req.query.search}%`); q += ` AND (email ILIKE $${params.length} OR platform ILIKE $${params.length})`; }
    q += ' ORDER BY created_at DESC';
    const result = await pool.query(q, params);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const { email, password, platform, duration, start_date, end_date, status, notes } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO own_accounts (email,password,platform,duration,start_date,end_date,status,notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [email, password, platform, duration, start_date || null, end_date || null, status || 'available', notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  const { email, password, platform, duration, start_date, end_date, status, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE own_accounts SET email=$1,password=$2,platform=$3,duration=$4,start_date=$5,end_date=$6,status=$7,notes=$8
       WHERE id=$9 RETURNING *`,
      [email, password, platform, duration, start_date || null, end_date || null, status, notes, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM own_accounts WHERE id=$1', [req.params.id]);
    res.status(204).end();
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
