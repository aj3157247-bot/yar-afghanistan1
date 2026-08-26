Yar Afghanistan V11

V11 adds natural Iranian Persian female neural voice for the Voice Assistant using Azure Speech.

Cloudflare Pages Direct Upload files:
- index.html
- _worker.js

Add these Cloudflare Secrets/Variables:
- AZURE_SPEECH_KEY = your Azure Speech resource key
- AZURE_SPEECH_REGION = your Azure Speech resource region (example: eastus)

Default Persian female voice:
- fa-IR-DilaraNeural

English uses:
- en-US-Ava:DragonHDLatestNeural

The browser speech engine remains only as a fallback if Azure TTS is unavailable. The API key is never exposed to the browser.

Azure Speech supports Persian (Iran) voices including fa-IR-DilaraNeural and fa-IR-FaridNeural. It does not currently provide built-in TTS voices for Afghan Dari or Pashto, so V11 uses the requested Iranian Persian female voice for Persian/Dari/Pashto voice output as a graceful fallback.
