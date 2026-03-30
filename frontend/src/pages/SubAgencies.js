import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import {
  Building,
  Plus,
  X,
  Gift,
  Package,
  Search,
  Percent,
  Wallet,
  CircleDollarSign,
  ArrowUpDown,
  History,
  Truck,
  RefreshCw,
  Filter,
} from 'lucide-react';

const defaultForm = {
  name: '',
  code: '',
  initial_balance: 0,
  company_percent: 100,
};

const SubAgencies = () => {
  const location = useLocation();
  const {
    subAgencies,
    createSubAgency,
    agencyBonus,
    agencyDeductShipping,
    cycles,
    api,
  } = useData();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [selectedAgencyId, setSelectedAgencyId] = useState('');
  const [actionType, setActionType] = useState('bonus');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');

  const [deliveryAgencyId, setDeliveryAgencyId] = useState('');
  const [deliveryAmount, setDeliveryAmount] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  const [historyRows, setHistoryRows] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyType, setHistoryType] = useState('all');

  const [syncCycleId, setSyncCycleId] = useState('');
  const [syncing, setSyncing] = useState(false);

  const [formData, setFormData] = useState(defaultForm);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(Number(value) || 0);

  const totals = useMemo(() => {
    const count = subAgencies.length;
    const totalBalance = subAgencies.reduce((sum, agency) => sum + (Number(agency.balance) || 0), 0);
    const avgCompanyPercent =
      count === 0
        ? 0
        : subAgencies.reduce((sum, agency) => sum + (Number(agency.company_percent) || 0), 0) / count;

    return {
      count,
      totalBalance,
      avgCompanyPercent,
    };
  }, [subAgencies]);

  const filteredAgencies = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return subAgencies;

    return subAgencies.filter((agency) => {
      const name = (agency.name || '').toLowerCase();
      const code = (agency.code || '').toLowerCase();
      return name.includes(query) || code.includes(query);
    });
  }, [search, subAgencies]);

  const filteredHistory = useMemo(() => {
    if (historyType === 'all') return historyRows;
    return historyRows.filter((row) => row.type === historyType);
  }, [historyRows, historyType]);

  useEffect(() => {
    if (!syncCycleId && cycles?.length) {
      const activeCycle = cycles.find((cycle) => cycle.is_active);
      setSyncCycleId(String(activeCycle?.id || cycles[0].id || ''));
    }
  }, [cycles, syncCycleId]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get('action');

    if (action === 'bonus' || action === 'deduct') {
      setActionType(action === 'deduct' ? 'deduct' : 'bonus');
      setShowActionModal(true);
      if (!selectedAgencyId && subAgencies[0]?._id) {
        setSelectedAgencyId(subAgencies[0]._id);
      }
    }
  }, [location.search, selectedAgencyId, subAgencies]);

  const handleCreate = async (e) => {
    e.preventDefault();

    await createSubAgency({
      ...formData,
      initial_balance: parseFloat(formData.initial_balance) || 0,
      company_percent: parseFloat(formData.company_percent) || 100,
    });

    setShowCreateModal(false);
    setFormData(defaultForm);
  };

  const openActionModal = (agencyId, type) => {
    setSelectedAgencyId(agencyId);
    setActionType(type);
    setAmount('');
    setNotes('');
    setShowActionModal(true);
  };

  const closeActionModal = () => {
    setShowActionModal(false);
    setAmount('');
    setNotes('');
  };

  const handleAction = async (e) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);
    if (!selectedAgencyId || Number.isNaN(parsedAmount) || parsedAmount <= 0) return;

    if (actionType === 'bonus') {
      await agencyBonus(selectedAgencyId, parsedAmount, notes);
    } else {
      await agencyDeductShipping(selectedAgencyId, parsedAmount, notes);
    }

    closeActionModal();
  };

  const handleDelivery = async (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(deliveryAmount);
    if (!deliveryAgencyId || Number.isNaN(parsedAmount) || parsedAmount <= 0) return;

    try {
      await api.post(`/api/sub-agencies/${deliveryAgencyId}/deliver`, null, {
        params: { amount: parsedAmount, notes: deliveryNotes },
      });
      setShowDeliveryModal(false);
      setDeliveryAmount('');
      setDeliveryNotes('');
    } catch (error) {
      console.error('agency delivery failed', error);
    }
  };

  const handleSync = async () => {
    if (!syncCycleId) return;
    try {
      setSyncing(true);
      await api.post('/api/sub-agencies/sync-management', { cycleId: parseInt(syncCycleId, 10) });
    } catch (error) {
      console.error('sub-agencies sync failed', error);
    } finally {
      setSyncing(false);
    }
  };

  const openHistory = async (agencyId) => {
    setSelectedAgencyId(agencyId);
    setShowHistoryModal(true);
    setHistoryLoading(true);
    try {
      const response = await api.get(`/api/sub-agencies/${agencyId}/history`);
      setHistoryRows(Array.isArray(response.data) ? response.data : response.data?.rows || []);
    } catch (error) {
      console.error('sub-agency history failed', error);
      setHistoryRows([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const selectedAgency = subAgencies.find((agency) => agency._id === selectedAgencyId) || null;

  return (
    <div className="space-y-6" dir="rtl" data-testid="sub-agencies-page">
      <section className="rounded-2xl border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-white p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold text-fuchsia-700">الوكالات والمزامنة</p>
            <h1 className="text-2xl font-bold text-slate-900">الوكالات الفرعية</h1>
            <p className="mt-1 text-sm text-slate-500">إدارة الأرصدة، التسليم، والسجل التفصيلي لكل وكالة.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث بالاسم أو الكود"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-9 pl-3 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 sm:w-72"
              />
            </div>

            <button
              onClick={() => setShowDeliveryModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <Truck className="h-4 w-4" />
              تسليم
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
              data-testid="add-agency-btn"
            >
              <Plus className="h-4 w-4" />
              إضافة وكالة
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-white p-3 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">مزامنة من ملف الإدارة (الدورة)</label>
            <select
              value={syncCycleId}
              onChange={(e) => setSyncCycleId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option value="">اختر دورة</option>
              {cycles.map((cycle) => (
                <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleSync}
            disabled={syncing || !syncCycleId}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'جاري المزامنة...' : 'مزامنة من Google'}
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-2 inline-flex rounded-lg bg-primary-50 p-2 text-primary-700">
            <Building className="h-5 w-5" />
          </div>
          <p className="text-sm text-slate-500">عدد الوكالات</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totals.count}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-2 inline-flex rounded-lg bg-emerald-50 p-2 text-emerald-700">
            <Wallet className="h-5 w-5" />
          </div>
          <p className="text-sm text-slate-500">إجمالي أرصدة الوكالات</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{formatCurrency(totals.totalBalance)}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-2 xl:col-span-1">
          <div className="mb-2 inline-flex rounded-lg bg-amber-50 p-2 text-amber-700">
            <Percent className="h-5 w-5" />
          </div>
          <p className="text-sm text-slate-500">متوسط نسبة الشركة</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totals.avgCompanyPercent.toFixed(1)}%</p>
        </div>
      </section>

      {filteredAgencies.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <div className="mx-auto mb-4 inline-flex rounded-full bg-slate-100 p-4 text-slate-500">
            <Building className="h-8 w-8" />
          </div>
          <p className="text-lg font-semibold text-slate-900">لا توجد وكالات مطابقة</p>
          <p className="mt-1 text-sm text-slate-500">أنشئ وكالة جديدة أو غيّر عبارة البحث.</p>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filteredAgencies.map((agency) => {
            const balance = Number(agency.balance) || 0;
            const isNegative = balance < 0;

            return (
              <article key={agency._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <header className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary-50 p-2.5 text-primary-700">
                      <Building className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">{agency.name}</h2>
                      <p className="text-xs text-slate-500">{agency.code || 'بدون كود'}</p>
                    </div>
                  </div>

                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {Number(agency.company_percent) || 100}%
                  </span>
                </header>

                <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">الرصيد الحالي</p>
                  <p className={`mt-1 text-xl font-bold ${isNegative ? 'text-rose-700' : 'text-slate-900'}`}>
                    {formatCurrency(balance)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => openActionModal(agency._id, 'bonus')}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
                  >
                    <Gift className="h-4 w-4" />
                    مكافأة
                  </button>
                  <button
                    type="button"
                    onClick={() => openActionModal(agency._id, 'deduct')}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    <Package className="h-4 w-4" />
                    خصم شحن
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => openHistory(agency._id)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <History className="h-4 w-4" />
                    السجل
                  </button>
                  <Link
                    to={`/sub-agencies/${agency._id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Building className="h-4 w-4" />
                    ملف الوكالة
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 px-4" onClick={() => setShowCreateModal(false)}>
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <h2 className="text-lg font-bold text-slate-900">إضافة وكالة فرعية</h2>
              <button onClick={() => setShowCreateModal(false)} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">اسم الوكالة *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    required
                    data-testid="agency-name-input"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">الكود</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">نسبة الشركة %</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.company_percent}
                    onChange={(e) => setFormData({ ...formData, company_percent: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">الرصيد الابتدائي</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.initial_balance}
                    onChange={(e) => setFormData({ ...formData, initial_balance: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
                  data-testid="save-agency-btn"
                >
                  <CircleDollarSign className="h-4 w-4" />
                  إضافة الوكالة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeliveryModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 px-4" onClick={() => setShowDeliveryModal(false)}>
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <h2 className="text-lg font-bold text-slate-900">تسليم لوكالة فرعية</h2>
              <button onClick={() => setShowDeliveryModal(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleDelivery} className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">الوكالة</label>
                <select value={deliveryAgencyId} onChange={(e) => setDeliveryAgencyId(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" required>
                  <option value="">اختر وكالة</option>
                  {subAgencies.map((agency) => (
                    <option key={agency._id} value={agency._id}>{agency.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">المبلغ</label>
                <input type="number" min="0" step="0.01" value={deliveryAmount} onChange={(e) => setDeliveryAmount(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" required />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">ملاحظات</label>
                <textarea rows={3} value={deliveryNotes} onChange={(e) => setDeliveryNotes(e.target.value)} className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              </div>
              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setShowDeliveryModal(false)} className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">إلغاء</button>
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">
                  <Truck className="h-4 w-4" />
                  تنفيذ التسليم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showActionModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 px-4" onClick={closeActionModal}>
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{actionType === 'bonus' ? 'تسجيل مكافأة وكالة' : 'تسجيل خصم شحن'}</h2>
                <p className="mt-1 text-xs text-slate-500">نفس سلوك الإجراءات السريعة (صادر/وارد) بشكل مباشر من صفحة الوكالات.</p>
              </div>
              <button onClick={closeActionModal} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAction} className="space-y-4 p-5">
              <div className="rounded-xl bg-slate-50 p-1">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => setActionType('bonus')}
                    className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      actionType === 'bonus' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600 hover:bg-white/60'
                    }`}
                  >
                    <Gift className="h-4 w-4" />
                    مكافأة
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType('deduct')}
                    className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      actionType === 'deduct' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:bg-white/60'
                    }`}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    خصم شحن
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">الوكالة</label>
                <select
                  value={selectedAgencyId}
                  onChange={(e) => setSelectedAgencyId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  required
                >
                  <option value="">اختر وكالة</option>
                  {subAgencies.map((agency) => (
                    <option key={agency._id} value={agency._id}>
                      {agency.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedAgency && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  الرصيد الحالي: <span className="font-semibold text-slate-900">{formatCurrency(selectedAgency.balance)}</span>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">المبلغ (USD) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  required
                  data-testid="action-amount-input"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">ملاحظات</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </div>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeActionModal}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${
                    actionType === 'bonus' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                  data-testid="confirm-action-btn"
                >
                  {actionType === 'bonus' ? <Gift className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                  {actionType === 'bonus' ? 'تسجيل المكافأة' : 'تسجيل الخصم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showHistoryModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 px-4" onClick={() => setShowHistoryModal(false)}>
          <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">سجل الوكالة: {selectedAgency?.name || '—'}</h2>
                <p className="mt-1 text-xs text-slate-500">عمليات مكافأة، خصم، وتسليم.</p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600"><Filter className="h-3 w-3" /> نوع العملية</span>
                {['all', 'bonus', 'deduct', 'delivery'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setHistoryType(type)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${historyType === type ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                  >
                    {type === 'all' ? 'الكل' : type === 'bonus' ? 'مكافأة' : type === 'deduct' ? 'خصم' : 'تسليم'}
                  </button>
                ))}
              </div>

              <div className="max-h-[55vh] overflow-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-sm text-right">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-3 py-2">التاريخ</th>
                      <th className="px-3 py-2">النوع</th>
                      <th className="px-3 py-2">المبلغ</th>
                      <th className="px-3 py-2">ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyLoading ? (
                      <tr><td colSpan={4} className="px-3 py-8 text-center text-slate-500">جاري تحميل السجل...</td></tr>
                    ) : filteredHistory.length === 0 ? (
                      <tr><td colSpan={4} className="px-3 py-8 text-center text-slate-500">لا يوجد بيانات</td></tr>
                    ) : (
                      filteredHistory.map((row) => (
                        <tr key={row.id || `${row.type}-${row.created_at}`} className="border-t border-slate-100">
                          <td className="px-3 py-2">{row.created_at ? new Date(row.created_at).toLocaleString('ar-SA') : '-'}</td>
                          <td className="px-3 py-2">{row.type === 'bonus' ? 'مكافأة' : row.type === 'deduct' ? 'خصم' : row.type === 'delivery' ? 'تسليم' : row.type || '-'}</td>
                          <td className="px-3 py-2 font-semibold">{formatCurrency(row.amount)}</td>
                          <td className="px-3 py-2 text-slate-500">{row.notes || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubAgencies;
