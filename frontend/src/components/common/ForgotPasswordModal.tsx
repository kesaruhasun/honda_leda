import React, { useState } from 'react';
import { X, Mail, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { authApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  initialEmail = '',
}) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await authApi.forgotPassword(email.trim());
      setSubmitted(true);
      setSuccessMessage(res.data?.message || `A temporary reset password has been dispatched to ${email}.`);
      showToast('success', 'Reset Code Dispatched', `Temporary password sent to ${email}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'No registered account found with that email address.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
        <div 
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 text-left overflow-hidden my-auto transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 shadow-2xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Reset Password</h3>
              <p className="text-xs text-slate-500">PulseOS Account Access Recovery</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {submitted ? (
          <div className="p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Credentials Dispatched</h4>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
                {successMessage}
              </p>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs text-amber-800 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                Security Check:
              </p>
              <p className="text-[11px] text-amber-700">
                Please check your inbox (and spam folder). Log in with the temporary password and update it immediately.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-all"
            >
              Done & Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your registered clinical or patient email address. PulseOS will automatically generate a new temporary password and dispatch it to your inbox.
            </p>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 shadow-2xs">
                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Registered Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. physician@pulseos.lk or name@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Temporary Password</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
        </div>
      </div>
    </div>
  );
};
