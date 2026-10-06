package com.pulseos.pharmacy;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;
import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class PrescriptionItemId implements Serializable {

    @Column(name = "prescription_id")
    private Long prescriptionId;

    @Column(name = "drug_id")
    private Long drugId;
}
