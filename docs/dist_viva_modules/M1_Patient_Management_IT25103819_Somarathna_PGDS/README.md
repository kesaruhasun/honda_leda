# PulseOS — Viva Technical Defense & Module Source Code Dossier
## SLIIT SE2030 Software Engineering Project — Batch 02 | Group 60
### Academic Year 2026 | Year 2 Semester 1

---

### Student Information:
- **Full Name**: `Somarathna P. G. D. S.`
- **Preferred Name**: `Dila`
- **Student ID (IT Number)**: `IT25103819`
- **Official SLIIT Email**: `it25103819@my.sliit.lk`
- **Assigned Major Function**: **M1: Patient Registration, Clinical Triage & Patient Portal Self-Service**
- **Dedicated Git Branch**: `feature/patient-management`
- **Production URL**: `https://pulseos.tekkeys.com`
- **Database Web Interface (Adminer)**: `https://pulseos.tekkeys.com/adminer`

---

## 1. Assigned Design Pattern: Factory Method Pattern (Triage Priority Patient Generator) & Inheritance (Joined Table-Per-Type Person Base Entity)

### Why This Pattern Was Chosen & How It Works:
We applied the **Factory Method Pattern** in Patient creation to instantiate specialized patient profiles based on incoming triage categories (`EMERGENCY`, `URGENT`, `ROUTINE`). Furthermore, we utilized the Object-Oriented **Inheritance Pattern** via JPA's `@Inheritance(strategy = InheritanceType.JOINED)` where `Person` is the polymorphic superclass containing shared demographics (NIC, First Name, Last Name, Gender, DOB, Contact Numbers) and `Patient` extends it with clinical attributes (Blood Group, Allergies, Triage Priority, Registration Date, Emergency Contact Details).

> **Viva Tip**: When the lecturer asks: *"What design pattern did you use in your individual module?"*  
> Confidently answer: *"In my module (Patient Registration, Clinical Triage & Patient Portal Self-Service), I implemented the **Factory Method Pattern**. Let me show you exactly where in my code it is located..."*

---

## 2. Complete CRUD Implementation Map

Every team member is evaluated on having complete **CRUD (Create, Read, Update, Delete)** functionality in both the **Backend (Java Spring Boot)** and **Frontend (React TypeScript)**, connected to a live database.

| Operation | Action Description | Backend Location (Controller & Service) | Frontend UI Component | Database SQL Executed |
| :--- | :--- | :--- | :--- | :--- |
| **CREATE** | Register new patient with NIC uniqueness validation and triage tag | `PatientController.java -> @PostMapping("") registerPatient() | PatientService.java -> registerPatient()` | `PatientView.tsx -> handleCreatePatient() & 'Register New Patient' Modal` | `INSERT INTO person (...) followed by INSERT INTO patient (...)` |
| **READ** | Search, filter by triage, and paginate patient records | `PatientController.java -> @GetMapping("") getAllPatients() | PatientService.java -> getAllPatients() & searchPatients()` | `PatientView.tsx -> DataTable component with search bar & triage filter tabs` | `SELECT p.*, per.* FROM patient p JOIN person per ON p.id = per.id` |
| **UPDATE** | Update patient demographics, emergency contacts, and triage status | `PatientController.java -> @PutMapping("/{id}") updatePatient() | PatientService.java -> updatePatient()` | `PatientView.tsx -> handleUpdatePatient() in SlideOverDrawer & Edit Modal` | `UPDATE person SET ... WHERE id = ?; UPDATE patient SET ... WHERE id = ?` |
| **DELETE** | Safely archive patient record preserving medical history integrity | `PatientController.java -> @DeleteMapping("/{id}") archivePatient() | PatientService.java -> archivePatient()` | `PatientView.tsx -> 'Archive Patient' button in row action dropdown with confirmation modal` | `INSERT INTO archived_patient SELECT ...; UPDATE patient SET is_archived = true` |

---

## 3. Step-by-Step Live Viva Demonstration Script

Follow this exact sequence on your screen when demonstrating to the lecturer:
1. Open Receptionist / Admin station at `https://pulseos.tekkeys.com` and navigate to **Patient Registry**.
2. Click **'Register Patient'**, enter new patient details (e.g. NIC: `200012345678`, Name: `Kamal Perera`, Blood Group: `O+`, Triage: `EMERGENCY`).
3. Show the instant validation preventing invalid NICs or duplicate registrations.
4. Click **Submit** -> point out the new patient row highlighted with an urgent coral red triage tag.
5. Click **Edit Patient** -> change emergency contact phone number -> Click **Save** to demonstrate UPDATE.
6. Open Adminer (`https://pulseos.tekkeys.com/adminer`) and run SQL to show examiner the real-time record in MySQL database!

---

## 4. Live Database Verification Query

Keep **Adminer** (`https://pulseos.tekkeys.com/adminer`) or your local MySQL client open. Run this SQL query to show the lecturer that your data is actively persisting:

```sql
-- Database: pulseos_db
SELECT p.id, per.nic_passport_no, per.first_name, per.last_name, p.blood_group, p.triage_priority FROM patient p JOIN person per ON p.id = per.id ORDER BY p.id DESC LIMIT 5;
```

---

## 5. High-Probability Viva Questions & Model Answers

### Q1: Why is Person modeled as a superclass of Patient instead of putting all fields in Patient?
> **Answer**: Following Clean OOP and DRY principles, Person serves as the base entity for all human actors in the hospital (Patients, Doctors, Receptionists, Pharmacists, Lab Technologists). By using JPA Table-Per-Type Joined Inheritance (`@Inheritance(strategy = InheritanceType.JOINED)`), common demographic attributes like NIC, name, and address are centralized in one table (`person`), while role-specific clinical attributes reside in their respective joined tables.

### Q2: How do you prevent duplicate patient registrations?
> **Answer**: We enforce uniqueness at two levels: (1) Database level via `UNIQUE KEY (nic_passport_no)` on the `person` table, and (2) Service level in `PatientService.registerPatient()` where we call `patientRepository.findByNicPassportNo(dto.getNicPassportNo())` before persisting. If a match is found, we throw a descriptive `PulseException('Patient with this NIC/Passport already registered')` returning HTTP 400.

### Q3: How does the emergency triage priority system work?
> **Answer**: Triage priority is modeled as an enum (`EMERGENCY`, `URGENT`, `ROUTINE`). In the physician workstation and outpatient waiting queue, patients marked `EMERGENCY` are dynamically hoisted to the top of the queue with visual alert pulses, ensuring critical patients are prioritized for immediate medical attention.


---

## 6. Included Source Code Files in This Folder

### Backend Java Files (`backend/`):
- `Patient.java`
- `PatientRepository.java`
- `PatientService.java`
- `PatientController.java`
- `PatientDTOs.java`
- `TriagePriority.java`
- `BloodGroup.java`
- `ArchivedPatient.java`
- `ArchivedPatientRepository.java`
- `Person.java`

### Frontend React Files (`frontend/`):
- `PatientView.tsx`
- `PatientPortalView.tsx`

---
*Generated for SLIIT SE2030 Group 60 Evaluation | PulseOS Hospital Management System*
