package com.pulseos.doctor;

import com.pulseos.doctor.DoctorDTOs.*;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
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

        @JsonProperty("phoneNumber")
        @JsonAlias({"contactNumber", "phone"})
        private String phoneNumber;

        @JsonProperty("doctorLicenseNo")
        @JsonAlias({"licenseNo", "licenseNumber"})
        private String doctorLicenseNo;

        private String specialization;
        private BigDecimal consultationFee;
        private String roomNumber;
        private Boolean isAvailable;
        private Long departmentId;
        private String departmentName;
        private String password;

        public String getResolvedLicense() { return doctorLicenseNo; }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class DoctorResponse {
        @JsonProperty("id")
        @JsonAlias({"employeeId"})
        private Long id;

        private String firstName;
        private String lastName;
        private String fullName;
        private String email;

        @JsonProperty("contactNumber")
        @JsonAlias({"phoneNumber"})
        private String contactNumber;

        @JsonProperty("doctorLicenseNo")
        @JsonAlias({"licenseNo", "licenseNumber"})
        private String doctorLicenseNo;

        private String specialization;
        private BigDecimal consultationFee;
        private String roomNumber;
        private Boolean isAvailable;
        private Long departmentId;
        private String departmentName;

        // Zero duplicate fields in Java: JSON getters for contract compatibility
        @JsonProperty("employeeId")
        public Long getEmployeeId() { return id; }

        @JsonProperty("phoneNumber")
        public String getPhoneNumber() { return contactNumber; }

        @JsonProperty("licenseNo")
        public String getLicenseNo() { return doctorLicenseNo; }

        @JsonProperty("licenseNumber")
        public String getLicenseNumber() { return doctorLicenseNo; }
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
