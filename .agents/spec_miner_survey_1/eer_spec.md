# PulseOS Hospital Management System — Authoritative EER Specification & Relational Schema Survey

**Document Status**: Authoritative Baseline  
**Date**: 2026-09-14  
**Project**: PulseOS Web-Based Hospital Management System (SLIIT SE2030 / Batch 02 / Group 60 / 2026-Y2-S1-KU-60)  
**Primary Specification Source**: `/Users/admin/Projects/honda_leda/docs/PulseOS_EER_Diagram.drawio`  
**Secondary References**: 
- `/Users/admin/Projects/honda_leda/.agents/ORIGINAL_REQUEST.md`
- `/Users/admin/Projects/honda_leda/docs/CONTEXT.md`
- `/Users/admin/Projects/honda_leda/docs/adr/0001-architecture-decisions.md`
- `/Users/admin/Projects/honda_leda/docs/proposal_extracted.txt`

---

## 1. Executive Summary & Specification Provenance

The authoritative domain model for **PulseOS** is formally defined in the academic Enhanced Entity-Relationship (EER) diagram (`PulseOS_EER_Diagram.drawio`, originally constructed for IT2140 Database Design & Development, SLIIT Faculty of Computing, Group 01 Conceptual Schema).

This document provides the definitive relational schema transformation, mapping every conceptual entity, attribute hierarchy, specialization constraint, participation rule, cardinality ratio, and aggregation boundary to a production-ready MySQL 8 (InnoDB) and embedded H2 compatible relational schema.

### Core Architectural Metrics
- **Conceptual Entities Identified**: 18 Distinct Entity Sets (Strong, Weak, Superclasses, Subclasses)
- **Conceptual Aggregations**: 1 (`Consultation_Encounter` aggregating Patient, Doctor, Appointment)
- **Conceptual Relationships**: 18 Relationships (Binary, Recursive/Unary, Identifying, Aggregation-Dependent)
- **Inheritance Hierarchies**: 2 Tiers of `[t, d]` (Total Specialization, Disjoint Constraint)
- **Total Relational Tables Required**: 26 Tables (18 core entity tables + 3 multivalued child tables + 4 M:N junction tables + 1 admission history table)
- **Domain Enumerations**: 11 Standard Enumerations with explicit lifecycle states

---
## 2. Specification Mining Discovery Tables

### 2.1 Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| F01 | Inheritance | Person Superclass Hierarchy | Base identity for all human actors in hospital | NIC/Passport No, Name (First, Last), Address (Street, City, PostalCode), DOB, Gender | Person record with derived Age | Reject duplicate NIC/Passport, reject invalid DOB | EER `ent_person`, `attr_p_nic`, `isa_person` |
| F02 | Inheritance | Employee Superclass Hierarchy | Shared staff attributes and departmental placement | EmployeeID, HireDate, Salary, EmploymentType, DepartmentID, SupervisorID | Employee record | Reject duplicate EmployeeID, reject negative salary, enforce valid department FK | EER `ent_employee`, `attr_e_id`, `rel_works_in` |
| F03 | Specialization | Role-Specific Staff Entities | Subclasses: Doctor, Receptionist, Pharmacist, LabTechnician, SystemAdmin | Role metadata (License Nos, Specializations, Consultation Fees, Desk Nos, Certification Levels, Admin Levels) | Role profile linked to Employee | Enforce disjoint role assignment, unique professional licenses | EER `isa_employee`, `ent_doctor`..`ent_sysadmin` |
| F04 | Patient Mgmt | Patient Profile & Emergency Contact | Intake demographics, blood group, emergency contact composite | PatientID, NIC/Passport FK, BloodGroup, RegistrationDate, EmergencyContact (Name, Rel, Phone) | Registered Patient record | Reject missing emergency contact, reject duplicate PatientID | EER `ent_patient`, `attr_pat_id`, `attr_pat_econt` |
| F05 | Appointments | Patient Consultation Booking | Encounter scheduling between Patient and Doctor with room assignment | AppointmentID, PatientID, DoctorID, ApptDate, ApptTime, Status, ReasonForVisit, RoomNumber, BookingDate | Scheduled Appointment record | Reject doctor time conflict (double-booking), reject past booking date | EER `ent_appointment`, `rel_books`, `rel_assigned` |
| F06 | Aggregation | Consultation Encounter Aggregation | Conceptual boundary binding Patient, Doctor, Appointment for clinical orders | AppointmentID reference | Context for Prescriptions and Lab Orders | Disallow clinical orders without valid confirmed appointment | EER `agg_consultation`, `rel_issues_rx`, `rel_orders_test` |
| F07 | Pharmacy | Prescription Issuance & Itemization | Doctor orders medication regimen with dosage, frequency, duration, quantity | PrescriptionID, AppointmentID, DoctorID, PatientID, PrescriptionDate, DoctorInstructions, Drug items | Issued Prescription + itemized drugs | Reject zero quantity, reject unapproved drug IDs | EER `ent_prescription`, `rel_prescribes`, `rel_issues_rx` |
| F08 | Pharmacy | Drug Inventory & Batch Expiry Tracking | Medicine catalogue with stock tracking, batch numbers, unit prices | DrugID, DrugName, GenericName, Category, UnitPrice, StockQuantity, BatchNumber, ExpiryDate | Stored Drug item with low-stock alert flag | Reject negative stock, flag expired drugs | EER `ent_drug`, `attr_dr_id`, `attr_dr_exp` |
| F09 | Pharmacy | Prescription Dispensing Workflow | Pharmacist fulfills prescription items, deducting inventory in real-time | PharmacistID, DrugID, PrescriptionID, DispenseDate, DispensedQty | Inventory deduction + Dispense audit log | Reject if stock < DispensedQty, disallow unauthenticated dispensing | EER `rel_dispenses`, `attr_dsp_qty` |
| F10 | Laboratory | Lab Test Ordering & Result Tracking | Doctor orders diagnostic investigation, technician records results | TestID, AppointmentID, PatientID, DoctorID, TestName, Category, StandardFee, TestDate, ResultData, ReferenceRange, TestStatus | Ordered test, sample collection record, verified result report | Enforce state progression: REQUESTED -> SAMPLE_COLLECTED -> PROCESSING -> COMPLETED | EER `ent_labtest`, `rel_orders_test`, `rel_conducts` |
| F11 | Billing | Automated Itemized Invoicing | Encapsulates Consultation Fee + Dispensed Drugs + Lab Tests into patient invoice | InvoiceID, PatientID, BillingDate, TaxAmount, Line items (Drugs, Tests) | Itemized Invoice with derived TotalAmount | Disallow negative fees, reject payment against voided invoice | EER `ent_invoice`, `rel_generates`, `rel_cont_drug`, `rel_cont_test` |
| F12 | Billing | Weak Entity Payment Settlement | Payment transaction settling an invoice via Cash, Card, or PayHere Gateway | PaymentID, InvoiceID, AmountPaid, PaymentMethod, PaymentDate, TransactionRef | Payment receipt, updates Invoice status to PAID | Reject amount > balance due, reject duplicate transaction ref | EER `ent_payment`, `rel_settled` (identifying rel) |
| F13 | Ward Mgmt | Inpatient Ward Bed Allocation | Patient hospital admission with ward bed tracking | WardID, WardName, WardType, BedCapacity, CurrentOccupancy, AdmissionDate, DischargeDate, BedNumber | Active Bed Allocation | Reject admission if CurrentOccupancy >= BedCapacity | EER `ent_ward`, `rel_admitted` |
| F14 | Hospital Admin | Department & Management Hierarchy | Organizational departments with appointed doctor/staff manager | DepartmentID, DepartmentName, Location, Budget, ManagerID, AppointmentDate | Department record with 1:1 Manager | Enforce 1:1 management constraint (1 manager per dept) | EER `ent_department`, `rel_works_in`, `rel_manages` |
| F15 | Staff Mgmt | Supervisory Hierarchy | Recursive employee supervision tree | SupervisorID, SuperviseeID, SupervisionDate | Employee reporting line | Disallow self-supervision, disallow circular supervision graphs | EER `rel_supervises`, `attr_sup_date` |
| F16 | Procurement | Supplier & Purchase Order Intake | Pharmacy replenishment orders placed with external drug suppliers | SupplierID, Name, Contact, PurchaseOrderID, PharmacistID, Items (Drug, Qty, UnitCost) | Purchase Order with derived TotalCost | Enforce positive order quantities and unit costs | EER `ent_supplier`, `ent_po`, `rel_placed_with`, `rel_inc_drug`, `rel_creates_po` |

---

### 2.2 Edge Cases & Observed System Invariants

| # | Feature | Input / Condition | Observed Specification Rule |
|---|---------|-------------------|-----------------------------|
| E01 | Double-Booking Prevention | Doctor D, Time T, Patient P1 booked. Patient P2 attempts booking at Doctor D, Time T. | System MUST reject booking with explicit conflict error: 'Doctor is already scheduled for another consultation at this slot'. (Total participation on Appointment requires doctor assignment). |
| E02 | Disjoint Role Constraint | Employee E registered as Doctor attempts registration as Receptionist. | ISA constraint `[t, d]` mandates disjointness: an employee cannot hold multiple specialized roles in the base schema. |
| E03 | Drug Stock Depletion | Prescription requests 30 tablets of Drug D; current `stockQuantity` is 10. | Dispensing MUST be blocked with error 'Insufficient stock (Available: 10, Requested: 30)'. Low-stock alert triggered. |
| E04 | Derived Age Calculation | Patient DOB entered as `2000-05-15`. Age queried in 2026. | Age attribute is derived (`dashed ellipse`). Value is not stored as raw mutable integer; generated via `TIMESTAMPDIFF(YEAR, dob, CURDATE())`. |
| E05 | Multivalued Normalization | Person has 3 mobile numbers (`+94771234567`, `+94719876543`, `+94112345678`). | Cannot be comma-separated in 1NF. Mapped to normalized child table `person_contacts` with composite PK `(person_nic, contact_number)`. |
| E06 | Identifying Relationship Payment | Payment record created without valid `InvoiceID`. | Weak entity `ent_payment` has existence dependency (`double rectangle`, `strokeWidth=3.2`). Payment cannot exist without parent Invoice (`ON DELETE CASCADE`). |
| E07 | Ward Capacity Guard | Ward W capacity = 20, occupancy = 20. Attempting to admit Patient P. | Admission blocked with error 'Ward is at full capacity (20/20 beds occupied)'. |
| E08 | Aggregated Invoicing | Invoice for encounter with Dr. Fee (Rs. 2500) + 2 Drugs (Rs. 1200) + 1 Lab Test (Rs. 1800) + Tax (Rs. 0). | Invoice `total_amount` derived column = Rs. 5500.00. Status starts `PENDING`. Transitions to `PAID` only upon Payment creation. |
| E09 | 1:1 Manager Constraint | Employee E already manages Department D1. Attempting to assign E as manager of Department D2. | EER specifies 1:1 relationship between Employee and Department for `Manages`. ManagerID must have `UNIQUE` constraint in `departments`. |
| E10 | Supervision Hierarchy | Employee E assigned supervisor E (self-reference). | Domain invariant: `supervisor_id != employee_id` CHECK constraint. |

---
## 3. Inheritance & Specialization Architecture

The PulseOS EER diagram exhibits a two-tiered specialization hierarchy governed by the strict academic constraint **`[t, d]`**:
- **Total Specialization (`t`)**: Every superclass instance MUST belong to at least one subclass (Covering / Mandatory).
- **Disjointness (`d`)**: A superclass instance CANNOT belong to more than one subclass simultaneously (No Overlap / Mutually Exclusive).

```
                            ┌────────────────────────┐
                            │         Person         │ (Superclass)
                            │   [NIC_PassportNo: PK] │
                            └───────────┬────────────┘
                                        │
                                    ISA [t, d]
                     ┌──────────────────┴──────────────────┐
                     │                                     │
           ┌─────────┴──────────┐               ┌──────────┴──────────┐
           │      Patient       │               │      Employee       │ (Superclass)
           │ [PatientID: PK/AK] │               │  [EmployeeID: PK]   │
           └────────────────────┘               └──────────┬──────────┘
                                                           │
                                                       ISA [t, d]
           ┌──────────────┬──────────────┬─────────────────┼──────────────────┐
           │              │              │                 │                  │
    ┌──────┴──────┐ ┌─────┴──────┐ ┌─────┴──────┐   ┌──────┴──────┐    ┌──────┴──────┐
    │   Doctor    │ │Receptionist│ │ Pharmacist │   │LabTechnician│    │ SystemAdmin │
    │ [LicenseNo] │ │  [DeskNo]  │ │ [LicenseNo]│   │[CertLevel]  │    │ [AdminLevel]│
    └─────────────┘ └────────────┘ └────────────┘   └─────────────┘    └─────────────┘
```

### 3.1 Relational Strategy: Table-Per-Type (Joined-Table Inheritance)

In production MySQL 8 and JPA architecture, **Table-Per-Type (Joined Tables)** is the optimal strategy because:
1. Subclasses have distinct, non-overlapping attributes (e.g., `consultation_fee` on Doctor, `shift_block` on Receptionist, `pharmacy_license_no` on Pharmacist).
2. Prevents wide, sparse tables with hundreds of nullable columns (which would violate 3NF and increase disk fragmentation).
3. Enforces referential integrity at the database foreign-key layer.
4. Each subclass table shares the primary key of its immediate superclass (`employee_id`), acting simultaneously as Primary Key and Foreign Key (`ON DELETE CASCADE`).
5. A discriminator column (`person_type`, `employee_role`) is maintained on superclass tables to enable high-performance polymorphic queries without multi-table outer joins.

---
## 4. Comprehensive Entity Dictionary & Relational Schema Mapping

Below is the complete specification for every entity, attribute hierarchy, and mapped relational table.

---

### Entity 1: Person (`ent_person`) — Superclass
- **EER Classification**: Strong Entity Set / Superclass
- **Semantic Definition**: Represents any human individual registered in the hospital ecosystem.
- **Relational Table**: `persons`

| Attribute in EER | Logical Column Name | Data Type | Key / Constraint | Nullable | Description & Domain Rules |
|------------------|---------------------|-----------|------------------|----------|----------------------------|
| `NIC_PassportNo` | `nic_passport_no` | `VARCHAR(20)` | **PRIMARY KEY** | NO | National Identity Card or Passport number. Natural unique key. |
| `PersonName.FirstName` | `first_name` | `VARCHAR(50)` | - | NO | First name of the person. |
| `PersonName.LastName` | `last_name` | `VARCHAR(50)` | - | NO | Last / Family name of the person. |
| `Address.Street` | `street` | `VARCHAR(100)` | - | YES | Street address / residential line. |
| `Address.City` | `city` | `VARCHAR(50)` | - | NO | City / Municipality. |
| `Address.PostalCode` | `postal_code` | `VARCHAR(20)` | - | YES | Postal code. |
| `DOB` | `date_of_birth` | `DATE` | - | NO | Date of birth. Must be `<= CURDATE()`. |
| `Age` | `age` | `INT` | **DERIVED** | YES | Virtual generated column: `AS (TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE())) VIRTUAL` |
| `Gender` | `gender` | `VARCHAR(10)` | ENUM Check | NO | Values: `'MALE'`, `'FEMALE'`, `'OTHER'`. |
| `PersonType` | `person_type` | `VARCHAR(20)` | Discriminator | NO | Values: `'PATIENT'`, `'EMPLOYEE'`. Enforces `[t, d]` hierarchy. |
| - | `created_at` | `DATETIME` | Audit Timestamp | NO | Default: `CURRENT_TIMESTAMP`. |

#### Child Table: `person_contacts` (Multivalued Attribute `attr_p_contact`)
- **EER Classification**: Multivalued attribute on `Person`
- **Relational Table**: `person_contacts`

| Logical Column Name | Data Type | Key / Constraint | Nullable | Description |
|---------------------|-----------|------------------|----------|-------------|
| `person_nic` | `VARCHAR(20)` | **PK, FK -> `persons(nic_passport_no)`** | NO | Cascades on delete. |
| `contact_number` | `VARCHAR(20)` | **PK** | NO | Phone number (e.g. Mobile, Landline). Format: `+94...` or standard phone format. |

---

### Entity 2: Patient (`ent_patient`) — Subclass of Person
- **EER Classification**: Subclass of `Person`
- **Semantic Definition**: An individual seeking or receiving clinical evaluation, diagnostic tests, or inpatient care.
- **Relational Table**: `patients`

| Attribute in EER | Logical Column Name | Data Type | Key / Constraint | Nullable | Description & Domain Rules |
|------------------|---------------------|-----------|------------------|----------|----------------------------|
| `PatientID` | `patient_id` | `BIGINT AUTO_INCREMENT` | **PRIMARY KEY** | NO | Unique surrogate patient identifier (e.g., PID-1001). |
| `NIC_PassportNo` | `nic_passport_no` | `VARCHAR(20)` | **FK -> `persons(nic_passport_no)`**, **UNIQUE** | NO | Foreign key establishing 1:1 specialization inheritance. |
| `BloodGroup` | `blood_group` | `VARCHAR(15)` | ENUM Check | YES | Values: `'A_POSITIVE'`, `'A_NEGATIVE'`, `'B_POSITIVE'`, `'B_NEGATIVE'`, `'AB_POSITIVE'`, `'AB_NEGATIVE'`, `'O_POSITIVE'`, `'O_NEGATIVE'`, `'UNKNOWN'`. |
| `RegistrationDate` | `registration_date` | `DATE` | - | NO | Date patient was first registered. Default: `CURRENT_DATE`. |
| `EmergencyContact.ContactName` | `emergency_contact_name` | `VARCHAR(100)` | - | YES | Name of designated emergency contact person. |
| `EmergencyContact.Relationship` | `emergency_contact_relation` | `VARCHAR(50)` | - | YES | Relationship (e.g. Spouse, Parent, Sibling, Guardian). |
| `EmergencyContact.ContactPhone` | `emergency_contact_phone` | `VARCHAR(20)` | - | YES | Telephone number of emergency contact. |
| (M1 Intake Spec) | `triage_priority` | `VARCHAR(20)` | ENUM Check | NO | Values: `'ROUTINE'`, `'URGENT'`, `'EMERGENCY'`. Default: `'ROUTINE'`. |
| (M1 Intake Spec) | `allergies` | `TEXT` | - | YES | Documented medical / drug allergies (e.g., Penicillin). |
| (M1 Intake Spec) | `is_archived` | `BOOLEAN` | Soft Delete | NO | Default: `FALSE`. Allows record archiving. |

---

### Entity 3: Employee (`ent_employee`) — Subclass of Person & Superclass of Roles
- **EER Classification**: Subclass of `Person`, Superclass of Staff Roles
- **Semantic Definition**: Any employed hospital staff member.
- **Relational Table**: `employees`

| Attribute in EER | Logical Column Name | Data Type | Key / Constraint | Nullable | Description & Domain Rules |
|------------------|---------------------|-----------|------------------|----------|----------------------------|
| `EmployeeID` | `employee_id` | `BIGINT AUTO_INCREMENT` | **PRIMARY KEY** | NO | Unique employee identifier (e.g., EMP-101). |
| `NIC_PassportNo` | `nic_passport_no` | `VARCHAR(20)` | **FK -> `persons(nic_passport_no)`**, **UNIQUE** | NO | Specialization link to parent `persons`. |
| `HireDate` | `hire_date` | `DATE` | - | NO | Date employment commenced. |
| `Salary` | `salary` | `DECIMAL(12, 2)` | `CHECK (salary >= 0)` | NO | Basic monthly/annual salary. |
| `EmploymentType` | `employment_type` | `VARCHAR(20)` | ENUM Check | NO | Values: `'FULL_TIME'`, `'PART_TIME'`, `'CONTRACT'`, `'INTERN'`. |
| `DepartmentID` | `department_id` | `BIGINT` | **FK -> `departments(department_id)`** | NO | `rel_works_in` relationship (Total participation of employee). |
| `JoiningDate` | `dept_joining_date` | `DATE` | From `rel_works_in` | NO | Date employee joined assigned department. |
| `SupervisorID` | `supervisor_id` | `BIGINT` | **FK -> `employees(employee_id)`** | YES | `rel_supervises` recursive relationship. NULL for top executive. |
| `SupervisionDate` | `supervision_date` | `DATE` | From `rel_supervises` | YES | Date supervisor was assigned. |
| `EmployeeRole` | `employee_role` | `VARCHAR(30)` | Discriminator | NO | Values: `'DOCTOR'`, `'RECEPTIONIST'`, `'PHARMACIST'`, `'LAB_TECHNICIAN'`, `'SYSTEM_ADMIN'`. |
| - | `email` | `VARCHAR(100)` | **UNIQUE** | NO | Corporate email for system authentication. |
| - | `password_hash` | `VARCHAR(255)` | - | NO | Secure password hash for PulseOS web login. |

#### Child Table: `employee_qualifications` (Multivalued Attribute `attr_e_qual`)
- **EER Classification**: Multivalued attribute on `Employee`
- **Relational Table**: `employee_qualifications`

| Logical Column Name | Data Type | Key / Constraint | Nullable | Description |
|---------------------|-----------|------------------|----------|-------------|
| `employee_id` | `BIGINT` | **PK, FK -> `employees(employee_id)`** | NO | Cascades on delete. |
| `qualification` | `VARCHAR(100)` | **PK** | NO | Degree / Certification (e.g., MBBS, MD, B.Pharm, FCPS). |

---

### Entity 4: Doctor (`ent_doctor`) — Subclass of Employee
- **EER Classification**: Subclass of `Employee`
- **Semantic Definition**: Licensed medical practitioner who conducts consultations, diagnoses illnesses, prescribes medications, and orders diagnostic investigations.
- **Relational Table**: `doctors`

| Attribute in EER | Logical Column Name | Data Type | Key / Constraint | Nullable | Description & Domain Rules |
|------------------|---------------------|-----------|------------------|----------|----------------------------|
| `EmployeeID` | `employee_id` | `BIGINT` | **PRIMARY KEY**, **FK -> `employees(employee_id)`** | NO | Specialization primary key / foreign key. |
| `DoctorLicenseNo` | `doctor_license_no` | `VARCHAR(50)` | **UNIQUE** | NO | SLMC (Sri Lanka Medical Council) or relevant board license number. |
| `Specialization` | `specialization` | `VARCHAR(100)` | - | NO | Clinical domain: e.g., 'Cardiology', 'General Medicine', 'Pediatrics'. |
| `ConsultationFee` | `consultation_fee` | `DECIMAL(10, 2)` | `CHECK (consultation_fee >= 0)` | NO | Doctor consultation fee added to encounters and invoices. |

---

### Entity 5: Receptionist (`ent_receptionist`) — Subclass of Employee
- **EER Classification**: Subclass of `Employee`
- **Semantic Definition**: Front-desk administrative officer handling patient intake, appointment bookings, and initial inquiries.
- **Relational Table**: `receptionists`

| Attribute in EER | Logical Column Name | Data Type | Key / Constraint | Nullable | Description & Domain Rules |
|------------------|---------------------|-----------|------------------|----------|----------------------------|
| `EmployeeID` | `employee_id` | `BIGINT` | **PRIMARY KEY**, **FK -> `employees(employee_id)`** | NO | Specialization primary key / foreign key. |
| `DeskNumber` | `desk_number` | `VARCHAR(20)` | - | NO | Physical counter / workstation code (e.g., 'DESK-01', 'RECEP-A'). |
| `ShiftBlock` | `shift_block` | `VARCHAR(20)` | ENUM Check | NO | Values: `'MORNING'`, `'EVENING'`, `'NIGHT'`, `'ROTATING'`. |

---

### Entity 6: Pharmacist (`ent_pharmacist`) — Subclass of Employee
- **EER Classification**: Subclass of `Employee`
- **Semantic Definition**: Healthcare professional managing hospital dispensary, stock replenishment, and drug verification.
- **Relational Table**: `pharmacists`

| Attribute in EER | Logical Column Name | Data Type | Key / Constraint | Nullable | Description & Domain Rules |
|------------------|---------------------|-----------|------------------|----------|----------------------------|
| `EmployeeID` | `employee_id` | `BIGINT` | **PRIMARY KEY**, **FK -> `employees(employee_id)`** | NO | Specialization primary key / foreign key. |
| `PharmacyLicenseNo` | `pharmacy_license_no` | `VARCHAR(50)` | **UNIQUE** | NO | National pharmaceutical regulatory council registration number. |
| `AssignedUnit` | `assigned_unit` | `VARCHAR(50)` | - | NO | Unit: e.g., 'Outpatient Pharmacy', 'Inpatient Dispensary', 'Main Central Store'. |

---

### Entity 7: LabTechnician (`ent_labtech`) — Subclass of Employee
- **EER Classification**: Subclass of `Employee`
- **Semantic Definition**: Clinical specialist executing laboratory diagnostic tests, analyzing samples, and logging results.
- **Relational Table**: `lab_technicians`

| Attribute in EER | Logical Column Name | Data Type | Key / Constraint | Nullable | Description & Domain Rules |
|------------------|---------------------|-----------|------------------|----------|----------------------------|
| `EmployeeID` | `employee_id` | `BIGINT` | **PRIMARY KEY**, **FK -> `employees(employee_id)`** | NO | Specialization primary key / foreign key. |
| `CertificationLevel` | `certification_level` | `VARCHAR(50)` | - | NO | Technical rank: e.g., 'Level 1 MLT', 'Senior Technologist', 'Chief Biochemist'. |
| `LabSection` | `lab_section` | `VARCHAR(50)` | - | NO | Departmental division: 'Hematology', 'Biochemistry', 'Microbiology', 'Histopathology'. |

---

### Entity 8: SystemAdmin (`ent_sysadmin`) — Subclass of Employee
- **EER Classification**: Subclass of `Employee`
- **Semantic Definition**: IT operations specialist managing user accounts, role-based access control (RBAC), and security audits.
- **Relational Table**: `system_admins`

| Attribute in EER | Logical Column Name | Data Type | Key / Constraint | Nullable | Description & Domain Rules |
|------------------|---------------------|-----------|------------------|----------|----------------------------|
| `EmployeeID` | `employee_id` | `BIGINT` | **PRIMARY KEY**, **FK -> `employees(employee_id)`** | NO | Specialization primary key / foreign key. |
| `AdminLevel` | `admin_level` | `VARCHAR(30)` | - | NO | Privilege tier: 'SUPER_ADMIN', 'SECURITY_ADMIN', 'SYSTEM_AUDITOR'. |
| `SecurityClearance` | `security_clearance` | `VARCHAR(50)` | - | NO | Clearance rating: 'TOP_SECRET', 'LEVEL_3', 'STANDARD_ADMIN'. |

---

### Entity 9: Department (`ent_department`)
- **EER Classification**: Strong Entity Set
- **Semantic Definition**: Functional operational division of the hospital (e.g., Cardiology, Radiology, Pharmacy, Administration).
- **Relational Table**: `departments`

| Attribute in EER | Logical Column Name | Data Type | Key / Constraint | Nullable | Description & Domain Rules |
|------------------|---------------------|-----------|------------------|----------|----------------------------|
| `DepartmentID` | `department_id` | `BIGINT AUTO_INCREMENT` | **PRIMARY KEY** | NO | Unique department identifier. |
| `DepartmentName` | `department_name` | `VARCHAR(100)` | **UNIQUE** | NO | Name of department (e.g., 'Cardiology', 'Pediatrics', 'Laboratory Services'). |
| `Location` | `location` | `VARCHAR(100)` | - | NO | Hospital building / floor location (e.g., 'Building B, Floor 2'). |
| `Budget` | `budget` | `DECIMAL(14, 2)` | `CHECK (budget >= 0)` | NO | Annual operating fiscal budget. |
| `ManagerID` | `manager_id` | `BIGINT` | **FK -> `employees(employee_id)`**, **UNIQUE** | YES | 1:1 `rel_manages` relationship. Only 1 manager per department. |
| `AppointmentDate` | `manager_appointed_date` | `DATE` | From `rel_manages` | YES | Date manager was assigned to head this department. |

---

### Entity 10: Ward (`ent_ward`)
- **EER Classification**: Strong Entity Set
- **Semantic Definition**: Inpatient accommodation unit containing beds for hospitalized patients.
- **Relational Table**: `wards`

| Attribute in EER | Logical Column Name | Data Type | Key / Constraint | Nullable | Description & Domain Rules |
|------------------|---------------------|-----------|------------------|----------|----------------------------|
| `WardID` | `ward_id` | `BIGINT AUTO_INCREMENT` | **PRIMARY KEY** | NO | Unique ward identifier. |
| `WardName` | `ward_name` | `VARCHAR(100)` | **UNIQUE** | NO | Descriptive name (e.g., 'Surgical Ward A', 'Pediatric ICU', 'Maternity Ward'). |
| `WardType` | `ward_type` | `VARCHAR(30)` | ENUM Check | NO | Values: `'GENERAL'`, `'ICU'`, `'MATERNITY'`, `'PEDIATRIC'`, `'SURGICAL'`, `'ISOLATION'`. |
| `BedCapacity` | `bed_capacity` | `INT` | `CHECK (bed_capacity > 0)` | NO | Maximum number of patient beds in the ward. |
| `CurrentOccupancy` | `current_occupancy` | `INT` | `CHECK (current_occupancy >= 0)` | NO | Number of currently admitted patients. Must be `<= bed_capacity`. |

#### Relational Junction / Relationship Table: `patient_admissions` (Relationship `rel_admitted`)
- **EER Classification**: 1:N Relationship between `Ward` (1) and `Patient` (N) with descriptive attributes
- **Relational Table**: `patient_admissions`

| Logical Column Name | Data Type | Key / Constraint | Nullable | Description |
|---------------------|-----------|------------------|----------|-------------|
| `admission_id` | `BIGINT AUTO_INCREMENT` | **PRIMARY KEY** | NO | Unique admission record identifier. |
| `patient_id` | `BIGINT` | **FK -> `patients(patient_id)`** | NO | Admitted patient. |
| `ward_id` | `BIGINT` | **FK -> `wards(ward_id)`** | NO | Assigned ward. |
| `bed_number` | `VARCHAR(20)` | - | NO | Specific bed label (e.g., 'BED-14'). From `attr_ad_bed`. |
| `admission_date` | `DATETIME` | - | NO | Admission timestamp. From `attr_ad_date`. |
| `discharge_date` | `DATETIME` | - | YES | Discharge timestamp. NULL while patient is currently admitted. From `attr_ad_dis`. |

---

### Entity 11: Appointment (`ent_appointment`)
- **EER Classification**: Strong Entity Set
- **Semantic Definition**: Scheduled clinical encounter between a Patient and a Doctor.
- **Relational Table**: `appointments`

| Attribute in EER | Logical Column Name | Data Type | Key / Constraint | Nullable | Description & Domain Rules |
|------------------|---------------------|-----------|------------------|----------|----------------------------|
| `AppointmentID` | `appointment_id` | `BIGINT AUTO_INCREMENT` | **PRIMARY KEY** | NO | Unique appointment booking identifier. |
| `PatientID` | `patient_id` | `BIGINT` | **FK -> `patients(patient_id)`** | NO | Total participation in `rel_books` (Every appointment belongs to a patient). |
| `DoctorID` | `doctor_id` | `BIGINT` | **FK -> `doctors(employee_id)`** | NO | Total participation in `rel_assigned` (Every appointment assigned to a doctor). |
| `BookingDate` | `booking_date` | `DATETIME` | From `rel_books` | NO | Timestamp when appointment booking was logged. |
| `RoomNumber` | `room_number` | `VARCHAR(20)` | From `rel_assigned` | YES | Consultation room / clinic room allocated. |
| `ApptDate` | `appointment_date` | `DATE` | - | NO | Calendar date scheduled for the consultation. |
| `ApptTime` | `appointment_time` | `TIME` | - | NO | Slot start time (e.g. '09:30:00'). |
| `Status` | `status` | `VARCHAR(25)` | ENUM Check | NO | Values: `'SCHEDULED'`, `'CONFIRMED'`, `'IN_CONSULTATION'`, `'COMPLETED'`, `'CANCELLED'`, `'NO_SHOW'`. Default: `'SCHEDULED'`. |
| `ReasonForVisit` | `reason_for_visit` | `TEXT` | - | YES | Chief complaint / consultation reason entered by patient or receptionist. |
| **Domain Invariant** | `(doctor_id, appointment_date, appointment_time)` | **UNIQUE INDEX** | Conflict Guard | NO | Enforces strict double-booking prevention constraint. |

---

### Conceptual Aggregation: Consultation Encounter (`agg_consultation`)
- **EER Classification**: High-Level Encapsulation / Aggregation Container
- **Semantic Definition**: Encapsulates the clinical encounter uniting `Patient`, `Doctor`, and `Appointment`. Acts as the semantic parent that issues `Prescriptions` and orders `LabTests`.
- **Relational Realization**: In the normalized relational model, the primary key of the encounter is `appointment_id`. Child clinical orders (`prescriptions`, `lab_tests`) reference `appointment_id` (and denormalized `patient_id` and `doctor_id` for query optimization and referential integrity).

---

### Entity 12: Prescription (`ent_prescription`)
- **EER Classification**: Strong Entity Set (issued via `rel_issues_rx` from `Consultation_Encounter`)
- **Semantic Definition**: Formal medical order specifying pharmacological treatments for a patient.
- **Relational Table**: `prescriptions`

| Attribute in EER | Logical Column Name | Data Type | Key / Constraint | Nullable | Description & Domain Rules |
|------------------|---------------------|-----------|------------------|----------|----------------------------|
| `PrescriptionID` | `prescription_id` | `BIGINT AUTO_INCREMENT` | **PRIMARY KEY** | NO | Unique prescription order number. |
| `AppointmentID` | `appointment_id` | `BIGINT` | **FK -> `appointments(appointment_id)`** | NO | Clinical encounter during which prescription was issued. |
| `DoctorID` | `doctor_id` | `BIGINT` | **FK -> `doctors(employee_id)`** | NO | Prescribing physician. |
| `PatientID` | `patient_id` | `BIGINT` | **FK -> `patients(patient_id)`** | NO | Patient receiving the prescription. |
| `PrescriptionDate` | `prescription_date` | `DATETIME` | - | NO | Date/time of issuance. Default: `CURRENT_TIMESTAMP`. |
| `DoctorInstructions` | `doctor_instructions` | `TEXT` | - | YES | Clinical guidance / dietary warnings / special administration notes. |

---

### Entity 13: Drug (`ent_drug`)
- **EER Classification**: Strong Entity Set
- **Semantic Definition**: Pharmaceutical medication item stocked and dispensed by the hospital pharmacy.
- **Relational Table**: `drugs`

| Attribute in EER | Logical Column Name | Data Type | Key / Constraint | Nullable | Description & Domain Rules |
|------------------|---------------------|-----------|------------------|----------|----------------------------|
| `DrugID` | `drug_id` | `BIGINT AUTO_INCREMENT` | **PRIMARY KEY** | NO | Unique medication SKU code. |
| `DrugName` | `drug_name` | `VARCHAR(100)` | - | NO | Commercial / brand name (e.g., 'Amoxil 500mg', 'Panadol'). |
| `GenericName` | `generic_name` | `VARCHAR(100)` | - | NO | Active pharmaceutical ingredient (e.g., 'Amoxicillin Trihydrate', 'Paracetamol'). |
| `Category` | `category` | `VARCHAR(50)` | - | NO | Drug class (e.g., 'Antibiotic', 'Analgesic', 'Antihypertensive', 'Antidiabetic'). |
| `UnitPrice` | `unit_price` | `DECIMAL(10, 2)` | `CHECK (unit_price >= 0)` | NO | Retail sale price per tablet/vial. |
| `StockQuantity` | `stock_quantity` | `INT` | `CHECK (stock_quantity >= 0)` | NO | Current inventory count on hand. |
| `BatchNumber` | `batch_number` | `VARCHAR(50)` | - | NO | Manufacturing batch number for recall traceability. |
| `ExpiryDate` | `expiry_date` | `DATE` | - | NO | Expiration date of the batch. |
| (M4 Inventory Spec)| `reorder_level` | `INT` | `CHECK (reorder_level >= 0)` | NO | Threshold triggering low-stock alert (Default: 50). |

---

### Relationship Table: `prescription_items` (M:N Relationship `rel_prescribes`)
- **EER Classification**: Many-to-Many Relationship between `Prescription` (M) and `Drug` (N)
- **Relational Table**: `prescription_items`

| Attribute in EER | Logical Column Name | Data Type | Key / Constraint | Nullable | Description & Domain Rules |
|------------------|---------------------|-----------|------------------|----------|----------------------------|
| `PrescriptionID` | `prescription_id` | `BIGINT` | **PK, FK -> `prescriptions(prescription_id)`** | NO | Parent prescription. Cascades on delete. |
| `DrugID` | `drug_id` | `BIGINT` | **PK, FK -> `drugs(drug_id)`** | NO | Prescribed medicine. Restrict delete. |
| `Dosage` | `dosage` | `VARCHAR(50)` | - | NO | Amount per dose (e.g., '500 mg', '10 ml', '1 tablet'). From `attr_pr_dos`. |
| `Frequency` | `frequency` | `VARCHAR(50)` | - | NO | Schedule (e.g., 'TID (3 times daily)', 'Once daily after breakfast'). From `attr_pr_freq`. |
| `DurationDays` | `duration_days` | `INT` | `CHECK (duration_days > 0)` | NO | Treatment duration in days. From `attr_pr_dur`. |
| `Quantity` | `quantity` | `INT` | `CHECK (quantity > 0)` | NO | Total unit count prescribed. From `attr_pr_qty`. |
| - | `is_dispensed` | `BOOLEAN` | - | NO | Default: `FALSE`. Toggled to `TRUE` upon pharmacy fulfillment. |

---

### Relationship Table: `drug_dispensations` (Relationship `rel_dispenses`)
- **EER Classification**: 1:N Relationship between `Pharmacist` (1) and `Drug` (N) with descriptive attributes
- **Relational Table**: `drug_dispensations`

| Attribute in EER | Logical Column Name | Data Type | Key / Constraint | Nullable | Description & Domain Rules |
|------------------|---------------------|-----------|------------------|----------|----------------------------|
| `DispensationID` | `dispensation_id` | `BIGINT AUTO_INCREMENT` | **PRIMARY KEY** | NO | Unique dispense event transaction log. |
| `PharmacistID` | `pharmacist_id` | `BIGINT` | **FK -> `pharmacists(employee_id)`** | NO | Pharmacist fulfilling the medication. |
| `DrugID` | `drug_id` | `BIGINT` | **FK -> `drugs(drug_id)`** | NO | Medicine dispensed. |
| `PrescriptionID` | `prescription_id` | `BIGINT` | **FK -> `prescriptions(prescription_id)`** | YES | Linked prescription being fulfilled. |
| `DispenseDate` | `dispense_date` | `DATETIME` | - | NO | Timestamp of dispensation. From `attr_dsp_date`. Default: `CURRENT_TIMESTAMP`. |
| `DispensedQty` | `dispensed_qty` | `INT` | `CHECK (dispensed_qty > 0)` | NO | Number of units deducted from inventory. From `attr_dsp_qty`. |

---

### Entity 14: LabTest (`ent_labtest`)
- **EER Classification**: Strong Entity Set (ordered via `rel_orders_test` from `Consultation_Encounter`, conducted via `rel_conducts` by `LabTechnician`)
- **Semantic Definition**: Clinical pathology, biochemistry, or radiology investigation ordered for a patient.
- **Relational Table**: `lab_tests`

| Attribute in EER | Logical Column Name | Data Type | Key / Constraint | Nullable | Description & Domain Rules |
|------------------|---------------------|-----------|------------------|----------|----------------------------|
| `TestID` | `test_id` | `BIGINT AUTO_INCREMENT` | **PRIMARY KEY** | NO | Unique diagnostic test request identifier. |
| `AppointmentID` | `appointment_id` | `BIGINT` | **FK -> `appointments(appointment_id)`** | NO | Clinical encounter context (from `rel_orders_test`). |
| `PatientID` | `patient_id` | `BIGINT` | **FK -> `patients(patient_id)`** | NO | Patient undergoing testing. |
| `DoctorID` | `doctor_id` | `BIGINT` | **FK -> `doctors(employee_id)`** | NO | Ordering doctor. |
| `ClinicalIndication` | `clinical_indication` | `VARCHAR(255)` | From `rel_orders_test` | YES | Diagnostic question / symptoms warranting the test. |
| `TechnicianID` | `technician_id` | `BIGINT` | **FK -> `lab_technicians(employee_id)`** | YES | Conducting lab technician (from `rel_conducts`). |
| `ConductionDate` | `conduction_date` | `DATETIME` | From `rel_conducts` | YES | Timestamp when sample was analyzed. |
| `TestName` | `test_name` | `VARCHAR(100)` | - | NO | Name of test (e.g., 'Full Blood Count (FBC)', 'Fasting Blood Sugar', 'Lipid Profile'). |
| `Category` | `category` | `VARCHAR(50)` | - | NO | Diagnostic discipline: 'Hematology', 'Biochemistry', 'Microbiology', 'Radiology'. |
| `StandardFee` | `standard_fee` | `DECIMAL(10, 2)` | `CHECK (standard_fee >= 0)` | NO | Billable price of the test. |
| `TestDate` | `test_date` | `DATE` | - | NO | Date test was ordered / requested. |
| `ResultData` | `result_data` | `TEXT` | - | YES | Quantitative test findings (e.g. 'WBC: 7.2 x10^3/uL, Hemoglobin: 14.5 g/dL'). |
| `ReferenceRange` | `reference_range` | `VARCHAR(100)` | - | YES | Normal clinical baseline values (e.g., '70 - 99 mg/dL'). |
| `TestStatus` | `test_status` | `VARCHAR(25)` | ENUM Check | NO | Values: `'REQUESTED'`, `'SAMPLE_COLLECTED'`, `'PROCESSING'`, `'COMPLETED'`, `'CANCELLED'`. Default: `'REQUESTED'`. |

---

### Entity 15: Invoice (`ent_invoice`)
- **EER Classification**: Strong Entity Set
- **Semantic Definition**: Official financial statement itemizing all consultation fees, dispensed pharmaceuticals, and laboratory tests for a patient.
- **Relational Table**: `invoices`

| Attribute in EER | Logical Column Name | Data Type | Key / Constraint | Nullable | Description & Domain Rules |
|------------------|---------------------|-----------|------------------|----------|----------------------------|
| `InvoiceID` | `invoice_id` | `BIGINT AUTO_INCREMENT` | **PRIMARY KEY** | NO | Unique fiscal invoice number (e.g., INV-2026-001). |
| `PatientID` | `patient_id` | `BIGINT` | **FK -> `patients(patient_id)`** | NO | Total participation in `rel_generates` (`Billed_To`). |
| `BillingDate` | `billing_date` | `DATETIME` | From `rel_generates` | NO | Timestamp of billing generation. |
| `AppointmentID` | `appointment_id` | `BIGINT` | **FK -> `appointments(appointment_id)`** | YES | Associated encounter (for consultation fee charge). |
| `InvoiceDate` | `invoice_date` | `DATE` | - | NO | Calendar invoice date. Default: `CURRENT_DATE`. |
| `TaxAmount` | `tax_amount` | `DECIMAL(10, 2)` | `CHECK (tax_amount >= 0)` | NO | Applicable government / municipal tax. Default: `0.00`. |
| `TotalAmount` | `total_amount` | `DECIMAL(12, 2)` | **DERIVED** | NO | Sum of Consultation Fee + Billed Drugs + Lab Tests + Tax. |
| `PaymentStatus` | `payment_status` | `VARCHAR(25)` | ENUM Check | NO | Values: `'DRAFT'`, `'PENDING'`, `'PARTIALLY_PAID'`, `'PAID'`, `'CANCELLED'`, `'VOIDED'`. Default: `'PENDING'`. |

#### Relationship Table: `invoice_drug_items` (M:N Relationship `rel_cont_drug`)
- **EER Classification**: Many-to-Many Relationship between `Invoice` (M) and `Drug` (N)
- **Relational Table**: `invoice_drug_items`

| Attribute in EER | Logical Column Name | Data Type | Key / Constraint | Nullable | Description & Domain Rules |
|------------------|---------------------|-----------|------------------|----------|----------------------------|
| `InvoiceID` | `invoice_id` | `BIGINT` | **PK, FK -> `invoices(invoice_id)`** | NO | Cascades on invoice deletion. |
| `DrugID` | `drug_id` | `BIGINT` | **PK, FK -> `drugs(drug_id)`** | NO | Medication billed. Restrict delete. |
| `BilledQty` | `billed_qty` | `INT` | `CHECK (billed_qty > 0)` | NO | Quantity charged. From `attr_cd_qty`. |
| `SubTotal` | `sub_total` | `DECIMAL(10, 2)` | `CHECK (sub_total >= 0)` | NO | Line total (`billed_qty * unit_price`). From `attr_cd_sub`. |

#### Relationship Table: `invoice_lab_items` (M:N Relationship `rel_cont_test`)
- **EER Classification**: Many-to-Many Relationship between `Invoice` (M) and `LabTest` (N)
- **Relational Table**: `invoice_lab_items`

| Attribute in EER | Logical Column Name | Data Type | Key / Constraint | Nullable | Description & Domain Rules |
|------------------|---------------------|-----------|------------------|----------|----------------------------|
| `InvoiceID` | `invoice_id` | `BIGINT` | **PK, FK -> `invoices(invoice_id)`** | NO | Cascades on invoice deletion. |
| `TestID` | `test_id` | `BIGINT` | **PK, FK -> `lab_tests(test_id)`** | NO | Lab test billed. Restrict delete. |
| `TestFee` | `test_fee` | `DECIMAL(10, 2)` | `CHECK (test_fee >= 0)` | NO | Diagnostic fee charged. From `attr_ct_fee`. |

---

### Entity 16: Payment (`ent_payment` / PaymentTransaction) — Weak Entity
- **EER Classification**: Weak Entity Set (`double rectangle` in EER notation)
- **Identifying Relationship**: `rel_settled` (`Settled_By`, `double rhombus`) with `Invoice` (Total existence dependency)
- **Semantic Definition**: Monetary settlement record discharging the balance of an invoice.
- **Relational Table**: `payments`

| Attribute in EER | Logical Column Name | Data Type | Key / Constraint | Nullable | Description & Domain Rules |
|------------------|---------------------|-----------|------------------|----------|----------------------------|
| `PaymentID` | `payment_id` | `BIGINT AUTO_INCREMENT` | **PRIMARY KEY** | NO | Unique payment transaction identifier. |
| `InvoiceID` | `invoice_id` | `BIGINT` | **FK -> `invoices(invoice_id)`** | NO | Existence dependency: Cascades on delete. Must exist. |
| `PaymentDate` | `payment_date` | `DATETIME` | - | NO | Timestamp when payment was settled. Default: `CURRENT_TIMESTAMP`. |
| `AmountPaid` | `amount_paid` | `DECIMAL(12, 2)` | `CHECK (amount_paid > 0)` | NO | Value received in local currency (LKR). |
| `PaymentMethod` | `payment_method` | `VARCHAR(30)` | ENUM Check | NO | Values: `'CASH'`, `'CREDIT_CARD'`, `'DEBIT_CARD'`, `'PAYHERE_GATEWAY'`, `'BANK_TRANSFER'`, `'INSURANCE'`. |
| `TransactionRef` | `transaction_ref` | `VARCHAR(100)` | **UNIQUE** | YES | External payment gateway transaction reference / receipt tracking number. |

---

### Entity 17: Supplier (`ent_supplier`)
- **EER Classification**: Strong Entity Set
- **Semantic Definition**: External commercial pharmaceutical manufacturer or distributor supplying medical drugs to the hospital.
- **Relational Table**: `suppliers`

| Attribute in EER | Logical Column Name | Data Type | Key / Constraint | Nullable | Description & Domain Rules |
|------------------|---------------------|-----------|------------------|----------|----------------------------|
| `SupplierID` | `supplier_id` | `BIGINT AUTO_INCREMENT` | **PRIMARY KEY** | NO | Unique supplier identification number. |
| `SupplierName` | `supplier_name` | `VARCHAR(100)` | - | NO | Registered company / distributor name (e.g., 'State Pharmaceuticals Corp', 'GlaxoSmithKline SL'). |
| `Email` | `email` | `VARCHAR(100)` | - | NO | Corporate correspondence email. |
| `SupplierAddress.Street` | `street` | `VARCHAR(100)` | - | YES | Office / warehouse street address. |
| `SupplierAddress.City` | `city` | `VARCHAR(50)` | - | NO | City location. |
| `SupplierAddress.ZipCode` | `zip_code` | `VARCHAR(20)` | - | YES | Postal / Zip code. |

#### Child Table: `supplier_phones` (Multivalued Attribute `attr_sup_phone`)
- **EER Classification**: Multivalued attribute on `Supplier`
- **Relational Table**: `supplier_phones`

| Logical Column Name | Data Type | Key / Constraint | Nullable | Description |
|---------------------|-----------|------------------|----------|-------------|
| `supplier_id` | `BIGINT` | **PK, FK -> `suppliers(supplier_id)`** | NO | Cascades on supplier deletion. |
| `phone_number` | `VARCHAR(20)` | **PK** | NO | Commercial telephone / dispatch hotline number. |

---

### Entity 18: PurchaseOrder (`ent_po`)
- **EER Classification**: Strong Entity Set
- **Semantic Definition**: Formal procurement order created by a Pharmacist and issued to a Supplier for drug replenishment.
- **Relational Table**: `purchase_orders`

| Attribute in EER | Logical Column Name | Data Type | Key / Constraint | Nullable | Description & Domain Rules |
|------------------|---------------------|-----------|------------------|----------|----------------------------|
| `OrderID` | `order_id` | `BIGINT AUTO_INCREMENT` | **PRIMARY KEY** | NO | Unique procurement order number. |
| `SupplierID` | `supplier_id` | `BIGINT` | **FK -> `suppliers(supplier_id)`** | NO | Total participation in `rel_placed_with` (Placed_With). |
| `PharmacistID` | `pharmacist_id` | `BIGINT` | **FK -> `pharmacists(employee_id)`** | NO | Total participation in `rel_creates_po` (Creates_PO). |
| `OrderTimestamp` | `order_timestamp` | `DATETIME` | From `rel_placed_with` | NO | Timestamp order was dispatched. Default: `CURRENT_TIMESTAMP`. |
| `OrderDate` | `order_date` | `DATE` | - | NO | Calendar procurement order date. |
| `DeliveryStatus` | `delivery_status` | `VARCHAR(25)` | ENUM Check | NO | Values: `'PENDING'`, `'ORDERED'`, `'SHIPPED'`, `'DELIVERED'`, `'CANCELLED'`. Default: `'PENDING'`. |
| `TotalCost` | `total_cost` | `DECIMAL(14, 2)` | **DERIVED** | NO | Derived sum of `ordered_qty * unit_cost` across all included items. |

#### Relationship Table: `purchase_order_items` (M:N Relationship `rel_inc_drug`)
- **EER Classification**: Many-to-Many Relationship between `PurchaseOrder` (M) and `Drug` (N)
- **Relational Table**: `purchase_order_items`

| Attribute in EER | Logical Column Name | Data Type | Key / Constraint | Nullable | Description & Domain Rules |
|------------------|---------------------|-----------|------------------|----------|----------------------------|
| `OrderID` | `order_id` | `BIGINT` | **PK, FK -> `purchase_orders(order_id)`** | NO | Parent purchase order. Cascades on delete. |
| `DrugID` | `drug_id` | `BIGINT` | **PK, FK -> `drugs(drug_id)`** | NO | Medication ordered. Restrict delete. |
| `OrderedQty` | `ordered_qty` | `INT` | `CHECK (ordered_qty > 0)` | NO | Quantity of units ordered. From `attr_id_qty`. |
| `UnitCost` | `unit_cost` | `DECIMAL(10, 2)` | `CHECK (unit_cost >= 0)` | NO | Agreed wholesale acquisition cost per unit. From `attr_id_cost`. |

---
## 5. Comprehensive Relationship, Cardinality & Participation Matrix

The PulseOS EER diagram includes 18 formally specified relationships. Each has verified cardinalities and structural participation constraints encoded in line thickness:
- **Total Participation (Mandatory / Existence Dependency)**: Represented by **Thick Line (`strokeWidth=3.2`)** in `PulseOS_EER_Diagram.drawio`.
- **Partial Participation (Optional Existence)**: Represented by **Thin Line (`strokeWidth=1.4`)** in `PulseOS_EER_Diagram.drawio`.

| # | Relationship Name | Entity 1 (Role & Cardinality) | Participation 1 | Entity 2 (Role & Cardinality) | Participation 2 | Ratio | Descriptive Attributes | Relational Implementation |
|---|-------------------|-------------------------------|-----------------|-------------------------------|-----------------|-------|------------------------|---------------------------|
| R01 | `Supervises` | `Employee` (Supervisor: 1) | Partial (Optional) | `Employee` (Supervisee: N) | Partial (Optional) | 1:N (Recursive) | `SupervisionDate` | `employees.supervisor_id` (FK) + `employees.supervision_date` |
| R02 | `Books` | `Patient` (1) | **Total (Mandatory)** | `Appointment` (N) | **Total (Mandatory)** | 1:N | `BookingDate` | `appointments.patient_id` (FK NOT NULL) + `appointments.booking_date` |
| R03 | `Assigned_To` | `Doctor` (1) | Partial (Optional) | `Appointment` (N) | **Total (Mandatory)** | 1:N | `RoomNumber` | `appointments.doctor_id` (FK NOT NULL) + `appointments.room_number` |
| R04 | `Issues` | `Consultation_Encounter` (1) | Partial (Optional) | `Prescription` (N) | **Total (Mandatory)** | 1:N | `IssueDate` | `prescriptions.appointment_id` (FK NOT NULL) + `prescriptions.prescription_date` |
| R05 | `Orders` | `Consultation_Encounter` (1) | Partial (Optional) | `LabTest` (N) | **Total (Mandatory)** | 1:N | `ClinicalIndication` | `lab_tests.appointment_id` (FK NOT NULL) + `lab_tests.clinical_indication` |
| R06 | `Prescribes` | `Prescription` (M) | **Total (Mandatory)** | `Drug` (N) | Partial (Optional) | M:N | `Dosage`, `Frequency`, `DurationDays`, `Quantity` | Junction Table `prescription_items` (Composite PK: `prescription_id`, `drug_id`) |
| R07 | `Dispenses` | `Pharmacist` (1) | Partial (Optional) | `Drug` (N) | Partial (Optional) | 1:N | `DispenseDate`, `DispensedQty` | Transaction Table `drug_dispensations` (`pharmacist_id`, `drug_id`, `dispense_date`, `dispensed_qty`) |
| R08 | `Conducts` | `LabTechnician` (1) | Partial (Optional) | `LabTest` (N) | **Total (Mandatory)** | 1:N | `ConductionDate` | `lab_tests.technician_id` (FK) + `lab_tests.conduction_date` |
| R09 | `Billed_To` | `Patient` (1) | **Total (Mandatory)** | `Invoice` (N) | **Total (Mandatory)** | 1:N | `BillingDate` | `invoices.patient_id` (FK NOT NULL) + `invoices.billing_date` |
| R10 | `Contains_Drug` | `Drug` (N) | Partial (Optional) | `Invoice` (M) | Partial (Optional) | M:N | `BilledQty`, `SubTotal` | Junction Table `invoice_drug_items` (Composite PK: `invoice_id`, `drug_id`) |
| R11 | `Contains_Test` | `LabTest` (N) | Partial (Optional) | `Invoice` (M) | Partial (Optional) | M:N | `TestFee` | Junction Table `invoice_lab_items` (Composite PK: `invoice_id`, `test_id`) |
| R12 | `Settled_By` | `Invoice` (1) | **Total (Mandatory)** | `Payment` (N) | **Total (Mandatory)** | 1:N (Identifying) | None | `payments.invoice_id` (FK NOT NULL, ON DELETE CASCADE) |
| R13 | `Works_In` | `Department` (1) | Partial (Optional) | `Employee` (N) | **Total (Mandatory)** | 1:N | `JoiningDate` | `employees.department_id` (FK NOT NULL) + `employees.dept_joining_date` |
| R14 | `Manages` | `Employee` (1) | Partial (Optional) | `Department` (1) | **Total (Mandatory)** | 1:1 | `AppointmentDate` | `departments.manager_id` (FK UNIQUE NOT NULL) + `departments.manager_appointed_date` |
| R15 | `Admitted_To` | `Ward` (1) | Partial (Optional) | `Patient` (N) | Partial (Optional) | 1:N | `AdmissionDate`, `DischargeDate`, `BedNumber` | Transaction Table `patient_admissions` (`patient_id`, `ward_id`, `bed_number`, `admission_date`, `discharge_date`) |
| R16 | `Placed_With` | `Supplier` (1) | Partial (Optional) | `PurchaseOrder` (N) | **Total (Mandatory)** | 1:N | `OrderTimestamp` | `purchase_orders.supplier_id` (FK NOT NULL) + `purchase_orders.order_timestamp` |
| R17 | `Creates_PO` | `Pharmacist` (1) | Partial (Optional) | `PurchaseOrder` (N) | **Total (Mandatory)** | 1:N | None | `purchase_orders.pharmacist_id` (FK NOT NULL) |
| R18 | `Includes_Drug`| `PurchaseOrder` (M) | **Total (Mandatory)** | `Drug` (N) | Partial (Optional) | M:N | `OrderedQty`, `UnitCost` | Junction Table `purchase_order_items` (Composite PK: `order_id`, `drug_id`) |

---
## 6. Comprehensive Domain Enumerations & State Machines

PulseOS enforces strict data integrity through the following standardized domain enumerations:

### 6.1 `AppointmentStatus`
- **Definition**: Lifecycle state of a patient consultation encounter.
- **Values**:
  - `SCHEDULED`: Initial state upon patient or receptionist booking.
  - `CONFIRMED`: Patient arrival acknowledged or booking re-verified.
  - `IN_CONSULTATION`: Patient is actively consulting with the doctor.
  - `COMPLETED`: Doctor has finished evaluation, issued prescriptions/lab orders.
  - `CANCELLED`: Appointment cancelled prior to slot start time.
  - `NO_SHOW`: Patient failed to appear for the scheduled appointment.
- **Allowed Transitions**:
  - `SCHEDULED` -> `CONFIRMED` -> `IN_CONSULTATION` -> `COMPLETED`
  - `SCHEDULED` -> `CANCELLED`
  - `CONFIRMED` -> `CANCELLED`
  - `CONFIRMED` -> `NO_SHOW`

### 6.2 `LabTestStatus`
- **Definition**: Diagnostic laboratory specimen and processing lifecycle.
- **Values**:
  - `REQUESTED`: Physician ordered test during consultation encounter.
  - `SAMPLE_COLLECTED`: Phlebotomist / Technician obtained blood/urine/tissue sample.
  - `PROCESSING`: Specimen undergoing analytical / biochemical examination.
  - `COMPLETED`: Results verified, reference ranges compared, report ready.
  - `CANCELLED`: Test cancelled due to sample hemolysis or clinical withdrawal.
- **Allowed Transitions**:
  - `REQUESTED` -> `SAMPLE_COLLECTED` -> `PROCESSING` -> `COMPLETED`
  - `REQUESTED` -> `CANCELLED`

### 6.3 `InvoiceStatus` / `PaymentStatus`
- **Definition**: Fiscal billing lifecycle of a patient encounter invoice.
- **Values**:
  - `DRAFT`: Initial invoice compilation during encounter.
  - `PENDING`: Finalized bill awaiting payment from patient or insurer.
  - `PARTIALLY_PAID`: Partial payment installment received.
  - `PAID`: Full settlement received and cleared (via Cash, Card, or PayHere).
  - `CANCELLED`: Invoice superseded by revised bill or patient void.
  - `VOIDED`: Fiscal audit void.
- **Allowed Transitions**:
  - `DRAFT` -> `PENDING` -> `PAID`
  - `PENDING` -> `PARTIALLY_PAID` -> `PAID`
  - `PENDING` -> `CANCELLED`

### 6.4 `PaymentMethod`
- **Definition**: Authorized financial settlement instruments.
- **Values**:
  - `CASH`: Physical currency tendered at hospital cashier.
  - `CREDIT_CARD`: Over-the-counter POS terminal card transaction.
  - `DEBIT_CARD`: Over-the-counter POS terminal debit transaction.
  - `PAYHERE_GATEWAY`: Online payment gateway (sandbox.payhere.lk).
  - `BANK_TRANSFER`: Direct wire transfer / LankaPay slip settlement.
  - `INSURANCE`: Third-party health insurance claim settlement.

### 6.5 `TriagePriority`
- **Definition**: Clinical urgency assigned during patient intake registration.
- **Values**:
  - `ROUTINE`: Non-urgent, standard general outpatient consultation.
  - `URGENT`: Requires expedited consultation within 1-2 hours.
  - `EMERGENCY`: Immediate life-threatening medical resuscitation.

### 6.6 `DeliveryStatus` (Purchase Order)
- **Definition**: Procurement shipment lifecycle for pharmaceutical restocking.
- **Values**:
  - `PENDING`: Requisition drafted by Pharmacist, awaiting supplier dispatch.
  - `ORDERED`: Purchase order officially transmitted to supplier.
  - `SHIPPED`: Goods in transit from supplier warehouse.
  - `DELIVERED`: Physical goods inspected, verified, and added to inventory.
  - `CANCELLED`: Procurement order cancelled.

### 6.7 `Gender`
- **Values**: `'MALE'`, `'FEMALE'`, `'OTHER'`.

### 6.8 `BloodGroup`
- **Values**: `'A_POSITIVE'`, `'A_NEGATIVE'`, `'B_POSITIVE'`, `'B_NEGATIVE'`, `'AB_POSITIVE'`, `'AB_NEGATIVE'`, `'O_POSITIVE'`, `'O_NEGATIVE'`, `'UNKNOWN'`.

### 6.9 `EmploymentType`
- **Values**: `'FULL_TIME'`, `'PART_TIME'`, `'CONTRACT'`, `'INTERN'`.

### 6.10 `ShiftBlock`
- **Values**: `'MORNING'`, `'EVENING'`, `'NIGHT'`, `'ROTATING'`.

### 6.11 `WardType`
- **Values**: `'GENERAL'`, `'ICU'`, `'MATERNITY'`, `'PEDIATRIC'`, `'SURGICAL'`, `'ISOLATION'`.

---
## 7. Authoritative Production MySQL 8 DDL Blueprint

The following complete SQL DDL implements the PulseOS EER schema with 100% fidelity, including foreign keys, cascades, indexes, and constraints. It is fully dual-compatible with MySQL 8.0+ and H2 Database (using `MODE=MySQL`).

```sql
-- =============================================================================
-- PulseOS Hospital Management System - Complete Production Relational Schema
-- Derived authoritatively from docs/PulseOS_EER_Diagram.drawio (IT2140 Group 01)
-- Dual-Engine Compatible: MySQL 8.0+ (InnoDB) & H2 (MODE=MySQL)
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Persons Table (Superclass)
DROP TABLE IF EXISTS person_contacts;
DROP TABLE IF EXISTS persons;
CREATE TABLE persons (
    nic_passport_no VARCHAR(20) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    street VARCHAR(100),
    city VARCHAR(50) NOT NULL,
    postal_code VARCHAR(20),
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    person_type VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_persons PRIMARY KEY (nic_passport_no),
    CONSTRAINT chk_person_gender CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    CONSTRAINT chk_person_type CHECK (person_type IN ('PATIENT', 'EMPLOYEE'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Person Contacts (Multivalued: ContactNumbers)
CREATE TABLE person_contacts (
    person_nic VARCHAR(20) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    CONSTRAINT pk_person_contacts PRIMARY KEY (person_nic, contact_number),
    CONSTRAINT fk_person_contacts_person FOREIGN KEY (person_nic) 
        REFERENCES persons (nic_passport_no) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Patients Table (Subclass of Person)
DROP TABLE IF EXISTS patients;
CREATE TABLE patients (
    patient_id BIGINT AUTO_INCREMENT NOT NULL,
    nic_passport_no VARCHAR(20) NOT NULL,
    blood_group VARCHAR(15),
    registration_date DATE NOT NULL,
    emergency_contact_name VARCHAR(100),
    emergency_contact_relation VARCHAR(50),
    emergency_contact_phone VARCHAR(20),
    triage_priority VARCHAR(20) NOT NULL DEFAULT 'ROUTINE',
    allergies TEXT,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT pk_patients PRIMARY KEY (patient_id),
    CONSTRAINT uq_patients_nic UNIQUE (nic_passport_no),
    CONSTRAINT fk_patients_person FOREIGN KEY (nic_passport_no) 
        REFERENCES persons (nic_passport_no) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_patient_bg CHECK (blood_group IN ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE', 'UNKNOWN')),
    CONSTRAINT chk_patient_triage CHECK (triage_priority IN ('ROUTINE', 'URGENT', 'EMERGENCY'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Departments Table
DROP TABLE IF EXISTS departments;
CREATE TABLE departments (
    department_id BIGINT AUTO_INCREMENT NOT NULL,
    department_name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    budget DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    manager_id BIGINT NULL,
    manager_appointed_date DATE NULL,
    CONSTRAINT pk_departments PRIMARY KEY (department_id),
    CONSTRAINT uq_department_name UNIQUE (department_name),
    CONSTRAINT chk_dept_budget CHECK (budget >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Employees Table (Subclass of Person, Superclass of Roles)
DROP TABLE IF EXISTS employee_qualifications;
DROP TABLE IF EXISTS employees;
CREATE TABLE employees (
    employee_id BIGINT AUTO_INCREMENT NOT NULL,
    nic_passport_no VARCHAR(20) NOT NULL,
    hire_date DATE NOT NULL,
    salary DECIMAL(12, 2) NOT NULL,
    employment_type VARCHAR(20) NOT NULL,
    department_id BIGINT NOT NULL,
    dept_joining_date DATE NOT NULL,
    supervisor_id BIGINT NULL,
    supervision_date DATE NULL,
    employee_role VARCHAR(30) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    CONSTRAINT pk_employees PRIMARY KEY (employee_id),
    CONSTRAINT uq_employees_nic UNIQUE (nic_passport_no),
    CONSTRAINT uq_employees_email UNIQUE (email),
    CONSTRAINT fk_employees_person FOREIGN KEY (nic_passport_no) 
        REFERENCES persons (nic_passport_no) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_employees_dept FOREIGN KEY (department_id) 
        REFERENCES departments (department_id) ON DELETE RESTRICT,
    CONSTRAINT fk_employees_supervisor FOREIGN KEY (supervisor_id) 
        REFERENCES employees (employee_id) ON DELETE SET NULL,
    CONSTRAINT chk_emp_salary CHECK (salary >= 0),
    CONSTRAINT chk_emp_type CHECK (employment_type IN ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN')),
    CONSTRAINT chk_emp_role CHECK (employee_role IN ('DOCTOR', 'RECEPTIONIST', 'PHARMACIST', 'LAB_TECHNICIAN', 'SYSTEM_ADMIN'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add deferred foreign key for Department Manager (1:1 rel_manages)
ALTER TABLE departments ADD CONSTRAINT fk_dept_manager 
    FOREIGN KEY (manager_id) REFERENCES employees (employee_id) ON DELETE SET NULL;
ALTER TABLE departments ADD CONSTRAINT uq_dept_manager UNIQUE (manager_id);

-- 6. Employee Qualifications (Multivalued: Qualifications)
CREATE TABLE employee_qualifications (
    employee_id BIGINT NOT NULL,
    qualification VARCHAR(100) NOT NULL,
    CONSTRAINT pk_emp_qualifications PRIMARY KEY (employee_id, qualification),
    CONSTRAINT fk_emp_qual_employee FOREIGN KEY (employee_id) 
        REFERENCES employees (employee_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Specialized Staff Tables (Doctor, Receptionist, Pharmacist, LabTechnician, SystemAdmin)
DROP TABLE IF EXISTS doctors;
CREATE TABLE doctors (
    employee_id BIGINT NOT NULL,
    doctor_license_no VARCHAR(50) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    consultation_fee DECIMAL(10, 2) NOT NULL,
    CONSTRAINT pk_doctors PRIMARY KEY (employee_id),
    CONSTRAINT uq_doctors_license UNIQUE (doctor_license_no),
    CONSTRAINT fk_doctors_employee FOREIGN KEY (employee_id) 
        REFERENCES employees (employee_id) ON DELETE CASCADE,
    CONSTRAINT chk_doc_fee CHECK (consultation_fee >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS receptionists;
CREATE TABLE receptionists (
    employee_id BIGINT NOT NULL,
    desk_number VARCHAR(20) NOT NULL,
    shift_block VARCHAR(20) NOT NULL,
    CONSTRAINT pk_receptionists PRIMARY KEY (employee_id),
    CONSTRAINT fk_receptionists_employee FOREIGN KEY (employee_id) 
        REFERENCES employees (employee_id) ON DELETE CASCADE,
    CONSTRAINT chk_rec_shift CHECK (shift_block IN ('MORNING', 'EVENING', 'NIGHT', 'ROTATING'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS pharmacists;
CREATE TABLE pharmacists (
    employee_id BIGINT NOT NULL,
    pharmacy_license_no VARCHAR(50) NOT NULL,
    assigned_unit VARCHAR(50) NOT NULL,
    CONSTRAINT pk_pharmacists PRIMARY KEY (employee_id),
    CONSTRAINT uq_pharmacists_license UNIQUE (pharmacy_license_no),
    CONSTRAINT fk_pharmacists_employee FOREIGN KEY (employee_id) 
        REFERENCES employees (employee_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS lab_technicians;
CREATE TABLE lab_technicians (
    employee_id BIGINT NOT NULL,
    certification_level VARCHAR(50) NOT NULL,
    lab_section VARCHAR(50) NOT NULL,
    CONSTRAINT pk_lab_technicians PRIMARY KEY (employee_id),
    CONSTRAINT fk_labtech_employee FOREIGN KEY (employee_id) 
        REFERENCES employees (employee_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS system_admins;
CREATE TABLE system_admins (
    employee_id BIGINT NOT NULL,
    admin_level VARCHAR(30) NOT NULL,
    security_clearance VARCHAR(50) NOT NULL,
    CONSTRAINT pk_system_admins PRIMARY KEY (employee_id),
    CONSTRAINT fk_sysadmin_employee FOREIGN KEY (employee_id) 
        REFERENCES employees (employee_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Wards Table & Patient Admissions
DROP TABLE IF EXISTS patient_admissions;
DROP TABLE IF EXISTS wards;
CREATE TABLE wards (
    ward_id BIGINT AUTO_INCREMENT NOT NULL,
    ward_name VARCHAR(100) NOT NULL,
    ward_type VARCHAR(30) NOT NULL,
    bed_capacity INT NOT NULL,
    current_occupancy INT NOT NULL DEFAULT 0,
    CONSTRAINT pk_wards PRIMARY KEY (ward_id),
    CONSTRAINT uq_ward_name UNIQUE (ward_name),
    CONSTRAINT chk_ward_cap CHECK (bed_capacity > 0),
    CONSTRAINT chk_ward_occ CHECK (current_occupancy >= 0 AND current_occupancy <= bed_capacity),
    CONSTRAINT chk_ward_type CHECK (ward_type IN ('GENERAL', 'ICU', 'MATERNITY', 'PEDIATRIC', 'SURGICAL', 'ISOLATION'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE patient_admissions (
    admission_id BIGINT AUTO_INCREMENT NOT NULL,
    patient_id BIGINT NOT NULL,
    ward_id BIGINT NOT NULL,
    bed_number VARCHAR(20) NOT NULL,
    admission_date DATETIME NOT NULL,
    discharge_date DATETIME NULL,
    CONSTRAINT pk_patient_admissions PRIMARY KEY (admission_id),
    CONSTRAINT fk_adm_patient FOREIGN KEY (patient_id) 
        REFERENCES patients (patient_id) ON DELETE CASCADE,
    CONSTRAINT fk_adm_ward FOREIGN KEY (ward_id) 
        REFERENCES wards (ward_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Appointments Table
DROP TABLE IF EXISTS appointments;
CREATE TABLE appointments (
    appointment_id BIGINT AUTO_INCREMENT NOT NULL,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    booking_date DATETIME NOT NULL,
    room_number VARCHAR(20),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(25) NOT NULL DEFAULT 'SCHEDULED',
    reason_for_visit TEXT,
    CONSTRAINT pk_appointments PRIMARY KEY (appointment_id),
    CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id) 
        REFERENCES patients (patient_id) ON DELETE RESTRICT,
    CONSTRAINT fk_appt_doctor FOREIGN KEY (doctor_id) 
        REFERENCES doctors (employee_id) ON DELETE RESTRICT,
    CONSTRAINT uq_doctor_slot UNIQUE (doctor_id, appointment_date, appointment_time),
    CONSTRAINT chk_appt_status CHECK (status IN ('SCHEDULED', 'CONFIRMED', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED', 'NO_SHOW'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Prescriptions Table
DROP TABLE IF EXISTS prescription_items;
DROP TABLE IF EXISTS prescriptions;
CREATE TABLE prescriptions (
    prescription_id BIGINT AUTO_INCREMENT NOT NULL,
    appointment_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    patient_id BIGINT NOT NULL,
    prescription_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    doctor_instructions TEXT,
    CONSTRAINT pk_prescriptions PRIMARY KEY (prescription_id),
    CONSTRAINT fk_rx_appointment FOREIGN KEY (appointment_id) 
        REFERENCES appointments (appointment_id) ON DELETE CASCADE,
    CONSTRAINT fk_rx_doctor FOREIGN KEY (doctor_id) 
        REFERENCES doctors (employee_id) ON DELETE RESTRICT,
    CONSTRAINT fk_rx_patient FOREIGN KEY (patient_id) 
        REFERENCES patients (patient_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Drugs Table
DROP TABLE IF EXISTS drugs;
CREATE TABLE drugs (
    drug_id BIGINT AUTO_INCREMENT NOT NULL,
    drug_name VARCHAR(100) NOT NULL,
    generic_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    batch_number VARCHAR(50) NOT NULL,
    expiry_date DATE NOT NULL,
    reorder_level INT NOT NULL DEFAULT 50,
    CONSTRAINT pk_drugs PRIMARY KEY (drug_id),
    CONSTRAINT chk_drug_price CHECK (unit_price >= 0),
    CONSTRAINT chk_drug_qty CHECK (stock_quantity >= 0),
    CONSTRAINT chk_drug_reorder CHECK (reorder_level >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Prescription Items (M:N rel_prescribes)
CREATE TABLE prescription_items (
    prescription_id BIGINT NOT NULL,
    drug_id BIGINT NOT NULL,
    dosage VARCHAR(50) NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    duration_days INT NOT NULL,
    quantity INT NOT NULL,
    is_dispensed BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT pk_prescription_items PRIMARY KEY (prescription_id, drug_id),
    CONSTRAINT fk_rx_items_rx FOREIGN KEY (prescription_id) 
        REFERENCES prescriptions (prescription_id) ON DELETE CASCADE,
    CONSTRAINT fk_rx_items_drug FOREIGN KEY (drug_id) 
        REFERENCES drugs (drug_id) ON DELETE RESTRICT,
    CONSTRAINT chk_rx_duration CHECK (duration_days > 0),
    CONSTRAINT chk_rx_qty CHECK (quantity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Drug Dispensations (rel_dispenses)
DROP TABLE IF EXISTS drug_dispensations;
CREATE TABLE drug_dispensations (
    dispensation_id BIGINT AUTO_INCREMENT NOT NULL,
    pharmacist_id BIGINT NOT NULL,
    drug_id BIGINT NOT NULL,
    prescription_id BIGINT NULL,
    dispense_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dispensed_qty INT NOT NULL,
    CONSTRAINT pk_drug_dispensations PRIMARY KEY (dispensation_id),
    CONSTRAINT fk_disp_pharmacist FOREIGN KEY (pharmacist_id) 
        REFERENCES pharmacists (employee_id) ON DELETE RESTRICT,
    CONSTRAINT fk_disp_drug FOREIGN KEY (drug_id) 
        REFERENCES drugs (drug_id) ON DELETE RESTRICT,
    CONSTRAINT fk_disp_rx FOREIGN KEY (prescription_id) 
        REFERENCES prescriptions (prescription_id) ON DELETE SET NULL,
    CONSTRAINT chk_disp_qty CHECK (dispensed_qty > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Lab Tests Table (rel_orders_test & rel_conducts)
DROP TABLE IF EXISTS lab_tests;
CREATE TABLE lab_tests (
    test_id BIGINT AUTO_INCREMENT NOT NULL,
    appointment_id BIGINT NOT NULL,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    clinical_indication VARCHAR(255),
    technician_id BIGINT NULL,
    conduction_date DATETIME NULL,
    test_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    standard_fee DECIMAL(10, 2) NOT NULL,
    test_date DATE NOT NULL,
    result_data TEXT,
    reference_range VARCHAR(100),
    test_status VARCHAR(25) NOT NULL DEFAULT 'REQUESTED',
    CONSTRAINT pk_lab_tests PRIMARY KEY (test_id),
    CONSTRAINT fk_lab_appt FOREIGN KEY (appointment_id) 
        REFERENCES appointments (appointment_id) ON DELETE CASCADE,
    CONSTRAINT fk_lab_patient FOREIGN KEY (patient_id) 
        REFERENCES patients (patient_id) ON DELETE RESTRICT,
    CONSTRAINT fk_lab_doctor FOREIGN KEY (doctor_id) 
        REFERENCES doctors (employee_id) ON DELETE RESTRICT,
    CONSTRAINT fk_lab_tech FOREIGN KEY (technician_id) 
        REFERENCES lab_technicians (employee_id) ON DELETE SET NULL,
    CONSTRAINT chk_lab_fee CHECK (standard_fee >= 0),
    CONSTRAINT chk_lab_status CHECK (test_status IN ('REQUESTED', 'SAMPLE_COLLECTED', 'PROCESSING', 'COMPLETED', 'CANCELLED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Invoices Table (rel_generates Billed_To)
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS invoice_drug_items;
DROP TABLE IF EXISTS invoice_lab_items;
DROP TABLE IF EXISTS invoices;
CREATE TABLE invoices (
    invoice_id BIGINT AUTO_INCREMENT NOT NULL,
    patient_id BIGINT NOT NULL,
    appointment_id BIGINT NULL,
    billing_date DATETIME NOT NULL,
    invoice_date DATE NOT NULL,
    tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(25) NOT NULL DEFAULT 'PENDING',
    CONSTRAINT pk_invoices PRIMARY KEY (invoice_id),
    CONSTRAINT fk_inv_patient FOREIGN KEY (patient_id) 
        REFERENCES patients (patient_id) ON DELETE RESTRICT,
    CONSTRAINT fk_inv_appt FOREIGN KEY (appointment_id) 
        REFERENCES appointments (appointment_id) ON DELETE SET NULL,
    CONSTRAINT chk_inv_tax CHECK (tax_amount >= 0),
    CONSTRAINT chk_inv_total CHECK (total_amount >= 0),
    CONSTRAINT chk_inv_status CHECK (payment_status IN ('DRAFT', 'PENDING', 'PARTIALLY_PAID', 'PAID', 'CANCELLED', 'VOIDED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Invoice Drug Items (M:N rel_cont_drug)
CREATE TABLE invoice_drug_items (
    invoice_id BIGINT NOT NULL,
    drug_id BIGINT NOT NULL,
    billed_qty INT NOT NULL,
    sub_total DECIMAL(10, 2) NOT NULL,
    CONSTRAINT pk_invoice_drug_items PRIMARY KEY (invoice_id, drug_id),
    CONSTRAINT fk_inv_drug_inv FOREIGN KEY (invoice_id) 
        REFERENCES invoices (invoice_id) ON DELETE CASCADE,
    CONSTRAINT fk_inv_drug_item FOREIGN KEY (drug_id) 
        REFERENCES drugs (drug_id) ON DELETE RESTRICT,
    CONSTRAINT chk_inv_drug_qty CHECK (billed_qty > 0),
    CONSTRAINT chk_inv_drug_sub CHECK (sub_total >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Invoice Lab Items (M:N rel_cont_test)
CREATE TABLE invoice_lab_items (
    invoice_id BIGINT NOT NULL,
    test_id BIGINT NOT NULL,
    test_fee DECIMAL(10, 2) NOT NULL,
    CONSTRAINT pk_invoice_lab_items PRIMARY KEY (invoice_id, test_id),
    CONSTRAINT fk_inv_lab_inv FOREIGN KEY (invoice_id) 
        REFERENCES invoices (invoice_id) ON DELETE CASCADE,
    CONSTRAINT fk_inv_lab_test FOREIGN KEY (test_id) 
        REFERENCES lab_tests (test_id) ON DELETE RESTRICT,
    CONSTRAINT chk_inv_test_fee CHECK (test_fee >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. Payments Table (Weak Entity on Invoice via rel_settled Settled_By)
CREATE TABLE payments (
    payment_id BIGINT AUTO_INCREMENT NOT NULL,
    invoice_id BIGINT NOT NULL,
    payment_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    amount_paid DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    transaction_ref VARCHAR(100) NULL,
    CONSTRAINT pk_payments PRIMARY KEY (payment_id),
    CONSTRAINT uq_payment_ref UNIQUE (transaction_ref),
    CONSTRAINT fk_payments_invoice FOREIGN KEY (invoice_id) 
        REFERENCES invoices (invoice_id) ON DELETE CASCADE,
    CONSTRAINT chk_pay_amount CHECK (amount_paid > 0),
    CONSTRAINT chk_pay_method CHECK (payment_method IN ('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PAYHERE_GATEWAY', 'BANK_TRANSFER', 'INSURANCE'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. Suppliers Table
DROP TABLE IF EXISTS purchase_order_items;
DROP TABLE IF EXISTS purchase_orders;
DROP TABLE IF EXISTS supplier_phones;
DROP TABLE IF EXISTS suppliers;
CREATE TABLE suppliers (
    supplier_id BIGINT AUTO_INCREMENT NOT NULL,
    supplier_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    street VARCHAR(100),
    city VARCHAR(50) NOT NULL,
    zip_code VARCHAR(20),
    CONSTRAINT pk_suppliers PRIMARY KEY (supplier_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. Supplier Phones (Multivalued: ContactPhone)
CREATE TABLE supplier_phones (
    supplier_id BIGINT NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    CONSTRAINT pk_supplier_phones PRIMARY KEY (supplier_id, phone_number),
    CONSTRAINT fk_supplier_phones_sup FOREIGN KEY (supplier_id) 
        REFERENCES suppliers (supplier_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. Purchase Orders Table (rel_placed_with & rel_creates_po)
CREATE TABLE purchase_orders (
    order_id BIGINT AUTO_INCREMENT NOT NULL,
    supplier_id BIGINT NOT NULL,
    pharmacist_id BIGINT NOT NULL,
    order_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    order_date DATE NOT NULL,
    delivery_status VARCHAR(25) NOT NULL DEFAULT 'PENDING',
    total_cost DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    CONSTRAINT pk_purchase_orders PRIMARY KEY (order_id),
    CONSTRAINT fk_po_supplier FOREIGN KEY (supplier_id) 
        REFERENCES suppliers (supplier_id) ON DELETE RESTRICT,
    CONSTRAINT fk_po_pharmacist FOREIGN KEY (pharmacist_id) 
        REFERENCES pharmacists (employee_id) ON DELETE RESTRICT,
    CONSTRAINT chk_po_status CHECK (delivery_status IN ('PENDING', 'ORDERED', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    CONSTRAINT chk_po_cost CHECK (total_cost >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. Purchase Order Items (M:N rel_inc_drug)
CREATE TABLE purchase_order_items (
    order_id BIGINT NOT NULL,
    drug_id BIGINT NOT NULL,
    ordered_qty INT NOT NULL,
    unit_cost DECIMAL(10, 2) NOT NULL,
    CONSTRAINT pk_purchase_order_items PRIMARY KEY (order_id, drug_id),
    CONSTRAINT fk_poi_order FOREIGN KEY (order_id) 
        REFERENCES purchase_orders (order_id) ON DELETE CASCADE,
    CONSTRAINT fk_poi_drug FOREIGN KEY (drug_id) 
        REFERENCES drugs (drug_id) ON DELETE RESTRICT,
    CONSTRAINT chk_poi_qty CHECK (ordered_qty > 0),
    CONSTRAINT chk_poi_cost CHECK (unit_cost >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
```

---
## 8. Cross-Cutting Module Traceability Matrix

This matrix connects the 6 SE2030 student modules to the underlying EER entities and database tables:

| Module Code & Student | Feature Module Name | Primary EER Entities | Database Tables Managed | Core Invariants & SQL Triggers |
|---|---|---|---|---|
| **M1**: Somarathna P. G. D. S. (IT25103819) | Patient Management | `Person`, `Patient`, `Ward` (Admissions) | `persons`, `person_contacts`, `patients`, `patient_admissions` | Unique NIC/Passport constraint, triage priority tagging, active admission occupancy check |
| **M2**: Rathnayaka R. M. K. L. B. (IT25103999) | Doctor Management | `Person`, `Employee`, `Doctor`, `Department` | `employees`, `employee_qualifications`, `doctors`, `departments` | License uniqueness, consultation fee non-negative, department membership |
| **M3**: Malwatta M.W.C.S (IT25101620) | Appointment Management | `Appointment`, `Consultation_Encounter` | `appointments` | Strict double-booking guard `UNIQUE(doctor_id, appointment_date, appointment_time)`, status state machine |
| **M4**: Udumullage S.H.U. (IT25100826) | Inventory & Pharmacy | `Drug`, `Prescription`, `Supplier`, `PurchaseOrder` | `drugs`, `prescriptions`, `prescription_items`, `drug_dispensations`, `suppliers`, `supplier_phones`, `purchase_orders`, `purchase_order_items` | Stock non-negative, atomic inventory decrement on dispensing, low-stock threshold alert (`stock_quantity <= reorder_level`) |
| **M5**: Dhanasinghe K. A. K. H. (IT25103992) | Billing & Payment | `Invoice`, `Payment` (PaymentTransaction) | `invoices`, `invoice_drug_items`, `invoice_lab_items`, `payments` | Itemized charge aggregation (Doctor fee + Dispensed drugs + Lab tests + Tax), PayHere Sandbox integration, atomic status transition to `PAID` |
| **M6**: Thilakarathne H.S.K.P.N (IT25103363) | Laboratory & Tests | `LabTest`, `LabTechnician` | `lab_tests`, `lab_technicians` | Status tracking (`REQUESTED` -> `SAMPLE_COLLECTED` -> `PROCESSING` -> `COMPLETED`), quantitative result entry, standard fee integrity |

---

## 9. Invalidation & Verification Conditions

This specification will be invalidated if any of the following occur:
1. An entity or relationship from `PulseOS_EER_Diagram.drawio` is omitted from `schema.sql` or JPA entity classes.
2. A foreign key cascade violates patient history or billing auditability (e.g. deleting a patient deleting settled financial records).
3. The double-booking prevention constraint fails to block overlapping appointments.
4. Pharmacy stock fails to decrement when a prescription is marked dispensed.
5. Invoices fail to calculate the correct itemized sum of Doctor Fee, Dispensed Drugs, and Lab Tests.
