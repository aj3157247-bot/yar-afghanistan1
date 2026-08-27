export async function onRequestOptions(){
  return new Response(null,{status:204,headers:{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type","Access-Control-Allow-Methods":"GET,POST,OPTIONS"}});
}
function out(data,status=200){
  return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","Access-Control-Allow-Origin":"*"}});
}
async function init(db){
  await db.prepare(`CREATE TABLE IF NOT EXISTS analytics_devices (
    device_id TEXT PRIMARY KEY,
    device_type TEXT NOT NULL DEFAULT 'desktop',
    first_seen INTEGER NOT NULL,
    last_seen INTEGER NOT NULL
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL,
    event TEXT NOT NULL,
    ts INTEGER NOT NULL
  )`).run();
}
export async function onRequestPost({request,env}){
  if(!env?.DB) return out({success:false,error:'D1 binding DB is not configured',code:'NO_DB'},503);
  let body={}; try{body=await request.json()}catch{ return out({success:false,error:'Invalid JSON'},400); }
  const deviceId=String(body.device_id||'').trim().slice(0,120);
  const type=body.device_type==='mobile'?'mobile':'desktop';
  const event=String(body.event||'heartbeat').slice(0,40).replace(/[^a-zA-Z0-9_-]/g,'');
  if(!deviceId) return out({success:false,error:'device_id required'},400);
  const now=Date.now();
  await init(env.DB);
  await env.DB.prepare(`INSERT INTO analytics_devices(device_id,device_type,first_seen,last_seen) VALUES(?,?,?,?) ON CONFLICT(device_id) DO UPDATE SET device_type=excluded.device_type,last_seen=excluded.last_seen`).bind(deviceId,type,now,now).run();
  await env.DB.prepare(`INSERT INTO analytics_events(device_id,event,ts) VALUES(?,?,?)`).bind(deviceId,event,now).run();
  return out({success:true});
}
export async function onRequestGet({env}){
  if(!env?.DB) return out({success:false,error:'D1 binding DB is not configured',code:'NO_DB'},503);
  await init(env.DB);
  const now=Date.now(), five=now-5*60*1000, day=now-24*60*60*1000;
  const q=async(sql)=>{const r=await env.DB.prepare(sql).first();return Number(r?.n||0)};
  const total=await q(`SELECT COUNT(*) n FROM analytics_devices`);
  const active=await q(`SELECT COUNT(*) n FROM analytics_devices WHERE last_seen>=${five}`);
  const mobile=await q(`SELECT COUNT(*) n FROM analytics_devices WHERE device_type='mobile'`);
  const desktop=await q(`SELECT COUNT(*) n FROM analytics_devices WHERE device_type='desktop'`);
  const todayEvents=await q(`SELECT COUNT(*) n FROM analytics_events WHERE ts>=${day}`);
  const todayDevices=await q(`SELECT COUNT(DISTINCT device_id) n FROM analytics_events WHERE ts>=${day}`);
  return out({success:true,total_devices:total,active_devices:active,mobile_devices:mobile,desktop_devices:desktop,today_events:todayEvents,today_devices:todayDevices,generated_at:now});
}
