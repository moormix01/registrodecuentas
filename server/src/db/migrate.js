const { pool } = require('./index');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS providers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contact VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS own_accounts (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        platform VARCHAR(100) NOT NULL,
        duration VARCHAR(100),
        start_date DATE,
        end_date DATE,
        status VARCHAR(50) DEFAULT 'available',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS provider_accounts (
        id SERIAL PRIMARY KEY,
        provider_id INTEGER REFERENCES providers(id) ON DELETE SET NULL,
        provider_name VARCHAR(255),
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        platform VARCHAR(100) NOT NULL,
        order_number VARCHAR(100),
        duration VARCHAR(100),
        purchase_date DATE,
        expiry_date DATE,
        purchase_price DECIMAL(10,2),
        status VARCHAR(50) DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS profile_groups (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        platform VARCHAR(100) NOT NULL,
        duration VARCHAR(100),
        profiles_count INTEGER DEFAULT 1,
        sale_price DECIMAL(10,2),
        account_source VARCHAR(20) DEFAULT 'manual',
        account_id INTEGER,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS profile_sales (
        id SERIAL PRIMARY KEY,
        group_id INTEGER REFERENCES profile_groups(id) ON DELETE CASCADE,
        order_number VARCHAR(100),
        client_name VARCHAR(255),
        purchase_date DATE,
        expiry_date DATE,
        status VARCHAR(50) DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS full_account_sales (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        platform VARCHAR(100) NOT NULL,
        order_number VARCHAR(100),
        client_name VARCHAR(255),
        duration VARCHAR(100),
        purchase_date DATE,
        expiry_date DATE,
        sale_price DECIMAL(10,2),
        account_source VARCHAR(20) DEFAULT 'manual',
        account_id INTEGER,
        status VARCHAR(50) DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      ALTER TABLE profile_groups ADD COLUMN IF NOT EXISTS sale_price DECIMAL(10,2);
      ALTER TABLE profile_groups ADD COLUMN IF NOT EXISTS account_source VARCHAR(20) DEFAULT 'manual';
      ALTER TABLE profile_groups ADD COLUMN IF NOT EXISTS account_id INTEGER;
      ALTER TABLE profile_sales DROP COLUMN IF EXISTS price;
      ALTER TABLE full_account_sales ADD COLUMN IF NOT EXISTS sale_price DECIMAL(10,2);
      ALTER TABLE full_account_sales ADD COLUMN IF NOT EXISTS account_source VARCHAR(20) DEFAULT 'manual';
      ALTER TABLE full_account_sales ADD COLUMN IF NOT EXISTS account_id INTEGER;
      ALTER TABLE full_account_sales DROP COLUMN IF EXISTS price;
    `).catch(() => {});

    
    await client.query(`
      ALTER TABLE profile_groups ADD COLUMN IF NOT EXISTS price_per_profile DECIMAL(10,2);
    `).catch(() => {});
    console.log('✅ Base de datos migrada correctamente');
  } catch (err) {
    console.error('Error en migración:', err);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { migrate };
