import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Fingerprint, 
  ShieldCheck, 
  CheckCircle2
} from 'lucide-react';

export default function EmergencyScanGateway() {
  const navigate = useNavigate();
  
  // States: READY, SCANNING, IDENTIFIED, NOT_FOUND
  const [gatewayState, setGatewayState] = useState('READY');
  const [fingerprintQuality, setFingerprintQuality] = useState(0);

  // Simulated Citizen ID to redirect to on success
  const targetCitizenId = 'FEIRS-CIT-12459';

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
            // Auto redirect after 1.5 seconds (Zero OTP, high-speed flow)
            setTimeout(() => {
              navigate(`/operator/emergency-scan/${targetCitizenId}`);
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

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[80vh] pb-8 relative">
      
      {/* Background Ambient Glow (Operator Red Theme) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[500px] rounded-[100%] bg-red-900/10 blur-[150px] pointer-events-none z-0" />

      {/* Header Section */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center text-center mt-2 mb-8 max-w-[800px] mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
          Emergency Scan
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
          <h2 className="text-2xl font-black text-white mb-2">Emergency Identity Retrieval</h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
            Place the patient's finger on the scanner for immediate critical care access.
          </p>
        </div>

        {/* The Hardware Zone */}
        <div className="w-full flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className={`w-[312px] h-[325px] rounded-2xl border-4 bg-slate-950 flex flex-col items-center justify-center overflow-hidden shadow-xl transition-all duration-500 ${
              gatewayState === 'IDENTIFIED' ? 'border-emerald-500' : 
              gatewayState === 'NOT_FOUND' ? 'border-red-500' :
              gatewayState === 'SCANNING' ? 'border-red-500/50' : 'border-slate-800'
            }`}>
                {gatewayState === 'IDENTIFIED' ? (
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
            gatewayState === 'IDENTIFIED' ? 'text-emerald-400' : 'text-slate-500'
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

        {/* Inline Success/Failure Workflow */}
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

          {gatewayState === 'IDENTIFIED' && (
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
                    Citizen exists in the database. Match found. Retrieving citizens records...
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}
