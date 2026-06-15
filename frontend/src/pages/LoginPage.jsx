import { useParams, useNavigate } from 'react-router-dom';
import { Shield, Building2, Stethoscope, ArrowLeft, Fingerprint } from 'lucide-react';
import { motion } from 'framer-motion';

const roleConfig = {
  'super-admin': {
    title: 'Super Admin Authentication',
    subtitle: 'Global Overwatch Authorization Required',
    icon: Shield,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-900/40 border-cyan-500/40',
    focusRing: 'focus:border-cyan-500 focus:ring-cyan-500/20',
    buttonBg: 'bg-cyan-600 hover:bg-cyan-500',
    buttonGlow: 'shadow-[0_0_30px_rgba(8,145,178,0.4)] hover:shadow-[0_0_50px_rgba(8,145,178,0.6)]',
    placeholderId: 'FEIRS-SA-ROOT',
    accent: 'text-cyan-400',
    bgGlow: 'bg-cyan-500/10'
  },
  institution: {
    title: 'Institution Authentication',
    subtitle: 'Facility Command Center Login',
    icon: Building2,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-900/40 border-emerald-500/40',
    focusRing: 'focus:border-emerald-500 focus:ring-emerald-500/20',
    buttonBg: 'bg-emerald-600 hover:bg-emerald-500',
    buttonGlow: 'shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_50px_rgba(16,185,129,0.6)]',
    placeholderId: 'FEIRS-INST-XXXXXX',
    accent: 'text-emerald-400',
    bgGlow: 'bg-emerald-500/10'
  },
  operator: {
    title: 'Operator Authentication',
    subtitle: 'Emergency Medical Scanner Access',
    icon: Stethoscope,
    iconColor: 'text-red-400',
    iconBg: 'bg-red-900/40 border-red-500/40',
    focusRing: 'focus:border-red-500 focus:ring-red-500/20',
    buttonBg: 'bg-red-600 hover:bg-red-500',
    buttonGlow: 'shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:shadow-[0_0_50px_rgba(239,68,68,0.6)]',
    placeholderId: 'FEIRS-OP-XXXXXX',
    accent: 'text-red-400',
    bgGlow: 'bg-red-500/10'
  },
};

export default function LoginPage() {
  const { role } = useParams();
  const navigate = useNavigate();
  const config = roleConfig[role];

  if (!config) {
    return (
      <div className="flex-grow flex items-center justify-center p-8">
        <div className="text-center bg-slate-900 border border-slate-700 p-12 rounded-3xl">
          <p className="text-slate-400 text-2xl mb-8">Unknown portal: <span className="text-white font-bold">{role}</span></p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const Icon = config.icon;

  return (
    <div className="min-h-[100vh] w-full flex flex-col items-center justify-center relative overflow-hidden py-20 px-6">
      
      {/* Background Ambient Glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full ${config.bgGlow} blur-[120px] pointer-events-none`} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[550px] relative z-10"
      >
        {/* Back Navigation */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors mb-8 group font-bold text-lg"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
          Back to Platform Home
        </button>

        {/* Massive Premium Login Box */}
        <div className="w-full bg-slate-900/80 backdrop-blur-2xl border-2 border-slate-700/80 rounded-[2.5rem] p-12 shadow-2xl flex flex-col items-center">
          
          {/* Icon */}
          <div className={`w-24 h-24 ${config.iconBg} border border-slate-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl`}>
            <Icon className={`w-12 h-12 ${config.iconColor}`} />
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 text-center leading-tight">
            {config.title}
          </h2>
          <p className={`text-lg font-bold ${config.accent} mb-10 text-center tracking-wide uppercase`}>
            {config.subtitle}
          </p>

          {/* Form */}
          <form
            className="w-full flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-400 tracking-wide uppercase px-2">
                System ID / Official Email
              </label>
              <input
                type="text"
                className={`w-full bg-slate-950/50 border-2 border-slate-700 text-white px-6 py-5 rounded-2xl text-lg font-medium ${config.focusRing} focus:outline-none focus:ring-4 transition-all placeholder:text-slate-600`}
                placeholder={config.placeholderId}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-400 tracking-wide uppercase px-2">
                Authorization Password
              </label>
              <input
                type="password"
                className={`w-full bg-slate-950/50 border-2 border-slate-700 text-white px-6 py-5 rounded-2xl text-lg font-medium ${config.focusRing} focus:outline-none focus:ring-4 transition-all placeholder:text-slate-600`}
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="button"
              className={`w-full mt-6 py-5 ${config.buttonBg} text-white rounded-2xl font-black text-xl ${config.buttonGlow} transition-all duration-300 hover:-translate-y-1`}
            >
              Authenticate & Enter
            </button>
          </form>

          {/* Footer branding inside login */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 w-full flex items-center justify-center gap-3">
            <Fingerprint className="w-5 h-5 text-slate-500" />
            <span className="text-sm font-bold text-slate-500 tracking-widest uppercase">
              Secure Biometric Link
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
