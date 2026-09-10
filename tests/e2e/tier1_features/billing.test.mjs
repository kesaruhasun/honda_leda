import { describe, test, assert } from '../utils/test_framework.mjs';
import { api } from '../utils/http_client.mjs';
import { config } from '../config.mjs';
import { generatePayHereWebhookSignature, formatPayHereAmount } from '../utils/payhere_crypto.mjs';

export function registerBillingTests() {
  describe('Tier 1: Billing & Payments / PayHere (M5 - Kesaru / IT25103992)', () => {
    let createdInvoiceId = null;
    let invoiceNumber = null;
    let netAmount = null;

    test('T1-BIL-01: Automatically generate itemized invoice aggregating consultation and encounter services', async () => {
      // Use Appointment 1 (Dr. Kavinda, Consultation Fee = 2500)
      const payload = {
        patientId: 1,
        appointmentId: 1,
        discountAmount: 100.00,
      };

      const res = await api.post('/billing/invoices/generate', payload);
      assert.strictEqual(res.status, 201, `Expected 201 Created but received ${res.status}`);
      assert.ok(res.data && res.data.id, 'Invoice ID generated');
      assert.ok(res.data.invoiceNumber, 'Invoice number generated');
      assert.strictEqual(res.data.status, 'PENDING');
      assert.ok(res.data.items.length > 0, 'Must have itemized line items');

      createdInvoiceId = res.data.id;
      invoiceNumber = res.data.invoiceNumber;
      netAmount = res.data.netAmount;
    }, { id: 'T1-BIL-01', tier: 'Tier 1', module: 'Billing' });

    test('T1-BIL-02: Retrieve itemized invoice details with item breakdown', async () => {
      assert.ok(createdInvoiceId, 'Invoice must exist');
      const res = await api.get(`/billing/invoices/${createdInvoiceId}`);
      assert.strictEqual(res.status, 200, `Expected 200 OK but received ${res.status}`);
      assert.strictEqual(res.data.id, createdInvoiceId);
      assert.strictEqual(res.data.invoiceNumber, invoiceNumber);

      const hasConsultation = res.data.items.some(it => it.type === 'CONSULTATION');
      assert.ok(hasConsultation, 'Invoice must contain consultation line item');
    }, { id: 'T1-BIL-02', tier: 'Tier 1', module: 'Billing' });

    test('T1-BIL-03: Initiate PayHere checkout parameters and verify server MD5 cryptographic signature', async () => {
      assert.ok(createdInvoiceId, 'Invoice must exist');
      const res = await api.get(`/payments/payhere/initiate?invoiceId=${createdInvoiceId}`);
      assert.strictEqual(res.status, 200, `Expected 200 OK but received ${res.status}`);
      assert.strictEqual(res.data.orderId, invoiceNumber);
      assert.strictEqual(res.data.currency, 'LKR');
      assert.strictEqual(res.data.merchantId, config.payhere.merchantId);
      assert.ok(res.data.hash && res.data.hash.length === 32, 'Valid 32-character MD5 hash required');
    }, { id: 'T1-BIL-03', tier: 'Tier 1', module: 'Billing' });

    test('T1-BIL-04: Process PayHere webhook notification with status transition to PAID', async () => {
      assert.ok(invoiceNumber, 'Invoice number must exist');
      const formattedAmount = formatPayHereAmount(netAmount);
      const paymentId = `PAY-${Date.now()}`;
      const statusCode = '2'; // 2 = SUCCESS

      const signature = generatePayHereWebhookSignature(
        config.payhere.merchantId,
        invoiceNumber,
        formattedAmount,
        config.payhere.currency,
        statusCode,
        config.payhere.merchantSecret
      );

      const webhookPayload = {
        merchant_id: config.payhere.merchantId,
        order_id: invoiceNumber,
        payment_id: paymentId,
        payhere_amount: formattedAmount,
        payhere_currency: config.payhere.currency,
        status_code: statusCode,
        md5sig: signature,
        method: 'VISA',
        card_holder_name: 'Sunil Perera',
        card_no: '************1292',
      };

      const res = await api.postForm('/payments/payhere/notify', webhookPayload);
      assert.strictEqual(res.status, 200, `Expected 200 OK but received ${res.status}`);

      // Verify invoice status transitioned to PAID
      const verifyRes = await api.get(`/billing/invoices/${createdInvoiceId}`);
      assert.strictEqual(verifyRes.data.status, 'PAID', 'Invoice status must transition to PAID after webhook');
    }, { id: 'T1-BIL-04', tier: 'Tier 1', module: 'Billing' });

    test('T1-BIL-05: Execute counter settlement via Cash with receipt generation', async () => {
      // Use Invoice 2 (Seeded PENDING invoice, netAmount = 4900.00)
      const payload = {
        invoiceId: 2,
        paymentMethod: 'CASH',
        amountPaid: 4900.00,
        cashierNotes: 'Settled at Main Reception Cashier',
      };

      const res = await api.post('/billing/settle', payload);
      assert.strictEqual(res.status, 200, `Expected 200 OK but received ${res.status}`);
      assert.strictEqual(res.data.invoice.status, 'PAID');
      assert.ok(res.data.payment.receiptNumber, 'Receipt number must be generated');
      assert.strictEqual(res.data.payment.paymentMethod, 'CASH');
    }, { id: 'T1-BIL-05', tier: 'Tier 1', module: 'Billing' });
  }, { tier: 'Tier 1', module: 'Billing' });
}
