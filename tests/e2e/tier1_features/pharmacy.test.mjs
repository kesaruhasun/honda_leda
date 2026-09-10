import { describe, test, assert } from '../utils/test_framework.mjs';
import { api } from '../utils/http_client.mjs';

export function registerPharmacyTests() {
  describe('Tier 1: Pharmacy & Inventory (M4 - Harshika / IT25100826)', () => {
    let createdDrugId = null;
    let createdPrescriptionId = null;
    const itemCode = `MED-${Date.now().toString().slice(-6)}`;

    test('T1-PHM-01: Intake new drug shipment with batch number and expiry date', async () => {
      const payload = {
        itemCode,
        genericName: 'Ciprofloxacin',
        brandName: 'Cipro 500',
        category: 'ANTIBIOTIC',
        dosageForm: 'TABLET',
        strength: '500mg',
        unitPrice: 55.00,
        stockQuantity: 200,
        reorderLevel: 40,
        expiryDate: '2028-06-30',
        batchNumber: 'BAT-CP-552',
        manufacturer: 'Bayer AG',
      };

      const res = await api.post('/pharmacy/drugs', payload);
      assert.strictEqual(res.status, 201, `Expected 201 Created but received ${res.status}`);
      assert.ok(res.data && res.data.id, 'Drug ID must be generated');
      assert.strictEqual(res.data.itemCode, itemCode);
      assert.strictEqual(res.data.stockQuantity, 200);
      createdDrugId = res.data.id;
    }, { id: 'T1-PHM-01', tier: 'Tier 1', module: 'Pharmacy' });

    test('T1-PHM-02: Query drug inventory by SKU code and category', async () => {
      assert.ok(createdDrugId, 'Drug must exist');
      const res = await api.get('/pharmacy/drugs?category=ANTIBIOTIC');
      assert.strictEqual(res.status, 200, `Expected 200 OK but received ${res.status}`);
      assert.ok(Array.isArray(res.data));
      assert.ok(res.data.some(d => d.id === createdDrugId), 'Created antibiotic should appear in category query');
    }, { id: 'T1-PHM-02', tier: 'Tier 1', module: 'Pharmacy' });

    test('T1-PHM-03: Update drug stock quantity and unit pricing', async () => {
      assert.ok(createdDrugId, 'Drug must exist');
      const updatePayload = {
        stockQuantity: 250,
        unitPrice: 58.00,
      };

      const res = await api.put(`/pharmacy/drugs/${createdDrugId}`, updatePayload);
      assert.strictEqual(res.status, 200, `Expected 200 OK but received ${res.status}`);
      assert.strictEqual(res.data.stockQuantity, 250);
      assert.strictEqual(Number(res.data.unitPrice), 58.00);
    }, { id: 'T1-PHM-03', tier: 'Tier 1', module: 'Pharmacy' });

    test('T1-PHM-04: Issue prescription for appointment encounter', async () => {
      assert.ok(createdDrugId, 'Drug must exist');
      const prescriptionPayload = {
        appointmentId: 1,
        patientId: 1,
        doctorId: 1,
        notes: 'Take 1 tablet every 12 hours after food',
        items: [
          {
            drugId: createdDrugId,
            dosage: '500mg',
            frequency: 'BID',
            durationDays: 10,
            prescribedQuantity: 20,
            instructions: 'Finish the complete antibiotic course',
          },
        ],
      };

      const res = await api.post('/prescriptions', prescriptionPayload);
      assert.strictEqual(res.status, 201, `Expected 201 Created but received ${res.status}`);
      assert.ok(res.data && res.data.id, 'Prescription ID generated');
      assert.strictEqual(res.data.status, 'PENDING');
      assert.strictEqual(res.data.items.length, 1);
      createdPrescriptionId = res.data.id;
    }, { id: 'T1-PHM-04', tier: 'Tier 1', module: 'Pharmacy' });

    test('T1-PHM-05: Dispense prescription medication and verify atomic stock deduction', async () => {
      assert.ok(createdPrescriptionId && createdDrugId, 'Prescription and Drug must exist');

      // Check pre-dispense stock
      const beforeRes = await api.get(`/pharmacy/drugs/${createdDrugId}`);
      const initialStock = beforeRes.data.stockQuantity;

      // Fulfill prescription
      const dispenseRes = await api.post(`/pharmacy/dispense/${createdPrescriptionId}`);
      assert.strictEqual(dispenseRes.status, 200, `Expected 200 OK but received ${dispenseRes.status}`);
      assert.strictEqual(dispenseRes.data.prescription.status, 'DISPENSED');

      // Verify stock deducted by exactly 20
      const afterRes = await api.get(`/pharmacy/drugs/${createdDrugId}`);
      assert.strictEqual(afterRes.data.stockQuantity, initialStock - 20, 'Stock should decrease by dispensed quantity (20)');
    }, { id: 'T1-PHM-05', tier: 'Tier 1', module: 'Pharmacy' });
  }, { tier: 'Tier 1', module: 'Pharmacy' });
}
