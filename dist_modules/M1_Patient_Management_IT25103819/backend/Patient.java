package com.pulseos.entity;

import com.pulseos.entity.enums.BloodGroup;
import com.pulseos.entity.enums.TriagePriority;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "patients")
@PrimaryKeyJoinColumn(name = "patient_id", referencedColumnName = "person_id")
@DiscriminatorValue("PATIENT")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Patient extends Person {

    @Enumerated(EnumType.STRING)
    @Column(name = "blood_group", length = 15)
    private BloodGroup bloodGroup;

    @Column(name = "registration_date", nullable = false)
    private LocalDate registrationDate = LocalDate.now();

    @Column(name = "emergency_contact_name", length = 100)
    private String emergencyContactName;

    @Column(name = "emergency_contact_relation", length = 50)
    private String emergencyContactRelation;

    @Column(name = "emergency_contact_phone", length = 20)
    private String emergencyContactPhone;

    @Enumerated(EnumType.STRING)
    @Column(name = "triage_priority", length = 20, nullable = false)
    private TriagePriority triagePriority = TriagePriority.ROUTINE;

    @Column(name = "allergies", columnDefinition = "TEXT")
    private String allergies;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "medical_notes", columnDefinition = "TEXT")
    private String medicalNotes;

    @Column(name = "password", length = 100)
    private String password;

    @Column(name = "is_archived", nullable = false)
    private Boolean isArchived = false;
}
