# DISPATCH — M2 Explorer 3 (AuthController, Seed Passwords & User Mapping)

## 2026-10-04T16:07:00Z
You are M2 Explorer 3 (identity: `teamwork_preview_explorer_m2_3`).
Your working directory is: `/Users/admin/Projects/honda_leda/.agents/teamwork/teamwork_preview_explorer_m2_3`.
The project root is: `/Users/admin/Projects/honda_leda`.
The original user request is at: `/Users/admin/Projects/honda_leda/.agents/teamwork/ORIGINAL_REQUEST.md`.
The master plan is at: `/Users/admin/Projects/honda_leda/PROJECT.md`.

You are a read-only exploration agent. DO NOT write or modify source code files.
Scope: Milestone 2 — Auth Controller, Login Service, Seed Passwords & User Entity Integration.
Objective:
1. Examine existing staff (`Employee`, `Doctor`, `Receptionist`, `Pharmacist`, `LabTechnician`, `SystemAdmin`) and `Patient` models, repositories, and `DataSeeder.java`.
2. Determine how passwords should be stored and checked:
   - Does `Person` or `Employee` currently have a `password` field? If not, investigate how to add BCrypt hashed password field to `Person` (inherited by both `Patient` and `Employee`), or to `Employee` and `Patient`.
   - Update `DataSeeder.java` to seed BCrypt hashed passwords (e.g. standard demo password `password123` or role-specific passwords) for all seeded staff and demo patient.
3. Design `AuthController.java` and `AuthDTOs` in `com.pulseos.security`:
   - Endpoint: `POST /api/v1/auth/login`
   - Request DTO: `LoginRequest` (`username`, `password`) with ZERO redundant fields.
   - Response DTO: `AuthResponse` (`token`, `tokenType`: "Bearer", `userId`, `username`, `fullName`, `role`, `userType`: "STAFF"|"PATIENT") with ZERO redundant fields.
   - Dual login resolution logic:
     - Check `EmployeeRepository.findByEmail(username)` -> if found, verify password with BCrypt, resolve role (`EmployeeRole.DOCTOR`, `EmployeeRole.RECEPTIONIST`, etc.), generate token.
     - If not found or if patient username (e.g., patient NIC/passport or email), check `PatientRepository.findByNicPassportNo(username)` or `findByEmail` -> verify password, role = "PATIENT", generate token.
     - Return HTTP 401 with informative error if invalid credentials.
4. Provide full concrete specifications, repository query additions, and seed data updates for the Worker.

Write your report to:
`/Users/admin/Projects/honda_leda/.agents/teamwork/teamwork_preview_explorer_m2_3/handoff.md`.
Follow the Handoff Protocol (Observation, Logic Chain, Caveats, Conclusion, Verification Method).
When finished, send a message to your parent.
## 2026-10-04T19:05:44Z
You are M2 Explorer 3 Replacement (identity: teamwork_preview_explorer_m2_3_repl).
Your working directory is: /Users/admin/Projects/honda_leda/.agents/teamwork/teamwork_preview_explorer_m2_3
The project root is: /Users/admin/Projects/honda_leda
The original user request is at: /Users/admin/Projects/honda_leda/.agents/teamwork/ORIGINAL_REQUEST.md
The master plan is at: /Users/admin/Projects/honda_leda/PROJECT.md
The dispatch file is at: /Users/admin/Projects/honda_leda/.agents/teamwork/teamwork_preview_explorer_m2_3/DISPATCH.md
Read the completed reports from peer explorers:
- M2 Explorer 1 Report (JJWT & Token Provider): /Users/admin/Projects/honda_leda/.agents/teamwork/teamwork_preview_explorer_m2_1/handoff.md
- M2 Explorer 2 Report (Spring Security & RBAC): /Users/admin/Projects/honda_leda/.agents/teamwork/teamwork_preview_explorer_m2_2/handoff.md

You are a read-only exploration agent. DO NOT write or modify source code files.
Scope: Milestone 2 — Auth Controller, Login Service, Seed Passwords & User Entity Integration.
Objective:
1. Examine staff entities (Person, Employee, Doctor, Receptionist, Pharmacist, LabTechnician, SystemAdmin) and Patient entity:
   - Check where password fields are located:
     - Person has no password field currently? Employee has passwordHash? Patient has password?
     - Design the exact field additions / unification: ensure Person has `passwordHash` (or Employee and Patient have matching BCrypt hashed fields).
2. Examine repositories:
   - Check `EmployeeRepository.java`: does `findByEmail(String email)` exist?
   - Check `PatientRepository.java`: does `findByNicPassportNo(String nic)` exist? Does `findByEmail(String email)` exist?
   - Specify any needed query methods.
3. Design `AuthController.java` and `AuthDTOs` in `com.pulseos.security`:
   - Endpoint: `POST /api/v1/auth/login`
   - Request DTO: `LoginRequest` (`username`, `password`) with ZERO redundant fields.
   - Response DTO: `AuthResponse` (`token`, `tokenType`: "Bearer", `userId`, `username`, `fullName`, `role`, `userType`: "STAFF"|"PATIENT") with ZERO redundant fields.
   - Dual login resolution logic:
     - Staff login: check `EmployeeRepository.findByEmail(username)`. If found, verify password with BCrypt `passwordEncoder.matches(rawPassword, employee.getPasswordHash())`, resolve role (e.g. "DOCTOR", "RECEPTIONIST", etc.), userType = "STAFF", generate token using `jwtTokenProvider.generateToken(...)`.
     - Patient login: check `PatientRepository.findByNicPassportNo(username)` or `findByEmail(username)`. If found, verify password with BCrypt, role = "PATIENT", userType = "PATIENT", generate token.
     - If neither found or password mismatch: return HTTP 401 with `{ "error": "Unauthorized", "message": "Invalid credentials", "status": 401 }`.
4. Inspect `backend/src/main/java/com/pulseos/seeder/DataSeeder.java`:
   - Specify exact BCrypt password hashing for all seeded staff accounts (Doctor Kavinda `it25103999@my.sliit.lk`, Pharmacist Harshika `it25100826@my.sliit.lk`, Lab Tech Nethuli `it25103363@my.sliit.lk`, Receptionist Dilani `it25100994@my.sliit.lk`, System Admin Hasun `kesaruhasun@gmail.com`) and patients (demo patient NIC `199012345678`).
   - Standard demo password: `password123`.
5. Provide complete code templates, DTO structures, and verification tests for the Worker.
