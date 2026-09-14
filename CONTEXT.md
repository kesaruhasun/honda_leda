# PulseOS Domain Model & Glossary (CONTEXT.md)

This document defines the strict ubiquitous language, architectural boundaries, and domain rules for the PulseOS Hospital Management System. It must be adhered to by all developers and AI agents working on this repository to prevent domain confusion.

## 1. Core Domain Glossary

| Term | Strict Definition | Anti-Patterns (Do NOT use) |
| :--- | :--- | :--- |
| **Patient** | The individual receiving medical care, authenticated via NIC/Passport. | *User, Client, Customer* |
| **Physician** | A registered medical consultant (Doctor) who conducts encounters and prescribes treatments. | *Staff, Employee (when referring strictly to medical roles)* |
| **Clinical Encounter** | A booked and confirmed timeslot where a Patient meets a Physician. Includes the physical/virtual meeting. | *Booking, Meeting, Session* |
| **Appointment** | The scheduling record for a Clinical Encounter. Managed by the Receptionist or Patient Portal. | *Reservation, Ticket* |
| **Prescription** | A physician's order for medication, generated during a Clinical Encounter, fulfilled at the Dispensary. | *Meds, Drug Order, Script* |
| **Dispensary** | The hospital pharmacy module where inventory is managed and prescriptions are fulfilled. | *Shop, Store, Pharmacy (Use 'Dispensary' for the module)* |
| **Invoice** | The final aggregated bill combining Consultation Fees, Dispensary charges, and Lab Test charges. | *Bill, Check, Receipt* |
| **Triage Priority** | The clinical urgency level assigned to a patient upon registration (e.g., ROUTINE, URGENT, EMERGENCY). | *Status, Level, Rank* |

## 2. Security & Role Boundaries

The system is strictly partitioned into two operational environments:

### The Patient Portal (`/patient/*`)
- **Authentication:** NIC/Passport + Password.
- **State Management:** Session Storage (`currentPatientId`, `currentPatientNic`).
- **Allowed Actions:** Book appointments, view personal medical history, view own prescriptions.

### The Clinical Staff Dashboard (`/dashboard/*`)
- **Authentication:** Staff ID + Password.
- **State Management:** React Context (`RoleContext` -> `currentRole`).
- **Role Isolation:**
  - `CASHIER_ADMIN`: Has god-mode access (e.g., creating new Physicians, processing Payments).
  - `DOCTOR`: Can view Rosters, update their own Consultation Fee, write Prescriptions.
  - `RECEPTIONIST`: Can manage Patient Registry and Appointments.
  - `PHARMACIST`: Manages Dispensary Inventory and Prescription fulfillment.
  - `LAB_TECHNICIAN`: Updates Diagnostic Test statuses.

## 3. Database Architecture (Dual-Persistence)

- **Production Target:** MySQL (`pulseos_db`) via `jdbc:mysql://localhost:3306/pulseos_db`. Active via the `mysql` Spring profile.
- **Presentation Target:** Embedded H2 (`pulseos_db`) acting in STRICT MySQL compatibility mode. Active via the `demo` Spring profile. 
- **DBA Access:** Regardless of the active profile, the database can be inspected in the browser via `/db-console`.

## 4. UI/UX Materiality Guidelines (Apple Design)

All frontend components must adhere to the `apple-design` skill parameters:
1. **No Generic Dark Mode:** Unless explicitly requested by the user for accessibility, the application defaults to crisp, light interfaces (`bg-slate-50`, `bg-white`).
2. **Surfaces & Borders:** Use 1px borders (`border-slate-200`) and soft shadows (`shadow-sm`, `shadow-md`) to define materiality. 
3. **Typography:** Rely on optical font sizing, using bold tracking for headers (`tracking-tight`) and muted colors for secondary text (`text-slate-500`).
4. **Clinical Palette:** Primary interactive elements utilize Clinical Teal (`#0D9488` / `text-clinical-teal-600`), signifying healing, clarity, and precision.
