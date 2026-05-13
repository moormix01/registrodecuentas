const { Router } = require('express');
const { pool } = require('../db');
const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM providers ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const { name, contact, notes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO providers (name, contact, notes) VALUES ($1,$2,$3) RETURNING *',
      [name, contact, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  const { name, contact, notes } = req.body;
  try {
    const result = await pool.query(
      'UPDATE providers SET name=$1, contact=$2, notes=$3 WHERE id=$4 RETURNING *',
      [name, contact, notes, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM providers WHERE id=$1', [req.params.id]);
    res.status(204).end();
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
