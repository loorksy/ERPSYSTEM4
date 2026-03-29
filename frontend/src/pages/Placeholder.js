import React from 'react';
import { Building2, Coins, Briefcase, CreditCard, HandCoins, Clock, TrendingUp } from 'lucide-react';

// Placeholder pages
export const MainAgency = () => (
  <div className="space-y-6" data-testid="main-agency-page">
    <h1 className="text-2xl font-bold text-slate-900">الوكالة الرئيسية</h1>
    <div className="card"><div className="empty-state py-12"><Building2 className="empty-state-icon" /><p className="empty-state-title">قريباً</p></div></div>
  </div>
);

export const PayablesUs = () => (
  <div className="space-y-6" data-testid="payables-us-page">
    <h1 className="text-2xl font-bold text-slate-900">دين علينا</h1>
    <div className="card"><div className="empty-state py-12"><CreditCard className="empty-state-icon" /><p className="empty-state-title">قريباً</p></div></div>
  </div>
);

export const ReceivablesToUs = () => (
  <div className="space-y-6" data-testid="receivables-to-us-page">
    <h1 className="text-2xl font-bold text-slate-900">ديين لنا</h1>
    <div className="card"><div className="empty-state py-12"><HandCoins className="empty-state-icon" /><p className="empty-state-title">قريباً</p></div></div>
  </div>
);

export const PaymentDue = () => (
  <div className="space-y-6" data-testid="payment-due-page">
    <h1 className="text-2xl font-bold text-slate-900">مطلوب دفع</h1>
    <div className="card"><div className="empty-state py-12"><Clock className="empty-state-icon" /><p className="empty-state-title">قريباً</p></div></div>
  </div>
);

export const FxSpread = () => (
  <div className="space-y-6" data-testid="fx-spread-page">
    <h1 className="text-2xl font-bold text-slate-900">فرق التصريف</h1>
    <div className="card"><div className="empty-state py-12"><TrendingUp className="empty-state-icon" /><p className="empty-state-title">قريباً</p></div></div>
  </div>
);

export const ProfitSources = () => (
  <div className="space-y-6" data-testid="profit-sources-page">
    <h1 className="text-2xl font-bold text-slate-900">مصادر الربح</h1>
    <div className="card"><div className="empty-state py-12"><Coins className="empty-state-icon" /><p className="empty-state-title">قريباً</p></div></div>
  </div>
);

export const AdminBrokerage = () => (
  <div className="space-y-6" data-testid="admin-brokerage-page">
    <h1 className="text-2xl font-bold text-slate-900">وساطة إدارية</h1>
    <div className="card"><div className="empty-state py-12"><Briefcase className="empty-state-icon" /><p className="empty-state-title">قريباً</p></div></div>
  </div>
);
