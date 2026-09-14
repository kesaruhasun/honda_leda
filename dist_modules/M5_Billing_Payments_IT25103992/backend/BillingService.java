package com.pulseos.service;

import com.pulseos.common.exception.PulseException;
import com.pulseos.common.util.PayHereSecurityUtil;
import com.pulseos.config.PayHereConfig;
import com.pulseos.dto.BillingDTOs.*;
import com.pulseos.entity.*;
import com.pulseos.entity.enums.PaymentMethod;
import com.pulseos.entity.enums.PaymentStatus;
import com.pulseos.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BillingService {

    private final InvoiceRepository invoiceRepository;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final LabTestRepository labTestRepository;
    private final PaymentRepository paymentRepository;
    private final PayHereSecurityUtil payHereSecurityUtil;
    private final PayHereConfig payHereConfig;

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(Long id) {
        Invoice inv = invoiceRepository.findById(id)
                .orElseThrow(() -> PulseException.notFound("Invoice with ID " + id + " not found"));
        return toResponse(inv);
    }

    @Transactional
    public InvoiceResponse generateInvoice(InvoiceGenerateRequest req) {
        if (req.getAppointmentId() == null) {
            throw PulseException.badRequest("Validation Error", "Appointment ID is required");
        }

        Appointment appointment = appointmentRepository.findById(req.getAppointmentId())
                .orElseThrow(() -> PulseException.notFound("Appointment not found"));

        Patient patient = appointment.getPatient();
        Doctor doctor = appointment.getDoctor();

        // Doctor consultation fee
        BigDecimal doctorFee = doctor.getConsultationFee() != null ? doctor.getConsultationFee() : BigDecimal.ZERO;

        // Sum pharmacy fees from prescriptions linked to this appointment
        BigDecimal pharmacyFee = BigDecimal.ZERO;
        List<Prescription> prescriptions = prescriptionRepository.findByAppointmentAppointmentId(appointment.getAppointmentId());
        for (Prescription rx : prescriptions) {
            for (PrescriptionItem item : rx.getItems()) {
                if (item.getDrug() != null && item.getQuantity() != null) {
                    BigDecimal itemTotal = item.getDrug().getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                    pharmacyFee = pharmacyFee.add(itemTotal);
                }
            }
        }

        // Sum lab test fees
        BigDecimal labFee = BigDecimal.ZERO;
        List<LabTest> labTests = labTestRepository.findByAppointmentAppointmentId(appointment.getAppointmentId());
        for (LabTest test : labTests) {
            if (test.getStandardFee() != null) {
                labFee = labFee.add(test.getStandardFee());
            }
        }

        BigDecimal discountAmount = req.getDiscountAmount() != null ? req.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal totalAmount = doctorFee.add(pharmacyFee).add(labFee);
        BigDecimal netAmount = totalAmount.subtract(discountAmount);

        Invoice invoice = new Invoice();
        invoice.setPatient(patient);
        invoice.setAppointment(appointment);
        invoice.setBillingDate(LocalDateTime.now());
        invoice.setInvoiceDate(LocalDate.now());
        invoice.setInvoiceNumber("INV-" + System.currentTimeMillis());
        invoice.setDoctorFee(doctorFee);
        invoice.setPharmacyFee(pharmacyFee);
        invoice.setLabFee(labFee);
        invoice.setTaxAmount(BigDecimal.ZERO);
        invoice.setDiscountAmount(discountAmount);
        invoice.setTotalAmount(totalAmount);
        invoice.setNetAmount(netAmount);
        invoice.setPaymentStatus(PaymentStatus.PENDING);

        Invoice saved = invoiceRepository.save(invoice);
        log.info("Generated invoice: ID={}, Total={}", saved.getInvoiceId(), saved.getTotalAmount());
        return toResponse(saved);
    }

    @Transactional
    public SettlementResponse settleInvoice(Long invoiceId, SettlementRequest req) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> PulseException.notFound("Invoice not found"));

        if (invoice.getPaymentStatus() == PaymentStatus.PAID) {
            throw PulseException.badRequest("Already Paid", "This invoice has already been settled");
        }

        PaymentMethod method = PaymentMethod.CASH;
        if (req.getPaymentMethod() != null) {
            try {
                method = PaymentMethod.valueOf(req.getPaymentMethod().toUpperCase());
            } catch (Exception ignored) {}
        }

        PaymentTransaction payment = new PaymentTransaction();
        payment.setInvoice(invoice);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setAmountPaid(invoice.getNetAmount());
        payment.setPaymentMethod(method);
        payment.setTransactionRef(req.getTransactionRef() != null ? req.getTransactionRef() : "TXN-" + System.currentTimeMillis());
        payment.setReceiptNumber("RCP-" + System.currentTimeMillis());
        payment.setCurrency("LKR");
        payment.setStatus("SUCCESS");

        PaymentTransaction savedPayment = paymentRepository.save(payment);

        invoice.setPaymentStatus(PaymentStatus.PAID);
        Invoice savedInvoice = invoiceRepository.save(invoice);

        return SettlementResponse.builder()
                .message("Invoice settled successfully")
                .invoice(toResponse(savedInvoice))
                .payment(toPaymentResponse(savedPayment))
                .build();
    }

    @Transactional(readOnly = true)
    public PayHereInitiateResponse initiatePayHere(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> PulseException.notFound("Invoice not found"));

        Patient patient = invoice.getPatient();
        String orderId = (invoice.getInvoiceNumber() != null && !invoice.getInvoiceNumber().isEmpty())
                ? invoice.getInvoiceNumber() : ("INV-" + invoice.getInvoiceId());
        BigDecimal amount = (invoice.getNetAmount() != null && invoice.getNetAmount().compareTo(BigDecimal.ZERO) > 0)
                ? invoice.getNetAmount()
                : (invoice.getTotalAmount() != null ? invoice.getTotalAmount() : BigDecimal.ZERO);
        String currency = payHereConfig.getCurrency();

        String hash = payHereSecurityUtil.generatePaymentHash(orderId, amount, currency);

        String phone = "";
        if (patient.getContactNumbers() != null && !patient.getContactNumbers().isEmpty()) {
            phone = patient.getContactNumbers().iterator().next();
        }

        return PayHereInitiateResponse.builder()
                .merchantId(payHereConfig.getMerchantId())
                .merchant_id(payHereConfig.getMerchantId())
                .orderId(orderId)
                .order_id(orderId)
                .amount(amount.toPlainString())
                .currency(currency)
                .hash(hash)
                .notifyUrl(payHereConfig.getNotifyUrl())
                .notify_url(payHereConfig.getNotifyUrl())
                .return_url(payHereConfig.getReturnUrl())
                .cancel_url(payHereConfig.getCancelUrl())
                .items("PulseOS Medical Invoice " + orderId)
                .patientFirstName(patient.getFirstName())
                .patientLastName(patient.getLastName())
                .first_name(patient.getFirstName())
                .last_name(patient.getLastName())
                .email(patient.getEmail() != null ? patient.getEmail() : "patient@pulseos.lk")
                .phone(phone)
                .address(patient.getStreet() != null ? patient.getStreet() : "Colombo")
                .city(patient.getCity() != null ? patient.getCity() : "Colombo")
                .country("Sri Lanka")
                .build();
    }

    @Transactional
    public void handlePayHereNotification(String orderId, String payhereAmount,
                                           String payhereCurrency, String statusCode,
                                           String md5sig) {
        boolean valid = payHereSecurityUtil.verifyWebhookSignature(orderId, payhereAmount, payhereCurrency, statusCode, md5sig);
        if (!valid) {
            log.warn("PayHere webhook signature verification failed for order: {}", orderId);
            return;
        }

        Invoice invoice = invoiceRepository.findByInvoiceNumber(orderId).orElse(null);
        if (invoice == null) {
            log.warn("Invoice not found for PayHere order: {}", orderId);
            return;
        }

        // status_code 2 = success
        if ("2".equals(statusCode)) {
            invoice.setPaymentStatus(PaymentStatus.PAID);

            PaymentTransaction payment = new PaymentTransaction();
            payment.setInvoice(invoice);
            payment.setPaymentDate(LocalDateTime.now());
            payment.setAmountPaid(invoice.getNetAmount());
            payment.setPaymentMethod(PaymentMethod.PAYHERE_GATEWAY);
            payment.setTransactionRef("PH-" + orderId + "-" + System.currentTimeMillis());
            payment.setReceiptNumber("PH-RCP-" + System.currentTimeMillis());
            paymentRepository.save(payment);
            invoiceRepository.save(invoice);
            log.info("PayHere payment confirmed for invoice: {}", orderId);
        }
    }

    private InvoiceResponse toResponse(Invoice inv) {
        List<InvoiceItemResponse> items = new ArrayList<>();

        if (inv.getDoctorFee() != null && inv.getDoctorFee().compareTo(BigDecimal.ZERO) > 0) {
            items.add(InvoiceItemResponse.builder()
                    .type("CONSULTATION").category("Doctor Consultation Fee")
                    .description("Consultation Fee").quantity(1)
                    .unitPrice(inv.getDoctorFee()).subtotal(inv.getDoctorFee()).totalPrice(inv.getDoctorFee())
                    .build());
        }
        if (inv.getPharmacyFee() != null && inv.getPharmacyFee().compareTo(BigDecimal.ZERO) > 0) {
            items.add(InvoiceItemResponse.builder()
                    .type("PHARMACY").category("Dispensed Medications")
                    .description("Pharmacy Charges").quantity(1)
                    .unitPrice(inv.getPharmacyFee()).subtotal(inv.getPharmacyFee()).totalPrice(inv.getPharmacyFee())
                    .build());
        }
        if (inv.getLabFee() != null && inv.getLabFee().compareTo(BigDecimal.ZERO) > 0) {
            items.add(InvoiceItemResponse.builder()
                    .type("LAB_TEST").category("Laboratory Diagnostics")
                    .description("Lab Test Charges").quantity(1)
                    .unitPrice(inv.getLabFee()).subtotal(inv.getLabFee()).totalPrice(inv.getLabFee())
                    .build());
        }

        return InvoiceResponse.builder()
                .id(inv.getInvoiceId())
                .invoiceId(inv.getInvoiceId())
                .invoiceNumber(inv.getInvoiceNumber())
                .patientId(inv.getPatient() != null ? inv.getPatient().getId() : null)
                .patientName(inv.getPatient() != null ? inv.getPatient().getFullName() : "")
                .patientNic(inv.getPatient() != null ? inv.getPatient().getNicPassportNo() : "")
                .appointmentId(inv.getAppointment() != null ? inv.getAppointment().getAppointmentId() : null)
                .doctorFee(inv.getDoctorFee())
                .pharmacyFee(inv.getPharmacyFee())
                .labFee(inv.getLabFee())
                .taxAmount(inv.getTaxAmount())
                .totalAmount(inv.getTotalAmount())
                .discountAmount(inv.getDiscountAmount())
                .netAmount(inv.getNetAmount())
                .status(inv.getPaymentStatus() != null ? inv.getPaymentStatus().name() : "PENDING")
                .paymentStatus(inv.getPaymentStatus() != null ? inv.getPaymentStatus().name() : "PENDING")
                .billingDate(inv.getBillingDate() != null ? inv.getBillingDate().toString() : "")
                .items(items)
                .build();
    }

    private PaymentResponse toPaymentResponse(PaymentTransaction pt) {
        return PaymentResponse.builder()
                .id(pt.getPaymentId())
                .transactionReference(pt.getTransactionRef())
                .invoiceId(pt.getInvoice() != null ? pt.getInvoice().getInvoiceId() : null)
                .paymentMethod(pt.getPaymentMethod() != null ? pt.getPaymentMethod().name() : "")
                .amountPaid(pt.getAmountPaid())
                .currency(pt.getCurrency())
                .status(pt.getStatus())
                .receiptNumber(pt.getReceiptNumber())
                .paymentDate(pt.getPaymentDate() != null ? pt.getPaymentDate().toString() : "")
                .build();
    }
}
