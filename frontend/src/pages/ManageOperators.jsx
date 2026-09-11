import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search,
  Filter,
  X,
  Loader2,
  User,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import api from '../api/axiosConfig';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const monthName = months[d.getMonth()];
  const dayNum = d.getDate();
  const year = d.getFullYear();
  const timeStr = d.toLocaleTimeString('en-GB');
  
  return `${monthName} ${dayNum}, ${year} - ${timeStr}`;
};

const defaultFilters = { status: 'All Statuses', time: 'All Time' };

export default function ManageOperators() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [tempFilters, setTempFilters] = useState(defaultFilters);
  const [activeFilters, setActiveFilters] = useState(defaultFilters);

  const [operators, setOperators] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        setIsLoading(true);
        const userStr = sessionStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        if (!user?.id) {
          setError("User not found");
          return;
        }
        const response = await api.get(`/v1/operators?institutionId=${user.id}`);
        const sortedOperators = (response.data.operators || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOperators(sortedOperators);
      } catch (err) {
        console.error("Failed to fetch operators:", err);
        setError("Failed to fetch operators");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOperators();
  }, []);

  // Modify simulateSearch to just handle the local state if needed
  // For a real app, you'd apply filters to `operators` list.
  const simulateSearch = () => {
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 300); // reduced timeout
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

  // Filtering logic
  const filteredOperators = operators.filter(op => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!op.fullName?.toLowerCase().includes(q) && !op.operatorId?.toLowerCase().includes(q)) return false;
    }
    if (activeFilters.status !== 'All Statuses') {
      if (op.accountStatus !== activeFilters.status.toUpperCase()) return false;
    }
    return true;
  });

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
                        <option>Pending</option>
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
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 w-[160px] pl-[84px]">Photo</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 w-[180px]">Operator</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 w-[125px]">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 w-[120px] text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400">Loading operators...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-red-400 flex items-center justify-center gap-2">
                      <AlertCircle className="w-5 h-5" /> {error}
                    </td>
                  </tr>
                ) : filteredOperators.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400">No operators found.</td>
                  </tr>
                ) : (
                  filteredOperators.map((op) => (
                  <tr key={op.operatorId} className="hover:bg-slate-800/30 transition-colors">
                    
                    {/* Created At */}
                    <td className="p-4 align-middle">
                      <p className="text-xs text-slate-400 font-medium whitespace-nowrap">{formatDate(op.createdAt)}</p>
                    </td>

                    {/* Photo */}
                    <td className="p-4 align-middle">
                      <div className="flex ml-[30px]">
                        <div className="w-28 h-28 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden shadow-md">
                          {op.profilePhotoUrl ? (
                            <img src={op.profilePhotoUrl} alt="Operator" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-14 h-14 text-slate-500" />
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Operator */}
                    <td className="p-4 align-middle">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-white">{op.fullName}</span>
                        <span className="text-xs text-slate-500 font-mono">{op.operatorId}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4 align-middle text-left">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${
                        op.accountStatus === 'ACTIVE' 
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' 
                          : op.accountStatus === 'PENDING'
                          ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                          : 'text-red-400 bg-red-500/10 border-red-500/30'
                      }`}>
                        {op.accountStatus}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="p-4 align-middle text-left">
                      <button 
                        onClick={() => navigate(`/institution/manage-operators/${op.operatorId}`)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-700/50 text-xs font-bold text-emerald-400 hover:text-white hover:border-emerald-500/80 hover:bg-emerald-500/20 transition-all"
                      >
                        View / Edit <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>

                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </section>
      
    </div>
  );
}
