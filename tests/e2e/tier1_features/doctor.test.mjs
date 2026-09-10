import { describe, test, assert } from '../utils/test_framework.mjs';
import { api } from '../utils/http_client.mjs';

export function registerDoctorTests() {
  describe('Tier 1: Doctor Management (M2 - Kavinda / IT25103999)', () => {
    let createdDoctorId = null;
    const testLicense = `SLMC-${Date.now().toString().slice(-5)}`;

    test('T1-DOC-01: Create new doctor profile with medical license and consultation fee', async () => {
      const payload = {
        firstName: 'Ananya',
        lastName: 'Sharma',
        email: `ananya.${Date.now()}@pulseos.lk`,
        phoneNumber: '0773344556',
        licenseNumber: testLicense,
        specialization: 'Pediatrics',
        consultationFee: 2200.00,
        roomNumber: 'Room 302',
        isAvailable: true,
        departmentId: 2,
      };

      const res = await api.post('/doctors', payload);
      assert.strictEqual(res.status, 201, `Expected 201 Created but received ${res.status}`);
      assert.ok(res.data && res.data.id, 'Doctor ID must be returned');
      assert.strictEqual(res.data.licenseNumber, testLicense);
      assert.strictEqual(res.data.specialization, 'Pediatrics');
      assert.strictEqual(Number(res.data.consultationFee), 2200.00);
      createdDoctorId = res.data.id;
    }, { id: 'T1-DOC-01', tier: 'Tier 1', module: 'Doctor' });

    test('T1-DOC-02: Retrieve doctor profile by identifier', async () => {
      assert.ok(createdDoctorId, 'Doctor must exist');
      const res = await api.get(`/doctors/${createdDoctorId}`);
      assert.strictEqual(res.status, 200, `Expected 200 OK but received ${res.status}`);
      assert.strictEqual(res.data.id, createdDoctorId);
      assert.strictEqual(res.data.firstName, 'Ananya');
      assert.strictEqual(res.data.roomNumber, 'Room 302');
    }, { id: 'T1-DOC-02', tier: 'Tier 1', module: 'Doctor' });

    test('T1-DOC-03: Update doctor consultation fee configuration', async () => {
      assert.ok(createdDoctorId, 'Doctor must exist');
      const res = await api.patch(`/doctors/${createdDoctorId}/fee`, { consultationFee: 2800.00 });
      assert.strictEqual(res.status, 200, `Expected 200 OK but received ${res.status}`);
      assert.strictEqual(Number(res.data.consultationFee), 2800.00);
    }, { id: 'T1-DOC-03', tier: 'Tier 1', module: 'Doctor' });

    test('T1-DOC-04: Toggle doctor clinical availability status', async () => {
      assert.ok(createdDoctorId, 'Doctor must exist');
      // Set to unavailable
      const offRes = await api.patch(`/doctors/${createdDoctorId}/availability`, { isAvailable: false });
      assert.strictEqual(offRes.status, 200);
      assert.strictEqual(offRes.data.isAvailable, false);

      // Restore to available
      const onRes = await api.patch(`/doctors/${createdDoctorId}/availability`, { isAvailable: true });
      assert.strictEqual(onRes.status, 200);
      assert.strictEqual(onRes.data.isAvailable, true);
    }, { id: 'T1-DOC-04', tier: 'Tier 1', module: 'Doctor' });

    test('T1-DOC-05: Configure weekly consultation schedule roster slots', async () => {
      assert.ok(createdDoctorId, 'Doctor must exist');
      const schedulePayload = {
        dayOfWeek: 'TUESDAY',
        startTime: '10:00:00',
        endTime: '13:00:00',
        maxPatients: 15,
        slotDurationMinutes: 15,
      };

      const res = await api.post(`/doctors/${createdDoctorId}/schedules`, schedulePayload);
      assert.strictEqual(res.status, 201, `Expected 201 Created but received ${res.status}`);
      assert.strictEqual(res.data.doctorId, createdDoctorId);
      assert.strictEqual(res.data.dayOfWeek, 'TUESDAY');

      const listRes = await api.get(`/doctors/${createdDoctorId}/schedules`);
      assert.strictEqual(listRes.status, 200);
      assert.ok(Array.isArray(listRes.data));
      assert.ok(listRes.data.some(s => s.dayOfWeek === 'TUESDAY'));
    }, { id: 'T1-DOC-05', tier: 'Tier 1', module: 'Doctor' });
  }, { tier: 'Tier 1', module: 'Doctor' });
}
