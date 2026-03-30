import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, Building, Truck, Wallet, Receipt, Clock,
  ArrowUpCircle, ArrowDownCircle, Package, RefreshCw, Calendar
} from 'lucide-react';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const Analytics = () => {
  const { api, activeCycle, dashboardSummary } = useData();
  const [overview, setOverview] = useState(null);
  const [profitExpenseTrend, setProfitExpenseTrend] = useState([]);
  const [profitBySource, setProfitBySource] = useState([]);
  const [expenseByCategory, setExpenseByCategory] = useState([]);
  const [shippingTrend, setShippingTrend] = useState([]);
  const [debtSummary, setDebtSummary] = useState({ payable: [], receivable: [] });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [
        overviewRes,
        trendRes,
        profitSourceRes,
        expenseCatRes,
        shippingRes,
        debtRes,
        recentRes
      ] = await Promise.all([
        api.get('/api/analytics/overview'),
        api.get(`/api/analytics/profit-expense-trend?days=${period}`),
        api.get('/api/analytics/profit-by-source'),
        api.get('/api/analytics/expense-by-category'),
        api.get(`/api/analytics/shipping-trend?days=${period}`),
        api.get('/api/analytics/debt-summary'),
        api.get('/api/analytics/recent-transactions?limit=10')
      ]);

      setOverview(overviewRes.data);
      setProfitExpenseTrend(trendRes.data.data);
      setProfitBySource(profitSourceRes.data.data);
      setExpenseByCategory(expenseCatRes.data.data);
      setShippingTrend(shippingRes.data.data);
      setDebtSummary(debtRes.data);
      setRecentTransactions(recentRes.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value || 0);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-600 mb-2">{formatDate(label)}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-600">{entry.name}:</span>
              <span className="font-medium">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="spinner w-10 h-10 mx-auto mb-4" />
          <p className="text-slate-500">جاري تحميل التحليلات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="analytics-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">التحليلات والرسوم البيانية</h1>
          <p className="text-slate-500 mt-1">نظرة شاملة على الأداء المالي</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            className="input w-40"
            data-testid="period-select"
          >
            <option value={7}>آخر 7 أيام</option>
            <option value={30}>آخر 30 يوم</option>
            <option value={90}>آخر 90 يوم</option>
          </select>
          
          <button onClick={fetchAnalytics} className="btn btn-secondary" data-testid="refresh-analytics-btn">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="card p-4 text-center">
          <Wallet className="w-6 h-6 text-primary-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(overview?.total_funds)}</p>
          <p className="text-xs text-slate-500">إجمالي الصناديق</p>
        </div>
        <div className="card p-4 text-center">
          <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900">{overview?.clients_count || 0}</p>
          <p className="text-xs text-slate-500">العملاء</p>
        </div>
        <div className="card p-4 text-center">
          <Building className="w-6 h-6 text-amber-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900">{overview?.agencies_count || 0}</p>
          <p className="text-xs text-slate-500">الوكالات</p>
        </div>
        <div className="card p-4 text-center">
          <Truck className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900">{overview?.companies_count || 0}</p>
          <p className="text-xs text-slate-500">شركات التحويل</p>
        </div>
        <div className="card p-4 text-center">
          <Users className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900">{overview?.members_count || 0}</p>
          <p className="text-xs text-slate-500">المستخدمين</p>
        </div>
        <div className="card p-4 text-center">
          <Receipt className="w-6 h-6 text-red-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900">{overview?.active_debts || 0}</p>
          <p className="text-xs text-slate-500">ديون نشطة</p>
        </div>
        <div className="card p-4 text-center">
          <Clock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900">{overview?.pending_payments || 0}</p>
          <p className="text-xs text-slate-500">دفعات معلقة</p>
        </div>
      </div>

      {/* Main Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8" />
            <div>
              <p className="text-emerald-100 text-sm">صافي الربح</p>
              <p className="text-3xl font-bold">{formatCurrency(dashboardSummary?.net_profit)}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-5 bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center gap-3 mb-4">
            <TrendingDown className="w-8 h-8" />
            <div>
              <p className="text-red-100 text-sm">إجمالي المصاريف</p>
              <p className="text-3xl font-bold">{formatCurrency(dashboardSummary?.total_expenses)}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-5 bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-8 h-8" />
            <div>
              <p className="text-primary-100 text-sm">رصيد الشحن</p>
              <p className="text-3xl font-bold">{dashboardSummary?.shipping_quantity?.toLocaleString('ar-SA') || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit vs Expense Trend */}
        <div className="card">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">اتجاه الأرباح والمصاريف</h3>
          </div>
          <div className="p-4">
            {profitExpenseTrend.length === 0 ? (
              <div className="empty-state py-8">
                <TrendingUp className="empty-state-icon" />
                <p className="empty-state-title">لا توجد بيانات</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={profitExpenseTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="profits" name="الأرباح" stroke="#10b981" fill="#10b98133" strokeWidth={2} />
                  <Area type="monotone" dataKey="expenses" name="المصاريف" stroke="#ef4444" fill="#ef444433" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Profit by Source */}
        <div className="card">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">مصادر الربح</h3>
          </div>
          <div className="p-4">
            {profitBySource.length === 0 ? (
              <div className="empty-state py-8">
                <TrendingUp className="empty-state-icon" />
                <p className="empty-state-title">لا توجد أرباح</p>
              </div>
            ) : (
              <div className="flex items-center">
                <ResponsiveContainer width="60%" height={250}>
                  <PieChart>
                    <Pie
                      data={profitBySource}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {profitBySource.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-40 space-y-2">
                  {profitBySource.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-slate-600 flex-1">{item.name}</span>
                      <span className="font-medium">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense by Category */}
        <div className="card">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">المصاريف حسب التصنيف</h3>
          </div>
          <div className="p-4">
            {expenseByCategory.length === 0 ? (
              <div className="empty-state py-8">
                <TrendingDown className="empty-state-icon" />
                <p className="empty-state-title">لا توجد مصاريف</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={expenseByCategory} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tickFormatter={(v) => `$${v}`} tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Shipping Trend */}
        <div className="card">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">حركة الشحن</h3>
          </div>
          <div className="p-4">
            {shippingTrend.length === 0 ? (
              <div className="empty-state py-8">
                <Package className="empty-state-icon" />
                <p className="empty-state-title">لا توجد عمليات شحن</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={shippingTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="buy" name="شراء" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sell" name="بيع" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Debt Summary & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Debt Summary */}
        <div className="card">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">ملخص الديون</h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-red-600 mb-3 flex items-center gap-2">
                <ArrowUpCircle className="w-4 h-4" />
                دين علينا
              </h4>
              {debtSummary.payable.length === 0 ? (
                <p className="text-sm text-slate-400">لا توجد ديون</p>
              ) : (
                <div className="space-y-2">
                  {debtSummary.payable.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                      <span className="text-sm text-slate-600">{item.name}</span>
                      <span className="text-sm font-bold text-red-600">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-emerald-600 mb-3 flex items-center gap-2">
                <ArrowDownCircle className="w-4 h-4" />
                ديين لنا
              </h4>
              {debtSummary.receivable.length === 0 ? (
                <p className="text-sm text-slate-400">لا توجد ديون</p>
              ) : (
                <div className="space-y-2">
                  {debtSummary.receivable.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg">
                      <span className="text-sm text-slate-600">{item.name}</span>
                      <span className="text-sm font-bold text-emerald-600">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">آخر المعاملات</h3>
          </div>
          <div className="p-4">
            {recentTransactions.length === 0 ? (
              <div className="empty-state py-8">
                <Receipt className="empty-state-icon" />
                <p className="empty-state-title">لا توجد معاملات</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.slice(0, 8).map((tx, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        tx.type === 'profit' ? 'bg-emerald-100' : 'bg-red-100'
                      }`}>
                        {tx.type === 'profit' ? (
                          <ArrowDownCircle className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <ArrowUpCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{tx.description}</p>
                        <p className="text-xs text-slate-400">{new Date(tx.date).toLocaleDateString('ar-SA')}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${tx.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                    </span>
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

export default Analytics;
