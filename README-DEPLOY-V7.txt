V7 deployment

Upload/replace these files in the same Cloudflare Pages project:
- index.html
- _worker.js

Then create/update the secret:
GROQ_API_KEY = your Groq API key

Redeploy and open the site in Chrome Android. If Chrome supports SpeechRecognition, V7 uses it first. Otherwise it sends the recorded audio to /api/transcribe, which uses Groq Whisper and never Gemini for speech-to-text.
