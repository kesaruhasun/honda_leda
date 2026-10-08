package com.pulseos.billing;

import com.pulseos.billing.BillingDTOs.*;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/billing")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;

    @GetMapping("/invoices")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'PATIENT', 'CASHIER_ADMIN', 'DOCTOR', 'PHARMACIST', 'LAB_TECHNICIAN')")
    public ResponseEntity<List<InvoiceResponse>> getAllInvoices() {
        return ResponseEntity.ok(billingService.getAllInvoices());
    }

    @GetMapping("/invoices/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'PATIENT', 'CASHIER_ADMIN', 'DOCTOR', 'PHARMACIST', 'LAB_TECHNICIAN')")
    public ResponseEntity<InvoiceResponse> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.getInvoiceById(id));
    }

    @PostMapping("/invoices/generate")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'PATIENT', 'CASHIER_ADMIN', 'DOCTOR')")
    public ResponseEntity<InvoiceResponse> generateInvoice(@RequestBody InvoiceGenerateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(billingService.generateInvoice(request));
    }

    @PostMapping({"/invoices/{id}/settle", "/invoices/{id}/pay"})
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'PATIENT', 'CASHIER_ADMIN')")
    public ResponseEntity<SettlementResponse> settleInvoice(
            @PathVariable Long id,
            @RequestBody(required = false) SettlementRequest request) {
        if (request == null) {
            request = new SettlementRequest();
            request.setPaymentMethod("CARD");
            request.setTransactionRef("PAY-" + System.currentTimeMillis());
        } else if (request.getPaymentMethod() == null) {
            request.setPaymentMethod("CARD");
        }
        return ResponseEntity.ok(billingService.settleInvoice(id, request));
    }

    @DeleteMapping({"/invoices/{id}", "/invoices/{id}/cancel"})
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER_ADMIN')")
    public ResponseEntity<InvoiceResponse> cancelInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.cancelInvoice(id));
    }
}
