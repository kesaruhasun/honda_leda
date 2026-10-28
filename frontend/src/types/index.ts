// PulseOS Core Domain Types & DTOs

export type UserRole = 'DOCTOR' | 'RECEPTIONIST' | 'PHARMACIST' | 'LAB_TECHNICIAN' | 'CASHIER_ADMIN';

export type AppViewMode = 'landing' | 'patient_portal' | 'clinical_dashboard';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  department: string;
  email: string;
}

export type ModuleId = 'patients' | 'doctors' | 'appointments' | 'pharmacy' | 'billing' | 'laboratory' | 'doctor' | 'manager' | 'pharmacist';

// M1: Patient Entity & DTO
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type TriagePriority = 'EMERGENCY' | 'URGENT' | 'ROUTINE';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface Patient {
  id: number;
  patientId: string; // e.g. PAT-2026-001
  nicPassportNo: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  dob: string; // YYYY-MM-DD
  gender: Gender;
  bloodGroup: BloodGroup;
  contactNumber: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  triagePriority: TriagePriority;
  allergies?: string;
  registrationDate: string;
  isArchived: boolean;
  address?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  medicalNotes?: string;
  vitalsHeartRate?: number;
  vitalsBloodPressure?: string;
  vitalsSpO2?: number;
  vitalsTemperature?: string;
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
  departmentName?: string;
  consultationFee: number;
  roomNumber: string;
  isAvailable: boolean;
  contactNumber?: string;
  email?: string;
  weeklySchedule?: string;
}

// M3: Appointment Entity & DTO
export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: number;
  appointmentId?: string; // e.g. APT-2026-001
  appointmentNumber?: string;
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
  consultationFee?: number;
  cancellationReason?: string;
  createdAt?: string;
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
  drugId?: string | number;
  itemCode?: string;
  drugCode?: string;
  drugName?: string;
  brandName?: string;
  genericName?: string;
  category?: DrugCategory | string;
  dosageForm?: string;
  strength?: string;
  unitPrice: number;
  stockQuantity?: number;
  currentStock?: number;
  reorderLevel: number;
  batchNumber?: string;
  expiryDate?: string;
  supplierName?: string;
  manufacturer?: string;
  isLowStock?: boolean;
  isExpired?: boolean;
}

export interface PrescriptionItem {
  id?: number;
  drugId?: number;
  drugName?: string;
  dosage?: string;
  frequency?: string;
  dosageFrequency?: string;
  durationDays?: number;
  prescribedQuantity?: number;
  prescribedQty?: number;
  dispensedQuantity?: number;
  dispensedQty?: number;
  isDispensed?: boolean;
  unitPrice?: number;
  instructions?: string;
}

export interface Prescription {
  id: number;
  prescriptionId?: string | number;
  prescriptionNumber?: string;
  appointmentId?: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName?: string;
  prescribedDoctorName?: string;
  prescriptionDate?: string;
  issuedDate?: string;
  doctorInstructions?: string;
  notes?: string;
  status?: 'PENDING' | 'DISPENSED' | 'CANCELLED' | string;
  dispensed?: boolean;
  dispensedDate?: string;
  drugName?: string;
  dosage?: string;
  frequency?: string;
  durationDays?: number;
  quantity?: number;
  instructions?: string;
  items?: PrescriptionItem[];
  invoiceId?: number;
  invoiceNumber?: string;
  totalAmount?: number;
  paymentStatus?: string;
  isPaid?: boolean;
}

export interface DispenseResponse {
  message?: string;
  prescription?: Prescription;
}

// M5: Billing & Payments
export type InvoiceStatus = 'PENDING' | 'PAID' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'CARD' | 'PAYHERE';

export interface InvoiceItem {
  type?: string;
  description?: string;
  category?: 'CONSULTATION' | 'PHARMACY' | 'LAB_TEST' | string;
  unitPrice?: number;
  quantity?: number;
  subtotal?: number;
  totalPrice?: number;
}

export interface Invoice {
  id: number;
  invoiceId?: string | number;
  invoiceNumber: string;
  patientId: number;
  patientName: string;
  patientNic: string;
  appointmentId?: number;
  billingDate?: string;
  createdAt?: string;
  doctorFee?: number;
  consultationFee?: number;
  doctorName?: string;
  pharmacyFee?: number;
  pharmacyTotal?: number;
  labFee?: number;
  labTotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  netAmount?: number;
  status: InvoiceStatus | string;
  paymentStatus?: string;
  paymentMethod?: PaymentMethod | string;
  transactionRef?: string;
  paidAt?: string;
  items?: InvoiceItem[];
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
export type LabTestStatus = 'REQUESTED' | 'SAMPLE_COLLECTED' | 'PROCESSING' | 'COMPLETED' | 'COLLECTED';

export interface LabTest {
  id: number;
  testId?: string | number;
  requestNumber?: string;
  testCode?: string;
  appointmentId?: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  labTestId?: number;
  testName: string;
  category?: string;
  urgency?: string;
  sampleType?: string;
  specimenType?: string;
  standardFee?: number;
  testDate?: string;
  status: LabTestStatus | string;
  resultValue?: number;
  resultData?: string;
  flag?: string;
  referenceRange?: string;
  unit?: string;
  remarks?: string;
  isAbnormal?: boolean;
  clinicalIndication?: string;
  receiptImage?: string;
  receiptRef?: string;
  technicianNotes?: string;
  technicianName?: string;
  conductionDate?: string;
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

// M7: Doctor Schedule & Rostering
export interface DoctorSchedule {
  id: number;
  doctorId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  maxPatients?: number;
  slotDurationMinutes?: number;
  isActive?: boolean;
}

// M8: Authentication & Security
export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  role: string;
  firstName: string;
  lastName: string;
  department?: string;
}

export interface CurrentUserResponse {
  id: number;
  username: string;
  role: string;
  firstName: string;
  lastName: string;
  doctorId?: number;
  patientId?: number;
}
