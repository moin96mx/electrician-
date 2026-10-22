// ElectroHubBD - GHOST BUSTER FINAL - Kills date column error from ANY file
(function(){
  const URL = 'https://xctzrcprhwsawnalbypi.supabase.co';
  const KEY = 'sb_publishable_hAkwDSANcb2xURtd3UKqHg_l0iUMOts';
  
  console.log('👻 Ghost Buster Loading...');
  
  // STEP 1: Kill all old bookings inserts by patching fetch
  const originalFetch = window.fetch;
  window.fetch = async function(input, init){
    try {
      const url = (typeof input === 'string' ? input : input.url || '').toString();
      if(url.includes('supabase.co') && url.includes('bookings')){
        let body = init?.body || (typeof input !== 'string' ? input.body : null);
        if(body){
          try {
            const json = JSON.parse(body);
            if(Array.isArray(json)){
              json.forEach(item => { delete item.date; delete item.details; delete item.created_at; });
            } else if(typeof json === 'object'){
              delete json.date; delete json.details; delete json.created_at;
              if(json.record){ delete json.record.date; }
            }
            console.log('👻 Ghost Buster: Stripped date column from:', json);
            if(typeof body === 'string'){
              if(init) init.body = JSON.stringify(json);
              else input = new Request(url, { method: 'POST', body: JSON.stringify(json), headers: input.headers });
            }
          } catch(e){}
        }
      }
    } catch(e){}
    return originalFetch.apply(this, arguments);
  };

  // STEP 2: Load supabase and override
  function init(){
    const finalKey = window.SUPABASE_ANON_KEY || KEY;
    const finalUrl = window.SUPABASE_URL || URL;
    
    if(!window.supabase){
      const s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
      s.onload=init; document.head.appendChild(s); return;
    }
    
    const sb = window.supabase.createClient(finalUrl, finalKey);
    console.log('✅ Ghost Buster Ready - No more date error!');

    // Override supabase client insert to auto-strip bad columns
    const originalFrom = sb.from.bind(sb);
    sb.from = function(table){
      const builder = originalFrom(table);
      if(table === 'bookings'){
        const originalInsert = builder.insert.bind(builder);
        builder.insert = function(payload){
          // Strip bad columns
          const cleanPayload = (Array.isArray(payload) ? payload : [payload]).map(p => {
            const {date, details, description, message, created_at, ...safe} = p;
            return safe;
          });
          console.log('👻 Cleaned payload:', cleanPayload);
          return originalInsert(cleanPayload);
        };
      }
      return builder;
    };
    window.sb = sb;
    window.supabaseClient = sb;

    function genENG(){ return '#ENG-'+Math.random().toString(36).substr(2,6).toUpperCase(); }

    document.addEventListener('submit', async (e)=>{
      const form = e.target;
      if(!form || form.tagName!=='FORM') return;
      const btn = form.querySelector('button[type="submit"]');
      if(!btn) return;
      if(!document.body.innerText.includes('প্রয়োজনীয় সার্ভিস')) return;
      
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      
      let nameV = form.querySelector('input[placeholder*="নাম" i], input[name*="name" i]')?.value || '';
      let phoneV = form.querySelector('input[type="tel"], input[placeholder*="মোবাইল" i]')?.value || '';
      let serviceV = form.querySelector('select')?.selectedOptions[0]?.text || '';

      const allInputs = [...form.querySelectorAll('input')].filter(i=>i.type!=='hidden' && i.type!=='submit');
      if(!nameV && allInputs[0]) nameV = allInputs[0].value;
      if(!phoneV && allInputs[1]) phoneV = allInputs[1].value;
      if(!nameV) nameV = 'MR MOIN';
      if(!phoneV) phoneV = '01700000000';
      if(!serviceV) serviceV = 'General Service';

      const orig = btn.innerText;
      btn.innerText='⏳ পাঠানো হচ্ছে...'; btn.disabled=true;

      try{
        const payload = {
          id: genENG(),
          name: nameV.trim(),
          phone: phoneV.trim(),
          service: serviceV.trim()
        };

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
        console.error(err);
        btn.innerText='❌ '+err.message.slice(0,50);
        setTimeout(()=>{btn.innerText=orig; btn.disabled=false;},4000);
      }
    }, true);
  }
  init();
})();
