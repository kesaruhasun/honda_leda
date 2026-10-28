import {
  INITIAL_DOCTORS,
  INITIAL_SCHEDULES,
  INITIAL_PATIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_DRUGS,
  INITIAL_LAB_CATALOG,
  INITIAL_LAB_TESTS,
  INITIAL_INVOICES,
  INITIAL_WARDS,
  INITIAL_ADMISSIONS,
  INITIAL_NOTIFICATIONS,
  WardAdmission,
  WardInfo,
  NotificationLog,
} from './initialData';
import { Patient, Doctor, DoctorSchedule, Appointment, Drug, LabTest, Invoice } from '../../types';

const STORAGE_KEY = 'pulseos_demo_db_v1';

export interface DemoDatabase {
  doctors: Doctor[];
  schedules: DoctorSchedule[];
  patients: Patient[];
  appointments: Appointment[];
  drugs: Drug[];
  labCatalog: typeof INITIAL_LAB_CATALOG;
  labTests: LabTest[];
  invoices: Invoice[];
  wards: WardInfo[];
  admissions: WardAdmission[];
  notifications: NotificationLog[];
}

function getDefaultDatabase(): DemoDatabase {
  return {
    doctors: JSON.parse(JSON.stringify(INITIAL_DOCTORS)),
    schedules: JSON.parse(JSON.stringify(INITIAL_SCHEDULES)),
    patients: JSON.parse(JSON.stringify(INITIAL_PATIENTS)),
    appointments: JSON.parse(JSON.stringify(INITIAL_APPOINTMENTS)),
    drugs: JSON.parse(JSON.stringify(INITIAL_DRUGS)),
    labCatalog: JSON.parse(JSON.stringify(INITIAL_LAB_CATALOG)),
    labTests: JSON.parse(JSON.stringify(INITIAL_LAB_TESTS)),
    invoices: JSON.parse(JSON.stringify(INITIAL_INVOICES)),
    wards: JSON.parse(JSON.stringify(INITIAL_WARDS)),
    admissions: JSON.parse(JSON.stringify(INITIAL_ADMISSIONS)),
    notifications: JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS)),
  };
}

class MockStore {
  private db: DemoDatabase;

  constructor() {
    this.db = this.loadFromStorage();
  }

  private loadFromStorage(): DemoDatabase {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          // Quick validation to ensure required collections exist
          if (Array.isArray(parsed.patients) && Array.isArray(parsed.doctors)) {
            return parsed;
          }
        }
      }
    } catch {
      // Storage access may fail in restricted environments
    }
    const fresh = getDefaultDatabase();
    this.saveToStorage(fresh);
    return fresh;
  }

  private saveToStorage(db: DemoDatabase): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
      }
    } catch {
      // Ignore quota/access errors
    }
  }

  private persist(): void {
    this.saveToStorage(this.db);
  }

  public reset(): void {
    this.db = getDefaultDatabase();
    this.persist();
  }

  // --- Patients ---
  public getPatients(): Patient[] {
    return [...this.db.patients];
  }

  public getPatientById(id: number): Patient | undefined {
    return this.db.patients.find((p) => p.id === id);
  }

  public getPatientByNic(nic: string): Patient | undefined {
    const clean = nic.trim().toLowerCase();
    return this.db.patients.find(
      (p) =>
        p.nicPassportNo.toLowerCase() === clean ||
        (p.email && p.email.toLowerCase() === clean) ||
        (p.phoneNumber && p.phoneNumber.replace(/\s+/g, '') === clean)
    );
  }

  public savePatient(patientData: Partial<Patient>): Patient {
    const existingIndex = patientData.id
      ? this.db.patients.findIndex((p) => p.id === patientData.id)
      : -1;

    if (existingIndex >= 0) {
      const updated: Patient = {
        ...this.db.patients[existingIndex],
        ...patientData,
        fullName:
          patientData.fullName ||
          `${patientData.firstName || this.db.patients[existingIndex].firstName} ${
            patientData.lastName || this.db.patients[existingIndex].lastName
          }`.trim(),
      };
      this.db.patients[existingIndex] = updated;
      this.persist();
      return updated;
    } else {
      const newId = this.db.patients.length > 0
        ? Math.max(...this.db.patients.map((p) => p.id)) + 1
        : 1;
      const newPatient: Patient = {
        id: newId,
        patientId: `PAT-2026-${String(newId).padStart(3, '0')}`,
        nicPassportNo: patientData.nicPassportNo || `TEMP-${Date.now().toString().slice(-6)}`,
        firstName: patientData.firstName || 'Patient',
        lastName: patientData.lastName || '',
        fullName:
          patientData.fullName ||
          `${patientData.firstName || 'Patient'} ${patientData.lastName || ''}`.trim(),
        dob: patientData.dob || patientData.dateOfBirth || '2000-01-01',
        dateOfBirth: patientData.dateOfBirth || patientData.dob || '2000-01-01',
        gender: patientData.gender || 'OTHER',
        bloodGroup: patientData.bloodGroup || 'O+',
        contactNumber: patientData.contactNumber || patientData.phoneNumber || '+94770000000',
        phoneNumber: patientData.phoneNumber || patientData.contactNumber || '+94770000000',
        address: patientData.address || '',
        email: patientData.email || '',
        emergencyContactName: patientData.emergencyContactName || 'Family Member',
        emergencyContactRelationship: patientData.emergencyContactRelationship || 'Relative',
        emergencyContactPhone: patientData.emergencyContactPhone || '+94770000000',
        triagePriority: patientData.triagePriority || 'ROUTINE',
        allergies: patientData.allergies || 'None',
        registrationDate: new Date().toISOString().split('T')[0],
        isArchived: false,
        medicalNotes: patientData.medicalNotes || '',
        vitalsHeartRate: patientData.vitalsHeartRate || 72,
        vitalsBloodPressure: patientData.vitalsBloodPressure || '120/80 mmHg',
        vitalsSpO2: patientData.vitalsSpO2 || 98,
        vitalsTemperature: patientData.vitalsTemperature || '36.7 °C',
      };
      this.db.patients.unshift(newPatient);
      this.persist();
      return newPatient;
    }
  }

  public archivePatient(id: number, reason?: string): Patient | undefined {
    const patient = this.db.patients.find((p) => p.id === id);
    if (patient) {
      patient.isArchived = true;
      if (reason) {
        patient.medicalNotes = `[ARCHIVED: ${reason}] ${patient.medicalNotes || ''}`;
      }
      this.persist();
    }
    return patient;
  }

  public restorePatient(id: number): Patient | undefined {
    const patient = this.db.patients.find((p) => p.id === id);
    if (patient) {
      patient.isArchived = false;
      this.persist();
    }
    return patient;
  }

  // --- Doctors ---
  public getDoctors(): Doctor[] {
    return [...this.db.doctors];
  }

  public getDoctorById(id: number): Doctor | undefined {
    return this.db.doctors.find((d) => d.id === id);
  }

  public toggleDoctorAvailability(id: number, isAvailable: boolean): Doctor | undefined {
    const doctor = this.db.doctors.find((d) => d.id === id);
    if (doctor) {
      doctor.isAvailable = isAvailable;
      this.persist();
    }
    return doctor;
  }

  public updateDoctorFee(id: number, fee: number): Doctor | undefined {
    const doctor = this.db.doctors.find((d) => d.id === id);
    if (doctor) {
      doctor.consultationFee = fee;
      this.persist();
    }
    return doctor;
  }

  public getDoctorSchedules(doctorId: number): DoctorSchedule[] {
    return this.db.schedules.filter((s) => s.doctorId === doctorId);
  }

  public addDoctorSchedule(doctorId: number, schedule: Partial<DoctorSchedule>): DoctorSchedule {
    const newId = this.db.schedules.length > 0
      ? Math.max(...this.db.schedules.map((s) => s.id)) + 1
      : 1;
    const newSchedule: DoctorSchedule = {
      id: newId,
      doctorId,
      dayOfWeek: schedule.dayOfWeek || 'MONDAY',
      startTime: schedule.startTime || '09:00',
      endTime: schedule.endTime || '13:00',
      maxPatients: schedule.maxPatients || 20,
      slotDurationMinutes: schedule.slotDurationMinutes || 15,
      isActive: true,
    };
    this.db.schedules.push(newSchedule);
    this.persist();
    return newSchedule;
  }

  public deleteDoctorSchedule(scheduleId: number): void {
    this.db.schedules = this.db.schedules.filter((s) => s.id !== scheduleId);
    this.persist();
  }

  // --- Appointments ---
  public getAppointments(): Appointment[] {
    return [...this.db.appointments];
  }

  public getTodayAppointments(): Appointment[] {
    const today = new Date().toISOString().split('T')[0];
    return this.db.appointments.filter((a) => a.appointmentDate === today);
  }

  public createAppointment(data: {
    patientId: number;
    doctorId: number;
    appointmentDate: string;
    appointmentTime: string;
    reasonForVisit: string;
  }): Appointment {
    const patient = this.getPatientById(data.patientId);
    const doctor = this.getDoctorById(data.doctorId);

    const newId = this.db.appointments.length > 0
      ? Math.max(...this.db.appointments.map((a) => a.id)) + 1
      : 1;

    const apt: Appointment = {
      id: newId,
      appointmentId: `APT-2026-${String(newId).padStart(3, '0')}`,
      appointmentNumber: `APT-2026-${String(newId).padStart(3, '0')}`,
      patientId: data.patientId,
      patientName: patient?.fullName || `Patient #${data.patientId}`,
      patientNic: patient?.nicPassportNo || '',
      doctorId: data.doctorId,
      doctorName: doctor?.fullName || `Doctor #${data.doctorId}`,
      specialization: doctor?.specialization || 'General OPD',
      appointmentDate: data.appointmentDate,
      appointmentTime: data.appointmentTime,
      status: 'CONFIRMED',
      reasonForVisit: data.reasonForVisit || 'Routine Consultation',
      roomNumber: doctor?.roomNumber || 'Room A-101',
      consultationFee: doctor?.consultationFee || 3000.0,
      createdAt: new Date().toISOString(),
    };

    this.db.appointments.unshift(apt);

    // Also auto-generate an invoice in PENDING status
    const invId = this.db.invoices.length > 0
      ? Math.max(...this.db.invoices.map((i) => i.id)) + 1
      : 1;
    const inv: Invoice = {
      id: invId,
      invoiceId: `INV-2026-${String(invId).padStart(4, '0')}`,
      invoiceNumber: `INV-2026-${String(invId).padStart(4, '0')}`,
      patientId: data.patientId,
      patientName: patient?.fullName || `Patient #${data.patientId}`,
      patientNic: patient?.nicPassportNo || '',
      appointmentId: newId,
      billingDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      doctorFee: doctor?.consultationFee || 3000.0,
      consultationFee: doctor?.consultationFee || 3000.0,
      doctorName: doctor?.fullName || 'Doctor',
      pharmacyFee: 0.0,
      pharmacyTotal: 0.0,
      labFee: 0.0,
      labTotal: 0.0,
      taxAmount: 0.0,
      discountAmount: 0.0,
      totalAmount: doctor?.consultationFee || 3000.0,
      netAmount: doctor?.consultationFee || 3000.0,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      items: [
        {
          type: 'CONSULTATION',
          description: `Consultation - ${doctor?.fullName || 'Doctor'} (${doctor?.specialization || 'OPD'})`,
          unitPrice: doctor?.consultationFee || 3000.0,
          quantity: 1,
          subtotal: doctor?.consultationFee || 3000.0,
        },
      ],
    };
    this.db.invoices.unshift(inv);

    this.persist();
    return apt;
  }

  public rescheduleAppointment(id: number, date: string, time: string): Appointment | undefined {
    const apt = this.db.appointments.find((a) => a.id === id);
    if (apt) {
      apt.appointmentDate = date;
      apt.appointmentTime = time;
      apt.status = 'CONFIRMED';
      this.persist();
    }
    return apt;
  }

  public cancelAppointment(id: number, reason: string): Appointment | undefined {
    const apt = this.db.appointments.find((a) => a.id === id);
    if (apt) {
      apt.status = 'CANCELLED';
      apt.cancellationReason = reason;
      this.persist();
    }
    return apt;
  }

  public completeAppointment(id: number): Appointment | undefined {
    const apt = this.db.appointments.find((a) => a.id === id);
    if (apt) {
      apt.status = 'COMPLETED';
      this.persist();
    }
    return apt;
  }

  // --- Pharmacy ---
  public getDrugs(): Drug[] {
    return [...this.db.drugs];
  }

  public getLowStockDrugs(): Drug[] {
    return this.db.drugs.filter((d) => (d.currentStock ?? d.stockQuantity ?? 0) <= d.reorderLevel);
  }

  public dispenseDrug(payload: {
    prescriptionId?: number;
    items?: Array<{ drugId: number; quantity: number }>;
  }): { message: string } {
    if (payload.items) {
      for (const item of payload.items) {
        const drug = this.db.drugs.find((d) => d.id === item.drugId);
        if (drug) {
          const current = drug.currentStock ?? drug.stockQuantity ?? 0;
          const updated = Math.max(0, current - item.quantity);
          drug.currentStock = updated;
          drug.stockQuantity = updated;
          drug.isLowStock = updated <= drug.reorderLevel;
        }
      }
      this.persist();
    }
    return { message: 'Medication successfully dispensed and stock levels decremented.' };
  }

  // --- Laboratory ---
  public getLabCatalog(): typeof INITIAL_LAB_CATALOG {
    return [...this.db.labCatalog];
  }

  public getLabTests(): LabTest[] {
    return [...this.db.labTests];
  }

  public orderLabTest(payload: {
    patientId: number;
    doctorId?: number;
    testCatalogId?: number;
    urgency?: string;
    clinicalIndication?: string;
  }): LabTest {
    const patient = this.getPatientById(payload.patientId);
    const catalogItem = this.db.labCatalog.find((c) => c.id === payload.testCatalogId) || this.db.labCatalog[0];
    const doctor = payload.doctorId ? this.getDoctorById(payload.doctorId) : this.db.doctors[0];

    const newId = this.db.labTests.length > 0
      ? Math.max(...this.db.labTests.map((t) => t.id)) + 1
      : 1;

    const test: LabTest = {
      id: newId,
      testId: `LAB-2026-${String(newId).padStart(3, '0')}`,
      requestNumber: `REQ-2026-${String(9000 + newId)}`,
      testCode: catalogItem.testCode,
      patientId: payload.patientId,
      patientName: patient?.fullName || `Patient #${payload.patientId}`,
      doctorId: doctor?.id || 1,
      doctorName: doctor?.fullName || 'Physician',
      testName: catalogItem.testName,
      category: catalogItem.category,
      urgency: payload.urgency || 'ROUTINE',
      sampleType: catalogItem.sampleType,
      standardFee: catalogItem.standardFee,
      testDate: new Date().toISOString().split('T')[0],
      status: 'REQUESTED',
      referenceRange: catalogItem.referenceRange,
      clinicalIndication: payload.clinicalIndication || 'Clinical survey',
      remarks: 'Lab requisition created and dispatched to phlebotomy.',
      isAbnormal: false,
    };

    this.db.labTests.unshift(test);
    this.persist();
    return test;
  }

  public updateLabTestStatus(testId: number, status: string): LabTest | undefined {
    const test = this.db.labTests.find((t) => t.id === testId);
    if (test) {
      test.status = status;
      this.persist();
    }
    return test;
  }

  public submitLabResults(
    testId: number,
    payload: {
      resultValue?: number;
      resultData: string;
      isAbnormal: boolean;
      clinicalRemarks?: string;
      technicianNotes?: string;
    }
  ): LabTest | undefined {
    const test = this.db.labTests.find((t) => t.id === testId);
    if (test) {
      test.status = 'COMPLETED';
      test.resultValue = payload.resultValue;
      test.resultData = payload.resultData;
      test.isAbnormal = payload.isAbnormal;
      test.flag = payload.isAbnormal ? 'ABNORMAL' : 'NORMAL';
      test.remarks = payload.clinicalRemarks || test.remarks;
      test.technicianNotes = payload.technicianNotes || 'Verified on automated diagnostics platform.';
      test.conductionDate = new Date().toISOString().split('T')[0];
      test.verifiedBy = 'Dr. Senaka Bandara';
      test.verifiedAt = new Date().toISOString();
      this.persist();
    }
    return test;
  }

  // --- Billing ---
  public getInvoices(): Invoice[] {
    return [...this.db.invoices];
  }

  public settleInvoice(
    invoiceId: number,
    paymentMethod: 'CASH' | 'CARD' | 'PAYHERE' = 'CARD',
    transactionRef?: string
  ): Invoice | undefined {
    const inv = this.db.invoices.find((i) => i.id === invoiceId || i.invoiceNumber === `INV-${invoiceId}`);
    if (inv) {
      inv.status = 'PAID';
      inv.paymentStatus = 'PAID';
      inv.paymentMethod = paymentMethod;
      inv.paidAt = new Date().toISOString();
      inv.transactionRef = transactionRef || `RCPT-2026-${Date.now().toString().slice(-5)}`;
      this.persist();
    }
    return inv;
  }

  // --- Wards ---
  public getWards(): WardInfo[] {
    return [...this.db.wards];
  }

  public getAdmissions(): WardAdmission[] {
    return [...this.db.admissions];
  }

  // --- Notifications ---
  public getNotifications(): NotificationLog[] {
    return [...this.db.notifications];
  }

  // --- Landing Stats ---
  public getStats() {
    return {
      activeDoctorsCount: this.db.doctors.filter((d) => d.isAvailable).length,
      departmentsCount: 7,
      satisfiedPatientsCount: 1420 + this.db.patients.length,
      testsAvailableCount: this.db.labCatalog.length,
      featuredSpecialties: ['Cardiology', 'General Surgery', 'Internal Medicine', 'Pediatrics', 'Neurology'],
    };
  }
}

export const mockStore = new MockStore();
