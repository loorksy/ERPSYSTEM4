import React, { useCallback, useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  X,
  History,
  Search,
  Landmark,
  Pencil,
  Filter,
} from 'lucide-react';

const Funds = () => {
  const [searchParams] = useSearchParams();
  const { funds, activeCycle, createFund, fundTransaction, fetchFunds, api } = useData();
  const [showModal, setShowModal] = useState(false);
  const [showMainEditModal, setShowMainEditModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedFund, setSelectedFund] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [fundForm, setFundForm] = useState({
    name: '',
    is_main: false,
    initial_balance: 0,
  });

  const [mainFundForm, setMainFundForm] = useState({
    name: '',
    code: '',
  });

  const [transactionForm, setTransactionForm] = useState({
    amount: '',
    transaction_type: 'deposit',
    notes: '',
  });

  const formatCurrency = (value) =>
    new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value || 0);

  const totals = useMemo(() => {
    const all = funds.reduce((sum, fund) => sum + (Number(fund.balance) || 0), 0);
    const nonMain = funds.filter((fund) => !fund.is_main).reduce((sum, fund) => sum + (Number(fund.balance) || 0), 0);
    return {
      all,
      nonMain,
      count: funds.length,
    };
  }, [funds]);

  const mainFund = useMemo(() => funds.find((fund) => fund.is_main) || null, [funds]);

  const filteredFunds = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return funds;
    return funds.filter((fund) => (fund.name || '').toLowerCase().includes(q) || (fund.code || '').toLowerCase().includes(q));
  }, [funds, search]);

  const filteredTransactions = useMemo(() => {
    if (historyFilter === 'all') return transactions;
    return transactions.filter((tx) => tx.transaction_type === historyFilter);
  }, [transactions, historyFilter]);

  const handleCreateFund = async (e) => {
    e.preventDefault();
    await createFund({
      ...fundForm,
      initial_balance: parseFloat(fundForm.initial_balance) || 0,
    });
    setShowModal(false);
    setFundForm({ name: '', is_main: false, initial_balance: 0 });
  };

  const handleEditMainFund = async (e) => {
    e.preventDefault();
    if (!mainFund) return;
    try {
      await api.put(`/api/funds/${mainFund._id}`, {
        name: mainFundForm.name,
        code: mainFundForm.code,
      });
      await fetchFunds();
      setShowMainEditModal(false);
    } catch (error) {
      console.error('main fund update failed', error);
    }
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    await fundTransaction(selectedFund._id, {
      ...transactionForm,
      amount: parseFloat(transactionForm.amount),
    });
    setShowTransactionModal(false);
    setTransactionForm({ amount: '', transaction_type: 'deposit', notes: '' });
    setSelectedFund(null);
  };

  const openTransactionModal = useCallback((fund, type) => {
    setSelectedFund(fund);
    setTransactionForm((prev) => ({ ...prev, transaction_type: type }));
    setShowTransactionModal(true);
  }, []);

  React.useEffect(() => {
    if (searchParams.get('action') !== 'transfer' || funds.length === 0) return;
    const targetFund = funds.find((fund) => !fund.is_main) || funds[0];
    if (targetFund) openTransactionModal(targetFund, 'deposit');
  }, [searchParams, funds, openTransactionModal]);

  const openMainEdit = () => {
    if (!mainFund) return;
    setMainFundForm({ name: mainFund.name || '', code: mainFund.code || '' });
    setShowMainEditModal(true);
  };

  const viewHistory = async (fund) => {
    try {
      const response = await api.get(`/api/funds/${fund._id}/transactions`);
      setTransactions(Array.isArray(response.data) ? response.data : response.data?.rows || []);
      setSelectedFund(fund);
      setHistoryFilter('all');
      setShowHistoryModal(true);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  return (
    <div className="space-y-6" data-testid="funds-page" dir="rtl">
      <section className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-teal-700">أرصدة وصناديق</p>
            <h1 className="text-2xl font-bold text-slate-900">الصناديق</h1>
            <p className="text-slate-500 mt-1">إدارة الصندوق الرئيسي والصناديق الفرعية والسجل المحاسبي.</p>
          </div>

          {activeCycle && (
            <div className="flex flex-wrap gap-2">
              {mainFund && (
                <button
                  onClick={openMainEdit}
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-900 hover:bg-amber-100"
                >
                  <Pencil className="w-4 h-4" />
                  تعديل الصندوق الرئيسي
                </button>
              )}
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
                data-testid="add-fund-btn"
              >
                <Plus className="w-4 h-4" />
                إضافة صندوق جديد
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 relative max-w-md">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث باسم الصندوق أو الكود"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-9 pl-3 text-sm text-slate-700"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">عدد الصناديق</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totals.count}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">إجمالي الأرصدة</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(totals.all)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">أرصدة الصناديق الفرعية</p>
          <p className="mt-1 text-2xl font-bold text-teal-700">{formatCurrency(totals.nonMain)}</p>
        </div>
      </section>

      {!activeCycle ? (
        <div className="card">
          <div className="empty-state py-12">
            <Wallet className="empty-state-icon" />
            <p className="empty-state-title">لا توجد دورة مالية نشطة</p>
            <p className="empty-state-text">أنشئ دورة مالية من لوحة التحكم للبدء</p>
          </div>
        </div>
      ) : filteredFunds.length === 0 ? (
        <div className="card">
          <div className="empty-state py-12">
            <Wallet className="empty-state-icon" />
            <p className="empty-state-title">لا توجد صناديق مطابقة</p>
            <p className="empty-state-text">غيّر عبارة البحث أو أضف صندوقًا جديدًا</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFunds.map((fund) => (
            <div key={fund._id} className={`card p-5 ${fund.is_main ? 'ring-2 ring-primary-500' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${fund.is_main ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-600'}`}>
                    {fund.is_main ? <Landmark className="w-6 h-6" /> : <Wallet className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{fund.name}</h3>
                    {fund.is_main && <span className="badge badge-info">رئيسي</span>}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-slate-500">الرصيد الحالي</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(fund.balance)}</p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => openTransactionModal(fund, 'deposit')} className="btn btn-success flex-1 text-sm" data-testid={`deposit-${fund._id}`}>
                  <ArrowDownCircle className="w-4 h-4" />
                  إيداع
                </button>
                <button onClick={() => openTransactionModal(fund, 'withdraw')} className="btn btn-danger flex-1 text-sm" data-testid={`withdraw-${fund._id}`}>
                  <ArrowUpCircle className="w-4 h-4" />
                  سحب
                </button>
                <button onClick={() => viewHistory(fund)} className="btn btn-secondary text-sm" data-testid={`history-${fund._id}`}>
                  <History className="w-4 h-4" />
                </button>
              </div>
              <Link to={`/funds/${fund._id}`} className="btn btn-secondary w-full mt-2 text-sm">
                <Wallet className="w-4 h-4" />
                ملف الصندوق
              </Link>
            </div>
          ))}
        </div>
      )}

      {showMainEditModal && mainFund && (
        <div className="modal-overlay" onClick={() => setShowMainEditModal(false)}>
          <div className="modal-content w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">تعديل الصندوق الرئيسي</h2>
                <button onClick={() => setShowMainEditModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditMainFund} className="space-y-4">
                <div>
                  <label className="label">اسم الصندوق</label>
                  <input type="text" value={mainFundForm.name} onChange={(e) => setMainFundForm((p) => ({ ...p, name: e.target.value }))} className="input" required />
                </div>
                <div>
                  <label className="label">رقم/كود الصندوق</label>
                  <input type="text" value={mainFundForm.code} onChange={(e) => setMainFundForm((p) => ({ ...p, code: e.target.value }))} className="input" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn btn-primary flex-1">حفظ</button>
                  <button type="button" onClick={() => setShowMainEditModal(false)} className="btn btn-secondary">إلغاء</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">إضافة صندوق جديد</h2>
                <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateFund} className="space-y-4">
                <div>
                  <label className="label">اسم الصندوق *</label>
                  <input type="text" value={fundForm.name} onChange={(e) => setFundForm({ ...fundForm, name: e.target.value })} className="input" required data-testid="fund-name-input" />
                </div>

                <div>
                  <label className="label">الرصيد الابتدائي</label>
                  <input type="number" step="0.01" value={fundForm.initial_balance} onChange={(e) => setFundForm({ ...fundForm, initial_balance: e.target.value })} className="input" data-testid="fund-balance-input" />
                </div>

                <div className="flex items-center gap-3">
                  <input type="checkbox" id="is_main" checked={fundForm.is_main} onChange={(e) => setFundForm({ ...fundForm, is_main: e.target.checked })} className="w-4 h-4 text-primary-600 rounded border-slate-300" data-testid="fund-main-checkbox" />
                  <label htmlFor="is_main" className="text-sm text-slate-700">صندوق رئيسي</label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn btn-primary flex-1" data-testid="save-fund-btn">إنشاء الصندوق</button>
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">إلغاء</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showTransactionModal && selectedFund && (
        <div className="modal-overlay" onClick={() => setShowTransactionModal(false)}>
          <div className="modal-content w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">{transactionForm.transaction_type === 'deposit' ? 'إيداع في' : 'سحب من'} {selectedFund.name}</h2>
                <button onClick={() => setShowTransactionModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleTransaction} className="space-y-4">
                <div>
                  <label className="label">المبلغ *</label>
                  <input type="number" step="0.01" value={transactionForm.amount} onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })} className="input" required data-testid="transaction-amount-input" />
                </div>

                <div>
                  <label className="label">ملاحظات</label>
                  <textarea value={transactionForm.notes} onChange={(e) => setTransactionForm({ ...transactionForm, notes: e.target.value })} className="input min-h-[80px]" data-testid="transaction-notes-input" />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className={`btn flex-1 ${transactionForm.transaction_type === 'deposit' ? 'btn-success' : 'btn-danger'}`} data-testid="confirm-transaction-btn">
                    {transactionForm.transaction_type === 'deposit' ? 'تأكيد الإيداع' : 'تأكيد السحب'}
                  </button>
                  <button type="button" onClick={() => setShowTransactionModal(false)} className="btn btn-secondary">إلغاء</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showHistoryModal && selectedFund && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="modal-content w-full max-w-3xl mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">سجل معاملات {selectedFund.name}</h2>
                <button onClick={() => setShowHistoryModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600"><Filter className="w-3 h-3" />تصفية</span>
                {[
                  { key: 'all', label: 'الكل' },
                  { key: 'deposit', label: 'إيداع' },
                  { key: 'withdraw', label: 'سحب' },
                ].map((f) => (
                  <button key={f.key} onClick={() => setHistoryFilter(f.key)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${historyFilter === f.key ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    {f.label}
                  </button>
                ))}
              </div>

              {filteredTransactions.length === 0 ? (
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
                      {filteredTransactions.map((tx) => (
                        <tr key={tx._id || `${tx.created_at}-${tx.amount}`}>
                          <td className="text-slate-600">{new Date(tx.created_at).toLocaleDateString('ar-SA')}</td>
                          <td>
                            <span className={`badge ${tx.transaction_type === 'deposit' ? 'badge-success' : 'badge-danger'}`}>
                              {tx.transaction_type === 'deposit' ? 'إيداع' : 'سحب'}
                            </span>
                          </td>
                          <td className={`font-medium ${tx.transaction_type === 'deposit' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {tx.transaction_type === 'deposit' ? '+' : '-'}
                            {formatCurrency(tx.amount)}
                          </td>
                          <td className="font-medium text-slate-900">{formatCurrency(tx.balance_after)}</td>
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
