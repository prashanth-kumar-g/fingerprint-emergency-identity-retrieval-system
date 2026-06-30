import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Fingerprint, 
  ShieldCheck, 
  CheckCircle2
} from 'lucide-react';

export default function ManageCitizensGateway() {
  const navigate = useNavigate();
  
  // States: READY, SCANNING, IDENTIFIED, OTP_SENT
  const [gatewayState, setGatewayState] = useState('READY');
  const [fingerprintQuality, setFingerprintQuality] = useState(0);
  const [otpValue, setOtpValue] = useState('');

  // Simulated Citizen Data
  const citizenData = {
    name: 'Rajesh Kumar',
    id: 'FEIRS-CIT-12345'
  };

  const handleSimulateScan = () => {
    setGatewayState('SCANNING');
    
    // Simulate scan progression
    let quality = 0;
    const interval = setInterval(() => {
      quality += Math.floor(Math.random() * 20) + 10;
      if (quality >= 85) {
        quality = 87; // Final quality
        clearInterval(interval);
        setFingerprintQuality(quality);
        setTimeout(() => {
          // 80% chance of success for demonstration
          if (Math.random() > 0.2) {
            setGatewayState('IDENTIFIED');
            setTimeout(() => {
              setGatewayState('OTP_SENT');
            }, 1500);
          } else {
            setGatewayState('NOT_FOUND');
            // Reset back to ready after 3 seconds
            setTimeout(() => {
              setGatewayState('READY');
              setFingerprintQuality(0);
            }, 3000);
          }
        }, 500);
      } else {
        setFingerprintQuality(quality);
      }
    }, 400);
  };

  const handleVerifyOTP = () => {
    if (otpValue.length === 6) {
      // Route to Page 2
      navigate(`/operator/manage-citizens/${citizenData.id}`);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[80vh] pb-8 relative">
      
      {/* Background Ambient Glow (Operator Red Theme) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[500px] rounded-[100%] bg-red-900/10 blur-[150px] pointer-events-none z-0" />

      {/* Header Section */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center text-center mt-2 mb-8 max-w-[800px] mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
          Manage Citizens
        </h1>
        
        {/* Live Connection Badge */}
        <div className="flex items-center justify-center gap-1.5 mb-4 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 w-max">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
          <p className="text-[10px] font-bold tracking-widest text-red-400 uppercase">
            Live Connection
          </p>
        </div>
      </div>

      {/* Authentication Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-xl bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col items-center"
      >
        
        {/* Visual Anchor */}
        <div className="mb-6 bg-red-500/10 p-4 rounded-full border border-red-500/20">
          <Fingerprint className="w-12 h-12 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]" />
        </div>

        {/* Authentication Instructions */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-white mb-2">Biometric Authentication Required</h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
            Authenticate the citizen via a live fingerprint scan to securely access and manage their systemic records.
          </p>
        </div>

        {/* The Hardware Zone */}
        <div className="w-full flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className={`w-[312px] h-[325px] rounded-2xl border-4 bg-slate-950 flex flex-col items-center justify-center overflow-hidden shadow-xl transition-all duration-500 ${
              gatewayState === 'IDENTIFIED' || gatewayState === 'OTP_SENT' ? 'border-emerald-500' : 
              gatewayState === 'NOT_FOUND' ? 'border-red-500' :
              gatewayState === 'SCANNING' ? 'border-red-500/50' : 'border-slate-800'
            }`}>
                {gatewayState === 'IDENTIFIED' || gatewayState === 'OTP_SENT' ? (
                  <Fingerprint className="w-32 h-32 text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full relative">
                    <Fingerprint className="w-32 h-32 text-red-400/50 animate-pulse z-10" />
                    <motion.div 
                      className="absolute top-0 left-0 w-full h-1 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] z-0"
                      animate={{ y: [0, 325, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                )}
            </div>
          </div>
          
          <div className={`mb-6 font-bold text-sm ${
            gatewayState === 'IDENTIFIED' || gatewayState === 'OTP_SENT' ? 'text-emerald-400' : 'text-slate-500'
          }`}>
            Quality: {fingerprintQuality}%
          </div>

          <AnimatePresence mode="wait">
            {(gatewayState === 'READY' || gatewayState === 'SCANNING') && (
              <motion.button
                key="scan-button"
                initial={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                disabled={gatewayState === 'SCANNING'}
                onClick={handleSimulateScan}
                className={`flex items-center gap-2 px-10 py-4 rounded-full font-black text-lg transition-all shadow-lg ${
                  gatewayState === 'SCANNING' 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5'
                }`}
              >
                <Fingerprint className="w-5 h-5" /> 
                {gatewayState === 'SCANNING' ? 'Scanning...' : 'Scan Fingerprint'}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Inline Success/Failure & OTP Workflow */}
        <AnimatePresence>
          {gatewayState === 'NOT_FOUND' && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="w-full flex flex-col gap-4 overflow-hidden"
            >
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-red-400 shrink-0" />
                <p className="text-sm font-bold text-red-100/90 leading-relaxed">
                  Citizen not found or fingerprint scan quality was insufficient for matching.
                </p>
              </div>
            </motion.div>
          )}

          {(gatewayState === 'IDENTIFIED' || gatewayState === 'OTP_SENT') && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
              className="w-full flex flex-col gap-4 overflow-hidden"
            >
              {/* Success Banner */}
              <div className="flex flex-col justify-center bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-xl gap-2">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <p className="text-sm font-bold text-emerald-100/90 leading-relaxed">
                    Citizen profile successfully matched in the database.
                  </p>
                </div>
                <div className="pl-9">
                  <p className="text-sm font-bold text-emerald-100/90 opacity-90">
                    ID: {citizenData.id} &bull; Name: {citizenData.name}
                  </p>
                </div>
              </div>

              {/* OTP Alert & Action */}
              {gatewayState === 'OTP_SENT' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-950/50 border border-amber-500/30 p-5 rounded-xl flex flex-col gap-4"
                >
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-sm font-bold text-amber-100/80 leading-relaxed">
                      An authorization code has been sent to the citizen's registered email. Verify to unlock records.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="000000"
                      className="w-full sm:w-1/2 bg-slate-900 border-2 border-slate-700 rounded-xl text-center font-mono text-2xl tracking-widest text-white py-2 focus:border-amber-500 focus:outline-none transition-colors"
                    />
                    
                    <button
                      type="button"
                      onClick={handleVerifyOTP}
                      disabled={otpValue.length !== 6}
                      className="w-full sm:w-1/2 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:hover:bg-amber-600 text-white font-black rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all"
                    >
                      Verify Access
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}
