import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Search, Calendar, ChevronLeft } from 'lucide-react';
import { doctorApi } from '../services/api';
import { Doctor } from '../types';

// Mock images for doctors if they don't have one
const DOCTOR_AVATARS = [
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300",
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300",
  "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300&h=300",
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300&h=300",
  "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=300&h=300",
  "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300&h=300"
];

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
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 apple-glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            <ChevronLeft className="h-5 w-5" />
            <span className="font-semibold text-sm tracking-tight">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2 text-clinical-teal-800">
            <Activity className="h-5 w-5" />
            <span className="font-bold tracking-tight">Physician Directory</span>
          </div>
          <div className="w-20"></div> {/* Spacer */}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="mb-10 text-center space-y-4">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Our Specialists</h1>
          <p className="text-slate-500 max-w-xl mx-auto text-sm">
            Browse our directory of board-certified physicians and specialists available for consultation.
          </p>
          
          <div className="max-w-md mx-auto relative mt-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="apple-input block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-full text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-clinical-teal-500/20 focus:border-clinical-teal-500 transition-all bg-white shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clinical-teal-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc, idx) => (
              <div key={doc.id} className="bg-white rounded-apple-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="p-6 flex gap-4 items-start border-b border-slate-100">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <img 
                      src={DOCTOR_AVATARS[idx % DOCTOR_AVATARS.length]} 
                      alt={doc.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight">{doc.fullName || `Dr. ${doc.firstName} ${doc.lastName}`}</h3>
                    <p className="text-clinical-teal-600 font-medium text-sm mt-0.5">{doc.specialization}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        doc.isAvailable
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {doc.isAvailable ? 'Available' : 'On Rounds'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-slate-50/50 flex-1 flex flex-col">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Room</span>
                      <span className="text-sm font-semibold text-slate-700">{doc.roomNumber || 'TBA'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Standard Fee</span>
                      <span className="text-sm font-semibold text-slate-700">
                        LKR {Number(doc.consultationFee || 2500).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <Link 
                    to="/patient/login"
                    className="mt-auto w-full apple-btn py-2.5 bg-white border border-slate-200 rounded-xl text-center text-sm font-semibold text-slate-700 hover:bg-clinical-teal-50 hover:border-clinical-teal-200 hover:text-clinical-teal-700 transition-all flex justify-center items-center gap-2 shadow-sm"
                  >
                    <Calendar className="w-4 h-4" />
                    Book Consultation
                  </Link>
                </div>
              </div>
            ))}
            
            {filteredDoctors.length === 0 && (
              <div className="col-span-full text-center py-20 text-slate-500">
                No physicians found matching your search.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
