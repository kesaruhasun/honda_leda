# PulseOS — Viva Technical Defense & Module Source Code Dossier
## SLIIT SE2030 Software Engineering Project — Batch 02 | Group 60
### Academic Year 2026 | Year 2 Semester 1

---

### Student Information:
- **Full Name**: `Rathnayaka R. M. K. L. B.`
- **Preferred Name**: `Kavinda`
- **Student ID (IT Number)**: `IT25103999`
- **Official SLIIT Email**: `it25103999@my.sliit.lk`
- **Assigned Major Function**: **M2: Doctor Profiles, Clinical Specialties & Weekly Rostering**
- **Dedicated Git Branch**: `feature/doctor-management`
- **Production URL**: `https://pulseos.tekkeys.com`
- **Database Web Interface (Adminer)**: `https://pulseos.tekkeys.com/adminer`

---

## 1. Assigned Design Pattern: Strategy Pattern (Consultation Tariff & Dynamic Scheduling Strategy)

### Why This Pattern Was Chosen & How It Works:
We implemented the **Strategy Pattern** for doctor consultation fee calculation and session availability. Different clinical specialties (Cardiology, Neurology, Pediatrics, General Medicine) apply distinct tariff computation algorithms based on clinician seniority, session duration, and room facility charges. In addition, the scheduling algorithm dynamically evaluates weekly slot intervals.

> **Viva Tip**: When the lecturer asks: *"What design pattern did you use in your individual module?"*  
> Confidently answer: *"In my module (Doctor Profiles, Clinical Specialties & Weekly Rostering), I implemented the **Strategy Pattern**. Let me show you exactly where in my code it is located..."*

---

## 2. Complete CRUD Implementation Map

Every team member is evaluated on having complete **CRUD (Create, Read, Update, Delete)** functionality in both the **Backend (Java Spring Boot)** and **Frontend (React TypeScript)**, connected to a live database.

| Operation | Action Description | Backend Location (Controller & Service) | Frontend UI Component | Database SQL Executed |
| :--- | :--- | :--- | :--- | :--- |
| **CREATE** | Onboard specialist doctor with license validation, department assignment & weekly schedule | `DoctorController.java -> @PostMapping("") createDoctor() | DoctorService.java -> createDoctor()` | `DoctorView.tsx -> handleCreateDoctor() & 'Onboard Specialist' Modal` | `INSERT INTO doctor (...) and INSERT INTO doctor_schedule (...)` |
| **READ** | Browse doctors by specialty, duty status, and view weekly consultation timetable | `DoctorController.java -> @GetMapping("") getAllDoctors() & @GetMapping("/{id}/schedule")` | `DoctorView.tsx -> Grid/Table view with department filter & schedule inspection drawer` | `SELECT d.*, dept.name FROM doctor d JOIN department dept ON d.department_id = dept.id` |
| **UPDATE** | Modify consultation fee, update phone/room number, and toggle On-Duty status | `DoctorController.java -> @PutMapping("/{id}") updateDoctor() & @PatchMapping("/{id}/duty") toggleDuty()` | `DoctorView.tsx -> Edit Doctor Drawer & On-Duty toggle switch` | `UPDATE doctor SET consultation_fee = ?, is_on_duty = ? WHERE id = ?` |
| **DELETE** | Deactivate doctor profile and archive active rostering slots | `DoctorController.java -> @DeleteMapping("/{id}") deleteDoctor() | DoctorService.java -> deleteDoctor()` | `DoctorView.tsx -> 'Deactivate Doctor' button with confirmation modal` | `UPDATE doctor SET is_active = false, is_on_duty = false WHERE id = ?` |

---

## 3. Step-by-Step Live Viva Demonstration Script

Follow this exact sequence on your screen when demonstrating to the lecturer:
1. Log in to PulseOS and open **Doctor Directory** (`https://pulseos.tekkeys.com/doctors`).
2. Demonstrate CREATE: Click **'Onboard Specialist'**, fill in license number (e.g. `SLMC-84920`), specialty (Cardiology), room number, and fee (e.g. `LKR 3,500.00`).
3. Demonstrate UPDATE: Select an existing doctor, click **Edit**, adjust their consultation fee or change room number, and save.
4. Demonstrate On-Duty Toggle: Toggle the doctor's duty switch to 'Off Duty' and show how the appointment booking module immediately prevents bookings for this doctor.
5. Open Adminer and show the `doctor` and `doctor_schedule` tables in MySQL.

---

## 4. Live Database Verification Query

Keep **Adminer** (`https://pulseos.tekkeys.com/adminer`) or your local MySQL client open. Run this SQL query to show the lecturer that your data is actively persisting:

```sql
-- Database: pulseos_db
SELECT d.id, per.first_name, per.last_name, d.specialization, d.consultation_fee, d.is_on_duty FROM doctor d JOIN employee e ON d.id = e.id JOIN person per ON e.id = per.id;
```

---

## 5. High-Probability Viva Questions & Model Answers

### Q1: How is a Doctor's schedule modeled in relation to appointments?
> **Answer**: A Doctor has a `@OneToMany` relationship with `DoctorSchedule`, which records repeating weekly availability blocks (`dayOfWeek`, `startTime`, `endTime`, `maxPatientCapacity`, `roomNumber`). When an appointment is scheduled, the appointment engine checks that the chosen date matches the doctor's scheduled day and that total booked slots have not reached `maxPatientCapacity`.

### Q2: What happens when a doctor is toggled to 'Off Duty'?
> **Answer**: The `is_on_duty` boolean flag is set to `false`. In `AppointmentService`, the slot generator checks `doctor.isOnDuty()`. If false, all slots for that doctor are marked unavailable in the patient portal, preventing appointment scheduling while the doctor is unavailable or on emergency leave.

### Q3: How does the doctor module link with the billing system?
> **Answer**: Each doctor record carries an authorized `consultationFee` attribute. When Kesaru's billing module generates an outpatient invoice for a completed visit, it queries `doctor.getConsultationFee()` to automatically insert the doctor's professional charge into the invoice line items.


---

## 6. Included Source Code Files in This Folder

### Backend Java Files (`backend/`):
- `Doctor.java`
- `DoctorSchedule.java`
- `Department.java`
- `DoctorRepository.java`
- `DoctorScheduleRepository.java`
- `DepartmentRepository.java`
- `DoctorService.java`
- `DoctorController.java`
- `DoctorDTOs.java`

### Frontend React Files (`frontend/`):
- `DoctorView.tsx`
- `DoctorDashboardView.tsx`

---
*Generated for SLIIT SE2030 Group 60 Evaluation | PulseOS Hospital Management System*
