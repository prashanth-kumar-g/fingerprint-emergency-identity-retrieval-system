import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
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

// Removed mockInstitutions

const defaultFilters = { time: 'All Time', status: 'All Statuses' };

export default function ManageInstitutionsList() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [tempFilters, setTempFilters] = useState(defaultFilters);
  const [activeFilters, setActiveFilters] = useState(defaultFilters);
  
  const [institutions, setInstitutions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/v1/super-admin/institutions');
        if (response.data.success) {
          const userStr = sessionStorage.getItem('user');
          const user = userStr ? JSON.parse(userStr) : null;
          const currentAdminId = user?.id;

          const filtered = response.data.institutions
            .filter(app => app.linkedSuperAdmin?.superAdminId === currentAdminId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setInstitutions(filtered);
        }
      } catch (err) {
        console.error("Failed to fetch institutions", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInstitutions();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = months[d.getMonth()];
    const dayNum = d.getDate().toString().padStart(2, '0');
    const yearNum = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');
    return `${monthName} ${dayNum}, ${yearNum} - ${hours}:${minutes}:${seconds}`;
  };

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
          Manage Institutions
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
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
                      <select 
                        value={tempFilters.status}
                        onChange={(e) => setTempFilters({...tempFilters, status: e.target.value})}
                        className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg p-2 focus:outline-none focus:border-cyan-500/50"
                      >
                        <option>All Statuses</option>
                        <option>Active</option>
                        <option>Suspended</option>
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
                    {key === 'time' ? 'Time: ' : 'Status: '}
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
                  <p className="text-sm text-cyan-400 font-medium tracking-wide">Searching Institutions...</p>
                </motion.div>
              )}
            </AnimatePresence>

            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="bg-slate-950/80 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 w-[150px]">Account Created At</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 w-[160px] pl-[84px]">Logo</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 w-[220px]">Institution</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 w-[130px]">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 w-[120px] text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {institutions.map((inst) => (
                  <tr key={inst.institutionId} className="hover:bg-slate-800/30 transition-colors">
                    
                    {/* Created At */}
                    <td className="p-4 align-middle">
                      <p className="text-xs text-slate-400 font-medium whitespace-nowrap">{formatDate(inst.createdAt)}</p>
                    </td>

                    {/* Logo */}
                    <td className="p-4 align-middle">
                      <div className="flex ml-[30px]">
                        <div className="w-28 h-28 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden shadow-md">
                          {inst.institutionLogoUrl ? (
                            <img src={inst.institutionLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-14 h-14 text-slate-500" />
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Institution */}
                    <td className="p-4 align-middle">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-white">{inst.institutionName}</span>
                        <span className="text-xs text-slate-500 font-mono">{inst.institutionId}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4 align-middle text-left">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${inst.accountStatus === 'ACTIVE' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' : 'text-red-400 bg-red-500/10 border-red-500/30'}`}>
                        {inst.accountStatus}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="p-4 align-middle text-left">
                      <button 
                        onClick={() => navigate(`/super-admin/manage-institutions/${inst.institutionId}`, { state: { institution: inst } })}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-700/50 text-xs font-bold text-cyan-400 hover:text-white hover:border-cyan-500/80 hover:bg-cyan-500/20 transition-all"
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
