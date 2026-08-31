Yar AI v11 - file analysis fix (changes only)

Replace these files in the existing project:
- index.html
- yar-chat-files.js
- _worker.js

Then deploy _worker.js again.

Key fixes:
- Generic File picker now routes .zip/.zipx to /api/project.
- PDF/DOCX/XLSX/PPTX are sent to server-side /api/file-binary first.
- PDF uses native Gemini PDF input first when GEMINI_API_KEY is configured.
- Provider failures are surfaced with diagnostics instead of silently falling back to a model response claiming it cannot read attachments.
