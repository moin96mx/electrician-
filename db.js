require('dotenv').config();

const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required. Add your PostgreSQL connection string to .env.');
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: isProduction ? { rejectUnauthorized: false } : undefined
});

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      service TEXT NOT NULL,
      visit_date DATE NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'new',
      file_name TEXT,
      file_type TEXT,
      file_size INTEGER,
      file_data BYTEA,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT 'Guest',
      contact TEXT NOT NULL,
      message TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS bookings_created_at_idx ON bookings (created_at DESC);
    CREATE INDEX IF NOT EXISTS contacts_created_at_idx ON contacts (created_at DESC);
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS file_name TEXT;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS file_type TEXT;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS file_size INTEGER;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS file_data BYTEA;
  `);
}

module.exports = { pool, initDatabase };
