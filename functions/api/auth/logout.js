import { getCookie, json } from '../../_utils.js';
export async function onRequestPost(context){ const db=context.env.DB; const token=getCookie(context.request,'yar_session'); if(db&&token)await db.prepare('DELETE FROM sessions WHERE token=?').bind(token).run(); return json({success:true},200,{'Set-Cookie':'yar_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'}); }
