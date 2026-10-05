package com.pulseos.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("demo")
class SecurityRbacIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @DisplayName("Patient role is forbidden (403) from creating doctor entities")
    void testPatientForbiddenFromCreatingDoctor() throws Exception {
        String patientToken = jwtTokenProvider.generateToken(
                201L, "patient.sunil@gmail.com", "PATIENT", "Sunil Perera", "PATIENT"
        );

        mockMvc.perform(post("/api/v1/doctors")
                        .header("Authorization", "Bearer " + patientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"firstName\":\"Dr\",\"lastName\":\"Test\",\"departmentId\":1}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Forbidden"))
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @DisplayName("System Admin has access to privileged doctor creation endpoint")
    void testSystemAdminHasAccessToDoctorCreation() throws Exception {
        String adminToken = jwtTokenProvider.generateToken(
                105L, "kesaruhasun@gmail.com", "SYSTEM_ADMIN", "Kesaru Admin", "STAFF"
        );

        // Expect validation failure or 201 rather than 401/403
        mockMvc.perform(post("/api/v1/doctors")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().is4xxClientError())
                .andExpect(jsonPath("$.error").value("Validation Error"));
    }

    @Test
    @DisplayName("Doctor role has access to laboratory tests list")
    void testDoctorCanAccessLabTests() throws Exception {
        String docToken = jwtTokenProvider.generateToken(
                101L, "doc.kavinda@pulseos.lk", "DOCTOR", "Dr. Kavinda Rathnayaka", "STAFF"
        );

        mockMvc.perform(get("/api/v1/laboratory/tests")
                        .header("Authorization", "Bearer " + docToken))
                .andExpect(status().isOk());
    }
}
