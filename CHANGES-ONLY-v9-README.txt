Yar AI v9 — ONLY CHANGES

این ZIP فقط فایل‌های تغییرکرده است.

1) index.html
   - نسخه جدید اسکریپت فایل‌ها با cache-busting.

2) yar-chat-files.js
   - حذف دکمه‌های «چت جدید» و «تاریخچه» از خود صفحه چت.
   - همه این امکانات داخل دکمه + قرار گرفتند.
   - تاریخچه/چت جدید با رنگ‌بندی تیره و خوانا.

3) _worker.js
   - تحلیل سمت سرور برای DOCX/XLSX/XLSM/PPTX با بازکردن OOXML در Worker.
   - استخراج متن PDF در سمت سرور برای PDFهای متنی.
   - تحلیل محتوای استخراج‌شده با Groq/OpenRouter/Gemini/Cloudflare AI.
   - PDF اسکن‌شده در صورت وجود GEMINI_API_KEY به Gemini native PDF fallback می‌شود.

نصب: هر سه فایل را جایگزین کنید و _worker.js را Deploy کنید.
