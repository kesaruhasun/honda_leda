# PulseOS View Skeletons & Code Blueprints (All 6 Modules)

**Milestone**: M0 (Scaffold & Layout Shell)  
**Author**: Explorer M0-3  
**Directory**: `/Users/admin/Projects/honda_leda/frontend/src/views/`  

---

## 1. `PatientView.tsx` (Module 1 — Dila / IT25103819)

```tsx
import React, { useState } from 'react';
import { Users, AlertCircle, Plus, Search, Filter, Phone, Clock, FileText, Check } from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { Patient, TriagePriority, BloodGroup } from '../types';

const INITIAL_PATIENTS: Patient[] = [
  {
    id: 1,
    patientId: 'PAT-0001',
    nicPassportNo: '198523401234',
    firstName: 'Kalyani',
    lastName: 'Bandara',
    fullName: 'Kalyani Bandara',
    dob: '1985-04-12',
    gender: 'FEMALE',
    bloodGroup: 'O+',
    contactNumber: '0771234567',
    email: 'kalyani.b@gmail.com',
    address: '45/2 Peradeniya Road, Kandy',
    emergencyContactName: 'Sunethra Bandara',
    emergencyContactRelationship: 'Sister',
    emergencyContactPhone: '0777654321',
    registrationDate: '2026-09-10',
    triagePriority: 'EMERGENCY',
    allergies: 'Penicillin, NSAIDs',
    isArchived: false,
  },
  {
    id: 2,
    patientId: 'PAT-0002',
    nicPassportNo: '199267809876',
    firstName: 'Pradeep',
    lastName: 'Jayasinghe',
    fullName: 'Pradeep Jayasinghe',
    dob: '1992-08-23',
    gender: 'MALE',
    bloodGroup: 'B+',
    contactNumber: '0719876543',
    email: 'pradeep.j@yahoo.com',
    address: '12 Temple Road, Maharagama',
    emergencyContactName: 'Nihal Jayasinghe',
    emergencyContactRelationship: 'Brother',
    emergencyContactPhone: '0712345678',
    registrationDate: '2026-09-12',
    triagePriority: 'URGENT',
    allergies: 'None recorded',
    isArchived: false,
  },
  {
    id: 3,
    patientId: 'PAT-0003',
    nicPassportNo: '200178904561',
    firstName: 'Malini',
    lastName: 'Fernando',
    fullName: 'Malini Fernando',
    dob: '2001-11-05',
    gender: 'FEMALE',
    bloodGroup: 'A+',
    contactNumber: '0752345678',
    email: 'malini.f@outlook.com',
    address: '88 Galle Road, Colombo 03',
    emergencyContactName: 'Mary Fernando',
    emergencyContactRelationship: 'Mother',
    emergencyContactPhone: '0759876543',
    registrationDate: '2026-09-13',
    triagePriority: 'ROUTINE',
    allergies: 'Sulfa drugs',
    isArchived: false,
  },
  {
    id: 4,
    patientId: 'PAT-0004',
    nicPassportNo: '197812304567',
    firstName: 'Sarath',
    lastName: 'Wickramasinghe',
    fullName: 'Sarath Wickramasinghe',
    dob: '1978-02-17',
    gender: 'MALE',
    bloodGroup: 'AB+',
    contactNumber: '0763456789',
    address: '104 Kandy Road, Kadawatha',
    emergencyContactName: 'Chitra Wickramasinghe',
    emergencyContactRelationship: 'Spouse',
    emergencyContactPhone: '0768765432',
    registrationDate: '2026-09-14',
    triagePriority: 'ROUTINE',
    allergies: 'None',
    isArchived: false,
  },
];

export const PatientView: React.FC = () => {
  const { showToast } = useToast();
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [triageFilter, setTriageFilter] = useState<string>('ALL');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nicPassportNo: '',
    dob: '',
    gender: 'MALE' as const,
    bloodGroup: 'O+' as BloodGroup,
    contactNumber: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    triagePriority: 'ROUTINE' as TriagePriority,
    allergies: '',
  });

  const filteredPatients = patients.filter((p) => {
    if (p.isArchived) return false;
    const matchesSearch =
      p.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nicPassportNo.includes(searchTerm) ||
      p.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTriage = triageFilter === 'ALL' || p.triagePriority === triageFilter;
    return matchesSearch && matchesTriage;
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.nicPassportNo) {
      showToast('error', 'Validation Error', 'First name, last name, and NIC/Passport are required.');
      return;
    }

    const newPatient: Patient = {
      id: Date.now(),
      patientId: `PAT-${String(patients.length + 1).padStart(4, '0')}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      fullName: `${formData.firstName} ${formData.lastName}`,
      nicPassportNo: formData.nicPassportNo,
      dob: formData.dob || '1990-01-01',
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      contactNumber: formData.contactNumber,
      address: 'Default Registered Address',
      emergencyContactName: formData.emergencyContactName || 'Self',
      emergencyContactRelationship: formData.emergencyContactRelationship || 'Other',
      emergencyContactPhone: formData.emergencyContactPhone || formData.contactNumber,
      registrationDate: new Date().toISOString().split('T')[0],
      triagePriority: formData.triagePriority,
      allergies: formData.allergies || 'None',
      isArchived: false,
    };

    setPatients([newPatient, ...patients]);
    setIsRegisterModalOpen(false);
    showToast('success', 'Patient Registered', `${newPatient.fullName} (${newPatient.patientId}) intake complete.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-clinical-ink tracking-tight">Patient Registry & Triage</h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-clinical-teal-50 text-clinical-teal-700 border border-clinical-teal-200">
              M1: Somarathna P.G.D.S. (IT25103819)
            </span>
          </div>
          <p className="text-xs text-clinical-ink-muted mt-1">
            Demographic intake, triage prioritization, medical alert tracking, and NIC/Passport verification.
          </p>
        </div>
        <button
          onClick={() => setIsRegisterModalOpen(true)}
          className="apple-btn inline-flex items-center gap-2 px-4 py-2 rounded-apple-xl bg-clinical-teal-600 text-white text-xs font-semibold hover:bg-clinical-teal-700 shadow-sm shadow-clinical-teal-600/20"
        >
          <Plus className="h-4 w-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Registered Patients" value={patients.length} subtitle="Active hospital records" icon={Users} variant="teal" />
        <MetricCard
          title="Emergency Priority"
          value={patients.filter((p) => p.triagePriority === 'EMERGENCY').length}
          subtitle="Immediate physician required"
          icon={AlertCircle}
          variant="coral"
        />
        <MetricCard
          title="Urgent Triage"
          value={patients.filter((p) => p.triagePriority === 'URGENT').length}
          subtitle="30-minute target care"
          icon={Clock}
          variant="amber"
        />
        <MetricCard
          title="Routine Intake"
          value={patients.filter((p) => p.triagePriority === 'ROUTINE').length}
          subtitle="Standard consultation queue"
          icon={FileText}
          variant="emerald"
        />
      </div>

      {/* Filters and Search Bar */}
      <div className="apple-card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Name, NIC, or Patient ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-clinical-ink focus:outline-none focus:ring-2 focus:ring-clinical-teal-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-clinical-ink-secondary">Triage:</span>
          <select
            value={triageFilter}
            onChange={(e) => setTriageFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-clinical-ink focus:outline-none"
          >
            <option value="ALL">All Levels</option>
            <option value="EMERGENCY">Emergency</option>
            <option value="URGENT">Urgent</option>
            <option value="ROUTINE">Routine</option>
          </select>
        </div>
      </div>

      {/* Patients Table */}
      <div className="apple-card overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-clinical-ink-secondary font-semibold">
                <th className="py-3 px-4 font-mono">Patient ID</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4 font-mono">NIC / Passport</th>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4">Triage Priority</th>
                <th className="py-3 px-4">Emergency Contact</th>
                <th className="py-3 px-4">Allergies</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-clinical-teal-700">{patient.patientId}</td>
                  <td className="py-3 px-4 font-semibold text-clinical-ink">{patient.fullName}</td>
                  <td className="py-3 px-4 font-mono text-clinical-ink-secondary">{patient.nicPassportNo}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-mono font-semibold text-slate-700 border border-slate-200">
                      {patient.bloodGroup}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={patient.triagePriority === 'EMERGENCY' ? 'emergency' : patient.triagePriority === 'URGENT' ? 'urgent' : 'routine'}>
                      {patient.triagePriority}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-clinical-ink-secondary">
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3 text-slate-400" />
                      <span>{patient.emergencyContactPhone} ({patient.emergencyContactRelationship})</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {patient.allergies && patient.allergies !== 'None' ? (
                      <span className="text-rose-600 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                        {patient.allergies}
                      </span>
                    ) : (
                      <span className="text-slate-400">None</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedPatient(patient)}
                      className="apple-btn text-clinical-teal-600 hover:text-clinical-teal-800 font-semibold px-2 py-1 rounded hover:bg-clinical-teal-50"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Patient Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Register New Patient Encounter"
        subtitle="SLIIT PulseOS Outpatient Intake Form"
        maxWidth="lg"
      >
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-clinical-ink-secondary mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinical-teal-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-clinical-ink-secondary mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinical-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-clinical-ink-secondary mb-1">NIC / Passport Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. 199012345678"
                value={formData.nicPassportNo}
                onChange={(e) => setFormData({ ...formData, nicPassportNo: e.target.value })}
                className="w-full text-xs font-mono p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinical-teal-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-clinical-ink-secondary mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinical-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-clinical-ink-secondary mb-1">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value as BloodGroup })}
                className="w-full text-xs font-mono p-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-clinical-ink-secondary mb-1">Triage Priority</label>
              <select
                value={formData.triagePriority}
                onChange={(e) => setFormData({ ...formData, triagePriority: e.target.value as TriagePriority })}
                className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="ROUTINE">Routine</option>
                <option value="URGENT">Urgent</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-clinical-ink-secondary mb-1">Contact Phone</label>
              <input
                type="tel"
                placeholder="077XXXXXXX"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                className="w-full text-xs font-mono p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-clinical-ink-secondary mb-1">Emergency Contact Name</label>
              <input
                type="text"
                placeholder="Next of Kin"
                value={formData.emergencyContactName}
                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-clinical-ink-secondary mb-1">Emergency Phone</label>
              <input
                type="tel"
                placeholder="07XXXXXXXX"
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                className="w-full text-xs font-mono p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-clinical-ink-secondary mb-1">Known Allergies / Warnings</label>
            <input
              type="text"
              placeholder="e.g. Penicillin, Aspirin"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(false)}
              className="apple-btn px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="apple-btn px-4 py-2 text-xs font-semibold bg-clinical-teal-600 text-white rounded-lg hover:bg-clinical-teal-700 shadow-sm"
            >
              Register Patient
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      {selectedPatient && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPatient(null)}
          title={`Patient File: ${selectedPatient.fullName}`}
          subtitle={`PulseOS Clinical Record ${selectedPatient.patientId}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">NIC / PASSPORT</span>
                <span className="font-bold text-clinical-ink">{selectedPatient.nicPassportNo}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">BLOOD GROUP</span>
                <span className="font-bold text-rose-600">{selectedPatient.bloodGroup}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">DATE OF BIRTH</span>
                <span className="text-clinical-ink">{selectedPatient.dob}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">INTAKE DATE</span>
                <span className="text-clinical-ink">{selectedPatient.registrationDate}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
              <span className="font-bold block text-[11px] mb-0.5">Clinical Allergies & Warnings:</span>
              <p>{selectedPatient.allergies || 'No known allergies reported.'}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPatient(null)}
                className="apple-btn px-4 py-2 text-xs font-semibold bg-slate-800 text-white rounded-lg"
              >
                Close File
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
```

---

## 2. `DoctorView.tsx` (Module 2 — Kavinda / IT25103999)

```tsx
import React, { useState } from 'react';
import { Stethoscope, CheckCircle, Clock, Calendar, DollarSign, ToggleLeft, ToggleRight, Building } from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { Doctor } from '../types';

const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 1,
    employeeId: 'DOC-101',
    licenseNo: 'SLMC-78901',
    firstName: 'Kavinda',
    lastName: 'Rathnayaka',
    fullName: 'Dr. Kavinda Rathnayaka',
    specialization: 'Cardiology',
    departmentName: 'Department of Cardiology',
    consultationFee: 2500,
    roomNumber: 'Consultation Suite 102',
    isAvailable: true,
    contactNumber: '0714567890',
    email: 'kavinda.r@pulseos.sliit.lk',
    weeklySchedule: 'Mon, Wed, Fri (08:30 - 14:00)',
  },
  {
    id: 2,
    employeeId: 'DOC-102',
    licenseNo: 'SLMC-82341',
    firstName: 'Chamari',
    lastName: 'Perera',
    fullName: 'Dr. Chamari Perera',
    specialization: 'Neurology',
    departmentName: 'Department of Neurology',
    consultationFee: 3000,
    roomNumber: 'Suite 204',
    isAvailable: true,
    contactNumber: '0772345678',
    email: 'chamari.p@pulseos.sliit.lk',
    weeklySchedule: 'Tue, Thu, Sat (09:00 - 15:00)',
  },
  {
    id: 3,
    employeeId: 'DOC-103',
    licenseNo: 'SLMC-65432',
    firstName: 'Ruwan',
    lastName: 'Alwis',
    fullName: 'Dr. Ruwan Alwis',
    specialization: 'Pediatrics',
    departmentName: 'Department of Pediatrics',
    consultationFee: 2200,
    roomNumber: 'Suite 105',
    isAvailable: true,
    contactNumber: '0761234567',
    email: 'ruwan.a@pulseos.sliit.lk',
    weeklySchedule: 'Mon - Fri (10:00 - 16:00)',
  },
  {
    id: 4,
    employeeId: 'DOC-104',
    licenseNo: 'SLMC-91283',
    firstName: 'Niluka',
    lastName: 'Senaratne',
    fullName: 'Dr. Niluka Senaratne',
    specialization: 'Orthopedics',
    departmentName: 'Department of Orthopedics',
    consultationFee: 2800,
    roomNumber: 'Suite 301',
    isAvailable: false,
    contactNumber: '0783456789',
    email: 'niluka.s@pulseos.sliit.lk',
    weeklySchedule: 'Wed, Sat (13:00 - 18:00)',
  },
];

export const DoctorView: React.FC = () => {
  const { showToast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [scheduleModalDoctor, setScheduleModalDoctor] = useState<Doctor | null>(null);

  const departments = ['ALL', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics'];

  const toggleAvailability = (id: number) => {
    setDoctors(
      doctors.map((doc) => {
        if (doc.id === id) {
          const nextStatus = !doc.isAvailable;
          showToast(
            nextStatus ? 'success' : 'warning',
            'Duty Status Updated',
            `${doc.fullName} is now ${nextStatus ? 'ON DUTY' : 'OFF DUTY'}.`
          );
          return { ...doc, isAvailable: nextStatus };
        }
        return doc;
      })
    );
  };

  const filteredDoctors = doctors.filter((doc) =>
    selectedDept === 'ALL' ? true : doc.specialization === selectedDept
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-clinical-ink tracking-tight">Physician Directory & Rostering</h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-clinical-teal-50 text-clinical-teal-700 border border-clinical-teal-200">
              M2: Rathnayaka R.M.K.L.B. (IT25103999)
            </span>
          </div>
          <p className="text-xs text-clinical-ink-muted mt-1">
            Consultant profiles, medical license tracking, consultation fee configuration, and real-time duty toggles.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Physicians" value={doctors.length} subtitle="Accredited consultants" icon={Stethoscope} variant="teal" />
        <MetricCard
          title="On-Duty Now"
          value={doctors.filter((d) => d.isAvailable).length}
          subtitle="Accepting consultations"
          icon={CheckCircle}
          variant="emerald"
        />
        <MetricCard title="Specialty Clinics" value={departments.length - 1} subtitle="Clinical departments" icon={Building} variant="slate" />
        <MetricCard title="Base Fee Rate" value="Rs. 2,500" subtitle="Average outpatient charge" icon={DollarSign} variant="amber" />
      </div>

      {/* Department Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`apple-btn px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedDept === dept
                ? 'bg-clinical-teal-600 text-white shadow-sm'
                : 'bg-white text-clinical-ink-secondary border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {dept === 'ALL' ? 'All Specializations' : dept}
          </button>
        ))}
      </div>

      {/* Doctor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {filteredDoctors.map((doc) => (
          <div key={doc.id} className="apple-card p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-clinical-teal-50 border border-clinical-teal-200 text-clinical-teal-700 flex items-center justify-center font-bold text-sm">
                  {doc.firstName[0]}{doc.lastName[0]}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-clinical-ink">{doc.fullName}</h3>
                  <p className="text-xs font-medium text-clinical-teal-700">{doc.specialization}</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">SLMC: {doc.licenseNo} • {doc.employeeId}</p>
                </div>
              </div>
              <button
                onClick={() => toggleAvailability(doc.id)}
                className="apple-btn flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors"
                style={{
                  backgroundColor: doc.isAvailable ? '#ECFDF5' : '#F1F5F9',
                  color: doc.isAvailable ? '#047857' : '#64748B',
                  borderColor: doc.isAvailable ? '#A7F3D0' : '#CBD5E1',
                }}
              >
                {doc.isAvailable ? <ToggleRight className="h-4 w-4 text-emerald-600" /> : <ToggleLeft className="h-4 w-4 text-slate-400" />}
                <span>{doc.isAvailable ? 'ON DUTY' : 'OFF DUTY'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-slate-50 border border-slate-200/60 font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">CONSULTATION FEE</span>
                <span className="font-bold text-clinical-ink">Rs. {doc.consultationFee.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">LOCATION</span>
                <span className="font-semibold text-clinical-ink">{doc.roomNumber}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-clinical-ink-muted text-[11px] truncate max-w-[200px]">
                {doc.weeklySchedule || 'Mon - Fri on schedule'}
              </span>
              <button
                onClick={() => setScheduleModalDoctor(doc)}
                className="apple-btn text-clinical-teal-600 hover:text-clinical-teal-800 font-semibold text-xs flex items-center gap-1"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Roster Schedule</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Modal */}
      {scheduleModalDoctor && (
        <Modal
          isOpen={true}
          onClose={() => setScheduleModalDoctor(null)}
          title={`Weekly Roster: ${scheduleModalDoctor.fullName}`}
          subtitle={`${scheduleModalDoctor.specialization} • ${scheduleModalDoctor.roomNumber}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 font-mono">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="font-semibold">Monday</span>
                <span>08:30 - 13:30 (Clinic A)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="font-semibold">Wednesday</span>
                <span>08:30 - 13:30 (Clinic A)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="font-semibold">Friday</span>
                <span>09:00 - 14:00 (Special Procedures)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-semibold">Saturday</span>
                <span className="text-clinical-ink-muted">On-Call Emergency Rotation</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setScheduleModalDoctor(null)}
                className="apple-btn px-4 py-2 text-xs font-semibold bg-clinical-teal-600 text-white rounded-lg"
              >
                Close Roster
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
```

---

## 3. `AppointmentView.tsx` (Module 3 — Chanul / IT25101620)

```tsx
import React, { useState } from 'react';
import { CalendarCheck, ShieldAlert, Plus, CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { Appointment, AppointmentStatus } from '../types';

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    appointmentId: 'APT-2026-001',
    patientId: 1,
    patientName: 'Kalyani Bandara',
    patientNic: '198523401234',
    doctorId: 1,
    doctorName: 'Dr. Kavinda Rathnayaka',
    specialization: 'Cardiology',
    appointmentDate: '2026-09-14',
    appointmentTime: '09:00',
    status: 'CONFIRMED',
    reasonForVisit: 'Hypertension follow-up and ECG check',
    roomNumber: 'Room 102',
    createdAt: '2026-09-12T10:00:00Z',
  },
  {
    id: 2,
    appointmentId: 'APT-2026-002',
    patientId: 2,
    patientName: 'Pradeep Jayasinghe',
    patientNic: '199267809876',
    doctorId: 2,
    doctorName: 'Dr. Chamari Perera',
    specialization: 'Neurology',
    appointmentDate: '2026-09-14',
    appointmentTime: '10:30',
    status: 'SCHEDULED',
    reasonForVisit: 'Chronic migraine and visual auras',
    roomNumber: 'Room 204',
    createdAt: '2026-09-13T14:30:00Z',
  },
  {
    id: 3,
    appointmentId: 'APT-2026-003',
    patientId: 3,
    patientName: 'Malini Fernando',
    patientNic: '200178904561',
    doctorId: 1,
    doctorName: 'Dr. Kavinda Rathnayaka',
    specialization: 'Cardiology',
    appointmentDate: '2026-09-14',
    appointmentTime: '11:00',
    status: 'SCHEDULED',
    reasonForVisit: 'Routine pre-employment cardiac clearance',
    roomNumber: 'Room 102',
    createdAt: '2026-09-13T16:00:00Z',
  },
  {
    id: 4,
    appointmentId: 'APT-2026-004',
    patientId: 4,
    patientName: 'Sarath Wickramasinghe',
    patientNic: '197812304567',
    doctorId: 3,
    doctorName: 'Dr. Ruwan Alwis',
    specialization: 'Pediatrics',
    appointmentDate: '2026-09-14',
    appointmentTime: '14:00',
    status: 'COMPLETED',
    reasonForVisit: 'Child seasonal asthma review',
    roomNumber: 'Room 105',
    createdAt: '2026-09-10T09:15:00Z',
  },
];

export const AppointmentView: React.FC = () => {
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  // Booking Form State
  const [bookDoctorId, setBookDoctorId] = useState<number>(1);
  const [bookPatientName, setBookPatientName] = useState('');
  const [bookPatientNic, setBookPatientNic] = useState('');
  const [bookDate, setBookDate] = useState('2026-09-14');
  const [bookTime, setBookTime] = useState('09:00');
  const [bookReason, setBookReason] = useState('');

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();

    // DOUBLE-BOOKING INVARIANT CHECK
    const conflict = appointments.find(
      (apt) =>
        apt.doctorId === bookDoctorId &&
        apt.appointmentDate === bookDate &&
        apt.appointmentTime === bookTime &&
        apt.status !== 'CANCELLED'
    );

    if (conflict) {
      showToast(
        'error',
        'Double-Booking Conflict Rejected',
        `Slot ${bookDate} at ${bookTime} is already reserved by ${conflict.patientName} (${conflict.appointmentId}). Select a different time.`
      );
      return;
    }

    const doctorNames: Record<number, { name: string; spec: string; room: string }> = {
      1: { name: 'Dr. Kavinda Rathnayaka', spec: 'Cardiology', room: 'Room 102' },
      2: { name: 'Dr. Chamari Perera', spec: 'Neurology', room: 'Room 204' },
      3: { name: 'Dr. Ruwan Alwis', spec: 'Pediatrics', room: 'Room 105' },
    };

    const docInfo = doctorNames[bookDoctorId] || doctorNames[1];

    const newApt: Appointment = {
      id: Date.now(),
      appointmentId: `APT-2026-${String(appointments.length + 1).padStart(3, '0')}`,
      patientId: 99,
      patientName: bookPatientName || 'New Patient',
      patientNic: bookPatientNic || '200012345678',
      doctorId: bookDoctorId,
      doctorName: docInfo.name,
      specialization: docInfo.spec,
      appointmentDate: bookDate,
      appointmentTime: bookTime,
      status: 'SCHEDULED',
      reasonForVisit: bookReason || 'General Consultation',
      roomNumber: docInfo.room,
      createdAt: new Date().toISOString(),
    };

    setAppointments([newApt, ...appointments]);
    setIsBookModalOpen(false);
    showToast('success', 'Appointment Confirmed', `${newApt.appointmentId} booked with ${docInfo.name} at ${bookTime}.`);
  };

  const updateStatus = (id: number, newStatus: AppointmentStatus) => {
    setAppointments(
      appointments.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
    );
    showToast('info', 'Status Updated', `Appointment ${id} moved to ${newStatus}.`);
  };

  const filteredAppointments = appointments.filter((apt) =>
    statusFilter === 'ALL' ? true : apt.status === statusFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-clinical-ink tracking-tight">Appointment Scheduler</h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-clinical-teal-50 text-clinical-teal-700 border border-clinical-teal-200">
              M3: Malwatta M.W.C.S (IT25101620)
            </span>
          </div>
          <p className="text-xs text-clinical-ink-muted mt-1">
            Consultation slot reservation with strict double-booking conflict prevention and encounter lifecycle tracking.
          </p>
        </div>
        <button
          onClick={() => setIsBookModalOpen(true)}
          className="apple-btn inline-flex items-center gap-2 px-4 py-2 rounded-apple-xl bg-clinical-teal-600 text-white text-xs font-semibold hover:bg-clinical-teal-700 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Book Consultation Slot</span>
        </button>
      </div>

      {/* Double Booking Invariant Banner */}
      <div className="p-3.5 rounded-apple-xl bg-clinical-teal-50/80 border border-clinical-teal-200/80 flex items-start gap-3 text-xs">
        <ShieldAlert className="h-5 w-5 text-clinical-teal-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-clinical-teal-900 block">Strict Conflict Prevention Active</span>
          <p className="text-clinical-teal-800 text-[11px] mt-0.5 leading-relaxed">
            The system enforces a composite unique constraint across <code className="font-mono bg-clinical-teal-100 px-1 py-0.5 rounded">(doctor_id, appointment_date, appointment_time)</code>. Any overlapping slot request is rejected immediately.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Today's Appointments" value={appointments.length} subtitle="14 Sep 2026 Schedule" icon={CalendarCheck} variant="teal" />
        <MetricCard
          title="Confirmed Slots"
          value={appointments.filter((a) => a.status === 'CONFIRMED').length}
          subtitle="Patient arrived / checked in"
          icon={CheckCircle2}
          variant="emerald"
        />
        <MetricCard
          title="Scheduled Pending"
          value={appointments.filter((a) => a.status === 'SCHEDULED').length}
          subtitle="Awaiting intake check-in"
          icon={Clock}
          variant="amber"
        />
        <MetricCard
          title="Completed Consults"
          value={appointments.filter((a) => a.status === 'COMPLETED').length}
          subtitle="Encounter finalized"
          icon={CheckCircle2}
          variant="slate"
        />
      </div>

      {/* Table & Filters */}
      <div className="apple-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-xs text-clinical-ink">Appointments Master Roster</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-clinical-ink-secondary">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-clinical-ink"
            >
              <option value="ALL">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-clinical-ink-secondary font-semibold border-b border-slate-200">
                <th className="py-3 px-4 font-mono">Appt ID</th>
                <th className="py-3 px-4 font-mono">Time</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Physician</th>
                <th className="py-3 px-4">Reason for Visit</th>
                <th className="py-3 px-4">Room</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-clinical-teal-700">{apt.appointmentId}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-clinical-ink">{apt.appointmentTime}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-clinical-ink">{apt.patientName}</div>
                    <div className="text-[10px] font-mono text-slate-400">NIC: {apt.patientNic}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-clinical-ink">{apt.doctorName}</div>
                    <div className="text-[10px] text-clinical-teal-600">{apt.specialization}</div>
                  </td>
                  <td className="py-3 px-4 text-clinical-ink-secondary max-w-xs truncate">{apt.reasonForVisit}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{apt.roomNumber}</td>
                  <td className="py-3 px-4">
                    <Badge variant={apt.status === 'CONFIRMED' ? 'success' : apt.status === 'SCHEDULED' ? 'warning' : apt.status === 'COMPLETED' ? 'neutral' : 'emergency'}>
                      {apt.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {apt.status === 'SCHEDULED' && (
                        <button
                          onClick={() => updateStatus(apt.id, 'CONFIRMED')}
                          className="apple-btn text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded hover:bg-emerald-100"
                        >
                          Confirm
                        </button>
                      )}
                      {apt.status === 'CONFIRMED' && (
                        <button
                          onClick={() => updateStatus(apt.id, 'COMPLETED')}
                          className="apple-btn text-[11px] font-semibold text-clinical-teal-600 bg-clinical-teal-50 px-2 py-1 rounded hover:bg-clinical-teal-100"
                        >
                          Complete
                        </button>
                      )}
                      {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                        <button
                          onClick={() => updateStatus(apt.id, 'CANCELLED')}
                          className="apple-btn text-[11px] font-semibold text-rose-600 hover:text-rose-800 px-1.5 py-1"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Slot Modal */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Schedule Outpatient Consultation"
        subtitle="Live Doctor Availability & Conflict Check"
      >
        <form onSubmit={handleBookAppointment} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-clinical-ink mb-1">Attending Physician *</label>
            <select
              value={bookDoctorId}
              onChange={(e) => setBookDoctorId(Number(e.target.value))}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
            >
              <option value={1}>Dr. Kavinda Rathnayaka (Cardiology - Fee: Rs. 2,500)</option>
              <option value={2}>Dr. Chamari Perera (Neurology - Fee: Rs. 3,000)</option>
              <option value={3}>Dr. Ruwan Alwis (Pediatrics - Fee: Rs. 2,200)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-clinical-ink mb-1">Patient Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Bandara K."
                value={bookPatientName}
                onChange={(e) => setBookPatientName(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-clinical-ink mb-1">Patient NIC / Passport *</label>
              <input
                type="text"
                required
                placeholder="e.g. 198523401234"
                value={bookPatientNic}
                onChange={(e) => setBookPatientNic(e.target.value)}
                className="w-full p-2 font-mono bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-clinical-ink mb-1">Appointment Date *</label>
              <input
                type="date"
                required
                value={bookDate}
                onChange={(e) => setBookDate(e.target.value)}
                className="w-full p-2 font-mono bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-clinical-ink mb-1">Consultation Time Slot *</label>
              <select
                value={bookTime}
                onChange={(e) => setBookTime(e.target.value)}
                className="w-full p-2 font-mono bg-slate-50 border border-slate-200 rounded-lg font-semibold"
              >
                <option value="09:00">09:00 AM (Slot 1)</option>
                <option value="09:30">09:30 AM (Slot 2)</option>
                <option value="10:00">10:00 AM (Slot 3)</option>
                <option value="10:30">10:30 AM (Slot 4)</option>
                <option value="11:00">11:00 AM (Slot 5)</option>
                <option value="14:00">02:00 PM (Afternoon Slot)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-clinical-ink mb-1">Reason for Consultation</label>
            <input
              type="text"
              placeholder="e.g. Chest tightness, blood pressure follow-up"
              value={bookReason}
              onChange={(e) => setBookReason(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsBookModalOpen(false)}
              className="apple-btn px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="apple-btn px-4 py-2 font-semibold bg-clinical-teal-600 text-white rounded-lg hover:bg-clinical-teal-700 shadow-sm"
            >
              Verify Slot & Confirm
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
```

---

## 4. `PharmacyView.tsx` (Module 4 — Harshika / IT25100826)

```tsx
import React, { useState } from 'react';
import { Pill, AlertTriangle, CheckCircle, PackagePlus, ArrowDownRight, Search } from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { Badge } from '../components/common/Badge';
import { useToast } from '../context/ToastContext';
import { Drug, Prescription } from '../types';

const INITIAL_DRUGS: Drug[] = [
  {
    id: 1,
    drugId: 'DRG-1001',
    drugName: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin Trihydrate',
    category: 'Antibiotic',
    dosageForm: 'Capsule',
    unitPrice: 35.0,
    stockQuantity: 450,
    reorderLevel: 100,
    batchNumber: 'BATCH-AMX-26A',
    expiryDate: '2027-05-30',
  },
  {
    id: 2,
    drugId: 'DRG-1002',
    drugName: 'Paracetamol 500mg',
    genericName: 'Acetaminophen',
    category: 'Analgesic',
    dosageForm: 'Tablet',
    unitPrice: 5.0,
    stockQuantity: 1200,
    reorderLevel: 250,
    batchNumber: 'BATCH-PCM-26C',
    expiryDate: '2027-12-31',
  },
  {
    id: 3,
    drugId: 'DRG-1003',
    drugName: 'Atorvastatin 20mg',
    genericName: 'Atorvastatin Calcium',
    category: 'Cardiovascular',
    dosageForm: 'Tablet',
    unitPrice: 42.5,
    stockQuantity: 45, // BELOW REORDER LEVEL!
    reorderLevel: 60,
    batchNumber: 'BATCH-ATV-25X',
    expiryDate: '2026-11-15',
  },
  {
    id: 4,
    drugId: 'DRG-1004',
    drugName: 'Metformin 850mg',
    genericName: 'Metformin Hydrochloride',
    category: 'Antidiabetic',
    dosageForm: 'Tablet',
    unitPrice: 18.0,
    stockQuantity: 18, // CRITICAL LOW STOCK!
    reorderLevel: 50,
    batchNumber: 'BATCH-MET-25Z',
    expiryDate: '2026-10-30',
  },
  {
    id: 5,
    drugId: 'DRG-1005',
    drugName: 'Cetirizine 10mg',
    genericName: 'Cetirizine Dihydrochloride',
    category: 'Antihistamine',
    dosageForm: 'Tablet',
    unitPrice: 12.0,
    stockQuantity: 320,
    reorderLevel: 80,
    batchNumber: 'BATCH-CET-27B',
    expiryDate: '2027-08-20',
  },
];

const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 1,
    prescriptionId: 'RX-2026-001',
    appointmentId: 1,
    patientId: 1,
    patientName: 'Kalyani Bandara',
    doctorId: 1,
    doctorName: 'Dr. Kavinda Rathnayaka',
    prescriptionDate: '2026-09-14',
    doctorInstructions: 'Take Atorvastatin at bedtime. Avoid grapefruit.',
    status: 'PENDING',
    items: [
      {
        drugId: 3,
        drugName: 'Atorvastatin 20mg',
        dosageFrequency: '1 tab nocte for 30 days',
        durationDays: 30,
        prescribedQty: 30,
        dispensedQty: 0,
        unitPrice: 42.5,
      },
    ],
  },
  {
    id: 2,
    prescriptionId: 'RX-2026-002',
    appointmentId: 2,
    patientId: 2,
    patientName: 'Pradeep Jayasinghe',
    doctorId: 2,
    doctorName: 'Dr. Chamari Perera',
    prescriptionDate: '2026-09-14',
    doctorInstructions: 'Take Paracetamol as needed for severe headache.',
    status: 'PENDING',
    items: [
      {
        drugId: 2,
        drugName: 'Paracetamol 500mg',
        dosageFrequency: '2 tabs QDS PRN',
        durationDays: 5,
        prescribedQty: 20,
        dispensedQty: 0,
        unitPrice: 5.0,
      },
    ],
  },
];

export const PharmacyView: React.FC = () => {
  const { showToast } = useToast();
  const [drugs, setDrugs] = useState<Drug[]>(INITIAL_DRUGS);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(INITIAL_PRESCRIPTIONS);
  const [searchTerm, setSearchTerm] = useState('');

  // ATOMIC DISPENSE & STOCK DEDUCTION INVARIANT
  const handleDispense = (prescriptionId: number) => {
    const rx = prescriptions.find((p) => p.id === prescriptionId);
    if (!rx) return;

    // Check stock availability for all items
    for (const item of rx.items) {
      const drug = drugs.find((d) => d.id === item.drugId);
      if (!drug || drug.stockQuantity < item.prescribedQty) {
        showToast(
          'error',
          'Stock Depletion Block',
          `Cannot dispense ${item.drugName}. Available: ${drug ? drug.stockQuantity : 0}, Required: ${item.prescribedQty}.`
        );
        return;
      }
    }

    // Deduct stock
    setDrugs((prevDrugs) =>
      prevDrugs.map((d) => {
        const item = rx.items.find((i) => i.drugId === d.id);
        if (item) {
          const newStock = d.stockQuantity - item.prescribedQty;
          return { ...d, stockQuantity: newStock };
        }
        return d;
      })
    );

    // Update Rx status
    setPrescriptions((prevRx) =>
      prevRx.map((p) => (p.id === prescriptionId ? { ...p, status: 'DISPENSED' } : p))
    );

    showToast(
      'success',
      'Prescription Dispensed',
      `Prescription ${rx.prescriptionId} fulfilled. Inventory atomically decremented in database.`
    );
  };

  const lowStockCount = drugs.filter((d) => d.stockQuantity <= d.reorderLevel).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-clinical-ink tracking-tight">Pharmacy & Drug Inventory</h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-clinical-teal-50 text-clinical-teal-700 border border-clinical-teal-200">
              M4: Udumullage S.H.U. (IT25100826)
            </span>
          </div>
          <p className="text-xs text-clinical-ink-muted mt-1">
            Formulary batch tracking, automated low-stock reorder alerts, and real-time prescription dispensing decrement.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Catalog Formulary" value={drugs.length} subtitle="Active medical preparations" icon={Pill} variant="teal" />
        <MetricCard
          title="Low-Stock Alerts"
          value={lowStockCount}
          subtitle="Below reorder threshold"
          icon={AlertTriangle}
          variant="amber"
          delta={{ value: `${lowStockCount} items critical`, isPositive: false }}
        />
        <MetricCard
          title="Pending Dispenses"
          value={prescriptions.filter((p) => p.status === 'PENDING').length}
          subtitle="Patient queue at counter"
          icon={ArrowDownRight}
          variant="coral"
        />
        <MetricCard
          title="Dispensed Today"
          value={prescriptions.filter((p) => p.status === 'DISPENSED').length}
          subtitle="Fulfilled prescription regimens"
          icon={CheckCircle}
          variant="emerald"
        />
      </div>

      {/* Prescription Dispensing Queue Section */}
      <div className="apple-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-xs text-clinical-ink">Active Prescription Dispense Queue</h2>
            <Badge variant="urgent">Counter Ready</Badge>
          </div>
          <span className="text-[11px] text-clinical-ink-muted font-mono">2 Prescriptions Awaiting</span>
        </div>

        <div className="space-y-3">
          {prescriptions.map((rx) => (
            <div
              key={rx.id}
              className={`p-3.5 rounded-xl border transition-all ${
                rx.status === 'DISPENSED'
                  ? 'bg-slate-50 border-slate-200/60 opacity-60'
                  : 'bg-white border-clinical-teal-200 shadow-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-clinical-teal-700">{rx.prescriptionId}</span>
                    <span className="text-xs font-semibold text-clinical-ink">• Patient: {rx.patientName}</span>
                    <span className="text-[10px] text-slate-400">({rx.doctorName})</span>
                  </div>
                  <p className="text-[11px] text-clinical-ink-muted mt-0.5">{rx.doctorInstructions}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-xs font-mono">
                    {rx.items.map((i) => (
                      <div key={i.drugId} className="text-slate-700 font-semibold">
                        {i.drugName} × {i.prescribedQty}
                      </div>
                    ))}
                  </div>

                  {rx.status === 'PENDING' ? (
                    <button
                      onClick={() => handleDispense(rx.id)}
                      className="apple-btn px-3 py-1.5 rounded-lg bg-clinical-teal-600 text-white text-xs font-semibold hover:bg-clinical-teal-700 shadow-sm"
                    >
                      Dispense & Deduct Stock
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[11px] font-bold">
                      DISPENSED
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drug Inventory Table */}
      <div className="apple-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-xs text-clinical-ink">Central Formulary & Batch Inventory</span>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search drug or batch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-clinical-ink-secondary font-semibold">
                <th className="py-3 px-4 font-mono">Drug ID</th>
                <th className="py-3 px-4">Name & Generic</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 font-mono">Batch No</th>
                <th className="py-3 px-4 font-mono">Expiry</th>
                <th className="py-3 px-4 font-mono">Unit Price</th>
                <th className="py-3 px-4 font-mono">Stock Level</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {drugs
                .filter((d) => d.drugName.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((drug) => {
                  const isLow = drug.stockQuantity <= drug.reorderLevel;
                  const percent = Math.min(100, Math.round((drug.stockQuantity / (drug.reorderLevel * 3)) * 100));

                  return (
                    <tr key={drug.id} className={isLow ? 'bg-amber-50/40' : 'hover:bg-slate-50/60'}>
                      <td className="py-3 px-4 font-mono font-bold text-clinical-teal-700">{drug.drugId}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-clinical-ink">{drug.drugName}</div>
                        <div className="text-[10px] text-slate-400">{drug.genericName} ({drug.dosageForm})</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-600 border border-slate-200">
                          {drug.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{drug.batchNumber}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{drug.expiryDate}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-clinical-ink">Rs. {drug.unitPrice.toFixed(2)}</td>
                      <td className="py-3 px-4 font-mono">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isLow ? 'text-amber-600' : 'text-slate-700'}`}>
                            {drug.stockQuantity}
                          </span>
                          <span className="text-[10px] text-slate-400">/ min {drug.reorderLevel}</span>
                        </div>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full ${isLow ? 'bg-amber-500' : 'bg-clinical-teal-500'}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {isLow ? (
                          <Badge variant="warning">Low Stock</Badge>
                        ) : (
                          <Badge variant="success">Normal</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
```

---

## 5. `BillingView.tsx` (Module 5 — Kesaru / IT25103992)

```tsx
import React, { useState } from 'react';
import { Receipt, CreditCard, DollarSign, CheckCircle2, AlertCircle, Printer, ExternalLink, ShieldCheck } from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { Invoice } from '../types';

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 1,
    invoiceId: 'INV-2026-001',
    patientId: 1,
    patientName: 'Kalyani Bandara',
    patientNic: '198523401234',
    appointmentId: 1,
    billingDate: '2026-09-14',
    doctorFee: 2500.0,
    pharmacyFee: 1275.0, // 30 tabs Atorvastatin
    labFee: 1800.0,      // Serum Lipid Profile
    taxAmount: 139.38,   // 2.5% hospital levy
    totalAmount: 5714.38,
    status: 'PENDING',
    items: [
      { description: 'Dr. Kavinda Rathnayaka - Cardiology Consultation', category: 'CONSULTATION', unitPrice: 2500, quantity: 1, totalPrice: 2500 },
      { description: 'Atorvastatin 20mg (30 Tablets)', category: 'PHARMACY', unitPrice: 42.5, quantity: 30, totalPrice: 1275 },
      { description: 'Lipid Profile Blood Test', category: 'LAB_TEST', unitPrice: 1800, quantity: 1, totalPrice: 1800 },
    ],
  },
  {
    id: 2,
    invoiceId: 'INV-2026-002',
    patientId: 2,
    patientName: 'Pradeep Jayasinghe',
    patientNic: '199267809876',
    appointmentId: 2,
    billingDate: '2026-09-14',
    doctorFee: 3000.0,
    pharmacyFee: 100.0,
    labFee: 0.0,
    taxAmount: 77.5,
    totalAmount: 3177.5,
    status: 'PAID',
    paymentMethod: 'PAYHERE',
    transactionRef: 'PH-SANDBOX-987623',
    paidAt: '2026-09-14T09:45:00Z',
    items: [
      { description: 'Dr. Chamari Perera - Neurology Consultation', category: 'CONSULTATION', unitPrice: 3000, quantity: 1, totalPrice: 3000 },
      { description: 'Paracetamol 500mg (20 Tablets)', category: 'PHARMACY', unitPrice: 5.0, quantity: 20, totalPrice: 100 },
    ],
  },
];

export const BillingView: React.FC = () => {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // PayHere Sandbox Checkout Workflow
  const handlePayHereCheckout = (invoice: Invoice) => {
    showToast('info', 'Opening PayHere Sandbox', `Connecting to sandbox.payhere.lk for ${invoice.invoiceId}...`);

    // In a live browser window with PayHere SDK:
    const payment = {
      sandbox: true,
      merchant_id: '1220000',
      return_url: 'http://localhost:5173/billing',
      cancel_url: 'http://localhost:5173/billing',
      notify_url: 'http://localhost:8080/api/v1/payments/payhere/notify',
      order_id: invoice.invoiceId,
      items: `PulseOS Medical Invoice ${invoice.invoiceId}`,
      amount: invoice.totalAmount.toFixed(2),
      currency: 'LKR',
      hash: 'B37A98F1D2C90E...', // Generated by backend
      first_name: invoice.patientName.split(' ')[0],
      last_name: invoice.patientName.split(' ')[1] || 'Patient',
      email: 'finance@pulseos.sliit.lk',
      phone: '0771234567',
      address: 'SLIIT Malabe Campus',
      city: 'Malabe',
      country: 'Sri Lanka',
    };

    if (typeof (window as unknown as { payhere?: { startPayment: (p: unknown) => void } }).payhere !== 'undefined') {
      const ph = (window as unknown as { payhere: { startPayment: (p: unknown) => void; onCompleted: (id: string) => void } }).payhere;
      ph.onCompleted = (orderId: string) => {
        setInvoices((prev) =>
          prev.map((inv) =>
            inv.invoiceId === orderId
              ? { ...inv, status: 'PAID', paymentMethod: 'PAYHERE', transactionRef: `PH-${Date.now()}` }
              : inv
          )
        );
        showToast('success', 'PayHere Payment Succeeded', `Invoice ${orderId} marked as PAID via PayHere Sandbox.`);
      };
      ph.startPayment(payment);
    } else {
      // Fallback sandbox simulation for local offline demo
      setTimeout(() => {
        setInvoices((prev) =>
          prev.map((inv) =>
            inv.id === invoice.id
              ? { ...inv, status: 'PAID', paymentMethod: 'PAYHERE', transactionRef: `PH-SIM-${Date.now()}` }
              : inv
          )
        );
        showToast('success', 'Sandbox Payment Simulated', `Invoice ${invoice.invoiceId} successfully settled in sandbox.`);
      }, 1200);
    }
  };

  const handleCounterSettle = (invoiceId: number, method: 'CASH' | 'CARD') => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? { ...inv, status: 'PAID', paymentMethod: method, transactionRef: `COUNTER-${Date.now()}` }
          : inv
      )
    );
    showToast('success', 'Counter Settlement Complete', `Invoice settled via ${method}. Receipt generated.`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-clinical-ink tracking-tight">Billing, Invoices & PayHere</h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-clinical-teal-50 text-clinical-teal-700 border border-clinical-teal-200">
              M5: Dhanasinghe K.A.K.H. (IT25103992)
            </span>
          </div>
          <p className="text-xs text-clinical-ink-muted mt-1">
            Automated invoice aggregation (Doctor + Pharmacy + Lab) with live PayHere Sandbox & counter settlement.
          </p>
        </div>
      </div>

      {/* PayHere Sandbox Active Badge */}
      <div className="p-3.5 rounded-apple-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold text-emerald-900">PayHere Sandbox Integration Active</span>
            <span className="text-emerald-700 text-[11px] block mt-0.5">
              Merchant ID: <code className="font-mono bg-emerald-100 px-1 py-0.5 rounded">1220000</code> • Currency: LKR (Sri Lankan Rupee)
            </span>
          </div>
        </div>
        <a
          href="https://sandbox.payhere.lk"
          target="_blank"
          rel="noopener noreferrer"
          className="apple-btn text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
        >
          <span>PayHere Portal</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Invoiced" value="Rs. 8,891.88" subtitle="Today's aggregate billings" icon={Receipt} variant="teal" />
        <MetricCard title="Settled Revenue" value="Rs. 3,177.50" subtitle="Paid invoices" icon={CheckCircle2} variant="emerald" />
        <MetricCard title="Outstanding Balance" value="Rs. 5,714.38" subtitle="Pending settlement" icon={AlertCircle} variant="coral" />
        <MetricCard title="Counter Gateway" value="PayHere + Cash" subtitle="Dual-settlement enabled" icon={CreditCard} variant="slate" />
      </div>

      {/* Invoices Master Table */}
      <div className="apple-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-xs text-clinical-ink">Hospital Encounters Invoicing Registry</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-clinical-ink-secondary font-semibold">
                <th className="py-3 px-4 font-mono">Invoice ID</th>
                <th className="py-3 px-4">Patient Name & NIC</th>
                <th className="py-3 px-4 font-mono">Doctor Fee</th>
                <th className="py-3 px-4 font-mono">Pharmacy</th>
                <th className="py-3 px-4 font-mono">Lab Tests</th>
                <th className="py-3 px-4 font-mono">Total (LKR)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Payment Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-clinical-teal-700">{inv.invoiceId}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-clinical-ink">{inv.patientName}</div>
                    <div className="text-[10px] font-mono text-slate-400">NIC: {inv.patientNic}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700">Rs. {inv.doctorFee.toFixed(2)}</td>
                  <td className="py-3 px-4 font-mono text-slate-700">Rs. {inv.pharmacyFee.toFixed(2)}</td>
                  <td className="py-3 px-4 font-mono text-slate-700">Rs. {inv.labFee.toFixed(2)}</td>
                  <td className="py-3 px-4 font-mono font-bold text-clinical-ink text-sm">
                    Rs. {inv.totalAmount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={inv.status === 'PAID' ? 'success' : 'urgent'}>
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setIsReceiptModalOpen(true);
                        }}
                        className="apple-btn text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded"
                      >
                        Itemized View
                      </button>

                      {inv.status === 'PENDING' ? (
                        <>
                          <button
                            onClick={() => handlePayHereCheckout(inv)}
                            className="apple-btn text-[11px] font-semibold text-white bg-clinical-teal-600 hover:bg-clinical-teal-700 px-2.5 py-1 rounded shadow-sm flex items-center gap-1"
                          >
                            <CreditCard className="h-3 w-3" />
                            <span>PayHere Sandbox</span>
                          </button>
                          <button
                            onClick={() => handleCounterSettle(inv.id, 'CASH')}
                            className="apple-btn text-[11px] font-semibold text-slate-700 border border-slate-300 hover:bg-slate-100 px-2 py-1 rounded"
                          >
                            Cash Settle
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setIsReceiptModalOpen(true);
                          }}
                          className="apple-btn text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 flex items-center gap-1"
                        >
                          <Printer className="h-3 w-3" />
                          <span>Print Receipt</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Itemized Receipt & Print Modal */}
      {selectedInvoice && isReceiptModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsReceiptModalOpen(false)}
          title={`Hospital Itemized Invoice: ${selectedInvoice.invoiceId}`}
          subtitle={`Patient: ${selectedInvoice.patientName} • Date: ${selectedInvoice.billingDate}`}
          maxWidth="xl"
        >
          <div className="space-y-4 text-xs receipt-container">
            {/* Hospital Header for Print */}
            <div className="text-center pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-clinical-ink">PulseOS Hospital Management System</h2>
              <p className="text-[11px] text-clinical-ink-muted">SLIIT Group 60 Multi-Specialty Medical Center</p>
              <p className="text-[10px] font-mono text-slate-400">Malabe, Sri Lanka • Tel: +94 11 754 4801</p>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px]">PATIENT NAME</span>
                <span className="font-bold text-clinical-ink">{selectedInvoice.patientName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">NIC / PASSPORT</span>
                <span className="text-clinical-ink">{selectedInvoice.patientNic}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">INVOICE NUMBER</span>
                <span className="font-bold text-clinical-teal-700">{selectedInvoice.invoiceId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">PAYMENT STATUS</span>
                <span className={`font-bold ${selectedInvoice.status === 'PAID' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {selectedInvoice.status} {selectedInvoice.transactionRef && `(${selectedInvoice.transactionRef})`}
                </span>
              </div>
            </div>

            {/* Line Items */}
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-clinical-ink-secondary font-semibold">
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-right font-mono">Qty</th>
                  <th className="py-2 text-right font-mono">Unit (LKR)</th>
                  <th className="py-2 text-right font-mono">Amount (LKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedInvoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 text-clinical-ink font-medium">{item.description}</td>
                    <td className="py-2 text-right font-mono">{item.quantity}</td>
                    <td className="py-2 text-right font-mono">Rs. {item.unitPrice.toFixed(2)}</td>
                    <td className="py-2 text-right font-mono font-semibold">Rs. {item.totalPrice.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals Summary */}
            <div className="border-t border-slate-200 pt-3 space-y-1 text-right font-mono">
              <div className="flex justify-between text-clinical-ink-secondary">
                <span>Subtotal:</span>
                <span>Rs. {(selectedInvoice.doctorFee + selectedInvoice.pharmacyFee + selectedInvoice.labFee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-clinical-ink-secondary">
                <span>Hospital Levy (2.5%):</span>
                <span>Rs. {selectedInvoice.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-clinical-ink pt-1 border-t border-slate-200">
                <span>Total Net Payable:</span>
                <span className="text-clinical-teal-700">Rs. {selectedInvoice.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="no-print pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-mono">PayHere Sandbox Merchant: 1220000</span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="apple-btn px-4 py-2 text-xs font-semibold bg-slate-800 text-white rounded-lg flex items-center gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="apple-btn px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
```

---

## 6. `LaboratoryView.tsx` (Module 6 — Nethuli / IT25103363)

```tsx
import React, { useState } from 'react';
import { FlaskConical, CheckCircle2, Clock, FileCheck, Search, ArrowRight } from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { LabTest, LabTestStatus } from '../types';

const INITIAL_TESTS: LabTest[] = [
  {
    id: 1,
    testId: 'LAB-2026-001',
    appointmentId: 1,
    patientId: 1,
    patientName: 'Kalyani Bandara',
    doctorId: 1,
    doctorName: 'Dr. Kavinda Rathnayaka',
    testName: 'Lipid Profile Panel',
    category: 'Biochemistry',
    sampleType: 'Venous Blood (Serum)',
    standardFee: 1800,
    testDate: '2026-09-14',
    status: 'REQUESTED',
    referenceRange: 'Total Cholesterol: < 200 mg/dL, HDL: > 40 mg/dL, Triglycerides: < 150 mg/dL',
  },
  {
    id: 2,
    testId: 'LAB-2026-002',
    appointmentId: 2,
    patientId: 2,
    patientName: 'Pradeep Jayasinghe',
    doctorId: 2,
    doctorName: 'Dr. Chamari Perera',
    testName: 'Full Blood Count (FBC/CBC)',
    category: 'Hematology',
    sampleType: 'Whole Blood (EDTA)',
    standardFee: 950,
    testDate: '2026-09-14',
    status: 'SAMPLE_COLLECTED',
    referenceRange: 'WBC: 4.0-11.0 ×10^9/L, Hemoglobin: 13.0-17.0 g/dL',
  },
  {
    id: 3,
    testId: 'LAB-2026-003',
    appointmentId: 3,
    patientId: 3,
    patientName: 'Malini Fernando',
    doctorId: 1,
    doctorName: 'Dr. Kavinda Rathnayaka',
    testName: 'Fasting Blood Sugar (FBS)',
    category: 'Biochemistry',
    sampleType: 'Fluoride Plasma',
    standardFee: 450,
    testDate: '2026-09-14',
    status: 'COMPLETED',
    resultData: 'Glucose: 92 mg/dL (Normal Fasting)',
    referenceRange: '70 - 100 mg/dL',
    isAbnormal: false,
    technicianNotes: 'Specimen verified without hemolysis. Analyzed via spectrophotometry.',
    verifiedBy: 'Nethuli Thilakarathne (IT25103363)',
    verifiedAt: '2026-09-14T09:30:00Z',
  },
];

export const LaboratoryView: React.FC = () => {
  const { showToast } = useToast();
  const [tests, setTests] = useState<LabTest[]>(INITIAL_TESTS);
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  // Result entry form state
  const [resultInput, setResultInput] = useState('');
  const [isAbnormal, setIsAbnormal] = useState(false);
  const [techNotes, setTechNotes] = useState('');

  // PROGRESS TEST STATUS LIFECYCLE: REQUESTED -> SAMPLE_COLLECTED -> PROCESSING -> COMPLETED
  const advanceStatus = (testId: number) => {
    setTests((prevTests) =>
      prevTests.map((t) => {
        if (t.id === testId) {
          let nextStatus: LabTestStatus = t.status;
          if (t.status === 'REQUESTED') nextStatus = 'SAMPLE_COLLECTED';
          else if (t.status === 'SAMPLE_COLLECTED') nextStatus = 'PROCESSING';

          showToast('info', 'Sample Status Updated', `${t.testId} moved to ${nextStatus}.`);
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const handleSaveResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTest) return;

    setTests((prevTests) =>
      prevTests.map((t) =>
        t.id === selectedTest.id
          ? {
              ...t,
              status: 'COMPLETED',
              resultData: resultInput,
              isAbnormal: isAbnormal,
              technicianNotes: techNotes,
              verifiedBy: 'Nethuli Thilakarathne (IT25103363)',
              verifiedAt: new Date().toISOString(),
            }
          : t
      )
    );

    setIsResultModalOpen(false);
    setSelectedTest(null);
    showToast('success', 'Diagnostic Result Verified', `Report finalized for ${selectedTest.testId}.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-clinical-ink tracking-tight">Clinical Laboratory & Pathology</h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-clinical-teal-50 text-clinical-teal-700 border border-clinical-teal-200">
              M6: Thilakarathne H.S.K.P.N (IT25103363)
            </span>
          </div>
          <p className="text-xs text-clinical-ink-muted mt-1">
            Diagnostic order intake, 4-stage sample tracking lifecycle, quantitative analyzer result entry, and medical reports.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Active Investigations" value={tests.length} subtitle="Orders in laboratory" icon={FlaskConical} variant="teal" />
        <MetricCard
          title="Pending Specimen Intake"
          value={tests.filter((t) => t.status === 'REQUESTED').length}
          subtitle="Awaiting phlebotomy collection"
          icon={Clock}
          variant="amber"
        />
        <MetricCard
          title="In Analyzer / Processing"
          value={tests.filter((t) => t.status === 'SAMPLE_COLLECTED' || t.status === 'PROCESSING').length}
          subtitle="Running assays"
          icon={ArrowRight}
          variant="coral"
        />
        <MetricCard
          title="Verified Final Reports"
          value={tests.filter((t) => t.status === 'COMPLETED').length}
          subtitle="Doctor sign-off ready"
          icon={FileCheck}
          variant="emerald"
        />
      </div>

      {/* Lab Tests Table */}
      <div className="apple-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-xs text-clinical-ink">Diagnostic Tests Order Registry</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-clinical-ink-secondary font-semibold">
                <th className="py-3 px-4 font-mono">Test ID</th>
                <th className="py-3 px-4">Test Name & Specimen</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Ordering Doctor</th>
                <th className="py-3 px-4 font-mono">Fee (LKR)</th>
                <th className="py-3 px-4">Sample Lifecycle Status</th>
                <th className="py-3 px-4 text-right">Technician Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tests.map((test) => (
                <tr key={test.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-clinical-teal-700">{test.testId}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-clinical-ink">{test.testName}</div>
                    <div className="text-[10px] text-slate-400">{test.category} • {test.sampleType}</div>
                  </td>
                  <td className="py-3 px-4 font-medium text-clinical-ink">{test.patientName}</td>
                  <td className="py-3 px-4 text-clinical-ink-secondary">{test.doctorName}</td>
                  <td className="py-3 px-4 font-mono font-semibold">Rs. {test.standardFee.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        test.status === 'COMPLETED'
                          ? 'success'
                          : test.status === 'PROCESSING'
                          ? 'urgent'
                          : test.status === 'SAMPLE_COLLECTED'
                          ? 'warning'
                          : 'routine'
                      }
                    >
                      {test.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {test.status === 'REQUESTED' && (
                        <button
                          onClick={() => advanceStatus(test.id)}
                          className="apple-btn text-[11px] font-semibold text-clinical-teal-600 bg-clinical-teal-50 px-2 py-1 rounded hover:bg-clinical-teal-100"
                        >
                          Collect Sample
                        </button>
                      )}
                      {test.status === 'SAMPLE_COLLECTED' && (
                        <button
                          onClick={() => advanceStatus(test.id)}
                          className="apple-btn text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded hover:bg-amber-100"
                        >
                          Send to Analyzer
                        </button>
                      )}
                      {test.status === 'PROCESSING' && (
                        <button
                          onClick={() => {
                            setSelectedTest(test);
                            setResultInput('');
                            setIsAbnormal(false);
                            setIsResultModalOpen(true);
                          }}
                          className="apple-btn text-[11px] font-semibold text-white bg-clinical-teal-600 px-2.5 py-1 rounded hover:bg-clinical-teal-700 shadow-sm"
                        >
                          Enter Results
                        </button>
                      )}
                      {test.status === 'COMPLETED' && (
                        <button
                          onClick={() => {
                            setSelectedTest(test);
                            setIsResultModalOpen(false);
                          }}
                          className="apple-btn text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200"
                        >
                          View Report
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Result Entry Modal */}
      {selectedTest && isResultModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsResultModalOpen(false)}
          title={`Quantitative Result Entry: ${selectedTest.testId}`}
          subtitle={`${selectedTest.testName} • ${selectedTest.patientName}`}
        >
          <form onSubmit={handleSaveResult} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono">
              <span className="text-slate-400 block text-[10px]">STANDARD REFERENCE RANGE</span>
              <span className="font-semibold text-clinical-ink">{selectedTest.referenceRange}</span>
            </div>

            <div>
              <label className="block font-semibold text-clinical-ink mb-1">Assay Quantitative Result Data *</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Total Cholesterol: 245 mg/dL (High), HDL: 38 mg/dL (Low), Triglycerides: 180 mg/dL"
                value={resultInput}
                onChange={(e) => setResultInput(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-clinical-teal-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="abnormalCheck"
                checked={isAbnormal}
                onChange={(e) => setIsAbnormal(e.target.checked)}
                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 h-4 w-4"
              />
              <label htmlFor="abnormalCheck" className="text-xs font-semibold text-rose-700">
                Flag as Clinically Abnormal Result (Out of Reference Range)
              </label>
            </div>

            <div>
              <label className="block font-semibold text-clinical-ink mb-1">Technologist Diagnostic Observations</label>
              <input
                type="text"
                placeholder="e.g. Sample verified on Beckman Coulter analyzer."
                value={techNotes}
                onChange={(e) => setTechNotes(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsResultModalOpen(false)}
                className="apple-btn px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="apple-btn px-4 py-2 font-semibold bg-clinical-teal-600 text-white rounded-lg hover:bg-clinical-teal-700 shadow-sm"
              >
                Verify & Finalize Report
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Completed Report Viewer Modal */}
      {selectedTest && !isResultModalOpen && selectedTest.status === 'COMPLETED' && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTest(null)}
          title="Clinical Diagnostic Laboratory Report"
          subtitle={`${selectedTest.testId} • PulseOS Pathology Division`}
          maxWidth="xl"
        >
          <div className="space-y-4 text-xs receipt-container">
            <div className="text-center pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-clinical-ink">PulseOS Clinical Diagnostics Laboratory</h2>
              <p className="text-[11px] text-clinical-ink-muted">Faculty of Computing Medical Center • SLIIT Group 60</p>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px]">PATIENT NAME</span>
                <span className="font-bold text-clinical-ink">{selectedTest.patientName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">ORDERING PHYSICIAN</span>
                <span className="font-medium text-clinical-ink">{selectedTest.doctorName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">TEST INVESTIGATION</span>
                <span className="font-bold text-clinical-teal-700">{selectedTest.testName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">DATE VERIFIED</span>
                <span className="text-clinical-ink">{selectedTest.verifiedAt?.split('T')[0]}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 font-mono">
              <span className="text-slate-400 block text-[10px]">QUANTITATIVE FINDINGS</span>
              <p className="text-sm font-bold text-clinical-ink leading-relaxed">{selectedTest.resultData}</p>
              <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
                <span>Reference Range: {selectedTest.referenceRange}</span>
                <span className={selectedTest.isAbnormal ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                  {selectedTest.isAbnormal ? 'ABNORMAL' : 'NORMAL'}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              Verified by: <span className="font-semibold text-slate-800">{selectedTest.verifiedBy}</span>
            </div>

            <div className="no-print pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="apple-btn px-4 py-2 font-semibold bg-slate-800 text-white rounded-lg"
              >
                Print Lab Report
              </button>
              <button
                onClick={() => setSelectedTest(null)}
                className="apple-btn px-4 py-2 font-semibold bg-slate-100 text-slate-700 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
```
