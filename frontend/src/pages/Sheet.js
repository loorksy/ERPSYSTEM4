import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Plus, Edit2, Trash2, Calendar, Link, File, X } from 'lucide-react';

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
    // Simulate loading cycles
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
    // Simulate fetching data from Google
    setFormData(prev => ({
      ...prev,
      managementRows: 150,
      agentRows: 120
    }));
    setShowSavePanel(true);
  };

  const handleUploadFiles = () => {
    // Simulate file upload
    setFormData(prev => ({
      ...prev,
      managementRows: 140,
      agentRows: 110
    }));
    setShowSavePanel(true);
  };

  const handleSaveCycle = () => {
    // Here you would call the API to save
    console.log('Saving cycle:', formData);
    closeModal();
  };

  const handleDeleteCycle = () => {
    // Here you would call the API to delete
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

  const colors = [
    'from-sky-500 to-violet-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-cyan-500 to-blue-600'
  ];

  return (
    <div className="max-w-6xl mx-auto" dir="rtl" data-testid="sheet-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1e3a5f] flex items-center justify-center">
              <FileSpreadsheet className="text-white text-xl" size={24} />
            </div>
            الدورات المالية
          </h2>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 active:scale-[0.98] bg-[#1e3a5f] text-white hover:bg-[#2d5a87] shadow-md"
        >
          <Plus size={20} />
          <span>إنشاء دورة مالية</span>
        </button>
      </div>

      {/* Cycles Grid */}
      {cycles.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
            <FileSpreadsheet className="text-4xl text-slate-400" size={40} />
          </div>
          <p className="text-slate-600 font-medium mb-1">لا توجد دورات محفوظة</p>
          <p className="text-slate-500 text-sm mb-6">أنشئ دورة مالية جديدة لربط جداول الإدارة والوكيل</p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-[#1e3a5f] text-white hover:bg-[#2d5a87]"
          >
            <Plus size={18} />
            إنشاء أول دورة
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cycles.map((cycle, index) => {
            const color = colors[index % colors.length];
            const hasGoogle = !!(cycle.management_spreadsheet_id && cycle.agent_spreadsheet_id);
            
            return (
              <div key={cycle.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                <div className={`h-2 bg-gradient-to-r ${color}`}></div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h5 className="font-bold text-slate-800 text-lg">{cycle.name}</h5>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openModal(cycle)}
                        className="w-9 h-9 rounded-lg text-slate-500 hover:bg-sky-50 hover:text-[#1e3a5f] flex items-center justify-center"
                        title="تعديل"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(cycle)}
                        className="w-9 h-9 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 flex items-center justify-center"
                        title="حذف"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p className="flex items-center gap-2">
                      <Calendar className="text-slate-400" size={16} />
                      {formatDate(cycle.created_at)}
                    </p>
                    {hasGoogle ? (
                      <p className="flex items-center gap-2 text-emerald-600">
                        <Link size={16} />
                        مرتبطة بـ Google
                      </p>
                    ) : (
                      <p className="flex items-center gap-2 text-amber-600">
                        <File size={16} />
                        ملفات محلية
                      </p>
                    )}
                    {cycle.transfer_discount_pct > 0 && (
                      <p className="flex items-center gap-2 text-slate-500">
                        <span>%</span>
                        خصم تحويل: {cycle.transfer_discount_pct}%
                      </p>
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
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center p-4 max-lg:p-0 max-lg:items-end max-lg:pb-0 bg-black/60 backdrop-blur-sm overflow-hidden"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] max-lg:max-h-[100vh] max-lg:h-[100vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h4 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1e3a5f]/10 flex items-center justify-center">
                  <FileSpreadsheet className="text-[#1e3a5f]" size={20} />
                </div>
                {editingCycle ? 'تعديل الدورة المالية' : 'إنشاء دورة مالية'}
              </h4>
              <button
                onClick={closeModal}
                className="w-10 h-10 rounded-xl text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto flex-1 min-h-0 overscroll-contain">
              {/* Tabs */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-4">
                <button
                  onClick={() => setActiveTab('google')}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    activeTab === 'google'
                      ? 'bg-white text-[#1e3a5f] shadow-sm'
                      : 'text-slate-600 hover:bg-white/50'
                  }`}
                >
                  استيراد من Google
                </button>
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    activeTab === 'upload'
                      ? 'bg-white text-[#1e3a5f] shadow-sm'
                      : 'text-slate-600 hover:bg-white/50'
                  }`}
                >
                  رفع يدوي (Excel / CSV)
                </button>
              </div>

              {/* Google Import Panel */}
              {activeTab === 'google' && (
                <div className="space-y-5">
                  <p className="text-sm text-slate-600">اختر من جداول البيانات في حسابك — يتم جلب القائمة تلقائياً من Google.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Management */}
                    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-100 space-y-3">
                      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <span className="text-amber-600">🏢</span>
                        الإدارة
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">جدول الإدارة</label>
                          <select
                            value={formData.mgmtSpreadsheetId}
                            onChange={(e) => setFormData({ ...formData, mgmtSpreadsheetId: e.target.value })}
                            className="w-full py-2.5 px-3 border-2 border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all min-w-0"
                          >
                            <option value="">— جاري التحميل... —</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">ورقة الإدارة</label>
                          <select
                            value={formData.mgmtSheetName}
                            onChange={(e) => setFormData({ ...formData, mgmtSheetName: e.target.value })}
                            className="w-full py-2.5 px-3 border border-slate-200 rounded-xl text-sm bg-white min-w-0"
                          >
                            <option value="">أول ورقة تلقائياً</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Agent */}
                    <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-100 space-y-3">
                      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <span className="text-[#1e3a5f]">👔</span>
                        الوكيل
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">جدول الوكيل</label>
                          <select
                            value={formData.agentSpreadsheetId}
                            onChange={(e) => setFormData({ ...formData, agentSpreadsheetId: e.target.value })}
                            className="w-full py-2.5 px-3 border-2 border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all min-w-0"
                          >
                            <option value="">— جاري التحميل... —</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">ورقة الوكيل</label>
                          <select
                            value={formData.agentSheetName}
                            onChange={(e) => setFormData({ ...formData, agentSheetName: e.target.value })}
                            className="w-full py-2.5 px-3 border border-slate-200 rounded-xl text-sm bg-white min-w-0"
                          >
                            <option value="">أول ورقة تلقائياً</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleFetchFromGoogle}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  >
                    <span>☁️</span>
                    جلب البيانات من Google
                  </button>
                </div>
              )}

              {/* Upload Panel */}
              {activeTab === 'upload' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-100">
                      <label className="block font-semibold text-sm text-slate-800 mb-2 flex items-center gap-2">
                        <span className="text-amber-600">🏢</span>
                        ملف الإدارة
                      </label>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="w-full py-2.5 px-4 border-2 border-dashed border-slate-200 rounded-xl text-sm bg-white hover:border-amber-300 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-amber-50 file:text-amber-700 file:font-semibold"
                      />
                    </div>
                    <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-100">
                      <label className="block font-semibold text-sm text-slate-800 mb-2 flex items-center gap-2">
                        <span className="text-[#1e3a5f]">👔</span>
                        ملف الوكيل
                      </label>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="w-full py-2.5 px-4 border-2 border-dashed border-slate-200 rounded-xl text-sm bg-white hover:border-sky-300 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-sky-50 file:text-sky-700 file:font-semibold"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleUploadFiles}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-sky-600 text-white hover:bg-sky-700 transition-colors"
                  >
                    <span>⬆️</span>
                    تحميل وقراءة الملفات
                  </button>
                </div>
              )}

              {/* Save Panel */}
              {showSavePanel && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex gap-4 mb-3 p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-600">الإدارة: <strong className="text-[#1e3a5f]">{formData.managementRows}</strong> صف</span>
                    <span className="text-slate-600">الوكيل: <strong className="text-[#1e3a5f]">{formData.agentRows}</strong> صف</span>
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 font-semibold text-sm text-slate-800">اسم الدورة المالية</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="مثال: دورة يناير 2025"
                      className="w-full py-3 px-4 border-2 border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 font-semibold text-sm text-slate-800">نسبة خصم التحويل للدورة (%)</label>
                    <input
                      type="number"
                      value={formData.transferDiscountPct}
                      onChange={(e) => setFormData({ ...formData, transferDiscountPct: e.target.value })}
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="0"
                      className="w-full py-3 px-4 border-2 border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-sky-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">تُطبّق على جدول الوكيل؛ الجزء المخصوم يُسجّل كربح عند إعادة بناء المؤجل.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {showSavePanel && (
              <div className="p-4 pt-0 border-t border-slate-200 bg-white shrink-0">
                <button
                  onClick={handleSaveCycle}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm bg-[#1e3a5f] text-white hover:bg-[#2d5a87] transition-colors shadow-md"
                >
                  <span>💾</span>
                  حفظ الدورة
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center p-4 py-6 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && closeDeleteConfirm()}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-100 flex items-center justify-center">
              <Trash2 className="text-red-600" size={24} />
            </div>
            <h4 className="text-lg font-bold text-slate-800 text-center mb-2">حذف الدورة المالية</h4>
            <p className="text-slate-600 text-sm text-center mb-6">
              هل أنت متأكد من حذف "{deleteTarget?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeDeleteConfirm}
                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteCycle}
                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-red-600 text-white hover:bg-red-700"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sheet;
