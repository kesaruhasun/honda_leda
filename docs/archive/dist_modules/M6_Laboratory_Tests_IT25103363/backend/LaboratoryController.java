package com.pulseos.controller;

import com.pulseos.dto.LabDTOs.*;
import com.pulseos.service.LaboratoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/laboratory")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class LaboratoryController {

    private final LaboratoryService laboratoryService;

    @GetMapping("/catalog")
    public ResponseEntity<List<LabCatalogResponse>> getCatalog() {
        return ResponseEntity.ok(laboratoryService.getCatalog());
    }

    @GetMapping("/tests")
    public ResponseEntity<List<LabRequestResponse>> getAllTests() {
        return ResponseEntity.ok(laboratoryService.getAllTests());
    }

    @PostMapping("/tests")
    public ResponseEntity<LabRequestResponse> createTest(@RequestBody LabOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(laboratoryService.createTest(request));
    }

    @PatchMapping("/tests/{id}/status")
    public ResponseEntity<LabRequestResponse> updateTestStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String status = request.get("status");
        return ResponseEntity.ok(laboratoryService.updateTestStatus(id, status));
    }

    @PostMapping("/tests/{id}/results")
    public ResponseEntity<LabRequestResponse> submitResults(
            @PathVariable Long id,
            @RequestBody LabResultRequest request) {
        return ResponseEntity.ok(laboratoryService.submitResults(id, request));
    }

    @DeleteMapping("/tests/{id}")
    public ResponseEntity<Void> deleteTest(@PathVariable Long id) {
        laboratoryService.deleteTest(id);
        return ResponseEntity.noContent().build();
    }
}
