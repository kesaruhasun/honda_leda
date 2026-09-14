package com.pulseos.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

public class BillingDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InvoiceGenerateRequest {
        private Long patientId;
        private Long appointmentId;
        private BigDecimal discountAmount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class InvoiceItemResponse {
        private String type;
        private String category;
        private String description;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
        private BigDecimal totalPrice;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class InvoiceResponse {
        private Long id;
        private Long invoiceId;
        private String invoiceNumber;
        private Long patientId;
        private String patientName;
        private String patientNic;
        private Long appointmentId;
        private BigDecimal doctorFee;
        private BigDecimal pharmacyFee;
        private BigDecimal labFee;
        private BigDecimal taxAmount;
        private BigDecimal totalAmount;
        private BigDecimal discountAmount;
        private BigDecimal netAmount;
        private String status;
        private String paymentStatus;
        private String billingDate;
        private String paymentMethod;
        private String transactionRef;
        private List<InvoiceItemResponse> items;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class PayHereInitiateResponse {
        private String merchantId;
        private String merchant_id;
        private String orderId;
        private String order_id;
        private String amount;
        private String currency;
        private String hash;
        private String notifyUrl;
        private String notify_url;
        private String return_url;
        private String cancel_url;
        private String items;
        private String patientFirstName;
        private String patientLastName;
        private String patientEmail;
        private String patientPhone;
        private String first_name;
        private String last_name;
        private String email;
        private String phone;
        private String address;
        private String city;
        private String country;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SettlementRequest {
        private Long invoiceId;
        private String paymentMethod;
        private BigDecimal amountPaid;
        private String transactionRef;
        private String cashierNotes;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class PaymentResponse {
        private Long id;
        private String transactionReference;
        private Long invoiceId;
        private String paymentMethod;
        private BigDecimal amountPaid;
        private String currency;
        private String status;
        private String receiptNumber;
        private String paymentDate;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SettlementResponse {
        private String message;
        private InvoiceResponse invoice;
        private PaymentResponse payment;
    }
}
