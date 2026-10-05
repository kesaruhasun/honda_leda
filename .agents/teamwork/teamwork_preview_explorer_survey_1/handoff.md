# Backend & Database Architecture Exploration Report (Step 0 Survey)

**Agent**: Backend Explorer (`teamwork_preview_explorer_survey_1`)  
**Working Directory**: `/Users/admin/Projects/honda_leda/.agents/teamwork/teamwork_preview_explorer_survey_1`  
**Target Project Root**: `/Users/admin/Projects/honda_leda`  
**Timestamp**: 2026-10-04T06:15:00Z  

---

## 1. Observation

### 1.1 Project Structure, Build Tool, Java Version & Dependencies
- **Build Tool & Wrapper**: Maven 3.9.6 wrapper located at `backend/mvnw` and `backend/mvnw.cmd`.
- **Project Descriptor**: `backend/pom.xml`:
  - Java version: `17` (`<java.version>17</java.version>`)
  - Framework: Spring Boot `3.2.12` (`spring-boot-starter-parent:3.2.12`)
  - Dependencies installed:
    - `org.springframework.boot:spring-boot-starter-web`
    - `org.springframework.boot:spring-boot-starter-data-jpa`
    - `org.springframework.boot:spring-boot-starter-validation`
    - `org.springframework.boot:spring-boot-starter-security`
    - `com.h2database:h2`
    - `com.mysql:mysql-connector-j` (runtime)
    - `org.projectlombok:lombok` (optional)
    - `com.fasterxml.jackson.datatype:jackson-datatype-jsr310`
    - `org.springframework.boot:spring-boot-starter-test` (test)
    - `org.springframework.security:spring-security-test` (test)
- **Missing Dependencies**:
  - **No JWT Library**: No JJWT (`jjwt-api`, `jjwt-impl`, `jjwt-jackson`) or Auth0 JWT dependencies exist in `pom.xml`.
  - **No Email Library**: No Spring Mail (`spring-boot-starter-mail`) dependency exists in `pom.xml`.
- **Runtime Environment**:
  - Host Java runtime: `openjdk version "17.0.19" 2026-04-21` (macOS arm64).

### 1.2 Configuration Files & Dual-Persistence Setup
- **Configuration Path**: `backend/src/main/resources/application.yml`
  - Active profile default: `spring.profiles.active: demo` (Line 10).
  - Server port: `8080`, context-path: `/` (Lines 1-4).
  - Open-in-view: `false` (Line 14).
  - PayHere Configuration (`pulseos.payhere`):
    - `merchant-id: "1220000"`
    - `merchant-secret: "sandbox_secret_sliit_pulseos_2026"`
    - `checkout-url: "https://sandbox.payhere.lk/pay/checkout"`
    - `notify-url: "http://localhost:8080/api/v1/payments/payhere/notify"`
    - `return-url: "http://localhost:5173/billing/payment-success"`
    - `cancel-url: "http://localhost:5173/billing/payment-cancel"`
    - `currency: "LKR"`, `sandbox: true`
  - Profile 1: `demo` (Lines 28-61):
    - Driver: `org.h2.Driver`
    - JDBC URL: `jdbc:h2:mem:pulseos_db;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH;DB_CLOSE_DELAY=-1`
    - User/Password: `sa` / `""`
    - H2 Web Console: enabled at `/h2-console`
    - DDL auto: `update`
    - Secondary H2 TCP Server: Runs on port `9092` via `backend/src/main/java/com/pulseos/config/H2TcpServerConfig.java` for external GUI connections.
  - Profile 2: `mysql` (Lines 63-87):
    - Driver: `com.mysql.cj.jdbc.Driver`
    - JDBC URL: `jdbc:mysql://localhost:3306/pulseos_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Colombo`
    - User/Password: `${MYSQL_USER:root}` / `${MYSQL_PASSWORD:root}`
    - DDL auto: `update`
    - Schema location: `schema.sql` (currently empty placeholder at `backend/src/main/resources/schema.sql`).

### 1.3 Security Configuration & RBAC State
- **File**: `backend/src/main/java/com/pulseos/config/SecurityConfig.java`
- **Observed Code (Lines 21-39)**:
  ```java
  http
      .cors(...)
      .csrf(csrf -> csrf.ignoringRequestMatchers("/h2-console/**", "/db-console/**", "/api/**", "/api/v1/**").disable())
      .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))
      .authorizeHttpRequests(auth -> auth
          .requestMatchers("/h2-console/**", "/db-console/**").permitAll()
          .requestMatchers("/api/**").permitAll()
          .requestMatchers("/api/v1/**").permitAll()
          .requestMatchers("/error").permitAll()
          .anyRequest().permitAll()
      );
  ```
- **Finding**: Every single endpoint is configured as `permitAll()`. There is no JWT authentication filter, no `UserDetailsService`, no token validation, and no backend role checking.
- **Frontend Station Switcher**: In `frontend/src/context/RoleContext.tsx` (Lines 4-45), role switching (`DOCTOR`, `RECEPTIONIST`, `PHARMACIST`, `LAB_TECHNICIAN`, `CASHIER_ADMIN`) is handled entirely in client-side memory using a hardcoded dictionary (`CLINICAL_STAFF`). No token is generated or verified against the backend.

### 1.4 Package Structure vs Domain-Driven Design (DDD)
- **Current Package Organization**: Flat layered architecture (package-by-layer) under `com.pulseos`:
  - `com.pulseos.common` (controller, dto, exception, util)
  - `com.pulseos.config` (H2TcpServerConfig, PayHereConfig, SecurityConfig)
  - `com.pulseos.controller` (AppointmentController, BillingController, DoctorController, LaboratoryController, PatientController, PaymentController, PharmacyController)
  - `com.pulseos.dto` (AppointmentDTOs, BillingDTOs, DoctorDTOs, LabDTOs, PatientDTOs, PharmacyDTOs)
  - `com.pulseos.entity` (30 entity classes, 13 enums in `enums`)
  - `com.pulseos.repository` (25 repository interfaces)
  - `com.pulseos.seeder` (DataSeeder)
  - `com.pulseos.service` (AppointmentService, BillingService, DoctorService, LaboratoryService, PatientService, PharmacyService)
- **Target Architecture (DDD)**: High-cohesion, bounded-context domain modules (package-by-feature) requested in `ORIGINAL_REQUEST.md`:
  - `com.pulseos.patient`
  - `com.pulseos.doctor`
  - `com.pulseos.appointment`
  - `com.pulseos.pharmacy`
  - `com.pulseos.laboratory`
  - `com.pulseos.billing`
  - `com.pulseos.security` (or `com.pulseos.auth`)
  - `com.pulseos.notification`
  - `com.pulseos.landing`
  - `com.pulseos.common` (shared infrastructure, exceptions, base entity `Person`)

### 1.5 Chaotic and Duplicate DTO Structures
Every DTO file in `backend/src/main/java/com/pulseos/dto` contains redundant, overlapping, and alias fields:
1. **`PatientDTOs.java`**:
   - `PatientRequest` (Lines 15-47):
     - `nicPassport` vs `nicPassportNo` (and workaround `getResolvedNic()`)
     - `phoneNumber` vs `contactNumber` (and workaround `getResolvedPhone()`)
     - `dateOfBirth` vs `dob` (and workaround `getResolvedDob()`)
   - `PatientResponse` (Lines 55-81):
     - `id` vs `personId` vs `patientId` (three redundant identifiers for one entity)
     - `nicPassport` vs `nicPassportNo`
     - `phoneNumber` vs `contactNumber`
     - `dateOfBirth` vs `dob`
2. **`DoctorDTOs.java`**:
   - `DoctorRequest` (Lines 15-35): `licenseNumber` vs `licenseNo` vs `doctorLicenseNo` (and `getResolvedLicense()`)
   - `DoctorResponse` (Lines 43-61): `id` vs `employeeId`, `phoneNumber` vs `contactNumber`, `licenseNumber` vs `licenseNo` vs `doctorLicenseNo`
3. **`AppointmentDTOs.java`**:
   - `AppointmentRequest` (Lines 13-33): `startTime` vs `appointmentTime` (`getResolvedStartTime()`), `symptomsReason` vs `reasonForVisit` (`getResolvedReason()`)
   - `AppointmentResponse` (Lines 41-60): `id` vs `appointmentId`, `startTime` vs `appointmentTime`, `symptomsReason` vs `reasonForVisit`
4. **`BillingDTOs.java`**:
   - `PayHereInitiateResponse` (Lines 73-97): mixes camelCase and snake_case duplicate properties on the same response object:
     - `merchantId` vs `merchant_id`
     - `orderId` vs `order_id`
     - `notifyUrl` vs `notify_url`
     - `patientFirstName` vs `first_name`
     - `patientLastName` vs `last_name`
     - `patientEmail` vs `email`
     - `patientPhone` vs `phone`
5. **`LabDTOs.java`**:
   - `LabCatalogResponse`: `price` vs `standardFee`
   - `LabOrderRequest`: `labTestId` vs `testCatalogId` (`getResolvedTestCatalogId()`)
   - `LabResultRequest`: `resultValue` vs `resultData`, `clinicalRemarks` vs `technicianNotes`
6. **`PharmacyDTOs.java`**:
   - `DrugRequest`: `itemCode` (with synthetic fallback `getResolvedItemCode()`), `drugName` vs `genericName` (`getResolvedName()`)
   - `DrugResponse`: `id` vs `drugId`, `drugName` vs `genericName`

### 1.6 Database Schema & Entity Relationships
- **Inheritance Hierarchy**:
  - `Person` (`@Table(name = "persons")`, `InheritanceType.JOINED`)
    - Subclass 1: `Patient` (`@Table(name = "patients")`, `@PrimaryKeyJoinColumn(name = "patient_id", referencedColumnName = "person_id")`)
    - Subclass 2: `Employee` (`@Table(name = "employees")`, `@PrimaryKeyJoinColumn(name = "employee_id", referencedColumnName = "person_id")`)
      - Subclass 2a: `Doctor` (`@Table(name = "doctors")`, `@PrimaryKeyJoinColumn(name = "employee_id")`)
      - Subclass 2b: `Receptionist` (`@Table(name = "receptionists")`)
      - Subclass 2c: `Pharmacist` (`@Table(name = "pharmacists")`)
      - Subclass 2d: `LabTechnician` (`@Table(name = "lab_technicians")`)
      - Subclass 2e: `SystemAdmin` (`@Table(name = "system_admins")`)
- **Key Tables & Relationships**:
  - `departments`: Managed by `Employee` (`manager_id`).
  - `wards` & `patient_admissions`: `patient_admissions` links `patients` and `wards`.
  - `appointments`:
    - Links `patients` (`patient_id`) and `doctors` (`doctor_id`).
    - Unique Constraint: `uq_doctor_slot (doctor_id, appointment_date, appointment_time)`.
  - `prescriptions` & `prescription_items`:
    - `prescriptions` linked to `appointments` (`appointment_id`).
    - `prescription_items` has composite PK `(prescription_id, drug_id)` linking to `drugs`.
  - `drug_dispensations`: Links `prescriptions` and `pharmacists`.
  - `lab_test_catalogs` & `lab_tests`:
    - `lab_tests` links `appointments`, `patients`, `doctors`, and `lab_technicians`.
  - `invoices`, `invoice_drug_items`, `invoice_lab_items`, `payments`:
    - `invoices` links `patients` and `appointments`.
    - `invoice_drug_items` has composite PK `(invoice_id, drug_id)`.
    - `invoice_lab_items` has composite PK `(invoice_id, test_id)`.
    - `payments` (`PaymentTransaction`) links to `invoices` (`invoice_id`) with unique `transaction_ref`.

### 1.7 Current API Endpoints Inventory
The backend exposes 28 REST endpoints under `/api/v1`:

| Area | HTTP Method | Path | Request Body / Params | Status Code | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **System** | `GET` | `/api/v1/health` | None | `200` | Wrapped in `ApiResponse` |
| **Patients** | `GET` | `/api/v1/patients` | `triagePriority`, `search` | `200` | List of patients |
| | `GET` | `/api/v1/patients/search` | `q` | `200` | Query search |
| | `POST` | `/api/v1/patients` | `PatientRequest` | `201` | Registers patient |
| | `GET` | `/api/v1/patients/nic/{nic}` | Path variable | `200` | Lookup by NIC |
| | `GET` | `/api/v1/patients/{id}` | Path variable | `200` | Lookup by ID |
| | `PUT` | `/api/v1/patients/{id}` | `PatientRequest` | `200` | Update profile |
| | `PATCH` | `/api/v1/patients/{id}/archive` | Path variable | `200` | Soft archive |
| | `PATCH` | `/api/v1/patients/{id}/restore` | Path variable | `200` | Restore |
| **Doctors** | `GET` | `/api/v1/doctors` | `specialization` | `200` | List of doctors |
| | `GET` | `/api/v1/doctors/{id}` | Path variable | `200` | Lookup by ID |
| | `POST` | `/api/v1/doctors` | `DoctorRequest` | `201` | Create doctor |
| | `PATCH` | `/api/v1/doctors/{id}/availability` | `DoctorAvailabilityUpdateRequest` | `200` | Toggle availability |
| | `PATCH` | `/api/v1/doctors/{id}/fee` | `DoctorFeeUpdateRequest` | `200` | Update fee |
| | `GET` | `/api/v1/doctors/{id}/schedules` | Path variable | `200` | List schedules |
| | `POST` | `/api/v1/doctors/{id}/schedules` | `DoctorScheduleRequest` | `201` | Create schedule |
| **Appointments** | `GET` | `/api/v1/appointments` | None | `200` | All appointments |
| | `GET` | `/api/v1/appointments/today` | None | `200` | Today's appointments |
| | `GET` | `/api/v1/appointments/{id}` | Path variable | `200` | Lookup by ID |
| | `POST` | `/api/v1/appointments` | `AppointmentRequest` | `201` | Create appointment |
| | `PATCH` | `/api/v1/appointments/{id}/reschedule` | `RescheduleRequest` | `200` | Reschedule |
| | `PATCH` | `/api/v1/appointments/{id}/cancel` | Path variable | `200` | Cancel appointment |
| | `PATCH` | `/api/v1/appointments/{id}/complete` | Path variable | `200` | Complete appointment |
| **Pharmacy** | `GET` | `/api/v1/pharmacy/drugs` | None | `200` | All drugs |
| | `GET` | `/api/v1/pharmacy/drugs/low-stock` | None | `200` | Low stock (< reorderLevel) |
| | `POST` | `/api/v1/pharmacy/drugs` | `DrugRequest` | `201` | Add drug shipment |
| | `GET` | `/api/v1/pharmacy/prescriptions` | None | `200` | Prescriptions |
| | `POST` | `/api/v1/pharmacy/prescriptions` | `PrescriptionRequest` | `201` | Create Rx |
| | `POST` | `/api/v1/pharmacy/prescriptions/{id}/dispense` | Path variable | `200` | Dispense Rx |
| **Laboratory** | `GET` | `/api/v1/laboratory/catalog` | None | `200` | Catalog list |
| | `GET` | `/api/v1/laboratory/tests` | None | `200` | Test orders |
| | `POST` | `/api/v1/laboratory/tests` | `LabOrderRequest` | `201` | Order test |
| | `PATCH` | `/api/v1/laboratory/tests/{id}/status` | `{ status }` | `200` | Advance status |
| | `POST` | `/api/v1/laboratory/tests/{id}/results` | `LabResultRequest` | `200` | Submit test result |
| | `DELETE` | `/api/v1/laboratory/tests/{id}` | Path variable | `204` | Delete test |
| **Billing** | `GET` | `/api/v1/billing/invoices` | None | `200` | List invoices |
| | `GET` | `/api/v1/billing/invoices/{id}` | Path variable | `200` | Invoice details |
| | `POST` | `/api/v1/billing/invoices/generate` | `InvoiceGenerateRequest` | `201` | Aggregate invoice |
| | `POST` | `/api/v1/billing/invoices/{id}/settle` | `SettlementRequest` | `200` | Settle counter payment |
| **Payments** | `GET` | `/api/v1/payments/payhere/initiate` | `invoiceId` query param | `200` | Hash & checkout params |
| | `POST` | `/api/v1/payments/payhere/notify` | Form params (`order_id`, `md5sig`, etc.) | `200` | PayHere webhook IPN |

#### Critical Missing Endpoints Identified:
1. **No Authentication Endpoint**: No `/api/v1/auth/login` for JWT generation.
2. **No Dynamic Landing Page Endpoint**: No `/api/v1/landing/stats` or public overview endpoint for real data hydration.
3. **Billing Path Discrepancy**: E2E tests in `tests/e2e/tier1_features/billing.test.mjs` (Line 98) invoke `POST /api/v1/billing/settle` with `{ invoiceId, paymentMethod, amountPaid }`, while `BillingController.java` only exposes `POST /api/v1/billing/invoices/{id}/settle`.

### 1.8 Payment Gateway & Email Notification Code Status
- **PayHere Gateway**:
  - `backend/src/main/java/com/pulseos/config/PayHereConfig.java` has credentials, URLs, and sandbox flag.
  - `backend/src/main/java/com/pulseos/common/util/PayHereSecurityUtil.java` implements:
    - Checkout hash: `strtoupper(md5(merchant_id + order_id + formatted_amount + currency + strtoupper(md5(merchant_secret))))`
    - IPN verification: `strtoupper(md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + strtoupper(md5(merchant_secret))))`
  - `PaymentController.java` & `BillingService.java` handle checkout initiation and IPN webhook.
  - **Gap**: There is no direct mock endpoint allowing a test/frontend to execute an end-to-end mock PayHere payment simulation without constructing raw MD5 webhook payloads.
- **Email Notification Service**:
  - **Status**: COMPLETELY MISSING.
  - No `spring-boot-starter-mail` in `pom.xml`.
  - No `NotificationService` or `EmailService` in the entire codebase.
  - `AppointmentService.createAppointment()` does NOT dispatch any notification.
  - `BillingService.settleInvoice()` and `handlePayHereNotification()` do NOT dispatch payment receipts.

### 1.9 Build & Test Execution Status
- **Compilation**:
  - Command: `./backend/mvnw test-compile`
  - Output: `BUILD SUCCESS` (0.454s, zero compiler warnings or errors).
- **Backend Maven Tests**:
  - Command: `./backend/mvnw test`
  - Result: `BUILD FAILURE` (Tests run: 13, Failures: 2, Errors: 0, Skipped: 0).
  - Specific failures:
    1. `PulseOsApplicationTests.verifyPatientsAndDrugsSeeded:76`: `Expected size: 12 but was: 13`.
       - Cause: `DataSeeder.java` seeds 12 realistic patients + 1 dedicated demo patient `pDemo` ( Kasun Perera, NIC 199012345678), totalling 13 patients. The assertion was not updated when `pDemo` was added.
    2. `PulseOsApplicationTests.verifyClinicalEncountersAndInvoices:86`: `expected: 4L but was: 6L`.
       - Cause: `DataSeeder.java` seeds 4 encounter tests + 2 demo tests (`testDemoCompleted`, `testDemoProcessing`), totalling 6 lab tests. The assertion was not updated.
  - Other tests:
    - `PulseOsApplicationTests.contextLoads`: PASSED.
    - `PulseOsApplicationTests.verifyStaffAndDepartmentsSeeded`: PASSED.
    - `PersistenceEmpiricalChallengeTest$TablePerTypeInheritanceTests` (3 tests): PASSED.
    - `PersistenceEmpiricalChallengeTest$DataSeederIdempotencyTests` (2 tests): PASSED.
    - `PersistenceEmpiricalChallengeTest$DoubleBookingConstraintTests` (4 tests): PASSED.
- **End-to-End Test Suite**:
  - Command: `bash tests/e2e/run_tests.sh --mock`
  - Result: `TOTAL 70 / 70 PASSED` (100% success rate across Tier 1 Features, Tier 2 Boundaries, Tier 3 Combinations, Tier 4 Real-World Scenarios in 0.14s).

---

## 2. Logic Chain

1. **Premise 1 (Requirement R2 Domain Modeling & Package Structure)**:
   - *Observation*: All controllers, DTOs, entities, repositories, and services currently reside in flat horizontal layers (`com.pulseos.controller`, `com.pulseos.dto`, etc.).
   - *Reasoning*: This violates DDD bounded context principles and creates tight coupling where any entity change touches multiple global packages.
   - *Inference*: The project must be restructured by domain bounded context (`com.pulseos.patient`, `com.pulseos.doctor`, `com.pulseos.appointment`, `com.pulseos.pharmacy`, `com.pulseos.billing`, `com.pulseos.laboratory`, `com.pulseos.notification`, `com.pulseos.security`, `com.pulseos.landing`, `com.pulseos.common`).

2. **Premise 2 (Requirement R2 DTO Cleansing)**:
   - *Observation*: Every DTO class contains duplicate synonyms (`dob` & `dateOfBirth`, `nicPassport` & `nicPassportNo`, `id` & `personId` & `patientId`, `licenseNumber` & `licenseNo` & `doctorLicenseNo`, etc.) with manual fallback getters.
   - *Reasoning*: These dual fields exist because frontend and test payloads historically used divergent property names. This makes the domain model chaotic and error-prone.
   - *Inference*: Each DTO should be rewritten into a clean canonical Java record or class with exactly one field per conceptual attribute. Jackson annotations (`@JsonProperty` / `@JsonAlias`) should be used where necessary to maintain contract compatibility with existing E2E test suites while achieving zero field duplication in Java source definitions.

3. **Premise 3 (Requirement R2 Real Backend-Enforced RBAC)**:
   - *Observation*: `SecurityConfig.java` has `.anyRequest().permitAll()`, no JWT dependencies exist in `pom.xml`, and the frontend relies on a mock station switcher dropdown in `RoleContext.tsx`.
   - *Reasoning*: Anyone can currently spoof any identity or call any endpoint without a token.
   - *Inference*:
     1. Add JJWT dependencies to `pom.xml`.
     2. Create `com.pulseos.security` with `JwtTokenProvider`, `JwtAuthenticationFilter`, and `AuthController` (exposing `/api/v1/auth/login`).
     3. Update `SecurityConfig` to require authenticated tokens with specific role authorities (`hasRole('DOCTOR')`, etc.) for restricted clinical actions, while permitting public endpoints (`/api/v1/auth/**`, `/api/v1/health`, `/api/v1/landing/**`, `/api/v1/payments/payhere/notify`, `/h2-console/**`).

4. **Premise 4 (Requirement R4 Integrations - PayHere & Email)**:
   - *Observation*: PayHere has cryptographic hashing and IPN handling, but no direct mock transaction completion endpoint. Email notifications are completely non-existent.
   - *Reasoning*: To satisfy acceptance criteria ("A mock PayHere transaction completes successfully and updates the database", "Booking an appointment triggers an email notification pipeline"), the backend needs:
     1. A mock payment completion flow (or simulated IPN trigger).
     2. A dedicated `NotificationService` triggered synchronously or asynchronously upon `AppointmentService.createAppointment()` and `BillingService.settleInvoice()`.

5. **Premise 5 (Requirement R2 Dynamic Landing Page)**:
   - *Observation*: There is no public landing page endpoint in the backend.
   - *Reasoning*: Acceptance criteria requires landing page to fetch real data from backend rather than hardcoded arrays.
   - *Inference*: Add `LandingPageController` exposing `GET /api/v1/landing/stats` returning aggregated counts (doctors, active departments, satisfied patients, services catalog).

6. **Premise 6 (Test Suite Integrity)**:
   - *Observation*: Maven unit tests fail 2 assertions solely due to outdated hardcoded expected counts (12 vs 13 patients, 4 vs 6 lab tests) caused by demo seed data.
   - *Reasoning*: The core persistence logic is sound (as proven by 9 passing challenge tests). Correcting the test assertions or seed filtering immediately restores a 100% green Maven build.

---

## 3. Caveats

1. **E2E Test Suite Auth Bypass**:
   The existing 70 tests in `tests/e2e` do not currently supply `Authorization: Bearer <token>` headers because they were developed against the `permitAll()` baseline. When introducing backend-enforced RBAC, the E2E test client (`tests/e2e/utils/http_client.mjs`) must either acquire a token via `/api/v1/auth/login` on startup, or the backend must support a test/demo header/profile so the 70 existing validation tests continue to pass seamlessly.
2. **Database Persistence Scope**:
   In `demo` profile, H2 is purely in-memory (`jdbc:h2:mem:pulseos_db`). Any data written is lost on server restart. In `mysql` profile, MySQL must be running locally on port 3306 with credentials `root`/`root`. Both profiles are supported via Spring profile configuration.
3. **No Code Modified**:
   In accordance with the explorer role guidelines, no source code files were modified during this investigation.

---

## 4. Conclusion & Actionable Recommendations

### Summary of Architectural Deficiencies
1. **Packaging**: Flat layered package structure instead of DDD bounded contexts.
2. **DTOs**: Excessive duplicate fields and manual alias resolution methods across all 6 DTO files.
3. **Security**: Zero backend authentication or RBAC enforcement (`permitAll()`); client-side station switcher.
4. **Email Pipeline**: Missing entirely from dependencies and business logic.
5. **PayHere Integration**: Needs a clean mock checkout completion endpoint.
6. **Landing Page**: Needs a public `/api/v1/landing/stats` API.
7. **Test Assertions**: Two outdated count assertions in `PulseOsApplicationTests.java`.

### Proposed DDD Package Blueprint

```
com.pulseos/
├── common/                  # Shared base entity (Person), exceptions, ApiResponse
├── config/                  # H2TcpServerConfig, WebConfig, Cors
├── security/                # JWT Provider, AuthFilter, SecurityConfig, AuthController, AuthService
├── notification/            # EmailNotificationService, NotificationRecord
├── landing/                 # LandingPageController, LandingService, LandingStatsDTO
├── patient/                 # Patient, PatientAdmission, Ward, PatientRepository, PatientService, PatientController, PatientDTOs
├── doctor/                  # Doctor, DoctorSchedule, DoctorRepository, DoctorService, DoctorController, DoctorDTOs
├── appointment/             # Appointment, AppointmentRepository, AppointmentService, AppointmentController, AppointmentDTOs
├── pharmacy/                # Drug, Prescription, Dispensation, Repositories, PharmacyService, PharmacyController, PharmacyDTOs
├── laboratory/              # LabTest, LabTestCatalog, Repositories, LaboratoryService, LaboratoryController, LabDTOs
├── billing/                 # Invoice, PaymentTransaction, Repositories, BillingService, PaymentController, BillingDTOs, PayHere
└── seeder/                  # DataSeeder
```

### Actionable Implementation Steps for Next Phases
1. **Dependencies**: Add `jjwt-api`, `jjwt-impl`, `jjwt-jackson` to `pom.xml`.
2. **DTO Refactoring**: Replace redundant fields in all DTOs with canonical single-source-of-truth fields.
3. **DDD Migration**: Move domain entities, repositories, services, controllers, and clean DTOs into their respective bounded-context packages.
4. **RBAC & Security**:
   - Implement `JwtTokenProvider` generating tokens with role claims.
   - Implement `/api/v1/auth/login` for both staff (roles: `DOCTOR`, `RECEPTIONIST`, `PHARMACIST`, `LAB_TECHNICIAN`, `CASHIER_ADMIN`) and patients (`PATIENT`).
   - Implement `JwtAuthenticationFilter` and secure restricted endpoints in `SecurityConfig`.
5. **Email Notification Service**:
   - Create `EmailNotificationService` logging / queueing confirmation emails on appointment bookings and payment receipts.
   - Hook into `AppointmentService.createAppointment()` and `BillingService.settleInvoice()`.
6. **Payment Gateway Mock Flow**:
   - Add `/api/v1/payments/payhere/mock-success` or support simulated IPN triggers.
   - Ensure both `/api/v1/billing/settle` and `/api/v1/billing/invoices/{id}/settle` are supported.
7. **Landing Page Endpoint**:
   - Create `GET /api/v1/landing/stats` providing live aggregate numbers for the frontend clean-slate landing page.
8. **Fix Test Assertions**:
   - Update `PulseOsApplicationTests.java` lines 76 and 86 to reflect the actual seeded demo entities (13 patients, 6 lab tests).

---

## 5. Verification Method

To independently verify the observations made in this report:

1. **Verify Backend Compilation**:
   ```bash
   cd /Users/admin/Projects/honda_leda/backend
   ./mvnw test-compile
   ```
   *Expected Result*: `BUILD SUCCESS`.

2. **Verify Existing Backend Unit Tests & Assertion Failures**:
   ```bash
   cd /Users/admin/Projects/honda_leda/backend
   ./mvnw test
   ```
   *Expected Result*: Fails with 2 errors in `PulseOsApplicationTests` (`verifyPatientsAndDrugsSeeded` expected 12 got 13; `verifyClinicalEncountersAndInvoices` expected 4 got 6), while all 9 tests in `PersistenceEmpiricalChallengeTest` pass.

3. **Verify E2E Test Suite**:
   ```bash
   cd /Users/admin/Projects/honda_leda
   bash tests/e2e/run_tests.sh --mock
   ```
   *Expected Result*: 70/70 tests pass across all 4 tiers in <0.2s.

4. **Verify Security Absence**:
   Inspect `backend/src/main/java/com/pulseos/config/SecurityConfig.java` lines 31-37 to confirm `anyRequest().permitAll()`.

5. **Verify Chaotic DTOs**:
   Inspect `backend/src/main/java/com/pulseos/dto/PatientDTOs.java` lines 15-47 and 55-81 to confirm duplicate `dob`/`dateOfBirth`, `nicPassport`/`nicPassportNo`, `id`/`personId`/`patientId` declarations.

6. **Verify Missing Email & Notification Service**:
   ```bash
   grep -ri "notification" /Users/admin/Projects/honda_leda/backend/src/main/java
   grep -ri "mail" /Users/admin/Projects/honda_leda/backend/pom.xml
   ```
   *Expected Result*: Zero occurrences found.
