package com.pulseos.billing;

import com.pulseos.billing.BillingDTOs.*;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
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
        private BigDecimal totalAmount;
        private BigDecimal amount;
        private BigDecimal doctorFee;
        private BigDecimal pharmacyFee;
        private BigDecimal labFee;
        private String description;
        private String paymentStatus;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InvoiceUpdateRequest {
        private BigDecimal discountAmount;
        private BigDecimal discountPercentage;
        private String discountReason;
        private String paymentStatus;
        private String description;
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

        @JsonProperty("totalPrice")
        @JsonAlias({"subtotal"})
        private BigDecimal totalPrice;

        @JsonProperty("subtotal")
        public BigDecimal getSubtotal() { return totalPrice; }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class InvoiceResponse {
        @JsonProperty("id")
        @JsonAlias({"invoiceId"})
        private Long id;

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

        @JsonProperty("paymentStatus")
        @JsonAlias({"status"})
        private String paymentStatus;

        private String billingDate;
        private String paymentMethod;
        private String transactionRef;
        private List<InvoiceItemResponse> items;

        // Zero duplicate fields in Java: JSON getters for contract compatibility
        @JsonProperty("invoiceId")
        public Long getInvoiceId() { return id; }

        @JsonProperty("status")
        public String getStatus() { return paymentStatus; }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class PayHereInitiateResponse {
        @JsonProperty("merchantId")
        @JsonAlias({"merchant_id"})
        private String merchantId;

        @JsonProperty("orderId")
        @JsonAlias({"order_id"})
        private String orderId;

        private String amount;
        private String currency;
        private String hash;

        @JsonProperty("notifyUrl")
        @JsonAlias({"notify_url"})
        private String notifyUrl;

        @JsonProperty("return_url")
        private String returnUrl;

        @JsonProperty("cancel_url")
        private String cancelUrl;

        private String items;

        @JsonProperty("patientFirstName")
        @JsonAlias({"first_name"})
        private String firstName;

        @JsonProperty("patientLastName")
        @JsonAlias({"last_name"})
        private String lastName;

        @JsonProperty("email")
        @JsonAlias({"patientEmail"})
        private String email;

        @JsonProperty("phone")
        @JsonAlias({"patientPhone"})
        private String phone;

        private String address;
        private String city;
        private String country;

        // PayHere snake_case getters for form generation
        @JsonProperty("merchant_id") public String getMerchant_id() { return merchantId; }
        @JsonProperty("order_id") public String getOrder_id() { return orderId; }
        @JsonProperty("notify_url") public String getNotify_url() { return notifyUrl; }
        @JsonProperty("first_name") public String getFirst_name() { return firstName; }
        @JsonProperty("last_name") public String getLast_name() { return lastName; }
        @JsonProperty("patientEmail") public String getPatientEmail() { return email; }
        @JsonProperty("patientPhone") public String getPatientPhone() { return phone; }
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
