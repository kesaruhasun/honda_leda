import { describe, test, assert } from '../utils/test_framework.mjs';
import { api } from '../utils/http_client.mjs';
import { signJwt } from '../utils/jwt.mjs';

export function registerSecurityRbacBoundaryTests() {
  describe('Tier 2: Security, RBAC & Integration Boundaries & Invariants', () => {
    let patientToken = null;
    let doctorToken = null;

    test('T2-SEC-01: Unauthenticated request to protected endpoints returns HTTP 401 Unauthorized', async () => {
      // 1. Protected /auth/me without token
      const meRes = await api.get('/auth/me');
      assert.strictEqual(meRes.status, 401, `Expected 401 Unauthorized for /auth/me without token, got ${meRes.status}`);

      // 2. Protected /manager/kpis without token
      const kpiRes = await api.get('/manager/kpis');
      assert.strictEqual(kpiRes.status, 401, `Expected 401 Unauthorized for /manager/kpis without token, got ${kpiRes.status}`);

      // 3. Protected /clinical/consultations without token
      const clinRes = await api.get('/clinical/consultations');
      assert.strictEqual(clinRes.status, 401, `Expected 401 Unauthorized for /clinical/consultations without token, got ${clinRes.status}`);
    }, { id: 'T2-SEC-01', tier: 'Tier 2', module: 'Security' });

    test('T2-SEC-02: Request with forged or malformed JWT token returns HTTP 401 Unauthorized', async () => {
      // Malformed token string
      const malformedRes = await api.get('/auth/me', {
        headers: { Authorization: 'Bearer this.is.not.a.valid.jwt' },
      });
      assert.strictEqual(malformedRes.status, 401, `Expected 401 for malformed JWT, got ${malformedRes.status}`);

      // Forged token signed with a bogus secret key
      const forgedToken = signJwt({ userId: 999, role: 'MANAGER' }, 'attacker_fake_secret_key');
      const forgedRes = await api.get('/manager/kpis', {
        headers: { Authorization: `Bearer ${forgedToken}` },
      });
      assert.strictEqual(forgedRes.status, 401, `Expected 401 for forged JWT signature, got ${forgedRes.status}`);
    }, { id: 'T2-SEC-02', tier: 'Tier 2', module: 'Security' });

    test('T2-SEC-03: Patient role forbidden from accessing Manager executive KPI endpoint (HTTP 403 Forbidden)', async () => {
      // Login as Patient
      const patLogin = await api.post('/auth/login', {
        username: 'patient.sunil@gmail.com',
        password: 'Password123!',
      });
      assert.strictEqual(patLogin.status, 200);
      patientToken = patLogin.data.token;

      // Patient attempts to access Manager KPI endpoint
      const res = await api.get('/manager/kpis', {
        headers: { Authorization: `Bearer ${patientToken}` },
      });
      assert.strictEqual(res.status, 403, `Expected 403 Forbidden when Patient accesses Manager endpoint, got ${res.status}`);
      assert.ok(res.data.error, 'Must contain error descriptor');
    }, { id: 'T2-SEC-03', tier: 'Tier 2', module: 'Security' });

    test('T2-SEC-04: Doctor role forbidden from accessing Manager executive KPI endpoint (HTTP 403 Forbidden)', async () => {
      // Login as Doctor
      const docLogin = await api.post('/auth/login', {
        username: 'doc.kavinda@pulseos.lk',
        password: 'Password123!',
      });
      assert.strictEqual(docLogin.status, 200);
      doctorToken = docLogin.data.token;

      // Doctor attempts to access Manager KPI endpoint
      const res = await api.get('/manager/kpis', {
        headers: { Authorization: `Bearer ${doctorToken}` },
      });
      assert.strictEqual(res.status, 403, `Expected 403 Forbidden when Doctor accesses Manager endpoint, got ${res.status}`);
    }, { id: 'T2-SEC-04', tier: 'Tier 2', module: 'Security' });

    test('T2-SEC-05: Non-doctor role (Patient) forbidden from accessing clinical consultation queue (HTTP 403 Forbidden)', async () => {
      assert.ok(patientToken, 'Patient token must exist');
      const res = await api.get('/clinical/consultations', {
        headers: { Authorization: `Bearer ${patientToken}` },
      });
      assert.strictEqual(res.status, 403, `Expected 403 Forbidden when Patient accesses clinical consultations, got ${res.status}`);
    }, { id: 'T2-SEC-05', tier: 'Tier 2', module: 'Security' });

    test('T2-SEC-06: Authentication with invalid password or non-existent user returns HTTP 401 Unauthorized', async () => {
      // Wrong password
      const wrongPassRes = await api.post('/auth/login', {
        username: 'doc.kavinda@pulseos.lk',
        password: 'WrongPassword999!',
      });
      assert.strictEqual(wrongPassRes.status, 401, `Expected 401 for wrong password, got ${wrongPassRes.status}`);

      // Non-existent user
      const nonExistentRes = await api.post('/auth/login', {
        username: 'nonexistent.user@pulseos.lk',
        password: 'Password123!',
      });
      assert.strictEqual(nonExistentRes.status, 401, `Expected 401 for non-existent user, got ${nonExistentRes.status}`);
    }, { id: 'T2-SEC-06', tier: 'Tier 2', module: 'Security' });

    test('T2-SEC-07: PayHere mock settlement on non-existent invoice returns HTTP 404 Not Found', async () => {
      const res = await api.post('/payments/payhere/mock-success?invoiceId=999999', {});
      assert.strictEqual(res.status, 404, `Expected 404 Not Found for invalid invoice ID, got ${res.status}`);
    }, { id: 'T2-SEC-07', tier: 'Tier 2', module: 'Billing' });

    test('T2-SEC-08: PayHere mock settlement on already PAID invoice returns HTTP 400 Bad Request', async () => {
      // Invoice 1 is already PAID in database seeder
      const res = await api.post('/payments/payhere/mock-success?invoiceId=1', {});
      assert.strictEqual(res.status, 400, `Expected 400 Bad Request for settling already paid invoice, got ${res.status}`);
      assert.strictEqual(res.data.error, 'Already Paid');
    }, { id: 'T2-SEC-08', tier: 'Tier 2', module: 'Billing' });

    test('T2-SEC-09: Calendar query with invalid or missing role parameter returns HTTP 400 Bad Request', async () => {
      // Missing role
      const missingRole = await api.get('/appointments/calendar');
      assert.strictEqual(missingRole.status, 400, `Expected 400 for missing role, got ${missingRole.status}`);

      // Invalid role
      const invalidRole = await api.get('/appointments/calendar?role=HACKER');
      assert.strictEqual(invalidRole.status, 400, `Expected 400 for invalid role, got ${invalidRole.status}`);

      // Doctor role missing doctorId
      const missingDocId = await api.get('/appointments/calendar?role=DOCTOR');
      assert.strictEqual(missingDocId.status, 400, `Expected 400 for doctor view without doctorId, got ${missingDocId.status}`);
    }, { id: 'T2-SEC-09', tier: 'Tier 2', module: 'Appointment' });
  }, { tier: 'Tier 2', module: 'Security' });
}
