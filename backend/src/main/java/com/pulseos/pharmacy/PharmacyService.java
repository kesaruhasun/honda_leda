package com.pulseos.pharmacy;

import com.pulseos.appointment.Appointment;
import com.pulseos.appointment.AppointmentRepository;
import com.pulseos.common.PulseException;
import com.pulseos.doctor.Doctor;
import com.pulseos.doctor.DoctorRepository;
import com.pulseos.patient.Patient;
import com.pulseos.patient.PatientRepository;
import com.pulseos.pharmacy.PharmacyDTOs.*;

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
    private final com.pulseos.billing.InvoiceRepository invoiceRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final DrugDispensationRepository drugDispensationRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;

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

    @Transactional
    public PrescriptionResponse createPrescription(PrescriptionRequest req) {
        Doctor doctor = null;
        if (req.getDoctorId() != null) {
            doctor = doctorRepository.findById(req.getDoctorId()).orElse(null);
        }
        if (doctor == null) {
            doctor = doctorRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> PulseException.notFound("No registered doctor found"));
        }

        Patient patient = null;
        if (req.getPatientId() != null) {
            patient = patientRepository.findById(req.getPatientId()).orElse(null);
        }
        if (patient == null) {
            throw PulseException.badRequest("Validation Error", "Patient is required for prescription");
        }

        Appointment appointment = null;
        if (req.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(req.getAppointmentId()).orElse(null);
        }

        Prescription rx = new Prescription();
        rx.setDoctor(doctor);
        rx.setPatient(patient);
        rx.setAppointment(appointment);
        rx.setPrescriptionDate(java.time.LocalDateTime.now());
        rx.setDoctorInstructions(req.getResolvedNotes() != null ? req.getResolvedNotes() : "Follow physician dosage instructions.");
        rx.setPrescriptionNumber("RX-" + System.currentTimeMillis());
        rx.setStatus("PENDING");

        Prescription saved = prescriptionRepository.saveAndFlush(rx);

        if (req.getItems() != null && !req.getItems().isEmpty()) {
            for (PrescriptionItemRequest ir : req.getItems()) {
                Drug drug = drugRepository.findById(ir.getDrugId())
                        .orElseThrow(() -> PulseException.notFound("Drug not found with ID: " + ir.getDrugId()));
                PrescriptionItemId itemId = new PrescriptionItemId(saved.getPrescriptionId(), drug.getDrugId());
                PrescriptionItem item = new PrescriptionItem(
                        itemId,
                        saved,
                        drug,
                        ir.getDosage() != null ? ir.getDosage() : (drug.getStrength() != null ? drug.getStrength() : "1 tablet"),
                        ir.getResolvedFrequency(),
                        ir.getDurationDays() != null ? ir.getDurationDays() : 5,
                        ir.getResolvedPrescribedQuantity(),
                        false
                );
                item.setInstructions(ir.getInstructions() != null ? ir.getInstructions() : "Take with water");
                prescriptionItemRepository.save(item);
            }
        }

        Prescription reloaded = prescriptionRepository.findById(saved.getPrescriptionId()).orElse(saved);
        log.info("Created new prescription: ID={}, Number={}, Patient={}", reloaded.getPrescriptionId(), reloaded.getPrescriptionNumber(), patient.getFullName());
        return toPrescriptionResponse(reloaded);
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

        // Dispense processing is decoupled from cashier checkout; pickup slip gated at patient end

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
                        .drugId(item.getDrug() != null ? item.getDrug().getDrugId() : null)
                        .drugName(item.getDrug() != null ? item.getDrug().getDrugName() : "Unknown")
                        .dosage(item.getDosage())
                        .frequency(item.getFrequency())
                        .durationDays(item.getDurationDays())
                        .prescribedQuantity(item.getQuantity())
                        .dispensedQuantity(item.getDispensedQuantity())
                        .isDispensed(item.getIsDispensed())
                        .unitPrice(item.getDrug() != null ? item.getDrug().getUnitPrice() : BigDecimal.ZERO)
                        .instructions(item.getInstructions())
                        .build()
        ).collect(Collectors.toList());

        return PrescriptionResponse.builder()
                .id(rx.getPrescriptionId())
                .prescriptionNumber(rx.getPrescriptionNumber())
                .appointmentId(rx.getAppointment() != null ? rx.getAppointment().getAppointmentId() : null)
                .patientId(rx.getPatient() != null ? rx.getPatient().getId() : null)
                .patientName(rx.getPatient() != null ? rx.getPatient().getFullName() : "")
                .doctorId(rx.getDoctor() != null ? rx.getDoctor().getId() : null)
                .doctorName(rx.getDoctor() != null ? rx.getDoctor().getFullName() : "")
                .prescriptionDate(rx.getPrescriptionDate() != null ? rx.getPrescriptionDate().toLocalDate().toString() : "")
                .status(rx.getStatus())
                .doctorInstructions(rx.getDoctorInstructions())
                .items(items)
                .build();
    }
}
