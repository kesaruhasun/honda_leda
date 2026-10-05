import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  FileCheck,
  Plus,
  Printer,
  Send,
  Microscope,
  AlertTriangle,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { DataTable, Column } from '../components/common/DataTable';
import { SlideOverDrawer } from '../components/common/SlideOverDrawer';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { labApi, patientApi } from '../services/api';
import { LabTest, Patient } from '../types';
import { DiagnosticReportModal } from '../components/laboratory/DiagnosticReportModal';

export const LaboratoryView: React.FC = () => {
  const { showToast } = useToast();
  const [tests, setTests] = useState<LabTest[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [resultModalTest, setResultModalTest] = useState<LabTest | null>(null);
  const [viewingReportTest, setViewingReportTest] = useState<LabTest | null>(null);
  const [selectedInspectTest, setSelectedInspectTest] = useState<LabTest | null>(null);

  // New Order Form State
  const [newOrderForm, setNewOrderForm] = useState({
    patientId: '',
    doctorId: '',
    catalogId: '',
    urgency: 'ROUTINE',
    clinicalIndication: '',
  });

  // Result submission form
  const [resultForm, setResultForm] = useState({
    resultData: '',
    resultValue: '',
    isAbnormal: false,
    technicianNotes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [testRes, catRes, patRes] = await Promise.all([
        labApi.getTests().catch(() => ({ data: [] })),
        labApi.getCatalog().catch(() => ({ data: [] })),
        patientApi.getAll().catch(() => ({ data: [] })),
      ]);

      setTests(testRes.data || []);
      const catList = catRes.data || [];
      setCatalog(catList);
      if (catList.length > 0 && !newOrderForm.catalogId) {
        setNewOrderForm((f) => ({ ...f, catalogId: String(catList[0].id) }));
      }
      setPatients(patRes.data || []);
    } catch (err: any) {
      showToast('error', 'Error Loading Lab Data', err.message || 'Could not fetch diagnostic pathology orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderForm.patientId) {
      showToast('error', 'Validation Error', 'Please select a patient.');
      return;
    }

    try {
      await labApi.orderTest({
        patientId: Number(newOrderForm.patientId),
        doctorId: newOrderForm.doctorId ? Number(newOrderForm.doctorId) : undefined,
        testCatalogId: newOrderForm.catalogId ? Number(newOrderForm.catalogId) : undefined,
        urgency: newOrderForm.urgency,
        clinicalIndication: newOrderForm.clinicalIndication.trim() || 'Clinical Routine Assessment',
      });

      showToast('success', 'Pathology Order Enqueued', 'Specimen barcode label generated & specimen queued.');
      setIsOrderModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast('error', 'Order Error', err.message || 'Failed to order lab diagnostic');
    }
  };

  const handleAdvanceStatus = async (testId: number, currentStatus: string) => {
    let nextStatus = 'COLLECTED';
    if (currentStatus === 'REQUESTED') nextStatus = 'COLLECTED';
    else if (currentStatus === 'COLLECTED' || currentStatus === 'SAMPLE_COLLECTED') nextStatus = 'PROCESSING';

    try {
      await labApi.updateStatus(testId, nextStatus);
      showToast('success', 'Pipeline Status Updated', `Specimen status advanced to ${nextStatus}.`);
      fetchData();
    } catch (err: any) {
      showToast('error', 'Update Error', err.message || 'Could not update status');
    }
  };

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultModalTest) return;

    try {
      await labApi.submitResults(resultModalTest.id, {
        resultValue: resultForm.resultValue ? Number(resultForm.resultValue) : undefined,
        resultData: resultForm.resultData.trim(),
        isAbnormal: resultForm.isAbnormal,
        technicianNotes: resultForm.technicianNotes.trim(),
      });

      showToast('success', 'Diagnostic Report Certified', `Lab result for ${resultModalTest.testName} signed off.`);
      setResultModalTest(null);
      fetchData();
    } catch (err: any) {
      showToast('error', 'Submission Failed', err.message || 'Could not submit diagnostic results');
    }
  };

  const pendingTests = tests.filter((t) => t.status !== 'COMPLETED');
  const completedTests = tests.filter((t) => t.status === 'COMPLETED');
  const abnormalTests = tests.filter((t) => t.isAbnormal);
  const urgentTests = tests.filter((t) => t.urgency === 'URGENT' || t.urgency === 'STAT');

  const filteredTests = tests.filter((t) => {
    const q = searchTerm.toLowerCase();
    return (
      t.testName?.toLowerCase().includes(q) ||
      t.patientName?.toLowerCase().includes(q) ||
      t.doctorName?.toLowerCase().includes(q) ||
      t.requestNumber?.toLowerCase().includes(q) ||
      t.testCode?.toLowerCase().includes(q)
    );
  });

  const columns: Column<LabTest>[] = [
    {
      key: 'testCode',
      header: 'Test Code / ID',
      sortable: true,
      render: (t) => (
        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {t.testCode || t.requestNumber || `LAB-${t.id}`}
        </span>
      ),
    },
    {
      key: 'testName',
      header: 'Pathology Investigation',
      mobileTitle: true,
      sortable: true,
      render: (t) => (
        <div>
          <div className="font-bold text-slate-900 truncate" title={t.testName}>{t.testName}</div>
          <div className="text-[10px] text-slate-500 font-mono">Patient: {t.patientName || `ID #${t.patientId}`}</div>
        </div>
      ),
    },
    {
      key: 'urgency',
      header: 'Priority',
      sortable: true,
      render: (t) => <StatusBadge status={t.urgency || 'ROUTINE'} dot />,
    },
    {
      key: 'status',
      header: 'Pipeline Stage',
      sortable: true,
      render: (t) => <StatusBadge status={t.status} dot />,
    },
    {
      key: 'isAbnormal',
      header: 'Result Flag',
      render: (t) =>
        t.isAbnormal ? (
          <span className="font-bold font-mono text-[10px] px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded">
            ⚠️ ABNORMAL
          </span>
        ) : t.status === 'COMPLETED' ? (
          <span className="font-mono text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
            ✓ Normal
          </span>
        ) : (
          <span className="text-slate-400 text-[11px]">—</span>
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
              Central Laboratory &amp; Pathology Operations
            </h1>
            <StatusBadge status="ACTIVE" dot>ISO 15189 Accredited</StatusBadge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Specimen chain of custody, automated pathology analyzer sync, and certified lab reporting.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsOrderModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Order Lab Test</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
        <StatCard
          title="Pending Specimen Queue"
          value={pendingTests.length}
          subtitle="In analyzer pipeline"
          icon={FlaskConical}
          variant="amber"
          loading={loading}
          trend={{ value: 'Active Queue' }}
        />
        <StatCard
          title="STAT / Urgent Orders"
          value={urgentTests.length}
          subtitle="High priority processing"
          icon={AlertTriangle}
          variant="rose"
          loading={loading}
          trend={{ value: urgentTests.length > 0 ? 'High Priority' : 'Normal', isPositive: urgentTests.length === 0 }}
        />
        <StatCard
          title="Certified Reports"
          value={completedTests.length}
          subtitle="Signed off today"
          icon={FileCheck}
          variant="emerald"
          loading={loading}
          trend={{ value: '100% Verified', isPositive: true }}
        />
        <StatCard
          title="Flagged Abnormals"
          value={abnormalTests.length}
          subtitle="Critical result alerts"
          icon={Microscope}
          variant="purple"
          loading={loading}
        />
      </div>

      {/* Main Table View */}
      <DataTable<LabTest>
        data={filteredTests}
        columns={columns}
        keyExtractor={(t) => t.id}
        loading={loading}
        title="Diagnostic Pathology Worklist"
        subtitle="Live tracking of specimen pipeline, analyzer runs, and doctor sign-offs"
        searchPlaceholder="Search order ID, patient name, investigation..."
        searchFilter={(t, q) =>
          (t.testName ? t.testName.toLowerCase().includes(q) : false) ||
          (t.patientName ? t.patientName.toLowerCase().includes(q) : false) ||
          (t.requestNumber ? t.requestNumber.toLowerCase().includes(q) : false) ||
          (t.testCode ? t.testCode.toLowerCase().includes(q) : false)
        }
        onRowClick={(test) => setSelectedInspectTest(test)}
        actions={(t) => (
          <div className="flex items-center gap-1.5">
            {t.status !== 'COMPLETED' && (
              <>
                <button
                  type="button"
                  onClick={() => handleAdvanceStatus(t.id, t.status)}
                  className="px-2.5 py-1 text-[11px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-md border border-teal-200/80 transition-colors"
                >
                  {t.status === 'REQUESTED' ? 'Collect Specimen' : 'Start Analyzer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResultModalTest(t);
                    setResultForm({
                      resultData: t.resultData || '',
                      resultValue: t.resultValue != null ? String(t.resultValue) : '',
                      isAbnormal: t.isAbnormal || false,
                      technicianNotes: t.technicianNotes || '',
                    });
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md border border-indigo-200/80 transition-colors"
                >
                  Enter Results
                </button>
              </>
            )}
            {t.status === 'COMPLETED' && (
              <button
                type="button"
                onClick={() => setViewingReportTest(t)}
                className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200/80 transition-colors flex items-center gap-1"
              >
                <Printer className="h-3 w-3" />
                <span>View Report</span>
              </button>
            )}
          </div>
        )}
      />

      {/* Inspector SlideOverDrawer */}
      <SlideOverDrawer
        isOpen={!!selectedInspectTest}
        onClose={() => setSelectedInspectTest(null)}
        title={selectedInspectTest ? selectedInspectTest.testName : ''}
        subtitle={selectedInspectTest ? `Order #${selectedInspectTest.requestNumber || selectedInspectTest.testCode || selectedInspectTest.id}` : ''}
        size="md"
      >
        {selectedInspectTest && (
          <div className="space-y-4 text-xs font-sans">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Pipeline Stage:</span>
                <StatusBadge status={selectedInspectTest.status} dot />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Priority Urgency:</span>
                <StatusBadge status={selectedInspectTest.urgency || 'ROUTINE'} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Patient Name:</span>
                <span className="font-bold text-slate-900">{selectedInspectTest.patientName || `ID #${selectedInspectTest.patientId}`}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Ordering Doctor:</span>
                <span className="font-medium text-slate-800">{selectedInspectTest.doctorName || 'Attending Physician'}</span>
              </div>
            </div>

            {selectedInspectTest.status === 'COMPLETED' && (
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
                <span className="font-bold text-emerald-900 uppercase text-[10px] tracking-wider block">Certified Result Data</span>
                <p className="font-mono text-sm font-bold text-slate-900">{selectedInspectTest.resultData}</p>
                {selectedInspectTest.technicianNotes && (
                  <p className="text-[11px] text-slate-600 italic">Remarks: {selectedInspectTest.technicianNotes}</p>
                )}
              </div>
            )}
          </div>
        )}
      </SlideOverDrawer>

      {/* Order Test Modal */}
      {isOrderModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsOrderModalOpen(false)}
          title="Dispatch Diagnostic Pathology Order"
          subtitle="Generate lab barcode specimen tracking order"
          maxWidth="md"
        >
          <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Patient *</label>
              <select
                required
                value={newOrderForm.patientId}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, patientId: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
              >
                <option value="">-- Choose Patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName || `${p.firstName} ${p.lastName}`} (NIC: {p.nicPassportNo})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Investigation Catalog Item</label>
                <select
                  value={newOrderForm.catalogId}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, catalogId: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
                >
                  {catalog.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.testName} ({c.testCode}) — LKR {c.price || c.standardFee || 1500}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Priority / Urgency</label>
                <select
                  value={newOrderForm.urgency}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, urgency: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="ROUTINE">Routine Outpatient</option>
                  <option value="URGENT">🟡 Urgent Priority</option>
                  <option value="STAT">🔴 Stat / Emergency</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Clinical Indication &amp; Remarks</label>
              <textarea
                value={newOrderForm.clinicalIndication}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, clinicalIndication: e.target.value })}
                placeholder="E.g., Pre-operative screening, persistent pyrexia..."
                rows={2}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsOrderModalOpen(false)}
                className="px-4 py-2 rounded-lg border text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs"
              >
                Dispatch Order
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Result Entry Modal */}
      {resultModalTest && (
        <Modal
          isOpen={true}
          onClose={() => setResultModalTest(null)}
          title={`Certify Lab Results: ${resultModalTest.testName}`}
          subtitle={`Order #${resultModalTest.requestNumber || resultModalTest.testCode}`}
          maxWidth="md"
        >
          <form onSubmit={handleSubmitResult} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Quantitative Result String *</label>
              <input
                type="text"
                required
                value={resultForm.resultData}
                onChange={(e) => setResultForm({ ...resultForm, resultData: e.target.value })}
                placeholder="E.g., 14.2 g/dL (Hb) | WBC: 8.5 x10^3/uL"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 font-mono text-sm font-bold text-slate-900"
              />
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <input
                type="checkbox"
                id="isAbnormalCheck"
                checked={resultForm.isAbnormal}
                onChange={(e) => setResultForm({ ...resultForm, isAbnormal: e.target.checked })}
                className="rounded text-rose-600 focus:ring-rose-500 h-4 w-4"
              />
              <label htmlFor="isAbnormalCheck" className="font-bold text-rose-700 cursor-pointer">
                Flag Result as Clinical Abnormal / Out-of-Range
              </label>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Technologist Notes &amp; Verification Remarks</label>
              <textarea
                value={resultForm.technicianNotes}
                onChange={(e) => setResultForm({ ...resultForm, technicianNotes: e.target.value })}
                placeholder="Analyzer calibrated. Dual-verified by Senior Technologist..."
                rows={2}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResultModalTest(null)}
                className="px-4 py-2 rounded-lg border text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Sign Off &amp; Certify Report</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Official Diagnostic Report Viewer Modal */}
      {viewingReportTest && (
        <DiagnosticReportModal
          isOpen={true}
          onClose={() => setViewingReportTest(null)}
          test={viewingReportTest}
        />
      )}
    </div>
  );
};

export default LaboratoryView;
