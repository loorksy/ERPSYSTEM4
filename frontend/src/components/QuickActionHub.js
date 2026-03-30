import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Building,
  CheckCircle,
  Clock3,
  DollarSign,
  Package,
  Receipt,
  TrendingUp,
  Truck,
  Wallet,
  Send,
  BadgeDollarSign,
} from 'lucide-react';

const initialForm = {
  actionKey: '',
  amount: '',
  notes: '',
  entityId: '',
  recordAsDebt: false,
  currency: 'TRY',
  exchangeRate: '',
};

const actionButtonClass =
  'w-full rounded-xl border px-3 py-2.5 text-sm font-semibold transition flex items-center justify-between gap-2';

const QuickActionHub = ({ onActionComplete, compact = false }) => {
  const navigate = useNavigate();
  const {
    subAgencies,
    transferCompanies,
    funds,
    agencyBonus,
    agencyDeductShipping,
    companyDisburse,
    fundTransaction,
    createExpense,
    createFxSpread,
  } = useData();

  const [mode, setMode] = useState('menu');
  const [form, setForm] = useState(initialForm);
  const [subTab, setSubTab] = useState('out');
  const [submitting, setSubmitting] = useState(false);

  const secondaryFunds = useMemo(() => funds.filter((fund) => !fund.is_main), [funds]);

  const runAndClose = async (runner) => {
    try {
      setSubmitting(true);
      await runner();
      setMode('menu');
      setForm(initialForm);
      onActionComplete?.();
    } finally {
      setSubmitting(false);
    }
  };

  const openForm = (actionKey) => {
    setForm((prev) => ({ ...initialForm, actionKey, currency: prev.currency || 'TRY' }));
    setMode('form');
  };

  const navigateAndClose = (path) => {
    navigate(path);
    onActionComplete?.();
  };

  const quickOutActions = [
    { key: 'out-ship', label: 'شحن (بيع)', icon: Package, onClick: () => navigateAndClose('/shipping?fab=out') },
    { key: 'out-sub', label: 'وكالة فرعية (مكافأة)', icon: Building, onClick: () => openForm('out-sub') },
    { key: 'out-company', label: 'شركة تحويل (صرف)', icon: Truck, onClick: () => openForm('out-company') },
    { key: 'out-fund', label: 'صندوق (إيداع)', icon: Wallet, onClick: () => openForm('out-fund') },
    { key: 'out-expense', label: 'مصروف', icon: DollarSign, onClick: () => openForm('out-expense') },
    { key: 'out-paydue', label: 'مطلوب دفع', icon: Clock3, onClick: () => navigateAndClose('/payment-due') },
  ];

  const quickInActions = [
    { key: 'in-ship', label: 'شحن (شراء)', icon: Package, onClick: () => navigateAndClose('/shipping?fab=in&qaFocus=swap') },
    { key: 'in-debt', label: 'دين', icon: Receipt, onClick: () => navigateAndClose('/debts?action=add') },
    { key: 'in-acc', label: 'اعتماد', icon: CheckCircle, onClick: () => navigateAndClose('/approvals?action=add') },
    { key: 'in-fx', label: 'فرق تصريف', icon: TrendingUp, onClick: () => openForm('in-fx') },
    { key: 'in-recv', label: 'ديين لنا', icon: BadgeDollarSign, onClick: () => navigateAndClose('/receivables-to-us') },
    { key: 'in-subdeduct', label: 'خصم وكالة', icon: Send, onClick: () => openForm('in-subdeduct') },
  ];

  const submitForm = async (e) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) return;

    if (form.actionKey === 'out-sub' && form.entityId) {
      await runAndClose(() => agencyBonus(form.entityId, amount, form.notes));
      return;
    }

    if (form.actionKey === 'in-subdeduct' && form.entityId) {
      await runAndClose(() => agencyDeductShipping(form.entityId, amount, form.notes));
      return;
    }

    if (form.actionKey === 'out-company' && form.entityId) {
      await runAndClose(() => companyDisburse(form.entityId, amount, form.recordAsDebt, form.notes));
      return;
    }

    if (form.actionKey === 'out-fund' && form.entityId) {
      await runAndClose(() =>
        fundTransaction(form.entityId, {
          amount,
          transaction_type: 'deposit',
          notes: form.notes,
        })
      );
      return;
    }

    if (form.actionKey === 'out-expense') {
      await runAndClose(() => createExpense({ amount, notes: form.notes, category: 'quick-action' }));
      return;
    }

    if (form.actionKey === 'in-fx') {
      const exchangeRate = parseFloat(form.exchangeRate);
      if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) return;
      await runAndClose(() =>
        createFxSpread({
          currency: form.currency,
          amount_foreign: amount,
          exchange_rate: exchangeRate,
          add_to_main: true,
          notes: form.notes,
        })
      );
    }
  };

  const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300';

  if (mode === 'form') {
    const showEntitySelect = ['out-sub', 'in-subdeduct', 'out-company', 'out-fund'].includes(form.actionKey);
    const options =
      form.actionKey === 'out-company'
        ? transferCompanies
        : form.actionKey === 'out-fund'
          ? secondaryFunds
          : subAgencies;

    return (
      <form onSubmit={submitForm} className="space-y-3" dir="rtl">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-800">تنفيذ إجراء سريع</p>
          <button
            type="button"
            onClick={() => setMode('menu')}
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            رجوع
          </button>
        </div>

        {showEntitySelect && (
          <select
            className={inputClass}
            value={form.entityId}
            onChange={(e) => setForm((prev) => ({ ...prev, entityId: e.target.value }))}
            required
          >
            <option value="">— اختر —</option>
            {options.map((option) => (
              <option key={option._id} value={option._id}>
                {option.name}
              </option>
            ))}
          </select>
        )}

        {form.actionKey === 'in-fx' && (
          <div className="grid grid-cols-2 gap-2">
            <select
              className={inputClass}
              value={form.currency}
              onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value }))}
            >
              <option value="TRY">TRY</option>
              <option value="EUR">EUR</option>
              <option value="SAR">SAR</option>
              <option value="AED">AED</option>
              <option value="SYP">SYP</option>
            </select>
            <input
              type="number"
              step="0.0001"
              placeholder="سعر الشراء"
              className={inputClass}
              value={form.exchangeRate}
              onChange={(e) => setForm((prev) => ({ ...prev, exchangeRate: e.target.value }))}
              required
            />
          </div>
        )}

        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="المبلغ"
          className={inputClass}
          value={form.amount}
          onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
          required
        />

        {form.actionKey === 'out-company' && (
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={form.recordAsDebt}
              onChange={(e) => setForm((prev) => ({ ...prev, recordAsDebt: e.target.checked }))}
            />
            تسجيل كدين علينا
          </label>
        )}

        <textarea
          rows={compact ? 2 : 3}
          placeholder="ملاحظات"
          className={inputClass}
          value={form.notes}
          onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-primary-600 px-3 py-2.5 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {submitting ? 'جاري التنفيذ...' : 'تنفيذ'}
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-3" dir="rtl">
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setSubTab('out')}
          className={`rounded-lg px-3 py-2 text-sm font-semibold ${subTab === 'out' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600'}`}
        >
          صادر
        </button>
        <button
          type="button"
          onClick={() => setSubTab('in')}
          className={`rounded-lg px-3 py-2 text-sm font-semibold ${subTab === 'in' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600'}`}
        >
          وارد
        </button>
      </div>

      <div className="space-y-2">
        {(subTab === 'out' ? quickOutActions : quickInActions).map((action) => (
          <button
            key={action.key}
            type="button"
            onClick={action.onClick}
            className={`${actionButtonClass} ${
              subTab === 'out'
                ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <span>{action.label}</span>
            <action.icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
        {subTab === 'out' ? <ArrowUpCircle className="h-4 w-4 text-rose-500" /> : <ArrowDownCircle className="h-4 w-4 text-emerald-500" />}
        <span>إجراءات سريعة مترابطة مع الأقسام: الشحن، الوكالات، الشركات، الصناديق، الديون، المصاريف.</span>
      </div>
    </div>
  );
};

export default QuickActionHub;
