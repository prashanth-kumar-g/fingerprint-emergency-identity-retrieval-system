import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Stethoscope, 
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
  Calendar,
  Users,
  Building2
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
              ? 'border-red-500/50 text-white shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
              : 'border-slate-800/80 text-slate-300 focus:border-slate-700'
            }`}
        />
        <button 
          onClick={handleEditToggle}
          className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors
            ${isEditing ? 'bg-red-500/20 text-red-400' : 'text-slate-500 hover:text-red-400 hover:bg-slate-800'}`}
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
              <Lock className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
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
          <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-500 group-hover:text-red-400 transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex flex-col gap-4 p-4 rounded-xl border border-red-500/30 bg-red-950/10"
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Update Password</span>
            <button onClick={() => setIsExpanded(false)} className="text-xs text-slate-500 hover:text-white transition-colors">Cancel</button>
          </div>
          
          <div className="relative">
            <input ref={inputRef} type="password" placeholder="Current Password" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-red-500/50 outline-none transition-colors" />
          </div>
          <div className="relative">
            <input type="password" placeholder="New Password" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-red-500/50 outline-none transition-colors" />
          </div>
          <div className="relative">
            <input type="password" placeholder="Confirm New Password" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-red-500/50 outline-none transition-colors" />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default function OperatorProfile() {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const tooltipMsg = "Please contact your Institution Admin directly to request modifications to this data.";

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
        <div className="flex items-center justify-center gap-1.5 mb-4 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 w-max">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
          <p className="text-[10px] font-bold tracking-widest text-red-400 uppercase">
            Live Connection
          </p>
        </div>
      </div>

      <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 lg:px-0">
        
        {/* Left Column: Identity Plate */}
        <div className="lg:col-span-1 flex flex-col gap-6 h-full">
          <div className="h-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-red-500/10 blur-[50px] pointer-events-none" />
            
            {/* Profile Photo */}
            <div className="relative group cursor-pointer mb-6 mt-4">
              <div className="w-56 h-56 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden shadow-xl group-hover:border-red-500/50 transition-colors">
                <User className="w-20 h-20 text-slate-500 group-hover:text-red-400 transition-colors" />
              </div>
              <div className="absolute bottom-4 right-4 p-2 bg-slate-800 border border-slate-700 rounded-full shadow-lg text-slate-400 group-hover:text-red-400 group-hover:border-red-500/50 transition-all">
                <Pencil className="w-4 h-4" />
              </div>
            </div>

            {/* Role Badge */}
            <div className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 mb-4">
              <span className="text-[10px] font-bold tracking-widest text-red-400 uppercase">Emergency Responder</span>
            </div>

            {/* Operator Name (Managed) */}
            <div className="w-full relative group mb-6 flex justify-center items-center">
              <h2 className="text-2xl font-black text-white text-center">Subham</h2>
              <div className="relative flex items-center ml-3">
                <div className="text-slate-700 cursor-not-allowed">
                  <Pencil className="w-4 h-4" />
                </div>
                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-slate-800 text-white text-xs font-medium p-3 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10 pointer-events-none border border-slate-700 text-left">
                  <div className="flex gap-2 items-start">
                    <Lock className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    <p leading-relaxed>{tooltipMsg}</p>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 border-b border-r border-slate-700 rotate-45" />
                </div>
              </div>
            </div>

            {/* Read-Only Meta */}
            <div className="w-full flex flex-col gap-3 pt-6 border-t border-slate-800/50 text-center items-center">
              <div className="flex flex-wrap justify-center gap-1.5 text-sm">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] mt-0.5">Operator ID:</span>
                <span className="font-medium text-slate-300 font-mono text-center">FEIRS-OP-8821</span>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 text-sm">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] mt-0.5">Linked Facility:</span>
                <span className="font-medium text-slate-300 font-mono text-center">FEIRS-INST-1011 (Apollo Hospital)</span>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 text-sm">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] mt-0.5">Last Login At:</span>
                <span className="font-medium text-slate-300 text-center">Oct 24, 2026 - 09:00:15</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Configuration & HR Records */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full">
          
          {/* Card 1: Personal Contact & Security */}
          <div className="flex-1 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/50">
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <User className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Personal Contact & Security</h3>
                <p className="text-xs text-slate-400 mt-0.5">Self-service profile and access management</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EditableField 
                label="Personal Mobile Number" 
                value="+91 98765 43210" 
                icon={Phone} 
                isSaving={isSaving}
              />
              <div className="md:col-span-2">
                <EditableField 
                  label="Residential Address" 
                  value="Apt 4B, Sunrise Towers, HSR Layout, Bangalore - 560102" 
                  icon={MapPin} 
                  isSaving={isSaving}
                />
              </div>
              <PasswordExpander isSaving={isSaving} />
            </div>
          </div>

          {/* Card 2: Official HR Records */}
          <div className="flex-1 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/50">
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <Briefcase className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Official HR Records</h3>
                <p className="text-xs text-slate-400 mt-0.5">Managed records legally bound to your facility</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ManagedField 
                label="Date of Birth" 
                value="14 August 1990" 
                icon={Calendar} 
                tooltipMessage={tooltipMsg}
              />
              <ManagedField 
                label="Gender" 
                value="Male" 
                icon={Users} 
                tooltipMessage={tooltipMsg}
              />
              <div className="md:col-span-2">
                <ManagedField 
                  label="Official Email" 
                  value="subham.trauma@apollo.com" 
                  icon={Mail} 
                  tooltipMessage={tooltipMsg}
                />
              </div>
              <ManagedField 
                label="Department/Ward" 
                value="Emergency Trauma Center" 
                icon={Building2} 
                tooltipMessage={tooltipMsg}
              />
              <ManagedField 
                label="Position/Title" 
                value="Senior Duty Doctor" 
                icon={Briefcase} 
                tooltipMessage={tooltipMsg}
              />
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
              className="flex items-center justify-center gap-2 text-red-400 bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-bold">Profile Updated Successfully</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
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
