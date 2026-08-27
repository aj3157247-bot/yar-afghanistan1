YAR AFGHANISTAN V28 - LIVE ANALYTICS FIX

This package fixes the "سرور آمار متصل نیست" problem by deploying the missing Cloudflare Pages Function together with the HTML.

Files:
- index.html
- functions/api/analytics.js

IMPORTANT:
The existing Cloudflare D1 database binding must remain:
Name: DB
Database: yar-afghanistan-db

Cloudflare Pages must deploy BOTH index.html and the functions/ folder. Uploading only index.html cannot create /api/analytics.

After deployment, test in the browser:
/api/analytics?summary=1

Expected JSON starts with:
{"success":true,...}

The admin dashboard then shows:
- total devices
- active devices in the last 5 minutes
- mobile devices
- desktop devices
- today's events
- today's devices

The owner/admin email protection remains in the HTML.
