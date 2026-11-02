import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const adminEmail = Deno.env.get('ADMIN_EMAIL')?.trim().toLowerCase();
const adminPhone = Deno.env.get('WHATSAPP_ADMIN_NUMBER')?.replace(/\s+/g, '');
const whatsappPhoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
const whatsappToken = Deno.env.get('WHATSAPP_TOKEN');
const allowedOrigins = (Deno.env.get('SITE_ORIGINS') ||
  'https://electrohubbd.com,https://www.electrohubbd.com,http://localhost:5500,http://127.0.0.1:5500')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const maxUploadBytes = 10 * 1024 * 1024;
const allowedFileTypes: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.dwg': 'application/octet-stream',
};
const fileBucket = 'booking-files';
const shopProducts: Record<number, { name: string; price: number }> = {
  1: { name: 'ABB MCB 32A Single Pole - Original', price: 1850 },
  2: { name: 'ABB MCB 63A Double Pole - Main Switch', price: 2950 },
  3: { name: 'ABB RCCB 40A - Safety Breaker', price: 4450 },
  4: { name: 'BRB Cable 2.5rm - 100m Coil (Original)', price: 8500 },
  5: { name: 'BRB Cable 1.5rm - 100m Coil', price: 5900 },
  6: { name: 'BRB Cable 4.0rm - 100m Coil - AC Line', price: 12500 },
  7: { name: 'Havells Ceiling Fan 56" - Premium Copper', price: 3200 },
  8: { name: 'Havells Switch + Socket Combo - 4 Gang', price: 1450 },
  9: { name: 'Havells LED Batten 20W - Bright White', price: 1150 },
  10: { name: 'Walton LED TV 32" Smart - Official', price: 28500 },
  11: { name: 'Walton Refrigerator 12 CFT - Inverter', price: 42500 },
  12: { name: 'Walton Washing Machine 7kg - Top Load', price: 24500 },
  13: { name: 'SSG LED Panel Light 18W - Cool White', price: 950 },
  14: { name: 'SSG Gang Switch 3 Pin Socket - White', price: 650 },
  15: { name: 'SSG LED Bulb 15W - Pack of 2', price: 550 },
  16: { name: 'Vision Rice Cooker 2.8L - Non Stick', price: 2950 },
  17: { name: 'Vision LED Bulb 12W - Pack of 4', price: 750 },
  18: { name: 'Vision Electric Kettle 1.7L - Steel', price: 1850 },
  19: { name: 'Singer Stand Fan 16" - High Speed', price: 3650 },
  20: { name: 'Singer Iron - Steam Iron 1200W', price: 2250 },
  21: { name: 'Singer Table Fan 12" - Low Noise', price: 2450 },
  22: { name: 'Energypac IPS 1000VA - Pure Sine Wave', price: 18500 },
  23: { name: 'Energypac Stabilizer 1000VA - AC Safety', price: 6850 },
  24: { name: 'Energypac Generator 3KW - Petrol', price: 48500 },
};

if (!supabaseUrl || !anonKey || !serviceRoleKey) {
  throw new Error('Supabase URL, anon key, and service role key must be configured.');
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const publicClient = createClient(supabaseUrl, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type BookingRow = {
  id: string;
  name: string;
  phone: string;
  service: string;
  visit_date: string;
  notes: string;
  status: string;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  file_path: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
};

function responseHeaders(origin: string | null): HeadersInit {
  const allowedOrigin = origin && allowedOrigins.includes(origin) ? origin : 'null';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  headers: HeadersInit,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...Object.fromEntries(new Headers(headers)), 'Content-Type': 'application/json' },
  });
}

function failure(message: string, status: number, headers: HeadersInit): Response {
  return jsonResponse({ success: false, message }, status, headers);
}

function throwIfError(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

function mapBooking(row: BookingRow) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    service: row.service,
    date: row.visit_date,
    notes: row.notes,
    status: row.status,
    attachment: row.file_name
      ? { name: row.file_name, type: row.file_type, size: row.file_size }
      : null,
    location: row.latitude !== null && row.longitude !== null
      ? { latitude: row.latitude, longitude: row.longitude }
      : null,
    createdAt: row.created_at,
  };
}

function mapContact(row: {
  id: string;
  name: string;
  contact: string;
  message: string;
  created_at: string;
}) {
  return {
    id: row.id,
    name: row.name,
    contact: row.contact,
    message: row.message,
    createdAt: row.created_at,
  };
}

function newId(prefix: 'ENG' | 'CNT'): string {
  return `#${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

async function requireAdmin(request: Request): Promise<boolean> {
  if (!adminEmail) throw new Error('ADMIN_EMAIL secret is not configured.');
  const authorization = request.headers.get('Authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) return false;

  const { data, error } = await adminClient.auth.getUser(token);
  if (error || !data.user || data.user.email?.toLowerCase() !== adminEmail) return false;
  return true;
}

async function sendWhatsAppNotification(message: string): Promise<void> {
  if (!adminPhone) return;
  if (!whatsappPhoneNumberId || !whatsappToken) {
    console.info('WhatsApp notification not sent: Meta API credentials are not configured.');
    return;
  }

  const response = await fetch(
    `https://graph.facebook.com/v18.0/${whatsappPhoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${whatsappToken}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: adminPhone,
        type: 'text',
        text: { body: message },
      }),
    },
  );

  if (!response.ok) {
    console.error('WhatsApp notification failed:', await response.text());
  }
}

async function handleRequest(request: Request, headers: HeadersInit): Promise<Response> {
  const url = new URL(request.url);
  const route = url.pathname.replace(/^\/functions\/v1\/api/, '').replace(/^\/api(?=\/|$)/, '') || '/';
  const method = request.method;

  if (method === 'GET' && route === '/health') {
    const { error } = await adminClient.from('bookings').select('id', { head: true, count: 'exact' });
    throwIfError(error);
    return jsonResponse({ success: true, message: 'Supabase backend is running' }, 200, headers);
  }

  if (method === 'POST' && route === '/admin/login') {
    if (!adminEmail) throw new Error('ADMIN_EMAIL secret is not configured.');
    const { email, password } = await request.json();
    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return failure('Email and password are required.', 400, headers);
    }
    if (email.trim().toLowerCase() !== adminEmail) {
      return failure('Invalid email or password.', 401, headers);
    }

    const { data, error } = await publicClient.auth.signInWithPassword({
      email: adminEmail,
      password,
    });
    if (error || !data.session) return failure('Invalid email or password.', 401, headers);

    return jsonResponse({
      success: true,
      token: data.session.access_token,
      username: data.user.email,
      expiresAt: data.session.expires_at,
    }, 200, headers);
  }

  if (method === 'POST' && route === '/admin/logout') {
    if (!(await requireAdmin(request))) return failure('Unauthorized.', 401, headers);
    const token = (request.headers.get('Authorization') || '').slice('Bearer '.length);
    const { error } = await adminClient.auth.admin.signOut(token, 'local');
    throwIfError(error);
    return jsonResponse({ success: true, message: 'Signed out.' }, 200, headers);
  }

  const publicSubmission = method === 'POST' && (route === '/bookings' || route === '/contact');
  const publicRoute = (method === 'GET' && route === '/health') ||
    (method === 'POST' && route === '/admin/login') ||
    publicSubmission ||
    (method === 'POST' && route === '/bookings/upload-url') ||
    (method === 'POST' && (route === '/ovijog' || route === '/shop-orders'));
  if (!publicRoute && !(await requireAdmin(request))) {
    return failure('Unauthorized.', 401, headers);
  }

  const adminTableMatch = route.match(/^\/admin\/(bookings|contacts|ovijog|shop_orders)$/);
  if (method === 'GET' && adminTableMatch) {
    const offset = Number(url.searchParams.get('offset') || 0);
    const limit = Number(url.searchParams.get('limit') || 25);
    if (!Number.isSafeInteger(offset) || offset < 0 ||
      !Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
      return failure('A valid offset and limit (1-100) are required.', 400, headers);
    }

    const { data, count, error } = await adminClient
      .from(adminTableMatch[1])
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    throwIfError(error);
    return jsonResponse({
      success: true,
      data: data || [],
      total: count || 0,
    }, 200, headers);
  }

  if (method === 'GET' && route === '/admin/entries') {
    const [bookings, contacts] = await Promise.all([
      adminClient.from('bookings').select('*').order('created_at', { ascending: false }),
      adminClient.from('contacts').select('*').order('created_at', { ascending: false }),
    ]);
    throwIfError(bookings.error);
    throwIfError(contacts.error);
    return jsonResponse({
      success: true,
      data: {
        bookings: (bookings.data || []).map((row) => mapBooking(row as BookingRow)),
        contacts: (contacts.data || []).map(mapContact),
      },
    }, 200, headers);
  }

  if (method === 'GET' && route === '/admin/summary') {
    const [allBookings, pendingBookings, allContacts, latest] = await Promise.all([
      adminClient.from('bookings').select('id', { count: 'exact', head: true }),
      adminClient.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      adminClient.from('contacts').select('id', { count: 'exact', head: true }),
      adminClient.from('bookings').select('*').order('created_at', { ascending: false }).limit(5),
    ]);
    throwIfError(allBookings.error);
    throwIfError(pendingBookings.error);
    throwIfError(allContacts.error);
    throwIfError(latest.error);
    return jsonResponse({
      success: true,
      data: {
        totalBookings: allBookings.count || 0,
        totalContacts: allContacts.count || 0,
        pending: pendingBookings.count || 0,
        latest: (latest.data || []).map((row) => mapBooking(row as BookingRow)),
      },
    }, 200, headers);
  }

  if (method === 'POST' && route === '/bookings/upload-url') {
    const { fileName: submittedName, fileSize } = await request.json();
    if (typeof submittedName !== 'string' || !Number.isInteger(fileSize) ||
      fileSize <= 0 || fileSize > maxUploadBytes) {
      return failure('A valid attachment filename and size (up to 10 MB) are required.', 400, headers);
    }
    const fileName = submittedName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const extension = fileName.match(/\.[^.]+$/)?.[0]?.toLowerCase() || '';
    if (!Object.hasOwn(allowedFileTypes, extension)) {
      return failure('Attachment must be PDF, PNG, JPG, JPEG, or DWG.', 400, headers);
    }
    if (fileName.length > 255) return failure('Attachment filename is too long.', 400, headers);

    const filePath = `${crypto.randomUUID()}/${fileName}`;
    const signedUpload = await adminClient.storage.from(fileBucket).createSignedUploadUrl(filePath);
    throwIfError(signedUpload.error);
    return jsonResponse({
      success: true,
      data: {
        path: signedUpload.data.path,
        token: signedUpload.data.token,
        fileName,
        fileSize,
        fileType: allowedFileTypes[extension],
      },
    }, 200, headers);
  }

  if (method === 'POST' && route === '/bookings') {
    const { name: submittedName, phone: submittedPhone, service: submittedService,
      date: submittedDate, notes: submittedNotes, attachment, location } = await request.json();
    const name = String(submittedName || '').trim();
    const phone = String(submittedPhone || '').trim();
    const service = String(submittedService || '').trim();
    const date = String(submittedDate || '').trim();
    const notes = String(submittedNotes || '').trim();

    if (!name || !phone || !service || !date) {
      return failure('Name, phone, service, and date are required.', 400, headers);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
      return failure('A valid visit date is required.', 400, headers);
    }
    if (name.length > 200 || phone.length > 40 || service.length > 200 || notes.length > 5000) {
      return failure('One or more fields exceed the allowed length.', 400, headers);
    }
    let latitude: number | null = null;
    let longitude: number | null = null;
    if (location !== undefined && location !== null) {
      if (typeof location !== 'object' ||
        typeof location.latitude !== 'number' || !Number.isFinite(location.latitude) ||
        typeof location.longitude !== 'number' || !Number.isFinite(location.longitude) ||
        location.latitude < -90 || location.latitude > 90 ||
        location.longitude < -180 || location.longitude > 180) {
        return failure('A valid map location is required when location is provided.', 400, headers);
      }
      latitude = location.latitude;
      longitude = location.longitude;
    }

    const id = newId('ENG');
    let filePath: string | null = null;
    let fileName: string | null = null;
    let fileType: string | null = null;
    let fileSize: number | null = null;

    if (attachment) {
      if (typeof attachment.path !== 'string' || typeof attachment.fileName !== 'string' ||
        !Number.isInteger(attachment.fileSize) || attachment.fileSize <= 0 ||
        attachment.fileSize > maxUploadBytes) {
        return failure('Attachment metadata is invalid.', 400, headers);
      }
      const attachmentParts = attachment.path.split('/');
      if (attachmentParts.length !== 2 || !/^[\da-f-]{36}$/i.test(attachmentParts[0])) {
        return failure('Attachment upload could not be verified.', 400, headers);
      }
      fileName = attachment.fileName;
      const extension = fileName.match(/\.[^.]+$/)?.[0]?.toLowerCase() || '';
      if (!Object.hasOwn(allowedFileTypes, extension) ||
        fileName.length > 255 ||
        fileName !== fileName.replace(/[^a-zA-Z0-9._-]/g, '_') ||
        attachmentParts[1] !== fileName) {
        return failure('Attachment filename is invalid.', 400, headers);
      }
      filePath = attachment.path;
      fileType = allowedFileTypes[extension];
      fileSize = attachment.fileSize;
      const uploadedFiles = await adminClient.storage.from(fileBucket)
        .list(attachmentParts[0], { limit: 10 });
      throwIfError(uploadedFiles.error);
      const uploadedFile = uploadedFiles.data.find((file) => file.name === fileName);
      if (!uploadedFile || Number(uploadedFile.metadata?.size) !== fileSize) {
        return failure('Attachment upload could not be verified.', 400, headers);
      }
    }

    const inserted = await adminClient.from('bookings').insert({
      id,
      name,
      phone,
      service,
      visit_date: date,
      notes,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
      file_path: filePath,
      latitude,
      longitude,
    }).select('*').single();

    if (inserted.error) {
      if (filePath) {
        const cleanup = await adminClient.storage.from(fileBucket).remove([filePath]);
        if (cleanup.error) console.error('Could not clean up booking attachment:', cleanup.error.message);
      }
      throw new Error(inserted.error.message);
    }

    const booking = mapBooking(inserted.data as BookingRow);
    try {
      const locationLink = latitude !== null && longitude !== null
        ? `\n📍 অবস্থান: https://www.google.com/maps?q=${latitude},${longitude}`
        : '';
      await sendWhatsAppNotification(
        `✅ নতুন বুকিং: ${booking.name}\n📞 ${booking.phone}\n🛠️ ${booking.service}\n📅 ${booking.date}\n📝 ${booking.notes || 'No notes'}${locationLink}`,
      );
    } catch (error) {
      console.error('WhatsApp notification request failed:', error);
    }
    return jsonResponse({
      success: true,
      message: 'Booking received successfully.',
      data: booking,
    }, 201, headers);
  }

  if (method === 'POST' && route === '/contact') {
    const { name, contact, message } = await request.json();
    if (typeof contact !== 'string' || !contact.trim()) {
      return failure('Contact info is required.', 400, headers);
    }
    if (contact.length > 200 || String(name || '').length > 200 || String(message || '').length > 5000) {
      return failure('One or more fields exceed the allowed length.', 400, headers);
    }
    const inserted = await adminClient.from('contacts').insert({
      id: newId('CNT'),
      name: String(name || 'Guest').trim(),
      contact: contact.trim(),
      message: String(message || '').trim(),
    }).select('*').single();
    throwIfError(inserted.error);
    return jsonResponse({
      success: true,
      message: 'Contact information saved successfully.',
      data: mapContact(inserted.data),
    }, 201, headers);
  }

  if (method === 'POST' && route === '/ovijog') {
    const input = await request.json();
    const name = typeof input.name === 'string' ? input.name.trim() : '';
    const phone = typeof input.phone === 'string' ? input.phone.trim() : '';
    const area = typeof input.area === 'string' ? input.area.trim() : '';
    const type = typeof input.type === 'string' ? input.type.trim() : '';
    const details = typeof input.details === 'string' ? input.details.trim() : '';

    if (!name || !phone || !area || !type || !details ||
      name.length > 200 || phone.length > 40 || area.length > 200 ||
      type.length > 200 || details.length > 5000 ||
      (input.is_anonymous !== undefined && typeof input.is_anonymous !== 'boolean')) {
      return failure('Valid complaint details are required.', 400, headers);
    }

    const inserted = await adminClient.from('ovijog').insert({
      name: input.is_anonymous === true ? 'Anonymous' : name,
      phone,
      area,
      type,
      details,
      is_anonymous: input.is_anonymous === true,
      status: 'pending',
    }).select('id').single();
    throwIfError(inserted.error);
    return jsonResponse({
      success: true,
      message: 'Complaint received successfully.',
      data: { id: inserted.data.id },
    }, 201, headers);
  }

  if (method === 'POST' && route === '/shop-orders') {
    const input = await request.json();
    const customerName = typeof input.customerName === 'string' ? input.customerName.trim() : '';
    const phone = typeof input.phone === 'string' ? input.phone.trim() : '';
    const area = typeof input.area === 'string' ? input.area.trim() : '';
    if (!customerName || !phone || !area || customerName.length > 200 ||
      phone.length > 40 || area.length > 300 || !Array.isArray(input.items) ||
      input.items.length < 1 || input.items.length > 50) {
      return failure('Valid customer details and order items are required.', 400, headers);
    }

    const items: Array<{ id: number; pid: string; name: string; price: number; qty: number }> = [];
    for (const item of input.items) {
      const id = Number(item?.id);
      const qty = Number(item?.qty);
      const product = shopProducts[id];
      if (!Number.isSafeInteger(id) || !product ||
        !Number.isSafeInteger(qty) || qty < 1 || qty > 100 ||
        (item?.name !== undefined &&
          (typeof item.name !== 'string' || item.name.length > 200))) {
        return failure('One or more order items are invalid.', 400, headers);
      }
      items.push({
        id,
        pid: `#P-${id}`,
        name: product.name,
        price: product.price,
        qty,
      });
    }

    const total = items.reduce((sum, item) => sum + item.price * item.qty, 0) + 120;
    const orderNo = `#EH-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const inserted = await adminClient.from('shop_orders').insert({
      order_no: orderNo,
      customer_name: customerName,
      phone,
      area,
      items,
      total,
      status: 'pending',
    }).select('id, order_no').single();
    throwIfError(inserted.error);
    return jsonResponse({
      success: true,
      message: 'Order received successfully.',
      data: { id: inserted.data.id, orderNo: inserted.data.order_no, total },
    }, 201, headers);
  }

  const adminStatusMatch = route.match(/^\/admin\/(ovijog|shop_orders)\/([^/]+)\/status$/);
  if (method === 'PATCH' && adminStatusMatch) {
    const { status } = await request.json();
    const allowedStatuses = adminStatusMatch[1] === 'ovijog'
      ? ['pending', 'in-progress', 'solved']
      : ['pending', 'archived'];
    if (typeof status !== 'string' || !allowedStatuses.includes(status)) {
      return failure('Invalid status value.', 400, headers);
    }
    const updated = await adminClient.from(adminStatusMatch[1])
      .update({ status })
      .eq('id', decodeURIComponent(adminStatusMatch[2]))
      .select('id')
      .maybeSingle();
    throwIfError(updated.error);
    if (!updated.data) return failure('Entry not found.', 404, headers);
    return jsonResponse({ success: true, message: 'Status updated.' }, 200, headers);
  }

  const adminDeleteMatch = route.match(/^\/admin\/(ovijog|shop_orders)\/([^/]+)$/);
  if (method === 'DELETE' && adminDeleteMatch) {
    const removed = await adminClient.from(adminDeleteMatch[1])
      .delete()
      .eq('id', decodeURIComponent(adminDeleteMatch[2]))
      .select('id')
      .maybeSingle();
    throwIfError(removed.error);
    if (!removed.data) return failure('Entry not found.', 404, headers);
    return jsonResponse({ success: true, message: 'Entry deleted.' }, 200, headers);
  }

  const bookingStatusMatch = route.match(/^\/bookings\/([^/]+)\/status$/);
  if (method === 'PATCH' && bookingStatusMatch) {
    const { status } = await request.json();
    const validStatuses = ['new', 'contacted', 'in-progress', 'done', 'cancelled'];
    if (!validStatuses.includes(status)) return failure('Invalid status value.', 400, headers);
    const updated = await adminClient.from('bookings').update({ status })
      .eq('id', decodeURIComponent(bookingStatusMatch[1])).select('*').maybeSingle();
    throwIfError(updated.error);
    if (!updated.data) return failure('Booking not found.', 404, headers);
    return jsonResponse({
      success: true,
      message: 'Booking status updated.',
      data: mapBooking(updated.data as BookingRow),
    }, 200, headers);
  }

  const bookingFileMatch = route.match(/^\/bookings\/([^/]+)\/file$/);
  if (method === 'GET' && bookingFileMatch) {
    const booking = await adminClient.from('bookings').select('file_path, file_name, file_type')
      .eq('id', decodeURIComponent(bookingFileMatch[1])).maybeSingle();
    throwIfError(booking.error);
    if (!booking.data?.file_path) return failure('Attachment not found.', 404, headers);
    const downloaded = await adminClient.storage.from(fileBucket).download(booking.data.file_path);
    throwIfError(downloaded.error);
    const safeFileName = (booking.data.file_name || 'attachment').replace(/["\r\n]/g, '_');
    return new Response(downloaded.data, {
      status: 200,
      headers: {
        ...Object.fromEntries(new Headers(headers)),
        'Content-Type': booking.data.file_type || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${safeFileName}"`,
      },
    });
  }

  const bookingMatch = route.match(/^\/bookings\/([^/]+)$/);
  if (method === 'DELETE' && bookingMatch) {
    const id = decodeURIComponent(bookingMatch[1]);
    const existing = await adminClient.from('bookings').select('file_path').eq('id', id).maybeSingle();
    throwIfError(existing.error);
    if (!existing.data) return failure('Booking not found.', 404, headers);
    if (existing.data.file_path) {
      const removedFile = await adminClient.storage.from(fileBucket).remove([existing.data.file_path]);
      throwIfError(removedFile.error);
    }
    const removed = await adminClient.from('bookings').delete().eq('id', id).select('id').maybeSingle();
    throwIfError(removed.error);
    if (!removed.data) return failure('Booking not found.', 404, headers);
    return jsonResponse({ success: true, message: 'Booking deleted.' }, 200, headers);
  }

  const contactMatch = route.match(/^\/contacts\/([^/]+)$/);
  if (method === 'DELETE' && contactMatch) {
    const removed = await adminClient.from('contacts').delete()
      .eq('id', decodeURIComponent(contactMatch[1])).select('id').maybeSingle();
    throwIfError(removed.error);
    if (!removed.data) return failure('Contact not found.', 404, headers);
    return jsonResponse({ success: true, message: 'Contact deleted.' }, 200, headers);
  }

  return failure('Not found.', 404, headers);
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get('Origin');
  const headers = responseHeaders(origin);

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (origin && !allowedOrigins.includes(origin)) return failure('Origin not allowed.', 403, headers);

  try {
    return await handleRequest(request, headers);
  } catch (error) {
    console.error('Supabase API request failed:', error);
    return failure('Server error. Please try again later.', 500, headers);
  }
});
