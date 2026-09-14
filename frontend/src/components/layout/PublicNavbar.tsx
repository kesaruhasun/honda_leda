import React from 'react';
import { User, ShieldCheck, ExternalLink, PhoneCall } from 'lucide-react';
import { useRole } from '../../context/RoleContext';

export const PublicNavbar: React.FC = () => {
  const { setIsPatientLoginModalOpen, setIsStaffLoginModalOpen, patientSession, setCurrentView } = useRole();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Emergency Hotline Top Bar */}
      <div className="bg-slate-900 text-white text-[11px] px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
            <PhoneCall className="h-3 w-3 animate-pulse" />
            <span>24/7 Trauma Hotline: 1990</span>
          </div>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-300 hidden sm:inline">
            PulseOS Central Hospital & Diagnostic Center, Colombo 07
          </span>
          <div className="ml-auto flex items-center gap-3">
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 font-mono transition-colors"
              title="Open Live Embedded H2 Database Console"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              <span>Live DB Console</span>
              <ExternalLink className="h-2.5 w-2.5 opacity-70" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl overflow-hidden bg-white border border-slate-200/80 shadow-xs flex items-center justify-center p-0.5 shrink-0">
            <img src="/pulseos-logo.jpg" alt="PulseOS Logo" className="h-full w-full object-contain rounded-lg" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-clinical-ink">PulseOS</span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-clinical-teal-50 text-clinical-teal-700 border border-clinical-teal-200">
                Medical Center
              </span>
            </div>
            <p className="text-[10px] text-slate-500 -mt-0.5">Tertiary Clinical Care & Diagnostics</p>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-clinical-ink-secondary">
          <a href="#specialties" className="hover:text-clinical-teal-700 transition-colors">
            Specialties
          </a>
          <a href="#physicians" className="hover:text-clinical-teal-700 transition-colors">
            Our Physicians
          </a>
          <a href="#services" className="hover:text-clinical-teal-700 transition-colors">
            Hospital Services
          </a>
          <a href="#diagnostics" className="hover:text-clinical-teal-700 transition-colors">
            Lab & Diagnostics
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {patientSession ? (
            <button
              onClick={() => setCurrentView('patient_portal')}
              className="apple-btn flex items-center gap-1.5 px-3 py-1.5 rounded-apple-xl bg-clinical-teal-50 text-clinical-teal-700 border border-clinical-teal-200 text-xs font-semibold hover:bg-clinical-teal-100"
            >
              <User className="h-3.5 w-3.5" />
              <span>Portal ({patientSession.firstName})</span>
            </button>
          ) : (
            <button
              onClick={() => setIsPatientLoginModalOpen(true)}
              className="apple-btn flex items-center gap-1.5 px-3 py-1.5 rounded-apple-xl bg-clinical-teal-600 text-white text-xs font-semibold hover:bg-clinical-teal-700 shadow-sm shadow-clinical-teal-600/20"
            >
              <User className="h-3.5 w-3.5" />
              <span>Patient Portal</span>
            </button>
          )}

          <button
            onClick={() => setIsStaffLoginModalOpen(true)}
            className="apple-btn flex items-center gap-1.5 px-3 py-1.5 rounded-apple-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
            <span>Staff Sign In</span>
          </button>
        </div>
      </div>
    </header>
  );
};
