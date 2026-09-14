import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  TestTube,
  CheckCircle2,
  Clock,
  Search,
  FileCheck,
} from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { labApi } from '../services/api';
import { LabTest } from '../types';

export const LaboratoryView: React.FC = () => {
  const { showToast } = useToast();
  const [tests, setTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [resultModalTest, setResultModalTest] = useState<LabTest | null>(null);

  // Result submission form
  const [resultForm, setResultForm] = useState({
    resultData: '',
    isAbnormal: false,
    technicianNotes: '',
  });

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await labApi.getTests();
      setTests(res.data);
    } catch (err: any) {
      showToast('error', 'Error Loading Lab Orders', err.message || 'Failed to fetch lab tests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleUpdateStatus = async (testId: number, nextStatus: string) => {
    try {
      await labApi.updateStatus(testId, nextStatus);
      showToast('success', 'Status Updated', `Specimen marked as ${nextStatus}.`);
      fetchTests();
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message || 'Could not update status');
    }
  };

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultModalTest) return;

    try {
      await labApi.submitResults(resultModalTest.id, {
        resultData: resultForm.resultData,
        isAbnormal: resultForm.isAbnormal,
        technicianNotes: resultForm.technicianNotes,
      });

      showToast('success', 'Results Logged', `Diagnostic report verified for ${resultModalTest.testName}.`);
      setResultModalTest(null);
      setResultForm({ resultData: '', isAbnormal: false, technicianNotes: '' });
      fetchTests();
    } catch (err: any) {
      showToast('error', 'Submission Failed', err.message || 'Could not save results');
    }
  };

  const filteredTests = tests.filter((test) => {
    const matchesStatus = statusFilter === 'ALL' || test.status === statusFilter;
    const patName = test.patientName || '';
    const testName = test.testName || '';
    const matchesSearch =
      patName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (test.testCode && test.testCode.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-clinical-ink tracking-tight">Diagnostic Pathology & Diagnostics</h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-clinical-teal-50 text-clinical-teal-700 border border-clinical-teal-200">
              Biometric Pathology Roster
            </span>
          </div>
          <p className="text-xs text-clinical-ink-muted mt-1">
            Specimen worklists, bio-chemical assays, normal reference range comparison, and verified reports.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Test Orders"
          value={tests.length}
          subtitle="Hospital diagnostic queue"
          icon={FlaskConical}
          variant="teal"
        />
        <MetricCard
          title="Awaiting Sample"
          value={tests.filter((t) => t.status === 'REQUESTED').length}
          subtitle="Pending phlebotomy / intake"
          icon={Clock}
          variant="amber"
        />
        <MetricCard
          title="Specimens Collected"
          value={tests.filter((t) => t.status === 'COLLECTED').length}
          subtitle="In analyzer queue"
          icon={TestTube}
          variant="slate"
        />
        <MetricCard
          title="Verified Reports"
          value={tests.filter((t) => t.status === 'COMPLETED').length}
          subtitle="Finalized pathology findings"
          icon={CheckCircle2}
          variant="emerald"
        />
      </div>

      {/* Filters and Search Bar */}
      <div className="apple-card p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient, test name, or test code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-clinical-ink focus:outline-none focus:ring-2 focus:ring-clinical-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-clinical-ink-secondary">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-clinical-ink"
          >
            <option value="ALL">All Worklist Statuses</option>
            <option value="REQUESTED">Requested (Pending Phlebotomy)</option>
            <option value="COLLECTED">Collected (In Analyzer)</option>
            <option value="COMPLETED">Completed (Verified)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin h-8 w-8 border-2 border-clinical-teal-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        /* Worklist Table */
        <div className="apple-card overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-clinical-ink-secondary font-semibold border-b border-slate-200">
                  <th className="py-3 px-4 font-mono">Test Code</th>
                  <th className="py-3 px-4">Diagnostic Assay</th>
                  <th className="py-3 px-4">Patient Demographics</th>
                  <th className="py-3 px-4">Ordering Physician</th>
                  <th className="py-3 px-4">Sample Type</th>
                  <th className="py-3 px-4">Quantitative Findings</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Laboratory Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTests.map((test) => (
                  <tr key={test.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-clinical-teal-700">{test.testCode}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{test.testName}</div>
                      <div className="text-[10px] text-slate-400">Order Date: {test.testDate}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{test.patientName}</td>
                    <td className="py-3 px-4 text-slate-600">{test.doctorName}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{test.specimenType || 'Venous Blood'}</td>
                    <td className="py-3 px-4">
                      {test.status === 'COMPLETED' ? (
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-mono font-bold ${
                                test.isAbnormal ? 'text-rose-600' : 'text-slate-900'
                              }`}
                            >
                              {test.resultData}
                            </span>
                            {test.isAbnormal && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                HIGH
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">Ref: {test.referenceRange}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Analysis Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          test.status === 'COMPLETED'
                            ? 'success'
                            : test.status === 'COLLECTED'
                            ? 'urgent'
                            : 'routine'
                        }
                      >
                        {test.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {test.status === 'REQUESTED' && (
                        <button
                          onClick={() => handleUpdateStatus(test.id, 'COLLECTED')}
                          className="apple-btn inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-[11px]"
                        >
                          <TestTube className="h-3.5 w-3.5" />
                          <span>Collect Sample</span>
                        </button>
                      )}

                      {test.status === 'COLLECTED' && (
                        <button
                          onClick={() => {
                            setResultModalTest(test);
                            setResultForm({
                              resultData: '',
                              isAbnormal: false,
                              technicianNotes: 'Calibrated automated analyzer verification completed.',
                            });
                          }}
                          className="apple-btn inline-flex items-center gap-1 px-2.5 py-1 rounded bg-clinical-teal-600 text-white hover:bg-clinical-teal-700 font-semibold text-[11px] shadow-2xs"
                        >
                          <FileCheck className="h-3.5 w-3.5" />
                          <span>Input Results</span>
                        </button>
                      )}

                      {test.status === 'COMPLETED' && (
                        <span className="text-[11px] font-mono text-emerald-700 font-medium flex items-center justify-end gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Verified</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Result Entry Modal */}
      {resultModalTest && (
        <Modal
          isOpen={true}
          onClose={() => setResultModalTest(null)}
          title={`Input Diagnostic Findings: ${resultModalTest.testName}`}
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
                className="apple-btn px-4 py-2 text-xs font-semibold bg-clinical-teal-600 text-white rounded-lg hover:bg-clinical-teal-700 shadow-sm"
              >
                Certify & Release Report
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
export default LaboratoryView;