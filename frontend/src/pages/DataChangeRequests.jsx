import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search,
  Filter,
  X,
  Loader2,
  Building2,
  ArrowRight
} from 'lucide-react';

const mockRequests = [
  {
    id: 'REQ-5001',
    instId: 'FEIRS-INST-1011',
    instName: 'Apollo Hospital',
    category: 'Address Change',
    requestedAt: 'Oct 24, 2026 - 11:30:05',
  },
  {
    id: 'REQ-5002',
    instId: 'FEIRS-INST-2022',
    instName: 'Central Medical Center',
    category: 'Multiple Changes',
    requestedAt: 'Oct 23, 2026 - 09:15:22',
  },
  {
    id: 'REQ-5003',
    instId: 'FEIRS-INST-3033',
    instName: 'CarePlus Medical',
    category: 'Email Change',
    requestedAt: 'Oct 21, 2026 - 14:45:11',
  },
  {
    id: 'REQ-5004',
    instId: 'FEIRS-INST-4044',
    instName: 'Rapid Response Hub',
    category: 'Institution Type Change',
    requestedAt: 'Oct 19, 2026 - 10:20:03',
  },
  {
    id: 'REQ-5005',
    instId: 'FEIRS-INST-5055',
    instName: 'City General Hospital',
    category: 'Address Change',
    requestedAt: 'Oct 18, 2026 - 16:00:25',
  },
  {
    id: 'REQ-5006',
    instId: 'FEIRS-INST-6066',
    instName: 'Highway Ambulance Hub',
    category: 'Multiple Changes',
    requestedAt: 'Oct 15, 2026 - 08:30:45',
  },
  {
    id: 'REQ-5007',
    instId: 'FEIRS-INST-7077',
    instName: 'Sunrise Maternity Home',
    category: 'Email Change',
    requestedAt: 'Oct 12, 2026 - 11:15:23',
  },
  {
    id: 'REQ-5008',
    instId: 'FEIRS-INST-8088',
    instName: 'Metro Health Clinic',
    category: 'Address Change',
    requestedAt: 'Oct 10, 2026 - 13:45:16',
  }
];

const defaultFilters = { updateCategory: 'All Categories', time: 'All Time' };

export default function DataChangeRequests() {
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
          Data Change Requests
        </h1>
        
        {/* Live Connection Badge */}
        <div className="flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 w-max">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <p className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
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
                <Search className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </button>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search institutions..." 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
            
            <div className="relative w-full sm:w-auto">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors w-full sm:w-auto justify-center border ${showFilters ? 'bg-slate-800 border-cyan-500/50 text-white' : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'}`}
              >
                <Filter className="w-4 h-4" />
                Advanced Filters
                {hasActiveFilters && (
                  <span className="flex items-center justify-center w-5 h-5 ml-1 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-black">
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
                        className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg p-2 focus:outline-none focus:border-cyan-500/50"
                      >
                        <option>All Time</option>
                        <option>Today</option>
                        <option>This Week</option>
                        <option>This Month</option>
                        <option>This Year</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Update Category</label>
                      <select 
                        value={tempFilters.updateCategory}
                        onChange={(e) => setTempFilters({...tempFilters, updateCategory: e.target.value})}
                        className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg p-2 focus:outline-none focus:border-cyan-500/50"
                      >
                        <option>All Categories</option>
                        <option>Institution Name Change</option>
                        <option>Institution Type Change</option>
                        <option>Sector Type Change</option>
                        <option>Email Change</option>
                        <option>Address Change</option>
                        <option>Multiple Changes</option>
                      </select>
                    </div>
                    <button 
                      onClick={handleApplyFilters}
                      className="w-full mt-2 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
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
                  <span key={key} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-900/30 border border-cyan-500/30 text-cyan-400 text-xs font-medium">
                    {key === 'updateCategory' ? 'Category: ' : 'Time: '}
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
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
                  <p className="text-sm text-cyan-400 font-medium tracking-wide">Searching Requests...</p>
                </motion.div>
              )}
            </AnimatePresence>

            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="bg-slate-950/80 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 w-[150px]">Requested At</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 w-[160px] pl-[84px]">Logo</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 w-[220px]">Institution</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 w-[150px]">Update Category</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 w-[100px] text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {mockRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-800/30 transition-colors">
                    
                    {/* Requested At */}
                    <td className="p-4 align-middle">
                      <p className="text-xs text-slate-400 font-medium whitespace-nowrap">{req.requestedAt}</p>
                    </td>

                    {/* Logo */}
                    <td className="p-4 align-middle">
                      <div className="flex ml-[30px]">
                        <div className="w-28 h-28 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden shadow-md">
                          <Building2 className="w-14 h-14 text-slate-500" />
                        </div>
                      </div>
                    </td>

                    {/* Institution */}
                    <td className="p-4 align-middle">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-white">{req.instName}</span>
                        <span className="text-xs text-slate-500 font-mono">{req.instId}</span>
                      </div>
                    </td>

                    {/* Update Category */}
                    <td className="p-4 align-middle text-left">
                      <span className="text-sm font-medium text-slate-300">
                        {req.category}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="p-4 align-middle text-left">
                      <button 
                        onClick={() => navigate(`/super-admin/data-change-requests/${req.id}`)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-700/50 text-xs font-bold text-cyan-400 hover:text-white hover:border-cyan-500/80 hover:bg-cyan-500/20 transition-all"
                      >
                        Review <ArrowRight className="w-3.5 h-3.5" />
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
