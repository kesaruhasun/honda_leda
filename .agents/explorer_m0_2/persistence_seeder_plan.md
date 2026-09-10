# PulseOS Relational Schema, JPA Persistence & Data Seeder Plan (Milestone M0)

**Document Status**: Authoritative Implementation Blueprint  
**Explorer**: M0-2 (`explorer_m0_2`)  
**Target Path**: `/Users/admin/Projects/honda_leda/backend`  
**Dependencies**: Milestone M0 / Spring Boot 3.2+ / Java 17  
**Dual Persistence**: Embedded H2 (`MODE=MySQL`) & MySQL 8.0+ (InnoDB)  

---

## 1. Executive Architecture & Design Rationale

### 1.1 Dual-Database Strategy (H2 & MySQL 8)
PulseOS requires zero-setup evaluator demonstration via an embedded H2 database (`jdbc:h2:mem:pulseos_db;MODE=MySQL;DB_CLOSE_DELAY=-1`) with a live interactive console at `http://localhost:8080/h2-console`, while maintaining 100% production fidelity with MySQL 8.0 (InnoDB).

To guarantee that DDL runs without errors in both engines:
1. **Standard ANSI SQL Types**: `BIGINT`, `VARCHAR(n)`, `DECIMAL(p, s)`, `DATE`, `TIME`, `DATETIME`, `TEXT`, and `BOOLEAN`.
2. **Identifier Conventions**: Strict lowercase snake_case naming for all tables and columns without engine-specific backtick quirks.
3. **Table Engine & Collation**: Standard `ENGINE=InnoDB;` syntax without table-level `COLLATE=utf8mb4_unicode_ci` clauses (which cause H2 collation lookup exceptions while MySQL 8 already defaults to `utf8mb4`).
4. **Referential Integrity Ordering**: Tables are created in strict dependency order, using `SET FOREIGN_KEY_CHECKS = 0;` at the start and `SET FOREIGN_KEY_CHECKS = 1;` at the end. Circular dependencies (such as `departments.manager_id` referencing `employees.employee_id` while `employees.department_id` references `departments.department_id`) are resolved by deferring `fk_dept_manager` to an `ALTER TABLE` statement.

### 1.2 JPA Inheritance: Table-Per-Type (`InheritanceType.JOINED`)
The EER specification exhibits a two-tiered specialization hierarchy governed by the `[t, d]` (Total Specialization, Disjoint) constraint:
- Tier 1: `Person` -> `Patient`, `Person` -> `Employee`
- Tier 2: `Employee` -> `Doctor`, `Receptionist`, `Pharmacist`, `LabTechnician`, `SystemAdmin`

In JPA:
- The root entity `Person` defines the monotonic primary key:
  `@Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "person_id") private Long id;`
  and natural unique key `@Column(name = "nic_passport_no", unique = true, nullable = false, length = 20) private String nicPassportNo;`.
- Subclass `Patient` specifies:
  `@PrimaryKeyJoinColumn(name = "patient_id", referencedColumnName = "person_id")`
  ensuring `patient_id` in `patients` table is both PK and FK referencing `persons(person_id)`.
- Subclass `Employee` specifies:
  `@PrimaryKeyJoinColumn(name = "employee_id", referencedColumnName = "person_id")`
  ensuring `employee_id` in `employees` table is both PK and FK referencing `persons(person_id)`.
- Subclasses of `Employee` (`Doctor`, `Receptionist`, `Pharmacist`, `LabTechnician`, `SystemAdmin`) specify:
  `@PrimaryKeyJoinColumn(name = "employee_id", referencedColumnName = "employee_id")`
- All clinical and operational foreign keys (`appointments.patient_id`, `appointments.doctor_id`, `prescriptions.patient_id`, `invoices.patient_id`, etc.) cleanly reference `BIGINT` IDs, maintaining optimal B-Tree index traversal and cache locality.

### 1.3 Composite Keys in Junction Tables
M:N relationships with descriptive attributes (`prescription_items`, `invoice_drug_items`, `invoice_lab_items`, `purchase_order_items`) are modeled with JPA `@EmbeddedId` composite keys paired with `@MapsId` associations. This provides type-safe compound keys matching the EER schema with zero foreign-key synchronization bugs.

---

## 2. Definitive Relational DDL Script (`schema.sql`)

Target file location: `/Users/admin/Projects/honda_leda/backend/src/main/resources/schema.sql`

```sql
-- =============================================================================
-- PulseOS Hospital Management System - Complete Production Relational Schema
-- Authoritatively aligned with docs/PulseOS_EER_Diagram.drawio (IT2140 Group 01)
-- Dual-Engine Compatible: MySQL 8.0+ (InnoDB) & Embedded H2 (MODE=MySQL)
-- Total Tables: 27
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Persons Table (Superclass)
DROP TABLE IF EXISTS person_contacts;
DROP TABLE IF EXISTS persons;
CREATE TABLE persons (
    person_id BIGINT AUTO_INCREMENT NOT NULL,
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
    CONSTRAINT pk_persons PRIMARY KEY (person_id),
    CONSTRAINT uq_persons_nic UNIQUE (nic_passport_no),
    CONSTRAINT chk_person_gender CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    CONSTRAINT chk_person_type CHECK (person_type IN ('PATIENT', 'EMPLOYEE'))
) ENGINE=InnoDB;

-- 2. Person Contacts (Multivalued: ContactNumbers)
CREATE TABLE person_contacts (
    person_id BIGINT NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    CONSTRAINT pk_person_contacts PRIMARY KEY (person_id, contact_number),
    CONSTRAINT fk_person_contacts_person FOREIGN KEY (person_id) 
        REFERENCES persons (person_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Patients Table (Subclass of Person)
DROP TABLE IF EXISTS patients;
CREATE TABLE patients (
    patient_id BIGINT NOT NULL,
    blood_group VARCHAR(15),
    registration_date DATE NOT NULL,
    emergency_contact_name VARCHAR(100),
    emergency_contact_relation VARCHAR(50),
    emergency_contact_phone VARCHAR(20),
    triage_priority VARCHAR(20) NOT NULL DEFAULT 'ROUTINE',
    allergies TEXT,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT pk_patients PRIMARY KEY (patient_id),
    CONSTRAINT fk_patients_person FOREIGN KEY (patient_id) 
        REFERENCES persons (person_id) ON DELETE CASCADE,
    CONSTRAINT chk_patient_bg CHECK (blood_group IN ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE', 'UNKNOWN')),
    CONSTRAINT chk_patient_triage CHECK (triage_priority IN ('ROUTINE', 'URGENT', 'EMERGENCY'))
) ENGINE=InnoDB;

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
) ENGINE=InnoDB;

-- 5. Employees Table (Subclass of Person, Superclass of Roles)
DROP TABLE IF EXISTS employee_qualifications;
DROP TABLE IF EXISTS employees;
CREATE TABLE employees (
    employee_id BIGINT NOT NULL,
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
    CONSTRAINT uq_employees_email UNIQUE (email),
    CONSTRAINT fk_employees_person FOREIGN KEY (employee_id) 
        REFERENCES persons (person_id) ON DELETE CASCADE,
    CONSTRAINT fk_employees_dept FOREIGN KEY (department_id) 
        REFERENCES departments (department_id) ON DELETE RESTRICT,
    CONSTRAINT fk_employees_supervisor FOREIGN KEY (supervisor_id) 
        REFERENCES employees (employee_id) ON DELETE SET NULL,
    CONSTRAINT chk_emp_salary CHECK (salary >= 0),
    CONSTRAINT chk_emp_type CHECK (employment_type IN ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN')),
    CONSTRAINT chk_emp_role CHECK (employee_role IN ('DOCTOR', 'RECEPTIONIST', 'PHARMACIST', 'LAB_TECHNICIAN', 'SYSTEM_ADMIN'))
) ENGINE=InnoDB;

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
) ENGINE=InnoDB;

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
) ENGINE=InnoDB;

DROP TABLE IF EXISTS receptionists;
CREATE TABLE receptionists (
    employee_id BIGINT NOT NULL,
    desk_number VARCHAR(20) NOT NULL,
    shift_block VARCHAR(20) NOT NULL,
    CONSTRAINT pk_receptionists PRIMARY KEY (employee_id),
    CONSTRAINT fk_receptionists_employee FOREIGN KEY (employee_id) 
        REFERENCES employees (employee_id) ON DELETE CASCADE,
    CONSTRAINT chk_rec_shift CHECK (shift_block IN ('MORNING', 'EVENING', 'NIGHT', 'ROTATING'))
) ENGINE=InnoDB;

DROP TABLE IF EXISTS pharmacists;
CREATE TABLE pharmacists (
    employee_id BIGINT NOT NULL,
    pharmacy_license_no VARCHAR(50) NOT NULL,
    assigned_unit VARCHAR(50) NOT NULL,
    CONSTRAINT pk_pharmacists PRIMARY KEY (employee_id),
    CONSTRAINT uq_pharmacists_license UNIQUE (pharmacy_license_no),
    CONSTRAINT fk_pharmacists_employee FOREIGN KEY (employee_id) 
        REFERENCES employees (employee_id) ON DELETE CASCADE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS lab_technicians;
CREATE TABLE lab_technicians (
    employee_id BIGINT NOT NULL,
    certification_level VARCHAR(50) NOT NULL,
    lab_section VARCHAR(50) NOT NULL,
    CONSTRAINT pk_lab_technicians PRIMARY KEY (employee_id),
    CONSTRAINT fk_labtech_employee FOREIGN KEY (employee_id) 
        REFERENCES employees (employee_id) ON DELETE CASCADE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS system_admins;
CREATE TABLE system_admins (
    employee_id BIGINT NOT NULL,
    admin_level VARCHAR(30) NOT NULL,
    security_clearance VARCHAR(50) NOT NULL,
    CONSTRAINT pk_system_admins PRIMARY KEY (employee_id),
    CONSTRAINT fk_sysadmin_employee FOREIGN KEY (employee_id) 
        REFERENCES employees (employee_id) ON DELETE CASCADE
) ENGINE=InnoDB;

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
) ENGINE=InnoDB;

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
) ENGINE=InnoDB;

-- 9. Appointments Table (with Strict Double-Booking Guard)
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
) ENGINE=InnoDB;

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
) ENGINE=InnoDB;

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
) ENGINE=InnoDB;

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
) ENGINE=InnoDB;

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
) ENGINE=InnoDB;

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
) ENGINE=InnoDB;

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
) ENGINE=InnoDB;

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
) ENGINE=InnoDB;

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
) ENGINE=InnoDB;

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
) ENGINE=InnoDB;

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
) ENGINE=InnoDB;

-- 20. Supplier Phones (Multivalued: ContactPhone)
CREATE TABLE supplier_phones (
    supplier_id BIGINT NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    CONSTRAINT pk_supplier_phones PRIMARY KEY (supplier_id, phone_number),
    CONSTRAINT fk_supplier_phones_sup FOREIGN KEY (supplier_id) 
        REFERENCES suppliers (supplier_id) ON DELETE CASCADE
) ENGINE=InnoDB;

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
) ENGINE=InnoDB;

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
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
```

---

## 3. Java Enums Specification

All domain enums reside in package `com.pulseos.entity.enums`:

1. `Gender`: `MALE`, `FEMALE`, `OTHER`
2. `PersonType`: `PATIENT`, `EMPLOYEE`
3. `BloodGroup`: `A_POSITIVE`, `A_NEGATIVE`, `B_POSITIVE`, `B_NEGATIVE`, `AB_POSITIVE`, `AB_NEGATIVE`, `O_POSITIVE`, `O_NEGATIVE`, `UNKNOWN`
4. `TriagePriority`: `ROUTINE`, `URGENT`, `EMERGENCY`
5. `EmploymentType`: `FULL_TIME`, `PART_TIME`, `CONTRACT`, `INTERN`
6. `EmployeeRole`: `DOCTOR`, `RECEPTIONIST`, `PHARMACIST`, `LAB_TECHNICIAN`, `SYSTEM_ADMIN`
7. `ShiftBlock`: `MORNING`, `EVENING`, `NIGHT`, `ROTATING`
8. `WardType`: `GENERAL`, `ICU`, `MATERNITY`, `PEDIATRIC`, `SURGICAL`, `ISOLATION`
9. `AppointmentStatus`: `SCHEDULED`, `CONFIRMED`, `IN_CONSULTATION`, `COMPLETED`, `CANCELLED`, `NO_SHOW`
10. `LabTestStatus`: `REQUESTED`, `SAMPLE_COLLECTED`, `PROCESSING`, `COMPLETED`, `CANCELLED`
11. `PaymentStatus`: `DRAFT`, `PENDING`, `PARTIALLY_PAID`, `PAID`, `CANCELLED`, `VOIDED`
12. `PaymentMethod`: `CASH`, `CREDIT_CARD`, `DEBIT_CARD`, `PAYHERE_GATEWAY`, `BANK_TRANSFER`, `INSURANCE`
13. `PurchaseOrderStatus`: `PENDING`, `ORDERED`, `SHIPPED`, `DELIVERED`, `CANCELLED`

---

## 4. JPA Entity Hierarchy Specifications (`com.pulseos.entity`)

### 4.1 Person (Root Superclass)
```java
package com.pulseos.entity;

import com.pulseos.entity.enums.Gender;
import com.pulseos.entity.enums.PersonType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "persons")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "person_type", discriminatorType = DiscriminatorType.STRING)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public abstract class Person {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "person_id")
    private Long id;

    @Column(name = "nic_passport_no", length = 20, nullable = false, unique = true)
    private String nicPassportNo;

    @Column(name = "first_name", length = 50, nullable = false)
    private String firstName;

    @Column(name = "last_name", length = 50, nullable = false)
    private String lastName;

    @Column(name = "street", length = 100)
    private String street;

    @Column(name = "city", length = 50, nullable = false)
    private String city;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 10, nullable = false)
    private Gender gender;

    @Enumerated(EnumType.STRING)
    @Column(name = "person_type", insertable = false, updatable = false)
    private PersonType personType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "person_contacts", joinColumns = @JoinColumn(name = "person_id"))
    @Column(name = "contact_number", length = 20, nullable = false)
    private Set<String> contactNumbers = new HashSet<>();

    public int getAge() {
        if (dateOfBirth == null) return 0;
        return Period.between(dateOfBirth, LocalDate.now()).getYears();
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }
}
```

### 4.2 Patient (Subclass of Person)
```java
package com.pulseos.entity;

import com.pulseos.entity.enums.BloodGroup;
import com.pulseos.entity.enums.TriagePriority;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "patients")
@PrimaryKeyJoinColumn(name = "patient_id", referencedColumnName = "person_id")
@DiscriminatorValue("PATIENT")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Patient extends Person {

    @Enumerated(EnumType.STRING)
    @Column(name = "blood_group", length = 15)
    private BloodGroup bloodGroup;

    @Column(name = "registration_date", nullable = false)
    private LocalDate registrationDate = LocalDate.now();

    @Column(name = "emergency_contact_name", length = 100)
    private String emergencyContactName;

    @Column(name = "emergency_contact_relation", length = 50)
    private String emergencyContactRelation;

    @Column(name = "emergency_contact_phone", length = 20)
    private String emergencyContactPhone;

    @Enumerated(EnumType.STRING)
    @Column(name = "triage_priority", length = 20, nullable = false)
    private TriagePriority triagePriority = TriagePriority.ROUTINE;

    @Column(name = "allergies", columnDefinition = "TEXT")
    private String allergies;

    @Column(name = "is_archived", nullable = false)
    private Boolean isArchived = false;
}
```

### 4.3 Employee (Subclass of Person, Superclass of Staff Roles)
```java
package com.pulseos.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.pulseos.entity.enums.EmployeeRole;
import com.pulseos.entity.enums.EmploymentType;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "employees")
@PrimaryKeyJoinColumn(name = "employee_id", referencedColumnName = "person_id")
@DiscriminatorValue("EMPLOYEE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Employee extends Person {

    @Column(name = "hire_date", nullable = false)
    private LocalDate hireDate;

    @Column(name = "salary", precision = 12, scale = 2, nullable = false)
    private BigDecimal salary;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", length = 20, nullable = false)
    private EmploymentType employmentType;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "dept_joining_date", nullable = false)
    private LocalDate deptJoiningDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supervisor_id")
    @JsonIgnore
    private Employee supervisor;

    @Column(name = "supervision_date")
    private LocalDate supervisionDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "employee_role", length = 30, nullable = false)
    private EmployeeRole employeeRole;

    @Column(name = "email", length = 100, nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", length = 255, nullable = false)
    @JsonIgnore
    private String passwordHash;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "employee_qualifications", joinColumns = @JoinColumn(name = "employee_id"))
    @Column(name = "qualification", length = 100, nullable = false)
    private Set<String> qualifications = new HashSet<>();
}
```

### 4.4 Doctor (Subclass of Employee)
```java
package com.pulseos.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "doctors")
@PrimaryKeyJoinColumn(name = "employee_id", referencedColumnName = "employee_id")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Doctor extends Employee {

    @Column(name = "doctor_license_no", length = 50, nullable = false, unique = true)
    private String doctorLicenseNo;

    @Column(name = "specialization", length = 100, nullable = false)
    private String specialization;

    @Column(name = "consultation_fee", precision = 10, scale = 2, nullable = false)
    private BigDecimal consultationFee;
}
```

### 4.5 Receptionist (Subclass of Employee)
```java
package com.pulseos.entity;

import com.pulseos.entity.enums.ShiftBlock;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "receptionists")
@PrimaryKeyJoinColumn(name = "employee_id", referencedColumnName = "employee_id")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Receptionist extends Employee {

    @Column(name = "desk_number", length = 20, nullable = false)
    private String deskNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "shift_block", length = 20, nullable = false)
    private ShiftBlock shiftBlock;
}
```

### 4.6 Pharmacist (Subclass of Employee)
```java
package com.pulseos.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pharmacists")
@PrimaryKeyJoinColumn(name = "employee_id", referencedColumnName = "employee_id")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Pharmacist extends Employee {

    @Column(name = "pharmacy_license_no", length = 50, nullable = false, unique = true)
    private String pharmacyLicenseNo;

    @Column(name = "assigned_unit", length = 50, nullable = false)
    private String assignedUnit;
}
```

### 4.7 LabTechnician (Subclass of Employee)
```java
package com.pulseos.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lab_technicians")
@PrimaryKeyJoinColumn(name = "employee_id", referencedColumnName = "employee_id")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LabTechnician extends Employee {

    @Column(name = "certification_level", length = 50, nullable = false)
    private String certificationLevel;

    @Column(name = "lab_section", length = 50, nullable = false)
    private String labSection;
}
```

### 4.8 SystemAdmin (Subclass of Employee)
```java
package com.pulseos.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "system_admins")
@PrimaryKeyJoinColumn(name = "employee_id", referencedColumnName = "employee_id")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SystemAdmin extends Employee {

    @Column(name = "admin_level", length = 30, nullable = false)
    private String adminLevel;

    @Column(name = "security_clearance", length = 50, nullable = false)
    private String securityClearance;
}
```

### 4.9 Department
```java
package com.pulseos.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "departments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "department_name", length = 100, nullable = false, unique = true)
    private String departmentName;

    @Column(name = "location", length = 100, nullable = false)
    private String location;

    @Column(name = "budget", precision = 14, scale = 2, nullable = false)
    private BigDecimal budget = BigDecimal.ZERO;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id", unique = true)
    @JsonIgnore
    private Employee manager;

    @Column(name = "manager_appointed_date")
    private LocalDate managerAppointedDate;
}
```

### 4.10 Ward & PatientAdmission
```java
package com.pulseos.entity;

import com.pulseos.entity.enums.WardType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "wards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Ward {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ward_id")
    private Long wardId;

    @Column(name = "ward_name", length = 100, nullable = false, unique = true)
    private String wardName;

    @Enumerated(EnumType.STRING)
    @Column(name = "ward_type", length = 30, nullable = false)
    private WardType wardType;

    @Column(name = "bed_capacity", nullable = false)
    private Integer bedCapacity;

    @Column(name = "current_occupancy", nullable = false)
    private Integer currentOccupancy = 0;
}

@Entity
@Table(name = "patient_admissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PatientAdmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "admission_id")
    private Long admissionId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ward_id", nullable = false)
    private Ward ward;

    @Column(name = "bed_number", length = 20, nullable = false)
    private String bedNumber;

    @Column(name = "admission_date", nullable = false)
    private LocalDateTime admissionDate;

    @Column(name = "discharge_date")
    private LocalDateTime dischargeDate;
}
```

### 4.11 Appointment (with Strict Double-Booking Guard)
```java
package com.pulseos.entity;

import com.pulseos.entity.enums.AppointmentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "appointments", uniqueConstraints = {
    @UniqueConstraint(name = "uq_doctor_slot", columnNames = {"doctor_id", "appointment_date", "appointment_time"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "appointment_id")
    private Long appointmentId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "booking_date", nullable = false)
    private LocalDateTime bookingDate = LocalDateTime.now();

    @Column(name = "room_number", length = 20)
    private String roomNumber;

    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @Column(name = "appointment_time", nullable = false)
    private LocalTime appointmentTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 25, nullable = false)
    private AppointmentStatus status = AppointmentStatus.SCHEDULED;

    @Column(name = "reason_for_visit", columnDefinition = "TEXT")
    private String reasonForVisit;
}
```

### 4.12 Drug & DrugDispensation
```java
package com.pulseos.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "drugs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Drug {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "drug_id")
    private Long drugId;

    @Column(name = "drug_name", length = 100, nullable = false)
    private String drugName;

    @Column(name = "generic_name", length = 100, nullable = false)
    private String genericName;

    @Column(name = "category", length = 50, nullable = false)
    private String category;

    @Column(name = "unit_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    @Column(name = "batch_number", length = 50, nullable = false)
    private String batchNumber;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "reorder_level", nullable = false)
    private Integer reorderLevel = 50;

    public boolean isLowStock() {
        return stockQuantity <= reorderLevel;
    }

    public boolean isExpired() {
        return expiryDate != null && expiryDate.isBefore(LocalDate.now());
    }
}

@Entity
@Table(name = "drug_dispensations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DrugDispensation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dispensation_id")
    private Long dispensationId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pharmacist_id", nullable = false)
    private Pharmacist pharmacist;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "drug_id", nullable = false)
    private Drug drug;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id")
    private Prescription prescription;

    @Column(name = "dispense_date", nullable = false)
    private LocalDateTime dispenseDate = LocalDateTime.now();

    @Column(name = "dispensed_qty", nullable = false)
    private Integer dispensedQty;
}
```

### 4.13 Prescription & PrescriptionItem
```java
package com.pulseos.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "prescriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "prescription_id")
    private Long prescriptionId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "prescription_date", nullable = false)
    private LocalDateTime prescriptionDate = LocalDateTime.now();

    @Column(name = "doctor_instructions", columnDefinition = "TEXT")
    private String doctorInstructions;

    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<PrescriptionItem> items = new ArrayList<>();
}

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class PrescriptionItemId implements Serializable {
    @Column(name = "prescription_id")
    private Long prescriptionId;

    @Column(name = "drug_id")
    private Long drugId;
}

@Entity
@Table(name = "prescription_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionItem {

    @EmbeddedId
    private PrescriptionItemId id = new PrescriptionItemId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("prescriptionId")
    @JoinColumn(name = "prescription_id")
    @JsonIgnore
    private Prescription prescription;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("drugId")
    @JoinColumn(name = "drug_id")
    private Drug drug;

    @Column(name = "dosage", length = 50, nullable = false)
    private String dosage;

    @Column(name = "frequency", length = 50, nullable = false)
    private String frequency;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "is_dispensed", nullable = false)
    private Boolean isDispensed = false;
}
```

### 4.14 LabTest
```java
package com.pulseos.entity;

import com.pulseos.entity.enums.LabTestStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "lab_tests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LabTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "test_id")
    private Long testId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "clinical_indication", length = 255)
    private String clinicalIndication;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "technician_id")
    private LabTechnician technician;

    @Column(name = "conduction_date")
    private LocalDateTime conductionDate;

    @Column(name = "test_name", length = 100, nullable = false)
    private String testName;

    @Column(name = "category", length = 50, nullable = false)
    private String category;

    @Column(name = "standard_fee", precision = 10, scale = 2, nullable = false)
    private BigDecimal standardFee;

    @Column(name = "test_date", nullable = false)
    private LocalDate testDate = LocalDate.now();

    @Column(name = "result_data", columnDefinition = "TEXT")
    private String resultData;

    @Column(name = "reference_range", length = 100)
    private String referenceRange;

    @Enumerated(EnumType.STRING)
    @Column(name = "test_status", length = 25, nullable = false)
    private LabTestStatus testStatus = LabTestStatus.REQUESTED;
}
```

### 4.15 Invoice, Invoice Items & PaymentTransaction
```java
package com.pulseos.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.pulseos.entity.enums.PaymentMethod;
import com.pulseos.entity.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "invoice_id")
    private Long invoiceId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @Column(name = "billing_date", nullable = false)
    private LocalDateTime billingDate = LocalDateTime.now();

    @Column(name = "invoice_date", nullable = false)
    private LocalDate invoiceDate = LocalDate.now();

    @Column(name = "tax_amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", length = 25, nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<InvoiceDrugItem> drugItems = new ArrayList<>();

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<InvoiceLabItem> labItems = new ArrayList<>();

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<PaymentTransaction> payments = new ArrayList<>();
}

@Embeddable
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class InvoiceDrugItemId implements Serializable {
    @Column(name = "invoice_id")
    private Long invoiceId;
    @Column(name = "drug_id")
    private Long drugId;
}

@Entity
@Table(name = "invoice_drug_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class InvoiceDrugItem {
    @EmbeddedId
    private InvoiceDrugItemId id = new InvoiceDrugItemId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("invoiceId")
    @JoinColumn(name = "invoice_id")
    @JsonIgnore
    private Invoice invoice;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("drugId")
    @JoinColumn(name = "drug_id")
    private Drug drug;

    @Column(name = "billed_qty", nullable = false)
    private Integer billedQty;

    @Column(name = "sub_total", precision = 10, scale = 2, nullable = false)
    private BigDecimal subTotal;
}

@Embeddable
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class InvoiceLabItemId implements Serializable {
    @Column(name = "invoice_id")
    private Long invoiceId;
    @Column(name = "test_id")
    private Long testId;
}

@Entity
@Table(name = "invoice_lab_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class InvoiceLabItem {
    @EmbeddedId
    private InvoiceLabItemId id = new InvoiceLabItemId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("invoiceId")
    @JoinColumn(name = "invoice_id")
    @JsonIgnore
    private Invoice invoice;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("testId")
    @JoinColumn(name = "test_id")
    private LabTest labTest;

    @Column(name = "test_fee", precision = 10, scale = 2, nullable = false)
    private BigDecimal testFee;
}

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long paymentId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @Column(name = "payment_date", nullable = false)
    private LocalDateTime paymentDate = LocalDateTime.now();

    @Column(name = "amount_paid", precision = 12, scale = 2, nullable = false)
    private BigDecimal amountPaid;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 30, nullable = false)
    private PaymentMethod paymentMethod;

    @Column(name = "transaction_ref", length = 100, unique = true)
    private String transactionRef;
}
```

### 4.16 Supplier & PurchaseOrder
```java
package com.pulseos.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.pulseos.entity.enums.PurchaseOrderStatus;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "suppliers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "supplier_id")
    private Long supplierId;

    @Column(name = "supplier_name", length = 100, nullable = false)
    private String supplierName;

    @Column(name = "email", length = 100, nullable = false)
    private String email;

    @Column(name = "street", length = 100)
    private String street;

    @Column(name = "city", length = 50, nullable = false)
    private String city;

    @Column(name = "zip_code", length = 20)
    private String zipCode;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "supplier_phones", joinColumns = @JoinColumn(name = "supplier_id"))
    @Column(name = "phone_number", length = 20, nullable = false)
    private Set<String> phoneNumbers = new HashSet<>();
}

@Entity
@Table(name = "purchase_orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long orderId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pharmacist_id", nullable = false)
    private Pharmacist pharmacist;

    @Column(name = "order_timestamp", nullable = false)
    private LocalDateTime orderTimestamp = LocalDateTime.now();

    @Column(name = "order_date", nullable = false)
    private LocalDate orderDate = LocalDate.now();

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_status", length = 25, nullable = false)
    private PurchaseOrderStatus deliveryStatus = PurchaseOrderStatus.PENDING;

    @Column(name = "total_cost", precision = 14, scale = 2, nullable = false)
    private BigDecimal totalCost = BigDecimal.ZERO;

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<PurchaseOrderItem> items = new ArrayList<>();
}

@Embeddable
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class PurchaseOrderItemId implements Serializable {
    @Column(name = "order_id")
    private Long orderId;
    @Column(name = "drug_id")
    private Long drugId;
}

@Entity
@Table(name = "purchase_order_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class PurchaseOrderItem {
    @EmbeddedId
    private PurchaseOrderItemId id = new PurchaseOrderItemId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("orderId")
    @JoinColumn(name = "order_id")
    @JsonIgnore
    private PurchaseOrder purchaseOrder;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("drugId")
    @JoinColumn(name = "drug_id")
    private Drug drug;

    @Column(name = "ordered_qty", nullable = false)
    private Integer orderedQty;

    @Column(name = "unit_cost", precision = 10, scale = 2, nullable = false)
    private BigDecimal unitCost;
}
```

---

## 5. Spring Data JPA Repositories Plan (`com.pulseos.repository`)

The Worker agent must implement the following 23 repositories:

| Repository Interface | Entity & ID | Key Custom Finder Methods & Invariants |
| :--- | :--- | :--- |
| `PersonRepository` | `Person, Long` | `findByNicPassportNo(String nic)`, `existsByNicPassportNo(String nic)` |
| `PatientRepository` | `Patient, Long` | `findByNicPassportNo(String nic)`, `findByIsArchivedFalse()`, `findByTriagePriority(TriagePriority priority)`, `findByBloodGroup(BloodGroup bg)`, `searchPatients(@Param("q") String query)` |
| `EmployeeRepository` | `Employee, Long` | `findByEmail(String email)`, `findByNicPassportNo(String nic)`, `findByEmployeeRole(EmployeeRole role)` |
| `DoctorRepository` | `Doctor, Long` | `findByDoctorLicenseNo(String license)`, `findBySpecialization(String spec)` |
| `ReceptionistRepository` | `Receptionist, Long` | `findByDeskNumber(String desk)` |
| `PharmacistRepository` | `Pharmacist, Long` | `findByPharmacyLicenseNo(String license)` |
| `LabTechnicianRepository` | `LabTechnician, Long` | `findByLabSection(String section)` |
| `SystemAdminRepository` | `SystemAdmin, Long` | `findByAdminLevel(String level)` |
| `DepartmentRepository` | `Department, Long` | `findByDepartmentName(String name)` |
| `WardRepository` | `Ward, Long` | `findByWardName(String name)`, `findByWardType(WardType type)` |
| `PatientAdmissionRepository` | `PatientAdmission, Long` | `findByPatientIdAndDischargeDateIsNull(Long patientId)`, `findByWardWardIdAndDischargeDateIsNull(Long wardId)` |
| `AppointmentRepository` | `Appointment, Long` | `existsByDoctorIdAndAppointmentDateAndAppointmentTime(Long docId, LocalDate date, LocalTime time)` (**Double-Booking Prevention**), `findByDoctorIdAndAppointmentDate(Long docId, LocalDate date)`, `findByPatientId(Long patId)`, `findByStatus(AppointmentStatus status)` |
| `DrugRepository` | `Drug, Long` | `findByDrugName(String name)`, `findByCategory(String cat)`, `findLowStockDrugs()` (`stockQuantity <= reorderLevel`), `findByExpiryDateBefore(LocalDate date)` |
| `PrescriptionRepository` | `Prescription, Long` | `findByPatientId(Long patId)`, `findByAppointmentAppointmentId(Long apptId)`, `findByDoctorId(Long docId)` |
| `PrescriptionItemRepository`| `PrescriptionItem, PrescriptionItemId` | `findByPrescriptionPrescriptionId(Long rxId)` |
| `DrugDispensationRepository` | `DrugDispensation, Long` | `findByPrescriptionPrescriptionId(Long rxId)`, `findByPharmacistId(Long pharmId)` |
| `LabTestRepository` | `LabTest, Long` | `findByPatientId(Long patId)`, `findByAppointmentAppointmentId(Long apptId)`, `findByTestStatus(LabTestStatus status)` |
| `InvoiceRepository` | `Invoice, Long` | `findByPatientId(Long patId)`, `findByAppointmentAppointmentId(Long apptId)`, `findByPaymentStatus(PaymentStatus status)` |
| `InvoiceDrugItemRepository` | `InvoiceDrugItem, InvoiceDrugItemId` | `findByInvoiceInvoiceId(Long invId)` |
| `InvoiceLabItemRepository` | `InvoiceLabItem, InvoiceLabItemId` | `findByInvoiceInvoiceId(Long invId)` |
| `PaymentRepository` | `PaymentTransaction, Long` | `findByInvoiceInvoiceId(Long invId)`, `findByTransactionRef(String ref)` |
| `SupplierRepository` | `Supplier, Long` | `findBySupplierName(String name)` |
| `PurchaseOrderRepository` | `PurchaseOrder, Long` | `findBySupplierSupplierId(Long supId)`, `findByDeliveryStatus(PurchaseOrderStatus status)` |

---

## 6. Comprehensive Idempotent Clinical `DataSeeder.java` Plan

Class path: `com.pulseos.seeder.DataSeeder implements CommandLineRunner`  
Annotation: `@Component @Order(1) @Slf4j`  
Idempotency Guard: `if (departmentRepository.count() > 0) { log.info("DataSeeder: Database already initialized. Skipping seeding."); return; }`

### 6.1 Seed Data Breakdown

#### 1. Departments (7 Departments)
1. **Cardiology** (`Location: Building B, Floor 2`, `Budget: LKR 15,000,000.00`)
2. **Outpatient Department (OPD)** (`Location: Ground Floor, Main Wing`, `Budget: LKR 8,500,000.00`)
3. **Pharmacy & Stores** (`Location: Ground Floor, East Wing`, `Budget: LKR 25,000,000.00`)
4. **Laboratory Services** (`Location: Building A, Floor 1`, `Budget: LKR 12,000,000.00`)
5. **General Surgery** (`Location: Building C, Floor 3`, `Budget: LKR 30,000,000.00`)
6. **Pediatrics** (`Location: Building B, Floor 1`, `Budget: LKR 10,000,000.00`)
7. **Finance & Hospital IT Operations** (`Location: Administrative Tower, Level 4`, `Budget: LKR 5,000,000.00`)

#### 2. The 6 SLIIT Team Members (Staff Accounts)
All passwords set to BCrypt hash of `PulseOS@2026` or plain test hash `$2a$10$7R6vD8x...` for authentication.
1. **Doctor Kavinda** (Rathnayaka R. M. K. L. B. - IT25103999):
   - NIC: `199912401829`, DOB: `1999-05-14`, Gender: `MALE`
   - Email: `it25103999@my.sliit.lk` / `kavinda.r@pulseos.sliit.lk`
   - Department: `Cardiology` (Manager of Cardiology Department)
   - Role: `DOCTOR`, License: `SLMC-48291`, Specialization: `Consultant Cardiologist`
   - Consultation Fee: `LKR 3,500.00`
   - Qualifications: `MBBS (Colombo)`, `MD (Cardiology)`, `MRCP (UK)`
   - Contacts: `+94771239990`, `+94112876543`
2. **Receptionist Dila** (Somarathna P. G. D. S. - IT25103819):
   - NIC: `200165809124`, DOB: `2001-08-20`, Gender: `FEMALE`
   - Email: `it25103819@my.sliit.lk` / `dila.s@pulseos.sliit.lk`
   - Department: `Outpatient Department (OPD)`
   - Role: `RECEPTIONIST`, Desk: `DESK-01`, Shift: `MORNING`
   - Qualifications: `Diploma in Hospital Administration`, `Cert. Front Office Mgmt`
   - Contacts: `+94718238190`
3. **Pharmacist Harshika** (Udumullage S.H.U. - IT25100826):
   - NIC: `200078403319`, DOB: `2000-03-12`, Gender: `FEMALE`
   - Email: `it25100826@my.sliit.lk` / `harshika.u@pulseos.sliit.lk`
   - Department: `Pharmacy & Stores`
   - Role: `PHARMACIST`, License: `PHARM-7721`, Unit: `Main Outpatient Dispensary`
   - Qualifications: `B.Pharm (Hons)`, `Reg. Pharmacist SL`
   - Contacts: `+94765008260`
4. **Lab Tech Nethuli** (Thilakarathne H.S.K.P.N - IT25103363):
   - NIC: `200155204481`, DOB: `2001-11-25`, Gender: `FEMALE`
   - Email: `it25103363@my.sliit.lk` / `nethuli.t@pulseos.sliit.lk`
   - Department: `Laboratory Services`
   - Role: `LAB_TECHNICIAN`, Cert Level: `Senior Medical Technologist (MLT-1)`, Section: `Hematology & Clinical Biochemistry`
   - Qualifications: `BSc Medical Laboratory Science`, `SLMC Registered MLT`
   - Contacts: `+94773103363`
5. **Cashier / Admin Kesaru** (Dhanasinghe K. A. K. H. - IT25103992):
   - NIC: `200018902271`, DOB: `2000-07-08`, Gender: `MALE`
   - Email: `it25103992@my.sliit.lk` / `kesaruhasun@gmail.com`
   - Department: `Finance & Hospital IT Operations` (Manager)
   - Role: `SYSTEM_ADMIN`, Admin Level: `SUPER_ADMIN`, Security: `TOP_SECRET`
   - Qualifications: `BSc (Hons) Software Engineering (SLIIT)`, `CISA`
   - Contacts: `+94772103992`
6. **Chanul** (Malwatta M.W.C.S - IT25101620):
   - NIC: `200021405592`, DOB: `2000-09-18`, Gender: `MALE`
   - Email: `it25101620@my.sliit.lk` / `chanul.m@pulseos.sliit.lk`
   - Department: `Outpatient Department (OPD)`
   - Role: `RECEPTIONIST`, Desk: `DESK-02`, Shift: `EVENING`
   - Qualifications: `BSc Health Services Management`
   - Contacts: `+94719201620`

#### 3. Wards (5 Wards)
1. **Surgical Ward A** (Type: `SURGICAL`, Cap: 20, Occ: 12)
2. **Cardiology Care Unit (CCU)** (Type: `ICU`, Cap: 8, Occ: 5)
3. **Pediatric Ward** (Type: `PEDIATRIC`, Cap: 15, Occ: 8)
4. **Maternity Ward** (Type: `MATERNITY`, Cap: 18, Occ: 10)
5. **General Medical Ward** (Type: `GENERAL`, Cap: 25, Occ: 14)

#### 4. Realistic Patients (12 Patients with Diverse Triage Tags)
1. **Nimal Perera** (NIC: `198512304561`, DOB: `1985-03-12`, Gender: `MALE`, Blood: `O_POSITIVE`, Triage: `ROUTINE`, City: `Colombo`, Allergies: `None`, Phone: `+94771234567`)
2. **Sunethra Jayawardena** (NIC: `197265408923`, DOB: `1972-07-24`, Gender: `FEMALE`, Blood: `B_POSITIVE`, Triage: `URGENT`, City: `Kandy`, Allergies: `Penicillin, Aspirin`, Phone: `+94712345678`)
3. **Kasun Wickramasinghe** (NIC: `199423107845`, DOB: `1994-11-05`, Gender: `MALE`, Blood: `A_POSITIVE`, Triage: `EMERGENCY`, City: `Galle`, Allergies: `Sulfa drugs`, Phone: `+94783456789`)
4. **Anula Ratnayake** (NIC: `196589201234`, DOB: `1965-02-18`, Gender: `FEMALE`, Blood: `AB_POSITIVE`, Triage: `ROUTINE`, City: `Kurunegala`, Allergies: `Ibuprofen`, Phone: `+94704567890`)
5. **Dilshan Fernando** (NIC: `199014506789`, DOB: `1990-09-30`, Gender: `MALE`, Blood: `O_NEGATIVE`, Triage: `URGENT`, City: `Negombo`, Allergies: `None`, Phone: `+94775678901`)
6. **Sanduni Silva** (NIC: `200278103456`, DOB: `2002-04-14`, Gender: `FEMALE`, Blood: `A_NEGATIVE`, Triage: `ROUTINE`, City: `Malabe`, Allergies: `None`, Phone: `+94766789012`)
7. **Priyantha Kumara** (NIC: `198031209876`, DOB: `1980-08-22`, Gender: `MALE`, Blood: `B_NEGATIVE`, Triage: `EMERGENCY`, City: `Gampaha`, Allergies: `Latex`, Phone: `+94717890123`)
8. **Chathurika Mendis** (NIC: `199564208765`, DOB: `1995-12-10`, Gender: `FEMALE`, Blood: `O_POSITIVE`, Triage: `ROUTINE`, City: `Panadura`, Allergies: `Amoxicillin`, Phone: `+94758901234`)
9. **Chaminda Bandara** (NIC: `197824105432`, DOB: `1978-06-03`, Gender: `MALE`, Blood: `AB_NEGATIVE`, Triage: `URGENT`, City: `Matara`, Allergies: `Ciprofloxacin`, Phone: `+94729012345`)
10. **Fathima Rizwan** (NIC: `198875302198`, DOB: `1988-10-15`, Gender: `FEMALE`, Blood: `B_POSITIVE`, Triage: `ROUTINE`, City: `Colombo`, Allergies: `None`, Phone: `+94770123456`)
11. **Ravi Shanmuganathan** (NIC: `199219804321`, DOB: `1992-01-28`, Gender: `MALE`, Blood: `A_POSITIVE`, Triage: `URGENT`, City: `Jaffna`, Allergies: `Codeine`, Phone: `+94711234567`)
12. **Niluka Dissanayake** (NIC: `200181206543`, DOB: `2001-05-19`, Gender: `FEMALE`, Blood: `O_POSITIVE`, Triage: `EMERGENCY`, City: `Badulla`, Allergies: `None`, Phone: `+94782345678`)

#### 5. Patient Admissions (2 Active Admissions)
- Admission 1: Patient Kasun Wickramasinghe admitted to Surgical Ward A, Bed `BED-04`, Admitted 2 days ago.
- Admission 2: Patient Priyantha Kumara admitted to Cardiology Care Unit (CCU), Bed `CCU-02`, Admitted yesterday.

#### 6. Suppliers (3 Suppliers)
1. **State Pharmaceuticals Corporation (SPC)** (`orders@spc.gov.lk`, `No. 75, Sir Baron Jayathilake Mawatha`, `Colombo`, `00100`, Phone: `+94112320356`)
2. **GlaxoSmithKline Ceylon Ltd (GSK)** (`supply@gsk.com.lk`, `121 Galle Road`, `Ratmalana`, `10390`, Phone: `+94112636363`)
3. **Hemas Pharmaceuticals (Pvt) Ltd** (`distribution@hemas.com`, `Hemas House, Braybrooke Place`, `Colombo`, `00200`, Phone: `+94114731731`)

#### 7. Drugs Catalog (23 Drugs, 6 Low-Stock Triggers)
- **Antibiotics**:
  1. `Amoxicillin 500mg (Amoxil)`: UnitPrice 35.00, Stock 250, Reorder 50, Batch `BAT-AMX-2026`, Exp: `2027-08-31`
  2. `Ciprofloxacin 500mg (Ciprobid)`: UnitPrice 48.00, Stock 180, Reorder 40, Batch `BAT-CIP-2026`, Exp: `2027-10-15`
  3. `Azithromycin 250mg (Zithromax)`: UnitPrice 110.00, **Stock 25, Reorder 50** [⚠️ LOW STOCK], Batch `BAT-AZI-2026`, Exp: `2027-04-30`
  4. `Ceftriaxone 1g Inj (Rocephin)`: UnitPrice 650.00, **Stock 15, Reorder 30** [⚠️ LOW STOCK], Batch `BAT-CEF-2026`, Exp: `2026-12-31`
  5. `Augmentin 625mg (Amoxicillin/Clavulanate)`: UnitPrice 125.00, Stock 90, Reorder 40, Batch `BAT-AUG-2026`, Exp: `2027-06-30`
- **Analgesics & Anti-inflammatories**:
  6. `Paracetamol 500mg (Panadol)`: UnitPrice 8.50, Stock 1200, Reorder 200, Batch `BAT-PCM-2026`, Exp: `2028-01-31`
  7. `Ibuprofen 400mg (Brufen)`: UnitPrice 16.00, Stock 350, Reorder 60, Batch `BAT-IBU-2026`, Exp: `2027-09-30`
  8. `Diclofenac Sodium 50mg (Voltaren)`: UnitPrice 22.00, **Stock 20, Reorder 50** [⚠️ LOW STOCK], Batch `BAT-DIC-2026`, Exp: `2026-11-30`
  9. `Tramadol 50mg (Ultram)`: UnitPrice 45.00, Stock 80, Reorder 30, Batch `BAT-TRA-2026`, Exp: `2027-05-15`
  10. `Mefenamic Acid 500mg (Ponstan)`: UnitPrice 28.00, Stock 140, Reorder 40, Batch `BAT-MEF-2026`, Exp: `2027-11-20`
- **Antihypertensives & Cardiac**:
  11. `Amlodipine 5mg (Norvasc)`: UnitPrice 18.00, Stock 400, Reorder 80, Batch `BAT-AML-2026`, Exp: `2027-12-31`
  12. `Losartan Potassium 50mg (Cozaar)`: UnitPrice 32.00, Stock 320, Reorder 60, Batch `BAT-LOS-2026`, Exp: `2028-02-28`
  13. `Atenolol 50mg (Tenormin)`: UnitPrice 15.00, **Stock 10, Reorder 50** [⚠️ LOW STOCK], Batch `BAT-ATE-2026`, Exp: `2026-10-31`
  14. `Atorvastatin 20mg (Lipitor)`: UnitPrice 55.00, Stock 280, Reorder 50, Batch `BAT-ATV-2026`, Exp: `2027-07-31`
  15. `Glyceryl Trinitrate 0.5mg SL (Angised)`: UnitPrice 25.00, Stock 65, Reorder 30, Batch `BAT-GTN-2026`, Exp: `2027-03-31`
- **Antidiabetics**:
  16. `Metformin HCl 500mg (Glucophage)`: UnitPrice 12.00, Stock 600, Reorder 100, Batch `BAT-MET-2026`, Exp: `2028-03-31`
  17. `Gliclazide 80mg (Diamicron)`: UnitPrice 24.00, Stock 210, Reorder 50, Batch `BAT-GLI-2026`, Exp: `2027-09-15`
  18. `Human Insulin 100 IU/ml (Mixtard 30/70)`: UnitPrice 1450.00, **Stock 8, Reorder 25** [⚠️ LOW STOCK], Batch `BAT-INS-2026`, Exp: `2026-12-15`
  19. `Sitagliptin 100mg (Januvia)`: UnitPrice 180.00, Stock 75, Reorder 30, Batch `BAT-SIT-2026`, Exp: `2027-08-20`
- **Antihistamines & Respiratory**:
  20. `Cetirizine HCl 10mg (Zyrtec)`: UnitPrice 14.00, Stock 450, Reorder 80, Batch `BAT-CET-2026`, Exp: `2028-04-30`
  21. `Salbutamol Inhaler 100mcg (Ventolin)`: UnitPrice 850.00, **Stock 18, Reorder 40** [⚠️ LOW STOCK], Batch `BAT-SAL-2026`, Exp: `2027-01-31`
  22. `Montelukast Sodium 10mg (Singulair)`: UnitPrice 65.00, Stock 160, Reorder 40, Batch `BAT-MON-2026`, Exp: `2027-11-15`
  23. `Fexofenadine 120mg (Allegra)`: UnitPrice 58.00, Stock 190, Reorder 50, Batch `BAT-FEX-2026`, Exp: `2027-06-25`

#### 8. Pre-Booked Appointments (5 Appointments)
- **Appt 1**: Doctor Kavinda & Nimal Perera
  - Date: Today (`LocalDate.now()`), Time: `09:30:00`, Room: `204`, Status: `COMPLETED`, Reason: `Routine cardiac follow-up`
- **Appt 2**: Doctor Kavinda & Sunethra Jayawardena
  - Date: Today (`LocalDate.now()`), Time: `10:30:00`, Room: `204`, Status: `IN_CONSULTATION`, Reason: `Chest pain and hypertension evaluation`
- **Appt 3**: Doctor Kavinda & Kasun Wickramasinghe
  - Date: Tomorrow (`LocalDate.now().plusDays(1)`), Time: `09:00:00`, Room: `204`, Status: `CONFIRMED`, Reason: `Post-op evaluation`
- **Appt 4**: Doctor Kavinda & Anula Ratnayake
  - Date: Tomorrow (`LocalDate.now().plusDays(1)`), Time: `10:00:00`, Room: `204`, Status: `SCHEDULED`, Reason: `Shortness of breath on exertion`
- **Appt 5**: Doctor Kavinda & Dilshan Fernando
  - Date: In 3 days (`LocalDate.now().plusDays(3)`), Time: `11:00:00`, Room: `204`, Status: `SCHEDULED`, Reason: `ECG consultation`

#### 9. Prescriptions & Dispensing Log
- **Prescription 1** (for Appt 1, Nimal Perera):
  - Instructions: `Take Atorvastatin at bedtime. Take Amlodipine in the morning after breakfast.`
  - Items:
    1. Atorvastatin 20mg: Qty 30, Dosage `20mg`, Frequency `Once daily at bedtime`, Duration 30 days, `isDispensed: true`
    2. Amlodipine 5mg: Qty 30, Dosage `5mg`, Frequency `Once daily morning`, Duration 30 days, `isDispensed: true`
  - Dispensation Log: Logged by Pharmacist Harshika on `LocalDateTime.now().minusHours(1)`.
- **Prescription 2** (for Appt 2, Sunethra Jayawardena):
  - Instructions: `Avoid sodium intake. Take Losartan daily.`
  - Items:
    1. Losartan Potassium 50mg: Qty 30, Dosage `50mg`, Frequency `Once daily`, Duration 30 days, `isDispensed: false` (Ready for live demo dispensing!)
    2. Metformin HCl 500mg: Qty 60, Dosage `500mg`, Frequency `Twice daily with meals`, Duration 30 days, `isDispensed: false`

#### 10. Laboratory Tests (4 Tests across Lifecycles)
1. **Lipid Profile** (for Appt 1, Nimal Perera):
   - Category: `Biochemistry`, StandardFee: `LKR 2,200.00`, Status: `COMPLETED`
   - Technician: Lab Tech Nethuli, Conduction Date: Today
   - Result: `Total Cholesterol: 185 mg/dL, HDL: 48 mg/dL, LDL: 110 mg/dL, Triglycerides: 135 mg/dL`
   - Reference Range: `Total < 200 mg/dL, LDL < 130 mg/dL, HDL > 40 mg/dL`
2. **Fasting Blood Sugar (FBS)** (for Appt 2, Sunethra Jayawardena):
   - Category: `Biochemistry`, StandardFee: `LKR 650.00`, Status: `SAMPLE_COLLECTED`
   - Technician: Lab Tech Nethuli, Clinical Indication: `Suspected Type 2 Diabetes`
3. **Full Blood Count (FBC)** (for Appt 3, Kasun Wickramasinghe):
   - Category: `Hematology`, StandardFee: `LKR 1,200.00`, Status: `REQUESTED`
   - Clinical Indication: `Pre-operative screening`
4. **Serum Creatinine & Electrolytes** (for Dilshan Fernando):
   - Category: `Biochemistry`, StandardFee: `LKR 1,800.00`, Status: `COMPLETED`
   - Technician: Lab Tech Nethuli
   - Result: `Serum Creatinine: 0.9 mg/dL, Sodium: 138 mmol/L, Potassium: 4.2 mmol/L`
   - Reference Range: `Creatinine: 0.7 - 1.2 mg/dL, Na: 135 - 145 mmol/L, K: 3.5 - 5.0 mmol/L`

#### 11. Invoices & Payment Transactions
- **Invoice 1** (Settled encounter for Nimal Perera, Appt 1):
  - Doctor Consultation Fee: `LKR 3,500.00`
  - Dispensed Drugs:
    * Atorvastatin: 30 * 55.00 = `LKR 1,650.00`
    * Amlodipine: 30 * 18.00 = `LKR 540.00`
    * Subtotal Drugs: `LKR 2,190.00`
  - Lab Tests:
    * Lipid Profile: `LKR 2,200.00`
  - Tax Amount: `LKR 0.00`
  - **Total Amount: 3,500.00 + 2,190.00 + 2,200.00 = LKR 7,890.00**
  - Payment Status: `PAID`
  - Payment: Cash counter settlement of `LKR 7,890.00`, Transaction Ref: `RCPT-2026-00891`
- **Invoice 2** (Active encounter for Sunethra Jayawardena, Appt 2):
  - Doctor Consultation Fee: `LKR 3,500.00`
  - Lab Tests: Fasting Blood Sugar: `LKR 650.00`
  - Tax Amount: `LKR 0.00`
  - **Total Amount: 3,500.00 + 650.00 = LKR 4,150.00**
  - Payment Status: `PENDING`
  - **Ready for PayHere Sandbox evaluation or Counter Cash settlement during presentation!**

---

## 7. Implementation File Checklist for Worker Agent

The Worker agent will construct files across the following paths:

```
backend/
├── src/main/resources/
│   └── schema.sql                          # 27 DDL tables (Section 2)
└── src/main/java/com/pulseos/
    ├── entity/
    │   ├── enums/
    │   │   ├── Gender.java
    │   │   ├── PersonType.java
    │   │   ├── BloodGroup.java
    │   │   ├── TriagePriority.java
    │   │   ├── EmploymentType.java
    │   │   ├── EmployeeRole.java
    │   │   ├── ShiftBlock.java
    │   │   ├── WardType.java
    │   │   ├── AppointmentStatus.java
    │   │   ├── LabTestStatus.java
    │   │   ├── PaymentStatus.java
    │   │   ├── PaymentMethod.java
    │   │   └── PurchaseOrderStatus.java
    │   ├── Person.java
    │   ├── Patient.java
    │   ├── Employee.java
    │   ├── Doctor.java
    │   ├── Receptionist.java
    │   ├── Pharmacist.java
    │   ├── LabTechnician.java
    │   ├── SystemAdmin.java
    │   ├── Department.java
    │   ├── Ward.java
    │   ├── PatientAdmission.java
    │   ├── Appointment.java
    │   ├── Drug.java
    │   ├── Prescription.java
    │   ├── PrescriptionItem.java
    │   ├── PrescriptionItemId.java
    │   ├── DrugDispensation.java
    │   ├── LabTest.java
    │   ├── Invoice.java
    │   ├── InvoiceDrugItem.java
    │   ├── InvoiceDrugItemId.java
    │   ├── InvoiceLabItem.java
    │   ├── InvoiceLabItemId.java
    │   ├── PaymentTransaction.java
    │   ├── Supplier.java
    │   ├── PurchaseOrder.java
    │   ├── PurchaseOrderItem.java
    │   └── PurchaseOrderItemId.java
    ├── repository/
    │   ├── PersonRepository.java
    │   ├── PatientRepository.java
    │   ├── EmployeeRepository.java
    │   ├── DoctorRepository.java
    │   ├── ReceptionistRepository.java
    │   ├── PharmacistRepository.java
    │   ├── LabTechnicianRepository.java
    │   ├── SystemAdminRepository.java
    │   ├── DepartmentRepository.java
    │   ├── WardRepository.java
    │   ├── PatientAdmissionRepository.java
    │   ├── AppointmentRepository.java
    │   ├── DrugRepository.java
    │   ├── PrescriptionRepository.java
    │   ├── PrescriptionItemRepository.java
    │   ├── DrugDispensationRepository.java
    │   ├── LabTestRepository.java
    │   ├── InvoiceRepository.java
    │   ├── InvoiceDrugItemRepository.java
    │   ├── InvoiceLabItemRepository.java
    │   ├── PaymentRepository.java
    │   ├── SupplierRepository.java
    │   └── PurchaseOrderRepository.java
    └── seeder/
        └── DataSeeder.java
```

---

## 8. Invariants & Verification Criteria

1. **Double-Booking Prevention Invariant**:
   - The database composite constraint `uq_doctor_slot UNIQUE (doctor_id, appointment_date, appointment_time)` must reject simultaneous appointments for the same doctor.
   - `AppointmentRepository.existsByDoctorIdAndAppointmentDateAndAppointmentTime(...)` must return true when a slot is occupied.
2. **Table-Per-Type Polymorphism**:
   - Querying `PersonRepository.findAll()` returns all patients and employees.
   - Querying `DoctorRepository.findAll()` returns Doctor records joined with Employee and Person attributes.
3. **Data Seeder Idempotency**:
   - Restarting Spring Boot multiple times must execute cleanly without duplicate key exceptions (`uq_persons_nic`, `uq_employees_email`, `uq_doctors_license`, `uq_doctor_slot`).
4. **Itemized Billing Aggregation**:
   - `Invoice 1` total must compute exactly to `LKR 7,890.00` matching `Doctor (3500) + Drugs (2190) + Lab (2200)`.
   - `Invoice 2` total must compute to `LKR 4,150.00` in `PENDING` state.
