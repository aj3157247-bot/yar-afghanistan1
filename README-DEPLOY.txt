Yar Afghanistan - Cloudflare Pages Analytics Fix

این نسخه _worker.js شامل /api/analytics است و Analytics را مستقیم به D1 متصل می‌کند.

فایل اصلی:
- _worker.js

Binding لازم در Cloudflare Pages:
- D1 Database binding
- Variable name: DB
- Database: yar-afghanistan-db

همچنین اگر از Workers AI استفاده می‌شود:
- Workers AI binding
- Variable name: AI

پس از جایگزین کردن _worker.js در GitHub، یک Deployment جدید انجام دهید.

تست اتصال:
GET /api/health

تست Analytics:
GET /api/analytics?summary=1

ثبت دستگاه:
POST /api/analytics
JSON:
{"device_id":"test-device","device_type":"mobile","event":"visit"}

نکته:
این نسخه برای Pages Advanced Mode طراحی شده و مسیر /api/analytics را داخل خود _worker.js مدیریت می‌کند؛
بنابراین برای فعال شدن همین مسیر، فایل جداگانه functions/api/analytics.js ضروری نیست.
