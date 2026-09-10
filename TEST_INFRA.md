# PulseOS End-to-End (E2E) Test Infrastructure & Methodology Specification

**Project**: PulseOS Web-Based Hospital Management System (SLIIT SE2030 Group 60)  
**Document Version**: 1.0.0  
**Author**: E2E Test Suite Architect & Writer (`test_writer_e2e_1`)  
**Target Architecture**: Spring Boot 3.2+ REST API (`http://localhost:8080/api/v1`) & React 19 Frontend  
**Classification**: Test Infrastructure Architecture & Quality Engineering Baseline

---

## 1. Test Philosophy: Opaque-Box & Requirement-Driven

PulseOS adopts a strict **opaque-box (black-box), requirement-driven test philosophy**.
The E2E test suite interacts exclusively with the public HTTP REST interfaces exposed by the backend:
- **Zero Internal Coupling**: Tests do not access internal JPA entity managers, private service methods, or internal memory states. They perceive the system exactly as external clients, clinical frontend applications, and the PayHere payment gateway do.
- **Contract Fidelity**: Every request payload, response schema, HTTP status code (200, 201, 400, 404, 409), and error feedback structure is validated against the formal API contracts defined in `PROJECT.md` and `docs/PulseOS_EER_Diagram.drawio`.
- **Idempotency & Isolation**: Each test case provisions its required test fixtures or operates on isolated identifiers, ensuring that test execution order does not cause cascade failures.
- **Dual-Mode Execution**: The test suite can run directly against the live Spring Boot service on `http://localhost:8080/api/v1` or against a high-fidelity embedded mock server for isolated verification and continuous quality validation.

---

## 2. Comprehensive 4-Tier Testing Methodology

PulseOS E2E testing is organized into four hierarchical validation tiers:

```
┌─────────────────────────────────────────────────────────────┐
│ Tier 4: Real-World Scenarios (Full Patient Clinical Journeys) │
├─────────────────────────────────────────────────────────────┤
│ Tier 3: Pairwise & Cross-Module Combinations (Rx/Lab/Billing)│
├─────────────────────────────────────────────────────────────┤
│ Tier 2: Boundary, Corner & Negative Exception Scenarios     │
├─────────────────────────────────────────────────────────────┤
│ Tier 1: Core Feature CRUD Coverage across All 6 Modules     │
└─────────────────────────────────────────────────────────────┘
```

---

### 2.1 Tier 1: Feature Coverage (Core Functional Capabilities)
Validates primary happy paths, state queries, and CRUD functionality across all six modules with at least 5 distinct test cases per module (>= 30 tests total):

1. **Patient Management (M1)**:
   - `T1-PAT-01`: Register new patient with complete demographic and emergency contact details.
   - `T1-PAT-02`: Retrieve patient by ID and verify exact demographic fields.
   - `T1-PAT-03`: Query patient by unique NIC/Passport number.
   - `T1-PAT-04`: Update patient address, phone, and medical allergies notes.
   - `T1-PAT-05`: Filter patient registry by triage priority tag (`ROUTINE`, `URGENT`, `EMERGENCY`).

2. **Doctor Management (M2)**:
   - `T1-DOC-01`: Create doctor profile with SLMC license, specialization, and room number.
   - `T1-DOC-02`: Retrieve doctor profile by employee ID.
   - `T1-DOC-03`: Update doctor consultation fee settings and verify persisted change.
   - `T1-DOC-04`: Toggle doctor clinical availability (`isAvailable = true/false`).
   - `T1-DOC-05`: Configure weekly consultation schedule roster slots.

3. **Appointment Management (M3)**:
   - `T1-APT-01`: Book consultation slot for valid patient and available doctor.
   - `T1-APT-02`: Retrieve appointment details with patient and doctor association.
   - `T1-APT-03`: Query appointments by doctor ID and scheduled appointment date.
   - `T1-APT-04`: Reschedule appointment to a new available time slot.
   - `T1-APT-05`: Advance appointment lifecycle status (`SCHEDULED` -> `CONFIRMED` -> `COMPLETED`).

4. **Pharmacy & Inventory (M4)**:
   - `T1-PHM-01`: Intake drug shipment with batch number, unit price, and expiry date.
   - `T1-PHM-02`: Query drug inventory by SKU item code and category.
   - `T1-PHM-03`: Update drug stock count and unit pricing.
   - `T1-PHM-04`: Issue prescription for appointment encounter with prescribed items.
   - `T1-PHM-05`: Dispense prescription medication and verify atomic stock deduction.

5. **Billing & Payments / PayHere (M5)**:
   - `T1-BIL-01`: Automatically generate itemized invoice aggregating consultation and services.
   - `T1-BIL-02`: Retrieve itemized invoice details with item breakdown (Doctor, Drugs, Labs).
   - `T1-BIL-03`: Initiate PayHere checkout and verify MD5 signature generation.
   - `T1-BIL-04`: Process successful PayHere webhook notification with status transition to `PAID`.
   - `T1-BIL-05`: Execute counter settlement via Cash with receipt generation.

6. **Laboratory & Diagnostic Tests (M6)**:
   - `T1-LAB-01`: Retrieve standard diagnostic lab test catalog (Lipid, Troponin, CBC, FBS).
   - `T1-LAB-02`: Doctor creates lab test request linked to clinical appointment encounter.
   - `T1-LAB-03`: Retrieve lab request details by order tracking number.
   - `T1-LAB-04`: Lab technician collects biological sample (`REQUESTED` -> `SAMPLE_COLLECTED`).
   - `T1-LAB-05`: Enter quantitative clinical test result and verify status transition to `COMPLETED`.

---

### 2.2 Tier 2: Boundary & Corner Cases (Robustness & Error Guards)
Validates system invariants, validation rules, duplicate rejections, and defensive failure handling with at least 5 test cases per module (>= 30 tests total):

1. **Patient Management Boundaries (M1)**:
   - `T2-PAT-01`: Duplicate NIC/Passport registration is rejected with HTTP 400/409 Conflict.
   - `T2-PAT-02`: Empty or malformed mandatory fields (e.g. blank name or invalid email) trigger validation errors.
   - `T2-PAT-03`: Special characters, control strings, and SQL injection payloads are properly sanitized/handled.
   - `T2-PAT-04`: Future date of birth is rejected by business validation.
   - `T2-PAT-05`: Fetching non-existent patient returns HTTP 404 with structured error feedback.

2. **Doctor Management Boundaries (M2)**:
   - `T2-DOC-01`: Duplicate SLMC medical license registration is rejected.
   - `T2-DOC-02`: Negative consultation fee is rejected with validation constraint failure.
   - `T2-DOC-03`: Schedule configuration with end time earlier than start time is rejected.
   - `T2-DOC-04`: Setting zero or negative slot duration minutes is rejected.
   - `T2-DOC-05`: Updating fee on non-existent doctor returns HTTP 404.

3. **Appointment Boundaries (M3)**:
   - `T2-APT-01`: Strict double-booking rejection: Booking same doctor at overlapping date and time fails with HTTP 409.
   - `T2-APT-02`: Booking appointment for non-existent doctor or patient is rejected with HTTP 404/400.
   - `T2-APT-03`: Rescheduling into an already-occupied slot is rejected with conflict error.
   - `T2-APT-04`: Booking consultation with doctor marked unavailable (`isAvailable = false`) is rejected.
   - `T2-APT-05`: Invalid lifecycle transition (e.g. from `CANCELLED` directly to `COMPLETED`) is rejected.

4. **Pharmacy & Inventory Boundaries (M4)**:
   - `T2-PHM-01`: Dispensing medication when stock is zero is rejected with "Insufficient stock" error.
   - `T2-PHM-02`: Dispensing quantity strictly greater than available stock count is blocked atomically.
   - `T2-PHM-03`: Dispensing expired batch medication is prevented with clinical safety guard.
   - `T2-PHM-04`: Low-stock boundary condition: Stock falling below or equal to `reorderLevel` triggers alert.
   - `T2-PHM-05`: Negative drug inventory or unit price is rejected by schema check constraints.

5. **Billing & PayHere Boundaries (M5)**:
   - `T2-BIL-01`: PayHere webhook with tampered/invalid MD5 signature is rejected with HTTP 400 (`INVALID_SIGNATURE`).
   - `T2-BIL-02`: PayHere webhook with mismatched currency or amount is rejected.
   - `T2-BIL-03`: Settling an invoice that is already `PAID` is rejected as redundant/conflicting.
   - `T2-BIL-04`: Counter settlement with payment amount less than total due is rejected (underpayment guard).
   - `T2-BIL-05`: Generating invoice for non-existent appointment returns HTTP 404.

6. **Laboratory Boundaries (M6)**:
   - `T2-LAB-01`: Quantitative result exceeding upper normal range triggers automatic `HIGH` clinical flag.
   - `T2-LAB-02`: Quantitative result below lower normal range triggers automatic `LOW` clinical flag.
   - `T2-LAB-03`: Submitting test results before biological sample collection is rejected (`Illegal State`).
   - `T2-LAB-04`: Ordering diagnostic test with non-existent catalog test ID returns HTTP 404.
   - `T2-LAB-05`: Duplicate result entry on already-completed lab request is rejected.

---

### 2.3 Tier 3: Pairwise & Cross-Module Combinations
Validates interdependent workflows where state changes in one module propagate across domain boundaries:

- `T3-PAIR-01 (Appointment -> Rx -> Inventory)`:
  Appointment booked -> Doctor prescribes 30 units of Atorvastatin -> Pharmacist dispenses -> Verify drug inventory decreased by exactly 30 units -> Prescription status is `DISPENSED`.
- `T3-PAIR-02 (Appointment -> Lab -> Result -> Invoice)`:
  Appointment booked -> Doctor orders Lipid Profile (Rs. 2400) -> Lab collects sample & inputs quantitative result -> Billing generates invoice -> Verify line items include Doctor Consultation Fee + Lab Test Fee (Rs. 2400).
- `T3-PAIR-03 (Doctor Fee Update -> Invoice Reflection)`:
  Doctor fee updated from Rs. 2500 to Rs. 3500 -> New appointment booked -> Generated invoice reflects new consultation fee of Rs. 3500.
- `T3-PAIR-04 (Patient Demographics -> Appointment & Billing Integrity)`:
  Patient intake created -> Soft-archived -> Booking appointment on archived patient is rejected -> Patient restored -> Appointment booked successfully.
- `T3-PAIR-05 (Drug Batch Expiry -> Alternative Stock Selection)`:
  Drug batch expired -> Dispensing blocked -> Second non-expired batch selected -> Dispensing succeeds with valid stock deduction.
- `T3-PAIR-06 (Full Encounter Aggregation: Doctor + Pharmacy + Lab -> Settle)`:
  Appointment + Prescription (Rs. 1350) + Lab Test (Rs. 3200) + Doctor Fee (Rs. 2500) -> Invoice generated with Total = Rs. 7050 -> Paid via PayHere -> PaymentTransaction logged.

---

### 2.4 Tier 4: Real-World Scenarios (End-to-End Patient Journeys)
Validates complete clinical user journeys that mirror a patient's physical and financial passage through PulseOS:

- `T4-SCEN-01 (Full Emergency Encounter Journey)`:
  1. Patient presents at triage with acute chest pain -> Registered with `EMERGENCY` priority.
  2. Scheduled immediately with Consultant Cardiologist Dr. Kavinda.
  3. Doctor examines patient, orders STAT High-Sensitivity Troponin-I assay and prescribes Clopidogrel.
  4. Lab Technician receives urgent order, marks sample collected, enters quantitative troponin value (0.02 ng/mL - Normal).
  5. Pharmacist dispenses 30 tablets of Clopidogrel -> Inventory decremented.
  6. Finance cashier generates aggregated encounter invoice.
  7. Patient pays via PayHere Sandbox checkout modal -> Webhook confirms payment -> Receipt printed.
- `T4-SCEN-02 (Routine Consultation & Counter Cash Settlement)`:
  Routine patient intake -> Consultation appointment -> Routine FBS lab test -> Result logged -> Itemized invoice generated -> Counter cash payment -> Status marked `PAID`.
- `T4-SCEN-03 (Pediatric Acute Care with Parent Emergency Contact)`:
  Child patient registered with parent emergency contact -> Pediatric consultation -> Antibiotic prescribed -> Pharmacy fulfills -> Low stock alert flagged when stock drops below reorder level -> Paid.
- `T4-SCEN-04 (Appointment Scheduling, Rescheduling & Cancellation Cycle)`:
  Consultation slot booked -> Rescheduled to alternative date/time -> Slot verified free on original time -> Cancelled -> Status transitioned to `CANCELLED`.
- `T4-SCEN-05 (Cryptographic Security & Tamper Detection)`:
  PayHere checkout initiated -> Malicious callback with modified amount and bogus MD5 signature attempted -> Webhook detects mismatch, rejects payment with 400 Bad Request -> Legitimate signature sent -> Payment accepted.

---

## 3. Directory Layout & Test Suite Organization

```
/Users/admin/Projects/honda_leda/tests/e2e/
├── config.mjs                       # Runtime configuration (target URL, timeout, PayHere secret)
├── mock_server.mjs                  # High-fidelity embedded mock server (matches Spring Boot)
├── run_tests.sh                     # Unified single-command test runner
├── runner.mjs                       # Orchestrator running all test suites with detailed reporting
├── package.json                     # Test suite package descriptor
├── utils/
│   ├── http_client.mjs              # HTTP client wrapper with status and schema assertions
│   ├── payhere_crypto.mjs           # PayHere MD5 cryptographic hash calculator & validator
│   └── test_framework.mjs           # Zero-dependency test runner & assertion engine
├── tier1_features/
│   ├── patient.test.mjs             # M1 Feature Tests (5 tests)
│   ├── doctor.test.mjs              # M2 Feature Tests (5 tests)
│   ├── appointment.test.mjs         # M3 Feature Tests (5 tests)
│   ├── pharmacy.test.mjs            # M4 Feature Tests (5 tests)
│   ├── billing.test.mjs             # M5 Feature Tests (5 tests)
│   └── laboratory.test.mjs          # M6 Feature Tests (5 tests)
├── tier2_boundaries/
│   ├── patient_boundaries.test.mjs  # M1 Boundary Tests (5 tests)
│   ├── doctor_boundaries.test.mjs   # M2 Boundary Tests (5 tests)
│   ├── appointment_boundaries.test.mjs # M3 Boundary Tests (5 tests)
│   ├── pharmacy_boundaries.test.mjs # M4 Boundary Tests (5 tests)
│   ├── billing_boundaries.test.mjs  # M5 Boundary Tests (5 tests)
│   └── laboratory_boundaries.test.mjs # M6 Boundary Tests (5 tests)
├── tier3_pairwise/
│   ├── appointment_prescription_inventory.test.mjs
│   ├── appointment_lab_invoice.test.mjs
│   ├── fee_change_invoice.test.mjs
│   ├── patient_archive_lifecycle.test.mjs
│   └── batch_expiry_dispensing.test.mjs
└── tier4_scenarios/
    ├── full_patient_journey.test.mjs
    ├── routine_counter_settlement.test.mjs
    ├── pediatric_acute_care.test.mjs
    ├── schedule_reschedule_lifecycle.test.mjs
    └── fraud_detection_payhere.test.mjs
```

---

## 4. Execution Commands

### Single-Command Run (All Tiers):
```bash
bash /Users/admin/Projects/honda_leda/tests/e2e/run_tests.sh
```

### Run against Live Spring Boot Backend (default port 8080):
```bash
BASE_URL=http://localhost:8080/api/v1 bash tests/e2e/run_tests.sh --live
```

### Run against Standalone Embedded Mock Server:
```bash
bash tests/e2e/run_tests.sh --mock
```

---

## 5. Exit Code & Verification Standards
- **Exit Code 0**: 100% of test cases across Tiers 1–4 passed with zero assertion failures.
- **Exit Code 1**: One or more test assertions failed, network unreachable, or contract violated.
- **Summary Report**: Test runner outputs a complete formatted table listing test count per tier, pass/fail status, and execution duration.
