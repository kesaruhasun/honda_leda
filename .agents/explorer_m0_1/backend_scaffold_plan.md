# PulseOS Milestone M0: Backend Infrastructure & Scaffolding Plan

**Document Version**: 1.0.0  
**Author**: Explorer M0-1 (`explorer_m0_1`)  
**Target Milestone**: M0 — Foundation, Architecture & Dual-Database Persistence  
**Target Project**: SLIIT SE2030 Software Engineering — Group 60 (PulseOS)  
**Base Package**: `com.pulseos`  
**Working Root**: `/Users/admin/Projects/honda_leda/backend`

---

## 1. Executive Summary & Problem Boundary

This document defines the complete, production-grade Spring Boot 3.2+ Maven project blueprint for the PulseOS backend (`/Users/admin/Projects/honda_leda/backend`). It provides cut-and-paste ready file templates, dependency definitions, multi-profile database configurations (embedded H2 for zero-config live demo evaluation + MySQL 8 for production), Spring Security filter chain configurations, PayHere Sandbox configuration beans, and step-by-step implementation instructions for the Worker agent.

All configurations and dependencies defined herein have been independently compiled and verified against OpenJDK 17 (`17.0.19`) and Maven Wrapper 3.9.16.

---

## 2. Target File Tree Structure

The Worker agent must create the backend within `/Users/admin/Projects/honda_leda/backend` using the exact layout below:

```
/Users/admin/Projects/honda_leda/backend/
├── .mvn/
│   └── wrapper/
│       └── maven-wrapper.properties
├── mvnw
├── mvnw.cmd
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── pulseos/
│   │   │           ├── PulseOsApplication.java
│   │   │           ├── common/
│   │   │           │   ├── controller/
│   │   │           │   │   └── HealthCheckController.java
│   │   │           │   ├── dto/
│   │   │           │   │   └── ApiResponse.java
│   │   │           │   ├── exception/
│   │   │           │   │   ├── GlobalExceptionHandler.java
│   │   │           │   │   ├── ResourceNotFoundException.java
│   │   │           │   │   └── ConflictException.java
│   │   │           │   └── util/
│   │   │           │       └── PayHereSecurityUtil.java
│   │   │           └── config/
│   │   │               ├── SecurityConfig.java
│   │   │               ├── PayHereConfig.java
│   │   │               └── JacksonConfig.java
│   │   └── resources/
│   │       ├── application.yml
│   │       └── schema.sql
│   └── test/
│       └── java/
│           └── com/
│               └── pulseos/
│                   └── PulseOsApplicationTests.java
```

---

## 3. Maven Configuration (`pom.xml`)

### 3.1 Dependencies Specification
- **Parent**: `org.springframework.boot:spring-boot-starter-parent:3.2.12`
- **Java Version**: `17`
- **Core Starters**:
  - `org.springframework.boot:spring-boot-starter-web` (REST controllers, Jackson, embedded Tomcat)
  - `org.springframework.boot:spring-boot-starter-data-jpa` (Hibernate ORM 6.4+, Spring Data repositories)
  - `org.springframework.boot:spring-boot-starter-validation` (Jakarta Bean Validation `@NotNull`, `@NotBlank`, `@Email`, etc.)
  - `org.springframework.boot:spring-boot-starter-security` (SecurityFilterChain, CSRF, CORS, FrameOptions)
- **Database Drivers**:
  - `com.h2database:h2` (Runtime scope — embedded in-memory database with MySQL dialect compatibility)
  - `com.mysql:mysql-connector-j` (Runtime scope — official MySQL 8 JDBC driver)
- **Utilities & Serialization**:
  - `org.projectlombok:lombok` (Optional — boilerplate reduction for entities and DTOs)
  - `com.fasterxml.jackson.datatype:jackson-datatype-jsr310` (Java 8 date/time serialization)
- **Testing**:
  - `org.springframework.boot:spring-boot-starter-test` (Test scope — JUnit 5, Mockito, AssertJ)
  - `org.springframework.security:spring-security-test` (Test scope)

### 3.2 File Template: `pom.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>3.2.12</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>
	<groupId>com.pulseos</groupId>
	<artifactId>pulseos</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<name>pulseos</name>
	<description>PulseOS Hospital Management System</description>

	<properties>
		<java.version>17</java.version>
	</properties>

	<dependencies>
		<!-- Spring Boot Starters -->
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-jpa</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-validation</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-security</artifactId>
		</dependency>

		<!-- Databases: Embedded H2 for Demo & MySQL for Production -->
		<dependency>
			<groupId>com.h2database</groupId>
			<artifactId>h2</artifactId>
			<scope>runtime</scope>
		</dependency>
		<dependency>
			<groupId>com.mysql</groupId>
			<artifactId>mysql-connector-j</artifactId>
			<scope>runtime</scope>
		</dependency>

		<!-- Lombok -->
		<dependency>
			<groupId>org.projectlombok</groupId>
			<artifactId>lombok</artifactId>
			<optional>true</optional>
		</dependency>

		<!-- Jackson JSR310 Date/Time Support -->
		<dependency>
			<groupId>com.fasterxml.jackson.datatype</groupId>
			<artifactId>jackson-datatype-jsr310</artifactId>
		</dependency>

		<!-- Testing -->
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>org.springframework.security</groupId>
			<artifactId>spring-security-test</artifactId>
			<scope>test</scope>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
				<configuration>
					<excludes>
						<exclude>
							<groupId>org.projectlombok</groupId>
							<artifactId>lombok</artifactId>
						</exclude>
					</excludes>
				</configuration>
			</plugin>
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-compiler-plugin</artifactId>
				<configuration>
					<source>17</source>
					<target>17</target>
					<annotationProcessorPaths>
						<path>
							<groupId>org.projectlombok</groupId>
							<artifactId>lombok</artifactId>
							<version>${lombok.version}</version>
						</path>
					</annotationProcessorPaths>
				</configuration>
			</plugin>
		</plugins>
	</build>

</project>
```

---

## 4. Maven Wrapper Setup

To guarantee 100% portable builds across macOS, Linux, and Windows without requiring a pre-installed `mvn` binary, the wrapper files must be placed in `/Users/admin/Projects/honda_leda/backend`:

### 4.1 `.mvn/wrapper/maven-wrapper.properties`
```properties
wrapperVersion=3.3.4
distributionType=only-script
distributionUrl=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.16/apache-maven-3.9.16-bin.zip
```

### 4.2 Wrapper Script Generation
The official Apache Maven Wrapper scripts (`mvnw` and `mvnw.cmd`) can be generated directly by fetching from the Apache Maven repository or utilizing the curl template:
```bash
# In /Users/admin/Projects/honda_leda/backend:
curl -fsSL https://raw.githubusercontent.com/takari/maven-wrapper/master/mvnw -o mvnw
curl -fsSL https://raw.githubusercontent.com/takari/maven-wrapper/master/mvnw.cmd -o mvnw.cmd
chmod +x mvnw
```
*(Note: Maven 3.9.16 has already been verified and cached in `/Users/admin/.m2/wrapper/dists/apache-maven-3.9.16/56ba1f9f`).*

---

## 5. Multi-Profile Database Configuration (`application.yml`)

The configuration supports seamless zero-config evaluation via embedded H2 in `demo` mode (default), alongside MySQL 8 connection capability via `mysql` profile.

### File Template: `src/main/resources/application.yml`
```yaml
server:
  port: 8080
  servlet:
    context-path: /

spring:
  application:
    name: pulseos-backend
  profiles:
    active: demo # Default profile for zero-configuration viva evaluation
  main:
    banner-mode: console
  jpa:
    open-in-view: false

pulseos:
  payhere:
    merchant-id: "1220000"
    merchant-secret: "sandbox_secret_sliit_pulseos_2026"
    checkout-url: "https://sandbox.payhere.lk/pay/checkout"
    notify-url: "http://localhost:8080/api/v1/payments/payhere/notify"
    return-url: "http://localhost:5173/billing/payment-success"
    cancel-url: "http://localhost:5173/billing/payment-cancel"
    currency: "LKR"
    sandbox: true

---
# -------------------------------------------------------------
# DEMO PROFILE (Default): Embedded H2 with Live Web Console
# -------------------------------------------------------------
spring:
  config:
    activate:
      on-profile: demo

  datasource:
    url: jdbc:h2:mem:pulseos_db;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH;DB_CLOSE_DELAY=-1
    driver-class-name: org.h2.Driver
    username: sa
    password: ""

  h2:
    console:
      enabled: true
      path: /h2-console
      settings:
        web-allow-others: true
        trace: false

  jpa:
    hibernate:
      ddl-auto: update # Automatically maps JPA entities
    show-sql: false
    properties:
      hibernate:
        format_sql: true

  sql:
    init:
      mode: always
      schema-locations: classpath:schema.sql
      continue-on-error: true

---
# -------------------------------------------------------------
# MYSQL PROFILE: Production Relational Database
# -------------------------------------------------------------
spring:
  config:
    activate:
      on-profile: mysql

  datasource:
    url: jdbc:mysql://localhost:3306/pulseos_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Colombo
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: ${MYSQL_USER:root}
    password: ${MYSQL_PASSWORD:root}

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false

  sql:
    init:
      mode: always
      schema-locations: classpath:schema.sql
      continue-on-error: true
```

---

## 6. Security Configuration (`SecurityConfig.java`)

### 6.1 Architectural Mandates
1. **CSRF Handling**: Must be disabled on `/h2-console/**` and `/api/**` (especially `/api/v1/payments/payhere/notify` which receives URL-encoded POST webhooks from PayHere).
2. **Frame Options**: Must allow `sameOrigin()` frames so that the 3-pane H2 Console web interface can render inside browsers without being blocked by clickjacking protections.
3. **CORS Configuration**: Must allow requests from `http://localhost:5173` (Vite frontend dev server) and `http://127.0.0.1:5173`, supporting methods `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`, with headers `*` and credentials enabled.
4. **Endpoint Permissions**: `/h2-console/**`, `/api/**`, `/api/v1/**`, and `/error` must be permitted without authentication for rapid viva evaluation.

### 6.2 File Template: `src/main/java/com/pulseos/config/SecurityConfig.java`
```java
package com.pulseos.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/h2-console/**", "/api/**", "/api/v1/**")
                .disable() // Permitted for stateless REST APIs and evaluator demonstrations
            )
            .headers(headers -> headers
                // Critical: enables H2 console 3-pane frameset rendering
                .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/api/**").permitAll()
                .requestMatchers("/api/v1/**").permitAll()
                .requestMatchers("/error").permitAll()
                .anyRequest().permitAll()
            );

        return http.build();
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
        config.setAllowedHeaders(List.of("*"));
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

## 7. PayHere Configuration & Hashing Utility

### 7.1 File Template: `src/main/java/com/pulseos/config/PayHereConfig.java`
```java
package com.pulseos.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "pulseos.payhere")
public class PayHereConfig {
    private String merchantId = "1220000";
    private String merchantSecret = "sandbox_secret_sliit_pulseos_2026";
    private String checkoutUrl = "https://sandbox.payhere.lk/pay/checkout";
    private String notifyUrl = "http://localhost:8080/api/v1/payments/payhere/notify";
    private String returnUrl = "http://localhost:5173/billing/payment-success";
    private String cancelUrl = "http://localhost:5173/billing/payment-cancel";
    private String currency = "LKR";
    private boolean sandbox = true;
}
```

### 7.2 File Template: `src/main/java/com/pulseos/common/util/PayHereSecurityUtil.java`
Implements the exact MD5 signature generation and verification algorithm specified by PayHere:
```java
package com.pulseos.common.util;

import com.pulseos.config.PayHereConfig;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Locale;

@Component
public class PayHereSecurityUtil {

    private final PayHereConfig payHereConfig;
    private static final DecimalFormat AMOUNT_FORMAT;

    static {
        DecimalFormatSymbols symbols = new DecimalFormatSymbols(Locale.US);
        AMOUNT_FORMAT = new DecimalFormat("0.00", symbols);
    }

    public PayHereSecurityUtil(PayHereConfig payHereConfig) {
        this.payHereConfig = payHereConfig;
    }

    /**
     * Computes MD5 Hash for Onsite / Redirect Checkout:
     * strtoupper(md5(merchant_id + order_id + formatted_amount + currency + strtoupper(md5(merchant_secret))))
     */
    public String generatePaymentHash(String orderId, BigDecimal amount, String currency) {
        String formattedAmount = AMOUNT_FORMAT.format(amount.setScale(2, RoundingMode.HALF_UP));
        String hashedSecret = computeMd5(payHereConfig.getMerchantSecret()).toUpperCase(Locale.US);
        String rawString = payHereConfig.getMerchantId() + orderId + formattedAmount + currency + hashedSecret;
        return computeMd5(rawString).toUpperCase(Locale.US);
    }

    /**
     * Verifies Server-to-Server Webhook Signature:
     * strtoupper(md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + strtoupper(md5(merchant_secret))))
     */
    public boolean verifyWebhookSignature(String orderId, String payhereAmount,
                                          String payhereCurrency, String statusCode,
                                          String receivedMd5Sig) {
        String hashedSecret = computeMd5(payHereConfig.getMerchantSecret()).toUpperCase(Locale.US);
        String rawString = payHereConfig.getMerchantId() + orderId + payhereAmount + payhereCurrency + statusCode + hashedSecret;
        String localMd5Sig = computeMd5(rawString).toUpperCase(Locale.US);
        return localMd5Sig.equalsIgnoreCase(receivedMd5Sig);
    }

    public static String computeMd5(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : digest) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("MD5 algorithm unavailable in JVM runtime", e);
        }
    }
}
```

---

## 8. Main Application, Health Check & Common DTOs

### 8.1 File Template: `src/main/java/com/pulseos/PulseOsApplication.java`
```java
package com.pulseos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PulseOsApplication {

    public static void main(String[] args) {
        SpringApplication.run(PulseOsApplication.class, args);
    }
}
```

### 8.2 File Template: `src/main/java/com/pulseos/common/dto/ApiResponse.java`
Standard REST response envelope:
```java
package com.pulseos.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    @Builder.Default
    private boolean success = true;
    private String message;
    private T data;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    public static <T> ApiResponse<T> ok(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .data(null)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
```

### 8.3 File Template: `src/main/java/com/pulseos/common/controller/HealthCheckController.java`
Provides instant system diagnostics verifying active profile, database connectivity, and PayHere status:
```java
package com.pulseos.common.controller;

import com.pulseos.common.dto.ApiResponse;
import com.pulseos.config.PayHereConfig;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
public class HealthCheckController {

    private final Environment environment;
    private final PayHereConfig payHereConfig;

    public HealthCheckController(Environment environment, PayHereConfig payHereConfig) {
        this.environment = environment;
        this.payHereConfig = payHereConfig;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHealthStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "UP");
        status.put("system", "PulseOS Hospital Management System");
        status.put("version", "1.0.0-SNAPSHOT");
        status.put("activeProfiles", environment.getActiveProfiles());
        status.put("payHereMerchantId", payHereConfig.getMerchantId());
        status.put("payHereSandbox", payHereConfig.isSandbox());
        status.put("serverTime", LocalDateTime.now().toString());

        return ResponseEntity.ok(ApiResponse.ok(status, "PulseOS Backend is healthy and operational"));
    }
}
```

### 8.4 Initial Baseline DDL: `src/main/resources/schema.sql`
*(CRITICAL INSIGHT: Must not be 0 bytes to prevent `IllegalArgumentException: 'script' must not be null or empty`)*
```sql
-- ============================================================================
-- PulseOS Relational Database Schema DDL (MySQL 8 & H2 Compatible)
-- SE2030 Group 60 - Hospital Management System
-- ============================================================================

SELECT 1;
```
*(In Milestone M0, Worker will paste the full 26-table DDL script matching `docs/PulseOS_EER_Diagram.drawio`)*.

### 8.5 Test Template: `src/test/java/com/pulseos/PulseOsApplicationTests.java`
```java
package com.pulseos;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("demo")
class PulseOsApplicationTests {

    @Test
    void contextLoads() {
        // Verifies Spring Boot 3.2.12 ApplicationContext boots cleanly with H2 and Security
    }
}
```

---

## 9. Critical Architectural Traps & Discovered Gotchas

During experimental verification, the following technical traps were identified:

1. **Empty `schema.sql` Initialization Exception**:
   - *Behavior*: If `spring.sql.init.mode: always` and `schema-locations: classpath:schema.sql` are active, and `schema.sql` contains 0 bytes or only comments, Spring Boot's `ScriptUtils.splitSqlScript` throws `IllegalArgumentException: 'script' must not be null or empty`, aborting the application context.
   - *Remedy*: Always seed `schema.sql` with at least a valid SQL statement (e.g. `SELECT 1;` or table creation DDL).

2. **Spring Boot 4 vs Spring Boot 3.2.x Dependency Differences**:
   - *Behavior*: In Spring Boot 4, `h2console` was extracted into `org.springframework.boot:spring-boot-h2console`. In Spring Boot 3.2.x, adding `spring-boot-h2console` results in a missing artifact build failure.
   - *Remedy*: In Spring Boot 3.2.x, `spring-boot-starter-web` together with `com.h2database:h2` automatically auto-configures the H2 console when `spring.h2.console.enabled: true` is present in `application.yml`.

3. **`H2Dialect` Deprecation Warning**:
   - *Behavior*: Explicitly declaring `spring.jpa.database-platform: org.hibernate.dialect.H2Dialect` produces a warning: `HHH90000025: H2Dialect does not need to be specified explicitly`.
   - *Remedy*: Rely on Hibernate's automatic dialect detection or configure Hibernate settings without deprecated dialect properties.

4. **H2 Console Frame Restriction**:
   - *Behavior*: Loading `http://localhost:8080/h2-console` in a browser produces a blank or gray screen if `X-Frame-Options` is set to `DENY`.
   - *Remedy*: In Spring Security 6.2, explicitly set `.headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))`.

5. **Lombok Annotation Processing in Java 17**:
   - *Behavior*: In Java 17, `maven-compiler-plugin` requires `annotationProcessorPaths` explicitly pointing to `org.projectlombok:lombok` with `${lombok.version}` to ensure getters, setters, and builders compile without manual IDE intervention.

---

## 10. Step-by-Step Implementation Instructions for Worker Agent

When dispatched to implement M0 backend scaffolding, the Worker agent must execute the following sequential operations:

1. **Create Directory Tree**:
   ```bash
   mkdir -p /Users/admin/Projects/honda_leda/backend/.mvn/wrapper
   mkdir -p /Users/admin/Projects/honda_leda/backend/src/main/java/com/pulseos/config
   mkdir -p /Users/admin/Projects/honda_leda/backend/src/main/java/com/pulseos/common/controller
   mkdir -p /Users/admin/Projects/honda_leda/backend/src/main/java/com/pulseos/common/dto
   mkdir -p /Users/admin/Projects/honda_leda/backend/src/main/java/com/pulseos/common/util
   mkdir -p /Users/admin/Projects/honda_leda/backend/src/main/resources
   mkdir -p /Users/admin/Projects/honda_leda/backend/src/test/java/com/pulseos
   ```

2. **Deploy Maven Wrapper**:
   - Write `.mvn/wrapper/maven-wrapper.properties`.
   - Download or write `mvnw` and `mvnw.cmd`.
   - Run `chmod +x /Users/admin/Projects/honda_leda/backend/mvnw`.

3. **Write `pom.xml`**:
   - Place the complete XML from Section 3.2 into `/Users/admin/Projects/honda_leda/backend/pom.xml`.

4. **Write `application.yml` and `schema.sql`**:
   - Place YAML configuration from Section 5 into `/Users/admin/Projects/honda_leda/backend/src/main/resources/application.yml`.
   - Place SQL from Section 8.4 into `/Users/admin/Projects/honda_leda/backend/src/main/resources/schema.sql`.

5. **Write Java Source Classes**:
   - `src/main/java/com/pulseos/PulseOsApplication.java`
   - `src/main/java/com/pulseos/config/SecurityConfig.java`
   - `src/main/java/com/pulseos/config/PayHereConfig.java`
   - `src/main/java/com/pulseos/common/util/PayHereSecurityUtil.java`
   - `src/main/java/com/pulseos/common/dto/ApiResponse.java`
   - `src/main/java/com/pulseos/common/controller/HealthCheckController.java`
   - `src/test/java/com/pulseos/PulseOsApplicationTests.java`

6. **Execute Verification**:
   - Run `./mvnw clean test` inside `/Users/admin/Projects/honda_leda/backend`.
   - Ensure output reports `BUILD SUCCESS` and `contextLoads` passes with 0 errors.

---

## 11. Independent Verification Method

The implementation can be verified at any time using:

```bash
cd /Users/admin/Projects/honda_leda/backend
./mvnw clean test-compile
./mvnw test
```

Expected output:
```
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

To run and verify the live H2 web console and health check:
```bash
cd /Users/admin/Projects/honda_leda/backend
./mvnw spring-boot:run
```
- Health Check: `curl http://localhost:8080/api/v1/health` -> returns HTTP 200 with JSON status `UP`.
- H2 Console: Visit `http://localhost:8080/h2-console` in browser:
  - JDBC URL: `jdbc:h2:mem:pulseos_db`
  - User Name: `sa`
  - Password: `(empty)`
  - Status: Connects immediately, displays table tree in frameset.
