import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Pencil, 
  Save, 
  Loader2, 
  CheckCircle2, 
  Lock,
  Mail,
  Phone,
  User,
  Briefcase,
  MapPin,
  Calendar,
  Users,
  Building2,
  ArrowLeft,
  Ban,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const EditableField = ({ label, value, onChange, icon: Icon, type = "text", placeholder, isSaving }) => {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isSaving) setIsEditing(false);
  }, [isSaving]);

  const handleEditToggle = () => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      setIsEditing(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full group">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          {Icon && <Icon className="w-4 h-4" />}
        </div>
        <input 
          ref={inputRef}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={!isEditing}
          placeholder={placeholder}
          className={`w-full bg-slate-950/50 border rounded-xl pl-10 pr-10 py-3 text-sm transition-all duration-300 outline-none
            ${isEditing 
              ? 'border-emerald-500/50 text-white shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
              : 'border-slate-800/80 text-slate-300 focus:border-slate-700'
            }`}
        />
        <button 
          onClick={handleEditToggle}
          className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors
            ${isEditing ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-emerald-400 hover:bg-slate-800'}`}
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

const ReadOnlyField = ({ label, value, icon: Icon }) => {
  const tooltipMessage = "This data must be edited by the operator themselves.";
  
  return (
    <div className="flex flex-col gap-1.5 w-full relative">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">{label}</label>
      <div className="relative flex items-center">
        <div className="absolute left-3 text-slate-500">
          {Icon && <Icon className="w-4 h-4" />}
        </div>
        <input 
          type="text"
          value={value}
          readOnly
          className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-300 outline-none cursor-default"
        />
        <div className="absolute right-3 group">
          <div className="p-1.5 rounded-lg text-slate-700 cursor-not-allowed">
            <Lock className="w-3.5 h-3.5" />
          </div>
          
          {/* Tooltip */}
          <div className="absolute right-0 bottom-full mb-2 w-64 bg-slate-800 text-white text-xs font-medium p-3 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10 pointer-events-none border border-slate-700 text-left">
            <div className="flex gap-2 items-start">
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{tooltipMessage}</p>
            </div>
            {/* Arrow */}
            <div className="absolute -bottom-1 right-5 w-2 h-2 bg-slate-800 border-b border-r border-slate-700 rotate-45" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function OperatorConfiguration() {
  const navigate = useNavigate();
  const { id } = useParams(); // FEIRS-OP-8821
  
  const originalData = {
    fullName: "Subham",
    dob: "14 August 1990",
    gender: "Male",
    email: "subham.trauma@apollo.com",
    department: "Emergency Trauma Center",
    title: "Senior Duty Doctor"
  };

  const [formData, setFormData] = useState(originalData);
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);
  
  const [isNameEditing, setIsNameEditing] = useState(false);
  const nameInputRef = useRef(null);

  const handleNameEditToggle = () => {
    if (isNameEditing) {
      setIsNameEditing(false);
    } else {
      setIsNameEditing(true);
      setTimeout(() => nameInputRef.current?.focus(), 0);
    }
  };
  
  const [isSaving, setIsSaving] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [operatorStatus, setOperatorStatus] = useState('ACTIVE'); // ACTIVE or SUSPENDED

  useEffect(() => {
    if (isSaving || isOtpVerifying) {
      setIsNameEditing(false);
    }
  }, [isSaving, isOtpVerifying]);
  
  // Simulation alert state
  const [alertInfo, setAlertInfo] = useState({ show: false, type: '', message: '' });

  const triggerAlert = (type, message) => {
    setAlertInfo({ show: true, type, message });
    setTimeout(() => {
      setAlertInfo({ show: false, type: '', message: '' });
    }, 3500);
  };

  const handleSave = () => {
    const sensitiveChanged = 
      formData.fullName !== originalData.fullName ||
      formData.dob !== originalData.dob ||
      formData.gender !== originalData.gender ||
      formData.email !== originalData.email;

    if (sensitiveChanged && !showOtpBox) {
      setIsSaving(true);
      // Simulate sending OTP
      setTimeout(() => {
        setIsSaving(false);
        setShowOtpBox(true);
        triggerAlert('warning', "Modifying sensitive demographic data requires Operator consent. An OTP has been sent to the Operator's official email.");
      }, 1000);
    } else if (sensitiveChanged && showOtpBox) {
      // Verify OTP
      setIsOtpVerifying(true);
      setTimeout(() => {
        setIsOtpVerifying(false);
        if (otpValue === '111111') {
          setShowOtpBox(false);
          setOtpValue('');
          triggerAlert('success', 'OTP Verified! Profile updated successfully.');
        } else {
          triggerAlert('error', 'Invalid OTP. Please check the code and try again.');
        }
      }, 1200);
    } else {
      // Direct Save (only department/title changed)
      setIsSaving(true);
      setTimeout(() => {
        setIsSaving(false);
        triggerAlert('success', 'Profile updated successfully!');
      }, 1200);
    }
  };

  const handleSuspend = () => {
    setIsActionLoading(true);
    setTimeout(() => {
      setIsActionLoading(false);
      setOperatorStatus('SUSPENDED');
      triggerAlert('warning', 'Operator account has been suspended.');
    }, 1200);
  };

  const handleActivate = () => {
    setIsActionLoading(true);
    setTimeout(() => {
      setIsActionLoading(false);
      setOperatorStatus('ACTIVE');
      triggerAlert('success', 'Operator account has been activated.');
    }, 1200);
  };

  return (
    <div className="w-full flex flex-col items-center gap-6 pb-24 relative">
      
      {/* Header Section */}
      <div className="relative z-10 w-full flex items-center justify-center mt-4 mb-8 max-w-[1400px] mx-auto px-6 lg:px-0 h-10">
        <div className="absolute left-6 lg:left-0 top-1/2 -translate-y-1/2">
          <button 
            onClick={() => navigate('/institution/manage-operators')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-sm">Back to Manage Operators</span>
          </button>
        </div>

        {/* Live Connection Badge */}
        <div className="flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-max">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <p className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
            Live Connection
          </p>
        </div>
      </div>

      <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 lg:px-0">
        
        {/* Left Column: Identity Plate */}
        <div className="lg:col-span-1 flex flex-col gap-6 h-full">
          <div className="h-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
            {/* Background Glow */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 blur-[50px] pointer-events-none transition-colors duration-500 ${operatorStatus === 'ACTIVE' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`} />
            
            {/* Profile Photo */}
            <div className="relative mb-6 mt-4 group">
              <div className="w-56 h-56 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden shadow-xl">
                <User className="w-20 h-20 text-slate-500" />
              </div>
              <div className="absolute bottom-4 right-4 p-2 bg-slate-800 border border-slate-700 rounded-full shadow-lg">
                <div className="text-slate-700 cursor-not-allowed">
                  <Pencil className="w-4 h-4" />
                </div>
                {/* Tooltip */}
                <div className="absolute right-full bottom-0 mb-2 mr-2 w-48 bg-slate-800 text-white text-xs font-medium p-3 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10 pointer-events-none border border-slate-700 text-left">
                  <div className="flex gap-2 items-start">
                    <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">This data must be edited by the operator themselves.</p>
                  </div>
                  <div className="absolute -bottom-1 right-2 w-2 h-2 bg-slate-800 border-b border-r border-slate-700 rotate-45" />
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className={`px-4 py-1.5 rounded-full border mb-6 transition-colors duration-500 flex items-center gap-2 ${operatorStatus === 'ACTIVE' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${operatorStatus === 'ACTIVE' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
              <span className="text-[11px] font-black tracking-widest uppercase">
                Status: {operatorStatus}
              </span>
            </div>

            {/* Operator Name */}
            <div className="w-full relative mb-6 flex justify-center items-center group/name">
              <input
                ref={nameInputRef}
                type="text"
                size={Math.max(formData.fullName.length || 1, 2)}
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                readOnly={!isNameEditing}
                className={`text-2xl font-black text-center bg-transparent outline-none transition-colors px-1 py-1 border-b-2 ${
                  isNameEditing 
                    ? 'text-white border-emerald-500/50' 
                    : 'text-white border-transparent hover:border-slate-700'
                }`}
              />
              <div className="relative flex items-center ml-3">
                <button 
                  onClick={handleNameEditToggle}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isNameEditing ? 'text-emerald-400 bg-emerald-500/20' : 'text-slate-500 hover:text-emerald-400 hover:bg-slate-800'
                  }`}
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Read-Only Meta */}
            <div className="w-full flex flex-col gap-3 pt-6 border-t border-slate-800/50 text-center items-center">
              <div className="flex flex-wrap justify-center gap-1.5 text-sm">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] mt-0.5">System ID:</span>
                <span className="font-medium text-slate-300 font-mono text-center">{id || 'FEIRS-OP-8821'}</span>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 text-sm">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] mt-0.5">Account Created:</span>
                <span className="font-medium text-slate-300 text-center">Oct 20, 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Configuration & HR Records */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full">
          
          {/* Card 1: Personal Contact (Read-Only for Admin) */}
          <div className="flex-1 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/50">
              <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                <User className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Personal Contact Information</h3>
                <p className="text-xs text-slate-400 mt-0.5">Operator Managed: These fields are read-only for administrators</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ReadOnlyField 
                label="Personal Mobile Number" 
                value="+91 98765 43210" 
                icon={Phone} 
              />
              <div className="md:col-span-2">
                <ReadOnlyField 
                  label="Residential Address" 
                  value="Apt 4B, Sunrise Towers, HSR Layout, Bangalore - 560102" 
                  icon={MapPin} 
                />
              </div>
            </div>
          </div>

          {/* Card 2: Official HR Records (Editable by Admin) */}
          <div className="flex-1 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/50">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Briefcase className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Official HR Records</h3>
                <p className="text-xs text-slate-400 mt-0.5">Managed Data: You can edit these facility records</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EditableField 
                label="Date of Birth" 
                value={formData.dob} 
                onChange={(val) => setFormData({...formData, dob: val})}
                icon={Calendar} 
                isSaving={isSaving || isOtpVerifying}
              />
              <EditableField 
                label="Gender" 
                value={formData.gender} 
                onChange={(val) => setFormData({...formData, gender: val})}
                icon={Users} 
                isSaving={isSaving || isOtpVerifying}
              />
              <div className="md:col-span-2">
                <EditableField 
                  label="Official Email Address" 
                  value={formData.email} 
                  onChange={(val) => setFormData({...formData, email: val})}
                  icon={Mail} 
                  isSaving={isSaving || isOtpVerifying}
                />
              </div>
              <EditableField 
                label="Department/Ward" 
                value={formData.department} 
                onChange={(val) => setFormData({...formData, department: val})}
                icon={Building2} 
                isSaving={isSaving || isOtpVerifying}
              />
              <EditableField 
                label="Position/Title" 
                value={formData.title} 
                onChange={(val) => setFormData({...formData, title: val})}
                icon={Briefcase} 
                isSaving={isSaving || isOtpVerifying}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Global Action Footer */}
      <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-0 mt-2 flex flex-col gap-4">
        
        {/* Simulation Alert */}
        <AnimatePresence>
          {alertInfo.show && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border ${
                alertInfo.type === 'success' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : alertInfo.type === 'error'
                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
            >
              {alertInfo.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="text-sm font-bold">{alertInfo.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inline OTP Box */}
        <AnimatePresence>
          {showOtpBox && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full bg-slate-900/80 backdrop-blur-md border border-amber-500/30 rounded-xl p-5 overflow-hidden shadow-xl"
            >
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Mutual Agreement Verification</h4>
                    <p className="text-xs text-slate-400">Enter the 6-digit OTP sent to the Operator's email.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="000000"
                    className="w-full sm:w-32 bg-slate-950/50 border border-slate-700 rounded-lg text-center font-mono text-lg tracking-widest text-white py-2 focus:border-amber-500/50 focus:outline-none transition-colors"
                  />
                  <button
                    onClick={() => setShowOtpBox(false)}
                    className="px-3 py-2 text-slate-400 hover:text-white transition-colors text-sm font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          
          {operatorStatus === 'ACTIVE' ? (
            <button 
              onClick={handleSuspend}
              disabled={isActionLoading || isSaving}
              className="flex-1 flex items-center justify-center gap-2 bg-transparent border border-red-500 text-red-400 hover:bg-red-500/10 px-6 py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isActionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Ban className="w-5 h-5" />}
              Suspend Account
            </button>
          ) : (
            <button 
              onClick={handleActivate}
              disabled={isActionLoading || isSaving}
              className="flex-1 flex items-center justify-center gap-2 bg-transparent border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 px-6 py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isActionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
              Activate Account
            </button>
          )}

          <button 
            onClick={handleSave}
            disabled={isSaving || isActionLoading || isOtpVerifying || (showOtpBox && otpValue.length < 6)}
            className={`flex-[2] flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl disabled:opacity-70 disabled:cursor-not-allowed ${
              showOtpBox 
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)]' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
            }`}
          >
            {isSaving || isOtpVerifying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isOtpVerifying ? 'Verifying OTP...' : 'Processing...'}
              </>
            ) : showOtpBox ? (
              <>
                <ShieldCheck className="w-5 h-5" />
                Verify OTP & Save
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Profile Updates
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
