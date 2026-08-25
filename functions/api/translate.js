import { body, json } from '../_utils.js';

const LANGS = new Set(['auto','fa','ps','en']);

function cleanLanguage(value, fallback='auto') {
  const v = String(value || '').toLowerCase().trim();
  return LANGS.has(v) ? v : fallback;
}

function googleUrl(text, source, target) {
  const sl = source === 'auto' ? 'auto' : source;
  return `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sl)}&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(text)}`;
}

async function googleTranslate(text, source, target) {
  const r = await fetch(googleUrl(text, source, target), {
    headers: { 'Accept': 'application/json' }
  });
  if (!r.ok) throw new Error(`Google Translate HTTP ${r.status}`);
  const data = await r.json();
  const parts = Array.isArray(data?.[0]) ? data[0] : [];
  const result = parts.map(p => Array.isArray(p) ? p[0] : '').join('');
  if (!result.trim()) throw new Error('Google Translate پاسخ خالی داد.');
  return result;
}

async function myMemoryTranslate(text, source, target) {
  const pair = `${source === 'auto' ? 'en' : source}|${target}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(pair)}`;
  const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!r.ok) throw new Error(`MyMemory HTTP ${r.status}`);
  const data = await r.json();
  const result = String(data?.responseData?.translatedText || '').trim();
  if (!result || /PLEASE SELECT TWO DISTINCT LANGUAGES/i.test(result)) {
    throw new Error(data?.responseStatus ? `MyMemory status ${data.responseStatus}` : 'MyMemory پاسخ خالی داد.');
  }
  return result;
}

export async function onRequestPost(context) {
  const b = await body(context.request);
  const text = String(b.text || '').trim().slice(0, 5000);
  if (!text) return json({ success:false, error:'متن خالی است.' }, 400);

  const source = cleanLanguage(b.source, 'auto');
  const target = cleanLanguage(b.target, 'fa');

  if (target === 'auto') {
    return json({ success:false, error:'زبان مقصد را انتخاب کنید.' }, 400);
  }

  // No OpenRouter is used here. This keeps translation independent
  // from OpenRouter's free-model daily quota.
  if (source !== 'auto' && source === target) {
    return json({ success:true, translation:text, reply:text, provider:'local' });
  }

  const errors = [];
  try {
    const result = await googleTranslate(text, source, target);
    return json({ success:true, translation:result, reply:result, provider:'google-translate' });
  } catch (e) {
    errors.push(e.message);
  }

  try {
    const result = await myMemoryTranslate(text, source, target);
    return json({ success:true, translation:result, reply:result, provider:'mymemory' });
  } catch (e) {
    errors.push(e.message);
  }

  return json({
    success:false,
    error:'سرویس‌های ترجمه در حال حاضر پاسخ ندادند. لطفاً چند لحظه بعد دوباره تلاش کنید.',
    details: errors
  }, 502);
}
