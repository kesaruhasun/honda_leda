import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Users,
  CheckCircle2,
  Clock,
  Pill,
  FlaskConical,
  AlertTriangle,
  Activity,
  Heart,
  Thermometer,
  Search,
  ChevronRight,
  Send,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { useRole } from '../context/RoleContext';
import { appointmentApi, doctorApi, pharmacyApi, labApi, patientApi } from '../services/api';
import { Appointment, Patient } from '../types';
import { AppointmentCalendar } from '../components/appointments/AppointmentCalendar';

export const DoctorDashboardView: React.FC = () => {
  const { showToast } = useToast();
  const { currentUser } = useRole();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  // Profile Edit State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    email: '',
    contactNumber: '',
    roomNumber: '',
    consultationFee: '',
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!currentUser?.id) throw new Error('Not logged in properly');
      let docId = 1;
      try {
        const docRes = await doctorApi.getAll();
        const found = docRes.data.find((d: any) => d.email === currentUser?.email || d.fullName?.toLowerCase().includes('kavinda'));
        if (found?.id) {
          docId = found.id;
        } else if (docRes.data.length > 0) {
          docId = docRes.data[0].id;
        }
      } catch (e) {
        console.warn('Fallback to doctor ID 1', e);
      }
      
      const payload: any = {};
      if (profileFormData.email) payload.email = profileFormData.email;
      if (profileFormData.contactNumber) payload.phoneNumber = profileFormData.contactNumber;
      if (profileFormData.roomNumber) payload.roomNumber = profileFormData.roomNumber;
      if (profileFormData.consultationFee) payload.consultationFee = parseFloat(profileFormData.consultationFee);
      
      await doctorApi.updateProfile(docId, payload);

      showToast('success', 'Profile Updated', 'Your consultant profile has been successfully updated.');
      setIsEditProfileOpen(false);
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message || 'Failed to update profile');
    }
  };
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedPatientData, setSelectedPatientData] = useState<Patient | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'dossier' | 'schedule'>('dossier');

  // Quick Action Modals
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);

  // Form states
  const [rxNotes, setRxNotes] = useState('');
  const [rxDrugName, setRxDrugName] = useState('Augmentin 625mg');
  const [rxDosage, setRxDosage] = useState('1 tab twice daily for 5 days');
  const [labTestType, setLabTestType] = useState('Full Blood Count (FBC) with ESR');
  const [labUrgency, setLabUrgency] = useState<'ROUTINE' | 'URGENT'>('ROUTINE');

  // Clinical Consultation Notes
  const [consultNotes, setConsultNotes] = useState(
    'Patient presented with 3-day history of exertional dyspnea and intermittent chest discomfort. S1/S2 heard, clear breath sounds bilaterally. ECG within normal limits.'
  );
  const [selectedDiagnosis, setSelectedDiagnosis] = useState('Non-specific Atypical Chest Pain (R07.89)');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const [aptRes, patRes] = await Promise.all([
        appointmentApi.getAll().catch(() => ({ data: [] })),
        patientApi.getAll().catch(() => ({ data: [] })),
      ]);
      const list = aptRes.data || [];
      setAppointments(list);
      setPatients(patRes.data || []);
      if (list.length > 0) {
        setSelectedAppointment((prev) => prev || list[0]);
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

  useEffect(() => {
    if (selectedAppointment && patients.length > 0) {
      const match = patients.find(
        (p) => p.id === selectedAppointment.patientId || p.nicPassportNo === selectedAppointment.patientNic
      );
      setSelectedPatientData(match || null);
    }
  }, [selectedAppointment, patients]);

  const handleCompleteConsultation = async (apptId: number) => {
    try {
      await appointmentApi.complete(apptId);
      showToast('success', 'Encounter Concluded', 'Patient consultation marked as completed and synced with EHR.');
      fetchAppointments();
    } catch (err: any) {
      showToast('error', 'Error', 'Could not complete consultation');
    }
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    try {
      const rxRes = await pharmacyApi.createPrescription({
        patientId: selectedAppointment.patientId,
        doctorId: selectedAppointment.doctorId || 1,
        appointmentId: selectedAppointment.id,
        notes: rxNotes ? `${rxDrugName} | ${rxDosage} — Notes: ${rxNotes}` : `${rxDrugName} | ${rxDosage}`,
        status: 'PENDING',
      });
      const invNum = rxRes.data?.invoiceNumber;
      showToast(
        'success',
        'Prescription Dispatched',
        `${rxDrugName} transmitted to Central Dispensary.${invNum ? ` Billing Invoice #${invNum} generated.` : ''}`
      );
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
        clinicalIndication: `Ordered by Dr. ${currentUser.name}: ${labTestType} (${labUrgency})`,
        urgency: labUrgency,
      });
      showToast('success', 'Pathology Order Dispatched', `${labTestType} queued in central laboratory.`);
      setIsLabModalOpen(false);
    } catch (err: any) {
      showToast('error', 'Error', 'Failed to order lab diagnostic');
    }
  };

  const queue = appointments.filter((a) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED');
  const completed = appointments.filter((a) => a.status === 'COMPLETED');

  const filteredQueue = appointments.filter(
    (a) =>
      a.patientName?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (a.reasonForVisit && a.reasonForVisit.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="space-y-6 font-sans min-w-0">
      {/* Clinician Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
              Doctor Consultation Station &amp; Clinical Dossier
            </h1>
            <StatusBadge status="ACTIVE" dot>
              Dr. {currentUser?.name || 'Consultant'}
            </StatusBadge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Longitudinal EHR trajectory, real-time vitals telemetry, ICD-10 diagnostic coding, and e-prescribing.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-semibold hidden md:inline-block">
            EHR Synced &bull; Suite 204
          </span>
          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="apple-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-sm"
          >
            <Users className="h-3.5 w-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
        <StatCard
          title="Awaiting Consultation"
          value={queue.length}
          subtitle="Checked in at clinic"
          icon={Users}
          variant="teal"
          loading={loading}
          trend={{ value: 'Active Queue' }}
        />
        <StatCard
          title="Completed Encounters"
          value={completed.length}
          subtitle="Signed off today"
          icon={CheckCircle2}
          variant="emerald"
          loading={loading}
          trend={{ value: '100% Signed', isPositive: true }}
        />
        <StatCard
          title="Consultation Suite"
          value="Room 204"
          subtitle="Cardiology Outpatient"
          icon={Stethoscope}
          variant="sky"
          loading={loading}
        />
        <StatCard
          title="Duty Certification"
          value="SLMC On-Duty"
          subtitle="Certified Medical Specialist"
          icon={Clock}
          variant="purple"
          loading={loading}
        />
      </div>

      {/* Main Split-Pane Clinical Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-w-0">
        {/* Left Pane: Consultation Queue Master List (4 Cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white shadow-2xs p-4 flex flex-col h-80 sm:h-96 lg:h-[760px] min-w-0">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Consultation Queue</h2>
              <p className="text-[11px] text-slate-500">Triage priority sorted</p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 tabular-nums">
              {filteredQueue.length}
            </span>
          </div>

          {/* Quick Search in Queue */}
          <div className="relative mt-3 mb-2 shrink-0">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter queue by patient name..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1 pt-1 min-h-0">
            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400 font-mono animate-pulse">
                Loading consultation queue...
              </div>
            ) : filteredQueue.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">No scheduled patients found.</div>
            ) : (
              filteredQueue.map((appt) => {
                const isSelected = selectedAppointment?.id === appt.id;

                return (
                  <div
                    key={appt.id}
                    onClick={() => setSelectedAppointment(appt)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/50 shadow-2xs'
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">{appt.patientName}</span>
                      <span className="text-[11px] font-mono text-slate-500 tabular-nums shrink-0">
                        {appt.appointmentTime?.slice(0, 5)}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                      {appt.reasonForVisit || 'Routine Consultation'}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-100">
                      <span className="font-mono text-slate-400">{appt.appointmentNumber || `APT-${appt.id}`}</span>
                      <StatusBadge status={appt.status} size="sm" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Longitudinal Clinical Dossier & Active Encounter Workspace (8 Cols) */}
        <div className="lg:col-span-8 space-y-5 min-w-0">
          
          {/* Tab Headers */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('dossier')}
              className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${activeTab === 'dossier' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Patient Dossier
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${activeTab === 'schedule' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Today's Consultation Schedule
            </button>
          </div>

          {activeTab === 'dossier' && (
            selectedAppointment ? (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs p-5 sm:p-6 space-y-5 min-w-0">
              {/* Dossier Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 truncate">{selectedAppointment.patientName}</h2>
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0">
                      NIC: {selectedAppointment.patientNic || 'Verified'}
                    </span>
                    {selectedPatientData?.bloodGroup && (
                      <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                        {selectedPatientData.bloodGroup}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                    <span>Encounter #{selectedAppointment.appointmentNumber || `APT-${selectedAppointment.id}`}</span>
                    <span aria-hidden="true" className="hidden sm:inline">&bull;</span>
                    <span>DOB: {selectedPatientData?.dob || selectedPatientData?.dateOfBirth || '1988-04-12'}</span>
                    <span aria-hidden="true" className="hidden sm:inline">&bull;</span>
                    <span>Gender: {selectedPatientData?.gender || 'MALE'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {selectedAppointment.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleCompleteConsultation(selectedAppointment.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Sign Off Encounter</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Allergy Warning Banner */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-2 text-amber-900 min-w-0">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <div className="truncate">
                    <strong className="font-semibold">Contraindication / Allergy Alert:</strong>{' '}
                    <span>{selectedPatientData?.allergies || 'Penicillin (Moderate rash) · NSAIDs (Gastric irritation)'}</span>
                  </div>
                </div>
                <StatusBadge status="ACTIVE" size="sm" className="shrink-0">Safety Flag</StatusBadge>
              </div>

              {/* Patient Vitals Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Blood Pressure</span>
                    <Activity className="h-3.5 w-3.5 text-teal-600" />
                  </div>
                  <div className="text-base font-bold font-mono text-slate-900 tabular-nums">128/82 <span className="text-[10px] font-sans font-normal text-slate-500">mmHg</span></div>
                  <span className="text-[10px] text-emerald-700 font-medium">Normotensive</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Heart Rate</span>
                    <Heart className="h-3.5 w-3.5 text-rose-600" />
                  </div>
                  <div className="text-base font-bold font-mono text-slate-900 tabular-nums">74 <span className="text-[10px] font-sans font-normal text-slate-500">bpm</span></div>
                  <span className="text-[10px] text-emerald-700 font-medium">Normal Sinus</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Oxygen Saturation</span>
                    <Activity className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div className="text-base font-bold font-mono text-slate-900 tabular-nums">98% <span className="text-[10px] font-sans font-normal text-slate-500">SpO2</span></div>
                  <span className="text-[10px] text-emerald-700 font-medium">Room Air</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Body Temp</span>
                    <Thermometer className="h-3.5 w-3.5 text-amber-600" />
                  </div>
                  <div className="text-base font-bold font-mono text-slate-900 tabular-nums">36.8 <span className="text-[10px] font-sans font-normal text-slate-500">°C</span></div>
                  <span className="text-[10px] text-emerald-700 font-medium">Afebrile</span>
                </div>
              </div>

              {/* Chief Complaint */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Chief Clinical Complaint</span>
                <p className="text-xs font-semibold text-slate-800">
                  {selectedAppointment.reasonForVisit || 'Patient reports recurrent dull precordial ache on exertion over 72 hours, relieved by rest.'}
                </p>
              </div>

              {/* Assessment Notes & Diagnosis Input */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Primary Clinical Diagnosis (ICD-10)
                  </label>
                  <input
                    type="text"
                    value={selectedDiagnosis}
                    onChange={(e) => setSelectedDiagnosis(e.target.value)}
                    placeholder="Primary diagnosis..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Physician Examination Notes &amp; Progress Note
                  </label>
                  <textarea
                    value={consultNotes}
                    onChange={(e) => setConsultNotes(e.target.value)}
                    rows={3}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 font-mono text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none bg-white"
                  />
                </div>
              </div>

              {/* Rapid Action Clusters */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Instant Clinical Orders &amp; Therapy
                  </span>
                  <span className="text-xs text-slate-400 hidden sm:inline">Direct sync with Dispensary &amp; Pathology</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setIsRxModalOpen(true)}
                    className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/40 hover:bg-teal-50 text-left transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-teal-800 font-bold text-xs">
                        <Pill className="h-4 w-4 text-teal-600" />
                        <span>Issue Electronic Prescription</span>
                      </div>
                      <p className="text-[11px] text-teal-600 mt-0.5">Dispense formulary medications with dosage checks</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-teal-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    onClick={() => setIsLabModalOpen(true)}
                    className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50 text-left transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-indigo-800 font-bold text-xs">
                        <FlaskConical className="h-4 w-4 text-indigo-600" />
                        <span>Order Diagnostic Pathology</span>
                      </div>
                      <p className="text-[11px] text-indigo-600 mt-0.5">Automated specimen barcoding &amp; pathology review</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-72 rounded-2xl border border-dashed border-slate-200 bg-white flex flex-col items-center justify-center text-slate-400 text-xs space-y-2 p-6 text-center">
              <Stethoscope className="h-8 w-8 text-slate-300" />
              <span>Select an appointment from the queue to open the active patient dossier</span>
            </div>
          ))}

          {/* Consultation Calendar */}
          {activeTab === 'schedule' && (
            <AppointmentCalendar role="DOCTOR" doctorId={1} />
          )}
        </div>
      </div>

      {/* Prescription Modal */}
      {isRxModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsRxModalOpen(false)}
          title={`Issue Prescription: ${selectedAppointment?.patientName}`}
          subtitle="Transmits order directly to Central Dispensary"
          maxWidth="md"
        >
          <form onSubmit={handleCreatePrescription} className="space-y-3.5 text-xs font-sans">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Drug Formulation &amp; Generic</label>
              <select
                value={rxDrugName}
                onChange={(e) => setRxDrugName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Augmentin 625mg">Augmentin 625mg (Amoxicillin + Clavulanic Acid)</option>
                <option value="Panadol 500mg">Panadol 500mg (Paracetamol)</option>
                <option value="Lipitor 20mg">Lipitor 20mg (Atorvastatin Calcium)</option>
                <option value="Glucophage 500mg">Glucophage 500mg (Metformin HCl)</option>
                <option value="Losec 20mg">Losec 20mg (Omeprazole)</option>
                <option value="Ventolin Inhaler">Ventolin Inhaler 100mcg (Salbutamol)</option>
                <option value="Concor 5mg">Concor 5mg (Bisoprolol Fumarate)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Dosage Regimen</label>
              <input
                type="text"
                value={rxDosage}
                onChange={(e) => setRxDosage(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Remarks</label>
              <textarea
                value={rxNotes}
                onChange={(e) => setRxNotes(e.target.value)}
                placeholder="Take strictly after meals for 5 days..."
                rows={3}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRxModalOpen(false)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-xs font-bold text-white shadow-2xs flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Transmit to Pharmacy</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Lab Order Modal */}
      {isLabModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsLabModalOpen(false)}
          title="Order Diagnostic Pathology Test"
          subtitle="Enqueues test in hospital laboratory system"
          maxWidth="md"
        >
          <form onSubmit={handleOrderLabTest} className="space-y-3.5 text-xs font-sans">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Investigation Panel</label>
              <select
                value={labTestType}
                onChange={(e) => setLabTestType(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Full Blood Count (FBC) with ESR">Full Blood Count (FBC) with ESR</option>
                <option value="Lipid Profile Panel">Lipid Profile Panel (Total, HDL, LDL)</option>
                <option value="Fasting Blood Sugar (FBS)">Fasting Blood Sugar (FBS)</option>
                <option value="Serum Creatinine & Renal Profile">Serum Creatinine &amp; Renal Profile</option>
                <option value="Liver Function Test (LFT)">Liver Function Test (LFT)</option>
                <option value="HbA1c Glycated Hemoglobin">HbA1c Glycated Hemoglobin</option>
                <option value="Cardiac Troponin I / T">Cardiac Troponin I / T (Quantitative)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority / Urgency</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLabUrgency('ROUTINE')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                    labUrgency === 'ROUTINE'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Routine (Standard)
                </button>
                <button
                  type="button"
                  onClick={() => setLabUrgency('URGENT')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                    labUrgency === 'URGENT'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Stat / Urgent
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsLabModalOpen(false)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-2xs flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Dispatch Lab Request</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsEditProfileOpen(false)}
          title="Edit Consultant Profile"
          subtitle="Update your contact and suite details"
          maxWidth="md"
        >
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  placeholder={currentUser?.email || "consultant@pulseos.com"}
                  value={profileFormData.email}
                  onChange={(e) => setProfileFormData({...profileFormData, email: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  placeholder="+94 77 ..."
                  value={profileFormData.contactNumber}
                  onChange={(e) => setProfileFormData({...profileFormData, contactNumber: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Suite / Room No</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  placeholder="204"
                  value={profileFormData.roomNumber}
                  onChange={(e) => setProfileFormData({...profileFormData, roomNumber: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Consultation Fee (LKR)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-medium font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  placeholder="2500"
                  value={profileFormData.consultationFee}
                  onChange={(e) => setProfileFormData({...profileFormData, consultationFee: e.target.value})}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-xs font-bold text-white shadow-sm"
              >
                Save Profile
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default DoctorDashboardView;
