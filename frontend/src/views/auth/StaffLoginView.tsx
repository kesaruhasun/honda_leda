import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useRole } from '../../context/RoleContext';
import { Lock, UserRound, ChevronLeft, AlertCircle } from 'lucide-react';
import { UserRole } from '../../types';

export const StaffLoginView: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { setRole } = useRole();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    
    setLoading(true);
    setError('');

    const u = username.toLowerCase().trim();
    let roleToSet: UserRole = 'RECEPTIONIST';
    if (u.includes('admin')) roleToSet = 'CASHIER_ADMIN';
    else if (u.includes('doc')) roleToSet = 'DOCTOR';
    else if (u.includes('pharm')) roleToSet = 'PHARMACIST';
    else if (u.includes('lab')) roleToSet = 'LAB_TECHNICIAN';
    else if (u.includes('rec')) roleToSet = 'RECEPTIONIST';
    else roleToSet = 'CASHIER_ADMIN';

    setRole(roleToSet);
    showToast('success', 'Authenticated', `Logged in as ${roleToSet.replace('_', ' ')}`);

    switch (roleToSet) {
      case 'DOCTOR': navigate('/dashboard/appointments'); break;
      case 'RECEPTIONIST': navigate('/dashboard/patients'); break;
      case 'PHARMACIST': navigate('/dashboard/pharmacy'); break;
      case 'LAB_TECHNICIAN': navigate('/dashboard/laboratory'); break;
      case 'CASHIER_ADMIN': navigate('/dashboard/billing'); break;
      default: navigate('/dashboard/patients');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="absolute top-6 left-6 flex items-center gap-4">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium">
          <ChevronLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <Link to="/">
            <img src="/pulseos-logo.jpg" alt="PulseOS Logo" className="h-16 w-16 object-contain rounded-2xl shadow-sm cursor-pointer hover:scale-105 transition-transform" />
          </Link>
        </div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
          Staff Portal
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Secure access to PulseOS clinical systems
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-slate-200/60 sm:rounded-apple-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-start gap-3 shadow-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1.5">
                Staff ID / Username
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserRound className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="apple-input block w-full pl-10 sm:text-sm rounded-xl py-2.5 bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-clinical-teal-500 focus:border-clinical-teal-500"
                  placeholder="e.g., admin, doctor01"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
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
                  className="apple-input block w-full pl-10 sm:text-sm rounded-xl py-2.5 bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-clinical-teal-500 focus:border-clinical-teal-500"
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
                  'Secure Login'
                )}
              </button>
            </div>
          </form>
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs text-center text-slate-400 font-medium uppercase tracking-wider mb-4">Demo Quick Access</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button type="button" onClick={() => {setUsername("admin"); setPassword("admin");}} className="apple-btn py-2 text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100">Admin</button>
              <button type="button" onClick={() => {setUsername("doctor"); setPassword("password");}} className="apple-btn py-2 text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100">Doctor</button>
              <button type="button" onClick={() => {setUsername("pharmacist"); setPassword("password");}} className="apple-btn py-2 text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100">Pharmacist</button>
              <button type="button" onClick={() => {setUsername("receptionist"); setPassword("password");}} className="apple-btn py-2 text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100">Receptionist</button>
              <button type="button" onClick={() => {setUsername("lab"); setPassword("password");}} className="apple-btn py-2 text-xs font-bold bg-clinical-teal-50 border border-clinical-teal-300 text-clinical-teal-800 rounded-lg hover:bg-clinical-teal-100 col-span-2 sm:col-span-1 shadow-2xs">Lab Tech</button>
            </div>
          </div>


          <div className="mt-6 border-t border-slate-100 pt-6">
            <p className="text-xs text-center text-slate-500">
              For security, access is strictly monitored. Contact IT Support at ext. 1200 if you encounter issues.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
