package com.pulseos.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pharmacists")
@PrimaryKeyJoinColumn(name = "employee_id", referencedColumnName = "employee_id")
@DiscriminatorValue("PHARMACIST")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Pharmacist extends Employee {

    @Column(name = "pharmacy_license_no", length = 50, nullable = false, unique = true)
    private String pharmacyLicenseNo;

    @Column(name = "assigned_unit", length = 50, nullable = false)
    private String assignedUnit;
}
