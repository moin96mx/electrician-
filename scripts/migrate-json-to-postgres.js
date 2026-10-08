const fs = require('fs');
const path = require('path');
const { pool, initDatabase } = require('../db');

async function migrate() {
  const filePath = path.join(__dirname, '..', 'data', 'store.json');
  const store = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  await initDatabase();

  for (const booking of store.bookings || []) {
    await pool.query(
      `INSERT INTO bookings (id, name, phone, service, visit_date, notes, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [booking.id, booking.name, booking.phone, booking.service, booking.date, booking.notes || '', booking.status || 'new', booking.createdAt]
    );
  }

  for (const contact of store.contacts || []) {
    await pool.query(
      `INSERT INTO contacts (id, name, contact, message, created_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING`,
      [contact.id, contact.name || 'Guest', contact.contact, contact.message || '', contact.createdAt]
    );
  }

  console.log('JSON records migrated to PostgreSQL. Existing IDs were preserved.');
}

migrate()
  .catch((error) => {
    console.error('Migration failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
