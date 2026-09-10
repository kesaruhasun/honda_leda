import { describe, test, assert } from '../utils/test_framework.mjs';
import { api } from '../utils/http_client.mjs';

export function registerPatientTests() {
  describe('Tier 1: Patient Management (M1 - Dila / IT25103819)', () => {
    let createdPatientId = null;
    const testNic = `NIC${Date.now().toString().slice(-9)}`;

    test('T1-PAT-01: Register a new patient with complete demographic and emergency data', async () => {
      const payload = {
        nicPassport: testNic,
        firstName: 'Dilan',
        lastName: 'Senanayake',
        email: `dilan.${Date.now()}@example.com`,
        phoneNumber: '0779988776',
        address: 'No 45, Baseline Road, Colombo 09',
        gender: 'MALE',
        dateOfBirth: '1990-06-15',
        bloodGroup: 'B_POSITIVE',
        allergies: 'Penicillin',
        emergencyContactName: 'Anoma Senanayake',
        emergencyContactPhone: '0712233445',
        triagePriority: 'ROUTINE',
        medicalNotes: 'No prior surgical history',
      };

      const res = await api.post('/patients', payload);
      assert.strictEqual(res.status, 201, `Expected 201 Created but received ${res.status}`);
      assert.ok(res.data && res.data.id, 'Patient ID must be generated');
      assert.strictEqual(res.data.nicPassport, testNic);
      assert.strictEqual(res.data.firstName, 'Dilan');
      assert.strictEqual(res.data.bloodGroup, 'B_POSITIVE');
      createdPatientId = res.data.id;
    }, { id: 'T1-PAT-01', tier: 'Tier 1', module: 'Patient' });

    test('T1-PAT-02: Retrieve patient profile by primary key ID', async () => {
      assert.ok(createdPatientId, 'Patient must exist from previous step');
      const res = await api.get(`/patients/${createdPatientId}`);
      assert.strictEqual(res.status, 200, `Expected 200 OK but received ${res.status}`);
      assert.strictEqual(res.data.id, createdPatientId);
      assert.strictEqual(res.data.emergencyContactName, 'Anoma Senanayake');
      assert.strictEqual(res.data.allergies, 'Penicillin');
    }, { id: 'T1-PAT-02', tier: 'Tier 1', module: 'Patient' });

    test('T1-PAT-03: Lookup patient record by unique NIC/Passport number', async () => {
      const res = await api.get(`/patients/nic/${testNic}`);
      assert.strictEqual(res.status, 200, `Expected 200 OK but received ${res.status}`);
      assert.strictEqual(res.data.nicPassport, testNic);
      assert.strictEqual(res.data.lastName, 'Senanayake');
    }, { id: 'T1-PAT-03', tier: 'Tier 1', module: 'Patient' });

    test('T1-PAT-04: Update patient demographics, address, and triage priority', async () => {
      assert.ok(createdPatientId, 'Patient must exist');
      const updatePayload = {
        address: 'No 99, Galle Road, Colombo 03',
        phoneNumber: '0771122334',
        allergies: 'Penicillin, Aspirin',
        triagePriority: 'URGENT',
      };

      const res = await api.put(`/patients/${createdPatientId}`, updatePayload);
      assert.strictEqual(res.status, 200, `Expected 200 OK but received ${res.status}`);
      assert.strictEqual(res.data.address, 'No 99, Galle Road, Colombo 03');
      assert.strictEqual(res.data.phoneNumber, '0771122334');
      assert.strictEqual(res.data.allergies, 'Penicillin, Aspirin');
      assert.strictEqual(res.data.triagePriority, 'URGENT');
    }, { id: 'T1-PAT-04', tier: 'Tier 1', module: 'Patient' });

    test('T1-PAT-05: Query and filter patient registry by triage priority tag', async () => {
      const res = await api.get('/patients?triagePriority=EMERGENCY');
      assert.strictEqual(res.status, 200, `Expected 200 OK but received ${res.status}`);
      assert.ok(Array.isArray(res.data), 'Expected array of patients');
      // Verify pre-seeded Sunil Perera exists with EMERGENCY tag
      const emergencyPat = res.data.find(p => p.triagePriority === 'EMERGENCY');
      assert.ok(emergencyPat, 'Should find at least one EMERGENCY triage patient');
    }, { id: 'T1-PAT-05', tier: 'Tier 1', module: 'Patient' });
  }, { tier: 'Tier 1', module: 'Patient' });
}
