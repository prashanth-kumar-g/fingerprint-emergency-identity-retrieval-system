import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Building2,
  Stethoscope,
  Fingerprint,
  ChevronRight,
  Activity,
  HeartPulse,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';

const roles = [
  {
    key: 'super-admin',
    title: 'Super Admin',
    subtitle: 'Global Overwatch',
    description:
      'Root-level platform control. Review registrations, resolve compliance requests, and oversee the entire network.',
    icon: Shield,
    color: 'cyan',
    path: '/login/super-admin',
    features: ['Platform Oversight', 'Institution Approval', 'Compliance Audit'],
  },
  {
    key: 'institution',
    title: 'Institution Admin',
    subtitle: 'Command Center',
    description:
      'Manage your facility with precision. Onboard staff, monitor scan logs, and maintain compliance.',
    icon: Building2,
    color: 'emerald',
    path: '/login/institution',
    features: ['Staff Management', 'Scan Analytics', 'Tenant Isolation'],
  },
  {
    key: 'operator',
    title: 'Operator',
    subtitle: 'Lifesaver / Emergency Scan',
    description:
      'The frontline responder. Enroll citizens and perform emergency identity retrievals that alert contacts.',
    icon: Stethoscope,
    color: 'red',
    path: '/login/operator',
    features: ['Citizen Enrollment', 'Emergency Scan', 'Patient Lookup'],
  },
];

const colorMap = {
  cyan: {
    glow: 'shadow-[0_0_30px_rgba(8,145,178,0.15)] hover:shadow-[0_0_40px_rgba(8,145,178,0.3)]',
    border: 'border-slate-800 hover:border-cyan-500/60',
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    iconBg: 'bg-cyan-900/30 border-cyan-500/40',
    icon: 'text-cyan-400',
    dot: 'bg-cyan-400',
  },
  emerald: {
    glow: 'shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:shadow-[0_0_40px_rgba(16,185,129,0.3)]',
    border: 'border-slate-800 hover:border-emerald-500/60',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    iconBg: 'bg-emerald-900/30 border-emerald-500/40',
    icon: 'text-emerald-400',
    dot: 'bg-emerald-400',
  },
  red: {
    glow: 'shadow-[0_0_30px_rgba(239,68,68,0.15)] hover:shadow-[0_0_40px_rgba(239,68,68,0.3)]',
    border: 'border-slate-800 hover:border-red-500/60',
    badge: 'bg-red-500/10 text-red-400 border-red-500/30',
    iconBg: 'bg-red-900/30 border-red-500/40',
    icon: 'text-red-400',
    dot: 'bg-red-400',
  },
};

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full flex flex-col items-center gap-6 overflow-x-hidden pt-12 pb-20">
      {/* ── Background Ambient Lights ────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 flex justify-center">
        <div className="absolute top-[-20%] w-[1000px] h-[800px] rounded-[100%] bg-cyan-900/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] w-[800px] h-[600px] rounded-[100%] bg-emerald-900/10 blur-[150px]" />
      </div>

      {/* ════════════════════════════════════════════════════
          HERO SECTION
          ════════════════════════════════════════════════════ */}
      <section className="relative z-10 w-full flex flex-col items-center justify-center text-center px-4 max-w-[1200px] gap-4">
        
        {/* Title — Tiny, One-Line Forced */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-white w-full text-center whitespace-nowrap overflow-hidden text-ellipsis"
        >
          Fingerprint-based Emergency{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
            Identity Retrieval System
          </span>
        </motion.h1>

        {/* Post-Title Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700 shadow-xl"
        >
          <Fingerprint className="w-3 h-3 text-cyan-400" />
          <span className="text-[10px] sm:text-xs font-bold text-slate-300 tracking-[0.2em] uppercase">
            Next-Gen Emergency Platform
          </span>
        </motion.div>

        {/* Subtitle - Very compact */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xs sm:text-sm text-slate-400 font-medium max-w-3xl mx-auto leading-relaxed"
        >
          Instantly identify unconscious patients. Scan a fingerprint to retrieve critical medical history, blood type, and severe medical conditions in milliseconds. Automatic emergency alerts are instantly dispatched to registered emergency contacts for immediate response.
        </motion.p>

        {/* Call to Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center w-full mt-2"
        >
          <button
            onClick={() => navigate('/login/operator')}
            className="group flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-base rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] hover:-translate-y-1 w-full sm:w-auto"
          >
            <Activity className="w-5 h-5" />
            Launch Emergency Scanner
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════
          STATS BAR
          ════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative z-10 w-full max-w-[1000px] mx-auto px-4 mt-2"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Zap, label: 'Sub-Second Match', value: '< 1 second', color: 'text-cyan-400', bg: 'bg-cyan-900/30', glow: 'shadow-[0_0_20px_rgba(8,145,178,0.1)] hover:shadow-[0_0_30px_rgba(8,145,178,0.3)]', borderHover: 'hover:border-cyan-500/50' },
            { icon: HeartPulse, label: 'Medical Data', value: 'Instant Retrieval', color: 'text-red-400', bg: 'bg-red-900/30', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.1)] hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]', borderHover: 'hover:border-red-500/50' },
            { icon: AlertCircle, label: 'Contact Alerts', value: 'Automatic Dispatch', color: 'text-emerald-400', bg: 'bg-emerald-900/30', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]', borderHover: 'hover:border-emerald-500/50' },
          ].map((stat, i) => (
            <div
              key={i}
              className={`flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 transition-all duration-300 hover:-translate-y-1 cursor-default group ${stat.glow} ${stat.borderHover}`}
            >
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} mb-2 transition-transform duration-300 group-hover:scale-110`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-lg font-black text-white mb-0.5">{stat.value}</p>
              <p className="text-xs font-medium text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ════════════════════════════════════════════════════
          ROLE PORTALS
          ════════════════════════════════════════════════════ */}
      <section className="relative z-10 w-full max-w-[1200px] mx-auto px-4 flex flex-col items-center gap-6 mt-4">
        
        <div className="w-full flex items-center justify-center">
          <div className="h-[1px] w-full max-w-[100px] bg-gradient-to-r from-transparent to-slate-700" />
          <h2 className="text-2xl font-black text-white px-6 text-center">
            Choose Your Portal
          </h2>
          <div className="h-[1px] w-full max-w-[100px] bg-gradient-to-l from-transparent to-slate-700" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          {roles.map((role, i) => {
            const c = colorMap[role.color];
            const Icon = role.icon;

            return (
              <motion.div
                key={role.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                whileHover={{ y: -4 }}
                className={`group cursor-pointer bg-slate-900/80 backdrop-blur-xl border ${c.border} rounded-2xl p-6 shadow-xl ${c.glow} transition-all duration-300 flex flex-col items-center text-center`}
                onClick={() => navigate(role.path)}
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${c.iconBg} border border-slate-700/50 ${c.icon} mb-4 transition-transform group-hover:scale-110 duration-300`}>
                  <Icon className="w-7 h-7" />
                </div>

                {/* Badge */}
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold border ${c.badge} mb-4 tracking-wide`}>
                  {role.subtitle}
                </span>

                {/* Title */}
                <h3 className="text-xl font-black text-white mb-2">
                  {role.title}
                </h3>

                {/* Description */}
                <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">
                  {role.description}
                </p>

                {/* Action Button */}
                <button
                  className={`w-full py-3 rounded-lg font-bold text-white text-sm bg-slate-800 border border-slate-700 group-hover:bg-slate-700 transition-all duration-300 flex items-center justify-center gap-2`}
                >
                  Enter Portal
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
