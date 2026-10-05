import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Clock, ShieldCheck, Globe, LogOut, Menu, X } from 'lucide-react';
import { useRole } from '../../context/RoleContext';

interface NavbarProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu, isMobileMenuOpen = false }) => {
  const navigate = useNavigate();
  const { currentUser, logoutStaff } = useRole();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="liquid-glass sticky top-0 z-30 h-16 w-full px-4 lg:px-6 flex items-center justify-between border-b border-slate-200">
      {/* Left: Hamburger & Brand & Facility Indicator */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
            title="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        )}

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 sm:gap-3 text-left focus:outline-none group"
          title="Return to Public Hospital Site"
        >
          <div className="h-10 w-10 rounded-xl overflow-hidden bg-white border border-slate-200/80 shadow-xs flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform">
            <img src="/pulseos-logo.jpg" alt="PulseOS Logo" className="h-full w-full object-contain rounded-lg" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-clinical-ink">PulseOS</span>
              <span className="text-[10px] uppercase font-mono font-semibold tracking-wider px-1.5 py-0.5 rounded bg-clinical-teal-50 text-clinical-teal-700 border border-clinical-teal-200">
                Clinical OS
              </span>
            </div>
            <p className="text-[11px] text-clinical-ink-muted -mt-0.5">Central Hospital Information System</p>
          </div>
        </button>
      </div>

      {/* Center: Live System Clock */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/60 text-clinical-ink-secondary text-xs font-mono">
        <Clock className="h-3.5 w-3.5 text-clinical-teal-600" />
        <span>{currentTime || 'Synchronizing system clock...'}</span>
      </div>

      {/* Right: H2 Console, Public Portal Button & Clinician Pill */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Public Website Button */}
        <button
          onClick={() => navigate("/")}
          className="apple-btn hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-semibold shadow-2xs"
          title="View Public Hospital Landing Page"
        >
          <Globe className="h-3.5 w-3.5 text-slate-500" />

          <span className="hidden lg:inline">Public Portal</span>
        </button>

        {/* Current Clinician Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="h-9 w-9 rounded-full bg-slate-800 text-white font-mono text-xs font-bold flex items-center justify-center shadow-inner">
            {currentUser?.name
              ? currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
              : 'ST'}
          </div>
          <div className="hidden md:block text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-clinical-ink leading-tight">{currentUser?.name || 'Staff User'}</span>
              <ShieldCheck className="h-3.5 w-3.5 text-clinical-teal-600" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold text-clinical-teal-700">{currentUser?.roleTitle || 'Clinical Staff'}</span>
              <span className="text-[10px] text-slate-300">&bull;</span>
              <span className="text-[10px] text-slate-400 truncate max-w-[130px]">{currentUser?.department || 'Outpatient Services'}</span>
            </div>
          </div>

          <button
            onClick={() => { logoutStaff(); navigate("/", { replace: true }); }}
            className="apple-btn p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
            title="Sign Out to Public Portal"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
