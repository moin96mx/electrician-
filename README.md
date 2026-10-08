# ElectroTechBD

বাংলাদেশের electrical wiring, smart home automation, solar এবং safety service website.

## Supabase backend setup

The backend runs entirely on Supabase Edge Functions, Supabase Postgres, and private Supabase Storage. The website remains a static site and can continue using its existing static hosting and domain; it no longer calls a Render or Express backend.

### 1. Create and link a Supabase project

Create a project in the Supabase Dashboard and install the Supabase CLI. From this project directory, link the CLI:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

### 2. Create the database and private upload bucket

Apply the schema migration with the CLI:

```bash
supabase db push
```

Alternatively, open the Supabase Dashboard's SQL Editor and run [`supabase/schema.sql`](./supabase/schema.sql). This creates the bookings and contacts tables, enables row-level security without public table policies, and creates the private `booking-files` bucket.

### 3. Create the admin account

In Supabase Dashboard → Authentication → Users, create the admin user with the email address that will be used to sign in. Disable public sign-ups in Authentication settings. Set the same address as the `ADMIN_EMAIL` function secret in the next step.

### 4. Set Edge Function secrets and deploy

Set the admin email and the allowed website origins. Include the production site origin and any local development origin you use:

```bash
supabase secrets set ADMIN_EMAIL=admin@example.com SITE_ORIGINS=https://electrotechbd.xyz,https://www.electrotechbd.xyz,http://localhost:5500
```

For WhatsApp Cloud API notifications, set these optional secrets:

```bash
supabase secrets set WHATSAPP_ADMIN_NUMBER=8801XXXXXXXXX WHATSAPP_PHONE_NUMBER_ID=YOUR_PHONE_NUMBER_ID WHATSAPP_TOKEN=YOUR_META_ACCESS_TOKEN
```

Deploy the API function:

```bash
supabase functions deploy api --no-verify-jwt
```

The function validates admin access itself using the Supabase Auth access token and the `ADMIN_EMAIL` secret. The Supabase service-role key stays server-side and must never be put in the website.

### 5. Configure the static website

In [`supabase-config.js`](./supabase-config.js), replace:

- `YOUR_PROJECT_REF` with the project reference from the Supabase project URL
- `YOUR_SUPABASE_ANON_KEY` with the project's public anon/publishable key from Dashboard → Project Settings → API

The anon key is designed to be public. Never put the service-role key in this file. Publish the updated website files, including `supabase-config.js`, `script.js`, and `admin.html`, to the existing static host. The home page now loads `script.js` instead of the old minified file.

### 6. Verify

Open this URL, replacing the project reference:

```text
https://YOUR_PROJECT_REF.supabase.co/functions/v1/api/health
```

It should return `{"success":true,...}`. Then test a booking, the contact/estimate forms, and admin sign-in at `/admin`. Attachments are stored in the private bucket and limited to 10 MB.

## Local development

Use Supabase CLI's local stack and run the SQL schema against its database:

```bash
supabase start
supabase db reset
supabase functions serve api --no-verify-jwt
```

For local browser testing, temporarily set `projectUrl` in `supabase-config.js` to `http://127.0.0.1:54321` and use the local anon key printed by `supabase start`. Add the local site origin to `SITE_ORIGINS`.

## Moving existing records

If existing records are available in `data/store.json`, configure `DATABASE_URL` in `.env` with the Supabase Postgres connection string and run:

```bash
npm install
npm run migrate:json
```

This imports JSON bookings and contacts while preserving their IDs. It does not move attachments from a previous host; new attachments go to Supabase Storage.

## AI discovery resources

- `https://electrotechbd.xyz/llms.txt` provides an AI-readable overview and links to key site sections.
- `https://electrotechbd.xyz/ai-catalog.json` publishes service and booking resources using the Agentic Resource Discovery (ARD) catalog format.

## Important

Do not commit `.env` or publish any Supabase service-role key. The frontend only needs the Supabase project URL and anon/publishable key.
