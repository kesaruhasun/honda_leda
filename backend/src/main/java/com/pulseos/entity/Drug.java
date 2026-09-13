package com.pulseos.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "drugs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Drug {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "drug_id")
    private Long drugId;

    @Column(name = "drug_name", length = 100, nullable = false)
    private String drugName;

    @Column(name = "generic_name", length = 100, nullable = false)
    private String genericName;

    @Column(name = "category", length = 50, nullable = false)
    private String category;

    @Column(name = "unit_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    @Column(name = "batch_number", length = 50, nullable = false)
    private String batchNumber;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "item_code", length = 50)
    private String itemCode;

    @Column(name = "brand_name", length = 100)
    private String brandName;

    @Column(name = "dosage_form", length = 50)
    private String dosageForm = "TABLET";

    @Column(name = "strength", length = 50)
    private String strength = "500mg";

    @Column(name = "manufacturer", length = 100)
    private String manufacturer = "Standard Pharma";

    @Column(name = "reorder_level", nullable = false)
    private Integer reorderLevel = 50;

    public Drug(Long drugId, String drugName, String genericName, String category, BigDecimal unitPrice,
                Integer stockQuantity, String batchNumber, LocalDate expiryDate, Integer reorderLevel) {
        this.drugId = drugId;
        this.drugName = drugName;
        this.genericName = genericName;
        this.category = category;
        this.unitPrice = unitPrice;
        this.stockQuantity = stockQuantity;
        this.batchNumber = batchNumber;
        this.expiryDate = expiryDate;
        this.reorderLevel = reorderLevel;
        this.brandName = drugName;
        this.dosageForm = "TABLET";
        this.strength = "500mg";
        this.manufacturer = "Standard Pharma";
    }

    public boolean isLowStock() {
        return stockQuantity <= reorderLevel;
    }

    public boolean isExpired() {
        return expiryDate != null && expiryDate.isBefore(LocalDate.now());
    }
}
