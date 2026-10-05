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
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'PATIENT')")
    public ResponseEntity<List<InvoiceResponse>> getAllInvoices() {
        return ResponseEntity.ok(billingService.getAllInvoices());
    }

    @GetMapping("/invoices/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'PATIENT')")
    public ResponseEntity<InvoiceResponse> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.getInvoiceById(id));
    }

    @PostMapping("/invoices/generate")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<InvoiceResponse> generateInvoice(@RequestBody InvoiceGenerateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(billingService.generateInvoice(request));
    }

    @PostMapping("/invoices/{id}/settle")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<SettlementResponse> settleInvoice(
            @PathVariable Long id,
            @RequestBody SettlementRequest request) {
        return ResponseEntity.ok(billingService.settleInvoice(id, request));
    }
}
