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
  Building,
  Eye,
  EyeOff
} from 'lucide-react';
import api from '../api/axiosConfig';

const formatDate = (dateString) => {
  if (!dateString) return 'Session Started';
  const d = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const monthName = months[d.getMonth()];
  const dayNum = d.getDate();
  const year = d.getFullYear();
  const timeStr = d.toLocaleTimeString('en-GB');
  
  return `${monthName} ${dayNum}, ${year} - ${timeStr}`;
};

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

export default function InstitutionProfile() {
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const [profile, setProfile] = useState(null);
  
  // Editable fields state
  const [phoneInput, setPhoneInput] = useState("");
  const [officerName, setOfficerName] = useState("");
  const [officerDesignation, setOfficerDesignation] = useState("");
  
  const [phoneError, setPhoneError] = useState("");

  // Password Expand State
  const [isPasswordExpanded, setIsPasswordExpanded] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState("");
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Photo State
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  const tooltipMsg = "To update this data, please submit a Data Change Request for Super Admin approval.";

  const fetchProfile = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user?.id) return;
      
      const response = await api.get(`/v1/institutions/profile?institutionId=${user.id}`);
      setProfile(response.data.institution);
      
      setOfficerName(response.data.institution.primaryOfficerName || "");
      setOfficerDesignation(response.data.institution.officerDesignation || "");
      
      const countryCode = response.data.institution.phoneCountryCode || "";
      const number = response.data.institution.phoneNumber || "";
      if (countryCode && number) {
        setPhoneInput(`${countryCode} ${number}`);
      } else {
        setPhoneInput("");
      }
    } catch (err) {
      console.error(err);
      setGlobalError("Failed to load profile data.");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedPhotoFile(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setPhoneError("");
    setPasswordError("");
    setGlobalError("");
    
    let finalCountryCode = "";
    let finalPhoneNumber = "";
    let hasError = false;

    if (phoneInput) {
      const parts = phoneInput.trim().split(" ");
      if (parts.length < 2 || !phoneInput.startsWith("+")) {
        setPhoneError("Phone must be in format: +[Code] [Number]. E.g. +91 9876543210");
        hasError = true;
      } else {
        finalCountryCode = parts[0];
        finalPhoneNumber = parts.slice(1).join("").replace(/\D/g, ''); 
      }
    }

    if (isPasswordExpanded && (newPassword || currentPassword)) {
      if (newPassword !== confirmPassword) {
        setPasswordError('New passwords do not match');
        hasError = true;
      } else if (!currentPassword) {
        setPasswordError('Current password is required to change password');
        hasError = true;
      } else if (!newPassword) {
         setPasswordError('New password cannot be empty');
         hasError = true;
      }
    }

    if (hasError) return;

    setIsSaving(true);
    let successCount = 0;
    let anyApiFailed = false;

    // Save info
    try {
      await api.put(`/v1/institutions/profile/self-service?institutionId=${profile.institutionId}`, {
        primaryOfficerName: officerName,
        officerDesignation: officerDesignation,
        phoneCountryCode: finalCountryCode,
        phoneNumber: finalPhoneNumber
      });
      successCount++;
    } catch (err) {
      setGlobalError(err.response?.data?.error || 'Failed to update profile info');
      anyApiFailed = true;
    }

    // Save password
    if (!anyApiFailed && isPasswordExpanded && newPassword && currentPassword) {
      if (newPassword !== confirmPassword) {
        setPasswordError("New passwords do not match");
        anyApiFailed = true;
      } else if (newPassword === currentPassword) {
        setPasswordError("Old and new password cannot be the same");
        anyApiFailed = true;
      } else {
        try {
          await api.put(`/v1/institutions/profile/password?institutionId=${profile.institutionId}`, {
            oldPassword: currentPassword,
            newPassword: newPassword
          });
          successCount++;
          setIsPasswordExpanded(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        } catch(err) {
          setPasswordError(err.response?.data || "Failed to update password");
          anyApiFailed = true;
        }
      }
    }

    // Save photo
    if (!anyApiFailed && selectedPhotoFile) {
      const formData = new FormData();
      formData.append('file', selectedPhotoFile);
      try {
        const response = await api.post(`/v1/institutions/profile/photo?institutionId=${profile.institutionId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        successCount++;
        setProfile(prev => ({ ...prev, institutionLogoUrl: response.data.url }));
        setSelectedPhotoFile(null);
        setPhotoPreviewUrl(null);
      } catch (err) {
        setGlobalError("Failed to upload photo: " + (err.response?.data || err.message));
        anyApiFailed = true;
      }
    }

    setIsSaving(false);
    
    if (!anyApiFailed && successCount > 0) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      fetchProfile();
    }
  };

  if (isLoadingProfile || !profile) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const displayPhoto = photoPreviewUrl || profile?.institutionLogoUrl;

  return (
    <div className="w-full flex flex-col items-center gap-6 pb-24 relative">
      
      {/* Global Error Banner */}
      <AnimatePresence>
        {globalError && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 z-50 bg-red-500/90 text-white px-6 py-3 rounded-xl font-medium shadow-2xl backdrop-blur-md border border-red-400"
          >
            {globalError}
          </motion.div>
        )}
      </AnimatePresence>

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
            <div 
              className="relative group cursor-pointer mb-6 mt-4"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-56 h-56 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden shadow-xl group-hover:border-emerald-500/50 transition-colors">
                {displayPhoto ? (
                  <img src={displayPhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-20 h-20 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                )}
              </div>
              <div className="absolute bottom-4 right-4 p-2 bg-slate-800 border border-slate-700 rounded-full shadow-lg text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/50 transition-all">
                <Pencil className="w-4 h-4" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoSelect} 
                accept="image/jpeg, image/png, image/jpg" 
                className="hidden" 
              />
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
              <h2 className="text-2xl font-black text-white text-center">{profile?.institutionName || "Loading..."}</h2>
              <div className="relative flex items-center ml-3">
                <div className="text-slate-700 cursor-not-allowed">
                  <Pencil className="w-4 h-4" />
                </div>
                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-slate-800 text-white text-xs font-medium p-3 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10 pointer-events-none border border-slate-700 text-left">
                  <div className="flex gap-2 items-start">
                    <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{tooltipMsg}</p>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 border-b border-r border-slate-700 rotate-45" />
                </div>
              </div>
            </div>

            {/* Read-Only Meta */}
            <div className="w-full flex flex-col gap-3 pt-6 border-t border-slate-800/50 text-center items-center">
              <div className="text-sm w-full px-2 leading-relaxed">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] mr-1.5">Institution ID:</span>
                <span className="font-medium text-slate-300 font-mono">{profile?.institutionId}</span>
              </div>
              <div className="text-sm w-full px-2 leading-relaxed">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] mr-1.5">Last Login at:</span>
                <span className="font-medium text-slate-300 font-mono">{formatDate(profile?.lastLoginAt)}</span>
              </div>
              <div className="text-sm w-full px-2 leading-relaxed">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] mr-1.5">Linked super admin:</span>
                <span className="font-medium text-slate-300 font-mono">
                  {profile?.linkedSuperAdmin 
                    ? `${profile.linkedSuperAdmin.adminName || 'Admin'} (${profile.linkedSuperAdmin.superAdminId})`
                    : 'System Admin (FEIRS-SA-ROOT)'}
                </span>
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
              <div className="flex flex-col gap-1 w-full">
                <EditableField 
                  label="Institution Contact Number" 
                  value={phoneInput} 
                  onChange={setPhoneInput}
                  icon={Phone} 
                  isSaving={isSaving}
                />
                {phoneError && <span className="text-red-400 text-xs mt-1 ml-1 font-medium">{phoneError}</span>}
              </div>
              <div className="hidden md:block"></div>
              
              <EditableField 
                label="Primary Officer Name" 
                value={officerName} 
                onChange={setOfficerName}
                icon={User} 
                isSaving={isSaving}
              />
              <EditableField 
                label="Officer Designation" 
                value={officerDesignation} 
                onChange={setOfficerDesignation}
                icon={Briefcase} 
                isSaving={isSaving}
              />
              
              {/* Password Expander */}
              <div className="flex flex-col gap-1.5 w-full md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Account Password</label>
                
                {!isPasswordExpanded ? (
                  <div className="relative group cursor-pointer" onClick={() => { setIsPasswordExpanded(true); setTimeout(() => passwordInputRef.current?.focus(), 0); }}>
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
                      <button onClick={() => setIsPasswordExpanded(false)} className="text-xs text-slate-500 hover:text-white transition-colors">Cancel</button>
                    </div>
                    
                    <div className="relative">
                      <input ref={passwordInputRef} value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} type={showCurrentPassword ? "text" : "password"} placeholder="Current Password" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 pr-10 text-sm text-white focus:border-emerald-500/50 outline-none transition-colors" />
                      <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="relative">
                      <input value={newPassword} onChange={e=>setNewPassword(e.target.value)} type={showNewPassword ? "text" : "password"} placeholder="New Password" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 pr-10 text-sm text-white focus:border-emerald-500/50 outline-none transition-colors" />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="relative">
                      <input value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} type={showConfirmPassword ? "text" : "password"} placeholder="Confirm New Password" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 pr-10 text-sm text-white focus:border-emerald-500/50 outline-none transition-colors" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordError && <span className="text-red-400 text-xs font-medium">{passwordError}</span>}
                  </motion.div>
                )}
              </div>

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
                value={profile?.institutionType || ""} 
                icon={Building2} 
                tooltipMessage={tooltipMsg}
              />
              <ManagedField 
                label="Sector Type" 
                value={profile?.sectorType || ""} 
                icon={Briefcase} 
                tooltipMessage={tooltipMsg}
              />
              <div className="md:col-span-2">
                <ManagedField 
                  label="Official Email" 
                  value={profile?.officialEmail || ""} 
                  icon={Mail} 
                  tooltipMessage={tooltipMsg}
                />
              </div>
              <div className="md:col-span-2">
                <ManagedField 
                  label="Full Registered Address" 
                  value={`${profile?.addressLine1 || ""}${profile?.addressLine2 ? ', ' + profile.addressLine2 : ''}, ${profile?.city || ""}, ${profile?.state || ""} - ${profile?.pinCode || ""}, ${profile?.country || ""}`} 
                  icon={MapPin} 
                  tooltipMessage={tooltipMsg}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Global Action Bar */}
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
