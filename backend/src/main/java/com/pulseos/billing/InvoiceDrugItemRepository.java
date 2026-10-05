package com.pulseos.billing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InvoiceDrugItemRepository extends JpaRepository<InvoiceDrugItem, InvoiceDrugItemId> {
    List<InvoiceDrugItem> findByInvoiceInvoiceId(Long invoiceId);
}
