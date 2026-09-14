package com.pulseos.repository;

import com.pulseos.entity.PurchaseOrder;
import com.pulseos.entity.enums.PurchaseOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    List<PurchaseOrder> findBySupplierSupplierId(Long supplierId);
    List<PurchaseOrder> findByDeliveryStatus(PurchaseOrderStatus deliveryStatus);
}
