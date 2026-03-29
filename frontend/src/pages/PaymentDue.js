import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Clock, Plus, X, Check, Calendar } from 'lucide-react';

const PaymentDue = () => {
  const { activeCycle, createPaymentDue, payPaymentDue, api } = useData();
  const [showModal, setShowModal] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    entity_name: '',
    amount: '',
    due_date: '',
    notes: ''
  });

  const fetchData = async () => {
    try {
      const response = await api.get('/api/payment-due');
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payment dues:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createPaymentDue({
      ...formData,
      amount: parseFloat(formData.amount)
    });
    setShowModal(false);
    setFormData({ entity_name: '', amount: '', due_date: '', notes: '' });
    fetchData();
  };

  const handlePay = async (paymentId) => {
    if (window.confirm('هل تم دفع هذا المبلغ؟')) {
      await payPaymentDue(paymentId);
      fetchData();
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysLeft = (dueDate) => {
    const diff = new Date(dueDate) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return `متأخر ${Math.abs(days)} يوم`;
    if (days === 0) return 'اليوم';
    if (days === 1) return 'غداً';
    return `${days} يوم`;
  };

  return (
    <div className="space-y-6" data-testid="payment-due-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">مطلوب دفع</h1>
          <p className="text-slate-500 mt-1">إدارة الدفعات المستحقة</p>
        </div>
        
        <button onClick={() => setShowModal(true)} className="btn btn-primary" data-testid="add-payment-due-btn">
          <Plus className="w-4 h-4" />
          إضافة دفعة مستحقة
        </button>
      </div>

      {payments.length === 0 ? (
        <div className="card">
          <div className="empty-state py-12">
            <Clock className="empty-state-icon" />
            <p className="empty-state-title">لا توجد دفعات مستحقة</p>
            <p className="empty-state-text">سجّل دفعة جديدة للبدء</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {payments.map(payment => (
            <div key={payment._id} className={`card p-5 ${isOverdue(payment.due_date) ? 'border-red-300 bg-red-50' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{payment.entity_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">{new Date(payment.due_date).toLocaleDateString('ar-SA')}</span>
                  </div>
                </div>
                <span className={`badge ${isOverdue(payment.due_date) ? 'badge-danger' : 'badge-warning'}`}>
                  {getDaysLeft(payment.due_date)}
                </span>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-slate-500">المبلغ المستحق</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(payment.amount)}</p>
              </div>
              
              {payment.notes && (
                <p className="text-sm text-slate-500 mb-4">{payment.notes}</p>
              )}
              
              <button onClick={() => handlePay(payment._id)} className="btn btn-success w-full" data-testid={`pay-${payment._id}`}>
                <Check className="w-4 h-4" />
                تم الدفع
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">إضافة دفعة مستحقة</h2>
                <button onClick={() => setShowModal(false)} className="p-2 text-slate-400"><X className="w-5 h-5" /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">اسم الجهة *</label>
                  <input type="text" value={formData.entity_name} onChange={(e) => setFormData({...formData, entity_name: e.target.value})} className="input" required data-testid="payment-entity-input" />
                </div>
                
                <div>
                  <label className="label">المبلغ *</label>
                  <input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="input" required data-testid="payment-amount-input" />
                </div>
                
                <div>
                  <label className="label">تاريخ الاستحقاق *</label>
                  <input type="date" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} className="input" required data-testid="payment-date-input" />
                </div>
                
                <div>
                  <label className="label">ملاحظات</label>
                  <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="input min-h-[80px]" />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn btn-primary flex-1" data-testid="save-payment-due-btn">إضافة</button>
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

export default PaymentDue;
