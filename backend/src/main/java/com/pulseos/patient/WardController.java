package com.pulseos.patient;

import com.pulseos.patient.WardDTOs.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wards")
@RequiredArgsConstructor
public class WardController {

    private final WardService wardService;

    @GetMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'PATIENT', 'CASHIER_ADMIN')")
    public ResponseEntity<List<WardResponse>> getAllWards() {
        return ResponseEntity.ok(wardService.getAllWards());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<WardResponse> getWardById(@PathVariable Long id) {
        return ResponseEntity.ok(wardService.getWardById(id));
    }

    @GetMapping("/admissions")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<List<AdmissionResponse>> getActiveAdmissions() {
        return ResponseEntity.ok(wardService.getActiveAdmissions());
    }

    @GetMapping("/{wardId}/admissions")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<List<AdmissionResponse>> getAdmissionsByWard(@PathVariable Long wardId) {
        return ResponseEntity.ok(wardService.getAdmissionsByWard(wardId));
    }

    @PostMapping("/admissions")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<AdmissionResponse> admitPatient(@RequestBody AdmissionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(wardService.admitPatient(request));
    }

    @PostMapping("/admissions/{id}/discharge")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<AdmissionResponse> dischargePatient(@PathVariable Long id) {
        return ResponseEntity.ok(wardService.dischargePatient(id));
    }
}
