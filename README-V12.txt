Yar Afghanistan V12 — Gemini TTS, no Azure

Only the files required for this update are included:
- index.html
- _worker.js

Changes:
- Removed Azure Speech dependency from the voice output path.
- Uses existing GEMINI_API_KEY for Google Gemini TTS.
- Uses gemini-2.5-flash-preview-tts by default.
- Persian voice is prompted for warm, natural Iranian Persian female delivery.
- Pashto and English use the same natural conversational TTS engine with language-specific direction.
- Gemini PCM/L16 output is wrapped as WAV for reliable Android/Chrome playback.
- Existing Groq Whisper STT remains in _worker.js.
- Existing multi-AI chat system remains in _worker.js.

Cloudflare:
Make sure GEMINI_API_KEY already exists in Variables and Secrets.
Optional:
GEMINI_TTS_MODEL=gemini-2.5-flash-preview-tts

No Azure key or Azure region is required.
