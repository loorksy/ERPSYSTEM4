import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { CreditCard, HandCoins, X, DollarSign } from 'lucide-react';

const PayablesUs = () => {
  const { api, payDebt } = useData();
  const [debts, setDebts] = useState([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await api.get('/api/debts');
      setDebts(response.data.filter(d => d.debt_type === 'payable'));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (value) => new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value || 0);

  const total = debts.reduce((sum, d) => sum + d.remaining, 0);

  const handlePay = async (e) => {
    e.preventDefault();
    await payDebt(selectedDebt._id, parseFloat(payAmount), '');
    setShowPayModal(false);
    setPayAmount('');
    fetchData();
  };

  return (
    <div className="space-y-6" data-testid="payables-us-page">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">دين علينا</h1>
        <p className="text-slate-500 mt-1">الديون المستحقة علينا للغير</p>
      </div>

      {/* Total */}
      <div className="card p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
            <CreditCard className="w-7 h-7 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">إجمالي ديننا للغير</p>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(total)}</p>
          </div>
        </div>
      </div>

      {debts.length === 0 ? (
        <div className="card">
          <div className="empty-state py-12">
            <CreditCard className="empty-state-icon" />
            <p className="empty-state-title">لا توجد ديون علينا</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {debts.map(debt => (
            <div key={debt._id} className="card p-5 border-red-200">
              <h3 className="font-semibold text-slate-900 mb-2">{debt.entity_name}</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">المبلغ الأصلي</span>
                  <span>{formatCurrency(debt.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">المتبقي</span>
                  <span className="font-bold text-red-600">{formatCurrency(debt.remaining)}</span>
                </div>
              </div>
              <button onClick={() => { setSelectedDebt(debt); setPayAmount(debt.remaining.toString()); setShowPayModal(true); }} className="btn btn-danger w-full">
                <DollarSign className="w-4 h-4" />
                تسديد
              </button>
            </div>
          ))}
        </div>
      )}

      {showPayModal && selectedDebt && (
        <div className="modal-overlay" onClick={() => setShowPayModal(false)}>
          <div className="modal-content w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">تسديد دين: {selectedDebt.entity_name}</h2>
                <button onClick={() => setShowPayModal(false)} className="p-2 text-slate-400"><X className="w-5 h-5" /></button>
              </div>
              <div className="bg-red-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-600">المبلغ المتبقي</p>
                <p className="text-2xl font-bold text-red-700">{formatCurrency(selectedDebt.remaining)}</p>
              </div>
              <form onSubmit={handlePay} className="space-y-4">
                <div>
                  <label className="label">مبلغ التسديد</label>
                  <input type="number" step="0.01" max={selectedDebt.remaining} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="input" required />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn btn-danger flex-1">تأكيد التسديد</button>
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

const ReceivablesToUs = () => {
  const { api, payDebt } = useData();
  const [debts, setDebts] = useState([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await api.get('/api/debts');
      setDebts(response.data.filter(d => d.debt_type === 'receivable'));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (value) => new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value || 0);

  const total = debts.reduce((sum, d) => sum + d.remaining, 0);

  const handlePay = async (e) => {
    e.preventDefault();
    await payDebt(selectedDebt._id, parseFloat(payAmount), '');
    setShowPayModal(false);
    setPayAmount('');
    fetchData();
  };

  return (
    <div className="space-y-6" data-testid="receivables-to-us-page">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">ديين لنا</h1>
        <p className="text-slate-500 mt-1">الديون المستحقة لنا من الغير</p>
      </div>

      {/* Total */}
      <div className="card p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <HandCoins className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">إجمالي ديون الغير لنا</p>
            <p className="text-3xl font-bold text-emerald-600">{formatCurrency(total)}</p>
          </div>
        </div>
      </div>

      {debts.length === 0 ? (
        <div className="card">
          <div className="empty-state py-12">
            <HandCoins className="empty-state-icon" />
            <p className="empty-state-title">لا توجد ديون لنا</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {debts.map(debt => (
            <div key={debt._id} className="card p-5 border-emerald-200">
              <h3 className="font-semibold text-slate-900 mb-2">{debt.entity_name}</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">المبلغ الأصلي</span>
                  <span>{formatCurrency(debt.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">المتبقي</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(debt.remaining)}</span>
                </div>
              </div>
              <button onClick={() => { setSelectedDebt(debt); setPayAmount(debt.remaining.toString()); setShowPayModal(true); }} className="btn btn-success w-full">
                <DollarSign className="w-4 h-4" />
                تحصيل
              </button>
            </div>
          ))}
        </div>
      )}

      {showPayModal && selectedDebt && (
        <div className="modal-overlay" onClick={() => setShowPayModal(false)}>
          <div className="modal-content w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">تحصيل من: {selectedDebt.entity_name}</h2>
                <button onClick={() => setShowPayModal(false)} className="p-2 text-slate-400"><X className="w-5 h-5" /></button>
              </div>
              <div className="bg-emerald-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-emerald-600">المبلغ المتبقي</p>
                <p className="text-2xl font-bold text-emerald-700">{formatCurrency(selectedDebt.remaining)}</p>
              </div>
              <form onSubmit={handlePay} className="space-y-4">
                <div>
                  <label className="label">مبلغ التحصيل</label>
                  <input type="number" step="0.01" max={selectedDebt.remaining} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="input" required />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn btn-success flex-1">تأكيد التحصيل</button>
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

const AdminBrokerage = () => {
  const { activeCycle, api } = useData();
  const [profits, setProfits] = useState([]);

  useEffect(() => {
    if (activeCycle) {
      api.get('/api/profit-sources').then(res => {
        setProfits(res.data.filter(p => p.source_type === 'brokerage'));
      }).catch(console.error);
    }
  }, [activeCycle]);

  const formatCurrency = (value) => new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value || 0);
  const total = profits.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6" data-testid="admin-brokerage-page">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">وساطة إدارية</h1>
        <p className="text-slate-500 mt-1">إدارة أرباح الوساطة الإدارية</p>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
            <DollarSign className="w-7 h-7 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">إجمالي أرباح الوساطة</p>
            <p className="text-3xl font-bold text-purple-600">{formatCurrency(total)}</p>
          </div>
        </div>
      </div>

      {profits.length === 0 ? (
        <div className="card">
          <div className="empty-state py-12">
            <DollarSign className="empty-state-icon" />
            <p className="empty-state-title">لا توجد أرباح وساطة</p>
            <p className="empty-state-text">ستظهر أرباح الوساطة تلقائياً من عمليات الاعتمادات</p>
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr><th>التاريخ</th><th>المبلغ</th><th>ملاحظات</th></tr>
              </thead>
              <tbody>
                {profits.map(p => (
                  <tr key={p._id}>
                    <td>{new Date(p.created_at).toLocaleDateString('ar-SA')}</td>
                    <td className="font-bold text-purple-600">+{formatCurrency(p.amount)}</td>
                    <td className="text-slate-500">{p.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export { PayablesUs, ReceivablesToUs, AdminBrokerage };
