import { describe, test, assert } from '../utils/test_framework.mjs';
import { api } from '../utils/http_client.mjs';

export function registerAppointmentTests() {
  describe('Tier 1: Appointment Management (M3 - Chanul / IT25101620)', () => {
    let createdApptId = null;

    test('T1-APT-01: Book consultation slot for valid patient and available doctor', async () => {
      const payload = {
        patientId: 2, // Chamari
        doctorId: 1,  // Dr. Kavinda
        appointmentDate: '2026-09-20',
        startTime: '10:00:00',
        endTime: '10:15:00',
        symptomsReason: 'Routine annual follow-up and blood pressure check',
      };

      const res = await api.post('/appointments', payload);
      assert.strictEqual(res.status, 201, `Expected 201 Created but received ${res.status}`);
      assert.ok(res.data && res.data.id, 'Appointment ID must be generated');
      assert.strictEqual(res.data.patientId, 2);
      assert.strictEqual(res.data.doctorId, 1);
      assert.strictEqual(res.data.status, 'SCHEDULED');
      createdApptId = res.data.id;
    }, { id: 'T1-APT-01', tier: 'Tier 1', module: 'Appointment' });

    test('T1-APT-02: Retrieve appointment details with linked patient and doctor', async () => {
      assert.ok(createdApptId, 'Appointment must exist');
      const res = await api.get(`/appointments/${createdApptId}`);
      assert.strictEqual(res.status, 200, `Expected 200 OK but received ${res.status}`);
      assert.strictEqual(res.data.id, createdApptId);
      assert.strictEqual(res.data.appointmentDate, '2026-09-20');
      assert.strictEqual(res.data.startTime, '10:00:00');
    }, { id: 'T1-APT-02', tier: 'Tier 1', module: 'Appointment' });

    test('T1-APT-03: Query appointments filtered by doctor and appointment date', async () => {
      const res = await api.get('/appointments?doctorId=1&date=2026-09-20');
      assert.strictEqual(res.status, 200, `Expected 200 OK but received ${res.status}`);
      assert.ok(Array.isArray(res.data));
      assert.ok(res.data.some(a => a.id === createdApptId), 'Created appointment should be present in query');
    }, { id: 'T1-APT-03', tier: 'Tier 1', module: 'Appointment' });

    test('T1-APT-04: Reschedule appointment to a new available time slot', async () => {
      assert.ok(createdApptId, 'Appointment must exist');
      const reschedulePayload = {
        appointmentDate: '2026-09-21',
        startTime: '11:00:00',
        endTime: '11:15:00',
      };

      const res = await api.put(`/appointments/${createdApptId}/reschedule`, reschedulePayload);
      assert.strictEqual(res.status, 200, `Expected 200 OK but received ${res.status}`);
      assert.strictEqual(res.data.appointmentDate, '2026-09-21');
      assert.strictEqual(res.data.startTime, '11:00:00');
    }, { id: 'T1-APT-04', tier: 'Tier 1', module: 'Appointment' });

    test('T1-APT-05: Progress appointment through lifecycle states (SCHEDULED -> CONFIRMED -> COMPLETED)', async () => {
      assert.ok(createdApptId, 'Appointment must exist');

      // 1. Confirm
      const confirmRes = await api.patch(`/appointments/${createdApptId}/status`, { status: 'CONFIRMED' });
      assert.strictEqual(confirmRes.status, 200);
      assert.strictEqual(confirmRes.data.status, 'CONFIRMED');

      // 2. Complete
      const completeRes = await api.patch(`/appointments/${createdApptId}/status`, { status: 'COMPLETED' });
      assert.strictEqual(completeRes.status, 200);
      assert.strictEqual(completeRes.data.status, 'COMPLETED');
    }, { id: 'T1-APT-05', tier: 'Tier 1', module: 'Appointment' });
  }, { tier: 'Tier 1', module: 'Appointment' });
}
