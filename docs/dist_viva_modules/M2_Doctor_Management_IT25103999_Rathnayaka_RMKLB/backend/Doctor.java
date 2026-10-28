package com.pulseos.doctor;

import com.pulseos.common.Employee;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "doctors")
@PrimaryKeyJoinColumn(name = "employee_id", referencedColumnName = "employee_id")
@DiscriminatorValue("DOCTOR")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Doctor extends Employee {

    @Column(name = "doctor_license_no", length = 50, nullable = false, unique = true)
    private String doctorLicenseNo;

    @Column(name = "specialization", length = 100, nullable = false)
    private String specialization;

    @Column(name = "consultation_fee", precision = 10, scale = 2, nullable = false)
    private BigDecimal consultationFee;

    @Column(name = "room_number", length = 50)
    private String roomNumber = "Room 204";

    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = true;
}
