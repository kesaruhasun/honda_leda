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
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("UP"));
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
