package com.pulseos.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.math.BigDecimal;

public class LabDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class LabCatalogResponse {
        private Long id;
        private String testCode;
        private String testName;
        private String category;
        private BigDecimal price;
        private BigDecimal standardFee;
        private String sampleType;
        private Double normalRangeMin;
        private Double normalRangeMax;
        private String measurementUnit;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LabOrderRequest {
        private Long appointmentId;
        private Long patientId;
        private Long doctorId;
        private Long labTestId;
        private Long testCatalogId;
        private String urgency;
        private String clinicalIndication;

        public Long getResolvedTestCatalogId() {
            if (labTestId != null) return labTestId;
            return testCatalogId;
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LabResultRequest {
        private Double resultValue;
        private String resultData;
        private Long technicianEmployeeId;
        private String clinicalRemarks;
        private String technicianNotes;
        private Boolean isAbnormal;

        public String getResolvedRemarks() {
            if (clinicalRemarks != null && !clinicalRemarks.isBlank()) return clinicalRemarks;
            return technicianNotes;
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class LabRequestResponse {
        private Long id;
        private Long testId;
        private String requestNumber;
        private Long appointmentId;
        private Long patientId;
        private String patientName;
        private Long doctorId;
        private String doctorName;
        private Long labTestId;
        private String testName;
        private String category;
        private String urgency;
        private String status;
        private String clinicalIndication;
        private Double resultValue;
        private String resultData;
        private String flag;
        private String referenceRange;
        private String testCode;
        private String sampleType;
        private String specimenType;
        private String unit;
        private String remarks;
        private String technicianName;
        private String conductionDate;
        private Boolean isAbnormal;
        private BigDecimal standardFee;
        private String testDate;
    }
}
