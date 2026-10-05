package com.pulseos.common;

import com.pulseos.billing.PayHereConfig;

import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/health", "/health"})
public class HealthCheckController {

    private final Environment environment;
    private final PayHereConfig payHereConfig;

    public HealthCheckController(Environment environment, PayHereConfig payHereConfig) {
        this.environment = environment;
        this.payHereConfig = payHereConfig;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHealthStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "UP");
        status.put("system", "PulseOS Hospital Management System");
        status.put("version", "1.0.0-SNAPSHOT");
        status.put("activeProfiles", environment.getActiveProfiles());
        status.put("payHereMerchantId", payHereConfig.getMerchantId());
        status.put("payHereSandbox", payHereConfig.isSandbox());
        status.put("serverTime", LocalDateTime.now().toString());

        return ResponseEntity.ok(ApiResponse.ok(status, "PulseOS Backend is healthy and operational"));
    }
}
