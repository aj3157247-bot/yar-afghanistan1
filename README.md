# یار افغانستان — Cloudflare Pages Full-Stack

این نسخه برای همان ساختار فعلی GitHub/Cloudflare Pages ساخته شده است. Pages Functions از پوشه `functions/` به‌صورت file-based route استفاده می‌کنند.

## Secrets / Bindings

در Cloudflare Pages → Settings → Variables and Secrets:

- `OPENROUTER_API_KEY` = کلید OpenRouter (به صورت Secret/Encrypt)
- `OPENROUTER_MODEL` = `openrouter/free` (اختیاری)

در Bindings یک D1 Database با نام binding دقیقاً `DB` اضافه کن.

## D1 schema

محتوای `schema.sql` را روی D1 اجرا کن.

## تست

بعد از deploy:

- `/api/health`
- `/api/chat`

باید JSON معتبر برگردانند.

## مهم

کلید OpenRouter هرگز داخل `index.html` قرار نگرفته است. Browser فقط `/api/chat` را صدا می‌زند و Function با Secret به OpenRouter متصل می‌شود.
