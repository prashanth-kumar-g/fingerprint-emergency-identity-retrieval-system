import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Pencil, 
  Save, 
  Loader2, 
  CheckCircle2, 
  Lock, 
  User,
  KeyRound,
  Mail,
  Phone
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
              ? 'border-cyan-500/50 text-white shadow-[0_0_15px_rgba(8,145,178,0.1)]' 
              : 'border-slate-800/80 text-slate-300 focus:border-slate-700'
            }`}
        />
        <button 
          onClick={handleEditToggle}
          className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors
            ${isEditing ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-cyan-400 hover:bg-slate-800'}`}
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
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
          <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-500 group-hover:text-cyan-400 transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex flex-col gap-4 p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/10"
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Update Password</span>
            <button onClick={() => setIsExpanded(false)} className="text-xs text-slate-500 hover:text-white transition-colors">Cancel</button>
          </div>
          
          <div className="relative">
            <input ref={inputRef} type="password" placeholder="Current Password" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 outline-none transition-colors" />
          </div>
          <div className="relative">
            <input type="password" placeholder="New Password" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 outline-none transition-colors" />
          </div>
          <div className="relative">
            <input type="password" placeholder="Confirm New Password" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 outline-none transition-colors" />
          </div>
        </motion.div>
      )}
    </div>
  );
};

const EmailExpander = ({ isSaving, email }) => {
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
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Master Email Address</label>
      
      {!isExpanded ? (
        <div className="relative group cursor-pointer" onClick={handleExpand}>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <Mail className="w-4 h-4" />
          </div>
          <input 
            type="email"
            value={email}
            readOnly
            className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-300 cursor-pointer group-hover:border-slate-700 transition-colors outline-none"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-500 group-hover:text-cyan-400 transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex flex-col gap-4 p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/10"
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Update Email Address</span>
            <button onClick={() => setIsExpanded(false)} className="text-xs text-slate-500 hover:text-white transition-colors">Cancel</button>
          </div>
          
          <div className="relative">
            <input ref={inputRef} type="email" defaultValue={email} placeholder="New Email Address" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 outline-none transition-colors" />
          </div>
          <div className="relative">
            <input type="password" placeholder="Current Password" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 outline-none transition-colors" />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default function SuperAdminProfile() {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [adminName, setAdminName] = useState("System Architect");
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

  useEffect(() => {
    if (isSaving) {
      setIsNameEditing(false);
    }
  }, [isSaving]);

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
        <div className="flex items-center justify-center gap-1.5 mb-4 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 w-max">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <p className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
            Live Connection
          </p>
        </div>
      </div>

      <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 lg:px-0">
        
        {/* Left Column: Identity Plate */}
        <div className="lg:col-span-1 flex flex-col gap-6 h-full">
          <div className="h-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-cyan-500/10 blur-[50px] pointer-events-none" />
            
            {/* Profile Photo */}
            <div className="relative group cursor-pointer mb-6 mt-4">
              <div className="w-56 h-56 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden shadow-xl group-hover:border-cyan-500/50 transition-colors">
                <User className="w-20 h-20 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>
              <div className="absolute bottom-4 right-4 p-2 bg-slate-800 border border-slate-700 rounded-full shadow-lg text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/50 transition-all">
                <Pencil className="w-4 h-4" />
              </div>
            </div>

            {/* Role Badge */}
            <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-4">
              <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">Platform Overseer</span>
            </div>

            {/* Admin Name */}
            <div className="w-full relative mb-6 flex justify-center items-center group/name">
              <input 
                ref={nameInputRef}
                type="text" 
                size={Math.max(adminName.length || 1, 2)}
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                readOnly={!isNameEditing}
                className={`bg-transparent text-2xl font-black text-center outline-none border-b-2 transition-colors px-1 py-1 ${
                  isNameEditing 
                    ? 'text-white border-cyan-500/50' 
                    : 'text-white border-transparent hover:border-slate-700'
                }`}
              />
              <div className="relative flex items-center ml-3">
                <button 
                  onClick={handleNameEditToggle}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isNameEditing ? 'text-cyan-400 bg-cyan-500/20' : 'text-slate-500 hover:text-cyan-400 hover:bg-slate-800'
                  }`}
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Read-Only Meta */}
            <div className="w-full flex flex-col gap-3 pt-6 border-t border-slate-800/50 text-center items-center">
              <div className="flex flex-wrap justify-center gap-1.5 text-sm">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] mt-0.5">Super Admin ID:</span>
                <span className="font-medium text-slate-300 font-mono text-center">FEIRS-SA-ROOT</span>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 text-sm">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] mt-0.5">Last Login At:</span>
                <span className="font-medium text-slate-300 text-center">Oct 24, 2026 - 14:32:05</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Configuration & Security */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full">
          
          {/* Card 1: Operational Information */}
          <div className="flex-1 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/50">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <Phone className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Operational Information</h3>
                <p className="text-xs text-slate-400 mt-0.5">Self-service contact data</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EditableField 
                label="Admin Contact Number" 
                value="+1 (555) 019-2831" 
                icon={Phone} 
                isSaving={isSaving}
              />
            </div>
          </div>

          {/* Card 2: High-Security Credentials */}
          <div className="flex-1 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/50">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <Lock className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">High-Security Credentials</h3>
                <p className="text-xs text-slate-400 mt-0.5">Core authentication management</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EmailExpander isSaving={isSaving} email="admin.feirs@gmail.com" />
              <PasswordExpander isSaving={isSaving} />
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
          className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
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
