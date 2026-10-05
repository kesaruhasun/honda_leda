package com.pulseos.patient;

import com.pulseos.patient.PatientDTOs.*;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'PHARMACIST', 'LAB_TECHNICIAN', 'MANAGER')")
    public ResponseEntity<List<PatientResponse>> getAllPatients(
            @RequestParam(required = false) String triagePriority,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(patientService.getAllPatients(triagePriority, search));
    }

    @GetMapping("/search")
    public ResponseEntity<List<PatientResponse>> searchPatients(@RequestParam("q") String query) {
        return ResponseEntity.ok(patientService.getAllPatients(null, query));
    }

    @PostMapping
    public ResponseEntity<PatientResponse> createPatient(@RequestBody PatientRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(patientService.createPatient(request));
    }

    @GetMapping("/nic/{nic}")
    public ResponseEntity<PatientResponse> getPatientByNic(@PathVariable String nic) {
        return ResponseEntity.ok(patientService.getPatientByNic(nic));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'PHARMACIST', 'LAB_TECHNICIAN', 'PATIENT', 'MANAGER')")
    public ResponseEntity<PatientResponse> getPatientById(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getPatientById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'PATIENT', 'MANAGER')")
    public ResponseEntity<PatientResponse> updatePatient(
            @PathVariable Long id,
            @RequestBody PatientRequest request) {
        return ResponseEntity.ok(patientService.updatePatient(id, request));
    }

    @PatchMapping("/{id}/archive")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'ADMIN', 'RECEPTIONIST', 'MANAGER')")
    public ResponseEntity<PatientResponse> archivePatient(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.archivePatient(id));
    }

    @PatchMapping("/{id}/restore")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'ADMIN', 'RECEPTIONIST', 'MANAGER')")
    public ResponseEntity<PatientResponse> restorePatient(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.restorePatient(id));
    }
}
