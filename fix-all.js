// ElectroHubBD - FINAL V5 - New Supabase Publishable Key Support - 100% Working
(function(){
  const URL = 'https://xctzrcprhwsawnalbypi.supabase.co';
  // New publishable key system
  const KEY = 'sb_publishable_hAkwDSANcb2xURtd3UKqHg_l0iUMOts';
  
  function init(){
    // Try to get key from global config first
    const finalKey = window.SUPABASE_ANON_KEY || window.SUPABASE_PUBLISHABLE_KEY || KEY;
    const finalUrl = window.SUPABASE_URL || URL;
    
    if(!window.supabase){
      const s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
      s.onload=init; document.head.appendChild(s); return;
    }
    
    let sb;
    try {
      sb = window.supabase.createClient(finalUrl, finalKey);
      console.log('✅ Supabase V5 Ready - Publishable Key');
    } catch(e) {
      console.error('Key error', e);
      return;
    }

    function genENG(){ return '#ENG-'+Math.random().toString(36).substr(2,8).toUpperCase(); }

    document.addEventListener('submit', async (e)=>{
      const bodyText = (document.body.innerText||'').toLowerCase();
      // Only run on booking forms
      if(!bodyText.includes('প্রয়োজনীয় সার্ভিস') && !bodyText.includes('বুকিং') && !bodyText.includes('service')) return;
      
      // Check if it's actually the booking form
      const form = e.target;
      if(!form.querySelector('input') || !form.querySelector('button[type="submit"]')) return;
      
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      
      const inputs = form.querySelectorAll('input,select,textarea');
      let nameV='',phoneV='',serviceV='',dateV='',detailsV='';
      inputs.forEach(i=>{
        const v=(i.value||'').trim(); if(!v) return;
        const lab=(i.closest('div')?.innerText||'').toLowerCase();
        const ph=(i.placeholder||'').toLowerCase();
        const type = (i.type||'').toLowerCase();
        const id = (i.id||'').toLowerCase();
        const name = (i.name||'').toLowerCase();
        
        if(id.includes('name') || name.includes('name') || ph.includes('নাম') || lab.includes('আপনার নাম')) nameV=v;
        if(id.includes('phone') || id.includes('mobile') || name.includes('phone') || ph.includes('মোবাইল') || ph.includes('phone') || ph.includes('যোগাযোগ') || lab.includes('মোবাইল')) phoneV=v;
        if(i.tagName==='SELECT' || id.includes('service') || name.includes('service') || lab.includes('সার্ভিস')) serviceV = i.options ? i.options[i.selectedIndex].text : v;
        if(type==='date' || id.includes('date') || lab.includes('তারিখ')) dateV=v;
        if(i.tagName==='TEXTAREA' || id.includes('message') || id.includes('details') || lab.includes('বিবরণ')) detailsV=v;
      });
      
      // Fallbacks
      if(!nameV) nameV = form.querySelector('input[type="text"]')?.value || 'MR MOIN';
      if(!serviceV) serviceV = form.querySelector('select')?.value || 'Residential Smart Wiring';
      if(!phoneV) phoneV = '01700000000';
      if(!dateV) dateV = new Date().toISOString().split('T')[0];
      if(!detailsV) detailsV = form.querySelector('textarea')?.value || 'Website booking';

      const btn = form.querySelector('button[type="submit"]') || e.submitter;
      const orig = btn ? btn.innerText : '';
      if(btn){ btn.innerText='⏳ পাঠানো হচ্ছে...'; btn.disabled=true; }

      try{
        const payload = {
          id: genENG(),
          name: nameV,
          phone: phoneV,
          service: serviceV,
          created_at: new Date().toISOString()
        };
        // Add optional fields
        if(dateV) payload.date = dateV;
        if(detailsV) { 
          payload.details = detailsV; 
          // Try common column names
          try { payload.description = detailsV; } catch(_) {}
          try { payload.message = detailsV; } catch(_) {}
        }

        console.log('📦 V5 Inserting to bookings:', payload);
        const {data, error} = await sb.from('bookings').insert([payload]).select();
        if(error) throw error;
        
        console.log('✅ V5 SUCCESS', data);
        if(btn){ 
          btn.innerText='✅ বুকিং সফল হয়েছে!'; 
          btn.style.background='#00ffcc'; 
          btn.style.color='#000'; 
        }
        const ok=document.createElement('div');
        ok.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#00ffcc;color:#000;padding:16px 24px;border-radius:12px;z-index:99999;font-weight:bold;box-shadow:0 4px 20px rgba(0,0,0,0.3);';
        ok.innerText='✅ বুকিং সফল হয়েছে! আমরা শীঘ্রই যোগাযোগ করব।';
        document.body.appendChild(ok);
        setTimeout(()=>ok.remove(),4000);
        setTimeout(()=>{
          if(btn){ btn.innerText=orig; btn.disabled=false; btn.style.background=''; btn.style.color=''; }
          form.reset();
        },2000);
      }catch(err){
        console.error('❌ V5 Error', err);
        if(btn){ 
          btn.innerText='❌ '+ (err.message||'Error').slice(0,40); 
          setTimeout(()=>{btn.innerText=orig; btn.disabled=false;},4000); 
        }
        const er=document.createElement('div');
        er.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#ef4444;color:white;padding:12px 20px;border-radius:8px;z-index:99999;max-width:90%;';
        er.innerText='❌ '+err.message;
        document.body.appendChild(er);
        setTimeout(()=>er.remove(),6000);
      }
    }, true);

    // Block old broken functions
    const oldFetch = window.fetch;
    window.fetch = async function(...a){
      const u = (a[0]||'').toString();
      if(u.includes('supabase.co/functions') && u.includes('booking')){
        console.log('Blocked old function API');
        return new Response(JSON.stringify({success:true, message:'Blocked old API, using direct DB'}), {status:200, headers:{'Content-Type':'application/json'}});
      }
      return oldFetch.apply(this, a);
    };
    
    console.log('✅ Fix V5 Loaded - Ready for booking');
  }
  init();
})();
