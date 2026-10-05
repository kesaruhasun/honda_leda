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
    private final NotificationRepository notificationRepository;

    private final List<NotificationRecord> notificationLog = new CopyOnWriteArrayList<>();
    private final java.util.concurrent.atomic.AtomicLong idGenerator = new java.util.concurrent.atomic.AtomicLong(1);

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

        record = notificationRepository.save(record);
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

        record = notificationRepository.save(record);
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

        record = notificationRepository.save(record);
        notificationLog.add(record);

        send(EmailNotification.builder()
                .to(toEmail)
                .subject(subject)
                .body(body)
                .templateType("LAB_RESULT_READY")
                .build());

        return record;
    }

    /**
     * Convenience: send account creation welcome email.
     */
    public NotificationRecord sendWelcomeEmail(String toEmail, String patientName, String nicNumber) {
        String subject = "Welcome to PulseOS Hospital Healthcare Network";
        String body = String.format("""
                Dear %s,

                Welcome to PulseOS Hospital Management Network! Your patient profile has been successfully registered.

                Patient Name: %s
                NIC / Identification: %s
                Registration Status: ACTIVE & VERIFIED

                You can now log in to the Patient Portal to:
                - Schedule consultations with top medical specialists
                - Track pathology lab test orders and access certified diagnostic reports
                - Manage electronic prescriptions and pharmacy pickup authorizations
                - View and settle hospital invoices securely via PayHere

                If you require emergency assistance, please dial our 24/7 hotline at 1990.

                Warm regards,
                PulseOS Hospital Administration Team
                """, patientName, patientName, nicNumber != null ? nicNumber : "Registered");

        NotificationRecord record = NotificationRecord.builder()
                .eventType("PATIENT_WELCOME")
                .recipientEmail(toEmail)
                .recipientName(patientName)
                .referenceId(nicNumber)
                .subject(subject)
                .body(body)
                .status("SENT")
                .timestamp(LocalDateTime.now())
                .build();

        record = notificationRepository.save(record);
        notificationLog.add(record);

        send(EmailNotification.builder()
                .to(toEmail)
                .subject(subject)
                .body(body)
                .templateType("PATIENT_WELCOME")
                .build());

        return record;
    }

    public List<NotificationRecord> getNotifications(String eventType, String recipientEmail, String referenceId) {
        List<NotificationRecord> records = notificationRepository.findAllByOrderByTimestampDesc();
        return records.stream()
                .filter(n -> eventType == null || (n.getEventType() != null && n.getEventType().equalsIgnoreCase(eventType)))
                .filter(n -> recipientEmail == null || (n.getRecipientEmail() != null && n.getRecipientEmail().equalsIgnoreCase(recipientEmail)))
                .filter(n -> referenceId == null || (n.getReferenceId() != null && n.getReferenceId().equalsIgnoreCase(referenceId)))
                .collect(Collectors.toList());
    }

    public Optional<NotificationRecord> getNotificationById(Long id) {
        return notificationRepository.findById(id);
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
