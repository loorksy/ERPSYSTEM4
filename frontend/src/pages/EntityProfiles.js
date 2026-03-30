import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import {
  Building,
  Truck,
  Wallet,
  ArrowLeft,
  CreditCard,
  HandCoins,
  History,
  PlusCircle,
} from 'lucide-react';

const formatCurrency = (value) =>
  new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number(value) || 0);

const SectionTitle = ({ title, backTo }) => (
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="text-sm text-slate-500 mt-1">ملف تفصيلي وسجل حركة مختصر.</p>
    </div>
    <Link to={backTo} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
      رجوع
      <ArrowLeft className="w-4 h-4" />
    </Link>
  </div>
);

export const SubAgencyProfile = () => {
  const { agencyId } = useParams();
  const { subAgencies, api } = useData();
  const [debts, setDebts] = useState([]);

  const agency = useMemo(() => subAgencies.find((item) => item._id === agencyId), [agencyId, subAgencies]);

  useEffect(() => {
    api.get('/api/debts').then((res) => {
      const rows = (res.data || []).filter((d) => d.entity_type === 'agency' && d.entity_id === agencyId);
      setDebts(rows);
    }).catch(() => setDebts([]));
  }, [agencyId, api]);

  if (!agency) {
    return <div className="card p-6">الوكالة غير موجودة.</div>;
  }

  const payable = debts.filter((d) => d.debt_type === 'payable').reduce((s, d) => s + (d.remaining || 0), 0);
  const receivable = debts.filter((d) => d.debt_type === 'receivable').reduce((s, d) => s + (d.remaining || 0), 0);

  return (
    <div className="space-y-6" dir="rtl" data-testid="sub-agency-profile-page">
      <SectionTitle title={`ملف وكالة: ${agency.name}`} backTo="/sub-agencies" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><Building className="w-5 h-5 text-primary-600 mb-2" /><p className="text-sm text-slate-500">الرصيد</p><p className="text-xl font-bold">{formatCurrency(agency.balance)}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><CreditCard className="w-5 h-5 text-rose-600 mb-2" /><p className="text-sm text-slate-500">دين علينا</p><p className="text-xl font-bold text-rose-700">{formatCurrency(payable)}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><HandCoins className="w-5 h-5 text-emerald-600 mb-2" /><p className="text-sm text-slate-500">ديين لنا</p><p className="text-xl font-bold text-emerald-700">{formatCurrency(receivable)}</p></div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold text-slate-900 mb-3">خيارات سريعة</h2>
        <div className="flex flex-wrap gap-2">
          <Link to="/sub-agencies?action=bonus" className="btn btn-danger"><PlusCircle className="w-4 h-4" />مكافأة</Link>
          <Link to="/sub-agencies?action=deduct" className="btn btn-success"><History className="w-4 h-4" />خصم شحن</Link>
        </div>
      </div>
    </div>
  );
};

export const TransferCompanyProfile = () => {
  const { companyId } = useParams();
  const { transferCompanies, api } = useData();
  const [debts, setDebts] = useState([]);

  const company = useMemo(() => transferCompanies.find((item) => item._id === companyId), [companyId, transferCompanies]);

  useEffect(() => {
    api.get('/api/debts').then((res) => {
      const rows = (res.data || []).filter((d) => d.entity_type === 'company' && d.entity_id === companyId);
      setDebts(rows);
    }).catch(() => setDebts([]));
  }, [companyId, api]);

  if (!company) {
    return <div className="card p-6">الشركة غير موجودة.</div>;
  }

  const payable = debts.filter((d) => d.debt_type === 'payable').reduce((s, d) => s + (d.remaining || 0), 0);
  return (
    <div className="space-y-6" dir="rtl" data-testid="transfer-company-profile-page">
      <SectionTitle title={`ملف شركة: ${company.name}`} backTo="/transfer-companies" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><Truck className="w-5 h-5 text-amber-600 mb-2" /><p className="text-sm text-slate-500">الرصيد</p><p className="text-xl font-bold">{formatCurrency(company.balance)}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><CreditCard className="w-5 h-5 text-rose-600 mb-2" /><p className="text-sm text-slate-500">دين علينا</p><p className="text-xl font-bold text-rose-700">{formatCurrency(payable)}</p></div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <Link to="/transfer-companies?action=disburse" className="btn btn-danger"><PlusCircle className="w-4 h-4" />صرف من الشركة</Link>
      </div>
    </div>
  );
};

export const FundProfile = () => {
  const { fundId } = useParams();
  const { funds, api } = useData();
  const [transactions, setTransactions] = useState([]);

  const fund = useMemo(() => funds.find((item) => item._id === fundId), [fundId, funds]);

  useEffect(() => {
    if (!fundId) return;
    api.get(`/api/funds/${fundId}/transactions`).then((res) => setTransactions(res.data || [])).catch(() => setTransactions([]));
  }, [fundId, api]);

  if (!fund) {
    return <div className="card p-6">الصندوق غير موجود.</div>;
  }

  return (
    <div className="space-y-6" dir="rtl" data-testid="fund-profile-page">
      <SectionTitle title={`ملف صندوق: ${fund.name}`} backTo="/funds" />
      <div className="rounded-2xl border border-slate-200 bg-white p-4"><Wallet className="w-5 h-5 text-primary-600 mb-2" /><p className="text-sm text-slate-500">الرصيد الحالي</p><p className="text-xl font-bold">{formatCurrency(fund.balance)}</p></div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 font-semibold">آخر الحركات</div>
        {transactions.length === 0 ? (
          <div className="p-4 text-sm text-slate-500">لا توجد حركات مسجلة.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600"><tr><th className="px-3 py-2 text-right">النوع</th><th className="px-3 py-2 text-right">المبلغ</th><th className="px-3 py-2 text-right">التاريخ</th></tr></thead>
              <tbody>
                {transactions.slice(0, 20).map((tx) => (
                  <tr key={tx._id} className="border-t border-slate-100"><td className="px-3 py-2">{tx.transaction_type}</td><td className="px-3 py-2 font-semibold">{formatCurrency(tx.amount)}</td><td className="px-3 py-2 text-slate-500">{new Date(tx.created_at).toLocaleDateString('ar-SA')}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
