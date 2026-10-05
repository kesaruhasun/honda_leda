# Survey Investigation Handoff Report: Security, Integrations, and Architecture

**Agent**: `teamwork_preview_explorer_survey_3` (Security & Integrations Explorer)  
**Date**: 2026-10-04  
**Project**: PulseOS Hospital Management System (`/Users/admin/Projects/honda_leda`)  
**Scope**: Step 0 Survey — Security & Authentication, Vulnerability Audit, PayHere Integration, Email Notifications, File Organization, and Requirements Inventory.

---

## 1. Observation

Direct observations from source code, configuration files, and terminal executions across the repository:

### 1.1 Security & Authentication Observations
1. **Spring Security Configuration**:
   - `backend/src/main/java/com/pulseos/config/SecurityConfig.java` (lines 22-38):
     ```java
     http
         .cors(cors -> cors.configurationSource(corsConfigurationSource()))
         .csrf(csrf -> csrf
             .ignoringRequestMatchers("/h2-console/**", "/db-console/**", "/api/**", "/api/v1/**")
             .disable()
         )
         .headers(headers -> headers
             .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin)
         )
         .authorizeHttpRequests(auth -> auth
             .requestMatchers("/h2-console/**", "/db-console/**").permitAll()
             .requestMatchers("/api/**").permitAll()
             .requestMatchers("/api/v1/**").permitAll()
             .requestMatchers("/error").permitAll()
             .anyRequest().permitAll()
         );
     ```
   - Every single endpoint under `/api/**`, `/api/v1/**`, and `anyRequest()` is explicitly configured with `permitAll()`.
   - CSRF is disabled globally.
   - Session creation policy is unconfigured (defaults to stateful session creation rather than `SessionCreationPolicy.STATELESS`).

2. **Absence of JWT Stack**:
   - `backend/pom.xml`: No JWT dependency is declared (no `io.jsonwebtoken:jjwt-api`, `jjwt-impl`, `jjwt-jackson`, `com.auth0:java-jwt`, or `spring-boot-starter-oauth2-resource-server`).
   - `backend/src`: Grep searches for `jwt` and `token` across `backend/src` returned **zero** matches.
   - There is no `JwtAuthenticationFilter`, no token parser, no claims validator, and no `AuthenticationManager`.
   - `backend/src/main/resources/application.yml`: Contains zero JWT properties (no secret, no token expiry, no issuer configuration).

3. **Absence of Method-Level Security & Role Enforcement**:
   - Grep searches for `@PreAuthorize`, `@Secured`, `@RolesAllowed`, and `hasRole` across `backend/src` returned **zero** matches.
   - None of the 8 controllers (`HealthCheckController`, `PatientController`, `DoctorController`, `AppointmentController`, `PharmacyController`, `BillingController`, `PaymentController`, `LaboratoryController`) enforce user identity or roles.

4. **Insecure Frontend Authentication & Client-Side Station Switcher**:
   - `frontend/src/views/auth/StaffLoginView.tsx` (lines 25-34):
     ```typescript
     const u = username.toLowerCase().trim();
     let roleToSet: UserRole = 'RECEPTIONIST';
     if (u.includes('admin')) roleToSet = 'CASHIER_ADMIN';
     else if (u.includes('doc')) roleToSet = 'DOCTOR';
     else if (u.includes('pharm')) roleToSet = 'PHARMACIST';
     else if (u.includes('lab')) roleToSet = 'LAB_TECHNICIAN';
     else if (u.includes('rec')) roleToSet = 'RECEPTIONIST';
     else roleToSet = 'CASHIER_ADMIN';

     setRole(roleToSet);
     ```
     Staff login does not contact the backend. Any user entering a username containing the substring `"admin"` is instantly granted `CASHIER_ADMIN` privileges in local state. Passwords are never validated.
   - `frontend/src/views/auth/PatientLoginView.tsx` (lines 32-49):
     ```typescript
     const res = await patientApi.getByNic(nic.trim());
     if (res.data) {
       patientData = res.data;
     }
     ...
     setPatientSession(patientData);
     ```
     Patient login performs an unauthenticated `GET /api/v1/patients/nic/{nic}` lookup. The submitted password parameter is completely discarded. Anyone who knows a patient's NIC can log in without a password.
   - `frontend/src/components/layout/Sidebar.tsx` (lines 142-205):
     Contains an `"Admin Station Switcher"` dropdown that renders when `currentRole === 'CASHIER_ADMIN'`. Clicking any entry calls `handleRoleChange(roleKey as UserRole)`, mutating React state `currentRole` in `RoleContext.tsx` without server interaction or token reissuance.
   - `frontend/src/components/layout/Layout.tsx` (lines 25-36) and `frontend/src/context/RoleContext.tsx` (line 70):
     `currentRole` defaults to `'RECEPTIONIST'`. Direct navigation to `/dashboard` renders the dashboard with full staff access without any authentication.
   - `frontend/src/services/api.ts` (lines 14-21):
     Axios instance has no request interceptor attaching `Authorization: Bearer <token>`.

5. **Entity Password Storage**:
   - `backend/src/main/java/com/pulseos/entity/Patient.java` (line 48):
     `@Column(name = "password", length = 100) private String password;` (stored unhashed/plaintext).
   - `backend/src/main/java/com/pulseos/seeder/DataSeeder.java` (line 87 & line 284):
     `pDemo.setPassword("password");` (plaintext password seeded).
     `docKavinda.setPasswordHash("$2a$10$7R6vD8xPulseOSHashKavinda2026");` (dummy, non-standard bcrypt salt).

---

### 1.2 PayHere Payment Gateway Observations
1. **Existing Backend Implementation**:
   - `backend/src/main/java/com/pulseos/config/PayHereConfig.java`: Configures `merchantId`, `merchantSecret`, `checkoutUrl`, `notifyUrl`, `returnUrl`, `cancelUrl`, `currency` via `pulseos.payhere` properties in `application.yml`.
   - `backend/src/main/java/com/pulseos/common/util/PayHereSecurityUtil.java`:
     - Implements `generatePaymentHash(orderId, amount, currency)` using formula:
       `strtoupper(md5(merchant_id + order_id + formatted_amount + currency + strtoupper(md5(merchant_secret))))`
     - Implements `verifyWebhookSignature(orderId, payhereAmount, payhereCurrency, statusCode, receivedMd5Sig)` using formula:
       `strtoupper(md5(merchant_id + order_id + payhereAmount + payhereCurrency + statusCode + strtoupper(md5(merchant_secret))))`
   - `backend/src/main/java/com/pulseos/controller/PaymentController.java`:
     - `GET /api/v1/payments/payhere/initiate?invoiceId={id}`: Generates checkout parameters and MD5 hash.
     - `POST /api/v1/payments/payhere/notify`: Receives IPN form parameters (`merchant_id`, `order_id`, `payhere_amount`, `payhere_currency`, `status_code`, `md5sig`).
   - `backend/src/main/java/com/pulseos/service/BillingService.java` (lines 193-224):
     - Validates MD5 signature via `payHereSecurityUtil.verifyWebhookSignature`.
     - When `statusCode.equals("2")`, transitions `Invoice` paymentStatus to `PaymentStatus.PAID` and creates a `PaymentTransaction` with `PaymentMethod.PAYHERE_GATEWAY`.
2. **Current Gaps & Frontend Disconnect**:
   - `BillingService.java` does not handle negative status codes (`-1` CANCELLED, `-2` FAILED, `-3` CHARGEDBACK, `0` PENDING). Non-success IPNs are silently ignored.
   - In `frontend/src/views/PatientPortalView.tsx` (lines 337-351):
     When the user clicks "Authorize Payment", the UI bypasses `/payments/payhere/initiate` and directly calls `billingApi.settleCashCard(invoice.id, 'CARD', ...)` or mutates `localStorage` directly (`local_invoices_${patientSession.id}`). The real checkout flow is not connected in the UI.

---

### 1.3 Email Notification Observations
1. **Complete Absence in Backend**:
   - `backend/pom.xml`: Does NOT contain `spring-boot-starter-mail`.
   - `backend/src/main/resources/application.yml`: Contains zero mail configuration (`spring.mail.*`).
   - Grep search for `mail` across `backend/src` found only entity `email` string fields. There is no `JavaMailSender`, no `EmailService`, no `@Async` email worker, no notification events (`AppointmentCreatedEvent`, `PaymentReceiptEvent`), and no email templates.
2. **Trigger Points Identified**:
   - Trigger Point 1: `AppointmentService.java:86` (`createAppointment`): Appointment saved without publishing event or notifying patient/doctor.
   - Trigger Point 2: `BillingService.java:139` (`settleInvoice`) & `BillingService.java:220` (`handlePayHereNotification`): Payment recorded without dispatching receipt email.

---

### 1.4 Codebase Layout & File Organization Observations
1. **Disk Bloat & Redundant Folders**:
   - `frontend_backup_legacy/`: 451 MB untracked legacy folder containing a duplicate React project and complete `node_modules/`.
   - `dist_modules/`: 772 KB containing student assignment zips (`M1_Patient_Management_IT25103819.zip`, etc.) and unzipped module folders.
   - Root `node_modules/`: 4 KB folder with root `package.json` and `pnpm-lock.yaml`, conflicting with frontend workspace.
2. **Stray Files in Project Root**:
   - `2026-Y2-S1-KU-60.docx` (1.4 MB): Word document placed directly in the repository root.
   - `PulseOS_ClassDiagram.drawio` (18 KB): DrawIO diagram in root (separate from `docs/PulseOS_EER_Diagram.drawio`).
   - `fix_diagram.py` (1.2 KB): Ad-hoc Python script modifying XML coordinates in root.
   - `backend/generate_service_diagram.py` (1.8 KB): Ad-hoc script in `backend/` generating Mermaid diagram syntax.
   - `backend/backend.log` (14 KB): Committed application log file in backend root.
   - `TEST_INFRA.md` (16 KB) & `TEST_READY.md` (16 KB): Test documentation residing at root instead of `docs/`.
   - `.DS_Store`: Unignored binary files in root and `frontend/`.
3. **Backend Package Architecture Violations**:
   - Current structure is monolithic "package-by-layer":
     - `com.pulseos.controller` (all 8 controllers)
     - `com.pulseos.dto` (`PatientDTOs.java`, `DoctorDTOs.java`, `AppointmentDTOs.java`, `BillingDTOs.java`, `LabDTOs.java`, `PharmacyDTOs.java`)
     - `com.pulseos.entity` (all 28 entities in a single flat package)
     - `com.pulseos.repository` (all 22 repositories)
     - `com.pulseos.service` (all services)
   - Redundant fields in DTOs:
     - `PatientDTOs.java`: `nicPassport` & `nicPassportNo`, `phoneNumber` & `contactNumber`, `dateOfBirth` & `dob`, `id` & `personId` & `patientId`.
     - `DoctorDTOs.java`: `licenseNumber`, `licenseNo`, & `doctorLicenseNo`, `phoneNumber` & `contactNumber`, `id` & `employeeId`.
     - `AppointmentDTOs.java`: `startTime` & `appointmentTime`, `symptomsReason` & `reasonForVisit`, `id` & `appointmentId`.

---

### 1.5 Testing Harness Observations
1. **Automated Test Execution**:
   - Running `npm run test:e2e` executes 70 tests in 0.12s against an embedded mock server (`tests/e2e/mock_server.mjs`). All 70 tests pass.
   - Running `./mvnw test-compile` succeeds in 0.55s.
   - Backend contains a single JUnit test: `PersistenceEmpiricalChallengeTest.java`.
2. **Auth Invariant in Existing E2E Tests**:
   - `tests/e2e/utils/http_client.mjs` issues requests without an `Authorization` header.
   - Zero tests in `tests/e2e` send `Bearer` tokens. If Spring Boot endpoints are secured without either a bypass mechanism in the mock server / live server test configuration or an auth helper in `http_client.mjs`, all live E2E tests will fail with HTTP 401.

---

## 2. Logic Chain

1. **Premise 1 (Backend Exposure)**: Because `SecurityConfig.java` defines `.anyRequest().permitAll()` and lacks JWT validation filters or `@PreAuthorize` annotations (Observation 1.1), any HTTP client can read and mutate hospital data (patients, doctors, appointments, pharmacy inventory, lab results, invoices) without authentication.
2. **Premise 2 (Client-Side Auth Illusion)**: Because `StaffLoginView.tsx` and `PatientLoginView.tsx` perform authentication solely via client-side string matching and unauthenticated lookups (Observation 1.1.4), and `Sidebar.tsx` allows switching roles by mutating client-side React state, the application provides zero authorization guarantees. Any user can claim god-mode `CASHIER_ADMIN` status or access any patient record.
3. **Premise 3 (Insecure Data Storage)**: Storing patient passwords as plaintext strings in `Patient.java` (Observation 1.1.5) violates basic security standards and privacy regulations (HIPAA/GDPR/data protection norms).
4. **Premise 4 (PayHere Readiness & Gap)**: The cryptographic hashing and IPN verification logic in `PayHereSecurityUtil.java` is mathematically sound and compliant with PayHere specifications (Observation 1.2.1). However, because `PatientPortalView.tsx` bypasses the initiate API and calls counter cash settlement directly (Observation 1.2.2), and `BillingService` ignores non-2 status codes, the end-to-end user payment flow is disconnected.
5. **Premise 5 (Email Pipeline Requirement)**: Because `pom.xml` lacks `spring-boot-starter-mail` and no mail beans or async workers exist (Observation 1.3), requirements R4 and acceptance criterion "Booking an appointment triggers an email notification pipeline" cannot currently be fulfilled without adding the dependency, configuring mock/real mail senders, and dispatching events upon appointment booking and invoice payment.
6. **Premise 6 (File Bloat & Architecture Violation)**: The existence of `frontend_backup_legacy/` (451MB), root docx/scripts/logs, and DTO redundant fields (`dob` vs `dateOfBirth`) violates R2 (Backend Domain Modeling) and R5 (File Organization).
7. **Premise 7 (Test Compatibility Constraint)**: Because the 70 existing E2E tests send unauthenticated HTTP requests (Observation 1.5.2), introducing backend JWT security requires providing either an authentication helper in the test suite, configuring mock server parity, or introducing role-aware test tokens so live E2E runs remain green.

---

## 3. Caveats

1. **Live PayHere Sandbox Credentials**: The current configuration uses dummy sandbox merchant credentials (`1220000` / `sandbox_secret_sliit_pulseos_2026`). Real payments require valid PayHere merchant credentials. The mock testing strategy must continue to support offline validation.
2. **SMTP Infrastructure**: In a local/demo environment, external SMTP servers (e.g. Gmail/SendGrid) may fail due to firewall or missing credentials. The email pipeline must provide an in-memory/logger mock fallback (`MockEmailService`) that logs sent emails to console/memory while allowing seamless switch to `JavaMailSender` when SMTP is configured.
3. **Scope Discipline**: As an explorer, no modifications have been made to source code. Recommendations below are architectural designs for the implementation agents.

---

## 4. Conclusion & Actionable Design Recommendations

### 4.1 RBAC & JWT Security Architecture
1. **Dependencies**:
   Add to `backend/pom.xml`:
   ```xml
   <dependency>
       <groupId>io.jsonwebtoken</groupId>
       <artifactId>jjwt-api</artifactId>
       <version>0.12.5</version>
   </dependency>
   <dependency>
       <groupId>io.jsonwebtoken</groupId>
       <artifactId>jjwt-impl</artifactId>
       <version>0.12.5</version>
       <scope>runtime</scope>
   </dependency>
   <dependency>
       <groupId>io.jsonwebtoken</groupId>
       <artifactId>jjwt-jackson</artifactId>
       <version>0.12.5</version>
       <scope>runtime</scope>
   </dependency>
   ```
2. **JWT Claims Specification**:
   - `sub`: Principal identifier (`email` for staff, `nicPassportNo` for patients).
   - `userId`: Long ID of the Person record.
   - `role`: Role string (`DOCTOR`, `RECEPTIONIST`, `PHARMACIST`, `LAB_TECHNICIAN`, `MANAGER` / `ADMIN`, `PATIENT`).
   - `authorities`: Array formatted as `["ROLE_DOCTOR"]`, `["ROLE_PATIENT"]`, etc.
   - `userType`: `"STAFF"` or `"PATIENT"`.
   - `fullName`: Display name for client convenience.
3. **Password Security**:
   - Configure `BCryptPasswordEncoder` bean.
   - Hash all passwords on patient registration and employee creation.
   - Update `DataSeeder.java` to seed valid BCrypt hashes for demo users.
4. **Spring Security Configuration**:
   - Enable `@EnableMethodSecurity(prePostEnabled = true)`.
   - Add `JwtAuthenticationFilter` before `UsernamePasswordAuthenticationFilter`.
   - Configure `SessionCreationPolicy.STATELESS`.
   - Permit public endpoints:
     - `/api/v1/auth/**` (login, register)
     - `/api/v1/public/**` (landing page stats, physician directory)
     - `/api/v1/payments/payhere/notify` (gateway webhook; secured via PayHere MD5 signature)
     - `/h2-console/**`, `/db-console/**`, `/error`
   - Enforce authentication on all other `/api/v1/**` endpoints.
5. **Frontend Security**:
   - Remove the client-side station switcher dropdown from `Sidebar.tsx`.
   - Store JWT in `localStorage` or secure session storage upon login via `/api/v1/auth/login`.
   - Attach JWT in Axios request interceptor: `Authorization: Bearer <token>`.
   - Implement React Route Guards (`ProtectedRoute`) that decode JWT claims or check auth state; redirect unauthenticated users to login.

---

### 4.2 PayHere Gateway Integration Architecture
1. **API Endpoints**:
   - `GET /api/v1/payments/payhere/initiate?invoiceId={id}`: Generates checkout parameters, order ID, formatted amount (`0.00`), currency (`LKR`), notify URL, and MD5 signature.
   - `POST /api/v1/payments/payhere/notify`: Validates `md5sig`. Handles status transitions:
     - `2` (SUCCESS): Invoice `PAID`, create `PaymentTransaction` (`PAYHERE_GATEWAY`, status `SUCCESS`), publish `PaymentCompletedEvent`.
     - `-1` (CANCELLED): Log cancellation, set transaction status `CANCELLED`.
     - `-2` (FAILED): Log failure, set transaction status `FAILED`.
2. **Frontend Checkout Flow**:
   - On Patient Portal / Billing view: User selects "Pay with PayHere".
   - Frontend calls `billingApi.initiatePayHere(invoiceId)`.
   - Frontend renders the PayHere checkout form / modal, submitting parameters to PayHere Sandbox (`https://sandbox.payhere.lk/pay/checkout`) or triggering a sandbox mock completion in test/demo mode that calls the notify endpoint.

---

### 4.3 Email Notification Pipeline Architecture
1. **Dependencies**:
   Add to `backend/pom.xml`:
   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-mail</artifactId>
   </dependency>
   ```
2. **Pipeline Components**:
   - `@EnableAsync` configured on main application or async config.
   - `EmailService` interface with methods:
     - `sendAppointmentConfirmation(Appointment appointment)`
     - `sendPaymentReceipt(PaymentTransaction payment, Invoice invoice)`
   - `RealEmailService` (using `JavaMailSender`) and `MockEmailService` (console/memory logging for zero-config offline environments), selected via property `pulseos.mail.enabled`.
   - Domain Events:
     - `AppointmentCreatedEvent` published in `AppointmentService.createAppointment`.
     - `PaymentCompletedEvent` published in `BillingService` upon invoice settlement or PayHere IPN success.
   - Async Event Listeners:
     - `@Async` `@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)` listeners that invoke `EmailService` without blocking HTTP response threads.

---

### 4.4 File Organization & Cleanup Plan
Using the `file-organizer` skill principles:
1. **Remove / Archive Disk Bloat**:
   - Delete or move `frontend_backup_legacy/` (frees 451 MB of disk space).
   - Relocate `dist_modules/` to `docs/archive/dist_modules/` or clean up unneeded zips.
2. **Clean Project Root**:
   - Move `2026-Y2-S1-KU-60.docx` to `docs/`.
   - Move `PulseOS_ClassDiagram.drawio` to `docs/`.
   - Move `fix_diagram.py` and `backend/generate_service_diagram.py` to `scripts/` or `docs/scripts/`.
   - Move `TEST_INFRA.md` and `TEST_READY.md` to `docs/testing/`.
   - Remove `backend/backend.log` and ensure `*.log` is respected in `.gitignore`.
   - Remove untracked root `node_modules/` if root is not a workspace.
3. **Backend DDD Restructuring**:
   Refactor package-by-layer into package-by-feature:
   - `com.pulseos.auth` (AuthController, JwtTokenProvider, JwtAuthFilter, AuthService, AuthDTOs)
   - `com.pulseos.patient` (Patient, PatientController, PatientService, PatientRepository, PatientDTO)
   - `com.pulseos.doctor` (Doctor, DoctorSchedule, DoctorController, DoctorService, etc.)
   - `com.pulseos.appointment` (Appointment, AppointmentController, AppointmentService, etc.)
   - `com.pulseos.billing` (Invoice, PaymentTransaction, BillingController, BillingService, etc.)
   - `com.pulseos.payment` (PayHereConfig, PayHereSecurityUtil, PaymentController)
   - `com.pulseos.pharmacy` (Drug, Prescription, PharmacyController, PharmacyService, etc.)
   - `com.pulseos.lab` (LabTest, LabTestCatalog, LaboratoryController, etc.)
   - `com.pulseos.notification` (EmailService, EmailListener, EmailTemplates)
   - `com.pulseos.common` (Exceptions, Base Entities, Shared DTOs)
   - Eliminate all duplicate fields in DTOs (keep canonical `nicPassportNo`, `contactNumber`, `dateOfBirth`, `consultationFee`, `appointmentTime`, `reasonForVisit`).

---

### 4.5 Inventory & Acceptance Criteria Verification Matrix

| Requirement | Current Status | Root Cause | Proposed Solution | Acceptance Criteria Met? |
| :--- | :--- | :--- | :--- | :--- |
| **R1: Clean Slate UI** | ❌ Has `.apple-btn` slop, monolithic `PatientPortalView` (2,155 lines) | Legacy code from prototype | Rebuild with `tailadmin-ui`, `ui-ux-pro-max`, modular role dashboards | Pending implementation |
| **R2: Backend DDD** | ❌ Package-by-layer, duplicated DTO fields | Ad-hoc student integration | Reorganize into feature packages; unify DTO fields | Pending implementation |
| **R2: Secure RBAC** | ❌ No JWT, `permitAll()`, station switcher in UI | No backend security implemented | Add JJWT, JWT filter, `@PreAuthorize`, route guards, remove station switcher | [ ] Restricted role dashboard fails without JWT |
| **R2: Dynamic Landing** | ❌ Hardcoded arrays | Static data in `LandingView.tsx` | Wire landing page to real backend stats/doctor endpoints | Pending implementation |
| **R3: Appointment Calendar** | ❌ Flat list / basic date input | Incomplete calendar UI | Implement interactive role-based calendar grid | [ ] Calendar renders by role permissions |
| **R4: PayHere Gateway** | ⚠️ Backend crypto exists; frontend disconnected | UI mocks payment via `settleCashCard` | Wire PayHere initiate + notify flow, handle all status codes | [ ] Mock PayHere transaction completes and updates DB |
| **R4: Email Notifications** | ❌ Completely missing | No mail dependency or service | Add `spring-boot-starter-mail`, async event pipeline, mock/real email service | [ ] Booking appointment triggers email notification |
| **R5: File Organization** | ❌ 451MB legacy backup, root docx/scripts | Uncleaned repository artifacts | Restructure root, delete backup, organize docs/scripts | Pending implementation |

---

## 5. Verification Method

To independently reproduce and verify the findings:

1. **Verify Security Absence**:
   ```bash
   # Check pom.xml for JWT dependencies
   grep -i "jwt" /Users/admin/Projects/honda_leda/backend/pom.xml
   # Result: Empty (no JWT library)

   # Check SecurityConfig.java for permitAll
   grep -n "permitAll" /Users/admin/Projects/honda_leda/backend/src/main/java/com/pulseos/config/SecurityConfig.java
   # Result: Lines 32-37 show all endpoints permitted

   # Check controllers for security annotations
   grep -rn "PreAuthorize" /Users/admin/Projects/honda_leda/backend/src/
   # Result: No matches
   ```

2. **Verify Client-Side Station Switcher & Insecure Login**:
   - Inspect `frontend/src/views/auth/StaffLoginView.tsx` lines 25-34 (shows username substring match).
   - Inspect `frontend/src/views/auth/PatientLoginView.tsx` lines 32-49 (shows password omitted).
   - Inspect `frontend/src/components/layout/Sidebar.tsx` lines 142-205 (shows station switcher UI).

3. **Verify Email Pipeline Absence**:
   ```bash
   # Check pom.xml for mail starter
   grep -i "mail" /Users/admin/Projects/honda_leda/backend/pom.xml
   # Result: Empty
   ```

4. **Verify File Organization Flaws & Disk Usage**:
   ```bash
   # Check directory sizes
   du -sh /Users/admin/Projects/honda_leda/frontend_backup_legacy
   # Result: 451MB
   ls -la /Users/admin/Projects/honda_leda/2026-Y2-S1-KU-60.docx
   # Result: 1.4MB Word document in root
   ```

5. **Verify E2E Test Suite Execution**:
   ```bash
   npm run test:e2e
   # Result: 70/70 tests pass in ~0.12s against mock server
   ```

6. **Invalidation Conditions**:
   - If `backend/pom.xml` already contained `jjwt` and `spring-boot-starter-mail`, this report would be invalid (verified: both are absent).
   - If controllers enforced `@PreAuthorize`, the vulnerability assessment would be invalid (verified: zero annotations found).
