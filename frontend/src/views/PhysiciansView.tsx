import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Search, Calendar, ChevronLeft, Stethoscope, ShieldCheck } from 'lucide-react';
import { doctorApi } from '../services/api';
import { Doctor } from '../types';

export const PhysiciansView: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const response = await doctorApi.getAll();
      setDoctors(response.data);
    } catch (error) {
      console.error("Failed to load doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doc => 
    doc.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <span className="font-bold tracking-tight text-slate-900 text-xs sm:text-base">Physician Directory</span>
          </div>
          <Link to="/patient/portal" className="text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shrink-0 whitespace-nowrap">
            Book Appointment
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full space-y-6 sm:space-y-8">
        {/* Banner with Authentic Clinical Photography */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm min-h-[160px] sm:min-h-[220px] bg-slate-900">
          <img
            src="/images/doctor_consultation_suite_1791192163441.jpg"
            alt="Physician Consultation Suite"
            className="absolute inset-0 w-full h-full object-cover opacity-80"
            referrerPolicy="no-referrer"
          />
          <div className="relative z-10 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-transparent flex items-center p-5 sm:p-8 md:p-12">
            <div className="max-w-xl text-white space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 text-[11px] sm:text-xs font-medium text-teal-400 flex-wrap">
                <ShieldCheck className="h-3.5 sm:h-4 w-3.5 sm:w-4 shrink-0" />
                <span>SLMC Certified Specialists</span>
                <span aria-hidden="true" className="text-slate-500">·</span>
                <span>Evidence-Based Outpatient Care</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Consultant Medical Staff</h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Connect directly with board-certified clinical specialists across Cardiology, General Medicine, Neurology, Pediatrics, and Orthopedics.
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by physician name or specialty (e.g. Cardiology)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-white shadow-2xs"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => (
              <div key={doc.id} className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col hover:border-slate-300 transition-all">
                <div className="p-6 flex gap-4 items-start border-b border-slate-100">
                  <div className="w-14 h-14 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg border border-teal-100 shrink-0">
                    <Stethoscope className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 text-base leading-tight truncate">
                      {doc.fullName || `Dr. ${doc.firstName} ${doc.lastName}`}
                    </h3>
                    <p className="text-teal-700 font-medium text-xs mt-0.5">{doc.specialization}</p>
                    <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                      <span className={`inline-block h-2 w-2 rounded-full ${doc.isAvailable ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      <span>{doc.isAvailable ? 'Active On-Duty' : 'On Rounds / Off-Duty'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-slate-50/50 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Consultation Suite:</span>
                      <span className="font-semibold text-slate-800">{doc.roomNumber || 'Room 204'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Standard Consultation Fee:</span>
                      <span className="font-bold text-slate-900 font-mono tabular-nums">LKR {doc.consultationFee || 2500}</span>
                    </div>
                  </div>

                  <Link
                    to="/patient/portal"
                    className="w-full py-2.5 px-4 text-center rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Book Consultation Session</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PhysiciansView;
