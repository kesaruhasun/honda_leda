package com.pulseos.patient;

import com.pulseos.patient.PatientDTOs.*;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

public class PatientDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PatientRequest {
        @JsonProperty("nicPassportNo")
        @JsonAlias({"nicPassport"})
        private String nicPassportNo;

        private String firstName;
        private String lastName;
        private String email;
        private String password;

        @JsonProperty("contactNumber")
        @JsonAlias({"phoneNumber", "phone"})
        private String contactNumber;

        private String address;
        private String gender;

        @JsonProperty("dateOfBirth")
        @JsonAlias({"dob"})
        private String dateOfBirth;

        private String bloodGroup;
        private String allergies;
        private String emergencyContactName;
        private String emergencyContactPhone;
        private String emergencyContactRelationship;
        private String triagePriority;
        private String medicalNotes;

        // Backward compatibility pass-throughs
        public String getResolvedNic() { return nicPassportNo; }
        public String getResolvedPhone() { return contactNumber; }
        public String getResolvedDob() { return dateOfBirth; }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class PatientResponse {
        @JsonProperty("id")
        @JsonAlias({"patientId", "personId"})
        private Long id;

        @JsonProperty("nicPassportNo")
        @JsonAlias({"nicPassport"})
        private String nicPassportNo;

        private String firstName;
        private String lastName;
        private String fullName;
        private String email;

        @JsonProperty("contactNumber")
        @JsonAlias({"phoneNumber"})
        private String contactNumber;

        private String address;
        private String gender;

        @JsonProperty("dateOfBirth")
        @JsonAlias({"dob"})
        private String dateOfBirth;

        private String bloodGroup;
        private String allergies;
        private String emergencyContactName;
        private String emergencyContactPhone;
        private String emergencyContactRelationship;
        private String triagePriority;
        private String medicalNotes;
        private Boolean isArchived;
        private String registrationDate;

        // Zero duplicate fields in Java: JSON getters for contract compatibility
        @JsonProperty("patientId")
        public Long getPatientId() { return id; }

        @JsonProperty("personId")
        public Long getPersonId() { return id; }

        @JsonProperty("nicPassport")
        public String getNicPassport() { return nicPassportNo; }

        @JsonProperty("phoneNumber")
        public String getPhoneNumber() { return contactNumber; }

        @JsonProperty("dob")
        public String getDob() { return dateOfBirth; }

        @JsonProperty("status")
        public String getStatus() { return Boolean.TRUE.equals(isArchived) ? "ARCHIVED" : "ACTIVE"; }
    }
}
