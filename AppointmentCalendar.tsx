import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Stethoscope } from 'lucide-react';
import { calendarApi, doctorApi } from '../../services/api';
import { Doctor } from '../../types';

interface AppointmentCalendarProps {
  role?: 'PATIENT' | 'DOCTOR' | 'MANAGER';
  patientId?: number;
  doctorId?: number;
  doctors?: Doctor[];
  onConfirm?: (doctorId: number, date: string, time: string, reason: string) => Promise<void> | void;
}

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  role = 'PATIENT',
  patientId,
  doctorId: initialDoctorId,
  doctors: externalDoctors,
  onConfirm,
}) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | undefined>(initialDoctorId);
  const [doctors, setDoctors] = useState<Doctor[]>(externalDoctors || []);
  const [calendarData, setCalendarData] = useState<any>(null);
  // const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Fetch doctors for doctor picker in Patient / Manager mode
  useEffect(() => {
    if (externalDoctors && externalDoctors.length > 0) {
      if (!selectedDoctorId) setSelectedDoctorId(externalDoctors[0].id);
    } else {
      doctorApi.getAll()
        .then((res) => {
          setDoctors(res.data);
          if (!selectedDoctorId && res.data.length > 0) {
            setSelectedDoctorId(res.data[0].id);
          }
        })
        .catch((err) => console.error('Failed to load doctors for calendar:', err));
    }
  }, [externalDoctors]);

  // Fetch calendar data from backend
  useEffect(() => {
    setLoading(true);
    calendarApi.getCalendar(role, { patientId, doctorId: selectedDoctorId })
      .then((res) => {
        setCalendarData(res.data);
      })
      .catch((err) => {
        console.error('Failed to load calendar data:', err);
      })
      .finally(() => setLoading(false));
  }, [role, patientId, selectedDoctorId]);

  // Available slots for selected doctor
  const availableSlots = useMemo(() => {
    if (!calendarData?.availableSlots) {
      // Default slots if none configured
      return ['09:00:00', '09:30:00', '10:00:00', '10:30:00', '11:00:00', '11:30:00', '14:00:00', '14:30:00', '15:00:00', '15:30:00'];
    }
    const slots = calendarData.availableSlots
      .filter((s: any) => !selectedDoctorId || s.doctorId === selectedDoctorId)
      .map((s: any) => s.startTime)
      .filter(Boolean);
    return slots.length > 0 ? slots : ['09:00:00', '09:30:00', '10:00:00', '10:30:00', '11:00:00', '14:00:00', '14:30:00'];
  }, [calendarData, selectedDoctorId]);

  // Days in month calculation
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: Array<{ dayNumber: number; dateString: string; isPast: boolean }> = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= totalDays; i++) {
      const dateObj = new Date(year, month, i);
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dayNumber: i,
        dateString,
        isPast: dateObj < today,
      });
    }

    return { firstDay, days };
  }, [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId || !selectedDate || !selectedTime) return;
    if (onConfirm) {
      setIsSubmitting(true);
      try {
        await onConfirm(selectedDoctorId, selectedDate, selectedTime, reason || 'Routine Consultation');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (role === 'MANAGER') {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Hospital Physician Schedule Matrix</h3>
            <p className="text-xs text-slate-500">Cross-department doctor coverage and consultation load</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Hospital Load: {calendarData?.hospitalLoad || 'NORMAL'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {calendarData?.doctorLoad?.map((doc: any) => (
            <div key={doc.doctorId} className="p-4 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{doc.doctorName}</h4>
                  <p className="text-xs text-teal-700 font-medium">{doc.specialization}</p>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                  doc.isAvailable !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {doc.isAvailable !== false ? 'On Duty' : 'Off Duty'}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
                <span>Booked Consultations:</span>
                <span className="font-bold text-slate-900 font-mono">{doc.appointmentCount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // PATIENT Booking Perspective
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Book Doctor Consultation</h3>
          <p className="text-xs text-slate-500">Select a specialist physician and choose an available time slot</p>
        </div>

        {/* Doctor Select */}
        <div className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-teal-600" />
          <select
            value={selectedDoctorId || ''}
            onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
            className="text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                Dr. {d.fullName} ({d.specialization}) — LKR {d.consultationFee}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Picker (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-800">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 mb-2">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: daysInMonth.firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-10" />
            ))}
            {daysInMonth.days.map((d) => {
              const isSelected = selectedDate === d.dateString;
              return (
                <button
                  key={d.dateString}
                  type="button"
                  disabled={d.isPast}
                  onClick={() => setSelectedDate(d.dateString)}
                  className={`h-10 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                    d.isPast
                      ? 'text-slate-300 cursor-not-allowed bg-slate-50/50'
                      : isSelected
                      ? 'bg-teal-600 text-white shadow-xs font-bold'
                      : 'border border-slate-100 text-slate-700 hover:bg-teal-50 hover:border-teal-200'
                  }`}
                >
                  {d.dayNumber}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 block mb-2.5">Available Time Slots for {selectedDate}</span>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {availableSlots.map((slot: string) => {
                const isSelected = selectedTime === slot;
                const normalizeTime = (t: string) => (t ? t.slice(0, 5) : '');
                
                // Determine if slot is already booked for this doctor on the selected date
                const isBooked = calendarData?.appointments?.some(
                  (apt: any) =>
                    Number(apt.doctorId) === Number(selectedDoctorId) &&
                    apt.appointmentDate === selectedDate &&
                    normalizeTime(apt.appointmentTime) === normalizeTime(slot) &&
                    apt.status !== 'CANCELLED'
                );

                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={isBooked}
                    onClick={() => setSelectedTime(slot)}
                    title={isBooked ? 'This slot has already been booked' : `Book for ${slot.slice(0, 5)}`}
                    className={`py-2 px-2 text-xs font-mono font-semibold rounded-lg border text-center transition-all relative ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm ring-2 ring-teal-500/20 font-bold'
                        : isBooked
                        ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed shadow-inner opacity-50 decoration-2 decoration-rose-500/50 line-through'
                        : 'border-slate-200 bg-white hover:bg-teal-50/50 hover:border-teal-300 text-slate-800 shadow-xs'
                    }`}
                  >
                    <span>{slot.slice(0, 5)}</span>
                    {isBooked && (
                      <span className="block text-[9px] font-sans font-medium text-rose-500 no-underline not-italic tracking-tight mt-0.5">
                        Booked
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Slot Legend */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded border border-slate-300 bg-white"></span> Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-teal-600"></span> Selected
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded border border-slate-200 bg-slate-200/80"></span>
                <span className="text-slate-400 line-through">Booked / Unavailable</span>
              </span>
            </div>
          </div>
        </div>

        {/* Confirmation Form (Right col) */}
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-5 flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Appointment Summary</h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500">Date:</span>
                <span className="font-semibold text-slate-800 font-mono">{selectedDate}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500">Time:</span>
                <span className="font-semibold text-slate-800 font-mono">{selectedTime ? selectedTime.slice(0, 5) : 'Select a slot'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500">Consultation Fee:</span>
                <span className="font-bold text-teal-700 font-mono">
                  LKR {doctors.find(d => d.id === selectedDoctorId)?.consultationFee || 2500}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Visit / Symptoms</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="E.g., Chest discomfort, routine checkup, follow-up..."
                rows={3}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={!selectedTime || !selectedDate || isSubmitting}
              className="w-full py-2.5 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-70 text-white font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Booking...</span>
                </>
              ) : (
                'Confirm Appointment'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCalendar;
