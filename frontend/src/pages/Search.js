import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Search as SearchIcon, Users, Building, Truck, UserCog, ArrowLeft, X, ClipboardPaste, Filter } from 'lucide-react';

const SearchPage = () => {
  const { api, cycles } = useData();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeType, setActiveType] = useState('all');
  const [searchScope, setSearchScope] = useState('all_cycles');
  const [cycleId, setCycleId] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await api.get('/api/search', {
        params: {
          q: query.trim(),
          scope: searchScope,
          cycleId: searchScope === 'single_cycle' ? cycleId : undefined,
        },
      });
      const data = response.data;
      setResults(Array.isArray(data) ? data : data?.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setQuery(text.trim());
    } catch (error) {
      console.error('clipboard read failed', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'client':
        return <Users className="h-5 w-5" />;
      case 'member':
        return <UserCog className="h-5 w-5" />;
      case 'agency':
        return <Building className="h-5 w-5" />;
      case 'company':
        return <Truck className="h-5 w-5" />;
      default:
        return <SearchIcon className="h-5 w-5" />;
    }
  };

  const typeMeta = {
    client: { label: 'عميل', to: '/clients' },
    member: { label: 'مستخدم', to: '/member-directory' },
    agency: { label: 'وكالة', to: '/sub-agencies' },
    company: { label: 'شركة', to: '/transfer-companies' },
  };

  const filteredResults = useMemo(() => {
    if (activeType === 'all') return results;
    return results.filter((result) => result.type === activeType);
  }, [activeType, results]);

  const countsByType = useMemo(() => {
    const base = { all: results.length, client: 0, member: 0, agency: 0, company: 0 };
    results.forEach((result) => {
      if (base[result.type] !== undefined) base[result.type] += 1;
    });
    return base;
  }, [results]);

  const filterTabs = [
    { key: 'all', label: 'الكل' },
    { key: 'client', label: 'عملاء' },
    { key: 'member', label: 'مستخدمين' },
    { key: 'agency', label: 'وكالات' },
    { key: 'company', label: 'شركات' },
  ];

  return (
    <div className="space-y-6" dir="rtl" data-testid="search-page">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <h1 className="text-2xl font-bold text-slate-900">البحث والتدقيق</h1>
        <p className="mt-1 text-sm text-slate-500">استعلام عن مستخدم/عميل/وكالة/شركة عبر كل الدورات أو دورة محددة.</p>

        <form onSubmit={handleSearch} className="mt-4 space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">نطاق البحث</label>
              <div className="flex gap-2 rounded-xl bg-slate-100 p-1">
                <button type="button" onClick={() => setSearchScope('all_cycles')} className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${searchScope === 'all_cycles' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-600'}`}>كل الدورات</button>
                <button type="button" onClick={() => setSearchScope('single_cycle')} className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${searchScope === 'single_cycle' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-600'}`}>دورة محددة</button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">الدورة المالية</label>
              <select
                value={cycleId}
                onChange={(e) => setCycleId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm"
                disabled={searchScope !== 'single_cycle'}
              >
                <option value="">اختر دورة</option>
                {cycles.map((cycle) => (
                  <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative">
            <SearchIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-10 pl-20 text-base text-slate-800 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              placeholder="رقم مستخدم / اسم / هاتف / بريد"
              data-testid="search-input"
            />

            <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button type="button" onClick={pasteFromClipboard} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700" title="لصق من الحافظة">
                <ClipboardPaste className="h-4 w-4" />
              </button>
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setResults([]);
                  }}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            <SearchIcon className="h-4 w-4" />
            بحث
          </button>
        </form>
      </section>

      {results.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600"><Filter className="h-3 w-3" />النتائج</span>
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveType(tab.key)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  activeType === tab.key ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label} ({countsByType[tab.key] || 0})
              </button>
            ))}
          </div>
        </section>
      )}

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
          جاري البحث...
        </div>
      )}

      {!loading && filteredResults.length > 0 && (
        <section className="space-y-3">
          <p className="text-sm text-slate-500">تم العثور على {filteredResults.length} نتيجة مطابقة.</p>
          {filteredResults.map((result, idx) => {
            const meta = typeMeta[result.type] || { label: result.type, to: '/search' };
            return (
              <article key={`${result._id || idx}-${result.type}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">{getIcon(result.type)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{result.name || 'بدون اسم'}</h3>
                      <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">{meta.label}</span>
                    </div>

                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500">
                      {result.phone && <span>{result.phone}</span>}
                      {result.email && <span>{result.email}</span>}
                      {result.code && <span>كود: {result.code}</span>}
                    </div>
                  </div>

                  <Link to={meta.to} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-50">
                    فتح القسم
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {!loading && query && results.length === 0 && (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center">
          <SearchIcon className="mx-auto mb-3 h-9 w-9 text-slate-400" />
          <p className="text-base font-semibold text-slate-900">لا توجد نتائج</p>
          <p className="mt-1 text-sm text-slate-500">جرّب كلمة أخرى أو وسّع نطاق البحث.</p>
        </section>
      )}
    </div>
  );
};

export default SearchPage;
