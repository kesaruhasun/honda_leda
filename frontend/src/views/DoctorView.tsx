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
} from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { doctorApi } from '../services/api';
import { Doctor } from '../types';

export const DoctorView: React.FC = () => {
  const { showToast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [scheduleModalDoctor, setScheduleModalDoctor] = useState<Doctor | null>(null);

  // Fee Edit State
  const [editingFeeDoc, setEditingFeeDoc] = useState<Doctor | null>(null);
  const [newFee, setNewFee] = useState<number>(2500);

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
          {filteredDoctors.map((doc) => (
            <div key={doc.id} className="apple-card p-5 space-y-4 hover:border-slate-300 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-clinical-teal-50 border border-clinical-teal-200 text-clinical-teal-700 flex items-center justify-center font-bold text-sm shadow-2xs">
                    {doc.firstName[0]}
                    {doc.lastName ? doc.lastName[0] : ''}
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
                  onClick={() => setScheduleModalDoctor(doc)}
                  className="apple-btn text-clinical-teal-600 hover:text-clinical-teal-800 font-semibold text-xs flex items-center gap-1.5 px-2 py-1 rounded hover:bg-clinical-teal-50"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Roster Schedule</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleModalDoctor && (
        <Modal
          isOpen={true}
          onClose={() => setScheduleModalDoctor(null)}
          title={`Weekly Roster: ${scheduleModalDoctor.fullName}`}
          subtitle={`${scheduleModalDoctor.specialization} &bull; ${scheduleModalDoctor.roomNumber}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 font-mono">
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="font-semibold text-slate-800">Monday</span>
                <span className="text-slate-600">08:30 - 13:30 (Clinic A)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="font-semibold text-slate-800">Wednesday</span>
                <span className="text-slate-600">08:30 - 13:30 (Clinic A)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="font-semibold text-slate-800">Friday</span>
                <span className="text-slate-600">09:00 - 14:00 (Special Procedures)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="font-semibold text-slate-800">Saturday</span>
                <span className="text-slate-600">09:00 - 12:00 (Emergency Rounds)</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setScheduleModalDoctor(null)}
                className="apple-btn px-4 py-2 text-xs font-semibold bg-slate-800 text-white rounded-lg"
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
    </div>
  );
};
export default DoctorView;