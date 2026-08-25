/*
 * YAR Afghanistan - Translation API
 *
 * Multi-provider translation fallback:
 *   1) Built-in phrase dictionary
 *   2) Groq
 *   3) Gemini
 *   4) Cerebras
 *   5) Mistral
 *   6) Hugging Face
 *   7) OpenRouter
 *   8) Google Translate public endpoint
 *   9) MyMemory
 *
 * Cloudflare Pages Secrets:
 * GROQ_API_KEY
 * GEMINI_API_KEY
 * CEREBRAS_API_KEY
 * MISTRAL_API_KEY
 * HF_TOKEN or HUGGINGFACE_API_KEY
 * OPENROUTER_API_KEY
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

function languageName(code) {
  if (code === 'fa') return 'Dari Persian';
  if (code === 'ps') return 'Pashto';
  if (code === 'en') return 'English';
  return code;
}

function extractOpenAIText(data) {
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content.trim();

  if (Array.isArray(content)) {
    return content.map(x => {
      if (typeof x === 'string') return x;
      return x?.text || '';
    }).join('').trim();
  }

  return '';
}

function extractGeminiText(data) {
  return data?.candidates?.[0]?.content?.parts
    ?.map(x => x?.text || '')
    .join('')
    .trim() || '';
}

function cleanTranslation(text) {
  let value = String(text || '').trim();

  // Remove common accidental wrappers from LLM responses.
  value = value.replace(/^```(?:text)?\s*/i, '');
  value = value.replace(/\s*```$/i, '');
  value = value.replace(/^["“”']|["“”']$/g, '');

  return value.trim();
}

function translationPrompt(text, from, to) {
  const source = from === 'auto'
    ? 'the language of the source text (detect it automatically)'
    : languageName(from);

  return `
Translate the following text from ${source} to ${languageName(to)}.

IMPORTANT:
- Return ONLY the translation.
- Do not explain anything.
- Do not add quotation marks.
- Preserve the original meaning, names, numbers, punctuation and formatting.
- If the source is Afghan Dari, translate it naturally.
- If the source is Afghan Pashto, translate it naturally.
- Do not transliterate unless the target language requires it.

Text:
${text}
`.trim();
}

async function callOpenAICompatible({
  url,
  key,
  model,
  messages,
  provider,
  headers = {}
}) {
  if (!key) return null;

  const started = Date.now();

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.1,
        max_tokens: 1000,
        stream: false
      }),
      signal: AbortSignal.timeout(12000)
    });

    const data = await response.json().catch(() => ({}));
    const answer = cleanTranslation(extractOpenAIText(data));

    if (response.ok && answer) {
      return {
        answer,
        provider,
        model: data?.model || model,
        status: response.status,
        elapsed: Date.now() - started
      };
    }

    return {
      provider,
      model,
      status: response.status,
      elapsed: Date.now() - started,
      error: data?.error?.message || `HTTP ${response.status}`
    };
  } catch (error) {
    return {
      provider,
      model,
      status: 0,
      elapsed: Date.now() - started,
      error: error?.message || 'Network error'
    };
  }
}

async function callGroq(env, messages) {
  return callOpenAICompatible({
    url: 'https://api.groq.com/openai/v1/chat/completions',
    key: String(env?.GROQ_API_KEY || '').trim(),
    model: String(env?.GROQ_MODEL || 'llama-3.3-70b-versatile').trim(),
    messages,
    provider: 'Groq'
  });
}

async function callCerebras(env, messages) {
  return callOpenAICompatible({
    url: 'https://api.cerebras.ai/v1/chat/completions',
    key: String(env?.CEREBRAS_API_KEY || '').trim(),
    model: String(env?.CEREBRAS_MODEL || 'llama-3.3-70b').trim(),
    messages,
    provider: 'Cerebras'
  });
}

async function callMistral(env, messages) {
  return callOpenAICompatible({
    url: 'https://api.mistral.ai/v1/chat/completions',
    key: String(env?.MISTRAL_API_KEY || '').trim(),
    model: String(env?.MISTRAL_MODEL || 'mistral-small-latest').trim(),
    messages,
    provider: 'Mistral'
  });
}

async function callHuggingFace(env, messages) {
  return callOpenAICompatible({
    url: 'https://router.huggingface.co/v1/chat/completions',
    key: String(env?.HF_TOKEN || env?.HUGGINGFACE_API_KEY || '').trim(),
    model: String(env?.HF_MODEL || 'openai/gpt-oss-120b:fastest').trim(),
    messages,
    provider: 'Hugging Face'
  });
}

async function callGemini(env, messages) {
  const key = String(env?.GEMINI_API_KEY || '').trim();
  if (!key) return null;

  const model = String(env?.GEMINI_MODEL || 'gemini-2.0-flash').trim();
  const started = Date.now();

  try {
    const system = messages.find(x => x.role === 'system')?.content || '';
    const contents = messages
      .filter(x => x.role !== 'system')
      .map(x => ({
        role: x.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: x.content }]
      }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents,
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1000
          }
        }),
        signal: AbortSignal.timeout(12000)
      }
    );

    const data = await response.json().catch(() => ({}));
    const answer = cleanTranslation(extractGeminiText(data));

    if (response.ok && answer) {
      return {
        answer,
        provider: 'Google Gemini',
        model,
        status: response.status,
        elapsed: Date.now() - started
      };
    }

    return {
      provider: 'Google Gemini',
      model,
      status: response.status,
      elapsed: Date.now() - started,
      error: data?.error?.message || `HTTP ${response.status}`
    };
  } catch (error) {
    return {
      provider: 'Google Gemini',
      model,
      status: 0,
      elapsed: Date.now() - started,
      error: error?.message || 'Network error'
    };
  }
}

async function callOpenRouter(env, messages) {
  const key = String(env?.OPENROUTER_API_KEY || '').trim();
  if (!key) return null;

  const models = [
    'openrouter/free',
    'openai/gpt-oss-20b:free',
    'qwen/qwen3-4b:free',
    'google/gemma-3-4b-it:free'
  ];

  const diagnostics = [];

  for (const model of models) {
    const result = await callOpenAICompatible({
      url: 'https://openrouter.ai/api/v1/chat/completions',
      key,
      model,
      messages,
      provider: 'OpenRouter',
      headers: {
        'HTTP-Referer': 'https://yar-afghanistan1.pages.dev',
        'X-Title': 'Yar Afghanistan Translator'
      }
    });

    diagnostics.push({
      model,
      status: result?.status || 0,
      error: result?.error || null
    });

    if (result?.answer) {
      result.diagnostics = diagnostics;
      return result;
    }
  }

  return {
    provider: 'OpenRouter',
    error: 'All OpenRouter translation models failed',
    diagnostics
  };
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

  if (!response.ok) {
    throw new Error(`Google Translate HTTP ${response.status}`);
  }

  const data = await response.json();
  const parts = Array.isArray(data?.[0]) ? data[0] : [];
  const result = parts
    .map(x => Array.isArray(x) ? x[0] : '')
    .filter(Boolean)
    .join('');

  if (!result.trim()) {
    throw new Error('Google Translate پاسخ خالی برگرداند.');
  }

  return result.trim();
}

async function myMemoryTranslate(text, from, to) {
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

      if (!response.ok) {
        throw new Error(`MyMemory HTTP ${response.status}`);
      }

      const data = await response.json();
      const result = data?.responseData?.translatedText;

      if (
        typeof result === 'string' &&
        result.trim() &&
        !/MYMEMORY WARNING/i.test(result)
      ) {
        return result.trim();
      }

      lastError = new Error(
        data?.responseDetails || 'MyMemory پاسخ ترجمه نداد.'
      );
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('MyMemory ترجمه‌ای برنگرداند.');
}

export async function onRequestPost(context) {
  try {
    const b = await body(context.request);

    const text = String(b.text || '').trim();
    if (!text) {
      return json({
        success: false,
        error: 'متن خالی است.'
      }, 400);
    }

    if (text.length > 12000) {
      return json({
        success: false,
        error: 'متن خیلی طولانی است.'
      }, 413);
    }

    const from = language(b.source || b.from || 'auto');
    const to = language(b.target || b.to || 'en');

    if (to === 'auto') {
      return json({
        success: false,
        error: 'زبان مقصد را انتخاب کنید.'
      }, 400);
    }

    if (from !== 'auto' && from === to) {
      return json({
        success: true,
        reply: text,
        translation: text,
        provider: 'same-language'
      });
    }

    if (from !== 'auto') {
      const local = dictionaryTranslate(text, from, to);
      if (local) {
        return json({
          success: true,
          reply: local,
          translation: local,
          provider: 'local'
        });
      }
    }

    const messages = [
      {
        role: 'system',
        content: `
You are a professional translator for Yar Afghanistan.
Translate naturally between Afghan Dari, Pashto and English.
Return ONLY the translated text.
Do not explain, summarize or add commentary.
Preserve names, numbers, punctuation and meaning.
`.trim()
      },
      {
        role: 'user',
        content: translationPrompt(text, from, to)
      }
    ];

    const errors = [];

    // AI fallback chain
    const providers = [
      () => callGroq(context.env, messages),
      () => callGemini(context.env, messages),
      () => callCerebras(context.env, messages),
      () => callMistral(context.env, messages),
      () => callHuggingFace(context.env, messages),
      () => callOpenRouter(context.env, messages)
    ];

    for (const providerCall of providers) {
      try {
        const result = await providerCall();

        if (result?.answer) {
          return json({
            success: true,
            reply: result.answer,
            translation: result.answer,
            provider: result.provider,
            model: result.model || null
          });
        }

        if (result?.provider) {
          errors.push(
            `${result.provider}: ${result.error || 'No translation returned'}`
          );
        }
      } catch (error) {
        errors.push(error?.message || String(error));
      }
    }

    // Public services remain as the final no-key fallback.
    try {
      const result = await googleTranslate(text, from, to);

      return json({
        success: true,
        reply: result,
        translation: result,
        provider: 'google-translate'
      });
    } catch (error) {
      errors.push(`Google: ${error?.message || error}`);
    }

    try {
      const result = await myMemoryTranslate(text, from, to);

      return json({
        success: true,
        reply: result,
        translation: result,
        provider: 'mymemory'
      });
    } catch (error) {
      errors.push(`MyMemory: ${error?.message || error}`);
    }

    return json({
      success: false,
      error: 'در حال حاضر سرویس‌های ترجمه در دسترس نیستند. لطفاً چند لحظه بعد دوباره تلاش کنید.',
      code: 'ALL_TRANSLATION_PROVIDERS_FAILED',
      details: errors
    }, 503);

  } catch (error) {
    console.error('[YAR Translator] Unexpected error:', error);

    return json({
      success: false,
      error: 'خطای داخلی سرویس ترجمه.',
      code: 'TRANSLATION_INTERNAL_ERROR'
    }, 500);
  }
}
