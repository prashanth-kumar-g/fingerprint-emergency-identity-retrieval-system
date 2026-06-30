import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { 
  ChevronLeft, User, Calendar as CalendarIcon, Phone, Mail, MapPin, Activity, 
  Upload, Trash2, Plus, Fingerprint, Lock, ShieldCheck, CheckCircle2,
  AlertTriangle, Pencil, Droplets, Stethoscope, Pill, Camera, RefreshCcw
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

const EditableTextArea = ({ label, value, onChange, icon: Icon, placeholder, isSaving }) => {
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
      <div className="relative flex">
        <div className="absolute left-3 top-4 text-slate-500">
          {Icon && <Icon className="w-4 h-4" />}
        </div>
        <textarea 
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={!isEditing}
          placeholder={placeholder}
          className={`w-full bg-slate-950/50 border rounded-xl pl-10 pr-10 py-3 text-sm transition-all duration-300 outline-none resize-none min-h-[80px] h-full
            ${isEditing 
              ? 'border-red-500/50 text-white shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
              : 'border-slate-800/80 text-slate-300 focus:border-slate-700'
            }`}
        />
        <button 
          onClick={handleEditToggle}
          className={`absolute right-3 top-3 p-1.5 rounded-lg transition-colors
            ${isEditing ? 'bg-red-500/20 text-red-400' : 'text-slate-500 hover:text-red-400 hover:bg-slate-800'}`}
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default function ManageCitizenDetails() {
  const { id } = useParams(); // FEIRS-CIT-12345
  
  const originalData = {
    fullName: "Rajesh Kumar",
    dob: "15 June 1985",
    gender: "Male",
    mobile: "+91 98765 43210",
    email: "rajesh.kumar@example.com",
    location: "123 Main Street, Apt 4B, Mumbai, Maharashtra, 400001, India",
    bloodGroup: "O+",
    allergies: "Penicillin",
    chronicConditions: "None",
    medications: "None"
  };

  const [formData, setFormData] = useState(originalData);
  const [contacts, setContacts] = useState([
    { id: 1, name: 'Jane Doe', relationship: 'Spouse', mobile: '+91 99887 76655', email: 'jane.doe@example.com' }
  ]);

  const updateContact = (id, field, value) => {
    setContacts(contacts.map(c => c.id === id ? { ...c, [field]: value } : c));
  };
  
  const removeContact = (id) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const addContact = () => {
    if (contacts.length < 5) {
      setContacts([...contacts, { id: Date.now(), name: '', relationship: '', mobile: '', email: '' }]);
    }
  };

  // High-Level States
  const [isAccountActive, setIsAccountActive] = useState(true);
  const [authFingerprintQuality, setAuthFingerprintQuality] = useState(0);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [otpBlockState, setOtpBlockState] = useState('HIDDEN'); // HIDDEN, PENDING_OTP, SUCCESS
  const [otpValue, setOtpValue] = useState('');
  const [pendingAction, setPendingAction] = useState(null); // 'SAVE', 'TOGGLE_STATUS'
  
  // Profile Photo States
  const [isPhotoEditing, setIsPhotoEditing] = useState(false);
  const [photoCaptured, setPhotoCaptured] = useState(false);

  // Name Editing State
  const [isNameEditing, setIsNameEditing] = useState(false);
  const nameInputRef = useRef(null);
  
  const [isSaving, setIsSaving] = useState(false);
  
  const handleNameEditToggle = () => {
    if (isNameEditing) {
      setIsNameEditing(false);
    } else {
      setIsNameEditing(true);
      setTimeout(() => nameInputRef.current?.focus(), 0);
    }
  };

  useEffect(() => {
    if (otpBlockState === 'SUCCESS') {
      setIsNameEditing(false);
      setIsPhotoEditing(false);
      setIsSaving(true);
      setTimeout(() => setIsSaving(false), 100);
    }
  }, [otpBlockState]);

  const handleSimulateAuthFingerprint = () => {
    if (authFingerprintQuality > 0) {
      setAuthFingerprintQuality(0);
      setOtpBlockState('HIDDEN');
      setPendingAction(null);
      return;
    }
    setIsAuthorizing(true);
    let q = 0;
    const interval = setInterval(() => {
      q += 15;
      if (q >= 85) {
        clearInterval(interval);
        setAuthFingerprintQuality(88);
        setIsAuthorizing(false);
      } else {
        setAuthFingerprintQuality(q);
      }
    }, 400);
  };

  const initiateAction = (action) => {
    setPendingAction(action);
    setOtpBlockState('PENDING_OTP');
    setOtpValue('');
  };

  const handleVerifyOTP = () => {
    if (otpValue.length === 6) {
      setOtpBlockState('SUCCESS');
      setTimeout(() => {
        if (pendingAction === 'TOGGLE_STATUS') {
          setIsAccountActive(!isAccountActive);
        }
        // Reset everything
        setOtpBlockState('HIDDEN');
        setAuthFingerprintQuality(0);
        setPendingAction(null);
      }, 2000);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-6 pb-24 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[500px] rounded-[100%] bg-red-900/10 blur-[150px] pointer-events-none z-0" />

      {/* Page Header */}
      <div className="relative z-10 w-full flex flex-col items-start justify-center mt-4 mb-4 max-w-[1400px] mx-auto px-6 lg:px-0">
        <Link to="/operator/manage-citizens" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group mb-4">
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm tracking-wide">Back to Manage Citizens</span>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-0">
        
        {/* 50/50 DYNAMIC SPLIT LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch mb-6">
          
          {/* LEFT COLUMN (50%): Identity & Contacts */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6 relative">

            {/* Card 1: Profile Anchor */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 blur-[50px] pointer-events-none transition-colors duration-500 ${isAccountActive ? 'bg-emerald-500/10' : 'bg-red-500/10'}`} />
              
              <div className="relative group mb-6 mt-4">
                <div className={`w-[220px] h-[220px] rounded-full flex items-center justify-center overflow-hidden shadow-xl transition-all duration-500 relative ${
                    isPhotoEditing && !photoCaptured ? 'border-4 border-red-500 bg-slate-950' :
                    isPhotoEditing && photoCaptured ? 'border-4 border-emerald-500 bg-emerald-900/10' :
                    'border-2 border-transparent bg-slate-800'
                }`}>
                  {isPhotoEditing ? (
                    photoCaptured ? (
                      <User className="w-24 h-24 text-emerald-400" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full w-full relative">
                        <User className="w-24 h-24 text-slate-600" />
                        <motion.div 
                          className="absolute top-0 left-0 w-full h-1 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] z-0"
                          animate={{ y: [0, 220, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                    )
                  ) : (
                    <User className="w-24 h-24 text-slate-500" />
                  )}
                </div>

                <button 
                  onClick={() => setIsPhotoEditing(!isPhotoEditing)}
                  className={`absolute bottom-4 right-4 p-2 flex items-center justify-center bg-slate-800 border border-slate-700 rounded-full shadow-lg z-10 text-slate-400 hover:text-red-400 hover:border-red-500/50 transition-all ${isPhotoEditing ? 'text-red-400 border-red-500/50' : ''}`}
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>

              <AnimatePresence>
                {isPhotoEditing && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden w-full flex justify-center mb-6"
                  >
                    <button
                      type="button"
                      onClick={() => setPhotoCaptured(!photoCaptured)}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-colors ${
                        photoCaptured 
                          ? 'bg-transparent border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500' 
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      }`}
                    >
                      {photoCaptured ? (
                        <><RefreshCcw className="w-4 h-4" /> Reset Photo</>
                      ) : (
                        <><Camera className="w-4 h-4" /> Capture Photo</>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Status Badge */}
              <div className={`px-4 py-1.5 rounded-full border mb-6 transition-colors duration-500 flex items-center gap-2 ${isAccountActive ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                <span className={`w-2 h-2 rounded-full animate-pulse ${isAccountActive ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                <span className="text-[11px] font-black tracking-widest uppercase">
                  Status: {isAccountActive ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>

              {/* Citizen Name */}
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
                      ? 'text-white border-red-500/50' 
                      : 'text-white border-transparent hover:border-slate-700'
                  }`}
                />
                <div className="relative flex items-center ml-3">
                  <button 
                    onClick={handleNameEditToggle}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isNameEditing ? 'text-red-400 bg-red-500/20' : 'text-slate-500 hover:text-red-400 hover:bg-slate-800'
                    }`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Read-Only Meta (Matches Operator page structure) */}
              <div className="w-full flex flex-col gap-3 pt-6 border-t border-slate-800/50 text-center items-center">
                <div className="flex flex-wrap justify-center gap-1.5 text-sm">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] mt-0.5">System ID:</span>
                  <span className="font-medium text-slate-300 font-mono text-center">{id || 'FEIRS-CIT-12345'}</span>
                </div>
                <div className="flex flex-wrap justify-center gap-1.5 text-sm">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] mt-0.5">Account Created:</span>
                  <span className="font-medium text-slate-300 text-center">Oct 20, 2026</span>
                </div>
              </div>
            </div>

            {/* Card 2: Emergency Contacts (Scrollable) */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col flex-grow relative overflow-hidden">
              {!isAccountActive && (
                <div className="absolute inset-0 z-20 backdrop-blur-xl bg-slate-950/80 flex flex-col items-center justify-center p-6 text-center">
                  <div className="bg-red-500/10 p-4 rounded-full mb-4 border border-red-500/20">
                    <Lock className="w-8 h-8 text-red-400" />
                  </div>
                  <p className="font-bold text-red-100/90 text-sm leading-relaxed max-w-[250px]">
                    Account is disabled. Reactivate account via biometric auth and email of live citizen to view or modify data.
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700">
                    <Phone className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Emergency Contacts</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{contacts.length}/5 Registered</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-4 overflow-y-auto max-h-[480px] pr-2 custom-scrollbar">
                {contacts.map((c, i) => (
                  <div key={c.id} className="bg-slate-950/50 border border-slate-800 rounded-xl p-5 relative">
                    {contacts.length > 1 && (
                      <button onClick={() => removeContact(c.id)} className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-red-400 bg-slate-900 rounded-lg transition-colors z-10"><Trash2 className="w-4 h-4"/></button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                      <EditableField label="Name" icon={User} value={c.name} onChange={v => updateContact(c.id, 'name', v)} isSaving={isSaving} />
                      <EditableField label="Relationship" icon={User} value={c.relationship} onChange={v => updateContact(c.id, 'relationship', v)} isSaving={isSaving} />
                      <EditableField label="Mobile Number" icon={Phone} value={c.mobile} onChange={v => updateContact(c.id, 'mobile', v)} isSaving={isSaving} />
                      <EditableField label="Email Address" icon={Mail} value={c.email} onChange={v => updateContact(c.id, 'email', v)} isSaving={isSaving} />
                    </div>
                  </div>
                ))}
                
                {contacts.length < 5 && (
                  <button onClick={addContact} className="w-full py-4 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 font-bold hover:border-red-500/50 hover:text-red-400 bg-slate-950/30 hover:bg-slate-950/50 transition-colors flex items-center justify-center gap-2 mt-2">
                    <Plus className="w-4 h-4" /> Add Emergency Contact
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (50%): Demographics & Medical */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6 relative">

            {/* Card 3: Personal Demographics */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col relative overflow-hidden">
              {!isAccountActive && (
                <div className="absolute inset-0 z-20 backdrop-blur-xl bg-slate-950/80 flex flex-col items-center justify-center p-6 text-center">
                  <div className="bg-red-500/10 p-4 rounded-full mb-4 border border-red-500/20">
                    <Lock className="w-8 h-8 text-red-400" />
                  </div>
                  <p className="font-bold text-red-100/90 text-sm leading-relaxed max-w-[250px]">
                    Account is disabled. Reactivate account via biometric auth and email of live citizen to view or modify data.
                  </p>
                </div>
              )}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/50">
                <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Personal Demographics</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Contact and location profile</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EditableField label="Date of Birth" icon={CalendarIcon} value={formData.dob} onChange={v => setFormData({...formData, dob: v})} isSaving={isSaving} />
                <EditableField label="Gender" icon={User} value={formData.gender} onChange={v => setFormData({...formData, gender: v})} isSaving={isSaving} />
                <EditableField label="Mobile Number" icon={Phone} value={formData.mobile} onChange={v => setFormData({...formData, mobile: v})} isSaving={isSaving} />
                <EditableField label="Email Address" icon={Mail} value={formData.email} onChange={v => setFormData({...formData, email: v})} isSaving={isSaving} />
                <div className="md:col-span-2">
                  <EditableField label="Location Address" icon={MapPin} value={formData.location} onChange={v => setFormData({...formData, location: v})} isSaving={isSaving} />
                </div>
              </div>
            </div>

            {/* Card 4: Critical Medical Information (Flex-Grow to balance columns) */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col flex-grow relative overflow-hidden">
              {!isAccountActive && (
                <div className="absolute inset-0 z-20 backdrop-blur-xl bg-slate-950/80 flex flex-col items-center justify-center p-6 text-center">
                  <div className="bg-red-500/10 p-4 rounded-full mb-4 border border-red-500/20">
                    <Lock className="w-8 h-8 text-red-400" />
                  </div>
                  <p className="font-bold text-red-100/90 text-sm leading-relaxed max-w-[250px]">
                    Account is disabled. Reactivate account via biometric auth and email of live citizen to view or modify data.
                  </p>
                </div>
              )}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/50">
                <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700">
                  <Activity className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Critical Medical Information</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Life-saving health profile</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-6 flex-grow">
                {/* 2x2 Grid Layout for Medical Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div className="flex flex-col h-full">
                    <EditableTextArea label="Blood Group" icon={Droplets} value={formData.bloodGroup} onChange={v => setFormData({...formData, bloodGroup: v})} isSaving={isSaving} />
                  </div>
                  <div className="flex flex-col h-full">
                    <EditableTextArea label="Severe Allergies" icon={AlertTriangle} value={formData.allergies} onChange={v => setFormData({...formData, allergies: v})} isSaving={isSaving} />
                  </div>
                  <div className="flex flex-col h-full">
                    <EditableTextArea label="Chronic Conditions" icon={Stethoscope} value={formData.chronicConditions} onChange={v => setFormData({...formData, chronicConditions: v})} isSaving={isSaving} />
                  </div>
                  <div className="flex flex-col h-full">
                    <EditableTextArea label="Current Medications" icon={Pill} value={formData.medications} onChange={v => setFormData({...formData, medications: v})} isSaving={isSaving} />
                  </div>
                </div>
                
                {/* PDF Dropzone uses flex-grow to stretch downwards if left column is longer */}
                <div className="w-full mt-2 flex flex-col flex-grow min-h-[100px]">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pl-1">Medical Checkup Report</label>
                  <div className="w-full flex-grow rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/50 hover:border-red-500/50 flex flex-col items-center justify-center cursor-pointer transition-colors group p-4 text-center">
                    <Upload className="w-6 h-6 text-slate-500 mb-2 group-hover:text-red-400 transition-colors" />
                    <p className="text-xs font-bold text-slate-400 group-hover:text-slate-300">Upload PDF Report</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* FULL-WIDTH SECURITY & ACTION ZONE */}
        <div className="w-full flex flex-col gap-6 items-center">
          
          {/* Card 5: Biometric Authorization (Full-Width Card) */}
          <div className="w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-xl flex flex-col items-center justify-center text-center">
            <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
              <Fingerprint className="w-6 h-6 text-red-400" /> Biometric Authorization Required
            </h3>
            <p className="text-slate-400 text-sm mb-6 whitespace-nowrap">
              A live citizen fingerprint scan is strictly required to authorize any profile modifications or status overrides.
            </p>

            <div className="relative mb-4">
              <div className={`w-[312px] h-[325px] rounded-2xl border-4 bg-slate-950 flex flex-col items-center justify-center overflow-hidden transition-all duration-500 shadow-xl ${
                authFingerprintQuality > 0 ? 'border-emerald-500' : 'border-slate-800'
              }`}>
                 {authFingerprintQuality > 0 ? (
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
            
            <div className={`mb-6 font-bold text-sm tracking-wider ${authFingerprintQuality > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
              Quality: {authFingerprintQuality}%
            </div>
            
            <div className="flex items-center justify-center gap-4 w-full max-w-md">
              {authFingerprintQuality > 0 ? (
                <button
                  onClick={handleSimulateAuthFingerprint}
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-full font-black transition-all shadow-lg text-sm tracking-wide bg-transparent border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500"
                >
                  <Trash2 className="w-4 h-4" /> Reset
                </button>
              ) : (
                <button
                  disabled={isAuthorizing}
                  onClick={handleSimulateAuthFingerprint}
                  className={`flex items-center justify-center gap-2 w-full py-4 rounded-full font-black transition-all shadow-lg text-sm tracking-wide ${
                    isAuthorizing ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  }`}
                >
                  <Fingerprint className="w-4 h-4" /> Scan Fingerprint
                </button>
              )}
            </div>
          </div>

          {/* Inline OTP Verification Block */}
          <div className="w-full">
            <AnimatePresence>
              {otpBlockState !== 'HIDDEN' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full bg-slate-900/80 backdrop-blur-md border border-amber-500/30 rounded-xl p-5 overflow-hidden shadow-xl mb-6"
                >
                  {otpBlockState === 'PENDING_OTP' ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <ShieldCheck className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-sm font-bold text-white">Final Authorization Required</h4>
                          <p className="text-xs text-slate-400">Enter the 6-digit OTP sent to the Citizen's email.</p>
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
                          onClick={handleVerifyOTP}
                          disabled={otpValue.length !== 6}
                          className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:hover:bg-amber-600 text-white font-bold rounded-lg transition-colors text-sm"
                        >
                          Verify
                        </button>
                      </div>
                    </div>
                  ) : (
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center justify-center gap-3 py-2">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      <h4 className="text-emerald-400 font-black text-lg">Action Executed Successfully</h4>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* The Final Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full mb-12">
            <button 
              disabled={authFingerprintQuality === 0 || otpBlockState !== 'HIDDEN'}
              onClick={() => initiateAction('SAVE')}
              className="w-full sm:w-1/2 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white font-black text-lg rounded-2xl shadow-xl transition-all"
            >
              Save Changes
            </button>
            
            {isAccountActive ? (
              <button 
                disabled={authFingerprintQuality === 0 || otpBlockState !== 'HIDDEN'}
                onClick={() => initiateAction('TOGGLE_STATUS')}
                className="w-full sm:w-1/2 py-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:hover:bg-red-600 text-white font-black text-lg rounded-2xl shadow-xl transition-all flex justify-center items-center gap-3"
              >
                <Lock className="w-6 h-6" /> Disable Account
              </button>
            ) : (
              <button 
                disabled={authFingerprintQuality === 0 || otpBlockState !== 'HIDDEN'}
                onClick={() => initiateAction('TOGGLE_STATUS')}
                className="w-full sm:w-1/2 py-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 text-white font-black text-lg rounded-2xl shadow-xl transition-all flex justify-center items-center gap-3"
              >
                <ShieldCheck className="w-6 h-6" /> Activate Account
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
