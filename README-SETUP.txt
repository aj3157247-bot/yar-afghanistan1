Yar Afghanistan V26 — Live Analytics

این نسخه پنل مدیریت را به آمار زنده کاربران وصل می‌کند.

1) Cloudflare Pages > پروژه Yar Afghanistan > Settings > Bindings
2) یک D1 Database بسازید، مثلاً yar-afghanistan-analytics
3) Binding Name را دقیقاً DB بگذارید.
4) در D1، فایل schema.sql را یک بار اجرا کنید. (خود API هم در اولین درخواست جدول‌ها را می‌سازد.)
5) Deploy مجدد کنید.

بعد از Deploy:
- هر گوشی/کامپیوتر یک device_id تصادفی در localStorage می‌گیرد.
- هنگام ورود به برنامه event=visit ثبت می‌شود.
- هر 60 ثانیه heartbeat ثبت می‌شود.
- با فعال شدن دوباره صفحه event=active ثبت می‌شود.
- پنل مدیریت از /api/analytics?summary=1 آمار زنده می‌گیرد.

آمارهای فعلی:
- کل دستگاه‌های یکتا
- دستگاه‌های فعال در 5 دقیقه اخیر
- موبایل
- کامپیوتر
- رویدادهای امروز
- دستگاه‌های امروز
- بازدیدهای امروز

امنیت:
برای خصوصی کردن endpoint آمار، در Cloudflare Pages یک Secret با نام
ADMIN_ANALYTICS_KEY
بسازید. توجه کنید این نسخه هنوز احراز هویت کامل Google/Cloudflare Access برای
پنل مدیریت ندارد؛ برای امنیت واقعی پنل بهتر است مسیر /admin را با Cloudflare
Access یا یک سیستم احراز هویت سروری محافظت کنید.
