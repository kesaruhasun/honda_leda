import { describe, test, assert } from '../utils/test_framework.mjs';
import { api } from '../utils/http_client.mjs';
import { config } from '../config.mjs';

export function registerBillingBoundaryTests() {
  describe('Tier 2: Billing & PayHere Gateway Boundaries (M5)', () => {
    test('T2-BIL-01: PayHere webhook with tampered/invalid MD5 signature is rejected with INVALID_SIGNATURE', async () => {
      // Tampered signature
      const tamperedWebhook = {
        merchant_id: config.payhere.merchantId,
        order_id: 'INV-2026-0001',
        payment_id: 'TAMPERED-001',
        payhere_amount: '10.00', // Fraudulent modified amount
        payhere_currency: 'LKR',
        status_code: '2',
        md5sig: 'BOGUS_INVALID_SIGNATURE_HASH_12345',
      };

      const res = await api.postForm('/payments/payhere/notify', tamperedWebhook);
      assert.strictEqual(res.status, 400, `Expected 400 Bad Request for tampered hash, got ${res.status}`);
      assert.ok(typeof res.data === 'string' && res.data.includes('INVALID_SIGNATURE'));
    }, { id: 'T2-BIL-01', tier: 'Tier 2', module: 'Billing' });

    test('T2-BIL-02: PayHere webhook missing required signature or order ID is rejected', async () => {
      const missingParamsPayload = {
        merchant_id: config.payhere.merchantId,
        payment_id: 'PAY-111',
      };

      const res = await api.postForm('/payments/payhere/notify', missingParamsPayload);
      assert.strictEqual(res.status, 400, `Expected 400 for missing webhook parameters, got ${res.status}`);
    }, { id: 'T2-BIL-02', tier: 'Tier 2', module: 'Billing' });

    test('T2-BIL-03: Counter settlement of an already PAID invoice is rejected as duplicate settlement', async () => {
      // Invoice 1 is already PAID
      const payload = {
        invoiceId: 1,
        paymentMethod: 'CASH',
        amountPaid: 11000.00,
      };

      const res = await api.post('/billing/settle', payload);
      assert.strictEqual(res.status, 400, `Expected 400 for paying already-settled invoice, got ${res.status}`);
      assert.ok(res.data && (res.data.error === 'Already Paid' || (res.data.message && res.data.message.includes('already'))));
    }, { id: 'T2-BIL-03', tier: 'Tier 2', module: 'Billing' });

    test('T2-BIL-04: Counter settlement with underpayment (amount < netAmount) is rejected', async () => {
      // Create a new invoice to test underpayment
      const invRes = await api.post('/billing/invoices/generate', { patientId: 2, appointmentId: 2 });
      const invoiceId = invRes.data.id;
      const netAmount = invRes.data.netAmount;

      const underpayPayload = {
        invoiceId,
        paymentMethod: 'CASH',
        amountPaid: netAmount - 500, // Underpay!
      };

      const res = await api.post('/billing/settle', underpayPayload);
      assert.strictEqual(res.status, 400, `Expected 400 for underpayment, got ${res.status}`);
      assert.ok(res.data && res.data.error.includes('Underpayment'));
    }, { id: 'T2-BIL-04', tier: 'Tier 2', module: 'Billing' });

    test('T2-BIL-05: Generating invoice for non-existent appointment returns HTTP 404', async () => {
      const payload = {
        patientId: 1,
        appointmentId: 999999, // Non-existent
      };

      const res = await api.post('/billing/invoices/generate', payload);
      assert.strictEqual(res.status, 404, `Expected 404 Not Found, got ${res.status}`);
    }, { id: 'T2-BIL-05', tier: 'Tier 2', module: 'Billing' });
  }, { tier: 'Tier 2', module: 'Billing' });
}
