YAR Afghanistan Voice Mode V7

Main fixes:
1. Gemini is completely removed from the /api/transcribe speech-to-text path. This eliminates the Google "User location is not supported for the API use" error from voice transcription.
2. Server fallback uses Groq Whisper Large V3 Turbo, with whisper-large-v3 as a second STT model.
3. Chrome Android SpeechRecognition is used first when available, so voice mode can work without sending recorded audio to Gemini.
4. Voice mode is automatic: it listens, detects the end of speech, sends the text to Yar, speaks the answer, then listens again.
5. No Stop/Pause button is used. The microphone button only starts/restarts listening; X exits Voice Mode.
6. The voice session stays on the Voice page.

Cloudflare requirement:
- Add GROQ_API_KEY under Workers & Pages > Settings > Variables and Secrets.
- Optional: GROQ_STT_MODEL=whisper-large-v3-turbo.

The normal chat/AI routes remain unchanged.
