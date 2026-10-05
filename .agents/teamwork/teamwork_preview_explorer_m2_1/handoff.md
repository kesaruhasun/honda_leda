# Handoff Report: Milestone 2 — JJWT Dependencies & Token Infrastructure (`com.pulseos.security`)

**Agent ID:** `teamwork_preview_explorer_m2_1`  
**Milestone:** M2 (Backend Security & Real JWT RBAC)  
**Date:** 2026-10-04  
**Status:** COMPLETE (Exploration & Architecture Specification)

---

## 1. Observation

### 1.1 Maven Configuration (`backend/pom.xml`)
- `backend/pom.xml` currently defines Spring Boot 3.2.12 parent (Java 17) and includes `spring-boot-starter-security` (lines 37-39).
- **No JJWT library dependencies are present.** Lines 37-40 show:
  ```xml
  37: 		<dependency>
  38: 			<groupId>org.springframework.boot</groupId>
  39: 			<artifactId>spring-boot-starter-security</artifactId>
  40: 		</dependency>
  ```
  Neither `io.jsonwebtoken:jjwt-api`, `jjwt-impl`, nor `jjwt-jackson` exists in the POM.

### 1.2 Application Properties Configuration (`backend/src/main/resources/application.yml`)
- `backend/src/main/resources/application.yml` contains application server port (`8080`), database profiles (`demo` with H2 and `mysql`), and `pulseos.payhere` config (lines 16-25).
- **No JWT configuration properties exist** under `pulseos:` or anywhere in the YAML.
- There is no `application.properties` file in `backend/src/main/resources/`; all application configuration is centralized in `application.yml`.

### 1.3 Security Package Status (`backend/src/main/java/com/pulseos`)
- The package directory `backend/src/main/java/com/pulseos/security` **does not exist yet**.
- Existing security configuration is located at `backend/src/main/java/com/pulseos/config/SecurityConfig.java`, which currently uses a permissive policy (`.anyRequest().permitAll()`) for initial development (lines 30-36).

### 1.4 Domain Models & User Types
- `com.pulseos.common.Person` defines `id`, `nicPassportNo`, `firstName`, `lastName`, and `getFullName()`.
- `com.pulseos.common.Employee` extends `Person`, contains `email`, `passwordHash`, and `employeeRole` (`DOCTOR`, `RECEPTIONIST`, `PHARMACIST`, `LAB_TECHNICIAN`, `SYSTEM_ADMIN`).
- `com.pulseos.patient.Patient` extends `Person`, contains `email`, `password`, and is discriminated as `PATIENT`.
- According to `PROJECT.md` (lines 85-98), the authentication response contract requires:
  - `userId`: `Long` (Person ID)
  - `username`: `String` (Email address)
  - `role`: `String` (e.g. `"DOCTOR"`, `"PATIENT"`, `"RECEPTIONIST"`, `"PHARMACIST"`, `"LAB_TECHNICIAN"`, `"SYSTEM_ADMIN"`)
  - `fullName`: `String` (Derived from `firstName + " " + lastName`)
  - `userType`: `String` (`"STAFF"` for Employees, `"PATIENT"` for Patients)

### 1.5 JJWT 0.12.5 API Breaking Changes vs Legacy 0.9.x / 0.11.x
- **Builder API:**
  - `Jwts.builder().setSubject(...)` is deprecated/replaced with `.subject(...)`.
  - `setIssuedAt(...)` and `setExpiration(...)` are replaced with `.issuedAt(...)` and `.expiration(...)`.
  - `.signWith(Key, SignatureAlgorithm)` is deprecated; in 0.12.x, `.signWith(SecretKey)` is preferred and automatically infers HMAC-SHA256 based on the key algorithm/size.
- **Parser API:**
  - `Jwts.parserBuilder()` is replaced with `Jwts.parser()`.
  - `.setSigningKey(...)` is replaced with `.verifyWith(SecretKey)`.
  - `.parseClaimsJws(token).getBody()` is replaced with `.parseSignedClaims(token).getPayload()`.
- **Key Decoding:**
  - `io.jsonwebtoken.io.Decoders.BASE64.decode(secret)` decodes Base64-encoded keys into byte arrays.
  - `io.jsonwebtoken.security.Keys.hmacShaKeyFor(byte[])` converts byte arrays into `javax.crypto.SecretKey`.
  - Minimum key length requirement for HMAC-SHA256 is strictly >= 256 bits (32 bytes). Shorter keys trigger `io.jsonwebtoken.security.WeakKeyException`.

---

## 2. Logic Chain

1. **Dependency Selection:**
   - Spring Boot 3.2.x uses Jakarta EE 10 (`jakarta.*` namespace) and Jackson 2.15+.
   - Modern JJWT 0.12.5 is fully compatible with Java 17 and Spring Boot 3.x.
   - The required artifacts are:
     - `io.jsonwebtoken:jjwt-api:0.12.5` (Compile scope for API interfaces).
     - `io.jsonwebtoken:jjwt-impl:0.12.5` (Runtime scope for token creation/parsing engine).
     - `io.jsonwebtoken:jjwt-jackson:0.12.5` (Runtime scope for Jackson JSON serializer integration).

2. **Configuration Architecture:**
   - Since `backend/src/main/resources/application.yml` is the active configuration file, the JWT configuration should be placed under the existing `pulseos:` block as `pulseos.jwt.secret` and `pulseos.jwt.expiration-ms`.
   - The secret key must be >= 256 bits (32 bytes). A Base64-encoded string representing 32 bytes (44 characters) or 64 bytes (88 characters) satisfies RFC 7518 Section 3.2.
   - Default fallback values should be configured in `@Value` annotations (`${pulseos.jwt.secret:...}`, `${pulseos.jwt.expiration-ms:86400000}`) to avoid test harness initialization failures when configuration is not explicitly loaded.

3. **Cryptographic Signing & Key Initialization:**
   - `Decoders.BASE64.decode(jwtSecret)` converts the Base64 string into `byte[]`.
   - A resilient fallback `jwtSecret.getBytes(StandardCharsets.UTF_8)` protects against unencoded raw secrets in local test scenarios.
   - `Keys.hmacShaKeyFor(keyBytes)` generates the `SecretKey` used for both signing in `Jwts.builder()` and verification in `Jwts.parser().verifyWith()`.

4. **Claims Specification & Type Safety:**
   - Claims must include: `userId`, `username`, `role`, `fullName`, and `userType`.
   - When claims are serialized to JSON and deserialized back via Jackson in JJWT, numeric fields (such as `userId = 101L`) are parsed as `java.lang.Integer`. Directly calling `claims.get("userId", Long.class)` can throw `ClassCastException`.
   - To guarantee type safety, `getUserIdFromToken` must check `if (userId instanceof Number number) return number.longValue()` and parse `String` representations if present.

5. **Safe Validation & Exception Handling:**
   - `validateToken(String token)` must catch all JJWT exception types without propagating runtime exceptions to the security filter:
     - `SecurityException` & `MalformedJwtException`: Invalid signature, corrupt structure, or tampered token.
     - `ExpiredJwtException`: Token past its `exp` timestamp.
     - `UnsupportedJwtException`: Unsupported token format or algorithm.
     - `IllegalArgumentException`: Empty, null, or whitespace-only token string.
     - `Exception`: Catch-all for unexpected parsing errors.
   - The method logs an appropriate error/warning and returns `false`.

---

## 3. Caveats

1. **JJWT 0.12.x vs Legacy Documentation:**
   - Many online tutorials use legacy 0.9.x or 0.11.x methods (`setSigningKey`, `parseClaimsJws`, `getBody`). The Worker must strictly use 0.12.5 modern syntax (`verifyWith`, `parseSignedClaims`, `getPayload`).
2. **Secret Key Length Validation:**
   - If a developer sets `pulseos.jwt.secret` to a string whose decoded bytes are fewer than 32 bytes (256 bits), JJWT will throw `WeakKeyException` on startup. The default secret provided below is guaranteed to be 256 bits (32 bytes).
3. **Spring Security Authorities:**
   - `getRoleFromToken` returns the raw role name (e.g., `"DOCTOR"`). When creating `SimpleGrantedAuthority`, Spring Security's `hasRole("DOCTOR")` expects `"ROLE_DOCTOR"`. The Worker should either ensure `SimpleGrantedAuthority("ROLE_" + role)` is created in `JwtAuthenticationFilter` or utilize the provided `getAuthoritiesFromToken` helper method.

---

## 4. Conclusion & Actionable Specifications

### 4.1 Exact Changes for `backend/pom.xml`

Insert the following dependencies directly inside `<dependencies>` in `backend/pom.xml`:

```xml
		<!-- JJWT (Java JSON Web Token) 0.12.5 -->
		<dependency>
			<groupId>io.jsonwebtoken</groupId>
			<artifactId>jjwt-api</artifactId>
			<version>0.12.5</version>
		</dependency>
		<dependency>
			<groupId>io.jsonwebtoken</groupId>
			<artifactId>jjwt-impl</artifactId>
			<version>0.12.5</version>
			<scope>runtime</scope>
		</dependency>
		<dependency>
			<groupId>io.jsonwebtoken</groupId>
			<artifactId>jjwt-jackson</artifactId>
			<version>0.12.5</version>
			<scope>runtime</scope>
		</dependency>
```

### 4.2 Exact Configuration for `backend/src/main/resources/application.yml`

Add the `jwt` block under `pulseos:` in `application.yml`:

```yaml
pulseos:
  jwt:
    # 256-bit Base64-encoded HMAC-SHA256 key
    secret: "7J+fvdU7B4rwLPxxbxZpDocaYcCaypaMezPOJI5AlBc="
    # Token validity: 86400000 ms = 24 hours (1 day)
    expiration-ms: 86400000
  payhere:
    merchant-id: "1220000"
    merchant-secret: "sandbox_secret_sliit_pulseos_2026"
    ...
```

If an `application.properties` format is used, the equivalent keys are:
```properties
pulseos.jwt.secret=7J+fvdU7B4rwLPxxbxZpDocaYcCaypaMezPOJI5AlBc=
pulseos.jwt.expiration-ms=86400000
```

### 4.3 Implementation Code Template: `JwtTokenProvider.java`

**File Path:** `backend/src/main/java/com/pulseos/security/JwtTokenProvider.java`

```java
package com.pulseos.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SecurityException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * PulseOS JWT Token Provider
 * Handles token generation, HMAC-SHA256 cryptographic signing, claims extraction,
 * and safe non-throwing token validation using JJWT 0.12.5.
 */
@Component
@Slf4j
public class JwtTokenProvider {

    // 256-bit Base64-encoded default key for safe fallback in all environments
    private static final String DEFAULT_SECRET = "7J+fvdU7B4rwLPxxbxZpDocaYcCaypaMezPOJI5AlBc=";
    private static final long DEFAULT_EXPIRATION_MS = 86400000L; // 24 Hours

    @Value("${pulseos.jwt.secret:" + DEFAULT_SECRET + "}")
    private String jwtSecret;

    @Value("${pulseos.jwt.expiration-ms:" + DEFAULT_EXPIRATION_MS + "}")
    private long jwtExpirationMs;

    /**
     * Resolves the HMAC-SHA256 SecretKey from configured Base64 secret.
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(jwtSecret);
        } catch (Exception e) {
            log.warn("Failed to Base64-decode jwtSecret, falling back to UTF-8 bytes: {}", e.getMessage());
            keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Generates a signed JWT with full PulseOS role and user identity claims.
     *
     * @param userId   User ID (Person PK)
     * @param username Email or login username
     * @param role     Role name (DOCTOR, PATIENT, RECEPTIONIST, PHARMACIST, LAB_TECHNICIAN, SYSTEM_ADMIN)
     * @param fullName User display name
     * @param userType User category ("STAFF" or "PATIENT")
     * @return Compact serialized JWT
     */
    public String generateToken(Long userId, String username, String role, String fullName, String userType) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(username)
                .claim("userId", userId)
                .claim("username", username)
                .claim("role", role)
                .claim("fullName", fullName)
                .claim("userType", userType)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Overload for generating tokens with custom claims map.
     */
    public String generateToken(String subject, Map<String, Object> extraClaims) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        var builder = Jwts.builder()
                .subject(subject)
                .issuedAt(now)
                .expiration(expiryDate);

        if (extraClaims != null && !extraClaims.isEmpty()) {
            extraClaims.forEach(builder::claim);
        }

        return builder
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Validates a JWT string safely without throwing unhandled exceptions.
     *
     * @param token JWT string to validate
     * @return true if valid and unexpired; false otherwise
     */
    public boolean validateToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            log.warn("JWT token validation failed: token is null or empty");
            return false;
        }

        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (SecurityException | MalformedJwtException e) {
            log.error("Invalid JWT signature or malformed token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("Expired JWT token: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("Unsupported JWT token: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty or invalid: {}", e.getMessage());
        } catch (Exception e) {
            log.error("JWT token verification failed: {}", e.getMessage());
        }
        return false;
    }

    /**
     * Parses and returns the token payload Claims.
     */
    public Claims getClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Extracts username (subject) from token.
     */
    public String getUsernameFromToken(String token) {
        return getClaimsFromToken(token).getSubject();
    }

    /**
     * Extracts role claim from token (e.g. "DOCTOR", "PATIENT").
     */
    public String getRoleFromToken(String token) {
        return getClaimsFromToken(token).get("role", String.class);
    }

    /**
     * Extracts userId claim with type safety against Jackson Integer/Long conversions.
     */
    public Long getUserIdFromToken(String token) {
        Object userId = getClaimsFromToken(token).get("userId");
        if (userId instanceof Number number) {
            return number.longValue();
        } else if (userId instanceof String str) {
            return Long.parseLong(str);
        }
        return null;
    }

    /**
     * Extracts fullName claim from token.
     */
    public String getFullNameFromToken(String token) {
        return getClaimsFromToken(token).get("fullName", String.class);
    }

    /**
     * Extracts userType claim from token ("STAFF" or "PATIENT").
     */
    public String getUserTypeFromToken(String token) {
        return getClaimsFromToken(token).get("userType", String.class);
    }

    /**
     * Extracts token expiration timestamp.
     */
    public Date getExpirationDateFromToken(String token) {
        return getClaimsFromToken(token).getExpiration();
    }

    /**
     * Helper to retrieve Spring Security GrantedAuthorities with ROLE_ prefix.
     */
    public List<SimpleGrantedAuthority> getAuthoritiesFromToken(String token) {
        String role = getRoleFromToken(token);
        if (role == null || role.isBlank()) {
            return Collections.emptyList();
        }
        String authority = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        return List.of(new SimpleGrantedAuthority(authority));
    }
}
```

### 4.4 Unit Test Specification: `JwtTokenProviderTest.java`

**File Path:** `backend/src/test/java/com/pulseos/security/JwtTokenProviderTest.java`

```java
package com.pulseos.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;
    private final String testSecret = "7J+fvdU7B4rwLPxxbxZpDocaYcCaypaMezPOJI5AlBc=";
    private final long testExpirationMs = 3600000L; // 1 hour

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(tokenProvider, "jwtSecret", testSecret);
        ReflectionTestUtils.setField(tokenProvider, "jwtExpirationMs", testExpirationMs);
    }

    @Test
    @DisplayName("Successfully generate and validate a token for staff doctor")
    void testGenerateAndValidateStaffToken() {
        String token = tokenProvider.generateToken(
                101L,
                "doc.kavinda@pulseos.lk",
                "DOCTOR",
                "Dr. Kavinda Rathnayaka",
                "STAFF"
        );

        assertThat(token).isNotBlank();
        assertThat(tokenProvider.validateToken(token)).isTrue();
        assertThat(tokenProvider.getUsernameFromToken(token)).isEqualTo("doc.kavinda@pulseos.lk");
        assertThat(tokenProvider.getRoleFromToken(token)).isEqualTo("DOCTOR");
        assertThat(tokenProvider.getUserIdFromToken(token)).isEqualTo(101L);
        assertThat(tokenProvider.getFullNameFromToken(token)).isEqualTo("Dr. Kavinda Rathnayaka");
        assertThat(tokenProvider.getUserTypeFromToken(token)).isEqualTo("STAFF");
        assertThat(tokenProvider.getAuthoritiesFromToken(token))
                .extracting("authority")
                .containsExactly("ROLE_DOCTOR");
    }

    @Test
    @DisplayName("Successfully generate and validate a token for patient")
    void testGenerateAndValidatePatientToken() {
        String token = tokenProvider.generateToken(
                202L,
                "patient.kamal@gmail.com",
                "PATIENT",
                "Kamal Silva",
                "PATIENT"
        );

        assertThat(token).isNotBlank();
        assertThat(tokenProvider.validateToken(token)).isTrue();
        assertThat(tokenProvider.getRoleFromToken(token)).isEqualTo("PATIENT");
        assertThat(tokenProvider.getUserTypeFromToken(token)).isEqualTo("PATIENT");
        assertThat(tokenProvider.getAuthoritiesFromToken(token))
                .extracting("authority")
                .containsExactly("ROLE_PATIENT");
    }

    @Test
    @DisplayName("Validate returns false for expired token without throwing exception")
    void testExpiredTokenHandling() {
        // Create a provider with negative expiration to simulate expired token
        JwtTokenProvider expiredProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(expiredProvider, "jwtSecret", testSecret);
        ReflectionTestUtils.setField(expiredProvider, "jwtExpirationMs", -5000L);

        String expiredToken = expiredProvider.generateToken(
                101L,
                "doc.kavinda@pulseos.lk",
                "DOCTOR",
                "Dr. Kavinda Rathnayaka",
                "STAFF"
        );

        assertThat(tokenProvider.validateToken(expiredToken)).isFalse();
    }

    @Test
    @DisplayName("Validate returns false for malformed or tampered token without throwing exception")
    void testMalformedAndTamperedTokens() {
        assertThat(tokenProvider.validateToken("not-a-token")).isFalse();
        assertThat(tokenProvider.validateToken("")).isFalse();
        assertThat(tokenProvider.validateToken(null)).isFalse();

        // Valid token tampered in payload
        String validToken = tokenProvider.generateToken(
                101L, "doc.kavinda@pulseos.lk", "DOCTOR", "Dr. Kavinda Rathnayaka", "STAFF"
        );
        String tamperedToken = validToken.substring(0, validToken.length() - 5) + "abcde";
        assertThat(tokenProvider.validateToken(tamperedToken)).isFalse();
    }

    @Test
    @DisplayName("Numeric userId extraction handles both Integer and Long representations")
    void testUserIdTypeSafety() {
        String token = tokenProvider.generateToken(
                55L, "test@pulseos.lk", "RECEPTIONIST", "Dila Perera", "STAFF"
        );

        Long userId = tokenProvider.getUserIdFromToken(token);
        assertThat(userId).isEqualTo(55L);
    }
}
```

---

## 5. Verification Method

### 5.1 Verification Commands for the Worker

Once the Worker applies the POM dependencies and places `JwtTokenProvider.java` and `JwtTokenProviderTest.java`:

1. **Verify JJWT Maven Resolution:**
   ```bash
   cd /Users/admin/Projects/honda_leda/backend
   ./mvnw dependency:resolve -DincludeGroupIds=io.jsonwebtoken
   ```
   **Expected Result:** `BUILD SUCCESS` resolving `jjwt-api`, `jjwt-impl`, and `jjwt-jackson` at `0.12.5`.

2. **Run Dedicated Security Unit Tests:**
   ```bash
   cd /Users/admin/Projects/honda_leda/backend
   ./mvnw test -Dtest=JwtTokenProviderTest
   ```
   **Expected Result:** All 5 tests pass with 0 failures and 0 errors.

3. **Run Full Backend Regression Test Suite:**
   ```bash
   cd /Users/admin/Projects/honda_leda/backend
   ./mvnw test
   ```
   **Expected Result:** All 67 existing tests + new security tests pass cleanly (`BUILD SUCCESS`).

### 5.2 Invalidation Conditions
- Any occurrence of `WeakKeyException`: Indicates secret key length was configured below 256 bits (32 bytes).
- Any occurrence of `ClassCastException` on `getUserIdFromToken`: Indicates casting `Object` to `Long` directly instead of using `Number.longValue()`.
- Any unhandled `ExpiredJwtException` or `MalformedJwtException` during authentication filters: Indicates `validateToken()` threw rather than returning `false`.
