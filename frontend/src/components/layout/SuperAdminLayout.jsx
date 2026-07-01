import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileCheck, 
  Building2, 
  DatabaseBackup, 
  Settings, 
  LogOut,
  Shield,
  User,
  Activity
} from 'lucide-react';

export default function SuperAdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { name: 'Pending Registrations', path: '/super-admin/pending-registrations', icon: FileCheck },
    { name: 'Manage Institutions', path: '/super-admin/manage-institutions', icon: Building2 },
    { name: 'Data Change Requests', path: '/super-admin/data-change-requests', icon: DatabaseBackup },
    { name: 'Statistics & Logs', path: '/super-admin/statistics', icon: Activity },
  ];

  const handleLogout = () => {
    navigate('/login/super-admin');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans flex flex-col overflow-x-hidden">
      
      {/* ── Top Navigation Bar ── */}
      <header className="w-full bg-[#020617]/90 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-50 flex items-center justify-between px-6 py-5 shadow-lg">
        
        {/* Brand / Logo (Left) */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate('/super-admin/dashboard')}
        >
          <div className="w-12 h-12 rounded-xl bg-cyan-900/30 border border-cyan-500/40 flex items-center justify-center group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(8,145,178,0.3)]">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-white tracking-tight leading-none">FEIRS</h1>
            <p className="text-xs font-bold tracking-[0.2em] text-cyan-400 uppercase mt-1">Super Admin</p>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden xl:flex items-center gap-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
            const Icon = link.icon;
            
            return (
              <button
                key={link.name}
                onClick={() => navigate(link.path)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 text-sm font-bold tracking-wide ${
                  isActive 
                    ? 'bg-cyan-900/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(8,145,178,0.15)]' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.name}
              </button>
            );
          })}
        </nav>

        {/* Profile & Logout (Right) */}
        <div className="flex items-center gap-4">
          
          <button 
            onClick={() => navigate('/super-admin/settings')}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-300 text-sm font-bold ${
              location.pathname === '/super-admin/settings'
                ? 'bg-cyan-900/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(8,145,178,0.15)]' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
            }`}
            title="Settings & Profile"
          >
            <Settings className="w-5 h-5" />
            <span className="hidden md:inline">Profile</span>
          </button>

          <div className="w-[1px] h-8 bg-slate-800 mx-1"></div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors border border-transparent hover:border-red-500/30 shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="flex-1 flex flex-col relative p-6 md:p-12 overflow-x-hidden">
        {/* Ambient Background Glow */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-900/10 blur-[150px] pointer-events-none rounded-[100%] z-0" />
        
        <div className="relative z-10 w-full max-w-[1400px] mx-auto min-h-full">
          <Outlet />
        </div>
      </main>

      {/* ── Slightly Larger Footer ── */}
      <footer className="py-8 bg-[#02040c] border-t border-slate-800/60 mt-auto flex flex-col items-center justify-center gap-2 relative z-10">
        <div className="flex items-center gap-2 opacity-50 mb-1">
          <Shield className="w-5 h-5 text-slate-400" />
          <span className="text-sm font-black text-slate-400 tracking-widest">FEIRS</span>
        </div>
        <p className="text-xs font-medium text-slate-500">
          Root Authority Module • High Security Access
        </p>
        <p className="text-[10px] font-bold tracking-[0.2em] text-slate-600 uppercase mt-2">
          © 2026 All Rights Reserved
        </p>
      </footer>

    </div>
  );
}
