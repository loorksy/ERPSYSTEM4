import React, { useState, useEffect } from 'react';
import { ClipboardCheck, CloudDownload, Check, AlertCircle, Save, Play } from 'lucide-react';

const Payroll = () => {
  const [cycles, setCycles] = useState([]);
  const [selectedCycle, setSelectedCycle] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleLoadCycle = async () => {
    if (!selectedCycle) {
      alert('اختر دورة مالية أولاً');
      return;
    }
    setLoading(true);
    // Simulate loading
    setTimeout(() => {
      setShowOptions(true);
      setAuditSession({ ...auditSession, show: true });
      setLoading(false);
    }, 1000);
  };

  const handleCloseAudit = () => {
    setAuditSession({
      ...auditSession,
      closed: true,
      title: 'تم إغلاق التدقيق',
      subtitle: 'هذه الدورة مُعلَّمة كمغلقة في النظام. يمكنك إعادة فتح الجلسة للمتابعة.'
    });
  };

  const handleReopenAudit = () => {
    setAuditSession({
      ...auditSession,
      closed: false,
      title: 'التدقيق نشط لهذه الدورة',
      subtitle: 'يُحفظ اختيار الدورة والجدول والأعمدة في هذا الجهاز.'
    });
  };

  const handleRunAudit = async () => {
    setLoading(true);
    // Simulate audit execution
    setTimeout(() => {
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
      setLoading(false);
    }, 2000);
  };

  const handleSaveSettings = () => {
    console.log('Saving settings:', formData);
    alert('✅ تم حفظ الإعدادات بنجاح');
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
    <div className="space-y-6 animate-fade-in" dir="rtl" data-testid="payroll-page">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="stat-icon bg-emerald-100">
          <ClipboardCheck className="text-emerald-600" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">تدقيق الرواتب</h1>
          <p className="text-sm text-slate-500 mt-0.5">مراجعة ومزامنة رواتب الموظفين</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        {/* Cycle Selection */}
        <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-white">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">اختيار الدورة المالية</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label htmlFor="cycleSelect" className="label">الدورة المالية</label>
              <select
                id="cycleSelect"
                value={selectedCycle}
                onChange={(e) => setSelectedCycle(e.target.value)}
                className="input"
                disabled={loading}
              >
                <option value="">— اختر الدورة —</option>
                {cycles.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="sm:self-end">
              <button
                onClick={handleLoadCycle}
                disabled={!selectedCycle || loading}
                className="btn btn-primary w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    <span>جاري التحميل...</span>
                  </>
                ) : (
                  <>
                    <CloudDownload size={18} />
                    <span>تحميل الدورة</span>
                  </>
                )}
              </button>
            </div>
          </div>
          {cycles.length === 0 && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              <AlertCircle size={16} className="inline ml-1" />
              لا توجد دورات. أنشئ دورة من قسم Sheet أولاً.
            </div>
          )}
        </div>

        {/* Audit Options */}
        {showOptions && (
          <>
            <div className="border-t border-slate-200"></div>
            <div className="p-4 sm:p-6 space-y-6">
              
              {/* Audit Session Banner */}
              {auditSession.show && (
                <div className={`p-4 rounded-lg border ${
                  auditSession.closed 
                    ? 'bg-emerald-50 border-emerald-200' 
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className="flex flex-col lg:flex-row gap-4 items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`text-sm font-semibold mb-2 ${
                        auditSession.closed ? 'text-emerald-900' : 'text-amber-900'
                      }`}>
                        {auditSession.closed ? <Check className="inline ml-1" size={16} /> : <AlertCircle className="inline ml-1" size={16} />}
                        {auditSession.title}
                      </h4>
                      <p className={`text-xs leading-relaxed ${
                        auditSession.closed ? 'text-emerald-800' : 'text-amber-800'
                      }`}>
                        {auditSession.subtitle}
                      </p>
                    </div>
                    <div className="flex gap-2 w-full lg:w-auto">
                      {!auditSession.closed ? (
                        <button onClick={handleCloseAudit} className="btn btn-secondary flex-1 lg:flex-none">
                          إغلاق التدقيق
                        </button>
                      ) : (
                        <button onClick={handleReopenAudit} className="btn btn-primary flex-1 lg:flex-none">
                          إعادة فتح الجلسة
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Spreadsheet Selection & Audit Button */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-4">جدول معلومات المستخدمين</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <select
                      value={formData.spreadsheet}
                      onChange={(e) => setFormData({ ...formData, spreadsheet: e.target.value })}
                      className="input"
                    >
                      <option value="">— اختر الجدول —</option>
                    </select>
                  </div>
                  <button
                    onClick={handleRunAudit}
                    disabled={loading}
                    className="btn btn-success w-full sm:w-auto"
                  >
                    {loading ? (
                      <>
                        <div className="spinner"></div>
                        <span>جاري التدقيق...</span>
                      </>
                    ) : (
                      <>
                        <Play size={18} />
                        <span>تدقيق</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Cycle Columns */}
              <div className="card bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">أعمدة الدورة</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="label text-xs">رقم المستخدم — الإدارة</label>
                    <select
                      value={formData.cycleMgmtUserIdCol}
                      onChange={(e) => setFormData({ ...formData, cycleMgmtUserIdCol: e.target.value })}
                      className="input text-sm"
                    >
                      {columnOptions.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label text-xs">رقم المستخدم — الوكيل</label>
                    <select
                      value={formData.cycleAgentUserIdCol}
                      onChange={(e) => setFormData({ ...formData, cycleAgentUserIdCol: e.target.value })}
                      className="input text-sm"
                    >
                      {columnOptions.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label text-xs">الراتب — الوكيل</label>
                    <select
                      value={formData.cycleAgentSalaryCol}
                      onChange={(e) => setFormData({ ...formData, cycleAgentSalaryCol: e.target.value })}
                      className="input text-sm"
                    >
                      {columnOptions.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* User Info Columns */}
              <div className="card bg-blue-50 border-blue-200 p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">أعمدة معلومات المستخدمين</h3>
                
                <div className="mb-4">
                  <label className="label text-xs">الورقة</label>
                  <select
                    value={formData.userInfoSheet}
                    onChange={(e) => setFormData({ ...formData, userInfoSheet: e.target.value })}
                    className="input text-sm"
                  >
                    <option value="">أول ورقة تلقائياً</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="label text-xs">رقم المستخدم</label>
                    <select
                      value={formData.userInfoUserIdCol}
                      onChange={(e) => setFormData({ ...formData, userInfoUserIdCol: e.target.value })}
                      className="input text-sm"
                    >
                      {columnOptions.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label text-xs">اسم الورقة</label>
                    <select
                      value={formData.userInfoTitleCol}
                      onChange={(e) => setFormData({ ...formData, userInfoTitleCol: e.target.value })}
                      className="input text-sm"
                    >
                      {columnOptions.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label text-xs">كتابة الراتب</label>
                    <select
                      value={formData.userInfoSalaryCol}
                      onChange={(e) => setFormData({ ...formData, userInfoSalaryCol: e.target.value })}
                      className="input text-sm"
                    >
                      {columnOptions.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="label text-xs">الحالة (محاذي)</label>
                    <select
                      value={formData.userInfoStatusCol}
                      onChange={(e) => setFormData({ ...formData, userInfoStatusCol: e.target.value })}
                      className="input text-sm"
                    >
                      <option value="">تلقائي</option>
                      {columnOptions.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Audit Settings */}
        <div className="border-t border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">إعدادات التدقيق</h3>
          <div className="space-y-4">
            <div className="max-w-xs">
              <label className="label">نسبة الخصم (%)</label>
              <input
                type="number"
                value={formData.discountRate}
                onChange={(e) => setFormData({ ...formData, discountRate: e.target.value })}
                min="0"
                max="100"
                step="0.01"
                className="input"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">لون الوكيل</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.agentColor}
                    onChange={(e) => setFormData({ ...formData, agentColor: e.target.value })}
                    className="h-11 w-16 cursor-pointer rounded-lg border-2 border-slate-300"
                  />
                  <input
                    type="text"
                    value={formData.agentColor}
                    onChange={(e) => setFormData({ ...formData, agentColor: e.target.value })}
                    maxLength="7"
                    dir="ltr"
                    className="input flex-1 font-mono text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="label">لون الإدارة</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.managementColor}
                    onChange={(e) => setFormData({ ...formData, managementColor: e.target.value })}
                    className="h-11 w-16 cursor-pointer rounded-lg border-2 border-slate-300"
                  />
                  <input
                    type="text"
                    value={formData.managementColor}
                    onChange={(e) => setFormData({ ...formData, managementColor: e.target.value })}
                    maxLength="7"
                    dir="ltr"
                    className="input flex-1 font-mono text-sm"
                  />
                </div>
              </div>
            </div>
            
            <button onClick={handleSaveSettings} className="btn btn-secondary w-full sm:w-auto">
              <Save size={18} />
              حفظ الإعدادات
            </button>
          </div>
        </div>

        {/* Results Section */}
        {showResults && (
          <>
            <div className="border-t border-slate-200"></div>
            <div className="bg-emerald-50">
              <div className="p-4 border-b border-emerald-200">
                <h3 className="text-sm font-semibold text-emerald-900">نتيجة التدقيق</h3>
              </div>
              <div className="p-4 sm:p-6">
                <div className="mb-4 p-4 bg-white rounded-lg border border-emerald-200">
                  <p className="font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                    <Check size={20} />
                    {results.message}
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <p className="text-2xl font-bold text-slate-900">{results.summary.total}</p>
                      <p className="text-xs text-slate-600 mt-1">إجمالي الصفوف</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{results.summary.agent}</p>
                      <p className="text-xs text-blue-600 mt-1">سحب وكالة</p>
                    </div>
                    <div className="text-center p-3 bg-emerald-50 rounded-lg">
                      <p className="text-2xl font-bold text-emerald-600">{results.summary.management}</p>
                      <p className="text-xs text-emerald-600 mt-1">سحب إدارة</p>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <p className="text-2xl font-bold text-amber-600">{results.summary.notFound}</p>
                      <p className="text-xs text-amber-600 mt-1">غير موجود</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Payroll;
