import { describe, test, assert } from '../utils/test_framework.mjs';
import { api } from '../utils/http_client.mjs';

export function registerLandingStatsDynamicSyncTests() {
  describe('Tier 3: Pairwise Combination — Doctor Registration -> Dynamic Landing Stats Reflection', () => {
    test('T3-PAIR-08: Cross-Module Sync: Registering a new doctor dynamically increments landing stats activeDoctorsCount and featuredSpecialties', async () => {
      // 1. Query initial stats
      const initialStats = await api.get('/landing/stats');
      assert.strictEqual(initialStats.status, 200);
      const initialDocCount = initialStats.data.activeDoctorsCount;

      // 2. Register a new specialist doctor (Neurology)
      const timestamp = Date.now();
      const newDoctorPayload = {
        firstName: 'Niroshan',
        lastName: 'Bandara',
        email: `dr.niroshan.${timestamp}@pulseos.lk`,
        phoneNumber: '0773344556',
        licenseNumber: `SLMC-NEURO-${timestamp.toString().slice(-4)}`,
        specialization: 'Neurology',
        consultationFee: 3500.00,
        roomNumber: 'Room 408',
      };

      const docRes = await api.post('/doctors', newDoctorPayload);
      assert.strictEqual(docRes.status, 201, 'Doctor must be created');

      // 3. Query updated stats
      const updatedStats = await api.get('/landing/stats');
      assert.strictEqual(updatedStats.status, 200);
      assert.strictEqual(
        updatedStats.data.activeDoctorsCount,
        initialDocCount + 1,
        'activeDoctorsCount must increment by 1'
      );
      assert.ok(
        updatedStats.data.featuredSpecialties.includes('Neurology'),
        'featuredSpecialties must include newly added doctor specialty'
      );
    }, { id: 'T3-PAIR-08', tier: 'Tier 3', module: 'Doctor ↔ Landing' });
  }, { tier: 'Tier 3', module: 'Doctor ↔ Landing' });
}
