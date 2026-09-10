import React from "react";
import { RoleProvider, useRole } from "./context/RoleContext";
import { ToastProvider } from "./context/ToastContext";
import { Layout } from "./components/layout/Layout";
import { PatientView } from "./views/PatientView";
import { DoctorView } from "./views/DoctorView";
import { AppointmentView } from "./views/AppointmentView";
import { PharmacyView } from "./views/PharmacyView";
import { BillingView } from "./views/BillingView";
import { LaboratoryView } from "./views/LaboratoryView";

const ModuleRouter: React.FC = () => {
  const { activeModule } = useRole();

  switch (activeModule) {
    case "patients":
      return <PatientView />;
    case "doctors":
      return <DoctorView />;
    case "appointments":
      return <AppointmentView />;
    case "pharmacy":
      return <PharmacyView />;
    case "billing":
      return <BillingView />;
    case "laboratory":
      return <LaboratoryView />;
    default:
      return <PatientView />;
  }
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <RoleProvider>
        <Layout>
          <ModuleRouter />
        </Layout>
      </RoleProvider>
    </ToastProvider>
  );
};

export default App;
