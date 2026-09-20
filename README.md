# ElectroTechBD

বাংলাদেশের জন্য electrical wiring, smart home automation, solar এবং safety service website.

## Local run

```bash
npm install
cp .env.example .env
npm start
```

`.env`-এ একটি PostgreSQL connection string দিন:

```env
DATABASE_URL=postgresql://username:password@host:5432/database_name
```

আগের `data/store.json`-এর booking একবার PostgreSQL-এ নিতে চাইলে `.env`-এ `DATABASE_URL` দেওয়ার পর চালান:

```bash
npm run migrate:json
```

তারপর খুলুন:

- Website: `http://localhost:3000`
- Admin panel: `http://localhost:3000/admin`

Local development-এ `.env`-এ নিজের `ADMIN_USERNAME` এবং `ADMIN_PASSWORD` দিন।

## Deployment

Node.js hosting-এ repository deploy করে:

1. Build command খালি রাখুন বা `npm install` ব্যবহার করুন
2. Start command হিসেবে `npm start` দিন
3. Environment variables হিসেবে `.env.example`-এর সব প্রয়োজনীয় মান যোগ করুন
4. `NODE_ENV=production`, `DATABASE_URL`, একটি শক্তিশালী `ADMIN_PASSWORD`, এবং WhatsApp ব্যবহার করলে Meta credentials দিন
5. PostgreSQL provider হিসেবে Render PostgreSQL, Neon, Supabase বা অন্য managed PostgreSQL ব্যবহার করুন

Health check URL: `/api/health`

## Important

`.env` কখনো public repository-তে commit করবেন না। Server প্রথমবার চালু হলে `bookings` এবং `contacts` table নিজে তৈরি হবে।
