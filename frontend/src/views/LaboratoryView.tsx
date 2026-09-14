import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  TestTube,
  CheckCircle2,
  Clock,
  Search,
  FileCheck,
  Plus,
  Printer,
  Shield,
  Send,
  Trash2,
  Microscope,
} from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { labApi, patientApi, doctorApi } from '../services/api';
import { LabTest, Patient, Doctor } from '../types';
import { DiagnosticReportModal } from '../components/laboratory/DiagnosticReportModal';

interface LabCatalogItem {
  id: number;
  testCode: string;
  testName: string;
  category: string;
  price: number;
  sampleType: string;
  normalRangeMin?: number;
  normalRangeMax?: number;
  measurementUnit?: string;
  turnaround?: string;
}

const DEFAULT_LAB_CATALOG: LabCatalogItem[] = [
  { id: 1, testCode: 'LAB-FBC', testName: 'Full Blood Count (FBC) with ESR', category: 'Hematology', price: 1500, sampleType: 'Whole Blood (EDTA Lavender Top)', normalRangeMin: 4.5, normalRangeMax: 11.0, measurementUnit: '10^3/uL', turnaround: '2 Hours' },
  { id: 2, testCode: 'LAB-FBS', testName: 'Fasting Blood Sugar (FBS)', category: 'Biochemistry', price: 650, sampleType: 'Fluoride Plasma (Grey Top)', normalRangeMin: 70.0, normalRangeMax: 99.0, measurementUnit: 'mg/dL', turnaround: '1 Hour' },
  { id: 3, testCode: 'LAB-LIP', testName: 'Lipid Profile Panel (Total, HDL, LDL, Triglycerides)', category: 'Biochemistry', price: 2800, sampleType: 'Serum (Gold Top SST)', normalRangeMin: 100.0, normalRangeMax: 199.0, measurementUnit: 'mg/dL', turnaround: '4 Hours' },
  { id: 4, testCode: 'LAB-KFT', testName: 'Serum Creatinine & Renal Profile (eGFR)', category: 'Biochemistry', price: 1200, sampleType: 'Serum (Gold Top SST)', normalRangeMin: 0.7, normalRangeMax: 1.2, measurementUnit: 'mg/dL', turnaround: '3 Hours' },
  { id: 5, testCode: 'LAB-LFT', testName: 'Liver Function Test (SGPT, SGOT, Bilirubin)', category: 'Biochemistry', price: 3200, sampleType: 'Serum (Gold Top SST)', normalRangeMin: 7.0, normalRangeMax: 56.0, measurementUnit: 'U/L', turnaround: '4 Hours' },
  { id: 6, testCode: 'LAB-HBA1C', testName: 'HbA1c Glycated Hemoglobin', category: 'Endocrinology', price: 2200, sampleType: 'Whole Blood (EDTA)', normalRangeMin: 4.0, normalRangeMax: 5.6, measurementUnit: '%', turnaround: '3 Hours' },
  { id: 7, testCode: 'LAB-TSH', testName: 'Thyroid Stimulating Hormone (TSH)', category: 'Endocrinology', price: 2500, sampleType: 'Serum (Gold Top SST)', normalRangeMin: 0.4, normalRangeMax: 4.0, measurementUnit: 'uIU/mL', turnaround: '6 Hours' },
  { id: 8, testCode: 'LAB-UFR', testName: 'Urine Full Report (UFR) & Microscopy', category: 'Pathology', price: 800, sampleType: 'Midstream Clean Catch Urine', normalRangeMin: 0.0, normalRangeMax: 5.0, measurementUnit: 'HPF', turnaround: '1 Hour' },
  { id: 9, testCode: 'LAB-DENGUE', testName: 'Dengue NS1 Antigen & Antibody Rapid', category: 'Serology', price: 2900, sampleType: 'Serum / Whole Blood', normalRangeMin: 0.0, normalRangeMax: 0.9, measurementUnit: 'Index', turnaround: '30 Mins' },
];

export const LaboratoryView: React.FC = () => {
  const { showToast } = useToast();
  const [tests, setTests] = useState<LabTest[]>([]);
  const [catalog, setCatalog] = useState<LabCatalogItem[]>(DEFAULT_LAB_CATALOG);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [resultModalTest, setResultModalTest] = useState<LabTest | null>(null);
  const [viewingReportTest, setViewingReportTest] = useState<LabTest | null>(null);

  // New Order Form State
  const [newOrderForm, setNewOrderForm] = useState({
    patientId: '',
    doctorId: '',
    catalogId: '1',
    urgency: 'ROUTINE',
    clinicalIndication: '',
  });

  // Result submission form
  const [resultForm, setResultForm] = useState({
    resultData: '',
    resultValue: '',
    isAbnormal: false,
    technicianNotes: '',
    notifyPatient: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [testRes, catRes, patRes, docRes] = await Promise.all([
        labApi.getTests().catch(() => ({ data: [] })),
        labApi.getCatalog().catch(() => ({ data: [] })),
        patientApi.getAll().catch(() => ({ data: [] })),
        doctorApi.getAll().catch(() => ({ data: [] })),
      ]);

      setTests(testRes.data || []);
      if (catRes.data && catRes.data.length > 0) {
        setCatalog(catRes.data);
      }
      setPatients(patRes.data || []);
      setDoctors(docRes.data || []);

      if (patRes.data && patRes.data.length > 0 && !newOrderForm.patientId) {
        setNewOrderForm((prev) => ({
          ...prev,
          patientId: String(patRes.data[0].id),
        }));
      }
      if (docRes.data && docRes.data.length > 0 && !newOrderForm.doctorId) {
        setNewOrderForm((prev) => ({
          ...prev,
          doctorId: String(docRes.data[0].id),
        }));
      }
    } catch (err: any) {
      showToast('error', 'Error Loading Lab Orders', err.message || 'Failed to fetch lab tests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (testId: number, nextStatus: string) => {
    try {
      await labApi.updateStatus(testId, nextStatus);
      const label =
        nextStatus === 'SAMPLE_COLLECTED'
          ? 'Specimen Collected & Barcoded'
          : nextStatus === 'PROCESSING'
          ? 'Specimen In Analyzer'
          : nextStatus;
      showToast('success', 'Lifecycle Progressed', `Investigation marked as ${label}.`);
      fetchData();
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message || 'Could not update status');
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderForm.patientId) {
      showToast('error', 'Patient Required', 'Please select a patient for this investigation.');
      return;
    }

    try {
      const selectedCat = catalog.find((c) => String(c.id) === String(newOrderForm.catalogId));
      await labApi.orderTest({
        patientId: Number(newOrderForm.patientId),
        doctorId: newOrderForm.doctorId ? Number(newOrderForm.doctorId) : undefined,
        labTestId: Number(newOrderForm.catalogId),
        testCatalogId: Number(newOrderForm.catalogId),
        urgency: newOrderForm.urgency,
        clinicalIndication: newOrderForm.clinicalIndication || 'Routine physician clinical investigation',
      });

      showToast(
        'success',
        'Investigation Ordered',
        `Diagnostic test '${selectedCat?.testName || 'Investigation'}' ordered with status REQUESTED.`
      );
      setIsOrderModalOpen(false);
      setNewOrderForm({
        patientId: patients[0] ? String(patients[0].id) : '',
        doctorId: doctors[0] ? String(doctors[0].id) : '',
        catalogId: '1',
        urgency: 'ROUTINE',
        clinicalIndication: '',
      });
      fetchData();
    } catch (err: any) {
      showToast('error', 'Order Failed', err.message || 'Could not create lab order');
    }
  };

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultModalTest) return;

    try {
      await labApi.submitResults(resultModalTest.id, {
        resultData: resultForm.resultData,
        resultValue: resultForm.resultValue ? parseFloat(resultForm.resultValue) : undefined,
        isAbnormal: resultForm.isAbnormal,
        technicianNotes: resultForm.technicianNotes,
        clinicalRemarks: resultForm.technicianNotes,
      });

      showToast('success', 'Results Certified', `Official diagnostic report finalized for ${resultModalTest.testName}.`);

      if (resultForm.notifyPatient) {
        setTimeout(() => {
          showToast(
            'info',
            'Patient Notification Dispatched',
            `SMS & Patient Portal Alert sent to ${resultModalTest.patientName}: "Your diagnostic report for ${resultModalTest.testName} is now ready to view."`
          );
        }, 600);
      }

      setResultModalTest(null);
      setResultForm({ resultData: '', resultValue: '', isAbnormal: false, technicianNotes: '', notifyPatient: true });
      fetchData();
    } catch (err: any) {
      showToast('error', 'Submission Failed', err.message || 'Could not save results');
    }
  };

  const handleDeleteTest = async (testId: number) => {
    if (!window.confirm('Are you sure you want to cancel / archive this laboratory specimen?')) return;
    try {
      await labApi.deleteTest(testId);
      showToast('success', 'Specimen Cancelled', 'The laboratory request has been cancelled.');
      fetchData();
    } catch (err: any) {
      showToast('error', 'Cancellation Failed', err.message || 'Could not cancel test');
    }
  };

  const handleNotifyPatient = (test: LabTest) => {
    showToast(
      'info',
      'Patient Alert Dispatched',
      `SMS & WhatsApp notification transmitted to ${test.patientName} regarding ${test.testName} certified report.`
    );
  };

  const filteredTests = tests.filter((test) => {
    const status = test.status || 'REQUESTED';
    let matchesStatus = true;
    if (statusFilter === 'REQUESTED') {
      matchesStatus = status === 'REQUESTED';
    } else if (statusFilter === 'IN_LAB') {
      matchesStatus = status === 'COLLECTED' || status === 'SAMPLE_COLLECTED' || status === 'PROCESSING';
    } else if (statusFilter === 'COMPLETED') {
      matchesStatus = status === 'COMPLETED';
    }

    const patName = test.patientName || '';
    const testName = test.testName || '';
    const reqNum = test.requestNumber || '';
    const matchesSearch =
      patName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reqNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (test.testCode && test.testCode.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Station Profile & Header */}
      <div className="apple-card p-5 bg-gradient-to-r from-white via-slate-50 to-clinical-teal-50/30 border border-slate-200/90 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-clinical-teal-600 text-white flex items-center justify-center shadow-md shadow-clinical-teal-600/20 shrink-0">
              <FlaskConical className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Clinical Pathology & Laboratory Diagnostics
                </h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-clinical-teal-50 text-clinical-teal-800 border border-clinical-teal-200">
                  Station: MLT-04 (Pathology Roster)
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  ISO 15189 Accredited
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Technologist: <strong>N. Thilakarathne, MLT</strong> &bull; Sysmex XN-1000 Hematology & Roche Cobas c311 Active
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOrderModalOpen(true)}
            className="apple-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-apple-xl bg-clinical-teal-600 hover:bg-clinical-teal-700 text-white text-xs font-bold shadow-sm transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>+ Order New Investigation</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Investigations"
          value={tests.length}
          subtitle="All recorded clinical orders"
          icon={FlaskConical}
          variant="teal"
        />
        <MetricCard
          title="Awaiting Phlebotomy"
          value={tests.filter((t) => t.status === 'REQUESTED').length}
          subtitle="Pending sample intake"
          icon={Clock}
          variant="amber"
        />
        <MetricCard
          title="In Lab Analyzers"
          value={
            tests.filter(
              (t) => t.status === 'COLLECTED' || t.status === 'SAMPLE_COLLECTED' || t.status === 'PROCESSING'
            ).length
          }
          subtitle="Assay in progression"
          icon={TestTube}
          variant="slate"
        />
        <MetricCard
          title="Certified Reports"
          value={tests.filter((t) => t.status === 'COMPLETED').length}
          subtitle="Finalized & released to patient"
          icon={CheckCircle2}
          variant="emerald"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="apple-card p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient, test code, or request ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-clinical-ink focus:outline-none focus:ring-2 focus:ring-clinical-teal-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`apple-btn px-3 py-1.5 text-xs rounded-lg font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Orders ({tests.length})
          </button>
          <button
            onClick={() => setStatusFilter('REQUESTED')}
            className={`apple-btn px-3 py-1.5 text-xs rounded-lg font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'REQUESTED'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Awaiting Sample ({tests.filter((t) => t.status === 'REQUESTED').length})
          </button>
          <button
            onClick={() => setStatusFilter('IN_LAB')}
            className={`apple-btn px-3 py-1.5 text-xs rounded-lg font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'IN_LAB'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            In Analyzers ({tests.filter((t) => t.status === 'COLLECTED' || t.status === 'SAMPLE_COLLECTED' || t.status === 'PROCESSING').length})
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`apple-btn px-3 py-1.5 text-xs rounded-lg font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'COMPLETED'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Certified Reports ({tests.filter((t) => t.status === 'COMPLETED').length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin h-8 w-8 border-2 border-clinical-teal-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        /* Specimen Worklist Table */
        <div className="apple-card overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-clinical-ink-secondary font-semibold border-b border-slate-200">
                  <th className="py-3 px-4 font-mono">Barcode / ID</th>
                  <th className="py-3 px-4">Diagnostic Assay</th>
                  <th className="py-3 px-4">Patient Demographics</th>
                  <th className="py-3 px-4">Specimen & Container</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4">Findings / Measurement</th>
                  <th className="py-3 px-4">Lifecycle Phase</th>
                  <th className="py-3 px-4 text-right">Laboratory Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTests.map((test) => {
                  const status = test.status || 'REQUESTED';
                  const isCompleted = status === 'COMPLETED';
                  const isProcessing = status === 'PROCESSING';
                  const isCollected = status === 'COLLECTED' || status === 'SAMPLE_COLLECTED';
                  const isRequested = status === 'REQUESTED';

                  return (
                    <tr key={test.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Barcode / ID */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-clinical-teal-700">
                          {test.requestNumber || `REQ-${test.id}`}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {test.testCode || 'LAB-STD'}
                        </div>
                      </td>

                      {/* Diagnostic Assay */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{test.testName}</div>
                        <div className="text-[10px] text-slate-400">
                          {test.category || 'Clinical Pathology'} &bull; LKR {Number(test.standardFee || 1500).toFixed(2)}
                        </div>
                      </td>

                      {/* Patient Demographics */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{test.patientName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          ID: PAT-{test.patientId} &bull; Dr: {test.doctorName || 'Consultant'}
                        </div>
                      </td>

                      {/* Specimen Container */}
                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-800 font-medium">
                          {test.specimenType || test.sampleType || 'Venous Blood'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Ordered: {test.testDate || '2026-09-14'}
                        </div>
                      </td>

                      {/* Urgency */}
                      <td className="py-3 px-4">
                        {test.urgency === 'URGENT' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            STAT / URGENT
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            ROUTINE
                          </span>
                        )}
                      </td>

                      {/* Findings / Measurement */}
                      <td className="py-3 px-4">
                        {isCompleted ? (
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`font-mono font-bold ${
                                  test.isAbnormal || test.flag === 'ABNORMAL'
                                    ? 'text-rose-600'
                                    : 'text-slate-900'
                                }`}
                              >
                                {test.resultData || (test.resultValue ? `${test.resultValue}` : 'Certified Normal')}
                              </span>
                              {(test.isAbnormal || test.flag === 'ABNORMAL') && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                  ABNORMAL
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Ref: {test.referenceRange || 'Normal Limits'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">
                            {isProcessing
                              ? 'Assay Underway in Analyzer...'
                              : isCollected
                              ? 'Sample In Tube Rack'
                              : 'Awaiting Phlebotomy'}
                          </span>
                        )}
                      </td>

                      {/* Lifecycle Phase Badge */}
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            isCompleted
                              ? 'success'
                              : isProcessing
                              ? 'info'
                              : isCollected
                              ? 'urgent'
                              : 'routine'
                          }
                        >
                          {isProcessing
                            ? 'ANALYZING'
                            : isCollected
                            ? 'COLLECTED'
                            : isCompleted
                            ? 'COMPLETED'
                            : 'REQUESTED'}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {/* Step 1: Collect Specimen */}
                        {isRequested && (
                          <button
                            onClick={() => handleUpdateStatus(test.id, 'SAMPLE_COLLECTED')}
                            className="apple-btn inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold text-[11px] border border-amber-200 shadow-2xs"
                            title="Collect specimen from patient and scan tube barcode"
                          >
                            <TestTube className="h-3.5 w-3.5 text-amber-600" />
                            <span>Collect Specimen</span>
                          </button>
                        )}

                        {/* Step 2: Load into Analyzer */}
                        {isCollected && (
                          <button
                            onClick={() => handleUpdateStatus(test.id, 'PROCESSING')}
                            className="apple-btn inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-[11px] border border-indigo-200 shadow-2xs"
                            title="Load sample into automated bio-chemical / hematology analyzer"
                          >
                            <Microscope className="h-3.5 w-3.5 text-indigo-600" />
                            <span>Load into Analyzer</span>
                          </button>
                        )}

                        {/* Step 3: Input Results */}
                        {(isProcessing || isCollected) && (
                          <button
                            onClick={() => {
                              setResultModalTest(test);
                              setResultForm({
                                resultData: '',
                                resultValue: '',
                                isAbnormal: false,
                                technicianNotes: 'Calibrated automated analyzer verification completed.',
                                notifyPatient: true,
                              });
                            }}
                            className="apple-btn inline-flex items-center gap-1 px-2.5 py-1 rounded bg-clinical-teal-600 text-white hover:bg-clinical-teal-700 font-bold text-[11px] shadow-xs"
                            title="Input verified readings and certify diagnostic report"
                          >
                            <FileCheck className="h-3.5 w-3.5" />
                            <span>Certify Results</span>
                          </button>
                        )}

                        {/* Step 4: View/Print Report & Alert */}
                        {isCompleted && (
                          <>
                            <button
                              onClick={() => setViewingReportTest(test)}
                              className="apple-btn inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] border border-slate-300 shadow-2xs"
                              title="Open official accredited printable laboratory report"
                            >
                              <Printer className="h-3.5 w-3.5 text-slate-600" />
                              <span>Official Report</span>
                            </button>
                            <button
                              onClick={() => handleNotifyPatient(test)}
                              className="apple-btn inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium text-[11px] border border-emerald-200"
                              title="Transmit notification to patient portal and SMS"
                            >
                              <Send className="h-3 w-3 text-emerald-600" />
                              <span>Notify</span>
                            </button>
                          </>
                        )}

                        {/* Archive / Delete Action */}
                        <button
                          onClick={() => handleDeleteTest(test.id)}
                          className="apple-btn p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors inline-block align-middle"
                          title="Cancel / Reject Specimen"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Order Modal */}
      {isOrderModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsOrderModalOpen(false)}
          title="Order Diagnostic Laboratory Investigation"
          subtitle="Create a new laboratory test order and register specimen into the pathology roster."
          maxWidth="lg"
        >
          <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
            {/* Patient Selection */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Patient *</label>
              <select
                value={newOrderForm.patientId}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, patientId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-clinical-teal-500"
                required
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName || `${p.firstName} ${p.lastName}`} (NIC: {p.nicPassportNo} &bull; Blood: {p.bloodGroup || 'O+'})
                  </option>
                ))}
              </select>
            </div>

            {/* Test Selection */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Diagnostic Assay from Catalog *</label>
              <select
                value={newOrderForm.catalogId}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, catalogId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-clinical-teal-500"
              >
                {catalog.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.testCode} - {c.testName} (LKR {Number(c.price).toFixed(2)} &bull; {c.sampleType})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Ordering Physician */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ordering Physician</label>
                <select
                  value={newOrderForm.doctorId}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, doctorId: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>

              {/* Urgency */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinical Urgency</label>
                <select
                  value={newOrderForm.urgency}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, urgency: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                >
                  <option value="ROUTINE">Routine Outpatient</option>
                  <option value="URGENT">STAT / Emergency Priority</option>
                </select>
              </div>
            </div>

            {/* Clinical Indication */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Clinical Indication / Diagnosis Notes</label>
              <input
                type="text"
                placeholder="e.g. Routine metabolic screening, follow-up on hypertension"
                value={newOrderForm.clinicalIndication}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, clinicalIndication: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOrderModalOpen(false)}
                className="apple-btn px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="apple-btn px-4 py-2 text-xs font-bold bg-clinical-teal-600 text-white rounded-lg hover:bg-clinical-teal-700 shadow-sm"
              >
                Create Investigation Order
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Result Certification Modal */}
      {resultModalTest && (
        <Modal
          isOpen={true}
          onClose={() => setResultModalTest(null)}
          title={`Input & Certify Diagnostic Findings: ${resultModalTest.testName}`}
          subtitle={`Patient: ${resultModalTest.patientName} &bull; Expected Ref: ${resultModalTest.referenceRange}`}
          maxWidth="md"
        >
          <form onSubmit={handleSubmitResult} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Quantitative Measurement & Units *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 142 mg/dL or 13.8 g/dL"
                value={resultForm.resultData}
                onChange={(e) => setResultForm({ ...resultForm, resultData: e.target.value })}
                className="w-full font-mono text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinical-teal-500"
                autoFocus
              />
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <input
                type="checkbox"
                id="isAbnormal"
                checked={resultForm.isAbnormal}
                onChange={(e) => setResultForm({ ...resultForm, isAbnormal: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <label htmlFor="isAbnormal" className="font-semibold text-slate-800 cursor-pointer">
                Flag finding as clinically abnormal / out of standard reference range
              </label>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Pathology Technologist Notes
              </label>
              <textarea
                rows={2}
                value={resultForm.technicianNotes}
                onChange={(e) => setResultForm({ ...resultForm, technicianNotes: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinical-teal-500"
              />
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-clinical-teal-50 border border-clinical-teal-200">
              <input
                type="checkbox"
                id="notifyPatient"
                checked={resultForm.notifyPatient}
                onChange={(e) => setResultForm({ ...resultForm, notifyPatient: e.target.checked })}
                className="h-4 w-4 rounded border-clinical-teal-400 text-clinical-teal-600 focus:ring-clinical-teal-500"
              />
              <label htmlFor="notifyPatient" className="text-[11px] font-semibold text-clinical-teal-900 cursor-pointer">
                Dispatch instant SMS & Patient Portal notification upon release
              </label>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setResultModalTest(null)}
                className="apple-btn px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="apple-btn px-4 py-2 text-xs font-bold bg-clinical-teal-600 text-white rounded-lg hover:bg-clinical-teal-700 shadow-sm"
              >
                Certify & Release Report
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Official Diagnostic Report Modal */}
      {viewingReportTest && (
        <DiagnosticReportModal
          test={viewingReportTest}
          onClose={() => setViewingReportTest(null)}
          onNotifyPatient={handleNotifyPatient}
        />
      )}
    </div>
  );
};
export default LaboratoryView;
