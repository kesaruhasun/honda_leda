package com.pulseos.doctor;

import com.pulseos.doctor.DoctorDTOs.*;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DoctorResponse>> getAllDoctors(
            @RequestParam(required = false) String specialization) {
        return ResponseEntity.ok(doctorService.getAllDoctors(specialization));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DoctorResponse> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<DoctorResponse> createDoctor(@RequestBody DoctorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(doctorService.createDoctor(request));
    }

    @PatchMapping("/{id}/availability")
    @PreAuthorize("hasAnyRole('DOCTOR', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<DoctorResponse> updateAvailability(
            @PathVariable Long id,
            @RequestBody DoctorAvailabilityUpdateRequest request) {
        return ResponseEntity.ok(doctorService.updateAvailability(id, request.getIsAvailable()));
    }

    @PatchMapping("/{id}/fee")
    @PreAuthorize("hasAnyRole('DOCTOR', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<DoctorResponse> updateFee(
            @PathVariable Long id,
            @RequestBody DoctorFeeUpdateRequest request) {
        return ResponseEntity.ok(doctorService.updateFee(id, request.getConsultationFee()));
    }

    @GetMapping("/{id}/schedules")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DoctorScheduleResponse>> getSchedules(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getSchedules(id));
    }

    @PostMapping("/{id}/schedules")
    @PreAuthorize("hasAnyRole('DOCTOR', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<DoctorScheduleResponse> createSchedule(
            @PathVariable Long id,
            @RequestBody DoctorScheduleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(doctorService.createSchedule(id, request));
    }
}
