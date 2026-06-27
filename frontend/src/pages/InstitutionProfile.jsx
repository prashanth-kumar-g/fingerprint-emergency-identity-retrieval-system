import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Pencil, 
  Save, 
  Loader2, 
  CheckCircle2, 
  Lock,
  KeyRound,
  Mail,
  Phone,
  User,
  Briefcase,
  MapPin,
  Building
} from 'lucide-react';

const EditableField = ({ label, value, icon: Icon, type = "text", placeholder, isSaving }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
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
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
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

const ManagedField = ({ label, value, icon: Icon, tooltipMessage }) => {
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
            <Pencil className="w-3.5 h-3.5" />
          </div>
          
          {/* Tooltip */}
          <div className="absolute right-0 bottom-full mb-2 w-64 bg-slate-800 text-white text-xs font-medium p-3 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10 pointer-events-none border border-slate-700 text-left">
            <div className="flex gap-2 items-start">
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <p leading-relaxed>{tooltipMessage}</p>
            </div>
            {/* Arrow */}
            <div className="absolute -bottom-1 right-5 w-2 h-2 bg-slate-800 border-b border-r border-slate-700 rotate-45" />
          </div>
        </div>
      </div>
    </div>
  );
};

const PasswordExpander = ({ isSaving }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isSaving) setIsExpanded(false);
  }, [isSaving]);

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full md:col-span-2">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Account Password</label>
      
      {!isExpanded ? (
        <div className="relative group cursor-pointer" onClick={handleExpand}>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <KeyRound className="w-4 h-4" />
          </div>
          <input 
            type="password"
            value="••••••••••••"
            readOnly
            className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-300 cursor-pointer group-hover:border-slate-700 transition-colors outline-none"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-500 group-hover:text-emerald-400 transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex flex-col gap-4 p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/10"
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Update Password</span>
            <button onClick={() => setIsExpanded(false)} className="text-xs text-slate-500 hover:text-white transition-colors">Cancel</button>
          </div>
          
          <div className="relative">
            <input ref={inputRef} type="password" placeholder="Current Password" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-500/50 outline-none transition-colors" />
          </div>
          <div className="relative">
            <input type="password" placeholder="New Password" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-500/50 outline-none transition-colors" />
          </div>
          <div className="relative">
            <input type="password" placeholder="Confirm New Password" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-500/50 outline-none transition-colors" />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default function InstitutionProfile() {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const tooltipMsg = "To update this data, please submit a Data Change Request for Super Admin approval.";

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="w-full flex flex-col items-center gap-6 pb-24 relative">
      
      {/* Header Section */}
      <div className="w-full relative flex flex-col items-center justify-center text-center mt-2 mb-8 max-w-[1400px] mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
          Profile Settings
        </h1>
        
        {/* Live Connection Badge */}
        <div className="flex items-center justify-center gap-1.5 mb-4 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-max">
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
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-emerald-500/10 blur-[50px] pointer-events-none" />
            
            {/* Facility Logo */}
            <div className="relative group cursor-pointer mb-6 mt-4">
              <div className="w-56 h-56 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden shadow-xl group-hover:border-emerald-500/50 transition-colors">
                <Building2 className="w-20 h-20 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </div>
              <div className="absolute bottom-4 right-4 p-2 bg-slate-800 border border-slate-700 rounded-full shadow-lg text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/50 transition-all">
                <Pencil className="w-4 h-4" />
              </div>
            </div>

            {/* Role Badge */}
            <div className="px-4 py-1.5 rounded-full border mb-4 transition-colors duration-500 flex items-center gap-2 bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
              <span className="w-2 h-2 rounded-full animate-pulse bg-emerald-400"></span>
              <span className="text-[11px] font-black tracking-widest uppercase">
                Status: ACTIVE
              </span>
            </div>

            {/* Institution Name (Managed) */}
            <div className="w-full relative group mb-6 flex justify-center items-center">
              <h2 className="text-2xl font-black text-white text-center">Apollo Hospital</h2>
              <div className="relative flex items-center ml-3">
                <div className="text-slate-700 cursor-not-allowed">
                  <Pencil className="w-4 h-4" />
                </div>
                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-slate-800 text-white text-xs font-medium p-3 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10 pointer-events-none border border-slate-700 text-left">
                  <div className="flex gap-2 items-start">
                    <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <p leading-relaxed>{tooltipMsg}</p>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 border-b border-r border-slate-700 rotate-45" />
                </div>
              </div>
            </div>

            {/* Read-Only Meta */}
            <div className="w-full flex flex-col gap-3 pt-6 border-t border-slate-800/50 text-center items-center">
              <div className="flex flex-wrap justify-center gap-1.5 text-sm">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] mt-0.5">Institution ID:</span>
                <span className="font-medium text-slate-300 font-mono text-center">FEIRS-INST-1011</span>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 text-sm">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] mt-0.5">Last Login At:</span>
                <span className="font-medium text-slate-300 text-center">Oct 24, 2026 - 08:05:12</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Configuration & Legal Data */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full">
          
          {/* Card 1: Administrative Details & Security */}
          <div className="flex-1 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/50">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <User className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Administrative Details & Security</h3>
                <p className="text-xs text-slate-400 mt-0.5">Self-service officer and access management</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EditableField 
                label="Institution Contact Number" 
                value="+91 98765 43210" 
                icon={Phone} 
                isSaving={isSaving}
              />
              <div className="hidden md:block"></div>
              <EditableField 
                label="Primary Officer Name" 
                value="Dr. Rakesh Sharma" 
                icon={User} 
                isSaving={isSaving}
              />
              <EditableField 
                label="Officer Designation" 
                value="Chief Medical Officer" 
                icon={Briefcase} 
                isSaving={isSaving}
              />
              <PasswordExpander isSaving={isSaving} />
            </div>
          </div>

          {/* Card 2: Legal Facility Data */}
          <div className="flex-1 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/50">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Building className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Legal Facility Data</h3>
                <p className="text-xs text-slate-400 mt-0.5">Managed records bound to your facility</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ManagedField 
                label="Institution Type" 
                value="Hospital" 
                icon={Building2} 
                tooltipMessage={tooltipMsg}
              />
              <ManagedField 
                label="Sector Type" 
                value="Private" 
                icon={Briefcase} 
                tooltipMessage={tooltipMsg}
              />
              <div className="md:col-span-2">
                <ManagedField 
                  label="Official Email" 
                  value="apollo@hospital.com" 
                  icon={Mail} 
                  tooltipMessage={tooltipMsg}
                />
              </div>
              <div className="md:col-span-2">
                <ManagedField 
                  label="Full Registered Address" 
                  value="154/11, Bannerghatta Road, Bangalore, Karnataka - 560076, India" 
                  icon={MapPin} 
                  tooltipMessage={tooltipMsg}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Global Action Bar (Expanded Full Width) */}
      <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-0 mt-2 flex flex-col gap-4">
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-3 rounded-xl border border-emerald-500/20"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-bold">Profile Updated Successfully</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving Global Changes...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Global Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
