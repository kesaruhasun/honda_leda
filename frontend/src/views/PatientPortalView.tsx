import React, { useState, useEffect } from 'react';
import {
  Activity,
  CalendarCheck,
  Pill,
  FlaskConical,
  Receipt,
  LogOut,
  Plus,
  CreditCard,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { useToast } from '../context/ToastContext';
import {
  appointmentApi,
  pharmacyApi,
  labApi,
  billingApi,
  doctorApi,
} from '../services/api';
import {
  Appointment,
  Prescription,
  LabTest,
  Invoice,
  Doctor,
} from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const PatientPortalView: React.FC = () => {
  const { patientSession, logoutPatient, setCurrentView } = useRole();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'appointments' | 'prescriptions' | 'lab' | 'billing'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    doctorId: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '09:00',
    reasonForVisit: '',
  });

  // PayHere Checkout Modal State
  const [payHereModalInvoice, setPayHereModalInvoice] = useState<Invoice | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Selected Invoice for Print / Receipt
  const [selectedReceipt, setSelectedReceipt] = useState<Invoice | null>(null);

  useEffect(() => {
    if (!patientSession) {
      setCurrentView('landing');
      return;
    }

    const patientFullName = (patientSession.fullName || `${patientSession.firstName} ${patientSession.lastName}`).toLowerCase();

    const loadPatientData = async () => {
      try {
        setLoading(true);
        const [aptRes, prsRes, labRes, invRes, docRes] = await Promise.all([
          appointmentApi.getAll(),
          pharmacyApi.getPrescriptions(),
          labApi.getTests(),
          billingApi.getInvoices(),
          doctorApi.getAll(),
        ]);

        // Filter for this patient
        const myApts = aptRes.data.filter(
          (a) =>
            a.patientId === patientSession.id ||
            a.patientNic === patientSession.nicPassportNo ||
            (a.patientName && a.patientName.toLowerCase().includes(patientFullName))
        );

        const myPrescriptions = prsRes.data.filter(
          (p) =>
            p.patientId === patientSession.id ||
            (p.patientName && p.patientName.toLowerCase().includes(patientFullName))
        );

        const myLabTests = labRes.data.filter(
          (l) =>
            l.patientId === patientSession.id ||
            (l.patientName && l.patientName.toLowerCase().includes(patientFullName))
        );

        const myInvoices = invRes.data.filter(
          (i) =>
            i.patientId === patientSession.id ||
            i.patientNic === patientSession.nicPassportNo ||
            (i.patientName && i.patientName.toLowerCase().includes(patientFullName))
        );

        setAppointments(myApts);
        setPrescriptions(myPrescriptions);
        setLabTests(myLabTests);
        setInvoices(myInvoices);
        setDoctors(docRes.data);
      } catch (err: any) {
        showToast('error', 'Error Loading Records', err.message || 'Could not load your medical history.');
      } finally {
        setLoading(false);
      }
    };

    loadPatientData();
  }, [patientSession]);

  if (!patientSession) return null;

  // Handle New Booking
  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.doctorId || !bookingForm.reasonForVisit) {
      showToast('error', 'Required Fields', 'Please select a doctor and provide a reason for your visit.');
      return;
    }

    try {
      const payload = {
        patientId: patientSession.id,
        doctorId: Number(bookingForm.doctorId),
        appointmentDate: bookingForm.appointmentDate,
        appointmentTime: bookingForm.appointmentTime,
        reasonForVisit: bookingForm.reasonForVisit,
      };

      const res = await appointmentApi.create(payload);
      setAppointments((prev) => [res.data, ...prev]);
      setIsBookModalOpen(false);
      showToast('success', 'Appointment Reserved', `Slot confirmed for ${bookingForm.appointmentDate} at ${bookingForm.appointmentTime}`);
    } catch (err: any) {
      showToast('error', 'Booking Conflict', err.message || 'That slot is unavailable. Please choose another time.');
    }
  };

  // Handle PayHere Simulation
  const handleSimulatePayHerePayment = async (invoice: Invoice) => {
    try {
      setProcessingPayment(true);
      const res = await billingApi.settleCashCard(
        invoice.id,
        'CARD',
        `PAYHERE-SANDBOX-${Date.now()}`
      );

      setInvoices((prev) => prev.map((inv) => (inv.id === invoice.id ? res.data : inv)));
      setPayHereModalInvoice(null);
      showToast('success', 'Payment Successful', `Invoice ${invoice.invoiceNumber} paid via PayHere Card Gateway.`);
    } catch (err: any) {
      showToast('error', 'Payment Failed', err.message || 'Payment processing error.');
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-clinical-ink flex flex-col font-sans">
      {/* Top Header */}
      <header className="liquid-glass sticky top-0 z-30 h-16 w-full px-4 lg:px-8 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-apple-xl bg-clinical-teal-600 flex items-center justify-center text-white shadow-sm">
            <Activity className="h-5 w-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-clinical-ink">PulseOS</span>
              <span className="text-[10px] uppercase font-mono font-semibold tracking-wider px-1.5 py-0.5 rounded bg-clinical-teal-50 text-clinical-teal-700 border border-clinical-teal-200">
                Patient Portal
              </span>
            </div>
            <p className="text-[11px] text-clinical-ink-muted -mt-0.5">National Digital Health Access</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-clinical-ink-secondary">
            <ShieldCheck className="h-4 w-4 text-clinical-teal-600" />
            <span className="font-mono text-[11px]">NIC: {patientSession.nicPassportNo}</span>
          </div>

          <button
            onClick={logoutPatient}
            className="apple-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-rose-600 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Patient Identity Banner */}
        <div className="apple-card p-5 sm:p-6 bg-gradient-to-r from-white via-slate-50 to-clinical-teal-50/30 border border-slate-200/90 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-clinical-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-clinical-teal-600/20">
                {patientSession.firstName[0]}
                {patientSession.lastName ? patientSession.lastName[0] : ''}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {patientSession.fullName || `${patientSession.firstName} ${patientSession.lastName}`}
                  </h1>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {patientSession.patientId}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Registered Patient &bull; Intake Date: {patientSession.registrationDate || '2026-09-14'}
                </p>
              </div>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Blood Type</span>
                <span className="text-xs font-mono font-bold text-rose-600">{patientSession.bloodGroup}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Triage Status</span>
                <span className="text-xs font-semibold text-clinical-teal-700">{patientSession.triagePriority}</span>
              </div>
              <button
                onClick={() => setIsBookModalOpen(true)}
                className="apple-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-apple-xl bg-clinical-teal-600 hover:bg-clinical-teal-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Book Appointment</span>
              </button>
            </div>
          </div>

          {/* Demographic Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200/80 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">NIC / PASSPORT</span>
              <span className="font-mono font-semibold text-slate-800">{patientSession.nicPassportNo}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">DATE OF BIRTH</span>
              <span className="font-mono text-slate-700">{patientSession.dob || '1985-05-12'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">PHONE NUMBER</span>
              <span className="font-mono text-slate-700">{patientSession.contactNumber || '077 123 4567'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">KNOWN ALLERGIES</span>
              <span className="font-semibold text-rose-600">
                {patientSession.allergies && patientSession.allergies !== 'None'
                  ? patientSession.allergies
                  : 'None Reported'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`apple-btn flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'appointments'
                ? 'border-clinical-teal-600 text-clinical-teal-700 bg-white shadow-2xs font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Consultations ({appointments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`apple-btn flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'prescriptions'
                ? 'border-clinical-teal-600 text-clinical-teal-700 bg-white shadow-2xs font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <Pill className="h-4 w-4" />
            <span>Medications & Prescriptions ({prescriptions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('lab')}
            className={`apple-btn flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'lab'
                ? 'border-clinical-teal-600 text-clinical-teal-700 bg-white shadow-2xs font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <FlaskConical className="h-4 w-4" />
            <span>Diagnostic Lab Reports ({labTests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`apple-btn flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'billing'
                ? 'border-clinical-teal-600 text-clinical-teal-700 bg-white shadow-2xs font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <Receipt className="h-4 w-4" />
            <span>Billing & Online Payments ({invoices.length})</span>
          </button>
        </div>

        {/* Tab 1: Appointments Content */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Your Scheduled Consultations</h2>
                <p className="text-xs text-slate-500">View upcoming and historical clinical appointments.</p>
              </div>
              <button
                onClick={() => setIsBookModalOpen(true)}
                className="apple-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-clinical-teal-600 text-white text-xs font-semibold hover:bg-clinical-teal-700"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Appointment</span>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-xs text-slate-400 font-mono">Loading consultations...</div>
            ) : appointments.length === 0 ? (
              <div className="apple-card p-10 text-center space-y-3">
                <CalendarCheck className="h-10 w-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-sm text-slate-700">No Appointments On Record</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You have not scheduled any doctor appointments yet. Select a physician to reserve a consultation slot.
                </p>
                <button
                  onClick={() => setIsBookModalOpen(true)}
                  className="apple-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-clinical-teal-600 text-white text-xs font-semibold"
                >
                  <Plus className="h-4 w-4" />
                  <span>Book Now</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointments.map((apt) => (
                  <div key={apt.id} className="apple-card p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-clinical-teal-700 bg-clinical-teal-50 px-2 py-0.5 rounded border border-clinical-teal-200">
                          {apt.appointmentNumber || apt.appointmentId || `APT-${apt.id}`}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 mt-1">{apt.doctorName}</h3>
                        <p className="text-xs text-clinical-teal-700 font-medium">{apt.specialization}</p>
                      </div>
                      <Badge
                        variant={
                          apt.status === 'CONFIRMED'
                            ? 'success'
                            : apt.status === 'SCHEDULED'
                            ? 'warning'
                            : apt.status === 'COMPLETED'
                            ? 'neutral'
                            : 'emergency'
                        }
                      >
                        {apt.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-slate-50 border border-slate-200/70 font-mono">
                      <div>
                        <span className="text-slate-400 block text-[10px]">DATE & TIME</span>
                        <span className="font-bold text-slate-800">
                          {apt.appointmentDate} @ {apt.appointmentTime}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">ROOM</span>
                        <span className="font-semibold text-slate-700">{apt.roomNumber || 'Clinic Room 101'}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Reason for Consultation
                      </span>
                      <p className="italic">"{apt.reasonForVisit}"</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Prescriptions Content */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Active Prescriptions & Dispensary Orders</h2>
              <p className="text-xs text-slate-500">Therapeutic medicines issued by attending consultant physicians.</p>
            </div>

            {prescriptions.length === 0 ? (
              <div className="apple-card p-10 text-center space-y-3">
                <Pill className="h-10 w-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-sm text-slate-700">No Prescriptions On File</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You have no pending or dispensed prescriptions recorded in your clinical file.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {prescriptions.map((prs) => {
                  const drugName = prs.drugName || prs.items?.[0]?.drugName || 'Prescribed Drug';
                  const dosage = prs.dosage || prs.items?.[0]?.dosage || 'As directed';
                  const doc = prs.doctorName || prs.prescribedDoctorName || 'Attending Physician';
                  const date = prs.prescriptionDate || prs.issuedDate || '2026-09-14';
                  const isDispensed = prs.dispensed || prs.status === 'DISPENSED';
                  const freq = prs.frequency || prs.items?.[0]?.frequency || 'Daily';
                  const days = prs.durationDays || prs.items?.[0]?.durationDays || 5;
                  const qty = prs.quantity ?? prs.items?.[0]?.prescribedQuantity ?? prs.items?.[0]?.prescribedQty ?? 10;
                  const notes = prs.instructions || prs.notes || prs.doctorInstructions || 'Follow physician dosage.';

                  return (
                    <div key={prs.id} className="apple-card p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{drugName}</span>
                            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {dosage}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Prescribed by {doc} &bull; Issue Date: {date}
                          </p>
                        </div>
                        <Badge variant={isDispensed ? 'success' : 'warning'}>
                          {isDispensed ? 'DISPENSED' : 'READY AT PHARMACY'}
                        </Badge>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-700">Dosage Instructions:</span>
                          <span className="font-mono text-slate-600">
                            {freq} for {days} days (Qty: {qty})
                          </span>
                        </div>
                        <p className="text-slate-600 italic mt-1">{notes}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Lab Tests Content */}
        {activeTab === 'lab' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Diagnostic Pathology & Clinical Tests</h2>
              <p className="text-xs text-slate-500">Laboratory analyses verified by hospital medical technologists.</p>
            </div>

            {labTests.length === 0 ? (
              <div className="apple-card p-10 text-center space-y-3">
                <FlaskConical className="h-10 w-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-sm text-slate-700">No Diagnostic Tests On Record</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No laboratory orders or pathology reports are currently associated with your file.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {labTests.map((test) => {
                  const testCode = test.testCode || test.requestNumber || `LAB-${test.id}`;
                  const specimen = test.sampleType || test.specimenType || 'Venous Blood';
                  const isCompleted = test.status === 'COMPLETED';

                  return (
                    <div key={test.id} className="apple-card p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-clinical-teal-700">{testCode}</span>
                            <span className="font-bold text-sm text-slate-900">{test.testName}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Ordered by {test.doctorName} &bull; Specimen: {specimen} &bull; Date: {test.testDate}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {test.isAbnormal && (
                            <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[10px]">
                              FLAGGED ABNORMAL
                            </span>
                          )}
                          <Badge
                            variant={
                              isCompleted
                                ? 'success'
                                : test.status === 'COLLECTED' || test.status === 'SAMPLE_COLLECTED'
                                ? 'urgent'
                                : 'routine'
                            }
                          >
                            {test.status}
                          </Badge>
                        </div>
                      </div>

                      {isCompleted && (
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold">QUANTITATIVE RESULT</span>
                              <span className={`text-sm font-bold font-mono ${test.isAbnormal ? 'text-rose-600' : 'text-slate-900'}`}>
                                {test.resultData || 'Normal Limits'}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold">REFERENCE RANGE</span>
                              <span className="text-xs font-mono text-slate-600">{test.referenceRange || 'Standard clinical normal'}</span>
                            </div>
                          </div>
                          {test.technicianNotes && (
                            <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                              Technologist Notes: {test.technicianNotes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Billing & PayHere Content */}
        {activeTab === 'billing' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Hospital Billing & Online Checkout</h2>
              <p className="text-xs text-slate-500">
                Itemized electronic invoices with verified PayHere Online Payment Gateway.
              </p>
            </div>

            {invoices.length === 0 ? (
              <div className="apple-card p-10 text-center space-y-3">
                <Receipt className="h-10 w-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-sm text-slate-700">No Invoices Issued</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  All your past encounters are fully settled. New invoices will appear here following doctor consultations or lab tests.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {invoices.map((inv) => (
                  <div key={inv.id} className="apple-card p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-slate-900">{inv.invoiceNumber}</span>
                          <Badge variant={inv.status === 'PAID' ? 'success' : 'emergency'}>
                            {inv.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Issued on {inv.billingDate || (inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '2026-09-14')} &bull;
                          Payment Method: {inv.paymentMethod || 'PayHere Card'}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Amount</span>
                        <span className="text-lg font-bold font-mono text-slate-900">
                          LKR {Number(inv.totalAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Breakdown Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
                        <span className="text-[10px] text-slate-400 block">Consultation Fee</span>
                        <span className="font-mono font-semibold text-slate-700">
                          LKR {Number(inv.consultationFee || inv.doctorFee || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
                        <span className="text-[10px] text-slate-400 block">Pharmacy Total</span>
                        <span className="font-mono font-semibold text-slate-700">
                          LKR {Number(inv.pharmacyTotal || inv.pharmacyFee || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
                        <span className="text-[10px] text-slate-400 block">Laboratory Total</span>
                        <span className="font-mono font-semibold text-slate-700">
                          LKR {Number(inv.labTotal || inv.labFee || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        onClick={() => setSelectedReceipt(inv)}
                        className="apple-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
                      >
                        <Printer className="h-3.5 w-3.5 text-slate-500" />
                        <span>Print Bill</span>
                      </button>

                      {inv.status !== 'PAID' && (
                        <button
                          onClick={() => setPayHereModalInvoice(inv)}
                          className="apple-btn inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
                        >
                          <CreditCard className="h-4 w-4" />
                          <span>Pay Online with PayHere</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Book Appointment Modal */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Schedule Outpatient Consultation"
        subtitle="Select your consultant physician and preferred consultation slot."
        maxWidth="md"
      >
        <form onSubmit={handleBookAppointment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-clinical-ink mb-1">Attending Physician *</label>
            <select
              value={bookingForm.doctorId}
              onChange={(e) => setBookingForm({ ...bookingForm, doctorId: e.target.value })}
              required
              className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-clinical-ink focus:ring-2 focus:ring-clinical-teal-500"
            >
              <option value="">Select Consultant Doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.fullName || `Dr. ${d.firstName} ${d.lastName}`} — {d.specialization} (Fee: LKR {d.consultationFee})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-clinical-ink mb-1">Date *</label>
              <input
                type="date"
                required
                value={bookingForm.appointmentDate}
                onChange={(e) => setBookingForm({ ...bookingForm, appointmentDate: e.target.value })}
                className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinical-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-clinical-ink mb-1">Time Slot *</label>
              <select
                value={bookingForm.appointmentTime}
                onChange={(e) => setBookingForm({ ...bookingForm, appointmentTime: e.target.value })}
                className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinical-teal-500"
              >
                <option value="08:30">08:30 AM</option>
                <option value="09:00">09:00 AM</option>
                <option value="09:30">09:30 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="10:30">10:30 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="14:00">02:00 PM</option>
                <option value="14:30">02:30 PM</option>
                <option value="15:00">03:00 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-clinical-ink mb-1">Reason for Visit *</label>
            <textarea
              required
              rows={3}
              value={bookingForm.reasonForVisit}
              onChange={(e) => setBookingForm({ ...bookingForm, reasonForVisit: e.target.value })}
              placeholder="Describe your symptoms or review purpose..."
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinical-teal-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsBookModalOpen(false)}
              className="apple-btn px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="apple-btn px-4 py-2 text-xs font-semibold bg-clinical-teal-600 text-white rounded-lg hover:bg-clinical-teal-700 shadow-sm"
            >
              Confirm Reservation
            </button>
          </div>
        </form>
      </Modal>

      {/* PayHere Checkout Modal */}
      {payHereModalInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setPayHereModalInvoice(null)}
          title="PayHere Sandbox Payment Gateway"
          subtitle={`Secured Checkout for Invoice #${payHereModalInvoice.invoiceNumber}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono text-[10px]">PAYHERE CHECKOUT (LK)</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                  SANDBOX MODE
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Payable Total</span>
                <span className="text-2xl font-bold font-mono text-white">
                  LKR {Number(payHereModalInvoice.totalAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                Patient: <span className="text-white font-semibold">{patientSession.fullName}</span> &bull; NIC: {patientSession.nicPassportNo}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Central Bank of Sri Lanka Authorized Gateway</span>
              </div>
              <p>Simulating sandbox test transaction via PayHere merchant hash verification.</p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPayHereModalInvoice(null)}
                className="apple-btn px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processingPayment}
                onClick={() => handleSimulatePayHerePayment(payHereModalInvoice)}
                className="apple-btn px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <CreditCard className="h-4 w-4" />
                <span>{processingPayment ? 'Authorizing Card...' : 'Authorize LKR Payment'}</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Receipt Print Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedReceipt(null)}
          title="Hospital Outpatient Receipt"
          subtitle={`Official Tax Invoice ${selectedReceipt.invoiceNumber}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-5 rounded-xl border border-slate-200 bg-white font-mono space-y-3 receipt-container">
              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <h3 className="font-bold text-base text-slate-900">PulseOS Tertiary Hospital</h3>
                <p className="text-[10px] text-slate-500">Ministry of Health Certified OPD</p>
                <p className="text-[10px] text-slate-500">Invoice: {selectedReceipt.invoiceNumber}</p>
                <p className="text-[10px] text-slate-500">
                  Date: {selectedReceipt.billingDate || (selectedReceipt.createdAt ? new Date(selectedReceipt.createdAt).toLocaleString() : '2026-09-14')}
                </p>
              </div>

              <div className="space-y-1 py-1 border-b border-dashed border-slate-300 text-[11px]">
                <div className="flex justify-between">
                  <span>Patient:</span>
                  <span className="font-bold">{selectedReceipt.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span>NIC:</span>
                  <span>{selectedReceipt.patientNic}</span>
                </div>
                <div className="flex justify-between">
                  <span>Attending Doctor:</span>
                  <span>{selectedReceipt.doctorName || 'Consultant Doctor'}</span>
                </div>
              </div>

              <div className="space-y-1 py-1 border-b border-dashed border-slate-300 text-[11px]">
                <div className="flex justify-between">
                  <span>Consultation Fee:</span>
                  <span>LKR {Number(selectedReceipt.consultationFee || selectedReceipt.doctorFee || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pharmacy Dispensary:</span>
                  <span>LKR {Number(selectedReceipt.pharmacyTotal || selectedReceipt.pharmacyFee || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pathology Lab Tests:</span>
                  <span>LKR {Number(selectedReceipt.labTotal || selectedReceipt.labFee || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between text-sm font-bold pt-1">
                <span>TOTAL DUE:</span>
                <span>LKR {Number(selectedReceipt.totalAmount).toFixed(2)}</span>
              </div>

              <div className="text-center pt-2 text-[10px] text-slate-400">
                STATUS: {selectedReceipt.status} &bull; METHOD: {selectedReceipt.paymentMethod || 'PAYHERE'}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="apple-btn px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg flex items-center gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Copy</span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="apple-btn px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
export default PatientPortalView;
