package com.pulseos.notification;

import lombok.*;

/**
 * Represents an email notification to be sent by the system.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailNotification {
    private String to;
    private String subject;
    private String body;
    private String templateType; // APPOINTMENT_CONFIRMED, PAYMENT_RECEIPT, LAB_RESULT, etc.
}
