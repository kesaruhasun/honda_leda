package com.pulseos.controller;

import com.pulseos.dto.DoctorDTOs.*;
import com.pulseos.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/doctors")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping
    public ResponseEntity<List<DoctorResponse>> getAllDoctors(
            @RequestParam(required = false) String specialization) {
        return ResponseEntity.ok(doctorService.getAllDoctors(specialization));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorResponse> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    @PostMapping
    public ResponseEntity<DoctorResponse> createDoctor(@RequestBody DoctorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(doctorService.createDoctor(request));
    }

    @PatchMapping("/{id}/availability")
    public ResponseEntity<DoctorResponse> updateAvailability(
            @PathVariable Long id,
            @RequestBody DoctorAvailabilityUpdateRequest request) {
        return ResponseEntity.ok(doctorService.updateAvailability(id, request.getIsAvailable()));
    }

    @PatchMapping("/{id}/fee")
    public ResponseEntity<DoctorResponse> updateFee(
            @PathVariable Long id,
            @RequestBody DoctorFeeUpdateRequest request) {
        return ResponseEntity.ok(doctorService.updateFee(id, request.getConsultationFee()));
    }

    @GetMapping("/{id}/schedules")
    public ResponseEntity<List<DoctorScheduleResponse>> getSchedules(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getSchedules(id));
    }

    @PostMapping("/{id}/schedules")
    public ResponseEntity<DoctorScheduleResponse> createSchedule(
            @PathVariable Long id,
            @RequestBody DoctorScheduleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(doctorService.createSchedule(id, request));
    }
}
