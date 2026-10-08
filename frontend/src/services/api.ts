import axios, { AxiosError } from 'axios';
import {
  Patient,
  Doctor,
  DoctorSchedule,
  Appointment,
  Drug,
  Prescription,
  DispenseResponse,
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

// Request interceptor to attach JWT token if present
api.interceptors.request.use((config) => {
  try {
    // Skip attaching Authorization header for public endpoints like login
    const isPublic = config.url?.includes('/auth/login') || (config.url === '/patients' && config.method?.toLowerCase() === 'post');
    if (!isPublic) {
      const token =
        (typeof localStorage !== 'undefined' && localStorage.getItem('token')) ||
        (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('token'));
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    // Ignore restricted iframe storage errors
  }
  return config;
});

// Response interceptor for clean error extraction
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const msg = String(error.response?.data?.message || '').toLowerCase();
      if (msg.includes('expired') || msg.includes('token') || msg.includes('unauthorized')) {
        try {
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
        } catch {}
      }
    }
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
  archive: (id: number, reason?: string) => api.post<Patient>(`/patients/${id}/archive`, { reason }),
  restore: (id: number) => api.post<Patient>(`/patients/${id}/restore`),
  getArchived: () => api.get<any[]>('/patients/archived'),
};

// M2: Doctors API
export const doctorApi = {
  create: (data: Partial<Doctor>) => api.post<Doctor>("/doctors", data),
  getAll: () => api.get<Doctor[]>('/doctors'),
  getById: (id: number) => api.get<Doctor>(`/doctors/${id}`),
  getSchedules: (doctorId: number) => api.get<DoctorSchedule[]>(`/doctors/${doctorId}/schedules`),
  toggleAvailability: (id: number, isAvailable: boolean) =>
    api.patch<Doctor>(`/doctors/${id}/availability`, { isAvailable }),
  updateProfile: (id: number, data: Partial<Doctor>) =>
    api.put<Doctor>(`/doctors/${id}`, data),

  updateFee: (id: number, consultationFee: number) =>
    api.patch<Doctor>(`/doctors/${id}/fee`, { consultationFee }),

  addSchedule: (doctorId: number, schedule: Partial<DoctorSchedule>) =>
    api.post<DoctorSchedule>(`/doctors/${doctorId}/schedules`, schedule),

  deleteSchedule: (doctorId: number, scheduleId: number) =>
    api.delete<void>(`/doctors/${doctorId}/schedules/${scheduleId}`),

  deleteDoctor: (id: number) =>
    api.delete<void>(`/doctors/${id}`),
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
  delete: (id: number) =>
    api.delete<void>(`/appointments/${id}`),
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
    api.post<DispenseResponse>(`/pharmacy/prescriptions/${prescriptionId}/dispense`),
  addShipment: (drug: Partial<Drug>) => api.post<Drug>('/pharmacy/drugs', drug),
  updateDrug: (id: number, drug: Partial<Drug>) => api.put<Drug>(`/pharmacy/drugs/${id}`, drug),
  deleteDrug: (id: number) => api.delete<void>(`/pharmacy/drugs/${id}`),
};

// M5: Billing & Payments API
export const billingApi = {
  getInvoices: () => api.get<Invoice[]>('/billing/invoices'),
  getInvoiceById: (id: number) => api.get<Invoice>(`/billing/invoices/${id}`),
  generateInvoice: (
    payload:
      | number
      | {
          appointmentId?: number;
          patientId?: number;
          totalAmount?: number;
          amount?: number;
          pharmacyFee?: number;
          labFee?: number;
          discountAmount?: number;
          paymentStatus?: string;
        }
  ) => {
    const body = typeof payload === 'number' ? { appointmentId: payload } : payload;
    return api.post<Invoice>('/billing/invoices/generate', body);
  },
  cancelInvoice: (id: number) => api.delete<Invoice>(`/billing/invoices/${id}`),
  initiatePayHere: (invoiceId: number) =>
    api.get<PayHereParams>(`/payments/payhere/initiate?invoiceId=${invoiceId}`),
  payInvoice: (id: number, paymentMethod: 'CASH' | 'CARD' = 'CARD', transactionRef?: string) =>
    api.post<Invoice>(`/billing/invoices/${id}/pay`, {
      paymentMethod,
      transactionRef: transactionRef || `PAY-${Date.now()}`,
    }),
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

// Auth API
export const authApi = {
  login: (credentials: { username: string; password?: string }) =>
    api.post<{
      token: string;
      tokenType: string;
      userId: number;
      username: string;
      fullName: string;
      role: string;
      userType: string;
      department?: string;
      roleTitle?: string;
    }>('/auth/login', credentials),
  getMe: () =>
    api.get<{
      userId: number;
      username: string;
      fullName: string;
      role: string;
      userType: string;
      department?: string;
      roleTitle?: string;
    }>('/auth/me'),
};

// Dynamic Landing Page API
export const landingApi = {
  getStats: () =>
    api.get<{
      activeDoctorsCount: number;
      departmentsCount: number;
      satisfiedPatientsCount: number;
      testsAvailableCount: number;
      featuredSpecialties: string[];
    }>('/landing/stats'),
  getDoctors: () =>
    api.get<Array<{
      id: number;
      fullName: string;
      specialization: string;
      roomNumber: string;
      consultationFee: number;
      isAvailable: boolean;
    }>>('/landing/doctors'),
  getLabTests: () => api.get<any[]>('/landing/lab-tests'),
};

// Calendar API
export const calendarApi = {
  getCalendar: (role: 'PATIENT' | 'DOCTOR' | 'MANAGER', params?: { patientId?: number; doctorId?: number }) => {
    let url = `/appointments/calendar?role=${role}`;
    if (params?.patientId) url += `&patientId=${params.patientId}`;
    if (params?.doctorId) url += `&doctorId=${params.doctorId}`;
    return api.get<any>(url);
  },
};

// Notifications Audit API
export const notificationsApi = {
  getAll: (params?: { eventType?: string; recipientEmail?: string; referenceId?: string }) => {
    let url = '/notifications';
    const query = new URLSearchParams();
    if (params?.eventType) query.append('eventType', params.eventType);
    if (params?.recipientEmail) query.append('recipientEmail', params.recipientEmail);
    if (params?.referenceId) query.append('referenceId', params.referenceId);
    const qs = query.toString();
    if (qs) url += `?${qs}`;
    return api.get<any[]>(url);
  },
};

// M7: Wards & Bed Management API
export const wardApi = {
  getAll: () => api.get<any[]>('/wards'),
  getById: (id: number) => api.get<any>(`/wards/${id}`),
  getActiveAdmissions: () => api.get<any[]>('/wards/admissions'),
  getByWardAdmissions: (wardId: number) => api.get<any[]>(`/wards/${wardId}/admissions`),
  admitPatient: (data: { patientId: number; wardId: number; bedNumber?: string }) =>
    api.post<any>('/wards/admissions', data),
  dischargePatient: (admissionId: number) =>
    api.post<any>(`/wards/admissions/${admissionId}/discharge`),
};

export default api;
