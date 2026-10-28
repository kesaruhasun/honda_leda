package com.pulseos.pharmacy;

import com.pulseos.pharmacy.PharmacyDTOs.*;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
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
        @JsonProperty("id")
        @JsonAlias({"drugId"})
        private Long id;

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

        @JsonProperty("drugId")
        public Long getDrugId() { return id; }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PrescriptionItemRequest {
        private Long drugId;
        private String dosage;

        @JsonProperty("frequency")
        @JsonAlias({"dosageFrequency"})
        private String frequency;

        private Integer durationDays;

        @JsonProperty("prescribedQuantity")
        @JsonAlias({"prescribedQty", "quantity"})
        private Integer prescribedQuantity;

        private String instructions;

        public Integer getResolvedPrescribedQuantity() {
            return prescribedQuantity != null ? prescribedQuantity : 1;
        }

        public String getResolvedFrequency() {
            if (frequency != null && !frequency.isBlank()) return frequency;
            return "OD";
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class PrescriptionItemResponse {
        @JsonProperty("drugId")
        @JsonAlias({"id"})
        private Long drugId;

        private String drugName;
        private String dosage;
        private String frequency;
        private Integer durationDays;

        @JsonProperty("prescribedQuantity")
        @JsonAlias({"prescribedQty"})
        private Integer prescribedQuantity;

        @JsonProperty("dispensedQuantity")
        @JsonAlias({"dispensedQty"})
        private Integer dispensedQuantity;

        private Boolean isDispensed;
        private BigDecimal unitPrice;
        private String instructions;

        // Zero duplicate fields in Java: JSON getters for contract compatibility
        @JsonProperty("id")
        public Long getId() { return drugId; }

        @JsonProperty("prescribedQty")
        public Integer getPrescribedQty() { return prescribedQuantity; }

        @JsonProperty("dispensedQty")
        public Integer getDispensedQty() { return dispensedQuantity; }
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

        @JsonProperty("doctorInstructions")
        @JsonAlias({"notes", "instructions"})
        private String doctorInstructions;

        private List<PrescriptionItemRequest> items;

        public String getResolvedNotes() { return doctorInstructions; }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class PrescriptionResponse {
        @JsonProperty("id")
        @JsonAlias({"prescriptionId"})
        private Long id;

        private String prescriptionNumber;
        private Long appointmentId;
        private Long patientId;
        private String patientName;
        private Long doctorId;
        private String doctorName;

        @JsonProperty("prescriptionDate")
        @JsonAlias({"issuedDate"})
        private String prescriptionDate;

        private String status;

        @JsonProperty("doctorInstructions")
        @JsonAlias({"notes"})
        private String doctorInstructions;

        private List<PrescriptionItemResponse> items;

        // Zero duplicate fields in Java: JSON getters for contract compatibility
        @JsonProperty("prescriptionId")
        public Long getPrescriptionId() { return id; }

        @JsonProperty("issuedDate")
        public String getIssuedDate() { return prescriptionDate; }

        @JsonProperty("notes")
        public String getNotes() { return doctorInstructions; }
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
