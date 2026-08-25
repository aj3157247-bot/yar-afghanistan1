export const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers }
});

export async function body(request) {
  try { return await request.json(); } catch { return {}; }
}

export function cookieOptions() {
  return 'Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000';
}

export function getCookie(request, name) {
  const raw = request.headers.get('Cookie') || '';
  const part = raw.split(';').map(x => x.trim()).find(x => x.startsWith(name + '='));
  return part ? decodeURIComponent(part.slice(name.length + 1)) : null;
}

export function newToken() {
  return crypto.randomUUID() + crypto.randomUUID().replaceAll('-', '');
}

export async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function requireUser(context) {
  const db = context.env.DB;
  if (!db) return { error: json({ success:false, error:'D1 database is not configured.' }, 503) };
  const token = getCookie(context.request, 'yar_session');
  if (!token) return { error: json({ success:false, error:'ورود لازم است.' }, 401) };
  const row = await db.prepare(`SELECT u.id,u.name,u.email,u.avatar FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires_at>?`).bind(token, Date.now()).first();
  if (!row) return { error: json({ success:false, error:'نشست منقضی شده است.' }, 401) };
  return { user: row };
}

export async function openRouter(context, messages, extra = {}) {
  const key = context.env.OPENROUTER_API_KEY;
  if (!key) return json({ success:false, error:'OPENROUTER_API_KEY در Cloudflare تنظیم نشده است.' }, 503);
  const model = context.env.OPENROUTER_MODEL || 'openrouter/free';
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method:'POST',
    headers:{
      'Authorization':`Bearer ${key}`,
      'Content-Type':'application/json',
      'HTTP-Referer':'https://yar-afghanistan1.pages.dev',
      'X-Title':'Yar Afghanistan'
    },
    body:JSON.stringify({ model, messages, temperature:0.4, ...extra })
  });
  const raw = await r.text();
  let data; try { data = JSON.parse(raw); } catch { data = null; }
  if (!r.ok) return json({ success:false, error:data?.error?.message || `OpenRouter HTTP ${r.status}`, provider_status:r.status }, 502);
  const reply = data?.choices?.[0]?.message?.content;
  if (typeof reply !== 'string' || !reply.trim()) return json({ success:false, error:'OpenRouter پاسخ خالی برگرداند.' }, 502);
  return json({ success:true, reply:reply.trim(), model:data?.model || model });
}
