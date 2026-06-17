import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, Building2, Stethoscope, Fingerprint, ArrowLeft, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const roleConfigs = {
  'super-admin': {
    title: 'Super Admin Authentication',
    subtitle: 'GLOBAL OVERWATCH AUTHORIZATION REQUIRED',
    icon: Shield,
    color: 'text-cyan-400',
    bgGlow: 'bg-cyan-900/20',
    borderColor: 'border-cyan-500/50',
    buttonColor: 'bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_20px_rgba(8,145,178,0.4)]',
    idPlaceholder: 'FEIRS-SA-ROOT',
    idLabel: 'Super Admin ID / Official Email',
  },
  'institution': {
    title: 'Institution Authentication',
    subtitle: 'FACILITY COMMAND CENTER LOGIN',
    icon: Building2,
    color: 'text-emerald-400',
    bgGlow: 'bg-emerald-900/20',
    borderColor: 'border-emerald-500/50',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]',
    idPlaceholder: 'FEIRS-INST-XXXXXX',
    idLabel: 'Institution ID / Official Email',
  },
  'operator': {
    title: 'Operator Authentication',
    subtitle: 'EMERGENCY MEDICAL SCANNER ACCESS',
    icon: Stethoscope,
    color: 'text-red-400',
    bgGlow: 'bg-red-900/20',
    borderColor: 'border-red-500/50',
    buttonColor: 'bg-red-600 hover:bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]',
    idPlaceholder: 'FEIRS-OP-XXXXXX',
    idLabel: 'Operator ID / Official Email',
  },
};

export default function LoginPage() {
  const { role } = useParams();
  const navigate = useNavigate();

  const [idValue, setIdValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [error, setError] = useState('');

  const config = roleConfigs[role];

  if (!config) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <h2 className="text-white">Invalid Role</h2>
      </div>
    );
  }

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (role === 'super-admin') {
      const isValidId = idValue === 'admin.feirs@gmail.com' || idValue === 'FEIRS-SA-ROOT';
      const isValidPassword = passwordValue === 'FeirsRoot@2026';

      if (isValidId && isValidPassword) {
        navigate('/super-admin/dashboard');
      } else {
        setError('Invalid Super Admin credentials. Authorization denied.');
      }
    } else if (role?.toLowerCase() === 'institution') {
      navigate('/institution/dashboard');
    } else if (role?.toLowerCase() === 'operator') {
      navigate('/operator/dashboard'); // Future proofing
    } else {
      navigate(`/${role}/dashboard`); // Fallback bypass
    }
  };

  const Icon = config.icon;

  return (
    <div className="flex-grow w-full flex flex-col items-center justify-center relative overflow-hidden py-10 px-4">
      
      {/* Background Ambient Glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full ${config.bgGlow} blur-[120px] pointer-events-none`} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-[500px]"
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm font-bold tracking-wide"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Platform Home
        </button>

        <div className={`w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-10 shadow-2xl relative overflow-hidden`}>
          
          {/* Top Line Accent */}
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${config.color.replace('text-', '')} to-transparent opacity-50`} />

          <div className="flex flex-col items-center text-center mb-10">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center bg-slate-800/50 border ${config.borderColor} ${config.color} mb-6 shadow-lg`}>
              <Icon className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2 whitespace-nowrap">{config.title}</h2>
            <p className={`text-xs font-bold tracking-[0.2em] uppercase ${config.color}`}>{config.subtitle}</p>
          </div>

          <form className="flex flex-col gap-6" onSubmit={handleLogin}>
            
            {error && (
              <div className="p-4 rounded-xl bg-red-900/30 border border-red-500/50 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-sm font-medium text-red-200">{error}</p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 tracking-wide uppercase">{config.idLabel}</label>
              <input 
                type="text" 
                value={idValue}
                onChange={(e) => setIdValue(e.target.value)}
                placeholder={config.idPlaceholder}
                className="w-full bg-slate-950 border border-slate-800 focus:border-slate-600 rounded-xl px-4 py-3 text-white outline-none transition-colors"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 tracking-wide uppercase">Authorization Password</label>
              <input 
                type="password" 
                value={passwordValue}
                onChange={(e) => setPasswordValue(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-slate-600 rounded-xl px-4 py-3 text-white outline-none transition-colors"
              />
            </div>

            <button type="submit" className={`w-full ${config.buttonColor} text-white font-bold text-lg rounded-xl py-4 mt-4 transition-all duration-300`}>
              Authenticate & Enter
            </button>
            
            {role === 'institution' && (
              <div className="text-center">
                <p className="text-slate-400 text-sm">
                  Not registered?{' '}
                  <button 
                    type="button"
                    onClick={() => navigate('/register/institution')}
                    className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors"
                  >
                    Apply for access
                  </button>
                </p>
              </div>
            )}
            
            <div className="flex items-center justify-center gap-2 mt-4 opacity-50">
              <Fingerprint className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">Secure Biometric Link</span>
            </div>
          </form>

        </div>
      </motion.div>
    </div>
  );
}
