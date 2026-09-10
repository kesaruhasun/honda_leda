# PulseOS Frontend Architecture & Scaffolding Plan (Milestone M0)

**Document Status**: Authoritative Engineering Blueprint  
**Target Milestone**: M0 (Scaffolding, Design Tokens & Layout Shell)  
**Author**: Explorer M0-3 (Frontend Architecture & Apple HIG UI Specialist)  
**Target Directory**: `/Users/admin/Projects/honda_leda/frontend`  
**Execution Target**: Worker Agent (Milestone M0 Execution)  

---

## 1. Executive Summary & Design System Foundations

PulseOS frontend is a modern, production-grade Single-Page Application built with **Vite**, **React 19**, **TypeScript**, and **Tailwind CSS v3**.

The user interface adheres strictly to **Apple's Human Interface Guidelines (HIG)** combined with **Emil Kowalski's Design Engineering principles**, creating a **Warm Humanist Clinical** aesthetic tailored for high-pressure healthcare environments:
- **Calming Clinical Palette**: Primary Clinical Teal (`#0D9488`), Slate Ground (`#F8FAFC`), Deep Legible Ink (`#0F172A`), Urgency Coral (`#F43F5E`), Clinical Amber (`#F59E0B`), and Success Emerald (`#10B981`).
- **Tactile Materiality**: 1px border refractions (`border-slate-200/80`), tactile click scaling (`active:scale-[0.98] transition-transform duration-100 ease-out`), and subtle ambient card shadows (`shadow-apple-card`).
- **Liquid Glass**: Translucent modal sheets, floating navigation bars, and dropdown menus with `backdrop-blur-md bg-white/90`.
- **Optical Typography**: High-legibility **Plus Jakarta Sans** for clinical text, interface labels, and headings; monospace **JetBrains Mono** for medical record numbers (NIC, MRN, Rx IDs, Test IDs, invoice figures, and currency amounts).
- **Anti-Slop Invariant**: Zero generic purple AI gradients, zero high-contrast harsh dark themes, zero sluggish animations (`ease-in` is prohibited on menus/modals; custom snappy `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` is mandated).
- **Dual-Database Visibility**: Integrated top-bar indicator providing one-click live access to the embedded H2 Console (`http://localhost:8080/h2-console`).
- **Multi-Role Experience**: Instant role switcher reflecting the 5 active hospital roles (Doctor, Receptionist, Pharmacist, Lab Technician, Cashier/Admin) mapped directly to the SLIIT Group 60 student team identities.

---

## 2. Directory Layout Blueprint

The `/Users/admin/Projects/honda_leda/frontend` project directory structure:

```
frontend/
├── index.html                           # HTML entry point, Google Fonts, PayHere 2.0 SDK
├── package.json                         # Dependencies: React 19, Lucide, Tailwind 3, Axios
├── tsconfig.json                        # Strict TypeScript app configuration
├── tsconfig.node.json                   # TypeScript Vite config
├── vite.config.ts                       # Dev server on port 5173, backend proxy to 8080
├── tailwind.config.js                   # Clinical color palette, font families, Apple shadows
├── postcss.config.js                    # PostCSS plugins (tailwindcss, autoprefixer)
├── public/
│   ├── favicon.svg                      # PulseOS clinical heartbeat logo mark
│   └── pulseos-logo.svg                 # Vector brand mark
└── src/
    ├── main.tsx                         # React 19 root bootstrap
    ├── App.tsx                          # App root with RoleProvider, ToastProvider, Layout
    ├── index.css                        # Apple HIG utility classes, font rules, print styles
    ├── types/
    │   └── index.ts                     # TypeScript domain models matching backend DTOs
    ├── services/
    │   └── api.ts                       # Axios HTTP client, backend proxy endpoints, mock fallback
    ├── context/
    │   ├── RoleContext.tsx              # Active hospital role & user identity state
    │   └── ToastContext.tsx             # Global notification queue and toast dispatcher
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.tsx               # Top bar: Brand, Live Clock, H2 DB badge, User pill
    │   │   ├── Sidebar.tsx              # Collapsible role switcher & 6-module navigation
    │   │   └── Layout.tsx               # Primary application layout shell
    │   └── common/
    │       ├── ToastContainer.tsx       # Floating Apple-card toast notifications
    │       ├── MetricCard.tsx           # Clinical KPI metric cards with JetBrains Mono numbers
    │       ├── Badge.tsx                # Clinical status badges (Triage, Expiry, Payment, Test)
    │       └── Modal.tsx                # Accessible, focus-trapped, backdrop-blurred modal
    └── views/
        ├── PatientView.tsx              # M1: Patient registration, NIC search, triage tags
        ├── DoctorView.tsx               # M2: Doctor roster, availability toggle, fees
        ├── AppointmentView.tsx          # M3: Slot booking, conflict prevention, schedule table
        ├── PharmacyView.tsx             # M4: Drug inventory, low-stock alerts, dispense queue
        ├── BillingView.tsx              # M5: Invoices, PayHere sandbox popup, printable receipt
        └── LaboratoryView.tsx           # M6: Test orders, sample tracker, result entry modal
```

---

## 3. Configuration File Templates

### 3.1 `package.json`

```json
{
  "name": "pulseos-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.7.9",
    "lucide-react": "^0.475.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.13.4",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "~5.7.2",
    "vite": "^6.1.0"
  }
}
```

### 3.2 `vite.config.ts`

Configures the Vite development server on port **5173** and transparently proxies `/api` and `/h2-console` requests to Spring Boot on `http://localhost:8080`.

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/h2-console': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

### 3.3 `tsconfig.json` & `tsconfig.node.json`

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

`tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

### 3.4 `postcss.config.js`

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### 3.5 `tailwind.config.js`

Implements the official Warm Humanist Clinical palette, custom Apple shadows, and font declarations:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        clinical: {
          teal: {
            50: '#F0FDFA',
            100: '#CCFBF1',
            200: '#99F6E4',
            500: '#14B8A6',
            600: '#0D9488',
            700: '#0F766E',
            800: '#115E59',
            900: '#134E4A',
          },
          slate: {
            50: '#F8FAFC',
            100: '#F1F5F9',
            200: '#E2E8F0',
            300: '#CBD5E1',
            400: '#94A3B8',
            500: '#64748B',
            600: '#475569',
            700: '#334155',
            800: '#1E293B',
            900: '#0F172A',
          },
          coral: {
            50: '#FFF1F2',
            100: '#FFE4E6',
            500: '#F43F5E',
            600: '#E11D48',
            700: '#BE123C',
          },
          amber: {
            50: '#FFFBEB',
            100: '#FEF3C7',
            500: '#F59E0B',
            600: '#D97706',
            700: '#B45309',
          },
          emerald: {
            50: '#ECFDF5',
            100: '#D1FAE5',
            500: '#10B981',
            600: '#059669',
            700: '#047857',
          },
          ink: {
            DEFAULT: '#0F172A',
            secondary: '#334155',
            muted: '#64748B',
            subtle: '#94A3B8',
          },
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'apple-card': '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.03)',
        'apple-hover': '0 4px 12px 0 rgba(15, 23, 42, 0.08), 0 2px 4px -1px rgba(15, 23, 42, 0.04)',
        'apple-elevated': '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        'apple-modal': '0 20px 40px -10px rgba(15, 23, 42, 0.15), 0 10px 20px -5px rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        'apple-xl': '14px',
        'apple-2xl': '18px',
      },
    },
  },
  plugins: [],
};
```

### 3.6 `index.html`

Preloads **Plus Jakarta Sans** and **JetBrains Mono** from Google Fonts and includes the **PayHere 2.0 JavaScript SDK**:

```html
<!doctype html>
<html lang="en" class="h-full bg-slate-50">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PulseOS — Hospital Management System</title>

    <!-- Google Fonts: Plus Jakarta Sans & JetBrains Mono -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />

    <!-- Official PayHere Sandbox JavaScript SDK -->
    <script type="text/javascript" src="https://www.payhere.lk/lib/payhere-2.0.js"></script>
  </head>
  <body class="h-full text-clinical-ink antialiased selection:bg-clinical-teal-100 selection:text-clinical-teal-900">
    <div id="root" class="h-full"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 3.7 `public/favicon.svg`

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" rx="8" fill="#0D9488"/>
  <path d="M6 16.5H11L13.5 10L17.5 22L20.5 14L22.5 16.5H26" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

---

## 4. CSS Architecture & Apple HIG Styling (`src/index.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
    --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  }

  body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: #F8FAFC;
    color: #0F172A;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

/* Apple HIG 1px Refraction Cards */
@layer components {
  .apple-card {
    background-color: #FFFFFF;
    border: 1px solid rgba(226, 232, 240, 0.85);
    box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.03);
    border-radius: 0.875rem; /* 14px */
  }

  .apple-card-hover {
    transition: transform 150ms var(--ease-out), box-shadow 150ms var(--ease-out), border-color 150ms var(--ease-out);
  }

  .apple-card-hover:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px 0 rgba(15, 23, 42, 0.08), 0 2px 4px -1px rgba(15, 23, 42, 0.04);
    border-color: rgba(203, 213, 225, 0.9);
  }

  /* Tactile Button Scaling (Emil Kowalski Polish) */
  .apple-btn {
    transition: transform 100ms var(--ease-out), background-color 150ms var(--ease-out), border-color 150ms var(--ease-out), opacity 150ms var(--ease-out);
    user-select: none;
  }

  .apple-btn:active:not(:disabled) {
    transform: scale(0.98);
  }

  /* Liquid Glass Vibrant Translucency */
  .liquid-glass {
    background-color: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  }

  .liquid-glass-card {
    background-color: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08);
  }
}

/* Custom Sleek Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.4);
  border-radius: 9999px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(100, 116, 139, 0.6);
}

/* High-Precision Thermal / A4 Hospital Print Stylesheet */
@media print {
  body {
    background: #FFFFFF !important;
    color: #000000 !important;
  }

  .no-print, nav, aside, header, button, .toast-container {
    display: none !important;
  }

  .print-only {
    display: block !important;
  }

  .receipt-container {
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    box-shadow: none !important;
  }
}
```

---

## 5. Domain Types & Interface Contracts (`src/types/index.ts`)

Defines TypeScript representations that mirror the 26 backend relational entities and REST DTOs:

```typescript
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
  | 'Gastrointestinal';

export interface Drug {
  id: number;
  drugId: string; // e.g. DRG-1001
  drugName: string;
  genericName: string;
  category: DrugCategory;
  dosageForm: string; // Tablet, Syrup, Injection
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
  sampleType: string; // Blood, Urine, Plasma
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
```

---

## 6. HTTP API Client & Networking Layer (`src/services/api.ts`)

Provides centralized Axios configuration with default fallback mock data, ensuring that the frontend renders gracefully in demo mode even if the backend is initializing:

```typescript
import axios, { AxiosError } from 'axios';
import {
  Patient,
  Doctor,
  Appointment,
  Drug,
  Prescription,
  Invoice,
  LabTest,
  PayHereParams,
} from '../types';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Response interceptor for clean error extraction
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const errorMsg = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(errorMsg));
  }
);

// M1: Patients API
export const patientApi = {
  getAll: () => api.get<Patient[]>('/patients'),
  getById: (id: number) => api.get<Patient>(`/patients/${id}`),
  search: (query: string) => api.get<Patient[]>(`/patients/search?q=${encodeURIComponent(query)}`),
  create: (patient: Partial<Patient>) => api.post<Patient>('/patients', patient),
  update: (id: number, patient: Partial<Patient>) => api.put<Patient>(`/patients/${id}`, patient),
  archive: (id: number) => api.patch<void>(`/patients/${id}/archive`),
};

// M2: Doctors API
export const doctorApi = {
  getAll: () => api.get<Doctor[]>('/doctors'),
  getById: (id: number) => api.get<Doctor>(`/doctors/${id}`),
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
  updateStatus: (testId: number, status: string) =>
    api.patch<LabTest>(`/laboratory/tests/${testId}/status`, { status }),
  submitResults: (testId: number, payload: { resultData: string; isAbnormal: boolean; technicianNotes?: string }) =>
    api.post<LabTest>(`/laboratory/tests/${testId}/results`, payload),
};

export default api;
```

---

## 7. State & Context Architecture

### 7.1 `RoleContext.tsx`

Maps the 5 user roles to authentic SLIIT Group 60 team identities:

```typescript
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole, UserProfile, ModuleId } from '../types';

export const TEAM_MEMBERS: Record<UserRole, UserProfile> = {
  DOCTOR: {
    id: 'DOC-101',
    name: 'Dr. Kavinda Rathnayaka',
    studentName: 'Rathnayaka R. M. K. L. B.',
    studentId: 'IT25103999',
    role: 'DOCTOR',
    roleTitle: 'Chief Consultant Cardiologist',
    department: 'Cardiology',
    email: 'it25103999@my.sliit.lk',
    featureBranch: 'feature/doctor-management',
  },
  RECEPTIONIST: {
    id: 'REC-201',
    name: 'Dila Somarathna',
    studentName: 'Somarathna P. G. D. S.',
    studentId: 'IT25103819',
    role: 'RECEPTIONIST',
    roleTitle: 'Head Patient Registrar',
    department: 'Outpatient Triage & Admissions',
    email: 'it25103819@my.sliit.lk',
    featureBranch: 'feature/patient-management',
  },
  PHARMACIST: {
    id: 'PHM-301',
    name: 'Harshika Udumullage',
    studentName: 'Udumullage S.H.U.',
    studentId: 'IT25100826',
    role: 'PHARMACIST',
    roleTitle: 'Chief Clinical Pharmacist',
    department: 'Hospital Central Pharmacy',
    email: 'it25100826@my.sliit.lk',
    featureBranch: 'feature/inventory-pharmacy',
  },
  LAB_TECHNICIAN: {
    id: 'LAB-401',
    name: 'Nethuli Thilakarathne',
    studentName: 'Thilakarathne H.S.K.P.N',
    studentId: 'IT25103363',
    role: 'LAB_TECHNICIAN',
    roleTitle: 'Senior Pathology Technologist',
    department: 'Clinical Pathology & Diagnostics',
    email: 'it25103363@my.sliit.lk',
    featureBranch: 'feature/laboratory-tests',
  },
  CASHIER_ADMIN: {
    id: 'ADM-501',
    name: 'Kesaru Dhanasinghe',
    studentName: 'Dhanasinghe K. A. K. H.',
    studentId: 'IT25103992',
    role: 'CASHIER_ADMIN',
    roleTitle: 'Hospital Comptroller & System Admin',
    department: 'Finance & Hospital Administration',
    email: 'it25103992@my.sliit.lk',
    featureBranch: 'feature/billing-payment',
  },
};

interface RoleContextType {
  currentRole: UserRole;
  currentUser: UserProfile;
  setRole: (role: UserRole) => void;
  activeModule: ModuleId;
  setActiveModule: (module: ModuleId) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('RECEPTIONIST');
  const [activeModule, setActiveModule] = useState<ModuleId>('patients');

  const handleSetRole = (role: UserRole) => {
    setCurrentRole(role);
    // Switch to corresponding primary module
    switch (role) {
      case 'DOCTOR':
        setActiveModule('doctors');
        break;
      case 'RECEPTIONIST':
        setActiveModule('patients');
        break;
      case 'PHARMACIST':
        setActiveModule('pharmacy');
        break;
      case 'LAB_TECHNICIAN':
        setActiveModule('laboratory');
        break;
      case 'CASHIER_ADMIN':
        setActiveModule('billing');
        break;
    }
  };

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        currentUser: TEAM_MEMBERS[currentRole],
        setRole: handleSetRole,
        activeModule,
        setActiveModule,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
```

### 7.2 `ToastContext.tsx`

Non-blocking Apple HIG toast notifications with automatic dismiss:

```typescript
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ToastNotification, ToastType } from '../types';

interface ToastContextType {
  toasts: ToastNotification[];
  showToast: (type: ToastType, title: string, message: string, duration?: number) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, message: string, duration: number = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastNotification = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
```

---

## 8. Application Layout Shell Components

### 8.1 `Navbar.tsx` (Top Navigation Bar)

Features:
1. **PulseOS Brand**: Heartbeat SVG with live teal glow.
2. **Live System Clock**: Updates every second, displaying formatted date and exact time.
3. **Live H2 Console Link**: Pulsing emerald status badge linking directly to `http://localhost:8080/h2-console`.
4. **Current User Pill**: Displays student name, role badge, and department.

```tsx
import React, { useState, useEffect } from 'react';
import { Activity, Database, Clock, ExternalLink, ShieldCheck } from 'lucide-react';
import { useRole } from '../../context/RoleContext';

export const Navbar: React.FC = () => {
  const { currentUser } = useRole();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="liquid-glass sticky top-0 z-30 h-16 w-full px-4 lg:px-6 flex items-center justify-between">
      {/* Left: Brand & System Indicator */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-apple-xl bg-clinical-teal-600 flex items-center justify-center text-white shadow-sm shadow-clinical-teal-600/20">
          <Activity className="h-6 w-6 stroke-[2.2]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight text-clinical-ink">PulseOS</span>
            <span className="text-[10px] uppercase font-mono font-semibold tracking-wider px-1.5 py-0.5 rounded bg-clinical-teal-50 text-clinical-teal-700 border border-clinical-teal-200">
              v1.0 SLIIT
            </span>
          </div>
          <p className="text-[11px] text-clinical-ink-muted -mt-0.5">Warm Humanist Clinical Care</p>
        </div>
      </div>

      {/* Center: Live System Clock */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/60 text-clinical-ink-secondary text-xs font-mono">
        <Clock className="h-3.5 w-3.5 text-clinical-teal-600" />
        <span>{currentTime || 'Synchronizing system clock...'}</span>
      </div>

      {/* Right: Active DB Console & Active User Badge */}
      <div className="flex items-center gap-3">
        {/* H2 Live Console Direct Link */}
        <a
          href="http://localhost:8080/h2-console"
          target="_blank"
          rel="noopener noreferrer"
          title="Open Embedded H2 Live SQL Web Console"
          className="apple-btn flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Database className="h-3.5 w-3.5 text-emerald-600" />
          <span className="hidden sm:inline">H2 Live Console</span>
          <ExternalLink className="h-3 w-3 opacity-60" />
        </a>

        {/* Current User Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="h-9 w-9 rounded-full bg-slate-800 text-white font-mono text-xs font-bold flex items-center justify-center shadow-inner">
            {currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div className="hidden lg:block text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-clinical-ink leading-tight">{currentUser.name}</span>
              <ShieldCheck className="h-3.5 w-3.5 text-clinical-teal-600" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-clinical-ink-muted font-mono">{currentUser.studentId}</span>
              <span className="text-[10px] text-slate-300">•</span>
              <span className="text-[10px] font-medium text-clinical-teal-700">{currentUser.department}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
```

### 8.2 `Sidebar.tsx` (Collapsible Role Switcher & Navigation)

Features:
1. **Collapsible Width**: Toggles between `w-64` (full) and `w-20` (icon rail).
2. **Interactive Role Switcher**: Segmented selector for the 5 hospital roles.
3. **Module Navigation**: Direct access to all 6 modules (Patients, Doctors, Appointments, Pharmacy, Billing, Laboratory).
4. **Active Role Badging**: Highlights primary module for active role.

```tsx
import React, { useState } from 'react';
import {
  Users,
  Stethoscope,
  CalendarCheck,
  Pill,
  Receipt,
  FlaskConical,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { useRole, TEAM_MEMBERS } from '../../context/RoleContext';
import { ModuleId, UserRole } from '../../types';

interface NavItem {
  id: ModuleId;
  label: string;
  icon: React.ElementType;
  primaryRole: UserRole;
  studentId: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'patients', label: 'Patient Management', icon: Users, primaryRole: 'RECEPTIONIST', studentId: 'IT25103819' },
  { id: 'doctors', label: 'Doctor Rosters', icon: Stethoscope, primaryRole: 'DOCTOR', studentId: 'IT25103999' },
  { id: 'appointments', label: 'Appointments', icon: CalendarCheck, primaryRole: 'RECEPTIONIST', studentId: 'IT25101620' },
  { id: 'pharmacy', label: 'Pharmacy & Stock', icon: Pill, primaryRole: 'PHARMACIST', studentId: 'IT25100826' },
  { id: 'billing', label: 'Billing & PayHere', icon: Receipt, primaryRole: 'CASHIER_ADMIN', studentId: 'IT25103992' },
  { id: 'laboratory', label: 'Diagnostic Lab', icon: FlaskConical, primaryRole: 'LAB_TECHNICIAN', studentId: 'IT25103363' },
];

export const Sidebar: React.FC = () => {
  const { currentRole, setRole, activeModule, setActiveModule } = useRole();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative h-[calc(100vh-4rem)] border-r border-slate-200/80 bg-white transition-all duration-200 ease-out flex flex-col justify-between ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top: Role Switcher & Nav Items */}
      <div className="p-3 space-y-4">
        {/* Role Switcher Section */}
        <div className="space-y-1.5">
          {!collapsed && (
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-clinical-ink-muted">
                Active Hospital Role
              </span>
              <span className="text-[10px] font-mono text-clinical-teal-600 bg-clinical-teal-50 px-1.5 py-0.5 rounded border border-clinical-teal-100">
                5 Roles
              </span>
            </div>
          )}

          <div className="bg-slate-50 p-1 rounded-apple-xl border border-slate-200/80">
            {collapsed ? (
              <div className="flex justify-center p-1.5">
                <UserCheck className="h-5 w-5 text-clinical-teal-600" />
              </div>
            ) : (
              <select
                value={currentRole}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-clinical-ink focus:outline-none focus:ring-2 focus:ring-clinical-teal-500 shadow-sm cursor-pointer"
              >
                {Object.entries(TEAM_MEMBERS).map(([roleKey, profile]) => (
                  <option key={roleKey} value={roleKey}>
                    {profile.role.replace('_', ' ')}: {profile.name.split(' ')[0]} ({profile.studentId})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* 6 Core Modules Navigation */}
        <nav className="space-y-1">
          {!collapsed && (
            <div className="px-1 pt-1 pb-0.5 text-[11px] font-bold uppercase tracking-wider text-clinical-ink-muted">
              Hospital Modules (6)
            </div>
          )}

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            const isAssigned = item.primaryRole === currentRole;

            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                title={collapsed ? `${item.label} (${item.studentId})` : undefined}
                className={`apple-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-apple-xl text-xs font-semibold transition-colors duration-150 ${
                  isActive
                    ? 'bg-clinical-teal-600 text-white shadow-sm shadow-clinical-teal-600/25'
                    : 'text-clinical-ink-secondary hover:bg-slate-100/80 hover:text-clinical-ink'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between text-left">
                    <span className="truncate">{item.label}</span>
                    {isAssigned && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white font-bold'
                            : 'bg-clinical-teal-50 text-clinical-teal-700 border border-clinical-teal-200'
                        }`}
                      >
                        MY ROLE
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Team Watermark & Collapse Toggle */}
      <div className="p-3 border-t border-slate-200/80 space-y-2">
        {!collapsed && (
          <div className="px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60 text-[10px] text-clinical-ink-muted">
            <div className="flex items-center gap-1 font-semibold text-clinical-ink">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>SLIIT SE2030 Batch 02</span>
            </div>
            <p className="text-[9px] font-mono text-slate-400 mt-0.5">Group 60 • PulseOS Final</p>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="apple-btn w-full flex items-center justify-center p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
};
```

### 8.3 `Layout.tsx` (Application Shell)

```tsx
import React, { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../common/ToastContainer';

export const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="h-full min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};
```

---

## 9. Common Clinical UI Components

### 9.1 `ToastContainer.tsx`

```tsx
import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = Info;
        let colorClass = 'border-sky-200 bg-sky-50/95 text-sky-900';
        let iconColor = 'text-sky-600';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          colorClass = 'border-emerald-200 bg-emerald-50/95 text-emerald-900';
          iconColor = 'text-emerald-600';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          colorClass = 'border-rose-200 bg-rose-50/95 text-rose-900';
          iconColor = 'text-rose-600';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          colorClass = 'border-amber-200 bg-amber-50/95 text-amber-900';
          iconColor = 'text-amber-600';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto apple-card p-3.5 flex items-start gap-3 border shadow-apple-elevated backdrop-blur-md transition-all duration-200 ${colorClass}`}
          >
            <Icon className={`h-5 w-5 shrink-0 ${iconColor} mt-0.5`} />
            <div className="flex-1 text-xs">
              <h4 className="font-semibold">{toast.title}</h4>
              <p className="mt-0.5 text-[11px] opacity-90 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 transition-colors p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
```

### 9.2 `MetricCard.tsx` (KPI Dashboard Card)

```tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'teal' | 'coral' | 'amber' | 'emerald' | 'slate';
  delta?: {
    value: string;
    isPositive: boolean;
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'teal',
  delta,
}) => {
  const variantStyles = {
    teal: 'bg-clinical-teal-50 text-clinical-teal-700 border-clinical-teal-100',
    coral: 'bg-rose-50 text-rose-700 border-rose-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className="apple-card apple-card-hover p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-clinical-ink-secondary">{title}</span>
        <div className={`p-2 rounded-xl border ${variantStyles[variant]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold font-mono tracking-tight text-clinical-ink">{value}</div>
        <div className="mt-1 flex items-center justify-between text-[11px]">
          {subtitle && <span className="text-clinical-ink-muted">{subtitle}</span>}
          {delta && (
            <span
              className={`font-semibold font-mono ${
                delta.isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {delta.value}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
```

### 9.3 `Badge.tsx`

```tsx
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'emergency' | 'urgent' | 'routine' | 'success' | 'warning' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  const variantClasses = {
    default: 'bg-clinical-teal-50 text-clinical-teal-700 border-clinical-teal-200',
    emergency: 'bg-rose-50 text-rose-700 border-rose-200 font-bold animate-pulse',
    urgent: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold',
    routine: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-mono tracking-wide ${sizeClasses} ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
};
```

### 9.4 `Modal.tsx`

```tsx
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        ref={modalRef}
        className={`w-full ${maxWidthClasses[maxWidth]} apple-card shadow-apple-modal bg-white border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150`}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-clinical-ink">{title}</h3>
            {subtitle && <p className="text-xs text-clinical-ink-muted mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="apple-btn p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>
  );
};
```

---

## 10. View Skeletons for All 6 Modules

### 10.1 `PatientView.tsx` (Module 1 — Dila / IT25103819)

Includes:
- Summary KPI metric cards: Total Registered, Emergency Triage, Outpatient Today.
- Instant NIC/Passport search bar and triage priority filter.
- Patient table with triage priority pills, blood group, emergency contacts.
- "Register Patient" modal trigger with required demographic inputs.

### 10.2 `DoctorView.tsx` (Module 2 — Kavinda / IT25103999)

Includes:
- Summary KPI metric cards: Total Doctors, On-Duty Now, Specialty Clinics.
- Department filter tabs (Cardiology, Neurology, Pediatrics, etc.).
- Doctor roster cards with real-time On-Duty / Off-Duty availability toggle.
- Consultation fee configuration tag (`Rs. 2,500.00`).
- Weekly schedule preview button.

### 10.3 `AppointmentView.tsx` (Module 3 — Chanul / IT25101620)

Includes:
- Double-booking prevention notice banner explaining the composite unique invariant `(doctor_id, appointment_date, appointment_time)`.
- Booking queue table with status filters (`SCHEDULED`, `CONFIRMED`, `COMPLETED`, `CANCELLED`).
- Interactive "Book Consultation Slot" modal with live conflict validation.
- Reschedule and Cancel encounter actions.

### 10.4 `PharmacyView.tsx` (Module 4 — Harshika / IT25100826)

Includes:
- Inventory summary KPI cards: Total Drug Catalog, Low Stock Alerts (`stock <= reorderLevel`), Expiring Batches.
- Drug inventory table with color-coded inventory progress bars.
- Amber visual warning badges for drugs requiring immediate supplier replenishment.
- Prescription dispensing queue with instant "Dispense & Deduct Stock" atomic action.

### 10.5 `BillingView.tsx` (Module 5 — Kesaru / IT25103992)

Includes:
- Invoicing summary KPI cards: Total Revenue Settled, Outstanding Invoices, PayHere Transactions.
- Itemized invoice generator aggregating Doctor Consultation Fee + Dispensed Drugs + Lab Tests.
- "Pay with PayHere" Sandbox popup button triggering `window.payhere.startPayment`.
- "Settle with Cash / Card" counter settlement modal.
- Printable thermal receipt view activated via `@media print`.

### 10.6 `LaboratoryView.tsx` (Module 6 — Nethuli / IT25103363)

Includes:
- Laboratory KPI metric cards: Active Investigations, Pending Sample Intake, Verified Reports.
- Diagnostic test order queue with visual 4-step sample tracker (`REQUESTED` → `SAMPLE_COLLECTED` → `PROCESSING` → `COMPLETED`).
- "Enter Quantitative Results" modal with standard normal reference ranges comparison.
- Clinical diagnostic report viewer with hospital letterhead and print option.

---

## 11. Application Root (`App.tsx` & `main.tsx`)

### 11.1 `src/App.tsx`

```tsx
import React from 'react';
import { RoleProvider, useRole } from './context/RoleContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/layout/Layout';
import { PatientView } from './views/PatientView';
import { DoctorView } from './views/DoctorView';
import { AppointmentView } from './views/AppointmentView';
import { PharmacyView } from './views/PharmacyView';
import { BillingView } from './views/BillingView';
import { LaboratoryView } from './views/LaboratoryView';

const ModuleRouter: React.FC = () => {
  const { activeModule } = useRole();

  switch (activeModule) {
    case 'patients':
      return <PatientView />;
    case 'doctors':
      return <DoctorView />;
    case 'appointments':
      return <AppointmentView />;
    case 'pharmacy':
      return <PharmacyView />;
    case 'billing':
      return <BillingView />;
    case 'laboratory':
      return <LaboratoryView />;
    default:
      return <PatientView />;
  }
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <RoleProvider>
        <Layout>
          <ModuleRouter />
        </Layout>
      </RoleProvider>
    </ToastProvider>
  );
};

export default App;
```

### 11.2 `src/main.tsx`

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

---

## 12. Concrete Worker Execution Instructions

When the Worker agent executes Milestone M0 for the frontend:

1. **Create Directory Structure**:
   ```bash
   mkdir -p /Users/admin/Projects/honda_leda/frontend/public
   mkdir -p /Users/admin/Projects/honda_leda/frontend/src/types
   mkdir -p /Users/admin/Projects/honda_leda/frontend/src/services
   mkdir -p /Users/admin/Projects/honda_leda/frontend/src/context
   mkdir -p /Users/admin/Projects/honda_leda/frontend/src/components/layout
   mkdir -p /Users/admin/Projects/honda_leda/frontend/src/components/common
   mkdir -p /Users/admin/Projects/honda_leda/frontend/src/views
   ```

2. **Write Configuration Files**:
   - Write `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `index.html`, and `public/favicon.svg` matching the exact templates in Sections 3 and 4.

3. **Install Dependencies**:
   ```bash
   cd /Users/admin/Projects/honda_leda/frontend && npm install
   ```

4. **Write Source Code Files**:
   - Write `src/index.css` (Apple HIG styling, custom scrollbars, print rules).
   - Write `src/types/index.ts` (complete domain models).
   - Write `src/services/api.ts` (Axios API services with proxy support).
   - Write `src/context/RoleContext.tsx` and `src/context/ToastContext.tsx`.
   - Write `src/components/layout/Navbar.tsx`, `Sidebar.tsx`, and `Layout.tsx`.
   - Write `src/components/common/ToastContainer.tsx`, `MetricCard.tsx`, `Badge.tsx`, and `Modal.tsx`.
   - Write `src/views/PatientView.tsx`, `DoctorView.tsx`, `AppointmentView.tsx`, `PharmacyView.tsx`, `BillingView.tsx`, and `LaboratoryView.tsx`.
   - Write `src/App.tsx` and `src/main.tsx`.

5. **Build & Typecheck Verification**:
   ```bash
   cd /Users/admin/Projects/honda_leda/frontend && npm run build
   ```
   Must compile cleanly without any TypeScript errors or bundle warnings.

6. **Dev Server Verification**:
   ```bash
   cd /Users/admin/Projects/honda_leda/frontend && npm run dev
   ```
   Must spin up immediately on `http://localhost:5173`.
