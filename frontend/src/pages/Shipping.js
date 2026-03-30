import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useSearchParams } from 'react-router-dom';
import { Package, Plus, X, TrendingUp, TrendingDown } from 'lucide-react';

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
  
  const [formData, setFormData] = useState({
    transaction_type: shippingType === 'in' ? 'buy' : 'sell',
    quantity: '',
    price: '',
    notes: '',
    swap_salary: qaFocus === 'swap',
    employee_id: ''
  });

  const fetchData = async () => {
    try {
      const [txRes, summaryRes] = await Promise.all([
        api.get('/api/shipping'),
        api.get('/api/shipping/summary')
      ]);
      setTransactions(txRes.data);
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
        swap_salary: qaFocus === 'swap'
      }));
      setShowModal(true);
    }
  }, [activeCycle, qaFocus, shippingType]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createShippingTransaction({
      ...formData,
      quantity: parseFloat(formData.quantity),
      price: parseFloat(formData.price)
    });
    setShowModal(false);
    setFormData({
      transaction_type: 'sell',
      quantity: '',
      price: '',
      notes: '',
      swap_salary: false,
      employee_id: ''
    });
    fetchData();
  };

  return (
    <div className="space-y-6" data-testid="shipping-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">الشحن</h1>
          <p className="text-slate-500 mt-1">إدارة عمليات الشحن (شراء/بيع)</p>
        </div>
        
        {activeCycle && (
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
            data-testid="add-shipping-btn"
          >
            <Plus className="w-4 h-4" />
            عملية جديدة
          </button>
        )}
      </div>

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
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="w-5 h-5 text-primary-600" />
                  <span className="text-sm text-slate-500">الكمية الحالية</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {summary.total_quantity?.toLocaleString('ar-SA') || 0}
                </p>
              </div>
              
              <div className="card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingDown className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-slate-500">متوسط سعر الشراء</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(summary.average_price)}
                </p>
              </div>
              
              <div className="card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm text-slate-500">إجمالي الربح</span>
                </div>
                <p className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(summary.total_profit)}
                </p>
              </div>
              
              <div className="card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="w-5 h-5 text-amber-600" />
                  <span className="text-sm text-slate-500">إجمالي التكلفة</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(summary.total_cost)}
                </p>
              </div>
            </div>
          )}

          {/* Transactions Table */}
          {transactions.length === 0 ? (
            <div className="card">
              <div className="empty-state py-12">
                <Package className="empty-state-icon" />
                <p className="empty-state-title">لا توجد عمليات شحن</p>
                <p className="empty-state-text">سجّل أول عملية شحن للبدء</p>
              </div>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>التاريخ</th>
                      <th>النوع</th>
                      <th>الكمية</th>
                      <th>السعر</th>
                      <th>الإجمالي</th>
                      <th>ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(tx => (
                      <tr key={tx._id}>
                        <td className="text-slate-600">
                          {new Date(tx.created_at).toLocaleDateString('ar-SA')}
                        </td>
                        <td>
                          <span className={`badge ${
                            tx.transaction_type === 'buy' ? 'badge-info' : 'badge-success'
                          }`}>
                            {tx.transaction_type === 'buy' ? 'شراء' : 'بيع'}
                          </span>
                        </td>
                        <td className="font-medium">{tx.quantity.toLocaleString('ar-SA')}</td>
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div 
            className="modal-content w-full max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">عملية شحن جديدة</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">نوع العملية</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        checked={formData.transaction_type === 'buy'}
                        onChange={() => setFormData({...formData, transaction_type: 'buy'})}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span>شراء</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        checked={formData.transaction_type === 'sell'}
                        onChange={() => setFormData({...formData, transaction_type: 'sell'})}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span>بيع</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="label">الكمية *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    className="input"
                    required
                    data-testid="shipping-quantity-input"
                  />
                </div>
                
                <div>
                  <label className="label">السعر *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="input"
                    required
                    data-testid="shipping-price-input"
                  />
                </div>
                
                {formData.transaction_type === 'buy' && (
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="swap_salary"
                      checked={formData.swap_salary}
                      onChange={(e) => setFormData({...formData, swap_salary: e.target.checked})}
                      className="w-4 h-4 text-primary-600 rounded border-slate-300"
                    />
                    <label htmlFor="swap_salary" className="text-sm text-slate-700">
                      تبديل راتب
                    </label>
                  </div>
                )}
                
                <div>
                  <label className="label">ملاحظات</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="input min-h-[80px]"
                    data-testid="shipping-notes-input"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn btn-primary flex-1" data-testid="save-shipping-btn">
                    تسجيل العملية
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="btn btn-secondary"
                  >
                    إلغاء
                  </button>
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
