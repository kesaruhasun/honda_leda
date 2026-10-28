package com.pulseos.patient;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArchivedPatientRepository extends JpaRepository<ArchivedPatient, Long> {
    List<ArchivedPatient> findAllByOrderByArchivedAtDesc();
    Optional<ArchivedPatient> findByOriginalPatientId(Long originalPatientId);
    void deleteByOriginalPatientId(Long originalPatientId);
}
