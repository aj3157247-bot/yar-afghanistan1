/*
 * YAR Afghanistan - MULTI AI TRANSLATION API
 *
 * Route:
 * POST /api/translate
 *
 * Cloudflare Secrets:
 *
 * OPENROUTER_API_KEY
 * GEMINI_API_KEY
 * GROQ_API_KEY
 *
 * Optional Cloudflare Workers AI binding:
 * AI
 *
 * Request:
 * {
 *   "text": "چطوری",
 *   "source": "fa",
 *   "target": "en"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "translation": "How are you?",
 *   "reply": "How are you?",
 *   "provider": "Google Gemini"
 * }
 */

/* =========================================================
   CONSTANTS
========================================================= */

const OPENROUTER_URL =
  "https://openrouter.ai/api/v1/chat/completions";

const GEMINI_MODEL =
  "gemini-2.0-flash";

const GROQ_MODEL =
  "llama-3.3-70b-versatile";

const CLOUDFLARE_AI_MODEL =
  "@cf/meta/llama-3.1-8b-instruct";

const OPENROUTER_MODELS = [
  "openrouter/free",
  "openai/gpt-oss-20b:free",
  "qwen/qwen3-4b:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "google/gemma-3-4b-it:free"
];

/* =========================================================
   JSON
========================================================= */

function json(data, status = 200) {

  return new Response(
    JSON.stringify(data, null, 2),
    {
      status,

      headers: {
        "Content-Type":
          "application/json; charset=utf-8",

        "Cache-Control":
          "no-store",

        "Access-Control-Allow-Origin":
          "*",

        "Access-Control-Allow-Headers":
          "Content-Type",

        "Access-Control-Allow-Methods":
          "GET, POST, OPTIONS"
      }
    }
  );
}

/* =========================================================
   CORS
========================================================= */

export async function onRequestOptions() {

  return new Response(null, {
    status: 204,

    headers: {
      "Access-Control-Allow-Origin":
        "*",

      "Access-Control-Allow-Headers":
        "Content-Type",

      "Access-Control-Allow-Methods":
        "GET, POST, OPTIONS",

      "Access-Control-Max-Age":
        "86400"
    }
  });
}

/* =========================================================
   GET
========================================================= */

export async function onRequestGet() {

  return json({
    success: true,

    service:
      "Yar Afghanistan Translation API",

    status:
      "online",

    endpoint:
      "/api/translate",

    providers: [
      "Cloudflare Workers AI",
      "Google Gemini",
      "Groq",
      "OpenRouter",
      "Google Translate",
      "MyMemory",
      "Local Dictionary"
    ]
  });
}

/* =========================================================
   LANGUAGE NORMALIZATION
========================================================= */

function normalizeLanguage(value) {

  const v =
    String(value || "")
      .trim()
      .toLowerCase();

  const map = {

    auto: "auto",
    detected: "auto",

    fa: "fa",
    fas: "fa",
    per: "fa",
    prs: "fa",
    dari: "fa",
    persian: "fa",

    ps: "ps",
    pashto: "ps",
    pus: "ps",

    en: "en",
    eng: "en",
    english: "en"
  };

  return map[v] || "auto";
}

/* =========================================================
   LANGUAGE NAMES FOR AI
========================================================= */

function languageName(code) {

  switch (code) {

    case "fa":
      return "Dari Persian";

    case "ps":
      return "Afghan Pashto";

    case "en":
      return "English";

    default:
      return "the target language";
  }
}

/* =========================================================
   TEXT NORMALIZATION
========================================================= */

function normalizeText(value) {

  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/ي/g, "ی")
    .replace(/ى/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/ۀ/g, "ه")
    .replace(/[؟]/g, "?")
    .replace(/\s+/g, " ");
}

/* =========================================================
   LOCAL DICTIONARY
   Used first for common expressions.
========================================================= */

const DICTIONARY = [

  /* Dari -> English */

  ["سلام", "fa", "en", "Hello"],
  ["چطوری", "fa", "en", "How are you?"],
  ["چطوری؟", "fa", "en", "How are you?"],
  ["حالت چطوره", "fa", "en", "How are you?"],
  ["حالت چطوره؟", "fa", "en", "How are you?"],
  ["خوبی", "fa", "en", "How are you?"],
  ["خوبی؟", "fa", "en", "How are you?"],
  ["حال شما چطور است", "fa", "en", "How are you?"],
  ["حال شما چطور است؟", "fa", "en", "How are you?"],

  ["خوب هستم", "fa", "en", "I am fine."],
  ["من خوبم", "fa", "en", "I am fine."],
  ["تشکر", "fa", "en", "Thank you."],
  ["ممنون", "fa", "en", "Thank you."],
  ["لطفاً", "fa", "en", "Please."],
  ["لطفا", "fa", "en", "Please."],
  ["بله", "fa", "en", "Yes."],
  ["نه", "fa", "en", "No."],
  ["خداحافظ", "fa", "en", "Goodbye."],
  ["صبح بخیر", "fa", "en", "Good morning."],
  ["شب بخیر", "fa", "en", "Good night."],
  ["متشکرم", "fa", "en", "Thank you."],

  /* English -> Dari */

  ["hello", "en", "fa", "سلام"],
  ["hi", "en", "fa", "سلام"],
  ["how are you", "en", "fa", "چطوری؟"],
  ["how are you?", "en", "fa", "چطوری؟"],
  ["i am fine", "en", "fa", "خوب هستم."],
  ["thank you", "en", "fa", "تشکر."],
  ["thanks", "en", "fa", "ممنون."],
  ["please", "en", "fa", "لطفاً."],
  ["yes", "en", "fa", "بله."],
  ["no", "en", "fa", "نه."],
  ["goodbye", "en", "fa", "خداحافظ."],
  ["good morning", "en", "fa", "صبح بخیر."],
  ["good night", "en", "fa", "شب بخیر."],

  /* Pashto -> English */

  ["سلام", "ps", "en", "Hello."],
  ["څنګه یې", "ps", "en", "How are you?"],
  ["څنګه یې؟", "ps", "en", "How are you?"],
  ["زه ښه یم", "ps", "en", "I am fine."],
  ["مننه", "ps", "en", "Thank you."],
  ["هو", "ps", "en", "Yes."],
  ["نه", "ps", "en", "No."],
  ["خدای پامان", "ps", "en", "Goodbye."],
  ["سهار مو پخیر", "ps", "en", "Good morning."],
  ["شپه مو پخیر", "ps", "en", "Good night."],

  /* English -> Pashto */

  ["hello", "en", "ps", "سلام"],
  ["hi", "en", "ps", "سلام"],
  ["how are you", "en", "ps", "څنګه یې؟"],
  ["how are you?", "en", "ps", "څنګه یې؟"],
  ["i am fine", "en", "ps", "زه ښه یم."],
  ["thank you", "en", "ps", "مننه."],
  ["yes", "en", "ps", "هو."],
  ["no", "en", "ps", "نه."],
  ["goodbye", "en", "ps", "خدای پامان."],
  ["good morning", "en", "ps", "سهار مو پخیر."],
  ["good night", "en", "ps", "شپه مو پخیر."]
];

/* =========================================================
   DICTIONARY TRANSLATION
========================================================= */

function dictionaryTranslate(
  text,
  source,
  target
) {

  const input =
    normalizeText(text);

  for (const item of DICTIONARY) {

    const [
      phrase,
      from,
      to,
      translation
    ] = item;

    if (
      from === source &&
      to === target &&
      normalizeText(phrase) === input
    ) {

      return translation;
    }
  }

  return null;
}

/* =========================================================
   AI PROMPT
========================================================= */

function buildPrompt(
  text,
  source,
  target
) {

  const sourceText =
    source === "auto"
      ? "Detect the source language automatically. It may be Afghan Dari, Afghan Pashto, or English."
      : `Source language: ${languageName(source)}.`;

  return `
You are the translation engine of "Yar Afghanistan".

Translate the user's text accurately.

${sourceText}

Target language:
${languageName(target)}

IMPORTANT RULES:

1. Translate the meaning naturally.
2. Understand Afghan Dari.
3. Understand Afghan Pashto.
4. Do not answer the user.
5. Do not explain the translation.
6. Do not add quotation marks.
7. Do not add labels such as "Translation:".
8. Return ONLY the translated text.
9. Preserve names, numbers and formatting when appropriate.
10. If the input is a question, translate the question. Do NOT answer it.

Examples:

Dari:
چطوری

English:
How are you?

Dari:
سلام

English:
Hello

Dari:
من خوبم

English:
I am fine.

Pashto:
څنګه یې؟

English:
How are you?

Now translate this text:

${text}
`.trim();
}

/* =========================================================
   CLEAN AI TRANSLATION
========================================================= */

function cleanTranslation(text) {

  if (
    typeof text !== "string"
  ) {
    return "";
  }

  let result =
    text.trim();

  result =
    result
      .replace(/^```[a-zA-Z]*\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

  result =
    result.replace(
      /^(translation|translated text|ترجمه)\s*:\s*/i,
      ""
    );

  if (
    result.startsWith('"') &&
    result.endsWith('"')
  ) {

    result =
      result.slice(1, -1)
        .trim();
  }

  return result;
}

/* =========================================================
   CLOUDFLARE WORKERS AI
========================================================= */

async function callCloudflareAI(
  env,
  prompt
) {

  if (
    !env?.AI ||
    typeof env.AI.run !== "function"
  ) {
    return null;
  }

  try {

    const result =
      await env.AI.run(
        CLOUDFLARE_AI_MODEL,
        {
          messages: [
            {
              role: "system",
              content:
                "You are a professional translation engine. Return only the translation."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 1000
        }
      );

    const answer =
      typeof result?.response === "string"
        ? result.response
        : typeof result?.result?.response === "string"
          ? result.result.response
          : "";

    const cleaned =
      cleanTranslation(answer);

    if (!cleaned) {
      return null;
    }

    return {
      translation: cleaned,
      provider:
        "Cloudflare Workers AI",
      model:
        CLOUDFLARE_AI_MODEL
    };

  } catch (error) {

    console.error(
      "[YAR TRANSLATE] Cloudflare AI:",
      error
    );

    return null;
  }
}

/* =========================================================
   GEMINI
========================================================= */

async function callGemini(
  env,
  prompt
) {

  const key =
    String(
      env?.GEMINI_API_KEY || ""
    ).trim();

  if (!key) {
    return null;
  }

  try {

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(key)}`;

    const response =
      await fetch(
        url,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({

              systemInstruction: {
                parts: [
                  {
                    text:
                      "You are a professional translation engine. Return only the translated text."
                  }
                ]
              },

              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: prompt
                    }
                  ]
                }
              ],

              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 1000
              }

            }),

          signal:
            AbortSignal.timeout(12000)
        }
      );

    const data =
      await response
        .json()
        .catch(() => ({}));

    const answer =
      data
        ?.candidates?.[0]
        ?.content
        ?.parts
        ?.map(
          p =>
            p?.text || ""
        )
        .join("");

    const cleaned =
      cleanTranslation(answer);

    if (
      !response.ok ||
      !cleaned
    ) {

      console.error(
        "[YAR TRANSLATE] Gemini:",
        response.status,
        data?.error?.message
      );

      return null;
    }

    return {
      translation:
        cleaned,

      provider:
        "Google Gemini",

      model:
        GEMINI_MODEL
    };

  } catch (error) {

    console.error(
      "[YAR TRANSLATE] Gemini:",
      error
    );

    return null;
  }
}

/* =========================================================
   GROQ
========================================================= */

async function callGroq(
  env,
  prompt
) {

  const key =
    String(
      env?.GROQ_API_KEY || ""
    ).trim();

  if (!key) {
    return null;
  }

  try {

    const response =
      await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",

          headers: {
            "Authorization":
              `Bearer ${key}`,

            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({

              model:
                GROQ_MODEL,

              messages: [

                {
                  role:
                    "system",

                  content:
                    "You are a professional translation engine. Return only the translated text."
                },

                {
                  role:
                    "user",

                  content:
                    prompt
                }

              ],

              temperature:
                0.2,

              max_tokens:
                1000

            }),

          signal:
            AbortSignal.timeout(12000)
        }
      );

    const data =
      await response
        .json()
        .catch(() => ({}));

    const answer =
      data
        ?.choices?.[0]
        ?.message?.content;

    const cleaned =
      cleanTranslation(answer);

    if (
      !response.ok ||
      !cleaned
    ) {

      console.error(
        "[YAR TRANSLATE] Groq:",
        response.status,
        data?.error?.message
      );

      return null;
    }

    return {
      translation:
        cleaned,

      provider:
        "Groq",

      model:
        GROQ_MODEL
    };

  } catch (error) {

    console.error(
      "[YAR TRANSLATE] Groq:",
      error
    );

    return null;
  }
}

/* =========================================================
   OPENROUTER
========================================================= */

async function callOpenRouter(
  env,
  prompt
) {

  const key =
    String(
      env?.OPENROUTER_API_KEY || ""
    ).trim();

  if (!key) {
    return null;
  }

  for (
    const model of OPENROUTER_MODELS
  ) {

    try {

      const response =
        await fetch(
          OPENROUTER_URL,
          {
            method: "POST",

            headers: {

              "Authorization":
                `Bearer ${key}`,

              "Content-Type":
                "application/json",

              "HTTP-Referer":
                "https://yar-afghanistan1.pages.dev",

              "X-Title":
                "Yar Afghanistan Translation"

            },

            body:
              JSON.stringify({

                model,

                messages: [

                  {
                    role:
                      "system",

                    content:
                      "You are a professional translation engine. Return only the translated text."
                  },

                  {
                    role:
                      "user",

                    content:
                      prompt
                  }

                ],

                temperature:
                  0.2,

                max_tokens:
                  1000,

                stream:
                  false

              }),

            signal:
              AbortSignal.timeout(15000)
          }
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      const answer =
        data
          ?.choices?.[0]
          ?.message
          ?.content;

      const cleaned =
        cleanTranslation(answer);

      if (
        response.ok &&
        cleaned
      ) {

        return {
          translation:
            cleaned,

          provider:
            "OpenRouter",

          model:
            data?.model ||
            model
        };
      }

      console.warn(
        `[YAR TRANSLATE] OpenRouter ${model}:`,
        response.status,
        data?.error?.message
      );

    } catch (error) {

      console.warn(
        `[YAR TRANSLATE] OpenRouter ${model}:`,
        error
      );
    }
  }

  return null;
}

/* =========================================================
   GOOGLE TRANSLATE
========================================================= */

async function googleTranslate(
  text,
  source,
  target
) {

  try {

    const url =
      new URL(
        "https://translate.googleapis.com/translate_a/single"
      );

    url.searchParams.set(
      "client",
      "gtx"
    );

    url.searchParams.set(
      "sl",
      source === "auto"
        ? "auto"
        : source
    );

    url.searchParams.set(
      "tl",
      target
    );

    url.searchParams.set(
      "dt",
      "t"
    );

    url.searchParams.set(
      "q",
      text
    );

    const response =
      await fetch(
        url.toString(),
        {
          method:
            "GET",

          headers: {
            "Accept":
              "application/json"
          },

          signal:
            AbortSignal.timeout(10000)
        }
      );

    if (!response.ok) {
      return null;
    }

    const data =
      await response
        .json();

    const parts =
      Array.isArray(data?.[0])
        ? data[0]
        : [];

    const result =
      parts
        .map(
          item =>
            Array.isArray(item)
              ? item[0]
              : ""
        )
        .filter(Boolean)
        .join("");

    if (!result.trim()) {
      return null;
    }

    return {
      translation:
        result.trim(),

      provider:
        "Google Translate"
    };

  } catch (error) {

    console.warn(
      "[YAR TRANSLATE] Google:",
      error
    );

    return null;
  }
}

/* =========================================================
   MYMEMORY
========================================================= */

async function myMemoryTranslate(
  text,
  source,
  target
) {

  const sources =
    source === "auto"
      ? ["fa", "ps", "en"]
      : [source];

  for (
    const src of sources
  ) {

    if (src === target) {

      return {
        translation:
          text,

        provider:
          "same-language"
      };
    }

    try {

      const url =
        new URL(
          "https://api.mymemory.translated.net/get"
        );

      url.searchParams.set(
        "q",
        text
      );

      url.searchParams.set(
        "langpair",
        `${src}|${target}`
      );

      const response =
        await fetch(
          url.toString(),
          {
            method:
              "GET",

            headers: {
              "Accept":
                "application/json"
            },

            signal:
              AbortSignal.timeout(10000)
          }
        );

      if (!response.ok) {
        continue;
      }

      const data =
        await response
          .json()
          .catch(() => ({}));

      const result =
        data
          ?.responseData
          ?.translatedText;

      if (
        typeof result === "string" &&
        result.trim() &&
        !/MYMEMORY WARNING/i.test(
          result
        )
      ) {

        return {
          translation:
            result.trim(),

          provider:
            "MyMemory"
        };
      }

    } catch (error) {

      console.warn(
        "[YAR TRANSLATE] MyMemory:",
        error
      );
    }
  }

  return null;
}

/* =========================================================
   POST /api/translate
========================================================= */

export async function onRequestPost(
  context
) {

  const {
    request,
    env
  } = context;

  try {

    /* =====================================================
       READ BODY
    ===================================================== */

    let body;

    try {

      body =
        await request.json();

    } catch {

      return json(
        {
          success:
            false,

          error:
            "❌ درخواست JSON معتبر نیست.",

          code:
            "INVALID_JSON"
        },
        400
      );
    }

    /* =====================================================
       TEXT
    ===================================================== */

    const text =
      String(
        body?.text ||
        body?.message ||
        body?.prompt ||
        ""
      ).trim();

    if (!text) {

      return json(
        {
          success:
            false,

          error:
            "❌ متن خالی است.",

          code:
            "EMPTY_TEXT"
        },
        400
      );
    }

    if (text.length > 12000) {

      return json(
        {
          success:
            false,

          error:
            "❌ متن خیلی طولانی است.",

          code:
            "TEXT_TOO_LONG"
        },
        413
      );
    }

    /* =====================================================
       LANGUAGES
    ===================================================== */

    const source =
      normalizeLanguage(
        body?.source ||
        body?.from ||
        "auto"
      );

    const target =
      normalizeLanguage(
        body?.target ||
        body?.to ||
        "en"
      );

    if (target === "auto") {

      return json(
        {
          success:
            false,

          error:
            "❌ زبان مقصد را انتخاب کنید.",

          code:
            "INVALID_TARGET"
        },
        400
      );
    }

    /* =====================================================
       SAME LANGUAGE
    ===================================================== */

    if (
      source !== "auto" &&
      source === target
    ) {

      return json({
        success:
          true,

        reply:
          text,

        translation:
          text,

        provider:
          "same-language",

        source,

        target
      });
    }

    /* =====================================================
       LOCAL DICTIONARY
       First, because it is instant and reliable.
    ===================================================== */

    if (source !== "auto") {

      const local =
        dictionaryTranslate(
          text,
          source,
          target
        );

      if (local) {

        return json({

          success:
            true,

          reply:
            local,

          translation:
            local,

          provider:
            "local-dictionary",

          source,

          target

        });
      }
    }

    /* =====================================================
       BUILD AI PROMPT
    ===================================================== */

    const prompt =
      buildPrompt(
        text,
        source,
        target
      );

    const diagnostics = [];

    /* =====================================================
       1. CLOUDFLARE AI
    ===================================================== */

    const cloudflare =
      await callCloudflareAI(
        env,
        prompt
      );

    if (cloudflare) {

      return json({

        success:
          true,

        reply:
          cloudflare.translation,

        translation:
          cloudflare.translation,

        provider:
          cloudflare.provider,

        model:
          cloudflare.model,

        source,

        target,

        diagnostics: [
          {
            provider:
              cloudflare.provider,

            ok:
              true,

            status:
              200
          }
        ]

      });
    }

    diagnostics.push({
      provider:
        "Cloudflare Workers AI",

      ok:
        false
    });

    /* =====================================================
       2. GEMINI
    ===================================================== */

    const gemini =
      await callGemini(
        env,
        prompt
      );

    if (gemini) {

      return json({

        success:
          true,

        reply:
          gemini.translation,

        translation:
          gemini.translation,

        provider:
          gemini.provider,

        model:
          gemini.model,

        source,

        target,

        diagnostics: [
          ...diagnostics,
          {
            provider:
              gemini.provider,

            ok:
              true,

            status:
              200
          }
        ]

      });
    }

    diagnostics.push({
      provider:
        "Google Gemini",

      ok:
        false
    });

    /* =====================================================
       3. GROQ
    ===================================================== */

    const groq =
      await callGroq(
        env,
        prompt
      );

    if (groq) {

      return json({

        success:
          true,

        reply:
          groq.translation,

        translation:
          groq.translation,

        provider:
          groq.provider,

        model:
          groq.model,

        source,

        target,

        diagnostics: [
          ...diagnostics,
          {
            provider:
              groq.provider,

            ok:
              true,

            status:
              200
          }
        ]

      });
    }

    diagnostics.push({
      provider:
        "Groq",

      ok:
        false
    });

    /* =====================================================
       4. OPENROUTER
    ===================================================== */

    const openrouter =
      await callOpenRouter(
        env,
        prompt
      );

    if (openrouter) {

      return json({

        success:
          true,

        reply:
          openrouter.translation,

        translation:
          openrouter.translation,

        provider:
          openrouter.provider,

        model:
          openrouter.model,

        source,

        target,

        diagnostics: [
          ...diagnostics,
          {
            provider:
              openrouter.provider,

            model:
              openrouter.model,

            ok:
              true,

            status:
              200
          }
        ]

      });
    }

    diagnostics.push({
      provider:
        "OpenRouter",

      ok:
        false
    });

    /* =====================================================
       5. GOOGLE TRANSLATE
    ===================================================== */

    const google =
      await googleTranslate(
        text,
        source,
        target
      );

    if (google) {

      return json({

        success:
          true,

        reply:
          google.translation,

        translation:
          google.translation,

        provider:
          google.provider,

        source,

        target,

        diagnostics: [
          ...diagnostics,
          {
            provider:
              google.provider,

            ok:
              true,

            status:
              200
          }
        ]

      });
    }

    diagnostics.push({
      provider:
        "Google Translate",

      ok:
        false
    });

    /* =====================================================
       6. MYMEMORY
    ===================================================== */

    const memory =
      await myMemoryTranslate(
        text,
        source,
        target
      );

    if (memory) {

      return json({

        success:
          true,

        reply:
          memory.translation,

        translation:
          memory.translation,

        provider:
          memory.provider,

        source,

        target,

        diagnostics: [
          ...diagnostics,
          {
            provider:
              memory.provider,

            ok:
              true,

            status:
              200
          }
        ]

      });
    }

    /* =====================================================
       EVERYTHING FAILED
    ===================================================== */

    return json(
      {
        success:
          false,

        error:
          "❌ هیچ‌کدام از سرویس‌های ترجمه در حال حاضر پاسخ ندادند.",

        code:
          "ALL_TRANSLATION_PROVIDERS_FAILED",

        source,

        target,

        diagnostics
      },
      503
    );

  } catch (error) {

    console.error(
      "[YAR TRANSLATE] INTERNAL ERROR:",
      error
    );

    return json(
      {
        success:
          false,

        error:
          "❌ خطای داخلی سرویس ترجمه.",

        code:
          "INTERNAL_TRANSLATION_ERROR"
      },
      500
    );
  }
    }
