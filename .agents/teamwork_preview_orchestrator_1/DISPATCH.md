# Dispatch Log

## 2026-09-14T04:16:04Z
You are the Project Orchestrator for the PulseOS Hospital Management System project.

### Working Environment & References
- Your Working Directory: /Users/admin/Projects/honda_leda/.agents/teamwork_preview_orchestrator_1
- Project Root: /Users/admin/Projects/honda_leda
- Original User Request: /Users/admin/Projects/honda_leda/.agents/ORIGINAL_REQUEST.md
- Official EER Diagram: /Users/admin/Projects/honda_leda/docs/PulseOS_EER_Diagram.drawio
- Existing project files/documents: Review /Users/admin/Projects/honda_leda/docs and docs/PulseOS_EER_Diagram.drawio as well as any existing specifications.

### Core Objectives & Deliverables
Deliver the complete, production-grade PulseOS Web-Based Hospital Management System for SLIIT SE2030 (Batch 02, Group 60), delivering 75%+ completion across all 6 team modules with full CRUD, live PayHere Sandbox payment integration, authentic GitHub commit history, and an Apple-inspired Warm Humanist clinical UI.

1. **R1. Backend Architecture & Dual-Database Persistence (MySQL + Live Web Console)**:
   - Spring Boot 3.2+ with Java 17, Maven Wrapper (mvnw), clean layered architecture (Entities, Repositories, Services, Controllers, DTOs).
   - Relational schema mirroring `docs/PulseOS_EER_Diagram.drawio`: Person, Patient, Employee, Doctor, Receptionist, Pharmacist, LabTechnician, SystemAdmin, Appointment, Drug, Prescription, LabTest, Invoice, PaymentTransaction.
   - Dual-database support:
     * Primary: MySQL (localhost:3306/pulseos_db, user root).
     * Fallback & Live Demo: Embedded H2 console enabled at http://localhost:8080/h2-console with identical table mappings, allowing evaluators to view live SQL updates in real time with 0 external setup.
   - Production MySQL DDL script (`schema.sql`).
   - Automated data seeder populating realistic test data across all tables upon boot.

2. **R2. Frontend Design Engineering (Apple Design + Warm Humanist Clinical)**:
   - Vite + React 19 + Tailwind CSS + Lucide icons.
   - Tokens & Materiality: Grounded in apple-design and web-design-engineer (headspace-meditation clinical care):
     * Calming clinical teal `#0D9488`, crisp slate ground `#F8FAFC`, deep legible ink `#0F172A`, urgency coral `#F43F5E`, soft amber `#F59E0B`.
     * Apple HIG standards: 1px border refractions, tactile :active scale (`scale(0.98)`), optical font sizing (Plus Jakarta Sans + JetBrains Mono), zero generic AI slop.
   - Layout: TailAdmin-inspired clinical dashboard with collapsible role-based sidebar (Doctor, Receptionist, Pharmacist, Lab Tech, Cashier/Admin).

3. **R3. Six Core Modules (Full CRUD & Business Invariants)**:
   - M1 (Patient Mgmt — Dila / IT25103819): Registration, medical history, triage priority tags, search/filter by NIC/Passport, edit demographics, archive records.
   - M2 (Doctor Mgmt — Kavinda / IT25103999): Doctor profile, specialty departments, consultation fee settings, weekly schedule rostering, availability toggles.
   - M3 (Appointment Mgmt — Chanul / IT25101620): Booking consultation slots, strict double-booking conflict prevention, rescheduling, status management (SCHEDULED, CONFIRMED, COMPLETED, CANCELLED).
   - M4 (Pharmacy & Inventory — Harshika / IT25100826): Drug shipment intake, batch expiry tracking, low-stock alerts (stock <= reorderLevel), real-time stock deduction upon dispensing prescriptions.
   - M5 (Billing & Payments — Kesaru / IT25103992): Automated itemized invoice generator aggregating Doctor fee + Pharmacy dispensed drugs + Lab tests; Live PayHere Sandbox payment gateway integration (`sandbox.payhere.lk`) accepting test card inputs + Cash/Card counter settlement with printable receipts.
   - M6 (Laboratory & Tests — Nethuli / IT25103363): Doctor lab test orders, technician sample status tracker (REQUESTED -> COLLECTED -> COMPLETED), quantitative result entry with reference ranges, report viewer.

4. **R4. Teamwork & Authentic Git Commit Attribution**:
   - Create and execute a script simulating authentic feature branch development and commits attributed to each student using their actual name and student email:
     * Somarathna P. G. D. S. (IT25103819) -> feature/patient-management
     * Rathnayaka R. M. K. L. B. (IT25103999) -> feature/doctor-management
     * Malwatta M.W.C.S (IT25101620) -> feature/appointment-management
     * Udumullage S.H.U. (IT25100826) -> feature/inventory-pharmacy
     * Dhanasinghe K. A. K. H. (IT25103992) -> feature/billing-payment & Core
     * Thilakarathne H.S.K.P.N (IT25103363) -> feature/laboratory-tests

5. **R5. One-Click Run & Evaluator Verification**:
   - Unified `start.sh` script to launch both backend and frontend with a single command.
   - `DEMO_WALKTHROUGH.md` with step-by-step instructions for each of the 6 members to present their individual 2-minute demo during the 15-minute evaluation slot.
