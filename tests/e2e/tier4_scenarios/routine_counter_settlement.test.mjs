import { describe, test, assert } from '../utils/test_framework.mjs';
import { api } from '../utils/http_client.mjs';

export function registerRoutineCounterSettlementTests() {
  describe('Tier 4: Real-World Scenario 2 — Routine Walk-In Consultation & Counter Cash Settlement', () => {
    test('T4-SCEN-02: Complete flow for routine patient intake, consultation, diagnostic screening, and counter cash settlement with receipt', async () => {
      // 1. Routine patient registration
      const nic = `NIC-RTN-${Date.now().toString().slice(-6)}`;
      const patientRes = await api.post('/patients', {
        nicPassport: nic,
        firstName: 'Kamal',
        lastName: 'Gunaratne',
        gender: 'MALE',
        dateOfBirth: '1982-11-10',
        bloodGroup: 'A_POSITIVE',
        triagePriority: 'ROUTINE',
        emergencyContactName: 'Manel Gunaratne',
        emergencyContactPhone: '0778899001',
      });
      assert.strictEqual(patientRes.status, 201);
      const patientId = patientRes.data.id;

      // 2. Book routine checkup appointment
      const apptRes = await api.post('/appointments', {
        patientId,
        doctorId: 1, // Fee 2500
        appointmentDate: '2026-11-05',
        startTime: '11:00:00',
        endTime: '11:15:00',
        symptomsReason: 'Routine annual general executive checkup',
      });
      assert.strictEqual(apptRes.status, 201);
      const appointmentId = apptRes.data.id;

      // 3. Doctor orders Fasting Blood Sugar (FBS, Catalog ID 4, Price 650.00)
      const labOrderRes = await api.post('/lab/requests', {
        appointmentId,
        patientId,
        doctorId: 1,
        labTestId: 4,
        urgency: 'ROUTINE',
      });
      assert.strictEqual(labOrderRes.status, 201);
      const labReqId = labOrderRes.data.id;

      // 4. Lab collects specimen and enters normal FBS result (88.0 mg/dL)
      await api.patch(`/lab/requests/${labReqId}/collect-sample`);
      const labResultRes = await api.post(`/lab/requests/${labReqId}/results`, {
        resultValue: 88.0,
        technicianEmployeeId: 4,
        clinicalRemarks: 'Normal fasting glycaemic control',
      });
      assert.strictEqual(labResultRes.status, 200);
      assert.strictEqual(labResultRes.data.flag, 'NORMAL');

      // 5. Generate itemized invoice
      // Total: Doctor Fee (2500.00) + FBS (650.00) = 3150.00. Apply promotional discount 150.00 -> Net 3000.00
      const invRes = await api.post('/billing/invoices/generate', {
        patientId,
        appointmentId,
        discountAmount: 150.00,
      });
      assert.strictEqual(invRes.status, 201);
      const invoice = invRes.data;
      assert.strictEqual(Number(invoice.totalAmount), 3150.00);
      assert.strictEqual(Number(invoice.netAmount), 3000.00);
      assert.strictEqual(invoice.status, 'PENDING');

      // 6. Cashier counter settlement via Cash
      const settleRes = await api.post('/billing/settle', {
        invoiceId: invoice.id,
        paymentMethod: 'CASH',
        amountPaid: 3000.00,
        cashierNotes: 'Cash collected by Dilshan at Reception Desk 01',
      });
      assert.strictEqual(settleRes.status, 200);
      assert.strictEqual(settleRes.data.invoice.status, 'PAID');
      assert.ok(settleRes.data.payment.receiptNumber, 'Thermal cashier receipt number generated');
      assert.strictEqual(settleRes.data.payment.paymentMethod, 'CASH');
    }, { id: 'T4-SCEN-02', tier: 'Tier 4', module: 'Scenario' });
  }, { tier: 'Tier 4', module: 'Scenario' });
}
