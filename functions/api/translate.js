/*
 * YAR Afghanistan - Translation API
 *
 * IMPORTANT: Translation does NOT use OpenRouter.
 * This keeps the translator independent from OpenRouter's free-model daily quota.
 *
 * Provider order:
 *   1) small built-in Dari/Pashto/English phrase dictionary
 *   2) Google Translate public endpoint (no API key)
 *   3) MyMemory public endpoint (no API key)
 */

import { body, json } from '../_utils.js';

const LANG = {
  auto: 'auto',
  detected: 'auto',
  fa: 'fa',
  dari: 'fa',
  prs: 'fa',
  ps: 'ps',
  pashto: 'ps',
  en: 'en',
  english: 'en'
};

const PHRASES = [
  ['سلام', 'fa', 'Hello', 'en', 'سلام', 'ps'],
  ['خوب هستم', 'fa', 'I am fine', 'en', 'زه ښه یم', 'ps'],
  ['خوبی؟', 'fa', 'How are you?', 'en', 'ته څنګه یې؟', 'ps'],
  ['تشکر', 'fa', 'Thank you', 'en', 'مننه', 'ps'],
  ['ممنون', 'fa', 'Thank you', 'en', 'مننه', 'ps'],
  ['خداحافظ', 'fa', 'Goodbye', 'en', 'په مخه دې ښه', 'ps'],
  ['صبح بخیر', 'fa', 'Good morning', 'en', 'سهار مو پخیر', 'ps'],
  ['شب بخیر', 'fa', 'Good night', 'en', 'شپه مو پخیر', 'ps'],
  ['بله', 'fa', 'Yes', 'en', 'هو', 'ps'],
  ['نه', 'fa', 'No', 'en', 'نه', 'ps'],
  ['من افغانستان را دوست دارم', 'fa', 'I love Afghanistan', 'en', 'زه افغانستان سره مینه لرم', 'ps'],
  ['زه ښه یم', 'ps', 'I am fine', 'en', 'من خوب هستم', 'fa'],
  ['ته څنګه یې؟', 'ps', 'How are you?', 'en', 'خوبی؟', 'fa'],
  ['مننه', 'ps', 'Thank you', 'en', 'تشکر', 'fa'],
  ['په مخه دې ښه', 'ps', 'Goodbye', 'en', 'خداحافظ', 'fa'],
  ['سهار مو پخیر', 'ps', 'Good morning', 'en', 'صبح بخیر', 'fa'],
  ['شپه مو پخیر', 'ps', 'Good night', 'en', 'شب بخیر', 'fa'],
  ['هو', 'ps', 'Yes', 'en', 'بله', 'fa'],
  ['i am fine', 'en', 'خوب هستم', 'fa', 'زه ښه یم', 'ps'],
  ['hello', 'en', 'سلام', 'fa', 'سلام', 'ps'],
  ['hi', 'en', 'سلام', 'fa', 'سلام', 'ps'],
  ['how are you?', 'en', 'خوبی؟', 'fa', 'ته څنګه یې؟', 'ps'],
  ['thank you', 'en', 'تشکر', 'fa', 'مننه', 'ps'],
  ['goodbye', 'en', 'خداحافظ', 'fa', 'په مخه دې ښه', 'ps'],
  ['good morning', 'en', 'صبح بخیر', 'fa', 'سهار مو پخیر', 'ps'],
  ['good night', 'en', 'شب بخیر', 'fa', 'شپه مو پخیر', 'ps'],
  ['yes', 'en', 'بله', 'fa', 'هو', 'ps'],
  ['no', 'en', 'نه', 'fa', 'نه', 'ps'],
  ['i love afghanistan', 'en', 'من افغانستان را دوست دارم', 'fa', 'زه افغانستان سره مینه لرم', 'ps']
];

function normalize(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/ي/g, 'ی')
    .replace(/ى/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ۀ/g, 'ه')
    .replace(/\s+/g, ' ');
}

function language(value) {
  const key = normalize(value);
  return LANG[key] || 'auto';
}

function dictionaryTranslate(text, from, to) {
  const n = normalize(text);
  for (const p of PHRASES) {
    const [a, al, b, bl, c, cl] = p;
    if (normalize(a) === n && al === from) {
      if (to === bl) return b;
      if (to === cl) return c;
    }
  }
  return null;
}

async function googleTranslate(text, from, to) {
  const sl = from === 'auto' ? 'auto' : from;
  const url = new URL('https://translate.googleapis.com/translate_a/single');
  url.searchParams.set('client', 'gtx');
  url.searchParams.set('sl', sl);
  url.searchParams.set('tl', to);
  url.searchParams.set('dt', 't');
  url.searchParams.set('q', text);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(8000)
  });
  if (!response.ok) throw new Error(`Google Translate HTTP ${response.status}`);
  const data = await response.json();
  const parts = Array.isArray(data?.[0]) ? data[0] : [];
  const result = parts.map(x => Array.isArray(x) ? x[0] : '').filter(Boolean).join('');
  if (!result.trim()) throw new Error('Google Translate پاسخ خالی برگرداند.');
  return result.trim();
}

async function myMemoryTranslate(text, from, to) {
  // MyMemory uses ISO language pairs. For auto detection, try a small Dari/Pashto/English set.
  const sources = from === 'auto' ? ['fa', 'ps', 'en'] : [from];
  let lastError = null;

  for (const source of sources) {
    if (source === to) return text;
    const url = new URL('https://api.mymemory.translated.net/get');
    url.searchParams.set('q', text);
    url.searchParams.set('langpair', `${source}|${to}`);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(8000)
      });
      if (!response.ok) throw new Error(`MyMemory HTTP ${response.status}`);
      const data = await response.json();
      const result = data?.responseData?.translatedText;
      if (typeof result === 'string' && result.trim() && !/MYMEMORY WARNING/i.test(result)) {
        return result.trim();
      }
      lastError = new Error(data?.responseDetails || 'MyMemory پاسخ ترجمه نداد.');
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('MyMemory ترجمه‌ای برنگرداند.');
}

export async function onRequestPost(context) {
  const b = await body(context.request);
  const text = String(b.text || '').trim();
  if (!text) return json({ success: false, error: 'متن خالی است.' }, 400);

  const from = language(b.source || b.from || 'auto');
  const to = language(b.target || b.to || 'en');

  if (to === 'auto') {
    return json({ success: false, error: 'زبان مقصد را انتخاب کنید.' }, 400);
  }

  if (from !== 'auto' && from === to) {
    return json({ success: true, reply: text, translation: text, provider: 'same-language' });
  }

  // First handle common phrases without any external service.
  if (from !== 'auto') {
    const local = dictionaryTranslate(text, from, to);
    if (local) {
      return json({ success: true, reply: local, translation: local, provider: 'local' });
    }
  }

  const errors = [];

  try {
    const result = await googleTranslate(text, from, to);
    return json({ success: true, reply: result, translation: result, provider: 'google-translate' });
  } catch (error) {
    errors.push(`Google: ${error?.message || error}`);
  }

  try {
    const result = await myMemoryTranslate(text, from, to);
    return json({ success: true, reply: result, translation: result, provider: 'mymemory' });
  } catch (error) {
    errors.push(`MyMemory: ${error?.message || error}`);
  }

  return json({
    success: false,
    error: 'در حال حاضر سرویس‌های ترجمه در دسترس نیستند. لطفاً چند لحظه بعد دوباره تلاش کنید.',
    details: errors
  }, 503);
}
