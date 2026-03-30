import React, { useCallback, useState } from 'react';
import { useData } from '../context/DataContext';
import { useSearchParams } from 'react-router-dom';
import { Wallet, Plus, ArrowUpCircle, ArrowDownCircle, X, History } from 'lucide-react';

const Funds = () => {
  const [searchParams] = useSearchParams();
  const { funds, activeCycle, createFund, fundTransaction, api } = useData();
  const [showModal, setShowModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedFund, setSelectedFund] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  const [fundForm, setFundForm] = useState({
    name: '',
    is_main: false,
    initial_balance: 0
  });
  
  const [transactionForm, setTransactionForm] = useState({
    amount: '',
    transaction_type: 'deposit',
    notes: ''
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value || 0);
  };

  const handleCreateFund = async (e) => {
    e.preventDefault();
    await createFund({
      ...fundForm,
      initial_balance: parseFloat(fundForm.initial_balance) || 0
    });
    setShowModal(false);
    setFundForm({ name: '', is_main: false, initial_balance: 0 });
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    await fundTransaction(selectedFund._id, {
      ...transactionForm,
      amount: parseFloat(transactionForm.amount)
    });
    setShowTransactionModal(false);
    setTransactionForm({ amount: '', transaction_type: 'deposit', notes: '' });
    setSelectedFund(null);
  };

  const openTransactionModal = useCallback((fund, type) => {
    setSelectedFund(fund);
    setTransactionForm({ ...transactionForm, transaction_type: type });
    setShowTransactionModal(true);
  }, [transactionForm]);

  React.useEffect(() => {
    if (searchParams.get('action') !== 'transfer' || funds.length === 0) return;
    const targetFund = funds.find((fund) => !fund.is_main) || funds[0];
    if (targetFund) openTransactionModal(targetFund, 'deposit');
  }, [searchParams, funds, openTransactionModal]);

  const viewHistory = async (fund) => {
    try {
      const response = await api.get(`/api/funds/${fund._id}/transactions`);
      setTransactions(response.data);
      setSelectedFund(fund);
      setShowHistoryModal(true);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  return (
    <div className="space-y-6" data-testid="funds-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">الصناديق</h1>
          <p className="text-slate-500 mt-1">إدارة الصناديق المالية</p>
        </div>
        
        {activeCycle && (
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
            data-testid="add-fund-btn"
          >
            <Plus className="w-4 h-4" />
            إضافة صندوق جديد
          </button>
        )}
      </div>

      {!activeCycle ? (
        <div className="card">
          <div className="empty-state py-12">
            <Wallet className="empty-state-icon" />
            <p className="empty-state-title">لا توجد دورة مالية نشطة</p>
            <p className="empty-state-text">أنشئ دورة مالية من لوحة التحكم للبدء</p>
          </div>
        </div>
      ) : funds.length === 0 ? (
        <div className="card">
          <div className="empty-state py-12">
            <Wallet className="empty-state-icon" />
            <p className="empty-state-title">لا توجد صناديق</p>
            <p className="empty-state-text">أنشئ صندوقاً جديداً للبدء</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {funds.map(fund => (
            <div 
              key={fund._id}
              className={`card p-5 ${fund.is_main ? 'ring-2 ring-primary-500' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    fund.is_main ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{fund.name}</h3>
                    {fund.is_main && (
                      <span className="badge badge-info">رئيسي</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-slate-500">الرصيد الحالي</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(fund.balance)}
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => openTransactionModal(fund, 'deposit')}
                  className="btn btn-success flex-1 text-sm"
                  data-testid={`deposit-${fund._id}`}
                >
                  <ArrowDownCircle className="w-4 h-4" />
                  إيداع
                </button>
                <button
                  onClick={() => openTransactionModal(fund, 'withdraw')}
                  className="btn btn-danger flex-1 text-sm"
                  data-testid={`withdraw-${fund._id}`}
                >
                  <ArrowUpCircle className="w-4 h-4" />
                  سحب
                </button>
                <button
                  onClick={() => viewHistory(fund)}
                  className="btn btn-secondary text-sm"
                  data-testid={`history-${fund._id}`}
                >
                  <History className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Fund Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div 
            className="modal-content w-full max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">إضافة صندوق جديد</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateFund} className="space-y-4">
                <div>
                  <label className="label">اسم الصندوق *</label>
                  <input
                    type="text"
                    value={fundForm.name}
                    onChange={(e) => setFundForm({...fundForm, name: e.target.value})}
                    className="input"
                    required
                    data-testid="fund-name-input"
                  />
                </div>
                
                <div>
                  <label className="label">الرصيد الابتدائي</label>
                  <input
                    type="number"
                    step="0.01"
                    value={fundForm.initial_balance}
                    onChange={(e) => setFundForm({...fundForm, initial_balance: e.target.value})}
                    className="input"
                    data-testid="fund-balance-input"
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_main"
                    checked={fundForm.is_main}
                    onChange={(e) => setFundForm({...fundForm, is_main: e.target.checked})}
                    className="w-4 h-4 text-primary-600 rounded border-slate-300"
                    data-testid="fund-main-checkbox"
                  />
                  <label htmlFor="is_main" className="text-sm text-slate-700">
                    صندوق رئيسي
                  </label>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn btn-primary flex-1" data-testid="save-fund-btn">
                    إنشاء الصندوق
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

      {/* Transaction Modal */}
      {showTransactionModal && selectedFund && (
        <div className="modal-overlay" onClick={() => setShowTransactionModal(false)}>
          <div 
            className="modal-content w-full max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  {transactionForm.transaction_type === 'deposit' ? 'إيداع في' : 'سحب من'} {selectedFund.name}
                </h2>
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleTransaction} className="space-y-4">
                <div>
                  <label className="label">المبلغ *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                    className="input"
                    required
                    data-testid="transaction-amount-input"
                  />
                </div>
                
                <div>
                  <label className="label">ملاحظات</label>
                  <textarea
                    value={transactionForm.notes}
                    onChange={(e) => setTransactionForm({...transactionForm, notes: e.target.value})}
                    className="input min-h-[80px]"
                    data-testid="transaction-notes-input"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    className={`btn flex-1 ${
                      transactionForm.transaction_type === 'deposit' ? 'btn-success' : 'btn-danger'
                    }`}
                    data-testid="confirm-transaction-btn"
                  >
                    {transactionForm.transaction_type === 'deposit' ? 'تأكيد الإيداع' : 'تأكيد السحب'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowTransactionModal(false)}
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

      {/* History Modal */}
      {showHistoryModal && selectedFund && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div 
            className="modal-content w-full max-w-2xl mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  سجل معاملات {selectedFund.name}
                </h2>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {transactions.length === 0 ? (
                <div className="empty-state py-8">
                  <History className="empty-state-icon" />
                  <p className="empty-state-title">لا توجد معاملات</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>التاريخ</th>
                        <th>النوع</th>
                        <th>المبلغ</th>
                        <th>الرصيد بعد</th>
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
                              tx.transaction_type === 'deposit' ? 'badge-success' : 'badge-danger'
                            }`}>
                              {tx.transaction_type === 'deposit' ? 'إيداع' : 'سحب'}
                            </span>
                          </td>
                          <td className={`font-medium ${
                            tx.transaction_type === 'deposit' ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {tx.transaction_type === 'deposit' ? '+' : '-'}
                            {formatCurrency(tx.amount)}
                          </td>
                          <td className="font-medium text-slate-900">
                            {formatCurrency(tx.balance_after)}
                          </td>
                          <td className="text-slate-500">{tx.notes || '-'}</td>
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

export default Funds;
