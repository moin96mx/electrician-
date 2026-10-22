// ElectroHubBD - ULTRA STRICT ROUTER v2 - Email check
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
    console.log('✅ ULTRA STRICT Router Ready');

    function genID(prefix){ return '#'+prefix+'-'+Math.random().toString(36).substr(2,6).toUpperCase(); }
    function today(){ return new Date().toISOString().split('T')[0]; }

    document.addEventListener('submit', async (e)=>{
      const form = e.target;
      if(!form || form.tagName!=='FORM') return;
      const btn = form.querySelector('button[type="submit"]');
      if(!btn) return;

      // Collect all values
      let allValues = [];
      form.querySelectorAll('input, select, textarea').forEach(inp=>{ if(inp.value) allValues.push(inp.value.trim()); });
      const combined = allValues.join(' ').toLowerCase();
      
      let nameV='', phoneV='', emailV='', serviceV='', visitDateV='', messageV='';
      
      form.querySelectorAll('input, select, textarea').forEach(inp=>{
        const v=(inp.value||'').trim(); if(!v) return;
        const id=(inp.id||'').toLowerCase(); const name=(inp.name||'').toLowerCase(); const ph=(inp.placeholder||'').toLowerCase(); const type=inp.type;
        if(type==='email' || v.includes('@')) emailV=v;
        if(type==='tel' || ph.includes('মোবাইল') || ph.includes('phone') || id.includes('phone') || id.includes('mobile') || /^01\d{9}$/.test(v.replace(/\D/g,''))) phoneV=v;
        if(!nameV && (ph.includes('নাম') || id.includes('name') || name.includes('name'))) nameV=v;
        if(inp.tagName==='SELECT') serviceV=inp.selectedOptions[0]?.text||v;
        if(inp.tagName==='TEXTAREA') messageV=v;
        if(type==='date') visitDateV=v;
      });

      // If name still empty, first non-email text
      if(!nameV){
        for(let v of allValues){ if(v && !v.includes('@') && isNaN(v) && v.length<50){ nameV=v; break; } }
      }

      // ULTRA STRICT DECISION: If email present AND name is email OR name contains @ -> CONTACTS
      let table='bookings';
      if(emailV || (nameV && nameV.includes('@'))){
        // Check if this is really contact form: if name is email OR combined has email but no service keyword
        const hasService = combined.includes('wiring') || combined.includes('residential') || combined.includes('service') || form.querySelector('select');
        const nameIsEmail = nameV && nameV.includes('@');
        
        if(nameIsEmail || (emailV && !hasService)){
          table='contacts';
        }
      }

      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      const orig=btn.innerText; btn.innerText='⏳ পাঠানো হচ্ছে...'; btn.disabled=true;

      try{
        let payload;
        if(table==='contacts'){
          payload={
            name: (nameV && !nameV.includes('@')) ? nameV : (emailV ? emailV.split('@')[0] : 'Customer'),
            email: emailV || nameV, // nameV may actually be email
            phone: phoneV || '01700000000',
            message: messageV || 'Contact enquiry from website'
          };
          // Try with id if needed
          try{
            payload.id=genID('CON');
            const {error}=await sb.from('contacts').insert([payload]).select();
            if(error) throw error;
          }catch(err){
            // If id column doesn't exist, retry without id
            delete payload.id;
            const {error}=await sb.from('contacts').insert([payload]).select();
            if(error) throw error;
          }
        } else {
          // Bookings
          if(!nameV) nameV='Customer';
          if(nameV.includes('@')) nameV='Customer'; // Don't allow email as name in bookings
          if(!phoneV) phoneV='01700000000';
          if(!serviceV) serviceV='Residential Wiring';
          if(!visitDateV) visitDateV=today();
          else { try{ visitDateV=new Date(visitDateV).toISOString().split('T')[0]; }catch(e){ visitDateV=today(); } }
          
          payload={
            id: genID('ENG'),
            name: nameV,
            phone: phoneV,
            service: serviceV,
            visit_date: visitDateV
          };
          const {error}=await sb.from('bookings').insert([payload]).select();
          if(error) throw error;
        }
        
        console.log('✅ Inserted to', table, payload);
        btn.innerText='✅ সফল!'; btn.style.background='#00ffcc'; btn.style.color='#000';
        const ok=document.createElement('div');
        ok.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#00ffcc;color:#000;padding:16px 28px;border-radius:12px;z-index:999999;font-weight:900;';
        ok.innerText=`✅ ${table.toUpperCase()} এ জমা হয়েছে!`;
        document.body.appendChild(ok);
        setTimeout(()=>ok.remove(),4000);
        setTimeout(()=>{btn.innerText=orig; btn.disabled=false; btn.style.background=''; form.reset();},2000);
        
        // Clean bad bookings: delete those where name contains @ (optional auto clean)
        if(table==='bookings' && payload.name.includes('@')){
          console.log('Cleaning bad booking...');
        }
      }catch(err){
        console.error('❌', table, err);
        btn.innerText='❌ '+err.message.slice(0,60);
        setTimeout(()=>{btn.innerText=orig; btn.disabled=false;},4000);
      }
    }, true);
  }
  init();
})();
