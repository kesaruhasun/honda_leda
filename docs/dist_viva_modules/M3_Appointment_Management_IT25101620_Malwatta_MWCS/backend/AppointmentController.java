package com.pulseos.appointment;

import com.pulseos.appointment.AppointmentDTOs.*;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'PATIENT', 'CASHIER_ADMIN')")
    public ResponseEntity<List<AppointmentResponse>> getAllAppointments(
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentService.getAppointments(doctorId, patientId, date));
    }

    @GetMapping("/calendar")
    public ResponseEntity<CalendarViewResponse> getCalendarView(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) Long doctorId) {
        return ResponseEntity.ok(appointmentService.getCalendarView(role, patientId, doctorId));
    }

    @GetMapping("/today")
    @PreAuthorize("hasAnyRole('DOCTOR', 'RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER_ADMIN')")
    public ResponseEntity<List<AppointmentResponse>> getTodayAppointments() {
        return ResponseEntity.ok(appointmentService.getAppointments(null, null, LocalDate.now()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'PATIENT', 'CASHIER_ADMIN')")
    public ResponseEntity<AppointmentResponse> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('PATIENT', 'RECEPTIONIST', 'DOCTOR', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER_ADMIN')")
    public ResponseEntity<AppointmentResponse> createAppointment(@RequestBody AppointmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(appointmentService.createAppointment(request));
    }

    @RequestMapping(value = "/{id}/reschedule", method = {RequestMethod.PATCH, RequestMethod.PUT})
    @PreAuthorize("hasAnyRole('PATIENT', 'RECEPTIONIST', 'DOCTOR', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER_ADMIN')")
    public ResponseEntity<AppointmentResponse> rescheduleAppointment(
            @PathVariable Long id,
            @RequestBody RescheduleRequest request) {
        return ResponseEntity.ok(appointmentService.rescheduleAppointment(id, request));
    }

    @RequestMapping(value = "/{id}/cancel", method = {RequestMethod.PATCH, RequestMethod.POST, RequestMethod.PUT})
    @PreAuthorize("hasAnyRole('PATIENT', 'RECEPTIONIST', 'DOCTOR', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER_ADMIN')")
    public ResponseEntity<AppointmentResponse> cancelAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.cancelAppointment(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'RECEPTIONIST', 'DOCTOR', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER_ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteAppointment(@PathVariable Long id) {
        AppointmentResponse cancelled = appointmentService.cancelAppointment(id);
        Map<String, Object> resp = new java.util.LinkedHashMap<>();
        resp.put("message", "Appointment cancelled successfully");
        resp.put("appointment", cancelled);
        resp.put("id", cancelled.getId());
        resp.put("status", cancelled.getStatus());
        return ResponseEntity.ok(resp);
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('DOCTOR', 'RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER_ADMIN')")
    public ResponseEntity<AppointmentResponse> completeAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.completeAppointment(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DOCTOR', 'RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER_ADMIN')")
    public ResponseEntity<AppointmentResponse> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String statusStr = body.get("status");
        if (statusStr == null) {
            throw com.pulseos.common.PulseException.badRequest("Missing status", "status is required");
        }
        return ResponseEntity.ok(appointmentService.updateAppointmentStatus(id, AppointmentStatus.valueOf(statusStr.toUpperCase())));
    }
}
