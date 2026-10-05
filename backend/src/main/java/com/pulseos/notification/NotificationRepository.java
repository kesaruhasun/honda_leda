package com.pulseos.notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationRecord, Long> {
    List<NotificationRecord> findAllByOrderByTimestampDesc();
    List<NotificationRecord> findByRecipientEmailOrderByTimestampDesc(String recipientEmail);
}
