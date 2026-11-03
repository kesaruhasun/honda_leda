package com.pulseos.appointment;

import com.pulseos.appointment.AppointmentDTOs.*;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
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

        @JsonProperty("appointmentTime")
        @JsonAlias({"startTime"})
        private String appointmentTime;

        private String endTime;

        @JsonProperty("reasonForVisit")
        @JsonAlias({"symptomsReason"})
        private String reasonForVisit;

        private String roomNumber;

        public String getResolvedStartTime() { return appointmentTime; }
        public String getResolvedReason() { return reasonForVisit; }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class AppointmentResponse {
        @JsonProperty("id")
        @JsonAlias({"appointmentId"})
        private Long id;

        private String appointmentNumber;
        private Long patientId;
        private String patientName;
        private String patientNic;
        private Long doctorId;
        private String doctorName;
        private String specialization;
        private String appointmentDate;

        @JsonProperty("appointmentTime")
        @JsonAlias({"startTime"})
        private String appointmentTime;

        private String endTime;
        private String status;

        @JsonProperty("reasonForVisit")
        @JsonAlias({"symptomsReason"})
        private String reasonForVisit;

        private String roomNumber;
        private String createdAt;

        // Zero duplicate fields in Java: JSON getters for contract compatibility
        @JsonProperty("appointmentId")
        public Long getAppointmentId() { return id; }

        @JsonProperty("startTime")
        public String getStartTime() { return appointmentTime; }

        @JsonProperty("symptomsReason")
        public String getSymptomsReason() { return reasonForVisit; }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RescheduleRequest {
        private String appointmentDate;

        @JsonProperty("appointmentTime")
        @JsonAlias({"startTime"})
        private String appointmentTime;

        private String endTime;

        public String getResolvedStartTime() { return appointmentTime; }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusUpdateRequest {
        private String status;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class CalendarSlotInfo {
        private Long doctorId;
        private String doctorName;
        private String specialization;
        private String dayOfWeek;
        private String startTime;
        private String endTime;
        private Integer slotDurationMinutes;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class DoctorLoadInfo {
        private Long doctorId;
        private String doctorName;
        private String specialization;
        private int appointmentCount;
        private Boolean isAvailable;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class CalendarViewResponse {
        private String role;
        private Long patientId;
        private Long doctorId;
        private String doctorName;
        private java.util.List<AppointmentResponse> appointments;
        private java.util.List<CalendarSlotInfo> availableSlots;
        private Object schedules;
        private java.util.List<AppointmentResponse> queue;
        private Integer totalAppointments;
        private String hospitalLoad;
        private java.util.List<DoctorLoadInfo> doctorLoad;
        private Object allSchedules;
    }
}
