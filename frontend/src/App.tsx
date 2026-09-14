import React from 'react';
import { RoleProvider, useRole } from './context/RoleContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/layout/Layout';
import { LandingView } from './views/LandingView';
import { PatientPortalView } from './views/PatientPortalView';
import { PatientView } from './views/PatientView';
import { DoctorView } from './views/DoctorView';
import { AppointmentView } from './views/AppointmentView';
import { PharmacyView } from './views/PharmacyView';
import { BillingView } from './views/BillingView';
import { LaboratoryView } from './views/LaboratoryView';
import { PatientLoginModal } from './components/auth/PatientLoginModal';
import { StaffLoginModal } from './components/auth/StaffLoginModal';

const ModuleRouter: React.FC = () => {
  const { activeModule } = useRole();

  switch (activeModule) {
    case 'patients':
      return <PatientView />;
    case 'doctors':
      return <DoctorView />;
    case 'appointments':
      return <AppointmentView />;
    case 'pharmacy':
      return <PharmacyView />;
    case 'billing':
      return <BillingView />;
    case 'laboratory':
      return <LaboratoryView />;
    default:
      return <PatientView />;
  }
};

const MainAppView: React.FC = () => {
  const { currentView } = useRole();

  if (currentView === 'landing') {
    return <LandingView />;
  }

  if (currentView === 'patient_portal') {
    return <PatientPortalView />;
  }

  return (
    <Layout>
      <ModuleRouter />
      <PatientLoginModal />
      <StaffLoginModal />
    </Layout>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <RoleProvider>
        <MainAppView />
      </RoleProvider>
    </ToastProvider>
  );
};

export default App;
