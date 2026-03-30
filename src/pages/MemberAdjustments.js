import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { SlidersHorizontal, Plus, X, TrendingUp, TrendingDown } from 'lucide-react';

const MemberAdjustments = () => {
  const { activeCycle, members, createAdjustment, api } = useData();
  const [showModal, setShowModal] = useState(false);
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    member_id: '',
    adjustment_type: 'bonus',
    amount: '',
    reason: '',
    notes: ''
  });

  const fetchData = async () => {
    try {
      const response = await api.get('/api/adjustments');
      setAdjustments(response.data);
    } catch (error) {
      console.error('Error fetching adjustments:', error);
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createAdjustment({
      ...formData,
      amount: parseFloat(formData.amount)
    });
    setShowModal(false);
    setFormData({ member_id: '', adjustment_type: 'bonus', amount: '', reason: '', notes: '' });
    fetchData();
  };

  return (
    <div className="space-y-6" data-testid="member-adjustments-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إضافات وخصومات</h1>
          <p className="text-slate-500 mt-1">إدارة مكافآت وخصومات المستخدمين</p>
        </div>
        
        {activeCycle && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary" data-testid="add-adjustment-btn">
            <Plus className="w-4 h-4" />
            إضافة تعديل
          </button>
        )}
      </div>

      {!activeCycle ? (
        <div className="card">
          <div className="empty-state py-12">
            <SlidersHorizontal className="empty-state-icon" />
            <p className="empty-state-title">لا توجد دورة مالية نشطة</p>
          </div>
        </div>
      ) : adjustments.length === 0 ? (
        <div className="card">
          <div className="empty-state py-12">
            <SlidersHorizontal className="empty-state-icon" />
            <p className="empty-state-title">لا توجد تعديلات</p>
            <p className="empty-state-text">سجّل أول تعديل للبدء</p>
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>المستخدم</th>
                  <th>النوع</th>
                  <th>المبلغ</th>
                  <th>السبب</th>
                  <th>ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {adjustments.map(adj => (
                  <tr key={adj._id}>
                    <td className="text-slate-600">{new Date(adj.created_at).toLocaleDateString('ar-SA')}</td>
                    <td className="font-medium">{adj.member_name}</td>
                    <td>
                      <span className={`badge flex items-center gap-1 w-fit ${adj.adjustment_type === 'bonus' ? 'badge-success' : 'badge-danger'}`}>
                        {adj.adjustment_type === 'bonus' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {adj.adjustment_type === 'bonus' ? 'مكافأة' : 'خصم'}
                      </span>
                    </td>
                    <td className={`font-bold ${adj.adjustment_type === 'bonus' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {adj.adjustment_type === 'bonus' ? '+' : '-'}{formatCurrency(adj.amount)}
                    </td>
                    <td>{adj.reason}</td>
                    <td className="text-slate-500">{adj.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">إضافة تعديل</h2>
                <button onClick={() => setShowModal(false)} className="p-2 text-slate-400"><X className="w-5 h-5" /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">المستخدم *</label>
                  <select value={formData.member_id} onChange={(e) => setFormData({...formData, member_id: e.target.value})} className="input" required data-testid="adjustment-member-select">
                    <option value="">اختر المستخدم</option>
                    {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="label">نوع التعديل</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={formData.adjustment_type === 'bonus'} onChange={() => setFormData({...formData, adjustment_type: 'bonus'})} className="w-4 h-4 text-primary-600" />
                      <span className="text-emerald-600">مكافأة</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={formData.adjustment_type === 'deduction'} onChange={() => setFormData({...formData, adjustment_type: 'deduction'})} className="w-4 h-4 text-primary-600" />
                      <span className="text-red-600">خصم</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="label">المبلغ *</label>
                  <input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="input" required />
                </div>
                
                <div>
                  <label className="label">السبب *</label>
                  <input type="text" value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} className="input" required />
                </div>
                
                <div>
                  <label className="label">ملاحظات</label>
                  <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="input min-h-[80px]" />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button type="submit" className={`btn flex-1 ${formData.adjustment_type === 'bonus' ? 'btn-success' : 'btn-danger'}`}>تسجيل التعديل</button>
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

export default MemberAdjustments;
