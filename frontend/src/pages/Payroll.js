import React from 'react';
import { ClipboardCheck } from 'lucide-react';

const Payroll = () => (
  <div className="space-y-6" data-testid="payroll-page">
    <div>
      <h1 className="text-2xl font-bold text-slate-900">تدقيق الرواتب</h1>
      <p className="text-slate-500 mt-1">مراجعة واعتماد الرواتب</p>
    </div>
    <div className="card">
      <div className="empty-state py-12">
        <ClipboardCheck className="empty-state-icon" />
        <p className="empty-state-title">قريباً</p>
        <p className="empty-state-text">سيتم إضافة هذه الميزة مع تكامل Google Sheets</p>
      </div>
    </div>
  </div>
);

export default Payroll;
