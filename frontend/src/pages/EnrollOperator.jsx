import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Select from 'react-select';
import { Country, State, City } from 'country-state-city';
import { 
  Building2, 
  MapPin, 
  User, 
  Upload, 
  ChevronRight, 
  Mail,
  Phone,
  CheckCircle2,
  Calendar,
  Briefcase,
  Camera
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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

// DOB handled via standard date input

const genderOptions = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

export default function EnrollOperator() {
  const navigate = useNavigate();

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedPhoneCode, setSelectedPhoneCode] = useState(null);

  const [dob, setDob] = useState(null);
  const [selectedGender, setSelectedGender] = useState(null);

  const [photoFile, setPhotoFile] = useState(null);
  const photoInputRef = useRef(null);

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const stateOptions = selectedCountry 
    ? State.getStatesOfCountry(selectedCountry.value).map(s => ({ value: s.isoCode, label: s.name }))
    : [];

  const cityOptions = selectedState && selectedCountry
    ? City.getCitiesOfState(selectedCountry.value, selectedState.value).map(c => ({ value: c.name, label: c.name }))
    : [];

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file && ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type) && file.size <= 5 * 1024 * 1024) {
      setPhotoFile(file);
    }
  };

  const handleReset = () => {
    // Reset fields
    setPhotoFile(null);
    setDob(null);
    setSelectedGender(null);
    setSelectedCountry(null); setSelectedState(null); setSelectedCity(null);
    setSelectedPhoneCode(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API Call
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
      handleReset();
    }, 3000);
  };

  return (
    <div className="w-full flex flex-col items-center pb-4 relative">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] rounded-[100%] bg-emerald-900/10 blur-[150px] pointer-events-none z-0" />

      {/* Header Section */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center text-center mt-2 mb-8 max-w-[1400px] mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
          Enroll Operators
        </h1>
        
        <div className="flex items-center justify-center gap-1.5 mb-4 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-max">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <p className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-10">

          {/* Top Visual: Operator Photo Upload */}
          <div className="w-full flex flex-col items-center">
            <div className="relative group cursor-pointer mb-2 mt-2" onClick={() => photoInputRef.current?.click()}>
              <div className={`w-[200px] h-[200px] rounded-full border-2 flex flex-col items-center justify-center overflow-hidden shadow-xl transition-colors ${photoFile ? 'border-emerald-500 bg-emerald-900/10' : 'border-slate-700 bg-slate-800 group-hover:border-emerald-500/50'}`}>
                {photoFile ? (
                  <>
                    <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-2" />
                    <span className="text-sm text-emerald-200/70 font-bold max-w-[150px] truncate px-2 text-center">{photoFile.name}</span>
                  </>
                ) : (
                  <Camera className="w-20 h-20 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                )}
              </div>
              <div className="absolute bottom-2 right-2 p-3 bg-slate-800 border border-slate-700 rounded-full shadow-lg text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/50 transition-all">
                <Upload className="w-5 h-5" />
              </div>
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-3">Upload Operator Photo (Optional)</span>
            <input 
              type="file" 
              className="hidden" 
              ref={photoInputRef}
              accept=".jpg,.jpeg,.png"
              onChange={handlePhotoUpload}
            />
          </div>

          {/* Section A: Employee Demographics */}
          <section>
            <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
              <User className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white tracking-wide">Employee Demographics</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter employee's legal name" 
                  className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date of Birth (DOB)</label>
                <div className="relative flex items-center">
                  <Calendar className="absolute left-4 w-5 h-5 text-slate-500 pointer-events-none z-10" />
                  <DatePicker 
                    selected={dob} 
                    onChange={(date) => setDob(date)} 
                    placeholderText="Select birth date"
                    dateFormat="MMMM d, yyyy"
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                    maxDate={new Date()}
                    className="w-full h-[42px] bg-slate-950 border border-slate-800 text-white pl-12 pr-4 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                    calendarClassName="dark-theme-calendar"
                    wrapperClassName="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Gender</label>
                <Select
                  options={genderOptions}
                  styles={customStyles}
                  placeholder="Select gender..."
                  value={selectedGender}
                  onChange={setSelectedGender}
                  isClearable
                />
              </div>
            </div>
          </section>

          {/* Section B: Official Role & Authentication */}
          <section>
            <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
              <Briefcase className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white tracking-wide">Official Role & Authentication</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Department / Ward</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Emergency Room, Trauma Center" 
                  className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Position / Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Triage Nurse, Duty Doctor" 
                  className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Official Email Address (Used for Login)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    type="email" 
                    required
                    placeholder="operator@hospital.org" 
                    className="w-full bg-slate-950 border border-slate-800 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2 ml-1">The secure account activation link will be sent here.</p>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Personal Mobile Number (Optional)</label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-[30%]">
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

          {/* Section C: Personal Location */}
          <section>
            <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white tracking-wide">Personal Location</h2>
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

          {/* Action Footer */}
          <div className="mt-4 pt-6 border-t border-slate-800 flex flex-col items-center">
            
            <AnimatePresence>
              {showSuccessMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 px-6 py-3 bg-emerald-900/30 border border-emerald-500/50 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold text-sm">Account created successfully! Operator must set password and activate through email.</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="w-full md:w-auto px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Enroll Operator & Dispatch Link
              <ChevronRight className="w-5 h-5" />
            </button>
            <p className="text-xs font-medium text-slate-500 mt-4 max-w-md text-center leading-relaxed">
              By submitting this form, the system will instantly generate an Operator ID. The operator must securely set their own password via the dispatched email link.
            </p>
          </div>

        </form>
      </motion.div>

    </div>
  );
}
