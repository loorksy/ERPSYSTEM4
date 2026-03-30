import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import {
  Building2,
  Wallet,
  Users,
  TrendingUp,
  TrendingDown,
  Package,
  ArrowLeft,
  Receipt,
} from 'lucide-react';

const MainAgency = () => {
  const { dashboardSummary, funds, subAgencies } = useData();

  const formatCurrency = (value) =>
    new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(Number(value) || 0);

  const formatNumber = (value) => new Intl.NumberFormat('ar-SA').format(Number(value) || 0);

  const metrics = useMemo(() => {
    const mainFund = funds.find((fund) => fund.is_main);
    const totalAgenciesBalance = subAgencies.reduce((sum, agency) => sum + (Number(agency.balance) || 0), 0);

    return {
      mainFundBalance: Number(mainFund?.balance) || 0,
      totalAgenciesBalance,
      agenciesCount: subAgencies.length,
      netProfit: Number(dashboardSummary?.net_profit) || 0,
      totalExpenses: Number(dashboardSummary?.total_expenses) || 0,
      shippingQuantity: Number(dashboardSummary?.shipping_quantity) || 0,
    };
  }, [dashboardSummary, funds, subAgencies]);

  const quickLinks = [
    { label: 'الوكالات الفرعية', to: '/sub-agencies' },
    { label: 'الصناديق', to: '/funds' },
    { label: 'شركات التحويل', to: '/transfer-companies' },
    { label: 'الديون', to: '/debts' },
  ];

  return (
    <div className="space-y-6" dir="rtl" data-testid="main-agency-page">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">الوكالة الرئيسية</h1>
            <p className="mt-1 text-sm text-slate-500">لوحة قيادة تجمع مؤشرات الإدارة الرئيسية مع اختصارات للأقسام الحيوية.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {link.label}
                <ArrowLeft className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-2 inline-flex rounded-lg bg-primary-50 p-2 text-primary-700">
            <Building2 className="h-5 w-5" />
          </div>
          <p className="text-sm text-slate-500">الجهة الرئيسية</p>
          <p className="mt-1 text-lg font-bold text-slate-900">LorkERP</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-2 inline-flex rounded-lg bg-emerald-50 p-2 text-emerald-700">
            <Wallet className="h-5 w-5" />
          </div>
          <p className="text-sm text-slate-500">رصيد الصندوق الرئيسي</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{formatCurrency(metrics.mainFundBalance)}</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-2 inline-flex rounded-lg bg-amber-50 p-2 text-amber-700">
            <Users className="h-5 w-5" />
          </div>
          <p className="text-sm text-slate-500">عدد الوكالات الفرعية</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{formatNumber(metrics.agenciesCount)}</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-2 inline-flex rounded-lg bg-indigo-50 p-2 text-indigo-700">
            <Receipt className="h-5 w-5" />
          </div>
          <p className="text-sm text-slate-500">إجمالي أرصدة الوكالات</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{formatCurrency(metrics.totalAgenciesBalance)}</p>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-base font-bold text-slate-900">الملخص المالي</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2.5">
              <div className="flex items-center gap-2 text-emerald-700">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">صافي الربح</span>
              </div>
              <span className="font-bold text-emerald-700">{formatCurrency(metrics.netProfit)}</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-rose-50 px-3 py-2.5">
              <div className="flex items-center gap-2 text-rose-700">
                <TrendingDown className="h-4 w-4" />
                <span className="text-sm font-medium">إجمالي المصاريف</span>
              </div>
              <span className="font-bold text-rose-700">{formatCurrency(metrics.totalExpenses)}</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-sky-50 px-3 py-2.5">
              <div className="flex items-center gap-2 text-sky-700">
                <Package className="h-4 w-4" />
                <span className="text-sm font-medium">رصيد الشحن (كمية)</span>
              </div>
              <span className="font-bold text-sky-700">{formatNumber(metrics.shippingQuantity)}</span>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">أعلى الوكالات (حسب الرصيد)</h2>
            <Link to="/sub-agencies" className="text-xs font-semibold text-primary-700 hover:underline">
              عرض الكل
            </Link>
          </div>

          {subAgencies.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
              لا توجد وكالات فرعية حتى الآن.
            </div>
          ) : (
            <div className="space-y-2">
              {[...subAgencies]
                .sort((a, b) => (Number(b.balance) || 0) - (Number(a.balance) || 0))
                .slice(0, 6)
                .map((agency) => (
                  <div key={agency._id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                    <span className="text-sm font-medium text-slate-800">{agency.name}</span>
                    <span className="text-sm font-bold text-slate-900">{formatCurrency(agency.balance)}</span>
                  </div>
                ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
};

export default MainAgency;
