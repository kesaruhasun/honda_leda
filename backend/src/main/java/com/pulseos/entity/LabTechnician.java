package com.pulseos.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lab_technicians")
@PrimaryKeyJoinColumn(name = "employee_id", referencedColumnName = "employee_id")
@DiscriminatorValue("LAB_TECHNICIAN")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LabTechnician extends Employee {

    @Column(name = "certification_level", length = 50, nullable = false)
    private String certificationLevel;

    @Column(name = "lab_section", length = 50, nullable = false)
    private String labSection;
}
