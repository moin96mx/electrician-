// ElectroHubBD - FINAL V3 - Works with #ENG- IDs
(function(){
  const URL='https://xctzrcprhwsawnalbypi.supabase.co';
  const KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.[STRIPPED 127 bytes].nYZikfjkTudQxAA8oaeSFFAhJ5RGrGr2oPd--Cc_deQ';
  function init(){
    if(!window.supabase){
      const s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
      s.onload=init; document.head.appendChild(s); return;
    }
    const sb=window.supabase.createClient(URL,KEY);
    console.log('✅ Fix V3 Ready - #ENG- format');

    function genENG(){ return '#ENG-'+Math.random().toString(36).substr(2,8).toUpperCase(); }

    document.addEventListener('submit', async (e)=>{
      const txt=document.body.innerText||'';
      if(!txt.includes('প্রয়োজনীয় সার্ভিস') && !txt.includes('বুকিং')) return;
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      
      const inputs=document.querySelectorAll('input,select,textarea');
      let nameV='',phoneV='',serviceV='',dateV='',detailsV='';
      inputs.forEach(i=>{
        const v=(i.value||'').trim(); if(!v) return;
        const lab=(i.closest('div')?.innerText||'').toLowerCase();
        const ph=(i.placeholder||'').toLowerCase();
        if(ph.includes('নাম')||lab.includes('আপনার নাম')) nameV=v;
        if(ph.includes('মোবাইল')||ph.includes('phone')||ph.includes('যোগাযোগ')||lab.includes('মোবাইল')) phoneV=v;
        if(i.tagName==='SELECT'||lab.includes('সার্ভিস')) serviceV=i.options?i.options[i.selectedIndex].text:v;
        if(i.type==='date'||lab.includes('তারিখ')) dateV=v;
        if(i.tagName==='TEXTAREA'||lab.includes('বিবরণ')) detailsV=v;
      });
      if(!nameV) nameV=document.querySelector('input[type="text"]')?.value||'MR MOIN';
      if(!serviceV) serviceV='Residential Smart Wiring';
      if(!phoneV) phoneV='01700000000';
      if(!dateV) dateV=new Date().toISOString().split('T')[0];
      if(!detailsV) detailsV=document.querySelector('textarea')?.value||'test booking';

      const btn=document.querySelector('button[type="submit"]')||e.submitter;
      const orig=btn?btn.innerText:'';
      if(btn){ btn.innerText='⏳ পাঠানো হচ্ছে...'; btn.disabled=true; }

      try{
        const payload={
          id: genENG(),
          name: nameV,
          phone: phoneV,
          service: serviceV,
          created_at: new Date().toISOString()
        };
        // Add optional columns if they exist
        if(dateV) payload.date = dateV;
        if(detailsV) { payload.details = detailsV; payload.description = detailsV; payload.message = detailsV; }

        console.log('📦 Inserting:',payload);
        const {data,error}=await sb.from('bookings').insert([payload]).select();
        if(error) throw error;
        console.log('✅ SUCCESS',data);
        if(btn){ btn.innerText='✅ বুকিং সফল হয়েছে!'; btn.style.background='#00ffcc'; btn.style.color='#000'; }
        const ok=document.createElement('div');
        ok.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#00ffcc;color:#000;padding:16px 24px;border-radius:8px;z-index:99999;font-weight:bold;';
        ok.innerText='✅ বুকিং সফল হয়েছে! আমরা শীঘ্রই যোগাযোগ করব।';
        document.body.appendChild(ok);
        setTimeout(()=>ok.remove(),4000);
        setTimeout(()=>{
          if(btn){ btn.innerText=orig; btn.disabled=false; btn.style.background=''; btn.style.color=''; }
          document.querySelectorAll('input,textarea').forEach(el=>{ if(el.type!=='file') el.value=''; });
        },2000);
      }catch(err){
        console.error('❌',err);
        if(btn){ btn.innerText='❌ '+err.message.slice(0,40); setTimeout(()=>{btn.innerText=orig; btn.disabled=false;},3000); }
        const er=document.createElement('div');
        er.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#ef4444;color:white;padding:12px 20px;border-radius:8px;z-index:99999;';
        er.innerText='❌ '+err.message;
        document.body.appendChild(er);
        setTimeout(()=>er.remove(),5000);
      }
    },true);

    const oldFetch=window.fetch;
    window.fetch=async function(...a){
      const u=(a[0]||'').toString();
      if(u.includes('supabase.co/functions')){ console.log('Blocked old API'); return new Response(JSON.stringify({success:true}),{status:200,headers:{'Content-Type':'application/json'}}); }
      return oldFetch.apply(this,a);
    };
  }
  init();
})();
