const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool, initDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PHONE = (process.env.WHATSAPP_ADMIN_NUMBER || '').replace(/\s+/g, '');
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'electrotech123';

if (IS_PRODUCTION && (ADMIN_PASSWORD === 'electrotech123' || !process.env.ADMIN_USERNAME)) {
  throw new Error('Production requires ADMIN_USERNAME and a non-default ADMIN_PASSWORD.');
}

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const expected = Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString('base64');

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (token !== expected) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  return next();
}

function bookingFromRow(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    service: row.service,
    date: String(row.visit_date).slice(0, 10),
    notes: row.notes,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString()
  };
}

function contactFromRow(row) {
  return {
    id: row.id,
    name: row.name,
    contact: row.contact,
    message: row.message,
    createdAt: new Date(row.created_at).toISOString()
  };
}

async function sendWhatsAppNotification(phone, message) {
  const phoneNumber = (phone || '').replace(/\s+/g, '');
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_TOKEN;

  if (!phoneNumber && !phoneNumberId && !token) {
    return { success: false, reason: 'No WhatsApp configuration' };
  }

  if (phoneNumberId && token) {
    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: { body: message }
        })
      });
      const result = await response.json();
      return response.ok ? { success: true, details: result } : { success: false, details: result };
    } catch (error) {
      return { success: false, details: error.message };
    }
  }

  if (phoneNumber) {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    console.log(`WhatsApp notification ready: ${url}`);
    return { success: true, url };
  }

  return { success: false, reason: 'No valid WhatsApp numbers configured' };
}

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', asyncHandler(async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ success: true, message: 'ElectroTechBD backend and PostgreSQL are running' });
}));

app.post('/api/bookings', asyncHandler(async (req, res) => {
  const { name, phone, service, date, notes } = req.body || {};

  if (!name || !phone || !service || !date) {
    return res.status(400).json({
      success: false,
      message: 'Name, phone, service, and date are required.'
    });
  }

  const booking = {
    id: `#ENG-${Date.now().toString().slice(-6)}`,
    name: String(name).trim(),
    phone: String(phone).trim(),
    service: String(service).trim(),
    date: String(date).trim(),
    notes: String(notes || '').trim()
  };

  const result = await pool.query(
    `INSERT INTO bookings (id, name, phone, service, visit_date, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [booking.id, booking.name, booking.phone, booking.service, booking.date, booking.notes]
  );

  const savedBooking = bookingFromRow(result.rows[0]);

  if (ADMIN_PHONE) {
    const message = `✅ নতুন বুকিং: ${savedBooking.name}\n📞 ${savedBooking.phone}\n🛠️ ${savedBooking.service}\n📅 ${savedBooking.date}\n📝 ${savedBooking.notes || 'No notes'}`;
    await sendWhatsAppNotification(ADMIN_PHONE, message);
  }

  return res.status(201).json({
    success: true,
    message: 'Booking received successfully.',
    data: savedBooking
  });
}));

app.get('/api/bookings', authMiddleware, asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
  res.json({ success: true, data: result.rows.map(bookingFromRow) });
}));

app.post('/api/contact', asyncHandler(async (req, res) => {
  const { name, contact, message } = req.body || {};

  if (!contact) {
    return res.status(400).json({ success: false, message: 'Contact info is required.' });
  }

  const id = `#CNT-${Date.now().toString().slice(-6)}`;
  const result = await pool.query(
    `INSERT INTO contacts (id, name, contact, message)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id, String(name || 'Guest').trim(), String(contact).trim(), String(message || '').trim()]
  );

  return res.status(201).json({
    success: true,
    message: 'Contact information saved successfully.',
    data: contactFromRow(result.rows[0])
  });
}));

app.get('/api/contacts', authMiddleware, asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
  res.json({ success: true, data: result.rows.map(contactFromRow) });
}));

app.delete('/api/bookings/:id', authMiddleware, asyncHandler(async (req, res) => {
  const id = decodeURIComponent(req.params.id || '');
  const result = await pool.query('DELETE FROM bookings WHERE id = $1 RETURNING id', [id]);

  if (!result.rowCount) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  return res.json({ success: true, message: 'Booking deleted.' });
}));

app.delete('/api/contacts/:id', authMiddleware, asyncHandler(async (req, res) => {
  const id = decodeURIComponent(req.params.id || '');
  const result = await pool.query('DELETE FROM contacts WHERE id = $1 RETURNING id', [id]);

  if (!result.rowCount) {
    return res.status(404).json({ success: false, message: 'Contact not found.' });
  }

  return res.json({ success: true, message: 'Contact deleted.' });
}));

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Invalid username or password.' });
  }

  const token = Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString('base64');
  return res.json({ success: true, token, username: ADMIN_USERNAME });
});

app.get('/api/admin/summary', authMiddleware, asyncHandler(async (req, res) => {
  const [counts, latest] = await Promise.all([
    pool.query(`SELECT
      COUNT(*)::int AS "totalBookings",
      COUNT(*) FILTER (WHERE status = 'new')::int AS pending
      FROM bookings`),
    pool.query('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5')
  ]);
  const contacts = await pool.query('SELECT COUNT(*)::int AS count FROM contacts');

  res.json({
    success: true,
    data: {
      totalBookings: counts.rows[0].totalBookings,
      totalContacts: contacts.rows[0].count,
      pending: counts.rows[0].pending,
      latest: latest.rows.map(bookingFromRow)
    }
  });
}));

app.get('/api/admin/entries', authMiddleware, asyncHandler(async (req, res) => {
  const [bookings, contacts] = await Promise.all([
    pool.query('SELECT * FROM bookings ORDER BY created_at DESC'),
    pool.query('SELECT * FROM contacts ORDER BY created_at DESC')
  ]);

  res.json({
    success: true,
    data: {
      bookings: bookings.rows.map(bookingFromRow),
      contacts: contacts.rows.map(contactFromRow)
    }
  });
}));

app.patch('/api/bookings/:id/status', authMiddleware, asyncHandler(async (req, res) => {
  const id = decodeURIComponent(req.params.id || '');
  const { status } = req.body || {};
  const validStatuses = ['new', 'contacted', 'in-progress', 'done', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value.' });
  }

  const result = await pool.query(
    'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );

  if (!result.rowCount) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  return res.json({
    success: true,
    message: 'Booking status updated.',
    data: bookingFromRow(result.rows[0])
  });
}));

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.use(['/data', '/.env', '/.env.example'], (req, res) => {
  res.status(404).end();
});

app.use(express.static(__dirname));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  return res.sendFile(path.join(__dirname, 'index.html'));
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
});

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`ElectroTechBD backend running at http://localhost:${PORT}`);
      console.log(`Admin panel: http://localhost:${PORT}/admin`);
      console.log('PostgreSQL database connected.');
    });
  })
  .catch((error) => {
    console.error('Database initialization failed:', error.message);
    process.exit(1);
  });
