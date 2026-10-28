package com.pulseos.billing;

import com.pulseos.laboratory.LabTest;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "invoice_lab_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceLabItem {

    @EmbeddedId
    private InvoiceLabItemId id = new InvoiceLabItemId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("invoiceId")
    @JoinColumn(name = "invoice_id")
    @JsonIgnore
    private Invoice invoice;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("testId")
    @JoinColumn(name = "test_id")
    private LabTest labTest;

    @Column(name = "test_fee", precision = 10, scale = 2, nullable = false)
    private BigDecimal testFee;
}
