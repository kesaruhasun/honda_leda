import React from 'react';
import { Stethoscope, Users, Pill, FlaskConical, Receipt, ArrowRight, Shield } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useRole, CLINICAL_STAFF } from '../../context/RoleContext';
import { UserRole } from '../../types';

export const StaffLoginModal: React.FC = () => {
  const { isStaffLoginModalOpen, setIsStaffLoginModalOpen, setRole, setCurrentView } = useRole();

  const handleSelectRole = (role: UserRole) => {
    setRole(role);
    setCurrentView('clinical_dashboard');
    setIsStaffLoginModalOpen(false);
  };

  const ROLES_LIST = [
    {
      role: 'DOCTOR' as UserRole,
      title: 'Consultant Physician & Specialist',
      dept: 'Cardiology, Neurology, Pediatrics & OPD',
      icon: Stethoscope,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
    },
    {
      role: 'RECEPTIONIST' as UserRole,
      title: 'Outpatient Registrar & Triage',
      dept: 'Patient Intake, Emergency Triage & Records',
      icon: Users,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      role: 'PHARMACIST' as UserRole,
      title: 'Clinical Pharmacist',
      dept: 'Formulary Inventory, Expiry & Dispensing',
      icon: Pill,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      role: 'LAB_TECHNICIAN' as UserRole,
      title: 'Pathology & Diagnostic Technologist',
      dept: 'Specimen Worklists, Biometrics & Reports',
      icon: FlaskConical,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      role: 'CASHIER_ADMIN' as UserRole,
      title: 'Hospital Comptroller & Billing Cashier',
      dept: 'Encounters Aggregation, PayHere & Receipts',
      icon: Receipt,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
  ];

  return (
    <Modal
      isOpen={isStaffLoginModalOpen}
      onClose={() => setIsStaffLoginModalOpen(false)}
      title="Clinician & Administrative Sign-In"
      subtitle="Select your clinical workstation profile to enter the PulseOS Operational Suite."
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-3 rounded-apple-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
          <Shield className="h-4 w-4 text-clinical-teal-600 shrink-0" />
          <span>Restricted Clinical Network. Authorized hospital staff only.</span>
        </div>

        <div className="space-y-2">
          {ROLES_LIST.map((item) => {
            const Icon = item.icon;
            const staffInfo = CLINICAL_STAFF[item.role];

            return (
              <button
                key={item.role}
                onClick={() => handleSelectRole(item.role)}
                className="apple-btn w-full p-3.5 rounded-apple-xl border border-slate-200/80 bg-white hover:bg-slate-50 hover:border-clinical-teal-400 flex items-center justify-between text-left transition-all shadow-sm group"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-apple-lg border ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-clinical-ink group-hover:text-clinical-teal-700 transition-colors">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{item.dept}</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      Assigned: {staffInfo.name}
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-clinical-teal-600 group-hover:translate-x-0.5 transition-all" />
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
