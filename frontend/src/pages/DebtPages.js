import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import {
  CreditCard,
  HandCoins,
  X,
  DollarSign,
  Search,
  CalendarClock,
  Wallet,
  ArrowRight,
  Percent,
  Save,
  Filter,
  Building,
  Landmark,
} from 'lucide-react';

const formatCurrency = (value) =>
  new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value || 0);

const DebtHeaderLinks = ({ tone = 'rose' }) => (
  <div className="flex flex-wrap gap-2">
    <Link
      to="/receivables-to-us"
      className={`inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-semibold ${
        tone === 'emerald' ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-emerald-200 bg-white text-emerald-700'
      }`}
    >
      <HandCoins className="h-4 w-4" />
      ديين لنا
    </Link>
    <Link
      to="/payables-us"
      className={`inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-semibold ${
        tone === 'rose' ? 'border-rose-300 bg-rose-50 text-rose-800' : 'border-rose-200 bg-white text-rose-700'
      }`}
    >
      <CreditCard className="h-4 w-4" />
      دين علينا
    </Link>
    <Link to="/payment-due" className="inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-700">
      <CalendarClock className="h-4 w-4" />
      مطلوب دفع
    </Link>
    <Link to="/debts" className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
      <ArrowRight className="h-4 w-4" />
      الديون
    </Link>
  </div>
);

const DebtCardGrid = ({ debts, isPayable, onOpenPay }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {debts.map((debt) => (
      <div key={debt._id} className={`card p-5 ${isPayable ? 'border-rose-200' : 'border-emerald-200'}`}>
        <h3 className="font-semibold text-slate-900 mb-2">{debt.entity_name}</h3>
        <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
          {debt.entity_type === 'fund' ? <Landmark className="w-3 h-3" /> : <Building className="w-3 h-3" />}
          {debt.entity_type === 'fund' ? 'صندوق' : debt.entity_type === 'company' ? 'شركة تحويل' : 'وكالة'}
        </p>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">المبلغ الأصلي</span>
            <span>{formatCurrency(debt.amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">المتبقي</span>
            <span className={`font-bold ${isPayable ? 'text-rose-600' : 'text-emerald-600'}`}>{formatCurrency(debt.remaining)}</span>
          </div>
        </div>
        <button onClick={() => onOpenPay(debt)} className={`w-full ${isPayable ? 'btn btn-danger' : 'btn btn-success'}`}>
          <DollarSign className="w-4 h-4" />
          {isPayable ? 'تسديد' : 'تحصيل'}
        </button>
      </div>
    ))}
  </div>
);

const DebtListToolbar = ({ query, setQuery, entityFilter, setEntityFilter }) => (
  <section className="card p-4">
    <div className="flex flex-col md:flex-row md:items-center gap-3">
      <div className="relative md:flex-1">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} className="input pr-9" placeholder="بحث باسم الكيان أو الملاحظات" />
      </div>
      <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 overflow-x-auto">
        <span className="inline-flex items-center gap-1 px-2 text-xs text-slate-500"><Filter className="h-3 w-3" />الكيان</span>
        {[
          { key: 'all', label: 'الكل' },
          { key: 'company', label: 'شركات' },
          { key: 'fund', label: 'صناديق' },
          { key: 'agency', label: 'وكالات' },
        ].map((item) => (
          <button key={item.key} onClick={() => setEntityFilter(item.key)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${entityFilter === item.key ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-600'}`}>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  </section>
);

const SettlementModal = ({ isOpen, tone, selectedDebt, payAmount, setPayAmount, payNotes, setPayNotes, onSubmit, onClose }) => {
  if (!isOpen || !selectedDebt) return null;
  const isRose = tone === 'rose';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">{isRose ? 'تسديد دين' : 'تحصيل دين'}: {selectedDebt.entity_name}</h2>
            <button onClick={onClose} className="p-2 text-slate-400"><X className="w-5 h-5" /></button>
          </div>

          <div className={`rounded-lg p-4 mb-4 ${isRose ? 'bg-rose-50' : 'bg-emerald-50'}`}>
            <p className={`text-sm ${isRose ? 'text-rose-600' : 'text-emerald-600'}`}>المبلغ المتبقي</p>
            <p className={`text-2xl font-bold ${isRose ? 'text-rose-700' : 'text-emerald-700'}`}>{formatCurrency(selectedDebt.remaining)}</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label">مبلغ العملية</label>
              <input type="number" step="0.01" max={selectedDebt.remaining} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="input" required />
            </div>
            <div>
              <label className="label">ملاحظات</label>
              <textarea rows={3} value={payNotes} onChange={(e) => setPayNotes(e.target.value)} className="input" placeholder="سبب العملية/مرجع" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className={`flex-1 ${isRose ? 'btn btn-danger' : 'btn btn-success'}`}>تأكيد</button>
              <button type="button" onClick={onClose} className="btn btn-secondary">إلغاء</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const PayablesUs = () => {
  const { api, payDebt } = useData();
  const [debts, setDebts] = useState([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');

  const fetchData = async () => {
    try {
      const response = await api.get('/api/debts');
      setDebts(response.data.filter((d) => d.debt_type === 'payable'));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const total = debts.reduce((sum, d) => sum + d.remaining, 0);
  const filteredDebts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return debts.filter((d) => {
      const matchesQuery = !q || (d.entity_name || '').toLowerCase().includes(q) || (d.notes || '').toLowerCase().includes(q);
      const matchesEntity = entityFilter === 'all' ? true : d.entity_type === entityFilter;
      return matchesQuery && matchesEntity;
    });
  }, [debts, query, entityFilter]);

  const handlePay = async (e) => {
    e.preventDefault();
    await payDebt(selectedDebt._id, parseFloat(payAmount), payNotes);
    setShowPayModal(false);
    setPayAmount('');
    setPayNotes('');
    fetchData();
  };

  return (
    <div className="space-y-6" data-testid="payables-us-page" dir="rtl">
      <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-5">
        <p className="text-xs font-bold text-rose-700">التزامات</p>
        <h1 className="text-2xl font-bold text-slate-900">دين علينا</h1>
        <p className="text-sm text-slate-500 mt-1">متابعة الديون المستحقة علينا مع تسديد جزئي أو كلي.</p>
        <div className="mt-3"><DebtHeaderLinks tone="rose" /></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 md:col-span-2 flex items-center gap-4">
          <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center"><CreditCard className="w-7 h-7 text-rose-600" /></div>
          <div><p className="text-sm text-slate-500">إجمالي ديننا للغير</p><p className="text-3xl font-bold text-rose-600">{formatCurrency(total)}</p></div>
        </div>
        <div className="card p-5"><p className="text-sm text-slate-500">عدد القيود</p><p className="text-3xl font-bold text-slate-900">{filteredDebts.length}</p></div>
      </div>

      <DebtListToolbar query={query} setQuery={setQuery} entityFilter={entityFilter} setEntityFilter={setEntityFilter} />

      {loading ? (
        <div className="card p-8 text-center text-slate-500">جاري تحميل الديون...</div>
      ) : filteredDebts.length === 0 ? (
        <div className="card"><div className="empty-state py-12"><CreditCard className="empty-state-icon" /><p className="empty-state-title">لا توجد ديون مطابقة</p></div></div>
      ) : (
        <DebtCardGrid debts={filteredDebts} isPayable onOpenPay={(debt) => { setSelectedDebt(debt); setPayAmount(debt.remaining.toString()); setShowPayModal(true); }} />
      )}

      <SettlementModal isOpen={showPayModal} tone="rose" selectedDebt={selectedDebt} payAmount={payAmount} setPayAmount={setPayAmount} payNotes={payNotes} setPayNotes={setPayNotes} onSubmit={handlePay} onClose={() => setShowPayModal(false)} />
    </div>
  );
};

const ReceivablesToUs = () => {
  const { api, payDebt } = useData();
  const [debts, setDebts] = useState([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');

  const fetchData = async () => {
    try {
      const response = await api.get('/api/debts');
      setDebts(response.data.filter((d) => d.debt_type === 'receivable'));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const total = debts.reduce((sum, d) => sum + d.remaining, 0);
  const filteredDebts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return debts.filter((d) => {
      const matchesQuery = !q || (d.entity_name || '').toLowerCase().includes(q) || (d.notes || '').toLowerCase().includes(q);
      const matchesEntity = entityFilter === 'all' ? true : d.entity_type === entityFilter;
      return matchesQuery && matchesEntity;
    });
  }, [debts, query, entityFilter]);

  const handlePay = async (e) => {
    e.preventDefault();
    await payDebt(selectedDebt._id, parseFloat(payAmount), payNotes);
    setShowPayModal(false);
    setPayAmount('');
    setPayNotes('');
    fetchData();
  };

  return (
    <div className="space-y-6" data-testid="receivables-to-us-page" dir="rtl">
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5">
        <p className="text-xs font-bold text-emerald-700">مستحقات</p>
        <h1 className="text-2xl font-bold text-slate-900">ديين لنا</h1>
        <p className="text-sm text-slate-500 mt-1">متابعة التحصيل من الكيانات والأطراف المختلفة.</p>
        <div className="mt-3"><DebtHeaderLinks tone="emerald" /></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 md:col-span-2 flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center"><HandCoins className="w-7 h-7 text-emerald-600" /></div>
          <div><p className="text-sm text-slate-500">إجمالي المستحقات لنا</p><p className="text-3xl font-bold text-emerald-600">{formatCurrency(total)}</p></div>
        </div>
        <div className="card p-5"><p className="text-sm text-slate-500">عدد القيود</p><p className="text-3xl font-bold text-slate-900">{filteredDebts.length}</p></div>
      </div>

      <DebtListToolbar query={query} setQuery={setQuery} entityFilter={entityFilter} setEntityFilter={setEntityFilter} />

      {loading ? (
        <div className="card p-8 text-center text-slate-500">جاري تحميل المستحقات...</div>
      ) : filteredDebts.length === 0 ? (
        <div className="card"><div className="empty-state py-12"><HandCoins className="empty-state-icon" /><p className="empty-state-title">لا توجد مستحقات مطابقة</p></div></div>
      ) : (
        <DebtCardGrid debts={filteredDebts} onOpenPay={(debt) => { setSelectedDebt(debt); setPayAmount(debt.remaining.toString()); setShowPayModal(true); }} />
      )}

      <SettlementModal isOpen={showPayModal} tone="emerald" selectedDebt={selectedDebt} payAmount={payAmount} setPayAmount={setPayAmount} payNotes={payNotes} setPayNotes={setPayNotes} onSubmit={handlePay} onClose={() => setShowPayModal(false)} />
    </div>
  );
};

const AdminBrokerage = () => {
  const { activeCycle, api } = useData();
  const [profits, setProfits] = useState([]);
  const [formData, setFormData] = useState({ amount: '', brokeragePct: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    if (!activeCycle) return;
    try {
      const res = await api.get('/api/profit-sources');
      setProfits(res.data.filter((p) => p.source_type === 'brokerage'));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeCycle]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.post('/api/admin-brokerage', {
        amount: parseFloat(formData.amount),
        brokeragePct: parseFloat(formData.brokeragePct),
        notes: formData.notes,
      });
      setFormData({ amount: '', brokeragePct: '', notes: '' });
      loadData();
    } catch (error) {
      console.error('admin brokerage create failed', error);
    } finally {
      setSaving(false);
    }
  };

  const total = profits.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6" data-testid="admin-brokerage-page" dir="rtl">
      <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5">
        <h1 className="text-2xl font-bold text-slate-900">وساطة إدارية</h1>
        <p className="text-sm text-slate-500 mt-1">تسجيل الوساطة وربطها مع مصادر الربح.</p>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center"><Wallet className="w-6 h-6 text-amber-600" /></div>
            <div>
              <p className="text-sm text-slate-500">إجمالي الوساطة</p>
              <p className="text-2xl font-bold text-amber-700">{formatCurrency(total)}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleCreate} className="card p-5 lg:col-span-2 space-y-3">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Percent className="w-4 h-4 text-amber-600" /> تسجيل وساطة</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input" type="number" step="0.01" min="0" placeholder="المبلغ" value={formData.amount} onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))} required />
            <input className="input" type="number" step="0.1" min="0" max="100" placeholder="نسبة الوساطة %" value={formData.brokeragePct} onChange={(e) => setFormData((p) => ({ ...p, brokeragePct: e.target.value }))} required />
          </div>
          <textarea className="input" rows={3} placeholder="ملاحظات" value={formData.notes} onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))} />
          <button type="submit" disabled={saving} className="btn btn-primary">
            <Save className="w-4 h-4" />
            {saving ? 'جاري الحفظ...' : 'تسجيل'}
          </button>
        </form>
      </section>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr><th>التاريخ</th><th>المبلغ</th><th>ملاحظات</th></tr>
            </thead>
            <tbody>
              {profits.length === 0 ? (
                <tr><td colSpan={3} className="text-center text-slate-500 py-8">لا توجد عمليات وساطة بعد</td></tr>
              ) : (
                profits.map((p) => (
                  <tr key={p._id}>
                    <td>{new Date(p.created_at).toLocaleDateString('ar-SA')}</td>
                    <td className="font-bold text-amber-700">+{formatCurrency(p.amount)}</td>
                    <td className="text-slate-500">{p.notes || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export { PayablesUs, ReceivablesToUs, AdminBrokerage };
