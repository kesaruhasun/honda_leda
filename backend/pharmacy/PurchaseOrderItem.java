package com.pulseos.pharmacy;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "purchase_order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderItem {

    @EmbeddedId
    private PurchaseOrderItemId id = new PurchaseOrderItemId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("orderId")
    @JoinColumn(name = "order_id")
    @JsonIgnore
    private PurchaseOrder purchaseOrder;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("drugId")
    @JoinColumn(name = "drug_id")
    private Drug drug;

    @Column(name = "ordered_qty", nullable = false)
    private Integer orderedQty;

    @Column(name = "unit_cost", precision = 10, scale = 2, nullable = false)
    private BigDecimal unitCost;
}
