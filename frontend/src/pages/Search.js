import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Search as SearchIcon, Users, Building, Truck, UserCog } from 'lucide-react';

const SearchPage = () => {
  const { search } = useData();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const data = await search(query);
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'client': return <Users className="w-5 h-5" />;
      case 'member': return <UserCog className="w-5 h-5" />;
      case 'agency': return <Building className="w-5 h-5" />;
      case 'company': return <Truck className="w-5 h-5" />;
      default: return <SearchIcon className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'client': return 'عميل';
      case 'member': return 'مستخدم';
      case 'agency': return 'وكالة';
      case 'company': return 'شركة';
      default: return type;
    }
  };

  return (
    <div className="space-y-6" data-testid="search-page">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">البحث</h1>
        <p className="text-slate-500 mt-1">ابحث عن عملاء أو معاملات</p>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input pr-12 py-3 text-lg"
          placeholder="ابحث عن عملاء، مستخدمين، وكالات، شركات..."
          data-testid="search-input"
        />
      </form>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="spinner w-8 h-8" />
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">تم العثور على {results.length} نتيجة</p>
          {results.map((result, idx) => (
            <div key={idx} className="card p-4 card-hover">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                  {getIcon(result.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{result.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge badge-info">{getTypeLabel(result.type)}</span>
                    {result.phone && <span className="text-sm text-slate-500">{result.phone}</span>}
                    {result.email && <span className="text-sm text-slate-500">{result.email}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <div className="card">
          <div className="empty-state py-12">
            <SearchIcon className="empty-state-icon" />
            <p className="empty-state-title">لا توجد نتائج</p>
            <p className="empty-state-text">جرب البحث بكلمات مختلفة</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
