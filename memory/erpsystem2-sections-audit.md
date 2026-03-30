# ERPSYSTEM2 Reference Audit (for LorkERP migration)

Date: 2026-03-30
Source repo inspected: `https://github.com/loorksy/ERPSYSTEM2.git` (cloned to `/tmp/ERPSYSTEM2`)

## 1) الأقسام/الصفحات الرئيسية الموجودة

> تم استخراجها من ملف الراوتات المركزي + عناصر السايدبار والموبايل ناف.

### صفحات تشغيلية أساسية
- `/dashboard` — الرئيسية
- `/sheet` — Sheet
- `/payroll` — تدقيق الرواتب

### بيانات واتصالات
- `/search` — البحث
- `/clients` — بيانات العملاء
- `/member-directory` — بيانات المستخدمين
- `/member-directory/member/:memberUserId` — ملف عضو
- `/member-adjustments` — إضافات وخصومات
- `/messages` — ترتيب الرسائل
- `/approvals` — الاعتمادات

### وكالات وشركات وصناديق
- `/sub-agencies` — الوكالات الفرعية
- `/main-agency` — الوكالة الرئيسية
- `/transfer-companies` — شركات التحويل
- `/funds` — الصناديق

### مالية وحركات
- `/debts` — الديون
- `/debts/company/:id` — سجل شركة
- `/debts/fund/:id` — سجل صندوق
- `/payables-us` — دين علينا
- `/receivables-to-us` — ديين لنا
- `/payment-due` — مطلوب دفع
- `/deferred-balance` — رصيد المؤجل
- `/fx-spread` — فرق التصريف
- `/shipping` — الشحن
- `/expenses-manual` — المصاريف
- `/profit-sources` — مصادر الربح
- `/profit-sources/:sourceType/detail` — تفاصيل مصدر الربح
- `/admin-brokerage` — وساطة إدارية

### إعدادات ومساندة
- `/client-portal` — واجهة العملاء
- `/settings` — الإعدادات
- `/logout` — تسجيل الخروج

## 2) سلوك التنقل السريع (زر + صادر/وارد)

### سلوك عام
- يوجد زر Quick Action شعاعي في الديسكتوب ومضمّن في Bottom Nav للموبايل.
- عند الفتح يظهر خياران رئيسيان فقط: **صادر** و **وارد**.

### صادر (Out)
- `out-ship` → يفتح `/shipping?fab=out`
- `out-sub` → نموذج "مكافأة وكالة فرعية" (Overlay Form)
- `out-co` → نموذج "صرف لشركة تحويل" (Overlay Form)
- `out-fund` → نموذج "صرف لصندوق" (Overlay Form)
- `out-exp` → نموذج "مصروف" (Overlay Form)
- `out-paydue` → يفتح `/payment-due`
- رابط إضافي: "مرتجع — شركات التحويل" → `/transfer-companies`

### وارد (In)
- `in-ship` → يفتح `/shipping?fab=in&qaFocus=swap`
- `in-debt` → يفتح `/debts`
- `in-acc` → نموذج "اعتماد وارد" (Overlay Form)
- `in-fx` → نموذج "فرق تصريف" (Overlay Form)
- `in-recv` → يفتح `/receivables-to-us`
- `in-subdeduct` → يفتح `/sub-agencies`

## 3) ملاحظات UX قابلة للاستلهام في ERPSYSTEM4

- Sidebar RTL غني بأقسام مالية + تشغيلية مع تنقّل واضح.
- Bottom Nav للموبايل يركّز على 4 اختصارات + زر الإجراءات السريعة (+).
- معظم الإجراءات الحساسة تعمل عبر Overlay Forms بدل الانتقال الكامل للصفحة.
- يوجد "رجوع" داخل الـ Overlay للتنقل بين قائمة صادر/وارد والنماذج الفرعية.
- ثيم ألوان متّسق (blue/slate + amber accents) قابل للتطبيق بنفس هوية LorkERP الحالية.

## 4) نقطة مهمة قبل البدء بالنسخ في ERPSYSTEM4

المرجع ERPSYSTEM2 مبني على EJS + Express + API server-side، بينما ERPSYSTEM4 مبني React + Tailwind + Lucide.
لذلك النقل سيكون على مستوى:
1. Information architecture (الأقسام والمسارات)
2. Menu options (الأزرار والقوائم)
3. Interaction flow (ماذا يحدث عند الضغط)

بدون نقل مباشر لكود الـ backend.
