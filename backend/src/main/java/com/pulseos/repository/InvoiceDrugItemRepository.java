package com.pulseos.repository;

import com.pulseos.entity.InvoiceDrugItem;
import com.pulseos.entity.InvoiceDrugItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceDrugItemRepository extends JpaRepository<InvoiceDrugItem, InvoiceDrugItemId> {
    List<InvoiceDrugItem> findByInvoiceInvoiceId(Long invoiceId);
}
