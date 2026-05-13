const { Router } = require('express');
const { pool } = require('../db');
const router = Router();

router.get('/summary', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const in7days = new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0];

    const [
      ownTotal, ownAvailable, ownSold,
      provTotal, provActive, provExpiring, provExpired,
      profileSalesTotal, profileSalesActive,
      fullSalesTotal, fullSalesActive,
      revenueProfile, revenueFull
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM own_accounts'),
      pool.query("SELECT COUNT(*) FROM own_accounts WHERE status='available'"),
      pool.query("SELECT COUNT(*) FROM own_accounts WHERE status='sold'"),
      pool.query('SELECT COUNT(*) FROM provider_accounts'),
      pool.query("SELECT COUNT(*) FROM provider_accounts WHERE status='active'"),
      pool.query("SELECT COUNT(*) FROM provider_accounts WHERE expiry_date BETWEEN $1 AND $2", [today, in7days]),
      pool.query("SELECT COUNT(*) FROM provider_accounts WHERE expiry_date < $1", [today]),
      pool.query('SELECT COUNT(*) FROM profile_sales'),
      pool.query("SELECT COUNT(*) FROM profile_sales WHERE status='active'"),
      pool.query('SELECT COUNT(*) FROM full_account_sales'),
      pool.query("SELECT COUNT(*) FROM full_account_sales WHERE status='active'"),
      pool.query('SELECT COALESCE(SUM(price),0) as total FROM profile_sales WHERE price IS NOT NULL'),
      pool.query('SELECT COALESCE(SUM(price),0) as total FROM full_account_sales WHERE price IS NOT NULL'),
    ]);

    const byPlatform = await pool.query(`
      SELECT platform, COUNT(*) as count FROM (
        SELECT platform FROM profile_sales ps JOIN profile_groups pg ON ps.group_id=pg.id
        UNION ALL
        SELECT platform FROM full_account_sales
      ) combined GROUP BY platform ORDER BY count DESC LIMIT 5
    `);

    const recentSales = await pool.query(`
      SELECT 'perfil' as type, ps.client_name, pg.platform, ps.expiry_date, ps.status, ps.created_at
      FROM profile_sales ps JOIN profile_groups pg ON ps.group_id=pg.id
      WHERE ps.client_name IS NOT NULL
      UNION ALL
      SELECT 'completa' as type, client_name, platform, expiry_date, status, created_at
      FROM full_account_sales
      ORDER BY created_at DESC LIMIT 10
    `);

    const expiringSoon = await pool.query(`
      SELECT 'perfil' as type, ps.client_name, pg.platform, ps.expiry_date
      FROM profile_sales ps JOIN profile_groups pg ON ps.group_id=pg.id
      WHERE ps.expiry_date BETWEEN $1 AND $2
      UNION ALL
      SELECT 'completa', client_name, platform, expiry_date
      FROM full_account_sales WHERE expiry_date BETWEEN $1 AND $2
      ORDER BY expiry_date ASC
    `, [today, in7days]);

    res.json({
      ownAccounts: {
        total: parseInt(ownTotal.rows[0].count),
        available: parseInt(ownAvailable.rows[0].count),
        sold: parseInt(ownSold.rows[0].count),
      },
      providerAccounts: {
        total: parseInt(provTotal.rows[0].count),
        active: parseInt(provActive.rows[0].count),
        expiring: parseInt(provExpiring.rows[0].count),
        expired: parseInt(provExpired.rows[0].count),
      },
      sales: {
        profileSales: parseInt(profileSalesTotal.rows[0].count),
        profileActive: parseInt(profileSalesActive.rows[0].count),
        fullSales: parseInt(fullSalesTotal.rows[0].count),
        fullActive: parseInt(fullSalesActive.rows[0].count),
        totalRevenue: parseFloat(revenueProfile.rows[0].total) + parseFloat(revenueFull.rows[0].total),
      },
      byPlatform: byPlatform.rows,
      recentSales: recentSales.rows,
      expiringSoon: expiringSoon.rows,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
