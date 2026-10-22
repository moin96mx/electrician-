// ElectroHubBD - FINAL FINAL - visit_date Fix
(function(){
  const URL = 'https://xctzrcprhwsawnalbypi.supabase.co';
  const KEY = 'sb_publishable_hAkwDSANcb2xURtd3UKqHg_l0iUMOts';
  
  function init(){
    const finalKey = window.SUPABASE_ANON_KEY || KEY;
    const finalUrl = window.SUPABASE_URL || URL;
    
    if(!window.supabase){
      const s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
      s.onload=init; document.head.appendChild(s); return;
    }
    
    const sb = window.supabase.createClient(finalUrl, finalKey);
    console.log('✅ visit_date Fix Ready');

    function genENG(){ return '#ENG-'+Math.random().toString(36).substr(2,6).toUpperCase(); }
    
    function parseDateInput(val){
      if(!val) return new Date().toISOString().split('T')[0];
      // Handle YYYY-MM-DD
      if(/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
      // Handle DD/MM/YYYY or MM/DD/YYYY with slashes
      try {
        const d = new Date(val);
        if(!isNaN(d.getTime()) && d.getFullYear() > 1900 && d.getFullYear() < 2100){
          return d.toISOString().split('T')[0];
        }
      } catch(e){}
      return new Date().toISOString().split('T')[0];
    }

    document.addEventListener('submit', async (e)=>{
      const form = e.target;
      if(!form || form.tagName!=='FORM') return;
      const btn = form.querySelector('button[type="submit"]');
      if(!btn) return;
      
      // Only for main booking form
      if(!form.innerHTML.includes('প্রয়োজনীয় সার্ভিস') && !document.body.innerHTML.includes('প্রয়োজনীয় সার্ভিস')) {
        // Check if form has our fields
        if(!form.querySelector('select')) return;
      }
      
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      
      let nameV = '', phoneV = '', serviceV = '', visitDateV = '', detailsV = '';
      
      // Find all inputs
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach(inp => {
        const v = (inp.value||'').trim();
        if(!v) return;
        const type = inp.type;
        const id = (inp.id||'').toLowerCase();
        const name = (inp.name||'').toLowerCase();
        const ph = (inp.placeholder||'').toLowerCase();
        
        if(type === 'text' && !nameV && (id.includes('name') || name.includes('name') || ph.includes('নাম'))) nameV = v;
        if((type === 'tel' || type === 'text') && !phoneV && (id.includes('phone') || id.includes('mobile') || name.includes('phone') || ph.includes('মোবাইল'))) phoneV = v;
        if(type === 'date' || id.includes('visit') || id.includes('date') || name.includes('visit') || name.includes('date')) visitDateV = v;
        if(inp.tagName === 'SELECT') serviceV = inp.selectedOptions[0]?.text || inp.value;
        if(inp.tagName === 'TEXTAREA') detailsV = v;
      });
      
      // Fallbacks in order
      const textInputs = [...form.querySelectorAll('input[type="text"], input[type="tel"]')];
      if(!nameV && textInputs[0]) nameV = textInputs[0].value;
      if(!phoneV && textInputs[1]) phoneV = textInputs[1].value;
      
      if(!nameV) nameV = 'MR MOIN';
      if(!phoneV) phoneV = '01700000000';
      if(!serviceV) serviceV = 'Residential Wiring';
      visitDateV = parseDateInput(visitDateV);

      const orig = btn.innerText;
      btn.innerText='⏳ পাঠানো হচ্ছে...'; btn.disabled=true;

      try{
        // Full payload with visit_date
        const payload = {
          id: genENG(),
          name: nameV.trim(),
          phone: phoneV.trim(),
          service: serviceV.trim(),
          visit_date: visitDateV,
          details: detailsV || 'Website booking',
          status: 'pending'
        };

        console.log('📦 Inserting with visit_date:', payload);
        const {data, error} = await sb.from('bookings').insert([payload]).select();
        if(error) throw error;
        
        btn.innerText='✅ বুকিং সফল হয়েছে!';
        btn.style.background='#00ffcc'; btn.style.color='#000';
        const ok=document.createElement('div');
        ok.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#00ffcc;color:#000;padding:16px 28px;border-radius:12px;z-index:999999;font-weight:900;';
        ok.innerText='✅ বুকিং সফল! আমরা কল করব।';
        document.body.appendChild(ok);
        setTimeout(()=>ok.remove(),4000);
        setTimeout(()=>{ btn.innerText=orig; btn.disabled=false; btn.style.background=''; form.reset(); },2000);
      }catch(err){
        console.error('❌', err);
        btn.innerText='❌ '+err.message.slice(0,60);
        const er=document.createElement('div');
        er.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#ef4444;color:white;padding:12px 20px;border-radius:8px;z-index:99999;';
        er.innerText='❌ '+err.message;
        document.body.appendChild(er);
        setTimeout(()=>er.remove(),6000);
        setTimeout(()=>{btn.innerText=orig; btn.disabled=false;},4000);
      }
    }, true);
    
    // Also patch fetch to auto-add visit_date if missing
    const origFetch = window.fetch;
    window.fetch = async function(input, init){
      try {
        const url = (typeof input === 'string' ? input : input.url || '').toString();
        if(url.includes('supabase.co') && url.includes('bookings') && init?.body){
          try {
            const json = JSON.parse(init.body);
            const items = Array.isArray(json) ? json : [json];
            items.forEach(it => {
              if(!it.visit_date) it.visit_date = new Date().toISOString().split('T')[0];
              if(!it.id) it.id = genENG();
            });
            init.body = JSON.stringify(Array.isArray(json) ? items : items[0]);
          } catch(e){}
        }
      } catch(e){}
      return origFetch.apply(this, arguments);
    };
  }
  init();
})();
