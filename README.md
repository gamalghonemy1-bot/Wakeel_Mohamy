# وكيل محامي — خطوات التشغيل

## 1) الخادم (Cloudflare Workers — مجاني للبداية)
1. أنشئ حساباً على cloudflare.com ثم ثبّت: `npm i -g wrangler` و`wrangler login`
2. `cd server` ثم `wrangler kv namespace create DB` وانسخ الـ id إلى wrangler.toml
3. `wrangler secret put ANTHROPIC_API_KEY` (مفتاح console.anthropic.com)
4. `wrangler secret put ADMIN_TOKEN` (كلمة سر طويلة تختارها)
5. `wrangler deploy` — سيعطيك رابطاً مثل https://lawyer-agent-api.xxx.workers.dev

## 2) التطبيق
1. افتح www/index.html وغيّر `API` إلى رابط الخادم
2. ارفع المجلد كله على مستودع GitHub (فرع main)
3. من تبويب Actions شغّل Build APK ثم نزّل lawyer-agent-apk وثبّته على الموبايل

## 3) إنشاء كود تفعيل لعميل
curl -X POST https://رابط-الخادم/admin/create -H "Authorization: Bearer ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"days":365}'
الكود يرتبط بأول جهاز يفعّله فقط.
