package com.pulseos.laboratory;

import com.pulseos.laboratory.LabDTOs.*;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/laboratory")
@RequiredArgsConstructor
public class LaboratoryController {

    private final LaboratoryService laboratoryService;

    @GetMapping("/catalog")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<LabCatalogResponse>> getCatalog() {
        return ResponseEntity.ok(laboratoryService.getCatalog());
    }

    @GetMapping("/tests")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'DOCTOR', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'PATIENT')")
    public ResponseEntity<List<LabRequestResponse>> getAllTests() {
        return ResponseEntity.ok(laboratoryService.getAllTests());
    }

    @PostMapping("/tests")
    @PreAuthorize("hasAnyRole('DOCTOR', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<LabRequestResponse> createTest(@RequestBody LabOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(laboratoryService.createTest(request));
    }

    @PatchMapping("/tests/{id}/status")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<LabRequestResponse> updateTestStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String status = request.get("status");
        return ResponseEntity.ok(laboratoryService.updateTestStatus(id, status));
    }

    @PostMapping("/tests/{id}/results")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<LabRequestResponse> submitResults(
            @PathVariable Long id,
            @RequestBody LabResultRequest request) {
        return ResponseEntity.ok(laboratoryService.submitResults(id, request));
    }

    @DeleteMapping("/tests/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteTest(@PathVariable Long id) {
        laboratoryService.deleteTest(id);
        return ResponseEntity.noContent().build();
    }
}
