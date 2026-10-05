import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider } from './context/RoleContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/layout/Layout';

// Public Views
import { LandingView } from './views/LandingView';
import { PhysiciansView } from './views/PhysiciansView';
import { ServicesView } from './views/ServicesView';
import { PatientLoginView } from './views/auth/PatientLoginView';
import { PatientSignupView } from './views/auth/PatientSignupView';
import { StaffLoginView } from './views/auth/StaffLoginView';

// Protected Views
import { PatientPortalView } from './views/PatientPortalView';

// Clinical Modules
import { PatientView } from './views/PatientView';
import { DoctorView } from './views/DoctorView';
import { AppointmentView } from './views/AppointmentView';
import { PharmacyView } from './views/PharmacyView';
import { BillingView } from './views/BillingView';
import { LaboratoryView } from './views/LaboratoryView';

// Dedicated Role Dashboards
import { DoctorDashboardView } from './views/DoctorDashboardView';
import { ManagerDashboardView } from './views/ManagerDashboardView';
import { PharmacistDashboardView } from './views/PharmacistDashboardView';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <RoleProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingView />} />
            <Route path="/physicians" element={<PhysiciansView />} />
            <Route path="/services" element={<ServicesView />} />
            
            {/* Auth Routes */}
            <Route path="/patient/login" element={<PatientLoginView />} />
            <Route path="/patient/signup" element={<PatientSignupView />} />
            <Route path="/admin" element={<StaffLoginView />} />
            <Route path="/staff" element={<StaffLoginView />} />
            <Route path="/staff/login" element={<StaffLoginView />} />

            {/* Patient Portal */}
            <Route path="/patient/portal" element={<PatientPortalView />} />

            {/* Clinical Dashboard */}
            <Route path="/dashboard" element={<Layout />}>
              <Route index element={<Navigate to="patients" replace />} />
              <Route path="doctor" element={<DoctorDashboardView />} />
              <Route path="manager" element={<ManagerDashboardView />} />
              <Route path="pharmacist" element={<PharmacistDashboardView />} />
              <Route path="patients" element={<PatientView />} />
              <Route path="doctors" element={<DoctorView />} />
              <Route path="appointments" element={<AppointmentView />} />
              <Route path="pharmacy" element={<PharmacyView />} />
              <Route path="billing" element={<BillingView />} />
              <Route path="laboratory" element={<LaboratoryView />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </RoleProvider>
    </ToastProvider>
  );
};

export default App;
