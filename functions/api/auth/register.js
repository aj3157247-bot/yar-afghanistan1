import { body, json, sha256, newToken, cookieOptions } from '../../_utils.js';
export async function onRequestPost(context){
 const db=context.env.DB; if(!db)return json({success:false,error:'D1 database is not configured.'},503);
 const b=await body(context.request); const name=String(b.name||'').trim(), email=String(b.email||'').trim().toLowerCase(), password=String(b.password||'');
 if(!name||!email||password.length<6)return json({success:false,error:'نام، ایمیل و رمز عبور حداقل ۶ کاراکتری لازم است.'},400);
 const exists=await db.prepare('SELECT id FROM users WHERE email=?').bind(email).first(); if(exists)return json({success:false,error:'این حساب قبلاً وجود دارد.'},409);
 const id=crypto.randomUUID(), hash=await sha256(password), now=Date.now(), token=newToken();
 await db.batch([
  db.prepare('INSERT INTO users(id,name,email,password_hash,avatar,created_at) VALUES(?,?,?,?,?,?)').bind(id,name,email,hash,'👤',now),
  db.prepare('INSERT INTO sessions(token,user_id,expires_at) VALUES(?,?,?)').bind(token,id,now+2592000000)
 ]);
 return json({success:true,user:{id,name,email,avatar:'👤'}},200,{'Set-Cookie':`yar_session=${encodeURIComponent(token)}; ${cookieOptions()}`});
}
