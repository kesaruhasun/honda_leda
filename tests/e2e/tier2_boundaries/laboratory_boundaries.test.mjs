import { describe, test, assert } from '../utils/test_framework.mjs';
import { api } from '../utils/http_client.mjs';

export function registerLaboratoryBoundaryTests() {
  describe('Tier 2: Laboratory Boundaries & Clinical Range Flags (M6)', () => {
    let testLabReqId = null;

    test('T2-LAB-01: Ordering diagnostic test with non-existent test catalog ID returns HTTP 404', async () => {
      const invalidOrder = {
        appointmentId: 1,
        patientId: 1,
        doctorId: 1,
        labTestId: 999999, // Non-existent
      };

      const res = await api.post('/lab/requests', invalidOrder);
      assert.strictEqual(res.status, 404, `Expected 404 for invalid catalog item, got ${res.status}`);
    }, { id: 'T2-LAB-01', tier: 'Tier 2', module: 'Laboratory' });

    test('T2-LAB-02: Quantitative result exceeding upper normal range automatically flags as HIGH', async () => {
      // Order Fasting Blood Sugar (FBS, catalog id 4, normal range: 70 - 100 mg/dL)
      const orderRes = await api.post('/lab/requests', {
        appointmentId: 2,
        patientId: 2,
        doctorId: 1,
        labTestId: 4,
        urgency: 'ROUTINE',
      });
      assert.strictEqual(orderRes.status, 201);
      testLabReqId = orderRes.data.id;

      // Mark sample collected
      await api.patch(`/lab/requests/${testLabReqId}/collect-sample`);

      // Enter elevated result (185.0 mg/dL > 100.0)
      const resultRes = await api.post(`/lab/requests/${testLabReqId}/results`, {
        resultValue: 185.0,
        technicianEmployeeId: 4,
        clinicalRemarks: 'Marked hyperglycemia detected',
      });

      assert.strictEqual(resultRes.status, 200);
      assert.strictEqual(resultRes.data.flag, 'HIGH', 'Value > 100 must be flagged as HIGH');
      assert.strictEqual(resultRes.data.status, 'COMPLETED');
    }, { id: 'T2-LAB-02', tier: 'Tier 2', module: 'Laboratory' });

    test('T2-LAB-03: Quantitative result below lower normal range automatically flags as LOW', async () => {
      // Order FBS again for another patient
      const orderRes = await api.post('/lab/requests', {
        appointmentId: 3,
        patientId: 3,
        doctorId: 1,
        labTestId: 4, // Normal range 70 - 100
      });
      const reqId = orderRes.data.id;
      await api.patch(`/lab/requests/${reqId}/collect-sample`);

      // Enter hypoglycemic result (45.0 mg/dL < 70.0)
      const resultRes = await api.post(`/lab/requests/${reqId}/results`, {
        resultValue: 45.0,
        technicianEmployeeId: 4,
        clinicalRemarks: 'Acute hypoglycemia',
      });

      assert.strictEqual(resultRes.status, 200);
      assert.strictEqual(resultRes.data.flag, 'LOW', 'Value < 70 must be flagged as LOW');
    }, { id: 'T2-LAB-03', tier: 'Tier 2', module: 'Laboratory' });

    test('T2-LAB-04: Duplicate result entry on already-completed lab request is rejected', async () => {
      assert.ok(testLabReqId, 'Completed lab request must exist');
      const duplicateRes = await api.post(`/lab/requests/${testLabReqId}/results`, {
        resultValue: 120.0,
        technicianEmployeeId: 4,
      });

      assert.strictEqual(duplicateRes.status, 400, `Expected 400 Already Completed, got ${duplicateRes.status}`);
    }, { id: 'T2-LAB-04', tier: 'Tier 2', module: 'Laboratory' });

    test('T2-LAB-05: Missing resultValue payload in result entry is rejected with validation error', async () => {
      // Create new order
      const orderRes = await api.post('/lab/requests', {
        appointmentId: 1,
        patientId: 1,
        doctorId: 1,
        labTestId: 1,
      });
      const reqId = orderRes.data.id;
      await api.patch(`/lab/requests/${reqId}/collect-sample`);

      // Submit without resultValue
      const invalidRes = await api.post(`/lab/requests/${reqId}/results`, {
        technicianEmployeeId: 4,
        clinicalRemarks: 'Empty result payload',
      });

      assert.strictEqual(invalidRes.status, 400, `Expected 400 for missing resultValue, got ${invalidRes.status}`);
    }, { id: 'T2-LAB-05', tier: 'Tier 2', module: 'Laboratory' });
  }, { tier: 'Tier 2', module: 'Laboratory' });
}
