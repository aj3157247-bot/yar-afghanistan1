/**
 * Yar Afghanistan - Voice Transcription API
 * Cloudflare Pages Functions
 *
 * Endpoint:
 *   POST /api/transcribe
 *
 * The browser sends multipart/form-data with:
 *   audio    = recorded audio Blob/File
 *   language = fa | ps | en | auto
 *
 * Provider order:
 *   1) Groq Whisper (GROQ_API_KEY)
 *   2) Gemini audio fallback (GEMINI_API_KEY)
 *
 * IMPORTANT:
 * We intentionally use a single onRequest() handler instead of relying only
 * on onRequestPost(). This makes the route work reliably on Cloudflare Pages
 * deployments where method-specific exports have previously returned HTTP 405.
 */

const GROQ_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
const DEFAULT_GROQ_MODEL = "whisper-large-v3-turbo";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const MAX_AUDIO_BYTES = 20 * 1024 * 1024;

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...corsHeaders(),
    },
  });
}

function normalizeLanguage(value) {
  const v = String(value || "auto").trim().toLowerCase();
  if (v === "fa" || v === "dari" || v === "prs" || v === "persian") return "fa";
  if (v === "ps" || v === "pashto" || v === "pus") return "ps";
  if (v === "en" || v === "english") return "en";
  return "auto";
}

function cleanText(value) {
  if (typeof value !== "string") return "";
  return value
    .replace(/^```(?:text)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .replace(/^\s*(transcription|transcript|text|متن)\s*:\s*/i, "")
    .trim();
}

function getEnvString(env, name) {
  return String(env?.[name] || "").trim();
}

async function transcribeWithGroq(env, audio, language) {
  const key = getEnvString(env, "GROQ_API_KEY");
  if (!key) return null;

  const bytes = await audio.arrayBuffer();
  if (bytes.byteLength > MAX_AUDIO_BYTES) {
    throw new Error("Audio file is too large.");
  }

  const mime = String(audio.type || "audio/webm").split(";")[0] || "audio/webm";
  let filename = audio.name || "yar-voice.webm";
  if (!/\.[a-z0-9]+$/i.test(filename)) filename += ".webm";

  const form = new FormData();
  form.append("file", new Blob([bytes], { type: mime }), filename);
  form.append("model", getEnvString(env, "GROQ_STT_MODEL") || DEFAULT_GROQ_MODEL);
  form.append("response_format", "json");
  form.append("temperature", "0");
  form.append(
    "prompt",
    "Transcribe exactly what the speaker says. Preserve Afghan Dari, Persian, Afghan Pashto, and English. Do not translate, summarize, explain, correct, or add words."
  );

  if (language !== "auto") form.append("language", language);

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });

  const raw = await response.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data?.error?.message || `Groq HTTP ${response.status}`);
  }

  const text = cleanText(data?.text);
  if (!text) throw new Error("Groq returned an empty transcription.");

  return {
    text,
    provider: "Groq Whisper",
    model: getEnvString(env, "GROQ_STT_MODEL") || DEFAULT_GROQ_MODEL,
  };
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

async function transcribeWithGemini(env, audio, language) {
  const key = getEnvString(env, "GEMINI_API_KEY");
  if (!key) return null;

  const bytes = new Uint8Array(await audio.arrayBuffer());
  if (bytes.byteLength > 12 * 1024 * 1024) {
    throw new Error("Audio is too large for Gemini fallback.");
  }

  const mimeType = String(audio.type || "audio/webm").split(";")[0] || "audio/webm";
  const langInstruction =
    language === "fa"
      ? "The speaker is likely speaking Afghan Dari/Persian."
      : language === "ps"
        ? "The speaker is likely speaking Afghan Pashto."
        : language === "en"
          ? "The speaker is likely speaking English."
          : "Detect whether the speaker is using Afghan Dari/Persian, Afghan Pashto, or English.";

  const prompt = `${langInstruction}\nTranscribe the audio exactly. Return ONLY the spoken words. Do not translate, summarize, explain, correct, or add anything.`;
  const model = getEnvString(env, "GEMINI_STT_MODEL") || DEFAULT_GEMINI_MODEL;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: bytesToBase64(bytes),
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 1000,
        },
      }),
    }
  );

  const raw = await response.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data?.error?.message || `Gemini HTTP ${response.status}`);
  }

  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = cleanText(
    parts.map((part) => (typeof part?.text === "string" ? part.text : "")).join("")
  );

  if (!text) throw new Error("Gemini returned an empty transcription.");

  return {
    text,
    provider: "Google Gemini Audio",
    model,
  };
}

async function handlePost(request, env) {
  let form;
  try {
    form = await request.formData();
  } catch (error) {
    return json(
      {
        success: false,
        error: "❌ درخواست صوتی معتبر نیست. لطفاً دوباره روی دکمه میکروفون بزنید.",
        code: "INVALID_MULTIPART_FORM",
        details: error?.message || String(error),
      },
      400
    );
  }

  const audio = form.get("audio");
  const language = normalizeLanguage(form.get("language"));

  if (!audio || typeof audio.arrayBuffer !== "function") {
    return json(
      {
        success: false,
        error: "❌ فایل صوتی دریافت نشد.",
        code: "AUDIO_REQUIRED",
      },
      400
    );
  }

  if (typeof audio.size === "number" && audio.size <= 0) {
    return json(
      { success: false, error: "❌ فایل صوتی خالی است.", code: "EMPTY_AUDIO" },
      400
    );
  }

  if (typeof audio.size === "number" && audio.size > MAX_AUDIO_BYTES) {
    return json(
      {
        success: false,
        error: "❌ فایل صوتی خیلی بزرگ است. لطفاً کوتاه‌تر صحبت کنید.",
        code: "AUDIO_TOO_LARGE",
      },
      413
    );
  }

  const diagnostics = [];

  try {
    const result = await transcribeWithGroq(env, audio, language);
    if (result?.text) {
      return json({
        success: true,
        text: result.text,
        transcription: result.text,
        reply: result.text,
        provider: result.provider,
        model: result.model,
        diagnostics: [
          ...diagnostics,
          { provider: result.provider, model: result.model, ok: true },
        ],
      });
    }
  } catch (error) {
    diagnostics.push({
      provider: "Groq Whisper",
      ok: false,
      error: error?.message || String(error),
    });
    console.error("[YAR] Groq transcription error:", error);
  }

  try {
    const result = await transcribeWithGemini(env, audio, language);
    if (result?.text) {
      return json({
        success: true,
        text: result.text,
        transcription: result.text,
        reply: result.text,
        provider: result.provider,
        model: result.model,
        diagnostics: [
          ...diagnostics,
          { provider: result.provider, model: result.model, ok: true },
        ],
      });
    }
  } catch (error) {
    diagnostics.push({
      provider: "Google Gemini Audio",
      ok: false,
      error: error?.message || String(error),
    });
    console.error("[YAR] Gemini transcription error:", error);
  }

  if (!getEnvString(env, "GROQ_API_KEY") && !getEnvString(env, "GEMINI_API_KEY")) {
    return json(
      {
        success: false,
        error: "❌ هیچ کلید صوتی در Cloudflare تنظیم نشده است. GROQ_API_KEY یا GEMINI_API_KEY را اضافه کنید.",
        code: "NO_VOICE_PROVIDER_CONFIGURED",
        diagnostics,
      },
      500
    );
  }

  return json(
    {
      success: false,
      error: "❌ هیچ سرویس تبدیل صدا به متن پاسخ نداد. لطفاً دوباره امتحان کنید.",
      code: "TRANSCRIPTION_FAILED",
      diagnostics,
    },
    503
  );
}

/**
 * Universal Cloudflare Pages handler.
 * Handles OPTIONS, GET and POST explicitly and avoids HTTP 405 caused by
 * method-specific routing/deployment issues.
 */
export async function onRequest(context) {
  const method = context.request.method.toUpperCase();

  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (method === "GET") {
    return json({
      success: true,
      service: "Yar Afghanistan Voice Transcription API",
      status: "online",
      endpoint: "/api/transcribe",
      method: "POST",
      providers: ["Groq Whisper", "Google Gemini"],
      message: "POST multipart/form-data with audio and language.",
    });
  }

  if (method === "POST") {
    return handlePost(context.request, context.env);
  }

  return json(
    {
      success: false,
      error: "❌ این متد پشتیبانی نمی‌شود.",
      code: "METHOD_NOT_ALLOWED",
      allowed: ["GET", "POST", "OPTIONS"],
    },
    405
  );
}
