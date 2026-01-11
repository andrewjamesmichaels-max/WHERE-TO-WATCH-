
import React, { useState, useEffect, useCallback } from 'react';
import { SearchIcon, MapPinIcon, FilterIcon, CloseIcon } from './components/Icons';
import WatchCard from './components/WatchCard';
import { AppState, WatchResult, SearchFilters } from './types';
import { fetchWatchAvailability } from './services/geminiService';

const GENRES = ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Thriller", "Documentary", "Animation", "Romance"];
const SERVICES = ["Netflix", "Disney+", "Prime Video", "HBO Max", "Hulu", "Apple TV+", "Paramount+"];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    query: '',
    loading: false,
    result: null,
    error: null,
    showFilters: false,
    filters: {
      genres: [],
      services: [],
      yearFrom: '',
      yearTo: ''
    },
    location: {
      city: null,
      country: null,
      coords: null
    }
  });

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            setState(prev => ({
              ...prev,
              location: { ...prev.location, coords: { latitude, longitude } }
            }));
          } catch (err) {
            console.error("Location fetching error:", err);
          }
        },
        (error) => {
          console.warn("Location permission denied:", error.message);
        }
      );
    }
  }, []);

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!state.query.trim()) return;

    setState(prev => ({ ...prev, loading: true, error: null, result: null }));

    try {
      const locationInfo = state.location.coords 
        ? `lat: ${state.location.coords.latitude}, lng: ${state.location.coords.longitude}` 
        : "my current location";
        
      const result = await fetchWatchAvailability(state.query, locationInfo, state.filters);
      setState(prev => ({ ...prev, result, loading: false }));
    } catch (err: any) {
      console.error(err);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: "Couldn't find precise streaming info. Please adjust filters and try again." 
      }));
    }
  }, [state.query, state.location.coords, state.filters]);

  const toggleFilter = (type: 'genres' | 'services', value: string) => {
    setState(prev => {
      const current = prev.filters[type];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return {
        ...prev,
        filters: { ...prev.filters, [type]: updated }
      };
    });
  };

  return (
    <div className="min-h-screen pb-20 px-4 pt-12 md:pt-16 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase">
          WHERE TO <span className="text-indigo-500">WATCH?</span>
        </h1>
        <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto">
          Your AI search for movies, shows, and cinema listings.
        </p>
      </div>

      <div className="max-w-3xl mx-auto mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon className="w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-40 py-4 bg-slate-800/40 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all text-base backdrop-blur-md shadow-lg"
              placeholder="Search title (e.g. Inception)..."
              value={state.query}
              onChange={(e) => setState(prev => ({ ...prev, query: e.target.value }))}
              disabled={state.loading}
            />
            <div className="absolute right-2 inset-y-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setState(prev => ({ ...prev, showFilters: !prev.showFilters }))}
                className={`p-2 rounded-xl border transition-all ${state.showFilters ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:text-white'}`}
                title="Toggle Filters"
              >
                <FilterIcon className="w-5 h-5" />
              </button>
              <button
                type="submit"
                disabled={state.loading || !state.query.trim()}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
              >
                {state.loading ? "..." : "Search"}
              </button>
            </div>
          </div>

          {state.showFilters && (
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Release Year</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" 
                      placeholder="From" 
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      value={state.filters.yearFrom}
                      onChange={(e) => setState(prev => ({ ...prev, filters: { ...prev.filters, yearFrom: e.target.value }}))}
                    />
                    <span className="text-slate-600">—</span>
                    <input 
                      type="number" 
                      placeholder="To" 
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      value={state.filters.yearTo}
                      onChange={(e) => setState(prev => ({ ...prev, filters: { ...prev.filters, yearTo: e.target.value }}))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Available On</label>
                  <div className="flex flex-wrap gap-2">
                    {SERVICES.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleFilter('services', s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${state.filters.services.includes(s) ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-900/30 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Genres</label>
                  <div className="flex flex-wrap gap-2">
                    {GENRES.map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => toggleFilter('genres', g)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${state.filters.genres.includes(g) ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300' : 'bg-slate-900/30 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>

        <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-slate-600 uppercase tracking-tighter">
          <div className="flex items-center gap-1.5">
            <MapPinIcon className="w-3 h-3" />
            <span>{state.location.coords ? "Location Active" : "Global Search"}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-800"></div>
          <div>AI Real-time Verification</div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        {state.loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 text-sm font-medium animate-pulse">Scanning streaming platforms...</p>
          </div>
        )}

        {state.error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-center text-sm max-w-md mx-auto mb-10">
            {state.error}
          </div>
        )}

        {state.result && !state.loading && (
          <WatchCard result={state.result} />
        )}

        {!state.result && !state.loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 opacity-50">
            {["Netflix Exclusives", "Disney+ Hits", "In Cinemas", "Trending 2024"].map((cat) => (
              <div key={cat} className="p-4 rounded-xl border border-slate-800 bg-slate-900/20 text-center">
                 <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">{cat}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
