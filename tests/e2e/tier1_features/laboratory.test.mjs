import { describe, test, assert } from '../utils/test_framework.mjs';
import { api } from '../utils/http_client.mjs';

export function registerLaboratoryTests() {
  describe('Tier 1: Laboratory & Diagnostic Tests (M6 - Nethuli / IT25103363)', () => {
    let createdLabReqId = null;

    test('T1-LAB-01: Retrieve standard diagnostic laboratory test catalog', async () => {
      const res = await api.get('/lab/tests');
      assert.strictEqual(res.status, 200, `Expected 200 OK but received ${res.status}`);
      assert.ok(Array.isArray(res.data), 'Catalog should return array of tests');
      assert.ok(res.data.length >= 4, 'Catalog should contain at least 4 standard diagnostic panels');

      const lipidTest = res.data.find(t => t.testCode === 'LAB-001');
      assert.ok(lipidTest, 'Lipid Profile Full Panel must exist');
      assert.strictEqual(lipidTest.category, 'BIOCHEMISTRY');
    }, { id: 'T1-LAB-01', tier: 'Tier 1', module: 'Laboratory' });

    test('T1-LAB-02: Doctor orders laboratory diagnostic test for clinical appointment', async () => {
      const payload = {
        appointmentId: 3, // Pediatric appointment
        patientId: 3,      // Dinuk
        doctorId: 1,       // Dr. Kavinda
        labTestId: 3,      // Complete Blood Count (CBC)
        urgency: 'STAT/URGENT',
        clinicalIndication: 'High recurring fever and elevated pulse',
      };

      const res = await api.post('/lab/requests', payload);
      assert.strictEqual(res.status, 201, `Expected 201 Created but received ${res.status}`);
      assert.ok(res.data && res.data.id, 'Lab request ID generated');
      assert.strictEqual(res.data.status, 'REQUESTED');
      assert.strictEqual(res.data.urgency, 'STAT/URGENT');
      createdLabReqId = res.data.id;
    }, { id: 'T1-LAB-02', tier: 'Tier 1', module: 'Laboratory' });

    test('T1-LAB-03: Retrieve lab test request by identifier', async () => {
      assert.ok(createdLabReqId, 'Lab request must exist');
      const res = await api.get(`/lab/requests/${createdLabReqId}`);
      assert.strictEqual(res.status, 200, `Expected 200 OK but received ${res.status}`);
      assert.strictEqual(res.data.id, createdLabReqId);
      assert.strictEqual(res.data.clinicalIndication, 'High recurring fever and elevated pulse');
    }, { id: 'T1-LAB-03', tier: 'Tier 1', module: 'Laboratory' });

    test('T1-LAB-04: Lab technician collects biological specimen (REQUESTED -> SAMPLE_COLLECTED)', async () => {
      assert.ok(createdLabReqId, 'Lab request must exist');
      const res = await api.patch(`/lab/requests/${createdLabReqId}/collect-sample`);
      assert.strictEqual(res.status, 200, `Expected 200 OK but received ${res.status}`);
      assert.strictEqual(res.data.status, 'SAMPLE_COLLECTED');
    }, { id: 'T1-LAB-04', tier: 'Tier 1', module: 'Laboratory' });

    test('T1-LAB-05: Enter quantitative clinical test result and verify transition to COMPLETED', async () => {
      assert.ok(createdLabReqId, 'Lab request must exist');
      const payload = {
        resultValue: 7.5, // CBC WBC count within 4.0 - 11.0
        technicianEmployeeId: 4, // Nethuli
        clinicalRemarks: 'Normal WBC count. Viral etiology suspected.',
      };

      const res = await api.post(`/lab/requests/${createdLabReqId}/results`, payload);
      assert.strictEqual(res.status, 200, `Expected 200 OK but received ${res.status}`);
      assert.strictEqual(res.data.status, 'COMPLETED');
      assert.strictEqual(res.data.resultValue, 7.5);
      assert.strictEqual(res.data.flag, 'NORMAL');
      assert.ok(res.data.referenceRange, 'Reference range must be reported');
    }, { id: 'T1-LAB-05', tier: 'Tier 1', module: 'Laboratory' });
  }, { tier: 'Tier 1', module: 'Laboratory' });
}
