# PulseOS — Viva Technical Defense & Module Source Code Dossier
## SLIIT SE2030 Software Engineering Project — Batch 02 | Group 60
### Academic Year 2026 | Year 2 Semester 1

---

### Student Information:
- **Full Name**: `Malwatta M. W. C. S.`
- **Preferred Name**: `Chanul`
- **Student ID (IT Number)**: `IT25101620`
- **Official SLIIT Email**: `it25101620@my.sliit.lk`
- **Assigned Major Function**: **M3: Outpatient Appointment Scheduling & Transactional Conflict Prevention**
- **Dedicated Git Branch**: `feature/appointment-scheduling`
- **Production URL**: `https://pulseos.tekkeys.com`
- **Database Web Interface (Adminer)**: `https://pulseos.tekkeys.com/adminer`

---

## 1. Assigned Design Pattern: Singleton Pattern (Thread-Safe Conflict Prevention Engine & Booking Manager)

### Why This Pattern Was Chosen & How It Works:
We applied the **Singleton Pattern** in the core Appointment Conflict Engine. In Spring Boot, `AppointmentService` is a thread-safe singleton bean that enforces serializable concurrency control over doctor schedule slots. It guarantees that simultaneous booking requests from different users cannot acquire the same doctor time-slot, strictly preventing double-booking anomalies.

> **Viva Tip**: When the lecturer asks: *"What design pattern did you use in your individual module?"*  
> Confidently answer: *"In my module (Outpatient Appointment Scheduling & Transactional Conflict Prevention), I implemented the **Singleton Pattern**. Let me show you exactly where in my code it is located..."*

---

## 2. Complete CRUD Implementation Map

Every team member is evaluated on having complete **CRUD (Create, Read, Update, Delete)** functionality in both the **Backend (Java Spring Boot)** and **Frontend (React TypeScript)**, connected to a live database.

| Operation | Action Description | Backend Location (Controller & Service) | Frontend UI Component | Database SQL Executed |
| :--- | :--- | :--- | :--- | :--- |
| **CREATE** | Book consultation appointment with atomic duplicate-slot prevention | `AppointmentController.java -> @PostMapping("") bookAppointment() | AppointmentService.java -> bookAppointment()` | `AppointmentBookingModal.tsx -> handleBookAppointment() & slot picker UI` | `INSERT INTO appointment (appointment_number, doctor_id, patient_id, appointment_date, appointment_time, status) VALUES (...)` |
| **READ** | Display calendar timetable, filter by doctor, date, and status | `AppointmentController.java -> @GetMapping("") & @GetMapping("/doctor/{doctorId}")` | `AppointmentView.tsx -> Interactive calendar & appointment roster list` | `SELECT a.*, p.first_name, d.specialization FROM appointment a JOIN ... WHERE appointment_date = ?` |
| **UPDATE** | Reschedule appointment time slot, update clinical consultation notes or check-in status | `AppointmentController.java -> @PutMapping("/{id}") updateAppointment() & @PatchMapping("/{id}/status")` | `AppointmentView.tsx -> Reschedule Modal & 'Confirm Check-In' action button` | `UPDATE appointment SET appointment_date = ?, appointment_time = ?, status = ? WHERE id = ?` |
| **DELETE** | Cancel appointment releasing the reserved slot back to the available pool | `AppointmentController.java -> @DeleteMapping("/{id}") cancelAppointment() | AppointmentService.java -> cancelAppointment()` | `AppointmentView.tsx -> 'Cancel Appointment' button with cancellation reason modal` | `UPDATE appointment SET status = 'CANCELLED' WHERE id = ?` |

---

## 3. Step-by-Step Live Viva Demonstration Script

Follow this exact sequence on your screen when demonstrating to the lecturer:
1. Open **Appointments View** (`https://pulseos.tekkeys.com/appointments`).
2. Click **'Book Appointment'**, select a doctor (e.g. Dr. Kavinda), pick a date and time slot (e.g. `10:30 AM`).
3. Click **Confirm Booking** -> Show the unique Appointment Number generated (`APT-XXXXXX`).
4. Show Conflict Prevention: Try booking the exact same doctor at the exact same date and time -> Show the UI and backend rejecting the attempt with HTTP 400 Conflict alert!
5. Demonstrate Status Update: Click **'Check-In'** to advance status from `SCHEDULED` to `CONFIRMED`.
6. Demonstrate Cancellation: Click **Cancel** -> Show status changing to `CANCELLED` and verify that the slot is immediately freed up for booking.
7. Open Adminer and show the `appointment` table in MySQL.

---

## 4. Live Database Verification Query

Keep **Adminer** (`https://pulseos.tekkeys.com/adminer`) or your local MySQL client open. Run this SQL query to show the lecturer that your data is actively persisting:

```sql
-- Database: pulseos_db
SELECT id, appointment_number, appointment_date, appointment_time, status, doctor_id, patient_id FROM appointment ORDER BY id DESC LIMIT 5;
```

---

## 5. High-Probability Viva Questions & Model Answers

### Q1: How does your system strictly prevent double-booking?
> **Answer**: Double-booking prevention is enforced inside `@Transactional AppointmentService.bookAppointment()` using a database query: `appointmentRepository.existsByDoctorIdAndAppointmentDateAndAppointmentTimeAndStatusNot(doctorId, date, time, AppointmentStatus.CANCELLED)`. If an active appointment occupies that slot, the transaction immediately rolls back and throws a `PulseException` returning HTTP 400 Bad Request. The frontend also disables already-booked slots in real time.

### Q2: Explain the Appointment lifecycle states.
> **Answer**: Appointments transition through four states: (1) `SCHEDULED`: Initial booking created by patient or receptionist; (2) `CONFIRMED`: Patient arrives at the hospital and completes reception check-in; (3) `COMPLETED`: Doctor finishes consultation and writes clinical notes; (4) `CANCELLED`: Booking is revoked by either party, immediately releasing the slot back to the public pool.

### Q3: How do you notify patients when their appointment is confirmed?
> **Answer**: When an appointment is saved, `AppointmentService` invokes our asynchronous `NotificationService`, which dispatches an email confirmation containing the date, time, doctor's name, room number, and unique appointment barcode number.


---

## 6. Included Source Code Files in This Folder

### Backend Java Files (`backend/`):
- `Appointment.java`
- `AppointmentStatus.java`
- `AppointmentRepository.java`
- `AppointmentService.java`
- `AppointmentController.java`
- `AppointmentDTOs.java`

### Frontend React Files (`frontend/`):
- `AppointmentView.tsx`
- `AppointmentCalendar.tsx`

---
*Generated for SLIIT SE2030 Group 60 Evaluation | PulseOS Hospital Management System*
