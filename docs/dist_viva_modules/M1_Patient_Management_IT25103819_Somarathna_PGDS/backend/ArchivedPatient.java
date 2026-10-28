package com.pulseos.patient;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "archived_patients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArchivedPatient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "original_patient_id", nullable = false)
    private Long originalPatientId;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "email")
    private String email;

    @Column(name = "nic_passport_no")
    private String nicPassportNo;

    @Column(name = "contact_number")
    private String contactNumber;

    @Column(name = "gender")
    private String gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "city")
    private String city;

    @Column(name = "blood_group")
    private String bloodGroup;

    @Column(name = "emergency_contact_name")
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone")
    private String emergencyContactPhone;

    @Column(name = "emergency_contact_relation")
    private String emergencyContactRelation;

    @Column(name = "allergies", columnDefinition = "TEXT")
    private String allergies;

    @Column(name = "medical_notes", columnDefinition = "TEXT")
    private String medicalNotes;

    @Column(name = "archive_reason")
    private String archiveReason;

    @Column(name = "archived_at", nullable = false)
    private LocalDateTime archivedAt;

    @Column(name = "archived_by")
    private String archivedBy;
}
