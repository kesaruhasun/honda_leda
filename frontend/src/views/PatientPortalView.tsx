import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
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
  Camera,
  ShoppingBag,
  Search,
  CheckCircle2,
  Upload,
  Eye,
  Building2,
  Check,
  Clock,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  Edit3,
  Ban,
  Settings,
  ExternalLink,
  Copy,
  KeyRound,
} from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { useToast } from '../context/ToastContext';
import { ChangePasswordModal } from '../components/common/ChangePasswordModal';
import {
  appointmentApi,
  pharmacyApi,
  labApi,
  billingApi,
  doctorApi,
  patientApi,
} from '../services/api';
import api from '../services/api';
import {
  Appointment,
  Prescription,
  LabTest,
  Invoice,
  Doctor,
  Drug,
} from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ProfileSettingsModal } from '../components/common/ProfileSettingsModal';
import { AppointmentCalendar } from '../components/appointments/AppointmentCalendar';
import { DiagnosticReportModal } from '../components/laboratory/DiagnosticReportModal';

const LAB_CATALOG = [
  { id: 1, testCode: 'LAB-FBC', testName: 'Full Blood Count (FBC) with ESR', category: 'Hematology', standardFee: 1500, sampleType: 'Whole Blood (EDTA)', turnaround: '4 Hours' },
  { id: 2, testCode: 'LAB-FBS', testName: 'Fasting Blood Sugar (FBS)', category: 'Biochemistry', standardFee: 650, sampleType: 'Fluoride Plasma', turnaround: '2 Hours' },
  { id: 3, testCode: 'LAB-LIP', testName: 'Lipid Profile Panel (Total, HDL, LDL, Triglycerides)', category: 'Biochemistry', standardFee: 2800, sampleType: 'Serum', turnaround: '6 Hours' },
  { id: 4, testCode: 'LAB-KFT', testName: 'Serum Creatinine & Renal Function (eGFR)', category: 'Biochemistry', standardFee: 1200, sampleType: 'Serum', turnaround: '4 Hours' },
  { id: 5, testCode: 'LAB-LFT', testName: 'Liver Function Test (SGPT, SGOT, Bilirubin, Alk Phos)', category: 'Biochemistry', standardFee: 3200, sampleType: 'Serum', turnaround: '6 Hours' },
  { id: 6, testCode: 'LAB-HBA1C', testName: 'HbA1c Glycated Hemoglobin', category: 'Endocrinology', standardFee: 2200, sampleType: 'Whole Blood', turnaround: '4 Hours' },
  { id: 7, testCode: 'LAB-TSH', testName: 'Thyroid Stimulating Hormone (TSH Ultrasensitive)', category: 'Endocrinology', standardFee: 2500, sampleType: 'Serum', turnaround: '12 Hours' },
  { id: 8, testCode: 'LAB-UFR', testName: 'Urine Full Report (UFR) & Microscopy', category: 'Pathology', standardFee: 800, sampleType: 'Midstream Urine', turnaround: '2 Hours' },
  { id: 9, testCode: 'LAB-DENGUE', testName: 'Dengue NS1 Antigen & Antibody Rapid', category: 'Serology', standardFee: 2900, sampleType: 'Serum / Whole Blood', turnaround: '1 Hour' },
];

const DEFAULT_FORMULARY_DRUGS: Drug[] = [
  { id: 101, itemCode: 'DRG-001', brandName: 'Panadol 500mg', genericName: 'Paracetamol', category: 'Analgesics', dosageForm: 'Tablet', strength: '500mg', unitPrice: 8.50, stockQuantity: 450, reorderLevel: 100 },
  { id: 102, itemCode: 'DRG-002', brandName: 'Augmentin 625mg', genericName: 'Amoxicillin + Clavulanic Acid', category: 'Antibiotics', dosageForm: 'Film-Coated Tablet', strength: '625mg', unitPrice: 185.00, stockQuantity: 120, reorderLevel: 30 },
  { id: 103, itemCode: 'DRG-003', brandName: 'Lipitor 20mg', genericName: 'Atorvastatin Calcium', category: 'Cardiovascular', dosageForm: 'Tablet', strength: '20mg', unitPrice: 42.00, stockQuantity: 280, reorderLevel: 50 },
  { id: 104, itemCode: 'DRG-004', brandName: 'Glucophage 500mg', genericName: 'Metformin Hydrochloride', category: 'Antidiabetics', dosageForm: 'Tablet', strength: '500mg', unitPrice: 12.00, stockQuantity: 500, reorderLevel: 100 },
  { id: 105, itemCode: 'DRG-005', brandName: 'Losec 20mg', genericName: 'Omeprazole', category: 'Gastrointestinal', dosageForm: 'Capsule', strength: '20mg', unitPrice: 28.00, stockQuantity: 340, reorderLevel: 80 },
  { id: 106, itemCode: 'DRG-006', brandName: 'Ventolin Inhaler', genericName: 'Salbutamol Sulfate', category: 'Respiratory', dosageForm: 'Inhaler', strength: '100mcg/dose', unitPrice: 1250.00, stockQuantity: 65, reorderLevel: 20 },
  { id: 107, itemCode: 'DRG-007', brandName: 'Zyrtec 10mg', genericName: 'Cetirizine Dihydrochloride', category: 'Antihistamines', dosageForm: 'Tablet', strength: '10mg', unitPrice: 35.00, stockQuantity: 200, reorderLevel: 50 },
  { id: 108, itemCode: 'DRG-008', brandName: 'Neurobion Forte', genericName: 'Vitamin B1, B6, B12', category: 'Vitamins & Supplements', dosageForm: 'Tablet', strength: 'Triple B', unitPrice: 24.00, stockQuantity: 410, reorderLevel: 75 },
  { id: 109, itemCode: 'DRG-009', brandName: 'Concor 5mg', genericName: 'Bisoprolol Fumarate', category: 'Cardiovascular', dosageForm: 'Tablet', strength: '5mg', unitPrice: 65.00, stockQuantity: 180, reorderLevel: 40 },
  { id: 110, itemCode: 'DRG-010', brandName: 'Gaviscon Double Action', genericName: 'Sodium Alginate + Potassium Bicarbonate', category: 'Gastrointestinal', dosageForm: 'Oral Suspension (200ml)', strength: 'Standard', unitPrice: 1450.00, stockQuantity: 80, reorderLevel: 20 },
];

export const PatientPortalView: React.FC = () => {
  const navigate = useNavigate();
  const { patientSession, logoutPatient, updatePatientSession } = useRole();
  const { showToast } = useToast();

  const handleSignOut = () => {
    logoutPatient();
    navigate('/');
  };

  const [activeTab, setActiveTab] = useState<'appointments' | 'prescriptions' | 'pharmacy_store' | 'lab' | 'billing'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Appointment Details & Cancellation Modals
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [cancellingAppointment, setCancellingAppointment] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Edit Profile Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const calculateProfileCompletion = () => {
    if (!patientSession) return 0;
    let score = 0;
    if (patientSession.firstName && patientSession.lastName) score += 20;
    if (patientSession.nicPassportNo) score += 20;
    if (patientSession.contactNumber || patientSession.phoneNumber) score += 15;
    if (patientSession.dob || patientSession.dateOfBirth) score += 10;
    if (patientSession.bloodGroup) score += 10;
    if (patientSession.allergies && patientSession.allergies !== '' && patientSession.allergies !== 'None reported') score += 10;
    if (patientSession.emergencyContactName && patientSession.emergencyContactPhone) score += 15;
    return Math.min(score, 100);
  };
  const profileCompletion = calculateProfileCompletion();

  // Avatar Upload State
  const [patientAvatar, setPatientAvatar] = useState<string | null>(() => {
    return patientSession ? localStorage.getItem(`patient_avatar_${patientSession.id}`) : null;
  });
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Booking Modal State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  // const [notifications, setNotifications] = useState<any[]>([]);
  // const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // PayHere Checkout Modal State
  const [payHereModalInvoice, setPayHereModalInvoice] = useState<Invoice | null>(null);
  const [payHereModalTab, setPayHereModalTab] = useState<'GATEWAY' | 'SIMULATOR'>('GATEWAY');
  const [copiedCard, setCopiedCard] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [payHereTestCardType, setPayHereTestCardType] = useState<'VISA' | 'MASTERCARD' | 'AMEX'>('VISA');
  const [payHereCardNumber, setPayHereCardNumber] = useState('4916 2175 0161 1292');
  const [payHereExpiry, setPayHereExpiry] = useState('12/28');
  const [payHereCvv, setPayHereCvv] = useState('123');
  const [payHereCardHolder, setPayHereCardHolder] = useState(patientSession ? (patientSession.fullName || `${patientSession.firstName} ${patientSession.lastName}`) : 'A. M. PERERA');
  const [payHereSimulationOutcome, setPayHereSimulationOutcome] = useState<'SUCCESS' | 'DECLINE_FUNDS' | 'DECLINE_LIMIT'>('SUCCESS');
  const [payHereErrorMessage, setPayHereErrorMessage] = useState<string | null>(null);

  // Selected Invoice for Print / Receipt
  const [selectedReceipt, setSelectedReceipt] = useState<Invoice | null>(null);

  // Pharmacy Store State
  const [availableDrugs, setAvailableDrugs] = useState<Drug[]>(DEFAULT_FORMULARY_DRUGS);
  const [pharmacySearch, setPharmacySearch] = useState('');
  const [selectedDrugCategory, setSelectedDrugCategory] = useState('ALL');
  const [cart, setCart] = useState<Record<number, number>>({});
  const [isPharmacyCheckoutOpen, setIsPharmacyCheckoutOpen] = useState(false);
  const [pharmacyPaymentMethod, setPharmacyPaymentMethod] = useState<'PAYHERE' | 'BANK_RECEIPT' | 'CASH'>('PAYHERE');
  const [pharmacyReceiptFile, setPharmacyReceiptFile] = useState<string | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');

  // Lab Test Order State
  const [labCatalog, setLabCatalog] = useState<any[]>(LAB_CATALOG);
  const [isLabOrderModalOpen, setIsLabOrderModalOpen] = useState(false);
  const [selectedLabTest, setSelectedLabTest] = useState(LAB_CATALOG[0]);
  const [labUrgency, setLabUrgency] = useState<'ROUTINE' | 'URGENT'>('ROUTINE');
  const [labIndication, setLabIndication] = useState('');
  const [labCollectionDate, setLabCollectionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [labPaymentMethod, setLabPaymentMethod] = useState<'PAYHERE' | 'BANK_RECEIPT'>('PAYHERE');
  const [labReceiptFile, setLabReceiptFile] = useState<string | null>(null);
  const [labReceiptRef, setLabReceiptRef] = useState('');
  const [viewingReceiptImage, setViewingReceiptImage] = useState<string | null>(null);
  const [notifySms, setNotifySms] = useState(true);
  const [notificationContact, setNotificationContact] = useState(patientSession ? (patientSession.contactNumber || '') : '');
  const [selectedReportTest, setSelectedReportTest] = useState<LabTest | null>(null);

  // Helper for dynamic ETA calculation
  const calculateEstimatedCompletion = (testTurnaround: string, urgency: 'ROUTINE' | 'URGENT', collectionDate?: string) => {
    const match = testTurnaround.match(/(\d+)\s*Hour/i);
    let hours = match ? parseInt(match[1], 10) : 4;
    if (urgency === 'URGENT') {
      hours = Math.max(1, Math.round(hours / 2));
    }
    const baseDate = collectionDate ? new Date(`${collectionDate}T09:00:00`) : new Date();
    const targetDate = new Date(baseDate.getTime() + hours * 60 * 60 * 1000);
    const isToday = targetDate.toDateString() === new Date().toDateString();
    const timeStr = targetDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    if (isToday) {
      return `Today by ${timeStr} (SLST)`;
    } else {
      const dayStr = targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${dayStr} by ${timeStr} (SLST)`;
    }
  };

  useEffect(() => {
    if (!patientSession) {
      return;
    }
    // Check for PayHere redirect query parameters (e.g. ?order_id=INV-2026-0001&payment=success)
    const urlParams = new URLSearchParams(window.location.search);
    const returnOrderId = urlParams.get('order_id');
    const returnPaymentStatus = urlParams.get('payment');
    if (returnOrderId || returnPaymentStatus === 'success') {
      setActiveTab('billing');
      showToast('success', 'PayHere Payment Confirmed', `Payment for invoice #${returnOrderId || ''} was successfully settled via PayHere Gateway.`);
      billingApi.getInvoices().then(res => {
        const matching = (res.data || []).find((inv: Invoice) =>
          inv.invoiceNumber === returnOrderId || String(inv.id) === (returnOrderId || '').replace('INV-', '')
        );
        if (matching && matching.status !== 'PAID') {
          billingApi.settleCashCard(matching.id, 'CARD', `PAYHERE-RETURN-${returnOrderId}`).catch(() => {});
        }
      }).finally(() => {
        billingApi.getInvoices().then(res => {
          if (res.data && patientSession) {
            setInvoices(res.data.filter((i: Invoice) => i.patientId === patientSession.id));
          }
        });
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    }

    // Fetch notifications
    api.get('/notifications?recipientEmail=' + encodeURIComponent(patientSession.email || patientSession.nicPassportNo))
      .then(() => {
      })
      .catch(err => console.warn('Could not load notifications', err));


    const patientFullName = (patientSession.fullName || `${patientSession.firstName} ${patientSession.lastName}`).toLowerCase();

    // Check for pending cart from Landing page
    const savedCart = localStorage.getItem('pending_cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          setCart(parsed);
          setActiveTab('pharmacy_store');
          setIsPharmacyCheckoutOpen(true);
          showToast('info', 'Cart Restored', 'Your selected medications from the online pharmacy are ready for checkout.');
        }
      } catch (e) {
        console.error('Failed to parse pending cart', e);
      } finally {
        localStorage.removeItem('pending_cart');
      }
    }

    // Check for pending lab test from Landing page
    const savedLab = localStorage.getItem('pending_lab_test');
    if (savedLab) {
      try {
        const parsed = JSON.parse(savedLab);
        if (parsed && (parsed.testCode || parsed.id)) {
          const match = labCatalog.find((t) => t.testCode === parsed.testCode || t.id === parsed.id);
          if (match) {
            setSelectedLabTest(match);
          }
          setActiveTab('lab');
          setIsLabOrderModalOpen(true);
          showToast('info', 'Lab Test Selected', `Proceeding with booking for ${parsed.testName || 'diagnostic test'}.`);
        }
      } catch (e) {
        console.error('Failed to parse pending lab test', e);
      } finally {
        localStorage.removeItem('pending_lab_test');
      }
    }

    const loadPatientData = async () => {
      try {
        setLoading(true);
        const [aptRes, prsRes, labRes, invRes, docRes, drugsRes, profileRes, catalogRes] = await Promise.all([
          appointmentApi.getAll().catch(() => ({ data: [] })),
          pharmacyApi.getPrescriptions().catch(() => ({ data: [] })),
          labApi.getTests().catch(() => ({ data: [] })),
          billingApi.getInvoices().catch(() => ({ data: [] })),
          doctorApi.getAll().catch(() => ({ data: [] })),
          pharmacyApi.getDrugs().catch(() => ({ data: [] })),
          patientApi.getById(patientSession.id).catch(() => null),
          labApi.getCatalog().catch(() => ({ data: [] })),
        ]);

        if (catalogRes && catalogRes.data && catalogRes.data.length > 0) {
          const mappedCatalog = catalogRes.data.map((c: any) => ({
            id: c.id,
            testCode: c.testCode || `LAB-${c.id}`,
            testName: c.testName,
            category: c.category || 'General Diagnostic',
            standardFee: c.price != null ? Number(c.price) : 1500,
            sampleType: c.sampleType || 'Venous Blood',
            turnaround: c.turnaround || '4 Hours',
          }));
          setLabCatalog(mappedCatalog);
          if (mappedCatalog[0]) {
            setSelectedLabTest(mappedCatalog[0]);
          }
        }

        if (profileRes && profileRes.data) {
          // Sync fresh profile details with session context safely
          const freshData = profileRes.data;
          updatePatientSession({
            firstName: freshData.firstName || '',
            lastName: freshData.lastName || '',
            fullName: freshData.fullName || `${freshData.firstName} ${freshData.lastName}`.trim(),
            contactNumber: freshData.contactNumber || freshData.phoneNumber || '',
            phoneNumber: freshData.contactNumber || freshData.phoneNumber || '',
            dob: freshData.dob || freshData.dateOfBirth || '',
            dateOfBirth: freshData.dob || freshData.dateOfBirth || '',
            gender: freshData.gender || 'MALE',
            bloodGroup: freshData.bloodGroup || 'O+',
            allergies: freshData.allergies || '',
            address: freshData.address || '',
            emergencyContactName: freshData.emergencyContactName || '',
            emergencyContactRelationship: freshData.emergencyContactRelationship || '',
            emergencyContactPhone: freshData.emergencyContactPhone || '',
          });
        }

        // Filter for this patient
        const myApts = (aptRes.data || []).filter(
          (a) =>
            a.patientId === patientSession.id ||
            a.patientNic === patientSession.nicPassportNo ||
            (a.patientName && a.patientName.toLowerCase().includes(patientFullName))
        );

        const myPrescriptions = (prsRes.data || []).filter(
          (p) =>
            p.patientId === patientSession.id ||
            (p.patientName && p.patientName.toLowerCase().includes(patientFullName))
        );

        const backendTests = (labRes.data || []).filter(
          (l) =>
            l.patientId === patientSession.id ||
            (l.patientName && l.patientName.toLowerCase().includes(patientFullName))
        );

        const backendInvoices = (invRes.data || []).filter(
          (i) =>
            i.patientId === patientSession.id ||
            i.patientNic === patientSession.nicPassportNo ||
            (i.patientName && i.patientName.toLowerCase().includes(patientFullName))
        );

        setAppointments(myApts);
        setPrescriptions(myPrescriptions);
        setLabTests(backendTests);
        setInvoices(backendInvoices);
        setDoctors(docRes.data || []);

        if (drugsRes.data && drugsRes.data.length > 0) {
          setAvailableDrugs(drugsRes.data);
        }
      } catch (err: any) {
        showToast('error', 'Error Loading Records', err.message || 'Could not load your medical history.');
      } finally {
        setLoading(false);
      }
    };

    loadPatientData();
  }, [patientSession?.id, patientSession?.nicPassportNo]);

  // Handle Avatar Change
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && patientSession) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPatientAvatar(base64);
        localStorage.setItem(`patient_avatar_${patientSession.id}`, base64);
        showToast('success', 'Profile Photo Updated', 'Your profile picture has been saved.');
      };
      reader.readAsDataURL(file);
    }
  };



  const handleConfirmCancelAppointment = async () => {
    if (!cancellingAppointment) return;
    setIsCancelling(true);
    try {
      // Physically remove the appointment from the backend database
      await appointmentApi.delete(cancellingAppointment.id);
      showToast('success', 'Appointment Removed', 'Your consultation booking has been removed from the hospital records.');
      setAppointments((prev) =>
        prev.filter((a) => a.id !== cancellingAppointment.id)
      );
      if (selectedAppointment?.id === cancellingAppointment.id) {
        setSelectedAppointment(null);
      }
      setCancellingAppointment(null);
      setCancelReason('');
    } catch (err: any) {
      showToast('error', 'Removal Error', err.message || 'Failed to remove appointment');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSelectTestCard = (type: 'VISA' | 'MASTERCARD' | 'AMEX') => {
    setPayHereTestCardType(type);
    setPayHereErrorMessage(null);
    if (type === 'VISA') {
      setPayHereCardNumber('4916 2175 0161 1292');
      setPayHereExpiry('12/28');
      setPayHereCvv('123');
    } else if (type === 'MASTERCARD') {
      setPayHereCardNumber('5307 7321 2553 1191');
      setPayHereExpiry('12/28');
      setPayHereCvv('456');
    } else {
      setPayHereCardNumber('3467 8100 5510 225');
      setPayHereExpiry('12/28');
      setPayHereCvv('1234');
    }
  };

  // Real PayHere Sandbox Gateway Handler
  const handleLaunchPayHereRealCheckout = async (invoice: Invoice, forceRedirect = false) => {
    if (!patientSession) return;
    setPayHereErrorMessage(null);
    setProcessingPayment(true);

    try {
      let settleId = invoice.id;
      // If invoice is ephemeral or client-staged, persist it first so backend has it
      if (settleId > 1_000_000_000 || String(settleId).startsWith('179')) {
        try {
          const gen = await billingApi.generateInvoice({
            patientId: patientSession?.id,
            pharmacyFee: invoice.pharmacyFee || invoice.pharmacyTotal || 0,
            labFee: invoice.labFee || invoice.labTotal || 0,
            doctorFee: invoice.doctorFee || 0,
            totalAmount: invoice.totalAmount || 1500,
          });
          if (gen.data?.id) {
            settleId = gen.data.id;
            invoice.id = gen.data.id;
            invoice.invoiceNumber = gen.data.invoiceNumber;
          }
        } catch (ignored) {}
      }

      // Call backend to generate valid MD5 hash and parameters
      const initiateRes = await billingApi.initiatePayHere(settleId);
      const params = initiateRes.data as any;

      const effectiveOrderId = params.orderId || params.order_id || invoice.invoiceNumber || String(invoice.id);
      const returnUrl = `${window.location.origin}/patient/portal?tab=billing&payment=success&order_id=${encodeURIComponent(effectiveOrderId)}`;
      const cancelUrl = `${window.location.origin}/patient/portal?tab=billing&payment=cancelled`;
      const notifyUrl = params.notifyUrl || params.notify_url || `${window.location.origin}/api/v1/payments/payhere/notify`;
      const merchantId = params.merchantId || params.merchant_id || '1235909';
      const amount = params.amount || Number(invoice.totalAmount).toFixed(2);
      const currency = params.currency || 'LKR';
      const hash = params.hash;

      // Check if PayHere JS popup is available and forceRedirect is false
      if (!forceRedirect && typeof (window as any).payhere !== 'undefined') {
        const payhere = (window as any).payhere;

        payhere.onCompleted = function onCompleted(orderId: string) {
          showToast('success', 'Payment Received', `PayHere payment for order #${orderId} completed successfully!`);
          setPayHereModalInvoice(null);
          setProcessingPayment(false);
          // Backend settlement for local state guarantees
          billingApi.settleCashCard(settleId, 'CARD', `PAYHERE-JS-${orderId}`).catch(() => {});
          setTimeout(() => {
            billingApi.getInvoices().then(res => {
              if (res.data) setInvoices(res.data.filter((i: Invoice) => i.patientId === patientSession.id));
            });
          }, 800);
        };

        payhere.onDismissed = function onDismissed() {
          showToast('info', 'Payment Dismissed', 'PayHere payment checkout was cancelled.');
          setProcessingPayment(false);
        };

        payhere.onError = function onError(error: string) {
          setPayHereErrorMessage(`PayHere Gateway error: ${error}`);
          showToast('error', 'Payment Error', error);
          setProcessingPayment(false);
        };

        const payment = {
          sandbox: true,
          merchant_id: merchantId,
          return_url: returnUrl,
          cancel_url: cancelUrl,
          notify_url: notifyUrl,
          order_id: effectiveOrderId,
          items: params.items || `PulseOS Medical Invoice #${invoice.invoiceNumber || invoice.id}`,
          amount: amount,
          currency: currency,
          hash: hash,
          first_name: params.firstName || patientSession.firstName || 'Patient',
          last_name: params.lastName || patientSession.lastName || 'PulseOS',
          email: params.email || patientSession.email || 'patient@pulseos.lk',
          phone: params.phone || patientSession.contactNumber || '0771234567',
          address: params.address || patientSession.address || 'No. 124, Hospital Road',
          city: params.city || 'Colombo',
          country: 'Sri Lanka',
        };

        payhere.startPayment(payment);
        setProcessingPayment(false);
      } else {
        // Fallback: Form POST to https://sandbox.payhere.lk/pay/checkout
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://sandbox.payhere.lk/pay/checkout';

        const fields: Record<string, string> = {
          merchant_id: merchantId,
          return_url: returnUrl,
          cancel_url: cancelUrl,
          notify_url: notifyUrl,
          order_id: effectiveOrderId,
          items: params.items || `PulseOS Medical Invoice #${invoice.invoiceNumber || invoice.id}`,
          currency: currency,
          amount: amount,
          first_name: params.firstName || patientSession.firstName || 'Patient',
          last_name: params.lastName || patientSession.lastName || 'PulseOS',
          email: params.email || patientSession.email || 'patient@pulseos.lk',
          phone: params.phone || patientSession.contactNumber || '0771234567',
          address: params.address || patientSession.address || 'No. 124, Hospital Road',
          city: params.city || 'Colombo',
          country: 'Sri Lanka',
          hash: hash || '',
        };

        Object.entries(fields).forEach(([k, v]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = k;
          input.value = v;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      }
    } catch (err: any) {
      setPayHereErrorMessage(err.message || 'Failed to initialize PayHere payment session.');
      showToast('error', 'PayHere Error', err.message || 'Failed to connect to payment gateway.');
      setProcessingPayment(false);
    }
  };

  // Handle PayHere Simulation
  const handleSimulatePayHerePayment = async (invoice: Invoice) => {
    if (!patientSession) return;
    setPayHereErrorMessage(null);

    // Check decline simulation scenarios
    if (payHereSimulationOutcome === 'DECLINE_FUNDS') {
      setProcessingPayment(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProcessingPayment(false);
      setPayHereErrorMessage('PayHere Error (-2): Insufficient funds in sandbox test account. Transaction declined by card issuer.');
      showToast('error', 'Payment Declined', 'PayHere code -2: Insufficient funds.');
      return;
    }

    if (payHereSimulationOutcome === 'DECLINE_LIMIT') {
      setProcessingPayment(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProcessingPayment(false);
      setPayHereErrorMessage('PayHere Error (-3): Transaction amount exceeds sandbox credit limit for this test card.');
      showToast('error', 'Payment Declined', 'PayHere code -3: Card limit exceeded.');
      return;
    }

    try {
      setProcessingPayment(true);
      // Realistic network latency for Central Bank 3D Secure 2.0 handshake
      await new Promise((resolve) => setTimeout(resolve, 1200));

      let updatedInvoice = invoice;

      try {
        let settleId = invoice.id;
        // If invoice is ephemeral or client-staged, persist it first
        if (settleId > 1_000_000_000 || String(settleId).startsWith('179')) {
          try {
            const gen = await billingApi.generateInvoice({
              patientId: patientSession?.id,
              pharmacyFee: invoice.pharmacyFee || invoice.pharmacyTotal || 0,
              labFee: invoice.labFee || invoice.labTotal || 0,
              doctorFee: invoice.doctorFee || 0,
              totalAmount: invoice.totalAmount || 1500,
            });
            if (gen.data?.id) {
              settleId = gen.data.id;
              invoice.id = gen.data.id;
              invoice.invoiceNumber = gen.data.invoiceNumber;
            }
          } catch (ignored) {}
        }

        const res = await billingApi.settleCashCard(
          settleId,
          'CARD',
          `PAYHERE-SB-${payHereTestCardType}-${Date.now().toString().slice(-6)}`
        );
        updatedInvoice = {
          ...res.data,
          status: 'PAID',
          paymentStatus: 'PAID',
          paymentMethod: `PayHere Sandbox (${payHereTestCardType})`,
        };
      } catch (e) {
        // Fallback for locally staged invoices
        updatedInvoice = {
          ...invoice,
          status: 'PAID',
          paymentStatus: 'PAID',
          paymentMethod: `PayHere Sandbox (${payHereTestCardType})`,
        };
      }

      setInvoices((prev) => {
        const updated = prev.map((inv) => (inv.id === invoice.id ? updatedInvoice : inv));
        localStorage.setItem(`local_invoices_${patientSession.id}`, JSON.stringify(updated));
        return updated;
      });

      // Also mark associated lab tests as paid / SAMPLE_COLLECTED if applicable
      setLabTests((prev) => {
        const updated = prev.map((lt) => {
          if (lt.requestNumber === invoice.invoiceNumber || invoice.invoiceNumber.includes(`LAB-${lt.id}`)) {
            return { ...lt, status: 'SAMPLE_COLLECTED' };
          }
          return lt;
        });
        localStorage.setItem(`local_lab_tests_${patientSession.id}`, JSON.stringify(updated));
        return updated;
      });

      setPayHereModalInvoice(null);
      showToast('success', 'Payment Authorized', `Invoice #${invoice.invoiceNumber} paid via PayHere Card Gateway (Central Bank 3D Secure Approved).`);
    } catch (err: any) {
      showToast('error', 'Payment Failed', err.message || 'Payment processing error.');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Cart Management
  const updateCartQty = (drugId: number, delta: number) => {
    setCart((prev) => {
      const current = prev[drugId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[drugId];
        return copy;
      }
      return { ...prev, [drugId]: next };
    });
  };

  const totalCartItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalCartPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const drug = availableDrugs.find((d) => d.id === Number(id));
    return sum + (drug ? drug.unitPrice * qty : 0);
  }, 0);

  // Pharmacy Order Submission
  const handlePharmacyOrderSubmit = async () => {
    if (!patientSession) return;
    if (totalCartItems === 0) {
      showToast('error', 'Cart Empty', 'Please select at least one medication to order.');
      return;
    }

    let newInvoice: Invoice;
    try {
      const invRes = await billingApi.generateInvoice({
        patientId: patientSession.id,
        pharmacyFee: totalCartPrice,
        totalAmount: totalCartPrice,
        description: `Patient Pharmacy Order (${totalCartItems} items)`,
      });
      newInvoice = {
        ...invRes.data,
        patientName: patientSession.fullName || `${patientSession.firstName} ${patientSession.lastName}`,
        patientNic: patientSession.nicPassportNo,
        pharmacyTotal: totalCartPrice,
        status: pharmacyPaymentMethod === 'PAYHERE' ? 'PENDING' : pharmacyPaymentMethod === 'BANK_RECEIPT' ? 'VERIFYING' : 'PENDING_CASH',
        paymentMethod: pharmacyPaymentMethod === 'PAYHERE' ? 'PayHere Sandbox' : pharmacyPaymentMethod === 'BANK_RECEIPT' ? 'Bank Transfer' : 'Counter Cash',
      };
    } catch (e) {
      const orderId = `PHARM-${Date.now().toString().slice(-6)}`;
      newInvoice = {
        id: Date.now(),
        invoiceId: Date.now(),
        invoiceNumber: `INV-${orderId}`,
        patientId: patientSession.id,
        patientName: patientSession.fullName || `${patientSession.firstName} ${patientSession.lastName}`,
        patientNic: patientSession.nicPassportNo,
        doctorFee: 0,
        pharmacyFee: totalCartPrice,
        labFee: 0,
        pharmacyTotal: totalCartPrice,
        totalAmount: totalCartPrice,
        discountAmount: 0,
        netAmount: totalCartPrice,
        status: pharmacyPaymentMethod === 'PAYHERE' ? 'PENDING' : pharmacyPaymentMethod === 'BANK_RECEIPT' ? 'VERIFYING' : 'PENDING_CASH',
        paymentStatus: pharmacyPaymentMethod === 'PAYHERE' ? 'PENDING' : 'PENDING',
        paymentMethod: pharmacyPaymentMethod === 'PAYHERE' ? 'PayHere Sandbox' : pharmacyPaymentMethod === 'BANK_RECEIPT' ? 'Bank Transfer' : 'Counter Cash',
        billingDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      };
    }

    setInvoices((prev) => {
      const updated = [newInvoice, ...prev];
      localStorage.setItem(`local_invoices_${patientSession.id}`, JSON.stringify(updated));
      return updated;
    });

    // Reset Cart & Close Modal
    setCart({});
    setIsPharmacyCheckoutOpen(false);

    if (pharmacyPaymentMethod === 'PAYHERE') {
      setPayHereModalInvoice(newInvoice);
      showToast('info', 'Order Placed', 'Proceed to authorize your payment via PayHere Sandbox.');
    } else if (pharmacyPaymentMethod === 'BANK_RECEIPT') {
      showToast('success', 'Order Placed with Bank Receipt', 'Your transfer slip has been uploaded for dispensary verification.');
      setActiveTab('billing');
    } else {
      showToast('success', 'Order Placed', 'Your order is ready for collection at the Outpatient Dispensary counter.');
      setActiveTab('billing');
    }
  };

  // Lab Test Request Submission
  const handleLabOrderSubmit = async () => {
    if (!patientSession) return;
    try {
      const orderRes = await labApi.orderTest({
        patientId: patientSession.id,
        doctorId: doctors[0]?.id,
        testCatalogId: selectedLabTest.id,
        urgency: labUrgency,
        clinicalIndication: labIndication || 'Patient initiated screening',
      });

      const invRes = await billingApi.generateInvoice({
        patientId: patientSession.id,
        labFee: selectedLabTest.standardFee || 1500,
        totalAmount: selectedLabTest.standardFee || 1500,
      });

      const testData = orderRes.data || {
        ...selectedLabTest,
        id: Date.now(),
        testCode: selectedLabTest.testCode,
        testName: selectedLabTest.testName,
        status: 'REQUESTED',
        patientId: patientSession.id,
        patientName: patientSession.fullName,
      };

      const invoiceData = invRes.data || {
        id: Date.now() + 1,
        invoiceNumber: `INV-LAB-${Date.now().toString().slice(-6)}`,
        patientId: patientSession.id,
        totalAmount: selectedLabTest.standardFee || 1500,
        paymentStatus: 'PENDING',
      };

      setLabTests((prev) => [testData, ...prev]);
      setInvoices((prev) => [invoiceData, ...prev]);

      setIsLabOrderModalOpen(false);
      setLabReceiptFile(null);
      setLabReceiptRef('');

      if (labPaymentMethod === 'PAYHERE') {
        setPayHereModalInvoice(invoiceData);
        showToast('info', 'Lab Test Requested', 'Proceed to authorize payment on PayHere Sandbox.');
      } else {
        showToast('success', 'Lab Test Requested', 'Bank transfer receipt submitted. Sample collection scheduled.');
      }
    } catch (err: any) {
      showToast('error', 'Booking Failed', err.message || 'Could not record lab order');
    }
  };

  const filteredDrugs = availableDrugs.filter((drug) => {
    const name = (drug.brandName || drug.drugName || '').toLowerCase();
    const generic = (drug.genericName || '').toLowerCase();
    const matchesSearch = name.includes(pharmacySearch.toLowerCase()) || generic.includes(pharmacySearch.toLowerCase());
    const matchesCategory = selectedDrugCategory === 'ALL' || drug.category === selectedDrugCategory;
    return matchesSearch && matchesCategory;
  });

  const drugCategories: string[] = ['ALL', ...Array.from(new Set(availableDrugs.map((d) => d.category).filter((c): c is string => Boolean(c))))];

  if (!patientSession) {
    return <Navigate to="/patient/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-clinical-ink flex flex-col font-sans">
      {/* Top Header */}
      <header className="liquid-glass sticky top-0 z-30 h-16 w-full px-4 lg:px-8 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl overflow-hidden bg-white border border-slate-200/80 shadow-xs flex items-center justify-center p-0.5 shrink-0">
            <img src="/pulseos-logo.jpg" alt="PulseOS Logo" className="h-full w-full object-contain rounded-lg" />
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
            onClick={() => setIsChangePasswordOpen(true)}
            className="apple-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
            title="Change Account Password"
          >
            <KeyRound className="h-3.5 w-3.5 text-clinical-teal-600" />
            <span className="hidden sm:inline">Password</span>
          </button>

          <button
            onClick={handleSignOut}
            className="apple-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-rose-600 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Patient Identity Banner with Avatar Upload */}
        <div className="apple-card p-5 sm:p-6 bg-gradient-to-r from-white via-slate-50 to-clinical-teal-50/30 border border-slate-200/90 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Profile Avatar with Hover Upload Icon */}
              <div
                className="relative group cursor-pointer"
                onClick={() => avatarInputRef.current?.click()}
                title="Click to upload/change your profile photo"
              >
                {patientAvatar ? (
                  <img
                    src={patientAvatar}
                    alt={patientSession.fullName}
                    className="h-14 w-14 rounded-2xl object-cover border-2 border-clinical-teal-600 shadow-md"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-2xl bg-clinical-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-clinical-teal-600/20">
                    {patientSession.firstName[0]}
                    {patientSession.lastName ? patientSession.lastName[0] : ''}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white">
                  <Camera className="h-4 w-4" />
                  <span className="text-[8px] font-bold mt-0.5">Edit</span>
                </div>
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
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

            {/* Quick Stats Pill, Profile Completion & Action */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Circular Profile Completion Meter */}
              <div
                onClick={() => setIsEditProfileOpen(true)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-clinical-teal-300 hover:shadow-xs transition-all cursor-pointer group"
                title="Click to complete or update your health profile"
              >
                <div className="relative h-9 w-9 flex items-center justify-center">
                  <svg className="h-9 w-9 -rotate-90 transform" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="3"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke={profileCompletion >= 80 ? '#0d9488' : profileCompletion >= 50 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="3"
                      strokeDasharray="94.2"
                      strokeDashoffset={94.2 - (94.2 * profileCompletion) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold font-mono text-slate-800">
                    {profileCompletion}%
                  </span>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Profile</span>
                    <Edit3 className="h-3 w-3 text-clinical-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-xs font-semibold text-clinical-teal-700 block -mt-0.5">
                    {profileCompletion === 100 ? 'Complete' : 'Edit Info'}
                  </span>
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Blood Type</span>
                <span className="text-xs font-mono font-bold text-rose-600">{patientSession.bloodGroup}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Triage Status</span>
                <span className="text-xs font-semibold text-clinical-teal-700">{patientSession.triagePriority}</span>
              </div>
              <button
                onClick={() => setIsEditProfileOpen(true)}
                className="apple-btn inline-flex items-center gap-1.5 px-3 py-2 rounded-apple-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
              >
                <Settings className="h-3.5 w-3.5" />
                <span>Profile Settings</span>
              </button>
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
              <span className="font-mono text-slate-700">{patientSession.contactNumber || patientSession.phoneNumber || '077 123 4567'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">KNOWN ALLERGIES</span>
              {patientSession.allergies && patientSession.allergies !== 'None' ? (
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {patientSession.allergies.split(',').map((allergy, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/80 shadow-2xs"
                    >
                      {allergy.trim()}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="font-semibold text-slate-500 text-xs">None Reported</span>
              )}
            </div>
            {patientSession.address && (
              <div className="col-span-2">
                <span className="text-[10px] text-slate-400 block font-medium">ADDRESS</span>
                <span className="text-slate-700">{patientSession.address}</span>
              </div>
            )}
            {patientSession.emergencyContactName && (
              <div className="col-span-2">
                <span className="text-[10px] text-slate-400 block font-medium">EMERGENCY CONTACT</span>
                <span className="text-slate-700">
                  {patientSession.emergencyContactName} ({patientSession.emergencyContactRelationship || 'Contact'}) &bull;{' '}
                  <span className="font-mono">{patientSession.emergencyContactPhone}</span>
                </span>
              </div>
            )}
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
            <span>Prescriptions ({prescriptions.length})</span>
          </button>

          {/* New Tab: Online Pharmacy Store */}
          <button
            onClick={() => setActiveTab('pharmacy_store')}
            className={`apple-btn flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'pharmacy_store'
                ? 'border-clinical-teal-600 text-clinical-teal-700 bg-white shadow-2xs font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Pharmacy Store</span>
            {totalCartItems > 0 && (
              <span className="h-4 w-4 rounded-full bg-clinical-teal-600 text-white font-mono text-[9px] flex items-center justify-center font-bold">
                {totalCartItems}
              </span>
            )}
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
            <span>Billing & Payments ({invoices.length})</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {appointments.map((apt) => (
                  <div key={apt.id} className="apple-card p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-clinical-teal-700 bg-clinical-teal-50 px-2 py-0.5 rounded border border-clinical-teal-200">
                          {(() => {
                            const rawId = apt.appointmentNumber || apt.appointmentId || apt.id;
                            if (!rawId) return 'APT-0001';
                            const str = String(rawId);
                            return str.startsWith('APT-') ? str : `APT-${str.padStart(4, '0')}`;
                          })()}
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-slate-50 border border-slate-200/70 font-mono">
                      <div>
                        <span className="text-slate-400 block text-[10px]">DATE & TIME</span>
                        <span className="font-bold text-slate-800">
                          {apt.appointmentDate} @ {apt.appointmentTime}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">ROOM</span>
                        <span className="font-semibold text-slate-700">
                          {apt.roomNumber ? (String(apt.roomNumber).toLowerCase().startsWith('room') ? apt.roomNumber : `Room ${apt.roomNumber}`) : 'Room 101'}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Reason for Consultation
                      </span>
                      <p className="italic">"{apt.reasonForVisit}"</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedAppointment(apt)}
                        className="text-clinical-teal-700 hover:text-clinical-teal-800 font-bold flex items-center gap-1 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Details</span>
                      </button>

                      {(apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED') && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCancellingAppointment(apt);
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors flex items-center gap-1"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          <span>Cancel</span>
                        </button>
                      )}
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
                      {(() => {
                        const matchedInvoice = invoices.find(
                          (inv) =>
                            (prs.invoiceId && inv.id === prs.invoiceId) ||
                            (inv.invoiceNumber && (inv.invoiceNumber.includes(`RX-${prs.id}`) || (prs.prescriptionNumber && inv.invoiceNumber.includes(prs.prescriptionNumber)))) ||
                            (prs.appointmentId && inv.appointmentId === prs.appointmentId)
                        );
                        const isInvoicePaid = matchedInvoice?.paymentStatus === 'PAID' || prs.isPaid || prs.paymentStatus === 'PAID';
                        const invoiceAmount = matchedInvoice?.totalAmount || prs.totalAmount || 1500;

                        if (isInvoicePaid) {
                          return (
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                              <span className="text-xs font-mono text-slate-500">
                                Invoice #{matchedInvoice?.invoiceNumber || (prs.invoiceNumber ? prs.invoiceNumber : `INV-RX-${prs.id}`)}
                              </span>
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                Invoice Settled (LKR {Number(invoiceAmount).toFixed(2)}) &bull; Ready at Dispensary
                              </span>
                            </div>
                          );
                        }

                        if (!isDispensed) {
                          return (
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                              <span className="text-xs font-mono text-slate-500">
                                {matchedInvoice?.invoiceNumber ? `Invoice #${matchedInvoice.invoiceNumber}` : 'Prescription Invoice Pending'}
                              </span>
                              <button
                                onClick={async () => {
                                  try {
                                    let targetInvoice = matchedInvoice;
                                    if (!targetInvoice) {
                                      showToast('info', 'Preparing Invoice', 'Generating prescription billing invoice...');
                                      const genRes = await billingApi.generateInvoice({
                                        patientId: prs.patientId || patientSession.id,
                                        appointmentId: prs.appointmentId,
                                        pharmacyFee: invoiceAmount,
                                        totalAmount: invoiceAmount,
                                        description: `Prescription #${prs.prescriptionNumber || prs.id}`,
                                      });
                                      targetInvoice = genRes.data;
                                      setInvoices((prev) => [genRes.data, ...prev]);
                                    }
                                    setPayHereModalInvoice(targetInvoice);
                                  } catch (err: any) {
                                    showToast('error', 'Checkout Error', err.message || 'Could not initiate payment checkout');
                                  }
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                              >
                                <CreditCard className="h-3.5 w-3.5" />
                                <span>Pay LKR {Number(invoiceAmount).toFixed(2)} (PayHere)</span>
                              </button>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Online Pharmacy Store (New Feature) */}
        {activeTab === 'pharmacy_store' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">PulseOS Online Hospital Pharmacy</h2>
                <p className="text-xs text-slate-500">
                  Order hospital formulary medications online with instant PayHere payment or dispensary collection.
                </p>
              </div>

              {totalCartItems > 0 && (
                <button
                  onClick={() => setIsPharmacyCheckoutOpen(true)}
                  className="apple-btn inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-clinical-teal-600 hover:bg-clinical-teal-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>
                    Checkout ({totalCartItems} items &bull; LKR {totalCartPrice.toFixed(2)})
                  </span>
                </button>
              )}
            </div>

            {/* Pharmacy Search & Category Filter */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 apple-card p-3">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search medication by brand, generic name..."
                  value={pharmacySearch}
                  onChange={(e) => setPharmacySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-clinical-ink focus:outline-none focus:ring-2 focus:ring-clinical-teal-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {drugCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedDrugCategory(cat)}
                    className={`apple-btn px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedDrugCategory === cat
                        ? 'bg-clinical-teal-600 text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cat === 'ALL' ? 'All Medications' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Drugs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDrugs.map((drug) => {
                const qtyInCart = cart[drug.id] || 0;
                const inStock = (drug.stockQuantity || drug.currentStock || 100) > 0;

                return (
                  <div key={drug.id} className="apple-card p-5 space-y-3 flex flex-col justify-between hover:border-slate-300 transition-all">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {drug.itemCode || drug.drugCode || `DRG-${drug.id}`}
                          </span>
                          <h3 className="font-bold text-sm text-slate-900 mt-1">{drug.brandName || drug.drugName}</h3>
                          <p className="text-xs text-clinical-teal-700 font-medium italic">{drug.genericName}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-clinical-teal-50 text-clinical-teal-700 border border-clinical-teal-200">
                          {drug.category}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 space-y-0.5 font-mono">
                        <div>Dosage Form: <span className="font-semibold text-slate-700">{drug.dosageForm || 'Oral Tablet'}</span></div>
                        <div>Strength: <span className="font-semibold text-slate-700">{drug.strength || 'Standard'}</span></div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">UNIT PRICE</span>
                        <span className="text-sm font-bold font-mono text-slate-900">
                          LKR {Number(drug.unitPrice).toFixed(2)}
                        </span>
                      </div>

                      {qtyInCart > 0 ? (
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
                          <button
                            onClick={() => updateCartQty(drug.id, -1)}
                            className="h-6 w-6 rounded bg-white font-bold text-xs flex items-center justify-center hover:bg-slate-200"
                          >
                            -
                          </button>
                          <span className="text-xs font-mono font-bold px-1">{qtyInCart}</span>
                          <button
                            onClick={() => updateCartQty(drug.id, 1)}
                            className="h-6 w-6 rounded bg-white font-bold text-xs flex items-center justify-center hover:bg-slate-200"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          disabled={!inStock}
                          onClick={() => updateCartQty(drug.id, 1)}
                          className="apple-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-clinical-teal-600 hover:bg-clinical-teal-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add to Order</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Lab Tests Content with Request Test Button */}
        {activeTab === 'lab' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Diagnostic Pathology & Clinical Tests</h2>
                <p className="text-xs text-slate-500">Laboratory analyses verified by hospital medical technologists.</p>
              </div>

              <button
                onClick={() => setIsLabOrderModalOpen(true)}
                className="apple-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-clinical-teal-600 hover:bg-clinical-teal-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Order Diagnostic Test</span>
              </button>
            </div>

            {labTests.length === 0 ? (
              <div className="apple-card p-10 text-center space-y-3">
                <FlaskConical className="h-10 w-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-sm text-slate-700">No Diagnostic Tests On Record</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No laboratory orders or pathology reports are currently associated with your file. Request a test using the button above.
                </p>
                <button
                  onClick={() => setIsLabOrderModalOpen(true)}
                  className="apple-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-clinical-teal-600 text-white text-xs font-semibold"
                >
                  <Plus className="h-4 w-4" />
                  <span>Request Blood / Lab Test</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {labTests.map((test: any) => {
                  const testCode = test.testCode || test.requestNumber || `LAB-${test.id}`;
                  const specimen = test.sampleType || test.specimenType || 'Venous Blood';
                  const isCompleted = test.status === 'COMPLETED';
                  const matchingInvoice = invoices.find(
                    (inv) => inv.invoiceNumber === `INV-LAB-${test.id.toString().slice(-6)}` || inv.invoiceNumber === test.requestNumber
                  );

                  return (
                    <div key={test.id} className="apple-card p-5 space-y-3">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-xs text-clinical-teal-700">{testCode}</span>
                            <span className="font-bold text-sm text-slate-900">{test.testName}</span>
                            {test.urgency === 'URGENT' && (
                              <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 font-bold text-[10px]">
                                ⚡ STAT URGENT
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Ordered by {test.doctorName || 'PulseOS Pathology Lab'} &bull; Specimen: {specimen} &bull; Date: {test.testDate || '2026-09-14'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          {test.receiptImage && (
                            <button
                              onClick={() => setViewingReceiptImage(test.receiptImage)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[10px] hover:bg-blue-100"
                            >
                              <Eye className="h-3 w-3" />
                              <span>View Receipt</span>
                            </button>
                          )}

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

                      {/* Sample Lifecycle Progress Bar */}
                      <div className="py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                          <span className={test.status ? 'text-clinical-teal-800' : ''}>1. Order Received</span>
                          <span className={test.status === 'COLLECTED' || test.status === 'SAMPLE_COLLECTED' || test.status === 'PROCESSING' || isCompleted ? 'text-clinical-teal-800' : ''}>2. Specimen Collected</span>
                          <span className={test.status === 'PROCESSING' || isCompleted ? 'text-clinical-teal-800' : ''}>3. In Analyzer</span>
                          <span className={isCompleted ? 'text-emerald-700 font-extrabold' : ''}>4. Report Certified</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isCompleted
                                ? 'w-full bg-emerald-500'
                                : test.status === 'PROCESSING'
                                ? 'w-3/4 bg-indigo-500'
                                : test.status === 'COLLECTED' || test.status === 'SAMPLE_COLLECTED'
                                ? 'w-1/2 bg-amber-500'
                                : 'w-1/4 bg-slate-400'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Turnaround Time & SMS Alert Badges */}
                      <div className="flex items-center gap-2 flex-wrap text-xs pt-1 border-t border-slate-100">
                        {!isCompleted && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px]">
                            <Clock className="h-3.5 w-3.5 text-clinical-teal-600" />
                            <span>
                              Est. Delivery: <strong>{test.estimatedReadyTime || calculateEstimatedCompletion(test.turnaround || '4 Hours', test.urgency || 'ROUTINE', test.testDate)}</strong>
                            </span>
                          </div>
                        )}

                        {(test.notifySms || test.notificationPhone) && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-clinical-teal-50 text-clinical-teal-800 font-medium text-[11px] border border-clinical-teal-200/60">
                            <MessageSquare className="h-3.5 w-3.5 text-clinical-teal-600" />
                            <span>
                              SMS/WhatsApp Alert: <strong>{test.notificationPhone || patientSession.contactNumber || 'Active'}</strong>
                            </span>
                          </div>
                        )}

                        {/* Pay with PayHere button if pending and matching invoice not paid or no invoice found */}
                        {(!matchingInvoice || matchingInvoice.status !== 'PAID') && !isCompleted && (
                          <button
                            onClick={() => {
                              if (matchingInvoice) {
                                setPayHereModalInvoice(matchingInvoice);
                              } else {
                                const dummyInvoice = {
                                  id: test.id,
                                  invoiceNumber: `INV-LAB-${test.id}`,
                                  totalAmount: 1500, // Fallback fee
                                  status: 'PENDING',
                                  paymentStatus: 'PENDING',
                                  createdAt: test.testDate || new Date().toISOString()
                                };
                                setPayHereModalInvoice(dummyInvoice as any);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs transition-colors ml-auto"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            <span>Pay LKR {matchingInvoice ? Number(matchingInvoice.totalAmount).toFixed(2) : '1500.00'} (PayHere)</span>
                          </button>
                        )}
                      </div>

                      {test.clinicalIndication && (
                        <div className="text-xs text-slate-600 italic">
                          Indication: "{test.clinicalIndication}"
                        </div>
                      )}

                      {isCompleted && (
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between flex-wrap gap-2">
                            <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              <span>Verified by Senior Technologist &bull; ISO 15189 Accredited</span>
                            </div>
                            {(!matchingInvoice || matchingInvoice.status !== 'PAID') ? (
                              <button
                                onClick={() => {
                                  if (matchingInvoice) {
                                    setPayHereModalInvoice(matchingInvoice);
                                  } else {
                                    const dummyInvoice = {
                                      id: test.id,
                                      invoiceNumber: `INV-LAB-${test.id}`,
                                      totalAmount: 1500,
                                      status: 'PENDING',
                                      paymentStatus: 'PENDING',
                                      createdAt: test.testDate || new Date().toISOString()
                                    };
                                    setPayHereModalInvoice(dummyInvoice as any);
                                  }
                                  showToast('error', 'Payment Required', 'You must settle the invoice before downloading the certified report.');
                                }}
                                className="apple-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors"
                              >
                                <CreditCard className="h-3.5 w-3.5" />
                                <span>Pay to Unlock Report</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => setSelectedReportTest(test)}
                                className="apple-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-clinical-teal-600 hover:bg-clinical-teal-700 text-white font-bold text-xs shadow-xs transition-colors"
                              >
                                <Printer className="h-3.5 w-3.5" />
                                <span>View & Download Official Report</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Billing & Payments Content */}
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
                  All your past encounters are fully settled. New invoices will appear here following doctor consultations, pharmacy orders, or lab tests.
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
                          <Badge variant={inv.status === 'PAID' ? 'success' : inv.status === 'VERIFYING' ? 'warning' : 'emergency'}>
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
        maxWidth="5xl"
      >
        <AppointmentCalendar 
          doctors={doctors}
          onConfirm={async (doctorId, date, time, reason) => {
            try {
              await appointmentApi.create({
                patientId: Number(patientSession!.id),
                doctorId: Number(doctorId),
                appointmentDate: date,
                appointmentTime: time,
                reasonForVisit: reason,
              });
              
              showToast('success', 'Success', 'Appointment booked successfully!');
              setIsBookModalOpen(false);
              window.location.reload();
            } catch (error: any) {
              if (error.response?.status === 409) {
                showToast('error', 'Error', 'Time slot is already booked. Please select another slot.');
              } else {
                showToast('error', 'Error', 'Failed to book appointment.');
              }
            }
          }}
        />
      </Modal>

      {/* Pharmacy Checkout Modal */}
      {isPharmacyCheckoutOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsPharmacyCheckoutOpen(false)}
          title="Medication Checkout & Order Review"
          subtitle="Confirm your pharmacy items and select payment method."
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            {/* Selected Items */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 max-h-48 overflow-y-auto">
              {Object.entries(cart).map(([drugId, qty]) => {
                const drug = availableDrugs.find((d) => d.id === Number(drugId));
                if (!drug) return null;
                const subtotal = drug.unitPrice * qty;

                return (
                  <div key={drugId} className="flex items-center justify-between pb-2 border-b border-slate-200/60 last:border-0 last:pb-0">
                    <div>
                      <div className="font-bold text-slate-900">{drug.brandName || drug.drugName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {drug.strength} &bull; Qty: {qty} &times; LKR {drug.unitPrice.toFixed(2)}
                      </div>
                    </div>
                    <span className="font-bold font-mono text-slate-900">LKR {subtotal.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-clinical-teal-50 border border-clinical-teal-200">
              <span className="font-bold text-clinical-teal-900 text-sm">Order Total Payable:</span>
              <span className="text-base font-bold font-mono text-clinical-teal-900">
                LKR {totalCartPrice.toFixed(2)}
              </span>
            </div>

            {/* Delivery Option */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block text-[11px]">Collection / Delivery Method</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('PICKUP')}
                  className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                    deliveryMethod === 'PICKUP'
                      ? 'border-clinical-teal-600 bg-clinical-teal-50 text-clinical-teal-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="h-4 w-4 mb-1 text-clinical-teal-600" />
                  <span className="block text-xs">Dispensary Pickup</span>
                  <span className="text-[10px] text-slate-400 block">PulseOS Main Counter</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod('DELIVERY')}
                  className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                    deliveryMethod === 'DELIVERY'
                      ? 'border-clinical-teal-600 bg-clinical-teal-50 text-clinical-teal-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Activity className="h-4 w-4 mb-1 text-clinical-teal-600" />
                  <span className="block text-xs">Express Home Delivery</span>
                  <span className="text-[10px] text-slate-400 block">Deliver to patient address</span>
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block text-[11px]">Payment Option</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPharmacyPaymentMethod('PAYHERE')}
                  className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                    pharmacyPaymentMethod === 'PAYHERE'
                      ? 'border-clinical-teal-600 bg-clinical-teal-50 text-clinical-teal-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="h-4 w-4 mb-1 text-clinical-teal-600" />
                  <span className="block text-[11px]">PayHere Online</span>
                  <span className="text-[9px] text-slate-400 block">Card (Sandbox)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPharmacyPaymentMethod('BANK_RECEIPT')}
                  className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                    pharmacyPaymentMethod === 'BANK_RECEIPT'
                      ? 'border-clinical-teal-600 bg-clinical-teal-50 text-clinical-teal-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Upload className="h-4 w-4 mb-1 text-clinical-teal-600" />
                  <span className="block text-[11px]">Bank Slip</span>
                  <span className="text-[9px] text-slate-400 block">Upload Receipt</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPharmacyPaymentMethod('CASH')}
                  className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                    pharmacyPaymentMethod === 'CASH'
                      ? 'border-clinical-teal-600 bg-clinical-teal-50 text-clinical-teal-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="h-4 w-4 mb-1 text-clinical-teal-600" />
                  <span className="block text-[11px]">Pay at Counter</span>
                  <span className="text-[9px] text-slate-400 block">Cash / Card</span>
                </button>
              </div>
            </div>

            {/* Bank Transfer Details & File Upload if BANK_RECEIPT */}
            {pharmacyPaymentMethod === 'BANK_RECEIPT' && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="font-semibold text-slate-800">Hospital Account Details:</div>
                <div className="p-2 rounded bg-white border border-slate-200 font-mono text-[11px] space-y-0.5">
                  <div>Bank: Commercial Bank of Ceylon PLC</div>
                  <div>Account: PulseOS Medical Healthcare Services</div>
                  <div>Acc No: 8009 2819 0293 &bull; Branch: Colombo City</div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500">UPLOAD PAYMENT RECEIPT / SCREENSHOT</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setPharmacyReceiptFile(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-clinical-teal-50 file:text-clinical-teal-700 hover:file:bg-clinical-teal-100"
                  />
                  {pharmacyReceiptFile && (
                    <div className="flex items-center gap-2 mt-1 p-1 bg-emerald-50 rounded border border-emerald-200 text-emerald-800 text-[10px]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Receipt Attached & Ready for Verification</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsPharmacyCheckoutOpen(false)}
                className="apple-btn px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePharmacyOrderSubmit}
                className="apple-btn px-5 py-2.5 rounded-lg bg-clinical-teal-600 hover:bg-clinical-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                <span>Place Medication Order</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Lab Order Modal (New Feature) */}
      {isLabOrderModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsLabOrderModalOpen(false)}
          title="Order Diagnostic Laboratory Test"
          subtitle="Choose diagnostic panel, preferred date, and payment method."
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            {/* Test Selection */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block text-[11px]">Select Diagnostic Investigation</label>
              <select
                value={selectedLabTest.id}
                onChange={(e) => {
                  const found = labCatalog.find((t) => t.id === Number(e.target.value));
                  if (found) setSelectedLabTest(found);
                }}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-clinical-teal-500"
              >
                {labCatalog.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.testCode} - {t.testName} (LKR {t.standardFee.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {/* Test Details Card */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">{selectedLabTest.testName}</span>
                <span className="font-mono font-bold text-clinical-teal-700">
                  LKR {selectedLabTest.standardFee.toFixed(2)}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                <div>Sample: <span className="font-semibold text-slate-700">{selectedLabTest.sampleType}</span></div>
                <div>Turnaround: <span className="font-semibold text-slate-700">{selectedLabTest.turnaround}</span></div>
              </div>
            </div>

            {/* Urgency & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-[11px]">Urgency</label>
                <select
                  value={labUrgency}
                  onChange={(e) => setLabUrgency(e.target.value as any)}
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="ROUTINE">Routine (Standard)</option>
                  <option value="URGENT">Stat / Urgent (Fast Track)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-[11px]">Sample Collection Date</label>
                <input
                  type="date"
                  value={labCollectionDate}
                  onChange={(e) => setLabCollectionDate(e.target.value)}
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            {/* Dynamic Estimated Report Time & SMS Alerts */}
            <div className="p-3 rounded-xl bg-clinical-teal-50/70 border border-clinical-teal-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-clinical-teal-700" />
                  <span className="font-bold text-xs text-clinical-teal-950">Estimated Report Delivery</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-clinical-teal-200/60 text-clinical-teal-900 font-mono text-[10px] font-bold">
                  {labUrgency === 'URGENT' ? '⚡ FAST-TRACK STAT' : 'STANDARD OPD'}
                </span>
              </div>
              <div className="text-sm font-bold text-clinical-teal-900 pl-5">
                {calculateEstimatedCompletion(selectedLabTest.turnaround, labUrgency, labCollectionDate)}
              </div>
              <p className="text-[11px] text-clinical-teal-800 pl-5">
                Calculated from specimen intake with {selectedLabTest.turnaround} lab incubation {labUrgency === 'URGENT' ? '(expedited priority)' : ''}.
              </p>

              {/* SMS Alert checkbox */}
              <div className="pt-2 border-t border-clinical-teal-200/60 pl-5 space-y-2">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notifySms}
                    onChange={(e) => setNotifySms(e.target.checked)}
                    className="mt-0.5 rounded border-clinical-teal-300 text-clinical-teal-600 focus:ring-clinical-teal-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-clinical-teal-950 block">
                      Send Real-time SMS & WhatsApp Alerts
                    </span>
                    <span className="text-[11px] text-clinical-teal-800 block">
                      Instant notifications for sample collection, lab analysis progress, and PDF report release.
                    </span>
                  </div>
                </label>

                {notifySms && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-semibold text-clinical-teal-900 shrink-0">Mobile Number:</span>
                    <input
                      type="tel"
                      value={notificationContact}
                      onChange={(e) => setNotificationContact(e.target.value)}
                      placeholder="e.g. 077 123 4567"
                      className="w-full max-w-xs p-1.5 text-xs bg-white border border-clinical-teal-300 rounded-md focus:ring-1 focus:ring-clinical-teal-500 font-mono"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Indication / Notes */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block text-[11px]">Clinical Indication / Symptoms</label>
              <input
                type="text"
                placeholder="e.g. Annual screening, doctor requested fasting check"
                value={labIndication}
                onChange={(e) => setLabIndication(e.target.value)}
                className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block text-[11px]">Payment Method</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLabPaymentMethod('PAYHERE')}
                  className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                    labPaymentMethod === 'PAYHERE'
                      ? 'border-clinical-teal-600 bg-clinical-teal-50 text-clinical-teal-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="h-4 w-4 mb-1 text-clinical-teal-600" />
                  <span className="block text-xs">PayHere Online</span>
                  <span className="text-[10px] text-slate-400 block">Instant Card Checkout</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLabPaymentMethod('BANK_RECEIPT')}
                  className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                    labPaymentMethod === 'BANK_RECEIPT'
                      ? 'border-clinical-teal-600 bg-clinical-teal-50 text-clinical-teal-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Upload className="h-4 w-4 mb-1 text-clinical-teal-600" />
                  <span className="block text-xs">Bank Transfer</span>
                  <span className="text-[10px] text-slate-400 block">Upload Deposit Receipt</span>
                </button>
              </div>
            </div>

            {/* Bank Transfer Receipt Upload Section */}
            {labPaymentMethod === 'BANK_RECEIPT' && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="font-semibold text-slate-800">Hospital Bank Details:</div>
                <div className="p-2 rounded bg-white border border-slate-200 font-mono text-[11px] space-y-0.5">
                  <div>Bank: Commercial Bank of Ceylon PLC</div>
                  <div>Account: PulseOS Diagnostics & Pathology Ltd</div>
                  <div>Acc No: 8009 2819 0293 &bull; Branch: Colombo City</div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500">UPLOAD TRANSFER RECEIPT / SLIP</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setLabReceiptFile(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-clinical-teal-50 file:text-clinical-teal-700 hover:file:bg-clinical-teal-100"
                  />
                  {labReceiptFile && (
                    <div className="flex items-center gap-2 mt-1 p-1 bg-emerald-50 rounded border border-emerald-200 text-emerald-800 text-[10px]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Receipt Attached & Ready for Submission</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500">TRANSFER REFERENCE NUMBER (OPTIONAL)</label>
                  <input
                    type="text"
                    placeholder="e.g. TXN982183921"
                    value={labReceiptRef}
                    onChange={(e) => setLabReceiptRef(e.target.value)}
                    className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            )}

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsLabOrderModalOpen(false)}
                className="apple-btn px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLabOrderSubmit}
                className="apple-btn px-5 py-2.5 rounded-lg bg-clinical-teal-600 hover:bg-clinical-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                <span>Confirm Lab Request</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Uploaded Receipt Modal */}
      {viewingReceiptImage && (
        <Modal
          isOpen={true}
          onClose={() => setViewingReceiptImage(null)}
          title="Bank Transfer Receipt"
          subtitle="Attached verification document for clinical investigation"
          maxWidth="md"
        >
          <div className="space-y-3">
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center p-2">
              <img
                src={viewingReceiptImage}
                alt="Bank Receipt"
                className="max-h-96 w-auto object-contain rounded"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setViewingReceiptImage(null)}
                className="apple-btn px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* PayHere Checkout Modal */}
      {payHereModalInvoice && (
        <Modal
          isOpen={true}
          onClose={() => {
            setPayHereModalInvoice(null);
            setPayHereErrorMessage(null);
          }}
          title="PayHere Sandbox Payment Gateway"
          subtitle={`Central Bank Authorized 3D-Secure Checkout for Invoice #${payHereModalInvoice.invoiceNumber}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs font-sans">
            {/* Merchant & Order Header */}
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center font-bold text-xs text-emerald-400 font-mono">
                    PH
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold tracking-tight text-white block">PAYHERE SECURE SANDBOX</span>
                    <span className="text-[10px] text-slate-400 font-mono">Merchant ID: 1235909 &bull; Domain: tekkeys.com &bull; App: hoda_leda</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  SANDBOX LIVE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-400 text-[10px] block font-mono">PAYABLE AMOUNT</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    LKR {Number(payHereModalInvoice.totalAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-right font-mono text-[11px] text-slate-300">
                  <span className="text-slate-500 text-[10px] block font-sans">ORDER / INVOICE REF</span>
                  <span className="font-bold text-white">#{payHereModalInvoice.invoiceNumber}</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">{patientSession.fullName}</span>
                </div>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setPayHereModalTab('GATEWAY')}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  payHereModalTab === 'GATEWAY'
                    ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>PayHere Live Gateway (Official Sandbox)</span>
              </button>
              <button
                type="button"
                onClick={() => setPayHereModalTab('SIMULATOR')}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  payHereModalTab === 'SIMULATOR'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                <span>POS Card Terminal (Hospital Desk)</span>
              </button>
            </div>

            {/* TAB 1: Real PayHere Sandbox Gateway */}
            {payHereModalTab === 'GATEWAY' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50/70 via-sky-50/40 to-slate-50 border border-emerald-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Real Central Bank Approved PayHere Sandbox Checkout</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Transactions initiated here are cryptographically hashed using <code className="font-mono text-emerald-800 bg-white px-1 py-0.5 rounded border border-emerald-200">MD5/SHA-256</code> with your Merchant Secret and submitted directly to PayHere’s secure sandbox servers. Every completed payment will immediately register on your <strong>PayHere Merchant Portal</strong> under <em>Sandbox Payments</em>.
                  </p>
                </div>

                {/* Test Cards Quick Reference Box with 1-click copy */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-slate-600" />
                      Official PayHere Sandbox Test Cards (Click to Copy):
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Expiry: 12/28 &bull; CVV: 123</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('4916217501611292');
                        setCopiedCard('VISA');
                        setTimeout(() => setCopiedCard(null), 2000);
                      }}
                      className="p-2.5 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-left transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-800 text-xs">Visa (Approved)</span>
                        <span className="text-[10px] font-mono font-bold text-blue-600 group-hover:underline flex items-center gap-1">
                          {copiedCard === 'VISA' ? (
                            'COPIED!'
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>COPY</span>
                            </>
                          )}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-700 block mt-1">4916 2175 0161 1292</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('5307732125531191');
                        setCopiedCard('MC');
                        setTimeout(() => setCopiedCard(null), 2000);
                      }}
                      className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 text-left transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-800 text-xs">Mastercard (Approved)</span>
                        <span className="text-[10px] font-mono font-bold text-amber-600 group-hover:underline flex items-center gap-1">
                          {copiedCard === 'MC' ? (
                            'COPIED!'
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>COPY</span>
                            </>
                          )}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-700 block mt-1">5307 7321 2553 1191</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('346781005510225');
                        setCopiedCard('AMEX');
                        setTimeout(() => setCopiedCard(null), 2000);
                      }}
                      className="p-2.5 rounded-lg border border-cyan-200 bg-cyan-50/60 hover:bg-cyan-100/70 text-left transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-cyan-800 text-xs">Amex (Approved)</span>
                        <span className="text-[10px] font-mono font-bold text-cyan-600 group-hover:underline flex items-center gap-1">
                          {copiedCard === 'AMEX' ? (
                            'COPIED!'
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>COPY</span>
                            </>
                          )}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-700 block mt-1">3467 8100 5510 225</span>
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {payHereErrorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">PayHere Gateway Notice</div>
                      <p className="text-[11px] mt-0.5">{payHereErrorMessage}</p>
                    </div>
                  </div>
                )}

                {/* Live Checkout Actions */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleLaunchPayHereRealCheckout(payHereModalInvoice, true)}
                    className="text-sky-700 hover:text-sky-900 text-xs font-semibold flex items-center gap-1.5 underline underline-offset-2"
                  >
                    <span>Or redirect to PayHere Hosted Checkout Page</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setPayHereModalInvoice(null);
                        setPayHereErrorMessage(null);
                      }}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={processingPayment}
                      onClick={() => handleLaunchPayHereRealCheckout(payHereModalInvoice, false)}
                      className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {processingPayment ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Connecting to PayHere...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4" />
                          <span>Launch PayHere Official Checkout</span>
                          <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Direct Hospital POS Card Terminal */}
            {payHereModalTab === 'SIMULATOR' && (
              <div className="space-y-3">
                {/* PayHere Test Cards Preset Selector */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-clinical-teal-600" />
                      Quick-Fill Card Information
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Click card to auto-fill</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectTestCard('VISA')}
                      className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                        payHereTestCardType === 'VISA'
                          ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-700 text-xs">Visa Test</span>
                        <span className="text-[9px] px-1 rounded bg-blue-100 text-blue-800 font-mono font-bold">READY</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-600 mt-1">4916 •••• •••• 1292</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectTestCard('MASTERCARD')}
                      className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                        payHereTestCardType === 'MASTERCARD'
                          ? 'border-amber-600 bg-amber-50/70 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-700 text-xs">MasterCard</span>
                        <span className="text-[9px] px-1 rounded bg-amber-100 text-amber-800 font-mono font-bold">READY</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-600 mt-1">5307 •••• •••• 1191</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectTestCard('AMEX')}
                      className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                        payHereTestCardType === 'AMEX'
                          ? 'border-cyan-600 bg-cyan-50/70 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-cyan-700 text-xs">Amex Test</span>
                        <span className="text-[9px] px-1 rounded bg-cyan-100 text-cyan-800 font-mono font-bold">READY</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-600 mt-1">3467 •••• ••• 0225</span>
                    </button>
                  </div>
                </div>

                {/* Test Simulation Scenario Selection */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="font-bold text-slate-700 block text-[11px]">
                    Card Processing Network Response (POS Sandbox Verification)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPayHereSimulationOutcome('SUCCESS');
                        setPayHereErrorMessage(null);
                      }}
                      className={`p-2 rounded-lg border text-center text-xs font-semibold transition-all ${
                        payHereSimulationOutcome === 'SUCCESS'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      ✓ Approved (2)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPayHereSimulationOutcome('DECLINE_FUNDS');
                        setPayHereErrorMessage(null);
                      }}
                      className={`p-2 rounded-lg border text-center text-xs font-semibold transition-all ${
                        payHereSimulationOutcome === 'DECLINE_FUNDS'
                          ? 'border-rose-600 bg-rose-50 text-rose-800 font-bold'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      ⚠️ Insufficient (-2)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPayHereSimulationOutcome('DECLINE_LIMIT');
                        setPayHereErrorMessage(null);
                      }}
                      className={`p-2 rounded-lg border text-center text-xs font-semibold transition-all ${
                        payHereSimulationOutcome === 'DECLINE_LIMIT'
                          ? 'border-rose-600 bg-rose-50 text-rose-800 font-bold'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      ❌ Limit Exceeded (-3)
                    </button>
                  </div>
                </div>

                {/* Interactive Card Inputs */}
                <div className="space-y-3 p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">CARD NUMBER</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={payHereCardNumber}
                        onChange={(e) => setPayHereCardNumber(e.target.value)}
                        className="w-full p-2.5 font-mono text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-clinical-teal-500 tracking-wider font-semibold"
                        placeholder="4916 2175 0161 1292"
                      />
                      <div className="absolute right-3 top-2.5">
                        <CreditCard className="h-5 w-5 text-clinical-teal-600" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">EXPIRATION (MM/YY)</label>
                      <input
                        type="text"
                        value={payHereExpiry}
                        onChange={(e) => setPayHereExpiry(e.target.value)}
                        className="w-full p-2.5 font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold"
                        placeholder="12/28"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">CVV / CVC</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={payHereCvv}
                        onChange={(e) => setPayHereCvv(e.target.value)}
                        className="w-full p-2.5 font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold tracking-widest"
                        placeholder="123"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">CARDHOLDER NAME</label>
                    <input
                      type="text"
                      value={payHereCardHolder}
                      onChange={(e) => setPayHereCardHolder(e.target.value)}
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 uppercase font-semibold"
                      placeholder="A. M. PERERA"
                    />
                  </div>
                </div>

                {/* Error Message if simulated decline */}
                {payHereErrorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Transaction Declined</div>
                      <p className="text-[11px] mt-0.5">{payHereErrorMessage}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons for Simulator */}
                <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setPayHereModalInvoice(null);
                      setPayHereErrorMessage(null);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={processingPayment}
                    onClick={() => handleSimulatePayHerePayment(payHereModalInvoice)}
                    className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {processingPayment ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Verifying 3D-Secure...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        <span>Authorize LKR {Number(payHereModalInvoice.totalAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })} (POS Terminal)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
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

      {/* Diagnostic Pathology Report Modal */}
      {selectedReportTest && (
        <DiagnosticReportModal
          test={selectedReportTest}
          onClose={() => setSelectedReportTest(null)}
        />
      )}

      {/* Selected Appointment Details Modal */}
      {selectedAppointment && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAppointment(null)}
          title={`Consultation Details: ${selectedAppointment.appointmentNumber || selectedAppointment.appointmentId || `APT-${selectedAppointment.id}`}`}
          subtitle={`Consultant: ${selectedAppointment.doctorName} (${selectedAppointment.specialization})`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">STATUS</span>
                <Badge
                  variant={
                    selectedAppointment.status === 'CONFIRMED'
                      ? 'success'
                      : selectedAppointment.status === 'SCHEDULED'
                      ? 'warning'
                      : selectedAppointment.status === 'COMPLETED'
                      ? 'neutral'
                      : 'emergency'
                  }
                >
                  {selectedAppointment.status}
                </Badge>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-mono">CONSULTATION FEE</span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  LKR {Number(selectedAppointment.consultationFee || 2500).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block">DATE</span>
                <span className="font-bold text-slate-800">{selectedAppointment.appointmentDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">TIME SLOT</span>
                <span className="font-bold text-slate-800">{selectedAppointment.appointmentTime}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">CLINIC ROOM</span>
                <span className="text-slate-800 font-semibold">{selectedAppointment.roomNumber || 'Room 204'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">SPECIALIST</span>
                <span className="text-slate-800 font-semibold">{selectedAppointment.doctorName}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                Clinical Reason for Visit:
              </span>
              <p className="text-slate-700 italic">
                "{selectedAppointment.reasonForVisit || 'Regular health follow-up and clinical consultation'}"
              </p>
            </div>

            {selectedAppointment.cancellationReason && (
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800">
                <span className="font-bold block text-[11px]">Cancellation Note:</span>
                <p className="text-xs mt-0.5">{selectedAppointment.cancellationReason}</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              {(selectedAppointment.status === 'SCHEDULED' ||
                selectedAppointment.status === 'CONFIRMED') ? (
                <button
                  type="button"
                  onClick={() => {
                    setCancellingAppointment(selectedAppointment);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors flex items-center gap-1.5"
                >
                  <Ban className="h-3.5 w-3.5" />
                  <span>Cancel Appointment</span>
                </button>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Appointment Confirmation Modal */}
      {cancellingAppointment && (
        <Modal
          isOpen={true}
          onClose={() => setCancellingAppointment(null)}
          title="Remove Consultation Booking"
          subtitle={`Are you sure you want to remove your appointment with ${cancellingAppointment.doctorName}?`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
              <span className="font-bold block text-xs">⚠️ Removal Notice:</span>
              <p className="text-[11px] text-amber-800">
                Removing this booking will free up the time slot on {cancellingAppointment.appointmentDate} at {cancellingAppointment.appointmentTime} for other waiting patients and delete it from the backend.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Reason for cancellation / removal (optional):
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Schedule conflict, feeling better, rescheduling later..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCancellingAppointment(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmCancelAppointment}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {isCancelling ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
                <span>Confirm Removal</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Profile Settings Modal */}
      {isEditProfileOpen && patientSession && (
        <ProfileSettingsModal
          isOpen={true}
          onClose={() => setIsEditProfileOpen(false)}
          patient={patientSession}
          onSuccess={(updatedPatient) => {
            updatePatientSession(updatedPatient);
          }}
        />
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        userName={patientSession ? `${patientSession.firstName} ${patientSession.lastName}` : 'Patient'}
        userEmail={patientSession?.email}
      />
    </div>
  );
};

export default PatientPortalView;
