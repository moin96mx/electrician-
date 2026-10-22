// ElectroHubBD - FINAL v1000 + Professional Thank You Message
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
    console.log('✅ FINAL v1000 + Thank You Ready');

    function genID(prefix){ return '#'+prefix+'-'+Math.random().toString(36).substr(2,6).toUpperCase(); }
    function today(){ return new Date().toISOString().split('T')[0]; }

    function showProfessionalThankYou(userName, serviceName, tableType){
      // Remove old modal if exists
      const old = document.getElementById('eh-thankyou-modal');
      if(old) old.remove();

      const modal = document.createElement('div');
      modal.id='eh-thankyou-modal';
      modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);z-index:9999999;display:flex;align-items:center;justify-content:center;padding:20px;animation:ehFadeIn 0.3s ease;';

      let title, message, subMessage, icon;
      
      if(tableType==='contacts'){
        title=`ধন্যবাদ, ${userName}!`;
        message=`আপনার বার্তা সফলভাবে পাঠানো হয়েছে`;
        subMessage=`ElectroHubBD টিম খুব শীঘ্রই আপনার সাথে যোগাযোগ করবে। আমাদের সেবার প্রতি আস্থা রাখার জন্য আন্তরিক ধন্যবাদ।`;
        icon='💬';
      } else if(tableType==='ovijog'){
        title=`ধন্যবাদ, ${userName}!`;
        message=`আপনার অভিযোগটি গ্রহণ করা হয়েছে`;
        subMessage=`আমাদের সাপোর্ট টিম ২৪ ঘণ্টার মধ্যে আপনার অভিযোগ পর্যালোচনা করে সমাধানের জন্য যোগাযোগ করবে।`;
        icon='📋';
      } else {
        title=`ধন্যবাদ, ${userName}!`;
        message=`আপনার বুকিং সম্পন্ন হয়েছে`;
        subMessage=`আপনি <strong style="color:#00ffcc;">${serviceName}</strong> সার্ভিসের জন্য বুকিং করেছেন। ElectroHubBD থেকে খুব দ্রুতই আপনার সাথে যোগাযোগ করা হবে। আমাদের অভিজ্ঞ ইলেকট্রিশিয়ান টিম আপনার সেবায় প্রস্তুত।`;
        icon='✅';
      }

      modal.innerHTML=`
        <style>
          @keyframes ehFadeIn{from{opacity:0}to{opacity:1}}
          @keyframes ehScaleIn{from{transform:scale(0.9);opacity:0}to{transform:scale(1);opacity:1}}
          @keyframes ehCheckmark{0%{transform:scale(0)}50%{transform:scale(1.2)}100%{transform:scale(1)}}
        </style>
        <div style="background:linear-gradient(135deg,#0a1628 0%,#122a4a 100%);border:1px solid #00ffcc55;border-radius:20px;padding:40px 30px;max-width:480px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,255,204,0.15),0 0 0 1px rgba(0,255,204,0.1);animation:ehScaleIn 0.4s ease;position:relative;overflow:hidden;">
          <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#00ffcc,#00d4ff);"></div>
          
          <div style="width:80px;height:80px;background:linear-gradient(135deg,#00ffcc22,#00d4ff22);border:1px solid #00ffcc44;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:40px;animation:ehCheckmark 0.6s ease 0.2s both;">${icon}</div>
          
          <h2 style="color:#fff;font-size:26px;font-weight:800;margin:0 0 8px;font-family:Hind Siliguri,sans-serif;">${title}</h2>
          <h3 style="color:#00ffcc;font-size:18px;font-weight:700;margin:0 0 16px;font-family:Hind Siliguri,sans-serif;">${message}</h3>
          
          <p style="color:#a0b8d0;font-size:14.5px;line-height:1.7;margin:0 0 24px;font-family:Hind Siliguri,sans-serif;">
            ${subMessage}
          </p>
          
          <div style="background:rgba(0,255,204,0.07);border:1px solid rgba(0,255,204,0.15);border-radius:12px;padding:12px 16px;margin-bottom:24px;">
            <div style="color:#7a9ab5;font-size:12px;margin-bottom:4px;">বুকিং আইডি</div>
            <div style="color:#00ffcc;font-size:14px;font-weight:700;letter-spacing:1px;font-family:monospace;">${genID('EH')}</div>
          </div>
          
          <button id="eh-close-thankyou" style="background:linear-gradient(135deg,#00ffcc,#00d4ff);color:#000;border:none;padding:14px 32px;border-radius:10px;font-weight:800;font-size:15px;cursor:pointer;width:100%;font-family:Hind Siliguri,sans-serif;transition:all 0.2s;">ঠিক আছে, ধন্যবাদ</button>
          
          <div style="margin-top:16px;display:flex;align-items:center;justify-content:center;gap:8px;color:#5a7a9a;font-size:11px;">
            <span>⚡</span><span>ElectroHubBD - বিশ্বস্ত ইলেকট্রিক্যাল সলিউশন</span><span>⚡</span>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      document.getElementById('eh-close-thankyou').onclick=()=>{
        modal.style.animation='ehFadeIn 0.3s ease reverse';
        setTimeout(()=>modal.remove(),300);
      };
      modal.onclick=(e)=>{ if(e.target===modal){ modal.style.animation='ehFadeIn 0.3s ease reverse'; setTimeout(()=>modal.remove(),300); } };
      
      // Auto close after 8 seconds
      setTimeout(()=>{
        if(document.getElementById('eh-thankyou-modal')){
          modal.style.animation='ehFadeIn 0.3s ease reverse';
          setTimeout(()=>modal.remove(),300);
        }
      },8000);
    }

    document.addEventListener('submit', async (e)=>{
      const form = e.target;
      if(!form || form.tagName!=='FORM') return;
      const btn = form.querySelector('button[type="submit"]');
      if(!btn) return;

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

      if(!nameV){
        for(let v of allValues){ if(v && !v.includes('@') && isNaN(v) && v.length<50){ nameV=v; break; } }
      }

      let table='bookings';
      if(emailV || (nameV && nameV.includes('@'))){
        const hasService = combined.includes('wiring') || combined.includes('residential') || combined.includes('service') || form.querySelector('select');
        const nameIsEmail = nameV && nameV.includes('@');
        if(nameIsEmail || (emailV && !hasService)){
          table='contacts';
        }
      }
      if(combined.includes('ovijog') || combined.includes('অভিযোগ') || combined.includes('complaint') || form.id.toLowerCase().includes('ovijog')){
        table='ovijog';
      }

      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      const orig=btn.innerText; btn.innerText='⏳ পাঠানো হচ্ছে...'; btn.disabled=true;

      try{
        let payload;
        if(table==='contacts'){
          const finalMessage = messageV || 'Contact enquiry from website';
          payload={
            name: (nameV && !nameV.includes('@')) ? nameV : (emailV ? emailV.split('@')[0] : 'Customer'),
            email: emailV || nameV,
            phone: phoneV || '01700000000',
            message: finalMessage,
            contact: finalMessage
          };
          try{ payload.id=genID('CON'); const {error}=await sb.from('contacts').insert([payload]).select(); if(error) throw error; }catch(err){ delete payload.id; const {error}=await sb.from('contacts').insert([payload]).select(); if(error) throw error; }
        } else if(table==='ovijog'){
          payload={ id: genID('OVI'), name: nameV || 'Customer', phone: phoneV || '01700000000', email: emailV || '', details: messageV || serviceV || 'Ovijog', status: 'pending', created_at: new Date().toISOString() };
          const {error}=await sb.from('ovijog').insert([payload]).select(); if(error) throw error;
        } else {
          if(!nameV) nameV='Customer'; if(nameV.includes('@')) nameV='Customer'; if(!phoneV) phoneV='01700000000'; if(!serviceV) serviceV='বাড়ির ইলেকট্রিক্যাল ওয়্যারিং'; if(!visitDateV) visitDateV=today(); else { try{ visitDateV=new Date(visitDateV).toISOString().split('T')[0]; }catch(e){ visitDateV=today(); } }
          payload={ id: genID('ENG'), name: nameV, phone: phoneV, service: serviceV, visit_date: visitDateV };
          const {error}=await sb.from('bookings').insert([payload]).select(); if(error) throw error;
        }
        
        console.log('✅ Inserted to', table, payload);
        btn.innerText=orig; btn.disabled=false; form.reset();
        
        // Show Professional Thank You
        showProfessionalThankYou(nameV || 'সম্মানিত গ্রাহক', serviceV, table);
        
      }catch(err){
        console.error('❌', table, err);
        btn.innerText='❌ '+err.message.slice(0,60);
        setTimeout(()=>{btn.innerText=orig; btn.disabled=false;},4000);
      }
    }, true);
  }
  init();
})();
