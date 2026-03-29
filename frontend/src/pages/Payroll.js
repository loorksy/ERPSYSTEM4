import React, { useState, useEffect } from 'react';
import { ClipboardCheck, CloudDownload, Check } from 'lucide-react';

const Payroll = () => {
  const [cycles, setCycles] = useState([]);
  const [selectedCycle, setSelectedCycle] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [auditSession, setAuditSession] = useState({
    show: false,
    closed: false,
    title: 'التدقيق نشط لهذه الدورة',
    subtitle: 'يُحفظ اختيار الدورة والجدول والأعمدة في هذا الجهاز. استخدم «إغلاق التدقيق» عند الانتهاء من العمل على هذه الدورة.'
  });

  // Form state
  const [formData, setFormData] = useState({
    spreadsheet: '',
    userInfoSheet: '',
    userInfoUserIdCol: 'C',
    userInfoTitleCol: 'D',
    userInfoSalaryCol: 'L',
    userInfoStatusCol: '',
    cycleMgmtUserIdCol: 'A',
    cycleAgentUserIdCol: 'A',
    cycleAgentSalaryCol: 'D',
    discountRate: '0',
    agentColor: '#3b82f6',
    managementColor: '#10b981'
  });

  const [results, setResults] = useState({
    message: '',
    summary: { total: 0, agent: 0, management: 0, notFound: 0 }
  });

  // Mock data
  useEffect(() => {
    setCycles([
      { id: 1, name: 'دورة يناير 2025' },
      { id: 2, name: 'دورة فبراير 2025' }
    ]);
  }, []);

  const handleLoadCycle = () => {
    if (!selectedCycle) {
      alert('اختر دورة مالية أولاً');
      return;
    }
    setShowOptions(true);
    setAuditSession({ ...auditSession, show: true });
  };

  const handleCloseAudit = () => {
    setAuditSession({
      ...auditSession,
      closed: true,
      title: 'تم إغلاق التدقيق'
    });
  };

  const handleReopenAudit = () => {
    setAuditSession({
      ...auditSession,
      closed: false,
      title: 'التدقيق نشط لهذه الدورة'
    });
  };

  const handleRunAudit = () => {
    // Simulate audit execution
    setResults({
      message: 'تم تنفيذ التدقيق بنجاح',
      summary: {
        total: 150,
        agent: 120,
        management: 25,
        notFound: 5
      }
    });
    setShowResults(true);
  };

  const handleSaveSettings = () => {
    console.log('Saving settings:', formData);
    alert('تم حفظ الإعدادات');
  };

  // Generate column options A-Z
  const generateColumnOptions = () => {
    const cols = [];
    for (let i = 0; i < 26; i++) {
      const letter = String.fromCharCode(65 + i);
      cols.push(letter);
    }
    return cols;
  };

  const columnOptions = generateColumnOptions();

  return (
    <div className="payroll-audit-page w-full min-w-0 px-3 sm:px-4 pb-24 sm:pb-10" dir="rtl" data-testid="payroll-page">
      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100">
        
        {/* Cycle Selection */}
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3">
            <div className="min-w-0 flex-1">
              <label htmlFor="payrollCycleSelect" className="mb-2 block text-sm font-medium text-slate-700">
                الدورة المالية
              </label>
              <select
                id="payrollCycleSelect"
                value={selectedCycle}
                onChange={(e) => setSelectedCycle(e.target.value)}
                className="w-full min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
              >
                <option value="">— اختر الدورة —</option>
                {cycles.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleLoadCycle}
              className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[#1e3a5f] px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#2d5a87] active:scale-[0.99] sm:w-auto sm:min-w-[11rem]"
            >
              <CloudDownload size={16} />
              تحميل الدورة
            </button>
          </div>
          {cycles.length === 0 && (
            <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              لا توجد دورات. أنشئ دورة من قسم Sheet أولاً.
            </p>
          )}
        </div>

        {/* Audit Options (shown after loading cycle) */}
        {showOptions && (
          <div className="border-t border-slate-200">
            <div className="space-y-6 p-5 sm:p-6">
              
              {/* Audit Session Banner */}
              {auditSession.show && (
                <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-amber-950">{auditSession.title}</p>
                      <p className="mt-2 text-xs leading-relaxed text-amber-900/90">{auditSession.subtitle}</p>
                    </div>
                    <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
                      {!auditSession.closed ? (
                        <button
                          onClick={handleCloseAudit}
                          className="inline-flex h-10 items-center justify-center rounded-lg bg-amber-600 px-3 text-xs font-semibold text-white shadow-sm hover:bg-amber-700 sm:min-w-[11rem]"
                        >
                          إغلاق التدقيق
                        </button>
                      ) : (
                        <button
                          onClick={handleReopenAudit}
                          className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-700 px-3 text-xs font-semibold text-white hover:bg-slate-800 sm:min-w-[11rem]"
                        >
                          إعادة فتح الجلسة
                        </button>
                      )}
                    </div>
                  </div>
                  {auditSession.closed && (
                    <p className="mt-3 border-t border-amber-200/80 pt-3 text-sm font-medium text-emerald-800">
                      <Check className="inline ml-1" size={16} />
                      تم إغلاق جلسة التدقيق لهذه الدورة.
                    </p>
                  )}
                </div>
              )}

              {/* Spreadsheet Selection */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3">
                <div className="min-w-0 flex-1">
                  <label htmlFor="payrollSpreadsheetSelect" className="mb-2 block text-sm font-medium text-slate-700">
                    جدول معلومات المستخدمين
                  </label>
                  <select
                    id="payrollSpreadsheetSelect"
                    value={formData.spreadsheet}
                    onChange={(e) => setFormData({ ...formData, spreadsheet: e.target.value })}
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                  >
                    <option value="">— جاري التحميل... —</option>
                  </select>
                </div>
                <button
                  onClick={handleRunAudit}
                  className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-[0.99] sm:w-auto sm:min-w-[11rem]"
                  title="مزامنة اللقطات ثم كتابة النتائج والألوان في Google"
                >
                  <ClipboardCheck size={16} />
                  تدقيق
                </button>
              </div>

              {/* Cycle Columns */}
              <div className="space-y-3">
                <p className="text-xs font-medium text-slate-500">أعمدة الدورة (الإدارة والوكيل)</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="min-w-0">
                    <label htmlFor="cycleMgmtUserIdCol" className="mb-2 block text-xs text-slate-600">
                      رقم المستخدم — الإدارة
                    </label>
                    <select
                      id="cycleMgmtUserIdCol"
                      value={formData.cycleMgmtUserIdCol}
                      onChange={(e) => setFormData({ ...formData, cycleMgmtUserIdCol: e.target.value })}
                      className="w-full min-h-[44px] rounded-lg border border-slate-300 bg-slate-50/50 px-2 py-2 text-sm text-slate-900 focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/30"
                    >
                      {columnOptions.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  <div className="min-w-0">
                    <label htmlFor="cycleAgentUserIdCol" className="mb-2 block text-xs text-slate-600">
                      رقم المستخدم — الوكيل
                    </label>
                    <select
                      id="cycleAgentUserIdCol"
                      value={formData.cycleAgentUserIdCol}
                      onChange={(e) => setFormData({ ...formData, cycleAgentUserIdCol: e.target.value })}
                      className="w-full min-h-[44px] rounded-lg border border-slate-300 bg-slate-50/50 px-2 py-2 text-sm text-slate-900 focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/30"
                    >
                      {columnOptions.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  <div className="min-w-0">
                    <label htmlFor="cycleAgentSalaryCol" className="mb-2 block text-xs text-slate-600">
                      الراتب — الوكيل
                    </label>
                    <select
                      id="cycleAgentSalaryCol"
                      value={formData.cycleAgentSalaryCol}
                      onChange={(e) => setFormData({ ...formData, cycleAgentSalaryCol: e.target.value })}
                      className="w-full min-h-[44px] rounded-lg border border-slate-300 bg-slate-50/50 px-2 py-2 text-sm text-slate-900 focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/30"
                    >
                      {columnOptions.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* User Info Columns */}
              <div className="space-y-3 border-t border-slate-100 pt-6">
                <p className="text-xs font-medium text-slate-500">ورقة وجدول معلومات المستخدمين</p>
                <div className="min-w-0">
                  <label htmlFor="userInfoSheetSelect" className="mb-2 block text-xs text-slate-600">
                    الورقة
                  </label>
                  <select
                    id="userInfoSheetSelect"
                    value={formData.userInfoSheet}
                    onChange={(e) => setFormData({ ...formData, userInfoSheet: e.target.value })}
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 bg-slate-50/50 px-2 py-2 text-sm text-slate-900 focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/30"
                  >
                    <option value="">أول ورقة</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="min-w-0">
                    <label htmlFor="userInfoUserIdCol" className="mb-2 block text-xs text-slate-600">
                      رقم المستخدم
                    </label>
                    <select
                      id="userInfoUserIdCol"
                      value={formData.userInfoUserIdCol}
                      onChange={(e) => setFormData({ ...formData, userInfoUserIdCol: e.target.value })}
                      className="w-full min-h-[44px] rounded-lg border border-slate-300 bg-slate-50/50 px-2 py-2 text-sm text-slate-900 focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/30"
                    >
                      {columnOptions.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  <div className="min-w-0">
                    <label htmlFor="userInfoTitleCol" className="mb-2 block text-xs text-slate-600">
                      اسم الورقة
                    </label>
                    <select
                      id="userInfoTitleCol"
                      value={formData.userInfoTitleCol}
                      onChange={(e) => setFormData({ ...formData, userInfoTitleCol: e.target.value })}
                      className="w-full min-h-[44px] rounded-lg border border-slate-300 bg-slate-50/50 px-2 py-2 text-sm text-slate-900 focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/30"
                    >
                      {columnOptions.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  <div className="min-w-0">
                    <label htmlFor="userInfoSalaryCol" className="mb-2 block text-xs text-slate-600">
                      كتابة الراتب
                    </label>
                    <select
                      id="userInfoSalaryCol"
                      value={formData.userInfoSalaryCol}
                      onChange={(e) => setFormData({ ...formData, userInfoSalaryCol: e.target.value })}
                      className="w-full min-h-[44px] rounded-lg border border-slate-300 bg-slate-50/50 px-2 py-2 text-sm text-slate-900 focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/30"
                    >
                      {columnOptions.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  <div className="min-w-0 col-span-2 sm:col-span-1">
                    <label htmlFor="userInfoStatusCol" className="mb-2 block text-xs text-slate-600">
                      الحالة (محاذي)
                    </label>
                    <select
                      id="userInfoStatusCol"
                      value={formData.userInfoStatusCol}
                      onChange={(e) => setFormData({ ...formData, userInfoStatusCol: e.target.value })}
                      className="w-full min-h-[44px] rounded-lg border border-slate-300 bg-slate-50/50 px-2 py-2 text-sm text-slate-900 focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/30"
                    >
                      <option value="">تلقائي (العمود التالي)</option>
                      {columnOptions.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Audit Settings */}
        <div className="border-t border-slate-200 p-5 sm:p-6">
          <p className="mb-4 text-xs font-medium text-slate-500">الخصم والألوان</p>
          <div className="space-y-4">
            <div>
              <label htmlFor="discountRate" className="mb-2 block text-sm font-medium text-slate-700">
                نسبة الخصم (%)
              </label>
              <input
                type="number"
                id="discountRate"
                value={formData.discountRate}
                onChange={(e) => setFormData({ ...formData, discountRate: e.target.value })}
                min="0"
                max="100"
                step="0.01"
                className="w-full max-w-xs min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="agentColor" className="mb-2 block text-sm font-medium text-slate-700">
                  لون الوكيل
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="agentColor"
                    value={formData.agentColor}
                    onChange={(e) => setFormData({ ...formData, agentColor: e.target.value })}
                    className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
                  />
                  <input
                    type="text"
                    value={formData.agentColor}
                    onChange={(e) => setFormData({ ...formData, agentColor: e.target.value })}
                    maxLength="7"
                    dir="ltr"
                    className="min-h-[44px] min-w-0 flex-1 rounded-lg border border-slate-300 px-2 font-mono text-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/30"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="managementColor" className="mb-2 block text-sm font-medium text-slate-700">
                  لون الإدارة
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="managementColor"
                    value={formData.managementColor}
                    onChange={(e) => setFormData({ ...formData, managementColor: e.target.value })}
                    className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
                  />
                  <input
                    type="text"
                    value={formData.managementColor}
                    onChange={(e) => setFormData({ ...formData, managementColor: e.target.value })}
                    maxLength="7"
                    dir="ltr"
                    className="min-h-[44px] min-w-0 flex-1 rounded-lg border border-slate-300 px-2 font-mono text-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/30"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={handleSaveSettings}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 sm:w-auto sm:min-w-[11rem]"
            >
              <span>💾</span>
              حفظ الإعدادات
            </button>
          </div>
        </div>

        {/* Results Section */}
        {showResults && (
          <div className="border-t border-slate-200">
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-3 sm:px-6">
              <span className="text-sm font-semibold text-slate-800">نتيجة التدقيق</span>
            </div>
            <div className="max-h-96 overflow-y-auto overscroll-contain p-5 sm:p-6">
              <div className="break-words text-sm leading-relaxed text-slate-600">
                <p className="font-semibold text-emerald-700 mb-2">{results.message}</p>
                <ul className="space-y-1 text-slate-600 mb-3">
                  <li>إجمالي الصفوف: <strong>{results.summary.total}</strong></li>
                  <li>سحب وكالة: <strong>{results.summary.agent}</strong></li>
                  <li>سحب إدارة: <strong>{results.summary.management}</strong></li>
                  <li>غير موجود: <strong>{results.summary.notFound}</strong></li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </article>
    </div>
  );
};

export default Payroll;
