package com.pulseos.notification;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "pulseos.notification")
public class NotificationConfig {
    private boolean enabled = true;
    private String mode = "console"; // "console" or "smtp"
    private String fromAddress = "noreply@pulseos.lk";
    private String fromName = "PulseOS Hospital";
}
