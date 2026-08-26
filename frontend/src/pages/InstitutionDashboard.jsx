import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  Users, 
  DatabaseBackup, 
  Activity,
  ChevronRight
} from 'lucide-react';

const cards = [
  {
    key: 'enroll-operators',
    title: 'Enroll Operators',
    subtitle: 'New Staff Entry',
    description: 'Onboard new medical responders and security personnel into your facility roster.',
    icon: UserPlus,
    path: '/institution/enroll-operators',
    glow: 'shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:shadow-[0_0_40px_rgba(16,185,129,0.3)]',
    border: 'border-slate-800 hover:border-emerald-500/60',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    iconBg: 'bg-emerald-900/30 border-emerald-500/40',
    iconColor: 'text-emerald-400',
  },
  {
    key: 'manage-operators',
    title: 'Manage Operators',
    subtitle: '34 Active Staff',
    description: 'View active operators, revoke access, and monitor individual emergency scanner usage.',
    icon: Users,
    path: '/institution/manage-operators',
    glow: 'shadow-[0_0_30px_rgba(249,115,22,0.15)] hover:shadow-[0_0_40px_rgba(249,115,22,0.3)]',
    border: 'border-slate-800 hover:border-orange-500/60',
    badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    iconBg: 'bg-orange-900/30 border-orange-500/40',
    iconColor: 'text-orange-400',
  },
  {
    key: 'data-change',
    title: 'Request Data Change',
    subtitle: 'Legal Updates',
    description: 'Submit official requests to the Super Admin to update your facility address or legal name.',
    icon: DatabaseBackup,
    path: '/institution/request-data-change',
    glow: 'shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:shadow-[0_0_40px_rgba(168,85,247,0.3)]',
    border: 'border-slate-800 hover:border-purple-500/60',
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    iconBg: 'bg-purple-900/30 border-purple-500/40',
    iconColor: 'text-purple-400',
  },
  {
    key: 'statistics',
    title: 'Statistics & Logs',
    subtitle: 'Facility Audits',
    description: 'Review internal facility metrics, scan logs, and patient identification history.',
    icon: Activity,
    path: '/institution/statistics',
    glow: 'shadow-[0_0_30px_rgba(34,211,238,0.15)] hover:shadow-[0_0_40px_rgba(34,211,238,0.3)]',
    border: 'border-slate-800 hover:border-cyan-500/60',
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    iconBg: 'bg-cyan-900/30 border-cyan-500/40',
    iconColor: 'text-cyan-400',
  }
];

export default function InstitutionDashboard() {
  const navigate = useNavigate();

  const userStr = sessionStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isSuspended = user?.accountStatus === 'SUSPENDED';

  return (
    <div className="w-full flex flex-col items-center gap-6 pb-20">
      
      {/* Header Section */}
      <div className="w-full relative flex flex-col items-center justify-center text-center mt-2 mb-8 max-w-[1400px] mx-auto">
        
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
          Facility Command Center
        </h1>
        
        {/* Live Connection Badge */}
        <div className="flex items-center justify-center gap-1.5 mb-4 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-max">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <p className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
            Live Connection
          </p>
        </div>

        <p className="text-sm text-slate-400 font-medium whitespace-nowrap">
          Welcome back to your Facility Management module. Select a sector below to manage your operational staff and data.
        </p>
      </div>

      {/* 4 Cards Grid - One Straight Line on LG screens */}
      <section className="relative z-10 w-full max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {cards.map((card, i) => {
            const Icon = card.icon;
            const isRestricted = isSuspended && card.key !== 'data-change';

            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={!isRestricted ? { y: -4 } : {}}
                onClick={() => {
                  if (!isRestricted) navigate(card.path);
                }}
                className={`relative group ${isRestricted ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'} bg-slate-900/80 backdrop-blur-xl border ${card.border} rounded-2xl p-6 shadow-xl ${!isRestricted ? card.glow : ''} transition-all duration-300 flex flex-col items-center text-center h-full overflow-hidden`}
              >
                {/* Suspension Overlay */}
                {isRestricted && (
                  <div className="absolute inset-0 z-20 bg-slate-950/95 flex flex-col items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center border border-red-500/30 mb-3">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    </span>
                    <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">Access Restricted</p>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                      Your account is suspended. Please request reactivation from Super Admin by submitting legal documents.
                    </p>
                  </div>
                )}

                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${card.iconBg} border border-slate-700/50 ${card.iconColor} mb-4 transition-transform ${!isRestricted ? 'group-hover:scale-110' : ''} duration-300`}>
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
                  disabled={isRestricted}
                  className={`w-full py-3 rounded-lg font-bold text-white text-xs bg-slate-800 border border-slate-700 ${!isRestricted ? 'group-hover:bg-slate-700' : ''} transition-all duration-300 flex items-center justify-center gap-2 mt-auto`}
                >
                  Enter Module
                  {!isRestricted && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </button>
              </motion.div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
