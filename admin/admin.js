(() => {
  const api = window.ElectroTechSupabase;
  const tokenKey = 'electrohub_admin_token';
  const userKey = 'electrohub_admin_user';
  const pageSize = 25;
  const tables = {
    bookings: {
      endpoint: 'bookings',
      fields: ['id', 'name', 'phone', 'service', 'visit_date', 'notes', 'location', 'status', 'file_name', 'created_at'],
      deletePath: id => `/bookings/${encodeURIComponent(id)}`,
      empty: 'No bookings found.'
    },
    contacts: {
      endpoint: 'contacts',
      fields: ['id', 'name', 'contact', 'message', 'created_at'],
      deletePath: id => `/contacts/${encodeURIComponent(id)}`,
      empty: 'No contacts found.'
    },
    ovijog: {
      endpoint: 'ovijog',
      fields: ['id', 'name', 'phone', 'area', 'type', 'details', 'is_anonymous', 'status', 'created_at'],
      deletePath: id => `/admin/ovijog/${encodeURIComponent(id)}`,
      statuses: ['pending', 'in-progress', 'solved'],
      empty: 'No complaints found.'
    },
    shop: {
      endpoint: 'shop_orders',
      fields: ['order_no', 'customer_name', 'phone', 'area', 'items', 'total', 'status', 'created_at'],
      deletePath: id => `/admin/shop_orders/${encodeURIComponent(id)}`,
      statuses: ['pending', 'archived'],
      empty: 'No shop orders found.'
    }
  };
  const pages = Object.fromEntries(Object.keys(tables).map(name => [name, 1]));
  const cache = Object.fromEntries(Object.keys(tables).map(name => [name, []]));
  const totals = Object.fromEntries(Object.keys(tables).map(name => [name, 0]));
  let shopFilter = 'all';

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
  }

  function currentToken() {
    return sessionStorage.getItem(tokenKey);
  }

  async function request(path, options = {}) {
    const headers = {
      ...api.headers(),
      ...(currentToken() ? { Authorization: `Bearer ${currentToken()}` } : {}),
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    };
    const response = await fetch(api.apiUrl(path), { ...options, headers });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.success === false) {
      if (response.status === 401) showLogin();
      throw new Error(result.message || `Request failed (${response.status}).`);
    }
    return result;
  }

  function showLogin() {
    sessionStorage.removeItem(tokenKey);
    sessionStorage.removeItem(userKey);
    document.getElementById('loginView').classList.remove('hidden');
    document.getElementById('adminView').classList.add('hidden');
  }

  function showAdmin(email) {
    document.getElementById('loginView').classList.add('hidden');
    document.getElementById('adminView').classList.remove('hidden');
    document.getElementById('userEmail').textContent = email;
    loadAll();
  }

  function setError(target, error) {
    const element = document.getElementById(target);
    element.textContent = `Error: ${error.message}`;
    element.classList.remove('notice');
  }

  async function loadTable(name, page = pages[name]) {
    const config = tables[name];
    pages[name] = page;
    const offset = (page - 1) * pageSize;
    const container = document.getElementById(`${name}Table`);
    container.textContent = 'Loading...';

    try {
      const result = await request(
        `/admin/${config.endpoint}?offset=${offset}&limit=${pageSize}`
      );
      cache[name] = Array.isArray(result.data) ? result.data : [];
      totals[name] = Number(result.total) || 0;
      document.getElementById(`stat${name === 'ovijog' ? 'Ovijog' : name === 'shop' ? 'Shop' : name[0].toUpperCase() + name.slice(1)}`).textContent = totals[name];
      document.getElementById(`${name}Info`).textContent =
        ` - ${totals[name] ? offset + 1 : 0}-${Math.min(offset + pageSize, totals[name])} of ${totals[name]}`;
      renderTable(name);
      renderPagination(name);
    } catch (error) {
      setError(`${name}Table`, error);
    }
  }

  function formatValue(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  function renderTable(name) {
    const config = tables[name];
    const search = document.getElementById(`search${name[0].toUpperCase() + name.slice(1)}`).value.trim().toLowerCase();
    const rows = cache[name].filter(row => {
      if (name === 'shop' && shopFilter !== 'all') {
        const status = row.status || 'pending';
        if (status !== shopFilter) return false;
      }
      return !search || JSON.stringify(row).toLowerCase().includes(search);
    });
    const container = document.getElementById(`${name}Table`);

    if (!rows.length) {
      container.innerHTML = `<p class="notice">${escapeHTML(config.empty)}</p>`;
      return;
    }

    const headers = config.fields.map(field => `<th>${escapeHTML(field)}</th>`).join('');
    const body = rows.map(row => {
      const cells = config.fields.map(field => {
        const value = formatValue(row[field]).slice(0, 1000);
        if (field === 'location') {
          const latitude = Number(row.latitude);
          const longitude = Number(row.longitude);
          if (row.latitude === null || row.latitude === undefined ||
            row.longitude === null || row.longitude === undefined ||
            !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
            latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return '<td>লোকেশন দেওয়া হয়নি</td>';
          }
          const coordinates = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
          return `<td><a class="map-link" href="${mapUrl}" target="_blank" rel="noopener noreferrer">ম্যাপে দেখুন</a><br><small>${escapeHTML(coordinates)}</small></td>`;
        }
        if (field === 'status' && config.statuses) {
          const options = config.statuses.map(status =>
            `<option value="${escapeHTML(status)}"${row.status === status ? ' selected' : ''}>${escapeHTML(status)}</option>`
          ).join('');
          return `<td><select data-status-for="${escapeHTML(row.id)}">${options}</select></td>`;
        }
        return `<td>${escapeHTML(value)}</td>`;
      }).join('');
      const id = escapeHTML(row.id);
      const statusAction = config.statuses
        ? `<button class="btn btn-green" type="button" data-action="status" data-id="${id}">Update</button>`
        : '';
      return `<tr>${cells}<td>${statusAction} <button class="btn btn-red" type="button" data-action="delete" data-id="${id}">Delete</button></td></tr>`;
    }).join('');
    container.innerHTML = `<div class="table-scroll" role="region" aria-label="${escapeHTML(name)} table" tabindex="0"><table><thead><tr>${headers}<th>Action</th></tr></thead><tbody>${body}</tbody></table></div>`;
  }

  function renderPagination(name) {
    const pageCount = Math.ceil(totals[name] / pageSize);
    const container = document.getElementById(`${name}Pagination`);
    if (pageCount <= 1) {
      container.replaceChildren();
      return;
    }
    const current = pages[name];
    const buttons = [];
    for (let page = 1; page <= pageCount; page += 1) {
      if (pageCount > 7 && page !== 1 && page !== pageCount && Math.abs(page - current) > 1) continue;
      buttons.push(`<button class="pag-btn${page === current ? ' active' : ''}" type="button" data-page="${page}">${page}</button>`);
    }
    container.innerHTML = buttons.join('');
  }

  async function loadAll() {
    await Promise.all(Object.keys(tables).map(name => loadTable(name, 1)));
  }

  document.getElementById('loginForm').addEventListener('submit', async event => {
    event.preventDefault();
    const button = document.getElementById('loginBtn');
    const error = document.getElementById('loginError');
    button.disabled = true;
    error.textContent = '';
    try {
      const result = await request('/admin/login', {
        method: 'POST',
        body: JSON.stringify({
          email: document.getElementById('email').value.trim(),
          password: document.getElementById('password').value
        })
      });
      sessionStorage.setItem(tokenKey, result.token);
      sessionStorage.setItem(userKey, result.username || '');
      showAdmin(result.username || '');
      document.getElementById('password').value = '';
    } catch (failure) {
      error.textContent = failure.message;
    } finally {
      button.disabled = false;
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
      if (currentToken()) await request('/admin/logout', { method: 'POST' });
    } catch (error) {
      console.error('Admin logout failed:', error);
    } finally {
      showLogin();
    }
  });

  document.querySelectorAll('.tab').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab === button));
      document.querySelectorAll('[id^="tab-"]').forEach(panel => panel.classList.add('hidden'));
      document.getElementById(`tab-${button.dataset.tab}`).classList.remove('hidden');
    });
  });

  document.querySelectorAll('.subtab').forEach(button => {
    button.addEventListener('click', () => {
      shopFilter = button.dataset.shop;
      document.querySelectorAll('.subtab').forEach(tab => tab.classList.toggle('active', tab === button));
      renderTable('shop');
    });
  });

  Object.keys(tables).forEach(name => {
    document.getElementById(`search${name[0].toUpperCase() + name.slice(1)}`)
      .addEventListener('input', () => renderTable(name));
    document.getElementById(`${name}Pagination`).addEventListener('click', event => {
      const button = event.target.closest('[data-page]');
      if (button) loadTable(name, Number(button.dataset.page));
    });
    document.getElementById(`${name}Table`).addEventListener('click', async event => {
      const button = event.target.closest('[data-action]');
      if (!button) return;
      const id = button.dataset.id;
      try {
        if (button.dataset.action === 'delete') {
          if (!window.confirm('Delete this entry?')) return;
          await request(tables[name].deletePath(id), { method: 'DELETE' });
        } else if (button.dataset.action === 'status') {
          const select = [...event.currentTarget.querySelectorAll('[data-status-for]')]
            .find(option => option.dataset.statusFor === id);
          if (!select) throw new Error('Status selector not found.');
          await request(`/admin/${tables[name].endpoint}/${encodeURIComponent(id)}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: select.value })
          });
        }
        await loadTable(name, pages[name]);
      } catch (error) {
        window.alert(error.message);
      }
    });
  });

  async function restoreSession() {
    const token = currentToken();
    if (!token) return showLogin();
    try {
      const result = await request('/admin/summary');
      showAdmin(sessionStorage.getItem(userKey) || '');
      document.getElementById('statBookings').textContent = result.data.totalBookings;
      document.getElementById('statContacts').textContent = result.data.totalContacts;
    } catch {
      showLogin();
    }
  }

  if (!api) {
    document.getElementById('loginError').textContent = 'Admin API configuration is missing.';
    return;
  }
  restoreSession();
})();
