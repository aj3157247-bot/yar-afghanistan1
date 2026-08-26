Yar Afghanistan V8 Voice Fixes

Changes:
- Removed the visible Start and X/Stop controls from the voice screen. Voice mode starts automatically when the voice page opens.
- Disabled browser SpeechRecognition in voice mode. Transcription now always uses the backend Whisper path, avoiding browser speech-service beeps and wrong-language recognition.
- Voice transcription sends the selected app language (Dari/Pashto/English) to Whisper.
- Voice AI now receives an explicit language instruction and must answer only in the selected language.
- Chat backend now accepts a language field and enforces the requested language, including greetings.
- Dari/Pashto speech output no longer intentionally falls back to an English voice.
- TTS uses fa-IR for Dari and ps-AF for Pashto where available.

Deployment:
Upload index.html and _worker.js to the Cloudflare Pages project. Keep GROQ_API_KEY configured in Workers & Pages > Settings > Variables and Secrets.
