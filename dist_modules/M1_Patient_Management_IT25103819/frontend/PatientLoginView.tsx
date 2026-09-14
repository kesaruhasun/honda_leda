import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { patientApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ArrowRight, UserRound, AlertCircle, ChevronLeft, Lock } from 'lucide-react';
import { useRole } from '../../context/RoleContext';

export const PatientLoginView: React.FC = () => {
  const [nic, setNic] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { showToast } = useToast();
  const { setPatientSession } = useRole();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nic.trim() || !password) {
      setError('Please enter your NIC or Passport number and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Find patient by NIC
      let patientData: any = null;
      try {
        const res = await patientApi.getByNic(nic.trim());
        if (res.data) {
          patientData = res.data;
        }
      } catch {
        const searchRes = await patientApi.search(nic.trim());
        if (searchRes.data && searchRes.data.length > 0) {
          patientData = searchRes.data[0];
        }
      }

      if (!patientData) {
        setError('No account found with this NIC / Passport number. Please sign up first.');
        setLoading(false);
        return;
      }

      setPatientSession(patientData);
      sessionStorage.setItem('currentPatientId', patientData.id.toString());
      sessionStorage.setItem('currentPatientNic', nic.trim());
      sessionStorage.setItem('currentPatientName', patientData.fullName || `${patientData.firstName} ${patientData.lastName}`);

      showToast('success', 'Welcome Back', `Logged in as ${patientData.fullName || patientData.firstName}`);
      navigate('/patient/portal');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Invalid NIC or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors text-sm font-medium">
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl overflow-hidden bg-white border border-slate-200/80 shadow-xs flex items-center justify-center p-0.5 shrink-0">
                <img src="/pulseos-logo.jpg" alt="PulseOS Logo" className="h-full w-full object-contain rounded-lg" />
              </div>
              <div>
                <span className="font-bold text-xl tracking-tight text-slate-900 block leading-tight">PulseOS</span>
                <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-clinical-teal-700">Digital Patient Care</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">Sign in to your portal</h2>
            <p className="mt-2 text-sm text-slate-600">
              Manage your appointments, view lab reports, and access your health records.
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-start gap-3 shadow-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="nic" className="block text-sm font-semibold text-slate-900 mb-1.5">
                  NIC or Passport Number
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserRound className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="nic"
                    name="nic"
                    type="text"
                    required
                    value={nic}
                    onChange={(e) => setNic(e.target.value)}
                    className="apple-input block w-full pl-10 sm:text-sm rounded-xl py-3 bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-clinical-teal-500 focus:border-clinical-teal-500"
                    placeholder="e.g. 199012345678"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-900 mb-1.5">
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="apple-input block w-full pl-10 sm:text-sm rounded-xl py-3 bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-clinical-teal-500 focus:border-clinical-teal-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-clinical-teal-600 focus:ring-clinical-teal-500 border-slate-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-clinical-teal-600 hover:text-clinical-teal-500">
                    Forgot password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="apple-btn w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-clinical-teal-600 hover:bg-clinical-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-clinical-teal-500 disabled:opacity-70 transition-all"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs text-center text-slate-400 font-medium uppercase tracking-wider mb-4">Demo Quick Access</p>
            <div className="flex justify-center">
              <button onClick={() => {setNic("199012345678"); setPassword("password");}} className="apple-btn px-6 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100">Demo Patient</button>
            </div>
          </div>


            <div className="mt-8 relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-slate-50 text-slate-500 font-medium">New to PulseOS?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/patient/signup"
                className="apple-btn w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-slate-200 rounded-xl shadow-sm text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all"
              >
                Create an account
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:block relative w-0 flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=1600"
          alt="Hospital reception"
        />
        <div className="absolute inset-0 bg-clinical-teal-900/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-12 text-white max-w-xl">
          <h2 className="text-3xl font-bold mb-4">Your Health, Centralized.</h2>
          <p className="text-slate-200 leading-relaxed">
            PulseOS Patient Portal provides secure, real-time access to your diagnostic results, prescriptions, and appointment history.
          </p>
        </div>
      </div>
    </div>
  );
};
