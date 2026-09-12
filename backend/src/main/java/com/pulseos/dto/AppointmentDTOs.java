package com.pulseos.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

public class AppointmentDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AppointmentRequest {
        private Long patientId;
        private Long doctorId;
        private String appointmentDate;
        private String startTime;
        private String appointmentTime;
        private String endTime;
        private String symptomsReason;
        private String reasonForVisit;
        private String roomNumber;

        public String getResolvedStartTime() {
            if (startTime != null && !startTime.isBlank()) return startTime;
            return appointmentTime;
        }

        public String getResolvedReason() {
            if (symptomsReason != null && !symptomsReason.isBlank()) return symptomsReason;
            return reasonForVisit;
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class AppointmentResponse {
        private Long id;
        private Long appointmentId;
        private String appointmentNumber;
        private Long patientId;
        private String patientName;
        private String patientNic;
        private Long doctorId;
        private String doctorName;
        private String specialization;
        private String appointmentDate;
        private String startTime;
        private String appointmentTime;
        private String endTime;
        private String status;
        private String symptomsReason;
        private String reasonForVisit;
        private String roomNumber;
        private String createdAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RescheduleRequest {
        private String appointmentDate;
        private String startTime;
        private String appointmentTime;
        private String endTime;

        public String getResolvedStartTime() {
            if (startTime != null && !startTime.isBlank()) return startTime;
            return appointmentTime;
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusUpdateRequest {
        private String status;
    }
}
