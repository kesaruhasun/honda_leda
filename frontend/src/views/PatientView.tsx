import React, { useState, useEffect } from 'react';
import {
  Users,
  AlertCircle,
  Plus,
  Clock,
  ShieldAlert,
  Kanban,
  Table as TableIcon,
  Archive,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { DataTable, Column } from '../components/common/DataTable';
import { SlideOverDrawer } from '../components/common/SlideOverDrawer';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { Patient, TriagePriority, BloodGroup } from '../types';
import { patientApi } from '../services/api';

export const PatientView: React.FC = () => {
  const { showToast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [triageFilter, setTriageFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'board'>('table');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Quick Triage Escalation Confirmation Modal
  const [escalatingPatient, setEscalatingPatient] = useState<Patient | null>(null);
  const [targetTriageLevel, setTargetTriageLevel] = useState<TriagePriority>('EMERGENCY');

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await patientApi.getAll();
      setPatients(response.data || []);
    } catch (err: any) {
      showToast('error', 'Error', err.message || 'Failed to load patient records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Handle Debounced Live Backend Search
  useEffect(() => {
    if (!searchTerm.trim()) {
      fetchPatients();
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await patientApi.search(searchTerm);
        setPatients(res.data || []);
      } catch {
        // Fallback to client side filter
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nicPassportNo: '',
    dob: '1992-05-14',
    gender: 'MALE' as const,
    bloodGroup: 'O+' as BloodGroup,
    contactNumber: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    triagePriority: 'ROUTINE' as TriagePriority,
    allergies: '',
    vitalsHeartRate: 75,
    vitalsBloodPressure: '120/80',
    vitalsSpO2: 98,
    vitalsTemperature: '36.8',
  });

  const activePatients = patients.filter((p) => !p.isArchived);
  const filteredPatients = activePatients.filter((p) => {
    const matchesTriage = triageFilter === 'ALL' || p.triagePriority === triageFilter;
    return matchesTriage;
  });

  const emergencyPatients = activePatients.filter((p) => p.triagePriority === 'EMERGENCY');
  const urgentPatients = activePatients.filter((p) => p.triagePriority === 'URGENT');
  const routinePatients = activePatients.filter((p) => p.triagePriority === 'ROUTINE' || !p.triagePriority);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.nicPassportNo) {
      showToast('error', 'Validation Error', 'First name, last name, and NIC/Passport are mandatory.');
      return;
    }

    try {
      await patientApi.create({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        nicPassportNo: formData.nicPassportNo.trim(),
        dob: formData.dob || '1990-01-01',
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        contactNumber: formData.contactNumber.trim(),
        emergencyContactName: formData.emergencyContactName.trim() || 'Self',
        emergencyContactRelationship: formData.emergencyContactRelationship.trim() || 'Other',
        emergencyContactPhone: formData.emergencyContactPhone.trim() || formData.contactNumber.trim(),
        triagePriority: formData.triagePriority,
        allergies: formData.allergies.trim() || 'None',
        vitalsHeartRate: Number(formData.vitalsHeartRate) || 75,
        vitalsBloodPressure: formData.vitalsBloodPressure || '120/80',
        vitalsSpO2: Number(formData.vitalsSpO2) || 98,
        vitalsTemperature: formData.vitalsTemperature || '36.8',
      });
      setIsRegisterModalOpen(false);
      showToast(
        'success',
        'Patient Admitted to Triage',
        `${formData.firstName} ${formData.lastName} logged under ${formData.triagePriority} priority.`
      );
      fetchPatients();
    } catch (err: any) {
      showToast('error', 'Registration Failed', err.message || 'Could not save patient record.');
    }
  };

  const handleConfirmEscalation = async () => {
    if (!escalatingPatient) return;
    try {
      const updated = {
        ...escalatingPatient,
        triagePriority: targetTriageLevel,
      };
      await patientApi.update(escalatingPatient.id, updated);
      showToast(
        'warning',
        'Triage Status Reclassified',
        `Patient ${escalatingPatient.fullName || escalatingPatient.firstName} updated to ${targetTriageLevel}.`
      );
      setEscalatingPatient(null);
      if (selectedPatient?.id === escalatingPatient.id) {
        setSelectedPatient(updated);
      }
      fetchPatients();
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message || 'Could not update triage priority');
    }
  };

  const handleArchivePatient = async (patient: Patient) => {
    if (!window.confirm(`Are you sure you want to archive record for ${patient.fullName || patient.firstName}?`)) return;
    try {
      await patientApi.archive(patient.id);
      showToast('info', 'Record Soft-Archived', `Chart #${patient.patientId} moved to historical archive.`);
      if (selectedPatient?.id === patient.id) setSelectedPatient(null);
      fetchPatients();
    } catch (err: any) {
      showToast('error', 'Archive Failed', err.message || 'Could not archive patient record');
    }
  };

  // Define Columns for DataTable
  const tableColumns: Column<Patient>[] = [
    {
      key: 'patientId',
      header: 'Patient ID',
      sortable: true,
      render: (p) => (
        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {p.patientId}
        </span>
      ),
    },
    {
      key: 'fullName',
      header: 'Full Name',
      mobileTitle: true,
      sortable: true,
      render: (p) => (
        <div>
          <div className="font-bold text-slate-900 truncate" title={p.fullName || `${p.firstName} ${p.lastName}`}>
            {p.fullName || `${p.firstName} ${p.lastName}`}
          </div>
          <div className="text-[10px] font-mono text-slate-500">NIC: {p.nicPassportNo}</div>
        </div>
      ),
    },
    {
      key: 'triagePriority',
      header: 'Triage Priority',
      sortable: true,
      render: (p) => <StatusBadge status={p.triagePriority} dot />,
    },
    {
      key: 'bloodGroup',
      header: 'Blood Group',
      sortable: true,
      render: (p) => (
        <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
          {p.bloodGroup || 'O+'}
        </span>
      ),
    },
    {
      key: 'contactNumber',
      header: 'Contact Phone',
      render: (p) => (
        <span className="font-mono text-slate-700 whitespace-nowrap">
          {p.contactNumber || p.phoneNumber || '077 123 4567'}
        </span>
      ),
    },
    {
      key: 'allergies',
      header: 'Allergies / Flags',
      render: (p) => (
        <span
          className={`text-xs truncate max-w-[150px] inline-block ${
            p.allergies && p.allergies !== 'None' ? 'text-rose-600 font-semibold' : 'text-slate-500'
          }`}
          title={p.allergies}
        >
          {p.allergies || 'None reported'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans min-w-0">
      {/* Clinician Duty Station Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
              Central Patient Registry &amp; Triage Station
            </h1>
            <StatusBadge status="ACTIVE" dot />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time master patient index (MPI), emergency triage queue, and longitudinal health charts.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Registry Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'board' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="h-3.5 w-3.5" />
              <span>Triage Board</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsRegisterModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Admit / Register Patient</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
        <StatCard
          title="Emergency Priority"
          value={emergencyPatients.length}
          subtitle="Requires immediate resuscitation"
          icon={ShieldAlert}
          variant="rose"
          loading={loading}
          trend={{ value: 'RED FLAG', isPositive: false }}
        />
        <StatCard
          title="Urgent Queue"
          value={urgentPatients.length}
          subtitle="Priority consultation queue"
          icon={AlertCircle}
          variant="amber"
          loading={loading}
          trend={{ value: 'Elevated', isPositive: false }}
        />
        <StatCard
          title="Routine OPD Intake"
          value={routinePatients.length}
          subtitle="Standard outpatient appointments"
          icon={Clock}
          variant="teal"
          loading={loading}
          trend={{ value: 'Stable', isPositive: true }}
        />
        <StatCard
          title="Active Patient Index"
          value={activePatients.length}
          subtitle="Registered electronic medical records"
          icon={Users}
          variant="emerald"
          loading={loading}
          trend={{ value: '100% Synced', isPositive: true }}
        />
      </div>

      {/* Main View Mode Selector */}
      {viewMode === 'table' ? (
        <DataTable<Patient>
          data={filteredPatients}
          columns={tableColumns}
          keyExtractor={(p) => p.id}
          loading={loading}
          title="Registered Patient Master Directory"
          subtitle="Interactive list with debounced backend search & sorting"
          searchPlaceholder="Search by name, NIC, Patient ID, allergies..."
          searchFilter={(p, q) =>
            p.fullName?.toLowerCase().includes(q) ||
            p.nicPassportNo.toLowerCase().includes(q) ||
            p.patientId.toLowerCase().includes(q) ||
            (p.allergies ? p.allergies.toLowerCase().includes(q) : false)
          }
          onRowClick={(patient) => setSelectedPatient(patient)}
          headerRight={
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Filter Triage:</span>
              <select
                value={triageFilter}
                onChange={(e) => setTriageFilter(e.target.value)}
                className="text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="ALL">All Priorities</option>
                <option value="EMERGENCY">🔴 Emergency</option>
                <option value="URGENT">🟡 Urgent</option>
                <option value="ROUTINE">🟢 Routine</option>
              </select>
            </div>
          }
          actions={(p) => (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSelectedPatient(p)}
                className="px-2.5 py-1 text-[11px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-md border border-teal-200/80 transition-colors"
              >
                Open Chart
              </button>
              <button
                type="button"
                onClick={() => handleArchivePatient(p)}
                className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                title="Soft Archive Record"
              >
                <Archive className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        />
      ) : (
        /* Triage Board View (Kanban Style) */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 min-w-0">
          {/* Emergency Column */}
          <div className="apple-card p-4 bg-rose-50/30 border-rose-200/80 space-y-3 flex flex-col h-[600px] min-w-0">
            <div className="flex items-center justify-between pb-2 border-b border-rose-200/60">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-600 animate-pulse" />
                <h3 className="font-bold text-sm text-rose-900">Emergency (Stat)</h3>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                {emergencyPatients.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
              {emergencyPatients.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  className="p-3.5 rounded-xl bg-white border border-rose-200 shadow-2xs hover:border-rose-300 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-slate-500">{p.patientId}</span>
                    <StatusBadge status="EMERGENCY" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 truncate">{p.fullName || `${p.firstName} ${p.lastName}`}</h4>
                  <div className="text-[11px] text-slate-500 font-mono">NIC: {p.nicPassportNo} &bull; Blood: {p.bloodGroup}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Urgent Column */}
          <div className="apple-card p-4 bg-amber-50/30 border-amber-200/80 space-y-3 flex flex-col h-[600px] min-w-0">
            <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <h3 className="font-bold text-sm text-amber-900">Urgent Priority</h3>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                {urgentPatients.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
              {urgentPatients.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  className="p-3.5 rounded-xl bg-white border border-amber-200 shadow-2xs hover:border-amber-300 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-slate-500">{p.patientId}</span>
                    <StatusBadge status="URGENT" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 truncate">{p.fullName || `${p.firstName} ${p.lastName}`}</h4>
                  <div className="text-[11px] text-slate-500 font-mono">NIC: {p.nicPassportNo} &bull; Blood: {p.bloodGroup}</div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEscalatingPatient(p);
                      setTargetTriageLevel('EMERGENCY');
                    }}
                    className="w-full mt-1 py-1 px-2 rounded text-[10px] font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                  >
                    ⚡ Escalate to Emergency
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Routine Column */}
          <div className="apple-card p-4 bg-teal-50/20 border-teal-200/80 space-y-3 flex flex-col h-[600px] min-w-0">
            <div className="flex items-center justify-between pb-2 border-b border-teal-200/60">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                <h3 className="font-bold text-sm text-teal-900">Routine Outpatient</h3>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                {routinePatients.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
              {routinePatients.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-teal-300 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-slate-500">{p.patientId}</span>
                    <StatusBadge status="ROUTINE" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 truncate">{p.fullName || `${p.firstName} ${p.lastName}`}</h4>
                  <div className="text-[11px] text-slate-500 font-mono">NIC: {p.nicPassportNo} &bull; Blood: {p.bloodGroup}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Patient Detail SlideOverDrawer Inspector */}
      <SlideOverDrawer
        isOpen={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        title={selectedPatient ? selectedPatient.fullName || `${selectedPatient.firstName} ${selectedPatient.lastName}` : ''}
        subtitle={selectedPatient ? `Chart #${selectedPatient.patientId} • NIC: ${selectedPatient.nicPassportNo}` : ''}
        size="lg"
      >
        {selectedPatient && (
          <div className="space-y-5 text-xs font-sans">
            {/* Header Vitals Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block">HEART RATE</span>
                <span className={`text-sm font-bold ${(selectedPatient.vitalsHeartRate || 75) > 100 ? 'text-rose-600' : 'text-slate-800'}`}>
                  {selectedPatient.vitalsHeartRate || 75} bpm
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">BLOOD PRESSURE</span>
                <span className="text-sm font-bold text-slate-800">{selectedPatient.vitalsBloodPressure || '120/80'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">SPO2</span>
                <span className={`text-sm font-bold ${(selectedPatient.vitalsSpO2 || 98) < 95 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {selectedPatient.vitalsSpO2 || 98}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">TEMP</span>
                <span className="text-sm font-bold text-slate-800">{selectedPatient.vitalsTemperature || '36.8'} °C</span>
              </div>
            </div>

            {/* Demographics */}
            <div className="space-y-2 p-4 rounded-xl border border-slate-200 bg-white">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Demographics &amp; Contact</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">DOB / Age</span>
                  <span className="font-semibold text-slate-800 font-mono">{selectedPatient.dob || selectedPatient.dateOfBirth || '1992-05-14'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Gender</span>
                  <span className="font-semibold text-slate-800">{selectedPatient.gender || 'MALE'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Blood Group</span>
                  <span className="font-bold text-rose-700 font-mono">{selectedPatient.bloodGroup || 'O+'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Primary Phone</span>
                  <span className="font-semibold text-slate-800 font-mono">{selectedPatient.contactNumber || selectedPatient.phoneNumber || '077 123 4567'}</span>
                </div>
              </div>
            </div>

            {/* Allergy Banner */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
              <span className="font-bold text-amber-900 uppercase text-[10px] tracking-wider block">Known Contraindications &amp; Allergies</span>
              <p className="text-amber-800 font-semibold">{selectedPatient.allergies || 'None reported'}</p>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-1.5 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Next-of-Kin Emergency Contact</h4>
              <p className="text-slate-800 font-bold">{selectedPatient.emergencyContactName || 'Self'}</p>
              <p className="text-slate-500">
                Relation: {selectedPatient.emergencyContactRelationship || 'Other'} &bull; Phone:{' '}
                <span className="font-mono text-slate-800 font-bold">{selectedPatient.emergencyContactPhone || selectedPatient.contactNumber}</span>
              </p>
            </div>
          </div>
        )}
      </SlideOverDrawer>

      {/* Patient Registration Modal */}
      {isRegisterModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsRegisterModalOpen(false)}
          title="Admit / Register New Patient Chart"
          subtitle="Create an Electronic Medical Record (EMR) chart in the hospital system"
          maxWidth="lg"
        >
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="E.g. Anura"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="E.g. Perera"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">NIC / Passport No *</label>
                <input
                  type="text"
                  required
                  value={formData.nicPassportNo}
                  onChange={(e) => setFormData({ ...formData, nicPassportNo: e.target.value })}
                  placeholder="199214502845"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  placeholder="077 123 4567"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Triage Priority</label>
                <select
                  value={formData.triagePriority}
                  onChange={(e) => setFormData({ ...formData, triagePriority: e.target.value as any })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
                >
                  <option value="ROUTINE">🟢 Routine Outpatient</option>
                  <option value="URGENT">🟡 Urgent Priority</option>
                  <option value="EMERGENCY">🔴 Emergency Stat</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value as any })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 font-mono"
                >
                  <option value="O+">O+</option>
                  <option value="A+">A+</option>
                  <option value="B+">B+</option>
                  <option value="AB+">AB+</option>
                  <option value="O-">O-</option>
                  <option value="A-">A-</option>
                  <option value="B-">B-</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Known Allergies / Flags</label>
              <input
                type="text"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                placeholder="Penicillin, NSAIDs, Peanuts..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="px-4 py-2 rounded-lg border text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs"
              >
                Admit to Registry
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Escalation Confirmation Modal */}
      {escalatingPatient && (
        <Modal
          isOpen={true}
          onClose={() => setEscalatingPatient(null)}
          title="Escalate Patient Triage Priority"
          subtitle={`Reclassify urgency level for ${escalatingPatient.fullName || escalatingPatient.firstName}`}
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs font-sans">
            <p className="text-slate-600">
              You are reclassifying this patient to <strong>{targetTriageLevel}</strong> priority. This will alert attending physicians immediately.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEscalatingPatient(null)}
                className="px-3.5 py-1.5 rounded-lg border text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEscalation}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Confirm Escalation
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PatientView;
