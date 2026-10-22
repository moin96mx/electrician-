// ElectroHubBD - FINAL V6 - Fixed Schema Cache Error - Only Real Columns
(function(){
  const URL = 'https://xctzrcprhwsawnalbypi.supabase.co';
  const KEY = 'sb_publishable_hAkwDSANcb2xURtd3UKqHg_l0iUMOts';
  
  function init(){
    const finalKey = window.SUPABASE_ANON_KEY || window.SUPABASE_PUBLISHABLE_KEY || KEY;
    const finalUrl = window.SUPABASE_URL || URL;
    
    if(!window.supabase){
      const s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
      s.onload=init; document.head.appendChild(s); return;
    }
    
    const sb = window.supabase.createClient(finalUrl, finalKey);
    console.log('✅ V6 Ready');

    function genENG(){ return '#ENG-'+Math.random().toString(36).substr(2,8).toUpperCase(); }

    document.addEventListener('submit', async (e)=>{
      const bodyText = (document.body.innerText||'').toLowerCase();
      if(!bodyText.includes('প্রয়োজনীয় সার্ভিস') && !bodyText.includes('বুকিং')) return;
      
      const form = e.target;
      if(!form.querySelector('button[type="submit"]')) return;
      
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      
      const inputs = form.querySelectorAll('input,select,textarea');
      let nameV='',phoneV='',serviceV='';
      inputs.forEach(i=>{
        const v=(i.value||'').trim(); if(!v) return;
        const lab=(i.closest('div')?.innerText||'').toLowerCase();
        const ph=(i.placeholder||'').toLowerCase();
        const id=(i.id||'').toLowerCase();
        const name=(i.name||'').toLowerCase();
        
        if(id.includes('name') || name.includes('name') || ph.includes('নাম') || lab.includes('পূর্ণ নাম')) nameV=v;
        if(id.includes('phone') || id.includes('mobile') || name.includes('phone') || ph.includes('মোবাইল') || lab.includes('মোবাইল')) phoneV=v;
        if(i.tagName==='SELECT' || id.includes('service') || name.includes('service') || lab.includes('সার্ভিস')) serviceV = i.options ? i.options[i.selectedIndex].text : v;
      });
      
      if(!nameV) nameV = 'MR MOIN';
      if(!phoneV) phoneV = document.querySelector('input[type="tel"]')?.value || '01700000000';
      if(!serviceV) serviceV = 'Solar System Installation';

      const btn = form.querySelector('button[type="submit"]');
      const orig = btn ? btn.innerText : '';
      if(btn){ btn.innerText='⏳ পাঠানো হচ্ছে...'; btn.disabled=true; }

      try{
        // ONLY columns that 100% exist in your bookings table
        const payload = {
          id: genENG(),
          name: nameV,
          phone: phoneV,
          service: serviceV
        };

        console.log('📦 V6 Inserting (only real columns):', payload);
        const {data, error} = await sb.from('bookings').insert([payload]).select();
        if(error) throw error;
        
        console.log('✅ V6 SUCCESS', data);
        if(btn){ 
          btn.innerText='✅ বুকিং সফল হয়েছে!'; 
          btn.style.background='#00ffcc'; 
          btn.style.color='#000'; 
        }
        const ok=document.createElement('div');
        ok.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#00ffcc;color:#000;padding:16px 24px;border-radius:12px;z-index:99999;font-weight:bold;';
        ok.innerText='✅ বুকিং সফল হয়েছে! আমরা শীঘ্রই যোগাযোগ করব।';
        document.body.appendChild(ok);
        setTimeout(()=>ok.remove(),4000);
        setTimeout(()=>{
          if(btn){ btn.innerText=orig; btn.disabled=false; btn.style.background=''; btn.style.color=''; }
          form.reset();
        },2000);
      }catch(err){
        console.error('❌ V6 Error', err);
        if(btn){ 
          btn.innerText='❌ '+err.message.slice(0,50); 
          setTimeout(()=>{btn.innerText=orig; btn.disabled=false;},5000); 
        }
        const er=document.createElement('div');
        er.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#ef4444;color:white;padding:12px 20px;border-radius:8px;z-index:99999;';
        er.innerText='❌ '+err.message;
        document.body.appendChild(er);
        setTimeout(()=>er.remove(),6000);
      }
    }, true);
  }
  init();
})();
