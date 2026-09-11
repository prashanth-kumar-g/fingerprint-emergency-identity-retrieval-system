import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';
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

  const location = useLocation();
  const institution = location.state?.institution || {};

  const [status, setStatus] = useState(institution.accountStatus || 'ACTIVE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const timePart = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    return `${datePart} - ${timePart}`;
  };

  const handleToggleStatus = async () => {
    setIsProcessing(true);
    try {
      const newStatus = (status === 'ACTIVE' || status === 'PENDING') ? 'SUSPENDED' : 'ACTIVE';
      const response = await api.put(`/v1/super-admin/institutions/${id}/status`, {
        status: newStatus
      });
      if (response.data.success) {
        setStatus(newStatus);
        setSuccessMessage(newStatus === 'ACTIVE' ? 'Facility access restored.' : 'Facility access suspended.');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      }
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-0 mt-6 flex flex-col gap-6 pb-24">
      
      {/* Header Section */}
      <div className="relative z-10 w-full flex items-center justify-center mt-4 mb-8 max-w-[1400px] mx-auto px-6 lg:px-0 h-10">
        <div className="absolute left-6 lg:left-0 top-1/2 -translate-y-1/2">
          <button 
            onClick={() => navigate('/super-admin/manage-institutions')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-sm">Back to Manage Institutions</span>
          </button>
        </div>

        {/* Live Connection Badge */}
        <div className="flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 w-max">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <p className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
            Live Connection
          </p>
        </div>
      </div>

      {/* Main 50/50 Split */}
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        
        {/* Left Column: Data Cards */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          
          {/* Card 1: Identity Plate */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 blur-[50px] pointer-events-none transition-colors duration-500 ${status === 'ACTIVE' ? 'bg-cyan-500/10' : status === 'PENDING' ? 'bg-amber-500/10' : 'bg-red-500/10'}`} />
            
            <div className="relative mb-6 mt-4 group">
              <div className="w-56 h-56 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden shadow-xl">
                {institution.institutionLogoUrl ? (
                  <img src={institution.institutionLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-20 h-20 text-slate-500" />
                )}
              </div>
            </div>
            
            <div className={`px-4 py-1.5 rounded-full border mb-6 transition-colors duration-500 flex items-center gap-2 ${status === 'ACTIVE' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : status === 'PENDING' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${status === 'ACTIVE' ? 'bg-cyan-400' : status === 'PENDING' ? 'bg-amber-400' : 'bg-red-400'}`}></span>
              <span className="text-[11px] font-black tracking-widest uppercase">
                Status: {status}
              </span>
            </div>

            <h2 className="text-2xl font-black text-white mb-4">{institution.institutionName || 'Unknown'}</h2>

            <div className="w-full flex flex-col gap-3 pt-6 border-t border-slate-800/50 text-center items-center">
              <div className="flex flex-wrap justify-center gap-1.5 text-sm">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] mt-0.5">System ID:</span>
                <span className="font-medium text-slate-300 font-mono text-center">{institution.institutionId || id}</span>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 text-sm">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] mt-0.5">Account Created:</span>
                <span className="font-medium text-slate-300 text-center">
                  {formatDateTime(institution.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Combined Details */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl flex flex-col gap-6">
            
            {/* Primary Officer Section */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                <User className="w-4 h-4 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-wide">Primary Officer</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Full Name</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-500"><User className="w-4 h-4" /></div>
                  <input type="text" value={institution.primaryOfficerName || ''} readOnly className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-300 outline-none cursor-default" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Designation</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-500"><Briefcase className="w-4 h-4" /></div>
                  <input type="text" value={institution.officerDesignation || ''} readOnly className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-300 outline-none cursor-default" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 w-full md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Phone Number</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-500"><Phone className="w-4 h-4" /></div>
                  <input type="text" value={`${institution.phoneCountryCode || ''} ${institution.phoneNumber || ''}`} readOnly className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-300 outline-none cursor-default" />
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-slate-800 my-2"></div>

            {/* Institution Section */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                <Building className="w-4 h-4 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-wide">Institution Data</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Institution Type</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-500"><Building2 className="w-4 h-4" /></div>
                  <input type="text" value={institution.institutionType || ''} readOnly className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-300 outline-none cursor-default" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Sector Type</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-500"><Briefcase className="w-4 h-4" /></div>
                  <input type="text" value={institution.sectorType || ''} readOnly className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-300 outline-none cursor-default" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 w-full md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Official Email</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-500"><Mail className="w-4 h-4" /></div>
                  <input type="text" value={institution.officialEmail || ''} readOnly className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-300 outline-none cursor-default" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 w-full md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Full Registered Address</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-500"><MapPin className="w-4 h-4" /></div>
                  <input type="text" value={`${institution.addressLine1 || ''} ${institution.addressLine2 || ''}, ${institution.city || ''}, ${institution.state || ''} - ${institution.pinCode || ''}, ${institution.country || ''}`} readOnly className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-300 outline-none cursor-default" />
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
              <iframe 
                src={`${institution.verificationDocumentUrl || ''}#view=FitH&toolbar=0`}
                title="Institute License"
                className="w-full h-full min-h-[1200px] border-0 rounded-b-2xl bg-white"
              >
              </iframe>
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
                  : status === 'PENDING'
                  ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                  : 'text-red-400 bg-red-500/10 border-red-500/20'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-bold">{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full flex flex-col items-center justify-center mt-2">
          
          {!showSuccess && (
            (status === 'ACTIVE' || status === 'PENDING') ? (
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
            )
          )}
        </div>
      </div>
      
    </div>
  );
}
