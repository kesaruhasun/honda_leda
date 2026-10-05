package com.pulseos.billing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InvoiceLabItemRepository extends JpaRepository<InvoiceLabItem, InvoiceLabItemId> {
    List<InvoiceLabItem> findByInvoiceInvoiceId(Long invoiceId);
}
