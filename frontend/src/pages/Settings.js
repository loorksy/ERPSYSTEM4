import React from 'react';
import { Settings as SettingsIcon, User, Bell, Globe, Shield, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6" data-testid="settings-page">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">الإعدادات</h1>
        <p className="text-slate-500 mt-1">إدارة إعدادات النظام</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <div className="card">
          <div className="p-4 border-b border-slate-200 flex items-center gap-3">
            <User className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">الملف الشخصي</h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="label">الاسم</label>
              <input type="text" defaultValue={user?.name} className="input" disabled />
            </div>
            <div>
              <label className="label">البريد الإلكتروني</label>
              <input type="email" defaultValue={user?.email} className="input" disabled />
            </div>
            <div>
              <label className="label">الدور</label>
              <input type="text" defaultValue={user?.role === 'admin' ? 'مدير' : 'مستخدم'} className="input" disabled />
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="card">
          <div className="p-4 border-b border-slate-200 flex items-center gap-3">
            <Database className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">معلومات النظام</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-500">إصدار النظام</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">قاعدة البيانات</span>
              <span className="font-medium text-emerald-600">متصل</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Google Sheets</span>
              <span className="font-medium text-amber-600">غير متصل</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="p-4 border-b border-slate-200 flex items-center gap-3">
            <Bell className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">الإشعارات</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-700">إشعارات البريد</span>
              <input type="checkbox" className="w-4 h-4 text-primary-600 rounded" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700">تنبيهات الديون المتأخرة</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 rounded" />
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="card">
          <div className="p-4 border-b border-slate-200 flex items-center gap-3">
            <Globe className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">اللغة والمنطقة</h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="label">اللغة</label>
              <select className="input" defaultValue="ar">
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="label">العملة الافتراضية</label>
              <select className="input" defaultValue="USD">
                <option value="USD">دولار أمريكي (USD)</option>
                <option value="TRY">ليرة تركية (TRY)</option>
                <option value="EUR">يورو (EUR)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
