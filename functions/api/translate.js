/**
 * Yar Afghanistan — Translation API
 * Cloudflare Pages Functions
 *
 * Route:
 *   POST /api/translate
 *
 * Translation provider order:
 *   1. Local common phrases
 *   2. Cloudflare Workers AI binding (AI)
 *   3. Google Gemini
 *   4. Groq
 *   5. Mistral
 *   6. Cerebras
 *   7. Hugging Face
 *   8. OpenRouter
 *   9. Google public Translate endpoint
 *   10. MyMemory
 *
 * The AI providers are used for normal translation so the translator
 * is no longer dependent on only one public translation endpoint.
 */

import { body, json } from "../_utils.js";

const CLOUDFLARE_AI_MODEL = "@cf/meta/llama-3.1-8b-instruct";
const GEMINI_MODEL = "gemini-2.0-flash";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const MISTRAL_MODEL = "mistral-small-latest";
const CEREBRAS_MODEL = "llama-3.3-70b";
const HUGGINGFACE_MODEL = "meta-llama/Llama-3.2-3B-Instruct";

const OPENROUTER_MODELS = [
  "openrouter/free",
  "openai/gpt-oss-20b:free",
  "qwen/qwen3-4b:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "google/gemma-3-4b-it:free"
];

const LANG = {
  auto: "auto",
  detected: "auto",
  fa: "fa",
  dari: "fa",
  prs: "fa",
  ps: "ps",
  pashto: "ps",
  en: "en",
  english: "en"
};

const LANGUAGE_NAMES = {
  fa: "Dari",
  ps: "Pashto",
  en: "English"
};

const PHRASES = [
  ["سلام", "fa", "Hello", "en", "سلام", "ps"],
  ["خوب هستم", "fa", "I am fine", "en", "زه ښه یم", "ps"],
  ["خوبی؟", "fa", "How are you?", "en", "ته څنګه یې؟", "ps"],
  ["چطوری", "fa", "How are you?", "en", "ته څنګه یې؟", "ps"],
  ["چطوری؟", "fa", "How are you?", "en", "ته څنګه یې؟", "ps"],
  ["تشکر", "fa", "Thank you", "en", "مننه", "ps"],
  ["ممنون", "fa", "Thank you", "en", "مننه", "ps"],
  ["خداحافظ", "fa", "Goodbye", "en", "په مخه دې ښه", "ps"],
  ["صبح بخیر", "fa", "Good morning", "en", "سهار مو پخیر", "ps"],
  ["شب بخیر", "fa", "Good night", "en", "شپه مو پخیر", "ps"],
  ["بله", "fa", "Yes", "en", "هو", "ps"],
  ["نه", "fa", "No", "en", "نه", "ps"],

  ["زه ښه یم", "ps", "I am fine", "en", "من خوب هستم", "fa"],
  ["ته څنګه یې؟", "ps", "How are you?", "en", "خوبی؟", "fa"],
  ["ته څنګه يې؟", "ps", "How are you?", "en", "خوبی؟", "fa"],
  ["مننه", "ps", "Thank you", "en", "تشکر", "fa"],
  ["په مخه دې ښه", "ps", "Goodbye", "en", "خداحافظ", "fa"],
  ["سهار مو پخیر", "ps", "Good morning", "en", "صبح بخیر", "fa"],
  ["شپه مو پخیر", "ps", "Good night", "en", "شب بخیر", "fa"],
  ["هو", "ps", "Yes", "en", "بله", "fa"],

  ["i am fine", "en", "خوب هستم", "fa", "زه ښه یم", "ps"],
  ["hello", "en", "سلام", "fa", "سلام", "ps"],
  ["hi", "en", "سلام", "fa", "سلام", "ps"],
  ["how are you?", "en", "خوبی؟", "fa", "ته څنګه یې؟", "ps"],
  ["how are you", "en", "خوبی؟", "fa", "ته څنګه یې؟", "ps"],
  ["thank you", "en", "تشکر", "fa", "مننه", "ps"],
  ["thanks", "en", "تشکر", "fa", "مننه", "ps"],
  ["goodbye", "en", "خداحافظ", "fa", "په مخه دې ښه", "ps"],
  ["good morning", "en", "صبح بخیر", "fa", "سهار مو پخیر", "ps"],
  ["good night", "en", "شب بخیر", "fa", "شپه مو پخیر", "ps"],
  ["yes", "en", "بله", "fa", "هو", "ps"],
  ["no", "en", "نه", "fa", "نه", "ps"],
  ["i love afghanistan", "en", "من افغانستان را دوست دارم", "fa", "زه افغانستان سره مینه لرم", "ps"],

  ["من افغانستان را دوست دارم", "fa", "I love Afghanistan", "en", "زه افغانستان سره مینه لرم", "ps"]
];

function clean(value) {
  return String(value ?? "").trim();
}

function normalize(value) {
  return clean(value)
    .toLowerCase()
    .replace(/ي/g, "ی")
    .replace(/ى/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/ۀ/g, "ه")
    .replace(/\s+/g, " ")
    .trim();
}

function language(value) {
  return LANG[normalize(value)] || "auto";
}

function detectLanguage(text) {
  const n = normalize(text);

  // English: mostly Latin letters and common English words.
  const latin = (n.match(/[a-z]/g) || []).length;
  const arabic = (n.match(/[\u0600-\u06ff]/g) || []).length;
  if (latin > 0 && latin >= arabic) return "en";

  // Pashto has several letters that are uncommon in Dari/Persian.
  if (/[\u067c\u067d\u0689\u0693\u0696\u069a\u069b\u06ab\u06af\u06bc\u0681\u0685\u06bc]/.test(n)) {
    return "ps";
  }

  // For Arabic-script text without strong Pashto markers, default to Afghan Dari.
  if (arabic > 0) return "fa";

  return "en";
}

function cleanTranslation(answer, target) {
  let out = clean(answer)
    .replace(/^translation\s*:\s*/i, "")
    .replace(/^translated\s*text\s*:\s*/i, "")
    .replace(/^ترجمه\s*:\s*/i, "")
    .replace(/^ترجمه‌شده\s*:\s*/i, "")
    .replace(/^«|»$/g, "")
    .trim();

  if (!out) return null;

  // Reject obvious mixed-language hallucinations. The translator must return
  // text predominantly in the requested target language.
  const latin = (out.match(/[A-Za-z]/g) || []).length;
  const arabic = (out.match(/[\u0600-\u06ff]/g) || []).length;
  const words = out.split(/\s+/).filter(Boolean).length;

  if (target === "en") {
    if (latin === 0) return null;
    if (words >= 2 && arabic > latin * 0.35) return null;
  }

  if (target === "fa") {
    if (arabic === 0) return null;
    if (words >= 2 && latin > arabic * 0.35) return null;
  }

  if (target === "ps") {
    if (arabic === 0) return null;
    if (words >= 2 && latin > arabic * 0.35) return null;
  }

  return out;
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

function getKey(env, names) {
  for (const name of names) {
    const value = clean(env?.[name]);
    if (value) return value;
  }
  return "";
}

function languageInstruction(from, to) {
  const fromName = LANGUAGE_NAMES[from] || from;
  const toName = LANGUAGE_NAMES[to] || to;

  return `
Translate the user's text from ${fromName} to ${toName}.
Return ONLY the translation.
Do not add explanations, quotes, labels, greetings, or notes.
Preserve meaning, names, numbers, punctuation and line breaks when possible.
For Persian input/output use natural Afghan Dari, not an unrelated dialect.
For Pashto use natural Afghan Pashto.
`;
}

async function callCloudflareAI(env, text, from, to) {
  if (!env?.AI || typeof env.AI.run !== "function") return null;

  try {
    const result = await env.AI.run(CLOUDFLARE_AI_MODEL, {
      messages: [
        {
          role: "system",
          content: languageInstruction(from, to)
        },
        {
          role: "user",
          content: text
        }
      ],
      max_tokens: 1000
    });

    const answer =
      clean(result?.response) ||
      clean(result?.result?.response);

    return answer || null;
  } catch (error) {
    console.error("[YAR TRANSLATE] Cloudflare AI:", error);
    return null;
  }
}

async function callGemini(env, text, from, to) {
  const apiKey = getKey(env, ["GEMINI_API_KEY", "GOOGLE_GEMINI_API_KEY"]);
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: languageInstruction(from, to) }]
          },
          contents: [{
            role: "user",
            parts: [{ text }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1000
          }
        })
      }
    );

    const data = await response.json().catch(() => ({}));
    const answer = clean(
      data?.candidates?.[0]?.content?.parts
        ?.map(p => p?.text || "")
        .join("")
    );

    if (!response.ok || !answer) return null;
    return answer;
  } catch (error) {
    console.error("[YAR TRANSLATE] Gemini:", error);
    return null;
  }
}

async function callOpenAICompatible(url, apiKey, model, provider, text, from, to) {
  if (!apiKey) return null;

  try {
    const messages = [
      {
        role: "system",
        content: languageInstruction(from, to)
      },
      {
        role: "user",
        content: text
      }
    ];

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2,
        max_tokens: 1000
      })
    });

    const data = await response.json().catch(() => ({}));
    const answer = clean(data?.choices?.[0]?.message?.content);

    if (!response.ok || !answer) {
      console.warn(`[YAR TRANSLATE] ${provider} HTTP ${response.status}`);
      return null;
    }

    return answer;
  } catch (error) {
    console.error(`[YAR TRANSLATE] ${provider}:`, error);
    return null;
  }
}

async function callGroq(env, text, from, to) {
  return callOpenAICompatible(
    "https://api.groq.com/openai/v1/chat/completions",
    getKey(env, ["GROQ_API_KEY"]),
    GROQ_MODEL,
    "Groq",
    text,
    from,
    to
  );
}

async function callMistral(env, text, from, to) {
  return callOpenAICompatible(
    "https://api.mistral.ai/v1/chat/completions",
    getKey(env, ["MISTRAL_API_KEY"]),
    MISTRAL_MODEL,
    "Mistral",
    text,
    from,
    to
  );
}

async function callCerebras(env, text, from, to) {
  return callOpenAICompatible(
    "https://api.cerebras.ai/v1/chat/completions",
    getKey(env, ["CEREBRAS_API_KEY", "CEREBRAS_AI"]),
    CEREBRAS_MODEL,
    "Cerebras",
    text,
    from,
    to
  );
}

async function callHuggingFace(env, text, from, to) {
  const apiKey = getKey(env, [
    "HUGGINGFACE_API_KEY",
    "HUGGINGFACE_API",
    "HF_API_KEY",
    "HUGGINGFACE"
  ]);

  if (!apiKey) return null;

  try {
    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: HUGGINGFACE_MODEL,
          messages: [
            {
              role: "system",
              content: languageInstruction(from, to)
            },
            {
              role: "user",
              content: text
            }
          ],
          temperature: 0.2,
          max_tokens: 1000
        })
      }
    );

    const data = await response.json().catch(() => ({}));
    const answer = clean(data?.choices?.[0]?.message?.content);

    if (!response.ok || !answer) return null;
    return answer;
  } catch (error) {
    console.error("[YAR TRANSLATE] Hugging Face:", error);
    return null;
  }
}

async function callOpenRouter(env, text, from, to) {
  const apiKey = getKey(env, ["OPENROUTER_API_KEY"]);
  if (!apiKey) return null;

  const messages = [
    {
      role: "system",
      content: languageInstruction(from, to)
    },
    {
      role: "user",
      content: text
    }
  ];

  for (const model of OPENROUTER_MODELS) {
    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://yar-afghanistan1.pages.dev",
            "X-Title": "Yar Afghanistan Translator"
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.2,
            max_tokens: 1000
          })
        }
      );

      const data = await response.json().catch(() => ({}));
      const answer = clean(data?.choices?.[0]?.message?.content);

      if (response.ok && answer) return answer;

      console.warn(
        `[YAR TRANSLATE] OpenRouter ${model} HTTP ${response.status}`
      );
    } catch (error) {
      console.error(`[YAR TRANSLATE] OpenRouter ${model}:`, error);
    }
  }

  return null;
}

async function googleTranslate(text, from, to) {
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", from === "auto" ? "auto" : from);
  url.searchParams.set("tl", to);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000)
  });

  if (!response.ok) throw new Error(`Google Translate HTTP ${response.status}`);

  const data = await response.json();
  const parts = Array.isArray(data?.[0]) ? data[0] : [];
  const result = parts
    .map(x => Array.isArray(x) ? x[0] : "")
    .filter(Boolean)
    .join("");

  if (!result.trim()) throw new Error("Google Translate پاسخ خالی برگرداند.");

  return result.trim();
}

async function myMemoryTranslate(text, from, to) {
  const sources = from === "auto" ? ["fa", "ps", "en"] : [from];

  for (const source of sources) {
    if (source === to) return text;

    const url = new URL("https://api.mymemory.translated.net/get");
    url.searchParams.set("q", text);
    url.searchParams.set("langpair", `${source}|${to}`);

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(8000)
      });

      if (!response.ok) continue;

      const data = await response.json();
      const result = clean(data?.responseData?.translatedText);

      if (result && !/MYMEMORY WARNING/i.test(result)) {
        return result;
      }
    } catch (error) {
      console.warn("[YAR TRANSLATE] MyMemory:", error);
    }
  }

  return null;
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Max-Age": "86400"
    }
  });
}

export async function onRequestGet() {
  return json({
    success: true,
    service: "Yar Afghanistan Translation API",
    status: "online",
    endpoint: "/api/translate",
    method: "POST",
    message: "Send POST { text, source, target }."
  });
}

export async function onRequestPost(context) {
  try {
    const b = await body(context.request);

    const text = clean(b?.text || b?.message || b?.prompt);

    if (!text) {
      return json({
        success: false,
        error: "متن خالی است.",
        code: "EMPTY_TEXT"
      }, 400);
    }

    if (text.length > 12000) {
      return json({
        success: false,
        error: "متن خیلی طولانی است.",
        code: "TEXT_TOO_LONG"
      }, 413);
    }

    let from = language(b?.source || b?.from || "auto");
    const to = language(b?.target || b?.to || "en");

    // Never send an unknown source language to the first AI provider.
    // Auto-detect it locally first so the model cannot mix Dari/Pashto/English.
    if (from === "auto") {
      from = detectLanguage(text);
    }

    if (to === "auto") {
      return json({
        success: false,
        error: "زبان مقصد را انتخاب کنید.",
        code: "TARGET_LANGUAGE_REQUIRED"
      }, 400);
    }

    if (from !== "auto" && from === to) {
      return json({
        success: true,
        reply: text,
        translation: text,
        provider: "same-language"
      });
    }

    /*
     * Exact common phrases are translated locally.
     * This guarantees that "سلام" -> "Hello" works correctly
     * even when all external providers are unavailable.
     */
    if (from !== "auto") {
      const local = dictionaryTranslate(text, from, to);

      if (local) {
        return json({
          success: true,
          reply: local,
          translation: local,
          provider: "local"
        });
      }
    }

    const providers = [
      // Google is first for ordinary translation because it is much less likely
      // to invent mixed-language output than a small chat model.
      ["Google Translate", () => googleTranslate(text, from, to)],

      // AI providers remain connected as fallbacks.
      ["Google Gemini", () => callGemini(context.env, text, from, to)],
      ["Groq", () => callGroq(context.env, text, from, to)],
      ["Mistral", () => callMistral(context.env, text, from, to)],
      ["Cerebras", () => callCerebras(context.env, text, from, to)],
      ["Cloudflare Workers AI", () => callCloudflareAI(context.env, text, from, to)],
      ["Hugging Face", () => callHuggingFace(context.env, text, from, to)],
      ["OpenRouter", () => callOpenRouter(context.env, text, from, to)],
      ["MyMemory", () => myMemoryTranslate(text, from, to)]
    ];

    const errors = [];

    for (const [provider, fn] of providers) {
      try {
        const result = await fn();

        if (result && clean(result)) {
          const answer = clean(result);

          /*
           * Prevent obvious accidental wrappers such as:
           * "Translation: Hello"
           */
          const cleanedAnswer = cleanTranslation(answer, to);

          // If an AI returned a mixed-language hallucination such as
          // "تر forever در خواږه ستا يم", reject it and try the next provider.
          if (cleanedAnswer) {
            return json({
              success: true,
              reply: cleanedAnswer,
              translation: cleanedAnswer,
              provider,
              detectedSource: from
            });
          }

          errors.push(`${provider}: invalid target-language response`);
          continue;
        }

        errors.push(`${provider}: no usable response`);
      } catch (error) {
        errors.push(`${provider}: ${error?.message || String(error)}`);
      }
    }

    return json({
      success: false,
      error: "در حال حاضر سرویس‌های ترجمه در دسترس نیستند. لطفاً چند لحظه بعد دوباره تلاش کنید.",
      code: "ALL_TRANSLATION_PROVIDERS_FAILED",
      details: errors
    }, 503);

  } catch (error) {
    console.error("[YAR TRANSLATE] Unexpected error:", error);

    return json({
      success: false,
      error: "خطای داخلی سرویس ترجمه.",
      code: "INTERNAL_TRANSLATION_ERROR"
    }, 500);
  }
}
