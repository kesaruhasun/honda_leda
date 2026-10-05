package com.pulseos.pharmacy;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "drug_dispensations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DrugDispensation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dispensation_id")
    private Long dispensationId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pharmacist_id", nullable = false)
    private Pharmacist pharmacist;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "drug_id", nullable = false)
    private Drug drug;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id")
    private Prescription prescription;

    @Column(name = "dispense_date", nullable = false)
    private LocalDateTime dispenseDate = LocalDateTime.now();

    @Column(name = "dispensed_qty", nullable = false)
    private Integer dispensedQty;
}
