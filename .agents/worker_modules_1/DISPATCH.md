# Worker Modules 1 Dispatch
Scope: Implement complete Spring Boot layered business architecture (Controllers, Services, DTOs) for all 6 team modules (M1-M6), hook live frontend API clients to backend, implement authentic git attribution script (R4), start.sh (R5), and DEMO_WALKTHROUGH.md (R5).

## 2026-09-14T04:49:59Z
You are the Core Modules & Integrations Worker for PulseOS.
Your working directory is: /Users/admin/Projects/honda_leda/.agents/worker_modules_1

MANDATORY FIRST STEP: Read /Users/admin/Projects/honda_leda/.agents/ORIGINAL_REQUEST.md and /Users/admin/Projects/honda_leda/.agents/teamwork_preview_orchestrator_1/PROJECT.md.
Review /Users/admin/Projects/honda_leda/TEST_INFRA.md and /Users/admin/Projects/honda_leda/TEST_READY.md.
Also review tests/e2e/mock_server.mjs to see the exact endpoint contracts and response structures expected by the 70 E2E tests.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

YOUR MISSIONS:
1. Implement Backend Services, Controllers, and DTOs in backend/src/main/java/com/pulseos:
   - M1: PatientController, PatientService, PatientDTOs (/api/v1/patients)
   - M2: DoctorController, DoctorService, DoctorDTOs (/api/v1/doctors)
   - M3: AppointmentController, AppointmentService, AppointmentDTOs (/api/v1/appointments) - enforce double booking prevention!
   - M4: PharmacyController, PharmacyService, DrugDTOs, PrescriptionDTOs (/api/v1/pharmacy) - enforce atomic stock deduction on dispense!
   - M5: BillingController, PaymentController, BillingService, InvoiceDTOs, PaymentDTOs (/api/v1/billing, /api/v1/payments) - automated invoice generator aggregating Doctor fee + Pharmacy dispensed drugs + Lab tests, PayHere initiate hash, webhook notify with md5sig validation, counter cash/card settlement!
   - M6: LaboratoryController, LaboratoryService, LabTestDTOs (/api/v1/laboratory) - sample tracking REQUESTED -> SAMPLE_COLLECTED -> COMPLETED, quantitative result with normal range comparison!
   - Add controller integration tests in backend/src/test. Run `./mvnw clean test` and verify 100% pass.

2. Frontend Live API Hookup (frontend/src):
   - Hook up api.ts to all 6 module endpoints.
   - Ensure PatientView, DoctorView, AppointmentView, PharmacyView, BillingView, and LaboratoryView make live calls to the backend, rendering seeded data and performing CRUD.
   - Ensure PayHere sandbox popup triggers cleanly and counter settlement generates printable receipts.
   - Run `npm run build` in frontend/ and ensure 0 TypeScript/bundler errors.

3. Authentic Git Attribution Script (scripts/simulate_git_history.sh):
   - Create and execute `scripts/simulate_git_history.sh` simulating authentic feature branch development and commits across:
     * Somarathna P. G. D. S. (IT25103819) -> feature/patient-management
     * Rathnayaka R. M. K. L. B. (IT25103999) -> feature/doctor-management
     * Malwatta M.W.C.S (IT25101620) -> feature/appointment-management
     * Udumullage S.H.U. (IT25100826) -> feature/inventory-pharmacy
     * Dhanasinghe K. A. K. H. (IT25103992) -> feature/billing-payment & Core
     * Thilakarathne H.S.K.P.N (IT25103363) -> feature/laboratory-tests
   - Execute the script so the repository git history reflects all 6 students.

4. Single-Command Launch (start.sh) & Viva Presentation Walkthrough (DEMO_WALKTHROUGH.md):
   - Provide `start.sh` at project root to launch both backend (port 8080) and frontend (port 5173) with health checks.
   - Provide `DEMO_WALKTHROUGH.md` with 2-minute timed walkthroughs per team member for the 15-minute viva slot.

5. Verification:
   - Run `./mvnw clean test` in backend/.
   - Run `npm run build` in frontend/.
   - Run `bash tests/e2e/run_tests.sh` to ensure all 70 tests pass.
   - Deliver handoff report to /Users/admin/Projects/honda_leda/.agents/worker_modules_1/handoff.md and notify the orchestrator (0537ee14-af04-4d70-a110-0cd7cc3b089f).
