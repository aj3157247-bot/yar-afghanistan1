/* Yar AI — unified files + ChatGPT-style conversations */
(function(){
  'use strict';
  const form=document.getElementById('chatForm');
  const input=document.getElementById('messageInput');
  const messagesBox=document.getElementById('chatMessages');
  if(!form||!input||!messagesBox) return;
  const lang=()=>window.currentLanguage||localStorage.getItem('yar_language')||'fa';
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const uid=()=>Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
  const KEY='yar_conversations_v2';
  let activeId=localStorage.getItem('yar_active_conversation')||'';
  let attachments=[];

  /* Remove legacy attachment panels injected by older versions. */
  document.querySelectorAll('.yar-attach-bar,.yar-attach-list,#yarCameraModal,.yar-project-download,[id^="yarProject"],[id^="yarFileInput"],[id^="yarImageInput"]').forEach(e=>e.remove());
  const legacyObserver=new MutationObserver(()=>document.querySelectorAll('.yar-attach-bar,.yar-attach-list,#yarCameraModal,.yar-project-download,[id^="yarProject"],[id^="yarFileInput"],[id^="yarImageInput"]').forEach(e=>e.remove()));
  legacyObserver.observe(document.body,{childList:true,subtree:true});

  const style=document.createElement('style');
  style.id='yar-chat-files-v2-css';
  style.textContent=`
    #yarChatTools{position:relative;display:flex;align-items:flex-end;gap:8px;direction:rtl}
    #yarPlusBtn{width:50px;height:50px;min-width:50px;border-radius:50%;border:1px solid #d6a93a;background:#0b0b0b;color:#ffe08a;font-size:31px;line-height:1;cursor:pointer;display:grid;place-items:center;box-shadow:0 5px 20px rgba(0,0,0,.35)}
    #yarPlusBtn:hover{background:#17130b;border-color:#ffe08a}
    #yarAttachMenu{position:absolute;right:0;bottom:58px;width:255px;padding:8px;border-radius:16px;background:#0b0b0b!important;border:1px solid rgba(214,169,58,.55)!important;box-shadow:0 18px 45px rgba(0,0,0,.75);z-index:10020;display:none}
    #yarAttachMenu.show{display:block}
    #yarAttachMenu button{width:100%;display:flex;align-items:center;gap:10px;text-align:right;border:0!important;background:#11100d!important;color:#fff3c4!important;padding:12px;border-radius:11px;cursor:pointer;margin:2px 0;font-size:14px}
    #yarAttachMenu button:hover{background:#211b0d!important;color:#ffe08a!important}
    #yarAttachChips{display:flex;flex-wrap:wrap;gap:6px;margin:7px 0;direction:rtl}
    .yar-file-chip{font-size:12px;padding:6px 9px;border:1px solid rgba(214,169,58,.3);border-radius:10px;background:#11100d;color:#fff3c4}
    .yar-file-chip button{margin-inline-start:5px;background:none;border:0;color:#ffdf8a;cursor:pointer}
    #yarChatHeaderTools{display:none!important}
    .yar-chat-tool{border:1px solid rgba(214,169,58,.45);background:#0b0b0b;color:#fff3c4;border-radius:12px;padding:9px 12px;cursor:pointer}
    .yar-chat-tool:hover{background:#17130b;color:#ffe08a}
    #yarChatDrawer{position:fixed;top:0;bottom:0;right:0;width:min(340px,88vw);background:#111318!important;color:#f4f6f8!important;border-left:1px solid rgba(214,169,58,.38);z-index:10050;box-shadow:-20px 0 55px rgba(0,0,0,.75);transform:translateX(105%);transition:.2s ease;display:flex;flex-direction:column;direction:rtl}
    #yarChatDrawer.show{transform:translateX(0)}
    #yarChatDrawer .head{display:flex;align-items:center;justify-content:space-between;padding:16px;background:#171a20!important;border-bottom:1px solid rgba(214,169,58,.18)}
    #yarChatDrawer .head strong{color:#f4d477!important}
    #yarChatNew{margin:12px;padding:12px;border-radius:12px;background:#d6a93a!important;color:#17130a!important;border:0;font-weight:900;cursor:pointer}
    #yarConversationList{overflow:auto;padding:0 10px 20px}
    .yar-conv{display:flex;align-items:center;gap:7px;padding:10px;border-radius:11px;margin:4px 0;background:#1a1e25!important;border:1px solid #292e37;cursor:pointer;color:#eef1f4!important}
    .yar-conv.active{border-color:rgba(214,169,58,.7)!important;background:#242830!important;color:#fff!important}
    .yar-conv .title{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px}
    .yar-conv .del{background:transparent!important;border:0!important;color:#b9ab83!important;padding:4px;cursor:pointer}
    .yar-conv .del:hover{color:#ff8f8f!important}
    #yarDrawerOverlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10040;display:none}
    #yarDrawerOverlay.show{display:block}
    @media(max-width:600px){#yarAttachMenu{right:-4px;width:230px}.input-form{gap:7px!important}}
  `;
  document.head.appendChild(style);

  const chatSection=document.getElementById('page-chat');
  const title=chatSection?.querySelector('.page-title');
  if(title){
    const tools=document.createElement('div');tools.id='yarChatHeaderTools';
    tools.innerHTML='<button type="button" class="yar-chat-tool" id="yarNewChatTop">＋ چت جدید</button><button type="button" class="yar-chat-tool" id="yarHistoryTop">☰ تاریخچه چت‌ها</button>';
    title.insertAdjacentElement('afterend',tools);
  }

  const overlay=document.createElement('div');overlay.id='yarDrawerOverlay';document.body.appendChild(overlay);
  const drawer=document.createElement('aside');drawer.id='yarChatDrawer';drawer.innerHTML='<div class="head"><strong>💬 گفتگوهای یار</strong><button type="button" class="yar-chat-tool" id="yarDrawerClose">×</button></div><button type="button" id="yarChatNew">＋ چت جدید</button><div id="yarConversationList"></div>';document.body.appendChild(drawer);
  const list=document.getElementById('yarConversationList');

  function getConvs(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}}
  function saveConvs(v){localStorage.setItem(KEY,JSON.stringify(v.slice(0,100)))}
  function current(){let a=getConvs().find(x=>x.id===activeId);if(!a){a={id:uid(),title:'چت جدید',messages:[],createdAt:Date.now(),updatedAt:Date.now()};const all=getConvs();all.unshift(a);saveConvs(all);activeId=a.id;localStorage.setItem('yar_active_conversation',activeId)}return a}
  function renderList(){const all=getConvs().sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));list.innerHTML=all.length?all.map(c=>`<div class="yar-conv ${c.id===activeId?'active':''}" data-id="${esc(c.id)}"><span class="title">${esc(c.title||'چت جدید')}</span><button class="del" type="button" title="حذف">🗑</button></div>`).join(''):'<div style="padding:16px;color:#b9ab83;text-align:center">هنوز گفتگویی ذخیره نشده است.</div>';list.querySelectorAll('.yar-conv').forEach(el=>{el.onclick=e=>{if(e.target.closest('.del'))return;loadConv(el.dataset.id)};el.querySelector('.del').onclick=e=>{e.stopPropagation();deleteConv(el.dataset.id)}})}
  function openDrawer(){renderList();drawer.classList.add('show');overlay.classList.add('show')}
  function closeDrawer(){drawer.classList.remove('show');overlay.classList.remove('show')}
  function clearMessages(){messagesBox.innerHTML='<div class="card" id="chatWelcome"><h3>سلام! 👋</h3><p>من یار افغانستان هستم. در دری، پشتو و انگلیسی در کنار شما هستم.</p></div>'}
  function renderMessages(conv){clearMessages();for(const m of conv.messages||[]){if(m.role==='user'||m.role==='assistant') addMessage(m.content,m.role==='user'?'user':'ai')}}
  function loadConv(id){const c=getConvs().find(x=>x.id===id);if(!c)return;activeId=id;localStorage.setItem('yar_active_conversation',id);renderMessages(c);closeDrawer();renderList()}
  function newChat(){const c={id:uid(),title:'چت جدید',messages:[],createdAt:Date.now(),updatedAt:Date.now()};const all=getConvs();all.unshift(c);saveConvs(all);activeId=c.id;localStorage.setItem('yar_active_conversation',c.id);clearMessages();attachments=[];renderChips();closeDrawer();input.focus();renderList()}
  function deleteConv(id){const all=getConvs().filter(x=>x.id!==id);saveConvs(all);if(activeId===id){activeId=all[0]?.id||'';if(activeId)loadConv(activeId);else newChat()}renderList()}
  function addMessage(text,sender){document.getElementById('chatWelcome')?.remove();const m=document.createElement('div');m.className='message '+(sender==='user'?'user-message':'ai-message');const c=document.createElement('div');c.className='message-content';c.textContent=text;m.appendChild(c);messagesBox.appendChild(m);messagesBox.scrollTop=messagesBox.scrollHeight}
  function persist(role,content){const c=current();c.messages.push({role,content});c.updatedAt=Date.now();if(role==='user'&&c.title==='چت جدید')c.title=String(content).replace(/\s+/g,' ').slice(0,55)||'چت جدید';const all=getConvs().filter(x=>x.id!==c.id);all.unshift(c);saveConvs(all);renderList()}

  const originalOnSubmit=form.onsubmit;
  const toolWrap=document.createElement('div');toolWrap.id='yarChatTools';
  const plus=document.createElement('button');plus.id='yarPlusBtn';plus.type='button';plus.setAttribute('aria-label','افزودن فایل');plus.textContent='+';
  const menu=document.createElement('div');menu.id='yarAttachMenu';menu.innerHTML='<button type="button" data-action="new">＋ چت جدید</button><button type="button" data-action="history">🕘 تاریخچه چت‌ها</button><button type="button" data-kind="file">📎 فایل / PDF / Word / Excel</button><button type="button" data-kind="image">🖼️ عکس</button><button type="button" data-kind="video">🎬 ویدیو</button><button type="button" data-kind="zip">📦 پروژه ZIP</button>';
  const chips=document.createElement('div');chips.id='yarAttachChips';
  toolWrap.append(plus,menu);
  const inputForm=form;
  inputForm.insertBefore(toolWrap,input);
  inputForm.parentNode.insertBefore(chips,inputForm);
  plus.onclick=e=>{e.stopPropagation();menu.classList.toggle('show')};document.addEventListener('click',e=>{if(!menu.contains(e.target)&&e.target!==plus)menu.classList.remove('show')});
  function renderChips(){chips.innerHTML=attachments.map((a,i)=>`<span class="yar-file-chip">${a.icon} ${esc(a.name)} <button type="button" data-i="${i}">×</button></span>`).join('');chips.querySelectorAll('button').forEach(b=>b.onclick=()=>{attachments.splice(Number(b.dataset.i),1);renderChips()})}
  function choose(kind){const inp=document.createElement('input');inp.type='file';inp.multiple=kind==='file';inp.accept=kind==='image'?'image/*':kind==='video'?'video/*':kind==='zip'?'.zip,application/zip':'*/*';inp.onchange=async()=>{for(const f of [...inp.files].slice(0,kind==='file'?6:1)){attachments.push({kind,name:f.name,file:f,icon:kind==='image'?'🖼️':kind==='video'?'🎬':kind==='zip'?'📦':'📎'});}renderChips();menu.classList.remove('show')};inp.click()}
  menu.querySelectorAll('button').forEach(b=>b.onclick=()=>{if(b.dataset.action==='new'){newChat();menu.classList.remove('show');return}if(b.dataset.action==='history'){openDrawer();menu.classList.remove('show');return}choose(b.dataset.kind)});

  async function loadScriptAny(urls, check){
    if(check&&check()) return true;
    let last=null;
    for(const src of urls){
      try{
        await new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.async=true;s.onload=res;s.onerror=()=>rej(new Error(src));document.head.appendChild(s)});
        if(!check||check()) return true;
      }catch(e){last=e}
    }
    throw new Error('کتابخانه مورد نیاز بارگذاری نشد. لطفاً اتصال اینترنت را بررسی کنید.');
  }
  async function textFromDocx(f){
    await loadScriptAny([
      'https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js',
      'https://unpkg.com/mammoth@1.8.0/mammoth.browser.min.js'
    ],()=>!!window.mammoth);
    const r=await window.mammoth.extractRawText({arrayBuffer:await f.arrayBuffer()});return r.value||'';
  }
  async function textFromPdf(f){
    await loadScriptAny([
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.js',
      'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.min.mjs',
      'https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.min.mjs'
    ],()=>!!window.pdfjsLib);
    if(!window.pdfjsLib) throw new Error('PDF library unavailable');
    window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js';
    const p=await window.pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise;let out=[];
    for(let i=1;i<=Math.min(50,p.numPages);i++){const pg=await p.getPage(i),tc=await pg.getTextContent();out.push(tc.items.map(x=>x.str||'').join(' '))}
    return out.join('\n').slice(0,100000)
  }
  async function textFromSheet(f){
    await loadScriptAny([
      'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js',
      'https://cdn.jsdelivr.net/npm/xlsx@0.20.3/dist/xlsx.full.min.js',
      'https://unpkg.com/xlsx@0.20.3/dist/xlsx.full.min.js'
    ],()=>!!window.XLSX);
    const wb=window.XLSX.read(await f.arrayBuffer(),{type:'array'});return wb.SheetNames.map(n=>'### Sheet: '+n+'\n'+window.XLSX.utils.sheet_to_csv(wb.Sheets[n])).join('\n\n').slice(0,100000)
  }
  async function textFromPptx(f){
    await loadScriptAny([
      'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
      'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js',
      'https://unpkg.com/jszip@3.10.1/dist/jszip.min.js'
    ],()=>!!window.JSZip);
    const z=await window.JSZip.loadAsync(await f.arrayBuffer());let out=[];
    for(const n of Object.keys(z.files)){if(/^ppt\/slides\/slide\d+\.xml$/i.test(n)){const x=await z.files[n].async('string');const vals=[...x.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map(m=>m[1].replace(/<[^>]+>/g,''));out.push(vals.join(' '))}}
    return out.join('\n').slice(0,100000)
  }
  async function extractText(f){const n=f.name.toLowerCase();if(/\.pdf$/.test(n))return textFromPdf(f);if(/\.docx$/.test(n))return textFromDocx(f);if(/\.(xlsx|xls|xlsm|csv)$/.test(n))return textFromSheet(f);if(/\.pptx$/.test(n))return textFromPptx(f);return (await f.text()).slice(0,100000)}
  async function dataUrl(f){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(new Error('خواندن تصویر ناموفق بود.'));r.readAsDataURL(f)})}
  async function sendAttachment(a,question){
    if(a.kind==='image'){const r=await fetch('/api/vision',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:await dataUrl(a.file),prompt:question||'این تصویر را دقیق تحلیل کن.',language:lang()})});const d=await r.json();if(!r.ok||!d.success)throw new Error(d.error||'تحلیل تصویر ناموفق بود.');return d.reply||d.message||''}
    if(a.kind==='video'){const url=URL.createObjectURL(a.file);try{const v=document.createElement('video');v.src=url;v.muted=true;v.playsInline=true;await new Promise((res,rej)=>{v.onloadedmetadata=res;v.onerror=()=>rej(new Error('خواندن ویدیو ناموفق بود.'))});const duration=Math.max(0,Number(v.duration)||0),count=Math.min(6,Math.max(2,Math.ceil(duration/20)||2)),descs=[];const c=document.createElement('canvas');for(let i=0;i<count;i++){v.currentTime=count===1?0:Math.min(duration-0.05,(duration*i)/(count-1));await new Promise(res=>v.onseeked=res);c.width=v.videoWidth||640;c.height=v.videoHeight||360;c.getContext('2d').drawImage(v,0,0,c.width,c.height);const image=c.toDataURL('image/jpeg',.72);const r=await fetch('/api/vision',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image,prompt:(question||'این فریم ویدیو را دقیق توصیف کن.')+' زمان تقریبی: '+Math.round(v.currentTime)+' ثانیه.',language:lang()})});const d=await r.json();if(d.success)descs.push('فریم '+Math.round(v.currentTime)+' ثانیه: '+(d.reply||d.message||''))}if(!descs.length)throw new Error('از ویدیو فریم قابل تحلیل دریافت نشد.');const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:'بر اساس توضیحات فریم‌های این ویدیو، یک تحلیل یکپارچه و دقیق ارائه کن. درخواست کاربر: '+(question||'ویدیو را تحلیل کن.')+'\n\n'+descs.join('\n'),language:lang()})});const d=await r.json();if(!r.ok||!d.success)throw new Error(d.error||'جمع‌بندی ویدیو ناموفق بود.');return d.reply||d.message||''}finally{URL.revokeObjectURL(url)}}
    if(a.kind==='zip'){const fd=new FormData();fd.append('file',a.file,a.name);fd.append('action','analyze');fd.append('instruction',question||'این پروژه ZIP را کامل تحلیل کن: ساختار، قابلیت‌ها، تکنولوژی‌ها، فایل‌های مهم و مشکلات.');const r=await fetch('/api/project',{method:'POST',body:fd});const d=await r.json().catch(()=>({}));if(!r.ok||!d.success)throw new Error(d.error||'تحلیل ZIP ناموفق بود.');return JSON.stringify(d.project?.analysis||d.project||d,null,2)}
    // Route by actual filename, not only by the menu button. This fixes ZIP/PDF/Word/Excel chosen from the generic File picker.
    const ext=(a.name.split('.').pop()||'').toLowerCase();
    if(ext==='zip' || ext==='zipx'){
      const fd=new FormData();fd.append('file',a.file,a.name);fd.append('action','analyze');fd.append('instruction',question||'این پروژه ZIP را کامل تحلیل کن: ساختار، قابلیت‌ها، تکنولوژی‌ها، فایل‌های مهم و مشکلات.');
      const r=await fetch('/api/project',{method:'POST',body:fd});const d=await r.json().catch(()=>({}));
      if(!r.ok||!d.success) throw new Error(d.error||'تحلیل ZIP ناموفق بود.');
      return JSON.stringify(d.project?.analysis||d.project||d,null,2);
    }
    // Server-side parsing is the primary path for documents. Browser libraries are only a fallback.
    try{
      const fd=new FormData();fd.append('file',a.file,a.name);fd.append('question',question||'این فایل را دقیق تحلیل و خلاصه کن.');fd.append('language',lang());
      const r=await fetch('/api/file-binary',{method:'POST',body:fd});
      const d=await r.json().catch(()=>({}));
      if(r.ok&&d.success) return d.reply||d.message||'';
      const serverError=d.error||'تحلیل سمت سرور فایل ناموفق بود.';
      // Fallback for plain-text files if the binary parser/provider is unavailable.
      if(!/^(txt|md|csv|json|html|css|js|ts|jsx|tsx|py|java|php|sql|xml|yaml|yml)$/.test(ext)) throw new Error(serverError);
    }catch(serverEx){
      const content=await extractText(a.file);
      if(!content.trim()) throw serverEx;
      const r=await fetch('/api/file',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:a.name,text:content,question:question||'این فایل را دقیق تحلیل و خلاصه کن.',language:lang()})});
      const d=await r.json().catch(()=>({}));if(!r.ok||!d.success) throw new Error(d.error||serverEx.message||'تحلیل فایل ناموفق بود.');
      return d.reply||d.message||'';
    }
  }
  async function submit(e){e.preventDefault();const q=input.value.trim();if(!q&&!attachments.length)return;const conv=current();const hist=(conv.messages||[]).slice(-10);const shown=attachments.map(a=>`${a.icon} ${a.name}`).join('، ');const userDisplay=q+(shown?'\n'+shown:'');input.value='';addMessage(userDisplay,'user');persist('user',userDisplay);const loading=document.createElement('div');loading.className='message ai-message loading-message';loading.innerHTML='<div class="message-content">در حال بررسی…</div>';messagesBox.appendChild(loading);try{let answer='';if(attachments.length){const pieces=[];for(const a of attachments)pieces.push(`فایل ${a.name}:\n${await sendAttachment(a,q)}`);answer=pieces.join('\n\n')}else{const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:q,language:lang(),messages:hist})});const d=await r.json();if(!r.ok||d.success===false)throw new Error(d.error||'ارتباط با هوش مصنوعی برقرار نشد.');answer=d.reply||d.message||''}loading.remove();addMessage(answer,'ai');persist('assistant',answer)}catch(err){loading.remove();const answer='❌ '+(err.message||'خطا');addMessage(answer,'ai');persist('assistant',answer)}finally{attachments=[];renderChips()}}
  form.onsubmit=submit;
  document.getElementById('yarDrawerClose').onclick=closeDrawer;overlay.onclick=closeDrawer;document.getElementById('yarChatNew').onclick=newChat;
  /* Migrate the old one-question/one-answer history before creating a new conversation. */
  const old=(()=>{try{return JSON.parse(localStorage.getItem('yar_history')||'[]')}catch{return[]}})();
  if(old.length&&!getConvs().length){const c={id:uid(),title:String(old[0]?.question||'گفتگو').replace(/\s+/g,' ').slice(0,55)||'گفتگو',messages:old.slice().reverse().flatMap(x=>[{role:'user',content:String(x.question||'')},{role:'assistant',content:String(x.answer||'')}]),createdAt:Date.now(),updatedAt:Date.now()};saveConvs([c]);activeId=c.id;localStorage.setItem('yar_active_conversation',activeId)}
  current();renderList();
})();
