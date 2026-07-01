import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search,
  Filter,
  X,
  Loader2,
  User,
  ArrowRight
} from 'lucide-react';

const mockOperators = [
  {
    id: 'FEIRS-OP-8821',
    name: 'Subham',
    createdAt: 'Oct 20, 2026 - 14:30:05',
    status: 'ACTIVE',
  },
  {
    id: 'FEIRS-OP-3312',
    name: 'Priya',
    createdAt: 'Oct 18, 2026 - 09:15:22',
    status: 'SUSPENDED',
  },
  {
    id: 'FEIRS-OP-4491',
    name: 'Rahul Kumar',
    createdAt: 'Oct 15, 2026 - 11:45:11',
    status: 'ACTIVE',
  },
  {
    id: 'FEIRS-OP-1102',
    name: 'Dr. Sarah',
    createdAt: 'Oct 10, 2026 - 16:20:03',
    status: 'ACTIVE',
  },
  {
    id: 'FEIRS-OP-5523',
    name: 'Arjun',
    createdAt: 'Oct 05, 2026 - 08:00:45',
    status: 'ACTIVE',
  },
  {
    id: 'FEIRS-OP-9912',
    name: 'Neha Singh',
    createdAt: 'Sep 28, 2026 - 10:30:55',
    status: 'SUSPENDED',
  },
  {
    id: 'FEIRS-OP-2281',
    name: 'Vikas',
    createdAt: 'Sep 15, 2026 - 13:45:16',
    status: 'ACTIVE',
  },
  {
    id: 'FEIRS-OP-7744',
    name: 'Anjali',
    createdAt: 'Sep 02, 2026 - 09:20:23',
    status: 'ACTIVE',
  }
];

const defaultFilters = { status: 'All Statuses', time: 'All Time' };

export default function ManageOperators() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [tempFilters, setTempFilters] = useState(defaultFilters);
  const [activeFilters, setActiveFilters] = useState(defaultFilters);

  const simulateSearch = () => {
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 800);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') simulateSearch();
  };

  const handleApplyFilters = () => {
    setActiveFilters(tempFilters);
    setShowFilters(false);
    simulateSearch();
  };

  const removeFilter = (key) => {
    const updated = { ...activeFilters, [key]: defaultFilters[key] };
    setActiveFilters(updated);
    setTempFilters(updated);
    simulateSearch();
  };

  const hasActiveFilters = Object.keys(activeFilters).some(key => activeFilters[key] !== defaultFilters[key]);

  return (
    <div className="w-full flex flex-col items-center gap-6 pb-20">
      
      {/* Header Section */}
      <div className="w-full relative flex flex-col items-center justify-center text-center mt-2 mb-8 max-w-[1400px] mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
          Manage Operators
        </h1>
        
        {/* Live Connection Badge */}
        <div className="flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-max">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <p className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
            Live Connection
          </p>
        </div>
      </div>

      {/* Table Section */}
      <section className="relative z-10 w-full max-w-[1400px] mx-auto">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-950/50 relative">
            <div className="relative w-full sm:w-96">
              <button onClick={simulateSearch} className="absolute left-3 top-1/2 -translate-y-1/2 group">
                <Search className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </button>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search operators..." 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
            
            <div className="relative w-full sm:w-auto">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors w-full sm:w-auto justify-center border ${showFilters ? 'bg-slate-800 border-emerald-500/50 text-white' : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'}`}
              >
                <Filter className="w-4 h-4" />
                Advanced Filters
                {hasActiveFilters && (
                  <span className="flex items-center justify-center w-5 h-5 ml-1 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black">
                    {Object.values(activeFilters).filter(v => !v.startsWith('All')).length}
                  </span>
                )}
              </button>

              {/* Advanced Filter Dropdown */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-full sm:w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-4 flex flex-col gap-4"
                  >
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Time Period</label>
                      <select 
                        value={tempFilters.time}
                        onChange={(e) => setTempFilters({...tempFilters, time: e.target.value})}
                        className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg p-2 focus:outline-none focus:border-emerald-500/50"
                      >
                        <option>All Time</option>
                        <option>Today</option>
                        <option>This Week</option>
                        <option>This Month</option>
                        <option>This Year</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
                      <select 
                        value={tempFilters.status}
                        onChange={(e) => setTempFilters({...tempFilters, status: e.target.value})}
                        className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg p-2 focus:outline-none focus:border-emerald-500/50"
                      >
                        <option>All Statuses</option>
                        <option>Active</option>
                        <option>Suspended</option>
                      </select>
                    </div>
                    <button 
                      onClick={handleApplyFilters}
                      className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      Apply Filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/30 flex flex-wrap gap-2 items-center">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mr-2">Active Filters:</span>
              
              {Object.entries(activeFilters).map(([key, value]) => {
                if (value.startsWith('All')) return null;
                return (
                  <span key={key} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                    {key === 'status' ? 'Status: ' : 'Time: '}
                    <strong className="text-white">{value}</strong>
                    <button onClick={() => removeFilter(key)} className="hover:text-white ml-1"><X className="w-3 h-3" /></button>
                  </span>
                );
              })}
              
              <button 
                onClick={() => {
                  setActiveFilters(defaultFilters);
                  setTempFilters(defaultFilters);
                  simulateSearch();
                }} 
                className="text-xs text-slate-500 hover:text-slate-300 ml-2 underline underline-offset-2"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Table Container */}
          <div className="w-full overflow-x-auto min-h-[450px] max-h-[640px] overflow-y-auto custom-scrollbar relative">
            
            {/* Loading Overlay */}
            <AnimatePresence>
              {isSearching && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 bg-slate-950/60 backdrop-blur-[2px] flex flex-col items-center justify-center"
                >
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-2" />
                  <p className="text-sm text-emerald-400 font-medium tracking-wide">Searching Operators...</p>
                </motion.div>
              )}
            </AnimatePresence>

            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="bg-slate-950/80 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 w-[180px]">Account Created At</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 w-[205px] pl-[84px]">Photo</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 w-[180px]">Operator</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 w-[125px]">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 w-[120px] text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {mockOperators.map((op) => (
                  <tr key={op.id} className="hover:bg-slate-800/30 transition-colors">
                    
                    {/* Created At */}
                    <td className="p-4 align-middle">
                      <p className="text-xs text-slate-400 font-medium whitespace-nowrap">{op.createdAt}</p>
                    </td>

                    {/* Photo */}
                    <td className="p-4 align-middle">
                      <div className="flex ml-[30px]">
                        <div className="w-28 h-28 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden shadow-md">
                          <User className="w-14 h-14 text-slate-500" />
                        </div>
                      </div>
                    </td>

                    {/* Operator */}
                    <td className="p-4 align-middle">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-white">{op.name}</span>
                        <span className="text-xs text-slate-500 font-mono">{op.id}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4 align-middle text-left">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${op.status === 'ACTIVE' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-red-400 bg-red-500/10 border-red-500/30'}`}>
                        {op.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="p-4 align-middle text-left">
                      <button 
                        onClick={() => navigate(`/institution/manage-operators/${op.id}`)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-700/50 text-xs font-bold text-emerald-400 hover:text-white hover:border-emerald-500/80 hover:bg-emerald-500/20 transition-all"
                      >
                        View / Edit <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </section>
      
    </div>
  );
}
