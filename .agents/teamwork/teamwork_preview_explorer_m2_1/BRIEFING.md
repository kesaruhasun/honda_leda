# BRIEFING — 2026-10-04T16:25:00Z

## Mission
Explore JJWT dependencies and architect the `JwtTokenProvider.java` token infrastructure in `com.pulseos.security` for Milestone 2.

## 🔒 My Identity
- Archetype: explorer
- Roles: investigator, synthesizer
- Working directory: /Users/admin/Projects/honda_leda/.agents/teamwork/teamwork_preview_explorer_m2_1
- Original parent: 53026021-3d77-4d55-898c-57217ce35a26
- Milestone: M2

## 🔒 Key Constraints
- Read-only investigation — do NOT modify or implement source code files
- Provide exact implementation specifications, code templates, and property keys for Worker
- Follow Handoff Protocol (Observation, Logic Chain, Caveats, Conclusion, Verification Method)

## Current Parent
- Conversation ID: 53026021-3d77-4d55-898c-57217ce35a26
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `backend/pom.xml`: missing JJWT dependencies
  - `backend/src/main/resources/application.yml`: current YAML structure, lacking `pulseos.jwt` keys
  - `backend/src/main/java/com/pulseos/config/SecurityConfig.java`: temporary `permitAll()` setup
  - `backend/src/main/java/com/pulseos/common/Employee.java`, `Person.java`, `EmployeeRole.java`, `Patient.java`: domain models and user types (`STAFF` vs `PATIENT`, role names)
  - JJWT 0.12.5 API mechanics: `Jwts.builder()`, `Jwts.parser()`, `verifyWith()`, `parseSignedClaims()`, `getPayload()`, `Decoders.BASE64`, `Keys.hmacShaKeyFor`
- **Key findings**:
  - Modern JJWT 0.12.5 replaces deprecated 0.9.x / 0.11.x methods (`parserBuilder()`, `setSigningKey()`, `getBody()`).
  - ClassCastException risk with `userId` numeric claim: must use `Number.longValue()` rather than casting directly to `Long`.
  - Secret key must be >= 256 bits (32 bytes) Base64 encoded to satisfy RFC 7518 HMAC-SHA256 requirements.
  - Safe exception hierarchy: `SecurityException`, `MalformedJwtException`, `ExpiredJwtException`, `UnsupportedJwtException`, `IllegalArgumentException`.
- **Unexplored areas**: None for M2 token provider scope.

## Key Decisions Made
- Standardize dependencies to JJWT 0.12.5 trio (`jjwt-api`, runtime `jjwt-impl`, runtime `jjwt-jackson`).
- Set property keys: `pulseos.jwt.secret` (256-bit Base64) and `pulseos.jwt.expiration-ms` (86400000 = 24h).
- Design `JwtTokenProvider.java` in `com.pulseos.security` with full claims extraction, type-safe ID extraction, and non-throwing `validateToken()`.

## Artifact Index
- `/Users/admin/Projects/honda_leda/.agents/teamwork/teamwork_preview_explorer_m2_1/handoff.md` — Comprehensive handoff report for Worker
- `/Users/admin/Projects/honda_leda/.agents/teamwork/teamwork_preview_explorer_m2_1/progress.md` — Liveness heartbeat
