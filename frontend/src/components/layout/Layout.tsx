import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../common/ToastContainer';
import { useRole } from '../../context/RoleContext';
import { ModuleId, UserRole } from '../../types';
import { X } from 'lucide-react';

const ROLE_ALLOWED_MODULES: Record<UserRole, ModuleId[]> = {
  DOCTOR: ['doctor', 'appointments', 'patients'],
  RECEPTIONIST: ['patients', 'appointments', 'doctors', 'billing', 'manager'],
  PHARMACIST: ['pharmacist', 'pharmacy', 'patients'],
  LAB_TECHNICIAN: ['laboratory', 'patients'],
  CASHIER_ADMIN: ['manager', 'doctor', 'pharmacist', 'patients', 'doctors', 'appointments', 'pharmacy', 'laboratory', 'billing'],
};

const ROLE_PRIMARY_MODULE: Record<UserRole, ModuleId> = {
  DOCTOR: 'doctor',
  RECEPTIONIST: 'patients',
  PHARMACIST: 'pharmacist',
  LAB_TECHNICIAN: 'laboratory',
  CASHIER_ADMIN: 'manager',
};

export const Layout: React.FC = () => {
  const { currentRole } = useRole();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const pathParts = location.pathname.split('/');
  const currentModule = pathParts[2] as ModuleId | undefined;

  const allowed = ROLE_ALLOWED_MODULES[currentRole] || [];
  if (currentModule && !allowed.includes(currentModule)) {
    const fallback = ROLE_PRIMARY_MODULE[currentRole] || 'patients';
    return <Navigate to={`/dashboard/${fallback}`} replace />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 overflow-hidden font-sans select-none">
      {/* Top Navbar */}
      <Navbar
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <div className="flex-1 flex overflow-hidden relative min-h-0 w-full">
        {/* Desktop & Tablet Sidebar */}
        <div className="hidden md:flex shrink-0 h-full">
          <Sidebar />
        </div>

        {/* Mobile Backdrop (z-40 per design system) */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Slide-Over Drawer Sidebar (z-40 per design system) */}
        <div
          className={`fixed inset-y-0 left-0 z-40 w-72 bg-white shadow-2xl transform transition-transform duration-200 ease-out md:hidden flex flex-col border-r border-slate-200 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90 shrink-0">
            <div className="flex items-center gap-2">
              <img src="/pulseos-logo.jpg" alt="PulseOS" className="h-7 w-7 object-contain rounded-lg border border-slate-200" />
              <span className="font-bold text-sm text-slate-900 tracking-tight">PulseOS Stations</span>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/80 transition-colors"
              title="Close Menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <Sidebar isMobile onNavigate={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>

        {/* Main Operational Scrollable Content Shell */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 lg:p-6 w-full min-w-0 min-h-0 bg-slate-50">
          <div className="max-w-7xl lg:max-w-[1600px] mx-auto space-y-6 min-w-0">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Toast Container (z-60) */}
      <ToastContainer />
    </div>
  );
};

export default Layout;
