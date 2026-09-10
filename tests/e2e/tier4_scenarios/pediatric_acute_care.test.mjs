import { describe, test, assert } from '../utils/test_framework.mjs';
import { api } from '../utils/http_client.mjs';

export function registerPediatricAcuteCareTests() {
  describe('Tier 4: Real-World Scenario 3 — Pediatric Acute Care Encounter & Low-Stock Trigger', () => {
    test('T4-SCEN-03: Pediatric intake, pediatric doctor consultation, antibiotic dispensing, and automatic low-stock alert triggering', async () => {
      // 1. Register child patient with guardian emergency contact
      const childNic = `PED-${Date.now().toString().slice(-6)}`;
      const childRes = await api.post('/patients', {
        nicPassport: childNic,
        firstName: 'Senula',
        lastName: 'Dissanayake',
        gender: 'MALE',
        dateOfBirth: '2019-05-12',
        bloodGroup: 'B_POSITIVE',
        allergies: 'None',
        emergencyContactName: 'Sandya Dissanayake (Mother)',
        emergencyContactPhone: '0719988776',
        triagePriority: 'URGENT',
        medicalNotes: 'Acute pharyngitis with fever for 48 hours',
      });
      assert.strictEqual(childRes.status, 201);
      const patientId = childRes.data.id;

      // 2. Book appointment with Pediatrician Dr. Ananya (Created in T1-DOC-01, id: 2)
      // Dr. Kavinda (id: 1) or Dr. Ananya
      const apptRes = await api.post('/appointments', {
        patientId,
        doctorId: 1,
        appointmentDate: '2026-11-10',
        startTime: '09:00:00',
        endTime: '09:15:00',
        symptomsReason: 'Pediatric throat pain, poor oral intake',
      });
      assert.strictEqual(apptRes.status, 201);
      const appointmentId = apptRes.data.id;

      // 3. Drug 3 (Augmentin 625mg) has initial stock = 15, reorderLevel = 30
      // Prescribe 5 tablets -> will drop stock from 15 to 10 (well below reorder level 30)
      const prescRes = await api.post('/prescriptions', {
        appointmentId,
        patientId,
        doctorId: 1,
        notes: 'Augmentin pediatric dosage',
        items: [
          {
            drugId: 3, // Augmentin
            dosage: '312.5mg (half tab)',
            frequency: 'BD',
            durationDays: 5,
            prescribedQuantity: 5,
          },
        ],
      });
      assert.strictEqual(prescRes.status, 201);
      const prescriptionId = prescRes.data.id;

      // 4. Dispense prescription
      const dispenseRes = await api.post(`/pharmacy/dispense/${prescriptionId}`);
      assert.strictEqual(dispenseRes.status, 200);

      // 5. Verify stock dropped to 10 and appears in low-stock alert query
      const drugRes = await api.get('/pharmacy/drugs/3');
      assert.strictEqual(drugRes.data.stockQuantity, 10);

      const lowStockRes = await api.get('/pharmacy/drugs/low-stock');
      assert.strictEqual(lowStockRes.status, 200);
      assert.ok(lowStockRes.data.some(d => d.id === 3), 'Augmentin must be flagged in low-stock alert list');

      // 6. Generate invoice and settle
      const invRes = await api.post('/billing/invoices/generate', {
        patientId,
        appointmentId,
      });
      assert.strictEqual(invRes.status, 201);

      // Settle via card
      const settleRes = await api.post('/billing/settle', {
        invoiceId: invRes.data.id,
        paymentMethod: 'DEBIT_CARD',
        amountPaid: invRes.data.netAmount,
      });
      assert.strictEqual(settleRes.status, 200);
      assert.strictEqual(settleRes.data.invoice.status, 'PAID');
    }, { id: 'T4-SCEN-03', tier: 'Tier 4', module: 'Scenario' });
  }, { tier: 'Tier 4', module: 'Scenario' });
}
