import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Building, Plus, X, Gift, Package, Receipt } from 'lucide-react';

const SubAgencies = () => {
  const { subAgencies, createSubAgency, agencyBonus, agencyDeductShipping } = useData();
  const [showModal, setShowModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [actionType, setActionType] = useState('bonus');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    initial_balance: 0,
    company_percent: 100
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value || 0);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await createSubAgency({
      ...formData,
      initial_balance: parseFloat(formData.initial_balance) || 0,
      company_percent: parseFloat(formData.company_percent) || 100
    });
    setShowModal(false);
    setFormData({ name: '', code: '', initial_balance: 0, company_percent: 100 });
  };

  const openActionModal = (agency, type) => {
    setSelectedAgency(agency);
    setActionType(type);
    setAmount('');
    setNotes('');
    setShowActionModal(true);
  };

  const handleAction = async (e) => {
    e.preventDefault();
    if (actionType === 'bonus') {
      await agencyBonus(selectedAgency._id, parseFloat(amount), notes);
    } else {
      await agencyDeductShipping(selectedAgency._id, parseFloat(amount), notes);
    }
    setShowActionModal(false);
  };

  return (
    <div className="space-y-6" data-testid="sub-agencies-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">الوكالات الفرعية</h1>
          <p className="text-slate-500 mt-1">إدارة الوكالات الفرعية</p>
        </div>
        
        <button onClick={() => setShowModal(true)} className="btn btn-primary" data-testid="add-agency-btn">
          <Plus className="w-4 h-4" />
          إضافة وكالة
        </button>
      </div>

      {subAgencies.length === 0 ? (
        <div className="card">
          <div className="empty-state py-12">
            <Building className="empty-state-icon" />
            <p className="empty-state-title">لا توجد وكالات</p>
            <p className="empty-state-text">أنشئ وكالة جديدة للبدء</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subAgencies.map(agency => (
            <div key={agency._id} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Building className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{agency.name}</h3>
                    {agency.code && <p className="text-sm text-slate-500">{agency.code}</p>}
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-slate-500">الرصيد</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(agency.balance)}</p>
              </div>
              
              <div className="flex gap-2">
                <button onClick={() => openActionModal(agency, 'bonus')} className="btn btn-danger flex-1 text-sm">
                  <Gift className="w-4 h-4" />
                  مكافأة
                </button>
                <button onClick={() => openActionModal(agency, 'deduct')} className="btn btn-success flex-1 text-sm">
                  <Package className="w-4 h-4" />
                  خصم شحن
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">إضافة وكالة فرعية</h2>
                <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="label">اسم الوكالة *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input" required data-testid="agency-name-input" />
                </div>
                <div>
                  <label className="label">الكود</label>
                  <input type="text" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} className="input" />
                </div>
                <div>
                  <label className="label">الرصيد الابتدائي</label>
                  <input type="number" step="0.01" value={formData.initial_balance} onChange={(e) => setFormData({...formData, initial_balance: e.target.value})} className="input" />
                </div>
                <div>
                  <label className="label">نسبة الشركة %</label>
                  <input type="number" step="0.01" max="100" value={formData.company_percent} onChange={(e) => setFormData({...formData, company_percent: e.target.value})} className="input" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn btn-primary flex-1" data-testid="save-agency-btn">إضافة الوكالة</button>
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">إلغاء</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showActionModal && selectedAgency && (
        <div className="modal-overlay" onClick={() => setShowActionModal(false)}>
          <div className="modal-content w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  {actionType === 'bonus' ? 'مكافأة وكالة' : 'خصم شحن من وكالة'}: {selectedAgency.name}
                </h2>
                <button onClick={() => setShowActionModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAction} className="space-y-4">
                <div>
                  <label className="label">المبلغ *</label>
                  <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="input" required data-testid="action-amount-input" />
                </div>
                <div>
                  <label className="label">ملاحظات</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input min-h-[80px]" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className={`btn flex-1 ${actionType === 'bonus' ? 'btn-danger' : 'btn-success'}`} data-testid="confirm-action-btn">
                    {actionType === 'bonus' ? 'تسجيل المكافأة' : 'تسجيل الخصم'}
                  </button>
                  <button type="button" onClick={() => setShowActionModal(false)} className="btn btn-secondary">إلغاء</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubAgencies;
