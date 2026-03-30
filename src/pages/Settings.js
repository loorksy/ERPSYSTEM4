import React from 'react';
import { User, Bell, Globe, Database, ShieldCheck, KeyRound, MonitorCog } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6" dir="rtl" data-testid="settings-page">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <h1 className="text-2xl font-bold text-slate-900">الإعدادات</h1>
        <p className="text-slate-500 mt-1">إعدادات الحساب، النظام، والتنبيهات.</p>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center gap-3"><User className="w-5 h-5 text-slate-600" /><h3 className="font-semibold text-slate-900">الملف الشخصي</h3></div>
          <div className="p-4 space-y-4">
            <div><label className="label">الاسم</label><input type="text" defaultValue={user?.name} className="input" disabled /></div>
            <div><label className="label">البريد الإلكتروني</label><input type="email" defaultValue={user?.email} className="input" disabled /></div>
            <div><label className="label">الدور</label><input type="text" defaultValue={user?.role === 'admin' ? 'مدير' : 'مستخدم'} className="input" disabled /></div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center gap-3"><Database className="w-5 h-5 text-slate-600" /><h3 className="font-semibold text-slate-900">معلومات النظام</h3></div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between"><span className="text-slate-500">إصدار النظام</span><span className="font-medium">1.0.0</span></div>
            <div className="flex justify-between"><span className="text-slate-500">قاعدة البيانات</span><span className="font-medium text-emerald-600">PostgreSQL</span></div>
            <div className="flex justify-between"><span className="text-slate-500">وضع التشغيل</span><span className="font-medium text-slate-700">PM2</span></div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center gap-3"><Bell className="w-5 h-5 text-slate-600" /><h3 className="font-semibold text-slate-900">الإشعارات</h3></div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between"><span className="text-slate-700">تنبيهات الديون المتأخرة</span><input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 rounded" /></div>
            <div className="flex items-center justify-between"><span className="text-slate-700">تنبيهات مطلوب دفع</span><input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 rounded" /></div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center gap-3"><Globe className="w-5 h-5 text-slate-600" /><h3 className="font-semibold text-slate-900">اللغة والمنطقة</h3></div>
          <div className="p-4 space-y-4">
            <div><label className="label">اللغة</label><select className="input" defaultValue="ar"><option value="ar">العربية</option><option value="en">English</option></select></div>
            <div><label className="label">العملة الافتراضية</label><select className="input" defaultValue="USD"><option value="USD">دولار أمريكي (USD)</option><option value="TRY">ليرة تركية (TRY)</option><option value="EUR">يورو (EUR)</option></select></div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><ShieldCheck className="w-5 h-5 text-emerald-600 mb-2" /><p className="font-semibold text-slate-900">الأمان</p><p className="text-sm text-slate-500">حماية الجلسة وصلاحيات المستخدم.</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><KeyRound className="w-5 h-5 text-amber-600 mb-2" /><p className="font-semibold text-slate-900">مفاتيح الربط</p><p className="text-sm text-slate-500">إدارة مفاتيح التكامل والخدمات.</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><MonitorCog className="w-5 h-5 text-primary-600 mb-2" /><p className="font-semibold text-slate-900">بيئة النظام</p><p className="text-sm text-slate-500">مراجعة حالة التشغيل والإعدادات العامة.</p></div>
      </section>
    </div>
  );
};

export default Settings;
