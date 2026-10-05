# Progress Tracker — Milestone 2 Implementation

Last visited: 2026-10-04T19:58:12Z

## Status
- [ ] 1. Read and review Explorer 1, 2, 3 reports
- [ ] 2. Update `backend/pom.xml` with JJWT 0.12.5 dependencies
- [ ] 3. Update `backend/src/main/resources/application.yml` with JWT secret & expiration
- [ ] 4. Update domain models & repositories: `Person.java`, `Employee.java`, `Patient.java`, `PatientRepository.java`
- [ ] 5. Implement `com.pulseos.security` package (JWT, SecurityConfig, DTOs, AuthService, AuthController)
- [ ] 6. Delete obsolete `backend/src/main/java/com/pulseos/config/SecurityConfig.java`
- [ ] 7. Update controllers: remove `@CrossOrigin(origins = "*")` and apply `@PreAuthorize`
- [ ] 8. Update `GlobalExceptionHandler.java` with 401/403 handlers
- [ ] 9. Update `DataSeeder.java` with BCrypt password hashes
- [ ] 10. Implement test suites in `backend/src/test/java/com/pulseos/security/`
- [ ] 11. Run `mvn test-compile`, `mvn test`, `tests/e2e/run_tests.sh --mock`, and `npm run build`
- [ ] 12. Finalize handoff.md and report to parent
