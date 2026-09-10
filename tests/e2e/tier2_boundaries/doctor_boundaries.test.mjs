import { describe, test, assert } from '../utils/test_framework.mjs';
import { api } from '../utils/http_client.mjs';

export function registerDoctorBoundaryTests() {
  describe('Tier 2: Doctor Boundaries & Invariants (M2)', () => {
    test('T2-DOC-01: Duplicate SLMC medical license registration is rejected', async () => {
      // Dr. Kavinda's seeded license: SLMC-49120
      const payload = {
        firstName: 'Imposter',
        lastName: 'Doctor',
        licenseNumber: 'SLMC-49120',
        specialization: 'Neurology',
        consultationFee: 3000.00,
      };

      const res = await api.post('/doctors', payload);
      assert.ok(res.status === 409 || res.status === 400, `Expected 409/400 for duplicate license, got ${res.status}`);
    }, { id: 'T2-DOC-01', tier: 'Tier 2', module: 'Doctor' });

    test('T2-DOC-02: Negative consultation fee is rejected by check constraint / validation', async () => {
      const payload = {
        firstName: 'Discount',
        lastName: 'Doctor',
        licenseNumber: `SLMC-NEG-${Date.now().toString().slice(-4)}`,
        specialization: 'General',
        consultationFee: -500.00,
      };

      const res = await api.post('/doctors', payload);
      assert.strictEqual(res.status, 400, `Expected 400 Bad Request for negative fee, got ${res.status}`);
    }, { id: 'T2-DOC-02', tier: 'Tier 2', module: 'Doctor' });

    test('T2-DOC-03: Setting negative consultation fee via patch endpoint is rejected', async () => {
      const res = await api.patch('/doctors/1/fee', { consultationFee: -100.00 });
      assert.strictEqual(res.status, 400, `Expected 400 Bad Request, got ${res.status}`);
    }, { id: 'T2-DOC-03', tier: 'Tier 2', module: 'Doctor' });

    test('T2-DOC-04: Schedule configuration with end time earlier than start time is rejected', async () => {
      const invalidSchedule = {
        dayOfWeek: 'THURSDAY',
        startTime: '14:00:00',
        endTime: '11:00:00', // End before start!
        maxPatients: 10,
        slotDurationMinutes: 15,
      };

      const res = await api.post('/doctors/1/schedules', invalidSchedule);
      assert.strictEqual(res.status, 400, `Expected 400 Bad Request for inverted schedule times, got ${res.status}`);
    }, { id: 'T2-DOC-04', tier: 'Tier 2', module: 'Doctor' });

    test('T2-DOC-05: Modifying non-existent doctor returns HTTP 404', async () => {
      const res = await api.patch('/doctors/999999/availability', { isAvailable: false });
      assert.strictEqual(res.status, 404, `Expected 404 Not Found, got ${res.status}`);
    }, { id: 'T2-DOC-05', tier: 'Tier 2', module: 'Doctor' });
  }, { tier: 'Tier 2', module: 'Doctor' });
}
