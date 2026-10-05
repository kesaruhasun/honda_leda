# Dispatch: Milestone 2 Implementation Worker Replacement (teamwork_preview_worker_m2_1_repl)

## Role & Objectives
You are the Milestone 2 Implementation Worker Replacement.
Your predecessor (`59bce0a4`) completed the vast majority of the implementation for Milestone 2 (Backend Security & Real JWT RBAC) but was interrupted by an API quota exhaustion right after configuring `<reuseForks>false</reuseForks>` in `backend/pom.xml`.

Your objective is to verify, debug any remaining test edge cases, confirm all unit/integration tests and E2E tests pass, and deliver the final Milestone 2 handoff report.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Write Ownership Boundaries
Your write ownership encompasses:
1. `backend/pom.xml`
2. `backend/src/main/resources/application.yml`
3. `backend/src/main/java/com/pulseos/security/**`
4. `backend/src/main/java/com/pulseos/config/SecurityConfig.java` (DELETE if present)
5. `backend/src/main/java/com/pulseos/common/Person.java`
6. `backend/src/main/java/com/pulseos/common/Employee.java`
7. `backend/src/main/java/com/pulseos/common/GlobalExceptionHandler.java`
8. `backend/src/main/java/com/pulseos/patient/Patient.java`
9. `backend/src/main/java/com/pulseos/patient/PatientRepository.java`
10. `backend/src/main/java/com/pulseos/seeder/DataSeeder.java`
11. Controller files:
    - `backend/src/main/java/com/pulseos/patient/PatientController.java`
    - `backend/src/main/java/com/pulseos/doctor/DoctorController.java`
    - `backend/src/main/java/com/pulseos/appointment/AppointmentController.java`
    - `backend/src/main/java/com/pulseos/pharmacy/PharmacyController.java`
    - `backend/src/main/java/com/pulseos/laboratory/LaboratoryController.java`
    - `backend/src/main/java/com/pulseos/billing/PaymentController.java`
    - `backend/src/main/java/com/pulseos/common/DataExportController.java`
12. Test files across `backend/src/test/java/**` (to update test assertions, mock users, or test setups for Spring Security).

## Current State Inherited from Predecessor
1. All 10 security classes in `com.pulseos.security` are created:
   `JwtTokenProvider`, `JwtAuthenticationEntryPoint`, `JwtAccessDeniedHandler`, `JwtAuthenticationFilter`, `SecurityConfig`, `LoginRequest`, `AuthResponse`, `UserProfileResponse`, `AuthService`, `AuthController`.
2. All 4 security test suites in `backend/src/test/java/com/pulseos/security/` are created:
   `JwtTokenProviderTest` (5/5 passing), `SecurityFilterChainIntegrationTest` (7/7 passing), `SecurityRbacIntegrationTest`, `AuthControllerIntegrationTest`.
3. `application.yml` has `pulseos.jwt.secret` and `pulseos.jwt.expiration-ms`.
4. `DataSeeder.java` seeds BCrypt password hashes (`password123`).
5. Obsolete `com.pulseos.config.SecurityConfig.java` is deleted.
6. Controllers have removed `@CrossOrigin(origins = "*")` and have `@PreAuthorize` annotations.
7. `backend/pom.xml` has JJWT 0.12.5 and `<reuseForks>false</reuseForks>`.

## Next Steps
1. Run `cd backend && ./mvnw test-compile` to ensure clean compilation.
2. Run `cd backend && ./mvnw test` to execute all test suites.
   - If `DtoSerializationEmpiricalChallengeTest` or any other test fails because `@PreAuthorize` expects an authenticated user on MockMvc calls:
     Add `@WithMockUser(roles = "SYSTEM_ADMIN")` or `@WithMockUser(roles = "DOCTOR")` to the test class/methods, or authenticate the mock requests.
   - If H2 TCP server port 9092 conflict occurs:
     Check `H2TcpServerConfig.java` or `application.yml`. Note: In test execution, H2 TCP server doesn't even need to be started for unit tests if `@Profile("demo")` is used, or can catch `SQLException` if already bound.
3. Verify all backend tests pass 100%.
4. Verify all 91 mock E2E tests pass: `bash tests/e2e/run_tests.sh --mock`.
5. Verify frontend build succeeds: `cd frontend && npm run build`.
6. Write comprehensive handoff report to:
   `/Users/admin/Projects/honda_leda/.agents/teamwork/teamwork_preview_worker_m2_1_repl/handoff.md`
   Follow Handoff Protocol. Include all commands and verification results.


## 2026-10-05T00:07:44Z
You are Milestone 2 Implementation Worker Replacement (identity: teamwork_preview_worker_m2_1_repl).
Your working directory is: /Users/admin/Projects/honda_leda/.agents/teamwork/teamwork_preview_worker_m2_1_repl
The project root is: /Users/admin/Projects/honda_leda
The original user request is recorded at: /Users/admin/Projects/honda_leda/.agents/teamwork/ORIGINAL_REQUEST.md
The project master plan is at: /Users/admin/Projects/honda_leda/PROJECT.md
The dispatch instructions are at: /Users/admin/Projects/honda_leda/.agents/teamwork/teamwork_preview_worker_m2_1_repl/DISPATCH.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your predecessor (59bce0a4) implemented all Milestone 2 security classes and tests, but was interrupted by an API quota exhaustion right after configuring `<reuseForks>false</reuseForks>` in `backend/pom.xml`.

Your write ownership exclusively encompasses:
1. `backend/pom.xml`
2. `backend/src/main/resources/application.yml`
3. `backend/src/main/java/com/pulseos/security/**`
4. `backend/src/main/java/com/pulseos/config/SecurityConfig.java` (DELETE if present)
5. `backend/src/main/java/com/pulseos/common/Person.java`
6. `backend/src/main/java/com/pulseos/common/Employee.java`
7. `backend/src/main/java/com/pulseos/common/GlobalExceptionHandler.java`
8. `backend/src/main/java/com/pulseos/patient/Patient.java`
9. `backend/src/main/java/com/pulseos/patient/PatientRepository.java`
10. `backend/src/main/java/com/pulseos/seeder/DataSeeder.java`
11. Controller files:
    - `backend/src/main/java/com/pulseos/patient/PatientController.java`
    - `backend/src/main/java/com/pulseos/doctor/DoctorController.java`
    - `backend/src/main/java/com/pulseos/appointment/AppointmentController.java`
    - `backend/src/main/java/com/pulseos/pharmacy/PharmacyController.java`
    - `backend/src/main/java/com/pulseos/laboratory/LaboratoryController.java`
    - `backend/src/main/java/com/pulseos/billing/PaymentController.java`
    - `backend/src/main/java/com/pulseos/common/DataExportController.java`
12. Test files across `backend/src/test/java/**` (to update test assertions, mock users, or test setups for Spring Security).

Your execution steps:
1. Verify compilation: `cd backend && ./mvnw test-compile`
2. Run backend test suite: `cd backend && ./mvnw test`
   - If any test fails due to `@PreAuthorize` needing an authenticated user on MockMvc calls:
     Add `@WithMockUser(roles = "SYSTEM_ADMIN")` or `@WithMockUser(roles = "DOCTOR")` to the test class/methods, or authenticate the mock requests.
   - If H2 TCP server port 9092 conflict occurs:
     Note that in `H2TcpServerConfig.java`, you can safely catch SQLException or check if the server is already running, or use random port / disabled in test if needed.
3. Verify 100% backend tests pass.
4. Verify all 91 mock E2E tests pass: `bash tests/e2e/run_tests.sh --mock`
5. Verify frontend build succeeds: `cd frontend && npm run build`
6. Write your handoff report to:
   `/Users/admin/Projects/honda_leda/.agents/teamwork/teamwork_preview_worker_m2_1_repl/handoff.md`
   Follow the Handoff Protocol (Observation, Logic Chain, Caveats, Conclusion, Verification Method). Include all verification commands and exact test outputs. When finished, send a message to your parent.
