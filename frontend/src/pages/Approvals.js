import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { CheckCircle, Plus, X, ArrowDownCircle, ArrowUpCircle, History } from 'lucide-react';

const Approvals = () => {
  const { approvals, createApproval, approvalTransaction, api } = useData();
  const [showModal, setShowModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [transactions, setTransactions] = useState([]);
  
  const [formData, setFormData] = useState({ name: '', code: '', initial_balance: 0 });
  const [txData, setTxData] = useState({ amount: '', direction: 'incoming', commission_percent: 0, notes: '' });

  const formatCurrency = (value) => new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value || 0);

  const handleCreate = async (e) => {
    e.preventDefault();
    await createApproval({ ...formData, initial_balance: parseFloat(formData.initial_balance) || 0 });
    setShowModal(false);
    setFormData({ name: '', code: '', initial_balance: 0 });
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    await approvalTransaction(selectedApproval._id, {
      ...txData,
      amount: parseFloat(txData.amount),
      commission_percent: parseFloat(txData.commission_percent) || 0
    });
    setShowTransactionModal(false);
    setTxData({ amount: '', direction: 'incoming', commission_percent: 0, notes: '' });
  };

  const viewHistory = async (approval) => {
    try {
      const response = await api.get(`/api/approvals/${approval._id}/transactions`);
      setTransactions(response.data);
      setSelectedApproval(approval);
      setShowHistoryModal(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-6" data-testid="approvals-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">الاعتمادات</h1>
          <p className="text-slate-500 mt-1">إدارة المعتمدين والوساطة</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary" data-testid="add-approval-btn">
          <Plus className="w-4 h-4" />
          إضافة معتمد
        </button>
      </div>

      {approvals.length === 0 ? (
        <div className="card"><div className="empty-state py-12"><CheckCircle className="empty-state-icon" /><p className="empty-state-title">لا يوجد معتمدين</p></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {approvals.map(approval => (
            <div key={approval._id} className="card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{approval.name}</h3>
                  <p className="text-sm text-slate-500">{approval.code}</p>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm text-slate-500">الرصيد</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(approval.balance)}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setSelectedApproval(approval); setTxData({...txData, direction: 'incoming'}); setShowTransactionModal(true); }} className="btn btn-success flex-1 text-sm">
                  <ArrowDownCircle className="w-4 h-4" />
                  إلينا
                </button>
                <button onClick={() => { setSelectedApproval(approval); setTxData({...txData, direction: 'outgoing'}); setShowTransactionModal(true); }} className="btn btn-danger flex-1 text-sm">
                  <ArrowUpCircle className="w-4 h-4" />
                  منا
                </button>
                <button onClick={() => viewHistory(approval)} className="btn btn-secondary text-sm">
                  <History className="w-4 h-4" />
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
              <h2 className="text-xl font-bold text-slate-900 mb-6">إضافة معتمد جديد</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div><label className="label">الاسم *</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input" required /></div>
                <div><label className="label">الكود *</label><input type="text" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} className="input" required /></div>
                <div><label className="label">الرصيد الابتدائي</label><input type="number" step="0.01" value={formData.initial_balance} onChange={(e) => setFormData({...formData, initial_balance: e.target.value})} className="input" /></div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn btn-primary flex-1">إضافة</button>
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">إلغاء</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showTransactionModal && selectedApproval && (
        <div className="modal-overlay" onClick={() => setShowTransactionModal(false)}>
          <div className="modal-content w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                {txData.direction === 'incoming' ? 'اعتماد إلينا' : 'اعتماد منا'}: {selectedApproval.name}
              </h2>
              <form onSubmit={handleTransaction} className="space-y-4">
                <div><label className="label">المبلغ *</label><input type="number" step="0.01" value={txData.amount} onChange={(e) => setTxData({...txData, amount: e.target.value})} className="input" required /></div>
                <div><label className="label">نسبة الوساطة %</label><input type="number" step="0.01" value={txData.commission_percent} onChange={(e) => setTxData({...txData, commission_percent: e.target.value})} className="input" /></div>
                <div><label className="label">ملاحظات</label><textarea value={txData.notes} onChange={(e) => setTxData({...txData, notes: e.target.value})} className="input min-h-[80px]" /></div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className={`btn flex-1 ${txData.direction === 'incoming' ? 'btn-success' : 'btn-danger'}`}>تسجيل</button>
                  <button type="button" onClick={() => setShowTransactionModal(false)} className="btn btn-secondary">إلغاء</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showHistoryModal && selectedApproval && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="modal-content w-full max-w-2xl mx-4" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">سجل {selectedApproval.name}</h2>
                <button onClick={() => setShowHistoryModal(false)} className="p-2 text-slate-400"><X className="w-5 h-5" /></button>
              </div>
              {transactions.length === 0 ? (
                <div className="empty-state py-8"><History className="empty-state-icon" /><p className="empty-state-title">لا توجد معاملات</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead><tr><th>التاريخ</th><th>الاتجاه</th><th>المبلغ</th><th>الوساطة</th><th>الرصيد بعد</th></tr></thead>
                    <tbody>
                      {transactions.map(tx => (
                        <tr key={tx._id}>
                          <td>{new Date(tx.created_at).toLocaleDateString('ar-SA')}</td>
                          <td><span className={`badge ${tx.direction === 'incoming' ? 'badge-success' : 'badge-danger'}`}>{tx.direction === 'incoming' ? 'إلينا' : 'منا'}</span></td>
                          <td className="font-medium">{formatCurrency(tx.amount)}</td>
                          <td>{formatCurrency(tx.commission_amount)}</td>
                          <td className="font-medium">{formatCurrency(tx.balance_after)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approvals;
