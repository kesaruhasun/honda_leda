package com.pulseos.doctor;

import com.pulseos.common.Employee;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "departments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "department_name", length = 100, nullable = false, unique = true)
    private String departmentName;

    @Column(name = "location", length = 100, nullable = false)
    private String location;

    @Column(name = "budget", precision = 14, scale = 2, nullable = false)
    private BigDecimal budget = BigDecimal.ZERO;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id", unique = true)
    @JsonIgnore
    private Employee manager;

    @Column(name = "manager_appointed_date")
    private LocalDate managerAppointedDate;
}
