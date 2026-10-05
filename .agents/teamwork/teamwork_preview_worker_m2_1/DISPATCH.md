# Dispatch: Milestone 2 Implementation Worker (teamwork_preview_worker_m2_1)

## Role & Objectives
You are the Milestone 2 Implementation Worker.
Your objective is to implement the complete backend security and JWT Role-Based Access Control (RBAC) architecture in `backend/` strictly adhering to the technical specifications produced by M2 Explorers 1, 2, and 3.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Write Ownership Boundaries
Your write ownership exclusively encompasses:
1. `backend/pom.xml`
2. `backend/src/main/resources/application.yml`
3. `backend/src/main/java/com/pulseos/security/**`
4. `backend/src/main/java/com/pulseos/config/SecurityConfig.java` (DELETE this obsolete file)
5. `backend/src/main/java/com/pulseos/common/Person.java`
6. `backend/src/main/java/com/pulseos/common/Employee.java`
7. `backend/src/main/java/com/pulseos/common/GlobalExceptionHandler.java`
8. `backend/src/main/java/com/pulseos/patient/Patient.java`
9. `backend/src/main/java/com/pulseos/patient/PatientRepository.java`
10. `backend/src/main/java/com/pulseos/seeder/DataSeeder.java`
11. Controller files to remove `@CrossOrigin(origins = "*")` and apply `@PreAuthorize`:
    - `backend/src/main/java/com/pulseos/patient/PatientController.java`
    - `backend/src/main/java/com/pulseos/doctor/DoctorController.java`
    - `backend/src/main/java/com/pulseos/appointment/AppointmentController.java`
    - `backend/src/main/java/com/pulseos/pharmacy/PharmacyController.java`
    - `backend/src/main/java/com/pulseos/laboratory/LaboratoryController.java`
    - `backend/src/main/java/com/pulseos/billing/PaymentController.java`
    - `backend/src/main/java/com/pulseos/common/DataExportController.java`
12. `backend/src/test/java/com/pulseos/security/**`

## Explorer Specifications to Read and Implement
- M2 Explorer 1 Report (JJWT 0.12.5 & JwtTokenProvider):
  `/Users/admin/Projects/honda_leda/.agents/teamwork/teamwork_preview_explorer_m2_1/handoff.md`
- M2 Explorer 2 Report (Spring Security, JwtAuthenticationFilter, RBAC & Controller Audit):
  `/Users/admin/Projects/honda_leda/.agents/teamwork/teamwork_preview_explorer_m2_2/handoff.md`
- M2 Explorer 3 Report (Auth Controller, Dual Login, Seed Passwords & Integration Tests):
  `/Users/admin/Projects/honda_leda/.agents/teamwork/teamwork_preview_explorer_m2_3/handoff.md`


## 2026-10-04T19:58:12Z
Received dispatch message:
You are Milestone 2 Implementation Worker (identity: teamwork_preview_worker_m2_1).
Implement full backend security, JWT RBAC, dual login, seed passwords, controller security audit, and integration tests according to Explorer blueprints.
