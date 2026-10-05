package com.pulseos.notification;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * Notification service that supports two modes:
 * - "console": Logs the email to stdout (for development/demo)
 * - "smtp": Sends a real email via JavaMailSender (for production)
 *
 * Maintains an in-memory audit log of all sent notifications for verification and tracking.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationConfig config;
    private final JavaMailSender mailSender;

    private final List<NotificationRecord> notificationLog = new CopyOnWriteArrayList<>();
    private final AtomicLong idGenerator = new AtomicLong(1);

    /**
     * Send an email notification asynchronously and record in audit log.
     */
    @Async
    public void send(EmailNotification notification) {
        if (!config.isEnabled()) {
            log.debug("Notifications disabled, skipping: {}", notification.getSubject());
            return;
        }

        if ("smtp".equalsIgnoreCase(config.getMode())) {
            sendSmtp(notification);
        } else {
            sendConsole(notification);
        }
    }

    /**
     * Convenience: send appointment confirmation email and record in log.
     */
    public NotificationRecord sendAppointmentConfirmation(String toEmail, String patientName,
                                                          String doctorName, String date, String time,
                                                          String appointmentNumber) {
        String subject = "PulseOS — Appointment Confirmed: " + appointmentNumber;
        String body = String.format("""
                Dear %s,

                Your appointment has been confirmed.

                Appointment No: %s
                Doctor: %s
                Date: %s
                Time: %s

                Please arrive 15 minutes before your scheduled time.

                Thank you,
                PulseOS Hospital Management System
                """, patientName, appointmentNumber, doctorName, date, time);

        NotificationRecord record = NotificationRecord.builder()
                .id(idGenerator.getAndIncrement())
                .eventType("APPOINTMENT_CREATED")
                .recipientEmail(toEmail)
                .recipientName(patientName)
                .referenceId(appointmentNumber)
                .subject(subject)
                .body(body)
                .status("SENT")
                .timestamp(LocalDateTime.now())
                .build();

        notificationLog.add(record);

        send(EmailNotification.builder()
                .to(toEmail)
                .subject(subject)
                .body(body)
                .templateType("APPOINTMENT_CREATED")
                .build());

        return record;
    }

    /**
     * Convenience: send payment receipt email and record in log.
     */
    public NotificationRecord sendPaymentReceipt(String toEmail, String patientName,
                                                 String invoiceNumber, String amount, String currency) {
        String subject = "PulseOS — Payment Receipt: " + invoiceNumber;
        String body = String.format("""
                Dear %s,

                Your payment has been received successfully.

                Invoice: %s
                Amount: %s %s
                Status: PAID

                Thank you for choosing PulseOS Hospital.

                Best regards,
                PulseOS Billing Department
                """, patientName, invoiceNumber, currency, amount);

        NotificationRecord record = NotificationRecord.builder()
                .id(idGenerator.getAndIncrement())
                .eventType("PAYMENT_CONFIRMED")
                .recipientEmail(toEmail)
                .recipientName(patientName)
                .referenceId(invoiceNumber)
                .subject(subject)
                .body(body)
                .status("SENT")
                .timestamp(LocalDateTime.now())
                .build();

        notificationLog.add(record);

        send(EmailNotification.builder()
                .to(toEmail)
                .subject(subject)
                .body(body)
                .templateType("PAYMENT_CONFIRMED")
                .build());

        return record;
    }

    /**
     * Convenience: send lab result ready notification.
     */
    public NotificationRecord sendLabResultReady(String toEmail, String patientName,
                                                 String testName, String labTestId) {
        String subject = "PulseOS — Lab Result Ready: " + testName;
        String body = String.format("""
                Dear %s,

                Your laboratory test result is now available.

                Test: %s

                Please log in to the PulseOS Patient Portal to view your results.

                Thank you,
                PulseOS Laboratory Department
                """, patientName, testName);

        NotificationRecord record = NotificationRecord.builder()
                .id(idGenerator.getAndIncrement())
                .eventType("LAB_RESULT_READY")
                .recipientEmail(toEmail)
                .recipientName(patientName)
                .referenceId(labTestId)
                .subject(subject)
                .body(body)
                .status("SENT")
                .timestamp(LocalDateTime.now())
                .build();

        notificationLog.add(record);

        send(EmailNotification.builder()
                .to(toEmail)
                .subject(subject)
                .body(body)
                .templateType("LAB_RESULT_READY")
                .build());

        return record;
    }

    public List<NotificationRecord> getNotifications(String eventType, String recipientEmail, String referenceId) {
        return notificationLog.stream()
                .filter(n -> eventType == null || n.getEventType().equalsIgnoreCase(eventType))
                .filter(n -> recipientEmail == null || n.getRecipientEmail().equalsIgnoreCase(recipientEmail))
                .filter(n -> referenceId == null || n.getReferenceId().equalsIgnoreCase(referenceId))
                .collect(Collectors.toList());
    }

    public Optional<NotificationRecord> getNotificationById(Long id) {
        return notificationLog.stream()
                .filter(n -> n.getId().equals(id))
                .findFirst();
    }

    private void sendConsole(EmailNotification notification) {
        log.info("""
                ╔══════════════════════════════════════════════╗
                ║        📧 EMAIL NOTIFICATION (CONSOLE)      ║
                ╠══════════════════════════════════════════════╣
                ║ To:      {}
                ║ Subject: {}
                ║ Type:    {}
                ╠══════════════════════════════════════════════╣
                {}
                ╚══════════════════════════════════════════════╝""",
                notification.getTo(),
                notification.getSubject(),
                notification.getTemplateType(),
                notification.getBody());
    }

    private void sendSmtp(EmailNotification notification) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(config.getFromAddress(), config.getFromName());
            helper.setTo(notification.getTo());
            helper.setSubject(notification.getSubject());
            helper.setText(notification.getBody(), false);
            mailSender.send(message);
            log.info("Email sent to {} — Subject: {}", notification.getTo(), notification.getSubject());
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("Failed to send email to {}: {}", notification.getTo(), e.getMessage(), e);
        }
    }
}
