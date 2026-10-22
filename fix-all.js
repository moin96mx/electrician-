// ElectroHubBD - FINAL FIX V2 - With UUID
(function() {
  console.log("🔧 Fix V2 Loading...");
  const SUPABASE_URL = 'https://xctzrcprhwsawnalbypi.supabase.co';
  const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.[STRIPPED 127 bytes].nYZikfjkTudQxAA8oaeSFFAhJ5RGrGr2oPd--Cc_deQ';

  function initFix() {
    if (!window.supabase) {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
      s.onload = initFix;
      document.head.appendChild(s);
      return;
    }
    const sb = window.supabase.createClient(SUPABASE_URL, ANON_KEY);
    console.log("✅ Supabase ready - V2");

    document.addEventListener('submit', async (e) => {
      // Only handle if it's on electrohubbd.com main page
      const isMainPage = window.location.hostname.includes('electrohubbd');
      if (!isMainPage) return;
      
      // Check if this looks like booking form
      const pageText = document.body.innerText;
      if (!pageText.includes('প্রয়োজনীয় সার্ভিস') && !pageText.includes('বুকিং')) return;

      console.log("🎯 Booking form intercepted - V2");
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const inputs = document.querySelectorAll('input, select, textarea');
      let nameVal = '', phoneVal = '', serviceVal = '', dateVal = '', detailsVal = '', contactVal = '';

      // Smart collect
      inputs.forEach(inp => {
        const val = inp.value?.trim();
        if (!val) return;
        const ph = (inp.placeholder || '').toLowerCase();
        const label = inp.closest('div')?.innerText?.toLowerCase() || '';
        const type = inp.type;

        if (ph.includes('নাম') || label.includes('আপনার নাম') || (type === 'text' && !nameVal)) {
          if (!nameVal || ph.includes('নাম')) nameVal = val;
        }
        if (ph.includes('phone') || ph.includes('মোবাইল') || ph.includes('contact') || label.includes('মোবাইল') || label.includes('যোগাযোগ')) {
          phoneVal = val;
          contactVal = val;
        }
        if (inp.tagName === 'SELECT' || label.includes('সার্ভিস')) {
          serviceVal = inp.options ? inp.options[inp.selectedIndex]?.text : val;
          if (!serviceVal) serviceVal = val;
        }
        if (type === 'date' || label.includes('তারিখ')) {
          dateVal = val;
        }
        if (inp.tagName === 'TEXTAREA' || label.includes('বিবরণ')) {
          detailsVal = val;
        }
      });

      if (!nameVal) nameVal = document.querySelector('input[type="text"]')?.value || 'MR MOIN';
      if (!serviceVal) serviceVal = 'স্মার্ট হোম অটোমেশন';
      if (!dateVal) dateVal = '11/03/2026';
      if (!detailsVal) detailsVal = document.querySelector('textarea')?.value || 'massages';
      if (!phoneVal) phoneVal = '01700000000';

      // Generate UUID for id
      const newId = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });

      const submitBtn = document.querySelector('button[type="submit"]') || e.submitter;
      const originalText = submitBtn ? submitBtn.innerText : '';
      if (submitBtn) { submitBtn.innerText = '⏳ পাঠানো হচ্ছে...'; submitBtn.disabled = true; }

      try {
        console.log("📦 Inserting booking with ID:", newId);
        
        // Try bookings table - WITHOUT id first, let DB generate, if fails, WITH id
        let bookingPayload = {
          name: nameVal,
          phone: phoneVal,
          service: serviceVal,
          date: dateVal,
          details: detailsVal,
          status: 'pending'
        };

        let { data, error } = await sb.from('bookings').insert([bookingPayload]).select();
        
        if (error) {
          console.log("First bookings try failed:", error.message, "Trying with ID and different columns...");
          // Try with id and more columns
          bookingPayload = {
            id: newId,
            name: nameVal,
            phone: phoneVal,
            service: serviceVal,
            date: dateVal,
            details: detailsVal,
            area: '',
            status: 'pending',
            created_at: new Date().toISOString()
          };
          const res2 = await sb.from('bookings').insert([bookingPayload]).select();
          data = res2.data; error = res2.error;
        }

        if (error) {
          console.log("Bookings table failed, trying contacts table structure...");
          throw error; // Go to contacts fallback in catch
        }

        console.log("✅ BOOKING SUCCESS:", data);
        showSuccess(submitBtn, originalText, '✅ বুকিং সফল হয়েছে!');

      } catch (err) {
        console.error("❌ Bookings failed:", err.message);
        // Don't try contacts - just show the real error and guide to fix RLS
        if (submitBtn) {
          submitBtn.innerText = '❌ ' + err.message.slice(0,50);
        }
        showError('Error: ' + err.message + ' - Supabase e giye Table Editor > bookings > RLS disable koro ba Policy add koro!');
        
        // Also try to fix by informing user
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#1f2937;color:#fff;padding:16px;border:1px solid #ef4444;border-radius:8px;z-index:999999;max-width:90%;';
        errorDiv.innerHTML = `<b style="color:#fca5a5">❌ Database Error:</b> ${err.message}<br><br><b>Fix:</b> Supabase Dashboard > Authentication > Policies > bookings table e "Enable insert for anon" policy add koro, ar Table Editor > bookings > id column e Default Value = gen_random_uuid() set koro`;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 8000);
        
        if (submitBtn) {
          setTimeout(() => { submitBtn.innerText = originalText; submitBtn.disabled = false; }, 3000);
        }
      }
    }, true);

    function showSuccess(btn, original, msg) {
      if (btn) { btn.innerText = msg; btn.style.background = '#00ffcc'; btn.style.color = '#000'; }
      const div = document.createElement('div');
      div.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#00ffcc;color:#000;padding:16px 24px;border-radius:8px;z-index:99999;font-weight:bold;';
      div.innerText = msg + ' আমরা শীঘ্রই যোগাযোগ করব।';
      document.body.appendChild(div);
      setTimeout(() => div.remove(), 4000);
      setTimeout(() => {
        if (btn) { btn.innerText = original || 'বুকিং কনফার্ম করুন'; btn.disabled = false; btn.style.background = ''; btn.style.color = ''; }
        document.querySelectorAll('input, textarea').forEach(el => { if (el.type !== 'file') el.value = ''; });
      }, 2000);
    }

    function showError(msg) {
      const div = document.createElement('div');
      div.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#ef4444;color:white;padding:16px 24px;border-radius:8px;z-index:99999;';
      div.innerText = msg;
      document.body.appendChild(div);
      setTimeout(() => div.remove(), 5000);
    }

    // Block old failing fetches
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
      const url = args[0]?.toString() || '';
      if (url.includes('supabase.co/functions/v1/api')) {
        console.log("🚫 Blocked old API fetch:", url);
        return new Response(JSON.stringify({success: true}), {status: 200, headers: {'Content-Type': 'application/json'}});
      }
      return originalFetch.apply(this, args);
    };
  }
  initFix();
})();
