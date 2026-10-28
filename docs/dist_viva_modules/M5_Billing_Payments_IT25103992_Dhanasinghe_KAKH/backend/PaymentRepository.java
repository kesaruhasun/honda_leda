package com.pulseos.billing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentTransaction, Long> {
    List<PaymentTransaction> findByInvoiceInvoiceId(Long invoiceId);
    Optional<PaymentTransaction> findByTransactionRef(String transactionRef);
}
