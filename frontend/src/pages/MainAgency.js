import React from 'react';
import { useData } from '../context/DataContext';
import { Building2, Wallet, TrendingUp, TrendingDown, Users, Package } from 'lucide-react';

const MainAgency = () => {
  const { dashboardSummary, funds, subAgencies } = useData();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value || 0);
  };

  const mainFund = funds.find(f => f.is_main);
  const totalAgenciesBalance = subAgencies.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="space-y-6" data-testid="main-agency-page">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">الوكالة الرئيسية</h1>
        <p className="text-slate-500 mt-1">نظرة شاملة على الوكالة الرئيسية</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">الوكالة الرئيسية</p>
              <p className="text-lg font-bold text-slate-900">LorkERP</p>
            </div>
          </div>
        </div>
        
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <Wallet className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">رصيد الصندوق الرئيسي</p>
              <p className="text-xl font-bold text-emerald-600">{formatCurrency(mainFund?.balance || 0)}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center">
              <Users className="w-7 h-7 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">الوكالات الفرعية</p>
              <p className="text-xl font-bold text-slate-900">{subAgencies.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">إجمالي أرصدة الوكالات</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(totalAgenciesBalance)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">الملخص المالي</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span className="text-slate-600">صافي الربح</span>
              </div>
              <span className="font-bold text-emerald-600">{formatCurrency(dashboardSummary?.net_profit || 0)}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <span className="text-slate-600">إجمالي المصاريف</span>
              </div>
              <span className="font-bold text-red-600">{formatCurrency(dashboardSummary?.total_expenses || 0)}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="text-slate-600">رصيد الشحن</span>
              </div>
              <span className="font-bold text-slate-900">{dashboardSummary?.shipping_quantity?.toLocaleString('ar-SA') || 0}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">الوكالات الفرعية</h3>
          </div>
          <div className="p-4">
            {subAgencies.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-2" />
                <p>لا توجد وكالات فرعية</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subAgencies.slice(0, 5).map(agency => (
                  <div key={agency._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-900">{agency.name}</span>
                    <span className="font-bold">{formatCurrency(agency.balance)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainAgency;
