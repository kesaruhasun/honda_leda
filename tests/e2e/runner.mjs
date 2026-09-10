import { config } from './config.mjs';
import { api } from './utils/http_client.mjs';
import { runner } from './utils/test_framework.mjs';
import { createMockServer } from './mock_server.mjs';

// Tier 1 Suites
import { registerPatientTests } from './tier1_features/patient.test.mjs';
import { registerDoctorTests } from './tier1_features/doctor.test.mjs';
import { registerAppointmentTests } from './tier1_features/appointment.test.mjs';
import { registerPharmacyTests } from './tier1_features/pharmacy.test.mjs';
import { registerBillingTests } from './tier1_features/billing.test.mjs';
import { registerLaboratoryTests } from './tier1_features/laboratory.test.mjs';

// Tier 2 Suites
import { registerPatientBoundaryTests } from './tier2_boundaries/patient_boundaries.test.mjs';
import { registerDoctorBoundaryTests } from './tier2_boundaries/doctor_boundaries.test.mjs';
import { registerAppointmentBoundaryTests } from './tier2_boundaries/appointment_boundaries.test.mjs';
import { registerPharmacyBoundaryTests } from './tier2_boundaries/pharmacy_boundaries.test.mjs';
import { registerBillingBoundaryTests } from './tier2_boundaries/billing_boundaries.test.mjs';
import { registerLaboratoryBoundaryTests } from './tier2_boundaries/laboratory_boundaries.test.mjs';

// Tier 3 Suites
import { registerAppointmentPrescriptionInventoryTests } from './tier3_pairwise/appointment_prescription_inventory.test.mjs';
import { registerAppointmentLabInvoiceTests } from './tier3_pairwise/appointment_lab_invoice.test.mjs';
import { registerFeeChangeInvoiceTests } from './tier3_pairwise/fee_change_invoice.test.mjs';
import { registerPatientArchiveLifecycleTests } from './tier3_pairwise/patient_archive_lifecycle.test.mjs';
import { registerBatchExpiryDispensingTests } from './tier3_pairwise/batch_expiry_dispensing.test.mjs';

// Tier 4 Suites
import { registerFullPatientJourneyTests } from './tier4_scenarios/full_patient_journey.test.mjs';
import { registerRoutineCounterSettlementTests } from './tier4_scenarios/routine_counter_settlement.test.mjs';
import { registerPediatricAcuteCareTests } from './tier4_scenarios/pediatric_acute_care.test.mjs';
import { registerScheduleRescheduleLifecycleTests } from './tier4_scenarios/schedule_reschedule_lifecycle.test.mjs';
import { registerFraudDetectionPayHereTests } from './tier4_scenarios/fraud_detection_payhere.test.mjs';

async function main() {
  const args = process.argv.slice(2);
  const forceMock = args.includes('--mock');
  const forceLive = args.includes('--live');

  let mockInstance = null;

  // Determine runtime mode
  if (forceMock) {
    console.log('[Runner] Mode: Explicitly forced Mock Server (--mock)');
    mockInstance = createMockServer();
    await mockInstance.listen(config.mockPort);
    api.setBaseUrl(`http://localhost:${config.mockPort}/api/v1`);
    console.log(`[Runner] Embedded mock server listening on port ${config.mockPort}`);
  } else if (forceLive) {
    console.log(`[Runner] Mode: Explicitly forced Live Server (${config.baseUrl})`);
  } else {
    // Auto-detect: probe if live backend is running
    try {
      const probeRes = await api.get('/patients', { timeoutMs: 1500 });
      if (probeRes.status === 200) {
        console.log(`[Runner] Live Spring Boot backend detected at ${config.baseUrl}`);
      } else {
        throw new Error(`Unexpected probe status ${probeRes.status}`);
      }
    } catch {
      console.log(`[Runner] Spring Boot backend not detected on ${config.baseUrl}. Launching embedded mock API server...`);
      mockInstance = createMockServer();
      await mockInstance.listen(config.mockPort);
      api.setBaseUrl(`http://localhost:${config.mockPort}/api/v1`);
      console.log(`[Runner] Embedded mock server active at http://localhost:${config.mockPort}/api/v1`);
    }
  }

  // Register Tier 1 Features
  registerPatientTests();
  registerDoctorTests();
  registerAppointmentTests();
  registerPharmacyTests();
  registerBillingTests();
  registerLaboratoryTests();

  // Register Tier 2 Boundaries
  registerPatientBoundaryTests();
  registerDoctorBoundaryTests();
  registerAppointmentBoundaryTests();
  registerPharmacyBoundaryTests();
  registerBillingBoundaryTests();
  registerLaboratoryBoundaryTests();

  // Register Tier 3 Pairwise Combinations
  registerAppointmentPrescriptionInventoryTests();
  registerAppointmentLabInvoiceTests();
  registerFeeChangeInvoiceTests();
  registerPatientArchiveLifecycleTests();
  registerBatchExpiryDispensingTests();

  // Register Tier 4 Real-World Scenarios
  registerFullPatientJourneyTests();
  registerRoutineCounterSettlementTests();
  registerPediatricAcuteCareTests();
  registerScheduleRescheduleLifecycleTests();
  registerFraudDetectionPayHereTests();

  // Execute test runner
  let outcome;
  try {
    outcome = await runner.run();
  } finally {
    if (mockInstance) {
      await mockInstance.close();
      console.log('[Runner] Embedded mock server stopped.');
    }
  }

  process.exit(outcome.success ? 0 : 1);
}

main().catch(err => {
  console.error('[Runner Fatal]', err);
  process.exit(1);
});
