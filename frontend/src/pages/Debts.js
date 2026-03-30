import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Receipt, Plus, X, CreditCard, HandCoins, Search, Filter, ArrowRight, CalendarClock } from 'lucide-react';

const Debts = () => {
  const [searchParams] = useSearchParams();
  const { createDebt, payDebt, transferCompanies, funds, subAgencies, api } = useData();
  const [showModal, setShowModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [debts, setDebts] = useState([]);
  const [summary, setSummary] = useState({ payable: 0, receivable: 0 });
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const [formData, setFormData] = useState({
    entity_type: 'company',
    entity_id: '',
    amount: '',
    debt_type: 'payable',
    notes: '',
  });

  const [payAmount, setPayAmount] = useState('');
  const [payNotes, setPayNotes] = useState('');

  const fetchData = async () => {
    try {
      const [debtsRes, summaryRes] = await Promise.all([
        api.get('/api/debts'),
        api.get('/api/debts/summary'),
      ]);
      setDebts(Array.isArray(debtsRes.data) ? debtsRes.data : debtsRes.data?.rows || []);
      setSummary(summaryRes.data || { payable: 0, receivable: 0 });
    } catch (error) {
      console.error('Error fetching debts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setShowModal(true);
    }
  }, [searchParams]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createDebt({
      ...formData,
      amount: parseFloat(formData.amount),
    });
    setShowModal(false);
    setFormData({
      entity_type: 'company',
      entity_id: '',
      amount: '',
      debt_type: 'payable',
      notes: '',
    });
    fetchData();
  };

  const handlePay = async (e) => {
    e.preventDefault();
    await payDebt(selectedDebt._id, parseFloat(payAmount), payNotes);
    setShowPayModal(false);
    setPayAmount('');
    setPayNotes('');
    setSelectedDebt(null);
    fetchData();
  };

  const openPayModal = (debt) => {
    setSelectedDebt(debt);
    setPayAmount(debt.remaining.toString());
    setShowPayModal(true);
  };

  const getEntities = () => {
    switch (formData.entity_type) {
      case 'company':
        return transferCompanies;
      case 'fund':
        return funds;
      case 'agency':
        return subAgencies;
      default:
        return [];
    }
  };

  const filteredDebts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return debts.filter((d) => {
      const matchesTab =
        activeTab === 'all'
          ? true
          : activeTab === 'companies'
            ? d.entity_type === 'company'
            : activeTab === 'funds'
              ? d.entity_type === 'fund'
              : activeTab === 'agencies'
                ? d.entity_type === 'agency'
                : activeTab === 'payable'
                  ? d.debt_type === 'payable'
                  : d.debt_type === 'receivable';
      const matchesQuery = !q || (d.entity_name || '').toLowerCase().includes(q) || (d.notes || '').toLowerCase().includes(q);
      return matchesTab && matchesQuery;
    });
  }, [debts, activeTab, query]);

  return (
    <div className="space-y-6" data-testid="debts-page" dir="rtl">
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-sky-700">الديون والملفات</p>
            <h1 className="text-2xl font-bold text-slate-900">الديون</h1>
            <p className="text-sm text-slate-500 mt-1">إدارة شاملة للديون علينا/لنا مع ربط الكيانات.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="/payment-due" className="inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900"><CalendarClock className="h-4 w-4" /> مطلوب دفع</Link>
            <Link to="/payables-us" className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-900"><CreditCard className="h-4 w-4" /> دين علينا</Link>
            <Link to="/receivables-to-us" className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900"><HandCoins className="h-4 w-4" /> ديين لنا</Link>
            <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700" data-testid="add-debt-btn">
              <Plus className="w-4 h-4" /> إضافة دين
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center"><CreditCard className="w-7 h-7 text-red-600" /></div>
            <div><p className="text-sm text-slate-500">دين علينا</p><p className="text-2xl font-bold text-red-600">{formatCurrency(summary.payable)}</p></div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center"><HandCoins className="w-7 h-7 text-emerald-600" /></div>
            <div><p className="text-sm text-slate-500">ديين لنا</p><p className="text-2xl font-bold text-emerald-600">{formatCurrency(summary.receivable)}</p></div>
          </div>
        </div>
      </div>

      <section className="card p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative md:flex-1">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-9 pl-3 text-sm" placeholder="بحث بالجهة أو الملاحظات" />
          </div>
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 overflow-x-auto">
            <span className="inline-flex items-center gap-1 px-2 text-xs text-slate-500"><Filter className="h-3 w-3" />فلتر</span>
            {[
              { key: 'all', label: 'الكل' },
              { key: 'companies', label: 'شركات' },
              { key: 'funds', label: 'صناديق' },
              { key: 'agencies', label: 'وكالات' },
              { key: 'payable', label: 'علينا' },
              { key: 'receivable', label: 'لنا' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${activeTab === tab.key ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-600'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {loading ? (
        <div className="card p-8 text-center text-slate-500">جاري تحميل بيانات الديون...</div>
      ) : filteredDebts.length === 0 ? (
        <div className="card"><div className="empty-state py-12"><Receipt className="empty-state-icon" /><p className="empty-state-title">لا توجد ديون مطابقة</p><p className="empty-state-text">عدّل الفلاتر أو أضف دين جديد</p></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDebts.map((debt) => (
            <div key={debt._id} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{debt.entity_name}</h3>
                  <span className={`badge mt-1 ${debt.debt_type === 'payable' ? 'badge-danger' : 'badge-success'}`}>{debt.debt_type === 'payable' ? 'دين علينا' : 'دين لنا'}</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm"><span className="text-slate-500">المبلغ الأصلي</span><span className="font-medium">{formatCurrency(debt.amount)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">المتبقي</span><span className={`font-bold ${debt.debt_type === 'payable' ? 'text-red-600' : 'text-emerald-600'}`}>{formatCurrency(debt.remaining)}</span></div>
              </div>

              {debt.notes && <p className="text-sm text-slate-500 mb-3">{debt.notes}</p>}

              {(debt.entity_type === 'company' || debt.entity_type === 'fund') && (
                <Link to={debt.entity_type === 'company' ? `/debts/company/${debt.entity_id}` : `/debts/fund/${debt.entity_id}`} className="btn btn-secondary w-full mb-2">
                  <ArrowRight className="h-4 w-4" />
                  {debt.entity_type === 'company' ? 'ملف الشركة' : 'ملف الصندوق'}
                </Link>
              )}

              <button onClick={() => openPayModal(debt)} className={`btn w-full ${debt.debt_type === 'payable' ? 'btn-danger' : 'btn-success'}`} data-testid={`pay-debt-${debt._id}`}>
                {debt.debt_type === 'payable' ? 'تسديد' : 'تحصيل'}
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">إضافة دين جديد</h2>
                <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">نوع الدين</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setFormData({ ...formData, debt_type: 'payable' })} className={`rounded-xl border px-3 py-2 text-sm font-semibold ${formData.debt_type === 'payable' ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-600'}`}>دين علينا</button>
                    <button type="button" onClick={() => setFormData({ ...formData, debt_type: 'receivable' })} className={`rounded-xl border px-3 py-2 text-sm font-semibold ${formData.debt_type === 'receivable' ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600'}`}>دين لنا</button>
                  </div>
                </div>

                <div>
                  <label className="label">نوع الجهة</label>
                  <select value={formData.entity_type} onChange={(e) => setFormData({ ...formData, entity_type: e.target.value, entity_id: '' })} className="input">
                    <option value="company">شركة تحويل</option>
                    <option value="fund">صندوق</option>
                    <option value="agency">وكالة فرعية</option>
                  </select>
                </div>

                <div>
                  <label className="label">الجهة *</label>
                  <select value={formData.entity_id} onChange={(e) => setFormData({ ...formData, entity_id: e.target.value })} className="input" required data-testid="debt-entity-select">
                    <option value="">اختر الجهة</option>
                    {getEntities().map((entity) => (
                      <option key={entity._id} value={entity._id}>{entity.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">المبلغ *</label>
                  <input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="input" required data-testid="debt-amount-input" />
                </div>

                <div>
                  <label className="label">ملاحظات</label>
                  <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="input min-h-[80px]" />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn btn-primary flex-1" data-testid="save-debt-btn">إضافة الدين</button>
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">إلغاء</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showPayModal && selectedDebt && (
        <div className="modal-overlay" onClick={() => setShowPayModal(false)}>
          <div className="modal-content w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">{selectedDebt.debt_type === 'payable' ? 'تسديد دين' : 'تحصيل دين'}</h2>
                <button onClick={() => setShowPayModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"><X className="w-5 h-5" /></button>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-slate-500">الجهة</p>
                <p className="font-semibold text-slate-900">{selectedDebt.entity_name}</p>
                <p className="text-sm text-slate-500 mt-2">المبلغ المتبقي</p>
                <p className="font-bold text-lg">{formatCurrency(selectedDebt.remaining)}</p>
              </div>

              <form onSubmit={handlePay} className="space-y-4">
                <div>
                  <label className="label">المبلغ *</label>
                  <input type="number" step="0.01" max={selectedDebt.remaining} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="input" required data-testid="pay-amount-input" />
                </div>

                <div>
                  <label className="label">ملاحظات</label>
                  <textarea value={payNotes} onChange={(e) => setPayNotes(e.target.value)} className="input min-h-[80px]" />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className={`btn flex-1 ${selectedDebt.debt_type === 'payable' ? 'btn-danger' : 'btn-success'}`} data-testid="confirm-pay-btn">
                    {selectedDebt.debt_type === 'payable' ? 'تأكيد التسديد' : 'تأكيد التحصيل'}
                  </button>
                  <button type="button" onClick={() => setShowPayModal(false)} className="btn btn-secondary">إلغاء</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Debts;
