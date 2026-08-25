/*
 * YAR Afghanistan - Translation API
 * Route: POST /api/translate
 *
 * Providers:
 * 1) Local common phrases
 * 2) Google Translate public endpoint
 * 3) MyMemory public endpoint
 *
 * Expected request:
 * { "text": "...", "source": "fa", "target": "en" }
 */

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    }
  });
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
    endpoint: "/api/translate",
    method: "POST",
    status: "online"
  });
}

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

const PHRASES = [
  ["سلام","fa","Hello","en","سلام","ps"],
  ["خوب هستم","fa","I am fine","en","زه ښه یم","ps"],
  ["خوبی؟","fa","How are you?","en","ته څنګه یې؟","ps"],
  ["تشکر","fa","Thank you","en","مننه","ps"],
  ["ممنون","fa","Thank you","en","مننه","ps"],
  ["خداحافظ","fa","Goodbye","en","په مخه دې ښه","ps"],
  ["صبح بخیر","fa","Good morning","en","سهار مو پخیر","ps"],
  ["شب بخیر","fa","Good night","en","شپه مو پخیر","ps"],
  ["بله","fa","Yes","en","هو","ps"],
  ["نه","fa","No","en","نه","ps"],
  ["من افغانستان را دوست دارم","fa","I love Afghanistan","en","زه افغانستان سره مینه لرم","ps"],
  ["زه ښه یم","ps","I am fine","en","من خوب هستم","fa"],
  ["ته څنګه یې؟","ps","How are you?","en","خوبی؟","fa"],
  ["مننه","ps","Thank you","en","تشکر","fa"],
  ["په مخه دې ښه","ps","Goodbye","en","خداحافظ","fa"],
  ["سهار مو پخیر","ps","Good morning","en","صبح بخیر","fa"],
  ["شپه مو پخیر","ps","Good night","en","شب بخیر","fa"],
  ["هو","ps","Yes","en","بله","fa"],
  ["i am fine","en","خوب هستم","fa","زه ښه یم","ps"],
  ["hello","en","سلام","fa","سلام","ps"],
  ["hi","en","سلام","fa","سلام","ps"],
  ["how are you?","en","خوبی؟","fa","ته څنګه یې؟","ps"],
  ["thank you","en","تشکر","fa","مننه","ps"],
  ["goodbye","en","خداحافظ","fa","په مخه دې ښه","ps"],
  ["good morning","en","صبح بخیر","fa","سهار مو پخیر","ps"],
  ["good night","en","شب بخیر","fa","شپه مو پخیر","ps"],
  ["yes","en","بله","fa","هو","ps"],
  ["no","en","نه","fa","نه","ps"],
  ["i love afghanistan","en","من افغانستان را دوست دارم","fa","زه افغانستان سره مینه لرم","ps"]
];

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/ي/g, "ی")
    .replace(/ى/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/ۀ/g, "ه")
    .replace(/\s+/g, " ");
}

function language(value) {
  return LANG[normalize(value)] || "auto";
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
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", from === "auto" ? "auto" : from);
  url.searchParams.set("tl", to);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000)
  });

  if (!response.ok) {
    throw new Error(`Google Translate HTTP ${response.status}`);
  }

  const data = await response.json();
  const parts = Array.isArray(data?.[0]) ? data[0] : [];
  const result = parts
    .map(x => Array.isArray(x) ? x[0] : "")
    .filter(Boolean)
    .join("");

  if (!result.trim()) {
    throw new Error("Google Translate returned an empty response.");
  }

  return result.trim();
}

async function myMemoryTranslate(text, from, to) {
  const sources = from === "auto" ? ["fa", "ps", "en"] : [from];
  let lastError = null;

  for (const source of sources) {
    if (source === to) return text;

    const url = new URL("https://api.mymemory.translated.net/get");
    url.searchParams.set("q", text);
    url.searchParams.set("langpair", `${source}|${to}`);

    try {
      const response = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(8000)
      });

      if (!response.ok) {
        throw new Error(`MyMemory HTTP ${response.status}`);
      }

      const data = await response.json();
      const result = data?.responseData?.translatedText;

      if (
        typeof result === "string" &&
        result.trim() &&
        !/MYMEMORY WARNING/i.test(result)
      ) {
        return result.trim();
      }

      lastError = new Error(
        data?.responseDetails || "MyMemory returned no translation."
      );
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("MyMemory returned no translation.");
}

export async function onRequestPost(context) {
  try {
    let b = {};

    try {
      b = await context.request.json();
    } catch {
      return json({
        success: false,
        error: "❌ درخواست JSON معتبر نیست."
      }, 400);
    }

    const text = String(b?.text ?? b?.message ?? "").trim();

    if (!text) {
      return json({
        success: false,
        error: "متن خالی است."
      }, 400);
    }

    if (text.length > 12000) {
      return json({
        success: false,
        error: "متن خیلی طولانی است."
      }, 413);
    }

    const from = language(b?.source ?? b?.from ?? "auto");
    const to = language(b?.target ?? b?.to ?? "en");

    if (to === "auto") {
      return json({
        success: false,
        error: "زبان مقصد را انتخاب کنید."
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

    const errors = [];

    try {
      const result = await googleTranslate(text, from, to);
      return json({
        success: true,
        reply: result,
        translation: result,
        provider: "google-translate"
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
        provider: "mymemory"
      });
    } catch (error) {
      errors.push(`MyMemory: ${error?.message || error}`);
    }

    return json({
      success: false,
      error: "در حال حاضر سرویس‌های ترجمه در دسترس نیستند. لطفاً چند لحظه بعد دوباره تلاش کنید.",
      code: "TRANSLATION_SERVICES_UNAVAILABLE",
      details: errors
    }, 503);

  } catch (error) {
    console.error("[YAR TRANSLATE]", error);

    return json({
      success: false,
      error: "❌ خطای داخلی سرویس ترجمه.",
      code: "INTERNAL_TRANSLATION_ERROR"
    }, 500);
  }
}
