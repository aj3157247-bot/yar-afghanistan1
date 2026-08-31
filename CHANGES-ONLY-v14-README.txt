Yar AI v14 — PDF analysis fix (ONLY CHANGES)

Changed:
- _worker.js: PDF is sent directly to Gemini with model fallback (3.6 -> 3.7 -> 2.5) and real provider errors logged.
- yar-chat-files.js: removed browser PDF-library dependency/fallback that caused “کتابخانه مورد نیاز بارگذاری نشد”. Server is authoritative for PDFs.
- functions/api/file.js: compatibility size adjustment.

Deploy _worker.js and replace yar-chat-files.js. If using Pages Functions too, replace functions/api/file.js.
Requires GEMINI_API_KEY for native PDF/scan analysis.
