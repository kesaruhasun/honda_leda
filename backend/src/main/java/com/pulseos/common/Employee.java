package com.pulseos.common;

import com.pulseos.doctor.Department;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "employees")
@PrimaryKeyJoinColumn(name = "employee_id", referencedColumnName = "person_id")
@DiscriminatorValue("EMPLOYEE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Employee extends Person {

    @Column(name = "hire_date", nullable = false)
    private LocalDate hireDate;

    @Column(name = "salary", precision = 12, scale = 2, nullable = false)
    private BigDecimal salary;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", length = 20, nullable = false)
    private EmploymentType employmentType;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "dept_joining_date", nullable = false)
    private LocalDate deptJoiningDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supervisor_id")
    @JsonIgnore
    private Employee supervisor;

    @Column(name = "supervision_date")
    private LocalDate supervisionDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "employee_role", length = 30, nullable = false)
    private EmployeeRole employeeRole;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "employee_qualifications", joinColumns = @JoinColumn(name = "employee_id"))
    @Column(name = "qualification", length = 100, nullable = false)
    private Set<String> qualifications = new HashSet<>();
}
