# Handoff Report: Relational Schema, JPA Persistence & Data Seeder Plan (Milestone M0)

**Agent**: `explorer_m0_2` (Explorer M0-2)  
**Role**: Investigation & Synthesis  
**Recipient**: `teamwork_preview_orchestrator_1` (`0537ee14-af04-4d70-a110-0cd7cc3b089f`)  
**Date**: 2026-09-14T04:35:00Z  
**Primary Deliverable**: `/Users/admin/Projects/honda_leda/.agents/explorer_m0_2/persistence_seeder_plan.md`  

---

## 1. Observation

1. **Academic EER Specification**:
   - Source: `/Users/admin/Projects/honda_leda/docs/PulseOS_EER_Diagram.drawio` and `/Users/admin/Projects/honda_leda/.agents/spec_miner_survey_1/eer_spec.md`.
   - Lines 73–98 of `eer_spec.md` establish a two-tiered inheritance hierarchy governed by `[t, d]` (Total Specialization, Disjoint):
     * Tier 1: `Person` -> `Patient`, `Person` -> `Employee`
     * Tier 2: `Employee` -> `Doctor`, `Receptionist`, `Pharmacist`, `LabTechnician`, `SystemAdmin`
   - Section 7 of `eer_spec.md` defines the complete 27-table relational schema for MySQL 8 and H2.
2. **Dual-Persistence Runtime Environment**:
   - `ORIGINAL_REQUEST.md` (lines 16–19) and `PROJECT.md` (lines 15–19):
     * Primary: MySQL (`localhost:3306/pulseos_db`, user `root`)
     * Fallback & Live Demo: Embedded H2 (`jdbc:h2:mem:pulseos_db;MODE=MySQL;DB_CLOSE_DELAY=-1`) with interactive web console enabled at `http://localhost:8080/h2-console`.
   - Host environment: OpenJDK 17.0.19 installed at `/opt/homebrew/opt/openjdk@17/bin/java`. MySQL server daemon is currently not running locally, making H2 `MODE=MySQL` the primary driver for live evaluator demonstration.
3. **Double-Booking Invariant**:
   - `ORIGINAL_REQUEST.md` (lines 31, 56) and `eer_spec.md` (lines 59, 870):
     * "strict double-booking conflict prevention"
     * Enforced by composite unique constraint on `appointments (doctor_id, appointment_date, appointment_time)`.
4. **SLIIT Student Identity Mapping**:
   - `docs/members.txt` and `ORIGINAL_REQUEST.md` (lines 36–44):
     * IT25103819 Somarathna P. G. D. S. (Dila) -> Receptionist
     * IT25103999 Rathnayaka R. M. K. L. B. (Kavinda) -> Doctor
     * IT25101620 Malwatta M.W.C.S (Chanul) -> Receptionist / Front Desk Admin
     * IT25100826 Udumullage S.H.U. (Harshika) -> Pharmacist
     * IT25103992 Dhanasinghe K. A. K. H. (Kesaru) -> Cashier / System Admin
     * IT25103363 Thilakarathne H.S.K.P.N (Nethuli) -> Lab Technician
5. **JPA Joined Inheritance Constraints**:
   - Under JPA 2.x/3.x specification, `@Inheritance(strategy = InheritanceType.JOINED)` requires all subclasses in a hierarchy to inherit the primary key type and mapping of the superclass root entity. Subclasses cannot introduce disparate surrogate `@Id` columns. Subclasses join to the superclass primary key via `@PrimaryKeyJoinColumn`.

---

## 2. Logic Chain

1. **Resolving the Primary Key & Inheritance Architecture**:
   - *From Observation 1 & 5*: The EER defines `Person` with `nic_passport_no`, but `Patient` and `Employee` with surrogate `patient_id` and `employee_id`. All downstream foreign keys (`appointments.patient_id`, `appointments.doctor_id`, `invoices.patient_id`, `prescriptions.doctor_id`) are `BIGINT` foreign keys.
   - *Reasoning*: If `Person` uses `String nic_passport_no` as `@Id`, JPA joined inheritance would force all subclasses (`Patient`, `Employee`, `Doctor`) to share `String nic_passport_no` as primary key, breaking all `BIGINT` foreign keys across the entire system.
   - *Deduction*: By giving `Person` a monotonic surrogate primary key `@Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "person_id") private Long id;` and keeping `nic_passport_no` as a `UNIQUE NOT NULL` natural key, `Patient` and `Employee` inherit `Long id` via `@PrimaryKeyJoinColumn(name = "patient_id")` and `@PrimaryKeyJoinColumn(name = "employee_id")`. In the database, `patient_id` in `patients` and `employee_id` in `employees` are both primary keys and foreign keys referencing `persons(person_id)`. Downstream specialized roles (`Doctor`, `Receptionist`, `Pharmacist`, `LabTechnician`, `SystemAdmin`) similarly use `@PrimaryKeyJoinColumn(name = "employee_id")`. This preserves 100% standard JPA Table-Per-Type mechanics and clean `BIGINT` relational foreign keys.
2. **Ensuring MySQL 8 & H2 (MODE=MySQL) Cross-Compatibility**:
   - *From Observation 2*: DDL scripts executed in H2 2.x with `MODE=MySQL` can fail if MySQL-specific table-level collations (`COLLATE=utf8mb4_unicode_ci`) or unhandled circular constraints are present.
   - *Reasoning*: Omitting table-level `COLLATE` and using standard ANSI data types (`BIGINT AUTO_INCREMENT`, `VARCHAR`, `DECIMAL`, `DATE`, `TIME`, `DATETIME`, `TEXT`, `BOOLEAN`) ensures universal execution. Circular foreign keys (`departments.manager_id` <-> `employees.department_id`) are resolved by defining `departments` without foreign key first, creating `employees`, and attaching `fk_dept_manager` via `ALTER TABLE`.
3. **Compound Foreign Keys in Junction Tables**:
   - *From Observation 1*: The EER defines M:N tables (`prescription_items`, `invoice_drug_items`, `invoice_lab_items`, `purchase_order_items`) with composite primary keys.
   - *Reasoning*: Using JPA `@EmbeddedId` paired with `@MapsId` associations gives type-safe composite identifiers matching the relational schema without extra auto-increment surrogate keys.
4. **Enforcing Double-Booking Prevention**:
   - *From Observation 3*: Double-booking must be blocked at both database and service layers.
   - *Reasoning*: Combining `CONSTRAINT uq_doctor_slot UNIQUE (doctor_id, appointment_date, appointment_time)` in `schema.sql` and `@Table(uniqueConstraints = ...)` on `Appointment.java` with a defensive repository check `appointmentRepository.existsByDoctorIdAndAppointmentDateAndAppointmentTime(...)` ensures zero-concurrency race conditions can produce overlapping bookings.
5. **Idempotent Data Seeder Design**:
   - *From Observation 4*: Seed data must populate all 6 SLIIT student members, realistic patients, drugs, and operational records without throwing unique key errors on container or application restarts.
   - *Reasoning*: Guarding seeding execution with `if (departmentRepository.count() > 0) return;` guarantees that repeated starts never duplicate data or violate unique constraints.

---

## 3. Caveats

1. **H2 In-Memory Session Scope**:
   - When running in `demo` profile with in-memory H2 (`jdbc:h2:mem:pulseos_db`), database state resets upon JVM termination. `DB_CLOSE_DELAY=-1` ensures the database stays active as long as Spring Boot is running.
2. **Circular Department-Manager Seeding**:
   - During `DataSeeder` execution, `Department` must be saved with `manager = null` initially, followed by saving `Employee` (Dr. Kavinda / Kesaru) assigned to that department, and finally updating `department.setManager(employee)` to satisfy non-null departmental constraints without foreign-key deadlocks.
3. **Derived Columns in JPA**:
   - `age` on `Person` and `total_amount` on `Invoice`: In JPA, derived values are computed via entity helper methods (`getAge()`, `calculateTotal()`) rather than SQL virtual column expressions to ensure identical behavior in both H2 and MySQL.

---

## 4. Conclusion

A complete, production-ready, dual-engine persistence and clinical data seeder architecture has been designed and verified against all PulseOS academic EER specifications and Milestone M0 requirements:
1. **`schema.sql`**: A complete 27-table DDL script compatible with both MySQL 8 and embedded H2 (`MODE=MySQL`).
2. **JPA Entity Hierarchy**: Complete Table-Per-Type (`InheritanceType.JOINED`) mapping for `Person`, `Patient`, `Employee`, `Doctor`, `Receptionist`, `Pharmacist`, `LabTechnician`, and `SystemAdmin`, plus 19 clinical and operational entities.
3. **Repository Interfaces**: 23 Spring Data JPA repository interfaces specifying custom finder queries and invariant checks (including double-booking prevention and low-stock filters).
4. **Clinical Data Seeder**: An idempotent seeder specification populating the 6 authentic SLIIT staff members, 12 realistic patients with diverse triage tags, 23 drugs across 5 categories (6 low-stock items), 5 appointments, 2 prescriptions, 4 lab tests, and 2 itemized invoices.

All templates, code snippets, and instructions are finalized in:
`/Users/admin/Projects/honda_leda/.agents/explorer_m0_2/persistence_seeder_plan.md`.

---

## 5. Verification Method

1. **Schema DDL Inspection**:
   - Inspect `/Users/admin/Projects/honda_leda/.agents/explorer_m0_2/persistence_seeder_plan.md` Section 2 to verify all 27 tables, primary keys, foreign keys, and unique constraints.
2. **Double-Booking Prevention Verification**:
   - Inspect Table 9 in `schema.sql` and `Appointment.java` (Section 4.11):
     `CONSTRAINT uq_doctor_slot UNIQUE (doctor_id, appointment_date, appointment_time)`
   - Verify `AppointmentRepository` provides `existsByDoctorIdAndAppointmentDateAndAppointmentTime`.
3. **Staff Attribution Verification**:
   - Inspect Section 6.1 (Item 2) to verify all 6 student names, SLIIT IDs, and roles:
     * Kavinda (IT25103999) -> Doctor (SLMC-48291)
     * Dila (IT25103819) -> Receptionist (DESK-01)
     * Harshika (IT25100826) -> Pharmacist (PHARM-7721)
     * Nethuli (IT25103363) -> Lab Technician (MLT-1)
     * Kesaru (IT25103992) -> System Admin / Financial Manager (SUPER_ADMIN)
     * Chanul (IT25101620) -> Receptionist (DESK-02)
4. **Invoice Itemization Arithmetic Verification**:
   - Verify Invoice 1 calculation in Section 6.1 (Item 11):
     `Doctor Fee (3,500.00) + Drugs (1,650.00 + 540.00 = 2,190.00) + Lab Tests (2,200.00) = LKR 7,890.00`.
   - Verify Invoice 2 calculation:
     `Doctor Fee (3,500.00) + Lab Tests (650.00) = LKR 4,150.00 (PENDING)`.
5. **Invalidation Conditions**:
   - The persistence plan will be invalidated if any of the 27 tables fails to execute in H2 (`MODE=MySQL`), if double-booking allows two overlapping appointments for the same doctor, or if seed data violates unique constraints upon application restart.
