import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  UserRound,
  Stethoscope,
  FlaskConical,
  Building2,
  Calendar,
  PhoneCall,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { landingApi } from '../services/api';

export const LandingView: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeDoctorsCount: 6,
    departmentsCount: 6,
    satisfiedPatientsCount: 1540,
    testsAvailableCount: 9,
    featuredSpecialties: ['Cardiology', 'General Medicine', 'Neurology', 'Pediatrics'],
  });
  const [doctors, setDoctors] = useState<any[]>([]);
  const [labTests, setLabTests] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      landingApi.getStats().catch(() => ({ data: stats })),
      landingApi.getDoctors().catch(() => ({ data: [] })),
      landingApi.getLabTests().catch(() => ({ data: [] })),
    ])
      .then(([statsRes, docsRes, labRes]) => {
        if (statsRes.data) setStats(statsRes.data);
        if (docsRes.data) setDoctors(docsRes.data);
        if (labRes.data) setLabTests(labRes.data);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      {/* Top Notification Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Emergency & Trauma Center: 24/7 Open
            </span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:flex items-center gap-1 text-slate-400">
              <PhoneCall className="h-3 w-3 text-slate-400" />
              Hotline: +94 (11) 234-5678
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/patient/login" className="hover:text-white transition-colors">
              Patient Portal Login
            </Link>
            <span className="text-slate-600">|</span>
            <Link to="/admin" className="text-teal-400 hover:text-teal-300 font-semibold transition-colors">
              Staff Clinical Station &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header / Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-11 w-11 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-xs group-hover:bg-teal-700 transition-colors">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-slate-900">PulseOS</span>
                <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                  Hospital Core
                </span>
              </div>
              <p className="text-xs text-slate-500 -mt-0.5">Central Healthcare Management System</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#services" className="hover:text-teal-600 transition-colors">Clinical Services</a>
            <a href="#physicians" className="hover:text-teal-600 transition-colors">Specialist Physicians</a>
            <a href="#diagnostics" className="hover:text-teal-600 transition-colors">Laboratory & Tests</a>
            <Link to="/patient/portal" className="hover:text-teal-600 transition-colors">Appointments</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/patient/portal"
              className="py-2.5 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Book Consultation
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden bg-gradient-to-b from-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
                <span>SLMC Accredited Tertiary Hospital Care</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Compassionate Care, <br />
                <span className="text-teal-600">Unified Clinical Intelligence.</span>
              </h1>

              <p className="text-base text-slate-600 leading-relaxed max-w-xl">
                PulseOS delivers seamless digital hospital workflows across outpatient triage, physician consultations, laboratory diagnostics, and automated pharmacy fulfillment.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/patient/portal"
                  className="py-3 px-6 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-xs transition-colors flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Book Doctor Appointment</span>
                </Link>

                <Link
                  to="/patient/login"
                  className="py-3 px-6 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <UserRound className="h-4 w-4 text-slate-500" />
                  <span>Patient Health Records</span>
                </Link>
              </div>

              {/* Verified Trust Badges */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4">
                <div>
                  <span className="block text-2xl font-bold font-mono text-slate-900">{stats.activeDoctorsCount}+</span>
                  <span className="text-xs text-slate-500">Board Specialists</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold font-mono text-slate-900">{stats.departmentsCount}</span>
                  <span className="text-xs text-slate-500">Specialized Depts</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold font-mono text-slate-900">{stats.satisfiedPatientsCount}+</span>
                  <span className="text-xs text-slate-500">Patients Cared For</span>
                </div>
              </div>
            </div>

            {/* Quick Access Card Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => navigate('/patient/portal')}
                className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-teal-500 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="h-10 w-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <UserRound className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-600 transition-colors">Patient Portal</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  View prescriptions, download diagnostic reports, and manage upcoming appointments.
                </p>
                <div className="mt-4 flex items-center text-xs font-semibold text-teal-600">
                  <span>Enter Portal</span>
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </div>
              </div>

              <div
                onClick={() => navigate('/admin')}
                className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Doctor Station</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Physician consultation workspace, electronic clinical notes, and medication orders.
                </p>
                <div className="mt-4 flex items-center text-xs font-semibold text-blue-600">
                  <span>Clinician Login</span>
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </div>
              </div>

              <div
                onClick={() => navigate('/admin')}
                className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <FlaskConical className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">Pharmacy & Lab</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Real-time dispensary queues, drug inventory tracking, and automated pathology analysis.
                </p>
                <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600">
                  <span>Dispensary Access</span>
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </div>
              </div>

              <div
                onClick={() => navigate('/admin')}
                className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-purple-500 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Building2 className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors">Executive Portal</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Hospital administrative oversight, cross-department calendar schedules, and audit logs.
                </p>
                <div className="mt-4 flex items-center text-xs font-semibold text-purple-600">
                  <span>Manager View</span>
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Physicians Section */}
      <section id="physicians" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Consultant Directory</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Our Featured Physicians</h2>
              <p className="text-sm text-slate-500 mt-1">Leading clinical specialists available for consultation</p>
            </div>
            <Link
              to="/patient/portal"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              <span>View Full Consultation Schedule</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.length > 0 ? (
              doctors.slice(0, 6).map((doc) => (
                <div
                  key={doc.id}
                  className="p-6 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{doc.fullName}</h3>
                      <p className="text-xs text-teal-700 font-medium">{doc.specialization}</p>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      On Duty
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-500">
                    <p>Consultation Suite: <span className="font-semibold text-slate-800">{doc.roomNumber || 'Room 204'}</span></p>
                    <p>Consultation Fee: <span className="font-bold text-slate-900 font-mono">LKR {doc.consultationFee || 2500}</span></p>
                  </div>

                  <Link
                    to="/patient/portal"
                    className="block w-full py-2 px-3 text-center rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    Book Consultation
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-span-3 py-12 text-center text-slate-400">Loading specialist directory...</div>
            )}
          </div>
        </div>
      </section>

      {/* Diagnostic Investigations Catalog */}
      <section id="diagnostics" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Pathology & Diagnostics</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Diagnostic Laboratory Catalog</h2>
            <p className="text-sm text-slate-500 mt-1">
              Accurate, certified medical testing with digital results directly uploaded to your patient portal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {labTests.length > 0 ? (
              labTests.slice(0, 6).map((test) => (
                <div key={test.id} className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                        {test.testCode}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-2">{test.testName}</h4>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                    <span className="text-slate-500">Standard Fee:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      LKR {test.standardFee || test.price || 1500}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 py-12 text-center text-slate-400">Loading diagnostic catalog...</div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-lg">
                <Activity className="h-5 w-5" />
              </div>
              <span className="text-white text-base font-bold">PulseOS Hospital Management System</span>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/patient/login" className="hover:text-white transition-colors">Patient Portal</Link>
              <Link to="/admin" className="hover:text-white transition-colors">Staff Login</Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>&copy; 2026 PulseOS Group 60. Developed for SLIIT Academic Evaluation.</p>
            <p>Designed with TailAdmin UI & Emil Kowalski Design Engineering Principles.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingView;
