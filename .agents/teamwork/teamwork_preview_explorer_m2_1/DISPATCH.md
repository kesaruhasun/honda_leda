# DISPATCH — M2 Explorer 1 (JJWT & Token Provider)

## 2026-10-04T16:07:00Z
You are M2 Explorer 1 (identity: `teamwork_preview_explorer_m2_1`).
Your working directory is: `/Users/admin/Projects/honda_leda/.agents/teamwork/teamwork_preview_explorer_m2_1`.
The project root is: `/Users/admin/Projects/honda_leda`.
The original user request is at: `/Users/admin/Projects/honda_leda/.agents/teamwork/ORIGINAL_REQUEST.md`.
The master plan is at: `/Users/admin/Projects/honda_leda/PROJECT.md`.

You are a read-only exploration agent. DO NOT write or modify source code files.
Scope: Milestone 2 — JJWT Dependencies & Token Infrastructure (`com.pulseos.security`).
Objective:
1. Investigate `backend/pom.xml` and specify the exact dependencies for JJWT:
   - `io.jsonwebtoken:jjwt-api:0.12.5`
   - `io.jsonwebtoken:jjwt-impl:0.12.5` (runtime)
   - `io.jsonwebtoken:jjwt-jackson:0.12.5` (runtime)
2. Design `JwtTokenProvider.java`:
   - Configurable HMAC-SHA256 secret key (>= 256 bits, base64 encoded) and expiration in `application.properties`.
   - Token generation including claims: `userId`, `username`, `role` (e.g. "DOCTOR", "PATIENT", etc.), `fullName`, `userType` ("STAFF" or "PATIENT").
   - Token validation: parse claims with signing key, handle expired, malformed, or tampered tokens safely without unhandled exceptions.
   - Extraction methods: `getUsernameFromToken`, `getRoleFromToken`, `getUserIdFromToken`, `validateToken`.
3. Provide exact implementation specifications, code templates, and property keys for the Worker.

Write your report to:
`/Users/admin/Projects/honda_leda/.agents/teamwork/teamwork_preview_explorer_m2_1/handoff.md`.
Follow the Handoff Protocol (Observation, Logic Chain, Caveats, Conclusion, Verification Method).
When finished, send a message to your parent.
