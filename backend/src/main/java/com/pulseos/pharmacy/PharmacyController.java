package com.pulseos.pharmacy;

import com.pulseos.pharmacy.PharmacyDTOs.*;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/pharmacy")
@RequiredArgsConstructor
public class PharmacyController {

    private final PharmacyService pharmacyService;

    @GetMapping("/drugs")
    @PreAuthorize("hasAnyRole('PHARMACIST', 'DOCTOR', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<List<DrugResponse>> getAllDrugs() {
        return ResponseEntity.ok(pharmacyService.getAllDrugs());
    }

    @GetMapping("/drugs/low-stock")
    @PreAuthorize("hasAnyRole('PHARMACIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<List<DrugResponse>> getLowStockDrugs() {
        return ResponseEntity.ok(pharmacyService.getLowStockDrugs());
    }

    @PostMapping("/drugs")
    @PreAuthorize("hasAnyRole('PHARMACIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<DrugResponse> addDrug(@RequestBody DrugRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pharmacyService.addDrug(request));
    }

    @GetMapping("/prescriptions")
    @PreAuthorize("hasAnyRole('PHARMACIST', 'DOCTOR', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'PATIENT')")
    public ResponseEntity<List<PrescriptionResponse>> getAllPrescriptions() {
        return ResponseEntity.ok(pharmacyService.getAllPrescriptions());
    }

    @PostMapping("/prescriptions")
    @PreAuthorize("hasAnyRole('DOCTOR', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<PrescriptionResponse> createPrescription(@RequestBody PrescriptionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pharmacyService.createPrescription(request));
    }

    @PostMapping("/prescriptions/{prescriptionId}/dispense")
    @PreAuthorize("hasAnyRole('PHARMACIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<DispenseResponse> dispensePrescription(@PathVariable Long prescriptionId) {
        return ResponseEntity.ok(pharmacyService.dispensePrescription(prescriptionId));
    }
}
