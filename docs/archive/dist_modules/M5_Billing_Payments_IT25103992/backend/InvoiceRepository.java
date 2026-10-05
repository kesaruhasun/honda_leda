package com.pulseos.repository;

import com.pulseos.entity.Invoice;
import com.pulseos.entity.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByPatientId(Long patientId);
    List<Invoice> findByAppointmentAppointmentId(Long appointmentId);
    List<Invoice> findByPaymentStatus(PaymentStatus paymentStatus);
    java.util.Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
}
