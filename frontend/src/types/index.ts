// Roles matching the 5 hospital user profiles & SLIIT Team identities
export type UserRole =
  | 'DOCTOR'
  | 'RECEPTIONIST'
  | 'PHARMACIST'
  | 'LAB_TECHNICIAN'
  | 'CASHIER_ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  studentName: string;
  studentId: string;
  role: UserRole;
  roleTitle: string;
  department: string;
  email: string;
  avatarUrl?: string;
  featureBranch: string;
}

// Module IDs for navigation
export type ModuleId =
  | 'patients'
  | 'doctors'
  | 'appointments'
  | 'pharmacy'
  | 'billing'
  | 'laboratory';

// M1: Patient Entity & DTO
export type TriagePriority = 'EMERGENCY' | 'URGENT' | 'ROUTINE';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface Patient {
  id: number;
  patientId: string; // e.g. PAT-0001
  nicPassportNo: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  dob: string; // YYYY-MM-DD
  gender: Gender;
  bloodGroup: BloodGroup;
  contactNumber: string;
  email?: string;
  address: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  registrationDate: string;
  triagePriority: TriagePriority;
  allergies?: string;
  isArchived: boolean;
}

// M2: Doctor Entity & DTO
export interface Doctor {
  id: number;
  employeeId: string; // e.g. DOC-101
  licenseNo: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  specialization: string;
  departmentName: string;
  consultationFee: number;
  roomNumber: string;
  isAvailable: boolean;
  contactNumber: string;
  email: string;
  weeklySchedule?: string;
}

// M3: Appointment Entity & DTO
export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: number;
  appointmentId: string; // e.g. APT-2026-001
  patientId: number;
  patientName: string;
  patientNic: string;
  doctorId: number;
  doctorName: string;
  specialization: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm
  status: AppointmentStatus;
  reasonForVisit: string;
  roomNumber: string;
  createdAt: string;
}

// M4: Pharmacy & Inventory
export type DrugCategory =
  | 'Antibiotic'
  | 'Analgesic'
  | 'Antihypertensive'
  | 'Antidiabetic'
  | 'Antihistamine'
  | 'Cardiovascular'
  | 'Respiratory'
  | 'Gastrointestinal';

export interface Drug {
  id: number;
  drugId: string; // e.g. DRG-1001
  drugName: string;
  genericName: string;
  category: DrugCategory;
  dosageForm?: string; // Tablet, Syrup, Injection
  unitPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  batchNumber: string;
  expiryDate: string;
  supplierName?: string;
}

export interface PrescriptionItem {
  id?: number;
  drugId: number;
  drugName: string;
  dosageFrequency: string; // e.g., "1 tab TDS after meals"
  durationDays: number;
  prescribedQty: number;
  dispensedQty: number;
  unitPrice: number;
}

export interface Prescription {
  id: number;
  prescriptionId: string; // e.g. RX-2026-001
  appointmentId: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  prescriptionDate: string;
  doctorInstructions: string;
  status: 'PENDING' | 'DISPENSED' | 'CANCELLED';
  items: PrescriptionItem[];
}

// M5: Billing & Payments
export type InvoiceStatus = 'PENDING' | 'PAID' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'CARD' | 'PAYHERE';

export interface InvoiceItem {
  description: string;
  category: 'CONSULTATION' | 'PHARMACY' | 'LAB_TEST';
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Invoice {
  id: number;
  invoiceId: string; // e.g. INV-2026-001
  patientId: number;
  patientName: string;
  patientNic: string;
  appointmentId?: number;
  billingDate: string;
  doctorFee: number;
  pharmacyFee: number;
  labFee: number;
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  paymentMethod?: PaymentMethod;
  transactionRef?: string;
  paidAt?: string;
  items: InvoiceItem[];
}

export interface PayHereParams {
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  amount: string;
  currency: string;
  hash: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

// M6: Laboratory & Tests
export type LabTestStatus = 'REQUESTED' | 'SAMPLE_COLLECTED' | 'PROCESSING' | 'COMPLETED';

export interface LabTest {
  id: number;
  testId: string; // e.g. LAB-2026-001
  appointmentId: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  testName: string;
  category: string; // Hematology, Biochemistry, Immunology
  sampleType?: string; // Blood, Urine, Plasma
  standardFee: number;
  testDate: string;
  status: LabTestStatus;
  resultData?: string;
  referenceRange?: string;
  isAbnormal?: boolean;
  technicianNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

// Notification Toast
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastNotification {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}
