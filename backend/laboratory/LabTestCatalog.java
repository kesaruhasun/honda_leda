package com.pulseos.laboratory;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "lab_test_catalogs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LabTestCatalog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "catalog_id")
    private Long id;

    @Column(name = "test_code", length = 50, nullable = false, unique = true)
    private String testCode;

    @Column(name = "test_name", length = 100, nullable = false)
    private String testName;

    @Column(name = "category", length = 50, nullable = false)
    private String category;

    @Column(name = "price", precision = 10, scale = 2, nullable = false)
    private BigDecimal price;

    @Column(name = "sample_type", length = 50)
    private String sampleType;

    @Column(name = "normal_range_min")
    private Double normalRangeMin;

    @Column(name = "normal_range_max")
    private Double normalRangeMax;

    @Column(name = "measurement_unit", length = 50)
    private String measurementUnit;
}
