import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  AlertCircle
} from 'lucide-react';

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
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedPhoneCode, setSelectedPhoneCode] = useState(null);

  // ── File Upload State ──
  const [licenseFile, setLicenseFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const licenseInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const [fileError, setFileError] = useState('');

  // Generate dynamic options based on parent selection
  const stateOptions = selectedCountry 
    ? State.getStatesOfCountry(selectedCountry.value).map(s => ({ value: s.isoCode, label: s.name }))
    : [];

  const cityOptions = selectedState && selectedCountry
    ? City.getCitiesOfState(selectedCountry.value, selectedState.value).map(c => ({ value: c.name, label: c.name }))
    : [];

  const handleFileUpload = (e, setFile) => {
    setFileError('');
    const file = e.target.files[0];
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

  return (
    <div className="flex-grow w-full flex flex-col items-center py-12 px-4 relative">
      
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
        
        <div className="flex items-center gap-4 mb-2">
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
        className="relative z-10 w-full max-w-4xl bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl"
      >
        <form className="flex flex-col gap-10">

          {/* Section 1: Legal Facility Data */}
          <section>
            <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white tracking-wide">Legal Facility Data</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Legally Registered Institution Name</label>
                <input 
                  type="text" 
                  placeholder="Enter full registered name" 
                  className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Institution Type</label>
                <select 
                  defaultValue=""
                  className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select facility type...</option>
                  <option value="Hospital">Hospital</option>
                  <option value="Medical Center">Medical Center</option>
                  <option value="Ambulance Service">Ambulance Service</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sector Type</label>
                <select 
                  defaultValue=""
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
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Address Line 1 (Building & Street)</label>
                <input 
                  type="text" 
                  placeholder="Enter building number and street" 
                  className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Address Line 2 (Optional Landmark)</label>
                <input 
                  type="text" 
                  placeholder="Enter nearby landmark or floor" 
                  className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Advanced Cascading Searchable Dropdowns */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">City / District</label>
                <Select
                  options={cityOptions}
                  styles={customStyles}
                  placeholder="Search city..."
                  value={selectedCity}
                  onChange={setSelectedCity}
                  isClearable
                  noOptionsMessage={() => !selectedState ? "Please select a State first" : "No city found"}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">State / Province</label>
                <Select
                  options={stateOptions}
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
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Postal / Pin Code</label>
                <input 
                  type="text" 
                  placeholder="Enter pin code" 
                  className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Country</label>
                <Select
                  options={allCountries}
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
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Primary Officer Name</label>
                <input 
                  type="text" 
                  placeholder="Enter officer's full name" 
                  className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Officer Designation</label>
                <input 
                  type="text" 
                  placeholder="Enter official designation" 
                  className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Official Email (Used for Login)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    type="email" 
                    placeholder="admin@hospital.org" 
                    className="w-full bg-slate-950 border border-slate-800 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Facility Phone Number</label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-[220px]">
                    <Select
                      options={allPhoneCodes}
                      styles={customStyles}
                      placeholder="Search code..."
                      value={selectedPhoneCode}
                      onChange={setSelectedPhoneCode}
                      isClearable
                    />
                  </div>
                  <div className="flex-grow">
                    <input 
                      type="text" 
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
              <h2 className="text-lg font-bold text-white tracking-wide">Compliance & Verification</h2>
            </div>
            
            {fileError && (
              <div className="mb-4 p-4 rounded-xl bg-red-900/30 border border-red-500/50 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-sm font-medium text-red-200">{fileError}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* License Upload */}
              <div 
                onClick={() => licenseInputRef.current?.click()}
                className={`bg-slate-950 border border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group ${licenseFile ? 'border-emerald-500 bg-emerald-900/10' : 'border-slate-700 hover:border-emerald-500/50 hover:bg-slate-900/50'}`}
              >
                {licenseFile ? (
                  <>
                    <div className="p-3 bg-emerald-900/50 rounded-full mb-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-bold text-emerald-400 mb-1">License Uploaded</h3>
                    <p className="text-xs text-emerald-200/70 max-w-[200px] truncate">{licenseFile.name}</p>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-slate-800 rounded-full mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">Upload Registration License</h3>
                    <p className="text-xs text-slate-400 max-w-[200px]">JPG, PNG, or PDF (Max 5MB)</p>
                  </>
                )}
                <input 
                  type="file" 
                  className="hidden" 
                  ref={licenseInputRef}
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => handleFileUpload(e, setLicenseFile)}
                />
              </div>

              {/* Logo Upload */}
              <div 
                onClick={() => logoInputRef.current?.click()}
                className={`bg-slate-950 border border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group ${logoFile ? 'border-emerald-500 bg-emerald-900/10' : 'border-slate-700 hover:border-emerald-500/50 hover:bg-slate-900/50'}`}
              >
                {logoFile ? (
                  <>
                    <div className="p-3 bg-emerald-900/50 rounded-full mb-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-bold text-emerald-400 mb-1">Logo Uploaded</h3>
                    <p className="text-xs text-emerald-200/70 max-w-[200px] truncate">{logoFile.name}</p>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-slate-800 rounded-full mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-slate-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">Upload Facility Logo</h3>
                    <p className="text-xs text-slate-400 max-w-[200px]">(Optional) Square JPG or PNG (Max 5MB)</p>
                  </>
                )}
                <input 
                  type="file" 
                  className="hidden" 
                  ref={logoInputRef}
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload(e, setLogoFile)}
                />
              </div>

            </div>
          </section>

          {/* Submit Action */}
          <div className="mt-4 pt-6 border-t border-slate-800 flex flex-col items-center">
            <button
              type="button"
              className="w-full md:w-auto px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Submit Application
              <ChevronRight className="w-5 h-5" />
            </button>
            <p className="text-xs font-medium text-slate-500 mt-4 max-w-md text-center">
              By submitting this application, you attest that you are legally authorized to register this facility on the FEIRS platform. Approvals may take up to 24-48 hours.
            </p>
          </div>

        </form>
      </motion.div>
    </div>
  );
}
