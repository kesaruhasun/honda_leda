import { describe, test, assert } from '../utils/test_framework.mjs';
import { api } from '../utils/http_client.mjs';
import { config } from '../config.mjs';
import { generatePayHereWebhookSignature, formatPayHereAmount } from '../utils/payhere_crypto.mjs';

export function registerFraudDetectionPayHereTests() {
  describe('Tier 4: Real-World Scenario 5 — Adversarial Tamper Detection & PayHere Audit Trail', () => {
    test('T4-SCEN-05: Adversarial webhook tampering attempt is thwarted; invoice remains PENDING until authenticated MD5 signature arrives', async () => {
      // 1. Generate an invoice for Patient 1, Appointment 1
      const invRes = await api.post('/billing/invoices/generate', {
        patientId: 1,
        appointmentId: 1,
        discountAmount: 0.00,
      });
      assert.strictEqual(invRes.status, 201);
      const invoiceId = invRes.data.id;
      const invoiceNumber = invRes.data.invoiceNumber;
      const actualAmount = invRes.data.netAmount;
      assert.strictEqual(invRes.data.status, 'PENDING');

      // 2. Adversary attempts to forge a webhook claiming Rs. 10.00 was paid instead of actualAmount
      const fakeAmount = '10.00';
      const fakeSignature = 'FORGED_BOGUS_MD5_SIGNATURE_ATTEMPT_123';

      const attackRes = await api.postForm('/payments/payhere/notify', {
        merchant_id: config.payhere.merchantId,
        order_id: invoiceNumber,
        payment_id: 'ATTACKER-FAKE-TXN',
        payhere_amount: fakeAmount,
        payhere_currency: 'LKR',
        status_code: '2',
        md5sig: fakeSignature,
      });

      // System rejects attack with 400 Bad Request
      assert.strictEqual(attackRes.status, 400, 'Forged webhook signature must be rejected with 400 Bad Request');
      assert.ok(attackRes.data.includes('INVALID_SIGNATURE'));

      // 3. Verify invoice status remained protected in PENDING state
      const checkInvRes = await api.get(`/billing/invoices/${invoiceId}`);
      assert.strictEqual(checkInvRes.data.status, 'PENDING', 'Invoice must NOT transition to PAID on forged webhook');

      // 4. Genuine PayHere callback arrives with legitimate double-MD5 signature
      const validFormattedAmount = formatPayHereAmount(actualAmount);
      const validSignature = generatePayHereWebhookSignature(
        config.payhere.merchantId,
        invoiceNumber,
        validFormattedAmount,
        'LKR',
        '2',
        config.payhere.merchantSecret
      );

      const legitRes = await api.postForm('/payments/payhere/notify', {
        merchant_id: config.payhere.merchantId,
        order_id: invoiceNumber,
        payment_id: `GENUINE-PH-${Date.now()}`,
        payhere_amount: validFormattedAmount,
        payhere_currency: 'LKR',
        status_code: '2',
        md5sig: validSignature,
        method: 'MASTER',
        card_holder_name: 'Sunil Perera',
      });

      assert.strictEqual(legitRes.status, 200, 'Legitimate webhook callback must be accepted');

      // 5. Verify invoice status successfully updated to PAID
      const paidInvRes = await api.get(`/billing/invoices/${invoiceId}`);
      assert.strictEqual(paidInvRes.data.status, 'PAID', 'Invoice must transition to PAID after authentic callback');
    }, { id: 'T4-SCEN-05', tier: 'Tier 4', module: 'Scenario' });
  }, { tier: 'Tier 4', module: 'Scenario' });
}
