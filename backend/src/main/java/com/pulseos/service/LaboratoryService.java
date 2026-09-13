package com.pulseos.service;

import com.pulseos.common.exception.PulseException;
import com.pulseos.dto.LabDTOs.*;
import com.pulseos.entity.LabTest;
import com.pulseos.entity.enums.LabTestStatus;
import com.pulseos.repository.LabTestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LaboratoryService {

    private final LabTestRepository labTestRepository;

    @Transactional(readOnly = true)
    public List<LabRequestResponse> getAllTests() {
        return labTestRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public LabRequestResponse updateTestStatus(Long testId, String status) {
        LabTest test = labTestRepository.findById(testId)
                .orElseThrow(() -> PulseException.notFound("Lab test with ID " + testId + " not found"));

        try {
            LabTestStatus newStatus = LabTestStatus.valueOf(status.toUpperCase());
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

        test.setTestStatus(LabTestStatus.COMPLETED);
        test.setConductionDate(LocalDateTime.now());

        LabTest saved = labTestRepository.save(test);
        log.info("Submitted lab results: ID={}, Flag={}", saved.getTestId(), saved.getFlag());
        return toResponse(saved);
    }

    private LabRequestResponse toResponse(LabTest t) {
        return LabRequestResponse.builder()
                .id(t.getTestId())
                .testId(t.getTestId())
                .requestNumber(t.getRequestNumber())
                .appointmentId(t.getAppointment() != null ? t.getAppointment().getAppointmentId() : null)
                .patientId(t.getPatient() != null ? t.getPatient().getId() : null)
                .patientName(t.getPatient() != null ? t.getPatient().getFullName() : "")
                .doctorId(t.getDoctor() != null ? t.getDoctor().getId() : null)
                .doctorName(t.getDoctor() != null ? t.getDoctor().getFullName() : "")
                .labTestId(t.getLabTestCatalogId())
                .testName(t.getTestName())
                .category(t.getCategory())
                .urgency(t.getUrgency())
                .status(t.getTestStatus() != null ? t.getTestStatus().name() : "REQUESTED")
                .clinicalIndication(t.getClinicalIndication())
                .resultValue(t.getResultValue())
                .resultData(t.getResultData())
                .flag(t.getFlag())
                .referenceRange(t.getReferenceRange())
                .unit(t.getUnit())
                .remarks(t.getRemarks())
                .isAbnormal("ABNORMAL".equals(t.getFlag()))
                .standardFee(t.getStandardFee())
                .testDate(t.getTestDate() != null ? t.getTestDate().toString() : "")
                .build();
    }
}
