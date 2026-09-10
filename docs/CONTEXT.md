# Domain Model Glossary: PulseOS Hospital Management System

This document captures the ubiquitous language and domain entities for **PulseOS** (SE2030 Group 60 / KU-60).

---

## 1. Core Personas & Roles

- **Patient**: An individual receiving medical care, diagnostic evaluation, or pharmaceuticals within the hospital. Identified globally by `PatientID` and national `NIC_PassportNo`.
- **Employee**: Any member of hospital staff. Superclass for specialized roles.
  - **Doctor / Physician**: Licensed medical practitioner who conducts consultations, diagnoses medical conditions, issues prescriptions, and orders laboratory tests.
  - **Receptionist**: Front-desk officer responsible for patient intake registration, booking appointment slots, and printing billing summaries.
  - **Pharmacist**: Healthcare professional responsible for dispensing prescribed medications, monitoring drug stock levels, logging batch expiry dates, and verifying prescription authenticity.
  - **Lab Technician**: Clinical specialist responsible for collecting pathology/radiology specimens, performing diagnostic tests, and recording structured result data.
  - **System Administrator**: Manages employee credentials, role-based access control (RBAC), and monitors immutable audit trails.

---

## 2. Six Core Module Boundaries

### M1: Patient Management (Owner: Somarathna P. G. D. S. — IT25103819)
- **Patient Profile**: Core demographic and emergency contact entity (`firstName`, `lastName`, `dob`, `gender`, `contactNumbers`, `address`, `bloodGroup`, `allergies`).
- **Medical History Record**: Chronological clinical history linked to a patient including chronic conditions, past surgeries, and ongoing treatments.
- **Triage Priority**: Priority status upon intake (`ROUTINE`, `URGENT`, `EMERGENCY`).

### M2: Doctor Management (Owner: Rathnayaka R. M. K. L. B. — IT25103999)
- **Doctor Profile**: Professional metadata including `licenseNumber`, `specialization` (e.g. Cardiology, Pediatrics, General Medicine), `consultationFee`, and contact details.
- **Duty Roster / Availability**: Weekly scheduled consultation time slots (`dayOfWeek`, `startTime`, `endTime`, `maxPatientsPerSlot`, `status: AVAILABLE | ON_LEAVE | EMERGENCY_CALL`).

### M3: Appointment Management (Owner: Malwatta M.W.C.S — IT25101620)
- **Appointment Booking**: Scheduled encounter linking one `Patient` to one `Doctor` at a specific date and time slot.
- **Appointment Status**: Lifecycle progression: `SCHEDULED` -> `CONFIRMED` -> `IN_CONSULTATION` -> `COMPLETED` (or `CANCELLED` / `NO_SHOW`).
- **Double-Booking Guard**: Strict domain invariant: A doctor cannot have two active appointments with overlapping time slots.

### M4: Inventory & Pharmacy Management (Owner: Udumullage S.H.U. — IT25100826)
- **Drug Item**: Pharmaceutical item (`drugId`, `name`, `brandName`, `dosageForm`, `unitPrice`, `stockQuantity`, `reorderLevel`, `expiryDate`).
- **Dispense Transaction**: The act of fulfilling a doctor's prescription, deducting stock in real-time, and recording unit sale price.
- **Low Stock Alert**: Automatic domain threshold trigger when `stockQuantity <= reorderLevel`.

### M5: Billing & Payment Management (Owner: Dhanasinghe K. A. K. H. — IT25103992)
- **Invoice**: Financial document aggregating all billable events for a patient encounter.
  - Doctor Consultation Fee
  - Pharmacy Dispensed Drugs subtotal
  - Laboratory Diagnostic Tests subtotal
- **Invoice Status**: `DRAFT` -> `PENDING` -> `PAID` -> `VOIDED`.
- **Payment Transaction**: Settlement record (`transactionId`, `paymentMethod: CASH | CREDIT_CARD | PAYHERE_GATEWAY`, `amountPaid`, `paymentDate`, `receiptNumber`).

### M6: Laboratory & Test Management (Owner: Thilakarathne H.S.K.P.N — IT25103363)
- **Lab Test Request**: Doctor-ordered investigation (`testId`, `testType: BLOOD | URINE | BIOCHEMISTRY | RADIOLOGY`, `urgency: ROUTINE | STAT`).
- **Lab Test Result**: Verified analytical outcome (`testResultData`, `referenceRange`, `technicianNotes`, `conductedDate`, `status: REQUESTED | SAMPLE_COLLECTED | PROCESSING | COMPLETED`).

---

## 3. Cross-Cutting Aggregation: Consultation Encounter

An atomic consultation event that binds `Patient`, `Doctor`, and `Appointment`:
- Generates 0..* `Prescription` items (which link to Pharmacy Dispensing).
- Generates 0..* `LabTestRequest` items (which link to Laboratory results).
- Transmits final itemized charges directly into the `Invoice` aggregation.
