import { describe, test, assert } from '../utils/test_framework.mjs';
import { api } from '../utils/http_client.mjs';

export function registerAppointmentBoundaryTests() {
  describe('Tier 2: Appointment Boundaries & Invariants (M3)', () => {
    test('T2-APT-01: Strict double-booking rejection: Booking same doctor at identical date & time slot fails', async () => {
      // Seeded Appointment 2 is at: Doctor 1, Date '2026-09-14', Time '09:30:00', CONFIRMED
      const conflictPayload = {
        patientId: 3, // Dinuk
        doctorId: 1,  // Dr. Kavinda
        appointmentDate: '2026-09-14',
        startTime: '09:30:00',
        endTime: '09:45:00',
        symptomsReason: 'Double booking attempt',
      };

      const res = await api.post('/appointments', conflictPayload);
      assert.strictEqual(res.status, 409, `Expected 409 Conflict for double-booking, got ${res.status}`);
      assert.ok(res.data && res.data.message.includes('already scheduled'));
    }, { id: 'T2-APT-01', tier: 'Tier 2', module: 'Appointment' });

    test('T2-APT-02: Booking consultation with unavailable/off-duty doctor is rejected', async () => {
      // 1. Temporarily toggle Dr. Kavinda off-duty
      await api.patch('/doctors/1/availability', { isAvailable: false });

      const payload = {
        patientId: 2,
        doctorId: 1,
        appointmentDate: '2026-10-01',
        startTime: '10:00:00',
      };

      const res = await api.post('/appointments', payload);
      assert.strictEqual(res.status, 400, `Expected 400 Bad Request when doctor is off-duty, got ${res.status}`);

      // Restore availability
      await api.patch('/doctors/1/availability', { isAvailable: true });
    }, { id: 'T2-APT-02', tier: 'Tier 2', module: 'Appointment' });

    test('T2-APT-03: Booking appointment for archived patient is rejected', async () => {
      // Archive patient 3
      await api.patch('/patients/3/archive');

      const payload = {
        patientId: 3,
        doctorId: 1,
        appointmentDate: '2026-10-05',
        startTime: '14:00:00',
      };

      const res = await api.post('/appointments', payload);
      assert.strictEqual(res.status, 400, `Expected 400 for archived patient booking, got ${res.status}`);

      // Restore patient 3
      await api.patch('/patients/3/restore');
    }, { id: 'T2-APT-03', tier: 'Tier 2', module: 'Appointment' });

    test('T2-APT-04: Rescheduling into an already occupied slot is rejected with conflict', async () => {
      // Appointment 3 (APT-2026-0003) attempts to reschedule into Appointment 2 slot (2026-09-14 09:30:00)
      const conflictReschedule = {
        appointmentDate: '2026-09-14',
        startTime: '09:30:00',
      };

      const res = await api.put('/appointments/3/reschedule', conflictReschedule);
      assert.strictEqual(res.status, 409, `Expected 409 Conflict for occupied rescheduling slot, got ${res.status}`);
    }, { id: 'T2-APT-04', tier: 'Tier 2', module: 'Appointment' });

    test('T2-APT-05: Invalid appointment state transition from CANCELLED to COMPLETED is rejected', async () => {
      // Cancel appointment 3
      await api.delete('/appointments/3');

      // Attempt to directly complete a cancelled appointment
      const invalidRes = await api.patch('/appointments/3/status', { status: 'COMPLETED' });
      assert.strictEqual(invalidRes.status, 400, `Expected 400 for invalid state transition, got ${invalidRes.status}`);
    }, { id: 'T2-APT-05', tier: 'Tier 2', module: 'Appointment' });
  }, { tier: 'Tier 2', module: 'Appointment' });
}
