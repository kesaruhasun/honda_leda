package com.pulseos.repository;

import com.pulseos.entity.PrescriptionItem;
import com.pulseos.entity.PrescriptionItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionItemRepository extends JpaRepository<PrescriptionItem, PrescriptionItemId> {
    List<PrescriptionItem> findByPrescriptionPrescriptionId(Long prescriptionId);
}
