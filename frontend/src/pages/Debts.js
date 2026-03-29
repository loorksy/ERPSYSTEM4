import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Receipt, Plus, X, CreditCard, HandCoins } from 'lucide-react';

const Debts = () => {
  const { activeCycle, createDebt, payDebt, transferCompanies, funds, subAgencies, api } = useData();
  const [showModal, setShowModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [debts, setDebts] = useState([]);
  const [summary, setSummary] = useState({ payable: 0, receivable: 0 });
  const [activeTab, setActiveTab] = useState('companies');
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    entity_type: 'company',
    entity_id: '',
    amount: '',
    debt_type: 'payable',
    notes: ''
  });

  const [payAmount, setPayAmount] = useState('');
  const [payNotes, setPayNotes] = useState('');

  const fetchData = async () => {
    try {
      const [debtsRes, summaryRes] = await Promise.all([
        api.get('/api/debts'),
        api.get('/api/debts/summary')
      ]);
      setDebts(debtsRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error fetching debts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createDebt({
      ...formData,
      amount: parseFloat(formData.amount)
    });
    setShowModal(false);
    setFormData({
      entity_type: 'company',
      entity_id: '',
      amount: '',
      debt_type: 'payable',
      notes: ''
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

  const filteredDebts = debts.filter(d => {
    if (activeTab === 'companies') return d.entity_type === 'company';
    if (activeTab === 'funds') return d.entity_type === 'fund';
    return true;
  });

  return (
    <div className="space-y-6" data-testid="debts-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">الديون</h1>
          <p className="text-slate-500 mt-1">إدارة الديون والمستحقات</p>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
          data-testid="add-debt-btn"
        >
          <Plus className="w-4 h-4" />
          إضافة دين جديد
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
              <CreditCard className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">دين علينا</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.payable)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
              <HandCoins className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">ديين لنا</p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatCurrency(summary.receivable)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('companies')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'companies'
              ? 'bg-white text-slate-900 shadow'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          الشركات
        </button>
        <button
          onClick={() => setActiveTab('funds')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'funds'
              ? 'bg-white text-slate-900 shadow'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          الصناديق
        </button>
      </div>

      {/* Debts List */}
      {filteredDebts.length === 0 ? (
        <div className="card">
          <div className="empty-state py-12">
            <Receipt className="empty-state-icon" />
            <p className="empty-state-title">لا توجد ديون</p>
            <p className="empty-state-text">سجّل دين جديد للبدء</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDebts.map(debt => (
            <div key={debt._id} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{debt.entity_name}</h3>
                  <span className={`badge mt-1 ${
                    debt.debt_type === 'payable' ? 'badge-danger' : 'badge-success'
                  }`}>
                    {debt.debt_type === 'payable' ? 'دين علينا' : 'دين لنا'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">المبلغ الأصلي</span>
                  <span className="font-medium">{formatCurrency(debt.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">المتبقي</span>
                  <span className={`font-bold ${
                    debt.debt_type === 'payable' ? 'text-red-600' : 'text-emerald-600'
                  }`}>
                    {formatCurrency(debt.remaining)}
                  </span>
                </div>
              </div>
              
              {debt.notes && (
                <p className="text-sm text-slate-500 mb-4">{debt.notes}</p>
              )}
              
              <button
                onClick={() => openPayModal(debt)}
                className={`btn w-full ${
                  debt.debt_type === 'payable' ? 'btn-danger' : 'btn-success'
                }`}
                data-testid={`pay-debt-${debt._id}`}
              >
                {debt.debt_type === 'payable' ? 'تسديد' : 'تحصيل'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Debt Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div 
            className="modal-content w-full max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">إضافة دين جديد</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">نوع الدين</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.debt_type === 'payable'}
                        onChange={() => setFormData({...formData, debt_type: 'payable'})}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span>دين علينا</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.debt_type === 'receivable'}
                        onChange={() => setFormData({...formData, debt_type: 'receivable'})}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span>دين لنا</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="label">نوع الجهة</label>
                  <select
                    value={formData.entity_type}
                    onChange={(e) => setFormData({...formData, entity_type: e.target.value, entity_id: ''})}
                    className="input"
                  >
                    <option value="company">شركة تحويل</option>
                    <option value="fund">صندوق</option>
                    <option value="agency">وكالة فرعية</option>
                  </select>
                </div>
                
                <div>
                  <label className="label">الجهة *</label>
                  <select
                    value={formData.entity_id}
                    onChange={(e) => setFormData({...formData, entity_id: e.target.value})}
                    className="input"
                    required
                    data-testid="debt-entity-select"
                  >
                    <option value="">اختر الجهة</option>
                    {getEntities().map(entity => (
                      <option key={entity._id} value={entity._id}>{entity.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="label">المبلغ *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="input"
                    required
                    data-testid="debt-amount-input"
                  />
                </div>
                
                <div>
                  <label className="label">ملاحظات</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="input min-h-[80px]"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn btn-primary flex-1" data-testid="save-debt-btn">
                    إضافة الدين
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

      {/* Pay Modal */}
      {showPayModal && selectedDebt && (
        <div className="modal-overlay" onClick={() => setShowPayModal(false)}>
          <div 
            className="modal-content w-full max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedDebt.debt_type === 'payable' ? 'تسديد دين' : 'تحصيل دين'}
                </h2>
                <button
                  onClick={() => setShowPayModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
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
                  <input
                    type="number"
                    step="0.01"
                    max={selectedDebt.remaining}
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="input"
                    required
                    data-testid="pay-amount-input"
                  />
                </div>
                
                <div>
                  <label className="label">ملاحظات</label>
                  <textarea
                    value={payNotes}
                    onChange={(e) => setPayNotes(e.target.value)}
                    className="input min-h-[80px]"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    className={`btn flex-1 ${
                      selectedDebt.debt_type === 'payable' ? 'btn-danger' : 'btn-success'
                    }`}
                    data-testid="confirm-pay-btn"
                  >
                    {selectedDebt.debt_type === 'payable' ? 'تأكيد التسديد' : 'تأكيد التحصيل'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowPayModal(false)}
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

export default Debts;
