package com.pulseos.patient;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDateTime;

public class WardDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class WardResponse {
        @JsonProperty("id")
        @JsonAlias({"wardId"})
        private Long id;

        private String wardName;
        private String wardType;
        private Integer bedCapacity;
        private Integer currentOccupancy;
        private Integer availableBeds;
        private Double occupancyRate;

        @JsonProperty("wardId")
        public Long getWardId() {
            return id;
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdmissionRequest {
        private Long patientId;
        private Long wardId;
        private String bedNumber;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class AdmissionResponse {
        @JsonProperty("id")
        @JsonAlias({"admissionId"})
        private Long id;

        private Long patientId;
        private String patientName;
        private String patientNic;
        private Long wardId;
        private String wardName;
        private String wardType;
        private String bedNumber;
        private LocalDateTime admissionDate;
        private LocalDateTime dischargeDate;
        private String status;

        @JsonProperty("admissionId")
        public Long getAdmissionId() {
            return id;
        }
    }
}
