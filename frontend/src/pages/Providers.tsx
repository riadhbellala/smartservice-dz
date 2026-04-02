/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { getProviders } from '../services/api';

const Providers = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';

  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState(initialCategory);

  const fetchProviders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getProviders({ search, city, category });
      setProviders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError('Failed to load providers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
    // eslint-disable-next-line
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProviders();
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-white border-b border-slate-100 py-4 px-6 sticky top-0 z-10 flex items-center gap-4">
        <span className="material-symbols-outlined text-slate-400 cursor-pointer" onClick={() => navigate('/')}>
          arrow_back
        </span>
        <h1 className="text-xl font-extrabold text-slate-800">Find Providers</h1>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name..."
                icon="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  location_on
                </span>
                <select 
                  className="w-full py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium outline-none transition-all pl-10 pr-10 appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <option value="">All Cities</option>
                  <option value="Algiers">Algiers</option>
                  <option value="Oran">Oran</option>
                  <option value="Constantine">Constantine</option>
                  <option value="Annaba">Annaba</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
            <div className="w-full md:w-56">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  category
                </span>
                <select 
                  className="w-full py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium outline-none transition-all pl-10 pr-10 appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option value="Medical">Medical</option>
                  <option value="Public Services">Public Services</option>
                  <option value="Legal">Legal</option>
                  <option value="Education">Education</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
            <Button type="submit" variant="primary" className="md:w-auto h-12">
              Filter
            </Button>
          </form>
        </div>

        {error && (
          <div className="text-center p-8 bg-red-50 text-red-500 rounded-xl mb-8 border border-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((sk) => (
              <div key={sk} className="bg-white rounded-2xl p-6 border border-slate-100 animate-pulse">
                <div className="w-16 h-16 bg-slate-200 rounded-xl mb-4"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-6"></div>
                <div className="h-10 bg-slate-200 rounded-xl w-full"></div>
              </div>
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center p-16 bg-white rounded-2xl border border-slate-100">
            <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">search_off</span>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No providers found</h3>
            <p className="text-slate-500">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900 mb-1 line-clamp-1">{p.businessName || `${p.user?.firstName} ${p.user?.lastName}`}</h3>
                    <div className="flex gap-2 items-center">
                      <span className="inline-block px-2.5 py-1 bg-blue-50 text-primary text-xs font-bold rounded-lg border border-blue-100 flex-shrink-0">
                        {p.category}
                      </span>
                      <span className="text-slate-500 text-sm flex items-center gap-1 line-clamp-1">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        {p.city}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex text-accent">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-[18px]">
                        {i < Math.floor(p.rating || 4) ? 'star' : 'star_border'}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-600 pl-1 border-l border-slate-200">
                    {p.rating || "4.5"} Rating
                  </span>
                </div>
                
                <Button fullWidth onClick={() => navigate(`/providers/${p.id}`)}>
                  View & Book
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Providers;
