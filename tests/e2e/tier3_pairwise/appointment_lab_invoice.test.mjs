import { describe, test, assert } from '../utils/test_framework.mjs';
import { api } from '../utils/http_client.mjs';

export function registerAppointmentLabInvoiceTests() {
  describe('Tier 3: Pairwise Combination — Appointment -> Lab Order -> Results -> Itemized Invoice', () => {
    test('T3-PAIR-02: Cross-Module Flow: Appointment encounter orders lab investigation and aggregates accurately into itemized patient invoice', async () => {
      // 1. Book appointment
      const apptRes = await api.post('/appointments', {
        patientId: 2,
        doctorId: 1, // Fee = 2500
        appointmentDate: '2026-10-18',
        startTime: '10:30:00',
        endTime: '10:45:00',
        symptomsReason: 'Renal evaluation',
      });
      assert.strictEqual(apptRes.status, 201);
      const appointmentId = apptRes.data.id;

      // 2. Order Serum Creatinine & eGFR (Catalog ID 5, Price = 950.00)
      const labRes = await api.post('/lab/requests', {
        appointmentId,
        patientId: 2,
        doctorId: 1,
        labTestId: 5,
        urgency: 'ROUTINE',
        clinicalIndication: 'Assess kidney function baseline',
      });
      assert.strictEqual(labRes.status, 201);
      const labReqId = labRes.data.id;

      // 3. Mark sample collected
      await api.patch(`/lab/requests/${labReqId}/collect-sample`);

      // 4. Enter quantitative result
      const resultRes = await api.post(`/lab/requests/${labReqId}/results`, {
        resultValue: 1.05,
        technicianEmployeeId: 4,
        clinicalRemarks: 'Normal serum creatinine level',
      });
      assert.strictEqual(resultRes.status, 200);
      assert.strictEqual(resultRes.data.flag, 'NORMAL');

      // 5. Generate automated invoice
      const invoiceRes = await api.post('/billing/invoices/generate', {
        patientId: 2,
        appointmentId,
        discountAmount: 0.00,
      });
      assert.strictEqual(invoiceRes.status, 201);
      const inv = invoiceRes.data;

      // Expected total: Doctor Fee (2500.00) + Lab Fee (950.00) = 3450.00
      assert.strictEqual(Number(inv.doctorFee), 2500.00);
      assert.strictEqual(Number(inv.labFee), 950.00);
      assert.strictEqual(Number(inv.totalAmount), 3450.00);
      assert.strictEqual(Number(inv.netAmount), 3450.00);

      // Verify line items
      const hasLabItem = inv.items.some(it => it.type === 'LAB_TEST' && Number(it.unitPrice) === 950.00);
      assert.ok(hasLabItem, 'Invoice must contain line item for 950.00 lab test');
    }, { id: 'T3-PAIR-02', tier: 'Tier 3', module: 'Integration' });
  }, { tier: 'Tier 3', module: 'Integration' });
}
