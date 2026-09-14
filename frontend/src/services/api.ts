import axios, { AxiosError } from 'axios';
import {
  Patient,
  Doctor,
  DoctorSchedule,
  Appointment,
  Drug,
  Prescription,
  Invoice,
  LabTest,
  PayHereParams,
} from '../types';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Response interceptor for clean error extraction
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    const errorMsg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';
    const customError: any = new Error(errorMsg);
    customError.response = error.response;
    customError.status = error.response?.status;
    return Promise.reject(customError);
  }
);

// M1: Patients API
export const patientApi = {
  getAll: () => api.get<Patient[]>('/patients'),
  getById: (id: number) => api.get<Patient>(`/patients/${id}`),
  getByNic: (nic: string) => api.get<Patient>(`/patients/nic/${encodeURIComponent(nic)}`),
  search: (query: string) => api.get<Patient[]>(`/patients/search?q=${encodeURIComponent(query)}`),
  create: (patient: Partial<Patient>) => api.post<Patient>('/patients', patient),
  update: (id: number, patient: Partial<Patient>) => api.put<Patient>(`/patients/${id}`, patient),
  archive: (id: number) => api.patch<void>(`/patients/${id}/archive`),
};

// M2: Doctors API
export const doctorApi = {
  create: (data: Partial<Doctor>) => api.post<Doctor>("/doctors", data),
  getAll: () => api.get<Doctor[]>('/doctors'),
  getById: (id: number) => api.get<Doctor>(`/doctors/${id}`),
  getSchedules: (doctorId: number) => api.get<DoctorSchedule[]>(`/doctors/${doctorId}/schedules`),
  toggleAvailability: (id: number, isAvailable: boolean) =>
    api.patch<Doctor>(`/doctors/${id}/availability`, { isAvailable }),
  updateFee: (id: number, consultationFee: number) =>
    api.patch<Doctor>(`/doctors/${id}/fee`, { consultationFee }),
};

// M3: Appointments API
export const appointmentApi = {
  getAll: () => api.get<Appointment[]>('/appointments'),
  getToday: () => api.get<Appointment[]>('/appointments/today'),
  create: (appointment: {
    patientId: number;
    doctorId: number;
    appointmentDate: string;
    appointmentTime: string;
    reasonForVisit: string;
  }) => api.post<Appointment>('/appointments', appointment),
  reschedule: (id: number, date: string, time: string) =>
    api.patch<Appointment>(`/appointments/${id}/reschedule`, { appointmentDate: date, appointmentTime: time }),
  cancel: (id: number, reason: string) =>
    api.patch<Appointment>(`/appointments/${id}/cancel`, { reason }),
  complete: (id: number) =>
    api.patch<Appointment>(`/appointments/${id}/complete`),
};

// M4: Pharmacy API
export const pharmacyApi = {
  getDrugs: () => api.get<Drug[]>('/pharmacy/drugs'),
  getLowStock: () => api.get<Drug[]>('/pharmacy/drugs/low-stock'),
  getPrescriptions: () => api.get<Prescription[]>('/pharmacy/prescriptions'),
  createPrescription: (data: any) => api.post<Prescription>('/pharmacy/prescriptions', data),
  dispensePrescription: (prescriptionId: number) =>
    api.post<Prescription>(`/pharmacy/prescriptions/${prescriptionId}/dispense`),
  addShipment: (drug: Partial<Drug>) => api.post<Drug>('/pharmacy/drugs', drug),
};

// M5: Billing & Payments API
export const billingApi = {
  getInvoices: () => api.get<Invoice[]>('/billing/invoices'),
  getInvoiceById: (id: number) => api.get<Invoice>(`/billing/invoices/${id}`),
  generateInvoice: (appointmentId: number) =>
    api.post<Invoice>('/billing/invoices/generate', { appointmentId }),
  initiatePayHere: (invoiceId: number) =>
    api.get<PayHereParams>(`/payments/payhere/initiate?invoiceId=${invoiceId}`),
  settleCashCard: (invoiceId: number, paymentMethod: 'CASH' | 'CARD', transactionRef?: string) =>
    api.post<Invoice>(`/billing/invoices/${invoiceId}/settle`, {
      paymentMethod,
      transactionRef: transactionRef || `COUNTER-${Date.now()}`,
    }),
};

// M6: Laboratory API
export const labApi = {
  getTests: () => api.get<LabTest[]>('/laboratory/tests'),
  getCatalog: () => api.get<any[]>('/laboratory/catalog'),
  orderTest: (payload: {
    patientId: number;
    doctorId?: number;
    appointmentId?: number;
    labTestId?: number;
    testCatalogId?: number;
    urgency?: string;
    clinicalIndication?: string;
  }) => api.post<LabTest>('/laboratory/tests', payload),
  updateStatus: (testId: number, status: string) =>
    api.patch<LabTest>(`/laboratory/tests/${testId}/status`, { status }),
  submitResults: (
    testId: number,
    payload: {
      resultValue?: number;
      resultData: string;
      isAbnormal: boolean;
      clinicalRemarks?: string;
      technicianNotes?: string;
    }
  ) => api.post<LabTest>(`/laboratory/tests/${testId}/results`, payload),
  deleteTest: (testId: number) => api.delete<void>(`/laboratory/tests/${testId}`),
};

export default api;
