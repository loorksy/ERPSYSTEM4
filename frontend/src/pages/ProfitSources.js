import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Coins, TrendingUp, Package, CheckCircle, DollarSign } from 'lucide-react';

const ProfitSources = () => {
  const { activeCycle, api } = useData();
  const [profits, setProfits] = useState([]);
  const [summary, setSummary] = useState({ total: 0, by_type: {} });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [profitsRes, summaryRes] = await Promise.all([
        api.get('/api/profit-sources'),
        api.get('/api/profit-sources/summary')
      ]);
      setProfits(profitsRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error fetching profit sources:', error);
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
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value || 0);
  };

  const getSourceLabel = (type) => {
    switch (type) {
      case 'shipping': return 'أرباح الشحن';
      case 'fx_spread': return 'فرق التصريف';
      case 'approval_commission': return 'عمولة الاعتمادات';
      case 'brokerage': return 'وساطة إدارية';
      default: return type;
    }
  };

  const getSourceIcon = (type) => {
    switch (type) {
      case 'shipping': return Package;
      case 'fx_spread': return TrendingUp;
      case 'approval_commission': return CheckCircle;
      default: return DollarSign;
    }
  };

  const profitTypes = Object.entries(summary.by_type || {}).map(([type, amount]) => ({
    type,
    label: getSourceLabel(type),
    amount,
    icon: getSourceIcon(type)
  }));

  return (
    <div className="space-y-6" data-testid="profit-sources-page">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">مصادر الربح</h1>
        <p className="text-slate-500 mt-1">تتبع مصادر الأرباح المختلفة</p>
      </div>

      {!activeCycle ? (
        <div className="card">
          <div className="empty-state py-12">
            <Coins className="empty-state-icon" />
            <p className="empty-state-title">لا توجد دورة مالية نشطة</p>
          </div>
        </div>
      ) : (
        <>
          {/* Total Profit */}
          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <Coins className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">إجمالي الأرباح</p>
                <p className="text-4xl font-bold text-emerald-600">{formatCurrency(summary.total)}</p>
              </div>
            </div>
          </div>

          {/* Profit by Type */}
          {profitTypes.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {profitTypes.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="card p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <Icon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <span className="text-slate-600">{item.label}</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(item.amount)}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recent Profits */}
          {profits.length === 0 ? (
            <div className="card">
              <div className="empty-state py-12">
                <Coins className="empty-state-icon" />
                <p className="empty-state-title">لا توجد أرباح مسجلة</p>
                <p className="empty-state-text">ستظهر الأرباح تلقائياً من العمليات</p>
              </div>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900">آخر الأرباح</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>التاريخ</th>
                      <th>المصدر</th>
                      <th>المبلغ</th>
                      <th>ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profits.slice(0, 20).map(profit => (
                      <tr key={profit._id}>
                        <td className="text-slate-600">{new Date(profit.created_at).toLocaleDateString('ar-SA')}</td>
                        <td><span className="badge badge-success">{getSourceLabel(profit.source_type)}</span></td>
                        <td className="font-bold text-emerald-600">+{formatCurrency(profit.amount)}</td>
                        <td className="text-slate-500">{profit.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProfitSources;
