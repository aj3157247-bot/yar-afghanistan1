Yar Afghanistan – Chat Backend Fix

فقط فایل functions/api/chat.js تغییر کرده است.

هدف: جلوگیری از وابستگی اجباری چت به سهمیه روزانه مدل‌های رایگان OpenRouter.

اولویت اتصال:
1) Cloudflare Workers AI (اگر binding با نام AI فعال باشد)
2) Google Gemini با Secret: GEMINI_API_KEY
3) Groq با Secret: GROQ_API_KEY
4) OpenRouter به عنوان fallback

اگر فقط OpenRouter دارید، خطای سهمیه رایگان همچنان ممکن است؛ این کد آن محدودیت را دور نمی‌زند. برای حذف این وابستگی باید حداقل یکی از Gemini/Groq یا Cloudflare Workers AI را در Backend فعال کنید.
