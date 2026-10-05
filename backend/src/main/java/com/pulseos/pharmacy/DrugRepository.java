package com.pulseos.pharmacy;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DrugRepository extends JpaRepository<Drug, Long> {
    Optional<Drug> findByDrugName(String drugName);
    Optional<Drug> findByItemCode(String itemCode);
    boolean existsByItemCode(String itemCode);
    List<Drug> findByCategory(String category);
    List<Drug> findByCategoryIgnoreCase(String category);

    @Query("SELECT d FROM Drug d WHERE d.stockQuantity <= d.reorderLevel")
    List<Drug> findLowStockDrugs();

    List<Drug> findByExpiryDateBefore(LocalDate date);
}
