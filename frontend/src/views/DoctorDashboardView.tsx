import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Users,
  CheckCircle2,
  Clock,
  Pill,
  FlaskConical,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useRole } from '../context/RoleContext';
import { appointmentApi, pharmacyApi, labApi } from '../services/api';
import { Appointment } from '../types';
import { AppointmentCalendar } from '../components/appointments/AppointmentCalendar';

export const DoctorDashboardView: React.FC = () => {
  const { showToast } = useToast();
  const { currentUser } = useRole();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Quick Action Modals
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);

  // Form states
  const [rxNotes, setRxNotes] = useState('');
  const [rxDrugName, setRxDrugName] = useState('Paracetamol 500mg');
  const [rxDosage, setRxDosage] = useState('1 tab tds after meals');
  const [labTestType, setLabTestType] = useState('Full Blood Count (FBC)');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentApi.getAll();
      setAppointments(res.data);
      if (res.data.length > 0 && !selectedAppointment) {
        setSelectedAppointment(res.data[0]);
      }
    } catch (err: any) {
      showToast('error', 'Error', 'Failed to load doctor consultations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCompleteConsultation = async (apptId: number) => {
    try {
      await appointmentApi.complete(apptId);
      showToast('success', 'Encounter Completed', 'Patient consultation marked as completed.');
      fetchAppointments();
    } catch (err: any) {
      showToast('error', 'Error', 'Could not complete consultation');
    }
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    try {
      await pharmacyApi.createPrescription({
        patientId: selectedAppointment.patientId,
        doctorId: selectedAppointment.doctorId || 1,
        appointmentId: selectedAppointment.id,
        notes: rxNotes || `${rxDrugName} - ${rxDosage}`,
        status: 'PENDING',
      });
      showToast('success', 'Prescription Issued', 'Medication sent to hospital pharmacy dispensary.');
      setIsRxModalOpen(false);
      setRxNotes('');
    } catch (err: any) {
      showToast('error', 'Error', 'Failed to issue prescription');
    }
  };

  const handleOrderLabTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    try {
      await labApi.orderTest({
        patientId: selectedAppointment.patientId,
        appointmentId: selectedAppointment.id,
        clinicalIndication: `Ordered by Dr. ${currentUser.name} during consultation`,
        urgency: 'ROUTINE',
      });
      showToast('success', 'Laboratory Order Sent', 'Diagnostic request dispatched to central pathology.');
      setIsLabModalOpen(false);
    } catch (err: any) {
      showToast('error', 'Error', 'Failed to order lab diagnostic');
    }
  };

  const queue = appointments.filter((a) => a.status === 'SCHEDULED');
  const completed = appointments.filter((a) => a.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      {/* Header Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patients in Queue</span>
            <span className="p-2 rounded-lg bg-teal-50 text-teal-600"><Users className="h-4 w-4" /></span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 font-mono">{queue.length}</span>
            <span className="text-xs text-slate-500 ml-2">waiting for consult</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Today</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-4 w-4" /></span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 font-mono">{completed.length}</span>
            <span className="text-xs text-emerald-600 ml-2 font-medium">consultations done</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Room</span>
            <span className="p-2 rounded-lg bg-sky-50 text-sky-600"><Stethoscope className="h-4 w-4" /></span>
          </div>
          <div className="mt-3">
            <span className="text-lg font-bold text-slate-900">Room 204</span>
            <span className="text-xs text-slate-500 ml-2">Consultation Suite B</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Duty Status</span>
            <span className="p-2 rounded-lg bg-purple-50 text-purple-600"><Clock className="h-4 w-4" /></span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-bold text-slate-800">Active On-Duty</span>
          </div>
        </div>
      </div>

      {/* Main Clinical Station Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Queue List */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Active Consultation Queue</h3>
              <p className="text-xs text-slate-500">Select a patient to open clinical encounter</p>
            </div>
            <span className="px-2 py-0.5 text-xs font-bold font-mono rounded bg-slate-100 text-slate-700">
              {queue.length}
            </span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading queue...</div>
            ) : appointments.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No appointments scheduled today.</div>
            ) : (
              appointments.map((appt) => {
                const isSelected = selectedAppointment?.id === appt.id;
                return (
                  <button
                    key={appt.id}
                    onClick={() => setSelectedAppointment(appt)}
                    className={`w-full text-left p-3.5 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/50 shadow-xs'
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{appt.patientName}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {appt.appointmentTime?.slice(0, 5)}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-slate-500 line-clamp-1">
                      {appt.reasonForVisit || 'Routine Consultation'}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">{appt.appointmentNumber}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        appt.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        appt.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-sky-50 text-sky-700 border border-sky-200'
                      }`}>
                        {appt.status}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Patient Encounter Details & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {selectedAppointment ? (
            <div className="rounded-xl border border-slate-200 bg-white shadow-xs p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{selectedAppointment.patientName}</h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      NIC: {selectedAppointment.patientNic || 'Verified'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Appointment: {selectedAppointment.appointmentNumber} &bull; Scheduled: {selectedAppointment.appointmentDate} at {selectedAppointment.appointmentTime?.slice(0, 5)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedAppointment.status === 'SCHEDULED' && (
                    <button
                      onClick={() => handleCompleteConsultation(selectedAppointment.id)}
                      className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Complete Consultation
                    </button>
                  )}
                </div>
              </div>

              {/* Patient Vitals & Reason */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chief Complaint</span>
                  <p className="text-sm text-slate-800 font-medium">
                    {selectedAppointment.reasonForVisit || 'General Medical Consultation'}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Consultation Room</span>
                  <p className="text-sm text-slate-800 font-medium">
                    {selectedAppointment.roomNumber || 'Room 204'} (Central Wing)
                  </p>
                </div>
              </div>

              {/* Fast Clinical Encounter Actions */}
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                  Clinical Orders & Therapy
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setIsRxModalOpen(true)}
                    className="p-4 rounded-lg border border-teal-200 bg-teal-50/40 hover:bg-teal-50 text-left transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
                        <Pill className="h-4 w-4 text-teal-600" />
                        <span>Prescribe Medications</span>
                      </div>
                      <p className="text-xs text-teal-600 mt-1">Issue digital prescription directly to pharmacy</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setIsLabModalOpen(true)}
                    className="p-4 rounded-lg border border-purple-200 bg-purple-50/40 hover:bg-purple-50 text-left transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-purple-800 font-bold text-sm">
                        <FlaskConical className="h-4 w-4 text-purple-600" />
                        <span>Order Laboratory Tests</span>
                      </div>
                      <p className="text-xs text-purple-600 mt-1">Request hematology, biochemistry, or pathology</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-sm">
              <Stethoscope className="h-8 w-8 text-slate-300 mb-2" />
              <span>Select an appointment from the queue to start encounter</span>
            </div>
          )}

          {/* Doctor Working Schedule Calendar */}
          <AppointmentCalendar role="DOCTOR" doctorId={1} />
        </div>
      </div>

      {/* Prescription Modal */}
      {isRxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Issue Medication Prescription</h3>
              <button onClick={() => setIsRxModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleCreatePrescription} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Medication / Formula</label>
                <input
                  type="text"
                  value={rxDrugName}
                  onChange={(e) => setRxDrugName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dosage & Frequency</label>
                <input
                  type="text"
                  value={rxDosage}
                  onChange={(e) => setRxDosage(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Instructions & Notes</label>
                <textarea
                  value={rxNotes}
                  onChange={(e) => setRxNotes(e.target.value)}
                  placeholder="Take after food for 5 days..."
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRxModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-xs font-semibold text-white shadow-xs"
                >
                  Send to Pharmacy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lab Order Modal */}
      {isLabModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Order Laboratory Diagnostics</h3>
              <button onClick={() => setIsLabModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleOrderLabTest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnostic Investigation</label>
                <select
                  value={labTestType}
                  onChange={(e) => setLabTestType(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
                >
                  <option>Full Blood Count (FBC) with ESR</option>
                  <option>Fasting Blood Sugar (FBS)</option>
                  <option>Lipid Profile Panel (HDL/LDL/Triglycerides)</option>
                  <option>Renal Function Test (Serum Creatinine)</option>
                  <option>Liver Function Test (SGPT/SGOT)</option>
                  <option>HbA1c Glycated Hemoglobin</option>
                  <option>Thyroid Stimulating Hormone (TSH)</option>
                  <option>Dengue NS1 Antigen Rapid</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLabModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-xs font-semibold text-white shadow-xs"
                >
                  Dispatch Lab Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboardView;
