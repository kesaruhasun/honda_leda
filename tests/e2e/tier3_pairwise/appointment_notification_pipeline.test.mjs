import { describe, test, assert } from '../utils/test_framework.mjs';
import { api } from '../utils/http_client.mjs';

export function registerAppointmentNotificationPipelineTests() {
  describe('Tier 3: Pairwise Combination — Appointment -> Async Email Notification Pipeline', () => {
    test('T3-PAIR-06: Cross-Module Flow: Booking an appointment automatically triggers and records email notification with patient details', async () => {
      // 1. Register a new patient
      const timestamp = Date.now();
      const patientPayload = {
        nicPassport: `NIC${timestamp.toString().slice(-9)}`,
        firstName: 'Dilini',
        lastName: 'Samarasinghe',
        email: `dilini.${timestamp}@gmail.com`,
        phoneNumber: '0719876543',
        address: 'No 45, Baseline Road, Colombo 09',
        gender: 'FEMALE',
        dateOfBirth: '1995-04-18',
        bloodGroup: 'B_POSITIVE',
        triagePriority: 'ROUTINE',
      };

      const patRes = await api.post('/patients', patientPayload);
      assert.strictEqual(patRes.status, 201, 'Patient must be registered');
      const patientId = patRes.data.id;
      const patientEmail = patRes.data.email;

      // 2. Book an appointment for this patient
      const apptPayload = {
        patientId,
        doctorId: 1,
        appointmentDate: '2026-12-05',
        startTime: '11:00:00',
        endTime: '11:15:00',
        symptomsReason: 'Routine health checkup consultation',
      };

      const apptRes = await api.post('/appointments', apptPayload);
      assert.strictEqual(apptRes.status, 201, 'Appointment must be booked');
      const apptNumber = apptRes.data.appointmentNumber;

      // 3. Verify notification pipeline captured the event
      const notifRes = await api.get(`/notifications?referenceId=${apptNumber}`);
      assert.strictEqual(notifRes.status, 200, 'Notification query must return 200');
      assert.ok(Array.isArray(notifRes.data), 'Notifications must be array');
      assert.strictEqual(notifRes.data.length, 1, 'Exactly one notification for this appointment');

      const notif = notifRes.data[0];
      assert.strictEqual(notif.eventType, 'APPOINTMENT_CREATED');
      assert.strictEqual(notif.recipientEmail, patientEmail);
      assert.ok(notif.recipientName.includes('Dilini'));
      assert.strictEqual(notif.referenceId, apptNumber);
      assert.strictEqual(notif.status, 'SENT');
    }, { id: 'T3-PAIR-06', tier: 'Tier 3', module: 'Appointment ↔ Notification' });
  }, { tier: 'Tier 3', module: 'Appointment ↔ Notification' });
}
