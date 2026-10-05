import { describe, test, assert } from '../utils/test_framework.mjs';
import { api } from '../utils/http_client.mjs';

export function registerSecurityAuthTests() {
  describe('Tier 1: Security, Auth, Integrations & Dynamic Services (M2/M3/M4)', () => {
    let doctorToken = null;
    let managerToken = null;
    let patientToken = null;
    let createdInvoiceId = null;

    test('T1-SEC-01: User authentication login issues signed JWT token with user identity and role claims', async () => {
      // Test Doctor Login
      const docRes = await api.post('/auth/login', {
        username: 'doc.kavinda@pulseos.lk',
        password: 'Password123!',
      });
      assert.strictEqual(docRes.status, 200, `Expected 200 OK for Doctor login, got ${docRes.status}`);
      assert.ok(docRes.data.token, 'Doctor token must be issued');
      assert.strictEqual(docRes.data.role, 'DOCTOR');
      assert.strictEqual(docRes.data.userType, 'STAFF');
      assert.strictEqual(docRes.data.tokenType, 'Bearer');
      doctorToken = docRes.data.token;

      // Test Manager Login
      const mgrRes = await api.post('/auth/login', {
        username: 'manager@pulseos.lk',
        password: 'Password123!',
      });
      assert.strictEqual(mgrRes.status, 200, `Expected 200 OK for Manager login, got ${mgrRes.status}`);
      assert.strictEqual(mgrRes.data.role, 'MANAGER');
      managerToken = mgrRes.data.token;

      // Test Patient Login
      const patRes = await api.post('/auth/login', {
        username: 'patient.sunil@gmail.com',
        password: 'Password123!',
      });
      assert.strictEqual(patRes.status, 200, `Expected 200 OK for Patient login, got ${patRes.status}`);
      assert.strictEqual(patRes.data.role, 'PATIENT');
      patientToken = patRes.data.token;
    }, { id: 'T1-SEC-01', tier: 'Tier 1', module: 'Security' });

    test('T1-SEC-02: Authenticated profile lookup (/auth/me) with Bearer token verifies user claims', async () => {
      assert.ok(doctorToken, 'Doctor token must exist');
      const res = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${doctorToken}` },
      });
      assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
      assert.strictEqual(res.data.role, 'DOCTOR');
      assert.strictEqual(res.data.username, 'doc.kavinda@pulseos.lk');
      assert.strictEqual(res.data.fullName, 'Dr. Kavinda Rathnayaka');
    }, { id: 'T1-SEC-02', tier: 'Tier 1', module: 'Security' });

    test('T1-SEC-03: PayHere mock payment settlement transitions invoice to PAID and records transaction', async () => {
      // First generate a fresh invoice for appointment 2
      const invRes = await api.post('/billing/invoices/generate', {
        patientId: 2,
        appointmentId: 2,
        discountAmount: 0.00,
      });
      assert.strictEqual(invRes.status, 201, 'Invoice generated');
      createdInvoiceId = invRes.data.id;
      assert.strictEqual(invRes.data.status, 'PENDING');

      // Execute mock PayHere settlement
      const payRes = await api.post(`/payments/payhere/mock-success?invoiceId=${createdInvoiceId}`, {});
      assert.strictEqual(payRes.status, 200, `Expected 200 OK, got ${payRes.status}`);
      assert.strictEqual(payRes.data.success, true);
      assert.strictEqual(payRes.data.invoice.status, 'PAID');
      assert.ok(payRes.data.payment.receiptNumber, 'Receipt number generated');
      assert.strictEqual(payRes.data.payment.paymentMethod, 'PAYHERE_MOCK');

      // Verify invoice state in billing API
      const checkRes = await api.get(`/billing/invoices/${createdInvoiceId}`);
      assert.strictEqual(checkRes.status, 200);
      assert.strictEqual(checkRes.data.status, 'PAID', 'Invoice must be persisted as PAID');
    }, { id: 'T1-SEC-03', tier: 'Tier 1', module: 'Billing' });

    test('T1-SEC-04: Booking an appointment records/triggers an asynchronous email notification', async () => {
      const apptPayload = {
        patientId: 1,
        doctorId: 1,
        appointmentDate: '2026-11-20',
        startTime: '10:00:00',
        endTime: '10:15:00',
        symptomsReason: 'Cardiology routine screening follow-up',
      };

      const apptRes = await api.post('/appointments', apptPayload);
      assert.strictEqual(apptRes.status, 201, `Expected 201 Created, got ${apptRes.status}`);
      const apptNumber = apptRes.data.appointmentNumber;

      // Query notifications to verify email was recorded
      const notifRes = await api.get(`/notifications?referenceId=${apptNumber}`);
      assert.strictEqual(notifRes.status, 200, `Expected 200 OK, got ${notifRes.status}`);
      assert.ok(Array.isArray(notifRes.data), 'Notifications must be an array');
      assert.ok(notifRes.data.length >= 1, 'At least 1 notification recorded for appointment');

      const notif = notifRes.data[0];
      assert.strictEqual(notif.eventType, 'APPOINTMENT_CREATED');
      assert.strictEqual(notif.referenceId, apptNumber);
      assert.strictEqual(notif.recipientEmail, 'sunil.perera@gmail.com');
      assert.strictEqual(notif.status, 'SENT');
    }, { id: 'T1-SEC-04', tier: 'Tier 1', module: 'Notification' });

    test('T1-SEC-05: Payment settlement records/triggers a payment receipt email notification', async () => {
      assert.ok(createdInvoiceId, 'Invoice must exist from T1-SEC-03');
      const invoiceRes = await api.get(`/billing/invoices/${createdInvoiceId}`);
      const invNumber = invoiceRes.data.invoiceNumber;

      const notifRes = await api.get(`/notifications?referenceId=${invNumber}`);
      assert.strictEqual(notifRes.status, 200);
      assert.ok(Array.isArray(notifRes.data));
      assert.ok(notifRes.data.length >= 1, 'Payment receipt notification must be recorded');

      const notif = notifRes.data.find(n => n.eventType === 'PAYMENT_COMPLETED');
      assert.ok(notif, 'Must have PAYMENT_COMPLETED notification');
      assert.strictEqual(notif.referenceId, invNumber);
      assert.strictEqual(notif.status, 'SENT');
    }, { id: 'T1-SEC-05', tier: 'Tier 1', module: 'Notification' });

    test('T1-SEC-06: Landing page stats endpoint (/landing/stats) returns live database numbers', async () => {
      const res = await api.get('/landing/stats');
      assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
      assert.ok(typeof res.data.activeDoctorsCount === 'number', 'activeDoctorsCount must be number');
      assert.ok(res.data.activeDoctorsCount >= 1, 'At least 1 active doctor');
      assert.ok(typeof res.data.departmentsCount === 'number', 'departmentsCount must be number');
      assert.ok(typeof res.data.satisfiedPatientsCount === 'number', 'satisfiedPatientsCount must be number');
      assert.ok(typeof res.data.testsAvailableCount === 'number', 'testsAvailableCount must be number');
      assert.ok(Array.isArray(res.data.featuredSpecialties), 'featuredSpecialties must be an array');
      assert.ok(res.data.featuredSpecialties.includes('Cardiology'), 'Must include Cardiology specialty');
    }, { id: 'T1-SEC-06', tier: 'Tier 1', module: 'Landing' });

    test('T1-SEC-07: Role-based appointment calendar queries return distinct views for Patient, Doctor, and Manager', async () => {
      // 1. Patient Calendar View
      const patCal = await api.get('/appointments/calendar?role=PATIENT&patientId=1');
      assert.strictEqual(patCal.status, 200, `Expected 200 OK for Patient calendar, got ${patCal.status}`);
      assert.strictEqual(patCal.data.role, 'PATIENT');
      assert.ok(Array.isArray(patCal.data.appointments), 'Patient must see their appointments');
      assert.ok(Array.isArray(patCal.data.availableSlots), 'Patient must see available booking slots');

      // 2. Doctor Calendar View
      const docCal = await api.get('/appointments/calendar?role=DOCTOR&doctorId=1');
      assert.strictEqual(docCal.status, 200, `Expected 200 OK for Doctor calendar, got ${docCal.status}`);
      assert.strictEqual(docCal.data.role, 'DOCTOR');
      assert.strictEqual(docCal.data.doctorId, 1);
      assert.ok(Array.isArray(docCal.data.schedules), 'Doctor must see their shift schedules');
      assert.ok(Array.isArray(docCal.data.queue), 'Doctor must see clinical patient queue');

      // 3. Manager Calendar View
      const mgrCal = await api.get('/appointments/calendar?role=MANAGER');
      assert.strictEqual(mgrCal.status, 200, `Expected 200 OK for Manager calendar, got ${mgrCal.status}`);
      assert.strictEqual(mgrCal.data.role, 'MANAGER');
      assert.ok(Array.isArray(mgrCal.data.allSchedules), 'Manager sees all hospital schedules');
      assert.ok(Array.isArray(mgrCal.data.doctorLoad), 'Manager sees doctor capacity load');
      assert.ok(typeof mgrCal.data.totalAppointments === 'number');
    }, { id: 'T1-SEC-07', tier: 'Tier 1', module: 'Appointment' });
  }, { tier: 'Tier 1', module: 'Security' });
}
