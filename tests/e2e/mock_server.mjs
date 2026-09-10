import http from 'node:http';
import { URL } from 'node:url';
import { config } from './config.mjs';
import { generatePayHereHash, verifyPayHereWebhookSignature, formatPayHereAmount } from './utils/payhere_crypto.mjs';

/**
 * High-fidelity in-memory REST API server matching Spring Boot 3 contracts
 */
export function createMockServer() {
  // In-memory Database State matching DataSeeder
  const db = {
    persons: [
      { id: 1, nicPassport: '200115609999', firstName: 'Kavinda', lastName: 'Rathnayaka', email: 'it25103999@my.sliit.lk', phoneNumber: '0771239999', address: 'No 12, Kandy Road, Kadawatha', gender: 'MALE', dateOfBirth: '2001-05-14' },
      { id: 2, nicPassport: '200118903819', firstName: 'Dilshan', lastName: 'Somarathna', email: 'it25103819@my.sliit.lk', phoneNumber: '0714563819', address: 'No 84, Galle Road, Moratuwa', gender: 'MALE', dateOfBirth: '2001-08-20' },
      { id: 3, nicPassport: '200114500826', firstName: 'Harshika', lastName: 'Udumullage', email: 'it25100826@my.sliit.lk', phoneNumber: '0767890826', address: 'No 22, High Level Road, Nugegoda', gender: 'FEMALE', dateOfBirth: '2001-03-12' },
      { id: 4, nicPassport: '200216703363', firstName: 'Nethuli', lastName: 'Thilakarathne', email: 'it25103363@my.sliit.lk', phoneNumber: '0702343363', address: 'No 5, Flower Road, Colombo 07', gender: 'FEMALE', dateOfBirth: '2002-09-25' },
      { id: 5, nicPassport: '200117803992', firstName: 'Kesaru', lastName: 'Dhanasinghe', email: 'it25103992@my.sliit.lk', phoneNumber: '0778903992', address: 'No 99, Baseline Road, Colombo 09', gender: 'MALE', dateOfBirth: '2001-11-04' },
      { id: 10, nicPassport: '198520104567', firstName: 'Sunil', lastName: 'Perera', email: 'sunil.perera@gmail.com', phoneNumber: '0772233445', address: '14/2 Temple Road, Malabe', gender: 'MALE', dateOfBirth: '1985-03-15' },
      { id: 11, nicPassport: '199265408912', firstName: 'Chamari', lastName: 'Atapattu', email: 'chamari.a@gmail.com', phoneNumber: '0715566778', address: '88 Lake Drive, Rajagiriya', gender: 'FEMALE', dateOfBirth: '1992-07-22' },
      { id: 12, nicPassport: '201556701234', firstName: 'Dinuk', lastName: 'Fernando', email: 'parents.fernando@gmail.com', phoneNumber: '0768899001', address: '52 Station Road, Kelaniya', gender: 'MALE', dateOfBirth: '2015-11-05' },
    ],
    patients: [
      { id: 1, personId: 10, bloodGroup: 'O_POSITIVE', allergies: 'Penicillin, Sulfa drugs', emergencyContactName: 'Mallika Perera', emergencyContactPhone: '0773344556', triagePriority: 'EMERGENCY', medicalNotes: 'History of angina', isArchived: false, status: 'ACTIVE' },
      { id: 2, personId: 11, bloodGroup: 'A_POSITIVE', allergies: 'None reported', emergencyContactName: 'Sujith Atapattu', emergencyContactPhone: '0716677889', triagePriority: 'ROUTINE', medicalNotes: 'Executive health checkup', isArchived: false, status: 'ACTIVE' },
      { id: 3, personId: 12, bloodGroup: 'B_POSITIVE', allergies: 'Aspirin', emergencyContactName: 'Nirmala Fernando', emergencyContactPhone: '0769900112', triagePriority: 'URGENT', medicalNotes: 'Recurring fever', isArchived: false, status: 'ACTIVE' },
    ],
    doctors: [
      { id: 1, employeeId: 1, firstName: 'Kavinda', lastName: 'Rathnayaka', email: 'it25103999@my.sliit.lk', phoneNumber: '0771239999', licenseNumber: 'SLMC-49120', specialization: 'Cardiology', consultationFee: 2500.00, roomNumber: 'Room 204', isAvailable: true, departmentId: 1 },
    ],
    doctorSchedules: [
      { id: 1, doctorId: 1, dayOfWeek: 'MONDAY', startTime: '09:00:00', endTime: '12:00:00', maxPatients: 12, slotDurationMinutes: 15, isActive: true },
      { id: 2, doctorId: 1, dayOfWeek: 'WEDNESDAY', startTime: '14:00:00', endTime: '17:00:00', maxPatients: 12, slotDurationMinutes: 15, isActive: true },
      { id: 3, doctorId: 1, dayOfWeek: 'FRIDAY', startTime: '09:00:00', endTime: '12:00:00', maxPatients: 12, slotDurationMinutes: 15, isActive: true },
    ],
    appointments: [
      { id: 1, appointmentNumber: 'APT-2026-0001', patientId: 1, doctorId: 1, appointmentDate: '2026-09-14', startTime: '09:00:00', endTime: '09:15:00', status: 'COMPLETED', symptomsReason: 'Severe chest pain, palpitations' },
      { id: 2, appointmentNumber: 'APT-2026-0002', patientId: 2, doctorId: 1, appointmentDate: '2026-09-14', startTime: '09:30:00', endTime: '09:45:00', status: 'CONFIRMED', symptomsReason: 'Follow-up lipid screening' },
      { id: 3, appointmentNumber: 'APT-2026-0003', patientId: 3, doctorId: 1, appointmentDate: '2026-09-16', startTime: '14:00:00', endTime: '14:15:00', status: 'SCHEDULED', symptomsReason: 'Pediatric cardiac murmur' },
    ],
    drugs: [
      { id: 1, itemCode: 'MED-001', genericName: 'Atorvastatin', brandName: 'Lipitor', category: 'CARDIOVASCULAR', dosageForm: 'TABLET', strength: '20mg', unitPrice: 45.00, stockQuantity: 250, reorderLevel: 50, expiryDate: '2027-12-31', batchNumber: 'BAT-AT-2024', manufacturer: 'Pfizer Lanka' },
      { id: 2, itemCode: 'MED-002', genericName: 'Clopidogrel', brandName: 'Plavix', category: 'CARDIOVASCULAR', dosageForm: 'TABLET', strength: '75mg', unitPrice: 60.00, stockQuantity: 180, reorderLevel: 40, expiryDate: '2027-08-30', batchNumber: 'BAT-CL-889', manufacturer: 'Sanofi' },
      { id: 3, itemCode: 'MED-003', genericName: 'Amoxicillin + Clavulanate', brandName: 'Augmentin', category: 'ANTIBIOTIC', dosageForm: 'TABLET', strength: '625mg', unitPrice: 120.00, stockQuantity: 15, reorderLevel: 30, expiryDate: '2026-11-15', batchNumber: 'BAT-AG-441', manufacturer: 'GSK Pharmaceuticals' },
      { id: 4, itemCode: 'MED-004', genericName: 'Metformin HCl', brandName: 'Glucophage', category: 'ANTIDIABETIC', dosageForm: 'TABLET', strength: '500mg', unitPrice: 18.00, stockQuantity: 600, reorderLevel: 100, expiryDate: '2028-05-30', batchNumber: 'BAT-MF-102', manufacturer: 'Merck Serono' },
      { id: 5, itemCode: 'MED-005', genericName: 'Paracetamol', brandName: 'Panadol', category: 'ANALGESIC', dosageForm: 'TABLET', strength: '500mg', unitPrice: 6.50, stockQuantity: 1500, reorderLevel: 200, expiryDate: '2028-01-31', batchNumber: 'BAT-PC-991', manufacturer: 'GSK Consumer' },
      { id: 6, itemCode: 'MED-006', genericName: 'Salbutamol Inhaler', brandName: 'Ventolin', category: 'RESPIRATORY', dosageForm: 'INHALER', strength: '100mcg', unitPrice: 850.00, stockQuantity: 8, reorderLevel: 20, expiryDate: '2026-10-31', batchNumber: 'BAT-VT-009', manufacturer: 'GSK Pharmaceuticals' },
      { id: 7, itemCode: 'MED-007', genericName: 'Omeprazole', brandName: 'Losec', category: 'GASTROINTESTINAL', dosageForm: 'CAPSULE', strength: '20mg', unitPrice: 25.00, stockQuantity: 400, reorderLevel: 50, expiryDate: '2027-04-15', batchNumber: 'BAT-OM-332', manufacturer: 'AstraZeneca' },
      { id: 99, itemCode: 'MED-999', genericName: 'Expired Amoxicillin', brandName: 'Exp-Amox', category: 'ANTIBIOTIC', dosageForm: 'TABLET', strength: '250mg', unitPrice: 30.00, stockQuantity: 100, reorderLevel: 20, expiryDate: '2025-01-01', batchNumber: 'BAT-EXP-001', manufacturer: 'Generic' },
    ],
    prescriptions: [
      {
        id: 1,
        prescriptionNumber: 'RX-2026-0001',
        appointmentId: 1,
        patientId: 1,
        doctorId: 1,
        issuedDate: '2026-09-14',
        status: 'DISPENSED',
        notes: 'Take Atorvastatin after dinner. Clopidogrel in morning.',
        items: [
          { id: 1, drugId: 1, dosage: '1 tab', frequency: 'OD', durationDays: 30, prescribedQuantity: 30, dispensedQuantity: 30, isDispensed: true },
          { id: 2, drugId: 2, dosage: '1 tab', frequency: 'OD', durationDays: 30, prescribedQuantity: 30, dispensedQuantity: 30, isDispensed: true },
        ],
      },
    ],
    labTests: [
      { id: 1, testCode: 'LAB-001', testName: 'Lipid Profile Full Panel', category: 'BIOCHEMISTRY', price: 2400.00, sampleType: 'SERUM', normalRangeMin: 125.00, normalRangeMax: 200.00, measurementUnit: 'mg/dL' },
      { id: 2, testCode: 'LAB-002', testName: 'High-Sensitivity Troponin-I', category: 'CARDIAC', price: 3200.00, sampleType: 'SERUM', normalRangeMin: 0.00, normalRangeMax: 0.04, measurementUnit: 'ng/mL' },
      { id: 3, testCode: 'LAB-003', testName: 'Complete Blood Count (CBC)', category: 'HEMATOLOGY', price: 1200.00, sampleType: 'WHOLE_BLOOD', normalRangeMin: 4.00, normalRangeMax: 11.00, measurementUnit: '10^3/uL' },
      { id: 4, testCode: 'LAB-004', testName: 'Fasting Blood Sugar (FBS)', category: 'BIOCHEMISTRY', price: 650.00, sampleType: 'SERUM', normalRangeMin: 70.00, normalRangeMax: 100.00, measurementUnit: 'mg/dL' },
      { id: 5, testCode: 'LAB-005', testName: 'Serum Creatinine & eGFR', category: 'RENAL', price: 950.00, sampleType: 'SERUM', normalRangeMin: 0.70, normalRangeMax: 1.30, measurementUnit: 'mg/dL' },
    ],
    labRequests: [
      { id: 1, requestNumber: 'LR-2026-0001', appointmentId: 1, patientId: 1, doctorId: 1, labTestId: 2, urgency: 'STAT/URGENT', status: 'COMPLETED', resultValue: 0.02, flag: 'NORMAL', referenceRange: '0.00 - 0.04', unit: 'ng/mL', remarks: 'Troponin-I within normal limits' },
      { id: 2, requestNumber: 'LR-2026-0002', appointmentId: 1, patientId: 1, doctorId: 1, labTestId: 1, urgency: 'ROUTINE', status: 'COMPLETED', resultValue: 235.00, flag: 'HIGH', referenceRange: '125.00 - 200.00', unit: 'mg/dL', remarks: 'Elevated total serum cholesterol' },
      { id: 3, requestNumber: 'LR-2026-0003', appointmentId: 2, patientId: 2, doctorId: 1, labTestId: 1, urgency: 'ROUTINE', status: 'SAMPLE_COLLECTED' },
    ],
    invoices: [
      {
        id: 1,
        invoiceNumber: 'INV-2026-0001',
        patientId: 1,
        appointmentId: 1,
        doctorFee: 2500.00,
        pharmacyFee: 3150.00,
        labFee: 5600.00,
        totalAmount: 11250.00,
        discountAmount: 250.00,
        netAmount: 11000.00,
        status: 'PAID',
        items: [
          { type: 'CONSULTATION', description: 'Specialist Cardiology Consultation', quantity: 1, unitPrice: 2500.00, subtotal: 2500.00 },
          { type: 'PHARMACY', description: 'Atorvastatin 20mg Tablet (30)', quantity: 30, unitPrice: 45.00, subtotal: 1350.00 },
          { type: 'PHARMACY', description: 'Clopidogrel 75mg Tablet (30)', quantity: 30, unitPrice: 60.00, subtotal: 1800.00 },
          { type: 'LAB_TEST', description: 'High-Sensitivity Troponin-I STAT Assay', quantity: 1, unitPrice: 3200.00, subtotal: 3200.00 },
          { type: 'LAB_TEST', description: 'Lipid Profile Full Panel', quantity: 1, unitPrice: 2400.00, subtotal: 2400.00 },
        ],
      },
      {
        id: 2,
        invoiceNumber: 'INV-2026-0002',
        patientId: 2,
        appointmentId: 2,
        doctorFee: 2500.00,
        pharmacyFee: 0.00,
        labFee: 2400.00,
        totalAmount: 4900.00,
        discountAmount: 0.00,
        netAmount: 4900.00,
        status: 'PENDING',
        items: [
          { type: 'CONSULTATION', description: 'Cardiology Consultation', quantity: 1, unitPrice: 2500.00, subtotal: 2500.00 },
          { type: 'LAB_TEST', description: 'Lipid Profile Full Panel', quantity: 1, unitPrice: 2400.00, subtotal: 2400.00 },
        ],
      },
    ],
    payments: [
      { id: 1, transactionReference: 'TXN-PH-99201', invoiceId: 1, paymentMethod: 'PAYHERE_GATEWAY', amountPaid: 11000.00, currency: 'LKR', status: 'SUCCESS', receiptNumber: 'REC-2026-0001' },
    ],
  };

  // Helper functions
  function getPatientFull(pat) {
    const person = db.persons.find(p => p.id === pat.personId) || {};
    return { ...person, ...pat, patientId: pat.id };
  }

  function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    });
    res.end(JSON.stringify(data));
  }

  function sendText(res, statusCode, text) {
    res.writeHead(statusCode, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(text);
  }

  function parseBody(req) {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        if (!body) return resolve({});
        const contentType = req.headers['content-type'] || '';
        if (contentType.includes('application/x-www-form-urlencoded')) {
          const params = new URLSearchParams(body);
          const obj = {};
          for (const [k, v] of params.entries()) {
            obj[k] = v;
          }
          return resolve(obj);
        }
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve({});
        }
      });
    });
  }

  const server = http.createServer(async (req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      });
      return res.end();
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname.replace(/\/+$/, '');
    const method = req.method.toUpperCase();

    // Health check endpoint
    if (pathname === '/api/v1/health' || pathname === '/health') {
      return sendJson(res, 200, { status: 'UP', service: 'PulseOS Mock Backend', profile: 'demo' });
    }

    // ------------------------------------------------------------------------
    // M1: PATIENT MANAGEMENT (/api/v1/patients)
    // ------------------------------------------------------------------------
    if (pathname === '/api/v1/patients' && method === 'GET') {
      const triage = parsedUrl.searchParams.get('triagePriority');
      const search = parsedUrl.searchParams.get('search');
      let result = db.patients.map(getPatientFull);
      if (triage) {
        result = result.filter(p => p.triagePriority === triage);
      }
      if (search) {
        const s = search.toLowerCase();
        result = result.filter(p => (p.firstName || '').toLowerCase().includes(s) || (p.lastName || '').toLowerCase().includes(s) || (p.nicPassport || '').toLowerCase().includes(s));
      }
      return sendJson(res, 200, result);
    }

    if (pathname === '/api/v1/patients' && method === 'POST') {
      const body = await parseBody(req);
      if (!body.nicPassport || !body.firstName || !body.lastName) {
        return sendJson(res, 400, { error: 'Validation Failed', message: 'Mandatory fields missing' });
      }
      if (body.dateOfBirth && new Date(body.dateOfBirth) > new Date()) {
        return sendJson(res, 400, { error: 'Validation Failed', message: 'Date of birth cannot be in the future' });
      }
      // Duplicate NIC check
      const existingPerson = db.persons.find(p => p.nicPassport === body.nicPassport);
      if (existingPerson) {
        return sendJson(res, 409, { error: 'Duplicate NIC', message: `Patient with NIC ${body.nicPassport} already exists` });
      }

      const personId = Math.max(...db.persons.map(p => p.id), 0) + 1;
      const newPerson = {
        id: personId,
        nicPassport: body.nicPassport,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email || '',
        phoneNumber: body.phoneNumber || '',
        address: body.address || '',
        gender: body.gender || 'OTHER',
        dateOfBirth: body.dateOfBirth || '2000-01-01',
      };
      db.persons.push(newPerson);

      const patId = Math.max(...db.patients.map(p => p.id), 0) + 1;
      const newPatient = {
        id: patId,
        personId,
        bloodGroup: body.bloodGroup || 'UNKNOWN',
        allergies: body.allergies || 'None',
        emergencyContactName: body.emergencyContactName || 'N/A',
        emergencyContactPhone: body.emergencyContactPhone || 'N/A',
        triagePriority: body.triagePriority || 'ROUTINE',
        medicalNotes: body.medicalNotes || '',
        isArchived: false,
        status: 'ACTIVE',
      };
      db.patients.push(newPatient);

      return sendJson(res, 201, getPatientFull(newPatient));
    }

    const patientNicMatch = pathname.match(/^\/api\/v1\/patients\/nic\/([^/]+)$/);
    if (patientNicMatch && method === 'GET') {
      const nic = decodeURIComponent(patientNicMatch[1]);
      const person = db.persons.find(p => p.nicPassport === nic);
      if (!person) return sendJson(res, 404, { error: 'Not Found', message: `Patient with NIC ${nic} not found` });
      const pat = db.patients.find(p => p.personId === person.id);
      if (!pat) return sendJson(res, 404, { error: 'Not Found', message: 'Patient profile not linked' });
      return sendJson(res, 200, getPatientFull(pat));
    }

    const patientIdMatch = pathname.match(/^\/api\/v1\/patients\/(\d+)$/);
    if (patientIdMatch) {
      const id = parseInt(patientIdMatch[1], 10);
      const pat = db.patients.find(p => p.id === id);
      if (!pat) return sendJson(res, 404, { error: 'Not Found', message: `Patient with ID ${id} not found` });

      if (method === 'GET') {
        return sendJson(res, 200, getPatientFull(pat));
      }
      if (method === 'PUT') {
        const body = await parseBody(req);
        const person = db.persons.find(p => p.id === pat.personId);
        if (person) {
          if (body.firstName) person.firstName = body.firstName;
          if (body.lastName) person.lastName = body.lastName;
          if (body.phoneNumber) person.phoneNumber = body.phoneNumber;
          if (body.address) person.address = body.address;
        }
        if (body.allergies !== undefined) pat.allergies = body.allergies;
        if (body.triagePriority) pat.triagePriority = body.triagePriority;
        if (body.emergencyContactName) pat.emergencyContactName = body.emergencyContactName;
        return sendJson(res, 200, getPatientFull(pat));
      }
    }

    const patientArchiveMatch = pathname.match(/^\/api\/v1\/patients\/(\d+)\/archive$/);
    if (patientArchiveMatch && method === 'PATCH') {
      const id = parseInt(patientArchiveMatch[1], 10);
      const pat = db.patients.find(p => p.id === id);
      if (!pat) return sendJson(res, 404, { error: 'Not Found', message: 'Patient not found' });
      pat.isArchived = true;
      pat.status = 'ARCHIVED';
      return sendJson(res, 200, getPatientFull(pat));
    }

    const patientRestoreMatch = pathname.match(/^\/api\/v1\/patients\/(\d+)\/restore$/);
    if (patientRestoreMatch && method === 'PATCH') {
      const id = parseInt(patientRestoreMatch[1], 10);
      const pat = db.patients.find(p => p.id === id);
      if (!pat) return sendJson(res, 404, { error: 'Not Found', message: 'Patient not found' });
      pat.isArchived = false;
      pat.status = 'ACTIVE';
      return sendJson(res, 200, getPatientFull(pat));
    }

    // ------------------------------------------------------------------------
    // M2: DOCTOR MANAGEMENT (/api/v1/doctors)
    // ------------------------------------------------------------------------
    if (pathname === '/api/v1/doctors' && method === 'GET') {
      const spec = parsedUrl.searchParams.get('specialization');
      let docs = [...db.doctors];
      if (spec) docs = docs.filter(d => d.specialization.toLowerCase() === spec.toLowerCase());
      return sendJson(res, 200, docs);
    }

    if (pathname === '/api/v1/doctors' && method === 'POST') {
      const body = await parseBody(req);
      if (!body.licenseNumber || !body.specialization || !body.firstName) {
        return sendJson(res, 400, { error: 'Validation Error', message: 'Required doctor fields missing' });
      }
      if (db.doctors.some(d => d.licenseNumber === body.licenseNumber)) {
        return sendJson(res, 409, { error: 'Duplicate License', message: 'Medical license already registered' });
      }
      if (body.consultationFee !== undefined && body.consultationFee < 0) {
        return sendJson(res, 400, { error: 'Invalid Fee', message: 'Consultation fee cannot be negative' });
      }
      const docId = Math.max(...db.doctors.map(d => d.id), 0) + 1;
      const newDoc = {
        id: docId,
        employeeId: docId,
        firstName: body.firstName,
        lastName: body.lastName || '',
        email: body.email || 'doc@pulseos.lk',
        phoneNumber: body.phoneNumber || '0770000000',
        licenseNumber: body.licenseNumber,
        specialization: body.specialization,
        consultationFee: body.consultationFee !== undefined ? parseFloat(body.consultationFee) : 2000.00,
        roomNumber: body.roomNumber || 'Room 101',
        isAvailable: body.isAvailable !== undefined ? body.isAvailable : true,
        departmentId: body.departmentId || 1,
      };
      db.doctors.push(newDoc);
      return sendJson(res, 201, newDoc);
    }

    const doctorIdMatch = pathname.match(/^\/api\/v1\/doctors\/(\d+)$/);
    if (doctorIdMatch) {
      const id = parseInt(doctorIdMatch[1], 10);
      const doc = db.doctors.find(d => d.id === id);
      if (!doc) return sendJson(res, 404, { error: 'Not Found', message: `Doctor ${id} not found` });
      if (method === 'GET') return sendJson(res, 200, doc);
    }

    const doctorFeeMatch = pathname.match(/^\/api\/v1\/doctors\/(\d+)\/fee$/);
    if (doctorFeeMatch && method === 'PATCH') {
      const id = parseInt(doctorFeeMatch[1], 10);
      const doc = db.doctors.find(d => d.id === id);
      if (!doc) return sendJson(res, 404, { error: 'Not Found', message: 'Doctor not found' });
      const body = await parseBody(req);
      if (body.consultationFee === undefined || body.consultationFee < 0) {
        return sendJson(res, 400, { error: 'Invalid Fee', message: 'Consultation fee must be non-negative' });
      }
      doc.consultationFee = parseFloat(body.consultationFee);
      return sendJson(res, 200, doc);
    }

    const doctorAvailMatch = pathname.match(/^\/api\/v1\/doctors\/(\d+)\/availability$/);
    if (doctorAvailMatch && method === 'PATCH') {
      const id = parseInt(doctorAvailMatch[1], 10);
      const doc = db.doctors.find(d => d.id === id);
      if (!doc) return sendJson(res, 404, { error: 'Not Found', message: 'Doctor not found' });
      const body = await parseBody(req);
      doc.isAvailable = Boolean(body.isAvailable);
      return sendJson(res, 200, doc);
    }

    const doctorSchedulesMatch = pathname.match(/^\/api\/v1\/doctors\/(\d+)\/schedules$/);
    if (doctorSchedulesMatch) {
      const id = parseInt(doctorSchedulesMatch[1], 10);
      if (method === 'GET') {
        const schedules = db.doctorSchedules.filter(s => s.doctorId === id);
        return sendJson(res, 200, schedules);
      }
      if (method === 'POST') {
        const body = await parseBody(req);
        if (!body.dayOfWeek || !body.startTime || !body.endTime) {
          return sendJson(res, 400, { error: 'Validation Error', message: 'Missing schedule time parameters' });
        }
        if (body.endTime <= body.startTime) {
          return sendJson(res, 400, { error: 'Invalid Time', message: 'End time must be after start time' });
        }
        if (body.slotDurationMinutes !== undefined && body.slotDurationMinutes <= 0) {
          return sendJson(res, 400, { error: 'Invalid Duration', message: 'Slot duration must be positive' });
        }
        const schedId = Math.max(...db.doctorSchedules.map(s => s.id), 0) + 1;
        const newSched = {
          id: schedId,
          doctorId: id,
          dayOfWeek: body.dayOfWeek,
          startTime: body.startTime,
          endTime: body.endTime,
          maxPatients: body.maxPatients || 15,
          slotDurationMinutes: body.slotDurationMinutes || 15,
          isActive: true,
        };
        db.doctorSchedules.push(newSched);
        return sendJson(res, 201, newSched);
      }
    }

    // ------------------------------------------------------------------------
    // M3: APPOINTMENT MANAGEMENT (/api/v1/appointments)
    // ------------------------------------------------------------------------
    if (pathname === '/api/v1/appointments' && method === 'GET') {
      const doctorId = parsedUrl.searchParams.get('doctorId');
      const patientId = parsedUrl.searchParams.get('patientId');
      const date = parsedUrl.searchParams.get('date');
      let appts = [...db.appointments];
      if (doctorId) appts = appts.filter(a => a.doctorId === parseInt(doctorId, 10));
      if (patientId) appts = appts.filter(a => a.patientId === parseInt(patientId, 10));
      if (date) appts = appts.filter(a => a.appointmentDate === date);
      return sendJson(res, 200, appts);
    }

    if (pathname === '/api/v1/appointments' && method === 'POST') {
      const body = await parseBody(req);
      if (!body.patientId || !body.doctorId || !body.appointmentDate || !body.startTime) {
        return sendJson(res, 400, { error: 'Validation Error', message: 'Required appointment fields missing' });
      }

      // Check patient existence & archive status
      const patient = db.patients.find(p => p.id === body.patientId);
      if (!patient) return sendJson(res, 404, { error: 'Not Found', message: 'Patient does not exist' });
      if (patient.isArchived) {
        return sendJson(res, 400, { error: 'Archived Patient', message: 'Cannot book appointment for archived patient' });
      }

      // Check doctor existence & availability
      const doctor = db.doctors.find(d => d.id === body.doctorId);
      if (!doctor) return sendJson(res, 404, { error: 'Not Found', message: 'Doctor does not exist' });
      if (!doctor.isAvailable) {
        return sendJson(res, 400, { error: 'Doctor Unavailable', message: 'Doctor is currently off-duty/unavailable' });
      }

      // Double-Booking Guard: Same doctor, same date, same start time, active status
      const conflict = db.appointments.find(a =>
        a.doctorId === body.doctorId &&
        a.appointmentDate === body.appointmentDate &&
        a.startTime === body.startTime &&
        a.status !== 'CANCELLED'
      );
      if (conflict) {
        return sendJson(res, 409, {
          error: 'Double-Booking Conflict',
          message: 'Doctor is already scheduled for another consultation at this slot',
        });
      }

      const apptId = Math.max(...db.appointments.map(a => a.id), 0) + 1;
      const newAppt = {
        id: apptId,
        appointmentNumber: `APT-2026-${String(apptId).padStart(4, '0')}`,
        patientId: body.patientId,
        doctorId: body.doctorId,
        appointmentDate: body.appointmentDate,
        startTime: body.startTime,
        endTime: body.endTime || '09:15:00',
        status: 'SCHEDULED',
        symptomsReason: body.symptomsReason || 'Consultation',
      };
      db.appointments.push(newAppt);
      return sendJson(res, 201, newAppt);
    }

    const apptIdMatch = pathname.match(/^\/api\/v1\/appointments\/(\d+)$/);
    if (apptIdMatch) {
      const id = parseInt(apptIdMatch[1], 10);
      const appt = db.appointments.find(a => a.id === id);
      if (!appt) return sendJson(res, 404, { error: 'Not Found', message: 'Appointment not found' });
      if (method === 'GET') return sendJson(res, 200, appt);
      if (method === 'DELETE') {
        appt.status = 'CANCELLED';
        return sendJson(res, 200, { message: 'Appointment cancelled successfully', appointment: appt });
      }
    }

    const apptRescheduleMatch = pathname.match(/^\/api\/v1\/appointments\/(\d+)\/reschedule$/);
    if (apptRescheduleMatch && method === 'PUT') {
      const id = parseInt(apptRescheduleMatch[1], 10);
      const appt = db.appointments.find(a => a.id === id);
      if (!appt) return sendJson(res, 404, { error: 'Not Found', message: 'Appointment not found' });
      const body = await parseBody(req);
      if (!body.appointmentDate || !body.startTime) {
        return sendJson(res, 400, { error: 'Validation Error', message: 'Date and start time required' });
      }

      // Check conflict
      const conflict = db.appointments.find(a =>
        a.id !== id &&
        a.doctorId === appt.doctorId &&
        a.appointmentDate === body.appointmentDate &&
        a.startTime === body.startTime &&
        a.status !== 'CANCELLED'
      );
      if (conflict) {
        return sendJson(res, 409, { error: 'Conflict', message: 'Slot already booked by another appointment' });
      }

      appt.appointmentDate = body.appointmentDate;
      appt.startTime = body.startTime;
      if (body.endTime) appt.endTime = body.endTime;
      return sendJson(res, 200, appt);
    }

    const apptStatusMatch = pathname.match(/^\/api\/v1\/appointments\/(\d+)\/status$/);
    if (apptStatusMatch && method === 'PATCH') {
      const id = parseInt(apptStatusMatch[1], 10);
      const appt = db.appointments.find(a => a.id === id);
      if (!appt) return sendJson(res, 404, { error: 'Not Found', message: 'Appointment not found' });
      const body = await parseBody(req);
      if (!body.status) return sendJson(res, 400, { error: 'Missing Status' });

      // Invariant: Cancelled cannot move to Completed
      if (appt.status === 'CANCELLED' && body.status === 'COMPLETED') {
        return sendJson(res, 400, { error: 'Invalid Transition', message: 'Cancelled appointment cannot be completed' });
      }

      appt.status = body.status;
      return sendJson(res, 200, appt);
    }

    // ------------------------------------------------------------------------
    // M4: PHARMACY & INVENTORY (/api/v1/pharmacy & /api/v1/prescriptions)
    // ------------------------------------------------------------------------
    if (pathname === '/api/v1/pharmacy/drugs' && method === 'GET') {
      const category = parsedUrl.searchParams.get('category');
      const lowStock = parsedUrl.searchParams.get('lowStock');
      let drugs = [...db.drugs];
      if (category) drugs = drugs.filter(d => d.category.toLowerCase() === category.toLowerCase());
      if (lowStock === 'true') drugs = drugs.filter(d => d.stockQuantity <= d.reorderLevel);
      return sendJson(res, 200, drugs);
    }

    if (pathname === '/api/v1/pharmacy/drugs/low-stock' && method === 'GET') {
      const low = db.drugs.filter(d => d.stockQuantity <= d.reorderLevel);
      return sendJson(res, 200, low);
    }

    if (pathname === '/api/v1/pharmacy/drugs/expired' && method === 'GET') {
      const today = new Date().toISOString().slice(0, 10);
      const exp = db.drugs.filter(d => d.expiryDate < today);
      return sendJson(res, 200, exp);
    }

    if (pathname === '/api/v1/pharmacy/drugs' && method === 'POST') {
      const body = await parseBody(req);
      if (!body.itemCode || !body.genericName || body.unitPrice === undefined || body.stockQuantity === undefined) {
        return sendJson(res, 400, { error: 'Validation Error', message: 'Required drug parameters missing' });
      }
      if (body.unitPrice < 0 || body.stockQuantity < 0) {
        return sendJson(res, 400, { error: 'Invalid Values', message: 'Price and stock quantity must be non-negative' });
      }
      if (db.drugs.some(d => d.itemCode === body.itemCode)) {
        return sendJson(res, 409, { error: 'Duplicate Item Code', message: 'Drug item code already exists' });
      }

      const drugId = Math.max(...db.drugs.map(d => d.id), 0) + 1;
      const newDrug = {
        id: drugId,
        itemCode: body.itemCode,
        genericName: body.genericName,
        brandName: body.brandName || body.genericName,
        category: body.category || 'GENERAL',
        dosageForm: body.dosageForm || 'TABLET',
        strength: body.strength || '500mg',
        unitPrice: parseFloat(body.unitPrice),
        stockQuantity: parseInt(body.stockQuantity, 10),
        reorderLevel: body.reorderLevel ? parseInt(body.reorderLevel, 10) : 50,
        expiryDate: body.expiryDate || '2028-12-31',
        batchNumber: body.batchNumber || 'BAT-DEFAULT',
        manufacturer: body.manufacturer || 'Standard Pharma',
      };
      db.drugs.push(newDrug);
      return sendJson(res, 201, newDrug);
    }

    const drugIdMatch = pathname.match(/^\/api\/v1\/pharmacy\/drugs\/(\d+)$/);
    if (drugIdMatch) {
      const id = parseInt(drugIdMatch[1], 10);
      const drug = db.drugs.find(d => d.id === id);
      if (!drug) return sendJson(res, 404, { error: 'Not Found', message: 'Drug not found' });
      if (method === 'GET') return sendJson(res, 200, drug);
      if (method === 'PUT') {
        const body = await parseBody(req);
        if (body.stockQuantity !== undefined) drug.stockQuantity = parseInt(body.stockQuantity, 10);
        if (body.unitPrice !== undefined) drug.unitPrice = parseFloat(body.unitPrice);
        return sendJson(res, 200, drug);
      }
    }

    // Prescriptions
    if (pathname === '/api/v1/prescriptions' && method === 'GET') {
      return sendJson(res, 200, db.prescriptions);
    }

    if (pathname === '/api/v1/prescriptions' && method === 'POST') {
      const body = await parseBody(req);
      if (!body.patientId || !body.doctorId || !body.items || !body.items.length) {
        return sendJson(res, 400, { error: 'Validation Error', message: 'Prescription must have patient, doctor, and items' });
      }

      const prescId = Math.max(...db.prescriptions.map(p => p.id), 0) + 1;
      const newPresc = {
        id: prescId,
        prescriptionNumber: `RX-2026-${String(prescId).padStart(4, '0')}`,
        appointmentId: body.appointmentId || null,
        patientId: body.patientId,
        doctorId: body.doctorId,
        issuedDate: new Date().toISOString().slice(0, 10),
        status: 'PENDING',
        notes: body.notes || '',
        items: body.items.map((it, idx) => ({
          id: idx + 1,
          drugId: it.drugId,
          dosage: it.dosage || '1 tab',
          frequency: it.frequency || 'OD',
          durationDays: it.durationDays || 30,
          prescribedQuantity: it.prescribedQuantity,
          dispensedQuantity: 0,
          isDispensed: false,
        })),
      };
      db.prescriptions.push(newPresc);
      return sendJson(res, 201, newPresc);
    }

    const prescIdMatch = pathname.match(/^\/api\/v1\/prescriptions\/(\d+)$/);
    if (prescIdMatch && method === 'GET') {
      const id = parseInt(prescIdMatch[1], 10);
      const presc = db.prescriptions.find(p => p.id === id);
      if (!presc) return sendJson(res, 404, { error: 'Not Found', message: 'Prescription not found' });
      return sendJson(res, 200, presc);
    }

    // Dispensing endpoint
    const dispenseMatch = pathname.match(/^\/api\/v1\/pharmacy\/dispense\/(\d+)$/);
    if (dispenseMatch && method === 'POST') {
      const prescId = parseInt(dispenseMatch[1], 10);
      const presc = db.prescriptions.find(p => p.id === prescId);
      if (!presc) return sendJson(res, 404, { error: 'Not Found', message: 'Prescription not found' });
      if (presc.status === 'DISPENSED') {
        return sendJson(res, 400, { error: 'Already Dispensed', message: 'Prescription already fulfilled' });
      }

      const today = new Date().toISOString().slice(0, 10);

      // Validate all items before deducting
      for (const item of presc.items) {
        const drug = db.drugs.find(d => d.id === item.drugId);
        if (!drug) return sendJson(res, 400, { error: 'Invalid Drug', message: `Drug ${item.drugId} does not exist` });

        // Check expiry date
        if (drug.expiryDate < today) {
          return sendJson(res, 400, {
            error: 'Expired Medication',
            message: `Cannot dispense expired drug batch: ${drug.genericName} expired on ${drug.expiryDate}`,
          });
        }

        // Check stock
        if (drug.stockQuantity < item.prescribedQuantity) {
          return sendJson(res, 400, {
            error: 'Insufficient Stock',
            message: `Insufficient stock for ${drug.genericName}. Available: ${drug.stockQuantity}, Requested: ${item.prescribedQuantity}`,
          });
        }
      }

      // Deduct atomically
      for (const item of presc.items) {
        const drug = db.drugs.find(d => d.id === item.drugId);
        drug.stockQuantity -= item.prescribedQuantity;
        item.dispensedQuantity = item.prescribedQuantity;
        item.isDispensed = true;
      }

      presc.status = 'DISPENSED';
      return sendJson(res, 200, {
        message: 'Prescription successfully dispensed',
        prescription: presc,
      });
    }

    // ------------------------------------------------------------------------
    // M5: BILLING, INVOICES & PAYHERE (/api/v1/billing & /api/v1/payments)
    // ------------------------------------------------------------------------
    if (pathname === '/api/v1/billing/invoices' && method === 'GET') {
      return sendJson(res, 200, db.invoices);
    }

    const invoiceIdMatch = pathname.match(/^\/api\/v1\/billing\/invoices\/(\d+)$/);
    if (invoiceIdMatch && method === 'GET') {
      const id = parseInt(invoiceIdMatch[1], 10);
      const inv = db.invoices.find(i => i.id === id);
      if (!inv) return sendJson(res, 404, { error: 'Not Found', message: 'Invoice not found' });
      return sendJson(res, 200, inv);
    }

    // Automated Invoice Generation
    if (pathname === '/api/v1/billing/invoices/generate' && method === 'POST') {
      const body = await parseBody(req);
      if (!body.patientId || !body.appointmentId) {
        return sendJson(res, 400, { error: 'Validation Error', message: 'Patient and Appointment IDs required' });
      }

      const appointment = db.appointments.find(a => a.id === body.appointmentId);
      if (!appointment) return sendJson(res, 404, { error: 'Not Found', message: 'Appointment not found' });

      const doctor = db.doctors.find(d => d.id === appointment.doctorId);
      const doctorFee = doctor ? doctor.consultationFee : 0.00;

      // Sum dispensed pharmacy drugs for appointment
      let pharmacyFee = 0.00;
      const invoiceItems = [
        { type: 'CONSULTATION', description: `Consultation - Dr. ${doctor ? doctor.firstName : ''}`, quantity: 1, unitPrice: doctorFee, subtotal: doctorFee },
      ];

      const prescs = db.prescriptions.filter(p => p.appointmentId === appointment.id);
      for (const p of prescs) {
        for (const item of p.items) {
          const drug = db.drugs.find(d => d.id === item.drugId);
          if (drug) {
            const qty = item.isDispensed ? item.dispensedQuantity : item.prescribedQuantity;
            const sub = qty * drug.unitPrice;
            pharmacyFee += sub;
            invoiceItems.push({
              type: 'PHARMACY',
              description: `${drug.genericName} (${qty} units)`,
              quantity: qty,
              unitPrice: drug.unitPrice,
              subtotal: sub,
            });
          }
        }
      }

      // Sum lab tests for appointment
      let labFee = 0.00;
      const labs = db.labRequests.filter(l => l.appointmentId === appointment.id);
      for (const l of labs) {
        const testCatalog = db.labTests.find(t => t.id === l.labTestId);
        if (testCatalog) {
          labFee += testCatalog.price;
          invoiceItems.push({
            type: 'LAB_TEST',
            description: `${testCatalog.testName} (${l.urgency})`,
            quantity: 1,
            unitPrice: testCatalog.price,
            subtotal: testCatalog.price,
          });
        }
      }

      const totalAmount = doctorFee + pharmacyFee + labFee;
      const discountAmount = body.discountAmount ? parseFloat(body.discountAmount) : 0.00;
      const netAmount = Math.max(0, totalAmount - discountAmount);

      const invId = Math.max(...db.invoices.map(i => i.id), 0) + 1;
      const newInv = {
        id: invId,
        invoiceNumber: `INV-2026-${String(invId).padStart(4, '0')}`,
        patientId: body.patientId,
        appointmentId: body.appointmentId,
        doctorFee,
        pharmacyFee,
        labFee,
        totalAmount,
        discountAmount,
        netAmount,
        status: 'PENDING',
        items: invoiceItems,
      };
      db.invoices.push(newInv);
      return sendJson(res, 201, newInv);
    }

    // PayHere Initiation Hash Endpoint
    if (pathname === '/api/v1/payments/payhere/initiate' && method === 'GET') {
      const invoiceId = parseInt(parsedUrl.searchParams.get('invoiceId'), 10);
      const inv = db.invoices.find(i => i.id === invoiceId);
      if (!inv) return sendJson(res, 404, { error: 'Not Found', message: 'Invoice not found' });

      const patient = getPatientFull(db.patients.find(p => p.id === inv.patientId) || {});
      const formattedAmount = formatPayHereAmount(inv.netAmount);
      const hash = generatePayHereHash(
        config.payhere.merchantId,
        inv.invoiceNumber,
        formattedAmount,
        config.payhere.currency,
        config.payhere.merchantSecret
      );

      return sendJson(res, 200, {
        merchantId: config.payhere.merchantId,
        orderId: inv.invoiceNumber,
        amount: formattedAmount,
        currency: config.payhere.currency,
        hash,
        notifyUrl: config.payhere.notifyUrl,
        patientFirstName: patient.firstName || 'Patient',
        patientLastName: patient.lastName || 'User',
        patientEmail: patient.email || 'patient@pulseos.lk',
        patientPhone: patient.phoneNumber || '0771234567',
      });
    }

    // PayHere Webhook Endpoint (/api/v1/payments/payhere/notify)
    if (pathname === '/api/v1/payments/payhere/notify' && method === 'POST') {
      const form = await parseBody(req);
      const { merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig, payment_id } = form;

      if (!order_id || !md5sig) {
        return sendText(res, 400, 'MISSING_PARAMETERS');
      }

      const isValidSignature = verifyPayHereWebhookSignature(
        merchant_id || config.payhere.merchantId,
        order_id,
        payhere_amount,
        payhere_currency || config.payhere.currency,
        status_code,
        md5sig,
        config.payhere.merchantSecret
      );

      if (!isValidSignature) {
        return sendText(res, 400, 'INVALID_SIGNATURE');
      }

      const inv = db.invoices.find(i => i.invoiceNumber === order_id);
      if (!inv) {
        return sendText(res, 404, 'INVOICE_NOT_FOUND');
      }

      if (status_code === '2') {
        inv.status = 'PAID';
        const paymentIdVal = Math.max(...db.payments.map(p => p.id), 0) + 1;
        db.payments.push({
          id: paymentIdVal,
          transactionReference: `TXN-PH-${payment_id || Date.now()}`,
          invoiceId: inv.id,
          paymentMethod: 'PAYHERE_GATEWAY',
          amountPaid: parseFloat(payhere_amount),
          currency: payhere_currency,
          status: 'SUCCESS',
          receiptNumber: `REC-2026-${String(paymentIdVal).padStart(4, '0')}`,
        });
        return sendText(res, 200, 'PAYMENT_RECORDED');
      }

      return sendText(res, 200, 'STATUS_NOTED');
    }

    // Counter Cash / Card Settlement
    if (pathname === '/api/v1/billing/settle' && method === 'POST') {
      const body = await parseBody(req);
      if (!body.invoiceId || !body.amountPaid || !body.paymentMethod) {
        return sendJson(res, 400, { error: 'Validation Error', message: 'invoiceId, amountPaid, and paymentMethod required' });
      }
      const inv = db.invoices.find(i => i.id === body.invoiceId);
      if (!inv) return sendJson(res, 404, { error: 'Not Found', message: 'Invoice not found' });
      if (inv.status === 'PAID') {
        return sendJson(res, 400, { error: 'Already Paid', message: 'Invoice has already been settled' });
      }
      if (parseFloat(body.amountPaid) < inv.netAmount) {
        return sendJson(res, 400, { error: 'Underpayment', message: `Amount paid (${body.amountPaid}) is less than net amount (${inv.netAmount})` });
      }

      inv.status = 'PAID';
      const paymentIdVal = Math.max(...db.payments.map(p => p.id), 0) + 1;
      const receiptNumber = `REC-2026-${String(paymentIdVal).padStart(4, '0')}`;
      const payment = {
        id: paymentIdVal,
        transactionReference: `TXN-COUNTER-${Date.now()}`,
        invoiceId: inv.id,
        paymentMethod: body.paymentMethod,
        amountPaid: parseFloat(body.amountPaid),
        currency: 'LKR',
        status: 'SUCCESS',
        receiptNumber,
      };
      db.payments.push(payment);
      return sendJson(res, 200, { message: 'Settlement successful', invoice: inv, payment });
    }

    // ------------------------------------------------------------------------
    // M6: LABORATORY & DIAGNOSTIC TESTS (/api/v1/lab)
    // ------------------------------------------------------------------------
    if (pathname === '/api/v1/lab/tests' && method === 'GET') {
      return sendJson(res, 200, db.labTests);
    }

    if (pathname === '/api/v1/lab/requests' && method === 'GET') {
      const status = parsedUrl.searchParams.get('status');
      let reqs = [...db.labRequests];
      if (status) reqs = reqs.filter(r => r.status === status);
      return sendJson(res, 200, reqs);
    }

    if (pathname === '/api/v1/lab/requests' && method === 'POST') {
      const body = await parseBody(req);
      if (!body.patientId || !body.doctorId || !body.labTestId) {
        return sendJson(res, 400, { error: 'Validation Error', message: 'Missing test order parameters' });
      }
      const testCatalog = db.labTests.find(t => t.id === body.labTestId);
      if (!testCatalog) return sendJson(res, 404, { error: 'Not Found', message: 'Lab test catalog item does not exist' });

      const labReqIdVal = Math.max(...db.labRequests.map(l => l.id), 0) + 1;
      const newReq = {
        id: labReqIdVal,
        requestNumber: `LR-2026-${String(labReqIdVal).padStart(4, '0')}`,
        appointmentId: body.appointmentId || null,
        patientId: body.patientId,
        doctorId: body.doctorId,
        labTestId: body.labTestId,
        urgency: body.urgency || 'ROUTINE',
        status: 'REQUESTED',
        clinicalIndication: body.clinicalIndication || '',
      };
      db.labRequests.push(newReq);
      return sendJson(res, 201, newReq);
    }

    const labReqIdMatch = pathname.match(/^\/api\/v1\/lab\/requests\/(\d+)$/);
    if (labReqIdMatch && method === 'GET') {
      const id = parseInt(labReqIdMatch[1], 10);
      const reqItem = db.labRequests.find(r => r.id === id);
      if (!reqItem) return sendJson(res, 404, { error: 'Not Found', message: 'Lab request not found' });
      return sendJson(res, 200, reqItem);
    }

    const labSampleCollectMatch = pathname.match(/^\/api\/v1\/lab\/requests\/(\d+)\/collect-sample$/);
    if (labSampleCollectMatch && method === 'PATCH') {
      const id = parseInt(labSampleCollectMatch[1], 10);
      const reqItem = db.labRequests.find(r => r.id === id);
      if (!reqItem) return sendJson(res, 404, { error: 'Not Found', message: 'Lab request not found' });
      reqItem.status = 'SAMPLE_COLLECTED';
      return sendJson(res, 200, reqItem);
    }

    const labResultsMatch = pathname.match(/^\/api\/v1\/lab\/requests\/(\d+)\/results$/);
    if (labResultsMatch && method === 'POST') {
      const id = parseInt(labResultsMatch[1], 10);
      const reqItem = db.labRequests.find(r => r.id === id);
      if (!reqItem) return sendJson(res, 404, { error: 'Not Found', message: 'Lab request not found' });
      if (reqItem.status === 'COMPLETED') {
        return sendJson(res, 400, { error: 'Already Completed', message: 'Results have already been recorded' });
      }
      if (reqItem.status !== 'SAMPLE_COLLECTED' && reqItem.status !== 'REQUESTED') {
        return sendJson(res, 400, { error: 'Illegal State', message: 'Sample must be collected before recording results' });
      }

      const body = await parseBody(req);
      if (body.resultValue === undefined) {
        return sendJson(res, 400, { error: 'Validation Error', message: 'resultValue is required' });
      }

      const testCatalog = db.labTests.find(t => t.id === reqItem.labTestId);
      const val = parseFloat(body.resultValue);
      let flag = 'NORMAL';
      if (testCatalog) {
        if (testCatalog.normalRangeMax !== null && val > testCatalog.normalRangeMax) {
          flag = 'HIGH';
        } else if (testCatalog.normalRangeMin !== null && val < testCatalog.normalRangeMin) {
          flag = 'LOW';
        }
      }

      reqItem.status = 'COMPLETED';
      reqItem.resultValue = val;
      reqItem.flag = flag;
      reqItem.referenceRange = testCatalog ? `${testCatalog.normalRangeMin} - ${testCatalog.normalRangeMax}` : 'N/A';
      reqItem.unit = testCatalog ? testCatalog.measurementUnit : '';
      reqItem.remarks = body.clinicalRemarks || '';

      return sendJson(res, 200, reqItem);
    }

    // Default 404
    sendJson(res, 404, { error: 'Endpoint Not Found', path: pathname, method });
  });

  return {
    server,
    db,
    listen: (port) => new Promise((resolve) => server.listen(port, () => resolve(port))),
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

// Standalone execution support
if (process.argv[1].endsWith('mock_server.mjs')) {
  const port = parseInt(process.env.MOCK_PORT || '8088', 10);
  const mock = createMockServer();
  mock.listen(port).then(() => {
    console.log(`[PulseOS Mock Server] Running at http://localhost:${port}/api/v1`);
  });
}
