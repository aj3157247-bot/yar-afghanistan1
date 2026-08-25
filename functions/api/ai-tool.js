import { body, json, openRouter } from '../_utils.js';
export async function onRequestPost(context) {
  const b=await body(context.request); const prompt=String(b.prompt||'').trim();
  if(!prompt) return json({success:false,error:'prompt خالی است.'},400);
  return openRouter(context,[{role:'user',content:prompt}],{max_tokens:Number(b.max_tokens)||1600});
}
