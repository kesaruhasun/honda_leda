package com.pulseos.common.util;

import com.pulseos.config.PayHereConfig;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Locale;

@Component
public class PayHereSecurityUtil {

    private final PayHereConfig payHereConfig;
    private static final DecimalFormat AMOUNT_FORMAT;

    static {
        DecimalFormatSymbols symbols = new DecimalFormatSymbols(Locale.US);
        AMOUNT_FORMAT = new DecimalFormat("0.00", symbols);
    }

    public PayHereSecurityUtil(PayHereConfig payHereConfig) {
        this.payHereConfig = payHereConfig;
    }

    /**
     * Computes MD5 Hash for Onsite / Redirect Checkout:
     * strtoupper(md5(merchant_id + order_id + formatted_amount + currency + strtoupper(md5(merchant_secret))))
     */
    public String generatePaymentHash(String orderId, BigDecimal amount, String currency) {
        String formattedAmount = AMOUNT_FORMAT.format(amount.setScale(2, RoundingMode.HALF_UP));
        String hashedSecret = computeMd5(payHereConfig.getMerchantSecret()).toUpperCase(Locale.US);
        String rawString = payHereConfig.getMerchantId() + orderId + formattedAmount + currency + hashedSecret;
        return computeMd5(rawString).toUpperCase(Locale.US);
    }

    /**
     * Verifies Server-to-Server Webhook Signature:
     * strtoupper(md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + strtoupper(md5(merchant_secret))))
     */
    public boolean verifyWebhookSignature(String orderId, String payhereAmount,
                                          String payhereCurrency, String statusCode,
                                          String receivedMd5Sig) {
        String hashedSecret = computeMd5(payHereConfig.getMerchantSecret()).toUpperCase(Locale.US);
        String rawString = payHereConfig.getMerchantId() + orderId + payhereAmount + payhereCurrency + statusCode + hashedSecret;
        String localMd5Sig = computeMd5(rawString).toUpperCase(Locale.US);
        return localMd5Sig.equalsIgnoreCase(receivedMd5Sig);
    }

    public static String computeMd5(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : digest) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("MD5 algorithm unavailable in JVM runtime", e);
        }
    }
}
