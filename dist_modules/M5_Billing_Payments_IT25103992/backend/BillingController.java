package com.pulseos.controller;

import com.pulseos.dto.BillingDTOs.*;
import com.pulseos.service.BillingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/billing")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;

    @GetMapping("/invoices")
    public ResponseEntity<List<InvoiceResponse>> getAllInvoices() {
        return ResponseEntity.ok(billingService.getAllInvoices());
    }

    @GetMapping("/invoices/{id}")
    public ResponseEntity<InvoiceResponse> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.getInvoiceById(id));
    }

    @PostMapping("/invoices/generate")
    public ResponseEntity<InvoiceResponse> generateInvoice(@RequestBody InvoiceGenerateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(billingService.generateInvoice(request));
    }

    @PostMapping("/invoices/{id}/settle")
    public ResponseEntity<SettlementResponse> settleInvoice(
            @PathVariable Long id,
            @RequestBody SettlementRequest request) {
        return ResponseEntity.ok(billingService.settleInvoice(id, request));
    }
}
