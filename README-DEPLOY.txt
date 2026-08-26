Yar Afghanistan - Direct Upload Voice Fix

Replace the previous direct-upload files with:
  index.html
  _worker.js

Keep these Cloudflare Secrets:
  GROQ_API_KEY
  GEMINI_API_KEY
  OPENROUTER_API_KEY

Voice transcription:
  1) Google Gemini Audio (primary)
  2) Groq Whisper (fallback)

Important:
- This version fixes the Gemini REST audio payload by using inline_data/mime_type.
- If transcription still fails, the UI now shows the provider error instead of only a generic message.
- Deploy a NEW production deployment after replacing the files.
