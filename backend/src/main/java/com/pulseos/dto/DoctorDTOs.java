package com.pulseos.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.math.BigDecimal;

public class DoctorDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DoctorRequest {
        private String firstName;
        private String lastName;
        private String email;
        private String phoneNumber;
        private String licenseNumber;
        private String licenseNo;
        private String doctorLicenseNo;
        private String specialization;
        private BigDecimal consultationFee;
        private String roomNumber;
        private Boolean isAvailable;
        private Long departmentId;
        private String departmentName;

        public String getResolvedLicense() {
            if (licenseNumber != null && !licenseNumber.isBlank()) return licenseNumber;
            if (licenseNo != null && !licenseNo.isBlank()) return licenseNo;
            return doctorLicenseNo;
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class DoctorResponse {
        private Long id;
        private Long employeeId;
        private String firstName;
        private String lastName;
        private String fullName;
        private String email;
        private String phoneNumber;
        private String contactNumber;
        private String licenseNumber;
        private String licenseNo;
        private String doctorLicenseNo;
        private String specialization;
        private BigDecimal consultationFee;
        private String roomNumber;
        private Boolean isAvailable;
        private Long departmentId;
        private String departmentName;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DoctorFeeUpdateRequest {
        private BigDecimal consultationFee;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DoctorAvailabilityUpdateRequest {
        private Boolean isAvailable;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DoctorScheduleRequest {
        private String dayOfWeek;
        private String startTime;
        private String endTime;
        private Integer maxPatients;
        private Integer slotDurationMinutes;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DoctorScheduleResponse {
        private Long id;
        private Long doctorId;
        private String dayOfWeek;
        private String startTime;
        private String endTime;
        private Integer maxPatients;
        private Integer slotDurationMinutes;
        private Boolean isActive;
    }
}
