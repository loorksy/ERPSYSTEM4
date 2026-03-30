import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useSearchParams } from 'react-router-dom';
import { DollarSign, Plus, X, Trash2 } from 'lucide-react';

const Expenses = () => {
  const [searchParams] = useSearchParams();
  const { activeCycle, createExpense, api } = useData();
  const [showModal, setShowModal] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ total: 0 });
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    deduct_from_main: true
  });

  const fetchData = async () => {
    try {
      const [expRes, summaryRes] = await Promise.all([
        api.get('/api/expenses'),
        api.get('/api/expenses/summary')
      ]);
      setExpenses(expRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
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
    if (searchParams.get('action') === 'add' && activeCycle) {
      setShowModal(true);
    }
  }, [searchParams, activeCycle]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createExpense({
      ...formData,
      amount: parseFloat(formData.amount)
    });
    setShowModal(false);
    setFormData({
      amount: '',
      description: '',
      category: '',
      deduct_from_main: true
    });
    fetchData();
  };

  const categories = [
    'رواتب',
    'إيجار',
    'كهرباء',
    'إنترنت',
    'صيانة',
    'نقل',
    'متنوعة',
    'أخرى'
  ];

  return (
    <div className="space-y-6" data-testid="expenses-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">المصاريف</h1>
          <p className="text-slate-500 mt-1">إدارة وتتبع المصاريف</p>
        </div>
        
        {activeCycle && (
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
            data-testid="add-expense-btn"
          >
            <Plus className="w-4 h-4" />
            إضافة مصروف
          </button>
        )}
      </div>

      {!activeCycle ? (
        <div className="card">
          <div className="empty-state py-12">
            <DollarSign className="empty-state-icon" />
            <p className="empty-state-title">لا توجد دورة مالية نشطة</p>
            <p className="empty-state-text">أنشئ دورة مالية من لوحة التحكم للبدء</p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="card p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">إجمالي المصاريف</p>
                <p className="text-3xl font-bold text-red-600">
                  {formatCurrency(summary.total)}
                </p>
              </div>
            </div>
          </div>

          {/* Expenses List */}
          {expenses.length === 0 ? (
            <div className="card">
              <div className="empty-state py-12">
                <DollarSign className="empty-state-icon" />
                <p className="empty-state-title">لا توجد مصاريف</p>
                <p className="empty-state-text">سجّل أول مصروف للبدء</p>
              </div>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>التاريخ</th>
                      <th>الوصف</th>
                      <th>التصنيف</th>
                      <th>المبلغ</th>
                      <th>من الصندوق</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map(expense => (
                      <tr key={expense._id}>
                        <td className="text-slate-600">
                          {new Date(expense.created_at).toLocaleDateString('ar-SA')}
                        </td>
                        <td className="font-medium text-slate-900">{expense.description}</td>
                        <td>
                          {expense.category ? (
                            <span className="badge badge-info">{expense.category}</span>
                          ) : '-'}
                        </td>
                        <td className="font-medium text-red-600">
                          -{formatCurrency(expense.amount)}
                        </td>
                        <td>
                          {expense.deduct_from_main ? (
                            <span className="badge badge-success">نعم</span>
                          ) : (
                            <span className="badge badge-warning">لا</span>
                          )}
                        </td>
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
                <h2 className="text-xl font-bold text-slate-900">تسجيل مصروف</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">المبلغ *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="input"
                    required
                    data-testid="expense-amount-input"
                  />
                </div>
                
                <div>
                  <label className="label">الوصف *</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="input"
                    required
                    data-testid="expense-description-input"
                  />
                </div>
                
                <div>
                  <label className="label">التصنيف</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="input"
                    data-testid="expense-category-select"
                  >
                    <option value="">اختر التصنيف</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="deduct_from_main"
                    checked={formData.deduct_from_main}
                    onChange={(e) => setFormData({...formData, deduct_from_main: e.target.checked})}
                    className="w-4 h-4 text-primary-600 rounded border-slate-300"
                  />
                  <label htmlFor="deduct_from_main" className="text-sm text-slate-700">
                    خصم من الصندوق الرئيسي
                  </label>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn btn-danger flex-1" data-testid="save-expense-btn">
                    تسجيل المصروف
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

export default Expenses;
