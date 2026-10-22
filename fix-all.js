// ElectroHubBD - FINAL v1003 - NO AUTO CLOSE - User must close manually
(function(){
  const URL = 'https://xctzrcprhwsawnalbypi.supabase.co';
  const KEY = 'sb_publishable_hAkwDSANcb2xURtd3UKqHg_l0iUMOts';
  const BUCKET = 'booking-files';
  
  function init(){
    if(!window.supabase){
      const s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
      s.onload=init; document.head.appendChild(s); return;
    }
    const sb = window.supabase.createClient(window.SUPABASE_URL||URL, window.SUPABASE_ANON_KEY||KEY);
    console.log('✅ FINAL v1003 - Manual Close Only');

    async function ensureBucket(){
      try{ const {data} = await sb.storage.getBucket(BUCKET); if(!data){ throw 'no bucket'; } }catch(e){ try{ await sb.storage.createBucket(BUCKET, {public:true}); }catch(err){} }
    }
    ensureBucket();

    function genID(prefix){ return '#'+prefix+'-'+Math.random().toString(36).substr(2,6).toUpperCase(); }
    function today(){ return new Date().toISOString().split('T')[0]; }

    function showProfessionalThankYou(userName, serviceName, tableType){
      const old = document.getElementById('eh-thankyou-modal');
      if(old) old.remove();
      const modal = document.createElement('div');
      modal.id='eh-thankyou-modal';
      modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);z-index:9999999;display:flex;align-items:center;justify-content:center;padding:20px;';
      let title,message,subMessage,icon;
      if(tableType==='contacts'){ title=`ধন্যবাদ, ${userName}!`; message=`আপনার বার্তা সফলভাবে পাঠানো হয়েছে`; subMessage=`ElectroHubBD টিম খুব শীঘ্রই আপনার সাথে যোগাযোগ করবে। আমাদের সেবার প্রতি আস্থা রাখার জন্য আন্তরিক ধন্যবাদ।`; icon='💬'; }
      else if(tableType==='ovijog'){ title=`ধন্যবাদ, ${userName}!`; message=`আপনার অভিযোগটি গ্রহণ করা হয়েছে`; subMessage=`আমাদের সাপোর্ট টিম ২৪ ঘণ্টার মধ্যে আপনার অভিযোগ পর্যালোচনা করে সমাধানের জন্য যোগাযোগ করবে।`; icon='📋'; }
      else { title=`ধন্যবাদ, ${userName}!`; message=`আপনার বুকিং সম্পন্ন হয়েছে`; subMessage=`আপনি <strong style="color:#00ffcc;">${serviceName}</strong> সার্ভিসের জন্য বুকিং করেছেন। ElectroHubBD থেকে খুব দ্রুতই আপনার সাথে যোগাযোগ করা হবে। আমাদের অভিজ্ঞ ইলেকট্রিশিয়ান টিম আপনার সেবায় প্রস্তুত।`; icon='✅'; }
      modal.innerHTML=`<div style="background:linear-gradient(135deg,#0a1628 0%,#122a4a 100%);border:1px solid #00ffcc55;border-radius:20px;padding:40px 30px;max-width:480px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,255,204,0.15);"><div style="width:80px;height:80px;background:linear-gradient(135deg,#00ffcc22,#00d4ff22);border:1px solid #00ffcc44;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:40px;">${icon}</div><h2 style="color:#fff;font-size:26px;font-weight:800;margin:0 0 8px;font-family:Hind Siliguri,sans-serif;">${title}</h2><h3 style="color:#00ffcc;font-size:18px;font-weight:700;margin:0 0 16px;font-family:Hind Siliguri,sans-serif;">${message}</h3><p style="color:#a0b8d0;font-size:14.5px;line-height:1.7;margin:0 0 24px;font-family:Hind Siliguri,sans-serif;">${subMessage}</p><div style="background:rgba(0,255,204,0.07);border:1px solid rgba(0,255,204,0.15);border-radius:12px;padding:12px 16px;margin-bottom:24px;"><div style="color:#7a9ab5;font-size:12px;margin-bottom:4px;">বুকিং আইডি</div><div style="color:#00ffcc;font-size:14px;font-weight:700;letter-spacing:1px;font-family:monospace;">${genID('EH')}</div></div><button id="eh-close-thankyou" style="background:linear-gradient(135deg,#00ffcc,#00d4ff);color:#000;border:none;padding:14px 32px;border-radius:10px;font-weight:800;font-size:15px;cursor:pointer;width:100%;font-family:Hind Siliguri,sans-serif;">ঠিক আছে, ধন্যবাদ</button><div style="margin-top:16px;display:flex;align-items:center;justify-content:center;gap:8px;color:#5a7a9a;font-size:11px;"><span>⚡</span><span>ElectroHubBD - বিশ্বস্ত ইলেকট্রিক্যাল সলিউশন</span><span>⚡</span></div></div>`;
      document.body.appendChild(modal);
      // ONLY MANUAL CLOSE - NO AUTO CLOSE
      document.getElementById('eh-close-thankyou').onclick=()=>modal.remove();
      modal.onclick=(e)=>{ if(e.target===modal) modal.remove(); };
      // Auto close REMOVED as per user request - will stay until user clicks
    }

    async function uploadFile(file){
      if(!file) return null;
      try{
        const fileName = Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9.-]/g,'_');
        const filePath = `bookings/${fileName}`;
        const {data, error} = await sb.storage.from(BUCKET).upload(filePath, file, {upsert:true, contentType: file.type});
        if(error) throw error;
        const {data: urlData} = sb.storage.from(BUCKET).getPublicUrl(filePath);
        return { file_name: file.name, file_type: file.type, file_size: file.size, file_path: urlData.publicUrl };
      }catch(err){
        try{
          const fileName = Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9.-]/g,'_');
          const {data, error} = await sb.storage.from('files').upload(fileName, file, {upsert:true});
          if(!error){ const {data: urlData} = sb.storage.from('files').getPublicUrl(fileName); return { file_name: file.name, file_type: file.type, file_size: file.size, file_path: urlData.publicUrl }; }
        }catch(e2){}
        return null;
      }
    }

    document.addEventListener('submit', async (e)=>{
      const form = e.target; if(!form || form.tagName!=='FORM') return; const btn = form.querySelector('button[type="submit"]'); if(!btn) return;
      let allValues = []; form.querySelectorAll('input, select, textarea').forEach(inp=>{ if(inp.type!=='file' && inp.value) allValues.push(inp.value.trim()); });
      const combined = allValues.join(' ').toLowerCase();
      let nameV='', phoneV='', emailV='', serviceV='', visitDateV='', messageV='';
      let fileInput = form.querySelector('input[type="file"]'); let selectedFile = fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
      form.querySelectorAll('input, select, textarea').forEach(inp=>{
        if(inp.type==='file') return; const v=(inp.value||'').trim(); if(!v) return;
        const id=(inp.id||'').toLowerCase(); const name=(inp.name||'').toLowerCase(); const ph=(inp.placeholder||'').toLowerCase(); const type=inp.type;
        if(type==='email' || v.includes('@')) emailV=v;
        if(type==='tel' || ph.includes('মোবাইল') || ph.includes('phone') || id.includes('phone') || id.includes('mobile') || /^01\d{9}$/.test(v.replace(/\D/g,''))) phoneV=v;
        if(!nameV && (ph.includes('নাম') || id.includes('name') || name.includes('name'))) nameV=v;
        if(inp.tagName==='SELECT') serviceV=inp.selectedOptions[0]?.text||v;
        if(inp.tagName==='TEXTAREA') messageV=v; if(type==='date') visitDateV=v;
      });
      if(!nameV){ for(let v of allValues){ if(v && !v.includes('@') && isNaN(v) && v.length<50){ nameV=v; break; } } }
      let table='bookings';
      if(emailV || (nameV && nameV.includes('@'))){ const hasService = combined.includes('wiring') || combined.includes('residential') || combined.includes('service') || form.querySelector('select'); const nameIsEmail = nameV && nameV.includes('@'); if(nameIsEmail || (emailV && !hasService)){ table='contacts'; } }
      if(combined.includes('ovijog') || combined.includes('অভিযোগ') || combined.includes('complaint') || form.id.toLowerCase().includes('ovijog')){ table='ovijog'; }
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      const orig=btn.innerText; btn.innerText = selectedFile ? '⏳ ফাইল আপলোড হচ্ছে...' : '⏳ পাঠানো হচ্ছে...'; btn.disabled=true;
      try{
        let fileInfo = null; if(selectedFile && table==='bookings'){ fileInfo = await uploadFile(selectedFile); if(fileInfo) btn.innerText='⏳ বুকিং সংরক্ষণ হচ্ছে...'; }
        let payload;
        if(table==='contacts'){ const finalMessage = messageV || 'Contact enquiry from website'; payload={ name: (nameV && !nameV.includes('@')) ? nameV : (emailV ? emailV.split('@')[0] : 'Customer'), email: emailV || nameV, phone: phoneV || '01700000000', message: finalMessage, contact: finalMessage }; try{ payload.id=genID('CON'); const {error}=await sb.from('contacts').insert([payload]).select(); if(error) throw error; }catch(err){ delete payload.id; const {error}=await sb.from('contacts').insert([payload]).select(); if(error) throw error; } }
        else if(table==='ovijog'){ payload={ id: genID('OVI'), name: nameV || 'Customer', phone: phoneV || '01700000000', email: emailV || '', details: messageV || serviceV || 'Ovijog', status: 'pending', created_at: new Date().toISOString() }; const {error}=await sb.from('ovijog').insert([payload]).select(); if(error) throw error; }
        else { if(!nameV) nameV='Customer'; if(nameV.includes('@')) nameV='Customer'; if(!phoneV) phoneV='01700000000'; if(!serviceV) serviceV='বাড়ির ইলেকট্রিক্যাল ওয়্যারিং'; if(!visitDateV) visitDateV=today(); else { try{ visitDateV=new Date(visitDateV).toISOString().split('T')[0]; }catch(e){ visitDateV=today(); } } payload={ id: genID('ENG'), name: nameV, phone: phoneV, service: serviceV, visit_date: visitDateV, notes: messageV || '', status: 'pending' }; if(fileInfo){ payload.file_name = fileInfo.file_name; payload.file_type = fileInfo.file_type; payload.file_size = fileInfo.file_size; payload.file_path = fileInfo.file_path; } const {error}=await sb.from('bookings').insert([payload]).select(); if(error) throw error; }
        btn.innerText=orig; btn.disabled=false; form.reset();
        showProfessionalThankYou(nameV || 'সম্মানিত গ্রাহক', serviceV, table);
      }catch(err){ console.error('❌', table, err); btn.innerText='❌ '+err.message.slice(0,60); setTimeout(()=>{btn.innerText=orig; btn.disabled=false;},4000); }
    }, true);
  }
  init();
})();
