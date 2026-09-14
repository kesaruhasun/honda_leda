import React, { useState } from 'react';
import { Search, ArrowRight, ShieldCheck } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useRole } from '../../context/RoleContext';
import { useToast } from '../../context/ToastContext';
import { patientApi } from '../../services/api';

export const PatientLoginModal: React.FC = () => {
  const { isPatientLoginModalOpen, setIsPatientLoginModalOpen, loginPatient } = useRole();
  const { showToast } = useToast();
  const [nicQuery, setNicQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearchAndLogin = async (nicToSearch: string) => {
    const query = (nicToSearch || nicQuery).trim();
    if (!query) {
      showToast('error', 'Required Field', 'Please enter your NIC or Passport number.');
      return;
    }

    try {
      setLoading(true);
      const res = await patientApi.getAll();
      const match = res.data.find(
        (p) =>
          p.nicPassportNo.toLowerCase() === query.toLowerCase() ||
          p.patientId.toLowerCase() === query.toLowerCase()
      );

      if (match) {
        showToast('success', 'Welcome Back', `Logged in as ${match.fullName || match.firstName}.`);
        loginPatient(match);
      } else {
        showToast('error', 'Record Not Found', 'No patient record found matching that NIC/Passport.');
      }
    } catch (err: any) {
      showToast('error', 'Connection Error', err.message || 'Unable to access patient registry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isPatientLoginModalOpen}
      onClose={() => setIsPatientLoginModalOpen(false)}
      title="Patient Self-Service Portal"
      subtitle="Access your clinical records, test reports, prescriptions, and online payments."
      maxWidth="md"
    >
      <div className="space-y-5">
        <div className="p-3.5 rounded-apple-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-clinical-teal-50 text-clinical-teal-700 mt-0.5">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="text-xs">
            <p className="font-semibold text-clinical-ink">National Digital Health Access</p>
            <p className="text-clinical-ink-secondary mt-0.5">
              Enter your National Identity Card (NIC) or Passport number registered during hospital intake.
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearchAndLogin(nicQuery);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-clinical-ink mb-1.5">
              NIC or Passport Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={nicQuery}
                onChange={(e) => setNicQuery(e.target.value)}
                placeholder="e.g. 198512304561"
                className="w-full text-sm font-mono px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-apple-xl focus:outline-none focus:ring-2 focus:ring-clinical-teal-500 focus:bg-white transition-all shadow-inner"
                autoFocus
              />
              <Search className="absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="apple-btn w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-apple-xl bg-clinical-teal-600 hover:bg-clinical-teal-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Verifying Credentials...' : 'Access My Medical File'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Quick Demo Access Pills */}
        <div className="pt-4 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 block mb-2">
            Quick Verification Demo Records:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setNicQuery('198512304561');
                handleSearchAndLogin('198512304561');
              }}
              className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-clinical-teal-400 hover:bg-slate-50 transition-colors"
            >
              <div className="font-semibold text-xs text-clinical-ink">Nimal Perera</div>
              <div className="text-[11px] font-mono text-slate-500">NIC: 198512304561 (Cardiology)</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setNicQuery('197265408923');
                handleSearchAndLogin('197265408923');
              }}
              className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-clinical-teal-400 hover:bg-slate-50 transition-colors"
            >
              <div className="font-semibold text-xs text-clinical-ink">Sunethra Jayawardena</div>
              <div className="text-[11px] font-mono text-slate-500">NIC: 197265408923 (Pending Bill)</div>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
