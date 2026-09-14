package com.pulseos.controller;

import com.pulseos.dto.PharmacyDTOs.*;
import com.pulseos.service.PharmacyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pharmacy")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PharmacyController {

    private final PharmacyService pharmacyService;

    @GetMapping("/drugs")
    public ResponseEntity<List<DrugResponse>> getAllDrugs() {
        return ResponseEntity.ok(pharmacyService.getAllDrugs());
    }

    @GetMapping("/drugs/low-stock")
    public ResponseEntity<List<DrugResponse>> getLowStockDrugs() {
        return ResponseEntity.ok(pharmacyService.getLowStockDrugs());
    }

    @PostMapping("/drugs")
    public ResponseEntity<DrugResponse> addDrug(@RequestBody DrugRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pharmacyService.addDrug(request));
    }

    @GetMapping("/prescriptions")
    public ResponseEntity<List<PrescriptionResponse>> getAllPrescriptions() {
        return ResponseEntity.ok(pharmacyService.getAllPrescriptions());
    }

    @PostMapping("/prescriptions")
    public ResponseEntity<PrescriptionResponse> createPrescription(@RequestBody PrescriptionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pharmacyService.createPrescription(request));
    }

    @PostMapping("/prescriptions/{prescriptionId}/dispense")
    public ResponseEntity<DispenseResponse> dispensePrescription(@PathVariable Long prescriptionId) {
        return ResponseEntity.ok(pharmacyService.dispensePrescription(prescriptionId));
    }
}
