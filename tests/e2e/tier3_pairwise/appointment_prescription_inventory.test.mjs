import { describe, test, assert } from '../utils/test_framework.mjs';
import { api } from '../utils/http_client.mjs';

export function registerAppointmentPrescriptionInventoryTests() {
  describe('Tier 3: Pairwise Combination — Appointment -> Prescription -> Atomic Inventory Deduction', () => {
    test('T3-PAIR-01: Cross-Module Flow: Appointment booking triggers prescription issuance and precise inventory deduction upon pharmacy fulfillment', async () => {
      // 1. Intake fresh drug with initial stock 100
      const itemCode = `MED-PAIR-${Date.now().toString().slice(-5)}`;
      const drugRes = await api.post('/pharmacy/drugs', {
        itemCode,
        genericName: 'Azithromycin',
        brandName: 'Zithromax',
        category: 'ANTIBIOTIC',
        dosageForm: 'TABLET',
        strength: '500mg',
        unitPrice: 150.00,
        stockQuantity: 100,
        reorderLevel: 25,
        expiryDate: '2028-12-31',
      });
      assert.strictEqual(drugRes.status, 201);
      const drugId = drugRes.data.id;

      // 2. Book clinical appointment for patient 1 with doctor 1
      const apptRes = await api.post('/appointments', {
        patientId: 1,
        doctorId: 1,
        appointmentDate: '2026-10-15',
        startTime: '15:00:00',
        endTime: '15:15:00',
        symptomsReason: 'Acute chest infection and persistent cough',
      });
      assert.strictEqual(apptRes.status, 201);
      const appointmentId = apptRes.data.id;

      // 3. Prescribe 15 tablets of the new drug for this appointment
      const prescRes = await api.post('/prescriptions', {
        appointmentId,
        patientId: 1,
        doctorId: 1,
        notes: 'Take 1 tablet daily for 3 days, then review',
        items: [
          {
            drugId,
            dosage: '500mg',
            frequency: 'OD',
            durationDays: 3,
            prescribedQuantity: 15,
          },
        ],
      });
      assert.strictEqual(prescRes.status, 201);
      const prescriptionId = prescRes.data.id;
      assert.strictEqual(prescRes.data.status, 'PENDING');

      // 4. Pharmacy dispenses prescription
      const dispenseRes = await api.post(`/pharmacy/dispense/${prescriptionId}`);
      assert.strictEqual(dispenseRes.status, 200);
      assert.strictEqual(dispenseRes.data.prescription.status, 'DISPENSED');

      // 5. Verify stock in inventory decremented from 100 to 85
      const verifyDrugRes = await api.get(`/pharmacy/drugs/${drugId}`);
      assert.strictEqual(verifyDrugRes.status, 200);
      assert.strictEqual(verifyDrugRes.data.stockQuantity, 85, 'Stock must decrement by exactly 15');
    }, { id: 'T3-PAIR-01', tier: 'Tier 3', module: 'Integration' });
  }, { tier: 'Tier 3', module: 'Integration' });
}
