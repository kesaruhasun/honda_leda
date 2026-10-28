package com.pulseos.laboratory;

import com.pulseos.laboratory.LabDTOs.*;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
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

        @JsonProperty("price")
        @JsonAlias({"standardFee"})
        private BigDecimal price;

        private String sampleType;
        private Double normalRangeMin;
        private Double normalRangeMax;
        private String measurementUnit;

        @JsonProperty("standardFee")
        public BigDecimal getStandardFee() { return price; }
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

        @JsonProperty("testCatalogId")
        @JsonAlias({"labTestId"})
        private Long testCatalogId;

        private String urgency;
        private String clinicalIndication;

        public Long getResolvedTestCatalogId() { return testCatalogId; }
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

        @JsonProperty("clinicalRemarks")
        @JsonAlias({"technicianNotes", "remarks"})
        private String clinicalRemarks;

        private Boolean isAbnormal;

        public String getResolvedRemarks() { return clinicalRemarks; }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LabResultDirectRequest {
        private Long requestId;
        private Long testId;
        private Double resultValue;
        private String resultData;
        private Long technicianEmployeeId;
        private String clinicalRemarks;
        private Boolean isAbnormal;

        public Long getResolvedId() {
            return requestId != null ? requestId : testId;
        }

        public LabResultRequest toResultRequest() {
            return LabResultRequest.builder()
                    .resultValue(resultValue)
                    .resultData(resultData != null ? resultData : (resultValue != null ? String.valueOf(resultValue) : null))
                    .technicianEmployeeId(technicianEmployeeId)
                    .clinicalRemarks(clinicalRemarks)
                    .isAbnormal(isAbnormal)
                    .build();
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class LabRequestResponse {
        @JsonProperty("id")
        @JsonAlias({"testId"})
        private Long id;

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

        @JsonProperty("sampleType")
        @JsonAlias({"specimenType"})
        private String sampleType;

        private String unit;
        private String remarks;
        private String technicianName;
        private String conductionDate;
        private Boolean isAbnormal;
        private BigDecimal standardFee;
        private String testDate;

        // Zero duplicate fields in Java: JSON getters for contract compatibility
        @JsonProperty("testId")
        public Long getTestId() { return id; }

        @JsonProperty("specimenType")
        public String getSpecimenType() { return sampleType; }
    }
}
