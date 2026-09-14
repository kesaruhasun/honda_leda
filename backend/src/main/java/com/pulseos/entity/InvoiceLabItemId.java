package com.pulseos.entity;

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
public class InvoiceLabItemId implements Serializable {

    @Column(name = "invoice_id")
    private Long invoiceId;

    @Column(name = "test_id")
    private Long testId;
}
