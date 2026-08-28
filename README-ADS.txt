Yar Afghanistan - Professional Direct Ads

Files:
- index.html
- _worker.js

Required Cloudflare configuration:
1) D1 binding: DB
2) Worker/Pages Secret: YAR_OWNER_EMAIL
3) Secret: YAR_ADMIN_PASSWORD
4) Secret: YAR_ADMIN_SESSION_SECRET
5) Optional but required for direct file upload: R2 binding AD_MEDIA

R2 upload:
- Images: jpeg/png/webp/gif, max 10 MB
- Videos: mp4/webm/ogg, max 50 MB
- If R2 is not configured, use direct HTTPS media URLs in the ad form.

Features:
- Create/edit/delete ads
- Publish/pause ads
- Direct image/video upload via R2
- Scheduling by start/end date
- Placement: all/mobile/desktop
- Customer name/phone and contract number
- Contract price and currency (AFN/USD/EUR)
- Contract dates and internal notes
- Impression/click limits
- D1 impression/click tracking
- CTR
- 30-day daily report
- Monthly report
- Responsive mobile admin UI
- Public ad media delivery through the Worker
