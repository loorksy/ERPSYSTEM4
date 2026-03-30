import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { Clock3, RefreshCcw, AlertCircle, Wallet, CalendarDays } from 'lucide-react';

const DeferredBalance = () => {
  const { api, activeCycle } = useData();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const formatCurrency = (value) =>
    new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(Number(value) || 0);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/dashboard/summary');
      const summary = response.data || {};
      const deferredRows = summary.deferred_users || summary.deferredUsers || [];
      setRows(Array.isArray(deferredRows) ? deferredRows : []);
    } catch (err) {
      console.error(err);
      setError('تعذر تحميل بيانات رصيد المؤجل حالياً.');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totals = useMemo(() => {
    const total = rows.reduce((sum, row) => sum + (Number(row.balance_d || row.balance || row.amount) || 0), 0);
    return {
      count: rows.length,
      total,
    };
  }, [rows]);

  return (
    <div className="space-y-6" dir="rtl" data-testid="deferred-balance-page">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">رصيد المؤجل</h1>
            <p className="mt-1 text-sm text-slate-500">متابعة الأرصدة المرحّلة للمستخدمين عبر الدورات.</p>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCcw className="h-4 w-4" />
            تحديث
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-2 inline-flex rounded-lg bg-indigo-50 p-2 text-indigo-700">
            <Clock3 className="h-5 w-5" />
          </div>
          <p className="text-sm text-slate-500">إجمالي رصيد المؤجل</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{formatCurrency(totals.total)}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-2 inline-flex rounded-lg bg-primary-50 p-2 text-primary-700">
            <Wallet className="h-5 w-5" />
          </div>
          <p className="text-sm text-slate-500">عدد السجلات</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totals.count}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-2 inline-flex rounded-lg bg-amber-50 p-2 text-amber-700">
            <CalendarDays className="h-5 w-5" />
          </div>
          <p className="text-sm text-slate-500">الدورة النشطة</p>
          <p className="mt-1 text-base font-bold text-slate-900">{activeCycle?.name || 'غير محددة'}</p>
        </div>
      </section>

      {error && (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="font-semibold text-slate-900">تفاصيل المؤجل</h2>
        </div>

        {loading ? (
          <div className="px-4 py-10 text-center text-sm text-slate-500">جاري تحميل البيانات...</div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-slate-500">لا يوجد رصيد مؤجل حالياً.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-right font-semibold">المعرّف</th>
                  <th className="px-4 py-3 text-right font-semibold">الاسم</th>
                  <th className="px-4 py-3 text-right font-semibold">الرصيد المؤجل</th>
                  <th className="px-4 py-3 text-right font-semibold">المصدر</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row._id || row.member_user_id || idx} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-slate-700">{row.member_user_id || row.user_id || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{row.user_name || row.name || '-'}</td>
                    <td className="px-4 py-3 font-semibold text-indigo-700">
                      {formatCurrency(row.balance_d || row.balance || row.amount)}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{row.sheet_source || row.source || 'محلي'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default DeferredBalance;
