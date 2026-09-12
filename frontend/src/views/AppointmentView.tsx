import React, { useState } from 'react';
import { CalendarCheck, ShieldAlert, Plus, CheckCircle2, Clock } from 'lucide-react';
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