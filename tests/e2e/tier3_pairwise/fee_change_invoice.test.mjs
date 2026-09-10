import { describe, test, assert } from '../utils/test_framework.mjs';
import { api } from '../utils/http_client.mjs';

export function registerFeeChangeInvoiceTests() {
  describe('Tier 3: Pairwise Combination — Doctor Fee Dynamic Reflection in Invoicing', () => {
    test('T3-PAIR-03: Updating doctor consultation fee immediately updates newly booked encounter invoices', async () => {
      // 1. Create a specialized consultant doctor with initial fee 1800.00
      const license = `SLMC-FEE-${Date.now().toString().slice(-4)}`;
      const docRes = await api.post('/doctors', {
        firstName: 'Gamini',
        lastName: 'Jayasinghe',
        licenseNumber: license,
        specialization: 'Dermatology',
        consultationFee: 1800.00,
        roomNumber: 'Room 105',
        isAvailable: true,
      });
      assert.strictEqual(docRes.status, 201);
      const doctorId = docRes.data.id;

      // 2. Doctor fee updated to 3200.00
      const updateFeeRes = await api.patch(`/doctors/${doctorId}/fee`, { consultationFee: 3200.00 });
      assert.strictEqual(updateFeeRes.status, 200);
      assert.strictEqual(Number(updateFeeRes.data.consultationFee), 3200.00);

      // 3. Book consultation with this doctor
      const apptRes = await api.post('/appointments', {
        patientId: 1,
        doctorId,
        appointmentDate: '2026-10-22',
        startTime: '16:00:00',
        endTime: '16:15:00',
        symptomsReason: 'Dermatological screening',
      });
      assert.strictEqual(apptRes.status, 201);
      const appointmentId = apptRes.data.id;

      // 4. Generate invoice
      const invRes = await api.post('/billing/invoices/generate', {
        patientId: 1,
        appointmentId,
        discountAmount: 0.00,
      });
      assert.strictEqual(invRes.status, 201);

      // 5. Verify invoice reflects updated fee (3200.00, not old 1800.00)
      assert.strictEqual(Number(invRes.data.doctorFee), 3200.00);
      assert.strictEqual(Number(invRes.data.netAmount), 3200.00);
    }, { id: 'T3-PAIR-03', tier: 'Tier 3', module: 'Integration' });
  }, { tier: 'Tier 3', module: 'Integration' });
}
