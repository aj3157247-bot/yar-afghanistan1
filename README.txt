Yar Afghanistan — FINAL Worker + Direct Ads (Cloudflare D1)

FILES
- index.html: current Yar UI with Direct Ads UI
- _worker.js: your existing worker (chat/translate/transcribe/tts/vision/weather/prayer/news/health/analytics) merged with Direct Ads D1 routes
- ads-d1-schema.sql: optional manual D1 schema; the worker also auto-creates the two ad tables on first request

IMPORTANT D1 BINDING
The merged worker uses the EXISTING binding name: DB
Do not create a second ADS_DB binding.

Cloudflare Pages -> Settings -> Functions -> D1 database bindings:
Variable name: DB
Database: your existing Yar D1 database

OWNER CONFIG
Add a Pages secret/variable:
YAR_OWNER_EMAIL = the exact owner email used by the current admin account.

The current front-end sends X-Yar-Owner-Email for admin API calls. This is a compatibility guard, NOT strong authentication. For production, protect admin routes with Cloudflare Access or a real server-side session/auth system. Never put a private admin token in index.html.

API
GET  /api/ads          public active ads
POST /api/ads/event    public impression/click events
GET  /api/ads/admin    owner management + statistics
POST /api/ads          owner create/update
PATCH /api/ads/:id     owner activate/deactivate
DELETE /api/ads/:id    owner delete

DEPLOY
1. Replace the current _worker.js with this file.
2. Keep index.html in the same Pages deployment.
3. Bind D1 as DB.
4. Set YAR_OWNER_EMAIL.
5. Deploy.
6. Open /api/health and /api/ads in the browser to test.
7. Open the owner/admin panel and create an ad.

NOTE
Ad impressions/clicks are central in D1, so they are shared across users. The worker does not concatenate audio or alter your existing AI routes.
