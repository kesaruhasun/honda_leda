import { describe, test, assert } from '../utils/test_framework.mjs';
import { api } from '../utils/http_client.mjs';

export function registerBatchExpiryDispensingTests() {
  describe('Tier 3: Pairwise Combination — Expiry Tracking & Inventory Substitution Safety Guard', () => {
    test('T3-PAIR-05: Clinical Safety Guard: Dispensing blocked for expired batch and fulfilled successfully with valid substitute batch', async () => {
      // 1. Drug 99 is expired (2025-01-01), Drug 1 is valid (2027-12-31)
      const expiredPrescRes = await api.post('/prescriptions', {
        patientId: 1,
        doctorId: 1,
        notes: 'Expiry check test',
        items: [
          {
            drugId: 99, // Expired batch
            dosage: '250mg',
            frequency: 'TID',
            durationDays: 5,
            prescribedQuantity: 15,
          },
        ],
      });
      assert.strictEqual(expiredPrescRes.status, 201);
      const expiredPrescId = expiredPrescRes.data.id;

      // 2. Attempt to dispense expired batch -> must fail
      const failDispenseRes = await api.post(`/pharmacy/dispense/${expiredPrescId}`);
      assert.strictEqual(failDispenseRes.status, 400, 'Dispensing expired batch must fail');

      // 3. Issue new prescription with valid active drug (Drug 1: Atorvastatin)
      const validPrescRes = await api.post('/prescriptions', {
        patientId: 1,
        doctorId: 1,
        notes: 'Valid substitute batch',
        items: [
          {
            drugId: 1, // Valid active drug
            dosage: '20mg',
            frequency: 'OD',
            durationDays: 10,
            prescribedQuantity: 10,
          },
        ],
      });
      assert.strictEqual(validPrescRes.status, 201);
      const validPrescId = validPrescRes.data.id;

      // 4. Dispense valid prescription -> must succeed
      const validDispenseRes = await api.post(`/pharmacy/dispense/${validPrescId}`);
      assert.strictEqual(validDispenseRes.status, 200, 'Dispensing valid batch must succeed');
      assert.strictEqual(validDispenseRes.data.prescription.status, 'DISPENSED');
    }, { id: 'T3-PAIR-05', tier: 'Tier 3', module: 'Integration' });
  }, { tier: 'Tier 3', module: 'Integration' });
}
