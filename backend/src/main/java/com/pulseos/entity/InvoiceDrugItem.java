package com.pulseos.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "invoice_drug_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDrugItem {

    @EmbeddedId
    private InvoiceDrugItemId id = new InvoiceDrugItemId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("invoiceId")
    @JoinColumn(name = "invoice_id")
    @JsonIgnore
    private Invoice invoice;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("drugId")
    @JoinColumn(name = "drug_id")
    private Drug drug;

    @Column(name = "billed_qty", nullable = false)
    private Integer billedQty;

    @Column(name = "sub_total", precision = 10, scale = 2, nullable = false)
    private BigDecimal subTotal;
}
