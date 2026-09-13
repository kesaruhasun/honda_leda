package com.pulseos.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "prescription_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionItem {

    @EmbeddedId
    private PrescriptionItemId id = new PrescriptionItemId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("prescriptionId")
    @JoinColumn(name = "prescription_id")
    @JsonIgnore
    private Prescription prescription;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("drugId")
    @JoinColumn(name = "drug_id")
    private Drug drug;

    @Column(name = "dosage", length = 50, nullable = false)
    private String dosage;

    @Column(name = "frequency", length = 50, nullable = false)
    private String frequency;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "dispensed_quantity")
    private Integer dispensedQuantity = 0;

    @Column(name = "instructions")
    private String instructions;

    @Column(name = "is_dispensed", nullable = false)
    private Boolean isDispensed = false;

    public PrescriptionItem(PrescriptionItemId id, Prescription prescription, Drug drug,
                            String dosage, String frequency, Integer durationDays,
                            Integer quantity, Boolean isDispensed) {
        this.id = id;
        this.prescription = prescription;
        this.drug = drug;
        this.dosage = dosage;
        this.frequency = frequency;
        this.durationDays = durationDays;
        this.quantity = quantity;
        this.dispensedQuantity = Boolean.TRUE.equals(isDispensed) ? quantity : 0;
        this.isDispensed = isDispensed != null ? isDispensed : false;
    }
}
