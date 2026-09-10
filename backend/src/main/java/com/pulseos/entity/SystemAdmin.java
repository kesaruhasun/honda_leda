package com.pulseos.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "system_admins")
@PrimaryKeyJoinColumn(name = "employee_id", referencedColumnName = "employee_id")
@DiscriminatorValue("SYSTEM_ADMIN")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SystemAdmin extends Employee {

    @Column(name = "admin_level", length = 30, nullable = false)
    private String adminLevel;

    @Column(name = "security_clearance", length = 50, nullable = false)
    private String securityClearance;
}
