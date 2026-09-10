import { describe, test, assert } from '../utils/test_framework.mjs';
import { api } from '../utils/http_client.mjs';
import { config } from '../config.mjs';
import { generatePayHereWebhookSignature, formatPayHereAmount } from '../utils/payhere_crypto.mjs';

export function registerFullPatientJourneyTests() {
  describe('Tier 4: Real-World Scenario 1 — Complete Emergency Patient Clinical Encounter Journey', () => {
    test('T4-SCEN-01: End-to-end traversal from ER triage through doctor consultation, diagnostic testing, pharmacy fulfillment, automated billing, and PayHere Sandbox checkout', async () => {
      // ----------------------------------------------------------------------
      // STEP 1: Patient Triage Intake (Emergency Walk-In)
      // ----------------------------------------------------------------------
      const patientNic = `NIC-ER-${Date.now().toString().slice(-6)}`;
      const patientRes = await api.post('/patients', {
        nicPassport: patientNic,
        firstName: 'Gamini',
        lastName: 'Wickramasinghe',
        email: 'gamini.w@gmail.com',
        phoneNumber: '0775566778',
        address: 'No 14, Station Road, Moratuwa',
        gender: 'MALE',
        dateOfBirth: '1975-08-20',
        bloodGroup: 'O_POSITIVE',
        allergies: 'Penicillin',
        emergencyContactName: 'Champa Wickramasinghe',
        emergencyContactPhone: '0714455667',
        triagePriority: 'EMERGENCY',
        medicalNotes: 'Presenting with acute retrosternal chest pain and diaphoresis',
      });
      assert.strictEqual(patientRes.status, 201, 'Patient triage registration failed');
      const patientId = patientRes.data.id;
      assert.strictEqual(patientRes.data.triagePriority, 'EMERGENCY');

      // ----------------------------------------------------------------------
      // STEP 2: Immediate Consultation Booking with Cardiologist
      // ----------------------------------------------------------------------
      const apptRes = await api.post('/appointments', {
        patientId,
        doctorId: 1, // Dr. Kavinda Rathnayaka (Cardiology, Fee 2500)
        appointmentDate: '2026-11-01',
        startTime: '08:00:00',
        endTime: '08:15:00',
        symptomsReason: 'Acute chest tightness, rule out myocardial infarction',
      });
      assert.strictEqual(apptRes.status, 201, 'Emergency appointment booking failed');
      const appointmentId = apptRes.data.id;

      // Doctor confirms appointment
      await api.patch(`/appointments/${appointmentId}/status`, { status: 'CONFIRMED' });

      // ----------------------------------------------------------------------
      // STEP 3: Doctor Orders STAT High-Sensitivity Troponin-I Lab Test
      // ----------------------------------------------------------------------
      const labOrderRes = await api.post('/lab/requests', {
        appointmentId,
        patientId,
        doctorId: 1,
        labTestId: 2, // High-Sensitivity Troponin-I (Price: 3200.00, Normal: 0.00 - 0.04 ng/mL)
        urgency: 'STAT/URGENT',
        clinicalIndication: 'Acute coronary syndrome investigation',
      });
      assert.strictEqual(labOrderRes.status, 201, 'STAT lab order failed');
      const labRequestId = labOrderRes.data.id;

      // ----------------------------------------------------------------------
      // STEP 4: Doctor Issues Emergency Prescription for Clopidogrel
      // ----------------------------------------------------------------------
      const prescRes = await api.post('/prescriptions', {
        appointmentId,
        patientId,
        doctorId: 1,
        notes: 'Loading dose of antiplatelet medication',
        items: [
          {
            drugId: 2, // Clopidogrel 75mg (Unit Price: 60.00)
            dosage: '75mg',
            frequency: 'OD',
            durationDays: 30,
            prescribedQuantity: 30, // Total = 30 * 60 = 1800.00
          },
        ],
      });
      assert.strictEqual(prescRes.status, 201, 'Prescription issuance failed');
      const prescriptionId = prescRes.data.id;

      // ----------------------------------------------------------------------
      // STEP 5: Laboratory Collects Blood Specimen & Records Quantitative Result
      // ----------------------------------------------------------------------
      await api.patch(`/lab/requests/${labRequestId}/collect-sample`);

      const labResultRes = await api.post(`/lab/requests/${labRequestId}/results`, {
        resultValue: 0.02, // Normal level <= 0.04
        technicianEmployeeId: 4, // Nethuli
        clinicalRemarks: 'Negative for acute myocardial necrosis',
      });
      assert.strictEqual(labResultRes.status, 200, 'Result entry failed');
      assert.strictEqual(labResultRes.data.status, 'COMPLETED');
      assert.strictEqual(labResultRes.data.flag, 'NORMAL');

      // ----------------------------------------------------------------------
      // STEP 6: Pharmacy Fulfills & Dispenses Medication (Atomic Stock Deduction)
      // ----------------------------------------------------------------------
      const drugBefore = await api.get('/pharmacy/drugs/2');
      const stockBefore = drugBefore.data.stockQuantity;

      const dispenseRes = await api.post(`/pharmacy/dispense/${prescriptionId}`);
      assert.strictEqual(dispenseRes.status, 200, 'Pharmacy dispensing failed');
      assert.strictEqual(dispenseRes.data.prescription.status, 'DISPENSED');

      const drugAfter = await api.get('/pharmacy/drugs/2');
      assert.strictEqual(drugAfter.data.stockQuantity, stockBefore - 30, 'Inventory deduction mismatch');

      // Doctor completes encounter
      await api.patch(`/appointments/${appointmentId}/status`, { status: 'COMPLETED' });

      // ----------------------------------------------------------------------
      // STEP 7: Automated Itemized Billing Aggregation
      // ----------------------------------------------------------------------
      // Expected breakdown:
      // Doctor Fee: 2500.00
      // Pharmacy Fee: 30 * 60.00 = 1800.00
      // Lab Fee: 3200.00
      // Total Amount: 2500 + 1800 + 3200 = 7500.00
      const invoiceRes = await api.post('/billing/invoices/generate', {
        patientId,
        appointmentId,
        discountAmount: 0.00,
      });
      assert.strictEqual(invoiceRes.status, 201, 'Invoice generation failed');
      const invoice = invoiceRes.data;
      assert.strictEqual(Number(invoice.doctorFee), 2500.00);
      assert.strictEqual(Number(invoice.pharmacyFee), 1800.00);
      assert.strictEqual(Number(invoice.labFee), 3200.00);
      assert.strictEqual(Number(invoice.totalAmount), 7500.00);
      assert.strictEqual(Number(invoice.netAmount), 7500.00);
      assert.strictEqual(invoice.status, 'PENDING');

      // ----------------------------------------------------------------------
      // STEP 8: Live PayHere Sandbox Checkout Initiation & Hash Verification
      // ----------------------------------------------------------------------
      const payInitRes = await api.get(`/payments/payhere/initiate?invoiceId=${invoice.id}`);
      assert.strictEqual(payInitRes.status, 200, 'PayHere initiate failed');
      assert.strictEqual(payInitRes.data.amount, '7500.00');
      assert.strictEqual(payInitRes.data.orderId, invoice.invoiceNumber);
      assert.ok(payInitRes.data.hash, 'Cryptographic PayHere hash missing');

      // ----------------------------------------------------------------------
      // STEP 9: PayHere Webhook S2S Callback -> Transition to PAID
      // ----------------------------------------------------------------------
      const formattedAmount = formatPayHereAmount(7500.00);
      const signature = generatePayHereWebhookSignature(
        config.payhere.merchantId,
        invoice.invoiceNumber,
        formattedAmount,
        'LKR',
        '2',
        config.payhere.merchantSecret
      );

      const notifyRes = await api.postForm('/payments/payhere/notify', {
        merchant_id: config.payhere.merchantId,
        order_id: invoice.invoiceNumber,
        payment_id: `PAY-E2E-${Date.now()}`,
        payhere_amount: formattedAmount,
        payhere_currency: 'LKR',
        status_code: '2',
        md5sig: signature,
        method: 'VISA',
        card_holder_name: 'Gamini Wickramasinghe',
      });
      assert.strictEqual(notifyRes.status, 200, 'PayHere webhook delivery failed');

      // Verify invoice state in database
      const finalInvoiceRes = await api.get(`/billing/invoices/${invoice.id}`);
      assert.strictEqual(finalInvoiceRes.data.status, 'PAID', 'Invoice must be in PAID state');
    }, { id: 'T4-SCEN-01', tier: 'Tier 4', module: 'Scenario' });
  }, { tier: 'Tier 4', module: 'Scenario' });
}
