package com.pulseos.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDate;

public class PatientDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PatientRequest {
        private String nicPassport;
        private String nicPassportNo;
        private String firstName;
        private String lastName;
        private String email;
        private String phoneNumber;
        private String contactNumber;
        private String address;
        private String gender;
        private String dateOfBirth;
        private String dob;
        private String bloodGroup;
        private String allergies;
        private String emergencyContactName;
        private String emergencyContactPhone;
        private String emergencyContactRelationship;
        private String triagePriority;
        private String medicalNotes;

        public String getResolvedNic() {
            return nicPassport != null && !nicPassport.isBlank() ? nicPassport : nicPassportNo;
        }

        public String getResolvedPhone() {
            return phoneNumber != null && !phoneNumber.isBlank() ? phoneNumber : contactNumber;
        }

        public String getResolvedDob() {
            return dateOfBirth != null && !dateOfBirth.isBlank() ? dateOfBirth : dob;
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class PatientResponse {
        private Long id;
        private Long personId;
        private Long patientId;
        private String nicPassport;
        private String nicPassportNo;
        private String firstName;
        private String lastName;
        private String fullName;
        private String email;
        private String phoneNumber;
        private String contactNumber;
        private String address;
        private String gender;
        private String dateOfBirth;
        private String dob;
        private String bloodGroup;
        private String allergies;
        private String emergencyContactName;
        private String emergencyContactPhone;
        private String emergencyContactRelationship;
        private String triagePriority;
        private String medicalNotes;
        private Boolean isArchived;
        private String status;
        private String registrationDate;
    }
}
