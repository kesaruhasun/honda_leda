package com.pulseos.service;

import com.pulseos.common.exception.PulseException;
import com.pulseos.dto.PharmacyDTOs.*;
import com.pulseos.entity.Drug;
import com.pulseos.entity.Prescription;
import com.pulseos.entity.PrescriptionItem;
import com.pulseos.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PharmacyService {

    private final DrugRepository drugRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final DrugDispensationRepository drugDispensationRepository;

    @Transactional(readOnly = true)
    public List<DrugResponse> getAllDrugs() {
        return drugRepository.findAll().stream()
                .map(this::toDrugResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DrugResponse> getLowStockDrugs() {
        return drugRepository.findLowStockDrugs().stream()
                .map(this::toDrugResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DrugResponse addDrug(DrugRequest req) {
        String name = req.getResolvedName();
        if (name == null || name.isBlank()) {
            throw PulseException.badRequest("Validation Error", "Drug name is required");
        }
        if (req.getUnitPrice() != null && req.getUnitPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw PulseException.badRequest("Invalid Price", "Unit price cannot be negative");
        }
        if (req.getStockQuantity() != null && req.getStockQuantity() < 0) {
            throw PulseException.badRequest("Invalid Stock", "Stock quantity cannot be negative");
        }

        String itemCode = req.getResolvedItemCode();
        if (drugRepository.existsByItemCode(itemCode)) {
            throw PulseException.conflict("Duplicate Item Code", "Drug with item code " + itemCode + " already exists");
        }

        Drug drug = new Drug();
        drug.setDrugName(name);
        drug.setGenericName(req.getGenericName() != null ? req.getGenericName() : name);
        drug.setCategory(req.getCategory() != null ? req.getCategory() : "General");
        drug.setUnitPrice(req.getUnitPrice() != null ? req.getUnitPrice() : new BigDecimal("100.00"));
        drug.setStockQuantity(req.getStockQuantity() != null ? req.getStockQuantity() : 100);
        drug.setBatchNumber(req.getBatchNumber() != null ? req.getBatchNumber() : "BATCH-" + System.currentTimeMillis());
        drug.setExpiryDate(req.getExpiryDate() != null ? LocalDate.parse(req.getExpiryDate()) : LocalDate.now().plusYears(2));
        drug.setItemCode(itemCode);
        drug.setBrandName(req.getBrandName() != null ? req.getBrandName() : name);
        drug.setDosageForm(req.getDosageForm() != null ? req.getDosageForm() : "TABLET");
        drug.setStrength(req.getStrength() != null ? req.getStrength() : "500mg");
        drug.setManufacturer(req.getManufacturer() != null ? req.getManufacturer() : "Standard Pharma");
        drug.setReorderLevel(req.getReorderLevel() != null ? req.getReorderLevel() : 50);

        Drug saved = drugRepository.save(drug);
        log.info("Added drug: ID={}, Name={}", saved.getDrugId(), saved.getDrugName());
        return toDrugResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getAllPrescriptions() {
        return prescriptionRepository.findAll().stream()
                .map(this::toPrescriptionResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DispenseResponse dispensePrescription(Long prescriptionId) {
        Prescription rx = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> PulseException.notFound("Prescription not found"));

        if ("DISPENSED".equals(rx.getStatus())) {
            throw PulseException.badRequest("Already Dispensed", "This prescription has already been dispensed");
        }

        for (PrescriptionItem item : rx.getItems()) {
            Drug drug = item.getDrug();
            int requiredQty = item.getQuantity();

            if (drug.getStockQuantity() < requiredQty) {
                throw PulseException.badRequest("Insufficient Stock",
                        "Not enough stock for " + drug.getDrugName() + ". Available: " + drug.getStockQuantity() + ", Required: " + requiredQty);
            }

            drug.setStockQuantity(drug.getStockQuantity() - requiredQty);
            drugRepository.save(drug);

            item.setDispensedQuantity(requiredQty);
            item.setIsDispensed(true);
        }

        rx.setStatus("DISPENSED");
        Prescription saved = prescriptionRepository.save(rx);
        log.info("Dispensed prescription: ID={}", saved.getPrescriptionId());

        return DispenseResponse.builder()
                .message("Prescription dispensed successfully")
                .prescription(toPrescriptionResponse(saved))
                .build();
    }

    private DrugResponse toDrugResponse(Drug d) {
        return DrugResponse.builder()
                .id(d.getDrugId())
                .drugId(d.getDrugId())
                .itemCode(d.getItemCode())
                .genericName(d.getGenericName())
                .drugName(d.getDrugName())
                .brandName(d.getBrandName())
                .category(d.getCategory())
                .dosageForm(d.getDosageForm())
                .strength(d.getStrength())
                .unitPrice(d.getUnitPrice())
                .stockQuantity(d.getStockQuantity())
                .reorderLevel(d.getReorderLevel())
                .expiryDate(d.getExpiryDate() != null ? d.getExpiryDate().toString() : "")
                .batchNumber(d.getBatchNumber())
                .manufacturer(d.getManufacturer())
                .isLowStock(d.isLowStock())
                .isExpired(d.isExpired())
                .build();
    }

    private PrescriptionResponse toPrescriptionResponse(Prescription rx) {
        List<PrescriptionItemResponse> items = rx.getItems().stream().map(item ->
                PrescriptionItemResponse.builder()
                        .id(item.getDrug() != null ? item.getDrug().getDrugId() : null)
                        .drugId(item.getDrug() != null ? item.getDrug().getDrugId() : null)
                        .drugName(item.getDrug() != null ? item.getDrug().getDrugName() : "Unknown")
                        .dosage(item.getDosage())
                        .frequency(item.getFrequency())
                        .durationDays(item.getDurationDays())
                        .prescribedQuantity(item.getQuantity())
                        .prescribedQty(item.getQuantity())
                        .dispensedQuantity(item.getDispensedQuantity())
                        .dispensedQty(item.getDispensedQuantity())
                        .isDispensed(item.getIsDispensed())
                        .unitPrice(item.getDrug() != null ? item.getDrug().getUnitPrice() : BigDecimal.ZERO)
                        .instructions(item.getInstructions())
                        .build()
        ).collect(Collectors.toList());

        return PrescriptionResponse.builder()
                .id(rx.getPrescriptionId())
                .prescriptionId(rx.getPrescriptionId())
                .prescriptionNumber(rx.getPrescriptionNumber())
                .appointmentId(rx.getAppointment() != null ? rx.getAppointment().getAppointmentId() : null)
                .patientId(rx.getPatient() != null ? rx.getPatient().getId() : null)
                .patientName(rx.getPatient() != null ? rx.getPatient().getFullName() : "")
                .doctorId(rx.getDoctor() != null ? rx.getDoctor().getId() : null)
                .doctorName(rx.getDoctor() != null ? rx.getDoctor().getFullName() : "")
                .issuedDate(rx.getPrescriptionDate() != null ? rx.getPrescriptionDate().toString() : "")
                .prescriptionDate(rx.getPrescriptionDate() != null ? rx.getPrescriptionDate().toLocalDate().toString() : "")
                .status(rx.getStatus())
                .notes(rx.getDoctorInstructions())
                .doctorInstructions(rx.getDoctorInstructions())
                .items(items)
                .build();
    }
}
