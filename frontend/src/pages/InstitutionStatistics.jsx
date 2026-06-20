import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users,
  UserPlus,
  ScanLine,
  Zap,
  Search,
  Filter,
  X,
  Loader2
} from 'lucide-react';

const kpis = [
  {
    key: 'operators',
    title: 'Active Operators',
    value: '34',
    icon: Users,
    glow: 'shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:shadow-[0_0_40px_rgba(16,185,129,0.3)]',
    border: 'border-slate-800 hover:border-emerald-500/60',
    iconBg: 'bg-emerald-900/30 border-emerald-500/40',
    iconColor: 'text-emerald-400',
  },
  {
    key: 'citizens',
    title: 'Citizens Enrolled',
    value: '2,450',
    icon: UserPlus,
    glow: 'shadow-[0_0_30px_rgba(8,145,178,0.15)] hover:shadow-[0_0_40px_rgba(8,145,178,0.3)]',
    border: 'border-slate-800 hover:border-cyan-500/60',
    iconBg: 'bg-cyan-900/30 border-cyan-500/40',
    iconColor: 'text-cyan-400',
  },
  {
    key: 'scans',
    title: 'Emergency Scans Performed',
    value: '187',
    icon: ScanLine,
    glow: 'shadow-[0_0_30px_rgba(217,70,239,0.15)] hover:shadow-[0_0_40px_rgba(217,70,239,0.3)]',
    border: 'border-slate-800 hover:border-fuchsia-500/60',
    iconBg: 'bg-fuchsia-900/30 border-fuchsia-500/40',
    iconColor: 'text-fuchsia-400',
  },
  {
    key: 'matches',
    title: 'Successful Matches',
    value: '99.4%',
    icon: Zap,
    glow: 'shadow-[0_0_30px_rgba(251,191,36,0.15)] hover:shadow-[0_0_40px_rgba(251,191,36,0.3)]',
    border: 'border-slate-800 hover:border-amber-500/60',
    iconBg: 'bg-amber-900/30 border-amber-500/40',
    iconColor: 'text-amber-400',
  }
];

const mockLogs = [
  {
    id: 'log-1',
    timestamp: 'Oct 24, 2026 - 08:05:12',
    actorRole: 'Institution',
    actorName: 'Anil',
    actorId: 'FEIRS-INST-1011-ADM',
    action: 'Logged into Facility Command Center',
    targetRole: null,
    targetName: 'Facility Command Center',
    targetId: '',
    status: 'SUCCESS',
    statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
  },
  {
    id: 'log-2',
    timestamp: 'Oct 24, 2026 - 08:30:45',
    actorRole: 'Institution',
    actorName: 'Apollo Hospital',
    actorId: 'FEIRS-INST-1011',
    action: 'Enrolled a New Operator',
    targetRole: 'Operator',
    targetName: 'Subham',
    targetId: 'FEIRS-OP-8821',
    status: 'SUCCESS',
    statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
  },
  {
    id: 'log-3',
    timestamp: 'Oct 24, 2026 - 08:45:00',
    actorRole: 'Institution',
    actorName: 'Apollo Hospital',
    actorId: 'FEIRS-INST-1011',
    action: 'Updated Profile Configuration',
    targetRole: 'Operator',
    targetName: 'Subham',
    targetId: 'FEIRS-OP-8821',
    status: 'INFO',
    statusColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
  },
  {
    id: 'log-4',
    timestamp: 'Oct 24, 2026 - 09:12:33',
    actorRole: 'Operator',
    actorName: 'Subham',
    actorId: 'FEIRS-OP-8821',
    action: 'Executed Profile Soft-Deletion Request',
    targetRole: 'Citizen',
    targetName: 'Nagesh',
    targetId: 'FEIRS-CITZ-1211',
    status: 'WARNING',
    statusColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
  },
  {
    id: 'log-5',
    timestamp: 'Oct 24, 2026 - 10:45:10',
    actorRole: 'Operator',
    actorName: 'Subham',
    actorId: 'FEIRS-OP-8821',
    action: 'Performed Emergency Biometric Scan',
    targetRole: 'Citizen',
    targetName: 'Nagesh',
    targetId: 'FEIRS-CITZ-1211',
    status: 'SUCCESS',
    statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
  },
  {
    id: 'log-6',
    timestamp: 'Oct 24, 2026 - 11:05:22',
    actorRole: 'Operator',
    actorName: 'Subham',
    actorId: 'FEIRS-OP-8821',
    action: 'Attempted Emergency Biometric Scan (No Match)',
    targetRole: 'Citizen',
    targetName: 'Unknown Patient',
    targetId: 'UNREGISTERED',
    status: 'WARNING',
    statusColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
  },
  {
    id: 'log-7',
    timestamp: 'Oct 24, 2026 - 11:45:55',
    actorRole: 'System',
    actorName: 'Security Protocol',
    actorId: 'FEIRS-SYS-SEC',
    action: 'Flagged 5 Consecutive Failed Logins',
    targetRole: 'Operator',
    targetName: 'Priya',
    targetId: 'FEIRS-OP-3312',
    status: 'FAILED',
    statusColor: 'text-red-400 bg-red-500/10 border-red-500/30'
  }
];

const defaultFilters = { time: 'All Time', actor: 'All Actors', target: 'All Targets', status: 'All Statuses' };

export default function InstitutionStatistics() {
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
          Statistics & Logs
        </h1>
        
        {/* Live Connection Badge */}
        <div className="flex items-center justify-center gap-1.5 mb-4 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-max">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <p className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
            Live Connection
          </p>
        </div>
      </div>

      {/* KPI Cards Grid - 2 Rows, 2 Cols */}
      <section className="relative z-10 w-full max-w-[1400px] mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`group bg-slate-900/80 backdrop-blur-xl border ${kpi.border} rounded-2xl p-6 shadow-xl ${kpi.glow} transition-all duration-300 flex items-center gap-4`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${kpi.iconBg} border border-slate-700/50 ${kpi.iconColor}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm text-slate-400 font-medium mb-1">{kpi.title}</p>
                  <h3 className="text-3xl font-black text-white">{kpi.value}</h3>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Logs Table Section */}
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
                placeholder="Search logs..." 
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
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Actor Role</label>
                      <select 
                        value={tempFilters.actor}
                        onChange={(e) => setTempFilters({...tempFilters, actor: e.target.value})}
                        className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg p-2 focus:outline-none focus:border-emerald-500/50"
                      >
                        <option>All Actors</option>
                        <option>Super Admin</option>
                        <option>Institution</option>
                        <option>Operator</option>
                        <option>System</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Entity</label>
                      <select 
                        value={tempFilters.target}
                        onChange={(e) => setTempFilters({...tempFilters, target: e.target.value})}
                        className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg p-2 focus:outline-none focus:border-emerald-500/50"
                      >
                        <option>All Targets</option>
                        <option>Super Admin</option>
                        <option>Institution</option>
                        <option>Operator</option>
                        <option>Citizen</option>
                        <option>System</option>
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
                        <option>Success</option>
                        <option>Failed</option>
                        <option>Warning</option>
                        <option>Info</option>
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
                    {key === 'time' ? 'Time: ' : key === 'actor' ? 'Actor: ' : key === 'target' ? 'Target: ' : 'Status: '}
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

          {/* Table Container (Sized for ~5 rows) */}
          <div className="w-full overflow-x-auto min-h-[350px] max-h-[430px] overflow-y-auto custom-scrollbar relative">
            
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
                  <p className="text-sm text-emerald-400 font-medium tracking-wide">Searching Logs...</p>
                </motion.div>
              )}
            </AnimatePresence>

            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-slate-950/80 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 w-[180px]">Timestamp</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 w-[250px]">Actor</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">Action</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 w-[250px]">Target</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 w-[120px] text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {mockLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    
                    {/* Timestamp */}
                    <td className="p-4 align-top">
                      <p className="text-xs text-slate-400 font-medium whitespace-nowrap">{log.timestamp}</p>
                    </td>

                    {/* Actor */}
                    <td className="p-4 align-top">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700 uppercase tracking-wider">
                            {log.actorRole}
                          </span>
                          <span className="text-sm font-bold text-white">{log.actorName}</span>
                        </div>
                        <span className="text-xs text-slate-500 font-mono">{log.actorId}</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="p-4 align-top">
                      <p className="text-sm text-slate-300 font-medium">{log.action}</p>
                    </td>

                    {/* Target */}
                    <td className="p-4 align-top">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {log.targetRole && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700 uppercase tracking-wider">
                              {log.targetRole}
                            </span>
                          )}
                          <span className="text-sm font-bold text-white">{log.targetName}</span>
                        </div>
                        {log.targetId && (
                          <span className="text-xs text-slate-500 font-mono">{log.targetId}</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4 align-top text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${log.statusColor}`}>
                        {log.status}
                      </span>
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
