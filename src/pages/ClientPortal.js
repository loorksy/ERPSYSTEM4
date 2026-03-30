import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  MessageSquare,
  Receipt,
  HandCoins,
  Clock3,
  ArrowLeft,
} from 'lucide-react';

const portalCards = [
  {
    title: 'بحث عميل',
    description: 'الوصول السريع لبيانات العميل وسجل التعامل.',
    icon: Search,
    to: '/search',
    tone: 'bg-primary-50 text-primary-700',
  },
  {
    title: 'بيانات العملاء',
    description: 'عرض وتحديث ملفات العملاء.',
    icon: Users,
    to: '/clients',
    tone: 'bg-indigo-50 text-indigo-700',
  },
  {
    title: 'الرسائل',
    description: 'إدارة ترتيب الرسائل المرسلة للعملاء.',
    icon: MessageSquare,
    to: '/messages',
    tone: 'bg-amber-50 text-amber-700',
  },
  {
    title: 'ديين لنا',
    description: 'متابعة الأرصدة المستحقة من العملاء.',
    icon: HandCoins,
    to: '/receivables-to-us',
    tone: 'bg-emerald-50 text-emerald-700',
  },
  {
    title: 'مطلوب دفع',
    description: 'مراجعة التسليمات والدفعات القادمة.',
    icon: Clock3,
    to: '/payment-due',
    tone: 'bg-rose-50 text-rose-700',
  },
  {
    title: 'الديون',
    description: 'الوصول إلى صفحة الديون للتفاصيل الكاملة.',
    icon: Receipt,
    to: '/debts',
    tone: 'bg-slate-100 text-slate-700',
  },
];

const ClientPortal = () => {
  return (
    <div className="space-y-6" dir="rtl" data-testid="client-portal-page">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <h1 className="text-2xl font-bold text-slate-900">واجهة العملاء</h1>
        <p className="mt-1 text-sm text-slate-500">بوابة اختصارات لخدمة العملاء والمتابعة المالية اليومية.</p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {portalCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.to}
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className={`inline-flex rounded-xl p-2.5 ${card.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowLeft className="h-4 w-4 text-slate-400 transition group-hover:text-slate-600" />
              </div>

              <h2 className="text-base font-bold text-slate-900">{card.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{card.description}</p>
            </Link>
          );
        })}
      </section>
    </div>
  );
};

export default ClientPortal;
