import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  updatePatientSession: (updated: Partial<Patient>) => void;
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
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      const saved = sessionStorage.getItem('currentRole') as UserRole;
      if (saved) return saved;
    }
    return 'RECEPTIONIST';
  });
  const [activeModule, setActiveModule] = useState<ModuleId>("patients");
  
  // Update sessionStorage when role changes
  useEffect(() => {
    sessionStorage.setItem('currentRole', currentRole);
  }, [currentRole]);

  // Initialize patient session from sessionStorage safely
  const [patientSession, setPatientSession] = useState<Patient | null>(() => {
    try {
      if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') return null;
      const fullData = sessionStorage.getItem('currentPatientData');
      if (fullData) {
        return JSON.parse(fullData) as Patient;
      }
      const savedId = sessionStorage.getItem('currentPatientId');
      const savedNic = sessionStorage.getItem('currentPatientNic');
      const savedName = sessionStorage.getItem('currentPatientName');
      
      if (savedId && savedNic) {
        // Return a partial Patient object that satisfies the UI needs
        return {
          id: Number(savedId),
          patientId: `PAT-${savedId}`,
          nicPassportNo: savedNic,
          firstName: savedName ? savedName.split(' ')[0] : 'Patient',
          lastName: savedName ? savedName.split(' ').slice(1).join(' ') : '',
          fullName: savedName || 'Patient',
          dob: '',
          gender: 'OTHER',
          bloodGroup: 'O+',
          contactNumber: '',
          emergencyContactName: '',
          emergencyContactRelationship: '',
          emergencyContactPhone: '',
          triagePriority: 'ROUTINE',
          registrationDate: '',
          isArchived: false
        } as Patient;
      }
    } catch {
      // Storage access may fail in restricted iframes
    }
    return null;
  });
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
    try {
      sessionStorage.setItem('currentPatientId', String(patient.id));
      sessionStorage.setItem('currentPatientNic', patient.nicPassportNo);
      sessionStorage.setItem('currentPatientName', patient.fullName || `${patient.firstName} ${patient.lastName}`);
      sessionStorage.setItem('currentPatientData', JSON.stringify(patient));
    } catch {
      // Ignore storage restrictions
    }
    setPatientSession(patient);
    setCurrentView('patient_portal');
    setIsPatientLoginModalOpen(false);
  };

  const updatePatientSession = (updated: Partial<Patient>) => {
    setPatientSession((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updated };
      try {
        sessionStorage.setItem('currentPatientData', JSON.stringify(next));
        if (next.fullName || next.firstName) {
          sessionStorage.setItem('currentPatientName', next.fullName || `${next.firstName} ${next.lastName}`);
        }
      } catch {
        // Ignore storage restrictions
      }
      return next;
    });
  };

  const logoutPatient = () => {
    try {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('currentPatientId');
      sessionStorage.removeItem('currentPatientNic');
      sessionStorage.removeItem('currentPatientName');
      sessionStorage.removeItem('currentPatientData');
    } catch {
      // Ignore storage restrictions
    }
    setPatientSession(null);
    setCurrentView('landing');
  };

  const logoutStaff = () => {
    try {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    } catch {
      // Ignore storage restrictions
    }
    setCurrentView('landing');
  };

  const currentUser = CLINICAL_STAFF[currentRole] || CLINICAL_STAFF.RECEPTIONIST;

  return (
    <RoleContext.Provider
      value={{
        currentView,
        setCurrentView,
        currentRole,
        currentUser,
        setRole: handleSetRole,
        activeModule,
        setActiveModule,
        patientSession,
        setPatientSession,
        updatePatientSession,
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
