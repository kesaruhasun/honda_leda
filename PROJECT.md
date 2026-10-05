# Project: PulseOS Advanced Hospital Management System

## Architecture
PulseOS is an enterprise-grade Hospital Management System with a Java 17 / Spring Boot 3.2 backend and a React 19 / Tailwind CSS 3.4 frontend.

### High-Level Topology
```
┌─────────────────────────────────────────────────────────────┐
│                       React Frontend                        │
│  - TailAdmin UI Shell (Navigation, Header, Role Guards)     │
│  - Role Dashboards (Doctor, Patient, Pharmacist, Manager)   │
│  - Interactive Appointment Booking Calendar                 │
│  - Dynamic Landing Page & Service Catalogs                  │
│  - Axios with JWT Interceptor                               │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON (Bearer JWT)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Spring Boot Backend (DDD)                   │
│  ├── com.pulseos.security    (JWT, BCrypt, RBAC Filter)     │
│  ├── com.pulseos.patient     (Entity, Service, Controller)  │
│  ├── com.pulseos.doctor      (Entity, Service, Controller)  │
│  ├── com.pulseos.appointment (Entity, Service, Controller)  │
│  ├── com.pulseos.pharmacy    (Entity, Service, Controller)  │
│  ├── com.pulseos.laboratory  (Entity, Service, Controller)  │
│  ├── com.pulseos.billing     (Invoice, Transaction, PayHere)│
│  ├── com.pulseos.notification(Async Email Event Pipeline)   │
│  ├── com.pulseos.landing     (Dynamic Stats & Catalogs)     │
│  └── com.pulseos.common      (Person Base Entity, Shared)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ JPA / Hibernate
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Dual Database Persistence                   │
│  - Demo Profile: In-Memory H2 (MODE=MySQL, TCP: 9092)       │
│  - Production Profile: MySQL 8.0 (pulseos_db: 3306)         │
└─────────────────────────────────────────────────────────────┘
```

---

## Feature Inventory
Every feature identified during Step 0 Survey mapped to its assigned milestone:

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Repository & Root Cleanup | Delete 451MB `frontend_backup_legacy/`, organize root docx/scripts/diagrams into `docs/` and `scripts/` | M1 | Survey (Explorer 3) |
| 2 | Backend DDD Restructuring | Refactor flat package-by-layer into domain bounded contexts (`com.pulseos.*`) | M1 | Survey (Explorer 1) |
| 3 | Single-Source-of-Truth DTOs | Eliminate duplicate/synonym fields (`dob`/`dateOfBirth`, `nicPassport`/`nicPassportNo`) across all DTOs | M1 | Survey (Explorer 1) |
| 4 | Seed Data & Test Count Fix | Fix outdated count assertions in `PulseOsApplicationTests.java` for demo seed data | M1 | Survey (Explorer 1) |
| 5 | JWT Security Infrastructure | Add JJWT dependencies, implement `JwtTokenProvider`, `JwtAuthenticationFilter`, BCrypt hashing | M2 | Survey (Explorer 3) |
| 6 | Real Backend RBAC Enforcement | Secure endpoints with role claims (`@PreAuthorize` / `hasRole`), eliminate `permitAll()` | M2 | Survey (Explorer 3) |
| 7 | Authentication API | Expose `/api/v1/auth/login` for staff (Doctor, Receptionist, Pharmacist, Lab, Manager) and patients | M2 | Survey (Explorer 1, 3) |
| 8 | Email Notification Pipeline | Add `spring-boot-starter-mail`, async event publisher/listeners for appointments and payment receipts | M3 | Survey (Explorer 3) |
| 9 | PayHere Gateway Mock Flow | Complete PayHere payment initiation, IPN webhook with full status transitions, and mock completion | M3 | Survey (Explorer 1, 3) |
| 10 | Dynamic Landing Backend API | Expose `/api/v1/landing/stats` returning live aggregate counts (doctors, departments, services) | M4 | Survey (Explorer 1) |
| 11 | Real Appointment Schedule APIs | Support doctor schedules and actual slot occupancy calculation instead of math hashing | M4 | Survey (Explorer 1, 2) |
| 12 | Frontend Clean Slate UI Shell | Wipe `.apple-*` slop, install TailAdmin component system, clean typography, unified tokens | M5 | Survey (Explorer 2) |
| 13 | Remove Station Switcher | Remove client-side station switcher from `Sidebar.tsx`; enforce real authenticated session | M5 | Survey (Explorer 2, 3) |
| 14 | Distinct Role-Based Dashboards | Implement Doctor, Patient, Pharmacist, and dedicated Manager dashboards | M5 | Survey (Explorer 2) |
| 15 | Dynamic Frontend Landing Page | Wire landing page to live backend APIs (`/api/v1/landing/stats`, drugs, lab catalog) | M5 | Survey (Explorer 2) |
| 16 | Role-Based Interactive Calendar | Implement intuitive appointment calendar with distinct Doctor, Patient, and Manager views | M5 | Survey (Explorer 2) |
| 17 | PayHere Frontend Checkout | Wire PayHere payment flow into patient billing view with mock payment execution | M5 | Survey (Explorer 2, 3) |
| 18 | E2E Suite Verification (Tiers 1-4) | Validate 100% of E2E tests pass against live backend and mock runner | M6 | Survey (All) |
| 19 | Adversarial Coverage Hardening (Tier 5) | White-box adversarial testing, edge cases, security verification | M6 | Project Pattern |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | File Organization, DDD Restructuring & DTO Cleansing | Clean repository disk bloat, reorganize backend into DDD domain packages (`com.pulseos.*`), unify DTOs with zero duplicate fields, fix unit test assertions | none | DONE |
| M2 | Backend Security & Real JWT RBAC | Implement JJWT, BCrypt passwords, `com.pulseos.security`, `/api/v1/auth/login`, Spring Security role filters | M1 | IN_PROGRESS |
| M3 | External Integrations: PayHere & Email Pipeline | Implement `com.pulseos.notification` (async mail sender) and complete PayHere webhook + mock payment endpoint | M2 | PLANNED |
| M4 | Backend Landing & Schedule APIs | Implement `/api/v1/landing/stats` and backend schedule/calendar availability calculation | M2 | PLANNED |
| M5 | Frontend Clean Slate UI, Dashboards & Calendar | Remove `.apple-*` slop, remove station switcher, implement TailAdmin UI, 4 role dashboards, dynamic landing, real calendar, PayHere UI | M2, M3, M4 | PLANNED |
| M6 | Final Milestone: 100% E2E Pass & Adversarial Hardening | Phase 1: Pass 100% E2E test suite (Tiers 1-4). Phase 2: Tier 5 Adversarial Coverage Hardening | M5 | PLANNED |

---

## Interface Contracts

### Authentication: Client ↔ Backend (`com.pulseos.security`)
- **Login Request**: `POST /api/v1/auth/login`
  - Body: `{ "username": "...", "password": "..." }`
  - Response:
    ```json
    {
      "token": "eyJhbGciOi...",
      "tokenType": "Bearer",
      "userId": 101,
      "username": "doc.kavinda@pulseos.lk",
      "fullName": "Dr. Kavinda Rathnayaka",
      "role": "DOCTOR",
      "userType": "STAFF"
    }
    ```
- **Auth Header**: All authenticated requests require `Authorization: Bearer <token>`.
- **RBAC Enforcement**:
  - `DOCTOR`: Access clinical encounters, patient records, prescribe medications.
  - `RECEPTIONIST`: Patient intake, triage assignment, appointment bookings.
  - `PHARMACIST`: Drug inventory, dispensations.
  - `LAB_TECHNICIAN`: Laboratory orders, diagnostic test results.
  - `MANAGER` / `ADMIN`: Executive KPI reports, billing oversight, staff roster, capacity.
  - `PATIENT`: Own appointments, own prescriptions, own lab reports, own invoices.

### Landing Page: Frontend ↔ Backend (`com.pulseos.landing`)
- **Stats Endpoint**: `GET /api/v1/landing/stats`
  - Response:
    ```json
    {
      "activeDoctorsCount": 12,
      "departmentsCount": 6,
      "satisfiedPatientsCount": 1540,
      "testsAvailableCount": 18,
      "featuredSpecialties": ["Cardiology", "Neurology", "General Medicine"]
    }
    ```

### Appointment Calendar: Frontend ↔ Backend (`com.pulseos.appointment` & `com.pulseos.doctor`)
- **Doctor Schedules**: `GET /api/v1/doctors/{id}/schedules`
- **Booked Slots / Appointments**: `GET /api/v1/appointments` (filtered by doctor / date / status)
- **Role Permissions**:
  - Patient view: Select doctor, see available time slots, book appointment.
  - Doctor view: See personal calendar schedule, patient queue, launch consultation.
  - Manager view: Overview of all departments, doctor schedules, hospital load.

### PayHere Payment Gateway: Frontend ↔ Backend (`com.pulseos.billing`)
- **Initiate Checkout**: `GET /api/v1/payments/payhere/initiate?invoiceId={id}`
  - Returns: `{ "merchantId": "...", "orderId": "...", "amount": "...", "currency": "LKR", "hash": "..." }`
- **Mock Payment Settle**: `POST /api/v1/payments/payhere/mock-success?invoiceId={id}`
  - Simulates instant successful gateway completion, marks invoice `PAID`, records `PaymentTransaction`, triggers receipt email.
- **Webhook Callback**: `POST /api/v1/payments/payhere/notify` (Standard PayHere IPN with MD5 signature validation).

### Notification Pipeline (`com.pulseos.notification`)
- **Events**:
  - `AppointmentCreatedEvent` -> Dispatches appointment confirmation email (async).
  - `PaymentCompletedEvent` -> Dispatches invoice payment receipt (async).
- **Service**: `EmailNotificationService` (Logs emails in demo mode; delegates to `JavaMailSender` when SMTP is configured).

---

## Code Layout

### Backend (`/Users/admin/Projects/honda_leda/backend/src/main/java/com/pulseos`)
```
com.pulseos/
├── common/             # Base entities (Person), ApiResponse, GlobalExceptionHandler
├── config/             # H2TcpServerConfig, WebConfig, Cors
├── security/           # JwtTokenProvider, JwtAuthFilter, SecurityConfig, AuthController, AuthService
├── notification/       # EmailNotificationService, Event Listeners
├── landing/            # LandingPageController, LandingService, LandingStatsDTO
├── patient/            # Patient, PatientAdmission, Ward, Repositories, PatientService, PatientController, DTOs
├── doctor/             # Doctor, DoctorSchedule, Repositories, DoctorService, DoctorController, DTOs
├── appointment/        # Appointment, Repositories, AppointmentService, AppointmentController, DTOs
├── pharmacy/           # Drug, Prescription, Dispensation, Repositories, PharmacyService, Controller, DTOs
├── laboratory/         # LabTest, LabTestCatalog, Repositories, LabService, LabController, DTOs
├── billing/            # Invoice, PaymentTransaction, Repositories, BillingService, PaymentController, PayHere
└── seeder/             # DataSeeder
```

### Frontend (`/Users/admin/Projects/honda_leda/frontend/src`)
```
frontend/src/
├── components/
│   ├── common/         # Button, Card, Badge, Modal, Input, DataTable (TailAdmin UI tokens)
│   ├── layout/         # TailAdmin Sidebar, Header/Navbar, ProtectedRoute (no station switcher)
│   ├── calendar/       # Advanced Appointment Calendar (Role-aware views)
│   ├── landing/        # Dynamic Landing components (Hero, Stats, Formulary, Labs)
│   └── dashboards/     # DoctorWorkbench, PatientPortal, PharmacyDispensary, ManagerDashboard
├── context/            # AuthContext (real JWT token state), ThemeContext
├── services/           # api.ts (Axios with Bearer interceptor), authApi, patientApi, billingApi, etc.
├── views/              # LandingView, StaffLoginView, PatientLoginView, Role Dashboard Views
└── index.css           # Pure Tailwind CSS; ZERO .apple-* classes
```

### Tests & Documentation
- `tests/e2e/`: Opaque-box E2E test suite (Tiers 1-4 + Tier 5).
- `docs/`: Architecture diagrams, EER specifications, project documentation.
- `scripts/`: Project utility and database maintenance scripts.
