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
    public ResponseEntity<List<DrugResponse>> getAllDrugs() {
        return ResponseEntity.ok(pharmacyService.getAllDrugs());
    }

    @GetMapping("/drugs/low-stock")
    @PreAuthorize("hasAnyRole('PHARMACIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'DOCTOR', 'RECEPTIONIST')")
    public ResponseEntity<List<DrugResponse>> getLowStockDrugs() {
        return ResponseEntity.ok(pharmacyService.getLowStockDrugs());
    }

    @PostMapping("/drugs")
    @PreAuthorize("hasAnyRole('PHARMACIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'DOCTOR', 'RECEPTIONIST')")
    public ResponseEntity<DrugResponse> addDrug(@RequestBody DrugRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pharmacyService.addDrug(request));
    }

    @PutMapping("/drugs/{id}")
    @PreAuthorize("hasAnyRole('PHARMACIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<DrugResponse> updateDrug(@PathVariable Long id, @RequestBody DrugRequest request) {
        return ResponseEntity.ok(pharmacyService.updateDrug(id, request));
    }

    @DeleteMapping("/drugs/{id}")
    @PreAuthorize("hasAnyRole('PHARMACIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteDrug(@PathVariable Long id) {
        pharmacyService.deleteDrug(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/prescriptions")
    @PreAuthorize("hasAnyRole('PHARMACIST', 'DOCTOR', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'PATIENT', 'RECEPTIONIST', 'CASHIER_ADMIN')")
    public ResponseEntity<List<PrescriptionResponse>> getAllPrescriptions() {
        return ResponseEntity.ok(pharmacyService.getAllPrescriptions());
    }

    @PostMapping("/prescriptions")
    @PreAuthorize("hasAnyRole('DOCTOR', 'SYSTEM_ADMIN', 'ADMIN')")
    public ResponseEntity<PrescriptionResponse> createPrescription(@RequestBody PrescriptionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pharmacyService.createPrescription(request));
    }

    @PostMapping("/prescriptions/{prescriptionId}/dispense")
    @PreAuthorize("hasAnyRole('PHARMACIST', 'SYSTEM_ADMIN', 'ADMIN')")
    public ResponseEntity<DispenseResponse> dispensePrescription(@PathVariable Long prescriptionId) {
        return ResponseEntity.ok(pharmacyService.dispensePrescription(prescriptionId));
    }
}
