Yar Afghanistan - Cloudflare Pages Direct Upload
=================================================

This version is for Cloudflare Pages deployments that use:
  Add files via upload

Files:
  index.html
  _worker.js

IMPORTANT:
Do NOT upload the old functions/ folder for this version.
The backend is now inside _worker.js (Advanced Mode).

Cloudflare Pages Secrets / Variables:
  GROQ_API_KEY        recommended (chat + voice transcription)
  GEMINI_API_KEY      recommended (chat + translation + voice fallback)
  OPENROUTER_API_KEY  optional fallback / vision

After uploading, create a new Production deployment.

Quick checks:
  /api/health
  /api/chat       (GET should return JSON status)
  /api/translate (GET should return JSON status)
  /api/transcribe (GET should return JSON status)

Voice:
  The page uses MediaRecorder, not SpeechRecognition.
  The browser records audio and sends it to POST /api/transcribe.

Translation:
  AI translation is used before public translation endpoints so longer
  Dari/Pashto/English sentences are translated naturally.
