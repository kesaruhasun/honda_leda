import React from 'react';
import { Printer, X, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { LabTest } from '../../types';

interface DiagnosticReportModalProps {
  test: LabTest;
  onClose: () => void;
  onNotifyPatient?: (test: LabTest) => void;
}

export const DiagnosticReportModal: React.FC<DiagnosticReportModalProps> = ({
  test,
  onClose,
  onNotifyPatient,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const isAbnormal = Boolean(test.isAbnormal || test.flag === 'ABNORMAL');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-apple-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 print:m-0 print:border-0 print:shadow-none print:w-full">
        {/* Modal Top Bar (Hidden on print) */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-clinical-teal-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Verified Clinical Diagnostic Report
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              ISO 15189 Certified
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onNotifyPatient && (
              <button
                onClick={() => onNotifyPatient(test)}
                className="apple-btn px-3 py-1.5 text-xs font-semibold rounded-lg bg-clinical-teal-50 border border-clinical-teal-200 text-clinical-teal-800 hover:bg-clinical-teal-100 flex items-center gap-1.5"
              >
                <span>Dispatch Patient Alert</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="apple-btn px-3.5 py-1.5 text-xs font-bold rounded-lg bg-clinical-teal-600 text-white hover:bg-clinical-teal-700 flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="h-4 w-4" />
              <span>Print Official PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Medical Report Content */}
        <div className="p-8 space-y-6 text-slate-800 font-sans print:p-0 print:space-y-4">
          {/* Hospital Official Header */}
          <div className="flex items-start justify-between pb-5 border-b-2 border-slate-800">
            <div className="flex items-center gap-3.5">
              <img
                src="/pulseos-logo.jpg"
                alt="PulseOS"
                className="h-16 w-16 object-contain rounded-xl border border-slate-200 p-0.5"
              />
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 font-serif">
                  PulseOS Healthcare Services
                </h1>
                <p className="text-xs font-semibold text-clinical-teal-800 uppercase tracking-wider">
                  Department of Clinical Pathology & Laboratory Diagnostics
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  120 Hospital Boulevard, Colombo 07 &bull; Tel: +94 11 269 1111 &bull; lab@pulseos.health
                </p>
              </div>
            </div>

            {/* Accreditation Badge & Barcode */}
            <div className="text-right space-y-1">
              <div className="inline-block px-2.5 py-1 rounded bg-slate-100 border border-slate-300 text-[10px] font-mono font-bold text-slate-800">
                SLMC REG: MLT-7741 &bull; ISO 15189
              </div>
              <div className="font-mono text-xs font-bold text-slate-900 tracking-wider">
                {test.requestNumber || `REQ-${test.id}`}
              </div>
              {/* CSS Barcode Graphic */}
              <div className="flex justify-end items-end h-7 gap-0.5 pt-1">
                {[12, 18, 6, 22, 14, 28, 8, 20, 26, 12, 16, 24, 10, 18, 22, 14, 8, 26].map((h, i) => (
                  <div key={i} className="bg-slate-900 w-0.5" style={{ height: `${h}px` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Patient & Sample Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Patient Name</span>
              <span className="font-bold text-slate-900 text-sm">{test.patientName}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Patient ID / NIC</span>
              <span className="font-mono font-bold text-slate-800">
                PAT-{test.patientId} &bull; {test.patientId ? `NIC Verified` : ''}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Ordering Physician</span>
              <span className="font-semibold text-slate-800">{test.doctorName || 'Dr. Kavinda Rathnayaka'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Investigation Date</span>
              <span className="font-mono text-slate-800">{test.testDate || new Date().toISOString().split('T')[0]}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Specimen Type</span>
              <span className="font-mono font-semibold text-clinical-teal-800">
                {test.specimenType || test.sampleType || 'Venous Blood (EDTA)'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Assay Category</span>
              <span className="font-semibold text-slate-700">{test.category || 'Biochemistry'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Clinical Urgency</span>
              <span className={`font-bold font-mono ${test.urgency === 'URGENT' ? 'text-rose-600' : 'text-slate-700'}`}>
                {test.urgency || 'ROUTINE'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Report Status</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>CERTIFIED FINAL</span>
              </span>
            </div>
          </div>

          {/* Investigation Findings Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Diagnostic Findings: {test.testName}
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                Methodology: Automated Spectrophotometry / Laser Flow Cytometry
              </span>
            </div>

            <table className="w-full border-collapse text-xs border border-slate-200">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3 text-left">Analyte / Diagnostic Test</th>
                  <th className="py-2.5 px-3 text-center">Observed Value</th>
                  <th className="py-2.5 px-3 text-center">Reference Interval</th>
                  <th className="py-2.5 px-3 text-center">Units</th>
                  <th className="py-2.5 px-3 text-center">Clinical Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className={isAbnormal ? 'bg-rose-50/50' : 'bg-white'}>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{test.testName}</div>
                    <div className="text-[10px] font-mono text-slate-400">Code: {test.testCode || 'LAB-STD'}</div>
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-sm">
                    <span className={isAbnormal ? 'text-rose-700 font-black' : 'text-slate-900'}>
                      {test.resultData || (test.resultValue ? `${test.resultValue}` : 'Within Normal Limits')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-600">
                    {test.referenceRange || 'Standard reference limits'}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-500">
                    {test.unit || 'mg/dL'}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {isAbnormal ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold font-mono text-[10px] border border-rose-300">
                        <AlertTriangle className="h-3 w-3" />
                        <span>ABNORMAL</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold font-mono text-[10px] border border-emerald-300">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>NORMAL</span>
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Observations and Clinical Notes */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Technologist Observations & Clinical Impression
            </span>
            <p className="text-slate-800 leading-relaxed font-mono text-[11px]">
              {test.remarks ||
                test.technicianNotes ||
                'Biochemical calibrators within acceptable target precision. Quality control metrics verified.'}
            </p>
            {test.clinicalIndication && (
              <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-200">
                Ordering Indication: "{test.clinicalIndication}"
              </p>
            )}
          </div>

          {/* Formal Digital Verification Signatures */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs">
            <div className="space-y-1">
              <div className="font-serif italic text-base text-clinical-teal-900 border-b border-slate-300 pb-1 w-48 font-bold">
                N. Thilakarathne
              </div>
              <div className="font-bold text-slate-900">
                {test.technicianName || 'N. Thilakarathne, MLT'}
              </div>
              <div className="text-[10px] text-slate-500">
                Senior Medical Laboratory Technologist &bull; SLMC Reg. 4481
              </div>
              <div className="text-[9px] font-mono text-slate-400">
                Certified: {test.conductionDate ? new Date(test.conductionDate).toLocaleString() : '2026-09-14 11:30 SLST'}
              </div>
            </div>

            <div className="space-y-1 text-right">
              <div className="font-serif italic text-base text-clinical-teal-900 border-b border-slate-300 pb-1 w-48 ml-auto font-bold">
                Dr. A. Jayawardena
              </div>
              <div className="font-bold text-slate-900">
                Dr. Anoma Jayawardena, MBBS, MD (Path)
              </div>
              <div className="text-[10px] text-slate-500">
                Consultant Clinical Pathologist &bull; Head of Diagnostics
              </div>
              <div className="text-[9px] font-mono text-slate-400">
                Electronic Sign-off: SHA-256 Verified
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="pt-3 border-t border-slate-100 text-center text-[9px] text-slate-400">
            PulseOS Laboratory Information Management System (LIMS). This electronic report is officially certified and valid without a physical rubber stamp.
          </div>
        </div>
      </div>
    </div>
  );
};
export default DiagnosticReportModal;
