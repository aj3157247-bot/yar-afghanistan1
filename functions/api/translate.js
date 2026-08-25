import { body, json, openRouter } from '../_utils.js';
export async function onRequestPost(context) {
  const b=await body(context.request); const text=String(b.text||'').trim();
  if(!text) return json({success:false,error:'متن خالی است.'},400);
  const from=b.source||'detected language', to=b.target||'Dari';
  return openRouter(context,[{role:'system',content:`Translate naturally from ${from} to ${to}. Return only the translation.`},{role:'user',content:text}],{max_tokens:2000});
}
