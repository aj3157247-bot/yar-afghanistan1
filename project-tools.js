/* Yar Afghanistan - ZIP project tools */
(function(){
  const page=document.getElementById('page-chat');
  const form=document.getElementById('chatForm');
  const input=document.getElementById('messageInput');
  const messages=document.getElementById('chatMessages');
  if(!page||!form||!input||!messages)return;

  const style=document.createElement('style');
  style.textContent=`
    .yar-project-tools{margin:10px 0 12px;padding:12px;border:1px solid rgba(214,169,58,.35);border-radius:18px;background:linear-gradient(145deg,#12110d,#090909);display:grid;gap:9px}
    .yar-project-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
    .yar-project-btn{border:1px solid rgba(214,169,58,.45);background:#15120b;color:#ffe9a6;border-radius:11px;padding:9px 12px;cursor:pointer;font-weight:700}
    .yar-project-btn.primary{background:linear-gradient(135deg,#8f6110,#f1ce66,#a77518);color:#100d06;border-color:#ffe28a}
    .yar-project-btn:disabled{opacity:.55;cursor:not-allowed}
    .yar-project-file{font-size:12px;opacity:.8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}
    .yar-project-status{font-size:12px;line-height:1.8;white-space:pre-wrap;display:none}
    .yar-project-status.show{display:block}
    .yar-project-download{display:inline-block;text-decoration:none;background:#d8ad3f;color:#151007;padding:9px 12px;border-radius:11px;font-weight:800}
  `;
  document.head.appendChild(style);

  const box=document.createElement('div');
  box.className='yar-project-tools';
  box.innerHTML=`
    <div class="yar-project-row">
      <button type="button" class="yar-project-btn" id="yarProjectChoose">📦 ارسال ZIP پروژه</button>
      <input id="yarProjectFile" type="file" accept=".zip,application/zip" hidden>
      <span class="yar-project-file" id="yarProjectName">فایلی انتخاب نشده</span>
    </div>
    <div class="yar-project-row">
      <button type="button" class="yar-project-btn primary" id="yarProjectAnalyze" disabled>🔎 تحلیل ZIP</button>
      <button type="button" class="yar-project-btn" id="yarProjectFix" disabled>🛠️ اصلاح پروژه و ساخت ZIP</button>
      <button type="button" class="yar-project-btn" id="yarProjectClear" disabled>✕ حذف</button>
    </div>
    <div class="yar-project-status" id="yarProjectStatus"></div>
  `;
  const area=page.querySelector('.input-area');
  area?.parentNode.insertBefore(box,area);

  const fileInput=box.querySelector('#yarProjectFile');
  const choose=box.querySelector('#yarProjectChoose');
  const analyze=box.querySelector('#yarProjectAnalyze');
  const fix=box.querySelector('#yarProjectFix');
  const clear=box.querySelector('#yarProjectClear');
  const nameEl=box.querySelector('#yarProjectName');
  const status=box.querySelector('#yarProjectStatus');
  let selected=null;

  function setStatus(text,show=true){status.textContent=text;status.classList.toggle('show',show);}
  function addMessage(text,sender){
    document.getElementById('chatWelcome')?.remove();
    const m=document.createElement('div');m.className='message '+(sender==='user'?'user-message':'ai-message');
    const c=document.createElement('div');c.className='message-content';
    c.textContent=text;m.appendChild(c);messages.appendChild(m);messages.scrollTop=messages.scrollHeight;
    return c;
  }
  function setBusy(v){[analyze,fix,clear,choose].forEach(x=>x.disabled=v);}
  function refresh(){const ok=!!selected;analyze.disabled=!ok;fix.disabled=!ok;clear.disabled=!ok;}
  function reset(){selected=null;fileInput.value='';nameEl.textContent='فایلی انتخاب نشده';setStatus('',false);refresh();}

  choose.onclick=()=>fileInput.click();
  fileInput.onchange=()=>{
    selected=fileInput.files?.[0]||null;
    if(selected && !/\.zip$/i.test(selected.name)){setStatus('❌ فقط فایل ZIP پذیرفته می‌شود.');selected=null;fileInput.value='';}
    else if(selected){nameEl.textContent='📦 '+selected.name+' ('+Math.round(selected.size/1024)+' KB)';setStatus('ZIP آماده ارسال است. پیام اختیاری خود را در کادر چت بنویسید.');}
    refresh();
  };
  clear.onclick=reset;

  async function analyzeZip(){
    if(!selected)return;
    setBusy(true);setStatus('⏳ در حال آپلود و تحلیل ZIP...');
    const fd=new FormData();fd.append('file',selected,selected.name);fd.append('action','analyze');fd.append('instruction',input.value.trim());
    const r=await fetch('/api/project',{method:'POST',body:fd});
    const data=await r.json().catch(()=>({}));
    if(!r.ok||!data.success)throw new Error(data.error||'تحلیل ZIP انجام نشد.');
    const a=data.project?.analysis||{};
    const lines=[a.project_summary||'تحلیل انجام شد.'];
    if(a.features?.length)lines.push('\nقابلیت‌ها:\n• '+a.features.join('\n• '));
    if(a.technologies?.length)lines.push('\nتکنولوژی‌ها:\n• '+a.technologies.join('\n• '));
    if(a.important_files?.length)lines.push('\nفایل‌های مهم:\n• '+a.important_files.join('\n• '));
    if(a.risks_or_issues?.length)lines.push('\nمشکلات/ریسک‌ها:\n• '+a.risks_or_issues.join('\n• '));
    addMessage(lines.join('\n'),'ai');
    setStatus('✅ تحلیل ZIP کامل شد. برای اصلاح، درخواست تغییرات را در کادر چت بنویسید و «اصلاح پروژه» را بزنید.');
  }

  async function fixZip(){
    if(!selected) return;
    const instruction=input.value.trim();
    if(!instruction){setStatus('❌ ابتدا در کادر چت توضیح دهید چه چیزی باید در پروژه اصلاح یا اضافه شود.');input.focus();return;}
    setBusy(true);setStatus('⏳ در حال بررسی کد، اعمال تغییرات و ساخت ZIP جدید...');
    const fd=new FormData();fd.append('file',selected,selected.name);fd.append('action','fix');fd.append('instruction',instruction);
    const r=await fetch('/api/project',{method:'POST',body:fd});
    const type=r.headers.get('content-type')||'';
    if(!r.ok){const data=await r.json().catch(()=>({}));throw new Error(data.error||'اصلاح پروژه انجام نشد.');}
    if(!type.includes('application/zip'))throw new Error('سرور ZIP اصلاح‌شده برنگرداند.');
    const blob=await r.blob();
    const url=URL.createObjectURL(blob);
    addMessage('🛠️ تغییرات پروژه انجام شد. ZIP اصلاح‌شده آماده است.','ai');
    const link=document.createElement('a');link.href=url;link.download='yar-project-fixed.zip';link.className='yar-project-download';link.textContent='📦 دریافت ZIP اصلاح‌شده';
    const m=document.createElement('div');m.className='message ai-message';const c=document.createElement('div');c.className='message-content';c.appendChild(link);m.appendChild(c);messages.appendChild(m);messages.scrollTop=messages.scrollHeight;
    input.value='';setStatus('✅ ZIP اصلاح‌شده ساخته شد.');
  }

  analyze.onclick=()=>analyzeZip().catch(e=>{setStatus('❌ '+e.message);setBusy(false);refresh();});
  fix.onclick=()=>fixZip().catch(e=>{setStatus('❌ '+e.message);setBusy(false);refresh();});

  // A ZIP attached to the chat can be analyzed by pressing the normal Send button.
  form.addEventListener('submit',async function(e){
    if(!selected)return;
    e.preventDefault();e.stopImmediatePropagation();
    const instruction=input.value.trim();
    if(!instruction){await analyzeZip().catch(err=>setStatus('❌ '+err.message));return;}
    // Default behavior: a text request with an attached ZIP is an analysis request.
    await analyzeZip().catch(err=>setStatus('❌ '+err.message));
    setBusy(false);refresh();
  },true);
})();
