import { describe, test, assert } from '../utils/test_framework.mjs';
import { api } from '../utils/http_client.mjs';

export function registerPatientArchiveLifecycleTests() {
  describe('Tier 3: Pairwise Combination — Patient Archive Lifecycle & Appointment Booking Integrity', () => {
    test('T3-PAIR-04: Cross-Module Guard: Soft-archiving patient blocks new appointments until restored', async () => {
      // 1. Create a patient
      const nic = `ARC-${Date.now().toString().slice(-6)}`;
      const patRes = await api.post('/patients', {
        nicPassport: nic,
        firstName: 'Temporary',
        lastName: 'Patient',
        gender: 'FEMALE',
        dateOfBirth: '1995-03-20',
      });
      assert.strictEqual(patRes.status, 201);
      const patientId = patRes.data.id;

      // 2. Soft-archive the patient
      const archiveRes = await api.patch(`/patients/${patientId}/archive`);
      assert.strictEqual(archiveRes.status, 200);
      assert.strictEqual(archiveRes.data.isArchived, true);

      // 3. Attempt to book appointment -> must be rejected
      const blockedApptRes = await api.post('/appointments', {
        patientId,
        doctorId: 1,
        appointmentDate: '2026-10-25',
        startTime: '11:30:00',
      });
      assert.strictEqual(blockedApptRes.status, 400, 'Archived patient appointment must be rejected');

      // 4. Restore patient
      const restoreRes = await api.patch(`/patients/${patientId}/restore`);
      assert.strictEqual(restoreRes.status, 200);
      assert.strictEqual(restoreRes.data.isArchived, false);

      // 5. Booking appointment now succeeds
      const successApptRes = await api.post('/appointments', {
        patientId,
        doctorId: 1,
        appointmentDate: '2026-10-25',
        startTime: '11:30:00',
      });
      assert.strictEqual(successApptRes.status, 201, 'Restored patient appointment booking must succeed');
    }, { id: 'T3-PAIR-04', tier: 'Tier 3', module: 'Integration' });
  }, { tier: 'Tier 3', module: 'Integration' });
}
