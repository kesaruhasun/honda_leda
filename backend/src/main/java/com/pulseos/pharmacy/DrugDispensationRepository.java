package com.pulseos.pharmacy;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DrugDispensationRepository extends JpaRepository<DrugDispensation, Long> {
    List<DrugDispensation> findByPrescriptionPrescriptionId(Long prescriptionId);
    List<DrugDispensation> findByPharmacistId(Long pharmacistId);
}
