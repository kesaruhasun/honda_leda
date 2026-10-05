# Soft Handoff — Project Orchestrator Generation 1 to Generation 2

**Predecessor:** `teamwork_preview_orchestrator_1` (Conv ID: `53026021-3d77-4d55-898c-57217ce35a26`)  
**Date:** 2026-10-04  
**Target Recipient:** Successor Project Orchestrator (`teamwork_preview_orchestrator_gen2`)  
**Parent (Sentinel) Conversation ID:** `c60d41b2-7c9d-4469-b868-2b2309870d7f`  
**Handoff Type:** Soft Handoff (Succession Threshold Reached: 17 Spawns >= 16)  

---

## 1. Milestone State

| # | Name | Scope | Dependencies | Status | Key Outputs / Artifacts |
|---|------|-------|-------------|--------|------------------------|
| - | Survey Phase | Map full scope, codebase audit | none | **DONE** | 3 Explorer handoffs; `PROJECT.md` Feature Inventory (19 features) |
| - | Dual Track: E2E Testing | Expand test suite to 91 tests across Tiers 1-4 | none | **DONE** | `tests/e2e/` (91/91 passing in 0.18s); `TEST_READY.md` certified |
| M1 | File Organization, DDD Restructuring & DTO Cleansing | Delete 451MB legacy backup, git mv 93 classes into bounded contexts, eliminate duplicate DTO fields in Java memory, realign test assertions | none | **DONE** | Gate Result: **PASS** (2 Reviewer APPROVE, 2 Challenger APPROVE, Auditor CLEAN). 67/67 backend tests pass, 91/91 E2E pass, frontend builds. |
| M2 | Backend Security & Real JWT RBAC | JJWT 0.12.5, BCrypt passwords, `com.pulseos.security`, `/api/v1/auth/login`, Spring Security role filters | M1 | **READY TO DISPATCH** | Blueprint in `PROJECT.md § Interface Contracts` & Survey 3 report |
| M3 | External Integrations: PayHere & Email Pipeline | `com.pulseos.notification` (async mail sender) and complete PayHere webhook + mock payment endpoint | M2 | PLANNED | Blueprint in `PROJECT.md` |
| M4 | Backend Landing & Schedule APIs | `/api/v1/landing/stats` and doctor schedule availability calculation | M2 | PLANNED | Blueprint in `PROJECT.md` |
| M5 | Frontend Clean Slate UI, Dashboards & Calendar | Wipe `.apple-*` slop, TailAdmin UI, 4 distinct role dashboards, dynamic landing, real calendar | M2, M3, M4 | PLANNED | Blueprint in `PROJECT.md` |
| M6 | Final Milestone: 100% E2E Pass & Adversarial Hardening | Pass 100% E2E test suite on live stack + Tier 5 Adversarial Coverage Hardening | M5 | PLANNED | Dual Track runner |

---

## 2. Active Subagents & Predecessor Roster
All 17 subagents spawned by Generation 1 have completed their work and delivered handoff reports:
- **Reviewer 1 (`faed6b73`)**: APPROVE (File cleanup, DDD layout, clean builds)
- **Reviewer 2 (`10b267c7`)**: APPROVE (DTO single-source-of-truth, reflection checks, wire compatibility)
- **Challenger 1 (`c56b87bc`)**: APPROVE (26/26 persistence challenge tests, Table-Per-Type inheritance, foreign keys)
- **Challenger 2 (`dbea5633`)**: APPROVE (37/37 DTO empirical tests, boundary cases, MockMvc endpoints)
- **Auditor 1 (`a9028724`)**: CLEAN (5/5 forensic checks pass, zero facades, zero bypasses, 451MB genuinely deleted)

No active subagents are currently pending.

---

## 3. Pending Decisions & Architecture Invariants

1. **JJWT Dependency for M2**:
   Add to `backend/pom.xml`:
   - `io.jsonwebtoken:jjwt-api:0.12.5`
   - `io.jsonwebtoken:jjwt-impl:0.12.5` (runtime scope)
   - `io.jsonwebtoken:jjwt-jackson:0.12.5` (runtime scope)
2. **Security Architecture for M2**:
   - Location: `backend/src/main/java/com/pulseos/security/`
   - Components to create:
     - `JwtTokenProvider.java`: HMAC-SHA256 signing (secret >= 256 bits, base64-encoded in `application.properties`), generate token with claims (`userId`, `username`, `role`, `fullName`), validate token, extract claims.
     - `JwtAuthenticationFilter.java`: `OncePerRequestFilter`, extracts Bearer token, validates, sets `SecurityContextHolder`.
     - `SecurityConfig.java`: Update existing `com.pulseos.config.SecurityConfig` or move to `com.pulseos.security.SecurityConfig`. Enable `@EnableMethodSecurity`. Allow public access to `/api/v1/auth/**`, `/api/v1/landing/**`, and PayHere webhook notify. Protect all clinical and administrative endpoints requiring specific role authorities (`ROLE_DOCTOR`, `ROLE_PATIENT`, `ROLE_RECEPTIONIST`, `ROLE_PHARMACIST`, `ROLE_LAB_TECHNICIAN`, `ROLE_SYSTEM_ADMIN`).
     - `AuthController.java`: Expose `POST /api/v1/auth/login` taking `{ username, password }`, returning JWT token and user profile. Support staff accounts (via email in `EmployeeRepository`) and patients (via NIC/passport in `PatientRepository`).
     - Passwords in `DataSeeder.java`: Hash seed passwords using `BCryptPasswordEncoder` (e.g. `password123` for all demo accounts).
3. **Dual Persistence Support**:
   - Keep dual persistence intact (`demo` profile with H2 in-memory MySQL emulation; `mysql` profile for MySQL 8.0).
4. **DTO Contract Compatibility**:
   - Any new DTOs in M2 (e.g., `AuthDTOs`) must follow the Single-Source-of-Truth rule: 0 duplicate fields in Java memory, using Jackson `@JsonProperty` and `@JsonAlias` if legacy compatibility is needed.

---

## 4. Concrete Next Steps for Successor (Generation 2)

1. **Initialize State**:
   - Read `PROJECT.md`, `ORIGINAL_REQUEST.md`, `handoff.md`, `BRIEFING.md`, and `progress.md`.
   - Start your own heartbeat cron (`schedule(CronExpression="*/10 * * * *")`).
2. **Execute Milestone 2 (Backend Security & Real JWT RBAC)**:
   - Follow the Project Pattern iteration loop (Explorer -> Worker -> Reviewer -> Challenger -> Auditor -> Gate):
     - Spawn 3 Explorers:
       - Explorer 1: JJWT dependency, `JwtTokenProvider`, and token specification.
       - Explorer 2: Spring Security filter chain, RBAC `@PreAuthorize` rules across all controllers.
       - Explorer 3: `AuthController`, password hashing in `DataSeeder`, and patient/staff dual login mapping.
     - Spawn 1 Worker to implement the changes and verify compilation and unit tests.
     - Spawn 2 Reviewers to review security correctness and endpoint protection.
     - Spawn 2 Challengers to test 401/403 guards, expired tokens, tampered signatures, and RBAC matrix.
     - Spawn 1 Forensic Auditor for integrity forensics.
     - Evaluate Gate in `GATE_STATUS.md`.
3. **Execute Milestones 3, 4, 5, and 6 sequentially**:
   - M3: External Integrations (PayHere & Email).
   - M4: Backend Landing & Schedule APIs.
   - M5: Frontend Clean Slate UI, Dashboards & Calendar.
   - M6: Final Milestone (100% E2E test pass on live stack + Tier 5 Adversarial Coverage Hardening).
   - Final victory report to Sentinel (`c60d41b2-7c9d-4469-b868-2b2309870d7f`).

---

## 5. Key Artifacts Index

- `/Users/admin/Projects/honda_leda/PROJECT.md` — Master Architecture, Feature Inventory, Milestones & Contracts
- `/Users/admin/Projects/honda_leda/.agents/teamwork/ORIGINAL_REQUEST.md` — Authoritative User Requirements
- `/Users/admin/Projects/honda_leda/TEST_READY.md` — E2E Test Suite Specification & Runner Command
- `/Users/admin/Projects/honda_leda/.agents/teamwork/teamwork_preview_orchestrator_1/GATE_STATUS.md` — Milestone 1 Gate Status (PASS)
- `/Users/admin/Projects/honda_leda/.agents/teamwork/teamwork_preview_orchestrator_1/progress.md` — Milestone Progress Log
- `/Users/admin/Projects/honda_leda/.agents/teamwork/teamwork_preview_orchestrator_1/BRIEFING.md` — Predecessor Briefing State
