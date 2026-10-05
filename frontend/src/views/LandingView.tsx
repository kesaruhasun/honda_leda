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
  Activity,
  Menu,
  X,
} from 'lucide-react';
import { landingApi } from '../services/api';

export const LandingView: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-3 sm:px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px] sm:text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Emergency &amp; Trauma: 24/7 Open
            </span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:flex items-center gap-1 text-slate-400">
              <PhoneCall className="h-3 w-3 text-slate-400" />
              Hotline: 1990 / +94 (11) 234-5678
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs">
            <Link to="/patient/login" className="hover:text-white transition-colors">
              Patient Portal Login
            </Link>
            <span className="text-slate-600">|</span>
            <Link to="/admin" className="text-teal-400 hover:text-teal-300 font-semibold transition-colors">
              Staff Station &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header / Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-xs group-hover:bg-teal-700 transition-colors">
              <Activity className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900">PulseOS</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs lg:text-sm font-medium text-slate-600">
            <Link to="/services" className="hover:text-teal-700 transition-colors">Clinical Services</Link>
            <Link to="/physicians" className="hover:text-teal-700 transition-colors">Specialist Physicians</Link>
            <a href="#diagnostics" className="hover:text-teal-700 transition-colors">Diagnostics &amp; Pathology</a>
            <Link to="/patient/portal" className="hover:text-teal-700 transition-colors">Patient Portal</Link>
          </nav>

          {/* Action & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/patient/portal"
              className="hidden xs:inline-flex sm:inline-flex py-2 sm:py-2.5 px-3.5 sm:px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors whitespace-nowrap"
            >
              Book Consultation
            </Link>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
            <nav className="flex flex-col space-y-2 text-xs font-semibold text-slate-700">
              <Link
                to="/services"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Clinical Services
              </Link>
              <Link
                to="/physicians"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Specialist Physicians
              </Link>
              <a
                href="#diagnostics"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Diagnostics &amp; Pathology
              </a>
              <Link
                to="/patient/portal"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Patient Portal
              </Link>
            </nav>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/patient/portal"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2.5 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Book Doctor Consultation
              </Link>
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
              >
                Staff Clinical Station Sign In
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section with Responsive Grid */}
      <section className="relative pt-8 sm:pt-12 pb-12 sm:pb-16 overflow-hidden bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <div className="lg:col-span-6 space-y-5 sm:space-y-6">
              <div className="flex items-center gap-2 text-xs font-medium text-teal-800 flex-wrap">
                <ShieldCheck className="h-4 w-4 text-teal-600 shrink-0" />
                <span>SLMC Accredited Tertiary Hospital</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>Emergency 24/7</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.2] sm:leading-[1.15]" style={{ textWrap: 'balance' }}>
                Compassionate Care, <br />
                <span className="text-teal-700">Unified Clinical Intelligence.</span>
              </h1>

              <p className="text-xs sm:text-base text-slate-600 leading-relaxed max-w-lg">
                PulseOS unites outpatient triage, physician consultations, automated diagnostic pathology, and closed-loop pharmacy fulfillment in a single ergonomic workspace.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2">
                <Link
                  to="/patient/portal"
                  className="py-3 px-5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 text-center"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Book Doctor Appointment</span>
                </Link>

                <Link
                  to="/patient/login"
                  className="py-3 px-5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-2 text-center"
                >
                  <UserRound className="h-4 w-4 text-slate-500" />
                  <span>Patient Health Records</span>
                </Link>
              </div>

              {/* Verified Trust Telemetry */}
              <div className="pt-4 sm:pt-6 border-t border-slate-100 grid grid-cols-3 gap-2 sm:gap-4 text-center sm:text-left">
                <div>
                  <span className="block text-xl sm:text-2xl font-bold font-mono text-slate-900 tabular-nums">{stats.activeDoctorsCount}+</span>
                  <span className="text-[10px] sm:text-xs text-slate-500">Board Specialists</span>
                </div>
                <div>
                  <span className="block text-xl sm:text-2xl font-bold font-mono text-slate-900 tabular-nums">{stats.departmentsCount}</span>
                  <span className="text-[10px] sm:text-xs text-slate-500">Clinical Depts</span>
                </div>
                <div>
                  <span className="block text-xl sm:text-2xl font-bold font-mono text-slate-900 tabular-nums">{stats.satisfiedPatientsCount}+</span>
                  <span className="text-[10px] sm:text-xs text-slate-500">Patients Cared For</span>
                </div>
              </div>
            </div>

            {/* Hero Image & Workstation Matrix */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm aspect-16/9 bg-slate-100 group">
                <img
                  src="/images/hero_hospital_atrium_1791192143869.jpg"
                  alt="PulseOS Hospital Modern Atrium and Clinical Pavilion"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 text-white">
                  <div className="flex items-center gap-2 text-[11px] sm:text-xs text-teal-300 font-medium">
                    <span>Central Medical Pavilion</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">Surgical Suites &amp; Outpatient Care</span>
                  </div>
                </div>
              </div>

              {/* Clinical Station Navigation Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => navigate('/patient/portal')}
                  className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-500 hover:shadow-xs transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <UserRound className="h-5 w-5 text-teal-600" />
                    <span className="text-[11px] font-medium text-slate-400">Portal</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">Patient Wellness Hub</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">View lab results, pharmacy orders &amp; visits</p>
                </div>

                <div
                  onClick={() => navigate('/admin')}
                  className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-xs transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Stethoscope className="h-5 w-5 text-blue-600" />
                    <span className="text-[11px] font-medium text-slate-400">Station</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">Physician Station</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">Clinical dossiers, e-prescriptions &amp; notes</p>
                </div>

                <div
                  onClick={() => navigate('/admin')}
                  className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-xs transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <FlaskConical className="h-5 w-5 text-emerald-600" />
                    <span className="text-[11px] font-medium text-slate-400">Dispensary</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">Pharmacy &amp; Lab</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">Barcoded dispensing &amp; specimen pipeline</p>
                </div>

                <div
                  onClick={() => navigate('/admin')}
                  className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-white hover:border-purple-500 hover:shadow-xs transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Building2 className="h-5 w-5 text-purple-600" />
                    <span className="text-[11px] font-medium text-slate-400">Cockpit</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">Executive Ops</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">Hospital occupancy, cash flow &amp; audits</p>
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
