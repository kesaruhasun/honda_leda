/**
 * PulseOS E2E Test Suite Configuration
 */
export const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:8080/api/v1',
  payhere: {
    merchantId: process.env.PAYHERE_MERCHANT_ID || '1220000',
    merchantSecret: process.env.PAYHERE_MERCHANT_SECRET || 'sandbox_secret_sliit_pulseos_2026',
    currency: 'LKR',
    notifyUrl: 'http://localhost:8080/api/v1/payments/payhere/notify',
  },
  timeoutMs: parseInt(process.env.TEST_TIMEOUT || '10000', 10),
  mockPort: parseInt(process.env.MOCK_PORT || '8088', 10),
};
