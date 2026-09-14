package com.pulseos.repository;

import com.pulseos.entity.InvoiceLabItem;
import com.pulseos.entity.InvoiceLabItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceLabItemRepository extends JpaRepository<InvoiceLabItem, InvoiceLabItemId> {
    List<InvoiceLabItem> findByInvoiceInvoiceId(Long invoiceId);
}
