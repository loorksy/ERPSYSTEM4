import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { ClipboardCheck, Calculator, DollarSign, Users } from 'lucide-react';

const Payroll = () => {
  const { activeCycle, members, api } = useData();
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await api.get('/api/adjustments');
      setAdjustments(response.data);
    } catch (error) {
      console.error('Error:', error);
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
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value || 0);
  };

  const calculateMemberPayroll = (member) => {
    const memberAdj = adjustments.filter(a => a.member_id === member._id);
    const bonuses = memberAdj.filter(a => a.adjustment_type === 'bonus').reduce((sum, a) => sum + a.amount, 0);
    const deductions = memberAdj.filter(a => a.adjustment_type === 'deduction').reduce((sum, a) => sum + a.amount, 0);
    const total = member.base_salary + bonuses - deductions;
    return { bonuses, deductions, total };
  };

  const totalPayroll = members.reduce((sum, m) => sum + calculateMemberPayroll(m).total, 0);
  const totalBonuses = members.reduce((sum, m) => sum + calculateMemberPayroll(m).bonuses, 0);
  const totalDeductions = members.reduce((sum, m) => sum + calculateMemberPayroll(m).deductions, 0);

  return (
    <div className="space-y-6" data-testid="payroll-page">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">تدقيق الرواتب</h1>
        <p className="text-slate-500 mt-1">مراجعة واعتماد رواتب الموظفين</p>
      </div>

      {!activeCycle ? (
        <div className="card">
          <div className="empty-state py-12">
            <ClipboardCheck className="empty-state-icon" />
            <p className="empty-state-title">لا توجد دورة مالية نشطة</p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-2">
                <Calculator className="w-5 h-5 text-primary-600" />
                <span className="text-sm text-slate-500">إجمالي الرواتب</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalPayroll)}</p>
            </div>
            
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span className="text-sm text-slate-500">إجمالي المكافآت</span>
              </div>
              <p className="text-2xl font-bold text-emerald-600">+{formatCurrency(totalBonuses)}</p>
            </div>
            
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-red-600" />
                <span className="text-sm text-slate-500">إجمالي الخصومات</span>
              </div>
              <p className="text-2xl font-bold text-red-600">-{formatCurrency(totalDeductions)}</p>
            </div>
          </div>

          {/* Payroll Table */}
          {members.length === 0 ? (
            <div className="card">
              <div className="empty-state py-12">
                <Users className="empty-state-icon" />
                <p className="empty-state-title">لا يوجد موظفين</p>
                <p className="empty-state-text">أضف موظفين من صفحة بيانات المستخدمين</p>
              </div>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900">كشف الرواتب</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>الموظف</th>
                      <th>الراتب الأساسي</th>
                      <th>المكافآت</th>
                      <th>الخصومات</th>
                      <th>الصافي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map(member => {
                      const payroll = calculateMemberPayroll(member);
                      return (
                        <tr key={member._id}>
                          <td className="font-medium text-slate-900">{member.name}</td>
                          <td>{formatCurrency(member.base_salary)}</td>
                          <td className="text-emerald-600">+{formatCurrency(payroll.bonuses)}</td>
                          <td className="text-red-600">-{formatCurrency(payroll.deductions)}</td>
                          <td className="font-bold text-slate-900">{formatCurrency(payroll.total)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50">
                      <td className="font-bold">الإجمالي</td>
                      <td className="font-bold">{formatCurrency(members.reduce((s, m) => s + m.base_salary, 0))}</td>
                      <td className="font-bold text-emerald-600">+{formatCurrency(totalBonuses)}</td>
                      <td className="font-bold text-red-600">-{formatCurrency(totalDeductions)}</td>
                      <td className="font-bold text-primary-600">{formatCurrency(totalPayroll)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Payroll;
