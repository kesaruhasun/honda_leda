# Empirical Challenge & Adversarial Verification Report: M0 Backend Persistence

**Agent**: Challenger M0-1 (Empirical Challenger)  
**Target**: PulseOS Milestone M0 Backend Persistence  
**Date**: 2026-09-14  
**Verdict**: **CONFIRM** (All 3 persistence invariants empirically verified and upheld)

---

## 1. Observation

### 1.1 Double-Booking Unique Constraint Inspection
- **Schema Definition** (`backend/src/main/resources/schema.sql`, line 218):
  ```sql
  CONSTRAINT uq_doctor_slot UNIQUE (doctor_id, appointment_date, appointment_time),
  ```
- **JPA Entity Mapping** (`backend/src/main/java/com/pulseos/entity/Appointment.java`, lines 11–13, 39–44):
  ```java
  @Table(name = "appointments", uniqueConstraints = {
      @UniqueConstraint(name = "uq_doctor_slot", columnNames = {"doctor_id", "appointment_date", "appointment_time"})
  })
  ...
  @Column(name = "appointment_date", nullable = false)
  private LocalDate appointmentDate;

  @Column(name = "appointment_time", nullable = false)
  private LocalTime appointmentTime;
  ```
  *(Note: The column name in the database and entity is `appointment_time`, representing the time slot for the consultation).*

- **Empirical Execution & Verbatim Error Outputs**:
  - Test command executed:
    ```bash
    ./mvnw test -Dtest=PersistenceEmpiricalChallengeTest$DoubleBookingConstraintTests
    ```
  - Verbatim log when attempting to insert an overlapping appointment into a pre-seeded slot (`docKavinda`, date: `2026-09-14`, time: `09:30:00`):
    ```
    2026-09-14T10:17:59.641+05:30  WARN 17187 --- [pulseos-backend] [main] o.h.engine.jdbc.spi.SqlExceptionHelper   : SQL Error: 23505, SQLState: 23505
    2026-09-14T10:17:59.641+05:30 ERROR 17187 --- [pulseos-backend] [main] o.h.engine.jdbc.spi.SqlExceptionHelper   : Unique index or primary key violation: "public.uq_doctor_slot_INDEX_5 ON public.appointments(doctor_id NULLS LAST, appointment_date NULLS LAST, appointment_time NULLS LAST) VALUES ( /* key:1 */ CAST(1 AS BIGINT), DATE '2026-09-14', TIME '09:30:00')"; SQL statement:
    insert into appointments (appointment_date,appointment_time,booking_date,doctor_id,patient_id,reason_for_visit,room_number,status,appointment_id) values (?,?,?,?,?,?,?,?,default) [23505-224]
    ```
  - Verbatim log when attempting to insert an overlapping booking dynamically at JPA level (`2026-12-15 14:00:00`):
    ```
    2026-09-14T10:17:59.560+05:30 ERROR 17187 --- [pulseos-backend] [main] o.h.engine.jdbc.spi.SqlExceptionHelper   : Unique index or primary key violation: "public.uq_doctor_slot_INDEX_5 ON public.appointments(doctor_id NULLS LAST, appointment_date NULLS LAST, appointment_time NULLS LAST) VALUES ( /* key:6 */ CAST(1 AS BIGINT), DATE '2026-12-15', TIME '14:00:00')"; SQL statement:
    insert into appointments (appointment_date,appointment_time,booking_date,doctor_id,patient_id,reason_for_visit,room_number,status,appointment_id) values (?,?,?,?,?,?,?,?,default) [23505-224]
    ```
  - Direct raw SQL execution via `JdbcTemplate`:
    `INSERT INTO appointments (patient_id, doctor_id, booking_date, room_number, appointment_date, appointment_time, status, reason_for_visit) VALUES (?, ?, CURRENT_TIMESTAMP, '301', ?, ?, 'SCHEDULED', 'Raw JDBC test')`
    The second execution threw `org.springframework.dao.DataIntegrityViolationException`.
  - Non-overlapping appointments: Different times on the same date (`10:00` vs `10:30`) succeeded and persisted distinct IDs.

### 1.2 DataSeeder Idempotency
- **Idempotency Gatekeeper** (`backend/src/main/java/com/pulseos/seeder/DataSeeder.java`, lines 49–52):
  ```java
  if (departmentRepository.count() > 0) {
      log.info("DataSeeder: Database already initialized. Skipping seeding.");
      return;
  }
  ```
- **Empirical Execution & Verbatim Logs**:
  - Test command:
    ```bash
    ./mvnw test -Dtest=PersistenceEmpiricalChallengeTest$DataSeederIdempotencyTests
    ```
  - Invoked `dataSeeder.run()` 10 consecutive times against an already-seeded database.
  - Verbatim log for each invocation:
    ```
    2026-09-14T10:17:59.465+05:30  INFO 17187 --- [pulseos-backend] [main] com.pulseos.seeder.DataSeeder : DataSeeder: Database already initialized. Skipping seeding.
    ```
  - Entity count comparison before and after 10 consecutive executions:
    - `Department`: 7 before -> 7 after (0 delta)
    - `Doctor`: 1 before -> 1 after (0 delta)
    - `Patient`: 12 before -> 12 after (0 delta)
    - `Employee`: 6 before -> 6 after (0 delta)
    - `Drug`: 23 before -> 23 after (0 delta)
    - `Appointment`: 5 before -> 5 after (0 delta)
    - `Invoice`: 2 before -> 2 after (0 delta)
    - `LabTest`: 4 before -> 4 after (0 delta)
    - `Person`: 18 before -> 18 after (0 delta)
  - Zero duplicate rows created, zero constraint violation exceptions thrown.

### 1.3 Table-Per-Type (TPT) Joined-Table Inheritance
- **Entity Definitions**:
  - `backend/src/main/java/com/pulseos/entity/Person.java`:
    `@Inheritance(strategy = InheritanceType.JOINED)`, `@DiscriminatorColumn(name = "person_type")`, `@Table(name = "persons")`
  - `backend/src/main/java/com/pulseos/entity/Employee.java`:
    `extends Person`, `@Table(name = "employees")`, `@PrimaryKeyJoinColumn(name = "employee_id", referencedColumnName = "person_id")`
  - `backend/src/main/java/com/pulseos/entity/Doctor.java`:
    `extends Employee`, `@Table(name = "doctors")`, `@PrimaryKeyJoinColumn(name = "employee_id", referencedColumnName = "employee_id")`
  - `backend/src/main/java/com/pulseos/entity/Patient.java`:
    `extends Person`, `@Table(name = "patients")`, `@PrimaryKeyJoinColumn(name = "patient_id", referencedColumnName = "person_id")`
- **Empirical Execution**:
  - Test command:
    ```bash
    ./mvnw test -Dtest=PersistenceEmpiricalChallengeTest$TablePerTypeInheritanceTests
    ```
  - Executed raw 3-tier SQL join:
    ```sql
    SELECT p.person_id, p.first_name, p.last_name, p.nic_passport_no, p.person_type,
           e.salary, e.email, e.employee_role, d.doctor_license_no, d.specialization
    FROM persons p
    INNER JOIN employees e ON p.person_id = e.employee_id
    INNER JOIN doctors d ON e.employee_id = d.employee_id
    WHERE d.employee_id = 1
    ```
    Result verified: `FIRST_NAME="Kavinda"`, `LAST_NAME="Rathnayaka"`, `NIC_PASSPORT_NO="199912401829"`, `SALARY=450000.00`, `DOCTOR_LICENSE_NO="SLMC-48291"`.
  - Executed raw 2-tier SQL join for Patients:
    ```sql
    SELECT p.person_id, p.first_name, p.nic_passport_no, p.person_type, pt.blood_group, pt.triage_priority
    FROM persons p
    INNER JOIN patients pt ON p.person_id = pt.patient_id
    WHERE pt.patient_id = ?
    ```
    Result verified: Person and Patient attributes matched runtime JPA entities.
  - Polymorphic query via `PersonRepository.findAll()`:
    - Returns 18 instances (12 instances of `Patient`, 6 instances of `Employee`, including 1 `Doctor`).
    - Verified database `person_type` discriminator values: `PATIENT`, `DOCTOR`, `RECEPTIONIST`, `PHARMACIST`, `LAB_TECHNICIAN`, `SYSTEM_ADMIN`.

### 1.4 Full Maven Test Suite Execution
- Command: `./mvnw clean test` in `/Users/admin/Projects/honda_leda/backend`
- Verbatim result:
  ```
  [INFO] Running com.pulseos.PulseOsApplicationTests
  [INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 6.775 s -- in com.pulseos.PulseOsApplicationTests
  [INFO] Running com.pulseos.challenge.PersistenceEmpiricalChallengeTest
  [INFO] Running com.pulseos.challenge.PersistenceEmpiricalChallengeTest$TablePerTypeInheritanceTests
  [INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.097 s -- in com.pulseos.challenge.PersistenceEmpiricalChallengeTest$TablePerTypeInheritanceTests
  [INFO] Running com.pulseos.challenge.PersistenceEmpiricalChallengeTest$DataSeederIdempotencyTests
  [INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.072 s -- in com.pulseos.challenge.PersistenceEmpiricalChallengeTest$DataSeederIdempotencyTests
  [INFO] Running com.pulseos.challenge.PersistenceEmpiricalChallengeTest$DoubleBookingConstraintTests
  [INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.152 s -- in com.pulseos.challenge.PersistenceEmpiricalChallengeTest$DoubleBookingConstraintTests
  [INFO] Tests run: 0, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.334 s -- in com.pulseos.challenge.PersistenceEmpiricalChallengeTest
  [INFO] Results:
  [INFO] Tests run: 13, Failures: 0, Errors: 0, Skipped: 0
  [INFO] BUILD SUCCESS
  [INFO] Total time:  12.000 s
  ```

---

## 2. Logic Chain

1. **Double-Booking Invariant**:
   - Observation 1.1 demonstrates that both `schema.sql` (line 218) and `Appointment.java` (lines 11-13) enforce a composite unique constraint named `uq_doctor_slot` on `(doctor_id, appointment_date, appointment_time)`.
   - In `testDuplicateSeededDoctorSlotFails`, attempting to book `docKavinda` on `today` at `09:30:00` fails immediately with SQL state `23505` (`uq_doctor_slot_INDEX_5`).
   - In `testDynamicDoubleBookingFailsAtJpaLevel` and `testDoubleBookingFailsAtJdbcLevel`, attempting to insert conflicting bookings dynamically triggers `DataIntegrityViolationException` across both JPA and raw JDBC.
   - In `testNonOverlappingSlotsSucceed`, non-conflicting times (`10:00` vs `10:30`) on the same date persist successfully.
   - Therefore, the double-booking unique constraint is verified and actively enforced at both the database and ORM tiers.

2. **DataSeeder Idempotency Invariant**:
   - Observation 1.2 demonstrates that `DataSeeder.java` evaluates `if (departmentRepository.count() > 0)` before executing any seed insert statements.
   - Because `run()` is annotated with `@Transactional`, initialization executes as an atomic unit.
   - When the seeder was directly called 10 times consecutively, all 10 invocations safely short-circuited with `Database already initialized. Skipping seeding.`
   - Record counts for all 9 entities remained identical (0 duplicates, 0 exceptions).
   - Therefore, `DataSeeder` is empirically verified to be completely idempotent across subsequent executions.

3. **Table-Per-Type (TPT) Inheritance Invariant**:
   - Observation 1.3 shows that `Person` is mapped with `@Inheritance(strategy = InheritanceType.JOINED)`, subclassed by `Employee` and `Patient`, and `Employee` is further subclassed by `Doctor`.
   - In the database, `persons`, `employees`, and `doctors` maintain normalized tables sharing the primary key `person_id = employee_id`.
   - When querying `Doctor` via JPA or raw SQL, Hibernate joins `persons`, `employees`, and `doctors`, hydrating all superclass fields (`firstName`, `salary`) alongside subclass fields (`doctorLicenseNo`).
   - Querying `personRepository.findAll()` successfully materializes polymorphic subclasses (`Patient`, `Doctor`, etc.) conforming to the discriminator column.
   - Therefore, Table-Per-Type joined inheritance functions correctly according to JPA 3.2 and relational standards.

---

## 3. Caveats

1. **Column Naming**: In the challenge mission instructions, the slot constraint was described as `(doctor_id, appointment_date, time_slot)`. In the actual schema and entity code, the column is named `appointment_time`. The composite constraint is `(doctor_id, appointment_date, appointment_time)`.
2. **Unconditional Slot Restriction**: The database unique constraint `uq_doctor_slot` is unconditional; it applies to all rows regardless of `status`. This means that if an appointment is `CANCELLED`, the slot remains blocked in the database unless the cancelled appointment record is updated (e.g. rescheduled) or soft-deleted/purged. In Milestone M3 (Appointment Management), the service layer should handle cancellation slot recycling.

---

## 4. Conclusion

**Verdict: CONFIRM**

All three challenge criteria have been thoroughly, adversarially, and empirically stress-tested:
1. **Double-Booking Prevention**: Empirically confirmed. Attempting to insert overlapping appointments for the same doctor at the same date and time slot fails with a unique constraint violation (`23505 / DataIntegrityViolationException`) across both JPA and raw JDBC.
2. **DataSeeder Idempotency**: Empirically confirmed. Calling `DataSeeder.run()` 10 consecutive times produces 0 duplicate records and 0 errors.
3. **Table-Per-Type Joined Inheritance**: Empirically confirmed. Querying doctors, patients, and employees correctly executes multi-table SQL joins with the `persons` table, with 100% data fidelity.

---

## 5. Verification Method

To independently verify these empirical results:

```bash
cd /Users/admin/Projects/honda_leda/backend
./mvnw clean test -Dtest=PersistenceEmpiricalChallengeTest
```

Expected result:
- Tests run: 9, Failures: 0, Errors: 0, Skipped: 0.
- `BUILD SUCCESS`.

To run the entire suite:
```bash
cd /Users/admin/Projects/honda_leda/backend
./mvnw clean test
```

Expected result:
- Tests run: 13, Failures: 0, Errors: 0, Skipped: 0.
- `BUILD SUCCESS`.

Test harness file:
- `/Users/admin/Projects/honda_leda/backend/src/test/java/com/pulseos/challenge/PersistenceEmpiricalChallengeTest.java`
