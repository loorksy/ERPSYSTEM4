import React from 'react';
import { UserCog } from 'lucide-react';

const MemberDirectory = () => (
  <div className="space-y-6" data-testid="member-directory-page">
    <div>
      <h1 className="text-2xl font-bold text-slate-900">بيانات المستخدمين</h1>
      <p className="text-slate-500 mt-1">إدارة المستخدمين والموظفين</p>
    </div>
    <div className="card">
      <div className="empty-state py-12">
        <UserCog className="empty-state-icon" />
        <p className="empty-state-title">قريباً</p>
        <p className="empty-state-text">سيتم إضافة هذه الميزة قريباً</p>
      </div>
    </div>
  </div>
);

export default MemberDirectory;
