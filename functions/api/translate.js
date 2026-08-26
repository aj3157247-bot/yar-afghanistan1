/**
 * Yar Afghanistan - Voice Transcription API
 * POST /api/transcribe
 *
 * Browser sends a short audio recording as multipart/form-data:
 *   audio      -> Blob/File
 *   language   -> fa | ps | en | auto
 *
 * Provider order:
 *   1) Groq Whisper (GROQ_API_KEY)
 *   2) Gemini audio understanding (GEMINI_API_KEY)
 *
 * This endpoint is intentionally separate from /api/chat so the existing
 * multi-AI chat backend keeps working unchanged.
 */

const GROQ_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
const GROQ_MODEL = "whisper-large-v3";
const GEMINI_MODEL = "gemini-2.5-flash";
const MAX_AUDIO_BYTES = 20 * 1024 * 1024;

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    },
  });
}

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export function onRequestGet() {
  return json({
    success: true,
    service: "Yar Afghanistan Voice Transcription API",
    endpoint: "/api/transcribe",
    method: "POST",
    providers: ["Groq Whisper", "Google Gemini"],
  });
}

function normalizeLanguage(value) {
  const v = String(value || "auto").trim().toLowerCase();
  if (v === "fa" || v === "dari" || v === "prs") return "fa";
  if (v === "ps" || v === "pashto") return "ps";
  if (v === "en" || v === "english") return "en";
  return "auto";
}

function cleanText(value) {
  if (typeof value !== "string") return "";
  return value
    .replace(/^```[\s\S]*?```$/g, "")
    .replace(/^\s*(transcription|transcript|text|متن|ترجمه)\s*:\s*/i, "")
    .trim();
}

async function transcribeWithGroq(env, audio, language) {
  const key = String(env?.GROQ_API_KEY || "").trim();
  if (!key) return null;

  const form = new FormData();
  const filename = audio.name || "yar-voice.webm";
  const mime = audio.type || "audio/webm";

  form.append("file", new Blob([await audio.arrayBuffer()], { type: mime }), filename);
  form.append("model", String(env?.GROQ_STT_MODEL || GROQ_MODEL));
  form.append("response_format", "json");
  form.append("temperature", "0");
  form.append(
    "prompt",
    "Transcribe exactly what the speaker says. Preserve Dari, Afghan Pashto, Persian and English words. Do not translate, summarize, explain, or add text."
  );

  if (language !== "auto") {
    form.append("language", language);
  }

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
    },
    body: form,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      data?.error?.message || `Groq HTTP ${response.status}`
    );
  }

  const text = cleanText(data?.text);
  if (!text) throw new Error("Groq returned an empty transcription.");

  return {
    text,
    provider: "Groq Whisper",
    model: String(env?.GROQ_STT_MODEL || GROQ_MODEL),
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
  const key = String(env?.GEMINI_API_KEY || "").trim();
  if (!key) return null;

  const bytes = new Uint8Array(await audio.arrayBuffer());
  if (bytes.byteLength > 12 * 1024 * 1024) {
    throw new Error("Audio is too large for the Gemini inline fallback.");
  }

  const mimeType = audio.type || "audio/webm";
  const langInstruction =
    language === "fa"
      ? "The speaker is likely using Afghan Dari/Persian."
      : language === "ps"
        ? "The speaker is likely using Afghan Pashto."
        : language === "en"
          ? "The speaker is likely using English."
          : "Detect whether the speaker is using Dari/Persian, Afghan Pashto, or English.";

  const prompt = `${langInstruction}\nTranscribe the audio exactly into text. Return ONLY the spoken words. Do not translate, summarize, explain, correct, or add anything.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      String(env?.GEMINI_STT_MODEL || GEMINI_MODEL)
    )}:generateContent?key=${encodeURIComponent(key)}`,
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

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      data?.error?.message || `Gemini HTTP ${response.status}`
    );
  }

  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = cleanText(
    parts.map((part) => (typeof part?.text === "string" ? part.text : "")).join("")
  );

  if (!text) throw new Error("Gemini returned an empty transcription.");

  return {
    text,
    provider: "Google Gemini Audio",
    model: String(env?.GEMINI_STT_MODEL || GEMINI_MODEL),
  };
}

export async function onRequestPost(context) {
  try {
    const form = await context.request.formData();
    const audio = form.get("audio");
    const language = normalizeLanguage(form.get("language"));

    if (!(audio instanceof File) && !(audio instanceof Blob)) {
      return json(
        {
          success: false,
          error: "❌ فایل صوتی دریافت نشد.",
          code: "AUDIO_REQUIRED",
        },
        400
      );
    }

    if (audio.size <= 0) {
      return json(
        { success: false, error: "❌ فایل صوتی خالی است.", code: "EMPTY_AUDIO" },
        400
      );
    }

    if (audio.size > MAX_AUDIO_BYTES) {
      return json(
        {
          success: false,
          error: "❌ فایل صوتی بیش از حد بزرگ است. لطفاً کوتاه‌تر صحبت کنید.",
          code: "AUDIO_TOO_LARGE",
        },
        413
      );
    }

    const diagnostics = [];

    try {
      const result = await transcribeWithGroq(context.env, audio, language);
      if (result?.text) {
        return json({
          success: true,
          text: result.text,
          transcription: result.text,
          reply: result.text,
          provider: result.provider,
          model: result.model,
          diagnostics: [{ provider: result.provider, model: result.model, ok: true }],
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
      const result = await transcribeWithGemini(context.env, audio, language);
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

    return json(
      {
        success: false,
        error: "❌ هیچ سرویس تبدیل صدا به متن پاسخ نداد. لطفاً دوباره امتحان کنید.",
        code: "TRANSCRIPTION_FAILED",
        diagnostics,
      },
      503
    );
  } catch (error) {
    console.error("[YAR] Voice API unexpected error:", error);
    return json(
      {
        success: false,
        error: "❌ خطای داخلی سرویس صوتی. لطفاً دوباره تلاش کنید.",
        code: "VOICE_INTERNAL_ERROR",
      },
      500
    );
  }
}
