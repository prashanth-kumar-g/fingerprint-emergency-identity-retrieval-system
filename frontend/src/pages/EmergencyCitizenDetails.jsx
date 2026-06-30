import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  ChevronLeft, User, Calendar as CalendarIcon, Phone, Mail, MapPin, Activity, 
  Droplets, AlertTriangle, Stethoscope, Pill, FileText, Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ReadOnlyField = ({ label, value, icon: Icon, highlight = false }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">{label}</label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
        {Icon && <Icon className="w-4 h-4" />}
      </div>
      <div className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm font-medium ${
        highlight 
          ? 'bg-red-500/10 border-red-500/30 text-red-100 shadow-[inset_0_0_15px_rgba(239,68,68,0.1)]' 
          : 'bg-slate-950/50 border-slate-800/80 text-white'
      }`}>
        {value}
      </div>
    </div>
  </div>
);

const ReadOnlyTextArea = ({ label, value, icon: Icon }) => (
  <div className="flex flex-col gap-1.5 w-full h-full">
    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">{label}</label>
    <div className="relative flex h-full">
      <div className="absolute left-3 top-4 text-slate-500">
        {Icon && <Icon className="w-4 h-4" />}
      </div>
      <div className="w-full h-full min-h-[80px] bg-slate-950/50 border border-slate-800/80 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-white whitespace-pre-wrap">
        {value}
      </div>
    </div>
  </div>
);

export default function EmergencyCitizenDetails() {
  const { id } = useParams(); // Should be FEIRS-CIT-12459
  
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    // Hide banner after 3 seconds
    const timer = setTimeout(() => {
      setShowBanner(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const data = {
    fullName: "Rajesh Kumar",
    systemId: id || "FEIRS-CIT-12459",
    accountCreated: "Oct 20, 2026",
    dob: "15 June 1985",
    gender: "Male",
    mobile: "+91 98765 43210",
    email: "rajesh.kumar@example.com",
    location: "123 Main Street, Apt 4B, Mumbai, Maharashtra, 400001, India",
    bloodGroup: "O+",
    allergies: "Penicillin (Severe)",
    chronicConditions: "Hypertension\nType 2 Diabetes",
    medications: "Lisinopril 10mg daily\nMetformin 500mg twice daily"
  };

  const contacts = [
    { id: 1, name: 'Jane Doe', relationship: 'Spouse', mobile: '+91 99887 76655', email: 'jane.doe@example.com' },
    { id: 2, name: 'Amit Kumar', relationship: 'Brother', mobile: '+91 98765 12345', email: 'amit.kumar@example.com' },
    { id: 3, name: 'Priya Sharma', relationship: 'Doctor', mobile: '+91 99999 88888', email: 'priya.sharma@hospital.com' }
  ];

  return (
    <div className="w-full flex flex-col items-center pb-24 relative min-h-screen">
      
      {/* Automated Dispatch Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
            className="w-full bg-red-600 border-b border-red-500 shadow-[0_4px_20px_rgba(239,68,68,0.4)] z-50 mb-6"
          >
            <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-center text-center">
              <p className="text-white font-black tracking-wide text-sm sm:text-base flex items-center gap-2">
                <span className="text-xl">🚨</span> 
                AUTOMATED DISPATCH: Emergency alert protocols initiated. Email and WhatsApp notifications successfully transmitted to the registered emergency contacts of {data.fullName}.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[500px] rounded-[100%] bg-red-900/10 blur-[150px] pointer-events-none z-0" />

      {/* Page Navigation */}
      <div className="relative z-10 w-full flex flex-col items-start justify-center mt-4 mb-4 max-w-[1400px] mx-auto px-6 lg:px-0">
        <Link to="/operator/emergency-scan" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group mb-4">
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm tracking-wide">Back to Emergency Scan</span>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-0">
        
        {/* 50/50 DYNAMIC SPLIT LAYOUT (Strictly Read-Only) */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch mb-6">
          
          {/* LEFT COLUMN (50%): Visuals & Contacts */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6 relative">

            {/* Card 1: Profile Anchor */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 blur-[50px] pointer-events-none transition-colors duration-500 bg-red-500/10" />
              
              <div className="relative mb-6 mt-4 group cursor-default">
                <div className="w-[220px] h-[220px] rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden shadow-xl">
                  <User className="w-24 h-24 text-slate-500" />
                </div>
              </div>

              {/* Dynamic Status Badge */}
              <div className="px-4 py-1.5 rounded-full border mb-4 flex items-center gap-2 bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                <span className="w-2 h-2 rounded-full animate-pulse bg-emerald-400"></span>
                <span className="text-[11px] font-black tracking-widest uppercase">
                  STATUS: ACTIVE
                </span>
              </div>

              {/* Citizen Details */}
              <div className="w-full relative group mb-6 flex justify-center items-center">
                <h2 className="text-2xl font-black text-white text-center">{data.fullName}</h2>
              </div>

              {/* Read-Only Meta */}
              <div className="w-full flex flex-col gap-3 pt-6 border-t border-slate-800/50 text-center items-center">
                <div className="flex flex-wrap justify-center gap-1.5 text-sm">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] mt-0.5">System ID:</span>
                  <span className="font-medium text-slate-300 font-mono text-center">{data.systemId}</span>
                </div>
                <div className="flex flex-wrap justify-center gap-1.5 text-sm">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] mt-0.5">Account Created:</span>
                  <span className="font-medium text-slate-300 font-mono text-center">{data.accountCreated}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Emergency Contacts (Scrollable) */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col flex-grow relative overflow-hidden">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700">
                    <Phone className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Emergency Contacts</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{contacts.length} Registered</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-4 overflow-y-auto max-h-[480px] pr-2 custom-scrollbar">
                {contacts.map((c) => (
                  <div key={c.id} className="bg-slate-950/50 border border-slate-800 rounded-xl p-5 relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                      <ReadOnlyField label="Name" icon={User} value={c.name} />
                      <ReadOnlyField label="Relationship" icon={User} value={c.relationship} />
                      <ReadOnlyField label="Mobile Number" icon={Phone} value={c.mobile} />
                      <ReadOnlyField label="Email Address" icon={Mail} value={c.email} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (50%): Demographics & Medical */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6 relative">

            {/* Card 3: Personal Demographics */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col relative overflow-hidden">
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
                <ReadOnlyField label="Date of Birth" icon={CalendarIcon} value={data.dob} />
                <ReadOnlyField label="Gender" icon={User} value={data.gender} />
                <ReadOnlyField label="Mobile Number" icon={Phone} value={data.mobile} />
                <ReadOnlyField label="Email Address" icon={Mail} value={data.email} />
                <div className="md:col-span-2">
                  <ReadOnlyField label="Location Address" icon={MapPin} value={data.location} />
                </div>
              </div>
            </div>

            {/* Card 4: Critical Medical Information (Flex-Grow to balance columns) */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col flex-grow relative overflow-hidden">
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
                    <ReadOnlyTextArea label="Blood Group" icon={Droplets} value={data.bloodGroup} />
                  </div>
                  <div className="flex flex-col h-full">
                    <ReadOnlyTextArea label="Severe Allergies" icon={AlertTriangle} value={data.allergies} />
                  </div>
                  <div className="flex flex-col h-full">
                    <ReadOnlyTextArea label="Chronic Conditions" icon={Stethoscope} value={data.chronicConditions} />
                  </div>
                  <div className="flex flex-col h-full">
                    <ReadOnlyTextArea label="Current Medications" icon={Pill} value={data.medications} />
                  </div>
                </div>
                
                {/* PDF Viewer Component */}
                <div className="w-full mt-2 flex flex-col flex-grow min-h-[100px]">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pl-1">Medical Checkup Report</label>
                  <div 
                    className="w-full flex-grow rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/50 hover:border-red-500/50 flex flex-col items-center justify-center cursor-pointer transition-colors group p-4 text-center relative"
                    title="Double click to open this pdf"
                    onDoubleClick={() => console.log('Simulating native PDF open in new tab...')}
                  >
                    <FileText className="w-8 h-8 text-slate-500 mb-2 group-hover:text-red-400 transition-colors" />
                    <p className="text-sm font-bold text-slate-400 group-hover:text-slate-200 transition-colors">
                      Medical_Checkup_Report_2026.pdf
                    </p>
                    
                    {/* Hover Tooltip Hint */}
                    <div className="absolute inset-0 bg-slate-900/90 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-red-400 font-bold tracking-wide pointer-events-none">Double click to open this pdf</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Final Action Footer */}
        <div className="w-full flex justify-center pt-8 pb-12">
          <button 
            onClick={() => window.print()}
            className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-black text-lg rounded-2xl shadow-xl transition-all flex justify-center items-center gap-3"
          >
            <Printer className="w-6 h-6" /> Export Citizens Emergency Data
          </button>
        </div>

      </div>
    </div>
  );
}
