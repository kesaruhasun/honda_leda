package com.pulseos.pharmacy;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PrescriptionItemRepository extends JpaRepository<PrescriptionItem, PrescriptionItemId> {
    List<PrescriptionItem> findByPrescriptionPrescriptionId(Long prescriptionId);
}
