# PulseOS — SE2030 Viva & Technical Evaluation Question Bank
**SLIIT Batch 02 | Group 60 (`2026-Y2-S1-KU-60`)**
**Module**: SE2030 - Software Engineering Project
**Subject**: In-Depth Technical Defense, Architectural Decisions, and Individual Module Q&A

---

## Part 1: Overall System Architecture & Engineering Questions
*(Evaluators frequently direct these to the Team Lead — Kesaru, or ask any team member to test system understanding)*

### Q1: "Explain your high-level architecture and why you chose Spring Boot + React instead of a traditional monolith or PHP/JSP."
> **Answer**:  
> "PulseOS is structured as a decoupled, multi-tier enterprise clinical application:
> 1. **Client Tier (React 19 + TypeScript + Vite)**: Provides a responsive, type-safe Single Page Application (SPA) adhering to Apple Human Interface Guidelines. It separates the public patient portal from the clinician workstations, ensuring zero UI clutter.
> 2. **Application Tier (Spring Boot 3.2 on Java 17)**: Employs clean layered architecture (**Controller → Service → Repository → Entity**). The API is completely stateless and RESTful, utilizing JSON payloads and strict HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `409 Conflict`).
> 3. **Data Tier**: Uses Spring Data JPA (Hibernate) with a 27-entity relational schema mapped from our official SE2030 EER diagram. We implemented dual-database support: an in-memory MySQL-compatible H2 engine for rapid zero-config evaluation, and production MySQL with foreign key constraints.
>
> We chose this decoupled architecture over PHP/JSP to ensure high maintainability, independent frontend-backend scaling, testability, and enterprise-grade concurrency control."

---

### Q2: "How do you handle database persistence and why are you able to show the database in DBeaver/H2 Console?"
> **Answer**:  
> "We configured dual database profiles in `application.yml`:
> - **Demo Profile (`demo`)**: Runs an embedded H2 database in MySQL compatibility mode (`MODE=MySQL;DATABASE_TO_LOWER=TRUE`). We activated an **H2 TCP Server on port 9092** (`H2TcpServerConfig.java`), which lets external database tools like **DBeaver** connect directly via `jdbc:h2:tcp://localhost:9092/mem:pulseos_db`, alongside the browser console at `/h2-console`.
> - **Production Profile (`mysql`)**: Connects to MySQL on `localhost:3306/pulseos_db` using the schema DDL in `schema.sql`.
> - Both profiles run through the exact same JPA Entities, ensuring complete parity between evaluation mode and production."

---

### Q3: "What Design Patterns did your team implement in this project?"
> **Answer**:  
> "We implemented multiple enterprise Gang of Four (GoF) and architectural patterns:
> 1. **Repository Pattern**: Abstracting data access using Spring Data JPA repositories (`PatientRepository`, `AppointmentRepository`, etc.).
> 2. **Data Transfer Object (DTO) Pattern**: Separating presentation data from persistence entities (`PatientDTOs`, `AppointmentDTOs`, `BillingDTOs`), preventing over-fetching and protecting internal entity states.
> 3. **Service Layer Pattern**: Encapsulating clinical business logic inside `@Service` classes with `@Transactional` boundaries.
> 4. **Strategy / Adapter Pattern**: Implemented in `BillingService` and `PayHereSecurityUtil` to handle multiple payment mechanisms (PayHere Sandbox Card vs. Counter Cash vs. Bank Deposit Receipt).
> 5. **Controller-Advice / Global Exception Pattern**: Handled centrally via `GlobalExceptionHandler` and `PulseException`."

---

## Part 2: Module-by-Module Technical Questions

---

### Module 1: Patient Management & Clinical Triage
**Assigned Student**: Somarathna P. G. D. S. (`IT25103819` / Dila)

#### Q1.1: "How do you ensure unique patient identification across the entire hospital system?"
> **Answer**:  
> "A patient is uniquely identified on two levels:
> 1. **System MRN (Medical Record Number)**: Automatically generated as `PAT-{id}` upon registration.
> 2. **National Identifier / Passport**: Enforced with a unique database constraint on `nicPassportNo`. In `PatientService`, we perform duplicate verification queries (`patientRepository.findByNicPassportNo(nic)`) before saving. If a matching record already exists, it is rejected with a clear validation error."

#### Q1.2: "How does the Emergency Triage Priority system work?"
> **Answer**:  
> "We modeled triage levels using an enum: `EMERGENCY`, `URGENT`, and `ROUTINE`. In the emergency outpatient intake, emergency patients are visually flagged in coral red with animated alert badges. The triage priority determines consultation sequencing and queue priority in the physician workstation."

#### Q1.3: "Why is `Person` a superclass of `Patient`?"
> **Answer**:  
> "Following object-oriented inheritance principles, common demographic attributes (first name, last name, phone, email, gender, date of birth) are defined once in the `Person` base entity using JPA inheritance (`@Inheritance(strategy = InheritanceType.JOINED)`). `Patient` extends `Person` by adding healthcare-specific attributes such as blood group, known allergies, emergency contacts, and triage priority."

---

### Module 2: Doctor Profiles & Specialist Rostering
**Assigned Student**: Rathnayaka R. M. K. L. B. (`IT25103999` / Kavinda)

#### Q2.1: "How is doctor availability and weekly scheduling modeled in the database?"
> **Answer**:  
> "We created a dedicated `DoctorSchedule` entity associated with `Doctor` via `@OneToMany`. It stores:
> - `dayOfWeek` (e.g. MONDAY, WEDNESDAY)
> - `startTime` and `endTime` (e.g. 08:30 to 12:30)
> - `maxPatientCapacity` (to prevent clinician fatigue)
> - `roomNumber` (clinical examination room)
> This enables doctors to define structured consultation sessions while preventing over-booking."

#### Q2.2: "How does the system calculate doctor consultation fees during billing?"
> **Answer**:  
> "Each doctor has a configurable `consultationFee` attribute stored in their profile. When an appointment is scheduled or completed, `BillingService` queries the doctor's record to extract their specific professional fee, which is then itemized automatically into the final hospital invoice."

#### Q2.3: "What happens when a doctor toggles their status to 'Off Duty'?"
> **Answer**:  
> "The `Doctor` entity has an `isOnDuty` boolean flag. When set to `false`, the appointment booking module automatically disables that doctor's time slots, preventing patients and receptionists from scheduling appointments while the doctor is away or on emergency rounds."

---

### Module 3: Appointment Scheduling & Conflict Prevention
**Assigned Student**: Malwatta M.W.C.S (`IT25101620` / Chanul)

#### Q3.1: "How does your system strictly prevent double-booking?" *(CRITICAL QUESTION)*
> **Answer**:  
> "Double-booking prevention is enforced both at the Service layer and via database constraints:
> 1. Inside `@Transactional AppointmentService.bookAppointment()`, we execute a conflict query:
>    ```java
>    boolean exists = appointmentRepository.existsByDoctorIdAndAppointmentDateAndAppointmentTimeAndStatusNot(
>        doctorId, date, time, AppointmentStatus.CANCELLED
>    );
>    if (exists) {
>        throw new PulseException("Doctor is already booked for this time slot. Please choose another slot.");
>    }
>    ```
> 2. If an overlapping booking is attempted, the transaction immediately rolls back and returns HTTP `400 Bad Request` with an explanatory message. The frontend also disables booked slots in real time."

#### Q3.2: "Explain the Appointment lifecycle and status transitions."
> **Answer**:  
> "The lifecycle follows four discrete states:
> - `SCHEDULED`: Consultation booked by patient or receptionist.
> - `CONFIRMED`: Patient checks in at the OPD clinic station; verified by doctor.
> - `COMPLETED`: Doctor concludes consultation and records visit notes / prescriptions.
> - `CANCELLED`: Appointment cancelled by patient or staff, freeing up the time slot immediately for other patients."

---

### Module 4: Pharmacy Inventory & Prescription Dispensing
**Assigned Student**: Udumullage S.H.U. (`IT25100826` / Harshika)

#### Q4.1: "How is stock deducted when a prescription is dispensed?" *(CRITICAL QUESTION)*
> **Answer**:  
> "Stock deduction is implemented inside `@Transactional PharmacyService.dispensePrescription()`:
> 1. For each medication item in the prescription, the service loads the `Drug` entity.
> 2. It checks: `if (drug.getStockQuantity() < item.getQuantity()) throw new PulseException("Insufficient stock for " + drug.getBrandName());`
> 3. It decrements the stock: `drug.setStockQuantity(drug.getStockQuantity() - item.getQuantity())`.
> 4. It marks the prescription as `DISPENSED`, records the `dispensedAt` timestamp, and saves.
> Because the method is `@Transactional`, if any drug fails the stock check, the entire operation rolls back atomically."

#### Q4.2: "How do low-stock and batch expiry alerts work?"
> **Answer**:  
> "Every drug in the inventory has a `reorderLevel` threshold. The pharmacy dashboard queries `drugRepository.findByStockQuantityLessThanEqual(reorderLevel)` and displays amber/red alert cards whenever current stock falls to or below the safety limit. We also track `batchNumber` and `expiryDate` to flag expired or near-expiry batches."

---

### Module 5: Billing, Payments & PayHere Sandbox
**Assigned Student**: Dhanasinghe K. A. K. H. (`IT25103992` / Kesaru)

#### Q5.1: "How does multi-item invoice aggregation work?" *(CRITICAL QUESTION)*
> **Answer**:  
> "An outpatient visit involves services across multiple departments. In `BillingService.generateInvoice()`, we aggregate:
> 1. **Consultation Fee**: Extracted from the attending Doctor's tariff.
> 2. **Pharmacy Dispensary Fee**: Sum of all medication items dispensed for that patient encounter (`unitPrice * quantity`).
> 3. **Pathology Lab Fee**: Sum of all completed or requested laboratory diagnostic investigations.
> 4. `totalAmount = doctorFee + pharmacyFee + labFee - discountAmount`.
> All individual items are recorded in relational child tables (`INVOICE_DRUG_ITEM`, `INVOICE_LAB_ITEM`) for complete auditability."

#### Q5.2: "Explain how you integrated the live PayHere Sandbox Payment Gateway." *(CRITICAL QUESTION)*
> **Answer**:  
> "Our PayHere integration complies strictly with Central Bank of Sri Lanka 3D-Secure standards:
> 1. **Hash Generation**: In `PayHereSecurityUtil`, before checkout opens, the backend calculates an MD5 security checksum:
>    `hash = md5(merchant_id + order_id + amount_formatted + currency + md5(merchant_secret)).toUpperCase()`
> 2. **Checkout Modal**: The patient initiates checkout via the official PayHere sandbox modal using test credentials (`App ID: 4OVzEYZKfse4JH5F6UZLZU3PS`, test cards Visa `4916...`, MasterCard `5307...`, AMEX `3467...`).
> 3. **IPN Webhook Verification**: Upon payment authorization, PayHere sends a signed server-to-server webhook to `/api/v1/payments/payhere/notify`. Our backend recomputes the expected signature `md5sig = md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + md5(merchant_secret))`. Only when the signature matches 100% does the backend mark the invoice as `PAID`."

#### Q5.3: "Why did you set Allowed Domains to `*` in the PayHere Merchant Portal?"
> **Answer**:  
> "In PayHere Sandbox mode, setting Allowed Domains to `*` is the official standard recommendation during development. It permits requests and redirects originating from local development environments (`localhost:5173` and `localhost:8080`). For production deployment on a real hospital domain, `*` is replaced with the exact production domain."

---

### Module 6: Laboratory & Pathology Diagnostics
**Assigned Student**: Thilakarathne H.S.K.P.N (`IT25103363` / Nethuli)

#### Q6.1: "Explain the lifecycle of a Laboratory Diagnostic Test from request to completion."
> **Answer**:  
> "The test lifecycle encompasses three regulated stages:
> 1. `REQUESTED`: Initiated either by a doctor during consultation or directly requested by the patient via the online portal.
> 2. `SAMPLE_COLLECTED`: Specimen (e.g. Venous Whole Blood, Plasma, Serum, Midstream Urine) is drawn by the phlebotomist.
> 3. `COMPLETED`: Technologist analyzes the specimen, enters the quantitative findings, checks against biological reference intervals, records clinical notes, and releases the signed report."

#### Q6.2: "How are abnormal results detected and flagged?"
> **Answer**:  
> "Each test in our catalog (e.g. *Full Blood Count, Fasting Blood Sugar, Lipid Profile, Serum Creatinine, Liver Function, HbA1c, TSH, Dengue NS1 Rapid*) has established physiological reference ranges. When the technician enters results, any values outside normal thresholds trigger `isAbnormal = true`, which renders a high-visibility rose alert badge in both the clinician and patient portal."

#### Q6.3: "How does the dynamic Turnaround Time (ETA) calculation work?"
> **Answer**:  
> "Each investigation has a calibrated incubation turnaround (e.g. 2h for FBS, 4h for FBC, 6h for LFT, 1h for Dengue Rapid). The algorithm checks the sample collection date and urgency priority: if marked `URGENT` (Stat), the incubation time is expedited (halved), generating a real-time ETA such as *'Today by 4:30 PM (SLST)'* and notifying the patient via active SMS alerts."

---

## Part 3: Golden Rules for Tomorrow's Evaluation
1. **Never say 'I don't know'**: Say *"In our current architecture, that is handled by [Service/Entity name], and we designed it this way because..."*.
2. **Always show the database**: Keep **DBeaver** or **`http://localhost:8080/h2-console`** open in a second window. Whenever an action is performed, refresh the table to prove live persistence.
3. **Credit the team**: Whenever speaking about another module, mention the teammate's name (*"As Harshika's pharmacy module records the dispensation..."*). This proves strong team cohesion.
