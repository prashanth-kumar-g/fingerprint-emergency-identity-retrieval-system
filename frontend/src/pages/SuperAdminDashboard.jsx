import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileCheck, 
  DatabaseBackup, 
  Building2, 
  Activity,
  ChevronRight
} from 'lucide-react';

const cards = [
  {
    key: 'registrations',
    title: 'Pending Registrations',
    subtitle: '12 Pending',
    description: 'Review and approve new facility applications requesting FEIRS network access.',
    icon: FileCheck,
    path: '/super-admin/registrations',
    glow: 'shadow-[0_0_30px_rgba(251,191,36,0.15)] hover:shadow-[0_0_40px_rgba(251,191,36,0.3)]',
    border: 'border-slate-800 hover:border-amber-500/60',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    iconBg: 'bg-amber-900/30 border-amber-500/40',
    iconColor: 'text-amber-400',
  },
  {
    key: 'data-changes',
    title: 'Data Change Requests',
    subtitle: '4 Updates',
    description: 'Process legal updates from active institutions regarding their registered addresses or names.',
    icon: DatabaseBackup,
    path: '/super-admin/data-changes',
    glow: 'shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:shadow-[0_0_40px_rgba(168,85,247,0.3)]',
    border: 'border-slate-800 hover:border-purple-500/60',
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    iconBg: 'bg-purple-900/30 border-purple-500/40',
    iconColor: 'text-purple-400',
  },
  {
    key: 'institutions',
    title: 'Manage Institutions',
    subtitle: '847 Active',
    description: 'The global directory. View active facilities, monitor licenses, and execute emergency suspensions.',
    icon: Building2,
    path: '/super-admin/institutions',
    glow: 'shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:shadow-[0_0_40px_rgba(16,185,129,0.3)]',
    border: 'border-slate-800 hover:border-emerald-500/60',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    iconBg: 'bg-emerald-900/30 border-emerald-500/40',
    iconColor: 'text-emerald-400',
  },
  {
    key: 'statistics',
    title: 'Statistics & Logs',
    subtitle: 'System Healthy',
    description: 'High-level analytics grid and immutable system-level audit logs for the entire platform.',
    icon: Activity,
    path: '/super-admin/statistics',
    glow: 'shadow-[0_0_30px_rgba(34,211,238,0.15)] hover:shadow-[0_0_40px_rgba(34,211,238,0.3)]',
    border: 'border-slate-800 hover:border-cyan-500/60',
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    iconBg: 'bg-cyan-900/30 border-cyan-500/40',
    iconColor: 'text-cyan-400',
  }
];

export default function SuperAdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="w-full flex flex-col items-center gap-6 pb-20">
      
      {/* Header Section */}
      <div className="w-full relative flex flex-col items-center justify-center text-center mt-2 mb-8 max-w-[1400px] mx-auto">
        
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
          Root Command Center
        </h1>
        
        {/* Live Connection Badge */}
        <div className="flex items-center justify-center gap-1.5 mb-4 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 w-max">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <p className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
            Live Connection
          </p>
        </div>

        <p className="text-sm text-slate-400 font-medium whitespace-nowrap">
          Welcome back to the FEIRS Root Authority module. Select a sector below to manage platform operations.
        </p>
      </div>

      {/* 4 Cards Grid - One Straight Line on LG screens */}
      <section className="relative z-10 w-full max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {cards.map((card, i) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                onClick={() => navigate(card.path)}
                className={`group cursor-pointer bg-slate-900/80 backdrop-blur-xl border ${card.border} rounded-2xl p-6 shadow-xl ${card.glow} transition-all duration-300 flex flex-col items-center text-center h-full`}
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${card.iconBg} border border-slate-700/50 ${card.iconColor} mb-4 transition-transform group-hover:scale-110 duration-300`}>
                  <Icon className="w-7 h-7" />
                </div>

                {/* Badge / Stats */}
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold border ${card.badge} mb-4 tracking-wide`}>
                  {card.subtitle}
                </span>

                {/* Title */}
                <h3 className="text-xl font-black text-white mb-2">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="text-slate-400 text-xs leading-relaxed mb-6 flex-grow">
                  {card.description}
                </p>

                {/* Action Button */}
                <button
                  className={`w-full py-3 rounded-lg font-bold text-white text-xs bg-slate-800 border border-slate-700 group-hover:bg-slate-700 transition-all duration-300 flex items-center justify-center gap-2 mt-auto`}
                >
                  Enter Module
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
