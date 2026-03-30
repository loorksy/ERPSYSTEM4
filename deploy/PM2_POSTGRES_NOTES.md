# PM2 + PostgreSQL Notes

> هذا المشروع يعمل عبر PM2 وليس Docker.

## المنافذ
- Frontend: `3023`
- Backend API: `8000`

## PostgreSQL بدل MongoDB
الباكند الحالي يستخدم Mongo API (`motor/pymongo`) داخل `backend/server.py`.
للانتقال الكامل إلى PostgreSQL بدون طبقة توافق يلزم refactor واسع لطبقة البيانات.

### خيار آمن سريع للإنتاج
- تشغيل PostgreSQL كقاعدة أساسية.
- تشغيل FerretDB على السيرفر (خدمة نظام) وربط `MONGO_URL` به.
- إبقاء الباكند الحالي كما هو مع تخزين فعلي داخل PostgreSQL.

## تشغيل PM2
1. انسخ المشروع إلى `/var/www/lorkerp`
2. عدّل القيم في `deploy/ecosystem.config.cjs` خصوصًا:
   - `FRONTEND_URL`
   - `JWT_SECRET`
   - `MONGO_URL`
3. شغّل:
   ```bash
   bash deploy/pm2-setup.sh
   ```
