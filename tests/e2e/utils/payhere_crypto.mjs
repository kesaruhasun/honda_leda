import crypto from 'node:crypto';

/**
 * MD5 hash helper returning uppercase hex
 */
export function md5(text) {
  return crypto.createHash('md5').update(text, 'utf8').digest('hex').toUpperCase();
}

/**
 * Format amount to exactly 2 decimal places with dot separator (e.g. "2500.00")
 */
export function formatPayHereAmount(amount) {
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  return num.toFixed(2);
}

/**
 * Generate client-side initiation hash expected by PayHere Sandbox:
 * strtoupper(md5(merchant_id + order_id + formatted_amount + currency + strtoupper(md5(merchant_secret))))
 */
export function generatePayHereHash(merchantId, orderId, amount, currency, merchantSecret) {
  const formattedAmount = formatPayHereAmount(amount);
  const hashedSecret = md5(merchantSecret);
  const rawString = `${merchantId}${orderId}${formattedAmount}${currency}${hashedSecret}`;
  return md5(rawString);
}

/**
 * Generate webhook callback signature (md5sig):
 * strtoupper(md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + strtoupper(md5(merchant_secret))))
 */
export function generatePayHereWebhookSignature(merchantId, orderId, payhereAmount, payhereCurrency, statusCode, merchantSecret) {
  const formattedAmount = formatPayHereAmount(payhereAmount);
  const hashedSecret = md5(merchantSecret);
  const rawString = `${merchantId}${orderId}${formattedAmount}${payhereCurrency}${statusCode}${hashedSecret}`;
  return md5(rawString);
}

/**
 * Verify received md5sig against locally computed hash
 */
export function verifyPayHereWebhookSignature(merchantId, orderId, payhereAmount, payhereCurrency, statusCode, receivedMd5Sig, merchantSecret) {
  const localSignature = generatePayHereWebhookSignature(merchantId, orderId, payhereAmount, payhereCurrency, statusCode, merchantSecret);
  return localSignature.toLowerCase() === receivedMd5Sig.toLowerCase();
}
