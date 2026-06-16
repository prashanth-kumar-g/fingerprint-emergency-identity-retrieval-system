import { Outlet, Link } from 'react-router-dom';
import { Fingerprint, Shield, Building2, Stethoscope, Mail, Phone, MapPin } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 font-sans text-slate-200">
      
      {/* ── PREMIUM NAVIGATION BAR ── */}
      <nav className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-cyan-900/50 border border-cyan-400/50 group-hover:bg-cyan-800 transition-colors">
              <Fingerprint className="w-5 h-5 text-cyan-300" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-base md:text-lg font-black tracking-tight text-white hidden sm:block leading-none">
				Fingerprint-based Emergency Identity Retrieval System
			  </span>
              <span className="text-lg font-black tracking-tight text-white block sm:hidden">
                FEIRS
              </span>
            </div>
          </Link>
          
          <div className="flex gap-6 text-sm font-bold tracking-wide uppercase">
            <Link to="/login/super-admin" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors group">
              <div className="p-2 rounded-full bg-cyan-900 border border-cyan-400/50 group-hover:bg-cyan-800 transition-colors shadow-[0_0_15px_rgba(8,145,178,0.5)]">
                <Shield className="w-4 h-4 text-cyan-300" strokeWidth={2.5} />
              </div>
              <span className="hidden lg:block">Super Admin</span>
            </Link>
            <Link to="/login/institution" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors group">
              <div className="p-2 rounded-full bg-emerald-900 border border-emerald-400/50 group-hover:bg-emerald-800 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                <Building2 className="w-4 h-4 text-emerald-300" strokeWidth={2.5} />
              </div>
              <span className="hidden lg:block">Institution</span>
            </Link>
            <Link to="/login/operator" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors group">
              <div className="p-2 rounded-full bg-red-900 border border-red-400/50 group-hover:bg-red-800 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                <Stethoscope className="w-4 h-4 text-red-300" strokeWidth={2.5} />
              </div>
              <span className="hidden lg:block">Operator</span>
            </Link>
          </div>

        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-grow w-full flex flex-col relative">
        <Outlet />
      </main>
      
      {/* ── PREMIUM FOOTER ── */}
      <footer className="w-full bg-slate-900 border-t border-slate-800 pt-8 pb-4 mt-auto">
        <div className="max-w-[1400px] mx-auto px-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 border-b border-slate-800 pb-6">
            
            {/* Brand Column */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex items-center gap-2 mb-2">
                <Fingerprint className="w-5 h-5 text-cyan-400" />
                <span className="text-lg font-black text-white">FEIRS</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-xs max-w-sm">
                A life-saving biometric platform designed for instant medical data retrieval during critical emergencies.
              </p>
            </div>

            {/* Support Column */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h4 className="text-white font-bold text-xs mb-3 tracking-wide">SYSTEM SUPPORT</h4>
              <ul className="flex flex-col gap-2 text-slate-400 text-xs">
                <li className="flex items-center gap-2 hover:text-cyan-400 cursor-pointer transition-colors">
                  <Mail className="w-3 h-3" />
                  support@feirs-platform.system
                </li>
                <li className="flex items-center gap-2 hover:text-cyan-400 cursor-pointer transition-colors">
                  <Phone className="w-3 h-3" />
                  1-800-EMERGENCY-BIO
                </li>
                <li className="flex items-center gap-2 hover:text-cyan-400 cursor-pointer transition-colors">
                  <MapPin className="w-3 h-3" />
                  Global Medical Datacenter
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h4 className="text-white font-bold text-xs mb-3 tracking-wide">COMPLIANCE</h4>
              <ul className="flex flex-col gap-2 text-slate-400 text-xs">
                <li className="hover:text-white cursor-pointer transition-colors">HIPAA Privacy Policy</li>
                <li className="hover:text-white cursor-pointer transition-colors">Biometric Data Security</li>
                <li className="hover:text-white cursor-pointer transition-colors">Terms of Service</li>
              </ul>
            </div>

          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-slate-500 font-semibold text-[10px]">
            <p>© 2026 FEIRS Multi-Tenant Platform. All rights reserved.</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
              <span>All Systems Operational</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
