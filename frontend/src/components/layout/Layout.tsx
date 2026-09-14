import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../common/ToastContainer';
import { useRole } from '../../context/RoleContext';
import { ModuleId, UserRole } from '../../types';

const ROLE_ALLOWED_MODULES: Record<UserRole, ModuleId[]> = {
  DOCTOR: ['appointments', 'patients'],
  RECEPTIONIST: ['patients', 'appointments', 'doctors', 'billing'],
  PHARMACIST: ['pharmacy', 'patients'],
  LAB_TECHNICIAN: ['laboratory', 'patients'],
  CASHIER_ADMIN: ['patients', 'doctors', 'appointments', 'pharmacy', 'laboratory', 'billing'],
};

const ROLE_PRIMARY_MODULE: Record<UserRole, ModuleId> = {
  DOCTOR: 'appointments',
  RECEPTIONIST: 'patients',
  PHARMACIST: 'pharmacy',
  LAB_TECHNICIAN: 'laboratory',
  CASHIER_ADMIN: 'billing',
};

export const Layout: React.FC = () => {
  const { currentRole } = useRole();
  const location = useLocation();

  const pathParts = location.pathname.split('/');
  const currentModule = pathParts[2] as ModuleId | undefined;

  const allowed = ROLE_ALLOWED_MODULES[currentRole] || [];
  if (currentModule && !allowed.includes(currentModule)) {
    const fallback = ROLE_PRIMARY_MODULE[currentRole] || 'patients';
    return <Navigate to={`/dashboard/${fallback}`} replace />;
  }

  return (
    <div className="h-full min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};
export default Layout;
