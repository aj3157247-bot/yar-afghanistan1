import { body, json, openRouter } from '../_utils.js';

const MAX_INPUT = 260000;
const MAX_FILES = 120;
const MAX_FILE_CHARS = 18000;

const SYSTEM = `You are the coding agent inside Yar Afghanistan.
You receive a project file tree and file contents plus a user's requested change.
Return ONLY valid JSON with this exact shape:
{"summary":"short Persian/Dari summary","files":[{"path":"relative/path","action":"modify|create|delete","content":"complete file content for modify/create"}]}
Rules:
- Never include markdown fences.
- Only return files that must be changed, created, or deleted.
- For modify/create, content MUST be the complete final file, not a patch.
- Preserve existing functionality unless the request requires changing it.
- Use relative safe paths only. Never use .., absolute paths, secrets, .env values, or API keys.
- Do not invent files that are unnecessary.
- If a binary file cannot be represented as text, do not modify it; explain in summary.
- Prefer small, focused changes.`;

function safePath(p){
  const s=String(p||'').replaceAll('\\','/').replace(/^\/+/, '');
  return !!s && !s.split('/').includes('..') && !s.includes('\0') && !/^([A-Za-z]:)/.test(s) ? s : null;
}

function extractJson(text){
  let s=String(text||'').trim();
  s=s.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim();
  try{return JSON.parse(s);}catch{}
  const a=s.indexOf('{'), b=s.lastIndexOf('}');
  if(a>=0&&b>a){try{return JSON.parse(s.slice(a,b+1));}catch{}}
  return null;
}

export async function onRequestPost(context){
  const b=await body(context.request);
  const instruction=String(b.instruction||b.prompt||'').trim();
  if(!instruction) return json({success:false,error:'درخواست پروژه لازم است.'},400);
  let files=Array.isArray(b.files)?b.files:[];
  files=files.slice(0,MAX_FILES).map(f=>({path:safePath(f?.path),content:String(f?.content||'').slice(0,MAX_FILE_CHARS)})).filter(f=>f.path);
  if(!files.length) return json({success:false,error:'هیچ فایل متنی برای بررسی ارسال نشده است.'},400);

  const payload=`USER REQUEST:\n${instruction.slice(0,10000)}\n\nPROJECT FILES:\n${files.map(f=>`--- ${f.path} ---\n${f.content}`).join('\n').slice(0,MAX_INPUT)}`;
  const result=await openRouter(context,[{role:'system',content:SYSTEM},{role:'user',content:payload}],{max_tokens:12000,temperature:0.15});
  if(result.status!==200) return result;
  const data=await result.json().catch(()=>({}));
  const parsed=extractJson(data.reply);
  if(!parsed||!Array.isArray(parsed.files)) return json({success:false,error:'مدل پاسخ ساختاریافته معتبر برنگرداند. دوباره تلاش کنید.',raw:data.reply?.slice(0,3000)},502);

  const out=[];
  for(const f of parsed.files.slice(0,50)){
    const path=safePath(f?.path); const action=String(f?.action||'modify');
    if(!path||!['modify','create','delete'].includes(action)) continue;
    if(action!=='delete' && typeof f.content!=='string') continue;
    out.push({path,action,content:action==='delete'?'':f.content.slice(0,50000)});
  }
  return json({success:true,summary:String(parsed.summary||'تغییرات آماده شد.'),files:out,model:data.model||null});
}
