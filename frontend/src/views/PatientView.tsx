import React, { useState, useEffect } from 'react';
import { patientApi } from '../services/api';
import { Users, AlertCircle, Plus, Search, Filter, Phone, Clock, FileText } from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { Patient, TriagePriority, BloodGroup } from '../types';



export const PatientView: React.FC = () => {
  const { showToast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [triageFilter, setTriageFilter] = useState<string>('ALL');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await patientApi.getAll();
      setPatients(response.data);
    } catch (err: any) {
      showToast('error', 'Error', err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.nicPassportNo) {
      showToast('error', 'Validation Error', 'First name, last name, and NIC/Passport are required.');
      return;
    }

    try {
      await patientApi.create({
        firstName: formData.firstName,
        lastName: formData.lastName,
        nicPassportNo: formData.nicPassportNo,
        dob: formData.dob || '1990-01-01',
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        contactNumber: formData.contactNumber,
        emergencyContactName: formData.emergencyContactName || 'Self',
        emergencyContactRelationship: formData.emergencyContactRelationship || 'Other',
        emergencyContactPhone: formData.emergencyContactPhone || formData.contactNumber,
        triagePriority: formData.triagePriority,
        allergies: formData.allergies || 'None'
      });
      setIsRegisterModalOpen(false);
      showToast('success', 'Patient Registered', `Patient registered successfully.`);
      fetchPatients();
    } catch(err: any) {
      showToast('error', 'Error', err.message || 'Failed to register patient');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-clinical-ink tracking-tight">Patient Registry & Triage</h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-clinical-teal-50 text-clinical-teal-700 border border-clinical-teal-200">
              Inpatient & Outpatient Records
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


      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-clinical-teal-600 border-t-transparent rounded-full" />
        </div>
      )}
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
        subtitle="PulseOS Hospital Outpatient Intake Form"
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