# Milestone M0 (Backend) Code Quality & Architectural Review Report

## 1. Observation

- **Review Target**: Backend implementation for PulseOS Hospital Management System (SLIIT SE2030 Group 60) located in `/Users/admin/Projects/honda_leda/backend`.
- **Build & Test Command**: `./mvnw clean test` in `/Users/admin/Projects/honda_leda/backend`
- **Verbatim Test Execution Output**:
  ```
  [INFO] Compiling 71 source files with javac [debug release 17] to target/classes
  [INFO] Compiling 2 source files with javac [debug release 17] to target/test-classes
  ...
  2026-09-14T10:18:27.597+05:30  INFO 18106 --- [pulseos-backend] [           main] .s.d.r.c.RepositoryConfigurationDelegate : Bootstrapping Spring Data JPA repositories in DEFAULT mode.
  2026-09-14T10:18:27.639+05:30  INFO 18106 --- [pulseos-backend] [           main] .s.d.r.c.RepositoryConfigurationDelegate : Finished Spring Data repository scanning in 38 ms. Found 23 JPA repository interfaces.
  2026-09-14T10:18:27.876+05:30  INFO 18106 --- [pulseos-backend] [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Starting...
  2026-09-14T10:18:27.971+05:30  INFO 18106 --- [pulseos-backend] [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Start completed.
  2026-09-14T10:18:28.163+05:30  INFO 18106 --- [pulseos-backend] [           main] o.s.b.a.h2.H2ConsoleAutoConfiguration    : H2 console available at '/h2-console'. Database available at 'jdbc:h2:mem:pulseos_db'
  2026-09-14T10:18:28.225+05:30  INFO 18106 --- [pulseos-backend] [           main] com.pulseos.seeder.DataSeeder            : DataSeeder: Beginning clinical database population for PulseOS Group 60...
  2026-09-14T10:18:28.304+05:30  INFO 18106 --- [pulseos-backend] [           main] com.pulseos.seeder.DataSeeder            : DataSeeder: Database successfully populated! All 6 team members, 12 patients, 23 drugs, and clinical encounters ready.
  [INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 4.506 s -- in com.pulseos.PulseOsApplicationTests
  [INFO] Running com.pulseos.challenge.PersistenceEmpiricalChallengeTest
  [INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.051 s -- in com.pulseos.challenge.PersistenceEmpiricalChallengeTest$TablePerTypeInheritanceTests
  [INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.031 s -- in com.pulseos.challenge.PersistenceEmpiricalChallengeTest$DataSeederIdempotencyTests
  [INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.074 s -- in com.pulseos.challenge.PersistenceEmpiricalChallengeTest$DoubleBookingConstraintTests
  [INFO] Results:
  [INFO] Tests run: 13, Failures: 0, Errors: 0, Skipped: 0
  [INFO] ------------------------------------------------------------------------
  [INFO] BUILD SUCCESS
  [INFO] Total time:  8.770 s
  [INFO] Finished at: 2026-09-14T10:18:29+05:30
  ```

- **Inspected Code Files**:
  1. `pom.xml`: Spring Boot 3.2.12 parent, Java 17 configuration (`<java.version>17</java.version>`, source/target 17), dependencies for `web`, `data-jpa`, `validation`, `security`, `h2`, `mysql-connector-j`, `lombok`, `jackson-datatype-jsr310`, `spring-boot-starter-test`, and `spring-security-test`.
  2. `src/main/resources/schema.sql`: 452 lines containing all 27 relational tables matching the authoritative PulseOS EER diagram (`persons`, `person_contacts`, `patients`, `departments`, `employees`, `employee_qualifications`, `doctors`, `receptionists`, `pharmacists`, `lab_technicians`, `system_admins`, `wards`, `patient_admissions`, `appointments`, `prescriptions`, `drugs`, `prescription_items`, `drug_dispensations`, `lab_tests`, `invoices`, `invoice_drug_items`, `invoice_lab_items`, `payments`, `suppliers`, `supplier_phones`, `purchase_orders`, `purchase_order_items`). Line 218 explicitly defines: `CONSTRAINT uq_doctor_slot UNIQUE (doctor_id, appointment_date, appointment_time)`.
  3. `src/main/resources/application.yml`: Dual database profiles (`demo` active by default using `jdbc:h2:mem:pulseos_db;MODE=MySQL` with H2 console at `/h2-console`, and `mysql` production profile using `jdbc:mysql://localhost:3306/pulseos_db`).
  4. JPA Entity Hierarchy:
     - `Person.java`: `@Inheritance(strategy = InheritanceType.JOINED)`, `@DiscriminatorColumn(name = "person_type")`, mapped to `persons`.
     - `Patient.java`: Extends `Person`, `@PrimaryKeyJoinColumn(name = "patient_id", referencedColumnName = "person_id")`, `@DiscriminatorValue("PATIENT")`.
     - `Employee.java`: Extends `Person`, `@PrimaryKeyJoinColumn(name = "employee_id", referencedColumnName = "person_id")`, `@DiscriminatorValue("EMPLOYEE")`.
     - `Doctor.java`: Extends `Employee`, `@PrimaryKeyJoinColumn(name = "employee_id", referencedColumnName = "employee_id")`, `@DiscriminatorValue("DOCTOR")`.
     - `Receptionist.java`: Extends `Employee`, `@PrimaryKeyJoinColumn(name = "employee_id", referencedColumnName = "employee_id")`, `@DiscriminatorValue("RECEPTIONIST")`.
     - `Pharmacist.java`: Extends `Employee`, `@PrimaryKeyJoinColumn(name = "employee_id", referencedColumnName = "employee_id")`, `@DiscriminatorValue("PHARMACIST")`.
     - `LabTechnician.java`: Extends `Employee`, `@PrimaryKeyJoinColumn(name = "employee_id", referencedColumnName = "employee_id")`, `@DiscriminatorValue("LAB_TECHNICIAN")`.
     - `SystemAdmin.java`: Extends `Employee`, `@PrimaryKeyJoinColumn(name = "employee_id", referencedColumnName = "employee_id")`, `@DiscriminatorValue("SYSTEM_ADMIN")`.
     - `Appointment.java`: Line 11-13 defines `@Table(name = "appointments", uniqueConstraints = {@UniqueConstraint(name = "uq_doctor_slot", columnNames = {"doctor_id", "appointment_date", "appointment_time"})})`.
  5. Repositories: 23 Spring Data JPA interfaces in `com.pulseos.repository` extending `JpaRepository`.
  6. `DataSeeder.java`: Populates 7 departments, all 6 SLIIT staff members (Doctor Kavinda IT25103999, Receptionist Dila IT25103819, Pharmacist Harshika IT25100826, Lab Tech Nethuli IT25103363, Admin Kesaru IT25103992, Receptionist Chanul IT25101620), 5 wards, 2 admissions, 3 suppliers, 23 pharmaceuticals (6 with low stock: Azithromycin, Ceftriaxone, Diclofenac, Atenolol, Insulin, Salbutamol), 12 realistic patients, 5 appointments, prescriptions, dispensations, 4 lab tests, and 2 itemized invoices (Invoice 1: LKR 7,890.00 PAID; Invoice 2: LKR 4,150.00 PENDING).
  7. `SecurityConfig.java`, `PayHereConfig.java`, and `PayHereSecurityUtil.java`: Configured with CORS for Vite (`localhost:5173`), frame-options same-origin for H2 console, and PayHere MD5 hashing algorithm `MD5(merchant_id + order_id + amount + currency + MD5(merchant_secret))`.

## 2. Logic Chain

1. **Integrity & Authenticity Assessment**:
   - Source code was inspected for hardcoded mock returns, fake repository implementations, or fabricated verification outputs.
   - Result: No integrity violations detected. The entities, repositories, security configs, and seeder utilize genuine Spring Data JPA, Hibernate ORM 6.4, and Spring Security constructs.
   - The test suite executes real in-memory transactions and SQL statements against H2 in MySQL compatibility mode.

2. **Schema & EER Model Verification**:
   - `schema.sql` completely reproduces all 27 tables specified in `docs/PulseOS_EER_Diagram.drawio`.
   - The double-booking unique constraint `uq_doctor_slot (doctor_id, appointment_date, appointment_time)` is present in both `schema.sql` (line 218) and `Appointment.java` (line 12).
   - Foreign keys enforce cascade on weak entities and child join tables, while enforcing `RESTRICT` on core business links (patient/doctor references).

3. **Domain Inheritance Verification**:
   - Table-Per-Type (TPT) is implemented via `@Inheritance(strategy = InheritanceType.JOINED)`.
   - Empirically verified in `PersistenceEmpiricalChallengeTest$TablePerTypeInheritanceTests`:
     - Raw SQL joins across `persons`, `employees`, and `doctors` return consistent polymorphic attributes.
     - Polymorphic querying via `PersonRepository.findAll()` returns both `Patient` and `Employee`/`Doctor` instances preserving full type identity.

4. **Seeder Idempotency & Data Fidelity**:
   - `DataSeeder.java` includes an atomic guard checking `departmentRepository.count() > 0`.
   - Stress-tested in `PersistenceEmpiricalChallengeTest$DataSeederIdempotencyTests` by executing `run()` 10 consecutive times: table counts remain identical with 0 record inflation and 0 constraint violations.

5. **Adversarial Analysis & Stress-Testing Findings**:
   - **Finding 1 (Minor - M3 Design Note)**: The database unique constraint `uq_doctor_slot (doctor_id, appointment_date, appointment_time)` strictly blocks duplicate inserts. However, because status is not included in the unique index (MySQL 8.0 limitation), an appointment marked `CANCELLED` still occupies that slot tuple at the DB level unless the record is reallocated or the slot date/time is adjusted. Milestone M3 service implementation should account for slot release on cancellation.
   - **Finding 2 (Minor - Payment Security Defense-in-Depth)**: In `PayHereSecurityUtil.java`, webhook signature comparison uses `localMd5Sig.equalsIgnoreCase(receivedMd5Sig)`. While completely compliant with PayHere's specification, using `MessageDigest.isEqual` for constant-time comparison prevents timing side-channels.
   - **Finding 3 (Informational - Security Scope)**: `SecurityConfig.java` permits all requests (`permitAll()`) and disables CSRF. This is intentional and standard for M0 scaffolding and viva evaluation to allow seamless frontend-backend development before session/JWT role enforcement in later milestones.

## 3. Caveats

- **MySQL Live Profile**: Testing was performed using the default `demo` profile (H2 in MySQL compatibility mode) as designed for zero-dependency standalone evaluation. Running against production MySQL requires a running local MySQL instance on port 3306 with database `pulseos_db`.
- **Controller/REST Endpoints**: In accordance with the project milestone schedule, REST controllers and HTTP request mappings are slated for implementation in Milestones M1 through M6 by the respective module owners.

## 4. Conclusion

**Verdict: APPROVE**

The backend implementation for Milestone M0 satisfies all architectural, functional, and quality requirements:
- Clean Maven project configuration with Java 17 and Spring Boot 3.2.12.
- 27-table relational schema matching the official PulseOS EER Diagram with composite unique constraint `uq_doctor_slot`.
- Fully functional Table-Per-Type JPA inheritance tree (`Person` -> `Patient` / `Employee` -> `Doctor`, `Receptionist`, `Pharmacist`, `LabTechnician`, `SystemAdmin`).
- Complete set of 23 Spring Data JPA repositories.
- Idempotent `DataSeeder` accurately populating all 6 SLIIT team members, 12 patients, 23 pharmaceuticals, 6 low-stock items, appointments, and aggregated invoices.
- PayHere integration utilities and security configuration enabling H2 web console access and Vite CORS.
- 13/13 unit and empirical challenge tests passing cleanly.

## 5. Verification Method

To independently reproduce this verification:

```bash
cd /Users/admin/Projects/honda_leda/backend
./mvnw clean test
```

Expected result:
`BUILD SUCCESS` with 13 tests passed, 0 failures, 0 errors.

Key files for inspection:
- `/Users/admin/Projects/honda_leda/backend/pom.xml`
- `/Users/admin/Projects/honda_leda/backend/src/main/resources/schema.sql`
- `/Users/admin/Projects/honda_leda/backend/src/main/resources/application.yml`
- `/Users/admin/Projects/honda_leda/backend/src/main/java/com/pulseos/entity/Person.java`
- `/Users/admin/Projects/honda_leda/backend/src/main/java/com/pulseos/seeder/DataSeeder.java`
- `/Users/admin/Projects/honda_leda/backend/src/main/java/com/pulseos/common/util/PayHereSecurityUtil.java`
- `/Users/admin/Projects/honda_leda/backend/src/test/java/com/pulseos/PulseOsApplicationTests.java`
- `/Users/admin/Projects/honda_leda/backend/src/test/java/com/pulseos/challenge/PersistenceEmpiricalChallengeTest.java`
