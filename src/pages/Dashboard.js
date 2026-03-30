import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Receipt, 
  HandCoins, 
  Package, 
  Clock,
  DollarSign,
  Plus,
  ChevronDown,
  Calendar,
  FileText,
  RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const { 
    dashboardSummary, 
    activeCycle, 
    cycles, 
    funds,
    createCycle,
    activateCycle,
    refreshAll,
    loading 
  } = useData();
  
  const [showCycleModal, setShowCycleModal] = useState(false);
  const [newCycleName, setNewCycleName] = useState('');

  const handleCreateCycle = async (e) => {
    e.preventDefault();
    if (!newCycleName.trim()) return;
    
    await createCycle({ name: newCycleName });
    setNewCycleName('');
    setShowCycleModal(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value || 0);
  };

  const mainFund = funds.find(f => f.is_main);

  const stats = [
    {
      label: 'الربح الصافي',
      value: dashboardSummary?.net_profit || 0,
      icon: TrendingUp,
      color: 'emerald',
      path: '/profit-sources'
    },
    {
      label: 'المصاريف',
      value: dashboardSummary?.total_expenses || 0,
      icon: TrendingDown,
      color: 'red',
      path: '/expenses-manual'
    },
    {
      label: 'إجمالي الديون',
      value: dashboardSummary?.payable_debts || 0,
      icon: Receipt,
      color: 'amber',
      path: '/debts'
    },
    {
      label: 'ديين لنا',
      value: dashboardSummary?.receivable_debts || 0,
      icon: HandCoins,
      color: 'blue',
      path: '/receivables-to-us'
    },
    {
      label: 'مطلوب دفع',
      value: dashboardSummary?.payment_dues || 0,
      icon: Clock,
      color: 'purple',
      path: '/payment-due'
    },
    {
      label: 'رصيد الصندوق الرئيسي',
      value: mainFund?.balance || 0,
      icon: Wallet,
      color: 'primary',
      path: '/funds'
    },
    {
      label: 'رصيد الشحن',
      value: dashboardSummary?.shipping_quantity || 0,
      icon: Package,
      color: 'slate',
      path: '/shipping',
      isQuantity: true
    }
  ];

  const colorClasses = {
    emerald: 'bg-emerald-100 text-emerald-600',
    red: 'bg-red-100 text-red-600',
    amber: 'bg-amber-100 text-amber-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    primary: 'bg-primary-100 text-primary-600',
    slate: 'bg-slate-100 text-slate-600'
  };

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">لوحة التحكم</h1>
          <p className="text-slate-500 mt-1">مرحباً بك في نظام LorkERP</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={refreshAll}
            disabled={loading}
            className="btn btn-secondary"
            data-testid="refresh-data-btn"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
          
          <button 
            className="btn btn-primary"
            data-testid="generate-report-btn"
          >
            <FileText className="w-4 h-4" />
            تقرير شامل PDF
          </button>
        </div>
      </div>

      {/* Cycle Selection */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">الدورة المالية النشطة</p>
              <p className="font-semibold text-slate-900">
                {activeCycle?.name || 'لا توجد دورة نشطة'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {cycles.length > 0 && (
              <select
                value={activeCycle?._id || ''}
                onChange={(e) => activateCycle(e.target.value)}
                className="input py-2 w-40"
                data-testid="cycle-selector"
              >
                {cycles.map(cycle => (
                  <option key={cycle._id} value={cycle._id}>
                    {cycle.name}
                  </option>
                ))}
              </select>
            )}
            
            <button
              onClick={() => setShowCycleModal(true)}
              className="btn btn-primary"
              data-testid="create-cycle-btn"
            >
              <Plus className="w-4 h-4" />
              دورة جديدة
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <a
            key={idx}
            href={stat.path}
            className="stat-card group"
            data-testid={`stat-card-${idx}`}
          >
            <div className="flex items-start justify-between">
              <div className={`stat-icon ${colorClasses[stat.color]}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <ChevronDown className="w-5 h-5 text-slate-300 rotate-[-90deg] group-hover:text-slate-500 transition-colors" />
            </div>
            <div className="stat-value">
              {stat.isQuantity 
                ? stat.value.toLocaleString('ar-SA')
                : formatCurrency(stat.value)
              }
            </div>
            <div className="stat-label">{stat.label}</div>
          </a>
        ))}
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funds Overview */}
        <div className="card">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">الصناديق</h3>
          </div>
          <div className="p-4">
            {funds.length === 0 ? (
              <div className="empty-state py-8">
                <Wallet className="empty-state-icon" />
                <p className="empty-state-title">لا توجد صناديق</p>
                <p className="empty-state-text">أنشئ صندوقاً جديداً للبدء</p>
              </div>
            ) : (
              <div className="space-y-3">
                {funds.slice(0, 5).map(fund => (
                  <div 
                    key={fund._id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Wallet className={`w-5 h-5 ${fund.is_main ? 'text-primary-600' : 'text-slate-400'}`} />
                      <div>
                        <p className="font-medium text-slate-900">{fund.name}</p>
                        {fund.is_main && (
                          <span className="text-xs text-primary-600">رئيسي</span>
                        )}
                      </div>
                    </div>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(fund.balance)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="card">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">النشاط الأخير</h3>
          </div>
          <div className="p-4">
            <div className="empty-state py-8">
              <Clock className="empty-state-icon" />
              <p className="empty-state-title">لا يوجد نشاط</p>
              <p className="empty-state-text">ستظهر هنا آخر العمليات</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Cycle Modal */}
      {showCycleModal && (
        <div className="modal-overlay" onClick={() => setShowCycleModal(false)}>
          <div 
            className="modal-content w-full max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">إنشاء دورة مالية جديدة</h2>
              
              <form onSubmit={handleCreateCycle}>
                <div className="mb-4">
                  <label className="label">اسم الدورة</label>
                  <input
                    type="text"
                    value={newCycleName}
                    onChange={(e) => setNewCycleName(e.target.value)}
                    className="input"
                    placeholder="مثال: دورة يناير 2024"
                    required
                    data-testid="cycle-name-input"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button type="submit" className="btn btn-primary flex-1" data-testid="save-cycle-btn">
                    إنشاء الدورة
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowCycleModal(false)}
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

export default Dashboard;
