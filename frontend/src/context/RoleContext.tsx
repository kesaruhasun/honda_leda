import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole, UserProfile, ModuleId } from '../types';

export const TEAM_MEMBERS: Record<UserRole, UserProfile> = {
  DOCTOR: {
    id: 'DOC-101',
    name: 'Dr. Kavinda Rathnayaka',
    studentName: 'Rathnayaka R. M. K. L. B.',
    studentId: 'IT25103999',
    role: 'DOCTOR',
    roleTitle: 'Chief Consultant Cardiologist',
    department: 'Cardiology',
    email: 'it25103999@my.sliit.lk',
    featureBranch: 'feature/doctor-management',
  },
  RECEPTIONIST: {
    id: 'REC-201',
    name: 'Dila Somarathna',
    studentName: 'Somarathna P. G. D. S.',
    studentId: 'IT25103819',
    role: 'RECEPTIONIST',
    roleTitle: 'Head Patient Registrar',
    department: 'Outpatient Triage & Admissions',
    email: 'it25103819@my.sliit.lk',
    featureBranch: 'feature/patient-management',
  },
  PHARMACIST: {
    id: 'PHM-301',
    name: 'Harshika Udumullage',
    studentName: 'Udumullage S.H.U.',
    studentId: 'IT25100826',
    role: 'PHARMACIST',
    roleTitle: 'Chief Clinical Pharmacist',
    department: 'Hospital Central Pharmacy',
    email: 'it25100826@my.sliit.lk',
    featureBranch: 'feature/inventory-pharmacy',
  },
  LAB_TECHNICIAN: {
    id: 'LAB-401',
    name: 'Nethuli Thilakarathne',
    studentName: 'Thilakarathne H.S.K.P.N',
    studentId: 'IT25103363',
    role: 'LAB_TECHNICIAN',
    roleTitle: 'Senior Pathology Technologist',
    department: 'Clinical Pathology & Diagnostics',
    email: 'it25103363@my.sliit.lk',
    featureBranch: 'feature/laboratory-tests',
  },
  CASHIER_ADMIN: {
    id: 'ADM-501',
    name: 'Kesaru Dhanasinghe',
    studentName: 'Dhanasinghe K. A. K. H.',
    studentId: 'IT25103992',
    role: 'CASHIER_ADMIN',
    roleTitle: 'Hospital Comptroller & System Admin',
    department: 'Finance & Hospital Administration',
    email: 'it25103992@my.sliit.lk',
    featureBranch: 'feature/billing-payment',
  },
};

interface RoleContextType {
  currentRole: UserRole;
  currentUser: UserProfile;
  setRole: (role: UserRole) => void;
  activeModule: ModuleId;
  setActiveModule: (module: ModuleId) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('RECEPTIONIST');
  const [activeModule, setActiveModule] = useState<ModuleId>('patients');

  const handleSetRole = (role: UserRole) => {
    setCurrentRole(role);
    switch (role) {
      case 'DOCTOR':
        setActiveModule('doctors');
        break;
      case 'RECEPTIONIST':
        setActiveModule('patients');
        break;
      case 'PHARMACIST':
        setActiveModule('pharmacy');
        break;
      case 'LAB_TECHNICIAN':
        setActiveModule('laboratory');
        break;
      case 'CASHIER_ADMIN':
        setActiveModule('billing');
        break;
    }
  };

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        currentUser: TEAM_MEMBERS[currentRole],
        setRole: handleSetRole,
        activeModule,
        setActiveModule,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
