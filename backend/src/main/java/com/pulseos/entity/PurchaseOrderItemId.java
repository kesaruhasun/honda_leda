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
public class PurchaseOrderItemId implements Serializable {

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "drug_id")
    private Long drugId;
}
