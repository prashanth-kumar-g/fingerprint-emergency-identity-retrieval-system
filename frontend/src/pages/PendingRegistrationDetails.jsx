import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PendingRegistrationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="w-full flex flex-col items-center gap-6 pb-20">
      <div className="w-full relative flex flex-col items-start justify-center mt-2 mb-8 max-w-[1400px] mx-auto px-4 lg:px-0">
        <button 
          onClick={() => navigate('/super-admin/pending-registrations')}
          className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-6 transition-colors font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Pending Registrations
        </button>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
          Application Details
        </h1>
        <p className="text-slate-400 font-mono text-sm">Reviewing Application: {id}</p>
      </div>

      <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-0">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4">
            <span className="text-cyan-400 font-bold">INFO</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Placeholder Page</h2>
          <p className="text-slate-400 max-w-md">
            The detailed review interface for application <strong className="text-white">{id}</strong> will be built here in the next phase.
          </p>
        </div>
      </div>
    </div>
  );
}
