package com.pulseos.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

public class PharmacyDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DrugRequest {
        private String itemCode;
        private String drugName;
        private String genericName;
        private String brandName;
        private String category;
        private String dosageForm;
        private String strength;
        private BigDecimal unitPrice;
        private Integer stockQuantity;
        private Integer reorderLevel;
        private String expiryDate;
        private String batchNumber;
        private String manufacturer;

        public String getResolvedItemCode() {
            return itemCode != null && !itemCode.isBlank() ? itemCode : "MED-" + System.currentTimeMillis();
        }

        public String getResolvedName() {
            if (genericName != null && !genericName.isBlank()) return genericName;
            return drugName != null ? drugName : "Generic Medicine";
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class DrugResponse {
        private Long id;
        private Long drugId;
        private String itemCode;
        private String genericName;
        private String drugName;
        private String brandName;
        private String category;
        private String dosageForm;
        private String strength;
        private BigDecimal unitPrice;
        private Integer stockQuantity;
        private Integer reorderLevel;
        private String expiryDate;
        private String batchNumber;
        private String manufacturer;
        private Boolean isLowStock;
        private Boolean isExpired;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PrescriptionItemRequest {
        private Long drugId;
        private String dosage;
        private String frequency;
        private String dosageFrequency;
        private Integer durationDays;
        private Integer prescribedQuantity;
        private Integer prescribedQty;
        private String instructions;

        public Integer getResolvedPrescribedQuantity() {
            if (prescribedQuantity != null) return prescribedQuantity;
            return prescribedQty != null ? prescribedQty : 1;
        }

        public String getResolvedFrequency() {
            if (frequency != null && !frequency.isBlank()) return frequency;
            return dosageFrequency != null ? dosageFrequency : "OD";
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class PrescriptionItemResponse {
        private Long id;
        private Long drugId;
        private String drugName;
        private String dosage;
        private String frequency;
        private Integer durationDays;
        private Integer prescribedQuantity;
        private Integer prescribedQty;
        private Integer dispensedQuantity;
        private Integer dispensedQty;
        private Boolean isDispensed;
        private BigDecimal unitPrice;
        private String instructions;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PrescriptionRequest {
        private Long appointmentId;
        private Long patientId;
        private Long doctorId;
        private String notes;
        private String doctorInstructions;
        private List<PrescriptionItemRequest> items;

        public String getResolvedNotes() {
            if (notes != null && !notes.isBlank()) return notes;
            return doctorInstructions;
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class PrescriptionResponse {
        private Long id;
        private Long prescriptionId;
        private String prescriptionNumber;
        private Long appointmentId;
        private Long patientId;
        private String patientName;
        private Long doctorId;
        private String doctorName;
        private String issuedDate;
        private String prescriptionDate;
        private String status;
        private String notes;
        private String doctorInstructions;
        private List<PrescriptionItemResponse> items;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DispenseResponse {
        private String message;
        private PrescriptionResponse prescription;
    }
}
