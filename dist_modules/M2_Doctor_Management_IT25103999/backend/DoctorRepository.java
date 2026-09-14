package com.pulseos.repository;

import com.pulseos.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByDoctorLicenseNo(String doctorLicenseNo);
    List<Doctor> findBySpecialization(String specialization);
}
