import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Truck, Plus, X, ArrowUpCircle, Search, Filter, ArrowDownUp } from 'lucide-react';

const TransferCompanies = () => {
  const [searchParams] = useSearchParams();
  const { transferCompanies, createTransferCompany, companyDisburse } = useData();
  const [showModal, setShowModal] = useState(false);
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [amount, setAmount] = useState('');
  const [recordAsDebt, setRecordAsDebt] = useState(false);
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('balance_desc');

  const [formData, setFormData] = useState({ name: '', code: '', initial_balance: 0 });

  const formatCurrency = (value) => new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value || 0);

  const filteredCompanies = useMemo(() => {
    const q = search.trim().toLowerCase();
    const out = transferCompanies.filter((company) => {
      const bal = Number(company.balance || 0);
      const matchesSearch = !q || (company.name || '').toLowerCase().includes(q) || (company.code || '').toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'positive'
            ? bal > 0
            : statusFilter === 'negative'
              ? bal < 0
              : bal === 0;
      return matchesSearch && matchesStatus;
    });

    out.sort((a, b) => {
      if (sortBy === 'name') return String(a.name || '').localeCompare(String(b.name || ''), 'ar');
      if (sortBy === 'balance_asc') return (a.balance || 0) - (b.balance || 0);
      return (b.balance || 0) - (a.balance || 0);
    });

    return out;
  }, [transferCompanies, search, statusFilter, sortBy]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await createTransferCompany({ ...formData, initial_balance: parseFloat(formData.initial_balance) || 0 });
    setShowModal(false);
    setFormData({ name: '', code: '', initial_balance: 0 });
  };

  const handleDisburse = async (e) => {
    e.preventDefault();
    await companyDisburse(selectedCompany._id, parseFloat(amount), recordAsDebt, notes);
    setShowDisburseModal(false);
    setAmount('');
    setRecordAsDebt(false);
    setNotes('');
  };

  useEffect(() => {
    if (searchParams.get('action') === 'disburse' && transferCompanies.length > 0) {
      setSelectedCompany(transferCompanies[0]);
      setShowDisburseModal(true);
    }
  }, [searchParams, transferCompanies]);

  return (
    <div className="space-y-6" data-testid="transfer-companies-page" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">شركات التحويل</h1>
          <p className="text-slate-500 mt-1">إدارة الشركات، الصرف، والأرصدة.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary" data-testid="add-company-btn">
          <Plus className="w-4 h-4" />
          إضافة شركة
        </button>
      </div>

      <section className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 items-center">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="input pr-9" placeholder="بحث بالاسم أو الكود" />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 rounded-xl border border-slate-200 px-3 py-2">
            <Filter className="w-3 h-3" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-transparent">
              <option value="all">كل الأرصدة</option>
              <option value="positive">رصيد موجب</option>
              <option value="negative">رصيد سالب</option>
              <option value="zero">رصيد صفر</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 rounded-xl border border-slate-200 px-3 py-2">
            <ArrowDownUp className="w-3 h-3" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent">
              <option value="balance_desc">الرصيد الأعلى</option>
              <option value="balance_asc">الرصيد الأقل</option>
              <option value="name">الاسم</option>
            </select>
          </div>
        </div>
      </section>

      {filteredCompanies.length === 0 ? (
        <div className="card"><div className="empty-state py-12"><Truck className="empty-state-icon" /><p className="empty-state-title">لا توجد شركات مطابقة</p></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((company) => (
            <div key={company._id} className="card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center"><Truck className="w-6 h-6 text-amber-600" /></div>
                <div>
                  <h3 className="font-semibold text-slate-900">{company.name}</h3>
                  {company.code && <p className="text-sm text-slate-500">{company.code}</p>}
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm text-slate-500">الرصيد</p>
                <p className={`text-2xl font-bold ${(company.balance || 0) < 0 ? 'text-rose-600' : 'text-slate-900'}`}>{formatCurrency(company.balance)}</p>
              </div>
              <button onClick={() => { setSelectedCompany(company); setShowDisburseModal(true); }} className="btn btn-danger w-full">
                <ArrowUpCircle className="w-4 h-4" />
                صرف
              </button>
              <Link to={`/transfer-companies/${company._id}`} className="btn btn-secondary w-full mt-2">
                <Truck className="w-4 h-4" />
                ملف الشركة
              </Link>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">إضافة شركة تحويل</h2>
                <button onClick={() => setShowModal(false)} className="p-2 text-slate-400"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div><label className="label">اسم الشركة *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" required /></div>
                <div><label className="label">الكود</label><input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="input" /></div>
                <div><label className="label">الرصيد الابتدائي</label><input type="number" step="0.01" value={formData.initial_balance} onChange={(e) => setFormData({ ...formData, initial_balance: e.target.value })} className="input" /></div>
                <div className="flex gap-3 pt-4"><button type="submit" className="btn btn-primary flex-1">إضافة</button><button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">إلغاء</button></div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDisburseModal && selectedCompany && (
        <div className="modal-overlay" onClick={() => setShowDisburseModal(false)}>
          <div className="modal-content w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">صرف لشركة {selectedCompany.name}</h2>
                <button onClick={() => setShowDisburseModal(false)} className="p-2 text-slate-400"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleDisburse} className="space-y-4">
                <div><label className="label">المبلغ *</label><input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="input" required /></div>
                <div className="flex items-center gap-3"><input type="checkbox" id="record_debt" checked={recordAsDebt} onChange={(e) => setRecordAsDebt(e.target.checked)} className="w-4 h-4 text-primary-600 rounded" /><label htmlFor="record_debt" className="text-sm">تسجيل كدين علينا</label></div>
                <div><label className="label">ملاحظات</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input min-h-[80px]" /></div>
                <div className="flex gap-3 pt-4"><button type="submit" className="btn btn-danger flex-1">تنفيذ الصرف</button><button type="button" onClick={() => setShowDisburseModal(false)} className="btn btn-secondary">إلغاء</button></div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferCompanies;
