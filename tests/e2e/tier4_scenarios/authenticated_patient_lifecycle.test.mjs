import { describe, test, assert } from '../utils/test_framework.mjs';
import { api } from '../utils/http_client.mjs';

export function registerAuthenticatedPatientLifecycleTests() {
  describe('Tier 4: Real-World Scenario 6 — End-to-End Authenticated Patient Journey & Mock Settlement', () => {
    test('T4-SCEN-06: Complete authenticated patient flow: JWT login -> Calendar browsing -> Booking -> Email alert -> Invoicing -> Mock PayHere settlement -> Receipt confirmation', async () => {
      // Step 1: Patient JWT Login
      const loginRes = await api.post('/auth/login', {
        username: 'patient.sunil@gmail.com',
        password: 'Password123!',
      });
      assert.strictEqual(loginRes.status, 200, 'Patient login successful');
      assert.strictEqual(loginRes.data.role, 'PATIENT');
      const token = loginRes.data.token;
      const patientId = loginRes.data.userId;

      // Step 2: Validate identity via /auth/me
      const meRes = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      assert.strictEqual(meRes.status, 200);
      assert.strictEqual(meRes.data.role, 'PATIENT');

      // Step 3: Browse calendar for available doctor slots
      const calRes = await api.get(`/appointments/calendar?role=PATIENT&patientId=${patientId}`);
      assert.strictEqual(calRes.status, 200);
      assert.ok(calRes.data.availableSlots.length > 0, 'Available slots must be shown');
      const chosenSlot = calRes.data.availableSlots[0];

      // Step 4: Book appointment using available slot
      const bookPayload = {
        patientId,
        doctorId: chosenSlot.doctorId,
        appointmentDate: '2026-11-28',
        startTime: '14:30:00',
        endTime: '14:45:00',
        symptomsReason: 'Chronic lower back pain consultation',
      };
      const bookRes = await api.post('/appointments', bookPayload);
      assert.strictEqual(bookRes.status, 201, 'Appointment successfully booked');
      const apptId = bookRes.data.id;
      const apptNum = bookRes.data.appointmentNumber;

      // Step 5: Verify confirmation email notification dispatched
      const notifRes = await api.get(`/notifications?referenceId=${apptNum}`);
      assert.strictEqual(notifRes.status, 200);
      assert.ok(notifRes.data.length >= 1, 'Appointment notification captured');
      assert.strictEqual(notifRes.data[0].eventType, 'APPOINTMENT_CREATED');
      assert.strictEqual(notifRes.data[0].status, 'SENT');

      // Step 6: Generate clinical encounter invoice
      const invRes = await api.post('/billing/invoices/generate', {
        patientId,
        appointmentId: apptId,
        discountAmount: 0.00,
      });
      assert.strictEqual(invRes.status, 201);
      const invoiceId = invRes.data.id;
      const invoiceNum = invRes.data.invoiceNumber;
      assert.strictEqual(invRes.data.status, 'PENDING');

      // Step 7: Initiate PayHere payment gateway checkout
      const initRes = await api.get(`/payments/payhere/initiate?invoiceId=${invoiceId}`);
      assert.strictEqual(initRes.status, 200);
      assert.strictEqual(initRes.data.orderId, invoiceNum);
      assert.ok(initRes.data.hash, 'PayHere MD5 hash generated');

      // Step 8: Complete mock PayHere settlement
      const settleRes = await api.post(`/payments/payhere/mock-success?invoiceId=${invoiceId}`, {});
      assert.strictEqual(settleRes.status, 200, 'Mock settlement succeeded');
      assert.strictEqual(settleRes.data.success, true);
      assert.strictEqual(settleRes.data.invoice.status, 'PAID');
      assert.ok(settleRes.data.payment.receiptNumber);

      // Step 9: Verify payment receipt email notification
      const receiptNotifRes = await api.get(`/notifications?referenceId=${invoiceNum}`);
      assert.strictEqual(receiptNotifRes.status, 200);
      const receiptNotif = receiptNotifRes.data.find(n => n.eventType === 'PAYMENT_COMPLETED');
      assert.ok(receiptNotif, 'Payment receipt notification confirmed');
      assert.strictEqual(receiptNotif.status, 'SENT');

      // Step 10: Final invoice audit verification
      const finalInv = await api.get(`/billing/invoices/${invoiceId}`);
      assert.strictEqual(finalInv.status, 200);
      assert.strictEqual(finalInv.data.status, 'PAID', 'Invoice verified in final PAID state');
    }, { id: 'T4-SCEN-06', tier: 'Tier 4', module: 'Patient Journey' });
  }, { tier: 'Tier 4', module: 'Patient Journey' });
}
