# Handoff Report: Milestone 2 — Spring Security Configuration, Filter Chain & RBAC (`com.pulseos.security`)

**Agent ID:** `teamwork_preview_explorer_m2_2`  
**Milestone:** M2 (Backend Security & Real JWT RBAC)  
**Date:** 2026-10-04  
**Status:** COMPLETE (Exploration, Design & RBAC Audit Specification)

---

## 1. Observation

### 1.1 Existing Security Configuration (`backend/src/main/java/com/pulseos/config/SecurityConfig.java`)
- **Location:** The existing configuration is in package `com.pulseos.config` rather than `com.pulseos.security`.
- **Permissive Access:** Line 35 configures `.anyRequest().permitAll()`, leaving all API endpoints exposed without authentication.
- **CSRF Configuration:** Line 23 uses `.csrf(csrf -> csrf.ignoringRequestMatchers("/h2-console/**", "/db-console/**", "/api/**", "/api/v1/**").disable())`. For a stateless REST API, global disablement (`http.csrf(AbstractHttpConfigurer::disable)`) is standard.
- **Session Management Missing:** No `SessionCreationPolicy.STATELESS` is configured.
- **Method Security Missing:** Neither `@EnableMethodSecurity` nor `@EnableGlobalMethodSecurity` is declared, meaning any `@PreAuthorize` annotations on controllers are completely ignored by Spring AOP.
- **Authentication & Authorization Handlers Missing:** No custom `AuthenticationEntryPoint` (HTTP 401 JSON) or `AccessDeniedHandler` (HTTP 403 JSON) is registered.
- **PasswordEncoder Missing:** No `PasswordEncoder` bean (`BCryptPasswordEncoder`) is exposed in the application context.
- **Duplicate Config Hazard:** If the Worker creates `backend/src/main/java/com/pulseos/security/SecurityConfig.java` without deleting `backend/src/main/java/com/pulseos/config/SecurityConfig.java`, Spring will detect conflicting `@Configuration` beans with identical bean names or conflicting `SecurityFilterChain` beans.

### 1.2 CORS Configuration vs. Controller Wildcard Conflict
- `SecurityConfig.java` defines a `CorsConfigurationSource` with `allowCredentials(true)` and origins:
  `http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:3000`, `http://127.0.0.1:3000`.
- However, all 7 existing domain controllers (`PatientController`, `DoctorController`, `AppointmentController`, `BillingController`, `PaymentController`, `LaboratoryController`, `PharmacyController`) declare class-level:
  ```java
  @CrossOrigin(origins = "*")
  ```
- **W3C / WHATWG Spec Conflict:** When a browser issues a credentialed request (`withCredentials: true` / `Authorization` header), the CORS specification strictly prohibits wildcard `Access-Control-Allow-Origin: *`. If class-level `@CrossOrigin(origins = "*")` remains, browsers will reject API calls. Centralized configuration in `CorsConfigurationSource` is required.

### 1.3 Exception Handler Masking Hazard (`backend/src/main/java/com/pulseos/common/GlobalExceptionHandler.java`)
- Lines 67-73 of `GlobalExceptionHandler.java` declare:
  ```java
  @ExceptionHandler(Exception.class)
  public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
      Map<String, Object> body = new LinkedHashMap<>();
      body.put("error", "Internal Server Error");
      body.put("message", ex.getMessage() != null ? ex.getMessage() : "An unexpected error occurred");
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
  }
  ```
- When a controller method fails a `@PreAuthorize` check, Spring Security throws `org.springframework.security.access.AccessDeniedException`.
- Because `AccessDeniedException` is a subclass of `RuntimeException` (which is an `Exception`), `GlobalExceptionHandler`'s catch-all `handleGenericException` intercepts it and returns **HTTP 500 Internal Server Error** instead of **HTTP 403 Forbidden**.
- An explicit `@ExceptionHandler(AccessDeniedException.class)` returning `HttpStatus.FORBIDDEN` is required.

### 1.4 Controller Inventory and Endpoint Audit
Investigation identified 8 active controllers containing 28 endpoint methods:
1. `PatientController.java` (`/api/v1/patients`) — 8 endpoints: `getAllPatients`, `searchPatients`, `createPatient`, `getPatientByNic`, `getPatientById`, `updatePatient`, `archivePatient`, `restorePatient`.
2. `DoctorController.java` (`/api/v1/doctors`) — 7 endpoints: `getAllDoctors`, `getDoctorById`, `createDoctor`, `updateAvailability`, `updateFee`, `getSchedules`, `createSchedule`.
3. `AppointmentController.java` (`/api/v1/appointments`) — 7 endpoints: `getAllAppointments`, `getTodayAppointments`, `getAppointmentById`, `createAppointment`, `rescheduleAppointment`, `cancelAppointment`, `completeAppointment`.
4. `BillingController.java` (`/api/v1/billing`) — 4 endpoints: `getAllInvoices`, `getInvoiceById`, `generateInvoice`, `settleInvoice`.
5. `PaymentController.java` (`/api/v1/payments`) — 2 endpoints: `initiatePayHere` (authenticated), `payHereNotify` (PUBLIC PayHere IPN webhook).
6. `LaboratoryController.java` (`/api/v1/laboratory`) — 6 endpoints: `getCatalog`, `getAllTests`, `createTest`, `updateTestStatus`, `submitResults`, `deleteTest`.
7. `PharmacyController.java` (`/api/v1/pharmacy`) — 6 endpoints: `getAllDrugs`, `getLowStockDrugs`, `addDrug`, `getAllPrescriptions`, `createPrescription`, `dispensePrescription`.
8. `HealthCheckController.java` (`/api/v1/health`, `/health`) — 1 endpoint: `getHealthStatus` (PUBLIC).

### 1.5 Roles Defined in Domain vs. Interface Contracts
- `EmployeeRole.java`: `DOCTOR`, `RECEPTIONIST`, `PHARMACIST`, `LAB_TECHNICIAN`, `SYSTEM_ADMIN`.
- `Patient.java`: Discriminator `PATIENT`.
- `PROJECT.md` Interface Contracts:
  - `DOCTOR`: Access clinical encounters, patient records, prescribe medications.
  - `RECEPTIONIST`: Patient intake, triage assignment, appointment bookings.
  - `PHARMACIST`: Drug inventory, dispensations.
  - `LAB_TECHNICIAN`: Laboratory orders, diagnostic test results.
  - `MANAGER` / `ADMIN`: Executive KPI reports, billing oversight, staff roster, capacity.
  - `PATIENT`: Own appointments, own prescriptions, own lab reports, own invoices.

---

## 2. Logic Chain

1. **Relocating and Modernizing `SecurityConfig`:**
   - As mandated by DDD package layout (`PROJECT.md` line 151), security classes reside in `com.pulseos.security`.
   - `SecurityConfig` must be annotated with `@Configuration`, `@EnableWebSecurity`, and `@EnableMethodSecurity(prePostEnabled = true)`.
   - The obsolete file `backend/src/main/java/com/pulseos/config/SecurityConfig.java` must be deleted to avoid duplicate bean definition clashes.

2. **Stateless JWT Security Filter Chain Architecture:**
   - REST APIs authenticated via JWT tokens must be stateless (`SessionCreationPolicy.STATELESS`).
   - CSRF protection is unnecessary for stateless Bearer token APIs and must be disabled (`http.csrf(AbstractHttpConfigurer::disable)`).
   - Frame options (`sameOrigin`) must be retained to permit the embedded H2 console in demo profile (`/h2-console/**`).
   - Public whitelist endpoints:
     - `/api/v1/auth/**` (login and token refresh)
     - `/api/v1/landing/**` (public landing page stats and catalogs)
     - `/api/v1/payments/payhere/notify` (PayHere server-to-server IPN webhook)
     - `/h2-console/**`, `/db-console/**` (H2 database console)
     - `/api/v1/health`, `/health`, `/error` (operational health checks and internal error dispatcher)
   - All other endpoints require authentication (`anyRequest().authenticated()`).

3. **Custom Exception Handling (JSON 401 & 403):**
   - Unauthenticated requests to protected endpoints must trigger `JwtAuthenticationEntryPoint`, returning HTTP 401 Unauthorized with JSON payload:
     `{ "error": "Unauthorized", "message": "...", "status": 401, "path": "...", "timestamp": "..." }`.
   - Authenticated requests with insufficient role privileges must trigger `JwtAccessDeniedHandler`, returning HTTP 403 Forbidden with JSON payload:
     `{ "error": "Forbidden", "message": "...", "status": 403, "path": "...", "timestamp": "..." }`.
   - In addition, `GlobalExceptionHandler` must handle `AccessDeniedException` directly to prevent method security exceptions thrown inside the Spring MVC dispatcher from collapsing into HTTP 500 errors.

4. **`JwtAuthenticationFilter` Mechanics:**
   - Extends `OncePerRequestFilter` to ensure single execution per HTTP request.
   - Parses the `Authorization` header, validating `Bearer <token>`.
   - Calls `jwtTokenProvider.validateToken(token)`.
   - If valid, extracts `username` and `role`.
   - Converts the role to a `SimpleGrantedAuthority`. Spring Security's `hasRole('DOCTOR')` requires authority `"ROLE_DOCTOR"`.
   - **Role Aliasing for Administrators:** In the domain model, administrators hold `SYSTEM_ADMIN`. To seamlessly satisfy checks for `ADMIN` and `MANAGER`, `buildAuthorities` adds `ROLE_SYSTEM_ADMIN`, `ROLE_ADMIN`, and `ROLE_MANAGER`.
   - Builds `UsernamePasswordAuthenticationToken` and populates `SecurityContextHolder.getContext().setAuthentication(auth)`.
   - Handles malformed/expired tokens gracefully by clearing security context and allowing the filter chain to continue (allowing `AuthenticationEntryPoint` to return clean 401 JSON).

5. **Eliminating Controller-Level `@CrossOrigin`:**
   - Removing `@CrossOrigin(origins = "*")` from all 7 controllers eliminates CORS browser header conflicts with `allowCredentials(true)` while centralizing CORS policy in `SecurityConfig`.

6. **Controller RBAC Mapping:**
   - Every domain endpoint is secured using `@PreAuthorize` expressions adhering to the role privileges specified in `PROJECT.md`.

---

## 3. Caveats

1. **Old File Deletion:** The Worker must explicitly delete `backend/src/main/java/com/pulseos/config/SecurityConfig.java` when creating `backend/src/main/java/com/pulseos/security/SecurityConfig.java`. Failing to delete it will cause Spring Boot startup failure.
2. **`GlobalExceptionHandler` Interception:** The Worker must add `@ExceptionHandler(AccessDeniedException.class)` to `GlobalExceptionHandler.java`; otherwise, `@PreAuthorize` 403 errors will be rendered as 500 errors.
3. **PayHere Webhook Exception:** `/api/v1/payments/payhere/notify` must NEVER have `@PreAuthorize` applied, and MUST be permitted in `SecurityFilterChain` because PayHere's servers invoke it directly via POST without client JWT credentials.
4. **Standalone MockMvc Tests:** Tests using `MockMvcBuilders.standaloneSetup(...)` (e.g., `DtoSerializationEmpiricalChallengeTest.java`) will continue to run unaffected by method security unless Spring Security AOP proxies are explicitly registered in the standalone builder.

---

## 4. Conclusion & Actionable Specifications

### 4.1 Delete Obsolete Configuration
**Action for Worker:** Delete file:
`/Users/admin/Projects/honda_leda/backend/src/main/java/com/pulseos/config/SecurityConfig.java`

---

### 4.2 Modernized `SecurityConfig.java`
**File Path:** `backend/src/main/java/com/pulseos/security/SecurityConfig.java`

```java
package com.pulseos.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint authenticationEntryPoint;
    private final JwtAccessDeniedHandler accessDeniedHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Central CORS Configuration
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 2. Disable CSRF for Stateless JWT REST API
            .csrf(AbstractHttpConfigurer::disable)

            // 3. Stateless Session Management
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // 4. Custom JSON 401 & 403 Exception Handlers
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(authenticationEntryPoint)
                .accessDeniedHandler(accessDeniedHandler)
            )

            // 5. Permit Frame Options for Embedded H2 Console (Demo Profile)
            .headers(headers -> headers
                .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin)
            )

            // 6. Request Authorization Rules
            .authorizeHttpRequests(auth -> auth
                // Public authentication endpoints
                .requestMatchers("/api/v1/auth/**").permitAll()
                // Public dynamic landing page stats and catalogs
                .requestMatchers("/api/v1/landing/**").permitAll()
                // PayHere IPN Webhook callback (unauthenticated server-to-server POST)
                .requestMatchers("/api/v1/payments/payhere/notify").permitAll()
                // Embedded H2 database web console (demo profile)
                .requestMatchers("/h2-console/**", "/db-console/**").permitAll()
                // Operational health check probes and error dispatcher
                .requestMatchers("/api/v1/health", "/health", "/error").permitAll()
                // All other endpoints strictly require authenticated JWT
                .anyRequest().authenticated()
            )

            // 7. Register JWT Filter before UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000"
        ));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "Accept",
            "Origin",
            "X-Requested-With",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));
        config.setExposedHeaders(Arrays.asList("Authorization", "Content-Disposition"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
```

---

### 4.3 `JwtAuthenticationFilter.java`
**File Path:** `backend/src/main/java/com/pulseos/security/JwtAuthenticationFilter.java`

```java
package com.pulseos.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Filter that intercepts incoming HTTP requests, extracts Bearer JWT tokens,
 * validates signatures, maps granted authorities with ROLE_ prefix and role aliases,
 * and sets authentication in the Spring SecurityContext.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        try {
            String token = resolveToken(request);
            if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {
                String username = jwtTokenProvider.getUsernameFromToken(token);
                String role = jwtTokenProvider.getRoleFromToken(token);

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    List<SimpleGrantedAuthority> authorities = buildAuthorities(role);

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            username,
                            null,
                            authorities
                    );
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    log.debug("Authenticated user '{}' with authorities {} for URI: {}", username, authorities, request.getRequestURI());
                }
            }
        } catch (Exception ex) {
            log.error("Failed to process JWT authentication token: {}", ex.getMessage());
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7).trim();
        }
        return null;
    }

    private List<SimpleGrantedAuthority> buildAuthorities(String role) {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        if (role == null || role.isBlank()) {
            return authorities;
        }

        String primaryRole = role.startsWith("ROLE_") ? role : "ROLE_" + role.toUpperCase();
        authorities.add(new SimpleGrantedAuthority(primaryRole));

        // Alias administrative roles so SYSTEM_ADMIN satisfies ADMIN and MANAGER checks
        if ("ROLE_SYSTEM_ADMIN".equalsIgnoreCase(primaryRole)) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
            authorities.add(new SimpleGrantedAuthority("ROLE_MANAGER"));
        } else if ("ROLE_ADMIN".equalsIgnoreCase(primaryRole)) {
            authorities.add(new SimpleGrantedAuthority("ROLE_SYSTEM_ADMIN"));
            authorities.add(new SimpleGrantedAuthority("ROLE_MANAGER"));
        } else if ("ROLE_MANAGER".equalsIgnoreCase(primaryRole)) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }

        return authorities;
    }
}
```

---

### 4.4 Custom JSON Error Handlers

#### `JwtAuthenticationEntryPoint.java`
**File Path:** `backend/src/main/java/com/pulseos/security/JwtAuthenticationEntryPoint.java`

```java
package com.pulseos.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Handles unauthenticated requests by returning a structured JSON 401 response.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        log.warn("Unauthorized request to {}: {}", request.getRequestURI(), authException.getMessage());

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", "Unauthorized");
        body.put("message", authException.getMessage() != null && !authException.getMessage().isBlank()
                ? authException.getMessage()
                : "Full authentication is required to access this resource");
        body.put("status", HttpStatus.UNAUTHORIZED.value());
        body.put("path", request.getRequestURI());
        body.put("timestamp", LocalDateTime.now().toString());

        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
```

#### `JwtAccessDeniedHandler.java`
**File Path:** `backend/src/main/java/com/pulseos/security/JwtAccessDeniedHandler.java`

```java
package com.pulseos.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Handles authenticated requests that lack required role permissions by returning a structured JSON 403 response.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        log.warn("Access denied for URI {}: {}", request.getRequestURI(), accessDeniedException.getMessage());

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", "Forbidden");
        body.put("message", "Access denied: You do not have permission to access this resource");
        body.put("status", HttpStatus.FORBIDDEN.value());
        body.put("path", request.getRequestURI());
        body.put("timestamp", LocalDateTime.now().toString());

        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
```

---

### 4.5 `GlobalExceptionHandler.java` Update
**File Path:** `backend/src/main/java/com/pulseos/common/GlobalExceptionHandler.java`

Add the following handlers before `handleGenericException` to prevent Spring Security access exceptions from collapsing into 500 errors:

```java
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDeniedException(org.springframework.security.access.AccessDeniedException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", "Forbidden");
        body.put("message", "Access denied: You do not have permission to access this resource");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthenticationException(org.springframework.security.core.AuthenticationException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", "Unauthorized");
        body.put("message", ex.getMessage() != null ? ex.getMessage() : "Full authentication is required");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }
```

---

### 4.6 Controller RBAC Audit & `@PreAuthorize` Specifications

Across all domain controllers:
1. **Remove class-level `@CrossOrigin(origins = "*")`**.
2. **Add import:** `import org.springframework.security.access.prepost.PreAuthorize;`.
3. **Annotate each method with the specified `@PreAuthorize` rule**.

#### 1. `PatientController.java` (`backend/src/main/java/com/pulseos/patient/PatientController.java`)
```java
@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'PHARMACIST', 'LAB_TECHNICIAN')")
    public ResponseEntity<List<PatientResponse>> getAllPatients(...)

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('DOCTOR', 'RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'PHARMACIST', 'LAB_TECHNICIAN')")
    public ResponseEntity<List<PatientResponse>> searchPatients(...)

    @PostMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN')")
    public ResponseEntity<PatientResponse> createPatient(...)

    @GetMapping("/nic/{nic}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'PHARMACIST', 'LAB_TECHNICIAN', 'PATIENT')")
    public ResponseEntity<PatientResponse> getPatientByNic(...)

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'PHARMACIST', 'LAB_TECHNICIAN', 'PATIENT')")
    public ResponseEntity<PatientResponse> getPatientById(...)

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'PATIENT')")
    public ResponseEntity<PatientResponse> updatePatient(...)

    @PatchMapping("/{id}/archive")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<PatientResponse> archivePatient(...)

    @PatchMapping("/{id}/restore")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<PatientResponse> restorePatient(...)
}
```

#### 2. `DoctorController.java` (`backend/src/main/java/com/pulseos/doctor/DoctorController.java`)
```java
@RestController
@RequestMapping("/api/v1/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DoctorResponse>> getAllDoctors(...)

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DoctorResponse> getDoctorById(...)

    @PostMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<DoctorResponse> createDoctor(...)

    @PatchMapping("/{id}/availability")
    @PreAuthorize("hasAnyRole('DOCTOR', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<DoctorResponse> updateAvailability(...)

    @PatchMapping("/{id}/fee")
    @PreAuthorize("hasAnyRole('DOCTOR', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<DoctorResponse> updateFee(...)

    @GetMapping("/{id}/schedules")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DoctorScheduleResponse>> getSchedules(...)

    @PostMapping("/{id}/schedules")
    @PreAuthorize("hasAnyRole('DOCTOR', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<DoctorScheduleResponse> createSchedule(...)
}
```

#### 3. `AppointmentController.java` (`backend/src/main/java/com/pulseos/appointment/AppointmentController.java`)
```java
@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'PATIENT')")
    public ResponseEntity<List<AppointmentResponse>> getAllAppointments()

    @GetMapping("/today")
    @PreAuthorize("hasAnyRole('DOCTOR', 'RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<List<AppointmentResponse>> getTodayAppointments()

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'PATIENT')")
    public ResponseEntity<AppointmentResponse> getAppointmentById(...)

    @PostMapping
    @PreAuthorize("hasAnyRole('PATIENT', 'RECEPTIONIST', 'DOCTOR', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<AppointmentResponse> createAppointment(...)

    @PatchMapping("/{id}/reschedule")
    @PreAuthorize("hasAnyRole('PATIENT', 'RECEPTIONIST', 'DOCTOR', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<AppointmentResponse> rescheduleAppointment(...)

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('PATIENT', 'RECEPTIONIST', 'DOCTOR', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<AppointmentResponse> cancelAppointment(...)

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('DOCTOR', 'RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<AppointmentResponse> completeAppointment(...)
}
```

#### 4. `BillingController.java` (`backend/src/main/java/com/pulseos/billing/BillingController.java`)
```java
@RestController
@RequestMapping("/api/v1/billing")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;

    @GetMapping("/invoices")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'PATIENT')")
    public ResponseEntity<List<InvoiceResponse>> getAllInvoices()

    @GetMapping("/invoices/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'PATIENT')")
    public ResponseEntity<InvoiceResponse> getInvoiceById(...)

    @PostMapping("/invoices/generate")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<InvoiceResponse> generateInvoice(...)

    @PostMapping("/invoices/{id}/settle")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<SettlementResponse> settleInvoice(...)
}
```

#### 5. `PaymentController.java` (`backend/src/main/java/com/pulseos/billing/PaymentController.java`)
```java
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final BillingService billingService;

    @GetMapping("/payhere/initiate")
    @PreAuthorize("hasAnyRole('PATIENT', 'RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<PayHereInitiateResponse> initiatePayHere(@RequestParam Long invoiceId)

    // IMPORTANT: PUBLIC WEBHOOK — DO NOT ADD @PreAuthorize! Whitelisted in SecurityFilterChain
    @PostMapping("/payhere/notify")
    public ResponseEntity<String> payHereNotify(...)
}
```

#### 6. `LaboratoryController.java` (`backend/src/main/java/com/pulseos/laboratory/LaboratoryController.java`)
```java
@RestController
@RequestMapping("/api/v1/laboratory")
@RequiredArgsConstructor
public class LaboratoryController {

    private final LaboratoryService laboratoryService;

    @GetMapping("/catalog")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<LabCatalogResponse>> getCatalog()

    @GetMapping("/tests")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'DOCTOR', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'PATIENT')")
    public ResponseEntity<List<LabRequestResponse>> getAllTests()

    @PostMapping("/tests")
    @PreAuthorize("hasAnyRole('DOCTOR', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<LabRequestResponse> createTest(...)

    @PatchMapping("/tests/{id}/status")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<LabRequestResponse> updateTestStatus(...)

    @PostMapping("/tests/{id}/results")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<LabRequestResponse> submitResults(...)

    @DeleteMapping("/tests/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteTest(...)
}
```

#### 7. `PharmacyController.java` (`backend/src/main/java/com/pulseos/pharmacy/PharmacyController.java`)
```java
@RestController
@RequestMapping("/api/v1/pharmacy")
@RequiredArgsConstructor
public class PharmacyController {

    private final PharmacyService pharmacyService;

    @GetMapping("/drugs")
    @PreAuthorize("hasAnyRole('PHARMACIST', 'DOCTOR', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<List<DrugResponse>> getAllDrugs()

    @GetMapping("/drugs/low-stock")
    @PreAuthorize("hasAnyRole('PHARMACIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<List<DrugResponse>> getLowStockDrugs()

    @PostMapping("/drugs")
    @PreAuthorize("hasAnyRole('PHARMACIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<DrugResponse> addDrug(...)

    @GetMapping("/prescriptions")
    @PreAuthorize("hasAnyRole('PHARMACIST', 'DOCTOR', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'PATIENT')")
    public ResponseEntity<List<PrescriptionResponse>> getAllPrescriptions()

    @PostMapping("/prescriptions")
    @PreAuthorize("hasAnyRole('DOCTOR', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<PrescriptionResponse> createPrescription(...)

    @PostMapping("/prescriptions/{prescriptionId}/dispense")
    @PreAuthorize("hasAnyRole('PHARMACIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<DispenseResponse> dispensePrescription(...)
}
```

---

### 4.7 Integration Test Specification: `SecurityFilterChainIntegrationTest.java`
**File Path:** `backend/src/test/java/com/pulseos/security/SecurityFilterChainIntegrationTest.java`

```java
package com.pulseos.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("demo")
class SecurityFilterChainIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @DisplayName("Public health endpoint is accessible without authentication")
    void testPublicHealthEndpointAccessible() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200));
    }

    @Test
    @DisplayName("Secured endpoint returns 401 Unauthorized JSON when unauthenticated")
    void testSecuredEndpointReturns401WhenUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/v1/patients"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("Secured endpoint returns 401 Unauthorized JSON when token is invalid")
    void testSecuredEndpointReturns401WithInvalidToken() throws Exception {
        mockMvc.perform(get("/api/v1/patients")
                        .header("Authorization", "Bearer invalid.token.value"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("Doctor can successfully access patient listing with valid JWT")
    void testDoctorCanAccessPatients() throws Exception {
        String token = jwtTokenProvider.generateToken(
                101L, "doc.kavinda@pulseos.lk", "DOCTOR", "Dr. Kavinda Rathnayaka", "STAFF"
        );

        mockMvc.perform(get("/api/v1/patients")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Pharmacist is forbidden (403) from creating prescriptions (Doctor-only)")
    void testPharmacistForbiddenFromCreatingPrescription() throws Exception {
        String token = jwtTokenProvider.generateToken(
                104L, "pharm.hiruni@pulseos.lk", "PHARMACIST", "Hiruni Pharmacist", "STAFF"
        );

        mockMvc.perform(post("/api/v1/pharmacy/prescriptions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"patientId\":1,\"doctorId\":1,\"diagnosis\":\"Flu\",\"instructions\":\"Rest\",\"items\":[]}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Forbidden"))
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @DisplayName("PayHere notify webhook is accessible without authentication")
    void testPayHereNotifyAccessibleWithoutAuth() throws Exception {
        mockMvc.perform(post("/api/v1/payments/payhere/notify")
                        .param("merchant_id", "1220000")
                        .param("order_id", "INV-NONEXISTENT")
                        .param("payhere_amount", "1000.00")
                        .param("payhere_currency", "LKR")
                        .param("status_code", "0")
                        .param("md5sig", "invalidsig"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("CORS preflight OPTIONS request returns 200 with allowed headers")
    void testCorsPreflightRequest() throws Exception {
        mockMvc.perform(options("/api/v1/patients")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }
}
```

---

## 5. Verification Method

### 5.1 Verification Commands for the Worker
Once the files are applied:

1. **Verify No Duplicate Security Configurations:**
   ```bash
   test ! -f /Users/admin/Projects/honda_leda/backend/src/main/java/com/pulseos/config/SecurityConfig.java && echo "OK: Old SecurityConfig deleted"
   ```

2. **Run Security Filter Chain Integration Tests:**
   ```bash
   cd /Users/admin/Projects/honda_leda/backend
   ./mvnw test -Dtest=SecurityFilterChainIntegrationTest
   ```
   **Expected Result:** All 7 tests pass with 0 failures and 0 errors (`BUILD SUCCESS`).

3. **Run Full Backend Regression Test Suite:**
   ```bash
   cd /Users/admin/Projects/honda_leda/backend
   ./mvnw test
   ```
   **Expected Result:** All 67 existing tests + new security tests pass cleanly (`BUILD SUCCESS`).

### 5.2 Invalidation Conditions
- Any occurrence of `ConflictingBeanDefinitionException` or duplicate filter chain error on startup: Indicates `com.pulseos.config.SecurityConfig.java` was not deleted.
- Any occurrence of HTTP 500 when an unauthorized role accesses a method: Indicates `GlobalExceptionHandler` is missing the `AccessDeniedException` handler.
- Any browser CORS error rejecting credentials with `*` origin: Indicates class-level `@CrossOrigin(origins = "*")` was not removed from domain controllers.
- Any unhandled 500 on missing or invalid Bearer token: Indicates `JwtAuthenticationFilter` or `JwtTokenProvider` threw an uncaught exception rather than invoking `AuthenticationEntryPoint`.
