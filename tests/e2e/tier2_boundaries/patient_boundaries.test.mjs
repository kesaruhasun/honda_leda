import { describe, test, assert } from '../utils/test_framework.mjs';
import { api } from '../utils/http_client.mjs';

export function registerPatientBoundaryTests() {
  describe('Tier 2: Patient Boundaries & Invariants (M1)', () => {
    test('T2-PAT-01: Duplicate NIC/Passport registration is rejected with conflict error', async () => {
      // Sunil Perera's seeded NIC: 198520104567
      const duplicatePayload = {
        nicPassport: '198520104567',
        firstName: 'Imposter',
        lastName: 'Perera',
        gender: 'MALE',
        dateOfBirth: '1985-03-15',
      };

      const res = await api.post('/patients', duplicatePayload);
      assert.ok(res.status === 409 || res.status === 400, `Expected 409/400 for duplicate NIC, got ${res.status}`);
      assert.ok(res.data && (res.data.error || res.data.message));
    }, { id: 'T2-PAT-01', tier: 'Tier 2', module: 'Patient' });

    test('T2-PAT-02: Registration with missing mandatory fields is rejected with validation error', async () => {
      const incompletePayload = {
        nicPassport: '',
        firstName: '',
      };

      const res = await api.post('/patients', incompletePayload);
      assert.strictEqual(res.status, 400, `Expected 400 Bad Request but got ${res.status}`);
    }, { id: 'T2-PAT-02', tier: 'Tier 2', module: 'Patient' });

    test('T2-PAT-03: Future date of birth is rejected by clinical intake validation', async () => {
      const futureDobPayload = {
        nicPassport: `NIC-FUT-${Date.now().toString().slice(-6)}`,
        firstName: 'Future',
        lastName: 'Baby',
        gender: 'FEMALE',
        dateOfBirth: '2099-12-31',
      };

      const res = await api.post('/patients', futureDobPayload);
      assert.strictEqual(res.status, 400, `Expected 400 Bad Request for future DOB, got ${res.status}`);
    }, { id: 'T2-PAT-03', tier: 'Tier 2', module: 'Patient' });

    test('T2-PAT-04: Fetching non-existent patient ID returns HTTP 404', async () => {
      const res = await api.get('/patients/999999');
      assert.strictEqual(res.status, 404, `Expected 404 Not Found, got ${res.status}`);
      assert.ok(res.data && res.data.error);
    }, { id: 'T2-PAT-04', tier: 'Tier 2', module: 'Patient' });

    test('T2-PAT-05: Robust handling of special characters, quotes, and punctuation in address', async () => {
      const specialNic = `SPEC-${Date.now().toString().slice(-6)}`;
      const payload = {
        nicPassport: specialNic,
        firstName: "O'Connor",
        lastName: 'Smith-Vanderbilt',
        email: `special.${Date.now()}@example.com`,
        address: 'Apartment 4B, "Ocean View", St. John\'s Way, Colombo-03; <script>alert(1)</script>',
        gender: 'OTHER',
        dateOfBirth: '1988-04-12',
      };

      const res = await api.post('/patients', payload);
      assert.strictEqual(res.status, 201, `Expected 201 Created but got ${res.status}`);
      assert.strictEqual(res.data.firstName, "O'Connor");
      assert.strictEqual(res.data.lastName, 'Smith-Vanderbilt');
    }, { id: 'T2-PAT-05', tier: 'Tier 2', module: 'Patient' });
  }, { tier: 'Tier 2', module: 'Patient' });
}
