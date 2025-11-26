import pool from './database.js';

console.log('Starting migration test...');

try {
  const result = await pool.query('SELECT NOW()');
  console.log('✅ Database connected:', result.rows[0]);

  // Create users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      google_id VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      picture TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Users table created');

  // Create fields table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS fields (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      location VARCHAR(255),
      area DECIMAL(10, 2),
      area_unit VARCHAR(50) DEFAULT 'acres',
      soil_type VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Fields table created');

  // Create crops table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS crops (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      field_id INTEGER REFERENCES fields(id) ON DELETE SET NULL,
      name VARCHAR(255) NOT NULL,
      variety VARCHAR(255),
      area VARCHAR(100),
      planted_date DATE NOT NULL,
      expected_harvest_date DATE,
      actual_harvest_date DATE,
      status VARCHAR(50) DEFAULT 'Planted',
      progress INTEGER DEFAULT 0,
      health VARCHAR(50) DEFAULT 'Good',
      image VARCHAR(10) DEFAULT '🌾',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Crops table created');

  // Create schedules
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      crop_id INTEGER REFERENCES crops(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      task TEXT NOT NULL,
      done BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Schedules table created');

  // Create fertilizers
  await pool.query(`
    CREATE TABLE IF NOT EXISTS fertilizers (
      id SERIAL PRIMARY KEY,
      crop_id INTEGER REFERENCES crops(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      type VARCHAR(255) NOT NULL,
      quantity VARCHAR(100) NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Fertilizers table created');

  // Create pesticides
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pesticides (
      id SERIAL PRIMARY KEY,
      crop_id INTEGER REFERENCES crops(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      type VARCHAR(255) NOT NULL,
      quantity VARCHAR(100) NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Pesticides table created');

  // Create sprays
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sprays (
      id SERIAL PRIMARY KEY,
      crop_id INTEGER REFERENCES crops(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      time TIME,
      name VARCHAR(255) NOT NULL,
      quantity VARCHAR(100) NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Sprays table created');

  // Create expenses
  await pool.query(`
    CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      crop_id INTEGER REFERENCES crops(id) ON DELETE SET NULL,
      category VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      date DATE NOT NULL,
      payment_method VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Expenses table created');

  // Create revenue
  await pool.query(`
    CREATE TABLE IF NOT EXISTS revenue (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      crop_id INTEGER REFERENCES crops(id) ON DELETE SET NULL,
      source VARCHAR(255) NOT NULL,
      product VARCHAR(255) NOT NULL,
      quantity VARCHAR(100),
      amount DECIMAL(10, 2) NOT NULL,
      date DATE NOT NULL,
      payment_received BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Revenue table created');

  // Create indexes
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_crops_user_id ON crops(user_id);
    CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
    CREATE INDEX IF NOT EXISTS idx_revenue_user_id ON revenue(user_id);
    CREATE INDEX IF NOT EXISTS idx_fields_user_id ON fields(user_id);
    CREATE INDEX IF NOT EXISTS idx_schedules_crop_id ON schedules(crop_id);
    CREATE INDEX IF NOT EXISTS idx_fertilizers_crop_id ON fertilizers(crop_id);
    CREATE INDEX IF NOT EXISTS idx_pesticides_crop_id ON pesticides(crop_id);
    CREATE INDEX IF NOT EXISTS idx_sprays_crop_id ON sprays(crop_id);
  `);
  console.log('✅ Indexes created');

  console.log('\n✅ Migration completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}
