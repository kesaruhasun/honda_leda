import { describe, test, assert } from '../utils/test_framework.mjs';
import { api } from '../utils/http_client.mjs';

export function registerPharmacyBoundaryTests() {
  describe('Tier 2: Pharmacy & Inventory Boundaries (M4)', () => {
    test('T2-PHM-01: Intake with negative price or stock quantity is rejected', async () => {
      const negativePayload = {
        itemCode: `MED-NEG-${Date.now().toString().slice(-4)}`,
        genericName: 'Invalid Drug',
        unitPrice: -25.00,
        stockQuantity: 100,
      };

      const res = await api.post('/pharmacy/drugs', negativePayload);
      assert.strictEqual(res.status, 400, `Expected 400 for negative unit price, got ${res.status}`);
    }, { id: 'T2-PHM-01', tier: 'Tier 2', module: 'Pharmacy' });

    test('T2-PHM-02: Dispensing quantity strictly greater than available stock is rejected atomically', async () => {
      // Drug 6 (Salbutamol Inhaler) has stock = 8
      // Create prescription asking for 20 units
      const prescPayload = {
        patientId: 1,
        doctorId: 1,
        notes: 'Excessive order test',
        items: [
          {
            drugId: 6, // Stock = 8
            dosage: '2 puffs',
            frequency: 'PRN',
            durationDays: 30,
            prescribedQuantity: 20, // 20 > 8
          },
        ],
      };

      const prescRes = await api.post('/prescriptions', prescPayload);
      assert.strictEqual(prescRes.status, 201);
      const prescId = prescRes.data.id;

      // Attempt dispensing
      const dispenseRes = await api.post(`/pharmacy/dispense/${prescId}`);
      assert.strictEqual(dispenseRes.status, 400, `Expected 400 Insufficient Stock, got ${dispenseRes.status}`);
      assert.ok(dispenseRes.data && dispenseRes.data.message.includes('Insufficient stock'));

      // Verify stock remained unchanged at 8
      const drugRes = await api.get('/pharmacy/drugs/6');
      assert.strictEqual(drugRes.data.stockQuantity, 8, 'Stock must not be decremented on failed transaction');
    }, { id: 'T2-PHM-02', tier: 'Tier 2', module: 'Pharmacy' });

    test('T2-PHM-03: Dispensing expired batch medication is prevented with clinical safety guard', async () => {
      // Drug 99 (Expired Amoxicillin, batch BAT-EXP-001, expiry 2025-01-01)
      const prescPayload = {
        patientId: 2,
        doctorId: 1,
        items: [
          {
            drugId: 99, // Expired batch
            dosage: '1 tab',
            frequency: 'TID',
            durationDays: 5,
            prescribedQuantity: 15,
          },
        ],
      };

      const prescRes = await api.post('/prescriptions', prescPayload);
      assert.strictEqual(prescRes.status, 201);
      const prescId = prescRes.data.id;

      const dispenseRes = await api.post(`/pharmacy/dispense/${prescId}`);
      assert.strictEqual(dispenseRes.status, 400, `Expected 400 for expired drug, got ${dispenseRes.status}`);
      assert.ok(dispenseRes.data && dispenseRes.data.message.includes('expired'));
    }, { id: 'T2-PHM-03', tier: 'Tier 2', module: 'Pharmacy' });

    test('T2-PHM-04: Low-stock boundary condition (stockQuantity <= reorderLevel) correctly triggers alert list', async () => {
      const lowStockRes = await api.get('/pharmacy/drugs/low-stock');
      assert.strictEqual(lowStockRes.status, 200);
      assert.ok(Array.isArray(lowStockRes.data));

      // Drug 3 (Augmentin, stock 15, reorder 30) and Drug 6 (Ventolin, stock 8, reorder 20) should be included
      const hasAugmentin = lowStockRes.data.some(d => d.id === 3);
      const hasVentolin = lowStockRes.data.some(d => d.id === 6);
      assert.ok(hasAugmentin, 'Drug 3 must be in low-stock alerts list');
      assert.ok(hasVentolin, 'Drug 6 must be in low-stock alerts list');
    }, { id: 'T2-PHM-04', tier: 'Tier 2', module: 'Pharmacy' });

    test('T2-PHM-05: Expired drugs query correctly filters batches past expiration date', async () => {
      const expiredRes = await api.get('/pharmacy/drugs/expired');
      assert.strictEqual(expiredRes.status, 200);
      assert.ok(Array.isArray(expiredRes.data));
      const hasExpiredDrug = expiredRes.data.some(d => d.id === 99);
      assert.ok(hasExpiredDrug, 'Drug 99 must be identified in expired drugs filter');
    }, { id: 'T2-PHM-05', tier: 'Tier 2', module: 'Pharmacy' });
  }, { tier: 'Tier 2', module: 'Pharmacy' });
}
