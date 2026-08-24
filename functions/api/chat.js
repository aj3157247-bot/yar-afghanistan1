export async function onRequestPost(context) {
  const { request, env } = context;

  // بررسی وجود API Key
  if (!env.OPENROUTER_API_KEY) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "OPENROUTER_API_KEY تنظیم نشده است."
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=UTF-8"
        }
      }
    );
  }

  // فقط درخواست JSON قبول می‌کنیم
  let body;

  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        error: "درخواست JSON معتبر نیست."
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json; charset=UTF-8"
        }
      }
    );
  }

  // دریافت پیام‌ها
  const messages = Array.isArray(body.messages)
    ? body.messages
    : null;

  if (!messages || messages.length === 0) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "پیام برای ارسال وجود ندارد."
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json; charset=UTF-8"
        }
      }
    );
  }

  // محدود کردن اندازه درخواست برای جلوگیری از سوءاستفاده
  const messagesJson = JSON.stringify(messages);

  if (messagesJson.length > 30000) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "متن ارسالی بیش از حد بزرگ است."
      }),
      {
        status: 413,
        headers: {
          "Content-Type": "application/json; charset=UTF-8"
        }
      }
    );
  }

  // مدل پیش‌فرض
  const model =
    typeof body.model === "string" && body.model.trim()
      ? body.model.trim()
      : "openrouter/free";

  // ارسال درخواست به OpenRouter
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://yar-afghanistan1.pages.dev",
          "X-OpenRouter-Title": "یار افغانستان"
        },

        body: JSON.stringify({
          model,
          messages,
          temperature:
            typeof body.temperature === "number"
              ? body.temperature
              : 0.7,

          max_tokens:
            typeof body.max_tokens === "number"
              ? Math.min(body.max_tokens, 2000)
              : 1000
        })
      }
    );

    const data = await response.json();

    // اگر OpenRouter خطا برگرداند
    if (!response.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            data?.error?.message ||
            "خطا در ارتباط با OpenRouter",
          details: data?.error || null
        }),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }

    // استخراج پاسخ هوش مصنوعی
    const answer =
      data?.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({
        success: true,
        answer,
        model: data?.model || model,
        usage: data?.usage || null
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store"
        }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "ارتباط با سرویس هوش مصنوعی برقرار نشد.",
        details: error?.message || "Unknown error"
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }
}

// پاسخ به درخواست‌های OPTIONS
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
    }
