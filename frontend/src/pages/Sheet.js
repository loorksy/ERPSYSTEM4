import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Plus, Edit2, Trash2, Calendar, Link, File, X, Cloud, Upload } from 'lucide-react';

const Sheet = () => {
  const [cycles, setCycles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('google');
  const [editingCycle, setEditingCycle] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showSavePanel, setShowSavePanel] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    mgmtSpreadsheetId: '',
    mgmtSheetName: '',
    agentSpreadsheetId: '',
    agentSheetName: '',
    transferDiscountPct: '',
    managementRows: 0,
    agentRows: 0
  });

  // Mock data for demonstration
  useEffect(() => {
    setCycles([
      {
        id: 1,
        name: 'دورة يناير 2025',
        created_at: new Date('2025-01-01'),
        management_spreadsheet_id: 'abc123',
        agent_spreadsheet_id: 'def456',
        transfer_discount_pct: 2.5
      },
      {
        id: 2,
        name: 'دورة فبراير 2025',
        created_at: new Date('2025-02-01'),
        management_spreadsheet_id: null,
        agent_spreadsheet_id: null,
        transfer_discount_pct: 0
      }
    ]);
  }, []);

  const openModal = (cycle = null) => {
    setEditingCycle(cycle);
    if (cycle) {
      setFormData({
        name: cycle.name || '',
        mgmtSpreadsheetId: cycle.management_spreadsheet_id || '',
        mgmtSheetName: cycle.management_sheet_name || '',
        agentSpreadsheetId: cycle.agent_spreadsheet_id || '',
        agentSheetName: cycle.agent_sheet_name || '',
        transferDiscountPct: cycle.transfer_discount_pct || '',
        managementRows: 0,
        agentRows: 0
      });
      setShowSavePanel(true);
    } else {
      setFormData({
        name: '',
        mgmtSpreadsheetId: '',
        mgmtSheetName: '',
        agentSpreadsheetId: '',
        agentSheetName: '',
        transferDiscountPct: '',
        managementRows: 0,
        agentRows: 0
      });
      setShowSavePanel(false);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCycle(null);
    setActiveTab('google');
    setShowSavePanel(false);
  };

  const openDeleteConfirm = (cycle) => {
    setDeleteTarget(cycle);
    setShowDeleteModal(true);
  };

  const closeDeleteConfirm = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleFetchFromGoogle = () => {
    setFormData(prev => ({
      ...prev,
      managementRows: 150,
      agentRows: 120
    }));
    setShowSavePanel(true);
  };

  const handleUploadFiles = () => {
    setFormData(prev => ({
      ...prev,
      managementRows: 140,
      agentRows: 110
    }));
    setShowSavePanel(true);
  };

  const handleSaveCycle = () => {
    console.log('Saving cycle:', formData);
    closeModal();
  };

  const handleDeleteCycle = () => {
    console.log('Deleting cycle:', deleteTarget);
    setCycles(cycles.filter(c => c.id !== deleteTarget.id));
    closeDeleteConfirm();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const gradients = [
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-500',
    'from-purple-500 to-indigo-500'
  ];

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl" data-testid="sheet-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="stat-icon bg-primary-100">
            <FileSpreadsheet className="text-primary-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">الدورات المالية</h1>
            <p className="text-sm text-slate-500 mt-0.5">إدارة دورات الإدارة والوكيل</p>
          </div>
        </div>
        <button
          onClick={() => openModal()}
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>إنشاء دورة جديدة</span>
        </button>
      </div>

      {/* Cycles Grid */}
      {cycles.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <FileSpreadsheet className="empty-state-icon" />
            <p className="empty-state-title">لا توجد دورات محفوظة</p>
            <p className="empty-state-text">أنشئ دورة مالية جديدة لربط جداول الإدارة والوكيل</p>
            <button
              onClick={() => openModal()}
              className="btn btn-primary mt-4"
            >
              <Plus size={18} />
              إنشاء أول دورة
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cycles.map((cycle, index) => {
            const gradient = gradients[index % gradients.length];
            const hasGoogle = !!(cycle.management_spreadsheet_id && cycle.agent_spreadsheet_id);
            
            return (
              <div key={cycle.id} className="card card-hover group overflow-hidden">
                <div className={`h-1.5 bg-gradient-to-r ${gradient}`}></div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <h3 className="font-bold text-slate-900 text-lg flex-1">{cycle.name}</h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openModal(cycle)}
                        className="btn-ghost p-2 rounded-lg"
                        title="تعديل"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(cycle)}
                        className="btn-ghost p-2 rounded-lg text-red-600 hover:bg-red-50"
                        title="حذف"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar size={16} className="text-slate-400" />
                      <span>{formatDate(cycle.created_at)}</span>
                    </div>
                    
                    {hasGoogle ? (
                      <div className="flex items-center gap-2">
                        <span className="badge badge-success">
                          <Link size={12} className="ml-1" />
                          مرتبطة بـ Google
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="badge badge-warning">
                          <File size={12} className="ml-1" />
                          ملفات محلية
                        </span>
                      </div>
                    )}
                    
                    {cycle.transfer_discount_pct > 0 && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="text-xs">خصم التحويل:</span>
                        <span className="badge badge-info">{cycle.transfer_discount_pct}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal-content w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-3">
                <div className="stat-icon bg-primary-100">
                  <FileSpreadsheet className="text-primary-600" size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingCycle ? 'تعديل الدورة المالية' : 'إنشاء دورة مالية'}
                </h2>
              </div>
              <button onClick={closeModal} className="btn-ghost p-2 rounded-lg">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 sm:pb-6">
              {/* Tabs */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-lg mb-6">
                <button
                  onClick={() => setActiveTab('google')}
                  className={`flex-1 px-4 py-2.5 rounded-md font-medium text-sm transition-all ${
                    activeTab === 'google'
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Cloud className="inline ml-1" size={16} />
                  استيراد من Google
                </button>
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 px-4 py-2.5 rounded-md font-medium text-sm transition-all ${
                    activeTab === 'upload'
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className="inline ml-1" size={16} />
                  رفع يدوي
                </button>
              </div>

              {/* Google Import Panel */}
              {activeTab === 'google' && (
                <div className="space-y-5">
                  <p className="text-xs text-slate-600 bg-blue-50 border border-blue-100 rounded-lg p-2.5">
                    💡 اختر من جداول البيانات في حسابك — يتم جلب القائمة تلقائياً من Google
                  </p>
                  
                  <div className="space-y-4">
                    {/* Management */}
                    <div className="card p-3 bg-amber-50 border-amber-200">
                      <h4 className="font-semibold text-slate-800 text-xs mb-2 flex items-center gap-1.5">
                        <span>🏢</span>
                        الإدارة
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-medium text-slate-600 mb-1">جدول الإدارة</label>
                          <select
                            value={formData.mgmtSpreadsheetId}
                            onChange={(e) => setFormData({ ...formData, mgmtSpreadsheetId: e.target.value })}
                            className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                          >
                            <option value="">— جاري التحميل... —</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-slate-600 mb-1">ورقة الإدارة</label>
                          <select
                            value={formData.mgmtSheetName}
                            onChange={(e) => setFormData({ ...formData, mgmtSheetName: e.target.value })}
                            className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                          >
                            <option value="">أول ورقة تلقائياً</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Agent */}
                    <div className="card p-3 bg-blue-50 border-blue-200">
                      <h4 className="font-semibold text-slate-800 text-xs mb-2 flex items-center gap-1.5">
                        <span>👔</span>
                        الوكيل
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-medium text-slate-600 mb-1">جدول الوكيل</label>
                          <select
                            value={formData.agentSpreadsheetId}
                            onChange={(e) => setFormData({ ...formData, agentSpreadsheetId: e.target.value })}
                            className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                          >
                            <option value="">— جاري التحميل... —</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-slate-600 mb-1">ورقة الوكيل</label>
                          <select
                            value={formData.agentSheetName}
                            onChange={(e) => setFormData({ ...formData, agentSheetName: e.target.value })}
                            className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                          >
                            <option value="">أول ورقة تلقائياً</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Panel */}
              {activeTab === 'upload' && (
                <div className="space-y-4">
                  <div className="card p-3 bg-amber-50 border-amber-200">
                    <h4 className="font-semibold text-slate-800 text-xs mb-2 flex items-center gap-1.5">
                      <span>🏢</span>
                      ملف الإدارة
                    </h4>
                    <input 
                      type="file" 
                      accept=".xlsx,.xls,.csv" 
                      className="w-full text-xs border border-slate-300 rounded-lg bg-white file:mr-2 file:py-1.5 file:px-3 file:border-0 file:bg-slate-100 file:text-slate-700 file:rounded-md file:text-xs file:font-medium hover:file:bg-slate-200" 
                    />
                  </div>
                  <div className="card p-3 bg-blue-50 border-blue-200">
                    <h4 className="font-semibold text-slate-800 text-xs mb-2 flex items-center gap-1.5">
                      <span>👔</span>
                      ملف الوكيل
                    </h4>
                    <input 
                      type="file" 
                      accept=".xlsx,.xls,.csv" 
                      className="w-full text-xs border border-slate-300 rounded-lg bg-white file:mr-2 file:py-1.5 file:px-3 file:border-0 file:bg-slate-100 file:text-slate-700 file:rounded-md file:text-xs file:font-medium hover:file:bg-slate-200" 
                    />
                  </div>
                </div>
              )}

              {/* Save Panel */}
              {showSavePanel && (
                <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
                  <div className="flex gap-4 p-4 bg-slate-50 rounded-lg">
                    <div className="flex-1 text-center">
                      <p className="text-xs text-slate-500 mb-1">الإدارة</p>
                      <p className="text-2xl font-bold text-primary-600">{formData.managementRows}</p>
                      <p className="text-xs text-slate-500">صف</p>
                    </div>
                    <div className="w-px bg-slate-300"></div>
                    <div className="flex-1 text-center">
                      <p className="text-xs text-slate-500 mb-1">الوكيل</p>
                      <p className="text-2xl font-bold text-primary-600">{formData.agentRows}</p>
                      <p className="text-xs text-slate-500">صف</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="label">اسم الدورة المالية</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="مثال: دورة يناير 2025"
                      className="input"
                    />
                  </div>
                  
                  <div>
                    <label className="label">نسبة خصم التحويل للدورة (%)</label>
                    <input
                      type="number"
                      value={formData.transferDiscountPct}
                      onChange={(e) => setFormData({ ...formData, transferDiscountPct: e.target.value })}
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="0"
                      className="input"
                    />
                    <p className="text-xs text-slate-500 mt-1.5">
                      تُطبّق على جدول الوكيل؛ الجزء المخصوم يُسجّل كربح عند إعادة بناء المؤجل.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer - Always visible */}
            <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 shrink-0">
              {!showSavePanel ? (
                <button 
                  onClick={activeTab === 'google' ? handleFetchFromGoogle : handleUploadFiles} 
                  className="btn btn-success w-full"
                >
                  {activeTab === 'google' ? (
                    <>
                      <Cloud size={18} />
                      جلب البيانات من Google
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      تحميل وقراءة الملفات
                    </>
                  )}
                </button>
              ) : (
                <div className="flex gap-3">
                  <button onClick={closeModal} className="btn btn-secondary flex-1">
                    إلغاء
                  </button>
                  <button onClick={handleSaveCycle} className="btn btn-primary flex-1">
                    <FileSpreadsheet size={18} />
                    حفظ الدورة
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeDeleteConfirm()}>
          <div className="modal-content w-full max-w-md mx-4 p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="text-red-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">حذف الدورة المالية</h3>
              <p className="text-slate-600">
                هل أنت متأكد من حذف "<span className="font-semibold">{deleteTarget?.name}</span>"؟
                <br />
                <span className="text-sm text-red-600">لا يمكن التراجع عن هذا الإجراء.</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={closeDeleteConfirm} className="btn btn-secondary flex-1">
                إلغاء
              </button>
              <button onClick={handleDeleteCycle} className="btn btn-danger flex-1">
                <Trash2 size={18} />
                حذف نهائياً
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sheet;
