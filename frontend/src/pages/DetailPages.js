import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ArrowLeft } from 'lucide-react';

const formatCurrency = (value) => new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value || 0);

export const MemberProfilePage = () => {
  const { memberUserId } = useParams();
  const { members, api } = useData();
  const member = members.find((m) => m.member_user_id === memberUserId || m._id === memberUserId);
  const [adjustments, setAdjustments] = useState([]);

  useEffect(() => {
    api.get('/api/adjustments').then((res) => {
      const rows = (res.data || []).filter((a) => a.member_id === (member?._id || ''));
      setAdjustments(rows);
    }).catch(() => setAdjustments([]));
  }, [api, member?._id]);

  if (!member) return <div className="card p-6">العضو غير موجود.</div>;

  return (
    <div className="space-y-6" dir="rtl" data-testid="member-profile-page">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold">ملف عضو: {member.name}</h1><Link to="/member-directory" className="btn btn-secondary"><ArrowLeft className="w-4 h-4" />رجوع</Link></div>
      <div className="card p-4"><p>الراتب الأساسي: <strong>{formatCurrency(member.base_salary)}</strong></p><p>الدور: <strong>{member.role}</strong></p></div>
      <div className="card p-4"><h2 className="font-semibold mb-2">سجل الإضافات والخصومات</h2>{adjustments.length === 0 ? <p className="text-sm text-slate-500">لا يوجد سجل.</p> : <ul className="space-y-1 text-sm">{adjustments.map((a) => <li key={a._id}>{a.adjustment_type} - {formatCurrency(a.amount)}</li>)}</ul>}</div>
    </div>
  );
};

export const DebtEntityPage = ({ entityType }) => {
  const { id } = useParams();
  const { api, transferCompanies, funds } = useData();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get('/api/debts').then((res) => {
      setRows((res.data || []).filter((d) => d.entity_type === entityType && d.entity_id === id));
    }).catch(() => setRows([]));
  }, [api, entityType, id]);

  const title = entityType === 'company' ? 'سجل شركة' : 'سجل صندوق';
  const entity = entityType === 'company' ? transferCompanies.find((c) => c._id === id) : funds.find((f) => f._id === id);
  const total = useMemo(() => rows.reduce((s, r) => s + (r.remaining || 0), 0), [rows]);

  return (
    <div className="space-y-6" dir="rtl" data-testid="debt-entity-page">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold">{title}: {entity?.name || id}</h1><Link to="/debts" className="btn btn-secondary"><ArrowLeft className="w-4 h-4" />رجوع</Link></div>
      <div className="card p-4">إجمالي المتبقي: <strong>{formatCurrency(total)}</strong></div>
      <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="table"><thead><tr><th>النوع</th><th>المبلغ</th><th>المتبقي</th></tr></thead><tbody>{rows.map((r) => <tr key={r._id}><td>{r.debt_type}</td><td>{formatCurrency(r.amount)}</td><td>{formatCurrency(r.remaining)}</td></tr>)}</tbody></table></div></div>
    </div>
  );
};

export const ProfitSourceDetailPage = () => {
  const { sourceType } = useParams();
  const { api } = useData();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get('/api/profit-sources').then((res) => {
      setRows((res.data || []).filter((r) => r.source_type === sourceType));
    }).catch(() => setRows([]));
  }, [api, sourceType]);

  const total = rows.reduce((s, r) => s + (r.amount || 0), 0);

  return (
    <div className="space-y-6" dir="rtl" data-testid="profit-source-detail-page">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold">تفاصيل مصدر الربح: {sourceType}</h1><Link to="/profit-sources" className="btn btn-secondary"><ArrowLeft className="w-4 h-4" />رجوع</Link></div>
      <div className="card p-4">الإجمالي: <strong>{formatCurrency(total)}</strong></div>
      <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="table"><thead><tr><th>التاريخ</th><th>المبلغ</th><th>ملاحظات</th></tr></thead><tbody>{rows.map((r) => <tr key={r._id}><td>{new Date(r.created_at).toLocaleDateString('ar-SA')}</td><td>{formatCurrency(r.amount)}</td><td>{r.notes || '-'}</td></tr>)}</tbody></table></div></div>
    </div>
  );
};
