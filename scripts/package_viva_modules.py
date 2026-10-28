#!/usr/bin/env python3
import os
import shutil
import zipfile

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DIST_DIR = os.path.join(BASE_DIR, "docs", "dist_viva_modules")

MEMBERS = [
    {
        "id": "M1",
        "dir_name": "M1_Patient_Management_IT25103819_Somarathna_PGDS",
        "student_name": "Somarathna P. G. D. S.",
        "preferred_name": "Dila",
        "it_number": "IT25103819",
        "email": "it25103819@my.sliit.lk",
        "module_title": "Patient Registration, Clinical Triage & Patient Portal Self-Service",
        "git_branch": "feature/patient-management",
        "design_pattern": "Factory Method Pattern (Triage Priority Patient Generator) & Inheritance (Joined Table-Per-Type Person Base Entity)",
        "design_pattern_explanation": (
            "We applied the **Factory Method Pattern** in Patient creation to instantiate specialized patient profiles based on "
            "incoming triage categories (`EMERGENCY`, `URGENT`, `ROUTINE`). Furthermore, we utilized the Object-Oriented **Inheritance Pattern** "
            "via JPA's `@Inheritance(strategy = InheritanceType.JOINED)` where `Person` is the polymorphic superclass containing "
            "shared demographics (NIC, First Name, Last Name, Gender, DOB, Contact Numbers) and `Patient` extends it with clinical attributes "
            "(Blood Group, Allergies, Triage Priority, Registration Date, Emergency Contact Details)."
        ),
        "backend_files": [
            "backend/src/main/java/com/pulseos/patient/Patient.java",
            "backend/src/main/java/com/pulseos/patient/PatientRepository.java",
            "backend/src/main/java/com/pulseos/patient/PatientService.java",
            "backend/src/main/java/com/pulseos/patient/PatientController.java",
            "backend/src/main/java/com/pulseos/patient/PatientDTOs.java",
            "backend/src/main/java/com/pulseos/patient/TriagePriority.java",
            "backend/src/main/java/com/pulseos/patient/BloodGroup.java",
            "backend/src/main/java/com/pulseos/patient/ArchivedPatient.java",
            "backend/src/main/java/com/pulseos/patient/ArchivedPatientRepository.java",
            "backend/src/main/java/com/pulseos/common/Person.java",
        ],
        "frontend_files": [
            "frontend/src/views/PatientView.tsx",
            "frontend/src/views/PatientPortalView.tsx",
        ],
        "crud": {
            "create": {
                "desc": "Register new patient with NIC uniqueness validation and triage tag",
                "backend": "PatientController.java -> @PostMapping(\"\") registerPatient() | PatientService.java -> registerPatient()",
                "frontend": "PatientView.tsx -> handleCreatePatient() & 'Register New Patient' Modal",
                "db_action": "INSERT INTO person (...) followed by INSERT INTO patient (...)"
            },
            "read": {
                "desc": "Search, filter by triage, and paginate patient records",
                "backend": "PatientController.java -> @GetMapping(\"\") getAllPatients() | PatientService.java -> getAllPatients() & searchPatients()",
                "frontend": "PatientView.tsx -> DataTable component with search bar & triage filter tabs",
                "db_action": "SELECT p.*, per.* FROM patient p JOIN person per ON p.id = per.id"
            },
            "update": {
                "desc": "Update patient demographics, emergency contacts, and triage status",
                "backend": "PatientController.java -> @PutMapping(\"/{id}\") updatePatient() | PatientService.java -> updatePatient()",
                "frontend": "PatientView.tsx -> handleUpdatePatient() in SlideOverDrawer & Edit Modal",
                "db_action": "UPDATE person SET ... WHERE id = ?; UPDATE patient SET ... WHERE id = ?"
            },
            "delete": {
                "desc": "Safely archive patient record preserving medical history integrity",
                "backend": "PatientController.java -> @DeleteMapping(\"/{id}\") archivePatient() | PatientService.java -> archivePatient()",
                "frontend": "PatientView.tsx -> 'Archive Patient' button in row action dropdown with confirmation modal",
                "db_action": "INSERT INTO archived_patient SELECT ...; UPDATE patient SET is_archived = true"
            }
        },
        "viva_demo_steps": [
            "1. Open Receptionist / Admin station at `https://pulseos.tekkeys.com` and navigate to **Patient Registry**.",
            "2. Click **'Register Patient'**, enter new patient details (e.g. NIC: `200012345678`, Name: `Kamal Perera`, Blood Group: `O+`, Triage: `EMERGENCY`).",
            "3. Show the instant validation preventing invalid NICs or duplicate registrations.",
            "4. Click **Submit** -> point out the new patient row highlighted with an urgent coral red triage tag.",
            "5. Click **Edit Patient** -> change emergency contact phone number -> Click **Save** to demonstrate UPDATE.",
            "6. Open Adminer (`https://pulseos.tekkeys.com/adminer`) and run SQL to show examiner the real-time record in MySQL database!"
        ],
        "sql_query": "SELECT p.id, per.nic_passport_no, per.first_name, per.last_name, p.blood_group, p.triage_priority FROM patient p JOIN person per ON p.id = per.id ORDER BY p.id DESC LIMIT 5;",
        "viva_qa": [
            {
                "q": "Why is Person modeled as a superclass of Patient instead of putting all fields in Patient?",
                "a": "Following Clean OOP and DRY principles, Person serves as the base entity for all human actors in the hospital (Patients, Doctors, Receptionists, Pharmacists, Lab Technologists). By using JPA Table-Per-Type Joined Inheritance (`@Inheritance(strategy = InheritanceType.JOINED)`), common demographic attributes like NIC, name, and address are centralized in one table (`person`), while role-specific clinical attributes reside in their respective joined tables."
            },
            {
                "q": "How do you prevent duplicate patient registrations?",
                "a": "We enforce uniqueness at two levels: (1) Database level via `UNIQUE KEY (nic_passport_no)` on the `person` table, and (2) Service level in `PatientService.registerPatient()` where we call `patientRepository.findByNicPassportNo(dto.getNicPassportNo())` before persisting. If a match is found, we throw a descriptive `PulseException('Patient with this NIC/Passport already registered')` returning HTTP 400."
            },
            {
                "q": "How does the emergency triage priority system work?",
                "a": "Triage priority is modeled as an enum (`EMERGENCY`, `URGENT`, `ROUTINE`). In the physician workstation and outpatient waiting queue, patients marked `EMERGENCY` are dynamically hoisted to the top of the queue with visual alert pulses, ensuring critical patients are prioritized for immediate medical attention."
            }
        ]
    },
    {
        "id": "M2",
        "dir_name": "M2_Doctor_Management_IT25103999_Rathnayaka_RMKLB",
        "student_name": "Rathnayaka R. M. K. L. B.",
        "preferred_name": "Kavinda",
        "it_number": "IT25103999",
        "email": "it25103999@my.sliit.lk",
        "module_title": "Doctor Profiles, Clinical Specialties & Weekly Rostering",
        "git_branch": "feature/doctor-management",
        "design_pattern": "Strategy Pattern (Consultation Tariff & Dynamic Scheduling Strategy)",
        "design_pattern_explanation": (
            "We implemented the **Strategy Pattern** for doctor consultation fee calculation and session availability. Different clinical "
            "specialties (Cardiology, Neurology, Pediatrics, General Medicine) apply distinct tariff computation algorithms based on clinician seniority, "
            "session duration, and room facility charges. In addition, the scheduling algorithm dynamically evaluates weekly slot intervals."
        ),
        "backend_files": [
            "backend/src/main/java/com/pulseos/doctor/Doctor.java",
            "backend/src/main/java/com/pulseos/doctor/DoctorSchedule.java",
            "backend/src/main/java/com/pulseos/doctor/Department.java",
            "backend/src/main/java/com/pulseos/doctor/DoctorRepository.java",
            "backend/src/main/java/com/pulseos/doctor/DoctorScheduleRepository.java",
            "backend/src/main/java/com/pulseos/doctor/DepartmentRepository.java",
            "backend/src/main/java/com/pulseos/doctor/DoctorService.java",
            "backend/src/main/java/com/pulseos/doctor/DoctorController.java",
            "backend/src/main/java/com/pulseos/doctor/DoctorDTOs.java",
        ],
        "frontend_files": [
            "frontend/src/views/DoctorView.tsx",
            "frontend/src/views/DoctorDashboardView.tsx",
        ],
        "crud": {
            "create": {
                "desc": "Onboard specialist doctor with license validation, department assignment & weekly schedule",
                "backend": "DoctorController.java -> @PostMapping(\"\") createDoctor() | DoctorService.java -> createDoctor()",
                "frontend": "DoctorView.tsx -> handleCreateDoctor() & 'Onboard Specialist' Modal",
                "db_action": "INSERT INTO doctor (...) and INSERT INTO doctor_schedule (...)"
            },
            "read": {
                "desc": "Browse doctors by specialty, duty status, and view weekly consultation timetable",
                "backend": "DoctorController.java -> @GetMapping(\"\") getAllDoctors() & @GetMapping(\"/{id}/schedule\")",
                "frontend": "DoctorView.tsx -> Grid/Table view with department filter & schedule inspection drawer",
                "db_action": "SELECT d.*, dept.name FROM doctor d JOIN department dept ON d.department_id = dept.id"
            },
            "update": {
                "desc": "Modify consultation fee, update phone/room number, and toggle On-Duty status",
                "backend": "DoctorController.java -> @PutMapping(\"/{id}\") updateDoctor() & @PatchMapping(\"/{id}/duty\") toggleDuty()",
                "frontend": "DoctorView.tsx -> Edit Doctor Drawer & On-Duty toggle switch",
                "db_action": "UPDATE doctor SET consultation_fee = ?, is_on_duty = ? WHERE id = ?"
            },
            "delete": {
                "desc": "Deactivate doctor profile and archive active rostering slots",
                "backend": "DoctorController.java -> @DeleteMapping(\"/{id}\") deleteDoctor() | DoctorService.java -> deleteDoctor()",
                "frontend": "DoctorView.tsx -> 'Deactivate Doctor' button with confirmation modal",
                "db_action": "UPDATE doctor SET is_active = false, is_on_duty = false WHERE id = ?"
            }
        },
        "viva_demo_steps": [
            "1. Log in to PulseOS and open **Doctor Directory** (`https://pulseos.tekkeys.com/doctors`).",
            "2. Demonstrate CREATE: Click **'Onboard Specialist'**, fill in license number (e.g. `SLMC-84920`), specialty (Cardiology), room number, and fee (e.g. `LKR 3,500.00`).",
            "3. Demonstrate UPDATE: Select an existing doctor, click **Edit**, adjust their consultation fee or change room number, and save.",
            "4. Demonstrate On-Duty Toggle: Toggle the doctor's duty switch to 'Off Duty' and show how the appointment booking module immediately prevents bookings for this doctor.",
            "5. Open Adminer and show the `doctor` and `doctor_schedule` tables in MySQL."
        ],
        "sql_query": "SELECT d.id, per.first_name, per.last_name, d.specialization, d.consultation_fee, d.is_on_duty FROM doctor d JOIN employee e ON d.id = e.id JOIN person per ON e.id = per.id;",
        "viva_qa": [
            {
                "q": "How is a Doctor's schedule modeled in relation to appointments?",
                "a": "A Doctor has a `@OneToMany` relationship with `DoctorSchedule`, which records repeating weekly availability blocks (`dayOfWeek`, `startTime`, `endTime`, `maxPatientCapacity`, `roomNumber`). When an appointment is scheduled, the appointment engine checks that the chosen date matches the doctor's scheduled day and that total booked slots have not reached `maxPatientCapacity`."
            },
            {
                "q": "What happens when a doctor is toggled to 'Off Duty'?",
                "a": "The `is_on_duty` boolean flag is set to `false`. In `AppointmentService`, the slot generator checks `doctor.isOnDuty()`. If false, all slots for that doctor are marked unavailable in the patient portal, preventing appointment scheduling while the doctor is unavailable or on emergency leave."
            },
            {
                "q": "How does the doctor module link with the billing system?",
                "a": "Each doctor record carries an authorized `consultationFee` attribute. When Kesaru's billing module generates an outpatient invoice for a completed visit, it queries `doctor.getConsultationFee()` to automatically insert the doctor's professional charge into the invoice line items."
            }
        ]
    },
    {
        "id": "M3",
        "dir_name": "M3_Appointment_Management_IT25101620_Malwatta_MWCS",
        "student_name": "Malwatta M. W. C. S.",
        "preferred_name": "Chanul",
        "it_number": "IT25101620",
        "email": "it25101620@my.sliit.lk",
        "module_title": "Outpatient Appointment Scheduling & Transactional Conflict Prevention",
        "git_branch": "feature/appointment-scheduling",
        "design_pattern": "Singleton Pattern (Thread-Safe Conflict Prevention Engine & Booking Manager)",
        "design_pattern_explanation": (
            "We applied the **Singleton Pattern** in the core Appointment Conflict Engine. In Spring Boot, `AppointmentService` is a thread-safe "
            "singleton bean that enforces serializable concurrency control over doctor schedule slots. It guarantees that simultaneous booking requests "
            "from different users cannot acquire the same doctor time-slot, strictly preventing double-booking anomalies."
        ),
        "backend_files": [
            "backend/src/main/java/com/pulseos/appointment/Appointment.java",
            "backend/src/main/java/com/pulseos/appointment/AppointmentStatus.java",
            "backend/src/main/java/com/pulseos/appointment/AppointmentRepository.java",
            "backend/src/main/java/com/pulseos/appointment/AppointmentService.java",
            "backend/src/main/java/com/pulseos/appointment/AppointmentController.java",
            "backend/src/main/java/com/pulseos/appointment/AppointmentDTOs.java",
        ],
        "frontend_files": [
            "frontend/src/views/AppointmentView.tsx",
            "frontend/src/components/appointments/AppointmentCalendar.tsx",
        ],
        "crud": {
            "create": {
                "desc": "Book consultation appointment with atomic duplicate-slot prevention",
                "backend": "AppointmentController.java -> @PostMapping(\"\") bookAppointment() | AppointmentService.java -> bookAppointment()",
                "frontend": "AppointmentBookingModal.tsx -> handleBookAppointment() & slot picker UI",
                "db_action": "INSERT INTO appointment (appointment_number, doctor_id, patient_id, appointment_date, appointment_time, status) VALUES (...)"
            },
            "read": {
                "desc": "Display calendar timetable, filter by doctor, date, and status",
                "backend": "AppointmentController.java -> @GetMapping(\"\") & @GetMapping(\"/doctor/{doctorId}\")",
                "frontend": "AppointmentView.tsx -> Interactive calendar & appointment roster list",
                "db_action": "SELECT a.*, p.first_name, d.specialization FROM appointment a JOIN ... WHERE appointment_date = ?"
            },
            "update": {
                "desc": "Reschedule appointment time slot, update clinical consultation notes or check-in status",
                "backend": "AppointmentController.java -> @PutMapping(\"/{id}\") updateAppointment() & @PatchMapping(\"/{id}/status\")",
                "frontend": "AppointmentView.tsx -> Reschedule Modal & 'Confirm Check-In' action button",
                "db_action": "UPDATE appointment SET appointment_date = ?, appointment_time = ?, status = ? WHERE id = ?"
            },
            "delete": {
                "desc": "Cancel appointment releasing the reserved slot back to the available pool",
                "backend": "AppointmentController.java -> @DeleteMapping(\"/{id}\") cancelAppointment() | AppointmentService.java -> cancelAppointment()",
                "frontend": "AppointmentView.tsx -> 'Cancel Appointment' button with cancellation reason modal",
                "db_action": "UPDATE appointment SET status = 'CANCELLED' WHERE id = ?"
            }
        },
        "viva_demo_steps": [
            "1. Open **Appointments View** (`https://pulseos.tekkeys.com/appointments`).",
            "2. Click **'Book Appointment'**, select a doctor (e.g. Dr. Kavinda), pick a date and time slot (e.g. `10:30 AM`).",
            "3. Click **Confirm Booking** -> Show the unique Appointment Number generated (`APT-XXXXXX`).",
            "4. Show Conflict Prevention: Try booking the exact same doctor at the exact same date and time -> Show the UI and backend rejecting the attempt with HTTP 400 Conflict alert!",
            "5. Demonstrate Status Update: Click **'Check-In'** to advance status from `SCHEDULED` to `CONFIRMED`.",
            "6. Demonstrate Cancellation: Click **Cancel** -> Show status changing to `CANCELLED` and verify that the slot is immediately freed up for booking.",
            "7. Open Adminer and show the `appointment` table in MySQL."
        ],
        "sql_query": "SELECT id, appointment_number, appointment_date, appointment_time, status, doctor_id, patient_id FROM appointment ORDER BY id DESC LIMIT 5;",
        "viva_qa": [
            {
                "q": "How does your system strictly prevent double-booking?",
                "a": "Double-booking prevention is enforced inside `@Transactional AppointmentService.bookAppointment()` using a database query: `appointmentRepository.existsByDoctorIdAndAppointmentDateAndAppointmentTimeAndStatusNot(doctorId, date, time, AppointmentStatus.CANCELLED)`. If an active appointment occupies that slot, the transaction immediately rolls back and throws a `PulseException` returning HTTP 400 Bad Request. The frontend also disables already-booked slots in real time."
            },
            {
                "q": "Explain the Appointment lifecycle states.",
                "a": "Appointments transition through four states: (1) `SCHEDULED`: Initial booking created by patient or receptionist; (2) `CONFIRMED`: Patient arrives at the hospital and completes reception check-in; (3) `COMPLETED`: Doctor finishes consultation and writes clinical notes; (4) `CANCELLED`: Booking is revoked by either party, immediately releasing the slot back to the public pool."
            },
            {
                "q": "How do you notify patients when their appointment is confirmed?",
                "a": "When an appointment is saved, `AppointmentService` invokes our asynchronous `NotificationService`, which dispatches an email confirmation containing the date, time, doctor's name, room number, and unique appointment barcode number."
            }
        ]
    },
    {
        "id": "M4",
        "dir_name": "M4_Pharmacy_Inventory_IT25100826_Udumullage_SHU",
        "student_name": "Udumullage S. H. U.",
        "preferred_name": "Harshika",
        "it_number": "IT25100826",
        "email": "it25100826@my.sliit.lk",
        "module_title": "Pharmacy Inventory, Prescription Dispensing & Atomic Stock Deduction",
        "git_branch": "feature/pharmacy-inventory",
        "design_pattern": "Observer Pattern (Low Stock Threshold Alerts & Prescription State Change Event Bus)",
        "design_pattern_explanation": (
            "We applied the **Observer Pattern** in the pharmacy stock monitoring engine. When medications are dispensed, the inventory "
            "subject notifies observer components whenever `stockQuantity <= reorderLevel`. This triggers real-time visual low-stock warning banners "
            "on the pharmacist dashboard and dispatches purchase order replenishment alerts."
        ),
        "backend_files": [
            "backend/src/main/java/com/pulseos/pharmacy/Drug.java",
            "backend/src/main/java/com/pulseos/pharmacy/Prescription.java",
            "backend/src/main/java/com/pulseos/pharmacy/PrescriptionItem.java",
            "backend/src/main/java/com/pulseos/pharmacy/DrugRepository.java",
            "backend/src/main/java/com/pulseos/pharmacy/PrescriptionRepository.java",
            "backend/src/main/java/com/pulseos/pharmacy/PharmacyService.java",
            "backend/src/main/java/com/pulseos/pharmacy/PharmacyController.java",
            "backend/src/main/java/com/pulseos/pharmacy/PharmacyDTOs.java",
            "backend/src/main/java/com/pulseos/pharmacy/Supplier.java",
            "backend/src/main/java/com/pulseos/pharmacy/SupplierRepository.java",
        ],
        "frontend_files": [
            "frontend/src/views/PharmacyView.tsx",
            "frontend/src/views/PharmacistDashboardView.tsx",
        ],
        "crud": {
            "create": {
                "desc": "Add new drug formulation to pharmacy vault with batch number, unit price, and reorder threshold",
                "backend": "PharmacyController.java -> @PostMapping(\"/drugs\") addDrug() | PharmacyService.java -> addDrug()",
                "frontend": "PharmacyView.tsx -> handleAddDrug() & 'Add Medication' Modal",
                "db_action": "INSERT INTO drug (brand_name, generic_name, stock_quantity, unit_price, reorder_level) VALUES (...)"
            },
            "read": {
                "desc": "Browse drug formulary, check stock quantities, filter by low stock and search by generic name",
                "backend": "PharmacyController.java -> @GetMapping(\"/drugs\") getAllDrugs() & @GetMapping(\"/drugs/low-stock\")",
                "frontend": "PharmacyView.tsx -> Drug Inventory DataTable with Low Stock filter tab",
                "db_action": "SELECT * FROM drug WHERE stock_quantity <= reorder_level"
            },
            "update": {
                "desc": "Update stock level, adjust unit pricing, or execute atomic dispensation deducting stock",
                "backend": "PharmacyController.java -> @PutMapping(\"/drugs/{id}\") updateDrug() & @PostMapping(\"/prescriptions/{id}/dispense\") dispensePrescription()",
                "frontend": "PharmacyView.tsx -> Edit Drug Modal & 'Dispense Prescription' button",
                "db_action": "UPDATE drug SET stock_quantity = stock_quantity - ? WHERE id = ?"
            },
            "delete": {
                "desc": "Remove discontinued or expired medication batches from the active formulary",
                "backend": "PharmacyController.java -> @DeleteMapping(\"/drugs/{id}\") deleteDrug() | PharmacyService.java -> deleteDrug()",
                "frontend": "PharmacyView.tsx -> 'Delete Drug' action button with confirmation dialog",
                "db_action": "DELETE FROM drug WHERE id = ?"
            }
        },
        "viva_demo_steps": [
            "1. Open **Pharmacy Vault** (`https://pulseos.tekkeys.com/pharmacy`).",
            "2. Demonstrate CREATE: Click **'Add Medication'**, input Brand Name (e.g. `Amoxicillin 500mg`), Generic Name (`Amoxicillin`), Stock Qty (`100`), Unit Price (`LKR 45.00`), Reorder Level (`20`).",
            "3. Demonstrate READ: Show search filtering by generic name and click the **'Low Stock'** filter tab to highlight medications below reorder threshold.",
            "4. Demonstrate UPDATE: Click **Edit** on a drug -> update the price or stock -> Save and show updated table row.",
            "5. Demonstrate ATOMIC DISPENSATION: Go to Prescriptions tab -> click **'Dispense'** on an active prescription -> show the stock automatically decreasing in the inventory table!",
            "6. Demonstrate DELETE: Click the trash icon to remove a test drug batch.",
            "7. Open Adminer and run SQL query on `drug` and `prescription` tables to prove live database persistence."
        ],
        "sql_query": "SELECT id, brand_name, generic_name, stock_quantity, unit_price, reorder_level FROM drug ORDER BY id DESC LIMIT 5;",
        "viva_qa": [
            {
                "q": "How does atomic stock deduction work during prescription dispensation?",
                "a": "Inside `@Transactional PharmacyService.dispensePrescription()`, for every medication item in the prescription, the system verifies `if (drug.getStockQuantity() < item.getQuantity()) throw new PulseException('Insufficient stock')`. If all items pass, it executes `drug.setStockQuantity(drug.getStockQuantity() - item.getQuantity())` and updates the prescription status to `DISPENSED`. Because the entire method is annotated with `@Transactional`, if any drug lacks sufficient inventory, the whole operation aborts atomically."
            },
            {
                "q": "How are low-stock warnings triggered?",
                "a": "Each drug defines a `reorderLevel` threshold. When stock falls to or below this number, the query `drugRepository.findByStockQuantityLessThanEqual(reorderLevel)` retrieves the flagged records. On the frontend, this renders high-visibility amber badges and surfaces in the Low Stock tab."
            },
            {
                "q": "How does the pharmacy module connect with Billing?",
                "a": "When a prescription is dispensed, each item's total cost (`quantity * unitPrice`) is computed. When Kesaru's billing module compiles the patient's hospital invoice, it queries the dispensed prescription to automatically aggregate the pharmacy medication fees into the final bill."
            }
        ]
    },
    {
        "id": "M5",
        "dir_name": "M5_Billing_Payments_IT25103992_Dhanasinghe_KAKH",
        "student_name": "Dhanasinghe K. A. K. H.",
        "preferred_name": "Kesaru",
        "it_number": "IT25103992",
        "email": "it25103992@my.sliit.lk",
        "module_title": "Multi-Department Itemized Invoicing, Counter Settlement & PayHere Sandbox Gateway",
        "git_branch": "feature/billing-payment",
        "design_pattern": "Adapter Pattern (PayHere Sandbox 3D-Secure Payment Adapter & Counter Cash Settlement)",
        "design_pattern_explanation": (
            "We applied the **Adapter Pattern** to unify disparate payment mechanisms behind a common payment interface. "
            "The system supports both local In-Person Cashier Settlement (Cash, POS Card Terminal) and the third-party **PayHere Online Payment Gateway** "
            "(Central Bank approved 3D-Secure with MD5 cryptographic signatures and asynchronous IPN callbacks). The Adapter converts heterogeneous "
            "payment request and response payloads into a standardized `PaymentTransaction` domain entity."
        ),
        "backend_files": [
            "backend/src/main/java/com/pulseos/billing/Invoice.java",
            "backend/src/main/java/com/pulseos/billing/InvoiceDrugItem.java",
            "backend/src/main/java/com/pulseos/billing/InvoiceLabItem.java",
            "backend/src/main/java/com/pulseos/billing/PaymentTransaction.java",
            "backend/src/main/java/com/pulseos/billing/PaymentMethod.java",
            "backend/src/main/java/com/pulseos/billing/PaymentStatus.java",
            "backend/src/main/java/com/pulseos/billing/InvoiceRepository.java",
            "backend/src/main/java/com/pulseos/billing/PaymentRepository.java",
            "backend/src/main/java/com/pulseos/billing/BillingService.java",
            "backend/src/main/java/com/pulseos/billing/BillingController.java",
            "backend/src/main/java/com/pulseos/billing/PaymentController.java",
            "backend/src/main/java/com/pulseos/billing/PayHereConfig.java",
            "backend/src/main/java/com/pulseos/billing/PayHereSecurityUtil.java",
            "backend/src/main/java/com/pulseos/billing/BillingDTOs.java",
        ],
        "frontend_files": [
            "frontend/src/views/BillingView.tsx",
            "frontend/src/views/PatientPortalView.tsx",
        ],
        "crud": {
            "create": {
                "desc": "Compile aggregated multi-department invoice combining Doctor, Pharmacy, and Laboratory fees",
                "backend": "BillingController.java -> @PostMapping(\"/invoices\") generateInvoice() | BillingService.java -> generateInvoice()",
                "frontend": "BillingView.tsx -> handleGenerateInvoice() & 'Generate Invoice' Modal",
                "db_action": "INSERT INTO invoice (invoice_number, total_amount, doctor_fee, pharmacy_fee, lab_fee, payment_status) VALUES (...)"
            },
            "read": {
                "desc": "Review invoices, itemized tariff breakdowns, filter by Paid/Pending, and inspect payment transactions",
                "backend": "BillingController.java -> @GetMapping(\"/invoices\") getAllInvoices() & @GetMapping(\"/invoices/{id}\")",
                "frontend": "BillingView.tsx -> DataTable with Paid/Pending filter & SlideOverDrawer breakdown",
                "db_action": "SELECT * FROM invoice ORDER BY id DESC"
            },
            "update": {
                "desc": "Apply clinical concessions/discounts (Senior Citizen, Staff, Welfare) OR settle via Cashier counter / PayHere Gateway",
                "backend": "BillingController.java -> @PutMapping(\"/invoices/{id}\") updateInvoice() & @PostMapping(\"/invoices/{id}/settle\") settleInvoice()",
                "frontend": "BillingView.tsx -> 'Discount' button opening Apply Concession Modal & 'Cashier' settle button",
                "db_action": "UPDATE invoice SET discount_amount = ?, discount_reason = ?, net_amount = ? WHERE id = ?; UPDATE invoice SET payment_status = 'PAID'"
            },
            "delete": {
                "desc": "Void / cancel incorrect invoice with audit trail preservation",
                "backend": "BillingController.java -> @DeleteMapping(\"/invoices/{id}\") cancelInvoice() | BillingService.java -> cancelInvoice()",
                "frontend": "BillingView.tsx -> 'Void Bill' trash button opening Confirmation Modal",
                "db_action": "UPDATE invoice SET payment_status = 'CANCELLED' WHERE id = ?"
            }
        },
        "viva_demo_steps": [
            "1. Open **Billing & Cashier Station** (`https://pulseos.tekkeys.com/billing`).",
            "2. Demonstrate CREATE: Click **'Generate Invoice'**, select a patient (e.g. Kamal Perera), enter doctor fee (`LKR 2,500`), pharmacy fee (`LKR 1,850`), lab fee (`LKR 3,200`) -> Click **Generate Bill** -> Show `INV-XXXXXX` created with Total `LKR 7,550.00`.",
            "3. Demonstrate UPDATE (Discount / Concession): On the pending invoice, click **'Discount'** -> select **'Senior Citizen (10%)'** or enter custom concession -> Show live calculation preview -> Click **'Save & Update Bill'** -> Show the table immediately reflecting adjusted Net Due!",
            "4. Demonstrate UPDATE (Settlement): Click **'Cashier'** -> Confirm cash settlement -> Show status flipping to `PAID` with green check badge.",
            "5. Demonstrate PayHere Gateway: Click **'PayHere'** button -> Show encrypted checkout modal with PayHere Merchant ID `1235909` -> Explain MD5 checksum generation and IPN callback verification.",
            "6. Demonstrate DELETE (Void): Click the trash icon on a test pending invoice -> Confirm Void -> Show status updated to `CANCELLED`.",
            "7. Open Adminer (`https://pulseos.tekkeys.com/adminer`) and run SQL query on `invoice` table to prove real-time persistence!"
        ],
        "sql_query": "SELECT id, invoice_number, total_amount, discount_amount, net_amount, payment_status, billing_date FROM invoice ORDER BY id DESC LIMIT 5;",
        "viva_qa": [
            {
                "q": "How does your multi-item invoice aggregation work across different hospital departments?",
                "a": "In `BillingService.generateInvoice()`, we aggregate clinical costs across three departments: (1) Attending Doctor's professional consultation fee, (2) Dispensed pharmacy medications (`sum(unitPrice * quantity)` from Harshika's module), and (3) Ordered laboratory pathology investigations (from Nethuli's module). The gross total is `doctorFee + pharmacyFee + labFee`, from which any authorized discount/concession is deducted to yield `netAmount`."
            },
            {
                "q": "Explain the security of your PayHere Sandbox payment integration.",
                "a": "Our PayHere integration complies with Central Bank of Sri Lanka 3D-Secure standards. Before checkout opens, `PayHereSecurityUtil` calculates an MD5 checksum: `hash = md5(merchant_id + order_id + formatted_amount + currency + md5(merchant_secret)).toUpperCase()`. When PayHere dispatches its signed server-to-server IPN webhook to `/api/v1/payments/payhere/notify`, our backend recalculates the expected signature. Only if the signature matches 100% does the system mark the invoice as `PAID`, preventing client-side price tampering."
            },
            {
                "q": "Why did you implement both Cashier Counter Settlement and Online PayHere?",
                "a": "A realistic hospital serves diverse patient demographics. Elderly or emergency outpatients frequently pay in cash or via local hospital POS card terminal at the discharge desk, while digitally savvy patients use the online Patient Portal with PayHere to settle bills remotely via Credit Card, Debit Card, or Mobile Wallets."
            }
        ]
    },
    {
        "id": "M6",
        "dir_name": "M6_Laboratory_Tests_IT25103363_Thilakarathne_HSKPN",
        "student_name": "Thilakarathne H. S. K. P. N.",
        "preferred_name": "Nethuli",
        "it_number": "IT25103363",
        "email": "it25103363@my.sliit.lk",
        "module_title": "Pathology Laboratory Investigations & Diagnostic Result Lifecycle",
        "git_branch": "feature/laboratory-investigations",
        "design_pattern": "State Pattern (Diagnostic Test Order Lifecycle: REQUESTED -> SAMPLE_COLLECTED -> COMPLETED)",
        "design_pattern_explanation": (
            "We applied the **State Pattern** to govern the regulated medical lifecycle of diagnostic investigations. "
            "A laboratory test progresses strictly through deterministic states: (1) `REQUESTED` (specimen order initiated), "
            "(2) `SAMPLE_COLLECTED` (phlebotomist acquires venous blood or urine sample), and (3) `COMPLETED` (technologist inputs quantitative values, "
            "evaluates biological reference intervals, flags abnormalities, and signs the lab report). Each state permits distinct operations."
        ),
        "backend_files": [
            "backend/src/main/java/com/pulseos/laboratory/LabTest.java",
            "backend/src/main/java/com/pulseos/laboratory/LabTestCatalog.java",
            "backend/src/main/java/com/pulseos/laboratory/LabTechnician.java",
            "backend/src/main/java/com/pulseos/laboratory/LabTestStatus.java",
            "backend/src/main/java/com/pulseos/laboratory/LabTestRepository.java",
            "backend/src/main/java/com/pulseos/laboratory/LabTestCatalogRepository.java",
            "backend/src/main/java/com/pulseos/laboratory/LaboratoryService.java",
            "backend/src/main/java/com/pulseos/laboratory/LaboratoryController.java",
            "backend/src/main/java/com/pulseos/laboratory/LabDTOs.java",
        ],
        "frontend_files": [
            "frontend/src/views/LaboratoryView.tsx",
        ],
        "crud": {
            "create": {
                "desc": "Order diagnostic pathology test with specimen type, urgency priority, and dynamic ETA calculation",
                "backend": "LaboratoryController.java -> @PostMapping(\"\") orderLabTest() | LaboratoryService.java -> orderLabTest()",
                "frontend": "LaboratoryView.tsx -> handleOrderTest() & 'Order Investigation' Modal",
                "db_action": "INSERT INTO lab_test (requisition_number, test_name, sample_type, status, test_date, price) VALUES (...)"
            },
            "read": {
                "desc": "Monitor lab queue, filter by status (Requested, Sample Collected, Completed), and review clinical findings",
                "backend": "LaboratoryController.java -> @GetMapping(\"\") getAllTests() & @GetMapping(\"/patient/{patientId}\")",
                "frontend": "LaboratoryView.tsx -> Investigation Registry DataTable with status filter pills",
                "db_action": "SELECT * FROM lab_test ORDER BY id DESC"
            },
            "update": {
                "desc": "Advance test state (Collect Sample), input quantitative results, evaluate reference ranges, and sign report",
                "backend": "LaboratoryController.java -> @PutMapping(\"/{id}/sample\") & @PutMapping(\"/{id}/result\") updateLabTestResult()",
                "frontend": "LaboratoryView.tsx -> 'Collect Specimen' button & 'Enter Result' Modal",
                "db_action": "UPDATE lab_test SET status = 'COMPLETED', result_value = ?, is_abnormal = ?, comments = ? WHERE id = ?"
            },
            "delete": {
                "desc": "Revoke / cancel test order prior to specimen processing with audit notation",
                "backend": "LaboratoryController.java -> @DeleteMapping(\"/{id}\") cancelLabTest() | LaboratoryService.java -> cancelLabTest()",
                "frontend": "LaboratoryView.tsx -> 'Cancel Test' button in action column with confirmation modal",
                "db_action": "UPDATE lab_test SET status = 'CANCELLED' WHERE id = ?"
            }
        },
        "viva_demo_steps": [
            "1. Open **Pathology Laboratory Station** (`https://pulseos.tekkeys.com/laboratory`).",
            "2. Demonstrate CREATE: Click **'Order Investigation'**, select patient (e.g. Kamal Perera), choose investigation (e.g. `Full Blood Count (FBC)` or `Fasting Blood Sugar`), set Urgency to `Stat Urgent` -> Click **Submit** -> Show `LAB-XXXXXX` created in `REQUESTED` state.",
            "3. Demonstrate UPDATE (State 1 -> 2): Click **'Collect Specimen'** -> Show state advancing to `SAMPLE_COLLECTED` with sample collection timestamp recorded.",
            "4. Demonstrate UPDATE (State 2 -> 3): Click **'Enter Result'** -> Enter measured value (e.g. `Fasting Blood Sugar: 165 mg/dL`) -> Flag as Abnormal -> Add clinical interpretation -> Click **Save Report** -> Show status changing to `COMPLETED` with an abnormal rose badge!",
            "5. Demonstrate DELETE / CANCEL: Cancel a pending test order to demonstrate deletion/revocation.",
            "6. Open Adminer and show the `lab_test` table in MySQL."
        ],
        "sql_query": "SELECT id, requisition_number, test_name, sample_type, status, result_value, is_abnormal FROM lab_test ORDER BY id DESC LIMIT 5;",
        "viva_qa": [
            {
                "q": "Explain the medical lifecycle stages of a diagnostic test in your module.",
                "a": "A test progresses through three distinct states: (1) `REQUESTED`: Physician or patient initiates the diagnostic request; (2) `SAMPLE_COLLECTED`: Phlebotomy draws the biological specimen (e.g. Venous Whole Blood, Serum, Urine) and stamps the collection time; (3) `COMPLETED`: Medical laboratory technologist performs the biochemical assay, inputs quantitative numerical results, compares them against established biological reference intervals, flags abnormalities, and signs the report."
            },
            {
                "q": "How does the system automatically detect abnormal pathology results?",
                "a": "Each test in our catalog defines biological reference ranges (e.g. Fasting Blood Sugar: 70–100 mg/dL, Platelet count: 150,000–450,000 /µL). When the technologist inputs results, values exceeding or falling below reference limits set `isAbnormal = true`, which renders a high-visibility coral-red alert pill across clinical workstations."
            },
            {
                "q": "How does the lab module integrate with Billing?",
                "a": "Each test in the catalog has an authorized tariff fee (e.g. Lipid Profile: LKR 2,200.00). When Kesaru's billing module generates the patient's comprehensive outpatient bill, it queries `labTestRepository` for all investigations conducted during that encounter, appending the lab charges into the final invoice."
            }
        ]
    }
]

def generate_markdown(m):
    return f"""# PulseOS — Viva Technical Defense & Module Source Code Dossier
## SLIIT SE2030 Software Engineering Project — Batch 02 | Group 60
### Academic Year 2026 | Year 2 Semester 1

---

### Student Information:
- **Full Name**: `{m['student_name']}`
- **Preferred Name**: `{m['preferred_name']}`
- **Student ID (IT Number)**: `{m['it_number']}`
- **Official SLIIT Email**: `{m['email']}`
- **Assigned Major Function**: **{m['id']}: {m['module_title']}**
- **Dedicated Git Branch**: `{m['git_branch']}`
- **Production URL**: `https://pulseos.tekkeys.com`
- **Database Web Interface (Adminer)**: `https://pulseos.tekkeys.com/adminer`

---

## 1. Assigned Design Pattern: {m['design_pattern']}

### Why This Pattern Was Chosen & How It Works:
{m['design_pattern_explanation']}

> **Viva Tip**: When the lecturer asks: *"What design pattern did you use in your individual module?"*  
> Confidently answer: *"In my module ({m['module_title']}), I implemented the **{m['design_pattern'].split('(')[0].strip()}**. Let me show you exactly where in my code it is located..."*

---

## 2. Complete CRUD Implementation Map

Every team member is evaluated on having complete **CRUD (Create, Read, Update, Delete)** functionality in both the **Backend (Java Spring Boot)** and **Frontend (React TypeScript)**, connected to a live database.

| Operation | Action Description | Backend Location (Controller & Service) | Frontend UI Component | Database SQL Executed |
| :--- | :--- | :--- | :--- | :--- |
| **CREATE** | {m['crud']['create']['desc']} | `{m['crud']['create']['backend']}` | `{m['crud']['create']['frontend']}` | `{m['crud']['create']['db_action']}` |
| **READ** | {m['crud']['read']['desc']} | `{m['crud']['read']['backend']}` | `{m['crud']['read']['frontend']}` | `{m['crud']['read']['db_action']}` |
| **UPDATE** | {m['crud']['update']['desc']} | `{m['crud']['update']['backend']}` | `{m['crud']['update']['frontend']}` | `{m['crud']['update']['db_action']}` |
| **DELETE** | {m['crud']['delete']['desc']} | `{m['crud']['delete']['backend']}` | `{m['crud']['delete']['frontend']}` | `{m['crud']['delete']['db_action']}` |

---

## 3. Step-by-Step Live Viva Demonstration Script

Follow this exact sequence on your screen when demonstrating to the lecturer:
{chr(10).join(m['viva_demo_steps'])}

---

## 4. Live Database Verification Query

Keep **Adminer** (`https://pulseos.tekkeys.com/adminer`) or your local MySQL client open. Run this SQL query to show the lecturer that your data is actively persisting:

```sql
-- Database: pulseos_db
{m['sql_query']}
```

---

## 5. High-Probability Viva Questions & Model Answers

{chr(10).join([f"### Q{i+1}: {qa['q']}{chr(10)}> **Answer**: {qa['a']}{chr(10)}" for i, qa in enumerate(m['viva_qa'])])}

---

## 6. Included Source Code Files in This Folder

### Backend Java Files (`backend/`):
{chr(10).join([f"- `{os.path.basename(f)}`" for f in m['backend_files']])}

### Frontend React Files (`frontend/`):
{chr(10).join([f"- `{os.path.basename(f)}`" for f in m['frontend_files']])}

---
*Generated for SLIIT SE2030 Group 60 Evaluation | PulseOS Hospital Management System*
"""

def main():
    if os.path.exists(DIST_DIR):
        shutil.rmtree(DIST_DIR)
    os.makedirs(DIST_DIR, exist_ok=True)

    print(f"Packaging Viva modules to: {DIST_DIR}")

    for m in MEMBERS:
        target_folder = os.path.join(DIST_DIR, m["dir_name"])
        target_backend = os.path.join(target_folder, "backend")
        target_frontend = os.path.join(target_folder, "frontend")
        os.makedirs(target_backend, exist_ok=True)
        os.makedirs(target_frontend, exist_ok=True)

        # Copy backend files
        for rel_file in m["backend_files"]:
            src_file = os.path.join(BASE_DIR, rel_file)
            if os.path.exists(src_file):
                shutil.copy2(src_file, target_backend)
            else:
                print(f"[WARN] Backend file missing: {src_file}")

        # Copy frontend files
        for rel_file in m["frontend_files"]:
            src_file = os.path.join(BASE_DIR, rel_file)
            if os.path.exists(src_file):
                shutil.copy2(src_file, target_frontend)
            else:
                print(f"[WARN] Frontend file missing: {src_file}")

        # Write README.md
        readme_path = os.path.join(target_folder, "README.md")
        with open(readme_path, "w", encoding="utf-8") as f:
            f.write(generate_markdown(m))

        # Create zip file
        zip_path = os.path.join(DIST_DIR, f"{m['dir_name']}.zip")
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(target_folder):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, DIST_DIR)
                    zipf.write(file_path, arcname)

        print(f"Created: {m['dir_name']} and {m['dir_name']}.zip")

    print("\nAll 6 Viva modules packaged and zipped successfully!")

if __name__ == "__main__":
    main()
