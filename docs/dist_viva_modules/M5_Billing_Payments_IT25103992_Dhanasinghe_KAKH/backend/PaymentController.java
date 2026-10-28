package com.pulseos.billing;

import com.pulseos.billing.BillingDTOs.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final BillingService billingService;

    @GetMapping("/payhere/initiate")
    @PreAuthorize("hasAnyRole('PATIENT', 'RECEPTIONIST', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<PayHereInitiateResponse> initiatePayHere(@RequestParam Long invoiceId) {
        return ResponseEntity.ok(billingService.initiatePayHere(invoiceId));
    }

    @PostMapping("/payhere/notify")
    public ResponseEntity<String> payHereNotify(
            @RequestParam("merchant_id") String merchantId,
            @RequestParam("order_id") String orderId,
            @RequestParam("payhere_amount") String payhereAmount,
            @RequestParam("payhere_currency") String payhereCurrency,
            @RequestParam("status_code") String statusCode,
            @RequestParam("md5sig") String md5sig) {
        log.info("PayHere IPN received: orderId={}, status={}", orderId, statusCode);
        billingService.handlePayHereNotification(orderId, payhereAmount, payhereCurrency, statusCode, md5sig);
        return ResponseEntity.ok("OK");
    }
}
