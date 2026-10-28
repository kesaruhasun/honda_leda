import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarCheck,
  Calendar as CalendarIcon,
  Table as TableIcon,
  Plus,
  Clock,
  CheckCircle2,
  Search,
  Stethoscope,
  Pill,
  Trash2,
  ChevronLeft,
  ChevronRight,
  User,
  AlertCircle,
} from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { Modal } from '../components/common/Modal';
import { AppointmentCalendar } from '../components/appointments/AppointmentCalendar';
import { useToast } from '../context/ToastContext';
import { useRole } from '../context/RoleContext';
import { appointmentApi, doctorApi, patientApi, pharmacyApi, billingApi } from '../services/api';
import { Appointment, Doctor, Patient, Drug } from '../types';

interface PrescribeItemState {
  drugId: number | string;
  dosage: string;
  frequency: string;
  durationDays: number;
  quantity: number;
  instructions: string;
}

const AppointmentStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'CONFIRMED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
        <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
        <span>Confirmed</span>
      </span>
    );
  }
  if (status === 'SCHEDULED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-300">
        <Clock className="h-3 w-3 text-amber-600 shrink-0" />
        <span>Scheduled</span>
      </span>
    );
  }
  if (status === 'COMPLETED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
        <CheckCircle2 className="h-3 w-3 text-slate-500 shrink-0" />
        <span>Completed</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-300">
      <AlertCircle className="h-3 w-3 text-rose-500 shrink-0" />
      <span>{status}</span>
    </span>
  );
};

const formatAptNumber = (raw: any) => {
  if (!raw) return 'APT-0001';
  const s = String(raw);
  return s.startsWith('APT-') ? s : `APT-${s.padStart(4, '0')}`;
};

export const AppointmentView: React.FC = () => {
  const { showToast } = useToast();
  const { currentRole } = useRole();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(true);

  // View switch: 'calendar' | 'table'
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');

  // Doctor Station Filter: 'my' (Dr. Kavinda) | 'all'
  const [doctorScope, setDoctorScope] = useState<'my' | 'all'>(
    currentRole === 'DOCTOR' ? 'my' : 'all'
  );

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  // Calendar Navigation State
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Clinical Encounter & E-Prescribe Modal State
  const [encounterModalApt, setEncounterModalApt] = useState<Appointment | null>(null);
  const [clinicalDiagnosis, setClinicalDiagnosis] = useState('');
  const [prescribedItems, setPrescribedItems] = useState<PrescribeItemState[]>([]);
  const [submittingEncounter, setSubmittingEncounter] = useState(false);

  // Booking Form State
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '09:00',
    reasonForVisit: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [aptRes, docRes, patRes, drugRes] = await Promise.all([
        appointmentApi.getAll(),
        doctorApi.getAll(),
        patientApi.getAll(),
        pharmacyApi.getDrugs().catch(() => ({ data: [] })),
      ]);
      setAppointments(aptRes.data);
      setDoctors(docRes.data);
      setPatients(patRes.data);
      setDrugs(drugRes.data || []);
    } catch (err: any) {
      showToast('error', 'Error Loading Appointments', err.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update status
  const handleUpdateStatus = async (id: number, nextStatus: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED') => {
    try {
      if (nextStatus === 'COMPLETED') {
        await appointmentApi.complete(id);
      } else if (nextStatus === 'CANCELLED') {
        await appointmentApi.cancel(id, 'Patient requested cancellation');
      } else {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: 'CONFIRMED' } : a))
        );
      }

      showToast('success', 'Status Updated', `Appointment marked as ${nextStatus}.`);
      fetchData();
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message || 'Could not update appointment status');
    }
  };

  // Open Encounter Modal
  const handleOpenEncounter = (apt: Appointment) => {
    setEncounterModalApt(apt);
    setClinicalDiagnosis(apt.reasonForVisit ? `Evaluated for: ${apt.reasonForVisit}. Vital signs stable.` : '');
    // Provide default first drug if available
    if (drugs.length > 0) {
      const defaultDrug = drugs[0];
      setPrescribedItems([
        {
          drugId: defaultDrug.id,
          dosage: defaultDrug.strength || '500mg',
          frequency: 'TDS',
          durationDays: 5,
          quantity: 15,
          instructions: 'Take after meals with water',
        },
      ]);
    } else {
      setPrescribedItems([]);
    }
  };

  // Add drug row
  const handleAddDrugRow = () => {
    const defaultDrug = drugs[0];
    setPrescribedItems((prev) => [
      ...prev,
      {
        drugId: defaultDrug ? defaultDrug.id : '',
        dosage: defaultDrug?.strength || '1 tablet',
        frequency: 'BD',
        durationDays: 5,
        quantity: 10,
        instructions: 'Take after meals',
      },
    ]);
  };

  // Remove drug row
  const handleRemoveDrugRow = (idx: number) => {
    setPrescribedItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Handle drug select change
  const handleDrugChange = (idx: number, drugId: number | string) => {
    const drug = drugs.find((d) => d.id === Number(drugId));
    setPrescribedItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        return {
          ...item,
          drugId,
          dosage: drug?.strength || '1 tablet',
        };
      })
    );
  };

  // Submit clinical encounter & prescription
  const handleSubmitEncounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!encounterModalApt) return;

    setSubmittingEncounter(true);
    try {
      // 1. Issue Prescription if medications specified
      if (prescribedItems.length > 0) {
        await pharmacyApi.createPrescription({
          appointmentId: encounterModalApt.id,
          patientId: encounterModalApt.patientId,
          doctorId: encounterModalApt.doctorId || 1,
          notes: clinicalDiagnosis || 'Physician consultation encounter finalized.',
          items: prescribedItems.map((it) => ({
            drugId: Number(it.drugId),
            dosage: it.dosage,
            frequency: it.frequency,
            durationDays: Number(it.durationDays),
            prescribedQuantity: Number(it.quantity),
            instructions: it.instructions,
          })),
        });
      }

      // 2. Mark Appointment Completed
      await appointmentApi.complete(encounterModalApt.id);

      // 3. Auto-generate billing invoice
      try {
        await billingApi.generateInvoice(encounterModalApt.id);
      } catch (billErr) {
        console.warn('Invoice generation handled or already exists', billErr);
      }

      showToast(
        'success',
        'Consultation Finalized',
        'Encounter recorded. E-Prescription issued to Central Pharmacy dispensary.'
      );
      setEncounterModalApt(null);
      fetchData();
    } catch (err: any) {
      showToast('error', 'Encounter Failed', err.message || 'Failed to complete encounter');
    } finally {
      setSubmittingEncounter(false);
    }
  };

  // Filter appointments based on Doctor station scope + search + status
  const displayedAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      // Station scope filter
      if (doctorScope === 'my') {
        const isDrKavinda =
          apt.doctorId === 1 || (apt.doctorName && apt.doctorName.toLowerCase().includes('kavinda'));
        if (!isDrKavinda) return false;
      }

      const matchesStatus = statusFilter === 'ALL' || apt.status === statusFilter;
      const patName = apt.patientName || '';
      const docName = apt.doctorName || '';
      const matchesSearch =
        patName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        docName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (apt.patientNic && apt.patientNic.includes(searchTerm)) ||
        (apt.appointmentNumber && apt.appointmentNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesStatus && matchesSearch;
    });
  }, [appointments, doctorScope, statusFilter, searchTerm]);

  // Calendar Helpers
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const monthName = calendarMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    setCalendarMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedCalendarDate(today.toISOString().split('T')[0]);
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

  const calendarDays = useMemo(() => {
    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];
    // Previous month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevM = month === 0 ? 11 : month - 1;
      const prevY = month === 0 ? year - 1 : year;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: d, isCurrentMonth: false });
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: d, isCurrentMonth: true });
    }
    // Next month padding to fill complete weeks
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextM = month === 11 ? 0 : month + 1;
      const nextY = month === 11 ? year + 1 : year;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: d, isCurrentMonth: false });
    }
    return days;
  }, [year, month, firstDayIndex, daysInMonth]);

  // Appointments on selected date
  const selectedDateAppointments = useMemo(() => {
    return displayedAppointments.filter((a) => a.appointmentDate === selectedCalendarDate);
  }, [displayedAppointments, selectedCalendarDate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-clinical-ink tracking-tight">Outpatient Consultation Scheduler</h1>
          </div>
          <p className="text-xs text-clinical-ink-muted mt-1">
            Real-time patient schedule calendar, clinical encounters, and e-prescription issuance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200/80">
            <button
              onClick={() => setViewMode('calendar')}
              className={`apple-btn px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white text-clinical-teal-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="h-3.5 w-3.5 text-clinical-teal-600" />
              <span>Schedule Calendar</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`apple-btn px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-clinical-teal-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="h-3.5 w-3.5 text-slate-500" />
              <span>Registry Table</span>
            </button>
          </div>

          <button
            onClick={() => setIsBookModalOpen(true)}
            className="apple-btn inline-flex items-center gap-2 px-4 py-2 rounded-apple-xl bg-clinical-teal-600 text-white text-xs font-semibold hover:bg-clinical-teal-700 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Book Consultation Slot</span>
          </button>
        </div>
      </div>

      {/* Doctor Station Filter & Guarantee Banner */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-clinical-teal-50/70 border border-clinical-teal-200/80 rounded-apple-xl p-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-clinical-teal-600 text-white shrink-0">
            <Stethoscope className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-xs text-clinical-teal-950 block">Physician Consultation Station</span>
            <span className="text-[11px] text-clinical-teal-800">
              Select any appointment to conduct clinical encounter, enter diagnosis, and prescribe medications.
            </span>
          </div>
        </div>

        {/* Doctor Scope Selector */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-clinical-teal-200 self-start sm:self-auto">
          <button
            onClick={() => setDoctorScope('my')}
            className={`apple-btn px-3 py-1 rounded text-xs font-semibold transition-all ${
              doctorScope === 'my'
                ? 'bg-clinical-teal-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Consultations (Dr. Kavinda)
          </button>
          <button
            onClick={() => setDoctorScope('all')}
            className={`apple-btn px-3 py-1 rounded text-xs font-semibold transition-all ${
              doctorScope === 'all'
                ? 'bg-clinical-teal-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Hospital OPD
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Scheduled Consultations"
          value={displayedAppointments.length}
          subtitle={doctorScope === 'my' ? "Dr. Kavinda's schedule" : "Hospital outpatient registry"}
          icon={CalendarCheck}
          variant="teal"
        />
        <MetricCard
          title="Confirmed Intake"
          value={displayedAppointments.filter((a) => a.status === 'CONFIRMED').length}
          subtitle="Checked-in & awaiting MD"
          icon={CheckCircle2}
          variant="emerald"
        />
        <MetricCard
          title="Scheduled Pending"
          value={displayedAppointments.filter((a) => a.status === 'SCHEDULED').length}
          subtitle="Booked by patient/reception"
          icon={Clock}
          variant="amber"
        />
        <MetricCard
          title="Completed Encounters"
          value={displayedAppointments.filter((a) => a.status === 'COMPLETED').length}
          subtitle="Prescriptions finalized"
          icon={CheckCircle2}
          variant="slate"
        />
      </div>

      {/* Main View: Calendar or Table */}
      {viewMode === 'calendar' ? (
        /* Full Responsive Screen-Wide Calendar */
        <div className="space-y-6">
          <div className="apple-card p-4 sm:p-6 w-full">
            {/* Calendar Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <h2 className="text-lg sm:text-xl font-bold text-clinical-ink tracking-tight">
                  {monthName}
                </h2>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevMonth}
                    className="apple-btn p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                    title="Previous Month"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleToday}
                    className="apple-btn px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700"
                  >
                    Today
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="apple-btn p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                    title="Next Month"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Status Legend */}
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium overflow-x-auto pb-1 sm:pb-0">
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Scheduled
                </span>
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-clinical-teal-500"></span> Confirmed
                </span>
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Completed
                </span>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="w-full mt-4">
              {/* Day of week headers */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dow) => (
                  <div key={dow} className="py-1">
                    {dow}
                  </div>
                ))}
              </div>

              {/* Day Cells */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {calendarDays.map((cell) => {
                  const dayApts = displayedAppointments.filter((a) => a.appointmentDate === cell.dateStr);
                  const isSelected = selectedCalendarDate === cell.dateStr;
                  const isToday = new Date().toISOString().split('T')[0] === cell.dateStr;

                  return (
                    <div
                      key={cell.dateStr}
                      onClick={() => setSelectedCalendarDate(cell.dateStr)}
                      className={`min-h-[70px] sm:min-h-[100px] p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-clinical-teal-500 bg-clinical-teal-50/40 ring-2 ring-clinical-teal-500/20 shadow-xs'
                          : isToday
                          ? 'border-slate-300 bg-amber-50/20 shadow-2xs'
                          : cell.isCurrentMonth
                          ? 'border-slate-200/80 bg-white hover:border-clinical-teal-300 hover:bg-slate-50/60'
                          : 'border-slate-100 bg-slate-50/50 opacity-40 hover:opacity-75'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs sm:text-sm font-semibold rounded-full w-6 h-6 flex items-center justify-center ${
                            isToday
                              ? 'bg-clinical-teal-600 text-white font-bold'
                              : isSelected
                              ? 'bg-clinical-teal-100 text-clinical-teal-900 font-bold'
                              : 'text-slate-700'
                          }`}
                        >
                          {cell.dayNum}
                        </span>

                        {dayApts.length > 0 && (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {dayApts.length}
                          </span>
                        )}
                      </div>

                      {/* Appointment Chips inside Day Cell */}
                      <div className="mt-1 space-y-1 overflow-hidden">
                        {dayApts.slice(0, 2).map((apt) => (
                          <div
                            key={apt.id}
                            className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded truncate font-medium flex items-center gap-1 ${
                              apt.status === 'COMPLETED'
                                ? 'bg-slate-100 text-slate-600'
                                : apt.status === 'CONFIRMED'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold shadow-2xs'
                                : 'bg-amber-50 text-amber-800 border border-amber-200/60'
                            }`}
                            title={`${apt.appointmentTime} - ${apt.patientName} (${apt.status})`}
                          >
                            {apt.status === 'CONFIRMED' ? (
                              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600 shrink-0" />
                            ) : (
                              <span className="font-mono text-[9px] opacity-75 shrink-0">
                                {apt.appointmentTime?.slice(0, 5)}
                              </span>
                            )}
                            <span className="truncate">{apt.patientName}</span>
                          </div>
                        ))}
                        {dayApts.length > 2 && (
                          <div className="text-[9px] font-semibold text-slate-400 text-center">
                            +{dayApts.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Selected Date Encounter Queue */}
          <div className="apple-card p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-clinical-ink">
                    Consultations for {selectedCalendarDate}
                  </h3>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-clinical-teal-50 text-clinical-teal-700 border border-clinical-teal-200">
                    {selectedDateAppointments.length} Patient{selectedDateAppointments.length === 1 ? '' : 's'}
                  </span>
                </div>
                <p className="text-xs text-clinical-ink-muted mt-0.5">
                  Scheduled clinic appointments updated in real-time from patient portal bookings.
                </p>
              </div>

              <button
                onClick={() => {
                  setFormData((prev) => ({ ...prev, appointmentDate: selectedCalendarDate }));
                  setIsBookModalOpen(true);
                }}
                className="apple-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs self-start sm:self-auto"
              >
                <Plus className="h-3.5 w-3.5 text-clinical-teal-600" />
                <span>Add Slot on This Date</span>
              </button>
            </div>

            {selectedDateAppointments.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 font-mono">
                No consultations booked for this date. Click "+ Add Slot" or "Book Consultation Slot" to schedule a patient.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {selectedDateAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 rounded-apple-xl border border-slate-200/80 bg-white hover:shadow-apple-card transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-sm text-clinical-ink flex items-center gap-1.5">
                            <User className="h-4 w-4 text-clinical-teal-600" />
                            <span>{apt.patientName}</span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                            NIC: {apt.patientNic || 'N/A'} • {formatAptNumber(apt.appointmentNumber || apt.appointmentId || apt.id)}
                          </div>
                        </div>
                        <AppointmentStatusBadge status={apt.status} />
                      </div>

                      <div className="mt-3 space-y-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <div className="flex items-center justify-between font-mono">
                          <span className="text-slate-400">Time:</span>
                          <span className="font-bold text-clinical-ink">{apt.appointmentTime}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Physician:</span>
                          <span className="font-medium text-clinical-ink truncate max-w-[140px]">
                            {apt.doctorName}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Room:</span>
                          <span className="font-mono text-slate-700">{apt.roomNumber || 'Clinic 101'}</span>
                        </div>
                        <div className="pt-1 border-t border-slate-200/60 text-[11px] text-slate-500 italic">
                          "{apt.reasonForVisit || 'Regular consultation'}"
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      {apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' ? (
                        <>
                          <button
                            onClick={() => handleOpenEncounter(apt)}
                            className="apple-btn flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-clinical-teal-600 text-white text-xs font-semibold hover:bg-clinical-teal-700 shadow-2xs"
                          >
                            <Stethoscope className="h-3.5 w-3.5" />
                            <span>Encounter & Prescribe</span>
                          </button>

                          {apt.status === 'SCHEDULED' && (
                            <button
                              onClick={() => handleUpdateStatus(apt.id, 'CONFIRMED')}
                              className="apple-btn px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100"
                              title="Confirm Check-in"
                            >
                              Confirm
                            </button>
                          )}
                          {apt.status === 'CONFIRMED' && (
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold shadow-2xs"
                              title="Consultation Confirmed"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Confirmed</span>
                            </span>
                          )}

                          <button
                            onClick={() => handleUpdateStatus(apt.id, 'CANCELLED')}
                            className="apple-btn px-2 py-1.5 text-xs text-rose-600 hover:text-rose-800"
                            title="Cancel Consultation"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <div className="w-full text-center text-xs font-mono text-slate-400 py-1">
                          {apt.status === 'COMPLETED' ? '✓ Consultation Finalized' : 'Consultation Cancelled'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Registry Table View */
        <div className="apple-card overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by patient, NIC, or doctor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-clinical-ink focus:outline-none focus:ring-2 focus:ring-clinical-teal-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-clinical-ink-secondary">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-clinical-ink"
              >
                <option value="ALL">All Statuses</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin h-8 w-8 border-2 border-clinical-teal-600 border-t-transparent rounded-full" />
            </div>
          ) : displayedAppointments.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 font-mono">
              No consultations found matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-clinical-ink-secondary font-semibold border-b border-slate-200">
                    <th className="py-3 px-4 font-mono">Appt ID</th>
                    <th className="py-3 px-4 font-mono">Date & Time</th>
                    <th className="py-3 px-4">Patient Demographics</th>
                    <th className="py-3 px-4">Physician & Clinic</th>
                    <th className="py-3 px-4">Reason for Visit</th>
                    <th className="py-3 px-4">Room</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-clinical-teal-700">
                        {formatAptNumber(apt.appointmentNumber || apt.appointmentId || apt.id)}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-clinical-ink">
                        <div>{apt.appointmentDate}</div>
                        <div className="text-[10px] text-slate-400">{apt.appointmentTime}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-clinical-ink">{apt.patientName}</div>
                        <div className="text-[10px] font-mono text-slate-400">NIC: {apt.patientNic}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-clinical-ink">{apt.doctorName}</div>
                        <div className="text-[10px] text-clinical-teal-600 font-semibold">{apt.specialization}</div>
                      </td>
                      <td className="py-3 px-4 text-clinical-ink-secondary max-w-xs truncate">
                        {apt.reasonForVisit}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{apt.roomNumber || 'Clinic 101'}</td>
                      <td className="py-3 px-4">
                        <AppointmentStatusBadge status={apt.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleOpenEncounter(apt)}
                              className="apple-btn inline-flex items-center gap-1 px-2.5 py-1 rounded bg-clinical-teal-50 text-clinical-teal-700 border border-clinical-teal-200 hover:bg-clinical-teal-100 text-[11px] font-semibold"
                            >
                              <Stethoscope className="h-3 w-3" />
                              <span>Prescribe</span>
                            </button>
                          )}

                          {apt.status === 'SCHEDULED' && (
                            <button
                              onClick={() => handleUpdateStatus(apt.id, 'CONFIRMED')}
                              className="apple-btn text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded hover:bg-emerald-100"
                            >
                              Confirm
                            </button>
                          )}
                          {apt.status === 'CONFIRMED' && (
                            <>
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                <span>Confirmed</span>
                              </span>
                              <button
                                onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                                className="apple-btn text-[11px] font-semibold text-clinical-teal-600 bg-clinical-teal-50 px-2 py-1 rounded hover:bg-clinical-teal-100"
                              >
                                Complete
                              </button>
                            </>
                          )}
                          {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                            <button
                              onClick={() => handleUpdateStatus(apt.id, 'CANCELLED')}
                              className="apple-btn text-[11px] font-semibold text-rose-600 hover:text-rose-800 px-1.5 py-1"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Clinical Encounter & E-Prescribe Modal */}
      <Modal
        isOpen={Boolean(encounterModalApt)}
        onClose={() => setEncounterModalApt(null)}
        title="Clinical Encounter & E-Prescription"
        subtitle="Outpatient diagnosis recording and direct dispensary order routing"
        maxWidth="4xl"
      >
        {encounterModalApt && (
          <form onSubmit={handleSubmitEncounter} className="space-y-5">
            {/* Patient Header Card */}
            <div className="bg-slate-50 p-3.5 rounded-apple-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Patient Details</span>
                <div className="font-bold text-clinical-ink text-sm flex items-center gap-1.5 mt-0.5">
                  <User className="h-4 w-4 text-clinical-teal-600" />
                  <span>{encounterModalApt.patientName}</span>
                </div>
                <div className="text-slate-500 font-mono mt-0.5">
                  NIC: {encounterModalApt.patientNic || 'N/A'} • Consultation #{formatAptNumber(encounterModalApt.appointmentNumber || encounterModalApt.appointmentId || encounterModalApt.id)}
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Attending Physician</span>
                <div className="font-semibold text-clinical-ink mt-0.5">
                  {encounterModalApt.doctorName || 'Dr. Kavinda Rathnayaka'}
                </div>
                <div className="text-clinical-teal-700 font-mono font-medium">
                  {encounterModalApt.appointmentDate} • {encounterModalApt.appointmentTime}
                </div>
              </div>
            </div>

            {/* Clinical Diagnosis / Evaluation */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Clinical Diagnosis & Consultation Notes *
              </label>
              <textarea
                value={clinicalDiagnosis}
                onChange={(e) => setClinicalDiagnosis(e.target.value)}
                required
                rows={3}
                placeholder="E.g., Evaluated patient for acute symptoms. Vital signs: BP 125/80 mmHg, HR 74 bpm. Diagnosis: Acute Pharyngitis. Prescribing antibiotic course and symptomatic relief."
                className="w-full text-xs p-3 bg-white border border-slate-200 rounded-apple-xl focus:ring-2 focus:ring-clinical-teal-500 focus:outline-none text-clinical-ink"
              />
            </div>

            {/* Medication Prescriptions Builder */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-clinical-teal-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Prescribed Medications (Dispensary Queue)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddDrugRow}
                  className="apple-btn inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-clinical-teal-50 text-clinical-teal-700 border border-clinical-teal-200 text-xs font-semibold hover:bg-clinical-teal-100 shadow-2xs"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Medication</span>
                </button>
              </div>

              {prescribedItems.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  No medications prescribed for this visit. Click "+ Add Medication" to prescribe formulary drugs.
                </div>
              ) : (
                <div className="space-y-3">
                  {prescribedItems.map((item, idx) => {
                    const selectedDrug = drugs.find((d) => d.id === Number(item.drugId));

                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-apple-xl border border-slate-200 bg-slate-50/50 space-y-2.5 text-xs relative"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-700 font-mono text-[11px]">
                            Medication #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDrugRow(idx)}
                            className="apple-btn text-rose-500 hover:text-rose-700 p-1"
                            title="Remove medication"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                          {/* Drug Selection */}
                          <div className="sm:col-span-6">
                            <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                              Formulary Medicine *
                            </label>
                            <select
                              value={item.drugId}
                              onChange={(e) => handleDrugChange(idx, e.target.value)}
                              required
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg font-medium text-clinical-ink focus:ring-2 focus:ring-clinical-teal-500"
                            >
                              <option value="">Select Drug</option>
                              {drugs.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.drugName || d.brandName || d.genericName} ({d.dosageForm || 'Tab'} • Stock: {d.stockQuantity ?? d.currentStock ?? 0})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Dosage */}
                          <div className="sm:col-span-3">
                            <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                              Dosage Strength
                            </label>
                            <input
                              type="text"
                              value={item.dosage}
                              onChange={(e) =>
                                setPrescribedItems((prev) =>
                                  prev.map((it, i) => (i === idx ? { ...it, dosage: e.target.value } : it))
                                )
                              }
                              placeholder="e.g. 500mg"
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-clinical-ink"
                            />
                          </div>

                          {/* Frequency */}
                          <div className="sm:col-span-3">
                            <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                              Frequency
                            </label>
                            <select
                              value={item.frequency}
                              onChange={(e) =>
                                setPrescribedItems((prev) =>
                                  prev.map((it, i) => (i === idx ? { ...it, frequency: e.target.value } : it))
                                )
                              }
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-clinical-ink font-semibold"
                            >
                              <option value="OD">Once daily (OD)</option>
                              <option value="BD">Twice daily (BD)</option>
                              <option value="TDS">Three times daily (TDS)</option>
                              <option value="QDS">Four times daily (QDS)</option>
                              <option value="PRN">As needed (PRN)</option>
                              <option value="NOCTE">At night (Nocte)</option>
                            </select>
                          </div>

                          {/* Duration */}
                          <div className="sm:col-span-3">
                            <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                              Duration (Days)
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.durationDays}
                              onChange={(e) =>
                                setPrescribedItems((prev) =>
                                  prev.map((it, i) =>
                                    i === idx ? { ...it, durationDays: Number(e.target.value) } : it
                                  )
                                )
                              }
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-clinical-ink font-mono"
                            />
                          </div>

                          {/* Prescribed Quantity */}
                          <div className="sm:col-span-3">
                            <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                              Total Qty to Dispense
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                setPrescribedItems((prev) =>
                                  prev.map((it, i) =>
                                    i === idx ? { ...it, quantity: Number(e.target.value) } : it
                                  )
                                )
                              }
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-clinical-ink font-mono"
                            />
                          </div>

                          {/* Instructions */}
                          <div className="sm:col-span-6">
                            <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                              Patient Instructions
                            </label>
                            <input
                              type="text"
                              value={item.instructions}
                              onChange={(e) =>
                                setPrescribedItems((prev) =>
                                  prev.map((it, i) =>
                                    i === idx ? { ...it, instructions: e.target.value } : it
                                  )
                                )
                              }
                              placeholder="e.g. Take after food with warm water"
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-clinical-ink"
                            />
                          </div>
                        </div>

                        {selectedDrug && (
                          <div className="text-[10px] font-mono text-clinical-teal-700 bg-clinical-teal-50/60 px-2 py-1 rounded">
                            Dispensary Formulary: {selectedDrug.genericName} • Stock Remaining: {selectedDrug.stockQuantity ?? selectedDrug.currentStock ?? 0} • Unit Price: LKR {selectedDrug.unitPrice}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEncounterModalApt(null)}
                className="apple-btn px-4 py-2 rounded-apple-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={submittingEncounter}
                className="apple-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-apple-xl bg-clinical-teal-600 text-white text-xs font-bold hover:bg-clinical-teal-700 shadow-md transition-all disabled:opacity-50"
              >
                <Stethoscope className="h-4 w-4" />
                <span>{submittingEncounter ? 'Finalizing Encounter...' : 'Complete Visit & Issue E-Prescription'}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Book Consultation Modal */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Schedule Outpatient Consultation Slot"
        subtitle="Book physician encounter with automatic double-booking prevention check"
        maxWidth="5xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1 text-xs">Select Patient *</label>
            <select
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              required
              className="w-full font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-clinical-ink text-xs focus:ring-2 focus:ring-clinical-teal-500"
            >
              <option value="">Choose Patient File</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName || `${p.firstName} ${p.lastName}`} (NIC: {p.nicPassportNo} • {p.patientId})
                </option>
              ))}
            </select>
          </div>

          <AppointmentCalendar
            doctors={doctors}
            onConfirm={async (doctorId, date, time, reason) => {
              if (!formData.patientId) {
                showToast('error', 'Error', 'Please select a patient first.');
                return;
              }
              try {
                await appointmentApi.create({
                  patientId: Number(formData.patientId),
                  doctorId: Number(doctorId),
                  appointmentDate: date,
                  appointmentTime: time,
                  reasonForVisit: reason,
                });

                showToast('success', 'Success', 'Appointment scheduled successfully!');
                setIsBookModalOpen(false);
                fetchData();
              } catch (error: any) {
                if (error.response?.status === 409) {
                  showToast(
                    'error',
                    'Error',
                    'Double-booking conflict: This time slot is already booked for the selected doctor.'
                  );
                } else {
                  showToast('error', 'Error', 'Failed to schedule appointment.');
                }
              }
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default AppointmentView;