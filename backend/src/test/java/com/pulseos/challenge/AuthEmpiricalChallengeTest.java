package com.pulseos.challenge;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pulseos.patient.Patient;
import com.pulseos.patient.PatientRepository;
import com.pulseos.security.AuthResponse;
import com.pulseos.security.JwtTokenProvider;
import com.pulseos.security.LoginRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Empirical Stress Test Harness for Milestone 2 Authentication Permutations and Profile Inspection.
 * Authored by teamwork_preview_challenger_m2_2 (Empirical Challenger).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("demo")
public class AuthEmpiricalChallengeTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PatientRepository patientRepository;

    @Nested
    @DisplayName("Permutation Group 1: Doctor Login Permutations")
    class DoctorLoginPermutationTests {

        @Test
        @DisplayName("Doctor login by SLIIT email with password123")
        void testDoctorLoginBySliitEmailWithPassword123() throws Exception {
            LoginRequest req = new LoginRequest("it25103999@my.sliit.lk", "password123");

            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").isString())
                    .andExpect(jsonPath("$.tokenType").value("Bearer"))
                    .andExpect(jsonPath("$.role").value("DOCTOR"))
                    .andExpect(jsonPath("$.userType").value("STAFF"))
                    .andExpect(jsonPath("$.username").value("it25103999@my.sliit.lk"))
                    .andExpect(jsonPath("$.fullName").value("Kavinda Rathnayaka"));
        }

        @Test
        @DisplayName("Doctor login by PulseOS alias with password123")
        void testDoctorLoginByPulseOsAliasWithPassword123() throws Exception {
            LoginRequest req = new LoginRequest("doc.kavinda@pulseos.lk", "password123");

            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").isString())
                    .andExpect(jsonPath("$.tokenType").value("Bearer"))
                    .andExpect(jsonPath("$.role").value("DOCTOR"))
                    .andExpect(jsonPath("$.userType").value("STAFF"))
                    .andExpect(jsonPath("$.username").value("doc.kavinda@pulseos.lk"))
                    .andExpect(jsonPath("$.fullName").value("Kavinda Rathnayaka"));
        }

        @Test
        @DisplayName("Doctor login by PulseOS alias with case insensitivity and whitespace")
        void testDoctorLoginCaseInsensitiveAndWhitespace() throws Exception {
            LoginRequest req = new LoginRequest("  DOC.KAVINDA@PULSEOS.LK  ", "password123");

            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.role").value("DOCTOR"))
                    .andExpect(jsonPath("$.userType").value("STAFF"));
        }

        @Test
        @DisplayName("Doctor login by NIC with password123")
        void testDoctorLoginByNic() throws Exception {
            LoginRequest req = new LoginRequest("199912401829", "password123");

            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.role").value("DOCTOR"))
                    .andExpect(jsonPath("$.userType").value("STAFF"));
        }
    }

    @Nested
    @DisplayName("Permutation Group 2: System Admin and Manager Login Permutations")
    class AdminAndManagerLoginTests {

        @Test
        @DisplayName("System Admin login by primary email with password123")
        void testSystemAdminLoginWithPassword123() throws Exception {
            LoginRequest req = new LoginRequest("kesaruhasun@gmail.com", "password123");

            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.role").value("SYSTEM_ADMIN"))
                    .andExpect(jsonPath("$.userType").value("STAFF"))
                    .andExpect(jsonPath("$.username").value("kesaruhasun@gmail.com"))
                    .andExpect(jsonPath("$.fullName").value("Kesaru Dhanasinghe"));
        }

        @Test
        @DisplayName("Manager alias login with password123 resolves to MANAGER role")
        void testManagerAliasLoginWithPassword123() throws Exception {
            LoginRequest req = new LoginRequest("manager@pulseos.lk", "password123");

            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.role").value("MANAGER"))
                    .andExpect(jsonPath("$.userType").value("STAFF"))
                    .andExpect(jsonPath("$.username").value("manager@pulseos.lk"))
                    .andExpect(jsonPath("$.fullName").value("Kesaru Dhanasinghe"));
        }

        @Test
        @DisplayName("Admin alias login with password123")
        void testAdminAliasLoginWithPassword123() throws Exception {
            LoginRequest req = new LoginRequest("admin@pulseos.lk", "password123");

            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.role").value("SYSTEM_ADMIN"))
                    .andExpect(jsonPath("$.userType").value("STAFF"));
        }
    }

    @Nested
    @DisplayName("Permutation Group 3: Patient Login Permutations")
    class PatientLoginTests {

        @Test
        @DisplayName("Patient login by Sri Lankan NIC with password123")
        void testPatientLoginByNicWithPassword123() throws Exception {
            LoginRequest req = new LoginRequest("199012345678", "password123");

            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").isString())
                    .andExpect(jsonPath("$.role").value("PATIENT"))
                    .andExpect(jsonPath("$.userType").value("PATIENT"))
                    .andExpect(jsonPath("$.fullName").value("Kasun Perera"));
        }

        @Test
        @DisplayName("Patient login by email with password123")
        void testPatientLoginByEmailWithPassword123() throws Exception {
            LoginRequest req = new LoginRequest("patient.sunil@gmail.com", "password123");

            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.role").value("PATIENT"))
                    .andExpect(jsonPath("$.userType").value("PATIENT"))
                    .andExpect(jsonPath("$.username").value("patient.sunil@gmail.com"))
                    .andExpect(jsonPath("$.fullName").value("Nimal Perera"));
        }

        @Test
        @DisplayName("Patient login by NIC with whitespace trimming")
        void testPatientLoginByNicWithWhitespace() throws Exception {
            LoginRequest req = new LoginRequest("  199012345678  ", "password123");

            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.role").value("PATIENT"))
                    .andExpect(jsonPath("$.userType").value("PATIENT"));
        }
    }

    @Nested
    @DisplayName("Permutation Group 4: Negative Authentication Permutations")
    class NegativeAuthenticationTests {

        @Test
        @DisplayName("Invalid password returns HTTP 401 Unauthorized JSON")
        void testInvalidPasswordReturns401() throws Exception {
            LoginRequest req = new LoginRequest("it25103999@my.sliit.lk", "wrong_pass_xyz");

            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error").value("Unauthorized"))
                    .andExpect(jsonPath("$.message").value("Invalid credentials"))
                    .andExpect(jsonPath("$.status").value(401));
        }

        @Test
        @DisplayName("Invalid password for patient NIC returns HTTP 401 Unauthorized JSON")
        void testInvalidPasswordForPatientReturns401() throws Exception {
            LoginRequest req = new LoginRequest("199012345678", "incorrect_pwd_456");

            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error").value("Unauthorized"))
                    .andExpect(jsonPath("$.message").value("Invalid credentials"))
                    .andExpect(jsonPath("$.status").value(401));
        }

        @Test
        @DisplayName("Non-existent user returns HTTP 401 Unauthorized JSON")
        void testNonExistentUserReturns401() throws Exception {
            LoginRequest req = new LoginRequest("nonexistent.person@sliit.lk", "password123");

            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error").value("Unauthorized"))
                    .andExpect(jsonPath("$.message").value("Invalid credentials"))
                    .andExpect(jsonPath("$.status").value(401));
        }

        @Test
        @DisplayName("SQL injection attempt in username returns HTTP 401 Unauthorized JSON")
        void testSqlInjectionUsernameReturns401() throws Exception {
            LoginRequest req = new LoginRequest("' OR '1'='1", "password123");

            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error").value("Unauthorized"))
                    .andExpect(jsonPath("$.status").value(401));
        }
    }

    @Nested
    @DisplayName("Permutation Group 5: Blank and Invalid Credential Payloads (400 Bad Request)")
    class BlankCredentialsValidationTests {

        @Test
        @DisplayName("Blank credentials both empty strings return HTTP 400 Bad Request")
        void testBlankCredentialsReturns400() throws Exception {
            LoginRequest req = new LoginRequest("", "");

            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("Validation Failed"));
        }

        @Test
        @DisplayName("Blank username with valid password returns HTTP 400 Bad Request")
        void testBlankUsernameReturns400() throws Exception {
            LoginRequest req = new LoginRequest("", "password123");

            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("Validation Failed"));
        }

        @Test
        @DisplayName("Valid username with blank password returns HTTP 400 Bad Request")
        void testBlankPasswordReturns400() throws Exception {
            LoginRequest req = new LoginRequest("it25103999@my.sliit.lk", "");

            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("Validation Failed"));
        }

        @Test
        @DisplayName("Whitespace-only credentials return HTTP 400 Bad Request")
        void testWhitespaceOnlyCredentialsReturns400() throws Exception {
            LoginRequest req = new LoginRequest("   ", "   ");

            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("Validation Failed"));
        }

        @Test
        @DisplayName("Null fields return HTTP 400 Bad Request")
        void testNullFieldsReturn400() throws Exception {
            String json = "{\"username\": null, \"password\": null}";

            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("Validation Failed"));
        }

        @Test
        @DisplayName("Empty JSON body returns HTTP 400 Bad Request")
        void testEmptyJsonBodyReturns400() throws Exception {
            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("Validation Failed"));
        }
    }

    @Nested
    @DisplayName("Permutation Group 6: Profile Inspection GET /api/v1/auth/me")
    class ProfileInspectionTests {

        @Test
        @DisplayName("Doctor profile inspection with valid Bearer token returns 200 with profile")
        void testDoctorProfileInspectionWithBearerToken() throws Exception {
            LoginRequest req = new LoginRequest("it25103999@my.sliit.lk", "password123");

            String responseBody = mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isOk())
                    .andReturn().getResponse().getContentAsString();

            AuthResponse authResponse = objectMapper.readValue(responseBody, AuthResponse.class);
            assertThat(authResponse.getToken()).isNotBlank();

            mockMvc.perform(get("/api/v1/auth/me")
                            .header("Authorization", "Bearer " + authResponse.getToken()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.userId").value(authResponse.getUserId()))
                    .andExpect(jsonPath("$.username").value("it25103999@my.sliit.lk"))
                    .andExpect(jsonPath("$.fullName").value("Kavinda Rathnayaka"))
                    .andExpect(jsonPath("$.role").value("DOCTOR"))
                    .andExpect(jsonPath("$.userType").value("STAFF"));
        }

        @Test
        @DisplayName("Patient profile inspection with valid Bearer token returns 200 with profile")
        void testPatientProfileInspectionWithBearerToken() throws Exception {
            LoginRequest req = new LoginRequest("199012345678", "password123");

            String responseBody = mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isOk())
                    .andReturn().getResponse().getContentAsString();

            AuthResponse authResponse = objectMapper.readValue(responseBody, AuthResponse.class);

            mockMvc.perform(get("/api/v1/auth/me")
                            .header("Authorization", "Bearer " + authResponse.getToken()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.userId").value(authResponse.getUserId()))
                    .andExpect(jsonPath("$.fullName").value("Kasun Perera"))
                    .andExpect(jsonPath("$.role").value("PATIENT"))
                    .andExpect(jsonPath("$.userType").value("PATIENT"));
        }

        @Test
        @DisplayName("Profile inspection without Bearer token strictly returns HTTP 401 Unauthorized")
        void testProfileInspectionWithoutTokenReturns401() throws Exception {
            mockMvc.perform(get("/api/v1/auth/me"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error").value("Unauthorized"))
                    .andExpect(jsonPath("$.status").value(401));
        }

        @Test
        @DisplayName("Profile inspection with empty Authorization header returns HTTP 401 Unauthorized")
        void testProfileInspectionWithEmptyHeaderReturns401() throws Exception {
            mockMvc.perform(get("/api/v1/auth/me")
                            .header("Authorization", ""))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error").value("Unauthorized"))
                    .andExpect(jsonPath("$.status").value(401));
        }

        @Test
        @DisplayName("Profile inspection with Non-Bearer scheme returns HTTP 401 Unauthorized")
        void testProfileInspectionWithNonBearerSchemeReturns401() throws Exception {
            mockMvc.perform(get("/api/v1/auth/me")
                            .header("Authorization", "Basic dXNlcjpwYXNz"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error").value("Unauthorized"))
                    .andExpect(jsonPath("$.status").value(401));
        }

        @Test
        @DisplayName("Profile inspection with malformed Bearer token returns HTTP 401 Unauthorized")
        void testProfileInspectionWithMalformedBearerTokenReturns401() throws Exception {
            mockMvc.perform(get("/api/v1/auth/me")
                            .header("Authorization", "Bearer invalid.jwt.token.string"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error").value("Unauthorized"))
                    .andExpect(jsonPath("$.status").value(401));
        }
    }

    @Nested
    @DisplayName("Permutation Group 7: Other Staff Roles & Archived Account Boundary")
    class OtherRolesAndAccountBoundaryTests {

        @Test
        @DisplayName("Pharmacist login by alias with password123")
        void testPharmacistLoginWithPassword123() throws Exception {
            LoginRequest req = new LoginRequest("pharmacist@pulseos.lk", "password123");

            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.role").value("PHARMACIST"))
                    .andExpect(jsonPath("$.userType").value("STAFF"));
        }

        @Test
        @DisplayName("Lab Technician login by alias with password123")
        void testLabTechLoginWithPassword123() throws Exception {
            LoginRequest req = new LoginRequest("labtech@pulseos.lk", "password123");

            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.role").value("LAB_TECHNICIAN"))
                    .andExpect(jsonPath("$.userType").value("STAFF"));
        }

        @Test
        @DisplayName("Receptionist login by alias with password123")
        void testReceptionistLoginWithPassword123() throws Exception {
            LoginRequest req = new LoginRequest("receptionist@pulseos.lk", "password123");

            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.role").value("RECEPTIONIST"))
                    .andExpect(jsonPath("$.userType").value("STAFF"));
        }

        @Test
        @DisplayName("Archived patient login is rejected with HTTP 401 Unauthorized")
        void testArchivedPatientLoginIsRejected() throws Exception {
            // Find an existing patient and archive them
            Patient patient = patientRepository.findByNicPassportNo("199012345678").orElse(null);
            assertThat(patient).isNotNull();

            patient.setIsArchived(true);
            patientRepository.save(patient);

            try {
                LoginRequest req = new LoginRequest("199012345678", "password123");

                mockMvc.perform(post("/api/v1/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req)))
                        .andExpect(status().isUnauthorized())
                        .andExpect(jsonPath("$.error").value("Unauthorized"))
                        .andExpect(jsonPath("$.message").value("Account is archived"))
                        .andExpect(jsonPath("$.status").value(401));
            } finally {
                // Restore patient state
                patient.setIsArchived(false);
                patientRepository.save(patient);
            }
        }
    }
}
