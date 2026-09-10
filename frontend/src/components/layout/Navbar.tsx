import React, { useState, useEffect } from 'react';
import { Activity, Database, Clock, ExternalLink, ShieldCheck } from 'lucide-react';
import { useRole } from '../../context/RoleContext';

export const Navbar: React.FC = () => {
  const { currentUser } = useRole();
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
    <header className="liquid-glass sticky top-0 z-30 h-16 w-full px-4 lg:px-6 flex items-center justify-between">
      {/* Left: Brand & System Indicator */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-apple-xl bg-clinical-teal-600 flex items-center justify-center text-white shadow-sm shadow-clinical-teal-600/20">
          <Activity className="h-6 w-6 stroke-[2.2]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight text-clinical-ink">PulseOS</span>
            <span className="text-[10px] uppercase font-mono font-semibold tracking-wider px-1.5 py-0.5 rounded bg-clinical-teal-50 text-clinical-teal-700 border border-clinical-teal-200">
              v1.0 SLIIT
            </span>
          </div>
          <p className="text-[11px] text-clinical-ink-muted -mt-0.5">Warm Humanist Clinical Care</p>
        </div>
      </div>

      {/* Center: Live System Clock */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/60 text-clinical-ink-secondary text-xs font-mono">
        <Clock className="h-3.5 w-3.5 text-clinical-teal-600" />
        <span>{currentTime || 'Synchronizing system clock...'}</span>
      </div>

      {/* Right: Active DB Console & Active User Badge */}
      <div className="flex items-center gap-3">
        {/* H2 Live Console Direct Link */}
        <a
          href="http://localhost:8080/h2-console"
          target="_blank"
          rel="noopener noreferrer"
          title="Open Embedded H2 Live SQL Web Console"
          className="apple-btn flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Database className="h-3.5 w-3.5 text-emerald-600" />
          <span className="hidden sm:inline">H2 Live Console</span>
          <ExternalLink className="h-3 w-3 opacity-60" />
        </a>

        {/* Current User Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="h-9 w-9 rounded-full bg-slate-800 text-white font-mono text-xs font-bold flex items-center justify-center shadow-inner">
            {currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div className="hidden lg:block text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-clinical-ink leading-tight">{currentUser.name}</span>
              <ShieldCheck className="h-3.5 w-3.5 text-clinical-teal-600" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-clinical-ink-muted font-mono">{currentUser.studentId}</span>
              <span className="text-[10px] text-slate-300">•</span>
              <span className="text-[10px] font-medium text-clinical-teal-700">{currentUser.department}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
