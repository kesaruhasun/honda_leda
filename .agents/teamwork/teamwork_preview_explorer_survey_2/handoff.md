# Step 0 Survey Handoff Report: Frontend & UI Architecture

**Agent**: `teamwork_preview_explorer_survey_2` (Frontend Explorer)  
**Date**: 2026-10-04T06:28:00Z  
**Project**: PulseOS Hospital Management System (`/Users/admin/Projects/honda_leda`)  
**Target File**: `/Users/admin/Projects/honda_leda/.agents/teamwork/teamwork_preview_explorer_survey_2/handoff.md`

---

## 1. Observation

### 1.1 Project Structure & Build Configuration
- **Root Directory (`/Users/admin/Projects/honda_leda`)**:
  - `package.json` specifies `"pulseos-hospital-management-system"` with E2E test scripts: `"test": "bash tests/e2e/run_tests.sh"`, `"test:e2e:mock": "bash tests/e2e/run_tests.sh --mock"`.
  - Lockfiles: `pnpm-lock.yaml` (root), `skills-lock.json`.
  - Secondary backup directory `frontend_backup_legacy/` exists at the root, duplicating an earlier state of the frontend.
- **Frontend Directory (`/Users/admin/Projects/honda_leda/frontend`)**:
  - `package.json`:
    - `name`: `"pulseos-frontend"`, `version`: `"1.0.0"`, `type`: `"module"`.
    - `scripts`: `"dev": "vite"`, `"build": "tsc -b && vite build"`, `"preview": "vite preview"`. (Note: **NO `"test"` script**).
    - `dependencies`:
      - `react`: `^19.0.0` (resolved `19.3.0`)
      - `react-dom`: `^19.0.0` (resolved `19.3.0`)
      - `react-router-dom`: `^7.18.3` (resolved `7.18.4`)
      - `axios`: `^1.7.9`
      - `date-fns`: `^4.4.0`
      - `lucide-react`: `^0.475.0`
    - `devDependencies`:
      - `vite`: `^6.1.0` (resolved `6.4.3`)
      - `@vitejs/plugin-react`: `^4.3.4`
      - `typescript`: `~5.7.2`
      - `tailwindcss`: `^3.4.17`
      - `postcss`: `^8.4.49`
      - `autoprefixer`: `^10.4.20`
  - Package manager environment:
    - Node: `v26.0.0`
    - npm: `11.12.1`
    - pnpm: `11.1.3`
    - yarn: Not installed (`command not found: yarn`)
    - Both `package-lock.json` and `pnpm-lock.yaml` exist in `frontend/`.
  - Build tool: Vite 6 configured in `vite.config.ts`, reverse-proxying `/api` and `/db-console` to `http://localhost:8080`.
  - Tailwind Configuration (`tailwind.config.js`):
    - Configures custom colors (`clinical.teal`, `clinical.slate`, `clinical.coral`, `clinical.amber`, `clinical.emerald`, `clinical.ink`).
    - Configures faux-Apple tokens:
      - `boxShadow`: `'apple-card'`, `'apple-hover'`, `'apple-elevated'`, `'apple-modal'`
      - `borderRadius`: `'apple-xl': '14px'`, `'apple-2xl': '18px'`
      - `fontFamily`: `'Plus Jakarta Sans'`, `'JetBrains Mono'`.

### 1.2 Pervasive Generic Tailwind & `.apple-btn` / `.apple-card` Slop
In `frontend/src/index.css` (lines 20-64), custom CSS classes emulate Apple Human Interface Guidelines:
```css
/* Lines 22-27 */
.apple-card {
  background-color: #FFFFFF;
  border: 1px solid rgba(226, 232, 240, 0.85);
  box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.03);
  border-radius: 0.875rem; /* 14px */
}
/* Lines 29-37 */
.apple-card-hover {
  transition: transform 150ms var(--ease-out), box-shadow 150ms var(--ease-out), border-color 150ms var(--ease-out);
}
/* Lines 40-47 */
.apple-btn {
  transition: transform 100ms var(--ease-out), background-color 150ms var(--ease-out), border-color 150ms var(--ease-out), opacity 150ms var(--ease-out);
  user-select: none;
}
.apple-btn:active:not(:disabled) {
  transform: scale(0.98);
}
/* Lines 50-64 */
.liquid-glass { ... }
.liquid-glass-card { ... }
```
- **Files directly utilizing `.apple-btn` (18 files across codebase)**:
  1. `frontend/src/views/PhysiciansView.tsx` (e.g., line 126)
  2. `frontend/src/views/DoctorView.tsx` (e.g., lines 173, 237, 296, 343, 414, 451, 457, 510)
  3. `frontend/src/views/PharmacyView.tsx` (e.g., lines 112, 137, 235, 335, 425)
  4. `frontend/src/views/AppointmentView.tsx` (e.g., lines 409, 419, 477, 483, 489, 650, 780, 830, 940, 1080)
  5. `frontend/src/views/PatientView.tsx` (e.g., lines 145, 178, 250, 390, 420)
  6. `frontend/src/views/PatientPortalView.tsx` (e.g., lines 572, 644, 1305, 1514, 1521, 1747, 1754, 1784, 2037, 2045, 2127, 2134)
  7. `frontend/src/views/auth/StaffLoginView.tsx` (lines 146, 159, 160, 161, 162, 163)
  8. `frontend/src/views/auth/PatientSignupView.tsx` (lines 160, 195)
  9. `frontend/src/views/auth/PatientLoginView.tsx` (lines 164, 177, 193)
  10. `frontend/src/views/LaboratoryView.tsx` (lines 280, 340, 350, 360, 370, 525, 537, 558, 571, 579, 591, 696, 702, 778, 784)
  11. `frontend/src/views/BillingView.tsx` (lines 130, 170, 240, 310, 410, 460)
  12. `frontend/src/views/LandingView.tsx` (lines 142, 180, 187, 194, 520)
  13. `frontend/src/components/common/Modal.tsx` (line 62)
  14. `frontend/src/components/layout/Sidebar.tsx` (lines 135, 145, 181, 260)
  15. `frontend/src/components/layout/Navbar.tsx` (lines 68, 101)
  16. `frontend/src/components/layout/PublicNavbar.tsx` (lines 75, 83, 92)
  17. `frontend/src/components/laboratory/DiagnosticReportModal.tsx` (lines 215, 230)
  18. `frontend/src/index.css` (definition at line 40)
- **Files utilizing `.apple-card` (11 files)**:
  `DoctorView.tsx`, `PharmacyView.tsx`, `AppointmentView.tsx`, `PatientView.tsx`, `PatientPortalView.tsx`, `LaboratoryView.tsx`, `BillingView.tsx`, `LandingView.tsx`, `MetricCard.tsx`, `ToastContainer.tsx`, `index.css`.
- **Files utilizing `apple-input`**:
  `PhysiciansView.tsx`, `DoctorView.tsx`, `StaffLoginView.tsx`, `PatientSignupView.tsx`, `PatientLoginView.tsx`.
- **Files utilizing `rounded-apple-xl` / `rounded-apple-2xl` (15 files)**:
  Pervasively used across all views and modals instead of standard Tailwind tokens.

### 1.3 Role-Based Views & Dashboards Analysis
The existing views in `frontend/src/views/`:
1. **Doctor View**:
   - `views/DoctorView.tsx` (520 lines): Acts primarily as an admin roster/directory rather than a clinician workbench. Provides physician profile creation, availability toggles, consultation fee editing, and schedule viewing.
   - Clinical encounters for doctors are embedded inside `views/AppointmentView.tsx` (1,176 lines), requiring a filter `doctorScope === 'my'` which hardcodes `Dr. Kavinda Rathnayaka` (`STF-DOC-101`).
2. **Patient View / Portal**:
   - `views/PatientPortalView.tsx` (2,155 lines): A massive single-file monolith containing 5 tabs: Consultations, Prescriptions, Pharmacy Store, Lab & Pathology, and Invoices.
   - `views/PatientView.tsx` (448 lines): Receptionist registry view for patient demographic intake, triage priority (`EMERGENCY`, `URGENT`, `ROUTINE`), and patient search.
3. **Pharmacist View**:
   - `views/PharmacyView.tsx` (495 lines): Central Dispensary with inventory list, low-stock alerts, add shipment modal, and prescription dispensing table.
4. **Manager / Administrator View**:
   - **Missing Dedicated Dashboard**: There is no dedicated executive/manager dashboard. The manager role is conflated with `CASHIER_ADMIN` in `RoleContext.tsx`, which defaults to `BillingView.tsx` (488 lines) and has unrestricted access to all modules via client-side routing. No high-level hospital KPI or administrative governance dashboard exists.
5. **Laboratory View**:
   - `views/LaboratoryView.tsx` (803 lines): Pathology workstation for MLT staff to log specimen collection, enter numeric test results, flag abnormal values, and generate PDF/print reports.

### 1.4 Client-Side "Station Switcher" & Pseudo-RBAC
- **Implementation Location**:
  - Located in `frontend/src/components/layout/Sidebar.tsx` (lines 142–205).
  - Backed by `frontend/src/context/RoleContext.tsx`.
- **Role Switching Mechanism**:
  ```typescript
  // RoleContext.tsx (lines 104-123)
  const handleSetRole = (role: UserRole) => {
    setCurrentRole(role);
    switch (role) {
      case 'DOCTOR': setActiveModule('doctors'); break;
      case 'RECEPTIONIST': setActiveModule('patients'); break;
      case 'PHARMACIST': setActiveModule('pharmacy'); break;
      case 'LAB_TECHNICIAN': setActiveModule('laboratory'); break;
      case 'CASHIER_ADMIN': setActiveModule('billing'); break;
    }
  };
  ```
  - For `CASHIER_ADMIN`, a dropdown allows instant selection of any profile in `CLINICAL_STAFF` (`DOCTOR`, `RECEPTIONIST`, `PHARMACIST`, `LAB_TECHNICIAN`, `CASHIER_ADMIN`).
  - For non-admins, a "Fixed" lock badge is rendered, but this boundary is purely cosmetic.
- **Login Authentication Bypass**:
  - `StaffLoginView.tsx` (lines 25-34):
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
    Zero backend API calls are made. Any password is accepted.
  - `PatientLoginView.tsx` (lines 29-53):
    Fetches patient by NIC (`patientApi.getByNic(nic)`). If found, writes `currentPatientId` to `sessionStorage` and logs in immediately without checking passwords or acquiring tokens.
- **Backend Security Posture**:
  - `backend/src/main/java/com/pulseos/config/SecurityConfig.java` (lines 31-37):
    ```java
    .authorizeHttpRequests(auth -> auth
        .requestMatchers("/h2-console/**", "/db-console/**").permitAll()
        .requestMatchers("/api/**").permitAll()
        .requestMatchers("/api/v1/**").permitAll()
        .requestMatchers("/error").permitAll()
        .anyRequest().permitAll()
    );
    ```
    Every single endpoint is completely unauthenticated (`permitAll()`).
  - `frontend/src/services/api.ts`:
    Does not attach an `Authorization` header to Axios requests. Zero JWT token management exists.

### 1.5 Appointment Booking Calendar Implementation
- **Component**: `frontend/src/components/appointments/AppointmentCalendar.tsx` (673 lines).
- **Embedded Inline Styling**: Contains 427 lines of raw CSS inside an inline `<style>` JSX block (lines 246-673), defining custom CSS variables (`--bg`, `--teal`, `--line`, etc.) completely isolated from Tailwind.
- **Fake Availability Logic**:
  Lines 13-37 in `AppointmentCalendar.tsx`:
  ```typescript
  // Pseudo-random deterministic function for availability demo
  function seedFor(dateStr: string, extra?: string){
    let s = dateStr + '|' + (extra||'');
    let h = 0;
    for(let i=0;i<s.length;i++){ h = (h*31 + s.charCodeAt(i)) >>> 0; }
    return h;
  }
  function rand(seed: number){ return (seed % 1000) / 1000; }
  function isDayFull(dateObj: Date){
    if(isClosed(dateObj) || isPast(dateObj)) return false;
    const key = dateKey(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    return rand(seedFor(key,'full')) < 0.16;
  }
  function slotStatus(dateObj: Date, doctorId: string, time: string){
    const key = dateKey(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    const seed = seedFor(key, doctorId+time);
    return rand(seed) < 0.42 ? 'booked' : 'available';
  }
  ```
  - Slot availability and full-day flags are computed purely using mathematical string hashing. Real doctor schedules (`/doctors/{id}/schedules`) and actual appointments (`/appointments`) are never queried for slot calculation.
  - Times are hardcoded to 13 static slots (`['09:00', ..., '16:00']`).
- **Calendar Fragmentation**:
  - In `views/AppointmentView.tsx`, an entirely separate, second calendar grid is implemented from scratch (lines 512-570) with manual month arithmetic (`calendarDays.map(...)`).
  - Doctors see their consultations filtered by hardcoded `Dr. Kavinda`, while Managers/Admins see all consultations.

### 1.6 Landing Page Implementation
- **File**: `frontend/src/views/LandingView.tsx` (555 lines).
- **Data Fetching**: **ZERO API calls**. No `useEffect`, `fetch`, or `axios` exists in `LandingView.tsx`.
- **Hardcoded Data Arrays**:
  - `FORMULARY_DRUGS` (lines 19-28): 8 hardcoded medication objects.
  - `LAB_TESTS_FEATURED` (lines 30-39): 8 hardcoded diagnostic laboratory tests.
- **Cart & Booking Logic**:
  - Cart operations write to `localStorage.setItem('pending_cart', JSON.stringify(landingCart))` (line 76).
  - Lab test bookings write to `localStorage.setItem('pending_lab_test', JSON.stringify(test))` (line 87).
  - Both redirect to `/patient/login` without communicating with any backend inventory, cart, or order endpoint.
- **Ancillary Public Views**:
  - `views/ServicesView.tsx` (107 lines): 100% static markup, no data fetching.
  - `views/PhysiciansView.tsx` (146 lines): Calls `doctorApi.getAll()`, but avatar images are hardcoded Unsplash URLs (`DOCTOR_AVATARS`).
  - `components/layout/PublicNavbar.tsx` (102 lines): **Orphaned file**; not imported anywhere in the project.

### 1.7 Build & Test Execution
- **Build Execution**:
  Command: `npm run build` (inside `/Users/admin/Projects/honda_leda/frontend`)
  Output:
  ```
  > pulseos-frontend@1.0.0 build
  > tsc -b && vite build

  vite v6.4.3 building for production...
  ✓ 1682 modules transformed.
  dist/index.html                   1.18 kB │ gzip:   0.62 kB
  dist/assets/index-CGdsPdJF.css   48.14 kB │ gzip:   8.53 kB
  dist/assets/index-CYe-HNqQ.js   629.52 kB │ gzip: 167.08 kB
  (!) Some chunks are larger than 500 kB after minification.
  ✓ built in 1.66s
  ```
  Exit code: 0. Build succeeds.
- **Frontend Test Execution**:
  Command: `npm test` (inside `frontend/`)
  Output: `npm error Missing script: "test"` (Exit code: 1).
  No unit/component test runner (Vitest/Jest) is set up in `frontend/`.
- **System E2E Test Execution**:
  Command: `npm run test:e2e:mock` (from project root)
  Output: All 70 E2E tests pass across Tiers 1-4 in 0.13s against the embedded mock server. (Exit code: 0).

---

## 2. Logic Chain

1. **Premise**: R1 demands wiping the existing generic Tailwind frontend, removing `.apple-btn` slop, and adopting a cohesive design system using `tailadmin-ui`, `ui-ux-pro-max`, and `emil-design-eng`.
   - *Observation*: `.apple-btn` is imported/used in 18 files, `.apple-card` in 11 files, alongside custom CSS in `index.css` and `AppointmentCalendar.tsx`. The layout lacks the structured TailAdmin Sidebar/Header shell and suffers from oversized single-file components (e.g. `PatientPortalView.tsx` at 2,155 lines).
   - *Inference*: The frontend requires an architectural clean slate: ripping out all `.apple-*` custom styles, establishing standardized UI components (TailAdmin layout shell, unified buttons, inputs, cards, data tables, modals), and breaking down monolithic views into modular components.

2. **Premise**: R2 requires removing the insecure client-side "Station Switcher" dropdown and establishing real backend-enforced RBAC using JWT claims.
   - *Observation*: The station switcher in `Sidebar.tsx` directly modifies React context state. `StaffLoginView.tsx` determines roles purely via string substring matching on username, without contacting the backend. `PatientLoginView.tsx` verifies only NIC existence without password authentication. Backend `SecurityConfig.java` permits all requests (`permitAll()`).
   - *Inference*: The current authentication and role switching is purely decorative and insecure. True RBAC requires a backend `/api/v1/auth/login` endpoint issuing signed JWTs with role claims (`DOCTOR`, `PATIENT`, `PHARMACIST`, `MANAGER`), Axios request interceptors attaching `Authorization: Bearer <token>`, route-level `ProtectedRoute` guards in React Router, and backend Spring Security filters (`JwtAuthenticationFilter`) validating claims on each request. The Station Switcher dropdown must be completely removed from `Sidebar.tsx`.

3. **Premise**: R3 requires an advanced appointment calendar providing distinct, easy-to-read views for Patients, Doctors, and Managers.
   - *Observation*: `AppointmentCalendar.tsx` fabricates slot availability via client-side pseudorandom mathematical hashing (`seedFor`), while `AppointmentView.tsx` duplicates calendar logic into another 60-line grid.
   - *Inference*: The calendar must be refactored to fetch real doctor schedules (`GET /doctors/{id}/schedules`) and booked appointments (`GET /appointments`). It must offer:
     - **Patient View**: Doctor selector, working day filter based on actual schedules, real unoccupied time slots, booking confirmation.
     - **Doctor View**: Personalized agenda/day/week/month schedule of booked patients, direct launch of encounter/prescription workflow.
     - **Manager View**: Hospital-wide OPD schedule, doctor roster oversight, capacity metrics, filtering across departments and doctors.

4. **Premise**: R2 requires the landing page to fetch real data from the backend rather than hardcoding arrays.
   - *Observation*: `LandingView.tsx` contains static arrays `FORMULARY_DRUGS` and `LAB_TESTS_FEATURED` and saves purchases to `localStorage`.
   - *Inference*: `LandingView.tsx` must be converted to query live backend APIs (`GET /pharmacy/drugs` and `GET /laboratory/catalog`) with proper loading skeletons and error fallbacks.

---

## 3. Emil Kowalski UI / Micro-Interaction Review Table

In accordance with the `emil-design-eng` skill requirements, the following review table specifies the necessary micro-interaction and styling transformations:

| Current Implementation (Before) | Proposed Polish (After) | Design Rationale (Why) |
| :--- | :--- | :--- |
| `transition: transform 100ms var(--ease-out), background-color 150ms var(--ease-out)...` on `.apple-btn` | `transition: transform 120ms cubic-bezier(0.16, 1, 0.3, 1), background-color 150ms ease` with `active:scale-[0.98]` | Replaces generic, heavy transition lists with tactile, physics-based micro-feedback. |
| `.apple-card` with arbitrary rgba borders and dual shadows | TailAdmin Standard Card: `bg-white rounded-lg border border-slate-200/80 shadow-sm p-6` | Consistent visual weight, clean enterprise SaaS aesthetics, eliminates generic Apple HIG knock-offs. |
| 427 lines of raw `<style>` tags embedded inside `AppointmentCalendar.tsx` | Pure Tailwind CSS utility classes and reusable subcomponents | Eliminates style tag bleeding, restores component encapsulation, matches Tailwind build pipeline. |
| Instant modal popup without scale origin or backdrop blur transition | `transition: opacity 150ms ease-out, transform 200ms cubic-bezier(0.16, 1, 0.3, 1)` with `scale-95` to `scale-100` | Smooth entrance preventing jarring layout pops while keeping interaction snappier than 300ms. |
| Client-side station switcher in Sidebar switching roles on a click | User profile drawer with signed JWT user identity, role badge, and explicit Sign Out | Enforces authentic security boundaries; users cannot switch roles without authenticating. |
| Hardcoded static drug & lab cards on landing page | Animated skeleton loading state transitioning smoothly into real API cards | Prevents empty layout shifts and conveys real-time system capability. |

---

## 4. Caveats

1. **Backend Dependency for Full RBAC**: The frontend cannot enforce true RBAC until the backend implements a dedicated authentication endpoint (e.g. `/api/v1/auth/login`) that signs JWT tokens and a Spring Security filter that validates them.
2. **Missing Test Runner in Frontend**: Because `frontend/package.json` lacks Vitest/Jest, frontend unit testing currently relies solely on TypeScript type checking (`tsc -b`) and Vite build bundling (`vite build`), while backend/e2e flows are verified via the root `run_tests.sh` suite.
3. **Legacy Backup Folder**: `frontend_backup_legacy/` at the root is not referenced by any build script, but should eventually be cleaned up under R5 (file organization).

---

## 5. Conclusion

The frontend survey reveals a functioning build system (Vite 6, React 19, Tailwind 3.4), but the UI and architecture suffer from fundamental flaws:
1. **Generic `.apple-*` Slop**: Pervasive across 18 files, including custom CSS classes and embedded `<style>` tags.
2. **Zero Backend Security / Fake Station Switcher**: Pure client-side role switching with substring login checks and an insecure backend permitting all endpoints.
3. **Monolithic & Missing Views**: `PatientPortalView.tsx` is an unwieldy 2,155-line file; no dedicated Manager dashboard exists.
4. **Simulated Calendar Availability**: `AppointmentCalendar.tsx` calculates slots using mathematical pseudo-random seeds instead of backend schedules.
5. **Static Landing Page**: Relies entirely on hardcoded arrays with zero backend integration.

The architecture is well-positioned for the Clean Slate overhaul outlined in `ORIGINAL_REQUEST.md`: removing `.apple-*` classes, adopting TailAdmin shell architecture, establishing real JWT-based auth guards, wiring live data into the landing page and calendar, and implementing dedicated Doctor, Patient, Pharmacist, and Manager dashboards.

---

## 6. Verification Method

To independently verify the observations and conclusions in this report:

1. **Verify Frontend Build**:
   ```bash
   cd /Users/admin/Projects/honda_leda/frontend
   npm run build
   ```
   *Expected Result*: Output completes with `tsc -b && vite build` in ~1.6s, generating bundle in `dist/`.

2. **Verify Missing Test Script in Frontend**:
   ```bash
   cd /Users/admin/Projects/honda_leda/frontend
   npm test
   ```
   *Expected Result*: Exits with code 1 (`npm error Missing script: "test"`).

3. **Verify Existing E2E Test Suite**:
   ```bash
   cd /Users/admin/Projects/honda_leda
   npm run test:e2e:mock
   ```
   *Expected Result*: 70/70 tests pass across Tiers 1-4 in ~0.13s.

4. **Verify `.apple-btn` Pervasiveness**:
   ```bash
   grep -rn "apple-btn" /Users/admin/Projects/honda_leda/frontend/src | wc -l
   ```
   *Expected Result*: Returns >70 individual line occurrences across 18 source files.

5. **Verify Station Switcher & Fake Auth**:
   Inspect `frontend/src/components/layout/Sidebar.tsx` (lines 142-205) and `frontend/src/views/auth/StaffLoginView.tsx` (lines 25-34).

6. **Verify Fake Calendar Logic**:
   Inspect `frontend/src/components/appointments/AppointmentCalendar.tsx` (lines 13-37) to observe `seedFor` and `rand` functions.

7. **Verify Hardcoded Landing Page**:
   Inspect `frontend/src/views/LandingView.tsx` (lines 19-39) to observe `FORMULARY_DRUGS` and `LAB_TESTS_FEATURED` static arrays.
