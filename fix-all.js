// ElectroHubBD - TRIPLE ROUTER - Bookings / Contacts / Ovijog alada
(function(){
  const URL = 'https://xctzrcprhwsawnalbypi.supabase.co';
  const KEY = 'sb_publishable_hAkwDSANcb2xURtd3UKqHg_l0iUMOts';
  
  function init(){
    if(!window.supabase){
      const s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
      s.onload=init; document.head.appendChild(s); return;
    }
    const sb = window.supabase.createClient(window.SUPABASE_URL||URL, window.SUPABASE_ANON_KEY||KEY);
    console.log('✅ Triple Router Ready');

    function genID(prefix){ return '#'+prefix+'-'+Math.random().toString(36).substr(2,6).toUpperCase(); }
    function today(){ return new Date().toISOString().split('T')[0]; }
    function parseDate(v){ try{ const d=new Date(v); if(!isNaN(d) && d.getFullYear()>2000&&d.getFullYear()<2100) return d.toISOString().split('T')[0]; }catch(e){} return today(); }

    document.addEventListener('submit', async (e)=>{
      const form = e.target;
      if(!form || form.tagName!=='FORM') return;
      const btn = form.querySelector('button[type="submit"]');
      if(!btn) return;

      // Detect form type
      const html = (form.innerHTML + ' ' + form.id + ' ' + form.className).toLowerCase();
      const bodyText = document.activeElement?.form ? '' : '';
      
      // Find fields
      let nameV='', phoneV='', emailV='', serviceV='', visitDateV='', messageV='', detailsV='';
      const inputs = form.querySelectorAll('input, select, textarea');
      
      inputs.forEach(inp=>{
        const v=(inp.value||'').trim(); if(!v) return;
        const id=(inp.id||'').toLowerCase(); const name=(inp.name||'').toLowerCase();
        const ph=(inp.placeholder||'').toLowerCase(); const type=inp.type;
        
        if(type==='email' || id.includes('email') || name.includes('email')) emailV=v;
        if((type==='tel' || ph.includes('মোবাইল') || ph.includes('phone') || id.includes('phone') || id.includes('mobile'))) phoneV=v;
        if(ph.includes('নাম') || id.includes('name')) nameV=v;
        if(type==='date' || id.includes('visit') || id.includes('date')) visitDateV=v;
        if(inp.tagName==='SELECT') serviceV=inp.selectedOptions[0]?.text||inp.value;
        if(inp.tagName==='TEXTAREA') messageV=v;
      });

      // Fallbacks
      const textInputs=[...form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]')];
      // Heuristic for name
      if(!nameV){
        for(let inp of textInputs){ if(inp.value && !inp.value.includes('@') && isNaN(inp.value)){ nameV=inp.value; break; } }
      }
      if(!emailV){
        for(let inp of textInputs){ if(inp.value && inp.value.includes('@')){ emailV=inp.value; break; } }
      }
      if(!phoneV){
        for(let inp of textInputs){ if(inp.value && /^\d{10,11}$/.test(inp.value.replace(/\D/g,''))){ phoneV=inp.value; break; } }
      }

      // DECIDE TABLE
      let table = 'bookings';
      let payload = {};
      
      // If form has email but NO service select and NO visit date -> CONTACTS
      const hasServiceSelect = !!form.querySelector('select');
      const hasVisitDate = !!form.querySelector('input[type="date"]');
      
      if(emailV && !hasServiceSelect && !hasVisitDate){
        table = 'contacts';
        payload = {
          id: genID('CON'),
          name: nameV || emailV.split('@')[0] || 'Customer',
          email: emailV,
          phone: phoneV || '01700000000',
          message: messageV || detailsV || 'Contact enquiry'
        };
      } 
      // If has complain/ovijog keyword -> OVIJOG
      else if(html.includes('ovijog') || html.includes('অভিযোগ') || html.includes('complaint') || form.id.toLowerCase().includes('ovijog')){
        table = 'ovijog';
        payload = {
          id: genID('OVI'),
          name: nameV || 'Customer',
          phone: phoneV || '01700000000',
          email: emailV || '',
          details: messageV || detailsV || serviceV || 'Ovijog',
          status: 'pending',
          created_at: new Date().toISOString()
        };
      }
      // Else -> BOOKINGS (main)
      else {
        table = 'bookings';
        if(!nameV) nameV='MR MOIN';
        if(!phoneV) phoneV='01700000000';
        if(!serviceV) serviceV='Residential Wiring';
        visitDateV=parseDate(visitDateV);
        
        payload = {
          id: genID('ENG'),
          name: nameV.trim(),
          phone: phoneV.trim(),
          service: serviceV.trim(),
          visit_date: visitDateV
        };
      }

      // Only handle if we detected a known form
      if(table==='bookings' && !hasServiceSelect && !form.innerHTML.toLowerCase().includes('প্রয়োজনীয় সার্ভিস') && !form.closest('#booking')) {
        // Not booking form, skip if we mis-detected
        if(!emailV || hasServiceSelect) { /* allow */ } else { return; }
      }

      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      
      const orig=btn.innerText; btn.innerText='⏳ পাঠানো হচ্ছে...'; btn.disabled=true;
      
      try{
        console.log(`📦 Inserting to ${table}:`, payload);
        const {data, error}=await sb.from(table).insert([payload]).select();
        if(error) throw error;
        
        btn.innerText='✅ সফল হয়েছে!'; btn.style.background='#00ffcc'; btn.style.color='#000';
        const ok=document.createElement('div');
        ok.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#00ffcc;color:#000;padding:16px 28px;border-radius:12px;z-index:999999;font-weight:900;';
        ok.innerText=`✅ ${table.toUpperCase()} সফল!`;
        document.body.appendChild(ok);
        setTimeout(()=>ok.remove(),4000);
        setTimeout(()=>{btn.innerText=orig; btn.disabled=false; btn.style.background=''; form.reset();},2000);
      }catch(err){
        console.error('❌', table, err);
        // If contacts fails due to schema, try bookings as fallback for debug
        btn.innerText='❌ '+err.message.slice(0,50);
        setTimeout(()=>{btn.innerText=orig; btn.disabled=false;},4000);
      }
    }, true);
  }
  init();
})();
