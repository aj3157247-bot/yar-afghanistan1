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


V11.1 UI change: the home page now shows the live clock directly above the new dashboard. The previous language and top-navigation strips are hidden from the page while their DOM hooks remain for JavaScript compatibility.


V11.2 voice fix:
- Persian/Dari/Pashto voice output is locked to Azure fa-IR-DilaraNeural (female Iranian Persian).
- The browser/Android English TTS fallback is disabled for fa/ps, so Persian can no longer be spoken as broken English.
- Azure SSML now includes the official synthesis namespace and cleaner sentence/paragraph boundaries.
- If Azure is unavailable, the page shows a clear Azure configuration error instead of producing wrong English audio.
- Azure Speech must have AZURE_SPEECH_KEY and AZURE_SPEECH_REGION configured in the Cloudflare Pages Worker environment.
