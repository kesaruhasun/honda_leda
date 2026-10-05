package com.pulseos.security;

import com.fasterxml.jackson.databind.ObjectMapper;
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
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Doctor can login with SLIIT academic email and standard password123")
    void testDoctorLoginSuccess() throws Exception {
        LoginRequest req = new LoginRequest("it25103999@my.sliit.lk", "password123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.role").value("DOCTOR"))
                .andExpect(jsonPath("$.userType").value("STAFF"))
                .andExpect(jsonPath("$.fullName").value("Kavinda Rathnayaka"));
    }

    @Test
    @DisplayName("Doctor can login with pulseos alias and Password123!")
    void testDoctorLoginViaAliasSuccess() throws Exception {
        LoginRequest req = new LoginRequest("doc.kavinda@pulseos.lk", "Password123!");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("DOCTOR"))
                .andExpect(jsonPath("$.username").value("doc.kavinda@pulseos.lk"));
    }

    @Test
    @DisplayName("System Admin can login with kesaruhasun@gmail.com")
    void testSystemAdminLoginSuccess() throws Exception {
        LoginRequest req = new LoginRequest("kesaruhasun@gmail.com", "password123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("SYSTEM_ADMIN"))
                .andExpect(jsonPath("$.userType").value("STAFF"));
    }

    @Test
    @DisplayName("Manager alias login resolves to MANAGER role")
    void testManagerAliasLoginSuccess() throws Exception {
        LoginRequest req = new LoginRequest("manager@pulseos.lk", "Password123!");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("MANAGER"))
                .andExpect(jsonPath("$.userType").value("STAFF"));
    }

    @Test
    @DisplayName("Patient can login using Sri Lankan NIC number")
    void testPatientLoginViaNicSuccess() throws Exception {
        LoginRequest req = new LoginRequest("199012345678", "password123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("PATIENT"))
                .andExpect(jsonPath("$.userType").value("PATIENT"))
                .andExpect(jsonPath("$.fullName").value("Kasun Perera"));
    }

    @Test
    @DisplayName("Patient can login using email address")
    void testPatientLoginViaEmailSuccess() throws Exception {
        LoginRequest req = new LoginRequest("patient.sunil@gmail.com", "Password123!");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("PATIENT"))
                .andExpect(jsonPath("$.userType").value("PATIENT"));
    }

    @Test
    @DisplayName("Login with incorrect password returns HTTP 401 Unauthorized JSON")
    void testLoginWithIncorrectPasswordReturns401() throws Exception {
        LoginRequest req = new LoginRequest("it25103999@my.sliit.lk", "WrongPassword999!");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("Invalid credentials"))
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("Login with non-existent user returns HTTP 401 Unauthorized JSON")
    void testLoginWithNonExistentUserReturns401() throws Exception {
        LoginRequest req = new LoginRequest("nonexistent.user@pulseos.lk", "Password123!");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("Invalid credentials"))
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("Login with blank credentials returns HTTP 400 Bad Request")
    void testLoginWithBlankCredentialsReturns400() throws Exception {
        LoginRequest req = new LoginRequest("", "");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"));
    }

    @Test
    @DisplayName("Authenticated user can inspect their own profile via GET /auth/me")
    void testAuthenticatedProfileInspection() throws Exception {
        LoginRequest req = new LoginRequest("it25103999@my.sliit.lk", "password123");

        String responseBody = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        AuthResponse authResponse = objectMapper.readValue(responseBody, AuthResponse.class);

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + authResponse.getToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("DOCTOR"))
                .andExpect(jsonPath("$.userType").value("STAFF"))
                .andExpect(jsonPath("$.fullName").value("Kavinda Rathnayaka"));
    }

    @Test
    @DisplayName("Unauthenticated profile lookup GET /auth/me strictly returns HTTP 401 Unauthorized")
    void testUnauthenticatedProfileLookupReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.status").value(401));
    }
}
