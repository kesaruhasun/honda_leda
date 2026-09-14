package com.pulseos.service;

import com.pulseos.common.exception.PulseException;
import com.pulseos.dto.LabDTOs.*;
import com.pulseos.entity.*;
import com.pulseos.entity.enums.LabTestStatus;
import com.pulseos.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LaboratoryService {

    private final LabTestRepository labTestRepository;
    private final LabTestCatalogRepository labTestCatalogRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final LabTechnicianRepository labTechnicianRepository;

    @Transactional(readOnly = true)
    public List<LabRequestResponse> getAllTests() {
        return labTestRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LabCatalogResponse> getCatalog() {
        return labTestCatalogRepository.findAll().stream()
                .map(c -> LabCatalogResponse.builder()
                        .id(c.getId())
                        .testCode(c.getTestCode())
                        .testName(c.getTestName())
                        .category(c.getCategory())
                        .price(c.getPrice())
                        .standardFee(c.getPrice())
                        .sampleType(c.getSampleType())
                        .normalRangeMin(c.getNormalRangeMin())
                        .normalRangeMax(c.getNormalRangeMax())
                        .measurementUnit(c.getMeasurementUnit())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public LabRequestResponse createTest(LabOrderRequest req) {
        if (req.getPatientId() == null) {
            throw PulseException.badRequest("Missing Patient", "Patient ID is mandatory to order a laboratory investigation.");
        }

        Patient patient = patientRepository.findById(req.getPatientId())
                .orElseThrow(() -> PulseException.notFound("Patient with ID " + req.getPatientId() + " not found"));

        Doctor doctor = null;
        if (req.getDoctorId() != null) {
            doctor = doctorRepository.findById(req.getDoctorId()).orElse(null);
        }
        if (doctor == null) {
            doctor = doctorRepository.findAll().stream().findFirst().orElse(null);
        }

        Appointment appointment = null;
        if (req.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(req.getAppointmentId()).orElse(null);
        }

        LabTestCatalog catalog = null;
        Long catalogId = req.getResolvedTestCatalogId();
        if (catalogId != null) {
            catalog = labTestCatalogRepository.findById(catalogId).orElse(null);
        }

        LabTest test = new LabTest();
        test.setPatient(patient);
        test.setDoctor(doctor);
        test.setAppointment(appointment);

        if (catalog != null) {
            test.setLabTestCatalogId(catalog.getId());
            test.setTestName(catalog.getTestName());
            test.setTestCode(catalog.getTestCode());
            test.setCategory(catalog.getCategory());
            test.setStandardFee(catalog.getPrice());
            test.setSampleType(catalog.getSampleType());
            test.setUnit(catalog.getMeasurementUnit());
            if (catalog.getNormalRangeMin() != null && catalog.getNormalRangeMax() != null) {
                test.setReferenceRange(catalog.getNormalRangeMin() + " - " + catalog.getNormalRangeMax() + " " + (catalog.getMeasurementUnit() != null ? catalog.getMeasurementUnit() : ""));
            } else {
                test.setReferenceRange("Clinical Normal Limits");
            }
        } else {
            test.setTestName("Diagnostic Pathology Investigation");
            test.setTestCode("LAB-GEN");
            test.setCategory("Biochemistry");
            test.setStandardFee(new BigDecimal("1500.00"));
            test.setSampleType("Venous Blood");
            test.setReferenceRange("Standard reference interval");
        }

        int randSuffix = 1000 + new Random().nextInt(9000);
        test.setRequestNumber("REQ-2026-" + randSuffix);
        test.setUrgency(req.getUrgency() != null ? req.getUrgency().toUpperCase() : "ROUTINE");
        test.setClinicalIndication(req.getClinicalIndication() != null ? req.getClinicalIndication() : "Physician diagnostic workup");
        test.setTestStatus(LabTestStatus.REQUESTED);
        test.setTestDate(LocalDate.now());

        LabTest saved = labTestRepository.save(test);
        log.info("Created new Lab Test Order: ID={}, RequestNumber={}, TestName={}",
                saved.getTestId(), saved.getRequestNumber(), saved.getTestName());
        return toResponse(saved);
    }

    @Transactional
    public LabRequestResponse updateTestStatus(Long testId, String status) {
        LabTest test = labTestRepository.findById(testId)
                .orElseThrow(() -> PulseException.notFound("Lab test with ID " + testId + " not found"));

        try {
            String normalized = status.toUpperCase();
            if ("COLLECTED".equals(normalized)) {
                normalized = "SAMPLE_COLLECTED";
            }
            LabTestStatus newStatus = LabTestStatus.valueOf(normalized);
            test.setTestStatus(newStatus);
        } catch (IllegalArgumentException e) {
            throw PulseException.badRequest("Invalid Status", "Status must be one of: REQUESTED, SAMPLE_COLLECTED, PROCESSING, COMPLETED, CANCELLED");
        }

        LabTest saved = labTestRepository.save(test);
        log.info("Updated lab test status: ID={}, Status={}", saved.getTestId(), saved.getTestStatus());
        return toResponse(saved);
    }

    @Transactional
    public LabRequestResponse submitResults(Long testId, LabResultRequest req) {
        LabTest test = labTestRepository.findById(testId)
                .orElseThrow(() -> PulseException.notFound("Lab test with ID " + testId + " not found"));

        if (req.getResultData() != null) {
            test.setResultData(req.getResultData());
        }
        if (req.getResultValue() != null) {
            test.setResultValue(req.getResultValue());
        }

        boolean abnormal = Boolean.TRUE.equals(req.getIsAbnormal());
        test.setFlag(abnormal ? "ABNORMAL" : "NORMAL");

        String remarks = req.getResolvedRemarks();
        if (remarks != null) {
            test.setRemarks(remarks);
        }

        // Attach technician if not already set
        if (test.getTechnician() == null) {
            LabTechnician tech = labTechnicianRepository.findAll().stream().findFirst().orElse(null);
            test.setTechnician(tech);
        }

        test.setTestStatus(LabTestStatus.COMPLETED);
        test.setConductionDate(LocalDateTime.now());

        LabTest saved = labTestRepository.save(test);
        log.info("Submitted lab results: ID={}, Flag={}", saved.getTestId(), saved.getFlag());
        return toResponse(saved);
    }

    @Transactional
    public void deleteTest(Long testId) {
        LabTest test = labTestRepository.findById(testId)
                .orElseThrow(() -> PulseException.notFound("Lab test with ID " + testId + " not found"));
        test.setTestStatus(LabTestStatus.CANCELLED);
        labTestRepository.save(test);
        log.info("Cancelled / Archived lab test ID={}", testId);
    }

    private LabRequestResponse toResponse(LabTest t) {
        return LabRequestResponse.builder()
                .id(t.getTestId())
                .testId(t.getTestId())
                .requestNumber(t.getRequestNumber() != null ? t.getRequestNumber() : ("REQ-" + t.getTestId()))
                .testCode(t.getTestCode() != null ? t.getTestCode() : "LAB-" + t.getTestId())
                .sampleType(t.getSampleType())
                .specimenType(t.getSampleType() != null ? t.getSampleType() : "Whole Blood / Serum")
                .appointmentId(t.getAppointment() != null ? t.getAppointment().getAppointmentId() : null)
                .patientId(t.getPatient() != null ? t.getPatient().getId() : null)
                .patientName(t.getPatient() != null ? t.getPatient().getFullName() : "Patient")
                .doctorId(t.getDoctor() != null ? t.getDoctor().getId() : null)
                .doctorName(t.getDoctor() != null ? t.getDoctor().getFullName() : "Dr. Kavinda Rathnayaka")
                .labTestId(t.getLabTestCatalogId())
                .testName(t.getTestName())
                .category(t.getCategory())
                .urgency(t.getUrgency() != null ? t.getUrgency() : "ROUTINE")
                .status(t.getTestStatus() != null ? t.getTestStatus().name() : "REQUESTED")
                .clinicalIndication(t.getClinicalIndication())
                .resultValue(t.getResultValue())
                .resultData(t.getResultData())
                .flag(t.getFlag())
                .referenceRange(t.getReferenceRange())
                .unit(t.getUnit())
                .remarks(t.getRemarks())
                .technicianName(t.getTechnician() != null ? t.getTechnician().getFullName() : "N. Thilakarathne, MLT")
                .conductionDate(t.getConductionDate() != null ? t.getConductionDate().toString() : null)
                .isAbnormal("ABNORMAL".equals(t.getFlag()))
                .standardFee(t.getStandardFee())
                .testDate(t.getTestDate() != null ? t.getTestDate().toString() : "")
                .build();
    }
}
