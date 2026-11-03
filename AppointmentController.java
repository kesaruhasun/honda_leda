package com.pulseos.appointment;

import com.pulseos.appointment.AppointmentDTOs.*;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'PATIENT', 'CASHIER_ADMIN')")
    public ResponseEntity<List<AppointmentResponse>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
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
        return ResponseEntity.ok(appointmentService.getAllAppointments());
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

    @PatchMapping("/{id}/reschedule")
    @PreAuthorize("hasAnyRole('PATIENT', 'RECEPTIONIST', 'DOCTOR', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER_ADMIN')")
    public ResponseEntity<AppointmentResponse> rescheduleAppointment(
            @PathVariable Long id,
            @RequestBody RescheduleRequest request) {
        return ResponseEntity.ok(appointmentService.rescheduleAppointment(id, request));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('PATIENT', 'RECEPTIONIST', 'DOCTOR', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER_ADMIN')")
    public ResponseEntity<AppointmentResponse> cancelAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.cancelAppointment(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'RECEPTIONIST', 'DOCTOR', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER_ADMIN')")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('DOCTOR', 'RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER_ADMIN')")
    public ResponseEntity<AppointmentResponse> completeAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.completeAppointment(id));
    }
}
