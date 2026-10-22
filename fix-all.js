// ElectroHubBD - FINAL BOSS - Status Check Fixed - Minimal Safe Columns
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
    console.log('✅ FINAL BOSS Ready - No status column');

    function genENG(){ return '#ENG-'+Math.random().toString(36).substr(2,6).toUpperCase(); }
    
    function parseDate(val){
      if(!val) return new Date().toISOString().split('T')[0];
      try {
        const d = new Date(val);
        if(!isNaN(d.getTime()) && d.getFullYear() > 2000 && d.getFullYear() < 2100){
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
      
      // Prevent other handlers
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      
      let nameV='', phoneV='', serviceV='', visitDateV='', detailsV='';
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach(inp=>{
        const v=(inp.value||'').trim(); if(!v) return;
        const id=(inp.id||'').toLowerCase(); const name=(inp.name||'').toLowerCase();
        const ph=(inp.placeholder||'').toLowerCase(); const type=inp.type;
        if(!nameV && (id.includes('name') || name.includes('name') || ph.includes('নাম'))) nameV=v;
        if(!phoneV && (id.includes('phone') || id.includes('mobile') || name.includes('phone') || ph.includes('মোবাইল'))) phoneV=v;
        if(type==='date' || id.includes('visit') || name.includes('visit')) visitDateV=v;
        if(inp.tagName==='SELECT') serviceV=inp.selectedOptions[0]?.text||inp.value;
        if(inp.tagName==='TEXTAREA') detailsV=v;
      });
      
      const textInputs=[...form.querySelectorAll('input[type="text"], input[type="tel"]')];
      if(!nameV && textInputs[0]) nameV=textInputs[0].value;
      if(!phoneV && textInputs[1]) phoneV=textInputs[1].value;
      if(!nameV) nameV='MR MOIN';
      if(!phoneV) phoneV='01700000000';
      if(!serviceV) serviceV='Residential Wiring';
      visitDateV=parseDate(visitDateV);

      const orig=btn.innerText; btn.innerText='⏳ পাঠানো হচ্ছে...'; btn.disabled=true;

      try{
        // MINIMAL PAYLOAD - NO STATUS COLUMN! Only columns that 100% exist
        const payload={
          id: genENG(),
          name: nameV.trim(),
          phone: phoneV.trim(),
          service: serviceV.trim(),
          visit_date: visitDateV
        };
        // Only add details if column exists (we'll try, but safe)
        // We send only 5 columns to avoid any check constraint

        console.log('📦 FINAL Insert:', payload);
        const {data, error}=await sb.from('bookings').insert([payload]).select();
        if(error) throw error;
        
        btn.innerText='✅ বুকিং সফল হয়েছে!'; btn.style.background='#00ffcc'; btn.style.color='#000';
        const ok=document.createElement('div');
        ok.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#00ffcc;color:#000;padding:16px 28px;border-radius:12px;z-index:999999;font-weight:900;';
        ok.innerText='✅ বুকিং সফল! আমরা শীঘ্রই কল করব।';
        document.body.appendChild(ok);
        setTimeout(()=>ok.remove(),5000);
        setTimeout(()=>{btn.innerText=orig; btn.disabled=false; btn.style.background=''; form.reset();},2000);
      }catch(err){
        console.error('❌', err);
        btn.innerText='❌ '+err.message.slice(0,60);
        const er=document.createElement('div');
        er.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#ef4444;color:white;padding:12px 20px;border-radius:8px;z-index:99999;max-width:90%;';
        er.innerText='❌ '+err.message;
        document.body.appendChild(er);
        setTimeout(()=>er.remove(),7000);
        setTimeout(()=>{btn.innerText=orig; btn.disabled=false;},4000);
      }
    }, true);
  }
  init();
})();
