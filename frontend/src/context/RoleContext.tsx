import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole, UserProfile, ModuleId, AppViewMode, Patient } from '../types';

export const CLINICAL_STAFF: Record<UserRole, UserProfile> = {
  DOCTOR: {
    id: 'STF-DOC-101',
    name: 'Dr. Kavinda Rathnayaka',
    role: 'DOCTOR',
    roleTitle: 'Consultant Cardiologist',
    department: 'Cardiology & Cardiovascular Care',
    email: 'k.rathnayaka@pulseos.health',
  },
  RECEPTIONIST: {
    id: 'STF-REG-201',
    name: 'D. Somarathna',
    role: 'RECEPTIONIST',
    roleTitle: 'Outpatient Triage Officer',
    department: 'Patient Admissions & Emergency Triage',
    email: 'admissions@pulseos.health',
  },
  PHARMACIST: {
    id: 'STF-PHM-301',
    name: 'H. Udumullage, BPharm',
    role: 'PHARMACIST',
    roleTitle: 'Head Pharmacist',
    department: 'Hospital Central Pharmacy & Therapeutics',
    email: 'pharmacy@pulseos.health',
  },
  LAB_TECHNICIAN: {
    id: 'STF-LAB-401',
    name: 'N. Thilakarathne, MLT',
    role: 'LAB_TECHNICIAN',
    roleTitle: 'Senior Pathology Technologist',
    department: 'Clinical Pathology & Diagnostics',
    email: 'diagnostics@pulseos.health',
  },
  CASHIER_ADMIN: {
    id: 'STF-ADM-501',
    name: 'K. Dhanasinghe',
    role: 'CASHIER_ADMIN',
    roleTitle: 'Hospital Administrator',
    department: 'Financial Operations & Billing',
    email: 'administration@pulseos.health',
  },
};

interface RoleContextType {
  currentView: AppViewMode;
  setCurrentView: (view: AppViewMode) => void;
  currentRole: UserRole;
  currentUser: UserProfile;
  setRole: (role: UserRole) => void;
  activeModule: ModuleId;
  setActiveModule: (module: ModuleId) => void;
  patientSession: Patient | null;
  setPatientSession: (patient: Patient | null) => void;
  isStaffLoginModalOpen: boolean;
  setIsStaffLoginModalOpen: (open: boolean) => void;
  isPatientLoginModalOpen: boolean;
  setIsPatientLoginModalOpen: (open: boolean) => void;
  loginPatient: (patient: Patient) => void;
  logoutPatient: () => void;
  logoutStaff: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppViewMode>('landing');
  const [currentRole, setCurrentRole] = useState<UserRole>('RECEPTIONIST');
  const [activeModule, setActiveModule] = useState<ModuleId>('patients');
  const [patientSession, setPatientSession] = useState<Patient | null>(null);
  const [isStaffLoginModalOpen, setIsStaffLoginModalOpen] = useState(false);
  const [isPatientLoginModalOpen, setIsPatientLoginModalOpen] = useState(false);

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

  const loginPatient = (patient: Patient) => {
    setPatientSession(patient);
    setCurrentView('patient_portal');
    setIsPatientLoginModalOpen(false);
  };

  const logoutPatient = () => {
    setPatientSession(null);
    setCurrentView('landing');
  };

  const logoutStaff = () => {
    setCurrentView('landing');
  };

  return (
    <RoleContext.Provider
      value={{
        currentView,
        setCurrentView,
        currentRole,
        currentUser: CLINICAL_STAFF[currentRole],
        setRole: handleSetRole,
        activeModule,
        setActiveModule,
        patientSession,
        setPatientSession,
        isStaffLoginModalOpen,
        setIsStaffLoginModalOpen,
        isPatientLoginModalOpen,
        setIsPatientLoginModalOpen,
        loginPatient,
        logoutPatient,
        logoutStaff,
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

// Keep backwards-compatible export if needed
export const TEAM_MEMBERS = CLINICAL_STAFF;
