/* Yar AI Chat Experience v2.4 - reliable attachment routing + ZIP analysis */
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const page=$('page-chat'), form=$('chatForm'), input=$('messageInput'), messages=$('chatMessages');
  if(!page||!form||!input||!messages)return;

  const KEY='yar_conversations_v2';
  const MAX_FILE=25*1024*1024;
  const MAX_VIDEO=60*1024*1024;
  const MAX_TEXT=20*1024*1024;
  let conversations=[];
  let currentId=null;
  let attachments=[];

  const style=document.createElement('style');
  style.textContent=`
    #yarChatTop{display:flex;align-items:center;gap:8px;margin-bottom:10px}
    .yar-chat-icon{width:42px;height:42px;border:1px solid rgba(8,125,109,.18);border-radius:14px;background:var(--card,#fff);cursor:pointer;font-size:20px}
    .yar-chat-icon:hover{transform:translateY(-1px)}
    .yar-chat-shell{position:relative}
    #yarPlusWrap{position:relative;display:flex;align-items:flex-end}
    #yarPlusBtn{width:44px;height:44px;border:1px solid rgba(8,125,109,.2);border-radius:50%;background:var(--card,#fff);font-size:25px;cursor:pointer;line-height:1}
    #yarPlusMenu{position:absolute;bottom:52px;right:0;width:250px;background:var(--card,#fff);border:1px solid rgba(8,125,109,.16);border-radius:18px;box-shadow:0 18px 50px rgba(0,0,0,.16);padding:7px;display:none;z-index:1000}
    #yarPlusMenu.show{display:block}
    .yar-menu-item{width:100%;display:flex;align-items:center;gap:10px;border:0;background:transparent;padding:12px;border-radius:12px;text-align:right;cursor:pointer;font-size:13px;color:inherit}
    .yar-menu-item:hover{background:rgba(8,125,109,.08)}
    .yar-menu-item small{display:block;opacity:.6;margin-top:2px}
    #yarAttachInput{display:none}
    #yarAttachmentList{display:flex;gap:6px;flex-wrap:wrap;margin:7px 0}
    .yar-a-chip{display:flex;align-items:center;gap:6px;padding:7px 9px;border-radius:12px;background:rgba(8,125,109,.08);font-size:12px}
    .yar-a-chip button{border:0;background:transparent;cursor:pointer;font-size:15px}
    #yarChatDrawer{position:fixed;top:0;bottom:0;right:0;width:min(330px,88vw);background:var(--card,#fff);z-index:99998;box-shadow:-20px 0 70px rgba(0,0,0,.2);transform:translateX(105%);transition:.22s;padding:14px;display:flex;flex-direction:column;gap:10px}
    #yarChatDrawer.show{transform:translateX(0)}
    .yar-drawer-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
    .yar-drawer-title{font-weight:900;font-size:17px}
    .yar-new-chat{border:0;border-radius:13px;padding:11px 13px;background:#087d6d;color:#fff;cursor:pointer;font-weight:800}
    #yarConvList{overflow:auto;display:grid;gap:5px;padding-top:3px}
    .yar-conv{display:flex;align-items:center;gap:5px;border-radius:12px;padding:9px 8px;cursor:pointer}
    .yar-conv:hover,.yar-conv.active{background:rgba(8,125,109,.08)}
    .yar-conv-main{min-width:0;flex:1}
    .yar-conv-title{font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .yar-conv-date{font-size:10px;opacity:.55;margin-top:2px}
    .yar-conv-delete{border:0;background:transparent;cursor:pointer;opacity:.55;padding:6px}
    #yarDrawerOverlay{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:99997;display:none}
    #yarDrawerOverlay.show{display:block}
    body.dark #yarPlusBtn,body.dark #yarPlusMenu,body.dark #yarChatDrawer,.dark #yarPlusBtn,.dark #yarPlusMenu,.dark #yarChatDrawer{background:#171717;color:#fff}
    body.dark .yar-a-chip,.dark .yar-a-chip{background:#12352f}
    .yar-file-progress{font-size:11px;opacity:.7;margin:5px 0}
    .yar-video-preview{max-width:180px;border-radius:12px;margin-top:5px}
  `;
  document.head.appendChild(style);

  // Remove the older, always-visible ZIP toolbar so all attachments live under +.
  document.querySelectorAll('.yar-project-tools').forEach(e=>e.style.display='none');
  document.querySelectorAll('#yar-ai-attachments-css').forEach(e=>e.remove());

  function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');conversations=Array.isArray(x)?x:[]}catch{conversations=[]}}
  function persist(){localStorage.setItem(KEY,JSON.stringify(conversations.slice(0,50)))}
  function titleFor(text){const t=String(text||'').replace(/\s+/g,' ').trim();return t? t.slice(0,55):'گفتگوی جدید'}
  function current(){return conversations.find(c=>c.id===currentId)||null}
  function ensureConversation(){let c=current();if(!c){c={id:'c_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),title:'گفتگوی جدید',createdAt:Date.now(),updatedAt:Date.now(),messages:[]};conversations.unshift(c);currentId=c.id;persist();}return c}

  load();
  if(!conversations.length){
    // Migrate the old one-question/answer history without losing it.
    try{const old=JSON.parse(localStorage.getItem('yar_history')||'[]');if(Array.isArray(old)&&old.length){conversations=old.slice(0,50).map((x,i)=>({id:'legacy_'+(x.id||Date.now()+i),title:titleFor(x.question),createdAt:Date.now(),updatedAt:Date.now(),messages:[{role:'user',content:String(x.question||'')},{role:'assistant',content:String(x.answer||'')}] }));persist();}}catch{}
  }

  const top=document.createElement('div');top.id='yarChatTop';
  top.innerHTML='<button type="button" class="yar-chat-icon" id="yarHistoryBtn" title="گفتگوهای قبلی">☰</button><strong style="font-size:15px">گفتگوهای یار</strong><span style="flex:1"></span><button type="button" class="yar-chat-icon" id="yarNewBtn" title="چت جدید">＋</button>';
  page.querySelector('.page-title')?.after(top);

  const plusWrap=document.createElement('div');plusWrap.id='yarPlusWrap';
  plusWrap.innerHTML=`<button type="button" id="yarPlusBtn" aria-label="افزودن فایل">＋</button><div id="yarPlusMenu"><button class="yar-menu-item" data-kind="files">📎 <span><b>فایل</b><small>PDF، Word، Excel، کد و متن</small></span></button><button class="yar-menu-item" data-kind="image">🖼️ <span><b>عکس</b><small>JPG، PNG، WEBP و سایر تصاویر</small></span></button><button class="yar-menu-item" data-kind="video">🎬 <span><b>ویدیو</b><small>تحلیل فریم‌های مهم و تصویر ویدیو</small></span></button><button class="yar-menu-item" data-kind="zip">📦 <span><b>پروژه ZIP</b><small>تحلیل ساختار و اصلاح پروژه</small></span></button></div>`;
  const send=form.querySelector('#sendButton');
  form.insertBefore(plusWrap,send);
  const hidden=document.createElement('input');hidden.type='file';hidden.id='yarAttachInput';hidden.multiple=true;form.appendChild(hidden);
  const list=document.createElement('div');list.id='yarAttachmentList';form.parentNode.insertBefore(list,form);

  const overlay=document.createElement('div');overlay.id='yarDrawerOverlay';document.body.appendChild(overlay);
  const drawer=document.createElement('aside');drawer.id='yarChatDrawer';drawer.innerHTML=`<div class="yar-drawer-head"><div class="yar-drawer-title">گفتگوهای قبلی</div><button type="button" class="yar-chat-icon" id="yarCloseDrawer">×</button></div><button type="button" class="yar-new-chat" id="yarDrawerNew">＋ چت جدید</button><div id="yarConvList"></div>`;document.body.appendChild(drawer);

  function renderAttachments(){list.innerHTML='';attachments.forEach((a,i)=>{const d=document.createElement('div');d.className='yar-a-chip';d.innerHTML=`<span>${a.icon} ${esc(a.file.name)}</span><button type="button">×</button>`;d.querySelector('button').onclick=()=>{attachments.splice(i,1);renderAttachments()};list.appendChild(d)})}
  function openDrawer(){renderConversations();drawer.classList.add('show');overlay.classList.add('show')}
  function closeDrawer(){drawer.classList.remove('show');overlay.classList.remove('show')}
  function renderConversations(){const box=$('yarConvList');box.innerHTML='';if(!conversations.length){box.innerHTML='<div style="opacity:.6;font-size:12px;padding:15px">هنوز گفتگویی ذخیره نشده است.</div>';return}conversations.slice().sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0)).forEach(c=>{const d=document.createElement('div');d.className='yar-conv'+(c.id===currentId?' active':'');d.innerHTML=`<div class="yar-conv-main"><div class="yar-conv-title">${esc(c.title)}</div><div class="yar-conv-date">${new Date(c.updatedAt||c.createdAt||Date.now()).toLocaleString('fa-AF')}</div></div><button type="button" class="yar-conv-delete" title="حذف">🗑️</button>`;d.querySelector('.yar-conv-main').onclick=()=>{openConversation(c.id);closeDrawer()};d.querySelector('.yar-conv-delete').onclick=e=>{e.stopPropagation();if(confirm('این گفتگو حذف شود؟')){conversations=conversations.filter(x=>x.id!==c.id);if(currentId===c.id)currentId=null;persist();if(!currentId)newChat(false);renderConversations()}};box.appendChild(d)})}
  function clearMessages(){messages.innerHTML='<div class="card" id="chatWelcome"><h3>سلام! 👋</h3><p>من یار افغانستان هستم. در دری، پشتو و انگلیسی در کنار شما هستم.</p></div>'}
  function add(role,text){$('chatWelcome')?.remove();const m=document.createElement('div');m.className='message '+(role==='user'?'user-message':'ai-message');const c=document.createElement('div');c.className='message-content';c.textContent=text;m.appendChild(c);messages.appendChild(m);messages.scrollTop=messages.scrollHeight}
  function renderConversation(c){clearMessages();if(!c)return;for(const m of c.messages||[])add(m.role,m.content)}
  function newChat(close=true){currentId=null;attachments=[];renderAttachments();clearMessages();if(close)closeDrawer();input.value='';input.focus()}
  function openConversation(id){const c=conversations.find(x=>x.id===id);if(!c)return;currentId=id;renderConversation(c);input.value='';input.focus()}
  function addToConversation(role,content){const c=ensureConversation();c.messages.push({role,content:String(content||'')});c.updatedAt=Date.now();if(role==='user'&&c.messages.filter(x=>x.role==='user').length===1)c.title=titleFor(content);persist()}

  async function readText(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result||''));r.onerror=()=>rej(new Error('خواندن فایل ناموفق بود.'));r.readAsText(file)})}
  async function dataURL(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)})}
  async function script(src){if(document.querySelector(`script[src="${src}"]`))return;await new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s)})}
  async function pdfText(file){await script('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.js');pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js';const p=await pdfjsLib.getDocument({data:await file.arrayBuffer()}).promise;let o=[];for(let i=1;i<=Math.min(p.numPages,40);i++){const pg=await p.getPage(i),tc=await pg.getTextContent();o.push(tc.items.map(x=>x.str||'').join(' '))}return o.join('\n').slice(0,50000)}
  async function docxText(file){await script('https://unpkg.com/mammoth@1.8.0/mammoth.browser.min.js');const r=await mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});return r.value||''}
  async function zipText(file){await script('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');const z=await JSZip.loadAsync(file),out=[];const names=Object.keys(z.files).filter(n=>!z.files[n].dir).slice(0,160);for(const n of names){if(/\.(png|jpe?g|gif|webp|ico|mp3|mp4|mov|webm|pdf|woff2?|ttf|otf|bin|exe|dll)$/i.test(n))continue;try{const t=await z.files[n].async('string');if(t)out.push({path:n,content:t.slice(0,18000)})}catch{}}return {zip:z,files:out}}
  async function vision(image,prompt){const r=await fetch('/api/vision',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image,prompt})});const d=await r.json().catch(()=>({}));if(!r.ok||!d.success)throw new Error(d.error||'تحلیل تصویر ناموفق بود.');return d.reply||''}
  async function analyzeFile(a,question){let text='';const n=a.file.name.toLowerCase();if(n.endsWith('.pdf'))text=await pdfText(a.file);else if(n.endsWith('.docx'))text=await docxText(a.file);else if(n.endsWith('.xlsx')||n.endsWith('.xls')){await script('https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js');const wb=XLSX.read(await a.file.arrayBuffer(),{type:'array'});text=wb.SheetNames.map(sn=>`Sheet: ${sn}\n`+XLSX.utils.sheet_to_csv(wb.Sheets[sn])).join('\n\n')}else if(/\.(doc|ppt|pptx)$/i.test(n))return '⚠️ این نسخه مستقیماً محتوای قدیمی DOC/PPT را استخراج نمی‌کند. لطفاً همان فایل را به DOCX یا PDF تبدیل کنید تا متن کامل تحلیل شود.';else if(/\.(txt|md|csv|json|html?|css|scss|js|jsx|ts|tsx|py|java|php|sql|xml|yaml|yml|rtf|log|ini|conf|sh|bat)$/i.test(n))text=await readText(a.file);else if(/\.zip$/i.test(n)) return await analyzeZipFile(a.file,question,false);else text=await readText(a.file).catch(()=> '');if(!text.trim())return '⚠️ این فایل محتوای متنی قابل استخراج در مرورگر ندارد.';const r=await fetch('/api/file',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:text.slice(0,60000),question:question||'این فایل را دقیق تحلیل کن و نکات مهم، ساختار، خطاها و پاسخ درخواست کاربر را توضیح بده.'})});const d=await r.json().catch(()=>({}));if(!r.ok||!d.success)throw new Error(d.error||`تحلیل فایل ناموفق بود (HTTP ${r.status}).`);return d.reply||''}
  async function analyzeVideo(file,question){if(file.size>MAX_VIDEO)throw new Error('حجم ویدیو بیشتر از 60MB است.');const url=URL.createObjectURL(file),v=document.createElement('video');v.src=url;v.muted=true;v.playsInline=true;await new Promise((ok,no)=>{v.onloadedmetadata=ok;v.onerror=()=>no(new Error('خواندن ویدیو ممکن نشد.'))});const duration=Math.min(v.duration||0,180),count=Math.min(8,Math.max(3,Math.ceil(duration/20)));const frames=[];for(let i=0;i<count;i++){v.currentTime=count===1?0:(duration*i/(count-1));await new Promise(ok=>v.onseeked=ok);const c=document.createElement('canvas');c.width=Math.min(v.videoWidth||640,960);c.height=Math.round(c.width*(v.videoHeight||360)/(v.videoWidth||640));c.getContext('2d').drawImage(v,0,0,c.width,c.height);frames.push(await new Promise(r=>c.toBlob(b=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(b)},'image/jpeg',.72)))}URL.revokeObjectURL(url);const answers=[];for(let i=0;i<frames.length;i++)answers.push(`فریم ${i+1}:\n`+await vision(frames[i],question||'این فریم از ویدیو را دقیق تحلیل کن و اتفاق یا محتوای مهم آن را بگو.'));return `تحلیل ویدیو (${Math.round(duration)} ثانیه):\n\n`+answers.join('\n\n')}
  async function analyzeZipFile(file,question,fix){
    const form=new FormData();
    form.append('file',file,file.name);
    form.append('action',fix?'fix':'analyze');
    form.append('instruction',question||'پروژه را کامل و دقیق تحلیل کن.');
    const r=await fetch('/api/project',{method:'POST',body:form});
    const ct=(r.headers.get('content-type')||'').toLowerCase();
    if(fix && r.ok && ct.includes('application/zip')){
      const blob=await r.blob();
      const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=file.name.replace(/\.zip$/i,'')+'-fixed.zip';a.textContent='📦 دریافت ZIP اصلاح‌شده';a.className='yar-project-download';a.style.cssText='display:inline-block;margin:10px 0;padding:10px 14px;border-radius:12px;background:#d8ad3f;color:#151007;font-weight:800;text-decoration:none';messages.appendChild(a);
      return 'اصلاحات پروژه انجام شد. فایل ZIP اصلاح‌شده آماده دریافت است.';
    }
    const d=await r.json().catch(()=>({}));
    if(!r.ok||!d.success)throw new Error(d.error||`تحلیل ZIP ناموفق بود (HTTP ${r.status}).`);
    let result=d.summary||d.project?.analysis?.project_summary||'تحلیل پروژه انجام شد.';
    const an=d.project?.analysis||{};
    if(Array.isArray(an.features)&&an.features.length) result+=`\n\nقابلیت‌ها:\n• ${an.features.join('\n• ')}`;
    if(Array.isArray(an.technologies)&&an.technologies.length) result+=`\n\nتکنولوژی‌ها:\n• ${an.technologies.join('\n• ')}`;
    if(Array.isArray(an.important_files)&&an.important_files.length) result+=`\n\nفایل‌های مهم:\n• ${an.important_files.join('\n• ')}`;
    if(Array.isArray(an.risks_or_issues)&&an.risks_or_issues.length) result+=`\n\nمشکلات/ریسک‌ها:\n• ${an.risks_or_issues.join('\n• ')}`;
    return result;
  }

  function menuFile(kind){hidden.accept=kind==='image'?'image/*':kind==='video'?'video/*':kind==='zip'?'.zip,application/zip':'*/*';hidden.multiple=kind!=='zip';hidden.dataset.kind=kind;hidden.click();$('yarPlusMenu').classList.remove('show')}
  $('yarPlusBtn').onclick=()=>$('yarPlusMenu').classList.toggle('show');document.addEventListener('click',e=>{if(!plusWrap.contains(e.target))$('yarPlusMenu').classList.remove('show')});plusWrap.querySelectorAll('.yar-menu-item').forEach(b=>b.onclick=()=>menuFile(b.dataset.kind));hidden.onchange=()=>{for(const f of [...hidden.files].slice(0,8)){if(f.size>MAX_FILE)continue;const k=hidden.dataset.kind==='zip'?'zip':hidden.dataset.kind==='image'?'image':hidden.dataset.kind==='video'?'video':'file';attachments.push({kind:k,file:f,icon:k==='image'?'🖼️':k==='video'?'🎬':k==='zip'?'📦':'📎'})}renderAttachments();hidden.value=''};
  $('yarHistoryBtn').onclick=openDrawer;$('yarCloseDrawer').onclick=closeDrawer;overlay.onclick=closeDrawer;$('yarNewBtn').onclick=()=>newChat(true);$('yarDrawerNew').onclick=()=>newChat(true);

  form.onsubmit=async e=>{e.preventDefault();const text=input.value.trim();if(!text&&!attachments.length)return;const c=ensureConversation();const shown=attachments.map(a=>`${a.icon} ${a.file.name}`).join('، ');const userText=text||'این فایل را بررسی و تحلیل کن.';add('user',shown?`${userText}\n${shown}`:userText);addToConversation('user',shown?`${userText}\n${shown}`:userText);input.value='';const busy=typeof addTyping==='function'?addTyping():null;try{let answer='';if(attachments.length){const pieces=[];for(const a of attachments){const fn=a.file.name.toLowerCase();const actualKind=/\.zip$/i.test(fn)?'zip':a.kind;if(actualKind==='image')pieces.push(`🖼️ ${a.file.name}:\n`+await vision(await dataURL(a.file),userText));else if(actualKind==='video')pieces.push(`🎬 ${a.file.name}:\n`+await analyzeVideo(a.file,userText));else if(actualKind==='zip'){const wantsFix=/(اصلاح|درست|رفع|fix|repair|modify|update|change)/i.test(userText);pieces.push(`📦 ${a.file.name}:\n`+await analyzeZipFile(a.file,userText,wantsFix));}else pieces.push(`📎 ${a.file.name}:\n`+await analyzeFile(a,userText))}answer=pieces.join('\n\n')}else{const hist=c.messages.filter(m=>m.role==='user'||m.role==='assistant').slice(-20);const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,messages:hist.slice(0,-1)})});const d=await r.json().catch(()=>({}));if(!r.ok||!d.success)throw new Error(d.error||'ارتباط با هوش مصنوعی برقرار نشد.');answer=d.reply||d.message||''}if(busy)busy.remove();add('assistant',answer);addToConversation('assistant',answer);attachments=[];renderAttachments()}catch(err){if(busy)busy.remove();const msg='❌ '+(err.message||'خطای نامشخص');add('assistant',msg);addToConversation('assistant',msg);attachments=[];renderAttachments()}finally{input.focus();renderConversations()}};

  // Keep the existing history page in sync with the new conversation store.
  window.saveHistory=function(question,answer){const c=ensureConversation();if(!c.messages.length||c.messages[c.messages.length-1].content!==question)addToConversation('user',question);addToConversation('assistant',answer)};
  window.renderHistory=function(){const box=$('historyList');if(!box)return;box.innerHTML='';const list=conversations.slice().sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));if(!list.length){box.innerHTML='<p class="muted center">هنوز گفتگویی ذخیره نشده است.</p>';return}list.forEach(c=>{const d=document.createElement('div');d.className='history-item';d.innerHTML=`<strong>💬 ${esc(c.title)}</strong><small>${esc(new Date(c.updatedAt||Date.now()).toLocaleString('fa-AF'))}</small>`;d.onclick=()=>{currentId=c.id;showPage('chat');renderConversation(c)};box.appendChild(d)})};

  // Do not let the old clear-history handler erase the new store silently.
  const clear=$('clearHistory');if(clear)clear.onclick=()=>{if(confirm('همه گفتگوهای ذخیره‌شده حذف شوند؟')){conversations=[];currentId=null;persist();localStorage.removeItem('yar_history');renderHistory();newChat(false);}};
  window.yarStartNewChat=()=>newChat(true);
  renderConversations();
  if(conversations.length)openConversation(conversations[0].id);else ensureConversation();
})();
