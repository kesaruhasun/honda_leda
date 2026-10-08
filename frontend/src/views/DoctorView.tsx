import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  CheckCircle,
  Calendar,
  DollarSign,
  Edit2,
  Plus,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { DataTable, Column } from '../components/common/DataTable';
import { SlideOverDrawer } from '../components/common/SlideOverDrawer';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { doctorApi } from '../services/api';
import { Doctor, DoctorSchedule } from '../types';

export const DoctorView: React.FC = () => {
  const { showToast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('ALL');

  // Add Doctor Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    firstName: '',
    lastName: '',
    specialization: 'Cardiology',
    licenseNo: '',
    roomNumber: 'Suite 101',
    consultationFee: 2500,
    weeklySchedule: 'Mon-Fri 08:00-14:00',
  });

  // Schedule Inspector
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  // Fee Edit Modal
  const [editingFeeDoc, setEditingFeeDoc] = useState<Doctor | null>(null);
  const [newFee, setNewFee] = useState<number>(2500);

  // Kavinda CRUD: Doctor Deletion & Schedule Slot Management
  const [deletingDoctor, setDeletingDoctor] = useState<Doctor | null>(null);
  const [deletingScheduleId, setDeletingScheduleId] = useState<number | null>(null);
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [slotForm, setSlotForm] = useState({
    dayOfWeek: 'MONDAY',
    startTime: '08:00',
    endTime: '12:00',
    maxPatients: 20,
  });

  const handleAddSlot = async (doctorId: number) => {
    try {
      setIsAddingSlot(true);
      await doctorApi.addSchedule(doctorId, {
        dayOfWeek: slotForm.dayOfWeek,
        startTime: slotForm.startTime + ':00',
        endTime: slotForm.endTime + ':00',
        maxPatients: slotForm.maxPatients,
        isActive: true,
      } as any);
      showToast('success', 'Shift Slot Added', `Added ${slotForm.dayOfWeek} shift for physician.`);
      const res = await doctorApi.getSchedules(doctorId);
      setSchedules(res.data || []);
    } catch (err: any) {
      showToast('error', 'Add Shift Failed', err.message || 'Could not add schedule slot');
    } finally {
      setIsAddingSlot(false);
    }
  };

  const handleDeleteSlot = async (doctorId: number, scheduleId: number) => {
    try {
      setDeletingScheduleId(scheduleId);
      await doctorApi.deleteSchedule(doctorId, scheduleId);
      showToast('success', 'Shift Removed', 'Shift schedule slot deleted successfully.');
      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
    } catch (err: any) {
      showToast('error', 'Delete Shift Failed', err.message || 'Could not delete schedule slot');
    } finally {
      setDeletingScheduleId(null);
    }
  };

  const handleConfirmDeactivateDoctor = async () => {
    if (!deletingDoctor) return;
    try {
      await doctorApi.deleteDoctor(deletingDoctor.id);
      showToast('success', 'Physician Deactivated', `Dr. ${deletingDoctor.fullName || deletingDoctor.firstName} has been marked off-duty/retired.`);
      setDeletingDoctor(null);
      fetchDoctors();
    } catch (err: any) {
      showToast('error', 'Deactivation Failed', err.message || 'Could not deactivate physician');
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await doctorApi.getAll();
      setDoctors(res.data || []);
    } catch (err: any) {
      showToast('error', 'Error Loading Doctors', err.message || 'Failed to fetch doctor rosters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleOpenSchedule = async (doc: Doctor) => {
    setSelectedDoctor(doc);
    setLoadingSchedules(true);
    setSchedules([]);
    try {
      const res = await doctorApi.getSchedules(doc.id);
      setSchedules(res.data || []);
    } catch (err: any) {
      showToast('error', 'Schedule Error', err.message || 'Could not fetch physician schedules');
    } finally {
      setLoadingSchedules(false);
    }
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoctor.firstName || !newDoctor.lastName || !newDoctor.specialization) {
      showToast('error', 'Validation Failed', 'First name, last name, and specialization are required.');
      return;
    }
    try {
      await doctorApi.create({
        ...newDoctor,
        employeeId: 'DOC-' + Math.floor(100 + Math.random() * 900),
        isAvailable: true,
      } as any);
      showToast('success', 'Physician Registered', `Dr. ${newDoctor.firstName} ${newDoctor.lastName} added to roster.`);
      setIsAddModalOpen(false);
      fetchDoctors();
    } catch (err: any) {
      showToast('error', 'Registration Error', err.message || 'Could not add physician');
    }
  };

  const toggleAvailability = async (id: number, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    // Optimistic UI update
    setDoctors((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isAvailable: nextStatus } : d))
    );
    try {
      await doctorApi.toggleAvailability(id, nextStatus);
      showToast('success', 'Status Updated', `Physician duty status toggled to ${nextStatus ? 'ON DUTY' : 'OFF DUTY'}.`);
    } catch (err: any) {
      fetchDoctors(); // Rollback
      showToast('error', 'Update Failed', err.message || 'Could not update availability');
    }
  };

  const handleUpdateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeeDoc) return;
    try {
      await doctorApi.updateFee(editingFeeDoc.id, Number(newFee));
      showToast('success', 'Consultation Fee Updated', `Dr. ${editingFeeDoc.fullName || editingFeeDoc.firstName}'s fee updated to LKR ${newFee}.`);
      setEditingFeeDoc(null);
      fetchDoctors();
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message || 'Could not update consultation fee');
    }
  };

  const departments = ['ALL', ...Array.from(new Set(doctors.map((d) => d.specialization).filter(Boolean)))];

  const filteredDoctors = doctors.filter((d) => {
    return selectedDept === 'ALL' || d.specialization === selectedDept;
  });

  const availableDocs = doctors.filter((d) => d.isAvailable !== false);

  const columns: Column<Doctor>[] = [
    {
      key: 'fullName',
      header: 'Physician Name',
      mobileTitle: true,
      sortable: true,
      render: (d) => (
        <div>
          <div className="font-bold text-slate-900 truncate">Dr. {d.fullName || `${d.firstName} ${d.lastName}`}</div>
          <div className="text-[10px] font-mono text-slate-500">{d.employeeId || `EMP-${d.id}`} &bull; Room {d.roomNumber || '101'}</div>
        </div>
      ),
    },
    {
      key: 'specialization',
      header: 'Specialization / Dept',
      sortable: true,
      render: (d) => <span className="font-semibold text-teal-700">{d.specialization}</span>,
    },
    {
      key: 'consultationFee',
      header: 'Consultation Fee',
      sortable: true,
      render: (d) => (
        <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 whitespace-nowrap">
          <span>LKR {Number(d.consultationFee || 2500).toFixed(2)}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setEditingFeeDoc(d);
              setNewFee(d.consultationFee || 2500);
            }}
            className="p-1 text-slate-400 hover:text-teal-600 rounded hover:bg-slate-100 transition-colors"
            title="Update Fee"
          >
            <Edit2 className="h-3 w-3" />
          </button>
        </div>
      ),
    },
    {
      key: 'isAvailable',
      header: 'Duty Status',
      sortable: true,
      render: (d) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleAvailability(d.id, d.isAvailable !== false);
          }}
          className="flex items-center gap-1.5 focus:outline-none"
        >
          {d.isAvailable !== false ? (
            <StatusBadge status="ACTIVE" dot>On Duty</StatusBadge>
          ) : (
            <StatusBadge status="CANCELLED" dot>Off Duty</StatusBadge>
          )}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
              Physician Rosters &amp; Consultant Directory
            </h1>
            <StatusBadge status="ACTIVE" dot />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-department consultant schedules, duty availability toggles, and tariff management.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Physician</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
        <StatCard
          title="Active Consultants"
          value={availableDocs.length}
          subtitle="Specialists currently on duty"
          icon={Stethoscope}
          variant="teal"
          loading={loading}
          trend={{ value: `${Math.round((availableDocs.length / Math.max(1, doctors.length)) * 100)}% Coverage`, isPositive: true }}
        />
        <StatCard
          title="Total Roster"
          value={doctors.length}
          subtitle="Credentialed medical staff"
          icon={CheckCircle}
          variant="emerald"
          loading={loading}
          trend={{ value: 'Verified', isPositive: true }}
        />
        <StatCard
          title="Departments"
          value={departments.length - 1}
          subtitle="Specialist clinical divisions"
          icon={Calendar}
          variant="purple"
          loading={loading}
        />
        <StatCard
          title="Avg Consultation Fee"
          value={`LKR ${Math.round(
            doctors.reduce((sum, d) => sum + (Number(d.consultationFee) || 2500), 0) / Math.max(1, doctors.length)
          ).toLocaleString()}`}
          subtitle="Standard tariff baseline"
          icon={DollarSign}
          variant="sky"
          loading={loading}
        />
      </div>

      {/* Main Table */}
      <DataTable<Doctor>
        data={filteredDoctors}
        columns={columns}
        keyExtractor={(d) => d.id}
        loading={loading}
        title="Consultant Roster & Duty Station Matrix"
        subtitle="Manage specialist fees, availability flags, and shift schedules"
        searchPlaceholder="Search physician name, specialty, room number..."
        searchFilter={(d, q) =>
          (d.fullName || `${d.firstName} ${d.lastName}`).toLowerCase().includes(q) ||
          (d.specialization ? d.specialization.toLowerCase().includes(q) : false) ||
          (d.roomNumber ? d.roomNumber.toLowerCase().includes(q) : false)
        }
        onRowClick={(doc) => handleOpenSchedule(doc)}
        headerRight={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Department:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'ALL' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>
        }
        actions={(doc) => (
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => handleOpenSchedule(doc)}
              className="px-2.5 py-1 text-[11px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-md border border-teal-200/80 transition-colors"
            >
              View Schedule
            </button>
            <button
              type="button"
              onClick={() => setDeletingDoctor(doc)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
              title="Deactivate / Retire Doctor"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      />

      {/* SlideOverDrawer for Schedule Roster */}
      <SlideOverDrawer
        isOpen={!!selectedDoctor}
        onClose={() => setSelectedDoctor(null)}
        title={selectedDoctor ? `Dr. ${selectedDoctor.fullName || `${selectedDoctor.firstName} ${selectedDoctor.lastName}`}` : ''}
        subtitle={selectedDoctor ? `${selectedDoctor.specialization} • Room ${selectedDoctor.roomNumber || 'Suite 101'}` : ''}
        size="md"
      >
        {selectedDoctor && (
          <div className="space-y-4 text-xs font-sans">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">DUTY STATUS</span>
                <StatusBadge status={selectedDoctor.isAvailable !== false ? 'ACTIVE' : 'OFF'} dot>
                  {selectedDoctor.isAvailable !== false ? 'Currently On Duty' : 'Off Duty'}
                </StatusBadge>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">CONSULTATION TARIFF</span>
                <span className="font-bold font-mono text-sm text-slate-900">
                  LKR {Number(selectedDoctor.consultationFee || 2500).toFixed(2)}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
                Weekly Consultation Shift Matrix
              </h4>
              {loadingSchedules ? (
                <div className="py-8 text-center text-slate-400 animate-pulse">Loading shift schedule...</div>
              ) : schedules.length > 0 ? (
                <div className="space-y-2">
                  {schedules.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 rounded-xl bg-white border border-slate-200 flex justify-between items-center"
                    >
                      <div>
                        <span className="font-bold text-slate-800">{s.dayOfWeek}</span>
                        <span className="ml-2 font-mono font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {s.startTime?.slice(0, 5)} - {s.endTime?.slice(0, 5)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteSlot(selectedDoctor.id, s.id)}
                        disabled={deletingScheduleId === s.id}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Shift Slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-500 font-mono text-xs">
                  Standard Shift: {selectedDoctor.weeklySchedule || 'Mon - Fri (08:00 - 14:00)'}
                </div>
              )}

              {/* Add New Shift Slot Mini-Form */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                <h5 className="font-bold text-xs text-slate-700 mb-2">Add New Shift Slot</h5>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Day</label>
                    <select
                      value={slotForm.dayOfWeek}
                      onChange={(e) => setSlotForm({ ...slotForm, dayOfWeek: e.target.value })}
                      className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg bg-white"
                    >
                      {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Max Patients</label>
                    <input
                      type="number"
                      min="1"
                      value={slotForm.maxPatients}
                      onChange={(e) => setSlotForm({ ...slotForm, maxPatients: parseInt(e.target.value, 10) || 10 })}
                      className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Start Time</label>
                    <input
                      type="time"
                      value={slotForm.startTime}
                      onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                      className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">End Time</label>
                    <input
                      type="time"
                      value={slotForm.endTime}
                      onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                      className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isAddingSlot}
                  onClick={() => handleAddSlot(selectedDoctor.id)}
                  className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingSlot ? 'Adding Shift...' : 'Add Consultation Shift'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </SlideOverDrawer>

      {/* Add Physician Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddModalOpen(false)}
          title="Register New Consultant Physician"
          subtitle="Credential a new doctor in the hospital information system"
          maxWidth="md"
        >
          <form onSubmit={handleAddDoctor} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={newDoctor.firstName}
                  onChange={(e) => setNewDoctor({ ...newDoctor, firstName: e.target.value })}
                  placeholder="E.g. Ayesha"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={newDoctor.lastName}
                  onChange={(e) => setNewDoctor({ ...newDoctor, lastName: e.target.value })}
                  placeholder="E.g. Fernando"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Specialization / Specialty *</label>
                <input
                  type="text"
                  required
                  value={newDoctor.specialization}
                  onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                  placeholder="Cardiology, Neurology, Pediatrics..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Room / Suite No</label>
                <input
                  type="text"
                  value={newDoctor.roomNumber}
                  onChange={(e) => setNewDoctor({ ...newDoctor, roomNumber: e.target.value })}
                  placeholder="Suite 204"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Medical License No</label>
                <input
                  type="text"
                  value={newDoctor.licenseNo}
                  onChange={(e) => setNewDoctor({ ...newDoctor, licenseNo: e.target.value })}
                  placeholder="SLMC-49120"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Consultation Fee (LKR)</label>
                <input
                  type="number"
                  value={newDoctor.consultationFee}
                  onChange={(e) => setNewDoctor({ ...newDoctor, consultationFee: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-lg border text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs"
              >
                Save Physician
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Consultation Fee Modal */}
      {editingFeeDoc && (
        <Modal
          isOpen={true}
          onClose={() => setEditingFeeDoc(null)}
          title="Update Consultation Tariff"
          subtitle={`Adjust fee for Dr. ${editingFeeDoc.fullName || editingFeeDoc.firstName}`}
          maxWidth="sm"
        >
          <form onSubmit={handleUpdateFee} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">New Fee (LKR)</label>
              <input
                type="number"
                required
                min={500}
                max={50000}
                value={newFee}
                onChange={(e) => setNewFee(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 font-mono text-base font-bold text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingFeeDoc(null)}
                className="px-3.5 py-1.5 rounded-lg border text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold"
              >
                Update Tariff
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete / Deactivate Doctor Confirmation Modal (Kavinda CRUD) */}
      {deletingDoctor && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingDoctor(null)}
          title="Deactivate / Retire Physician"
          subtitle={`Are you sure you want to deactivate Dr. ${deletingDoctor.fullName || deletingDoctor.firstName}?`}
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
              <div className="font-bold flex items-center gap-1.5 mb-1 text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Confirm Physician Deactivation</span>
              </div>
              <p>
                Dr. <strong className="font-semibold text-rose-950">{deletingDoctor.fullName || `${deletingDoctor.firstName} ${deletingDoctor.lastName}`}</strong> ({deletingDoctor.specialization}) will be marked inactive and removed from public booking rosters.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingDoctor(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeactivateDoctor}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Deactivate</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DoctorView;
