import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  Building2,
  CheckCircle2,
  User,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Building,
  Loader2,
  Ban,
  ShieldCheck
} from 'lucide-react';

export default function ManageInstitutionDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [status, setStatus] = useState('ACTIVE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleToggleStatus = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const newStatus = status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      setStatus(newStatus);
      setSuccessMessage(newStatus === 'ACTIVE' ? 'Facility access restored.' : 'Facility access suspended.');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-0 mt-6 flex flex-col gap-6 pb-24">
      
      {/* Header Section */}
      <div className="w-full relative flex flex-col items-start justify-center mt-2 mb-4 max-w-[1400px] mx-auto px-4 lg:px-0">
        <button 
          onClick={() => navigate('/super-admin/manage-institutions')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm">Back to Manage Institutions</span>
        </button>
      </div>

      {/* Main 50/50 Split */}
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        
        {/* Left Column: Data Cards (Static) */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          
          {/* Card 1: Identity Plate */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 blur-[50px] pointer-events-none transition-colors duration-500 ${status === 'ACTIVE' ? 'bg-cyan-500/10' : 'bg-red-500/10'}`} />
            
            <div className="relative mb-6 mt-4 group">
              <div className="w-56 h-56 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden shadow-xl">
                <Building2 className="w-20 h-20 text-slate-500" />
              </div>
            </div>
            
            <div className={`px-4 py-1.5 rounded-full border mb-6 transition-colors duration-500 flex items-center gap-2 ${status === 'ACTIVE' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${status === 'ACTIVE' ? 'bg-cyan-400' : 'bg-red-400'}`}></span>
              <span className="text-[11px] font-black tracking-widest uppercase">
                Status: {status}
              </span>
            </div>

            <h2 className="text-2xl font-black text-white mb-4">Apollo Hospital</h2>

            <div className="w-full flex flex-col gap-3 pt-6 border-t border-slate-800/50 text-center items-center">
              <div className="flex flex-wrap justify-center gap-1.5 text-sm">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] mt-0.5">System ID:</span>
                <span className="font-medium text-slate-300 font-mono text-center">FEIRS-INST-1011</span>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 text-sm">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] mt-0.5">Account Created:</span>
                <span className="font-medium text-slate-300 text-center">Oct 24, 2026</span>
              </div>
            </div>
          </div>

          {/* Card 2: Administrative Details */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/50">
              <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700">
                <User className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Administrative Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">Self-service officer records</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Institution Contact Number</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-500"><Phone className="w-4 h-4" /></div>
                  <input type="text" value="+91 98765 43210" readOnly className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-300 outline-none cursor-default" />
                </div>
              </div>
              <div className="hidden md:block"></div>
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Primary Officer Name</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-500"><User className="w-4 h-4" /></div>
                  <input type="text" value="Dr. Rakesh Sharma" readOnly className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-300 outline-none cursor-default" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Officer Designation</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-500"><Briefcase className="w-4 h-4" /></div>
                  <input type="text" value="Chief Medical Administrator" readOnly className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-300 outline-none cursor-default" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Legal Facility Data */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/50">
              <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700">
                <Building className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Legal Facility Data</h3>
                <p className="text-xs text-slate-500 mt-0.5">Managed records bound to the facility</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Institution Type</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-500"><Building2 className="w-4 h-4" /></div>
                  <input type="text" value="Hospital" readOnly className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-300 outline-none cursor-default" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Sector Type</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-500"><Briefcase className="w-4 h-4" /></div>
                  <input type="text" value="Private" readOnly className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-300 outline-none cursor-default" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 w-full md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Official Email</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-500"><Mail className="w-4 h-4" /></div>
                  <input type="text" value="apollo@hospital.com" readOnly className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-300 outline-none cursor-default" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 w-full md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Full Registered Address</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-500"><MapPin className="w-4 h-4" /></div>
                  <input type="text" value="154/11, Bannerghatta Road, Bangalore, Karnataka - 560076, India" readOnly className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-300 outline-none cursor-default" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Document Viewer (Scrollable) */}
        <div className="w-full lg:w-1/2 relative min-h-[600px] lg:min-h-0">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
              <span className="text-sm font-bold text-white uppercase tracking-wider">Institute License</span>
            </div>
            <div className="flex-1 w-full bg-slate-800/30 overflow-y-auto">
              {/* Using a placeholder object tag for PDF viewing */}
              <object 
                data="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" 
                type="application/pdf" 
                className="w-full h-[1200px]"
              >
              </object>
            </div>
          </div>
        </div>

      </div>

      {/* Action Footer */}
      <div className="w-full flex flex-col gap-4 mt-2">
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border ${
                status === 'ACTIVE' 
                  ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' 
                  : 'text-red-400 bg-red-500/10 border-red-500/20'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-bold">{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full flex flex-col items-center justify-center mt-2">
          
          {status === 'ACTIVE' ? (
            <button 
              onClick={handleToggleStatus}
              disabled={isProcessing}
              className="w-full max-w-md flex items-center justify-center gap-2 bg-transparent border border-red-500 hover:bg-red-500/10 text-red-500 hover:text-red-400 px-6 py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Ban className="w-5 h-5" />
                  Suspend Network Access
                </>
              )}
            </button>
          ) : (
            <button 
              onClick={handleToggleStatus}
              disabled={isProcessing}
              className="w-full max-w-md flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Activate Network Access
                </>
              )}
            </button>
          )}
        </div>
      </div>
      
    </div>
  );
}
