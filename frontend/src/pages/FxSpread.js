import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { TrendingUp, Plus, X } from 'lucide-react';

const FxSpread = () => {
  const { activeCycle, createFxSpread, api } = useData();
  const [showModal, setShowModal] = useState(false);
  const [spreads, setSpreads] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    currency: 'TRY',
    amount_foreign: '',
    exchange_rate: '',
    add_to_main: true,
    notes: ''
  });

  const currencies = [
    { code: 'TRY', name: 'ليرة تركية' },
    { code: 'EUR', name: 'يورو' },
    { code: 'SYP', name: 'ليرة سورية' },
    { code: 'AED', name: 'درهم إماراتي' },
    { code: 'SAR', name: 'ريال سعودي' }
  ];

  const fetchData = async () => {
    try {
      const response = await api.get('/api/fx-spread');
      setSpreads(response.data);
    } catch (error) {
      console.error('Error fetching FX spreads:', error);
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
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createFxSpread({
      ...formData,
      amount_foreign: parseFloat(formData.amount_foreign),
      exchange_rate: parseFloat(formData.exchange_rate)
    });
    setShowModal(false);
    setFormData({ currency: 'TRY', amount_foreign: '', exchange_rate: '', add_to_main: true, notes: '' });
    fetchData();
  };

  const calculatedUSD = formData.amount_foreign && formData.exchange_rate 
    ? parseFloat(formData.amount_foreign) * parseFloat(formData.exchange_rate) 
    : 0;

  return (
    <div className="space-y-6" data-testid="fx-spread-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">فرق التصريف</h1>
          <p className="text-slate-500 mt-1">إدارة أرباح فرق العملات</p>
        </div>
        
        {activeCycle && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary" data-testid="add-fx-spread-btn">
            <Plus className="w-4 h-4" />
            إضافة فرق تصريف
          </button>
        )}
      </div>

      {!activeCycle ? (
        <div className="card">
          <div className="empty-state py-12">
            <TrendingUp className="empty-state-icon" />
            <p className="empty-state-title">لا توجد دورة مالية نشطة</p>
          </div>
        </div>
      ) : spreads.length === 0 ? (
        <div className="card">
          <div className="empty-state py-12">
            <TrendingUp className="empty-state-icon" />
            <p className="empty-state-title">لا توجد عمليات فرق تصريف</p>
            <p className="empty-state-text">سجّل أول عملية للبدء</p>
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>العملة</th>
                  <th>المبلغ بالعملة</th>
                  <th>سعر الصرف</th>
                  <th>المبلغ بالدولار</th>
                  <th>للصندوق</th>
                  <th>ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {spreads.map(spread => (
                  <tr key={spread._id}>
                    <td className="text-slate-600">{new Date(spread.created_at).toLocaleDateString('ar-SA')}</td>
                    <td><span className="badge badge-info">{spread.currency}</span></td>
                    <td className="font-medium">{spread.amount_foreign?.toLocaleString('ar-SA')}</td>
                    <td>{spread.exchange_rate}</td>
                    <td className="font-bold text-emerald-600">{formatCurrency(spread.amount_usd)}</td>
                    <td>{spread.add_to_main ? <span className="badge badge-success">نعم</span> : <span className="badge badge-warning">لا</span>}</td>
                    <td className="text-slate-500">{spread.notes || '-'}</td>
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
                <h2 className="text-xl font-bold text-slate-900">إضافة فرق تصريف</h2>
                <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">العملة *</label>
                  <select value={formData.currency} onChange={(e) => setFormData({...formData, currency: e.target.value})} className="input" data-testid="fx-currency-select">
                    {currencies.map(c => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="label">المبلغ بالعملة الأجنبية *</label>
                  <input type="number" step="0.01" value={formData.amount_foreign} onChange={(e) => setFormData({...formData, amount_foreign: e.target.value})} className="input" required data-testid="fx-amount-input" />
                </div>
                
                <div>
                  <label className="label">سعر الصرف (للدولار) *</label>
                  <input type="number" step="0.0001" value={formData.exchange_rate} onChange={(e) => setFormData({...formData, exchange_rate: e.target.value})} className="input" required data-testid="fx-rate-input" />
                </div>
                
                {calculatedUSD > 0 && (
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <p className="text-sm text-emerald-600">المبلغ بالدولار</p>
                    <p className="text-2xl font-bold text-emerald-700">{formatCurrency(calculatedUSD)}</p>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="add_to_main" checked={formData.add_to_main} onChange={(e) => setFormData({...formData, add_to_main: e.target.checked})} className="w-4 h-4 text-primary-600 rounded border-slate-300" />
                  <label htmlFor="add_to_main" className="text-sm text-slate-700">إضافة للصندوق الرئيسي</label>
                </div>
                
                <div>
                  <label className="label">ملاحظات</label>
                  <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="input min-h-[80px]" />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn btn-success flex-1" data-testid="save-fx-spread-btn">تسجيل الفرق</button>
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

export default FxSpread;
