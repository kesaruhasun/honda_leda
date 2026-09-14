import React, { useState, useEffect } from 'react';
import {
  Activity,
  Stethoscope,
  HeartPulse,
  Brain,
  Baby,
  Pill,
  FlaskConical,
  Clock,
  Phone,
  ShieldCheck,
  ArrowRight,
  User,
  CalendarCheck,
  Receipt,
} from 'lucide-react';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { PatientLoginModal } from '../components/auth/PatientLoginModal';
import { StaffLoginModal } from '../components/auth/StaffLoginModal';
import { useRole } from '../context/RoleContext';
import { doctorApi } from '../services/api';
import { Doctor } from '../types';

export const LandingView: React.FC = () => {
  const { setIsPatientLoginModalOpen, setIsStaffLoginModalOpen } = useRole();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const res = await doctorApi.getAll();
        setDoctors(res.data);
      } catch (e) {
        // Fallback or silently handle
      } finally {
        setLoadingDoctors(false);
      }
    };
    loadDoctors();
  }, []);

  const SPECIALTIES = [
    {
      name: 'Cardiology & Vascular',
      desc: 'Advanced ECG, lipid monitoring, hypertension management, and cardiac wellness.',
      icon: HeartPulse,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
    },
    {
      name: 'Neurology & Diagnostics',
      desc: 'Neurological evaluations, chronic migraine management, and brain imaging referrals.',
      icon: Brain,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      name: 'Pediatric Care',
      desc: 'Comprehensive infant, child wellness, pediatric respiratory, and adolescent care.',
      icon: Baby,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      name: 'Internal & General Medicine',
      desc: 'Outpatient consultations, diabetes care, routine physicals, and preventative diagnostics.',
      icon: Stethoscope,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
    },
    {
      name: 'Pathology & Laboratory',
      desc: 'Automated clinical chemistry, lipid profiles, hematology, and rapid blood sugar testing.',
      icon: FlaskConical,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    },
    {
      name: 'Hospital Pharmacy',
      desc: 'Therapeutic dispensing, automated drug reconciliation, and stock integrity management.',
      icon: Pill,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-clinical-ink flex flex-col font-sans selection:bg-clinical-teal-100 selection:text-clinical-teal-900">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-clinical-teal-50 border border-clinical-teal-200 text-clinical-teal-800 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-clinical-teal-600 animate-ping"></span>
                <span>Accredited Tertiary Outpatient Healthcare</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                Advanced clinical care, <br />
                <span className="text-clinical-teal-600">delivered with precision.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                PulseOS connects patients, consultant physicians, diagnostic laboratories, and hospital pharmacies into a single unified clinical ecosystem.
              </p>

              {/* Action Trigger Buttons */}
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => setIsPatientLoginModalOpen(true)}
                  className="apple-btn inline-flex items-center gap-2.5 px-6 py-3.5 rounded-apple-xl bg-clinical-teal-600 hover:bg-clinical-teal-700 text-white text-sm font-semibold shadow-md shadow-clinical-teal-600/25 transition-all"
                >
                  <User className="h-4 w-4" />
                  <span>Access Patient Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setIsStaffLoginModalOpen(true)}
                  className="apple-btn inline-flex items-center gap-2.5 px-6 py-3.5 rounded-apple-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold border border-slate-300/80 transition-all"
                >
                  <ShieldCheck className="h-4 w-4 text-slate-600" />
                  <span>Clinician Sign In</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-100 text-xs">
                <div>
                  <span className="font-bold text-slate-900 text-base block font-mono">100%</span>
                  <span className="text-slate-500">Live Database Persistence</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-base block font-mono">24 / 7</span>
                  <span className="text-slate-500">Emergency & Trauma Triage</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-base block font-mono">PayHere</span>
                  <span className="text-slate-500">Digital Gateway Verified</span>
                </div>
              </div>
            </div>

            {/* Right Card / Clinical Snapshot */}
            <div className="lg:col-span-5">
              <div className="p-6 rounded-apple-2xl bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-200/90 shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-clinical-teal-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Hospital Live Operations
                    </span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                    OPD Active
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
                        <CalendarCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">Consultation Bookings</div>
                        <div className="text-[11px] text-slate-500">Conflict-free slot scheduling</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-clinical-teal-700">Available</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-50 text-cyan-700">
                        <FlaskConical className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">Diagnostic Pathology</div>
                        <div className="text-[11px] text-slate-500">FBC, Lipid Profile, FBS</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-slate-700">Same-Day</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                        <Receipt className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">Electronic Invoicing</div>
                        <div className="text-[11px] text-slate-500">LKR PayHere + Cash counter</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-700">Instant</span>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <button
                    onClick={() => setIsPatientLoginModalOpen(true)}
                    className="text-xs font-semibold text-clinical-teal-700 hover:text-clinical-teal-800 hover:underline"
                  >
                    Enter Patient Portal to view lab reports & bills &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Specialties Section */}
      <section id="specialties" className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-clinical-teal-700 mb-1">
              Clinical Excellence
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Specialized Departments & Clinical Services
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Equipped with modern clinical diagnostics and led by SLMC-licensed consultant physicians.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SPECIALTIES.map((spec) => {
              const Icon = spec.icon;
              return (
                <div
                  key={spec.name}
                  className="p-5 rounded-apple-xl bg-white border border-slate-200/80 hover:border-clinical-teal-300 hover:shadow-sm transition-all space-y-3"
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center border ${spec.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{spec.name}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{spec.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Physicians Section */}
      <section id="physicians" className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-clinical-teal-700 mb-1">
                Medical Staff
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Consultant Specialists & Physicians
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Book direct consultations across our outpatient clinical specialties.
              </p>
            </div>
            <button
              onClick={() => setIsPatientLoginModalOpen(true)}
              className="apple-btn inline-flex items-center gap-1.5 text-xs font-semibold text-clinical-teal-700 hover:text-clinical-teal-800"
            >
              <span>Sign in to book an appointment</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {loadingDoctors ? (
            <div className="text-center py-12 text-xs text-slate-500 font-mono">
              Loading physician rosters...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {doctors.map((doc) => (
                <div
                  key={doc.id}
                  className="p-5 rounded-apple-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center">
                        Dr
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{doc.fullName || `Dr. ${doc.firstName} ${doc.lastName}`}</h4>
                        <span className="text-xs text-clinical-teal-700 font-medium block">{doc.specialization}</span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        doc.isAvailable
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {doc.isAvailable ? 'Available' : 'On Rounds'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-slate-200/70">
                    <div>
                      <span className="text-slate-400 block text-[10px]">CONSULTATION ROOM</span>
                      <span className="font-semibold text-slate-700">{doc.roomNumber || 'Room 102'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">STANDARD FEE</span>
                      <span className="font-mono font-bold text-slate-900">
                        LKR {Number(doc.consultationFee || 2500).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsPatientLoginModalOpen(true)}
                    className="apple-btn w-full py-2 rounded-lg bg-white border border-slate-200 hover:border-clinical-teal-500 hover:bg-clinical-teal-50 text-clinical-ink text-xs font-semibold transition-all"
                  >
                    Schedule Consultation
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Hospital Services & Facilities */}
      <section id="services" className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <div className="text-xs font-bold uppercase tracking-wider text-clinical-teal-700">
                Hospital Infrastructure
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                State-of-the-Art Diagnostics & Clinical Records
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                PulseOS eliminates paper fragmentation. Diagnostic laboratory findings, computerized physician orders, and automated billing are instantly synced to patient files.
              </p>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-clinical-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Unique Patient Demographic Identifier</span>
                    <span className="text-slate-600">Strict national NIC and passport number verification on intake.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-clinical-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Conflict-Free Appointment Engine</span>
                    <span className="text-slate-600">Automated slot locking prevents physician double-booking.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-clinical-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Real-Time Central Dispensary Tracking</span>
                    <span className="text-slate-600">Prescription orders immediately deduct inventory stock.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-apple-2xl bg-slate-900 text-white space-y-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-clinical-teal-400" />
                  <span className="font-bold text-sm">Operating Hours & Emergency</span>
                </div>
                <span className="text-xs font-mono text-slate-400">24/7 Service</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Emergency Trauma & Triage</span>
                  <span className="font-bold text-emerald-400">24 Hours / 7 Days</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Outpatient Consultation (OPD)</span>
                  <span className="text-slate-200">08:00 — 20:00 Daily</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Diagnostic Laboratory</span>
                  <span className="text-slate-200">06:30 — 22:00 Daily</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Central Inpatient Pharmacy</span>
                  <span className="font-bold text-emerald-400">24 Hours / 7 Days</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
                <div className="flex items-center gap-2 text-rose-400 font-bold mb-1">
                  <Phone className="h-4 w-4" />
                  <span>Ambulance Dispatch: 1990</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Direct line to hospital emergency room: +94 11 234 5678
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-clinical-teal-600" />
            <span className="font-bold text-slate-800">PulseOS Hospital Management System</span>
            <span>&bull; Ministry of Health Registered</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsPatientLoginModalOpen(true)}
              className="hover:text-clinical-teal-700 font-medium"
            >
              Patient Portal
            </button>
            <button
              onClick={() => setIsStaffLoginModalOpen(true)}
              className="hover:text-clinical-teal-700 font-medium"
            >
              Staff Sign In
            </button>
            <a
              href="http://localhost:8080/h2-console"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 font-mono hover:underline"
            >
              H2 Database Console
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PatientLoginModal />
      <StaffLoginModal />
    </div>
  );
};
