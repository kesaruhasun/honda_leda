package com.pulseos.landing;

import com.pulseos.appointment.AppointmentDTOs.AppointmentRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("demo")
public class LandingNotificationCalendarIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private com.pulseos.patient.PatientRepository patientRepository;

    @Autowired
    private com.pulseos.doctor.DoctorRepository doctorRepository;

    @Test
    @DisplayName("GET /api/v1/landing/stats returns live aggregated metrics")
    void testLandingStats() throws Exception {
        mockMvc.perform(get("/api/v1/landing/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeDoctorsCount", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.departmentsCount", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.satisfiedPatientsCount", greaterThan(1500)))
                .andExpect(jsonPath("$.featuredSpecialties", hasItem(not(emptyString()))));
    }

    @Test
    @DisplayName("GET /api/v1/landing/doctors returns featured doctors list")
    void testLandingDoctors() throws Exception {
        mockMvc.perform(get("/api/v1/landing/doctors"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].fullName", not(emptyOrNullString())))
                .andExpect(jsonPath("$[0].specialization", not(emptyOrNullString())));
    }

    @Test
    @DisplayName("Role-based appointment calendar views return specific perspectives")
    void testRoleBasedCalendar() throws Exception {
        Long patientId = patientRepository.findAll().get(0).getId();
        Long doctorId = doctorRepository.findAll().get(0).getId();

        // Patient perspective
        mockMvc.perform(get("/api/v1/appointments/calendar")
                        .param("role", "PATIENT")
                        .param("patientId", patientId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role", is("PATIENT")))
                .andExpect(jsonPath("$.patientId", is(patientId.intValue())))
                .andExpect(jsonPath("$.availableSlots", notNullValue()));

        // Doctor perspective
        mockMvc.perform(get("/api/v1/appointments/calendar")
                        .param("role", "DOCTOR")
                        .param("doctorId", doctorId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role", is("DOCTOR")))
                .andExpect(jsonPath("$.doctorId", is(doctorId.intValue())))
                .andExpect(jsonPath("$.queue", notNullValue()));

        // Manager perspective
        mockMvc.perform(get("/api/v1/appointments/calendar")
                        .param("role", "MANAGER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role", is("MANAGER")))
                .andExpect(jsonPath("$.doctorLoad", notNullValue()))
                .andExpect(jsonPath("$.hospitalLoad", is("NORMAL")));
    }

    @Test
    @DisplayName("Calendar boundary errors on missing or invalid role")
    void testCalendarBoundaries() throws Exception {
        // Missing role
        mockMvc.perform(get("/api/v1/appointments/calendar"))
                .andExpect(status().isBadRequest());

        // Invalid role
        mockMvc.perform(get("/api/v1/appointments/calendar").param("role", "HACKER"))
                .andExpect(status().isBadRequest());

        // Doctor missing doctorId
        mockMvc.perform(get("/api/v1/appointments/calendar").param("role", "DOCTOR"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Appointment booking records email notification in notification pipeline")
    @WithMockUser(username = "receptionist@pulseos.lk", roles = {"RECEPTIONIST"})
    void testAppointmentNotificationPipeline() throws Exception {
        Long patientId = patientRepository.findAll().get(0).getId();
        Long doctorId = doctorRepository.findAll().get(0).getId();

        AppointmentRequest request = AppointmentRequest.builder()
                .patientId(patientId)
                .doctorId(doctorId)
                .appointmentDate("2026-11-20")
                .appointmentTime("14:30")
                .reasonForVisit("Clinical test consultation")
                .build();

        String responseBody = mockMvc.perform(post("/api/v1/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.appointmentNumber", notNullValue()))
                .andReturn().getResponse().getContentAsString();

        String apptNumber = objectMapper.readTree(responseBody).get("appointmentNumber").asText();

        // Query notification by referenceId
        mockMvc.perform(get("/api/v1/notifications").param("referenceId", apptNumber))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].eventType", is("APPOINTMENT_CREATED")))
                .andExpect(jsonPath("$[0].referenceId", is(apptNumber)))
                .andExpect(jsonPath("$[0].status", is("SENT")));
    }
}
