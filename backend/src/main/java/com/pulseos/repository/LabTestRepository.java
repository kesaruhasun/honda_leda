package com.pulseos.repository;

import com.pulseos.entity.LabTest;
import com.pulseos.entity.enums.LabTestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabTestRepository extends JpaRepository<LabTest, Long> {
    List<LabTest> findByPatientId(Long patientId);
    List<LabTest> findByAppointmentAppointmentId(Long appointmentId);
    List<LabTest> findByTestStatus(LabTestStatus testStatus);
}
