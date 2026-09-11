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
  Calendar,
  Users,
  Building2,
  Eye,
  EyeOff,
  MapPin,
  Upload,
  AlertCircle
} from 'lucide-react';
import api from '../api/axiosConfig';

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

const PasswordExpander = ({ isSaving, oldPassword, newPassword, confirmPassword, setOldPassword, setNewPassword, setConfirmPassword }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
          <button type="button" onClick={handleExpand} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
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
            <input ref={inputRef} type={showCurrent ? "text" : "password"} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Current Password" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 pr-10 text-sm text-white focus:border-red-500/50 outline-none transition-colors" />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="relative">
            <input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 pr-10 text-sm text-white focus:border-red-500/50 outline-none transition-colors" />
            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="relative">
            <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm New Password" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 pr-10 text-sm text-white focus:border-red-500/50 outline-none transition-colors" />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default function OperatorProfile() {
  const [operator, setOperator] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    phoneNumber: '',
    addressLine1: '',
  });

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, type: '', message: '' });
  
  const alertTimeoutRef = useRef(null);

  const triggerAlert = (type, message, duration = 5000) => {
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    setAlertInfo({ show: true, type, message });
    alertTimeoutRef.current = setTimeout(() => {
      setAlertInfo({ show: false, type: '', message: '' });
    }, duration);
  };
  
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const tooltipMsg = "Please contact your Institution Admin directly to request modifications to this data.";

  const [phoneError, setPhoneError] = useState("");
  const [addressError, setAddressError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const d = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const monthName = months[d.getMonth()];
    const dayNum = d.getDate();
    const year = d.getFullYear();
    const timeStr = d.toLocaleTimeString('en-GB');
    
    return `${monthName} ${dayNum}, ${year} - ${timeStr}`;
  };

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const user = JSON.parse(sessionStorage.getItem('user'));
      const response = await api.get(`/v1/operators/profile?operatorId=${user.id}`);
      const data = response.data.operator;
      setOperator(data);
      
      let combinedAddress = data.addressLine1 || '';
      
      if (data.city && !combinedAddress.includes(data.city)) {
        combinedAddress = [
          data.addressLine1,
          data.addressLine2,
          data.city,
          data.state && data.pinCode ? `${data.state} - ${data.pinCode}` : (data.state || data.pinCode),
          data.country
        ].filter(Boolean).join(', ');
      }

      setFormData({
        phoneNumber: data.phoneCountryCode && data.phoneNumber ? `${data.phoneCountryCode} ${data.phoneNumber}` : (data.phoneNumber || ''),
        addressLine1: combinedAddress || '',
      });
    } catch (err) {
      console.error(err);
      triggerAlert('error', 'Failed to load profile data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedPhotoFile(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setPhoneError("");
    setAddressError("");

    const originalPhone = operator?.phoneCountryCode && operator?.phoneNumber ? `${operator.phoneCountryCode} ${operator.phoneNumber}` : (operator?.phoneNumber || '');
    let originalCombinedAddress = operator?.addressLine1 || '';
    if (operator?.city && !originalCombinedAddress.includes(operator.city)) {
      originalCombinedAddress = [
        operator.addressLine1,
        operator.addressLine2,
        operator.city,
        operator.state && operator.pinCode ? `${operator.state} - ${operator.pinCode}` : (operator.state || operator.pinCode),
        operator.country
      ].filter(Boolean).join(', ');
    }

    const hasInfoChanges = formData.phoneNumber !== originalPhone || formData.addressLine1 !== originalCombinedAddress;
    const hasPasswordChanges = !!newPassword;
    const hasPhotoChanges = !!selectedPhotoFile;

    if (!hasInfoChanges && !hasPasswordChanges && !hasPhotoChanges) {
      triggerAlert('error', 'No changes detected to save.');
      return;
    }
    
    if (newPassword) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/;
      if (!passwordRegex.test(newPassword)) {
        triggerAlert('error', 'Password must be 8-32 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.', 6000);
        return;
      }
      if (newPassword !== confirmPassword) {
        triggerAlert('error', 'New passwords do not match.');
        return;
      }
    }

    let finalCountryCode = "";
    let finalPhoneNumber = "";
    if (formData.phoneNumber) {
      const parts = formData.phoneNumber.trim().split(" ");
      if (parts.length < 2 || !formData.phoneNumber.startsWith("+")) {
        setPhoneError("Phone must be in format: +[Code] [Number]. E.g. +91 9876543210");
        return;
      } else {
        finalCountryCode = parts[0];
        finalPhoneNumber = parts.slice(1).join("").replace(/\D/g, ''); 
      }
    }

    let finalAddressLine1 = "";
    let finalAddressLine2 = "";
    let finalCity = "";
    let finalState = "";
    let finalCountry = "";
    let finalPinCode = "";

    if (formData.addressLine1) {
      const parts = formData.addressLine1.split(",").map(s => s.trim()).filter(Boolean);
      
      if (parts.length < 4 || parts.length > 5) {
        setAddressError("Address must be format: [Line 1], [Optional Line 2], [City], [State] - [Pin], [Country]");
        return;
      }

      finalAddressLine1 = parts[0];
      finalCountry = parts[parts.length - 1];
      
      const statePinStr = parts[parts.length - 2];
      if (!statePinStr.includes("-")) {
        setAddressError("State and Pin Code must be separated by ' - ' (e.g. Karnataka - 560076)");
        return;
      }
      
      const spParts = statePinStr.split("-").map(s => s.trim());
      finalState = spParts[0];
      finalPinCode = spParts[1];

      if (parts.length === 5) {
        finalAddressLine2 = parts[1];
        finalCity = parts[2];
      } else {
        finalAddressLine2 = "";
        finalCity = parts[1];
      }
    }

    setIsSaving(true);
    try {
      const payload = {
        phoneCountryCode: finalCountryCode,
        phoneNumber: finalPhoneNumber,
        addressLine1: finalAddressLine1,
        addressLine2: finalAddressLine2,
        city: finalCity,
        state: finalState,
        country: finalCountry,
        pinCode: finalPinCode,
      };

      if (oldPassword && newPassword) {
        payload.oldPassword = oldPassword;
        payload.newPassword = newPassword;
      }

      const response = await api.put(`/v1/operators/profile?operatorId=${operator.operatorId}`, payload);
      
      if (selectedPhotoFile) {
        const photoData = new FormData();
        photoData.append('file', selectedPhotoFile);
        const photoResponse = await api.post(`/v1/operators/profile/photo?operatorId=${operator.operatorId}`, photoData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setOperator(prev => ({ ...prev, profilePhotoUrl: photoResponse.data.url }));
        setSelectedPhotoFile(null);
        setPhotoPreviewUrl(null);
      }

      triggerAlert('success', 'Profile Updated Successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (err) {
      console.error(err);
      triggerAlert('error', err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  const displayPhoto = photoPreviewUrl || operator?.profilePhotoUrl;

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
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 blur-[50px] pointer-events-none transition-colors duration-500 ${operator?.accountStatus === 'ACTIVE' ? 'bg-red-500/10' : 'bg-orange-500/10'}`} />
            
            {/* Profile Photo */}
            <div className="relative group mb-6 mt-4">
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                accept="image/jpeg, image/png, image/jpg"
                onChange={handlePhotoSelect}
              />
              <div className="w-56 h-56 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden shadow-xl group-hover:border-red-500/50 transition-colors">
                {displayPhoto ? (
                  <img src={displayPhoto} alt="Operator" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-20 h-20 text-slate-500 group-hover:text-red-400 transition-colors" />
                )}
              </div>
              <div 
                className="absolute bottom-4 right-4 p-2 bg-slate-800 border border-slate-700 rounded-full shadow-lg text-slate-400 group-hover:text-red-400 group-hover:border-red-500/50 transition-all cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Pencil className="w-4 h-4" />
              </div>
            </div>

            {/* Role Badge */}
            <div className={`px-4 py-1.5 rounded-full border mb-4 transition-colors duration-500 flex items-center gap-2 ${operator?.accountStatus === 'ACTIVE' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-orange-500/10 border-orange-500/30 text-orange-400'}`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${operator?.accountStatus === 'ACTIVE' ? 'bg-red-400' : 'bg-orange-400'}`}></span>
              <span className="text-[11px] font-black tracking-widest uppercase">
                Status: {operator?.accountStatus}
              </span>
            </div>

            {/* Operator Name (Managed) */}
            <div className="w-full relative mb-6 flex justify-center items-center">
              <h2 className="text-2xl font-black text-white text-center">{operator?.fullName}</h2>
              <div className="relative group flex items-center ml-3">
                <div className="text-slate-700 cursor-not-allowed">
                  <Pencil className="w-4 h-4" />
                </div>
                {/* Tooltip */}
                <div className="absolute right-0 bottom-full mb-2 w-64 bg-slate-800 text-white text-xs font-medium p-3 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10 pointer-events-none border border-slate-700 text-left">
                  <div className="flex gap-2 items-start">
                    <Lock className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{tooltipMsg}</p>
                  </div>
                  <div className="absolute -bottom-1 right-2 w-2 h-2 bg-slate-800 border-b border-r border-slate-700 rotate-45" />
                </div>
              </div>
            </div>

            {/* Read-Only Meta */}
            <div className="w-full flex flex-col gap-3 pt-6 border-t border-slate-800/50 text-center items-center">
              <div className="text-sm w-full px-2 leading-relaxed">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] mr-1.5">Operator ID:</span>
                <span className="font-medium text-slate-300 font-mono">{operator?.operatorId}</span>
              </div>
              <div className="text-sm w-full px-2 leading-relaxed">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] mr-1.5">Last Login At:</span>
                <span className="font-medium text-slate-300">
                  {formatDate(operator?.lastLoginAt)}
                </span>
              </div>
              <div className="text-sm w-full px-2 leading-relaxed">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] mr-1.5">Linked Institution:</span>
                <span className="font-medium text-slate-300 font-mono">{operator?.institution?.institutionName} ({operator?.institution?.institutionId})</span>
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
              <div className="flex flex-col gap-1 w-full">
                <EditableField 
                  label="Personal Mobile Number" 
                  value={formData.phoneNumber} 
                  onChange={(val) => setFormData({...formData, phoneNumber: val})}
                  icon={Phone} 
                  isSaving={isSaving}
                />
                {phoneError && <span className="text-red-400 text-xs mt-1 ml-1 font-medium">{phoneError}</span>}
              </div>
              <div className="md:col-span-2 flex flex-col gap-1 w-full">
                <EditableField 
                  label="Residential Address" 
                  value={formData.addressLine1} 
                  onChange={(val) => setFormData({...formData, addressLine1: val})}
                  icon={MapPin} 
                  isSaving={isSaving}
                />
                {addressError && <span className="text-red-400 text-xs mt-1 ml-1 font-medium">{addressError}</span>}
              </div>
              <PasswordExpander 
                isSaving={isSaving}
                oldPassword={oldPassword}
                setOldPassword={setOldPassword}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
              />
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
                value={operator?.dateOfBirth} 
                icon={Calendar} 
                tooltipMessage={tooltipMsg}
              />
              <ManagedField 
                label="Gender" 
                value={operator?.gender} 
                icon={Users} 
                tooltipMessage={tooltipMsg}
              />
              <div className="md:col-span-2">
                <ManagedField 
                  label="Official Email" 
                  value={operator?.officialEmail} 
                  icon={Mail} 
                  tooltipMessage={tooltipMsg}
                />
              </div>
              <ManagedField 
                label="Department/Ward" 
                value={operator?.department} 
                icon={Building2} 
                tooltipMessage={tooltipMsg}
              />
              <ManagedField 
                label="Position/Title" 
                value={operator?.designationTitle} 
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
          {alertInfo.show && (
            <motion.div 
              initial={{ opacity: 0, y: -10, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto', marginTop: 16 }}
              exit={{ opacity: 0, y: -10, height: 0, marginTop: 0, paddingBottom: 0, paddingTop: 0, overflow: 'hidden' }}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border ${
                alertInfo.type === 'success' 
                  ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}
            >
              {alertInfo.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="text-sm font-bold">{alertInfo.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {!alertInfo.show && (
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Profile Updates
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );

}
