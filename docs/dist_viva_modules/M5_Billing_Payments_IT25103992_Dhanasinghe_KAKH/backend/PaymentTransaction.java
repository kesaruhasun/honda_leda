package com.pulseos.billing;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long paymentId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @Column(name = "payment_date", nullable = false)
    private LocalDateTime paymentDate = LocalDateTime.now();

    @Column(name = "amount_paid", precision = 12, scale = 2, nullable = false)
    private BigDecimal amountPaid;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 30, nullable = false)
    private PaymentMethod paymentMethod;

    @Column(name = "transaction_ref", length = 100, unique = true)
    private String transactionRef;

    @Column(name = "receipt_number", length = 50)
    private String receiptNumber;

    @Column(name = "currency", length = 10)
    private String currency = "LKR";

    @Column(name = "status", length = 20)
    private String status = "SUCCESS";

    public PaymentTransaction(Long paymentId, Invoice invoice, LocalDateTime paymentDate,
                              BigDecimal amountPaid, PaymentMethod paymentMethod, String transactionRef) {
        this.paymentId = paymentId;
        this.invoice = invoice;
        this.paymentDate = paymentDate != null ? paymentDate : LocalDateTime.now();
        this.amountPaid = amountPaid;
        this.paymentMethod = paymentMethod;
        this.transactionRef = transactionRef;
        this.receiptNumber = transactionRef;
        this.currency = "LKR";
        this.status = "SUCCESS";
    }
}
