/* Yar Afghanistan - Chat attachments, camera, documents and project agent */
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const chatMessages=$('chatMessages'), form=$('chatForm'), input=$('messageInput');
  if(!chatMessages||!form||!input)return;
  let attachments=[];
  let stream=null;

  const style=document.createElement('style'); style.id='yar-ai-attachments-css'; style.textContent=`
  .yar-attach-bar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:8px 0 0}
  .yar-attach-btn{border:1px solid rgba(8,125,109,.16);background:rgba(255,255,255,.9);border-radius:14px;padding:9px 11px;cursor:pointer;font-size:13px}
  .yar-attach-btn:hover{transform:translateY(-1px)}
  .yar-attach-list{display:flex;gap:7px;flex-wrap:wrap;margin:7px 0}
  .yar-attach-chip{display:flex;align-items:center;gap:6px;padding:7px 9px;border-radius:12px;background:#eef8f5;font-size:12px}
  .yar-attach-chip button{border:0;background:transparent;cursor:pointer}
  .yar-file-card{margin:7px 0;padding:10px 12px;border-radius:13px;background:rgba(8,125,109,.07);font-size:12px}
  #yarCameraModal{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:99999;display:none;align-items:center;justify-content:center;padding:18px}
  #yarCameraModal.show{display:flex}.yar-camera-box{max-width:520px;width:100%;background:#fff;border-radius:22px;padding:15px}.yar-camera-box video{width:100%;border-radius:16px;background:#111}.yar-camera-actions{display:flex;gap:8px;margin-top:10px}.yar-camera-actions button{flex:1;padding:12px;border:0;border-radius:13px;cursor:pointer}
  body.dark .yar-attach-btn,.dark .yar-camera-box{background:#171717;color:#fff}.dark .yar-attach-chip{background:#12352f;color:#fff}
  `; document.head.appendChild(style);

  const bar=document.createElement('div'); bar.className='yar-attach-bar'; bar.innerHTML=`
    <button type="button" class="yar-attach-btn" id="yarCameraBtn">📷 دوربین</button>
    <button type="button" class="yar-attach-btn" id="yarImageBtn">🖼️ عکس</button>
    <button type="button" class="yar-attach-btn" id="yarFileBtn">📎 فایل</button>
    <button type="button" class="yar-attach-btn" id="yarProjectBtn">💻 پروژه ZIP</button>
    <input id="yarImageInput" type="file" accept="image/*" multiple hidden>
    <input id="yarFileInput" type="file" accept=".txt,.md,.csv,.json,.html,.css,.js,.ts,.jsx,.tsx,.py,.java,.php,.sql,.xml,.yaml,.yml,.pdf,.docx" multiple hidden>
    <input id="yarProjectInput" type="file" accept=".zip" hidden>
  `; form.parentNode.insertBefore(bar,form);
  const list=document.createElement('div'); list.className='yar-attach-list'; form.parentNode.insertBefore(list,form);

  const modal=document.createElement('div'); modal.id='yarCameraModal'; modal.innerHTML=`<div class="yar-camera-box"><video id="yarCameraVideo" autoplay playsinline></video><canvas id="yarCameraCanvas" hidden></canvas><div class="yar-camera-actions"><button type="button" id="yarCameraClose">بستن</button><button type="button" id="yarCameraShot">📸 گرفتن عکس</button></div></div>`; document.body.appendChild(modal);
  function chip(a){const d=document.createElement('div');d.className='yar-attach-chip';d.innerHTML=`<span>${a.icon} ${escapeHtml(a.name)}</span><button type="button" aria-label="remove">×</button>`;d.querySelector('button').onclick=()=>{attachments=attachments.filter(x=>x!==a);render()};list.appendChild(d)}
  function render(){list.innerHTML='';attachments.forEach(chip)}
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function readDataURL(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(new Error('خواندن فایل ناموفق بود.'));r.readAsDataURL(file)})}
  function readText(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result||''));r.onerror=()=>rej(new Error('خواندن فایل ناموفق بود.'));r.readAsText(file)})}

  async function loadScript(src){if(document.querySelector(`script[src="${src}"]`))return;await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error('کتابخانه مورد نیاز بارگذاری نشد.'));document.head.appendChild(s)})}
  async function extractPdf(file){await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.js');if(!window.pdfjsLib)throw new Error('کتابخانه PDF در دسترس نیست.');window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js';const pdf=await window.pdfjsLib.getDocument({data:await file.arrayBuffer()}).promise;let out=[];for(let i=1;i<=Math.min(pdf.numPages,30);i++){const page=await pdf.getPage(i);const tc=await page.getTextContent();out.push(tc.items.map(x=>x.str||'').join(' '))}return out.join('\n').slice(0,30000);}
  async function extractDocx(file){await loadScript('https://unpkg.com/mammoth@1.8.0/mammoth.browser.min.js');const ab=await file.arrayBuffer();const r=await window.mammoth.extractRawText({arrayBuffer:ab});return r.value||''}

  $('yarImageBtn').onclick=()=>$('yarImageInput').click(); $('yarFileBtn').onclick=()=>$('yarFileInput').click(); $('yarProjectBtn').onclick=()=>$('yarProjectInput').click();
  $('yarImageInput').onchange=async e=>{for(const f of [...e.target.files].slice(0,4)){if(!f.type.startsWith('image/')||f.size>10*1024*1024)continue;attachments.push({kind:'image',icon:'🖼️',name:f.name,file:f,data:await readDataURL(f)})}render();e.target.value=''};
  $('yarFileInput').onchange=async e=>{for(const f of [...e.target.files].slice(0,8)){try{let content='';if(f.name.toLowerCase().endsWith('.docx'))content=await extractDocx(f);else if(f.name.toLowerCase().endsWith('.pdf'))content=await extractPdf(f);else content=await readText(f);attachments.push({kind:'file',icon:'📎',name:f.name,file:f,content:content.slice(0,30000)})}catch(err){alert(err.message)}}render();e.target.value=''};
  $('yarProjectInput').onchange=async e=>{const f=e.target.files[0];if(!f)return;attachments=[{kind:'project',icon:'💻',name:f.name,file:f}];render();e.target.value=''};

  $('yarCameraBtn').onclick=async()=>{try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});$('yarCameraVideo').srcObject=stream;modal.classList.add('show')}catch(e){alert('دسترسی به کمره ممکن نشد: '+e.message)}};
  $('yarCameraClose').onclick=closeCamera; function closeCamera(){modal.classList.remove('show');if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}}
  $('yarCameraShot').onclick=()=>{const v=$('yarCameraVideo'),c=$('yarCameraCanvas');c.width=v.videoWidth||1280;c.height=v.videoHeight||720;c.getContext('2d').drawImage(v,0,0,c.width,c.height);c.toBlob(async blob=>{const f=new File([blob],`camera-${Date.now()}.jpg`,{type:'image/jpeg'});attachments.push({kind:'image',icon:'📷',name:f.name,file:f,data:await readDataURL(f)});render();closeCamera()},'image/jpeg',.88)};

  async function projectZip(){
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
    const zip=await window.JSZip.loadAsync(attachments[0].file);const files=[];const names=Object.keys(zip.files).filter(n=>!zip.files[n].dir).slice(0,120);
    for(const name of names){const entry=zip.files[name];if(/\.(png|jpe?g|gif|webp|ico|mp3|mp4|mov|pdf|woff2?|ttf|otf|bin|exe|dll)$/i.test(name))continue;let content='';try{content=await entry.async('string')}catch{};if(content)files.push({path:name,content:content.slice(0,18000)})}
    return {zip,files};
  }
  async function runProject(inst){const {zip,files}=await projectZip();const r=await fetch('/api/project',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({instruction:inst,files})});const d=await r.json().catch(()=>({}));if(!r.ok||!d.success)throw new Error(d.error||'خطا در AI پروژه');if(!d.files?.length)return d.summary||'AI تغییری پیشنهاد نکرد.';for(const f of d.files){if(f.action==='delete'){zip.remove(f.path);continue}zip.file(f.path,f.content)}const out=await zip.generateAsync({type:'blob'});const url=URL.createObjectURL(out);const a=document.createElement('a');a.href=url;a.download=(attachments[0].name||'project.zip').replace(/\.zip$/i,'')+'-fixed.zip';a.textContent='📦 دریافت پروژه اصلاح‌شده';a.style.display='inline-block';a.style.margin='8px 0';a.className='yar-project-download';chatMessages.appendChild(a);chatMessages.scrollTop=chatMessages.scrollHeight;return d.summary||'پروژه اصلاح شد.'}

  const originalSubmit=form.onsubmit;
  form.onsubmit=async function(e){
    if(!attachments.length){if(typeof originalSubmit==='function')return originalSubmit.call(form,e);return}
    e.preventDefault(); const text=input.value.trim()||'این فایل را بررسی کن و نتیجه را توضیح بده.'; input.value='';
    const shown=attachments.map(a=>`${a.icon} ${a.name}`).join('، '); if(typeof addChatMessage==='function')addChatMessage(`${text}\n${shown}`,'user');
    const loading=typeof addTyping==='function'?addTyping():null; try{
      let answer=''; const project=attachments.find(a=>a.kind==='project');
      if(project) answer=await runProject(text);
      else {
        const pieces=[];
        for(const a of attachments){if(a.kind==='image'){const r=await fetch('/api/vision',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:a.data,prompt:text})});const d=await r.json();if(!r.ok||!d.success)throw new Error(d.error||'تحلیل تصویر ناموفق بود.');pieces.push(`تصویر ${a.name}:\n${d.reply||''}`)}
          else if(a.kind==='file'){if(a.content){const r=await fetch('/api/file',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:a.content,question:text})});const d=await r.json();if(!r.ok||!d.success)throw new Error(d.error||'تحلیل فایل ناموفق بود.');pieces.push(`فایل ${a.name}:\n${d.reply||''}`)}}
        }
        answer=pieces.join('\n\n')||'فایلی برای پردازش وجود ندارد.';
      }
      if(loading)loading.remove();if(typeof addChatMessage==='function')addChatMessage(answer,'ai');if(typeof saveHistory==='function')saveHistory(text+' ['+shown+']',answer);
    }catch(err){if(loading)loading.remove();if(typeof addChatMessage==='function')addChatMessage('❌ '+err.message,'ai')}finally{attachments=[];render();}
  };
})();
