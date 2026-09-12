import React, { useState } from 'react';
import { Stethoscope, CheckCircle, Calendar, DollarSign, ToggleLeft, ToggleRight, Building } from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
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