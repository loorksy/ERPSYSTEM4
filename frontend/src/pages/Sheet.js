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
        <button onClick={() => openModal()} className="btn btn-primary">
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
            <button onClick={() => openModal()} className="btn btn-primary mt-4">
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
                      <button onClick={() => openModal(cycle)} className="btn-ghost p-2 rounded-lg" title="تعديل">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => openDeleteConfirm(cycle)} className="btn-ghost p-2 rounded-lg text-red-600 hover:bg-red-50" title="حذف">
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

      {/* Create/Edit Modal - Tailwind Only */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center">
          
          <div className="bg-white w-full sm:max-w-2xl sm:mx-4 sm:rounded-2xl rounded-t-3xl h-[80vh] sm:max-h-[90vh] flex flex-col shadow-2xl animate-slide-in-up">
            
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 shrink-0 sm:rounded-t-2xl rounded-t-3xl">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <FileSpreadsheet className="text-white" size={20} />
                </div>
                <h2 className="text-base font-bold text-white">
                  {editingCycle ? 'تعديل الدورة' : 'إنشاء دورة مالية'}
                </h2>
              </div>
              <button onClick={closeModal} className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur hover:bg-white/30 flex items-center justify-center transition-all">
                <X size={20} className="text-white" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1.5 p-2.5 bg-slate-100 shrink-0">
              <button
                onClick={() => setActiveTab('google')}
                className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  activeTab === 'google'
                    ? 'bg-white text-primary-600 shadow-md'
                    : 'text-slate-600 hover:bg-white/50'
                }`}
              >
                <Cloud className="inline ml-1.5" size={16} />
                Google Sheets
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  activeTab === 'upload'
                    ? 'bg-white text-primary-600 shadow-md'
                    : 'text-slate-600 hover:bg-white/50'
                }`}
              >
                <Upload className="inline ml-1.5" size={16} />
                رفع ملفات
              </button>
            </div>

            {/* Body - Scrollable */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-2 space-y-2.5">
              
              {/* Google Tab */}
              {activeTab === 'google' && (
                <>
                  {/* Info Banner */}
                  <div className="flex items-start gap-2.5 text-xs text-blue-900 bg-blue-50 border-2 border-blue-200 rounded-xl p-3">
                    <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center shrink-0 mt-0.5">
                      <Cloud size={12} className="text-blue-700" />
                    </div>
                    <span className="leading-relaxed">اختر الجداول من حسابك في Google Sheets</span>
                  </div>
                  
                  {/* Management Card */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-2.5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-200 flex items-center justify-center">
                        <FileSpreadsheet size={14} className="text-amber-700" />
                      </div>
                      <span className="font-bold text-slate-800 text-xs">الإدارة</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">الجدول</label>
                        <select
                          value={formData.mgmtSpreadsheetId}
                          onChange={(e) => setFormData({ ...formData, mgmtSpreadsheetId: e.target.value })}
                          className="w-full px-2.5 py-2 text-xs border-2 border-amber-400 rounded-lg bg-white focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 font-medium transition-all"
                        >
                          <option value="">اختر الجدول</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">الورقة</label>
                        <select
                          value={formData.mgmtSheetName}
                          onChange={(e) => setFormData({ ...formData, mgmtSheetName: e.target.value })}
                          className="w-full px-2.5 py-2 text-xs border-2 border-amber-400 rounded-lg bg-white focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 font-medium transition-all"
                        >
                          <option value="">أول ورقة</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Agent Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl p-2.5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-200 flex items-center justify-center">
                        <FileSpreadsheet size={14} className="text-blue-700" />
                      </div>
                      <span className="font-bold text-slate-800 text-xs">الوكيل</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">الجدول</label>
                        <select
                          value={formData.agentSpreadsheetId}
                          onChange={(e) => setFormData({ ...formData, agentSpreadsheetId: e.target.value })}
                          className="w-full px-2.5 py-2 text-xs border-2 border-blue-400 rounded-lg bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 font-medium transition-all"
                        >
                          <option value="">اختر الجدول</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">الورقة</label>
                        <select
                          value={formData.agentSheetName}
                          onChange={(e) => setFormData({ ...formData, agentSheetName: e.target.value })}
                          className="w-full px-2.5 py-2 text-xs border-2 border-blue-400 rounded-lg bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 font-medium transition-all"
                        >
                          <option value="">أول ورقة</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Upload Tab */}
              {activeTab === 'upload' && (
                <>
                  {/* Management File */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-2.5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-200 flex items-center justify-center">
                        <File size={14} className="text-amber-700" />
                      </div>
                      <span className="font-bold text-slate-800 text-xs">ملف الإدارة</span>
                    </div>
                    <input 
                      type="file" 
                      accept=".xlsx,.xls,.csv" 
                      className="w-full text-xs border-2 border-amber-400 rounded-lg bg-white p-2 file:mr-2 file:py-1.5 file:px-3 file:border-0 file:bg-amber-200 file:text-amber-900 file:rounded-lg file:text-xs file:font-bold file:cursor-pointer hover:file:bg-amber-300 transition-all cursor-pointer" 
                    />
                  </div>

                  {/* Agent File */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl p-2.5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-200 flex items-center justify-center">
                        <File size={14} className="text-blue-700" />
                      </div>
                      <span className="font-bold text-slate-800 text-xs">ملف الوكيل</span>
                    </div>
                    <input 
                      type="file" 
                      accept=".xlsx,.xls,.csv" 
                      className="w-full text-xs border-2 border-blue-400 rounded-lg bg-white p-2 file:mr-2 file:py-1.5 file:px-3 file:border-0 file:bg-blue-200 file:text-blue-900 file:rounded-lg file:text-xs file:font-bold file:cursor-pointer hover:file:bg-blue-300 transition-all cursor-pointer" 
                    />
                  </div>
                </>
              )}

              {/* Save Panel */}
              {showSavePanel && (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-300 rounded-xl p-3.5 shadow-sm">
                  <div className="flex gap-3 mb-4">
                    <div className="flex-1 text-center py-3 bg-white rounded-xl border-2 border-slate-200 shadow-sm">
                      <p className="text-xs text-slate-500 mb-1 font-medium">الإدارة</p>
                      <p className="text-2xl font-black text-primary-600">{formData.managementRows}</p>
                      <p className="text-xs text-slate-500 font-medium">صف</p>
                    </div>
                    <div className="flex-1 text-center py-3 bg-white rounded-xl border-2 border-slate-200 shadow-sm">
                      <p className="text-xs text-slate-500 mb-1 font-medium">الوكيل</p>
                      <p className="text-2xl font-black text-primary-600">{formData.agentRows}</p>
                      <p className="text-xs text-slate-500 font-medium">صف</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">اسم الدورة المالية</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="مثال: دورة يناير 2025"
                        className="w-full px-3 py-2.5 text-xs border-2 border-slate-300 rounded-xl bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 font-medium transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">نسبة الخصم (%)</label>
                      <input
                        type="number"
                        value={formData.transferDiscountPct}
                        onChange={(e) => setFormData({ ...formData, transferDiscountPct: e.target.value })}
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="0"
                        className="w-full px-3 py-2.5 text-xs border-2 border-slate-300 rounded-xl bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 font-medium transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer - Fixed Button */}
            <div className="bg-white border-t-4 border-emerald-400 px-3 py-2.5 shrink-0">
              {!showSavePanel ? (
                <button 
                  onClick={activeTab === 'google' ? handleFetchFromGoogle : handleUploadFiles} 
                  className="w-full h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 hover:from-emerald-600 hover:to-emerald-600 text-white font-black text-sm rounded-xl shadow-2xl active:scale-[0.97] transition-all border-2 border-emerald-700"
                >
                  {activeTab === 'google' ? (
                    <>
                      <Cloud size={20} strokeWidth={2.5} />
                      <span>جلب البيانات من Google</span>
                    </>
                  ) : (
                    <>
                      <Upload size={20} strokeWidth={2.5} />
                      <span>تحميل الملفات</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={closeModal} 
                    className="flex-1 h-12 flex items-center justify-center bg-slate-300 hover:bg-slate-400 text-slate-800 font-black text-sm rounded-xl transition-all border-2 border-slate-400"
                  >
                    إلغاء
                  </button>
                  <button 
                    onClick={handleSaveCycle} 
                    className="flex-1 h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500 hover:from-primary-600 hover:to-primary-600 text-white font-black text-sm rounded-xl shadow-2xl active:scale-[0.97] transition-all border-2 border-primary-700"
                  >
                    <FileSpreadsheet size={18} strokeWidth={2.5} />
                    <span>حفظ الدورة</span>
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
