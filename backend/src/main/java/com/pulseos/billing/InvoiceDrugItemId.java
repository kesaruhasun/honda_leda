package com.pulseos.billing;

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
public class InvoiceDrugItemId implements Serializable {

    @Column(name = "invoice_id")
    private Long invoiceId;

    @Column(name = "drug_id")
    private Long drugId;
}
