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
  Phone,
  Eye,
  EyeOff,
  AlertCircle
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

export default function SuperAdminProfile() {
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, type: '', message: '' });
  const [globalError, setGlobalError] = useState("");
  
  const alertTimeoutRef = useRef(null);

  const triggerAlert = (type, message, duration = 5000) => {
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    setAlertInfo({ show: true, type, message });
    alertTimeoutRef.current = setTimeout(() => {
      setAlertInfo({ show: false, type: '', message: '' });
    }, duration);
  };
  
  const [profile, setProfile] = useState(null);
  const [adminName, setAdminName] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneError, setPhoneError] = useState("");
  
  const [isEmailExpanded, setIsEmailExpanded] = useState(false);
  const [isPasswordExpanded, setIsPasswordExpanded] = useState(false);
  
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailError, setEmailError] = useState("");
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState("");

  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isNameEditing, setIsNameEditing] = useState(false);
  const [isPhoneEditing, setIsPhoneEditing] = useState(false);
  
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);

  const nameInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/super-admin/profile');
      setProfile(response.data);
      setAdminName(response.data.adminName || "");
      const countryCode = response.data.phoneCountryCode || "";
      const number = response.data.phoneNumber || "";
      if (countryCode && number) {
        setPhoneInput(`${countryCode} ${number}`);
      } else {
        setPhoneInput("");
      }
    } catch (err) {
      console.error(err);
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
    setEmailError("");
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

    const currentPhone = (profile.phoneCountryCode && profile.phoneNumber) 
      ? `${profile.phoneCountryCode} ${profile.phoneNumber}` 
      : "";
    const hasInfoChanges = 
      phoneInput !== currentPhone ||
      adminName !== (profile.adminName || "");

    const hasEmailChanges = isEmailExpanded && newEmail && emailPassword;
    const hasPasswordChanges = isPasswordExpanded && currentPassword && newPassword;
    const hasPhotoChanges = !!selectedPhotoFile;

    if (!hasInfoChanges && !hasEmailChanges && !hasPasswordChanges && !hasPhotoChanges) {
      triggerAlert('error', 'No changes detected to save.');
      return;
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

    if (isEmailExpanded && newEmail) {
      if (!emailPassword) {
        setEmailError('Current password is required to change email');
        hasError = true;
      }
    }

    if (hasError) return;

    setIsSaving(true);
    let successCount = 0;
    let anyApiFailed = false;

    try {
      await api.put('/super-admin/profile/info', {
        adminName: adminName,
        phoneCountryCode: finalCountryCode,
        phoneNumber: finalPhoneNumber
      });
      successCount++;
    } catch (err) {
      setGlobalError('Failed to update profile info');
      anyApiFailed = true;
    }

    if (!anyApiFailed && isEmailExpanded && newEmail && emailPassword) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(newEmail)) {
        setEmailError("Please enter a valid professional email address.");
        anyApiFailed = true;
      } else {
        try {
          await api.put('/super-admin/profile/email', {
            password: emailPassword,
            newEmail: newEmail
          });
          successCount++;
          setIsEmailExpanded(false);
          setNewEmail('');
          setEmailPassword('');
        } catch(err) {
          setEmailError(err.response?.data || "Failed to update email");
          anyApiFailed = true;
        }
      }
    }

    if (!anyApiFailed && isPasswordExpanded && newPassword && currentPassword) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/;
      if (!passwordRegex.test(newPassword)) {
        setPasswordError("Password must be 8-32 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.");
        anyApiFailed = true;
      } else if (newPassword !== confirmPassword) {
        setPasswordError("New passwords do not match");
        anyApiFailed = true;
      } else if (newPassword === currentPassword) {
        setPasswordError("Old and new password cannot be the same");
        anyApiFailed = true;
      } else {
        try {
          await api.put('/super-admin/profile/password', {
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

    if (!anyApiFailed && selectedPhotoFile) {
      const formData = new FormData();
      formData.append('file', selectedPhotoFile);
      try {
        const response = await api.post('/super-admin/profile/photo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        successCount++;
        setProfile(prev => ({ ...prev, profilePhotoUrl: response.data.url }));
        setSelectedPhotoFile(null);
        setPhotoPreviewUrl(null);
      } catch (err) {
        setGlobalError("Failed to upload photo: " + (err.response?.data || err.message));
        anyApiFailed = true;
      }
    }

    setIsSaving(false);
    
    if (!anyApiFailed && successCount > 0) {
      triggerAlert('success', 'Profile Updated Successfully');
      setIsNameEditing(false);
      setIsPhoneEditing(false);
      fetchProfile();
    }
  };

  if (isLoadingProfile) {
    return null;
  }

  const displayPhoto = photoPreviewUrl || profile?.profilePhotoUrl;

  return (
    <div className="w-full flex flex-col items-center gap-6 pb-24 relative">
      <div className="w-full relative flex flex-col items-center justify-center text-center mt-2 mb-8 max-w-[1400px] mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
          Profile Settings
        </h1>
        <div className="flex items-center justify-center gap-1.5 mb-4 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 w-max">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <p className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">Live Connection</p>
        </div>
      </div>

      <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 lg:px-0">
        
        <div className="lg:col-span-1 flex flex-col gap-6 h-full">
          <div className="h-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-cyan-500/10 blur-[50px] pointer-events-none" />
            
            <div className="relative group mb-6 mt-4">
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                accept="image/jpeg, image/png, image/jpg"
                onChange={handlePhotoSelect}
              />
              <div className="w-56 h-56 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden shadow-xl group-hover:border-cyan-500/50 transition-colors">
                {displayPhoto ? (
                   <img src={displayPhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                   <User className="w-20 h-20 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                )}
              </div>
              <div className="absolute bottom-4 right-4 p-2 bg-slate-800 border border-slate-700 rounded-full shadow-lg text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/50 transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Pencil className="w-4 h-4" />
              </div>
            </div>

            <div className="px-4 py-1.5 rounded-full border mb-4 transition-colors duration-500 flex items-center gap-2 bg-cyan-500/10 border-cyan-500/30 text-cyan-400">
              <span className="w-2 h-2 rounded-full animate-pulse bg-cyan-400"></span>
              <span className="text-[11px] font-black tracking-widest uppercase">Status: ACTIVE</span>
            </div>

            <div className="w-full relative mb-6 flex justify-center items-center group/name">
              <input 
                ref={nameInputRef}
                type="text" 
                size={Math.max(adminName.length || 1, 2)}
                value={adminName}
                onChange={(e) => {
                  setAdminName(e.target.value);
                  setGlobalError("");
                }}
                readOnly={!isNameEditing}
                placeholder="Enter Name"
                className={`bg-transparent text-2xl font-black text-center outline-none border-b-2 transition-colors px-1 py-1 ${
                  isNameEditing ? 'text-white border-cyan-500/50' : 'text-white border-transparent hover:border-slate-700'
                }`}
              />
              <div className="relative flex items-center ml-3">
                <button 
                  onClick={() => { setIsNameEditing(!isNameEditing); setTimeout(() => nameInputRef.current?.focus(), 0); }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isNameEditing ? 'text-cyan-400 bg-cyan-500/20' : 'text-slate-500 hover:text-cyan-400 hover:bg-slate-800'
                  }`}
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="w-full flex flex-col gap-3 pt-6 border-t border-slate-800/50 text-center items-center">
              <div className="text-sm w-full px-2 leading-relaxed">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] mr-1.5">Super Admin ID:</span>
                <span className="font-medium text-slate-300 font-mono">{profile?.superAdminId || 'FEIRS-SA-ROOT'}</span>
              </div>
              <div className="text-sm w-full px-2 leading-relaxed">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] mr-1.5">Last Login At:</span>
                <span className="font-medium text-slate-300">{formatDate(profile?.lastLoginAt)}</span>
              </div>
              <div className="text-sm w-full px-2 leading-relaxed">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] mr-1.5">Location Center:</span>
                <span className="font-medium text-slate-300">
                  {profile?.city ? `${profile.city}, ${profile.state}, ${profile.country}` : (profile?.country || 'Global')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6 h-full">
          
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
              <div className="flex flex-col gap-1.5 w-full group">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Admin Contact Number</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Phone className="w-4 h-4" /></div>
                  <input 
                    ref={phoneInputRef}
                    type="text"
                    value={phoneInput}
                    onChange={(e) => {
                      setPhoneInput(e.target.value);
                      setPhoneError("");
                    }}
                    readOnly={!isPhoneEditing}
                    placeholder="+91 9876543210"
                    className={`w-full bg-slate-950/50 border rounded-xl pl-10 pr-10 py-3 text-sm transition-all duration-300 outline-none
                      ${isPhoneEditing 
                        ? (phoneError ? 'border-red-500/50 text-white shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-cyan-500/50 text-white shadow-[0_0_15px_rgba(8,145,178,0.1)]') 
                        : 'border-slate-800/80 text-slate-300 focus:border-slate-700'}`}
                  />
                  <button 
                    onClick={() => { setIsPhoneEditing(!isPhoneEditing); setTimeout(() => phoneInputRef.current?.focus(), 0); }}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors
                      ${isPhoneEditing ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-cyan-400 hover:bg-slate-800'}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
                <AnimatePresence>
                  {phoneError && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                      className="text-red-400 text-xs font-medium pl-2"
                    >
                      {phoneError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

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
              
              <div className="flex flex-col w-full md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 mb-1.5">Master Email Address</label>
                
                {!isEmailExpanded ? (
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input 
                        type="email"
                        value={profile?.masterEmail || ''}
                        readOnly
                        className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-300 group-hover:border-slate-700 transition-colors outline-none"
                      />
                    <button type="button" onClick={() => { setIsEmailExpanded(true); setTimeout(() => emailInputRef.current?.focus(), 0); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={`flex flex-col gap-4 p-4 rounded-xl border bg-slate-950/30 ${emailError ? 'border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-cyan-500/30 shadow-[0_0_15px_rgba(8,145,178,0.1)]'}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Update Email Address</span>
                      <button onClick={() => {setIsEmailExpanded(false); setNewEmail(''); setEmailPassword(''); setEmailError("");}} className="text-xs text-slate-500 hover:text-white transition-colors">Cancel</button>
                    </div>
                    
                    <input ref={emailInputRef} type="email" defaultValue={profile?.masterEmail} onChange={(e) => {setNewEmail(e.target.value); setEmailError("");}} placeholder="New Email Address" className={`w-full bg-slate-950 border rounded-lg px-4 py-2.5 text-sm text-white outline-none ${emailError ? 'border-red-500/50' : 'border-slate-800 focus:border-cyan-500/50'}`} />
                    <div className="relative w-full">
                      <input type={showEmailPassword ? "text" : "password"} placeholder="Verify Current Password" onChange={(e) => {setEmailPassword(e.target.value); setEmailError("");}} className={`w-full bg-slate-950 border rounded-lg px-4 py-2.5 pr-10 text-sm text-white outline-none ${emailError ? 'border-red-500/50' : 'border-slate-800 focus:border-cyan-500/50'}`} />
                      <button type="button" onClick={() => setShowEmailPassword(!showEmailPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                        {showEmailPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </motion.div>
                )}
                <AnimatePresence>
                  {emailError && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                      className="text-red-400 text-xs font-medium pl-2 mt-1.5"
                    >
                      {emailError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-col w-full md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 mb-1.5">Account Password</label>
                
                {!isPasswordExpanded ? (
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input 
                      type="password"
                      value="••••••••••••"
                      readOnly
                      className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-300 group-hover:border-slate-700 transition-colors outline-none"
                    />
                    <button type="button" onClick={() => { setIsPasswordExpanded(true); setTimeout(() => passwordInputRef.current?.focus(), 0); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={`flex flex-col gap-4 p-4 rounded-xl border bg-slate-950/30 ${passwordError ? 'border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-cyan-500/30 shadow-[0_0_15px_rgba(8,145,178,0.1)]'}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Update Password</span>
                      <button onClick={() => {setIsPasswordExpanded(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setPasswordError("");}} className="text-xs text-slate-500 hover:text-white transition-colors">Cancel</button>
                    </div>
                    
                    <div className="relative w-full">
                      <input ref={passwordInputRef} type={showCurrentPassword ? "text" : "password"} placeholder="Current Password" onChange={(e) => {setCurrentPassword(e.target.value); setPasswordError("");}} className={`w-full bg-slate-950 border rounded-lg px-4 py-2.5 pr-10 text-sm text-white outline-none ${passwordError ? 'border-red-500/50' : 'border-slate-800 focus:border-cyan-500/50'}`} />
                      <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="relative w-full">
                      <input type={showNewPassword ? "text" : "password"} placeholder="New Password" onChange={(e) => {setNewPassword(e.target.value); setPasswordError("");}} className={`w-full bg-slate-950 border rounded-lg px-4 py-2.5 pr-10 text-sm text-white outline-none ${passwordError ? 'border-red-500/50' : 'border-slate-800 focus:border-cyan-500/50'}`} />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="relative w-full">
                      <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm New Password" onChange={(e) => {setConfirmPassword(e.target.value); setPasswordError("");}} className={`w-full bg-slate-950 border rounded-lg px-4 py-2.5 pr-10 text-sm text-white outline-none ${passwordError ? 'border-red-500/50' : 'border-slate-800 focus:border-cyan-500/50'}`} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </motion.div>
                )}
                <AnimatePresence>
                  {passwordError && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                      className="text-red-400 text-xs font-medium pl-2 mt-1.5"
                    >
                      {passwordError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-0 mt-2 flex flex-col gap-4">
        
        <AnimatePresence>
          {alertInfo.show && (
            <motion.div 
              initial={{ opacity: 0, y: -10, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto', marginTop: 16 }}
              exit={{ opacity: 0, y: -10, height: 0, marginTop: 0, paddingBottom: 0, paddingTop: 0, overflow: 'hidden' }}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border ${
                alertInfo.type === 'success' 
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' 
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}
            >
              {alertInfo.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="text-sm font-bold">{alertInfo.message}</span>
            </motion.div>
          )}
          {globalError && (
             <motion.div 
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -10 }}
             className="flex items-center justify-center gap-2 text-red-400 bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20"
           >
             <span className="text-sm font-bold">{globalError}</span>
           </motion.div>
          )}
        </AnimatePresence>

        {!alertInfo.show && (
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <><Loader2 className="w-5 h-5 animate-spin" />Saving Global Changes...</>
            ) : (
              <><Save className="w-5 h-5" />Save Global Changes</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
