import { describe, test, assert } from '../utils/test_framework.mjs';
import { api } from '../utils/http_client.mjs';

export function registerScheduleRescheduleLifecycleTests() {
  describe('Tier 4: Real-World Scenario 4 — Appointment Conflict Resolution, Rescheduling & Slot Reuse', () => {
    test('T4-SCEN-04: Full slot allocation cycle: Booking -> Conflict detection -> Rescheduling -> Cancellation -> Slot reuse by another patient', async () => {
      const testDate = '2026-11-20';
      const slotTime = '14:30:00';

      // 1. Patient 1 books 14:30:00 slot with Doctor 1
      const appt1Res = await api.post('/appointments', {
        patientId: 1,
        doctorId: 1,
        appointmentDate: testDate,
        startTime: slotTime,
        endTime: '14:45:00',
        symptomsReason: 'Follow-up cardiology review',
      });
      assert.strictEqual(appt1Res.status, 201);
      const appt1Id = appt1Res.data.id;

      // 2. Patient 2 attempts booking the exact same slot -> MUST FAIL WITH 409
      const appt2ConflictRes = await api.post('/appointments', {
        patientId: 2,
        doctorId: 1,
        appointmentDate: testDate,
        startTime: slotTime,
        endTime: '14:45:00',
      });
      assert.strictEqual(appt2ConflictRes.status, 409, 'Double booking must be prevented');

      // 3. Patient 1 reschedules to 15:30:00
      const rescheduleRes = await api.put(`/appointments/${appt1Id}/reschedule`, {
        appointmentDate: testDate,
        startTime: '15:30:00',
        endTime: '15:45:00',
      });
      assert.strictEqual(rescheduleRes.status, 200);
      assert.strictEqual(rescheduleRes.data.startTime, '15:30:00');

      // 4. Now the original slot 14:30:00 is free! Patient 2 books it successfully
      const appt2SuccessRes = await api.post('/appointments', {
        patientId: 2,
        doctorId: 1,
        appointmentDate: testDate,
        startTime: slotTime,
        endTime: '14:45:00',
        symptomsReason: 'Slot reallocated to Patient 2',
      });
      assert.strictEqual(appt2SuccessRes.status, 201, 'Freed slot must now be bookable');
      const appt2Id = appt2SuccessRes.data.id;

      // 5. Patient 2 cancels their appointment -> Status transitions to CANCELLED
      const cancelRes = await api.delete(`/appointments/${appt2Id}`);
      assert.strictEqual(cancelRes.status, 200);
      assert.strictEqual(cancelRes.data.appointment.status, 'CANCELLED');

      // 6. Patient 3 can now book the cancelled slot
      const appt3Res = await api.post('/appointments', {
        patientId: 3,
        doctorId: 1,
        appointmentDate: testDate,
        startTime: slotTime,
        endTime: '14:45:00',
        symptomsReason: 'Patient 3 booking slot after cancellation',
      });
      assert.strictEqual(appt3Res.status, 201, 'Cancelled slot must be bookable again');
    }, { id: 'T4-SCEN-04', tier: 'Tier 4', module: 'Scenario' });
  }, { tier: 'Tier 4', module: 'Scenario' });
}
