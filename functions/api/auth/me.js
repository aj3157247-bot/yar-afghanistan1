import { json, requireUser } from '../../_utils.js';
export async function onRequestGet(context){ const r=await requireUser(context); if(r.error)return r.error; return json({success:true,user:r.user}); }
