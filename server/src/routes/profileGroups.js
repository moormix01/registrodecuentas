const { Router } = require('express');
const { pool } = require('../db');
const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT pg.*, COUNT(ps.id) as sold_profiles
      FROM profile_groups pg
      LEFT JOIN profile_sales ps ON pg.id = ps.group_id
      GROUP BY pg.id ORDER BY pg.created_at DESC
    `);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const { email, password, platform, duration, profiles_count, notes } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const group = await client.query(
      'INSERT INTO profile_groups (email,password,platform,duration,profiles_count,notes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [email, password, platform, duration, profiles_count || 1, notes]
    );
    const groupId = group.rows[0].id;
    for (let i = 0; i < (profiles_count || 1); i++) {
      await client.query(
        'INSERT INTO profile_sales (group_id, status) VALUES ($1, $2)',
        [groupId, 'active']
      );
    }
    await client.query('COMMIT');
    res.status(201).json(group.rows[0]);
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
