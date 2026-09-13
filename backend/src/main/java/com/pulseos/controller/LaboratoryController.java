package com.pulseos.controller;

import com.pulseos.dto.LabDTOs.*;
import com.pulseos.service.LaboratoryService;
import lombok.RequiredArgsConstructor;
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

    @GetMapping("/tests")
    public ResponseEntity<List<LabRequestResponse>> getAllTests() {
        return ResponseEntity.ok(laboratoryService.getAllTests());
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
}
