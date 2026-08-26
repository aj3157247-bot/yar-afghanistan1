/*
 * YAR Afghanistan - Translation API
 * Cloudflare Pages Function
 * Route: POST /api/translate
 *
 * Supported:
 *   fa = Dari
 *   ps = Pashto
 *   en = English
 *   auto = automatic source detection
 *
 * Provider order:
 *   1. Local exact phrases
 *   2. Google public translate endpoint
 *   3. MyMemory public endpoint
 */

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    }
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
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
    supported_languages: ["auto", "fa", "ps", "en"]
  });
}

const ALIASES = {
  auto: "auto",
  detected: "auto",

  fa: "fa",
  dari: "fa",
  prs: "fa",
  persian: "fa",
  farsi: "fa",

  ps: "ps",
  pashto: "ps",

  en: "en",
  english: "en"
};

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/ي/g, "ی")
    .replace(/ى/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/ۀ/g, "ه")
    .replace(/\u200c/g, "")
    .replace(/\s+/g, " ");
}

function getLanguage(value, fallback = "auto") {
  const key = normalize(value);
  return ALIASES[key] || fallback;
}

/*
 * Exact common phrases.
 * The important one:
 * fa/auto -> en: سلام = Hello
 */
const PHRASES = [
  ["سلام", "fa", "Hello", "en", "سلام", "ps"],
  ["خوب هستم", "fa", "I am fine", "en", "زه ښه یم", "ps"],
  ["خوبی؟", "fa", "How are you?", "en", "ته څنګه یې؟", "ps"],
  ["تشکر", "fa", "Thank you", "en", "مننه", "ps"],
  ["ممنون", "fa", "Thank you", "en", "مننه", "ps"],
  ["خداحافظ", "fa", "Goodbye", "en", "په مخه دې ښه", "ps"],
  ["صبح بخیر", "fa", "Good morning", "en", "سهار مو پخیر", "ps"],
  ["شب بخیر", "fa", "Good night", "en", "شپه مو پخیر", "ps"],
  ["بله", "fa", "Yes", "en", "هو", "ps"],
  ["نه", "fa", "No", "en", "نه", "ps"],
  ["من افغانستان را دوست دارم", "fa", "I love Afghanistan", "en", "زه افغانستان سره مینه لرم", "ps"],

  ["زه ښه یم", "ps", "I am fine", "en", "من خوب هستم", "fa"],
  ["ته څنګه یې؟", "ps", "How are you?", "en", "خوبی؟", "fa"],
  ["مننه", "ps", "Thank you", "en", "تشکر", "fa"],
  ["په مخه دې ښه", "ps", "Goodbye", "en", "خداحافظ", "fa"],
  ["سهار مو پخیر", "ps", "Good morning", "en", "صبح بخیر", "fa"],
  ["شپه مو پخیر", "ps", "Good night", "en", "شب بخیر", "fa"],
  ["هو", "ps", "Yes", "en", "بله", "fa"],

  ["hello", "en", "سلام", "fa", "سلام", "ps"],
  ["hi", "en", "سلام", "fa", "سلام", "ps"],
  ["how are you?", "en", "خوبی؟", "fa", "ته څنګه یې؟", "ps"],
  ["thank you", "en", "تشکر", "fa", "مننه", "ps"],
  ["goodbye", "en", "خداحافظ", "fa", "په مخه دې ښه", "ps"],
  ["good morning", "en", "صبح بخیر", "fa", "سهار مو پخیر", "ps"],
  ["good night", "en", "شب بخیر", "fa", "شپه مو پخیر", "ps"],
  ["yes", "en", "بله", "fa", "هو", "ps"],
  ["no", "en", "نه", "fa", "نه", "ps"]
];

function localTranslate(text, from, to) {
  const n = normalize(text);

  for (const [a, al, b, bl, c, cl] of PHRASES) {
    if (normalize(a) !== n) continue;

    if (from === al && to === bl) return b;
    if (from === al && to === cl) return c;
  }

  return null;
}

async function googleTranslate(text, from, to) {
  const url = new URL(
    "https://translate.googleapis.com/translate_a/single"
  );

  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", from === "auto" ? "auto" : from);
  url.searchParams.set("tl", to);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json"
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Google HTTP ${response.status}`);
    }

    const data = await response.json();
    const parts = Array.isArray(data?.[0]) ? data[0] : [];

    const result = parts
      .map(part => Array.isArray(part) ? part[0] : "")
      .filter(Boolean)
      .join("")
      .trim();

    if (!result) {
      throw new Error("Google returned an empty translation.");
    }

    return result;
  } finally {
    clearTimeout(timer);
  }
}

async function myMemoryTranslate(text, from, to) {
  const sources =
    from === "auto"
      ? ["fa", "ps", "en"]
      : [from];

  let lastError = null;

  for (const source of sources) {
    if (source === to) return text;

    try {
      const url = new URL(
        "https://api.mymemory.translated.net/get"
      );

      url.searchParams.set("q", text);
      url.searchParams.set(
        "langpair",
        `${source}|${to}`
      );

      const controller = new AbortController();
      const timer = setTimeout(
        () => controller.abort(),
        9000
      );

      try {
        const response = await fetch(
          url.toString(),
          {
            headers: {
              "Accept": "application/json"
            },
            signal: controller.signal
          }
        );

        if (!response.ok) {
          throw new Error(
            `MyMemory HTTP ${response.status}`
          );
        }

        const data = await response.json();
        const result =
          data?.responseData?.translatedText;

        if (
          typeof result === "string" &&
          result.trim() &&
          !/MYMEMORY WARNING/i.test(result)
        ) {
          return result.trim();
        }

        throw new Error(
          data?.responseDetails ||
          "MyMemory returned no translation."
        );
      } finally {
        clearTimeout(timer);
      }

    } catch (error) {
      lastError = error;
    }
  }

  throw (
    lastError ||
    new Error("MyMemory returned no translation.")
  );
}

export async function onRequestPost(context) {
  try {
    let body = {};

    try {
      body = await context.request.json();
    } catch {
      return json({
        success: false,
        error: "❌ درخواست JSON معتبر نیست."
      }, 400);
    }

    const text = String(
      body?.text ??
      body?.message ??
      ""
    ).trim();

    if (!text) {
      return json({
        success: false,
        error: "❌ متن خالی است."
      }, 400);
    }

    if (text.length > 12000) {
      return json({
        success: false,
        error: "❌ متن خیلی طولانی است."
      }, 413);
    }

    /*
     * IMPORTANT:
     * target is read from body.target FIRST.
     * Therefore target=en can never silently become fa.
     */
    const rawSource =
      body?.source ??
      body?.from ??
      "auto";

    const rawTarget =
      body?.target ??
      body?.to ??
      "en";

    const from = getLanguage(rawSource, "auto");
    const to = getLanguage(rawTarget, "en");

    console.log("[YAR TRANSLATE]", {
      source: rawSource,
      target: rawTarget,
      normalizedSource: from,
      normalizedTarget: to,
      textLength: text.length
    });

    if (!["fa", "ps", "en"].includes(to)) {
      return json({
        success: false,
        error: "❌ زبان مقصد نامعتبر است.",
        received_target: rawTarget
      }, 400);
    }

    if (
      from !== "auto" &&
      !["fa", "ps", "en"].includes(from)
    ) {
      return json({
        success: false,
        error: "❌ زبان مبدأ نامعتبر است.",
        received_source: rawSource
      }, 400);
    }

    if (from !== "auto" && from === to) {
      return json({
        success: true,
        reply: text,
        translation: text,
        provider: "same-language",
        source: from,
        target: to
      });
    }

    /*
     * Exact phrase:
     * If user sends "سلام" with target=en,
     * this returns "Hello" even if Google/MyMemory are unavailable.
     */
    if (from !== "auto") {
      const local = localTranslate(text, from, to);

      if (local) {
        return json({
          success: true,
          reply: local,
          translation: local,
          provider: "local",
          source: from,
          target: to
        });
      }
    }

    /*
     * For auto source, also check each possible source
     * against the local dictionary. This fixes:
     * auto + English + سلام => Hello
     */
    if (from === "auto") {
      for (const possibleSource of ["fa", "ps", "en"]) {
        const local = localTranslate(
          text,
          possibleSource,
          to
        );

        if (local) {
          return json({
            success: true,
            reply: local,
            translation: local,
            provider: "local-auto",
            detected_source: possibleSource,
            source: "auto",
            target: to
          });
        }
      }
    }

    const errors = [];

    try {
      const result =
        await googleTranslate(
          text,
          from,
          to
        );

      return json({
        success: true,
        reply: result,
        translation: result,
        provider: "google-translate",
        source: from,
        target: to
      });

    } catch (error) {
      errors.push(
        `Google: ${error?.message || error}`
      );
    }

    try {
      const result =
        await myMemoryTranslate(
          text,
          from,
          to
        );

      return json({
        success: true,
        reply: result,
        translation: result,
        provider: "mymemory",
        source: from,
        target: to
      });

    } catch (error) {
      errors.push(
        `MyMemory: ${error?.message || error}`
      );
    }

    return json({
      success: false,
      error:
        "❌ سرویس‌های ترجمه فعلاً در دسترس نیستند.",
      code:
        "TRANSLATION_SERVICES_UNAVAILABLE",
      source: from,
      target: to,
      details: errors
    }, 503);

  } catch (error) {
    console.error(
      "[YAR TRANSLATE INTERNAL ERROR]",
      error
    );

    return json({
      success: false,
      error: "❌ خطای داخلی سرویس ترجمه.",
      code: "INTERNAL_TRANSLATION_ERROR"
    }, 500);
  }
}
