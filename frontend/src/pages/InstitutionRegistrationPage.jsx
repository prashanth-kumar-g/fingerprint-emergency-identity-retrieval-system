import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Select from 'react-select';
import { Country, State, City } from 'country-state-city';
import { 
  Building2, 
  MapPin, 
  User, 
  ShieldCheck, 
  Upload, 
  ChevronRight, 
  ArrowLeft,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  Image
} from 'lucide-react';
import api from '../api/axiosConfig';

// ── Shared React-Select Custom Dark Styles ──
const customStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#020617', // slate-950
    borderColor: state.isFocused ? '#10b981' : '#1e293b', // emerald-500 : slate-800
    padding: '0.2rem',
    borderRadius: '0.75rem',
    boxShadow: 'none',
    cursor: 'text',
    '&:hover': {
      borderColor: state.isFocused ? '#10b981' : '#334155'
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
    backgroundColor: state.isSelected ? '#059669' : state.isFocused ? '#064e3b' : 'transparent',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.875rem',
    '&:active': {
      backgroundColor: '#059669'
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

// Create unique phone country codes
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

export default function InstitutionRegistrationPage() {
  const navigate = useNavigate();

  // ── Form State ──
  const [institutionName, setInstitutionName] = useState('');
  const [institutionType, setInstitutionType] = useState('');
  const [sectorType, setSectorType] = useState('');
  
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [pinCode, setPinCode] = useState('');
  
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  
  const [primaryOfficerName, setPrimaryOfficerName] = useState('');
  const [officerDesignation, setOfficerDesignation] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [selectedPhoneCode, setSelectedPhoneCode] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [emailError, setEmailError] = useState('');
  const emailInputRef = useRef(null);

  // ── File Upload State ──
  const [licenseFile, setLicenseFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const licenseInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const [fileError, setFileError] = useState('');

  // ── Submission State ──
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, type: '', message: '' });

  // Generate dynamic options based on parent selection
  const stateOptions = selectedCountry 
    ? State.getStatesOfCountry(selectedCountry.value).map(s => ({ value: s.isoCode, label: s.name }))
    : [];

  const cityOptions = selectedState && selectedCountry
    ? City.getCitiesOfState(selectedCountry.value, selectedState.value).map(c => ({ value: c.name, label: c.name }))
    : [];

  const triggerAlert = (type, message) => {
    setAlertInfo({ show: true, type, message });
    if (type === 'success') {
      setTimeout(() => setAlertInfo({ show: false, type: '', message: '' }), 5000);
    } else {
      setTimeout(() => setAlertInfo({ show: false, type: '', message: '' }), 5000);
    }
  };

  const handleFileUpload = (e, setFile, droppedFile = null) => {
    setFileError('');
    const file = droppedFile || e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFileError(`File "${file.name}" is too large. Maximum size is 5MB.`);
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setFileError(`Invalid file type for "${file.name}". Please upload JPG, PNG, or PDF.`);
      return;
    }

    setFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, setFile) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(null, setFile, e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setAlertInfo({ show: false, type: '', message: '' });
    setEmailError('');

    try {
      const formData = new FormData();
      formData.append('institutionName', institutionName);
      formData.append('institutionType', institutionType);
      formData.append('sectorType', sectorType);
      formData.append('addressLine1', addressLine1);
      formData.append('addressLine2', addressLine2);
      formData.append('city', selectedCity.label);
      formData.append('state', selectedState.label);
      formData.append('country', selectedCountry.label);
      formData.append('pinCode', pinCode);
      formData.append('primaryOfficerName', primaryOfficerName);
      formData.append('officerDesignation', officerDesignation);
      formData.append('officialEmail', officialEmail);
      formData.append('phoneCountryCode', selectedPhoneCode.value);
      formData.append('phoneNumber', phoneNumber);

      if (logoFile) {
        formData.append('logoFile', logoFile);
      }
      formData.append('licenseFile', licenseFile);

      const response = await api.post('/v1/institutions/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        triggerAlert('success', 'Your application has been submitted and is pending review by the Super Admin. You will receive an email upon approval or rejection.');
        // Reset form
        setInstitutionName('');
        setInstitutionType('');
        setSectorType('');
        setAddressLine1('');
        setAddressLine2('');
        setPinCode('');
        setSelectedCountry(null);
        setSelectedState(null);
        setSelectedCity(null);
        setPrimaryOfficerName('');
        setOfficerDesignation('');
        setOfficialEmail('');
        setSelectedPhoneCode(null);
        setPhoneNumber('');
        setLogoFile(null);
        setLicenseFile(null);
      } else {
        triggerAlert('error', response.data.error || 'Failed to submit application.');
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error.response?.data?.error || '';
      
      if (errorMessage.toLowerCase().includes('already registered or pending') || errorMessage.toLowerCase().includes('already in use')) {
        setEmailError('This email address is already registered or pending approval. Please use a different email.');
        if (emailInputRef.current) {
          emailInputRef.current.focus();
        }
      } else {
        triggerAlert('error', errorMessage || 'An error occurred during submission. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-grow w-full flex flex-col items-center py-12 px-4 relative overflow-y-auto">
      
      {/* Background Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-[100%] bg-emerald-900/10 blur-[150px] pointer-events-none z-0" />

      {/* Header */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col mb-8">
        <button 
          onClick={() => navigate('/login/institution')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 self-start text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>
        
        <div className="flex items-center justify-center gap-4 mb-2 text-left">
          <div className="p-3 bg-emerald-900/30 rounded-xl border border-emerald-500/30">
            <Building2 className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Institution Application</h1>
            <p className="text-slate-400 text-sm mt-1">Apply for official FEIRS network access for your facility.</p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-4xl bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl mb-12"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-10">

          {/* Top Section: Facility Logo Upload */}
          <div className="w-full flex flex-col items-center">
            <div className="relative group cursor-pointer mb-2 mt-4" onClick={() => logoInputRef.current?.click()}>
              <div className={`w-[200px] h-[200px] rounded-full border-2 flex flex-col items-center justify-center overflow-hidden shadow-xl transition-colors ${logoFile ? 'border-emerald-500 bg-emerald-900/10' : 'border-slate-700 bg-slate-800 group-hover:border-emerald-500/50'}`}>
                {logoFile ? (
                  <img 
                    src={URL.createObjectURL(logoFile)} 
                    alt="Facility Logo" 
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <Building2 className="w-20 h-20 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                )}
              </div>
              <div className="absolute bottom-2 right-2 p-3 bg-slate-800 border border-slate-700 rounded-full shadow-lg text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/50 transition-all">
                <Upload className="w-5 h-5" />
              </div>
            </div>
            {!logoFile && <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-3">Upload Facility Logo *</span>}
            <input 
              type="file" 
              required
              className="absolute opacity-0 w-px h-px pointer-events-none" 
              ref={logoInputRef}
              accept=".jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload(e, setLogoFile)}
            />
          </div>

          {/* Section 1: Legal Facility Data */}
          <section>
            <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white tracking-wide">Legal Facility Data</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Legally Registered Institution Name *</label>
                <input type="text" required value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="Enter full registered name" 
                  className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Institution Type *</label>
                <select required value={institutionType}
                  onChange={(e) => setInstitutionType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select facility type...</option>
                  <option value="Hospital">Hospital</option>
                  <option value="Medical Center">Medical Center</option>
                  <option value="Ambulance Service">Ambulance Service</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sector Type *</label>
                <select required value={sectorType}
                  onChange={(e) => setSectorType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select sector...</option>
                  <option value="Government">Government / Public</option>
                  <option value="Private">Private</option>
                  <option value="PPP">Public-Private Partnership</option>
                </select>
              </div>
            </div>
          </section>

          {/* Section 2: Atomic Address Data */}
          <section>
            <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white tracking-wide">Facility Location</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Address Line 1 (Building & Street) *</label>
                <input type="text" required value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="Enter building number and street" 
                  className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Address Line 2 (Optional Landmark)</label>
                <input 
                  type="text" 
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Enter nearby landmark or floor" 
                  className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Advanced Cascading Searchable Dropdowns */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">City / District *</label>
                <Select required options={cityOptions}
                  styles={customStyles}
                  placeholder="Search city..."
                  value={selectedCity}
                  onChange={setSelectedCity}
                  isClearable
                  noOptionsMessage={() => !selectedState ? "Please select a State first" : "No city found"}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">State / Province *</label>
                <Select required options={stateOptions}
                  styles={customStyles}
                  placeholder="Search state..."
                  value={selectedState}
                  onChange={(option) => {
                    setSelectedState(option);
                    setSelectedCity(null);
                  }}
                  isClearable
                  noOptionsMessage={() => !selectedCountry ? "Please select a Country first" : "No state found"}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Postal / Pin Code *</label>
                <input type="text" required value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="Enter pin code" 
                  className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Country *</label>
                <Select required options={allCountries}
                  styles={customStyles}
                  placeholder="Search country..."
                  value={selectedCountry}
                  onChange={(option) => {
                    setSelectedCountry(option);
                    setSelectedState(null);
                    setSelectedCity(null);
                  }}
                  isClearable
                  noOptionsMessage={() => "No country found"}
                />
              </div>
            </div>
          </section>

          {/* Section 3: Administrative Data */}
          <section>
            <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
              <User className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white tracking-wide">Administrative Officer Contact</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Primary Officer Name *</label>
                <input type="text" required value={primaryOfficerName}
                  onChange={(e) => setPrimaryOfficerName(e.target.value)}
                  placeholder="Enter officer's full name" 
                  className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Officer Designation *</label>
                <input type="text" required value={officerDesignation}
                  onChange={(e) => setOfficerDesignation(e.target.value)}
                  placeholder="Enter official designation" 
                  className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Official Email (Used for Login) *</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input type="email" required ref={emailInputRef}
                    value={officialEmail}
                    onChange={(e) => {
                      setOfficialEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    placeholder="admin@hospital.org" 
                    className={`w-full bg-slate-950 border text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none transition-colors ${
                      emailError ? 'border-red-500 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500'
                    }`}
                  />
                </div>
                {emailError && (
                  <p className="text-red-400 text-xs font-semibold mt-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {emailError}
                  </p>
                )}
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Facility Phone Number *</label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-[220px]">
                    <Select required options={allPhoneCodes}
                      styles={customStyles}
                      placeholder="Search code..."
                      value={selectedPhoneCode}
                      onChange={setSelectedPhoneCode}
                      isClearable
                    />
                  </div>
                  <div className="flex-grow">
                    <input type="text" required value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter phone number" 
                      className="w-full h-[42px] bg-slate-950 border border-slate-800 text-white px-4 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Compliance & Verification Uploads */}
          <section>
            <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white tracking-wide">Compliance & Verification *</h2>
            </div>
            
            {fileError && (
              <div className="mb-4 p-4 rounded-xl bg-red-900/30 border border-red-500/50 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-sm font-medium text-red-200">{fileError}</p>
              </div>
            )}

            <div className="w-full">
              
              {/* License Upload */}
              <div 
                onClick={() => licenseInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, setLicenseFile)}
                className={`bg-slate-950 border border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group ${licenseFile ? 'border-emerald-500 bg-emerald-900/10' : 'border-slate-700 hover:border-emerald-500/50 hover:bg-slate-900/50'}`}
              >
                {licenseFile ? (
                  <>
                    <div className="p-3 bg-red-900/50 border border-red-500/50 rounded-2xl mb-3 shadow-lg flex items-center justify-center">
                      <FileText className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-200 mb-1">Document Attached</h3>
                    <p className="text-xs text-emerald-400 max-w-[200px] truncate px-4 bg-emerald-900/20 py-1 rounded-full border border-emerald-500/20">{licenseFile.name}</p>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-slate-800 rounded-full mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">Upload Registration License</h3>
                    <p className="text-xs text-slate-400 max-w-sm">Click to browse or drag document here</p>
                    <p className="text-xs text-slate-500 mt-1">JPG, PNG, or PDF (Max 5MB)</p>
                  </>
                )}
                <input type="file" required className="absolute opacity-0 w-px h-px pointer-events-none" ref={licenseInputRef}
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => handleFileUpload(e, setLicenseFile)}
                />
              </div>

            </div>
          </section>

          {/* Alerts Display above submit */}
          <div className="w-full flex justify-center">
            <AnimatePresence>
              {alertInfo.show && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, y: 0, scale: 1, height: 'auto', marginTop: 8 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95, height: 0, marginTop: 0, paddingBottom: 0, paddingTop: 0, overflow: 'hidden' }}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold shadow-lg max-w-xl text-center ${
                    alertInfo.type === 'error' 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/50' 
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                  }`}
                >
                  {alertInfo.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                  <span>{alertInfo.message}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Submit Action */}
          {!alertInfo.show && (
            <div className="pt-2 border-t border-slate-800 flex flex-col items-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full md:w-[380px] py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all duration-300 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}

        </form>
      </motion.div>
    </div>
  );
}

