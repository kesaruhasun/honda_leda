package com.pulseos.notification;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_type", length = 50)
    private String eventType;

    @Column(name = "recipient_email", length = 100)
    private String recipientEmail;

    @Column(name = "recipient_name", length = 100)
    private String recipientName;

    @Column(name = "reference_id", length = 100)
    private String referenceId;

    @Column(name = "subject", length = 255)
    private String subject;

    @Column(name = "body", columnDefinition = "TEXT")
    private String body;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;
}
