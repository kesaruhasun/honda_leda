package com.pulseos.repository;

import com.pulseos.entity.PatientAdmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientAdmissionRepository extends JpaRepository<PatientAdmission, Long> {
    Optional<PatientAdmission> findByPatientIdAndDischargeDateIsNull(Long patientId);
    List<PatientAdmission> findByWardWardIdAndDischargeDateIsNull(Long wardId);
}
