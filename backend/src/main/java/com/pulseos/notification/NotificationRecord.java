package com.pulseos.notification;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRecord {
    private Long id;
    private String eventType;
    private String recipientEmail;
    private String recipientName;
    private String referenceId;
    private String subject;
    private String body;
    private String status;
    private LocalDateTime timestamp;
}
