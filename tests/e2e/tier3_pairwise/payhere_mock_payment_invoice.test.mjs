import { describe, test, assert } from '../utils/test_framework.mjs';
import { api } from '../utils/http_client.mjs';
import { config } from '../config.mjs';

export function registerPayHereMockPaymentInvoiceTests() {
  describe('Tier 3: Pairwise Combination — PayHere Mock Initiation -> Settlement -> Receipt Notification', () => {
    test('T3-PAIR-07: Cross-Module Flow: Initiating PayHere checkout and executing mock settlement atomically settles invoice and triggers receipt notification', async () => {
      // 1. Generate an invoice for Appointment 3
      const invRes = await api.post('/billing/invoices/generate', {
        patientId: 3,
        appointmentId: 3,
        discountAmount: 50.00,
      });
      assert.strictEqual(invRes.status, 201, 'Invoice generated');
      const invoiceId = invRes.data.id;
      const invoiceNumber = invRes.data.invoiceNumber;
      assert.strictEqual(invRes.data.status, 'PENDING');

      // 2. Initiate PayHere checkout parameters
      const initRes = await api.get(`/payments/payhere/initiate?invoiceId=${invoiceId}`);
      assert.strictEqual(initRes.status, 200, 'PayHere initiation successful');
      assert.strictEqual(initRes.data.orderId, invoiceNumber);
      assert.strictEqual(initRes.data.merchantId, config.payhere.merchantId);
      assert.ok(initRes.data.hash && initRes.data.hash.length === 32, 'Valid MD5 hash present');

      // 3. Execute Mock Payment settlement
      const settleRes = await api.post(`/payments/payhere/mock-success?invoiceId=${invoiceId}`, {});
      assert.strictEqual(settleRes.status, 200, 'Mock settlement successful');
      assert.strictEqual(settleRes.data.success, true);
      assert.strictEqual(settleRes.data.invoice.status, 'PAID');
      assert.strictEqual(settleRes.data.payment.paymentMethod, 'PAYHERE_MOCK');
      assert.ok(settleRes.data.payment.receiptNumber, 'Receipt number issued');

      // 4. Verify billing invoice is marked PAID
      const verifyInv = await api.get(`/billing/invoices/${invoiceId}`);
      assert.strictEqual(verifyInv.status, 200);
      assert.strictEqual(verifyInv.data.status, 'PAID');

      // 5. Verify payment receipt notification was dispatched
      const notifRes = await api.get(`/notifications?referenceId=${invoiceNumber}`);
      assert.strictEqual(notifRes.status, 200);
      assert.ok(Array.isArray(notifRes.data));
      const receiptNotif = notifRes.data.find(n => n.eventType === 'PAYMENT_COMPLETED');
      assert.ok(receiptNotif, 'PAYMENT_COMPLETED notification must exist');
      assert.strictEqual(receiptNotif.referenceId, invoiceNumber);
      assert.strictEqual(receiptNotif.status, 'SENT');
    }, { id: 'T3-PAIR-07', tier: 'Tier 3', module: 'Billing ↔ Notification' });
  }, { tier: 'Tier 3', module: 'Billing ↔ Notification' });
}
