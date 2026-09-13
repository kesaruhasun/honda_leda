package com.pulseos.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "prescriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "prescription_id")
    private Long prescriptionId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "prescription_date", nullable = false)
    private LocalDateTime prescriptionDate = LocalDateTime.now();

    @Column(name = "doctor_instructions", columnDefinition = "TEXT")
    private String doctorInstructions;

    @Column(name = "prescription_number", length = 50)
    private String prescriptionNumber;

    @Column(name = "status", length = 25, nullable = false)
    private String status = "PENDING";

    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<PrescriptionItem> items = new ArrayList<>();

    public Prescription(Long prescriptionId, Appointment appointment, Doctor doctor, Patient patient,
                        LocalDateTime prescriptionDate, String doctorInstructions, List<PrescriptionItem> items) {
        this.prescriptionId = prescriptionId;
        this.appointment = appointment;
        this.doctor = doctor;
        this.patient = patient;
        this.prescriptionDate = prescriptionDate != null ? prescriptionDate : LocalDateTime.now();
        this.doctorInstructions = doctorInstructions;
        this.items = items != null ? items : new ArrayList<>();
        this.status = "PENDING";
    }
}
