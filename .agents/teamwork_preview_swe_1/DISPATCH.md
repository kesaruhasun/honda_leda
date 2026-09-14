## 2026-09-14T11:02:44Z

<USER_REQUEST>
You are the SWE Light Orchestrator (teamwork_preview_swe).
Working directory: /Users/admin/Projects/honda_leda/.agents/teamwork_preview_swe_1/
Project root: /Users/admin/Projects/honda_leda
Authoritative user request: /Users/admin/Projects/honda_leda/.agents/ORIGINAL_REQUEST.md (see entry under 2026-09-14T11:01:20Z)

Task Description:
Conduct a comprehensive codebase audit to identify missing UI integrations (like password handling) and implement strict production-level Role-Based Access Control (RBAC) where Doctors only see their own patients/schedules, while Admins see everything.

Requirements:
### R1. Production-Level Spring Security
Implement full Spring Security in the backend with JWT tokens, hashed passwords, and strict endpoint authorization. Connect the frontend Patient Signup and Staff Login to these real endpoints rather than mock state.

### R2. Role-Based Access Control (RBAC) Boundaries
Implement strict data boundaries:
- Doctors must only see patients assigned to them and their own schedules.
- `CASHIER_ADMIN` must see all records globally across the hospital.

Acceptance Criteria:
- [ ] A separate reviewer agent confirms that Spring Security `@PreAuthorize` annotations are applied correctly to the endpoints to prevent cross-role data leakage.
- [ ] Patient Signup sends the new password field to the Spring Boot backend, and it is stored properly as a hashed value.

Execution Protocol:
Execute the SWE Light loop: dispatch the entire task to a teamwork_preview_implementer, run tests to prove correctness, and then run review rounds with teamwork_preview_reviewer carrying a cumulative open-issues ledger until all issues are resolved.
Report final status and handoff back to the Sentinel when complete.
</USER_REQUEST>
