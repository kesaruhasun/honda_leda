# Production-Grade Role-Based Access Control (RBAC) & UI Integration Handoff

## Executive Summary
This implementation completes a production-grade Spring Security + JWT authentication and authorization infrastructure for PulseOS, enforces strict Role-Based Access Control (RBAC) boundaries between Doctors and Admins, resolves missing UI integrations (real password input, BCrypt persistence, and schedule rosters), and connects all frontend auth portals to backend security endpoints.

---

## 1. Audit & Gap Analysis Findings

### UI Integration Gaps Identified & Resolved:
1. **Unbound Password Input in Patient Signup (`PatientSignupView.tsx`)**:
   - The password input field lacked `value={formData.password}` and `onChange={handleInputChange}`.
   - Password was omitted from initial state and the creation payload.
   - *Fix*: Added `password` to state, bound input handlers, and routed signup through `POST /api/v1/auth/patient-signup`.
2. **Mock Authentication in Staff Login (`StaffLoginView.tsx`)**:
   - Authentication used client-side `setTimeout` with username substring matching without contacting any backend.
   - *Fix*: Replaced mock code with `authApi.staffLogin({ username, password })`, storing real JWT tokens and setting authenticated roles.
3. **Password Bypass in Patient Login (`PatientLoginView.tsx`)**:
   - Patient login checked only `patientApi.search(nic)` and ignored the entered password completely.
   - *Fix*: Routed login through `authApi.patientLogin({ nicPassportNo, password })`, storing the issued JWT token.
4. **Hardcoded Doctor Schedule Roster (`DoctorView.tsx`)**:
   - The "Roster Schedule" modal rendered static days (Monday, Wednesday, Friday, Saturday).
   - *Fix*: Wired to `doctorApi.getSchedules(doc.id)` with dynamic schedule display and 403 Forbidden handling for cross-doctor schedule violations.
5. **Missing Frontend Authorization Header**:
   - `api.ts` lacked a Bearer token interceptor, resulting in 401s on protected backend endpoints.
   - *Fix*: Added an Axios request interceptor injecting `Authorization: Bearer <token>` from `localStorage` / `sessionStorage`.

---

## 2. Backend Security & RBAC Implementation

### Key Components:
- **JJWT Dependencies**: Added `jjwt-api`, `jjwt-impl`, and `jjwt-jackson` (v0.12.5) to `backend/pom.xml`.
- **BCrypt Password Storage**:
  - Added `passwordHash` to `Patient` entity annotated with `@JsonIgnore` to prevent credential exposure.
  - Added `password` field to `PatientRequest` DTO.
  - Seeded BCrypt hashes for all staff and patients in `DataSeeder.java`.
- **Security Context & Authentication**:
  - `UserPrincipal`: Implements Spring Security's `UserDetails`, mapping `EmployeeRole` and `Patient` to GrantedAuthorities (`ROLE_DOCTOR`, `ROLE_CASHIER_ADMIN`, `ROLE_RECEPTIONIST`, `ROLE_PHARMACIST`, `ROLE_LAB_TECHNICIAN`, `ROLE_PATIENT`).
  - `JwtTokenProvider`: Issues HS256-signed tokens with expiration, subject, and role claims.
  - `JwtAuthenticationFilter`: Extracts Bearer token from `Authorization` header, validates signature, and populates `SecurityContextHolder`.
  - `JwtAuthenticationEntryPoint` & `CustomAccessDeniedHandler`: Return structured JSON errors for 401 Unauthorized and 403 Forbidden responses.
  - `SecurityConfig`: Configured `@EnableMethodSecurity(prePostEnabled = true)`, stateless session policy, and BCrypt bean.
- **Data Boundary Enforcement (SecurityService & Services)**:
  - `SecurityService`: Provides SpEL helper methods:
    - `isCurrentDoctor(doctorId)`: Validates if authenticated user is the target doctor.
    - `canDoctorAccessPatient(patientId)`: Verifies if doctor is assigned to patient (via appointments or prescriptions) or if caller is Admin/Receptionist.
    - `canDoctorAccessAppointment(appointmentId)`: Validates doctor ownership.
  - `PatientService`:
    - In `getAllPatients()`: If authenticated as `ROLE_DOCTOR`, returns only patients assigned to the doctor. `CASHIER_ADMIN` and `RECEPTIONIST` receive all active patients hospital-wide.
    - In `getPatientById(id)`: Enforces `@PreAuthorize("@securityService.canDoctorAccessPatient(#id)")`.
  - `DoctorService`:
    - In `getDoctorSchedules(doctorId)`: Enforces `@PreAuthorize("hasAnyRole('CASHIER_ADMIN', 'RECEPTIONIST') or (hasRole('DOCTOR') and @securityService.isCurrentDoctor(#doctorId))")`.
- **Controllers Protected**:
  - `@PreAuthorize` applied across `PatientController`, `DoctorController`, `AppointmentController`, `BillingController`, `PharmacyController`, `LaboratoryController`, and `PaymentController`.

---

## 3. Frontend Implementation & Integration

- **`frontend/src/services/api.ts`**:
  - Configured Axios request interceptor attaching JWT Bearer token.
  - Configured response interceptor to preserve HTTP response status.
  - Added `authApi` (`staffLogin`, `patientLogin`, `patientSignup`, `getCurrentUser`).
  - Added `doctorApi.getSchedules(doctorId)`.
- **`frontend/src/views/auth/PatientSignupView.tsx`**:
  - Two-way binding for `formData.password`.
  - Dispatches `authApi.patientSignup`, securely stores token in `localStorage`, and establishes patient session.
- **`frontend/src/views/auth/StaffLoginView.tsx`**:
  - Dispatches `authApi.staffLogin`, extracts JWT token, assigns role, and routes to role-specific dashboard.
- **`frontend/src/views/auth/PatientLoginView.tsx`**:
  - Dispatches `authApi.patientLogin`, validates credentials, extracts token, and navigates to portal.
- **`frontend/src/views/DoctorView.tsx`**:
  - Dynamically fetches doctor schedules from backend API.
  - Handles 403 Forbidden responses with inline alert and toast notifications informing doctor of RBAC boundaries.
- **`frontend/src/context/RoleContext.tsx`**:
  - Cleans up tokens on `logoutPatient` and `logoutStaff`.

---

## 4. Verification & Testing Evidence

### Backend Test Execution
Ran `./mvnw test` in `/Users/admin/Projects/honda_leda/backend`:
```
[INFO] Running com.pulseos.security.RbacSecurityEmpiricalTest
[INFO] Tests run: 7, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.157 s -- in com.pulseos.security.RbacSecurityEmpiricalTest
[INFO] Running com.pulseos.PulseOsApplicationTests
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.850 s -- in com.pulseos.PulseOsApplicationTests
[INFO] Running com.pulseos.challenge.PersistenceEmpiricalChallengeTest
[INFO] Tests run: 9, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.160 s -- in com.pulseos.challenge.PersistenceEmpiricalChallengeTest
[INFO] Results:
[INFO] Tests run: 20, Failures: 0, Errors: 0, Skipped: 0
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```

### Frontend Build Execution
Ran `npm run build` in `/Users/admin/Projects/honda_leda/frontend`:
```
> pulseos-frontend@1.0.0 build
> tsc -b && vite build

vite v6.4.3 building for production...
transforming...
✓ 1681 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   1.18 kB │ gzip:   0.62 kB
dist/assets/index-C6EYpYVi.css   36.98 kB │ gzip:   6.83 kB
dist/assets/index-DwmC4Hka.js   505.82 kB │ gzip: 141.28 kB
✓ built in 1.60s
```
Both backend tests and frontend build completed with **0 failures and 0 errors**.
