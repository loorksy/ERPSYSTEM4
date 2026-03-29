import React from 'react';
import { MessageSquare } from 'lucide-react';

const Messages = () => (
  <div className="space-y-6" data-testid="messages-page">
    <div>
      <h1 className="text-2xl font-bold text-slate-900">ترتيب الرسائل</h1>
      <p className="text-slate-500 mt-1">إدارة وترتيب الرسائل</p>
    </div>
    <div className="card">
      <div className="empty-state py-12">
        <MessageSquare className="empty-state-icon" />
        <p className="empty-state-title">قريباً</p>
        <p className="empty-state-text">سيتم إضافة هذه الميزة قريباً</p>
      </div>
    </div>
  </div>
);

export default Messages;
