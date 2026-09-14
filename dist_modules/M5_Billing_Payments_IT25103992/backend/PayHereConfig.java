package com.pulseos.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "pulseos.payhere")
public class PayHereConfig {
    private String merchantId = "1220000";
    private String merchantSecret = "sandbox_secret_sliit_pulseos_2026";
    private String checkoutUrl = "https://sandbox.payhere.lk/pay/checkout";
    private String notifyUrl = "http://localhost:8080/api/v1/payments/payhere/notify";
    private String returnUrl = "http://localhost:5173/billing/payment-success";
    private String cancelUrl = "http://localhost:5173/billing/payment-cancel";
    private String currency = "LKR";
    private boolean sandbox = true;
}
