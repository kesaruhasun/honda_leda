package com.pulseos.entity;

import com.pulseos.entity.enums.AppointmentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "appointments", uniqueConstraints = {
    @UniqueConstraint(name = "uq_doctor_slot", columnNames = {"doctor_id", "appointment_date", "appointment_time"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "appointment_id")
    private Long appointmentId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "booking_date", nullable = false)
    private LocalDateTime bookingDate = LocalDateTime.now();

    @Column(name = "room_number", length = 20)
    private String roomNumber;

    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @Column(name = "appointment_time", nullable = false)
    private LocalTime appointmentTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "appointment_number", length = 50)
    private String appointmentNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 25, nullable = false)
    private AppointmentStatus status = AppointmentStatus.SCHEDULED;

    @Column(name = "reason_for_visit", columnDefinition = "TEXT")
    private String reasonForVisit;

    public Appointment(Long appointmentId, Patient patient, Doctor doctor, LocalDateTime bookingDate,
                       String roomNumber, LocalDate appointmentDate, LocalTime appointmentTime,
                       AppointmentStatus status, String reasonForVisit) {
        this.appointmentId = appointmentId;
        this.patient = patient;
        this.doctor = doctor;
        this.bookingDate = bookingDate != null ? bookingDate : LocalDateTime.now();
        this.roomNumber = roomNumber;
        this.appointmentDate = appointmentDate;
        this.appointmentTime = appointmentTime;
        this.endTime = appointmentTime != null ? appointmentTime.plusMinutes(15) : null;
        this.status = status != null ? status : AppointmentStatus.SCHEDULED;
        this.reasonForVisit = reasonForVisit;
    }
}
