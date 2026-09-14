import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  CheckCircle,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Search,
  DollarSign,
  Edit2,
  AlertCircle,
  Camera,
} from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { useRole } from "../context/RoleContext";
import { doctorApi } from '../services/api';
import { Doctor, DoctorSchedule } from '../types';

export const DoctorView: React.FC = () => {
  const { showToast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const { currentRole } = useRole();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDoctor, setNewDoctor] = useState({ firstName: "", lastName: "", specialization: "", licenseNo: "", roomNumber: "", consultationFee: 2500, weeklySchedule: "Mon-Fri 08:00-14:00" });

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [scheduleModalDoctor, setScheduleModalDoctor] = useState<Doctor | null>(null);
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // Fee Edit State
  const [editingFeeDoc, setEditingFeeDoc] = useState<Doctor | null>(null);
  const [newFee, setNewFee] = useState<number>(2500);
  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await doctorApi.create({ ...newDoctor, employeeId: "EMP-DOC-" + Math.floor(Math.random() * 1000), isAvailable: true } as any);
      showToast("success", "Success", "Physician added successfully");
      setIsAddModalOpen(false);
      fetchDoctors();
    } catch (err: any) {
      showToast("error", "Error", "Could not add physician");
    }
  };

  const handleOpenScheduleModal = async (doc: Doctor) => {
    setScheduleModalDoctor(doc);
    setLoadingSchedules(true);
    setScheduleError(null);
    setSchedules([]);
    try {
      const res = await doctorApi.getSchedules(doc.id);
      setSchedules(res.data);
    } catch (err: any) {
      if (err.status === 403 || err.response?.status === 403) {
        const msg = "Access Denied: You do not have permission to view this physician's schedules (RBAC Boundary).";
        setScheduleError(msg);
        showToast('error', 'Access Restricted', msg);
      } else {
        const msg = err.message || 'Failed to fetch schedules';
        setScheduleError(msg);
        showToast('error', 'Error Loading Schedules', msg);
      }
    } finally {
      setLoadingSchedules(false);
    }
  };


  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await doctorApi.getAll();
      setDoctors(res.data);
    } catch (err: any) {
      showToast('error', 'Error Loading Doctors', err.message || 'Failed to fetch doctor rosters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const departments = [
    'ALL',
    ...Array.from(new Set(doctors.map((d) => d.specialization).filter(Boolean))),
  ];

  const toggleAvailability = async (id: number, currentStatus: boolean) => {
    try {
      const nextStatus = !currentStatus;
      await doctorApi.toggleAvailability(id, nextStatus);
      setDoctors((prev) =>
        prev.map((doc) => (doc.id === id ? { ...doc, isAvailable: nextStatus } : doc))
      );
      showToast(
        nextStatus ? 'success' : 'warning',
        'Duty Status Updated',
        `Doctor duty status changed to ${nextStatus ? 'ON DUTY' : 'OFF DUTY'}.`
      );
    } catch (err: any) {
      showToast('error', 'Failed to update duty', err.message || 'Server error');
    }
  };

  const handleUpdateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeeDoc) return;

    try {
      await doctorApi.updateFee(editingFeeDoc.id, newFee);
      setDoctors((prev) =>
        prev.map((doc) =>
          doc.id === editingFeeDoc.id ? { ...doc, consultationFee: newFee } : doc
        )
      );
      showToast('success', 'Fee Updated', `Consultation fee for ${editingFeeDoc.fullName} set to LKR ${newFee}`);
      setEditingFeeDoc(null);
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message || 'Could not update consultation fee');
    }
  };

  const handleDoctorAvatarUpload = (docId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        localStorage.setItem(`doctor_avatar_${docId}`, base64);
        setDoctors((prev) => [...prev]);
        showToast('success', 'Profile Photo Updated', 'Physician avatar has been saved.');
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesDept = selectedDept === 'ALL' || doc.specialization === selectedDept;
    const nameStr = doc.fullName || `${doc.firstName} ${doc.lastName}`;
    const matchesSearch =
      nameStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-clinical-ink tracking-tight">Physician Directory & Rostering</h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-clinical-teal-50 text-clinical-teal-700 border border-clinical-teal-200">
              Consultant Medical Staff
            </span>
          </div>
          <p className="text-xs text-clinical-ink-muted mt-1">
            Consultant profiles, medical license tracking, consultation fee configuration, and live duty status.
          </p>
        </div>
        {currentRole === 'CASHIER_ADMIN' && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="apple-btn flex items-center gap-2 bg-clinical-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:bg-clinical-teal-700 hover:shadow-md transition-all self-start sm:self-auto"
          >
            <Stethoscope className="w-4 h-4" />
            Add New Physician
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Physicians"
          value={doctors.length}
          subtitle="Accredited consultants"
          icon={Stethoscope}
          variant="teal"
        />
        <MetricCard
          title="On-Duty Now"
          value={doctors.filter((d) => d.isAvailable).length}
          subtitle="Accepting consultations"
          icon={CheckCircle}
          variant="emerald"
        />
        <MetricCard
          title="Clinical Specializations"
          value={departments.length > 1 ? departments.length - 1 : 0}
          subtitle="Active outpatient clinics"
          icon={Calendar}
          variant="slate"
        />
        <MetricCard
          title="Avg Consultation Fee"
          value={
            doctors.length > 0
              ? `LKR ${Math.round(
                  doctors.reduce((sum, d) => sum + (d.consultationFee || 0), 0) / doctors.length
                ).toLocaleString()}`
              : 'LKR 0'
          }
          subtitle="Standard tariff rate"
          icon={DollarSign}
          variant="amber"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 apple-card p-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by physician name, specialty, room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-clinical-ink focus:outline-none focus:ring-2 focus:ring-clinical-teal-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`apple-btn px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedDept === dept
                  ? 'bg-clinical-teal-600 text-white shadow-2xs'
                  : 'bg-white text-clinical-ink-secondary border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {dept === 'ALL' ? 'All Specializations' : dept}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin h-8 w-8 border-2 border-clinical-teal-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        /* Doctor Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredDoctors.map((doc) => {
            const docAvatar = localStorage.getItem(`doctor_avatar_${doc.id}`);

            return (
              <div key={doc.id} className="apple-card p-5 space-y-4 hover:border-slate-300 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative group shrink-0 cursor-pointer" title="Click to upload/change physician photo">
                      {docAvatar ? (
                        <img
                          src={docAvatar}
                          alt={doc.fullName || doc.firstName}
                          className="h-12 w-12 rounded-2xl object-cover border border-clinical-teal-200 shadow-2xs"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-2xl bg-clinical-teal-50 border border-clinical-teal-200 text-clinical-teal-700 flex items-center justify-center font-bold text-sm shadow-2xs">
                          {doc.firstName[0]}
                          {doc.lastName ? doc.lastName[0] : ''}
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white cursor-pointer">
                        <Camera className="h-3.5 w-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleDoctorAvatarUpload(doc.id, e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-clinical-ink">{doc.fullName || `Dr. ${doc.firstName} ${doc.lastName}`}</h3>
                    <p className="text-xs font-medium text-clinical-teal-700">{doc.specialization}</p>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                      SLMC: {doc.licenseNo} &bull; {doc.employeeId}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleAvailability(doc.id, doc.isAvailable)}
                  className="apple-btn flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                  style={{
                    backgroundColor: doc.isAvailable ? '#ECFDF5' : '#F1F5F9',
                    color: doc.isAvailable ? '#047857' : '#64748B',
                    borderColor: doc.isAvailable ? '#A7F3D0' : '#CBD5E1',
                  }}
                >
                  {doc.isAvailable ? (
                    <ToggleRight className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <ToggleLeft className="h-4 w-4 text-slate-400" />
                  )}
                  <span>{doc.isAvailable ? 'ON DUTY' : 'OFF DUTY'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-slate-50 border border-slate-200/60 font-mono">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 block text-[10px]">CONSULTATION FEE</span>
                    <button
                      onClick={() => {
                        setEditingFeeDoc(doc);
                        setNewFee(doc.consultationFee || 2500);
                      }}
                      className="text-clinical-teal-600 hover:text-clinical-teal-800 p-0.5"
                      title="Update Fee"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="font-bold text-clinical-ink">
                    LKR {Number(doc.consultationFee).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">LOCATION ROOM</span>
                  <span className="font-semibold text-clinical-ink">{doc.roomNumber || 'Clinic Suite 101'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <span className="text-clinical-ink-muted text-[11px] truncate max-w-[220px]">
                  {doc.weeklySchedule || 'Mon - Fri on scheduled slots'}
                </span>
                <button
                  onClick={() => handleOpenScheduleModal(doc)}
                  className="apple-btn text-clinical-teal-600 hover:text-clinical-teal-800 font-semibold text-xs flex items-center gap-1.5 px-2 py-1 rounded hover:bg-clinical-teal-50"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Roster Schedule</span>
                </button>
              </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleModalDoctor && (
        <Modal
          isOpen={true}
          onClose={() => {
            setScheduleModalDoctor(null);
            setSchedules([]);
            setScheduleError(null);
          }}
          title={`Weekly Roster: ${scheduleModalDoctor.fullName || `${scheduleModalDoctor.firstName} ${scheduleModalDoctor.lastName}`}`}
          subtitle={`${scheduleModalDoctor.specialization} • Room ${scheduleModalDoctor.roomNumber}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            {loadingSchedules && (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-clinical-teal-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {scheduleError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{scheduleError}</p>
                  <p className="text-[11px] text-rose-600 mt-1">Under hospital RBAC boundaries, doctors are restricted to viewing only their own schedules.</p>
                </div>
              </div>
            )}

            {!loadingSchedules && !scheduleError && schedules.length === 0 && (
              <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                No weekly roster schedules configured for this physician.
              </div>
            )}

            {!loadingSchedules && !scheduleError && schedules.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 font-mono">
                {schedules.map((sch) => (
                  <div key={sch.id} className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0">
                    <div>
                      <span className="font-semibold text-slate-800 block">{sch.dayOfWeek}</span>
                      <span className="text-[11px] text-slate-500">Max Patients: {sch.maxPatients || 'Unlimited'} • Slot: {sch.slotDurationMinutes || 15}m</span>
                    </div>
                    <span className="text-clinical-teal-700 font-semibold bg-clinical-teal-50 px-2.5 py-1 rounded border border-clinical-teal-200">
                      {sch.startTime} - {sch.endTime}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setScheduleModalDoctor(null);
                  setSchedules([]);
                  setScheduleError(null);
                }}
                className="apple-btn px-4 py-2 text-xs font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-900"
              >
                Close Roster
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Fee Modal */}
      {editingFeeDoc && (
        <Modal
          isOpen={true}
          onClose={() => setEditingFeeDoc(null)}
          title={`Update Consultation Tariff`}
          subtitle={editingFeeDoc.fullName}
          maxWidth="sm"
        >
          <form onSubmit={handleUpdateFee} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Consultation Fee (LKR) *</label>
              <input
                type="number"
                min={500}
                max={50000}
                step={100}
                required
                value={newFee}
                onChange={(e) => setNewFee(Number(e.target.value))}
                className="w-full text-sm font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinical-teal-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingFeeDoc(null)}
                className="apple-btn px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="apple-btn px-4 py-1.5 text-xs font-semibold bg-clinical-teal-600 text-white rounded-lg hover:bg-clinical-teal-700 shadow-sm"
              >
                Save Fee
              </button>
            </div>
          </form>
        </Modal>
      )}
      
      {/* Add Doctor Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Physician"
          subtitle="Register a new consultant to the system"
          maxWidth="md"
        >
          <form onSubmit={handleAddDoctor} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">First Name *</label>
                <input required type="text" value={newDoctor.firstName} onChange={(e) => setNewDoctor({...newDoctor, firstName: e.target.value})} className="apple-input w-full p-2.5 rounded-lg border-slate-300 focus:ring-clinical-teal-500" />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Last Name *</label>
                <input required type="text" value={newDoctor.lastName} onChange={(e) => setNewDoctor({...newDoctor, lastName: e.target.value})} className="apple-input w-full p-2.5 rounded-lg border-slate-300 focus:ring-clinical-teal-500" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Specialization *</label>
                <input required type="text" value={newDoctor.specialization} onChange={(e) => setNewDoctor({...newDoctor, specialization: e.target.value})} placeholder="e.g. Cardiology" className="apple-input w-full p-2.5 rounded-lg border-slate-300 focus:ring-clinical-teal-500" />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">License No (SLMC) *</label>
                <input required type="text" value={newDoctor.licenseNo} onChange={(e) => setNewDoctor({...newDoctor, licenseNo: e.target.value})} className="apple-input w-full p-2.5 rounded-lg border-slate-300 focus:ring-clinical-teal-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Consultation Fee (LKR) *</label>
                <input required type="number" min="500" step="100" value={newDoctor.consultationFee} onChange={(e) => setNewDoctor({...newDoctor, consultationFee: Number(e.target.value)})} className="apple-input w-full p-2.5 rounded-lg border-slate-300 focus:ring-clinical-teal-500" />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Room Number *</label>
                <input required type="text" value={newDoctor.roomNumber} onChange={(e) => setNewDoctor({...newDoctor, roomNumber: e.target.value})} className="apple-input w-full p-2.5 rounded-lg border-slate-300 focus:ring-clinical-teal-500" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="apple-btn px-4 py-2 text-slate-600 font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg">Cancel</button>
              <button type="submit" className="apple-btn px-4 py-2 text-white font-semibold bg-clinical-teal-600 hover:bg-clinical-teal-700 rounded-lg shadow-sm">Save Physician</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
export default DoctorView;
