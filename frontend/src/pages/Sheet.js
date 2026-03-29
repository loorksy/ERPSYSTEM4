import React from 'react';
import { FileSpreadsheet } from 'lucide-react';

const Sheet = () => (
  <div className="space-y-6" data-testid="sheet-page">
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Sheet</h1>
      <p className="text-slate-500 mt-1">عرض وتعديل البيانات</p>
    </div>
    <div className="card">
      <div className="empty-state py-12">
        <FileSpreadsheet className="empty-state-icon" />
        <p className="empty-state-title">قريباً</p>
        <p className="empty-state-text">سيتم إضافة هذه الميزة مع تكامل Google Sheets</p>
      </div>
    </div>
  </div>
);

export default Sheet;
