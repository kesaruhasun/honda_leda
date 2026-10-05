package com.pulseos.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationRecord>> getNotifications(
            @RequestParam(required = false) String eventType,
            @RequestParam(required = false) String recipientEmail,
            @RequestParam(required = false) String referenceId) {
        return ResponseEntity.ok(notificationService.getNotifications(eventType, recipientEmail, referenceId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificationRecord> getNotificationById(@PathVariable Long id) {
        return notificationService.getNotificationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
