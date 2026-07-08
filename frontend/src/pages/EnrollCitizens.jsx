import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Select from 'react-select';
import { Country, State, City } from 'country-state-city';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
  Camera, 
  RefreshCcw, 
  User, 
  Calendar as CalendarIcon, 
  Phone, 
  Mail, 
  MapPin, 
  Activity, 
  Upload, 
  FileCheck, 
  Trash2, 
  Plus, 
  Fingerprint, 
  ShieldCheck, 
  X,
  CheckCircle2,
  Lock,
  ChevronRight,
  Loader2,
  AlertCircle,
  FileText
} from 'lucide-react';
import axios from 'axios';

// ── Shared React-Select Custom Dark Styles (Red Theme) ──
const customStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#020617', // slate-950
    borderColor: state.isFocused ? '#ef4444' : '#1e293b', // red-500 : slate-800
    padding: '0.2rem',
    borderRadius: '0.75rem',
    boxShadow: state.isFocused ? '0 0 0 1px #ef4444' : 'none',
    cursor: 'text',
    '&:hover': {
      borderColor: state.isFocused ? '#ef4444' : '#334155'
    }
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#0f172a', // slate-900
    border: '1px solid #334155',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    zIndex: 50,
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: '200px',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#dc2626' : state.isFocused ? '#7f1d1d' : 'transparent',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.875rem',
    '&:active': {
      backgroundColor: '#dc2626'
    }
  }),
  singleValue: (base) => ({
    ...base,
    color: 'white',
  }),
  input: (base) => ({
    ...base,
    color: 'white',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#475569',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: '#64748b',
    '&:hover': {
      color: '#94a3b8'
    }
  })
};

// ── Prepare Global Data ──
const allCountries = Country.getAllCountries().map(c => ({
  value: c.isoCode,
  label: c.name
}));

const phoneCodeMap = new Map();
Country.getAllCountries().forEach(c => {
  if (c.phonecode && !phoneCodeMap.has(c.phonecode)) {
    phoneCodeMap.set(c.phonecode, {
      value: `+${c.phonecode.replace('+', '')}`,
      label: `+${c.phonecode.replace('+', '')} (${c.name})`
    });
  }
});
const allPhoneCodes = Array.from(phoneCodeMap.values()).sort((a, b) => a.label.localeCompare(b.label));

const genderOptions = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' }
];

const bloodGroupOptions = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' }
];

const relationshipOptions = [
  { value: 'Parent', label: 'Parent' },
  { value: 'Spouse', label: 'Spouse' },
  { value: 'Child', label: 'Child' },
  { value: 'Sibling', label: 'Sibling' },
  { value: 'Grand Parent', label: 'Grand Parent' },
  { value: 'Legal Guardian', label: 'Legal Guardian' },
  { value: 'Friend', label: 'Friend' },
  { value: 'Neighbour', label: 'Neighbour' },
  { value: 'Other', label: 'Other' }
];

export default function EnrollCitizens() {
  // ── States ──
  const [enrollState, setEnrollState] = useState('READY'); // READY, OTP, SUCCESS, SUCCESS_HIDDEN
  const isLocked = enrollState !== 'READY';

  // Biometrics
  const [photoCaptured, setPhotoCaptured] = useState(false);
  const [livePhotoFile, setLivePhotoFile] = useState(null);
  const [livePhotoDataUrl, setLivePhotoDataUrl] = useState(null);
  const [fingerprintQuality, setFingerprintQuality] = useState(0);
  const [fingerprintBmpBase64, setFingerprintBmpBase64] = useState('');
  const [fingerprintIsoTemplate, setFingerprintIsoTemplate] = useState('');
  const [isCapturingFingerprint, setIsCapturingFingerprint] = useState(false);
  const isCapturingRef = useRef(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Demographics
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState(null);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState(null);
  
  const [personalPhoneCode, setPersonalPhoneCode] = useState(null);
  const [personalPhone, setPersonalPhone] = useState('');
  const [email, setEmail] = useState('');

  // Location
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [country, setCountry] = useState(null);
  const [stateRegion, setStateRegion] = useState(null);
  const [city, setCity] = useState(null);
  const [pinCode, setPinCode] = useState('');

  const stateOptions = country ? State.getStatesOfCountry(country.value).map(s => ({ value: s.isoCode, label: s.name })) : [];
  const cityOptions = stateRegion && country ? City.getCitiesOfState(country.value, stateRegion.value).map(c => ({ value: c.name, label: c.name })) : [];

  // Medical
  const [bloodGroup, setBloodGroup] = useState(null);
  const [severeAllergies, setSevereAllergies] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [medicalReport, setMedicalReport] = useState(null);
  const reportInputRef = useRef(null);

  // Emergency Contacts
  const [contacts, setContacts] = useState([
    { id: Date.now(), name: '', relationship: null, phoneCode: null, phone: '', email: '' }
  ]);

  // OTP
  const [otpValue, setOtpValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, type: '', message: '' });

  const triggerAlert = (type, message) => {
    setAlertInfo({ show: true, type, message });
    setTimeout(() => {
      setAlertInfo({ show: false, type: '', message: '' });
    }, 3500);
  };
  
  // Dynamic Age Calculation
  useEffect(() => {
    if (dob) {
      const today = new Date();
      let calculatedAge = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge > 0 ? `${calculatedAge} Yrs` : '0 Yrs');
    } else {
      setAge('');
    }
  }, [dob]);

  // Handlers
  const handleMedicalReport = (e) => {
    if (isLocked) return;
    const file = e.target.files[0];
    if (file && ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type) && file.size <= 10 * 1024 * 1024) {
      setMedicalReport(file);
    }
  };

  const addContact = () => {
    if (contacts.length < 5 && !isLocked) {
      setContacts([...contacts, { id: Date.now(), name: '', relationship: null, phoneCode: null, phone: '', email: '' }]);
    }
  };

  const removeContact = (idToRemove) => {
    if (isLocked) return;
    setContacts(contacts.filter(c => c.id !== idToRemove));
  };

  const updateContact = (id, field, value) => {
    if (isLocked) return;
    setContacts(contacts.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  // --- Camera Logic ---
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      triggerAlert('error', 'Unable to access camera. Please check permissions.');
    }
  };

  // Ensure video keeps playing its stream if component re-renders
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(e => console.error("Video play error:", e));
      }
    }
  });

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const dataUrl = canvasRef.current.toDataURL('image/jpeg');
      setLivePhotoDataUrl(dataUrl);
      
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `live_photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
          setLivePhotoFile(file);
          setPhotoCaptured(true);
          stopCamera();
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const resetPhoto = () => {
    if (isLocked) return;
    setPhotoCaptured(false);
    setLivePhotoFile(null);
    setLivePhotoDataUrl(null);
    startCamera();
  };
  
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);
  // --------------------

  const handleSimulateFingerprint = async () => {
    if (isLocked) return;
    if (fingerprintQuality > 0) {
      setFingerprintQuality(0);
      setFingerprintBmpBase64('');
      setFingerprintIsoTemplate('');
    } else {
      if (isCapturingRef.current) return;
      
      setIsCapturingFingerprint(true);
      isCapturingRef.current = true;
      
      // Use setTimeout so React can render the loading state before the synchronous CaptureFinger blocks the UI thread
      setTimeout(() => {
        try {
          if (typeof window.CaptureFinger !== 'function') {
            throw new Error("MFS100 scripts (mfs100.js) are not loaded in index.html");
          }
          
          const res = window.CaptureFinger(60, 10000);
          
          if (res.httpStaus) {
            const data = res.data;
            if (data && data.BitmapData && (data.ErrorCode == 0 || data.BitmapData.length > 10)) {
              setFingerprintQuality(data.Quality || 100);
              setFingerprintBmpBase64(data.BitmapData);
              setFingerprintIsoTemplate(data.IsoTemplate);
              triggerAlert('success', 'Fingerprint captured successfully!');
            } else {
              throw new Error(data ? (data.ErrorDescription || data.Description || 'Capture failed') : 'No response data from scanner');
            }
          } else {
            throw new Error(res.err || 'Scanner Service not reachable (Network Error)');
          }
        } catch (error) {
          console.error("Fingerprint capture error:", error);
          triggerAlert('error', `Fingerprint Capture Failed: ${error.message || 'Scanner not ready'}`);
        } finally {
          setIsCapturingFingerprint(false);
          isCapturingRef.current = false;
        }
      }, 100);
    }
  };

  const handleRequestVerification = async (e) => {
    e.preventDefault();
    if (enrollState === 'READY') {
      if (!livePhotoFile) {
        triggerAlert('error', 'Please capture a live photo.');
        return;
      }
      if (!fingerprintIsoTemplate || !fingerprintBmpBase64) {
        triggerAlert('error', 'Please capture the citizen fingerprint.');
        return;
      }
      if (!email) {
        triggerAlert('error', 'Email is required for OTP verification.');
        return;
      }
      
      setIsSaving(true);
      try {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:8080/api/v1/citizens/enroll/initiate', {
          email: email,
          fullName: fullName
        }, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000 // 15 seconds timeout to prevent hanging if SMTP fails
        });
        
        setEnrollState('OTP');
        triggerAlert('warning', "An authorization code has been dispatched to the provided email address.");
      } catch (error) {
        console.error("Initiate enrollment error:", error);
        triggerAlert('error', error.response?.data?.error || 'Failed to send OTP. Please try again.');
      } finally {
        setIsSaving(false);
      }
    } else if (enrollState === 'OTP') {
      if (otpValue.length < 6) return;
      setIsOtpVerifying(true);
      try {
        const token = localStorage.getItem('token');
        const citizenData = {
          fullName,
          dateOfBirth: dob ? dob.toISOString().split('T')[0] : null,
          gender: gender ? gender.value : null,
          phoneCountryCode: personalPhoneCode ? personalPhoneCode.value : null,
          phoneNumber: personalPhone,
          emailAddress: email,
          addressLine1: address1,
          addressLine2: address2,
          city: city ? city.value : null,
          state: stateRegion ? stateRegion.value : null,
          country: country ? country.label : null,
          pinCode: pinCode,
          bloodGroup: bloodGroup ? bloodGroup.value : null,
          severeAllergies: severeAllergies,
          chronicConditions: chronicConditions,
          currentMedications: currentMedications
        };
        
        const contactsData = contacts.filter(c => c.name.trim() !== '').map(c => ({
          contactName: c.name,
          relationship: c.relationship ? c.relationship.value : null,
          phoneCountryCode: c.phoneCode ? c.phoneCode.value : null,
          phoneNumber: c.phone,
          emailAddress: c.email
        }));

        const formData = new FormData();
        formData.append('otp', otpValue);
        formData.append('citizen', JSON.stringify(citizenData));
        formData.append('contacts', JSON.stringify(contactsData));
        formData.append('fingerprintBmpBase64', fingerprintBmpBase64);
        formData.append('fingerprintIsoTemplate', fingerprintIsoTemplate);
        
        if (livePhotoFile) {
          formData.append('livePhoto', livePhotoFile);
        }
        if (medicalReport) {
          formData.append('medicalReport', medicalReport);
        }

        await axios.post('http://localhost:8080/api/v1/citizens/enroll/verify', formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        
        setEnrollState('SUCCESS');
        setOtpValue('');
        triggerAlert('success', 'OTP Verified! Citizen successfully enrolled.');
        
        setTimeout(() => {
            window.location.reload();
        }, 3000);
      } catch (error) {
        console.error("Verify enrollment error:", error);
        triggerAlert('error', error.response?.data?.error || 'Invalid OTP or enrollment failed.');
      } finally {
        setIsOtpVerifying(false);
      }
    }
  };

  // ReadOnly Component Wrapper
  const renderInput = (value, placeholder, onChange, icon, type = "text") => {
    if (isLocked) {
      return (
        <div className="relative flex items-center">
          {icon && <div className="absolute left-4 w-5 h-5 text-slate-500">{icon}</div>}
          <input 
            type={type} 
            value={value || ''} 
            readOnly 
            placeholder={placeholder}
            className={`w-full bg-slate-900/50 border border-slate-800 text-slate-300 ${icon ? 'pl-12' : 'pl-4'} pr-10 py-3 rounded-xl cursor-default`}
          />
          <Lock className="absolute right-4 w-4 h-4 text-slate-600" />
        </div>
      );
    }
    return (
      <div className="relative flex items-center">
        {icon && <div className="absolute left-4 w-5 h-5 text-slate-500">{icon}</div>}
        <input 
          type={type} 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          className={`w-full bg-slate-950 border border-slate-800 text-white ${icon ? 'pl-12' : 'pl-4'} pr-4 py-3 rounded-xl focus:outline-none focus:ring-0 focus:border-red-500 transition-colors`}
        />
      </div>
    );
  };

  const renderSelect = (value, options, onChange, placeholder) => {
    if (isLocked) {
      return (
        <div className="relative">
          <input 
            type="text" 
            value={value ? value.label : ''} 
            readOnly 
            placeholder={placeholder}
            className="w-full bg-slate-900/50 border border-slate-800 text-slate-300 pl-4 pr-10 py-[11px] rounded-xl cursor-default"
          />
          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
        </div>
      );
    }
    return (
      <Select
        options={options}
        styles={customStyles}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        isClearable
        required
      />
    );
  };

  return (
    <div className="w-full flex flex-col items-center pb-4 relative">
      
      {/* Background Ambient Glow (Operator Red Theme) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] rounded-[100%] bg-red-900/10 blur-[150px] pointer-events-none z-0" />

      {/* Header Section */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center text-center mt-2 mb-8 max-w-[1400px] mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
          Enroll Citizens
        </h1>
        
        {/* Live Connection Badge */}
        <div className="flex items-center justify-center gap-1.5 mb-4 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 w-max">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
          <p className="text-[10px] font-bold tracking-widest text-red-400 uppercase">
            Live Connection
          </p>
        </div>
      </div>

      {/* Form Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-4xl bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl"
      >
        <form onSubmit={handleRequestVerification} className="flex flex-col gap-10">

          {/* 1. Live Photo Capture (The Visual Anchor) */}
          <div className="w-full flex flex-col items-center border-b border-slate-800/50 pb-8">
            <div className="relative mb-4">
              <div className={`w-[220px] h-[220px] rounded-full border-4 flex flex-col items-center justify-center overflow-hidden shadow-2xl transition-all duration-500 ${photoCaptured ? 'border-red-500 bg-red-900/10' : 'border-slate-800 bg-slate-950'}`}>
                {photoCaptured && livePhotoDataUrl ? (
                  <img src={livePhotoDataUrl} alt="Captured" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full w-full relative">
                    {/* Live Camera Feed */}
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className={`w-full h-full object-cover ${!isCameraActive ? 'hidden' : ''}`} 
                    />
                    {!isCameraActive && (
                      <div className="flex flex-col items-center text-slate-500 z-10">
                        <Camera className="w-12 h-12 mb-2" />
                        <span className="text-[10px] font-bold">CAMERA OFF</span>
                      </div>
                    )}
                    {/* Mock Scanner Line */}
                    {isCameraActive && (
                      <motion.div 
                        className="absolute top-0 left-0 w-full h-1 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] z-0"
                        animate={{ y: [0, 220, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                  </div>
                )}
                {/* Hidden canvas to process image */}
                <canvas ref={canvasRef} className="hidden" />
              </div>
            </div>

            <div className="mb-4 font-bold text-sm text-slate-400 tracking-wider">
              CITIZEN PHOTO
            </div>
            
            <div className="flex gap-4">
              {!isCameraActive && !photoCaptured && (
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={startCamera}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-colors bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" /> Start Camera
                </button>
              )}

              {isCameraActive && !photoCaptured && (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-colors bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  <Camera className="w-4 h-4" /> Capture Photo
                </button>
              )}

              {photoCaptured && (
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={resetPhoto}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-colors ${
                    isLocked ? 'bg-slate-800 text-slate-500 cursor-not-allowed' :
                    'bg-transparent border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500'
                  }`}
                >
                  <RefreshCcw className="w-4 h-4" /> Retake Photo
                </button>
              )}
            </div>
          </div>

          {/* 2. Citizen Demographics */}
          <section>
            <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
              <User className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-bold text-white tracking-wide">Citizen Demographics</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                {renderInput(fullName, "Enter citizen's legal name", setFullName)}
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Date of Birth (DOB)
                  {age && <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-black tracking-widest">Age: {age}</span>}
                </label>
                <div className="relative flex items-center">
                  <CalendarIcon className="absolute left-4 w-5 h-5 text-slate-500 pointer-events-none z-10" />
                  {isLocked ? (
                    <>
                      <input 
                        type="text" 
                        value={dob ? dob.toLocaleDateString() : ''} 
                        readOnly 
                        className="w-full bg-slate-900/50 border border-slate-800 text-slate-300 pl-12 pr-10 py-3 rounded-xl cursor-default"
                      />
                      <Lock className="absolute right-4 w-4 h-4 text-slate-600" />
                    </>
                  ) : (
                    <DatePicker 
                      selected={dob} 
                      onChange={(date) => setDob(date)} 
                      placeholderText="Select birth date"
                      dateFormat="MMMM d, yyyy"
                      showYearDropdown
                      scrollableYearDropdown
                      yearDropdownItemNumber={120}
                      maxDate={new Date()}
                      required
                      className="w-full h-[48px] bg-slate-950 border border-slate-800 text-white pl-12 pr-4 rounded-xl focus:outline-none focus:ring-0 focus:border-red-500 transition-colors cursor-pointer"
                      calendarClassName="dark-theme-calendar"
                      wrapperClassName="w-full"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Gender</label>
                {renderSelect(gender, genderOptions, setGender, "Select gender")}
              </div>

              <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Personal Mobile Number</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="w-full sm:w-[35%]">
                      {renderSelect(personalPhoneCode, allPhoneCodes, setPersonalPhoneCode, "Code...")}
                    </div>
                    <div className="flex-grow">
                      {renderInput(personalPhone, "Phone number", setPersonalPhone)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address (OTP Destination)</label>
                  {renderInput(email, "citizen@email.com", setEmail, <Mail />, "email")}
                </div>
              </div>
            </div>
          </section>

          {/* 3. Personal Location */}
          <section>
            <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
              <MapPin className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-bold text-white tracking-wide">Personal Location</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Address Line 1 (Building & Street)</label>
                {renderInput(address1, "Enter building number and street", setAddress1)}
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Address Line 2 (Optional Landmark)</label>
                {isLocked ? (
                  <div className="relative flex items-center">
                    <input type="text" value={address2} readOnly className="w-full bg-slate-900/50 border border-slate-800 text-slate-300 pl-4 pr-10 py-3 rounded-xl cursor-default" />
                    <Lock className="absolute right-4 w-4 h-4 text-slate-600" />
                  </div>
                ) : (
                  <input type="text" value={address2} onChange={(e) => setAddress2(e.target.value)} placeholder="Enter landmark or floor" className="w-full bg-slate-950 border border-slate-800 text-white pl-4 pr-4 py-3 rounded-xl focus:outline-none focus:ring-0 focus:border-red-500 transition-colors" />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">City / District</label>
                {renderSelect(city, cityOptions, setCity, "Search city...")}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">State / Province</label>
                {renderSelect(stateRegion, stateOptions, (val) => { setStateRegion(val); setCity(null); }, "Search state...")}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Postal / Pin Code</label>
                {renderInput(pinCode, "Enter postal code", setPinCode)}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Country</label>
                {renderSelect(country, allCountries, (val) => { setCountry(val); setStateRegion(null); setCity(null); }, "Search country")}
              </div>
            </div>
          </section>

          {/* 4. Critical Medical Information */}
          <section>
            <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
              <Activity className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-bold text-white tracking-wide">Critical Medical Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Blood Group (Required)</label>
                <div className="w-full h-[100px] flex items-start">
                  <div className="w-full">
                    {isLocked ? (
                      <div className="relative">
                        <input type="text" value={bloodGroup ? bloodGroup.label : ''} readOnly placeholder="Select Blood Group" className="w-full h-[80px] bg-slate-900/50 border border-slate-800 text-slate-300 pl-4 pr-10 py-[11px] rounded-xl cursor-default" />
                        <Lock className="absolute right-4 top-4 w-4 h-4 text-slate-600" />
                      </div>
                    ) : (
                      <Select options={bloodGroupOptions} styles={{...customStyles, control: (b,s) => ({...customStyles.control(b,s), minHeight: '80px', alignItems: 'flex-start'})}} placeholder="Select Blood Group" value={bloodGroup} onChange={setBloodGroup} isClearable required />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Severe Allergies (Optional)</label>
                {isLocked ? (
                  <div className="relative">
                    <textarea value={severeAllergies} readOnly className="w-full h-[80px] bg-slate-900/50 border border-slate-800 text-slate-300 px-4 py-3 rounded-xl cursor-default resize-none" />
                    <Lock className="absolute right-4 top-4 w-4 h-4 text-slate-600" />
                  </div>
                ) : (
                  <textarea 
                    value={severeAllergies}
                    onChange={(e) => setSevereAllergies(e.target.value)}
                    placeholder="e.g., Penicillin allergy, Latex allergy"
                    className="w-full h-[80px] bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-0 focus:border-red-500 resize-y transition-colors"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Chronic Medical Conditions (Optional)</label>
                {isLocked ? (
                  <div className="relative">
                    <textarea value={chronicConditions} readOnly className="w-full min-h-[80px] bg-slate-900/50 border border-slate-800 text-slate-300 px-4 py-3 rounded-xl cursor-default resize-none" />
                    <Lock className="absolute right-4 top-4 w-4 h-4 text-slate-600" />
                  </div>
                ) : (
                  <textarea 
                    value={chronicConditions}
                    onChange={(e) => setChronicConditions(e.target.value)}
                    placeholder="e.g., Diabetes, Hypertension, Epilepsy"
                    className="w-full h-[80px] bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-0 focus:border-red-500 resize-y transition-colors"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Critical Medications (Optional)</label>
                {isLocked ? (
                  <div className="relative">
                    <textarea value={currentMedications} readOnly className="w-full min-h-[80px] bg-slate-900/50 border border-slate-800 text-slate-300 px-4 py-3 rounded-xl cursor-default resize-none" />
                    <Lock className="absolute right-4 top-4 w-4 h-4 text-slate-600" />
                  </div>
                ) : (
                  <textarea 
                    value={currentMedications}
                    onChange={(e) => setCurrentMedications(e.target.value)}
                    placeholder="e.g., Blood thinners, Insulin"
                    className="w-full h-[80px] bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-0 focus:border-red-500 resize-y transition-colors"
                  />
                )}
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Upload Medical Checkup Report (Optional)</label>
                <div 
                  onClick={() => !isLocked && reportInputRef.current?.click()}
                  className={`w-full min-h-[140px] rounded-xl border-2 flex flex-col items-center justify-center p-6 transition-all ${
                    isLocked 
                      ? 'border-solid border-slate-800 bg-slate-900/50 cursor-not-allowed opacity-70' 
                      : medicalReport 
                        ? 'border-solid border-red-500/50 bg-red-500/5 cursor-pointer hover:bg-red-500/10' 
                        : 'border-dashed border-slate-700 bg-slate-950 cursor-pointer hover:border-red-500/50'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={reportInputRef} 
                    onChange={handleMedicalReport}
                    accept=".pdf"
                    disabled={isLocked}
                    className="hidden" 
                  />
                  {medicalReport ? (
                    <>
                      <FileText className={`w-12 h-12 mb-3 ${isLocked ? 'text-slate-500' : 'text-red-500'}`} />
                      <p className={`font-bold text-sm text-center ${isLocked ? 'text-slate-400' : 'text-white'}`}>{medicalReport.name}</p>
                      {!isLocked && <p className="text-xs text-slate-500 mt-2 underline">Click to replace document</p>}
                    </>
                  ) : (
                    <>
                    <Upload className="w-8 h-8 mb-2 text-slate-500" />
                      <p className="font-bold text-sm text-slate-300 mb-1">Upload comprehensive health checkup report</p>
                      <p className="text-xs text-slate-500">Supports .pdf (Max 10MB)</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* 5. Emergency Contacts */}
          <section>
            <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-red-400" />
                <h2 className="text-lg font-bold text-white tracking-wide">Emergency Contacts</h2>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                {contacts.length} / 5 Contacts
              </span>
            </div>

            <div className="flex flex-col gap-6">
              {contacts.map((contact, index) => (
                <div key={contact.id} className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-5 relative group">
                  {/* Delete Button (Hidden for index 0) */}
                  {index > 0 && !isLocked && (
                    <button 
                      type="button"
                      onClick={() => removeContact(contact.id)}
                      className="absolute top-4 right-4 p-1.5 bg-red-950/30 text-red-400 rounded-lg border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors"
                      title="Remove Contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black text-slate-400">
                      {index + 1}
                    </div>
                    <span className="text-sm font-bold text-white">Contact Details</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Contact Name</label>
                      {isLocked ? (
                         <div className="relative"><input type="text" value={contact.name} readOnly className="w-full bg-slate-900/50 border border-slate-800 text-slate-300 px-4 py-2.5 rounded-lg text-sm cursor-default" /><Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" /></div>
                      ) : (
                         <input 
                           type="text" 
                           value={contact.name} 
                           onChange={(e) => updateContact(contact.id, 'name', e.target.value)} 
                           required
                           placeholder="Full Name"
                           className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-2.5 rounded-lg text-sm focus:ring-0 focus:border-red-500 focus:outline-none transition-colors" 
                         />
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Relationship</label>
                      {renderSelect(contact.relationship, relationshipOptions, (val) => updateContact(contact.id, 'relationship', val), "Select Relation")}
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mobile Number</label>
                      <div className="flex gap-2">
                        <div className="w-[40%]">
                          {renderSelect(contact.phoneCode, allPhoneCodes, (val) => updateContact(contact.id, 'phoneCode', val), "Code")}
                        </div>
                        <div className="w-[60%]">
                          {isLocked ? (
                             <div className="relative"><input type="text" value={contact.phone} readOnly className="w-full bg-slate-900/50 border border-slate-800 text-slate-300 px-4 py-[11px] rounded-lg text-sm cursor-default" /><Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" /></div>
                          ) : (
                             <input 
                               type="text" 
                               value={contact.phone} 
                               onChange={(e) => updateContact(contact.id, 'phone', e.target.value)} 
                               required
                               placeholder="Number"
                               className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-[11px] rounded-lg text-sm focus:ring-0 focus:border-red-500 focus:outline-none transition-colors" 
                             />
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                      {isLocked ? (
                         <div className="relative"><input type="email" value={contact.email} readOnly className="w-full bg-slate-900/50 border border-slate-800 text-slate-300 px-4 py-2.5 rounded-lg text-sm cursor-default" /><Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" /></div>
                      ) : (
                         <input 
                           type="email" 
                           value={contact.email} 
                           onChange={(e) => updateContact(contact.id, 'email', e.target.value)} 
                           placeholder="email@example.com"
                           className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-2.5 rounded-lg text-sm focus:ring-0 focus:border-red-500 focus:outline-none transition-colors" 
                         />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {!isLocked && contacts.length < 5 && (
                <button
                  type="button"
                  onClick={addContact}
                  className="w-full py-4 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 font-bold hover:border-red-500 hover:text-red-400 hover:bg-red-500/5 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Emergency Contact
                </button>
              )}
            </div>
          </section>

          {/* 6. Biometric Signature Module */}
          <section className="mt-4 border-t border-slate-800 pt-8 flex flex-col items-center">
             <div className="text-center mb-6">
                <h2 className="text-xl font-black text-white flex items-center justify-center gap-2 mb-2">
                  <Fingerprint className="w-6 h-6 text-red-400" />
                  Biometric Signature
                </h2>
             </div>

             <div className="relative mb-4">
                <div className={`w-[312px] h-[325px] rounded-2xl border-4 bg-slate-950 flex flex-col items-center justify-center overflow-hidden shadow-2xl transition-all duration-500 ${
                  fingerprintQuality > 0 ? 'border-emerald-500' : 'border-slate-800'
                }`}>
                   {fingerprintQuality > 0 && fingerprintBmpBase64 ? (
                      <img src={`data:image/bmp;base64,${fingerprintBmpBase64}`} alt="Fingerprint" className="w-full h-full object-cover drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
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
             
             <div className={`mb-6 font-bold text-sm ${fingerprintQuality > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                Quality: {fingerprintQuality}%
             </div>

             <button
                type="button"
                disabled={isLocked || isCapturingFingerprint}
                onClick={handleSimulateFingerprint}
                className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all shadow-lg ${
                  isLocked || isCapturingFingerprint ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none' :
                  fingerprintQuality > 0 
                    ? 'bg-slate-800 border border-slate-600 text-slate-400 hover:text-white' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                }`}
              >
                {isCapturingFingerprint ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Capturing...</>
                ) : fingerprintQuality > 0 ? (
                  <><Trash2 className="w-4 h-4" /> Reset Fingerprint</>
                ) : (
                  <><Fingerprint className="w-5 h-5" /> Capture Fingerprint</>
                )}
              </button>
          </section>

          {/* 7. Action Footer & Inline OTP */}
          <div className="mt-6 border-t border-slate-800 pt-8 pb-4 flex flex-col items-center gap-4">
            
            {/* Simulation Alert */}
            <AnimatePresence>
              {alertInfo.show && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl border ${
                    alertInfo.type === 'success' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : alertInfo.type === 'error'
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                >
                  {alertInfo.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : alertInfo.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                  <span className="text-sm font-bold">{alertInfo.message}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Inline OTP Box */}
            <AnimatePresence>
              {enrollState === 'OTP' && (
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
                      <div className="text-left">
                        <h4 className="text-sm font-bold text-white">Citizen Identity Verification</h4>
                        <p className="text-xs text-slate-400">Enter the 6-digit OTP sent to the provided email.</p>
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
                        type="button"
                        onClick={() => setEnrollState('READY')}
                        className="px-3 py-2 text-slate-400 hover:text-white transition-colors text-sm font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {enrollState !== 'SUCCESS' && enrollState !== 'SUCCESS_HIDDEN' && (
              <button
                type="submit"
                disabled={isSaving || isOtpVerifying || (enrollState === 'OTP' && otpValue.length < 6)}
                className="w-full md:w-[380px] py-4 bg-red-600 hover:bg-red-500 text-white font-black text-lg rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving || isOtpVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isOtpVerifying ? 'Verifying OTP...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    {enrollState === 'OTP' ? 'Verify & Enroll Citizen' : 'Enroll Citizen'}
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>

        </form>
      </motion.div>
    </div>
  );
}
