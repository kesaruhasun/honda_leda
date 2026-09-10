# Project: PulseOS Hospital Management System (SLIIT SE2030 Group 60)

## Architecture
PulseOS is a modern, production-grade, web-based Hospital Management System built with a clean layered Spring Boot backend and an Apple-inspired Warm Humanist clinical React frontend.

### Backend Architecture (Spring Boot 3.2+, Java 17, Maven Wrapper)
- **Layering**:
  - `controller`: REST APIs providing clean HTTP contracts (`/api/v1/...`).
  - `service`: Business logic, transactional boundaries, validation invariants.
  - `repository`: Spring Data JPA interfaces for MySQL / H2 relational queries.
  - `entity`: JPA entity models with Table-Per-Type (Joined-Table Inheritance) reflecting the authoritative EER diagram.
  - `dto`: Request/Response payloads with validation annotations.
  - `config`: Security configuration (allowing H2 web console and CORS for Vite), PayHere credentials, Jackson formatting.
  - `seeder`: Idempotent data seeder populating realistic clinical data upon startup.
- **Dual-Database Persistence**:
  - `demo` profile (default): Embedded H2 database (`jdbc:h2:mem:pulseos_db;MODE=MySQL;DB_CLOSE_DELAY=-1`) with live H2 console at `http://localhost:8080/h2-console`.
  - `mysql` profile: Production MySQL at `localhost:3306/pulseos_db`, user `root`.
  - Cross-compatible `schema.sql` defining all 26 relational tables matching `docs/PulseOS_EER_Diagram.drawio`.

### Frontend Architecture (Vite + React 19 + TypeScript + Tailwind CSS + Lucide Icons)
- **Apple HIG + Warm Humanist Clinical Design System**:
  - Color Tokens: Primary Clinical Teal `#0D9488`, Slate Ground `#F8FAFC`, Crisp Border `#E2E8F0`, Deep Ink `#0F172A`, Urgency Coral `#F43F5E`, Soft Amber `#F59E0B`, Emerald `#10B981`.
  - Tactile Micro-interactions: `active:scale-[0.98]`, subtle hover transitions, 1px border refractions, glassy card overlays (`backdrop-blur-md bg-white/90`).
  - Typography: Plus Jakarta Sans for clinical legibility, JetBrains Mono for IDs, numbers, and monetary values.
  - Zero generic AI purple gradient slop.
- **Layout & Roles**:
  - Responsive layout with collapsible sidebar.
  - 5 Role Switcher Views: Receptionist, Doctor, Pharmacist, Lab Technician, Cashier/Admin.
  - Global notification toast system, confirmation dialogs, modal sheets, and printable receipt templates (`@media print`).

### Payment Gateway Integration (PayHere Sandbox)
- Backend: Endpoint `/api/v1/payments/payhere/initiate` securely computes MD5 signature:
  `strtoupper(md5(merchant_id + order_id + formatted_amount + currency + strtoupper(md5(merchant_secret))))`.
- Frontend: Loads PayHere JS SDK (`payhere-2.0.js`), triggers popup modal in sandbox mode, handles `onCompleted`.
- Webhook: Endpoint `/api/v1/payments/payhere/notify` verifies `md5sig`, transitions Invoice status to `PAID`, and logs `PaymentTransaction`.
- Offline Simulation: Cashier UI provides one-click Sandbox Simulation for local evaluator testing without external tunnels.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Dual Database Schema & DDL | 26 normalized tables matching EER diagram in `schema.sql` (MySQL & H2) | M0 | Survey (EER Miner) |
| 2 | Spring Boot & React Scaffolding | Backend layered architecture + Frontend Vite/React 19/Tailwind setup | M0 | Survey (Explorer 1) |
| 3 | Automated Clinical Data Seeder | Pre-populates doctors, staff, patients, drugs, appointments, tests, invoices | M0 | ORIGINAL_REQUEST R1 |
| 4 | Apple HIG Design System Tokens | Clinical teal, slate ground, tactile scale(0.98), 1px border cards, fonts | M0 | ORIGINAL_REQUEST R2 |
| 5 | Patient Registration & Profile | Create patient with NIC, DOB, blood group, emergency contacts | M1 | ORIGINAL_REQUEST R3 (M1) |
| 6 | Patient Search & Filter | Filter patients by NIC/Passport, name, blood group, triage priority | M1 | ORIGINAL_REQUEST R3 (M1) |
| 7 | Medical History & Allergies | Record allergies, chronic conditions, past encounters | M1 | ORIGINAL_REQUEST R3 (M1) |
| 8 | Patient Demographics Edit & Archive | Update patient details; soft-archive / restore patient records | M1 | ORIGINAL_REQUEST R3 (M1) |
| 9 | Doctor Profile & Department Mgmt | Manage doctors, medical license, department assignment, qualifications | M2 | ORIGINAL_REQUEST R3 (M2) |
| 10 | Consultation Fee Configuration | Set and update consultation fees per doctor | M2 | ORIGINAL_REQUEST R3 (M2) |
| 11 | Weekly Schedule & Roster | Configure working days, shift hours, room assignments | M2 | ORIGINAL_REQUEST R3 (M2) |
| 12 | Doctor Availability Toggle | Real-time on-duty / off-duty status toggle | M2 | ORIGINAL_REQUEST R3 (M2) |
| 13 | Appointment Booking | Book consultation slot with patient and doctor | M3 | ORIGINAL_REQUEST R3 (M3) |
| 14 | Double-Booking Prevention | Database composite unique constraint + service validation guard | M3 | ORIGINAL_REQUEST R3 (M3) |
| 15 | Appointment Rescheduling | Move appointment date/time with instant conflict check | M3 | ORIGINAL_REQUEST R3 (M3) |
| 16 | Appointment Status Lifecycle | Transition between SCHEDULED, CONFIRMED, COMPLETED, CANCELLED | M3 | ORIGINAL_REQUEST R3 (M3) |
| 17 | Drug Catalog & Shipment Intake | Add/update drugs with generic name, category, unit price, batch number | M4 | ORIGINAL_REQUEST R3 (M4) |
| 18 | Batch Expiry Tracking | Track expiry dates with color-coded warning tags (expired, expiring soon) | M4 | ORIGINAL_REQUEST R3 (M4) |
| 19 | Low-Stock Threshold Alerts | Visual badge & alert filter when stock <= reorderLevel | M4 | ORIGINAL_REQUEST R3 (M4) |
| 20 | Prescription Dispensing Deduction | Dispense prescription drugs with real-time atomic inventory decrement | M4 | ORIGINAL_REQUEST R3 (M4) |
| 21 | Itemized Invoice Generation | Automated aggregation of Doctor Fee + Dispensed Drugs + Lab Tests + Tax | M5 | ORIGINAL_REQUEST R3 (M5) |
| 22 | PayHere Sandbox Checkout | Client-side popup checkout using PayHere JS SDK with test cards | M5 | ORIGINAL_REQUEST R3 (M5) |
| 23 | PayHere Hash & Webhook Verification | Secure MD5 signature generation and webhook `md5sig` validation | M5 | ORIGINAL_REQUEST R3 (M5) |
| 24 | Counter Settlement & Printable Receipt | Settle invoice via Cash/Card; generate printable thermal/A4 receipt | M5 | ORIGINAL_REQUEST R3 (M5) |
| 25 | Lab Test Catalog & Orders | Catalog of standard tests; doctors order tests for appointment encounter | M6 | ORIGINAL_REQUEST R3 (M6) |
| 26 | Sample Status Lifecycle Tracker | Track test through REQUESTED -> COLLECTED -> COMPLETED | M6 | ORIGINAL_REQUEST R3 (M6) |
| 27 | Quantitative Result & Reference Ranges | Technician enters numerical/text results with normal reference range checks | M6 | ORIGINAL_REQUEST R3 (M6) |
| 28 | Clinical Lab Report Viewer | Formatted medical report view with print and download capability | M6 | ORIGINAL_REQUEST R3 (M6) |
| 29 | Authentic Git Commit History | Simulation script generating 6 student branches, commits, and PR merges | M7 | ORIGINAL_REQUEST R4 |
| 30 | Single-Command start.sh | Unified bash launcher for backend and frontend | M7 | ORIGINAL_REQUEST R5 |
| 31 | Viva Demo Walkthrough Guide | Step-by-step 2-minute demo guide per member in `DEMO_WALKTHROUGH.md` | M7 | ORIGINAL_REQUEST R5 |
| 32 | Opaque-Box E2E Test Suite | Automated test suite verifying 100% of features across Tiers 1-4 | M7 | ORIGINAL_REQUEST Acceptance |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M0 | Foundation, Architecture & Dual-DB | Spring Boot 3.2+ setup, schema.sql (26 tables), JPA entities, DataSeeder, Vite+React 19+Tailwind UI scaffold, H2 web console | None | PLANNED |
| M1 | Patient Management (Dila / IT25103819) | Patient registration, medical history, triage tags, NIC search, demographics edit, archive | M0 | PLANNED |
| M2 | Doctor Management (Kavinda / IT25103999) | Doctor profiles, departments, fees, schedules, availability toggles | M0 | PLANNED |
| M3 | Appointment Management (Chanul / IT25101620) | Booking slots, strict double-booking prevention, rescheduling, status lifecycle | M1, M2 | PLANNED |
| M4 | Pharmacy & Inventory (Harshika / IT25100826) | Drug inventory CRUD, batch expiry, low-stock alerts, prescription dispensing stock deduction | M0, M3 | PLANNED |
| M5 | Billing & Payments (Kesaru / IT25103992) | Automated invoice aggregation (Doctor + Drugs + Lab), PayHere Sandbox checkout & hash/webhook, printable receipts | M3, M4, M6 | PLANNED |
| M6 | Laboratory & Tests (Nethuli / IT25103363) | Lab test orders, sample status tracker (REQUESTED->COLLECTED->COMPLETED), quantitative results, report viewer | M0, M3 | PLANNED |
| M7 | E2E Testing, Authentic Git Attribution & Demo | 100% E2E test pass (Tiers 1-4), 6-member authentic git history script execution, start.sh, DEMO_WALKTHROUGH.md | M1-M6 | PLANNED |

---

## Interface Contracts

### Patient ↔ Appointment (M1 ↔ M3)
- `PatientResponseDTO`: `{ id: Long, nicPassportNo: String, fullName: String, bloodGroup: String, triagePriority: String, isArchived: Boolean }`
- Service API: `PatientService.getPatientById(Long id)`, `PatientService.findByNic(String nic)`

### Doctor ↔ Appointment (M2 ↔ M3)
- `DoctorResponseDTO`: `{ id: Long, licenseNo: String, fullName: String, specialization: String, consultationFee: BigDecimal, isAvailable: Boolean }`
- Schedule validation: `DoctorScheduleService.isDoctorAvailable(Long doctorId, LocalDate date, LocalTime time)`

### Appointment ↔ Pharmacy & Lab (M3 ↔ M4, M6)
- Encounter Anchor: `AppointmentDTO`: `{ id: Long, patientId: Long, doctorId: Long, apptDate: LocalDate, apptTime: LocalTime, status: AppointmentStatus }`
- Prescription Issue: `PrescriptionDTO`: `{ id: Long, appointmentId: Long, doctorId: Long, patientId: Long, items: List<PrescriptionItemDTO> }`
- Lab Order: `LabTestOrderDTO`: `{ id: Long, appointmentId: Long, testCatalogId: Long, clinicalIndication: String }`

### Pharmacy & Lab & Doctor ↔ Billing (M4, M6, M2 ↔ M5)
- Invoice Generator Input: `InvoiceGenerationRequestDTO`: `{ patientId: Long, appointmentId: Long }`
- Aggregation Logic:
  - Doctor Fee = `doctor.consultationFee`
  - Pharmacy Total = Sum of `(prescriptionItem.dispensedQty * drug.unitPrice)` for appointment
  - Lab Total = Sum of `labTest.standardFee` for appointment
  - Total Amount = `DoctorFee + PharmacyTotal + LabTotal + TaxAmount`
- PayHere Initiation: `PayHereInitiateResponseDTO`: `{ merchantId: String, orderId: String, amount: BigDecimal, currency: "LKR", hash: String, customerEmail: String, customerPhone: String }`
- Payment Settlement: `PaymentRequestDTO`: `{ invoiceId: Long, amountPaid: BigDecimal, paymentMethod: PaymentMethod, transactionRef: String }`

---

## Code Layout
```
/Users/admin/Projects/honda_leda/
├── backend/
│   ├── mvnw
│   ├── mvnw.cmd
│   ├── pom.xml
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/pulseos/
│   │   │   │   ├── PulseOsApplication.java
│   │   │   │   ├── config/          # SecurityConfig, CorsConfig, PayHereConfig
│   │   │   │   ├── entity/          # Person, Patient, Employee, Doctor, Appointment, Drug, Prescription, LabTest, Invoice, Payment...
│   │   │   │   ├── repository/      # Spring Data JPA Repositories
│   │   │   │   ├── service/         # Module services (Patient, Doctor, Appointment, Pharmacy, Billing, Lab)
│   │   │   │   ├── controller/      # REST Controllers (/api/v1/...)
│   │   │   │   ├── dto/             # Request & Response DTOs
│   │   │   │   └── seeder/          # DataSeeder CommandLineRunner
│   │   │   └── resources/
│   │   │       ├── application.yml  # Multi-profile: demo (H2) & mysql
│   │   │       └── schema.sql       # 26-table DDL script for MySQL & H2
│   │   └── test/
│   └── data/                        # Persistent H2 file DB directory (if used)
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css                # Apple HIG tokens, typography, custom utilities
│   │   ├── types/                   # TypeScript interfaces mirroring DTOs
│   │   ├── services/                # Axios/fetch API clients
│   │   ├── components/              # Layout, Sidebar, Navbar, Toast, Modal, MetricCard
│   │   └── views/
│   │       ├── PatientView.tsx      # M1
│   │       ├── DoctorView.tsx       # M2
│   │       ├── AppointmentView.tsx  # M3
│   │       ├── PharmacyView.tsx     # M4
│   │       ├── BillingView.tsx      # M5
│   │       └── LaboratoryView.tsx   # M6
├── tests/
│   └── e2e/                         # Opaque-box E2E test suite (Tiers 1-4)
├── scripts/
│   └── simulate_git_history.sh      # 6-member authentic git history simulation
├── start.sh                         # 1-click startup script
└── DEMO_WALKTHROUGH.md              # 15-min viva presentation guide
```
