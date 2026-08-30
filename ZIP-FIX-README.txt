Yar AI ZIP Analysis Fix v4

این ZIP فقط فایل‌های تغییرکرده را دارد.

جایگزین کنید:
- index.html
- yar-chat-upgrade.js
- _worker.js

علت اصلی خرابی ZIP: فرانت‌اند فایل‌های استخراج‌شده را با JSON به /api/project می‌فرستاد، اما Worker فقط multipart ZIP واقعی قبول می‌کرد. همچنین پاسخ analyze/fix با فرمت مورد انتظار فرانت‌اند یکی نبود. این نسخه هر دو مسیر JSON و multipart را پشتیبانی می‌کند و خروجی تحلیل/اصلاح را با فرمت درست برمی‌گرداند.

بعد از جایگزینی، _worker.js را حتماً Deploy کنید و صفحه را با refresh کامل باز کنید.
