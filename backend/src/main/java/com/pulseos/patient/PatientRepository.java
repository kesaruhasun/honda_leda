package com.pulseos.patient;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByNicPassportNo(String nicPassportNo);
    Optional<Patient> findByEmail(String email);
    Optional<Patient> findFirstByEmail(String email);
    List<Patient> findByIsArchivedFalse();
    List<Patient> findByTriagePriority(TriagePriority priority);
    List<Patient> findByBloodGroup(BloodGroup bloodGroup);

    @Query("SELECT p FROM Patient p WHERE p.isArchived = false AND (" +
           "LOWER(p.firstName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(p.lastName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "p.nicPassportNo LIKE CONCAT('%', :q, '%'))")
    List<Patient> searchPatients(@Param("q") String query);
}
