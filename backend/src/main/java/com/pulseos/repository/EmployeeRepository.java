package com.pulseos.repository;

import com.pulseos.entity.Employee;
import com.pulseos.entity.enums.EmployeeRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmail(String email);
    Optional<Employee> findByNicPassportNo(String nicPassportNo);
    List<Employee> findByEmployeeRole(EmployeeRole employeeRole);
}
