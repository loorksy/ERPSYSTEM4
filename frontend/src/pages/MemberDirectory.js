import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { UserCog, Plus, X, Phone, Mail, Briefcase } from 'lucide-react';

const MemberDirectory = () => {
  const { members, createMember } = useData();
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    user_id: '',
    role: 'employee',
    base_salary: 0
  });

  const roles = [
    { value: 'employee', label: 'موظف' },
    { value: 'manager', label: 'مدير' },
    { value: 'accountant', label: 'محاسب' },
    { value: 'agent', label: 'وكيل' }
  ];

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createMember({
      ...formData,
      base_salary: parseFloat(formData.base_salary) || 0
    });
    setShowModal(false);
    setFormData({ name: '', user_id: '', role: 'employee', base_salary: 0 });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value || 0);
  };

  const getRoleLabel = (role) => {
    const r = roles.find(x => x.value === role);
    return r ? r.label : role;
  };

  return (
    <div className="space-y-6" data-testid="member-directory-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">بيانات المستخدمين</h1>
          <p className="text-slate-500 mt-1">إدارة الموظفين والمستخدمين</p>
        </div>
        
        <button onClick={() => setShowModal(true)} className="btn btn-primary" data-testid="add-member-btn">
          <Plus className="w-4 h-4" />
          إضافة مستخدم
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="input"
        placeholder="ابحث عن مستخدم..."
      />

      {filteredMembers.length === 0 ? (
        <div className="card">
          <div className="empty-state py-12">
            <UserCog className="empty-state-icon" />
            <p className="empty-state-title">{searchQuery ? 'لا توجد نتائج' : 'لا يوجد مستخدمين'}</p>
            <p className="empty-state-text">{searchQuery ? 'جرب البحث بكلمات مختلفة' : 'أضف مستخدماً جديداً للبدء'}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map(member => (
            <div key={member._id} className="card p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-xl">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{member.name}</h3>
                  <span className="badge badge-info">{getRoleLabel(member.role)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    الراتب الأساسي
                  </span>
                  <span className="font-medium">{formatCurrency(member.base_salary)}</span>
                </div>
                {member.member_user_id && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Mail className="w-4 h-4" />
                    {member.member_user_id}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">إضافة مستخدم جديد</h2>
                <button onClick={() => setShowModal(false)} className="p-2 text-slate-400"><X className="w-5 h-5" /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">الاسم الكامل *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input" required data-testid="member-name-input" />
                </div>
                
                <div>
                  <label className="label">معرف المستخدم</label>
                  <input type="text" value={formData.user_id} onChange={(e) => setFormData({...formData, user_id: e.target.value})} className="input" placeholder="البريد أو رقم الهاتف" />
                </div>
                
                <div>
                  <label className="label">الدور</label>
                  <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="input">
                    {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="label">الراتب الأساسي</label>
                  <input type="number" step="0.01" value={formData.base_salary} onChange={(e) => setFormData({...formData, base_salary: e.target.value})} className="input" />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn btn-primary flex-1" data-testid="save-member-btn">إضافة المستخدم</button>
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">إلغاء</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDirectory;
