import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Package,
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Truck,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
} from 'lucide-react';

const Shipping = () => {
  const { activeCycle, createShippingTransaction, api } = useData();
  const [searchParams] = useSearchParams();
  const fabType = searchParams.get('fab');
  const typeParam = searchParams.get('type');
  const shippingType = fabType || typeParam;
  const qaFocus = searchParams.get('qaFocus');

  const [showModal, setShowModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const [formData, setFormData] = useState({
    transaction_type: shippingType === 'in' ? 'buy' : 'sell',
    quantity: '',
    price: '',
    notes: '',
    swap_salary: qaFocus === 'swap',
    employee_id: '',
  });

  const fetchData = async () => {
    try {
      const [txRes, summaryRes] = await Promise.all([
        api.get('/api/shipping'),
        api.get('/api/shipping/summary'),
      ]);
      setTransactions(Array.isArray(txRes.data) ? txRes.data : txRes.data?.rows || []);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error fetching shipping data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeCycle) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [activeCycle]);

  useEffect(() => {
    if (!activeCycle) return;
    if (shippingType === 'in' || shippingType === 'out') {
      setFormData((prev) => ({
        ...prev,
        transaction_type: shippingType === 'in' ? 'buy' : 'sell',
        swap_salary: qaFocus === 'swap',
      }));
      setShowModal(true);
    }
  }, [activeCycle, qaFocus, shippingType]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value || 0);

  const openModalByType = (type) => {
    setFormData((prev) => ({
      ...prev,
      transaction_type: type,
      swap_salary: type === 'buy' ? prev.swap_salary : false,
    }));
    setShowModal(true);
  };

  const filteredTransactions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((tx) => {
      const matchType = typeFilter === 'all' ? true : tx.transaction_type === typeFilter;
      const notes = (tx.notes || '').toLowerCase();
      const matchQuery = !q || notes.includes(q);
      return matchType && matchQuery;
    });
  }, [transactions, query, typeFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createShippingTransaction({
      ...formData,
      quantity: parseFloat(formData.quantity),
      price: parseFloat(formData.price),
    });
    setShowModal(false);
    setFormData({
      transaction_type: 'sell',
      quantity: '',
      price: '',
      notes: '',
      swap_salary: false,
      employee_id: '',
    });
    fetchData();
  };

  const totalValue = (parseFloat(formData.quantity) || 0) * (parseFloat(formData.price) || 0);

  return (
    <div className="space-y-6" data-testid="shipping-page" dir="rtl">
      <section className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold text-sky-700">قسم الشحن</p>
            <h1 className="text-2xl font-bold text-slate-900">الشحن</h1>
            <p className="text-slate-500 mt-1">تسجيل شراء/بيع وتتبع أثر الشحن على الربح والرصيد.</p>
          </div>

          {activeCycle && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button onClick={() => openModalByType('buy')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
                <ArrowDownCircle className="w-4 h-4" />
                شراء
              </button>
              <button onClick={() => openModalByType('sell')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700">
                <ArrowUpCircle className="w-4 h-4" />
                بيع
              </button>
              <button onClick={() => setShowModal(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 sm:col-span-1 col-span-2" data-testid="add-shipping-btn">
                <Plus className="w-4 h-4" />
                عملية جديدة
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/debts" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"><Wallet className="w-4 h-4" /> الديون</Link>
          <Link to="/expenses-manual" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"><Truck className="w-4 h-4" /> المصاريف</Link>
        </div>
      </section>

      {!activeCycle ? (
        <div className="card">
          <div className="empty-state py-12">
            <Package className="empty-state-icon" />
            <p className="empty-state-title">لا توجد دورة مالية نشطة</p>
            <p className="empty-state-text">أنشئ دورة مالية من لوحة التحكم للبدء</p>
          </div>
        </div>
      ) : (
        <>
          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card p-5">
                <div className="flex items-center gap-3 mb-2"><Package className="w-5 h-5 text-primary-600" /><span className="text-sm text-slate-500">الكمية الحالية</span></div>
                <p className="text-2xl font-bold text-slate-900">{summary.total_quantity?.toLocaleString('ar-SA') || 0}</p>
              </div>
              <div className="card p-5">
                <div className="flex items-center gap-3 mb-2"><TrendingDown className="w-5 h-5 text-blue-600" /><span className="text-sm text-slate-500">متوسط سعر الشراء</span></div>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(summary.average_price)}</p>
              </div>
              <div className="card p-5">
                <div className="flex items-center gap-3 mb-2"><TrendingUp className="w-5 h-5 text-emerald-600" /><span className="text-sm text-slate-500">إجمالي الربح</span></div>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(summary.total_profit)}</p>
              </div>
              <div className="card p-5">
                <div className="flex items-center gap-3 mb-2"><Package className="w-5 h-5 text-amber-600" /><span className="text-sm text-slate-500">إجمالي التكلفة</span></div>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(summary.total_cost)}</p>
              </div>
            </div>
          )}

          <section className="card p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="relative md:flex-1">
                <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="بحث في الملاحظات" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-9 pl-3 text-sm" />
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-1">
                <span className="inline-flex items-center gap-1 px-2 text-xs text-slate-500"><Filter className="w-3 h-3" /> النوع</span>
                {[
                  { key: 'all', label: 'الكل' },
                  { key: 'buy', label: 'شراء' },
                  { key: 'sell', label: 'بيع' },
                ].map((f) => (
                  <button key={f.key} onClick={() => setTypeFilter(f.key)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${typeFilter === f.key ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-600'}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {loading ? (
            <div className="card p-8 text-center text-slate-500">جاري تحميل عمليات الشحن...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="card"><div className="empty-state py-12"><Package className="empty-state-icon" /><p className="empty-state-title">لا توجد عمليات شحن مطابقة</p><p className="empty-state-text">جرّب تغيير الفلاتر أو أضف عملية جديدة</p></div></div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr><th>التاريخ</th><th>النوع</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th><th>ملاحظات</th></tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((tx) => (
                      <tr key={tx._id}>
                        <td className="text-slate-600">{new Date(tx.created_at).toLocaleDateString('ar-SA')}</td>
                        <td><span className={`badge ${tx.transaction_type === 'buy' ? 'badge-info' : 'badge-success'}`}>{tx.transaction_type === 'buy' ? 'شراء' : 'بيع'}</span></td>
                        <td className="font-medium">{Number(tx.quantity || 0).toLocaleString('ar-SA')}</td>
                        <td>{formatCurrency(tx.price)}</td>
                        <td className="font-medium">{formatCurrency(tx.total)}</td>
                        <td className="text-slate-500">{tx.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">عملية شحن جديدة</h2>
                <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">نوع العملية</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setFormData({ ...formData, transaction_type: 'buy' })} className={`rounded-xl border px-3 py-2 text-sm font-semibold ${formData.transaction_type === 'buy' ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600'}`}>شراء</button>
                    <button type="button" onClick={() => setFormData({ ...formData, transaction_type: 'sell', swap_salary: false })} className={`rounded-xl border px-3 py-2 text-sm font-semibold ${formData.transaction_type === 'sell' ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-600'}`}>بيع</button>
                  </div>
                </div>

                <div>
                  <label className="label">الكمية *</label>
                  <input type="number" step="0.01" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} className="input" required data-testid="shipping-quantity-input" />
                </div>

                <div>
                  <label className="label">السعر *</label>
                  <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="input" required data-testid="shipping-price-input" />
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  إجمالي العملية: <span className="font-bold text-slate-900">{formatCurrency(totalValue)}</span>
                </div>

                {formData.transaction_type === 'buy' && (
                  <>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" id="swap_salary" checked={formData.swap_salary} onChange={(e) => setFormData({ ...formData, swap_salary: e.target.checked })} className="w-4 h-4 text-primary-600 rounded border-slate-300" />
                      <label htmlFor="swap_salary" className="text-sm text-slate-700">تبديل راتب</label>
                    </div>

                    {formData.swap_salary && (
                      <div>
                        <label className="label">رقم المستخدم (اختياري)</label>
                        <input type="text" value={formData.employee_id} onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })} className="input" placeholder="مثال: 12345" />
                      </div>
                    )}
                  </>
                )}

                <div>
                  <label className="label">ملاحظات</label>
                  <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="input min-h-[80px]" data-testid="shipping-notes-input" />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn btn-primary flex-1" data-testid="save-shipping-btn">تسجيل العملية</button>
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">إلغاء</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shipping;
