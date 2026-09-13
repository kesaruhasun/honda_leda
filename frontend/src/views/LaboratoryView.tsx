import React, { useState } from 'react';
import { FlaskConical, Clock, FileCheck, ArrowRight } from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { LabTest, LabTestStatus } from '../types';

const INITIAL_TESTS: LabTest[] = [
  {
    id: 1,
    testId: 'LAB-2026-001',
    appointmentId: 1,
    patientId: 1,
    patientName: 'Kalyani Bandara',
    doctorId: 1,
    doctorName: 'Dr. Kavinda Rathnayaka',
    testName: 'Lipid Profile Panel',
    category: 'Biochemistry',
    sampleType: 'Venous Blood (Serum)',
    standardFee: 1800,
    testDate: '2026-09-14',
    status: 'REQUESTED',
    referenceRange: 'Total Cholesterol: < 200 mg/dL, HDL: > 40 mg/dL, Triglycerides: < 150 mg/dL',
  },
  {
    id: 2,
    testId: 'LAB-2026-002',
    appointmentId: 2,
    patientId: 2,
    patientName: 'Pradeep Jayasinghe',
    doctorId: 2,
    doctorName: 'Dr. Chamari Perera',
    testName: 'Full Blood Count (FBC/CBC)',
    category: 'Hematology',
    sampleType: 'Whole Blood (EDTA)',
    standardFee: 950,
    testDate: '2026-09-14',
    status: 'SAMPLE_COLLECTED',
    referenceRange: 'WBC: 4.0-11.0 ×10^9/L, Hemoglobin: 13.0-17.0 g/dL',
  },
  {
    id: 3,
    testId: 'LAB-2026-003',
    appointmentId: 3,
    patientId: 3,
    patientName: 'Malini Fernando',
    doctorId: 1,
    doctorName: 'Dr. Kavinda Rathnayaka',
    testName: 'Fasting Blood Sugar (FBS)',
    category: 'Biochemistry',
    sampleType: 'Fluoride Plasma',
    standardFee: 450,
    testDate: '2026-09-14',
    status: 'COMPLETED',
    resultData: 'Glucose: 92 mg/dL (Normal Fasting)',
    referenceRange: '70 - 100 mg/dL',
    isAbnormal: false,
    technicianNotes: 'Specimen verified without hemolysis. Analyzed via spectrophotometry.',
    verifiedBy: 'Nethuli Thilakarathne (IT25103363)',
    verifiedAt: '2026-09-14T09:30:00Z',
  },
];

export const LaboratoryView: React.FC = () => {
  const { showToast } = useToast();
  const [tests, setTests] = useState<LabTest[]>(INITIAL_TESTS);
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  // Result entry form state
  const [resultInput, setResultInput] = useState('');
  const [isAbnormal, setIsAbnormal] = useState(false);
  const [techNotes, setTechNotes] = useState('');

  // PROGRESS TEST STATUS LIFECYCLE: REQUESTED -> SAMPLE_COLLECTED -> PROCESSING -> COMPLETED
  const advanceStatus = (testId: number) => {
    setTests((prevTests) =>
      prevTests.map((t) => {
        if (t.id === testId) {
          let nextStatus: LabTestStatus = t.status;
          if (t.status === 'REQUESTED') nextStatus = 'SAMPLE_COLLECTED';
          else if (t.status === 'SAMPLE_COLLECTED') nextStatus = 'PROCESSING';

          showToast('info', 'Sample Status Updated', `${t.testId} moved to ${nextStatus}.`);
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const handleSaveResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTest) return;

    setTests((prevTests) =>
      prevTests.map((t) =>
        t.id === selectedTest.id
          ? {
              ...t,
              status: 'COMPLETED',
              resultData: resultInput,
              isAbnormal: isAbnormal,
              technicianNotes: techNotes,
              verifiedBy: 'Nethuli Thilakarathne (IT25103363)',
              verifiedAt: new Date().toISOString(),
            }
          : t
      )
    );

    setIsResultModalOpen(false);
    setSelectedTest(null);
    showToast('success', 'Diagnostic Result Verified', `Report finalized for ${selectedTest.testId}.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-clinical-ink tracking-tight">Clinical Laboratory & Pathology</h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-clinical-teal-50 text-clinical-teal-700 border border-clinical-teal-200">
              M6: Thilakarathne H.S.K.P.N (IT25103363)
            </span>
          </div>
          <p className="text-xs text-clinical-ink-muted mt-1">
            Diagnostic order intake, 4-stage sample tracking lifecycle, quantitative analyzer result entry, and medical reports.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Active Investigations" value={tests.length} subtitle="Orders in laboratory" icon={FlaskConical} variant="teal" />
        <MetricCard
          title="Pending Specimen Intake"
          value={tests.filter((t) => t.status === 'REQUESTED').length}
          subtitle="Awaiting phlebotomy collection"
          icon={Clock}
          variant="amber"
        />
        <MetricCard
          title="In Analyzer / Processing"
          value={tests.filter((t) => t.status === 'SAMPLE_COLLECTED' || t.status === 'PROCESSING').length}
          subtitle="Running assays"
          icon={ArrowRight}
          variant="coral"
        />
        <MetricCard
          title="Verified Final Reports"
          value={tests.filter((t) => t.status === 'COMPLETED').length}
          subtitle="Doctor sign-off ready"
          icon={FileCheck}
          variant="emerald"
        />
      </div>

      {/* Lab Tests Table */}
      <div className="apple-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-xs text-clinical-ink">Diagnostic Tests Order Registry</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-clinical-ink-secondary font-semibold">
                <th className="py-3 px-4 font-mono">Test ID</th>
                <th className="py-3 px-4">Test Name & Specimen</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Ordering Doctor</th>
                <th className="py-3 px-4 font-mono">Fee (LKR)</th>
                <th className="py-3 px-4">Sample Lifecycle Status</th>
                <th className="py-3 px-4 text-right">Technician Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tests.map((test) => (
                <tr key={test.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-clinical-teal-700">{test.testId}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-clinical-ink">{test.testName}</div>
                    <div className="text-[10px] text-slate-400">{test.category} • {test.sampleType}</div>
                  </td>
                  <td className="py-3 px-4 font-medium text-clinical-ink">{test.patientName}</td>
                  <td className="py-3 px-4 text-clinical-ink-secondary">{test.doctorName}</td>
                  <td className="py-3 px-4 font-mono font-semibold">Rs. {test.standardFee.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        test.status === 'COMPLETED'
                          ? 'success'
                          : test.status === 'PROCESSING'
                          ? 'urgent'
                          : test.status === 'SAMPLE_COLLECTED'
                          ? 'warning'
                          : 'routine'
                      }
                    >
                      {test.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {test.status === 'REQUESTED' && (
                        <button
                          onClick={() => advanceStatus(test.id)}
                          className="apple-btn text-[11px] font-semibold text-clinical-teal-600 bg-clinical-teal-50 px-2 py-1 rounded hover:bg-clinical-teal-100"
                        >
                          Collect Sample
                        </button>
                      )}
                      {test.status === 'SAMPLE_COLLECTED' && (
                        <button
                          onClick={() => advanceStatus(test.id)}
                          className="apple-btn text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded hover:bg-amber-100"
                        >
                          Send to Analyzer
                        </button>
                      )}
                      {test.status === 'PROCESSING' && (
                        <button
                          onClick={() => {
                            setSelectedTest(test);
                            setResultInput('');
                            setIsAbnormal(false);
                            setIsResultModalOpen(true);
                          }}
                          className="apple-btn text-[11px] font-semibold text-white bg-clinical-teal-600 px-2.5 py-1 rounded hover:bg-clinical-teal-700 shadow-sm"
                        >
                          Enter Results
                        </button>
                      )}
                      {test.status === 'COMPLETED' && (
                        <button
                          onClick={() => {
                            setSelectedTest(test);
                            setIsResultModalOpen(false);
                          }}
                          className="apple-btn text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200"
                        >
                          View Report
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Result Entry Modal */}
      {selectedTest && isResultModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsResultModalOpen(false)}
          title={`Quantitative Result Entry: ${selectedTest.testId}`}
          subtitle={`${selectedTest.testName} • ${selectedTest.patientName}`}
        >
          <form onSubmit={handleSaveResult} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono">
              <span className="text-slate-400 block text-[10px]">STANDARD REFERENCE RANGE</span>
              <span className="font-semibold text-clinical-ink">{selectedTest.referenceRange}</span>
            </div>

            <div>
              <label className="block font-semibold text-clinical-ink mb-1">Assay Quantitative Result Data *</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Total Cholesterol: 245 mg/dL (High), HDL: 38 mg/dL (Low), Triglycerides: 180 mg/dL"
                value={resultInput}
                onChange={(e) => setResultInput(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-clinical-teal-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="abnormalCheck"
                checked={isAbnormal}
                onChange={(e) => setIsAbnormal(e.target.checked)}
                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 h-4 w-4"
              />
              <label htmlFor="abnormalCheck" className="text-xs font-semibold text-rose-700">
                Flag as Clinically Abnormal Result (Out of Reference Range)
              </label>
            </div>

            <div>
              <label className="block font-semibold text-clinical-ink mb-1">Technologist Diagnostic Observations</label>
              <input
                type="text"
                placeholder="e.g. Sample verified on Beckman Coulter analyzer."
                value={techNotes}
                onChange={(e) => setTechNotes(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsResultModalOpen(false)}
                className="apple-btn px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="apple-btn px-4 py-2 font-semibold bg-clinical-teal-600 text-white rounded-lg hover:bg-clinical-teal-700 shadow-sm"
              >
                Verify & Finalize Report
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Completed Report Viewer Modal */}
      {selectedTest && !isResultModalOpen && selectedTest.status === 'COMPLETED' && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTest(null)}
          title="Clinical Diagnostic Laboratory Report"
          subtitle={`${selectedTest.testId} • PulseOS Pathology Division`}
          maxWidth="xl"
        >
          <div className="space-y-4 text-xs receipt-container">
            <div className="text-center pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-clinical-ink">PulseOS Clinical Diagnostics Laboratory</h2>
              <p className="text-[11px] text-clinical-ink-muted">Faculty of Computing Medical Center • SLIIT Group 60</p>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px]">PATIENT NAME</span>
                <span className="font-bold text-clinical-ink">{selectedTest.patientName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">ORDERING PHYSICIAN</span>
                <span className="font-medium text-clinical-ink">{selectedTest.doctorName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">TEST INVESTIGATION</span>
                <span className="font-bold text-clinical-teal-700">{selectedTest.testName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">DATE VERIFIED</span>
                <span className="text-clinical-ink">{selectedTest.verifiedAt?.split('T')[0]}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 font-mono">
              <span className="text-slate-400 block text-[10px]">QUANTITATIVE FINDINGS</span>
              <p className="text-sm font-bold text-clinical-ink leading-relaxed">{selectedTest.resultData}</p>
              <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
                <span>Reference Range: {selectedTest.referenceRange}</span>
                <span className={selectedTest.isAbnormal ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                  {selectedTest.isAbnormal ? 'ABNORMAL' : 'NORMAL'}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              Verified by: <span className="font-semibold text-slate-800">{selectedTest.verifiedBy}</span>
            </div>

            <div className="no-print pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="apple-btn px-4 py-2 font-semibold bg-slate-800 text-white rounded-lg"
              >
                Print Lab Report
              </button>
              <button
                onClick={() => setSelectedTest(null)}
                className="apple-btn px-4 py-2 font-semibold bg-slate-100 text-slate-700 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};