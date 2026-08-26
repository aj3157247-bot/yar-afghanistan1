Yar Afghanistan V11.3 — Iranian Persian female voice fix

The Azure voice fa-IR-DilaraNeural is a real current Microsoft Azure Speech standard female Persian (Iran) voice.

V11.3 fixes the integration side:
- accepts AZURE_SPEECH_KEY, AZURE_TTS_KEY, or SPEECH_KEY
- accepts AZURE_SPEECH_REGION / AZURE_TTS_REGION / SPEECH_REGION
- accepts AZURE_SPEECH_ENDPOINT / AZURE_TTS_ENDPOINT / SPEECH_ENDPOINT
- prefers the resource endpoint when provided
- gives useful HTTP 401/403/404/400 diagnostics instead of saying the voice itself is unavailable
- keeps fa-IR-DilaraNeural locked for Persian/Dari/Pashto output
- never falls back to Android/Chrome English TTS for fa/ps

IMPORTANT:
Azure Speech keys are region-scoped. The key and region/endpoint must belong to the same Azure Speech resource.
Microsoft documents fa-IR-DilaraNeural as a current female Persian (Iran) voice.

Recommended Cloudflare secrets:
AZURE_SPEECH_KEY
AZURE_SPEECH_REGION

Or use:
AZURE_SPEECH_KEY + AZURE_SPEECH_ENDPOINT

After deployment, open /api/tts in the same site. It returns JSON showing whether a key and endpoint are configured (never the secret itself).
