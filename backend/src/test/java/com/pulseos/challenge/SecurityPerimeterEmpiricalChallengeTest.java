package com.pulseos.challenge;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pulseos.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Empirical Security Challenger Test Suite for Milestone 2.
 * Rigorously stress-tests and challenges:
 * 1. Unauthenticated requests to protected endpoints -> HTTP 401 Unauthorized JSON
 * 2. Unauthorized role requests -> HTTP 403 Forbidden JSON
 * 3. Tampered tokens (payload modification, signature corruption) -> HTTP 401
 * 4. Expired tokens -> HTTP 401
 * 5. Malformed Authorization headers -> HTTP 401
 * 6. Public webhook (/api/v1/payments/payhere/notify) accessible without authentication
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("demo")
public class SecurityPerimeterEmpiricalChallengeTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    private String validDoctorToken;
    private String validPatientToken;
    private String validPharmacistToken;
    private String validReceptionistToken;

    @BeforeEach
    void setUp() {
        validDoctorToken = jwtTokenProvider.generateToken(
                101L, "doc.kavinda@pulseos.lk", "DOCTOR", "Dr. Kavinda Rathnayaka", "STAFF"
        );
        validPatientToken = jwtTokenProvider.generateToken(
                201L, "patient.sunil@gmail.com", "PATIENT", "Sunil Perera", "PATIENT"
        );
        validPharmacistToken = jwtTokenProvider.generateToken(
                104L, "pharm.hiruni@pulseos.lk", "PHARMACIST", "Hiruni Pharmacist", "STAFF"
        );
        validReceptionistToken = jwtTokenProvider.generateToken(
                103L, "receptionist@pulseos.lk", "RECEPTIONIST", "Dila Perera", "STAFF"
        );
    }

    @Nested
    @DisplayName("Challenge 1: Unauthenticated Requests to Protected Endpoints")
    class UnauthenticatedRequestsTests {

        @Test
        @DisplayName("Unauthenticated GET /api/v1/patients returns 401 JSON")
        void testUnauthenticatedPatientsEndpoint() throws Exception {
            mockMvc.perform(get("/api/v1/patients"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error").value("Unauthorized"))
                    .andExpect(jsonPath("$.status").value(401))
                    .andExpect(jsonPath("$.path").value("/api/v1/patients"))
                    .andExpect(jsonPath("$.timestamp").exists());
        }

        @Test
        @DisplayName("Unauthenticated GET /api/v1/doctors returns 401 JSON")
        void testUnauthenticatedDoctorsEndpoint() throws Exception {
            mockMvc.perform(get("/api/v1/doctors"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error").value("Unauthorized"))
                    .andExpect(jsonPath("$.status").value(401))
                    .andExpect(jsonPath("$.path").value("/api/v1/doctors"));
        }

        @Test
        @DisplayName("Unauthenticated GET /api/v1/appointments returns 401 JSON")
        void testUnauthenticatedAppointmentsEndpoint() throws Exception {
            mockMvc.perform(get("/api/v1/appointments"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error").value("Unauthorized"))
                    .andExpect(jsonPath("$.status").value(401));
        }

        @Test
        @DisplayName("Unauthenticated GET /api/v1/billing/invoices returns 401 JSON")
        void testUnauthenticatedBillingEndpoint() throws Exception {
            mockMvc.perform(get("/api/v1/billing/invoices"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error").value("Unauthorized"))
                    .andExpect(jsonPath("$.status").value(401));
        }

        @Test
        @DisplayName("Unauthenticated GET /api/v1/pharmacy/prescriptions returns 401 JSON")
        void testUnauthenticatedPharmacyPrescriptionsEndpoint() throws Exception {
            mockMvc.perform(get("/api/v1/pharmacy/prescriptions"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error").value("Unauthorized"))
                    .andExpect(jsonPath("$.status").value(401));
        }

        @Test
        @DisplayName("Unauthenticated GET /api/v1/auth/me returns 401 JSON")
        void testUnauthenticatedAuthMeEndpoint() throws Exception {
            mockMvc.perform(get("/api/v1/auth/me"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error").value("Unauthorized"))
                    .andExpect(jsonPath("$.status").value(401));
        }
    }

    @Nested
    @DisplayName("Challenge 2: Unauthorized Role Requests (RBAC Perimeter)")
    class UnauthorizedRoleTests {

        @Test
        @DisplayName("Patient role is forbidden (403) from creating doctor entities")
        void testPatientCannotCreateDoctor() throws Exception {
            mockMvc.perform(post("/api/v1/doctors")
                            .header("Authorization", "Bearer " + validPatientToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"firstName\":\"Dr\",\"lastName\":\"Hacker\",\"departmentId\":1}"))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.error").value("Forbidden"))
                    .andExpect(jsonPath("$.status").value(403))
                    .andExpect(jsonPath("$.path").value("/api/v1/doctors"))
                    .andExpect(jsonPath("$.timestamp").exists());
        }

        @Test
        @DisplayName("Patient role is forbidden (403) from accessing all patients directory")
        void testPatientCannotListAllPatients() throws Exception {
            mockMvc.perform(get("/api/v1/patients")
                            .header("Authorization", "Bearer " + validPatientToken))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.error").value("Forbidden"))
                    .andExpect(jsonPath("$.status").value(403));
        }

        @Test
        @DisplayName("Patient role is forbidden (403) from creating prescriptions")
        void testPatientCannotCreatePrescription() throws Exception {
            mockMvc.perform(post("/api/v1/pharmacy/prescriptions")
                            .header("Authorization", "Bearer " + validPatientToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"patientId\":1,\"doctorId\":1,\"diagnosis\":\"Flu\",\"instructions\":\"Rest\",\"items\":[]}"))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.error").value("Forbidden"))
                    .andExpect(jsonPath("$.status").value(403));
        }

        @Test
        @DisplayName("Pharmacist role is forbidden (403) from creating prescriptions (Doctor-only)")
        void testPharmacistCannotCreatePrescription() throws Exception {
            mockMvc.perform(post("/api/v1/pharmacy/prescriptions")
                            .header("Authorization", "Bearer " + validPharmacistToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"patientId\":1,\"doctorId\":1,\"diagnosis\":\"Flu\",\"instructions\":\"Rest\",\"items\":[]}"))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.error").value("Forbidden"))
                    .andExpect(jsonPath("$.status").value(403));
        }

        @Test
        @DisplayName("Doctor role is forbidden (403) from dispensing medications (Pharmacist-only)")
        void testDoctorCannotDispensePrescription() throws Exception {
            mockMvc.perform(post("/api/v1/pharmacy/prescriptions/1/dispense")
                            .header("Authorization", "Bearer " + validDoctorToken))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.error").value("Forbidden"))
                    .andExpect(jsonPath("$.status").value(403));
        }

        @Test
        @DisplayName("Doctor role is forbidden (403) from initiating PayHere online checkout")
        void testDoctorCannotInitiatePayHereCheckout() throws Exception {
            mockMvc.perform(get("/api/v1/payments/payhere/initiate")
                            .header("Authorization", "Bearer " + validDoctorToken)
                            .param("invoiceId", "1"))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.error").value("Forbidden"))
                    .andExpect(jsonPath("$.status").value(403));
        }

        @Test
        @DisplayName("Receptionist role is forbidden (403) from recording laboratory test results")
        void testReceptionistCannotRecordLabResults() throws Exception {
            mockMvc.perform(post("/api/v1/laboratory/results")
                            .header("Authorization", "Bearer " + validReceptionistToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"requestId\":1,\"testId\":1,\"resultValue\":\"12.5\"}"))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.error").value("Forbidden"))
                    .andExpect(jsonPath("$.status").value(403));
        }
    }

    @Nested
    @DisplayName("Challenge 3: Tampered Tokens (Payload and Signature Attacks)")
    class TamperedTokenTests {

        @Test
        @DisplayName("Token with tampered signature bytes returns 401 Unauthorized")
        void testTamperedSignatureReturns401() throws Exception {
            String tamperedSignatureToken = validDoctorToken.substring(0, validDoctorToken.length() - 8) + "tampered";

            mockMvc.perform(get("/api/v1/patients")
                            .header("Authorization", "Bearer " + tamperedSignatureToken))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error").value("Unauthorized"))
                    .andExpect(jsonPath("$.status").value(401));
        }

        @Test
        @DisplayName("Privilege escalation via tampered payload (Patient -> SYSTEM_ADMIN) returns 401 Unauthorized")
        void testPrivilegeEscalationPayloadTamperReturns401() throws Exception {
            String[] segments = validPatientToken.split("\\.");
            // Decode payload
            byte[] payloadBytes = Base64.getUrlDecoder().decode(segments[1]);
            String payloadJson = new String(payloadBytes, StandardCharsets.UTF_8);

            // Attempt to maliciously escalate role claim to SYSTEM_ADMIN
            String forgedPayload = payloadJson.replace("\"PATIENT\"", "\"SYSTEM_ADMIN\"");
            String forgedPayloadBase64 = Base64.getUrlEncoder().withoutPadding().encodeToString(
                    forgedPayload.getBytes(StandardCharsets.UTF_8)
            );

            // Construct forged token with original signature
            String forgedToken = segments[0] + "." + forgedPayloadBase64 + "." + segments[2];

            mockMvc.perform(get("/api/v1/patients")
                            .header("Authorization", "Bearer " + forgedToken))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error").value("Unauthorized"))
                    .andExpect(jsonPath("$.status").value(401));
        }

        @Test
        @DisplayName("Truncated signature token returns 401 Unauthorized")
        void testTruncatedSignatureReturns401() throws Exception {
            String[] segments = validDoctorToken.split("\\.");
            String truncatedToken = segments[0] + "." + segments[1] + "." + segments[2].substring(0, 10);

            mockMvc.perform(get("/api/v1/patients")
                            .header("Authorization", "Bearer " + truncatedToken))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error").value("Unauthorized"))
                    .andExpect(jsonPath("$.status").value(401));
        }
    }

    @Nested
    @DisplayName("Challenge 4: Expired Tokens")
    class ExpiredTokenTests {

        @Test
        @DisplayName("Expired JWT token strictly returns HTTP 401 Unauthorized JSON")
        void testExpiredTokenReturns401() throws Exception {
            JwtTokenProvider expiredProvider = new JwtTokenProvider();
            ReflectionTestUtils.setField(expiredProvider, "jwtSecret", "7J+fvdU7B4rwLPxxbxZpDocaYcCaypaMezPOJI5AlBc=");
            ReflectionTestUtils.setField(expiredProvider, "jwtExpirationMs", -60000L); // 1 minute in the past

            String expiredToken = expiredProvider.generateToken(
                    101L, "doc.kavinda@pulseos.lk", "DOCTOR", "Dr. Kavinda Rathnayaka", "STAFF"
            );

            mockMvc.perform(get("/api/v1/patients")
                            .header("Authorization", "Bearer " + expiredToken))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error").value("Unauthorized"))
                    .andExpect(jsonPath("$.status").value(401));
        }
    }

    @Nested
    @DisplayName("Challenge 5: Malformed Authorization Headers")
    class MalformedAuthorizationHeadersTests {

        @Test
        @DisplayName("Authorization header with Basic auth scheme returns 401")
        void testBasicAuthSchemeReturns401() throws Exception {
            mockMvc.perform(get("/api/v1/patients")
                            .header("Authorization", "Basic YWRtaW46cGFzc3dvcmQxMjM="))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error").value("Unauthorized"))
                    .andExpect(jsonPath("$.status").value(401));
        }

        @Test
        @DisplayName("Authorization header with lowercase 'bearer' returns 401")
        void testLowercaseBearerPrefixReturns401() throws Exception {
            mockMvc.perform(get("/api/v1/patients")
                            .header("Authorization", "bearer " + validDoctorToken))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error").value("Unauthorized"))
                    .andExpect(jsonPath("$.status").value(401));
        }

        @Test
        @DisplayName("Authorization header with 'Bearer ' but empty payload returns 401")
        void testEmptyBearerTokenReturns401() throws Exception {
            mockMvc.perform(get("/api/v1/patients")
                            .header("Authorization", "Bearer "))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error").value("Unauthorized"))
                    .andExpect(jsonPath("$.status").value(401));
        }

        @Test
        @DisplayName("Authorization header with whitespace-only token returns 401")
        void testWhitespaceOnlyBearerTokenReturns401() throws Exception {
            mockMvc.perform(get("/api/v1/patients")
                            .header("Authorization", "Bearer    \t   "))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error").value("Unauthorized"))
                    .andExpect(jsonPath("$.status").value(401));
        }

        @Test
        @DisplayName("Authorization header with arbitrary non-JWT garbage string returns 401")
        void testArbitraryGarbageAuthorizationReturns401() throws Exception {
            mockMvc.perform(get("/api/v1/patients")
                            .header("Authorization", "NonStandardHeaderFormat12345!@#$%^&*()"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error").value("Unauthorized"))
                    .andExpect(jsonPath("$.status").value(401));
        }

        @Test
        @DisplayName("Authorization header with two-part incomplete JWT returns 401")
        void testIncompleteTwoPartJwtReturns401() throws Exception {
            String[] segments = validDoctorToken.split("\\.");
            String twoPartToken = segments[0] + "." + segments[1];

            mockMvc.perform(get("/api/v1/patients")
                            .header("Authorization", "Bearer " + twoPartToken))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error").value("Unauthorized"))
                    .andExpect(jsonPath("$.status").value(401));
        }
    }

    @Nested
    @DisplayName("Challenge 6: Public Webhook and Health Endpoints")
    class PublicEndpointsTests {

        @Test
        @DisplayName("PayHere IPN webhook /api/v1/payments/payhere/notify is accessible without authentication")
        void testPayHereNotifyAccessibleWithoutAuthentication() throws Exception {
            mockMvc.perform(post("/api/v1/payments/payhere/notify")
                            .param("merchant_id", "1220000")
                            .param("order_id", "INV-MOCK-CHALLENGE")
                            .param("payhere_amount", "2500.00")
                            .param("payhere_currency", "LKR")
                            .param("status_code", "0")
                            .param("md5sig", "mock-signature-hash"))
                    .andExpect(status().isOk())
                    .andExpect(content().string("OK"));
        }

        @Test
        @DisplayName("Health endpoint /api/v1/health is accessible without authentication")
        void testHealthEndpointAccessibleWithoutAuthentication() throws Exception {
            mockMvc.perform(get("/api/v1/health"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.status").value("UP"));
        }

        @Test
        @DisplayName("Auth login endpoint /api/v1/auth/login is accessible without authentication")
        void testLoginEndpointAccessibleWithoutAuthentication() throws Exception {
            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"username\":\"doc.kavinda@pulseos.lk\",\"password\":\"password123\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").isString())
                    .andExpect(jsonPath("$.role").value("DOCTOR"));
        }
    }
}
