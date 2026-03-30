import React, { useState, useEffect } from 'react';
import { CheckCircle, Plus, Upload, FileSpreadsheet, Trash2, X, Cloud, TrendingUp, Save, ArrowLeft, Info, HandCoins, Star } from 'lucide-react';

const Approvals = () => {
  const [approvals, setApprovals] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  
  // Bulk import state
  const [bulkStep, setBulkStep] = useState('import'); // 'import' or 'review'
  const [bulkSourceMethod, setBulkSourceMethod] = useState('file'); // 'file', 'paste', 'sheet'
  const [stagingItems, setStagingItems] = useState([]);
  const [bulkReviewKind, setBulkReviewKind] = useState('debt_receivable');
  
  // Form states
  const [addFormData, setAddFormData] = useState({ name: '', code: '' });
  const [pasteText, setPasteText] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showAddAmountPanel, setShowAddAmountPanel] = useState(false);
  const [showTransferPanel, setShowTransferPanel] = useState(false);

  // Gradients matching Sheet.js theme
  const gradients = [
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-violet-500 to-purple-500',
    'from-amber-500 to-orange-500',
    'from-pink-500 to-rose-500',
    'from-indigo-500 to-blue-500',
  ];

  // Mock data
  useEffect(() => {
    setApprovals([
      { id: 1, name: 'معتمد أول', code: 'ACC001', balance: 15000, pinned: true },
      { id: 2, name: 'معتمد ثاني', code: 'ACC002', balance: -5000, pinned: false },
      { id: 3, name: 'معتمد ثالث', code: 'ACC003', balance: 8500, pinned: false },
    ]);
  }, []);

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('ar-SA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleBulkFileUpload = () => {
    if (!selectedFile) {
      alert('اختر ملفاً');
      return;
    }
    // Mock: تحويل من ملف إلى مراجعة
    const mockData = [
      { lineIndex: 1, code: 'A001', name: 'معتمد من ملف 1', amount: 5000, selected: true, discountPct: '' },
      { lineIndex: 2, code: 'A002', name: 'معتمد من ملف 2', amount: 3000, selected: true, discountPct: '' },
    ];
    setStagingItems(mockData);
    setBulkStep('review');
  };

  const handleBulkPasteSubmit = () => {
    if (!pasteText.trim()) {
      alert('الصق النص أولاً');
      return;
    }
    // Mock: تحويل من نص إلى مراجعة
    const mockData = [
      { lineIndex: 1, code: 'P001', name: 'معتمد من لصق 1', amount: 2000, selected: true, discountPct: '' },
      { lineIndex: 2, code: 'P002', name: 'معتمد من لصق 2', amount: 1500, selected: true, discountPct: '' },
    ];
    setStagingItems(mockData);
    setBulkStep('review');
  };

  const handleBulkSheetSubmit = () => {
    if (!sheetUrl.trim()) {
      alert('أدخل رابط الجدول');
      return;
    }
    // Mock: تحويل من رابط Sheet إلى مراجعة
    const mockData = [
      { lineIndex: 1, code: 'S001', name: 'معتمد من Sheet 1', amount: 7000, selected: true, discountPct: '' },
      { lineIndex: 2, code: 'S002', name: 'معتمد من Sheet 2', amount: 4500, selected: true, discountPct: '' },
    ];
    setStagingItems(mockData);
    setBulkStep('review');
  };

  const handleRemoveStagingRow = (index) => {
    const row = stagingItems[index];
    const display = row.name || row.code || 'هذا الصف';
    if (window.confirm(`هل أنت متأكد من حذف المعتمد «${display}»؟`)) {
      const newItems = stagingItems.filter((_, i) => i !== index);
      setStagingItems(newItems);
      if (newItems.length === 0) {
        handleClearBulkStaging();
      }
    }
  };

  const handleClearBulkStaging = () => {
    setStagingItems([]);
    setBulkStep('import');
    setSelectedFile(null);
    setPasteText('');
    setSheetUrl('');
    setSheetName('');
  };

  const handleCommitBulk = () => {
    if (stagingItems.length === 0) {
      alert('لا توجد صفوف');
      return;
    }
    const n = stagingItems.length;
    const message = `هل أنت متأكد من حفظ الأرصدة واعتمادها؟\n\nسيتم تنفيذ العملية على ${n === 1 ? 'صف واحد' : n + ' صفوف'}. لن تُعاد مراجعة الملف أو الملفات المستوردة بعد التنفيذ.`;
    
    if (window.confirm(message)) {
      console.log('حفظ:', stagingItems);
      alert('تم الحفظ بنجاح');
      setShowBulkModal(false);
      handleClearBulkStaging();
    }
  };

  const handleOpenDetail = (approval) => {
    setSelectedApproval(approval);
    setShowDetailModal(true);
    setShowAddAmountPanel(false);
    setShowTransferPanel(false);
  };

  const handleAddApproval = (e) => {
    e.preventDefault();
    console.log('إضافة معتمد:', addFormData);
    alert('تم إضافة المعتمد بنجاح');
    setShowAddModal(false);
    setAddFormData({ name: '', code: '' });
  };

  const handleCloseModals = () => {
    setShowBulkModal(false);
    handleClearBulkStaging();
  };

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl" data-testid="approvals-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="stat-icon bg-primary-100">
            <CheckCircle className="text-primary-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">الاعتمادات</h1>
            <p className="text-sm text-slate-500 mt-0.5">إدارة المعتمدين، رفع الأرصدة، وتسليم العمليات</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowBulkModal(true)} className="btn btn-secondary">
            <Upload size={18} />
            <span>رفع أرصدة</span>
          </button>
          <button onClick={() => setShowDeliveryModal(true)} className="btn btn-success">
            <HandCoins size={18} />
            <span>تسليم</span>
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus size={18} />
            <span>إضافة معتمد</span>
          </button>
        </div>
      </div>

      {/* Approvals Grid */}
      {approvals.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <CheckCircle className="empty-state-icon" />
            <p className="empty-state-title">لا يوجد معتمدون</p>
            <p className="empty-state-text">أضف معتمداً من زر «إضافة معتمد» أو استورد أرصدة من «رفع أرصدة»</p>
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary mt-4">
              <Plus size={18} />
              إضافة أول معتمد
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {approvals.map((approval, index) => {
            const gradient = gradients[index % gradients.length];
            
            return (
              <div
                key={approval.id}
                onClick={() => handleOpenDetail(approval)}
                className="card card-hover group overflow-hidden cursor-pointer"
              >
                <div className={`h-1.5 bg-gradient-to-r ${gradient}`}></div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <h3 className="font-bold text-slate-900 text-lg flex-1">{approval.name}</h3>
                    {approval.pinned && (
                      <Star size={18} className="text-amber-500 fill-amber-500" />
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="text-xs text-slate-500">الكود:</span>
                      <span className="font-mono font-medium">{approval.code || '—'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">الرصيد:</span>
                      <span className={`font-bold tabular-nums ${
                        approval.balance > 0 ? 'text-emerald-600' : 
                        approval.balance < 0 ? 'text-red-600' : 
                        'text-slate-500'
                      }`}>
                        {formatMoney(approval.balance)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="stat-icon bg-primary-100">
                    <Plus className="text-primary-600" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">معتمد جديد</h2>
                    <p className="text-xs text-slate-500 mt-0.5">أدخل الاسم والكود اختيارياً</p>
                  </div>
                </div>
                <button onClick={() => setShowAddModal(false)} className="btn-ghost p-2 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddApproval} className="space-y-4">
                <div>
                  <label className="label">الاسم</label>
                  <input
                    type="text"
                    value={addFormData.name}
                    onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                    placeholder="أدخل اسم المعتمد"
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">الكود</label>
                  <input
                    type="text"
                    value={addFormData.code}
                    onChange={(e) => setAddFormData({ ...addFormData, code: e.target.value })}
                    placeholder="أدخل كود المعتمد (اختياري)"
                    className="input"
                  />
                </div>
                <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary flex-1">
                    إلغاء
                  </button>
                  <button type="submit" className="btn btn-primary flex-1">
                    حفظ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div 
            className={`bg-white w-full sm:rounded-2xl rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden transition-all duration-300 ${
              bulkStep === 'review' ? 'sm:max-w-5xl' : 'sm:max-w-2xl'
            }`}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0 sm:rounded-t-2xl rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <Upload size={20} />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-slate-800">رفع أرصدة</h4>
                  <p className="text-xs text-slate-500 mt-0.5">استيراد من Excel أو نص أو Google Sheets</p>
                </div>
              </div>
              <button
                onClick={handleCloseModals}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-center px-4 py-3 bg-slate-50/80 border-b border-slate-100 shrink-0 gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <span 
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${
                    bulkStep === 'import' 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200' 
                      : 'bg-emerald-500 text-white border-emerald-500'
                  }`}
                >
                  <Upload size={14} />
                </span>
                <span className={`text-xs sm:text-sm font-semibold ${bulkStep === 'import' ? 'text-slate-900' : 'text-slate-500'}`}>
                  استيراد
                </span>
              </div>
              <div className="w-12 sm:w-16 h-px bg-slate-300"></div>
              <div className="flex items-center gap-2">
                <span 
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${
                    bulkStep === 'review' 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200' 
                      : 'bg-white text-slate-400 border-slate-200'
                  }`}
                >
                  <CheckCircle size={14} />
                </span>
                <span className={`text-xs sm:text-sm font-semibold ${bulkStep === 'review' ? 'text-slate-900' : 'text-slate-400'}`}>
                  مراجعة
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-50/30 min-h-0">
              
              {bulkStep === 'import' && (
                <>
                  {/* Source Method Tabs */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-5 shadow-sm">
                    <div className="flex bg-slate-100 p-1 rounded-xl mb-4 sm:mb-5">
                      <button
                        onClick={() => setBulkSourceMethod('file')}
                        className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                          bulkSourceMethod === 'file' 
                            ? 'bg-white text-indigo-600 shadow-md' 
                            : 'text-slate-500'
                        }`}
                      >
                        ملف
                      </button>
                      <button
                        onClick={() => setBulkSourceMethod('paste')}
                        className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                          bulkSourceMethod === 'paste' 
                            ? 'bg-white text-indigo-600 shadow-md' 
                            : 'text-slate-500'
                        }`}
                      >
                        لصق نص
                      </button>
                      <button
                        onClick={() => setBulkSourceMethod('sheet')}
                        className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                          bulkSourceMethod === 'sheet' 
                            ? 'bg-white text-indigo-600 shadow-md' 
                            : 'text-slate-500'
                        }`}
                      >
                        <span className="hidden sm:inline">رابط </span>Sheet
                      </button>
                    </div>

                    {/* File Upload Panel */}
                    {bulkSourceMethod === 'file' && (
                      <div className="space-y-3 sm:space-y-4">
                        <label className="flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed border-sky-200 rounded-xl bg-sky-50/30 hover:bg-sky-50/80 cursor-pointer transition-all group">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 bg-white rounded-full flex items-center justify-center shadow-sm text-sky-500 mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                            <FileSpreadsheet size={20} />
                          </div>
                          <span className="text-xs sm:text-sm font-bold text-slate-700 text-center">اختر أو اسحب ملف Excel/CSV</span>
                          <span className="text-xs text-slate-500 mt-1 text-center">يجب أن يحتوي على (كود، اسم، رصيد)</span>
                          {selectedFile && (
                            <span className="mt-2 sm:mt-3 px-3 py-1 bg-sky-100 text-sky-700 text-xs rounded-full font-mono max-w-full truncate">
                              {selectedFile.name}
                            </span>
                          )}
                          <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileChange} />
                        </label>
                        <button
                          onClick={handleBulkFileUpload}
                          className="w-full py-2.5 sm:py-3 rounded-xl bg-sky-500 text-white text-sm font-bold shadow-md hover:bg-sky-600 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        >
                          تحميل ومعاينة
                          <ArrowLeft size={16} />
                        </button>
                      </div>
                    )}

                    {/* Paste Panel */}
                    {bulkSourceMethod === 'paste' && (
                      <div className="space-y-3 sm:space-y-4">
                        <textarea
                          value={pasteText}
                          onChange={(e) => setPasteText(e.target.value)}
                          rows="5"
                          className="w-full p-3 sm:p-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none resize-none font-mono"
                          placeholder="الصق بيانات الأعمدة هنا..."
                        />
                        <button
                          onClick={handleBulkPasteSubmit}
                          className="w-full py-2.5 sm:py-3 rounded-xl bg-sky-500 text-white text-sm font-bold shadow-md hover:bg-sky-600 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        >
                          معاينة النص
                          <ArrowLeft size={16} />
                        </button>
                      </div>
                    )}

                    {/* Sheet URL Panel */}
                    {bulkSourceMethod === 'sheet' && (
                      <div className="space-y-3 sm:space-y-4">
                        <div className="bg-sky-50/50 border border-sky-100 rounded-xl p-2.5 sm:p-3 flex gap-2 sm:gap-3 text-sky-700 text-xs">
                          <Info size={16} className="mt-0.5 shrink-0" />
                          <p>تأكد من أن رابط Google Sheet متاح للمشاهدة.</p>
                        </div>
                        <input
                          type="url"
                          value={sheetUrl}
                          onChange={(e) => setSheetUrl(e.target.value)}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                          placeholder="رابط Google Sheet"
                        />
                        <input
                          type="text"
                          value={sheetName}
                          onChange={(e) => setSheetName(e.target.value)}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                          placeholder="اسم الورقة (اختياري)"
                        />
                        <button
                          onClick={handleBulkSheetSubmit}
                          className="w-full py-2.5 sm:py-3 rounded-xl bg-sky-500 text-white text-sm font-bold shadow-md hover:bg-sky-600 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        >
                          معاينة الرابط
                          <ArrowLeft size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Review Step */}
              {bulkStep === 'review' && stagingItems.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-3 sm:p-5 border-b border-slate-100 flex flex-wrap gap-3 sm:gap-4 justify-between items-center bg-slate-50/50">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-800">مراجعة البيانات</h3>
                      <p className="text-xs text-slate-500 mt-0.5">تأكد من صحة الحقول قبل الحفظ</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-700 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-emerald-200 shadow-sm">
                      <CheckCircle size={14} />
                      {stagingItems.length} صف
                    </span>
                  </div>

                  <div className="px-3 sm:px-5 py-2.5 sm:py-3 border-b border-slate-100 bg-white">
                    <select
                      value={bulkReviewKind}
                      onChange={(e) => setBulkReviewKind(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                    >
                      <option value="debt_receivable">لنا — دين على المعتمد</option>
                      <option value="debt_payable">علينا — صندوق + مطلوب دفع</option>
                      <option value="debt_payable_no_fund">لهم — مطلوب دفع + ربح خصم (بدون صندوق رئيسي)</option>
                    </select>
                  </div>

                  {/* Staging Table - Desktop */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                        <tr>
                          <th className="p-3 text-xs font-bold text-center text-slate-600">#</th>
                          <th className="p-3 text-xs font-bold text-right text-slate-600">المعتمد</th>
                          <th className="p-3 text-xs font-bold text-right text-slate-600">المبلغ</th>
                          {bulkReviewKind !== 'debt_receivable' && (
                            <th className="p-3 text-xs font-bold text-center text-slate-800">خصم %</th>
                          )}
                          <th className="p-3 text-xs font-bold text-center text-slate-800">إجراء</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stagingItems.map((item, index) => (
                          <tr
                            key={index}
                            className="border-b border-slate-100 hover:bg-slate-50/50 transition"
                          >
                            <td className="p-3 text-center text-xs text-slate-400">{item.lineIndex}</td>
                            <td className="p-3">
                              <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                              {item.code && (
                                <div className="text-xs font-mono text-slate-500 mt-0.5">{item.code}</div>
                              )}
                            </td>
                            <td className="p-3 font-bold text-indigo-700 tabular-nums">
                              {formatMoney(item.amount)}
                            </td>
                            {bulkReviewKind !== 'debt_receivable' && (
                              <td className="p-3">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  value={item.discountPct}
                                  onChange={(e) => {
                                    const newItems = [...stagingItems];
                                    newItems[index].discountPct = e.target.value;
                                    setStagingItems(newItems);
                                  }}
                                  className="w-24 px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-center focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                                  placeholder="—"
                                />
                              </td>
                            )}
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleRemoveStagingRow(index)}
                                className="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-700 transition shadow-sm"
                                title="حذف الصف"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Staging Cards - Mobile */}
                  <div className="sm:hidden p-3 space-y-2">
                    {stagingItems.map((item, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs bg-white/55 border border-white/65 text-slate-600 px-2 py-0.5 rounded font-bold">
                            #{item.lineIndex}
                          </span>
                          <button
                            onClick={() => handleRemoveStagingRow(index)}
                            className="w-7 h-7 inline-flex items-center justify-center rounded-lg bg-red-600 text-white"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <div className="bg-white/72 border border-white/85 rounded-lg p-2.5 mb-2">
                          <div className="font-bold text-slate-900 text-sm text-center">{item.name}</div>
                          {item.code && (
                            <div className="text-xs font-mono text-slate-600 text-center mt-1">{item.code}</div>
                          )}
                        </div>
                        <div className="bg-white/65 border border-white/85 rounded-lg p-2 mb-2">
                          <div className="text-xs text-indigo-600 font-bold text-center mb-1">المبلغ</div>
                          <div className="text-base font-bold text-indigo-900 text-center tabular-nums">
                            {formatMoney(item.amount)}
                          </div>
                        </div>
                        {bulkReviewKind !== 'debt_receivable' && (
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">خصم %</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={item.discountPct}
                              onChange={(e) => {
                                const newItems = [...stagingItems];
                                newItems[index].discountPct = e.target.value;
                                setStagingItems(newItems);
                              }}
                              className="w-full px-3 py-2 rounded-lg border border-white/85 bg-white/75 text-sm text-center"
                              placeholder="—"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Footer Buttons */}
                  <div className="border-t border-slate-200 bg-gradient-to-b from-slate-50/95 to-white px-3 sm:px-6 py-3 sm:py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full max-w-2xl mx-auto">
                      <button
                        onClick={handleClearBulkStaging}
                        className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl border border-slate-300 text-slate-700 text-sm font-bold hover:bg-slate-100 transition flex items-center justify-center gap-2"
                      >
                        <X size={18} />
                        تراجع وإلغاء
                      </button>
                      <button
                        onClick={handleCommitBulk}
                        className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-md hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5 transition flex items-center justify-center gap-2"
                      >
                        <Save size={18} />
                        حفظ واعتماد
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delivery Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0 sm:rounded-t-2xl rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <HandCoins size={20} />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-slate-800">تسليم معتمدين</h4>
                  <p className="text-xs text-slate-500 mt-0.5">اختر الدورة، حدّد ذوي الرصيد، ثم نفّذ التسليم</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeliveryModal(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/30">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-4">
                <label className="block text-xs font-semibold text-slate-600 mb-2">دورة مالية</label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none">
                  <option value="">— دورة —</option>
                </select>
              </div>
              <p className="text-sm text-slate-600 text-center py-8">قريباً: قائمة المعتمدين للتسليم</p>
            </div>

            <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-slate-100 bg-slate-50/50 flex gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => setShowDeliveryModal(false)}
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl border border-slate-300 text-slate-700 text-sm font-bold hover:bg-slate-100 transition"
              >
                إلغاء
              </button>
              <button
                onClick={() => alert('تسليم')}
                className="flex-1 px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-md hover:bg-emerald-700 transition flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                تسليم
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedApproval && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-bold text-slate-900">{selectedApproval.name}</h4>
                <p className="text-sky-600 font-semibold mt-1 tabular-nums">
                  الصافي: {formatMoney(selectedApproval.balance)}
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-slate-600 p-2"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex gap-2 mb-4">
              <button 
                onClick={() => setShowAddAmountPanel(!showAddAmountPanel)}
                className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition"
              >
                إضافة مبلغ
              </button>
              <button 
                onClick={() => setShowTransferPanel(!showTransferPanel)}
                className="flex-1 py-2 rounded-xl bg-slate-600 text-white text-sm font-semibold hover:bg-slate-700 transition"
              >
                تحويل
              </button>
              <button className="py-2 px-3 rounded-xl bg-amber-100 text-amber-800 text-sm font-semibold hover:bg-amber-200 transition">
                تثبيت
              </button>
            </div>

            {showAddAmountPanel && (
              <div className="space-y-2 mb-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-semibold text-slate-600 mb-2">إضافة مبلغ للمعتمد</p>
                <select className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white outline-none">
                  <option value="debt_receivable">لنا — دين على المعتمد (بدون صندوق)</option>
                  <option value="debt_payable">علينا — صندوق رئيسي + مطلوب دفع</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  placeholder="المبلغ"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white outline-none"
                />
                <button className="w-full py-2 rounded-lg bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition">
                  تسجيل
                </button>
              </div>
            )}

            {showTransferPanel && (
              <div className="space-y-2 mb-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-semibold text-slate-600 mb-2">تحويل</p>
                <select className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white outline-none">
                  <option>تسليم يدوي</option>
                  <option>تحويل صندوق</option>
                  <option>تحويل (شركة)</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  placeholder="المبلغ"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white outline-none"
                />
                <button className="w-full py-2 rounded-lg bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition">
                  تنفيذ
                </button>
              </div>
            )}

            <h5 className="font-bold text-slate-800 mb-2">السجل</h5>
            <div className="text-sm text-slate-400 text-center py-4">
              <p>لا توجد سجلات</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approvals;
