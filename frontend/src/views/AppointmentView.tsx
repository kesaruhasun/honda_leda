import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Plus,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Search,
} from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { appointmentApi, doctorApi, patientApi } from '../services/api';
import { Appointment, Doctor, Patient } from '../types';

export const AppointmentView: React.FC = () => {
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  // Booking Form State
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '09:00',
    reasonForVisit: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [aptRes, docRes, patRes] = await Promise.all([
        appointmentApi.getAll(),
        doctorApi.getAll(),
        patientApi.getAll(),
      ]);
      setAppointments(aptRes.data);
      setDoctors(docRes.data);
      setPatients(patRes.data);
    } catch (err: any) {
      showToast('error', 'Error Loading Appointments', err.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId || !formData.doctorId || !formData.reasonForVisit) {
      showToast('error', 'Required Fields Missing', 'Please select patient, physician, and consultation reason.');
      return;
    }

    try {
      const payload = {
        patientId: Number(formData.patientId),
        doctorId: Number(formData.doctorId),
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        reasonForVisit: formData.reasonForVisit,
      };

      const res = await appointmentApi.create(payload);
      setAppointments((prev) => [res.data, ...prev]);
      setIsBookModalOpen(false);
      setFormData({
        patientId: '',
        doctorId: '',
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: '09:00',
        reasonForVisit: '',
      });
      showToast('success', 'Consultation Booked', `Slot reserved: ${res.data.appointmentNumber}`);
    } catch (err: any) {
      showToast(
        'error',
        'Double-Booking Conflict Rejection',
        err.message || 'This physician already has a consultation scheduled for that time slot. Please choose an alternate time.'
      );
    }
  };

  const handleUpdateStatus = async (id: number, nextStatus: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED') => {
    try {
      if (nextStatus === 'COMPLETED') {
        await appointmentApi.complete(id);
      } else if (nextStatus === 'CANCELLED') {
        await appointmentApi.cancel(id, 'Patient requested cancellation');
      } else {
        // Confirmation
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: 'CONFIRMED' } : a))
        );
      }

      showToast('success', 'Status Updated', `Appointment marked as ${nextStatus}.`);
      fetchData();
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message || 'Could not update appointment status');
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesStatus = statusFilter === 'ALL' || apt.status === statusFilter;
    const patName = apt.patientName || '';
    const docName = apt.doctorName || '';
    const matchesSearch =
      patName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      docName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apt.patientNic && apt.patientNic.includes(searchTerm)) ||
      (apt.appointmentNumber && apt.appointmentNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-clinical-ink tracking-tight">Outpatient Consultation Scheduler</h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-clinical-teal-50 text-clinical-teal-700 border border-clinical-teal-200">
              Double-Booking Prevention Active
            </span>
          </div>
          <p className="text-xs text-clinical-ink-muted mt-1">
            Consultation slot reservation with strict conflict locking and encounter lifecycle tracking.
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

      {/* Double-Booking Guarantee Callout */}
      <div className="p-3.5 rounded-apple-xl bg-clinical-teal-50/80 border border-clinical-teal-200/80 flex items-start gap-3 text-xs">
        <ShieldAlert className="h-5 w-5 text-clinical-teal-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-clinical-teal-900 block">Strict Composite Unique Constraint Enforced</span>
          <p className="text-clinical-teal-800 text-[11px] mt-0.5 leading-relaxed">
            Persistence layer rejects any duplicate slot insertion across <code className="font-mono bg-clinical-teal-100 px-1 py-0.5 rounded">(doctor_id, appointment_date, appointment_time)</code> with automated rollback and 400 Bad Request.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Consultations"
          value={appointments.length}
          subtitle="Hospital outpatient registry"
          icon={CalendarCheck}
          variant="teal"
        />
        <MetricCard
          title="Confirmed"
          value={appointments.filter((a) => a.status === 'CONFIRMED').length}
          subtitle="Checked-in & awaiting MD"
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
          title="Completed Encounters"
          value={appointments.filter((a) => a.status === 'COMPLETED').length}
          subtitle="Finalized consultations"
          icon={CheckCircle2}
          variant="slate"
        />
      </div>

      {/* Filters & Table */}
      <div className="apple-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by patient, NIC, or doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-clinical-ink focus:outline-none focus:ring-2 focus:ring-clinical-teal-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-clinical-ink-secondary">Status:</span>
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

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin h-8 w-8 border-2 border-clinical-teal-600 border-t-transparent rounded-full" />
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 font-mono">
            No consultations found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-clinical-ink-secondary font-semibold border-b border-slate-200">
                  <th className="py-3 px-4 font-mono">Appt ID</th>
                  <th className="py-3 px-4 font-mono">Date & Time</th>
                  <th className="py-3 px-4">Patient Demographics</th>
                  <th className="py-3 px-4">Physician & Clinic</th>
                  <th className="py-3 px-4">Reason for Visit</th>
                  <th className="py-3 px-4">Room</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-clinical-teal-700">
                      {apt.appointmentNumber || apt.appointmentId}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-clinical-ink">
                      <div>{apt.appointmentDate}</div>
                      <div className="text-[10px] text-slate-400">{apt.appointmentTime}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-clinical-ink">{apt.patientName}</div>
                      <div className="text-[10px] font-mono text-slate-400">NIC: {apt.patientNic}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-clinical-ink">{apt.doctorName}</div>
                      <div className="text-[10px] text-clinical-teal-600 font-semibold">{apt.specialization}</div>
                    </td>
                    <td className="py-3 px-4 text-clinical-ink-secondary max-w-xs truncate">
                      {apt.reasonForVisit}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{apt.roomNumber || 'Clinic 101'}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          apt.status === 'CONFIRMED'
                            ? 'success'
                            : apt.status === 'SCHEDULED'
                            ? 'warning'
                            : apt.status === 'COMPLETED'
                            ? 'neutral'
                            : 'emergency'
                        }
                      >
                        {apt.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {apt.status === 'SCHEDULED' && (
                          <button
                            onClick={() => handleUpdateStatus(apt.id, 'CONFIRMED')}
                            className="apple-btn text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded hover:bg-emerald-100"
                          >
                            Confirm
                          </button>
                        )}
                        {apt.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                            className="apple-btn text-[11px] font-semibold text-clinical-teal-600 bg-clinical-teal-50 px-2 py-1 rounded hover:bg-clinical-teal-100"
                          >
                            Complete
                          </button>
                        )}
                        {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleUpdateStatus(apt.id, 'CANCELLED')}
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
        )}
      </div>

      {/* Book Consultation Modal */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Schedule Outpatient Consultation Slot"
        subtitle="Book physician encounter with automatic double-booking prevention check"
        maxWidth="md"
      >
        <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Patient *</label>
            <select
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              required
              className="w-full font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-clinical-ink focus:ring-2 focus:ring-clinical-teal-500"
            >
              <option value="">Choose Patient File</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName || `${p.firstName} ${p.lastName}`} (NIC: {p.nicPassportNo} &bull; {p.patientId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Attending Physician *</label>
            <select
              value={formData.doctorId}
              onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
              required
              className="w-full font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-clinical-ink focus:ring-2 focus:ring-clinical-teal-500"
            >
              <option value="">Choose Doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.fullName || `Dr. ${d.firstName} ${d.lastName}`} &bull; {d.specialization} (Fee: LKR {d.consultationFee})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Appointment Date *</label>
              <input
                type="date"
                required
                value={formData.appointmentDate}
                onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                className="w-full font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinical-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Time Slot *</label>
              <select
                value={formData.appointmentTime}
                onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                className="w-full font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinical-teal-500"
              >
                <option value="08:30">08:30 AM</option>
                <option value="09:00">09:00 AM</option>
                <option value="09:30">09:30 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="10:30">10:30 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="14:00">02:00 PM</option>
                <option value="14:30">02:30 PM</option>
                <option value="15:00">03:00 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reason for Visit *</label>
            <textarea
              required
              rows={3}
              value={formData.reasonForVisit}
              onChange={(e) => setFormData({ ...formData, reasonForVisit: e.target.value })}
              placeholder="Clinical reason, symptoms, or referral details..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinical-teal-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsBookModalOpen(false)}
              className="apple-btn px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="apple-btn px-4 py-2 text-xs font-semibold bg-clinical-teal-600 text-white rounded-lg hover:bg-clinical-teal-700 shadow-sm"
            >
              Confirm Reservation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default AppointmentView;