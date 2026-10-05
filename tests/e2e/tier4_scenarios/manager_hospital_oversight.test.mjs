import { describe, test, assert } from '../utils/test_framework.mjs';
import { api } from '../utils/http_client.mjs';

export function registerManagerHospitalOversightTests() {
  describe('Tier 4: Real-World Scenario 7 — Manager Multi-Department Oversight & RBAC Hardening', () => {
    test('T4-SCEN-07: Full manager workflow: Manager JWT login -> Dynamic stats audit -> Multi-department calendar review -> Notification audit -> RBAC perimeter isolation', async () => {
      // Step 1: Manager Login
      const mgrLogin = await api.post('/auth/login', {
        username: 'manager@pulseos.lk',
        password: 'Password123!',
      });
      assert.strictEqual(mgrLogin.status, 200, 'Manager login successful');
      assert.strictEqual(mgrLogin.data.role, 'MANAGER');
      const managerToken = mgrLogin.data.token;

      // Step 2: Audit Dynamic Landing Stats
      const statsRes = await api.get('/landing/stats');
      assert.strictEqual(statsRes.status, 200);
      assert.ok(statsRes.data.activeDoctorsCount >= 1);
      assert.ok(statsRes.data.departmentsCount >= 1);
      assert.ok(statsRes.data.testsAvailableCount >= 1);

      // Step 3: Access Protected Executive KPIs with Manager Token
      const kpiRes = await api.get('/manager/kpis', {
        headers: { Authorization: `Bearer ${managerToken}` },
      });
      assert.strictEqual(kpiRes.status, 200, 'Manager successfully accessed protected KPI reports');
      assert.ok(typeof kpiRes.data.totalRevenue === 'number');
      assert.ok(typeof kpiRes.data.activeStaffCount === 'number');
      assert.ok(typeof kpiRes.data.totalAppointments === 'number');

      // Step 4: Audit Hospital-wide Calendar Load
      const calRes = await api.get('/appointments/calendar?role=MANAGER');
      assert.strictEqual(calRes.status, 200, 'Manager calendar overview retrieved');
      assert.ok(Array.isArray(calRes.data.allSchedules), 'All hospital schedules visible');
      assert.ok(Array.isArray(calRes.data.doctorLoad), 'Doctor capacity load visible');
      assert.strictEqual(calRes.data.hospitalLoad, 'NORMAL');

      // Step 5: Audit Notification Pipeline Queue
      const notifsRes = await api.get('/notifications');
      assert.strictEqual(notifsRes.status, 200);
      assert.ok(Array.isArray(notifsRes.data));
      assert.ok(notifsRes.data.length >= 1, 'Hospital email notification records verified');

      // Step 6: RBAC Perimeter Hardening Verification
      // 6a: Unauthenticated access blocked (401)
      const unauthKpi = await api.get('/manager/kpis');
      assert.strictEqual(unauthKpi.status, 401, 'Unauthenticated request to KPI endpoint blocked with 401');

      // 6b: Patient token access blocked (403)
      const patLogin = await api.post('/auth/login', {
        username: 'patient.sunil@gmail.com',
        password: 'Password123!',
      });
      const patToken = patLogin.data.token;
      const patKpi = await api.get('/manager/kpis', {
        headers: { Authorization: `Bearer ${patToken}` },
      });
      assert.strictEqual(patKpi.status, 403, 'Patient forbidden from accessing Manager KPIs (403)');

      // 6c: Doctor token access blocked (403)
      const docLogin = await api.post('/auth/login', {
        username: 'doc.kavinda@pulseos.lk',
        password: 'Password123!',
      });
      const docToken = docLogin.data.token;
      const docKpi = await api.get('/manager/kpis', {
        headers: { Authorization: `Bearer ${docToken}` },
      });
      assert.strictEqual(docKpi.status, 403, 'Doctor forbidden from accessing Manager KPIs (403)');
    }, { id: 'T4-SCEN-07', tier: 'Tier 4', module: 'Manager Oversight' });
  }, { tier: 'Tier 4', module: 'Manager Oversight' });
}
