# PulseOS — SE2030 Progress Evaluation Walkthrough
**Batch 02 | Group 60 (`2026-Y2-S1-KU-60`)**
**Module**: SE2030 - Software Engineering Project | Progress Evaluation Phase 2  
**Format**: 15-Minute Live System Demonstration + 5-Minute Technical Q&A (No Slides Required)

---

## 🚀 Quick Launch (1-Click Run)

Before the evaluators call your group, run this single command in your terminal:
```bash
./start.sh
```
*Frontend loads automatically at*: **`http://localhost:5173`**  
*Backend REST API running at*: **`http://localhost:8080/api/v1`**  
*Live Database Console running at*: **`http://localhost:8080/h2-console`**  
*(JDBC URL: `jdbc:h2:mem:pulseos_db` | User: `sa` | Password: empty)*

---

## ⏱️ 15-Minute Demo Timeline & Speaking Scripts

```
[0:00 - 2:00]  Intro & Architecture ............ Kesaru (IT25103992)
[2:00 - 4:00]  M1: Patient Registry & Triage ... Dila (IT25103819)
[4:00 - 6:00]  M2: Doctor & Rostering .......... Kavinda (IT25103999)
[6:00 - 8:00]  M3: Appointments & Conflict ..... Chanul (IT25101620)
[8:00 - 10:00] M4: Pharmacy & Stock Deduction .. Harshika (IT25100826)
[10:00 - 12:00] M6: Laboratory Diagnostics ..... Nethuli (IT25103363)
[12:00 - 14:00] M5: Billing & PayHere Sandbox .. Kesaru (IT25103992)
[14:00 - 15:00] Live DB Proof & Q&A Handoff ... Team Wrap-up
```

---

### Segment 1: Introduction & System Architecture (0:00 – 2:00)
**Speaker**: Dhanasinghe K. A. K. H. (`IT25103992`) — Team Lead / Billing

#### 🎙️ Speaking Script:
> "Good morning/afternoon, lecturers and evaluators. We are Group 60 from Batch 02 presenting **PulseOS**, our web-based Hospital Management System developed for SE2030. 
> 
> Our architecture follows enterprise multi-tier principles:
> 1. **Frontend**: React 19 with TypeScript and Tailwind CSS, engineered following Apple Human Interface Guidelines and clinical ergonomics with zero generic templates. It features dual user experiences:
>    - **Public Hospital Portal & Patient Self-Service Hub**: where patients can view hospital services, consultant directories, personal medical history, lab test findings with abnormal flags, and settle bills online via PayHere.
>    - **Clinician & Administrative OS**: delivering focused workstations for Doctors, Registrars, Pharmacists, Lab Technologists, and Cashiers with zero UI clutter.
> 2. **Backend**: Spring Boot 3.2 on Java 17, implementing clean architectural layering across Entities, JPA Repositories, Services, and REST Controllers.
> 3. **Database Architecture**: Implements a 27-entity relational schema mirroring our official SE2030 EER diagram with Table-Per-Type inheritance, foreign key cascading, and dual-database compatibility. For this live evaluation, we run on an in-memory MySQL-compatible H2 engine pre-seeded with realistic clinical records, while also providing full MySQL production DDL in `schema.sql`.
>
> Now, my colleague Dila Somarathna will demonstrate Module 1: Patient Management."

---

### Segment 2: M1 — Patient Management & Triage (2:00 – 4:00)
**Speaker**: Somarathna P. G. D. S. (`IT25103819`)

#### 🖥️ UI Actions:
1. Click **Patients** in the left navigation sidebar.
2. Highlight the summary metrics card (Total Patients: 12, Emergency: 1, Urgent: 2).
3. Click the **Register New Patient** button in the top right.
4. Fill in the form:
   - First Name: `Kamal` | Last Name: `Gunaratne`
   - NIC / Passport: `199245102948`
   - DOB: `1992-06-15` | Blood Group: `O+` | Triage: `URGENT`
   - Contact Phone: `0771122334` | Allergies: `Penicillin`
5. Click **Register Patient**. Observe the immediate toast notification and the new patient appearing at the top of the table.
6. Type `1992` in the search bar to demonstrate real-time client-side search filtering.

#### 🎙️ Speaking Script:
> "I am Dila Somarathna (IT25103819), responsible for Module 1: Patient Management and Triage.
>
> In PulseOS, patient intake is designed with clinical safety first:
> - Every patient has a national identifier (NIC or Passport) with unique constraint validation.
> - We implement an active **Triage Prioritization System**—categorizing admissions into `ROUTINE`, `URGENT`, and `EMERGENCY` with high-visibility color tokens.
> - Critical clinical alerts, such as drug allergies and emergency next-of-kin contacts, are rendered directly in the clinical file to prevent prescription errors.
> - As you just saw, Kamal Gunaratne was registered in real time, validated across all schema constraints, and instantly indexed.
>
> Next, Kavinda Rathnayaka will present Module 2: Doctor and Department Management."

---

### Segment 3: M2 — Doctor & Department Management (4:00 – 6:00)
**Speaker**: Rathnayaka R. M. K. L. B. (`IT25103999`)

#### 🖥️ UI Actions:
1. Click **Doctors** in the left sidebar.
2. Point out the medical specialists cards (Cardiology, Neurology, Pediatrics, General Medicine).
3. Demonstrate filtering by department using the department tabs (`Cardiology`, `Neurology`, etc.).
4. Click on **Dr. Kavinda Rathnayaka**'s card to view consultation fee (`LKR 3,500.00`), license number (`SLMC-48291`), room number (`Room 204`), and weekly schedule slots.
5. Toggle the **Available / On Duty** status switch to demonstrate live availability updating.

#### 🎙️ Speaking Script:
> "I am Kavinda Rathnayaka (IT25103999), in charge of Module 2: Doctor and Department Management.
>
> In our database schema:
> - The `Doctor` entity inherits from `Employee`, which in turn inherits from the base `Person` superclass using JPA Joined Table Inheritance (`@Inheritance(strategy = InheritanceType.JOINED)`).
> - Each doctor profile encapsulates their SLMC medical license number, assigned clinical department, room allocation, consultation fee structure, and weekly shift blocks (`MORNING`, `EVENING`, `NIGHT`).
> - The status toggle communicates immediately with our REST endpoint to reflect whether the doctor is accepting OPD consultations or engaged in rounds.
>
> Now, Chanul Malwatta will demonstrate Module 3: Appointment Scheduling."

---

### Segment 4: M3 — Appointment Management & Conflict Prevention (6:00 – 8:00)
**Speaker**: Malwatta M.W.C.S (`IT25101620`)

#### 🖥️ UI Actions:
1. Click **Appointments** in the left sidebar.
2. Show today's schedule table showing statuses: `SCHEDULED`, `CONFIRMED`, `IN_CONSULTATION`, `COMPLETED`.
3. Click **Book Appointment** button:
   - Patient: Select `Sunethra Jayawardena`
   - Doctor: Select `Dr. Kavinda Rathnayaka (Cardiology)`
   - Date: Select today's date (`2026-09-14`)
   - Time: Choose `09:30 AM` (which already exists for Dr. Kavinda!)
   - Reason: `Routine checkup`
4. Click **Confirm Booking**.
5. **Notice the validation error toast**: `"Double Booking: Dr. Kavinda Rathnayaka already has an appointment at 2026-09-14 09:30"`.
6. Change time to `11:30 AM` and click **Confirm Booking**. The appointment is successfully created!

#### 🎙️ Speaking Script:
> "I am Chanul Malwatta (IT25101620), responsible for Module 3: Appointment Scheduling.
>
> A core requirement for high reliability in hospital operations is strict conflict resolution:
> - We enforce a composite unique constraint at both the database and service levels: `uq_doctor_slot (doctor_id, appointment_date, appointment_time)`.
> - As demonstrated, when I attempted to book Dr. Kavinda Rathnayaka at 09:30 AM—a slot already occupied by patient Nimal Perera—the system rejected the transaction and provided clear, human-readable feedback.
> - Shifting the slot to an available time allowed the transaction to commit cleanly.
>
> Harshika Udumullage will now present Module 4: Pharmacy and Inventory Management."

---

### Segment 5: M4 — Pharmacy & Real-Time Stock Deduction (8:00 – 10:00)
**Speaker**: Udumullage S.H.U. (`IT25100826`)

#### 🖥️ UI Actions:
1. Click **Pharmacy** in the left sidebar.
2. Show the Drug Formulary inventory table:
   - Note the **Stock Quantity**, **Reorder Level**, Batch Numbers, and Expiry Dates.
   - Point out **Losartan Potassium 50mg** and **Metformin HCl 500mg**.
   - Point out the low-stock indicator badge on medications near threshold.
3. Switch to the **Prescriptions & Dispensing** tab.
4. Point out the active prescriptions and show how dispensing deducts inventory quantities in real time with transactional integrity.
5. Click **Receive Drug Shipment**:
   - Generic Name: `Paracetamol` | Brand: `Panadol 500mg`
   - Quantity: `500` | Unit Price: `5.00` | Batch: `BAT-PAN-2026`
   - Click **Save Shipment**. Note the immediate catalog update.

#### 🎙️ Speaking Script:
> "I am Harshika Udumullage (IT25100826), presenting Module 4: Pharmacy and Inventory Management.
>
> Our pharmacy module manages the entire medication lifecycle:
> - Tracks batch numbers, expiry alerts, reorder levels, and unit pricing.
> - Prescriptions issued during consultations link directly to doctor orders.
> - When a pharmacist dispenses medications, our transactional service method validates stock availability, deducts quantities in real time, and logs individual dispensation records linking the dispensing pharmacist to the prescription items.
>
> Next, Nethuli Thilakarathne will present Module 6: Laboratory Diagnostics."

---

### Segment 6: M6 — Laboratory & Diagnostic Test Management (10:00 – 12:00)
**Speaker**: Thilakarathne H.S.K.P.N (`IT25103363`)

#### 🖥️ UI Actions:
1. Click **Laboratory** in the left sidebar.
2. Review the Diagnostic Worklist:
   - Test 1: `Lipid Profile` (Status: `COMPLETED`, Normal reference ranges shown).
   - Test 2: `Fasting Blood Sugar` (Status: `COMPLETED`, Flag: `ABNORMAL` in red).
   - Test 3: `Full Blood Count` (Status: `REQUESTED`).
3. Click on the action button on Test 3 (`Full Blood Count`):
   - Click **Collect Sample** -> status updates to `SAMPLE_COLLECTED`.
   - Click **Enter Results**:
     - Enter: `WBC: 12.8 x10^3/uL (Elevated), Hb: 11.2 g/dL (Low)`
     - Toggle: `Flag as Abnormal` = Checked
     - Technician Notes: `Specimen checked by Nethuli (SLMC Tech #1042)`
   - Click **Submit Diagnostic Report**.
4. Observe the badge update to `COMPLETED` with red `ABNORMAL` clinical tag.

#### 🎙️ Speaking Script:
> "I am Nethuli Thilakarathne (IT25103363), managing Module 6: Laboratory Diagnostics.
>
> Our lab module tracks clinical investigations through strict lifecycle states:
> 1. `REQUESTED`: Initiated by the attending physician during consultation.
> 2. `SAMPLE_COLLECTED`: Specimen drawn and verified by the phlebotomist.
> 3. `IN_ANALYSIS`: Running on diagnostic instruments.
> 4. `COMPLETED`: Verified by the lab technician with quantitative findings, reference range validation, and automated abnormal flags.
>
> Standard diagnostic fees are attached directly to each test type in the catalog, allowing seamless automated aggregation into the patient's final hospital invoice.
>
> Kesaru Dhanasinghe will now demonstrate Module 5: Billing, Invoicing, and PayHere Integration."

---

### Segment 7: M5 — Billing, Multi-Item Aggregation & PayHere Sandbox (12:00 – 14:00)
**Speaker**: Dhanasinghe K. A. K. H. (`IT25103992`)

#### 🖥️ UI Actions:
1. Click **Billing** in the left sidebar.
2. Show the Invoices table:
   - **Invoice 1 (`INV-2026-0001`)**: `LKR 7,890.00` — Status: `PAID`. Click to view the itemized breakdown: Doctor Consultation (`LKR 3,500`), Pharmacy Drugs (`LKR 2,190`), Lab Lipid Profile (`LKR 2,200`).
   - Show printable receipt preview modal.
3. Click on an unpaid or generated invoice (or click **Generate New Invoice** for an appointment).
4. Demonstrate settlement options:
   - **Option A: Counter Cash/Card Settlement**: Click **Settle Counter**, enter POS reference `POS-SL-2026`, and observe instant transition to `PAID`.
   - **Option B: PayHere Sandbox Gateway**: Click **Pay with PayHere**, showing the real-time calculated MD5 security hash (`merchant_id + order_id + amount + currency + merchant_secret`), opening the PayHere Sandbox modal/redirect ready for test Visa/Mastercard processing.

#### 🎙️ Speaking Script:
> "Returning to Module 5: Billing and Payment Management.
>
> Our billing engine solves a major problem in hospital administration by automating end-of-encounter financial aggregation:
> - An invoice automatically calculates: Doctor Consultation Fee + Dispensed Pharmacy Drugs + Completed Laboratory Diagnostic Tests, subtracting applicable insurance discounts.
> - We support dual payment channels:
>   1. Counter cash/card settlement with sequential receipt numbering.
>   2. **Live PayHere Sandbox Integration**: Generating HMAC/MD5 signature hashes verified against PayHere's security specifications, accepting test credit card numbers in LKR currency and receiving IPN webhooks to settle invoices asynchronously.
>
> Finally, let us look at the live database state."

---

### Segment 8: Live Database Inspection & Q&A Handoff (14:00 – 15:00)
**Speaker**: All Team Members

#### 🖥️ UI Actions:
1. Open a new browser tab to: **`http://localhost:8080/h2-console`**
2. Click **Connect** (JDBC URL: `jdbc:h2:mem:pulseos_db`, User: `sa`).
3. In the SQL query window, run:
   ```sql
   SELECT * FROM appointments;
   SELECT * FROM invoices;
   SELECT * FROM drugs WHERE drug_id IN (12, 16);
   ```
4. Show the live database tables with all rows updated from the actions performed during the demonstration.
5. In your terminal, run:
   ```bash
   git log --graph --oneline --decorate -n 15
   ```
   Show the clean feature-branch commits from all 6 team members.

#### 🎙️ Speaking Script:
> "To conclude our demonstration:
> As you can see in the live database console, every operation performed in our UI directly persisted into our relational schema. Furthermore, our Git commit history reflects authentic, parallel feature-branch contributions from each of our 6 team members.
>
> We are now ready for your questions. Thank you!"

---

## 💡 Examiner Q&A Cheat Sheet

| Question | Recommended Answer |
| :--- | :--- |
| **How did you handle entity inheritance in your schema?** | We used JPA Joined Table Inheritance (`@Inheritance(strategy = InheritanceType.JOINED)`). The superclass `Person` holds shared attributes (`first_name`, `last_name`, `nic_passport`), joined to `Employee` and `Patient`, and further joined to specialized roles like `Doctor`, `Pharmacist`, `LabTechnician`. |
| **How do you prevent race conditions or double booking?** | We enforce this at two layers: (1) In the database with a composite unique constraint `uq_doctor_slot (doctor_id, appointment_date, appointment_time)`; (2) In `AppointmentService` with synchronized slot pre-checks throwing a `PulseException.badRequest("Double Booking", ...)` before insert. |
| **How is stock integrity guaranteed when dispensing?** | `PharmacyService.dispensePrescription()` is annotated with `@Transactional`. If any drug in a multi-item prescription has insufficient stock, an exception is thrown, causing an immediate transaction rollback so no partial deductions occur. |
| **How does PayHere security work?** | We generate an MD5 checksum using `merchant_id + order_id + amount + currency + md5(merchant_secret)`. PayHere verifies this hash before opening checkout. Upon payment completion, PayHere sends a signed IPN webhook to `/api/v1/payments/payhere/notify` where we verify `md5sig` before marking the invoice as `PAID`. |
| **Why did you choose React 19 + Tailwind over pre-made templates?** | Templates often suffer from bloated dependencies, accessibility issues, and clunky state synchronization. By custom-building our UI using Apple HIG and clinical ergonomics, we achieved sub-second page loads, responsive feedback, and direct API alignment across all 6 modules. |
