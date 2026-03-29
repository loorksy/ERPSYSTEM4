import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

const MemberAdjustments = () => (
  <div className="space-y-6" data-testid="member-adjustments-page">
    <div>
      <h1 className="text-2xl font-bold text-slate-900">إضافات وخصومات</h1>
      <p className="text-slate-500 mt-1">إدارة إضافات وخصومات المستخدمين</p>
    </div>
    <div className="card">
      <div className="empty-state py-12">
        <SlidersHorizontal className="empty-state-icon" />
        <p className="empty-state-title">قريباً</p>
        <p className="empty-state-text">سيتم إضافة هذه الميزة قريباً</p>
      </div>
    </div>
  </div>
);

export default MemberAdjustments;
