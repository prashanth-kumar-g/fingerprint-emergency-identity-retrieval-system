import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2,
  CheckCircle2,
  User,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Building,
  Loader2,
  UploadCloud,
  FileCheck,
  Clock,
  XCircle,
  Pencil,
  X,
  Lock
} from 'lucide-react';

const EditableField = ({ label, value, oldData, onChange, onCancel, icon: Icon, isEditing, onEdit }) => {
  if (!isEditing) {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">{label}</label>
        <div className="relative flex items-center">
          <div className="absolute left-3 text-slate-500"><Icon className="w-4 h-4" /></div>
          <input 
            type="text"
            value={value}
            readOnly
            className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl pl-10 pr-10 py-3 text-sm text-white outline-none cursor-default"
          />
          <button 
            onClick={onEdit}
            className="absolute right-3 text-slate-500 hover:text-emerald-400 transition-colors"
            title="Edit this field"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">{label} (Editing)</label>
      <div className="relative flex flex-col bg-slate-950/50 border border-emerald-500/50 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.1)]">
        <div className="absolute left-3 top-4 text-emerald-500/70"><Icon className="w-4 h-4" /></div>
        <button 
          onClick={onCancel}
          className="absolute right-3 top-3.5 text-slate-500 hover:text-red-400 transition-colors z-10"
          title="Cancel Edit"
        >
          <X className="w-4 h-4" />
        </button>
        
        {/* Old Data */}
        <div className="w-full pl-10 pr-10 py-2 border-b border-slate-800/80 bg-red-950/20">
          <p className="text-xs text-red-400/60 line-through truncate font-medium tracking-wide" title={oldData}>
            {oldData}
          </p>
        </div>
        
        {/* New Data Input */}
        <div className="w-full bg-emerald-950/10">
          <input 
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent pl-10 pr-4 py-2.5 text-sm text-emerald-400 font-medium outline-none placeholder:text-emerald-700/50"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};

const DiffField = ({ label, icon: Icon, oldData, newData }) => {
  const isModified = oldData !== newData;

  if (!isModified) {
    return (
      <div className="flex flex-col gap-1.5 w-full h-full">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">{label}</label>
        <div className="relative flex items-center h-full">
          <div className="absolute left-3 text-slate-500"><Icon className="w-4 h-4" /></div>
          <input 
            type="text" 
            value={newData} 
            readOnly 
            className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-400 outline-none cursor-not-allowed truncate" 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">{label} (Pending Change)</label>
      <div className="relative flex flex-col bg-slate-950/50 border border-amber-500/30 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(245,158,11,0.05)]">
        <div className="absolute left-3 top-4 text-amber-500/70"><Icon className="w-4 h-4" /></div>
        
        {/* Old Data */}
        <div className="w-full pl-10 pr-4 py-2 border-b border-slate-800/80 bg-red-950/20">
          <p className="text-xs text-red-400/60 line-through truncate font-medium tracking-wide" title={oldData}>
            {oldData}
          </p>
        </div>
        
        {/* New Data */}
        <div className="w-full pl-10 pr-4 py-2.5 bg-amber-950/10">
          <p className="text-sm text-amber-400 font-medium truncate" title={newData}>
            {newData}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function RequestDataChange() {
  const fileInputRef = useRef(null);
  const toggleRef = useRef(true);

  // States: READY, PENDING, REJECTED, APPROVED
  const [requestState, setRequestState] = useState('READY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const [originalData, setOriginalData] = useState({
    name: 'Apollo Hospital',
    type: 'Clinic',
    sector: 'Private',
    email: 'contact@apollo.com',
    address: '154/11, Bannerghatta Road, Bangalore, Karnataka - 560076, India'
  });

  const [formData, setFormData] = useState({ ...originalData });
  const [editingFields, setEditingFields] = useState({});

  const hasChanges = JSON.stringify(originalData) !== JSON.stringify(formData);
  const canSubmit = requestState === 'READY' && hasChanges;

  const toggleEdit = (field, isEditing) => {
    setEditingFields(prev => ({ ...prev, [field]: isEditing }));
  };

  const handleCancel = (field) => {
    setFormData(prev => ({ ...prev, [field]: originalData[field] }));
    toggleEdit(field, false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
    }
  };

  const simulateSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setRequestState('PENDING');
      
      // Simulate backend review process...
      // Let's make it auto-reject or auto-approve after 5 seconds just for demo purposes
      setTimeout(() => {
        // Strictly alternate between APPROVED and REJECTED for predictable testing
        const isApproved = toggleRef.current;
        toggleRef.current = !toggleRef.current;
        setRequestState(isApproved ? 'APPROVED' : 'REJECTED');
      }, 5000);
      
    }, 1500);
  };

  const handleAcknowledge = () => {
    if (requestState === 'APPROVED') {
      // Data is permanently updated
      setOriginalData({ ...formData });
    }
    // Reset back to ready state
    setRequestState('READY');
    setUploadedFile(null);
    setEditingFields({});
  };

  return (
    <div className="w-full flex flex-col items-center gap-6 pb-24 relative">
      
      {/* Header Section */}
      <div className="w-full relative flex flex-col items-center justify-center text-center mt-2 mb-8 max-w-[1400px] mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
          Request Data Change
        </h1>
        
        {/* Live Connection Badge */}
        <div className="flex items-center justify-center gap-1.5 mb-4 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-max">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <p className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
            Live Connection
          </p>
        </div>
      </div>

      {/* Main 40/60 Split */}
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-[1400px] mx-auto px-4 lg:px-0">
        
        {/* Left Column: Static Info (40%) */}
        <div className="w-full lg:w-[40%] flex flex-col gap-6">
          
          {/* Card 1: Identity Plate */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden h-full">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-emerald-500/10 blur-[50px] pointer-events-none" />
            
            <div className="relative group cursor-pointer mb-6 mt-4">
              <div className="w-56 h-56 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden shadow-xl group-hover:border-slate-600 transition-colors">
                <Building2 className="w-20 h-20 text-slate-500" />
              </div>
              <div className="absolute bottom-4 right-4 p-2 bg-slate-800 border border-slate-700 rounded-full shadow-lg text-slate-600 cursor-not-allowed">
                <Pencil className="w-4 h-4" />
              </div>
              {/* Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-slate-800 text-white text-xs font-medium p-3 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20 pointer-events-none border border-slate-700 text-left">
                <div className="flex gap-2 items-start">
                  <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <p leading-relaxed>You can change this from Profile Settings.</p>
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 border-b border-r border-slate-700 rotate-45" />
              </div>
            </div>

            {requestState === 'READY' ? (
              <div className="w-full px-4 mb-4">
                {!editingFields.name ? (
                  <div className="w-full relative group flex justify-center items-center">
                    <h2 className="text-2xl font-black text-white text-center">{formData.name}</h2>
                    <div className="relative flex items-center ml-3 cursor-pointer" onClick={() => toggleEdit('name', true)}>
                      <div className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-slate-800 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <EditableField 
                    label="Institution Name" 
                    value={formData.name} 
                    oldData={originalData.name}
                    onChange={(v) => setFormData({...formData, name: v})} 
                    onCancel={() => handleCancel('name')}
                    icon={Building2} 
                    isEditing={true}
                  />
                )}
              </div>
            ) : (
              <div className="w-full px-4 mb-4">
                {originalData.name !== formData.name ? (
                  <DiffField label="Institution Name" icon={Building2} oldData={originalData.name} newData={formData.name} />
                ) : (
                  <h2 className="text-2xl font-black text-white text-center">{formData.name}</h2>
                )}
              </div>
            )}

            <div className="w-full flex flex-col gap-3 pt-6 border-t border-slate-800/50 text-center items-center">
              <div className="flex flex-wrap justify-center gap-1.5 text-sm">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] mt-0.5">Institution ID:</span>
                <span className="font-medium text-slate-300 font-mono text-center">FEIRS-INST-1011</span>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 text-sm">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] mt-0.5">Account Created:</span>
                <span className="font-medium text-slate-300 text-center">Oct 24, 2026</span>
              </div>
            </div>
          </div>

          {/* Card 2: Administrative Details */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/50">
              <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700">
                <User className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Administrative Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">Self-service officer records (Manage in Profile Settings)</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Contact Number</label>
                <div className="relative flex items-center group">
                  <div className="absolute left-3 text-slate-500"><Phone className="w-4 h-4" /></div>
                  <input type="text" value="+91 98765 43210" readOnly className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-400 outline-none cursor-not-allowed" />
                  <div className="absolute right-3">
                    <div className="p-1.5 rounded-lg text-slate-700 cursor-not-allowed">
                      <Pencil className="w-3.5 h-3.5" />
                    </div>
                    <div className="absolute right-0 bottom-full mb-2 w-64 bg-slate-800 text-white text-xs font-medium p-3 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10 pointer-events-none border border-slate-700 text-left">
                      <div className="flex gap-2 items-start">
                        <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <p leading-relaxed>You can change this from Profile Settings.</p>
                      </div>
                      <div className="absolute -bottom-1 right-5 w-2 h-2 bg-slate-800 border-b border-r border-slate-700 rotate-45" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden md:block"></div>
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Primary Officer Name</label>
                <div className="relative flex items-center group">
                  <div className="absolute left-3 text-slate-500"><User className="w-4 h-4" /></div>
                  <input type="text" value="Dr. Rakesh Sharma" readOnly className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-400 outline-none cursor-not-allowed" />
                  <div className="absolute right-3">
                    <div className="p-1.5 rounded-lg text-slate-700 cursor-not-allowed">
                      <Pencil className="w-3.5 h-3.5" />
                    </div>
                    <div className="absolute right-0 bottom-full mb-2 w-64 bg-slate-800 text-white text-xs font-medium p-3 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10 pointer-events-none border border-slate-700 text-left">
                      <div className="flex gap-2 items-start">
                        <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <p leading-relaxed>You can change this from Profile Settings.</p>
                      </div>
                      <div className="absolute -bottom-1 right-5 w-2 h-2 bg-slate-800 border-b border-r border-slate-700 rotate-45" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Officer Designation</label>
                <div className="relative flex items-center group">
                  <div className="absolute left-3 text-slate-500"><Briefcase className="w-4 h-4" /></div>
                  <input type="text" value="Chief Medical Administrator" readOnly className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-400 outline-none cursor-not-allowed" />
                  <div className="absolute right-3">
                    <div className="p-1.5 rounded-lg text-slate-700 cursor-not-allowed">
                      <Pencil className="w-3.5 h-3.5" />
                    </div>
                    <div className="absolute right-0 bottom-full mb-2 w-64 bg-slate-800 text-white text-xs font-medium p-3 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10 pointer-events-none border border-slate-700 text-left">
                      <div className="flex gap-2 items-start">
                        <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <p leading-relaxed>You can change this from Profile Settings.</p>
                      </div>
                      <div className="absolute -bottom-1 right-5 w-2 h-2 bg-slate-800 border-b border-r border-slate-700 rotate-45" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Action Zone (60%) */}
        <div className="w-full lg:w-[60%] flex flex-col gap-6">
          
          {/* Card 1: Legal Facility Data */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col transition-all duration-300">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/50">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Building className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Legal Facility Data</h3>
                <p className="text-xs text-slate-400 mt-0.5">Records bound to the facility. Modifying requires approval.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {requestState === 'READY' ? (
                <>
                  <EditableField label="Institution Type" value={formData.type} oldData={originalData.type} onChange={(v) => setFormData({...formData, type: v})} onCancel={() => handleCancel('type')} icon={Building2} isEditing={editingFields.type} onEdit={() => toggleEdit('type', true)} />
                  <EditableField label="Sector Type" value={formData.sector} oldData={originalData.sector} onChange={(v) => setFormData({...formData, sector: v})} onCancel={() => handleCancel('sector')} icon={Briefcase} isEditing={editingFields.sector} onEdit={() => toggleEdit('sector', true)} />
                  <div className="md:col-span-2 w-full">
                    <EditableField label="Official Email" value={formData.email} oldData={originalData.email} onChange={(v) => setFormData({...formData, email: v})} onCancel={() => handleCancel('email')} icon={Mail} isEditing={editingFields.email} onEdit={() => toggleEdit('email', true)} />
                  </div>
                  <div className="md:col-span-2 w-full">
                    <EditableField label="Full Registered Address" value={formData.address} oldData={originalData.address} onChange={(v) => setFormData({...formData, address: v})} onCancel={() => handleCancel('address')} icon={MapPin} isEditing={editingFields.address} onEdit={() => toggleEdit('address', true)} />
                  </div>
                </>
              ) : (
                <>
                  <DiffField label="Institution Type" icon={Building2} oldData={originalData.type} newData={formData.type} />
                  <DiffField label="Sector Type" icon={Briefcase} oldData={originalData.sector} newData={formData.sector} />
                  <div className="md:col-span-2 w-full">
                    <DiffField label="Official Email" icon={Mail} oldData={originalData.email} newData={formData.email} />
                  </div>
                  <div className="md:col-span-2 w-full">
                    <DiffField label="Full Registered Address" icon={MapPin} oldData={originalData.address} newData={formData.address} />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Card 2: Document Upload Zone */}
          <div className="flex-1 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col relative transition-all duration-300">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/50">
              <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700">
                <FileCheck className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Supporting Document</h3>
                <p className="text-xs text-slate-400 mt-0.5">Upload a new Institute License PDF to verify these changes</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              {requestState === 'READY' ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full h-full min-h-[160px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 transition-all cursor-pointer ${
                    uploadedFile 
                      ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10' 
                      : 'border-slate-700 bg-slate-950/50 text-slate-500 hover:border-emerald-500/50 hover:text-emerald-400'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload}
                    accept="application/pdf"
                    className="hidden" 
                  />
                  {uploadedFile ? (
                    <>
                      <FileCheck className="w-10 h-10 mb-3" />
                      <p className="font-bold text-sm">{uploadedFile.name}</p>
                      <p className="text-xs opacity-70 mt-1">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      <p className="text-xs mt-3 underline underline-offset-2">Click to replace document</p>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-10 h-10 mb-3" />
                      <p className="font-bold text-sm mb-1">Click to browse or drag PDF here</p>
                      <p className="text-xs text-slate-500">Maximum file size: 10MB</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="w-full h-full min-h-[160px] rounded-xl border border-slate-700/50 bg-slate-950/50 flex flex-col items-center justify-center p-6 opacity-70 cursor-not-allowed">
                  <FileCheck className="w-10 h-10 mb-3 text-slate-500" />
                  <p className="font-bold text-sm text-slate-400">{uploadedFile?.name || 'Document Submitted'}</p>
                  <p className="text-xs text-amber-500 mt-2 flex items-center gap-1"><Lock className="w-3 h-3" /> Locked during review</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Global Footer & Banner Zone (Full Width) */}
      <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-0 mt-2 flex flex-col gap-4">
        
        {/* Dynamic State Banners */}
        <AnimatePresence mode="wait">
          {requestState === 'PENDING' && (
            <motion.div 
              key="pending"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between shadow-xl"
            >
              <div className="flex items-center gap-3 text-amber-400">
                <Clock className="w-5 h-5 animate-pulse" />
                <span className="font-bold text-sm tracking-wide">Verification Status: PENDING. Your data change request is currently under review by the Global Overwatch team.</span>
              </div>
            </motion.div>
          )}

          {requestState === 'REJECTED' && (
            <motion.div 
              key="rejected"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl"
            >
              <div className="flex items-start sm:items-center gap-3 text-red-400">
                <XCircle className="w-5 h-5 mt-0.5 sm:mt-0 shrink-0" />
                <span className="font-bold text-sm tracking-wide">Request Rejected. <span className="font-medium opacity-80 text-white italic">"Remark: Document uploaded is illegible. Please scan at a higher resolution."</span></span>
              </div>
              <button 
                onClick={handleAcknowledge}
                className="whitespace-nowrap px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors text-sm"
              >
                Acknowledge & Retry
              </button>
            </motion.div>
          )}

          {requestState === 'APPROVED' && (
            <motion.div 
              key="approved"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl"
            >
              <div className="flex items-start sm:items-center gap-3 text-emerald-400">
                <CheckCircle2 className="w-5 h-5 mt-0.5 sm:mt-0 shrink-0" />
                <span className="font-bold text-sm tracking-wide">Compliance verified. Your Legal Facility Data has been successfully updated on the platform network.</span>
              </div>
              <button 
                onClick={handleAcknowledge}
                className="whitespace-nowrap px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors text-sm"
              >
                OK
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Button (Centered) */}
        <div className="w-full flex justify-center mt-2">
          <button 
            onClick={simulateSubmit}
            disabled={!canSubmit || isSubmitting || requestState !== 'READY'}
            className={`w-full sm:w-[400px] flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]
              ${!canSubmit && requestState === 'READY' 
                ? 'bg-slate-800 text-slate-500 border border-slate-700 shadow-none cursor-not-allowed'
                : requestState !== 'READY'
                ? 'bg-emerald-900/50 text-emerald-700 border border-emerald-900 shadow-none cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting Request...
              </>
            ) : (
              <>
                <FileCheck className="w-5 h-5" />
                Submit Change Request
              </>
            )}
          </button>
        </div>

      </div>
      
    </div>
  );
}
