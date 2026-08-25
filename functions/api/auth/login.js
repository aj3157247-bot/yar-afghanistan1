import { body, json, sha256, newToken, cookieOptions } from '../../_utils.js';
export async function onRequestPost(context){
 const db=context.env.DB; if(!db)return json({success:false,error:'D1 database is not configured.'},503);
 const b=await body(context.request); const email=String(b.email||'').trim().toLowerCase(), password=String(b.password||'');
 const user=await db.prepare('SELECT id,name,email,avatar,password_hash FROM users WHERE email=?').bind(email).first();
 if(!user || user.password_hash!==await sha256(password))return json({success:false,error:'ایمیل یا رمز عبور نادرست است.'},401);
 const token=newToken(); await db.prepare('INSERT INTO sessions(token,user_id,expires_at) VALUES(?,?,?)').bind(token,user.id,Date.now()+2592000000).run();
 return json({success:true,user:{id:user.id,name:user.name,email:user.email,avatar:user.avatar}},200,{'Set-Cookie':`yar_session=${encodeURIComponent(token)}; ${cookieOptions()}`});
}
