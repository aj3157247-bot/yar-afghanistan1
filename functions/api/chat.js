// functions/api/chat.js
// YAR Afghanistan - OpenRouter API Proxy
// مسیر: /api/chat

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// مدل پیش‌فرض
// اگر این مدل در حساب شما در دسترس نبود، می‌توانیم مدل را تغییر بدهیم.
const DEFAULT_MODEL = "openai/gpt-4o-mini";

export async function onRequestPost(context) {
  try {
    // ==============================
    // 1. دریافت API Key از Cloudflare Secret
    // ==============================
    const apiKey = context.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return jsonResponse(
        {
          success: false,
          error: "OPENROUTER_API_KEY_NOT_CONFIGURED",
          message: "کلید OpenRouter در Cloudflare تنظیم نشده است."
        },
        500
      );
    }

    // ==============================
    // 2. دریافت درخواست از index.html
    // ==============================
    let body;

    try {
      body = await context.request.json();
    } catch {
      return jsonResponse(
        {
          success: false,
          error: "INVALID_JSON",
          message: "داده ارسالی معتبر نیست."
        },
        400
      );
    }

    const messages = Array.isArray(body?.messages)
      ? body.messages
      : null;

    const userMessage =
      typeof body?.message === "string"
        ? body.message.trim()
        : "";

    const requestedModel =
      typeof body?.model === "string" && body.model.trim()
        ? body.model.trim()
        : DEFAULT_MODEL;

    // ==============================
    // 3. پشتیبانی از دو نوع درخواست
    // ==============================
    // حالت اول:
    // { message: "سلام" }
    //
    // حالت دوم:
    // { messages: [{role:"user",content:"سلام"}] }

    let finalMessages = messages;

    if (!finalMessages) {
      if (!userMessage) {
        return jsonResponse(
          {
            success: false,
            error: "EMPTY_MESSAGE",
            message: "پیام خالی است."
          },
          400
        );
      }

      finalMessages = [
        {
          role: "user",
          content: userMessage
        }
      ];
    }

    // ==============================
    // 4. پیام سیستمی یار افغانستان
    // ==============================

    const systemMessage = {
      role: "system",
      content:
        "تو «یار افغانستان» هستی؛ یک دستیار هوش مصنوعی برای مردم افغانستان. " +
        "به زبان کاربر پاسخ بده. اگر کاربر به دری نوشت، به دری پاسخ بده. " +
        "اگر به پشتو نوشت، به پشتو پاسخ بده. اگر انگلیسی نوشت، انگلیسی پاسخ بده. " +
        "پاسخ‌ها را واضح، دوستانه و کاربردی بنویس. " +
        "در صورت نیاز می‌توانی درباره ترجمه، آموزش، نوشتن متن، ساخت آگهی و سوالات عمومی کمک کنی."
    };

    const cleanMessages = [
      systemMessage,
      ...finalMessages
        .filter(
          (msg) =>
            msg &&
            typeof msg.role === "string" &&
            typeof msg.content === "string"
        )
        .slice(-20)
    ];

    // ==============================
    // 5. ارسال درخواست به OpenRouter
    // ==============================

    const openRouterResponse = await fetch(OPENROUTER_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,

        // اختیاری ولی مناسب برای OpenRouter
        "HTTP-Referer": new URL(context.request.url).origin,
        "X-Title": "Yar Afghanistan"
      },

      body: JSON.stringify({
        model: requestedModel,

        messages: cleanMessages,

        temperature: 0.7,

        max_tokens: 1200,

        stream: false
      })
    });

    // ==============================
    // 6. خواندن پاسخ OpenRouter
    // ==============================

    const responseText = await openRouterResponse.text();

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      return jsonResponse(
        {
          success: false,
          error: "OPENROUTER_INVALID_RESPONSE",
          message: "پاسخ OpenRouter قابل خواندن نیست.",
          status: openRouterResponse.status
        },
        502
      );
    }

    // ==============================
    // 7. بررسی خطای OpenRouter
    // ==============================

    if (!openRouterResponse.ok) {
      const providerMessage =
        data?.error?.message ||
        data?.message ||
        "خطای نامشخص از OpenRouter";

      return jsonResponse(
        {
          success: false,
          error: "OPENROUTER_ERROR",
          message: providerMessage,
          status: openRouterResponse.status
        },
        502
      );
    }

    // ==============================
    // 8. استخراج متن جواب
    // ==============================

    const answer =
      data?.choices?.[0]?.message?.content;

    if (!answer) {
      return jsonResponse(
        {
          success: false,
          error: "EMPTY_AI_RESPONSE",
          message: "هوش مصنوعی پاسخی برنگرداند."
        },
        502
      );
    }

    // ==============================
    // 9. پاسخ استاندارد برای index.html
    // ==============================

    return jsonResponse({
      success: true,
      reply: answer,
      model:
        data?.model ||
        requestedModel
    });

  } catch (error) {
    console.error("YAR API ERROR:", error);

    return jsonResponse(
      {
        success: false,
        error: "SERVER_ERROR",
        message:
          "ارتباط با سرویس هوش مصنوعی برقرار نشد."
      },
      500
    );
  }
}

// ========================================
// پاسخ JSON استاندارد
// ========================================

function jsonResponse(data, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*"
      }
    }
  );
}

// ========================================
// جلوگیری از خطای CORS برای OPTIONS
// ========================================

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
      }
