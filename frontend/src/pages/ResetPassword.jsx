import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { Shield, Building2, Stethoscope, ArrowLeft, AlertCircle, CheckCircle2, Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const roleConfigs = {
  'super-admin': {
    title: 'Set New Password',
    subtitle: 'SECURE GLOBAL OVERWATCH ACCESS',
    icon: Shield,
    color: 'text-cyan-400',
    bgGlow: 'bg-cyan-900/20',
    borderColor: 'border-cyan-500/50',
    buttonColor: 'bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_20px_rgba(8,145,178,0.4)]',
    mockId: 'FEIRS-SA-ROOT',
    mockEmail: 'admin.feirs@gmail.com',
    successBg: 'bg-cyan-500/20',
  },
  'institution': {
    title: 'Set New Password',
    subtitle: 'SECURE COMMAND CENTER ACCESS',
    icon: Building2,
    color: 'text-emerald-400',
    bgGlow: 'bg-emerald-900/20',
    borderColor: 'border-emerald-500/50',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]',
    mockId: 'FEIRS-INST-1011',
    mockEmail: 'apollo@hospital.com',
    successBg: 'bg-emerald-500/20',
  },
  'operator': {
    title: 'Set New Password',
    subtitle: 'SECURE SCANNER ACCESS',
    icon: Stethoscope,
    color: 'text-red-400',
    bgGlow: 'bg-red-900/20',
    borderColor: 'border-red-500/50',
    buttonColor: 'bg-red-600 hover:bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]',
    mockId: 'FEIRS-OP-8821',
    mockEmail: 'subham@feirs.com',
  },
};

export default function ResetPassword() {
  const { role } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [status, setStatus] = useState('idle'); // idle, loading, error, success
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Auto-hide error message after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
        if (status === 'error') setStatus('idle');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, status]);

  const config = roleConfigs[role];

  if (!config) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <h2 className="text-white">Invalid Role</h2>
      </div>
    );
  }

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');
  const id = searchParams.get('id');

  const decodeJwt = (t) => {
    try {
      const base64Url = t.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch(e) {
      return null;
    }
  };

  const payload = token ? decodeJwt(token) : null;
  const decodedEmail = payload && payload.sub ? payload.sub.split('|')[0] : '';
  const displayId = id || config.mockId;
  const displayEmail = decodedEmail || config.mockEmail;

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (passwordError) return;

    if (!password || !confirmPassword) {
      setStatus('error');
      setErrorMessage('Please fill in both password fields.');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError('Password must be 8-32 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.');
      return;
    }

    if (password !== confirmPassword) {
      setStatus('error');
      setErrorMessage('Passwords do not match.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    if (!token || !id) {
      setStatus('error');
      setErrorMessage('Invalid reset link. Missing security tokens.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/auth/reset-password/${role}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, id, newPassword: password }),
      });

      if (response.ok) {
        setStatus('success');
      } else {
        const errorData = await response.text();
        setStatus('error');
        setErrorMessage(errorData || 'Failed to process request.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Network error. Please try again.');
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


        <div className={`w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-10 shadow-2xl relative overflow-hidden`}>
          
          {/* Top Line Accent */}
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${config.color.replace('text-', '')} to-transparent opacity-50`} />

          <div className="flex flex-col items-center text-center mb-10">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center bg-slate-800/50 border ${config.borderColor} ${config.color} mb-6 shadow-lg`}>
              <KeyRound className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2 whitespace-nowrap">{config.title}</h2>
            <p className={`text-xs font-bold tracking-[0.2em] uppercase ${config.color}`}>{config.subtitle}</p>
          </div>

          {status === 'success' ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center py-6"
            >
              <div className={`w-16 h-16 rounded-full ${config.successBg} flex items-center justify-center border ${config.borderColor} mb-6`}>
                <CheckCircle2 className={`w-8 h-8 ${config.color}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Password Successfully Reset</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Your password has been successfully reset. You can now use your new password to securely access your portal.
              </p>
              
              <Link
                to={`/login/${role}`}
                className={`w-full ${config.buttonColor} flex items-center justify-center text-white font-bold text-sm rounded-xl py-4 mb-4 transition-all duration-300 block`}
              >
                Proceed to Login
              </Link>
            </motion.div>
          ) : (
            <form className="flex flex-col gap-6" onSubmit={handleResetPassword}>
              
              <div className="flex flex-col items-center justify-center mb-4 gap-1.5">
                <div className="px-4 py-2 rounded-full bg-slate-950 border border-slate-800 flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <span className="text-sm font-medium text-slate-300">{displayId}</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">{displayEmail}</span>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 tracking-wide uppercase">New Password</label>
                <div className="relative w-full">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    placeholder="••••••••••••"
                    disabled={status === 'loading'}
                    className={`w-full bg-slate-950 border ${passwordError ? 'border-red-500' : 'border-slate-800'} focus:border-slate-600 rounded-xl px-4 py-3 pr-12 text-white outline-none transition-colors disabled:opacity-50`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-red-400 text-xs font-semibold mt-1 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>{passwordError}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 tracking-wide uppercase">Confirm New Password</label>
                <div className="relative w-full">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    disabled={status === 'loading'}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-slate-600 rounded-xl px-4 py-3 pr-12 text-white outline-none transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {status === 'error' && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-red-900/30 border border-red-500/50 flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-sm font-medium text-red-200">{errorMessage}</p>
                </motion.div>
              )}

              <button 
                type="submit" 
                disabled={status === 'loading'}
                className={`w-full ${config.buttonColor} flex items-center justify-center text-white font-bold text-lg rounded-xl py-4 mt-4 transition-all duration-300 disabled:opacity-70`}
              >
                {status === 'loading' ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  'Reset Password'
                )}
              </button>

              <div className="text-center mt-2">
                <Link 
                  to={`/login/${role}`}
                  className={`text-sm font-bold ${config.color} hover:text-white transition-colors`}
                >
                  Back to Login Page
                </Link>
              </div>
            </form>
          )}

        </div>
      </motion.div>
    </div>
  );
}
