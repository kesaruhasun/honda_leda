import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ChevronLeft, TestTube, Cross, HeartPulse, Microscope } from 'lucide-react';

export const ServicesView: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 apple-glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            <ChevronLeft className="h-5 w-5" />
            <span className="font-semibold text-sm tracking-tight">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2 text-clinical-teal-800">
            <Activity className="h-5 w-5" />
            <span className="font-bold tracking-tight">Hospital Services</span>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Clinical & Diagnostic Services</h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-base">
            Comprehensive medical facilities backed by state-of-the-art technology and expert professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pharmacy */}
          <div className="bg-white rounded-apple-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="h-48 overflow-hidden bg-slate-100">
              <img src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=800" alt="Pharmacy" className="w-full h-full object-cover" />
            </div>
            <div className="p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700">
                  <Cross className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">24/7 Central Pharmacy</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Our in-house pharmacy ensures immediate access to prescribed medications. Integrated directly with our clinical systems, your prescriptions are ready for pickup immediately after your consultation.
              </p>
            </div>
          </div>

          {/* Laboratory */}
          <div className="bg-white rounded-apple-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="h-48 overflow-hidden bg-slate-100">
              <img src="https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=800" alt="Laboratory" className="w-full h-full object-cover" />
            </div>
            <div className="p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                  <Microscope className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Diagnostic Laboratory</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Advanced pathology and diagnostic services. Test results are automatically synced to your electronic health record and accessible via the patient portal for both you and your physician.
              </p>
            </div>
          </div>

          {/* OPD */}
          <div className="bg-white rounded-apple-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="h-48 overflow-hidden bg-slate-100">
              <img src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800" alt="OPD" className="w-full h-full object-cover" />
            </div>
            <div className="p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-clinical-teal-100 p-2 rounded-lg text-clinical-teal-700">
                  <TestTube className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Outpatient Department</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Consult with top specialists across multiple disciplines. Our streamlined booking and queuing system minimizes wait times and ensures dedicated attention from your physician.
              </p>
            </div>
          </div>

          {/* Emergency */}
          <div className="bg-white rounded-apple-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="h-48 overflow-hidden bg-slate-100">
              <img src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=800" alt="Emergency" className="w-full h-full object-cover" />
            </div>
            <div className="p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-rose-100 p-2 rounded-lg text-rose-700">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Trauma & Emergency</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Our 24/7 emergency unit is equipped to handle critical care situations with priority triage processing and immediate access to life-saving diagnostic facilities and specialists.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
