const { Router } = require('express');
const { pool } = require('../db');
const router = Router();

router.get('/', async (req, res) => {
  try {
    let q = `SELECT ps.*, pg.email, pg.password, pg.platform, pg.duration
             FROM profile_sales ps
             JOIN profile_groups pg ON ps.group_id = pg.id WHERE 1=1`;
    const params = [];
    if (req.query.groupId) { params.push(req.query.groupId); q += ` AND ps.group_id=$${params.length}`; }
    if (req.query.status) { params.push(req.query.status); q += ` AND ps.status=$${params.length}`; }
    if (req.query.search) { params.push(`%${req.query.search}%`); q += ` AND (ps.client_name ILIKE $${params.length} OR ps.order_number ILIKE $${params.length})`; }
    q += ' ORDER BY ps.created_at DESC';
    const result = await pool.query(q, params);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  const { order_number, client_name, purchase_date, expiry_date, price, status, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE profile_sales SET order_number=$1,client_name=$2,purchase_date=$3,expiry_date=$4,price=$5,status=$6,notes=$7
       WHERE id=$8 RETURNING *`,
      [order_number, client_name, purchase_date || null, expiry_date || null, price || null, status, notes, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM profile_sales WHERE id=$1', [req.params.id]);
    res.status(204).end();
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
