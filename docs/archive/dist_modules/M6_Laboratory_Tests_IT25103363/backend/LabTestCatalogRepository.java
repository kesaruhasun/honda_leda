package com.pulseos.repository;

import com.pulseos.entity.LabTestCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LabTestCatalogRepository extends JpaRepository<LabTestCatalog, Long> {
    Optional<LabTestCatalog> findByTestCode(String testCode);
}
