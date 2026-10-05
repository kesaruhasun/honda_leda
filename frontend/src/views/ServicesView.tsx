import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ChevronLeft, TestTube, Pill, HeartPulse, Microscope, ArrowRight, ShieldCheck } from 'lucide-react';

export const ServicesView: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2 text-slate-600 hover:text-slate-900 transition-colors text-xs sm:text-sm font-semibold shrink-0">
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Return to Hospital Core</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <div className="flex items-center gap-2 text-teal-800">
            <Activity className="h-4 sm:h-5 w-4 sm:w-5 text-teal-600 shrink-0" />
            <span className="font-bold tracking-tight text-slate-900 text-xs sm:text-base">Hospital Clinical Services</span>
          </div>
          <Link to="/patient/portal" className="text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shrink-0 whitespace-nowrap">
            Book Appointment
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-teal-800">
            <ShieldCheck className="h-4 w-4 text-teal-600" />
            <span>Integrated Tertiary Care Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Clinical & Diagnostic Divisions</h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            From emergency trauma resuscitation to robotic pathology pipelines, PulseOS coordinates every clinical touchpoint with zero diagnostic latency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pharmacy */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-xs transition-shadow">
            <div className="h-52 overflow-hidden bg-slate-900 relative">
              <img
                src="/images/pharmacy_dispensary_vault_1791192547575.jpg"
                alt="Hospital Pharmacy Dispensary Cleanroom and Automated Medication Storage"
                className="w-full h-full object-cover opacity-85 hover:scale-102 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 text-white text-xs font-medium">
                Hospital Dispensary & Closed-Loop Fulfillment
              </div>
            </div>
            <div className="p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-xl border border-emerald-100">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">24/7 Outpatient & Inpatient Pharmacy</h2>
                  <p className="text-xs text-slate-500">Formulary inventory & automated dispensary queue</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Directly connected to physician consultation stations for electronic medication dispensing. Ensures zero transcription errors, allergy contraindication alerts, and rapid prescription fulfillment.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                <span className="text-slate-500">Availability: <strong className="text-emerald-700">24 Hours / 365 Days</strong></span>
                <Link to="/patient/portal" className="text-teal-700 font-semibold hover:text-teal-800 flex items-center gap-1">
                  <span>Order Medication Refills</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Laboratory */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-xs transition-shadow">
            <div className="h-52 overflow-hidden bg-slate-900 relative">
              <img
                src="/images/pathology_laboratory_suite_1791192175243.jpg"
                alt="Diagnostic Pathology Laboratory Suite"
                className="w-full h-full object-cover opacity-85 hover:scale-102 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 text-white text-xs font-medium">
                Certified Automated Clinical Diagnostics
              </div>
            </div>
            <div className="p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-50 text-indigo-700 p-2.5 rounded-xl border border-indigo-100">
                  <Microscope className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Central Diagnostic Pathology</h2>
                  <p className="text-xs text-slate-500">Hematology, Biochemistry, Endocrinology & Serology</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Automated specimen barcoding with numerical reference range validation. Certified digital reports are uploaded directly to the patient health portal with physician notification flags.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                <span className="text-slate-500">Turnaround: <strong className="text-indigo-700">1 to 4 Hours</strong></span>
                <Link to="/patient/portal" className="text-teal-700 font-semibold hover:text-teal-800 flex items-center gap-1">
                  <span>View Diagnostic Catalog</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* OPD */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-xs transition-shadow">
            <div className="h-52 overflow-hidden bg-slate-900 relative">
              <img
                src="/images/doctor_consultation_suite_1791192163441.jpg"
                alt="Physician Consultation Suite"
                className="w-full h-full object-cover opacity-85 hover:scale-102 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 text-white text-xs font-medium">
                Multi-Disciplinary Specialist Clinics
              </div>
            </div>
            <div className="p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-teal-50 text-teal-700 p-2.5 rounded-xl border border-teal-100">
                  <TestTube className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Outpatient Consultant Clinics</h2>
                  <p className="text-xs text-slate-500">Scheduled specialist appointments & health screening</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Consult with top clinical specialists across cardiology, endocrinology, neurology, and pediatrics. Real-time queue telemetry minimizes waiting time and maximizes physician attention.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                <span className="text-slate-500">Rooms: <strong className="text-teal-700">Suite 201 – 208</strong></span>
                <Link to="/physicians" className="text-teal-700 font-semibold hover:text-teal-800 flex items-center gap-1">
                  <span>Browse Physicians</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Emergency & Trauma */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-xs transition-shadow">
            <div className="h-52 overflow-hidden bg-slate-900 relative">
              <img
                src="/images/emergency_triage_bay_1791192573694.jpg"
                alt="Trauma and Emergency Resuscitation Bay"
                className="w-full h-full object-cover opacity-85 hover:scale-102 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 text-white text-xs font-medium">
                Level 1 Trauma & Emergency Resuscitation Center
              </div>
            </div>
            <div className="p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-rose-50 text-rose-700 p-2.5 rounded-xl border border-rose-100">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Emergency & Acute Trauma Care</h2>
                  <p className="text-xs text-slate-500">Priority triage with Manchester & ESI protocols</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Dedicated emergency resuscitation teams equipped with instant point-of-care diagnostics, critical care stabilization, and immediate surgical suite access.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                <span className="text-slate-500">Hotline: <strong className="text-rose-700">+94 (11) 234-5678</strong></span>
                <span className="text-rose-700 font-semibold">Immediate Walk-in</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
