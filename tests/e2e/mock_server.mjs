import http from 'node:http';
import { URL } from 'node:url';
import { config } from './config.mjs';
import { generatePayHereHash, verifyPayHereWebhookSignature, formatPayHereAmount } from './utils/payhere_crypto.mjs';
import { signJwt, verifyJwt } from './utils/jwt.mjs';

/**
 * High-fidelity in-memory REST API handler matching Spring Boot 3 contracts & React SPA DTOs
 */
export function createApiHandler() {
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
      { id: 13, nicPassport: '198512304561', firstName: 'Nimal', lastName: 'Perera', email: 'patient.sunil@gmail.com', phoneNumber: '+94771234567', address: 'No. 15, Flower Road, Colombo 07', gender: 'MALE', dateOfBirth: '1985-03-12' },
      { id: 14, nicPassport: '199012345678', firstName: 'Kasun', lastName: 'Perera', email: 'demo.patient@pulseos.lk', phoneNumber: '+94771234567', address: 'No. 45, Temple Road, Colombo 07', gender: 'MALE', dateOfBirth: '1990-05-12' },
    ],
    patients: [
      { id: 1, personId: 10, bloodGroup: 'O+', allergies: 'Penicillin, Sulfa drugs', emergencyContactName: 'Mallika Perera', emergencyContactRelationship: 'Spouse', emergencyContactPhone: '0773344556', triagePriority: 'EMERGENCY', medicalNotes: 'History of angina', vitalsHeartRate: 114, vitalsBloodPressure: '145/95', vitalsSpO2: 91, vitalsTemperature: '37.8', isArchived: false, status: 'ACTIVE', registrationDate: '2026-09-01' },
      { id: 2, personId: 11, bloodGroup: 'A+', allergies: 'None reported', emergencyContactName: 'Sujith Atapattu', emergencyContactRelationship: 'Spouse', emergencyContactPhone: '0716677889', triagePriority: 'ROUTINE', medicalNotes: 'Executive health checkup', vitalsHeartRate: 72, vitalsBloodPressure: '118/76', vitalsSpO2: 99, vitalsTemperature: '36.6', isArchived: false, status: 'ACTIVE', registrationDate: '2026-09-03' },
      { id: 3, personId: 12, bloodGroup: 'B+', allergies: 'Aspirin', emergencyContactName: 'Nirmala Fernando', emergencyContactRelationship: 'Mother', emergencyContactPhone: '0769900112', triagePriority: 'URGENT', medicalNotes: 'Recurring fever', vitalsHeartRate: 88, vitalsBloodPressure: '130/84', vitalsSpO2: 97, vitalsTemperature: '38.4', isArchived: false, status: 'ACTIVE', registrationDate: '2026-09-05' },
      { id: 4, personId: 13, bloodGroup: 'O+', allergies: 'None', emergencyContactName: 'Sunil Perera', emergencyContactRelationship: 'Brother', emergencyContactPhone: '+94779876543', triagePriority: 'ROUTINE', medicalNotes: 'Outpatient follow-up', vitalsHeartRate: 76, vitalsBloodPressure: '120/80', vitalsSpO2: 98, vitalsTemperature: '36.8', isArchived: false, status: 'ACTIVE', registrationDate: '2026-09-10' },
      { id: 5, personId: 14, bloodGroup: 'O+', allergies: 'None', emergencyContactName: 'Nimal Perera', emergencyContactRelationship: 'Brother', emergencyContactPhone: '+94779876543', triagePriority: 'ROUTINE', medicalNotes: 'Regular outpatient baseline consultation record.', vitalsHeartRate: 78, vitalsBloodPressure: '122/82', vitalsSpO2: 98, vitalsTemperature: '36.7', isArchived: false, status: 'ACTIVE', registrationDate: '2026-09-12' },
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
      {
        id: 2,
        prescriptionNumber: 'RX-2026-0002',
        appointmentId: 2,
        patientId: 2,
        doctorId: 1,
        issuedDate: '2026-09-14',
        status: 'PENDING',
        notes: 'Take Metformin twice daily after meals.',
        items: [
          { id: 3, drugId: 4, dosage: '500mg', frequency: 'BD', durationDays: 30, prescribedQuantity: 60, dispensedQuantity: 0, isDispensed: false },
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
      { id: 1, requestNumber: 'LR-2026-0001', appointmentId: 1, patientId: 1, doctorId: 1, labTestId: 2, urgency: 'STAT/URGENT', status: 'COMPLETED', resultValue: 0.02, flag: 'NORMAL', referenceRange: '0.00 - 0.04', unit: 'ng/mL', remarks: 'Troponin-I within normal limits', clinicalIndication: 'Acute chest pain evaluation' },
      { id: 2, requestNumber: 'LR-2026-0002', appointmentId: 1, patientId: 1, doctorId: 1, labTestId: 1, urgency: 'ROUTINE', status: 'COMPLETED', resultValue: 235.00, flag: 'HIGH', referenceRange: '125.00 - 200.00', unit: 'mg/dL', remarks: 'Elevated total serum cholesterol', clinicalIndication: 'Dyslipidemia screening' },
      { id: 3, requestNumber: 'LR-2026-0003', appointmentId: 2, patientId: 2, doctorId: 1, labTestId: 1, urgency: 'ROUTINE', status: 'SAMPLE_COLLECTED', clinicalIndication: 'Follow-up lipid screening' },
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
        paymentMethod: 'PAYHERE',
        transactionRef: 'TXN-PH-99201',
        billingDate: '2026-09-14',
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
        billingDate: '2026-09-14',
        items: [
          { type: 'CONSULTATION', description: 'Cardiology Consultation', quantity: 1, unitPrice: 2500.00, subtotal: 2500.00 },
          { type: 'LAB_TEST', description: 'Lipid Profile Full Panel', quantity: 1, unitPrice: 2400.00, subtotal: 2400.00 },
        ],
      },
    ],
    payments: [
      { id: 1, transactionReference: 'TXN-PH-99201', invoiceId: 1, paymentMethod: 'PAYHERE_GATEWAY', amountPaid: 11000.00, currency: 'LKR', status: 'SUCCESS', receiptNumber: 'REC-2026-0001' },
    ],
    users: [
      { id: 101, username: 'doc.kavinda@pulseos.lk', aliases: ['doctor', 'doc', 'it25103999@my.sliit.lk', 'kavinda'], password: 'Password123!', fullName: 'Dr. Kavinda Rathnayaka', role: 'DOCTOR', userType: 'STAFF', doctorId: 1 },
      { id: 102, username: 'receptionist@pulseos.lk', aliases: ['receptionist', 'rec', 'it25103819@my.sliit.lk', 'it25100994@my.sliit.lk', 'dila'], password: 'Password123!', fullName: 'Dilshan Somarathna', role: 'RECEPTIONIST', userType: 'STAFF' },
      { id: 103, username: 'pharmacist@pulseos.lk', aliases: ['pharmacist', 'pharm', 'it25100826@my.sliit.lk'], password: 'Password123!', fullName: 'Harshika Udumullage', role: 'PHARMACIST', userType: 'STAFF' },
      { id: 104, username: 'labtech@pulseos.lk', aliases: ['lab', 'labtech', 'lab_technician', 'it25103363@my.sliit.lk'], password: 'Password123!', fullName: 'Nethuli Thilakarathne', role: 'LAB_TECHNICIAN', userType: 'STAFF' },
      { id: 105, username: 'manager@pulseos.lk', aliases: ['admin', 'manager', 'admin@pulseos.lk', 'kesaruhasun@gmail.com', 'it25103992@my.sliit.lk'], password: 'Password123!', fullName: 'Kesaru Dhanasinghe', role: 'MANAGER', userType: 'STAFF' },
      { id: 1, username: 'patient.sunil@gmail.com', aliases: ['198520104567', 'sunil.perera@gmail.com'], password: 'Password123!', fullName: 'Sunil Perera', role: 'PATIENT', userType: 'PATIENT', patientId: 1 },
      { id: 4, username: '198512304561', aliases: ['nimal.perera@gmail.com'], password: 'Password123!', fullName: 'Nimal Perera', role: 'PATIENT', userType: 'PATIENT', patientId: 4 },
      { id: 5, username: '199012345678', aliases: ['demo.patient@pulseos.lk'], password: 'Password123!', fullName: 'Kasun Perera', role: 'PATIENT', userType: 'PATIENT', patientId: 5 },
    ],
    notifications: [
      {
        id: 1,
        recipientEmail: 'sunil.perera@gmail.com',
        recipientName: 'Sunil Perera',
        subject: 'Appointment Confirmation - APT-2026-0001',
        eventType: 'APPOINTMENT_CREATED',
        referenceId: 'APT-2026-0001',
        appointmentId: 1,
        sentAt: '2026-09-14T08:30:00.000Z',
        status: 'SENT',
      },
      {
        id: 2,
        recipientEmail: 'sunil.perera@gmail.com',
        recipientName: 'Sunil Perera',
        subject: 'Payment Receipt - INV-2026-0001',
        eventType: 'PAYMENT_COMPLETED',
        referenceId: 'INV-2026-0001',
        invoiceId: 1,
        sentAt: '2026-09-14T10:15:00.000Z',
        status: 'SENT',
      },
    ],
  };

  function getPatientFull(pat) {
    if (!pat) return {};
    const person = db.persons.find(p => p.id === pat.personId) || {};
    const firstName = person.firstName || '';
    const lastName = person.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return {
      ...person,
      ...pat,
      id: pat.id,
      patientId: `PAT-2026-${String(pat.id).padStart(3, '0')}`,
      nicPassport: person.nicPassport || '',
      nicPassportNo: person.nicPassport || '',
      firstName,
      lastName,
      fullName,
      dob: person.dateOfBirth || '1990-01-01',
      dateOfBirth: person.dateOfBirth || '1990-01-01',
      contactNumber: person.phoneNumber || '',
      phoneNumber: person.phoneNumber || '',
      address: person.address || '',
      gender: person.gender || 'OTHER',
      bloodGroup: pat.bloodGroup || 'O+',
      allergies: pat.allergies || 'None',
      emergencyContactName: pat.emergencyContactName || 'N/A',
      emergencyContactPhone: pat.emergencyContactPhone || 'N/A',
      emergencyContactRelationship: pat.emergencyContactRelationship || 'Family',
      triagePriority: pat.triagePriority || 'ROUTINE',
      medicalNotes: pat.medicalNotes || '',
      vitalsHeartRate: pat.vitalsHeartRate || 75,
      vitalsBloodPressure: pat.vitalsBloodPressure || '120/80',
      vitalsSpO2: pat.vitalsSpO2 || 98,
      vitalsTemperature: pat.vitalsTemperature || '36.8',
      registrationDate: pat.registrationDate || '2026-09-01',
    };
  }

  function getDoctorFull(doc) {
    if (!doc) return {};
    const fullName = `Dr. ${doc.firstName || ''} ${doc.lastName || ''}`.trim();
    return {
      ...doc,
      employeeId: typeof doc.employeeId === 'string' ? doc.employeeId : `DOC-${100 + doc.id}`,
      licenseNo: doc.licenseNumber,
      doctorLicenseNo: doc.licenseNumber,
      licenseNumber: doc.licenseNumber,
      fullName,
      contactNumber: doc.phoneNumber || '',
      phoneNumber: doc.phoneNumber || '',
      departmentName: `${doc.specialization || 'General'} Department`,
      weeklySchedule: doc.weeklySchedule || 'Mon, Wed, Fri • 09:00 - 17:00',
    };
  }

  function getAppointmentFull(appt) {
    if (!appt) return {};
    const pat = db.patients.find(p => p.id === appt.patientId);
    const patFull = pat ? getPatientFull(pat) : {};
    const doc = db.doctors.find(d => d.id === appt.doctorId);
    const docFull = doc ? getDoctorFull(doc) : {};
    const timeShort = (appt.startTime || '09:00:00').slice(0, 5);
    return {
      ...appt,
      appointmentId: appt.appointmentNumber,
      patientName: patFull.fullName || `Patient #${appt.patientId}`,
      patientNic: patFull.nicPassportNo || '',
      doctorName: docFull.fullName || `Dr. #${appt.doctorId}`,
      specialization: doc?.specialization || 'Cardiology',
      appointmentTime: timeShort,
      startTime: appt.startTime || `${timeShort}:00`,
      reasonForVisit: appt.symptomsReason || 'Consultation',
      symptomsReason: appt.symptomsReason || 'Consultation',
      roomNumber: doc?.roomNumber || 'Room 204',
    };
  }

  function getDrugFull(drug) {
    if (!drug) return {};
    const today = new Date().toISOString().slice(0, 10);
    return {
      ...drug,
      drugId: drug.id,
      drugCode: drug.itemCode,
      drugName: drug.drugName || drug.brandName || drug.genericName,
      currentStock: drug.stockQuantity,
      supplierName: drug.manufacturer,
      isLowStock: drug.stockQuantity <= (drug.reorderLevel || 20),
      isExpired: Boolean(drug.expiryDate && drug.expiryDate < today),
    };
  }

  function getPrescriptionFull(presc) {
    if (!presc) return {};
    const pat = db.patients.find(p => p.id === presc.patientId);
    const patFull = pat ? getPatientFull(pat) : {};
    const doc = db.doctors.find(d => d.id === presc.doctorId);
    const docFull = doc ? getDoctorFull(doc) : {};
    const enrichedItems = (presc.items || []).map(it => {
      const drug = db.drugs.find(d => d.id === it.drugId);
      return {
        ...it,
        drugName: drug ? (drug.brandName || drug.genericName) : `Drug #${it.drugId}`,
        dosageFrequency: it.frequency || 'OD',
        prescribedQty: it.prescribedQuantity,
        dispensedQty: it.dispensedQuantity,
        unitPrice: drug ? drug.unitPrice : 0,
      };
    });
    const firstItem = enrichedItems[0];
    return {
      ...presc,
      prescriptionId: presc.id,
      patientName: patFull.fullName || `Patient #${presc.patientId}`,
      doctorName: docFull.fullName || `Dr. #${presc.doctorId}`,
      prescribedDoctorName: docFull.fullName || `Dr. #${presc.doctorId}`,
      prescriptionDate: presc.issuedDate,
      doctorInstructions: presc.notes || '',
      dispensed: presc.status === 'DISPENSED',
      drugName: firstItem ? firstItem.drugName : 'Prescribed Medication',
      dosage: firstItem ? firstItem.dosage : '',
      frequency: firstItem ? firstItem.frequency : '',
      quantity: firstItem ? firstItem.prescribedQuantity : 1,
      items: enrichedItems,
    };
  }

  function getInvoiceFull(inv) {
    if (!inv) return {};
    const pat = db.patients.find(p => p.id === inv.patientId);
    const patFull = pat ? getPatientFull(pat) : {};
    const appt = db.appointments.find(a => a.id === inv.appointmentId);
    const doc = appt ? db.doctors.find(d => d.id === appt.doctorId) : db.doctors[0];
    const docFull = doc ? getDoctorFull(doc) : {};
    return {
      ...inv,
      invoiceId: inv.id,
      patientName: patFull.fullName || `Patient #${inv.patientId}`,
      patientNic: patFull.nicPassportNo || '',
      doctorName: docFull.fullName || 'Dr. Kavinda Rathnayaka',
      consultationFee: inv.doctorFee,
      pharmacyTotal: inv.pharmacyFee,
      labTotal: inv.labFee,
      paymentStatus: inv.status,
      status: inv.status,
      billingDate: inv.billingDate || '2026-09-14',
      items: (inv.items || []).map(it => ({
        ...it,
        category: it.type,
        totalPrice: it.subtotal,
      })),
    };
  }

  function getLabRequestFull(reqItem) {
    if (!reqItem) return {};
    const pat = db.patients.find(p => p.id === reqItem.patientId);
    const patFull = pat ? getPatientFull(pat) : {};
    const doc = db.doctors.find(d => d.id === (reqItem.doctorId || 1));
    const docFull = doc ? getDoctorFull(doc) : {};
    const testCatalog = db.labTests.find(t => t.id === reqItem.labTestId) || db.labTests[0];
    return {
      ...reqItem,
      testId: reqItem.id,
      patientName: patFull.fullName || `Patient #${reqItem.patientId}`,
      doctorId: reqItem.doctorId || 1,
      doctorName: docFull.fullName || 'Dr. Kavinda Rathnayaka',
      testName: reqItem.testName || (testCatalog ? testCatalog.testName : 'Diagnostic Panel'),
      testCode: reqItem.testCode || (testCatalog ? testCatalog.testCode : 'LAB-001'),
      category: reqItem.category || (testCatalog ? testCatalog.category : 'BIOCHEMISTRY'),
      sampleType: reqItem.sampleType || (testCatalog ? testCatalog.sampleType : 'SERUM'),
      specimenType: reqItem.sampleType || (testCatalog ? testCatalog.sampleType : 'SERUM'),
      standardFee: testCatalog ? testCatalog.price : 1500,
      testDate: reqItem.testDate || '2026-09-14',
      resultData: reqItem.resultData || (reqItem.resultValue !== undefined ? `${reqItem.resultValue} ${reqItem.unit || ''}`.trim() : undefined),
      isAbnormal: reqItem.isAbnormal !== undefined ? reqItem.isAbnormal : (reqItem.flag === 'HIGH' || reqItem.flag === 'LOW'),
      technicianNotes: reqItem.remarks || '',
      technicianName: 'Nethuli Thilakarathne, MLT',
    };
  }

  function extractAuthUser(req) {
    const authHeader = req.headers['authorization'] || '';
    if (!authHeader.startsWith('Bearer ')) {
      return { authenticated: false, error: 'Missing or malformed Authorization header' };
    }
    const token = authHeader.substring(7).trim();
    const verification = verifyJwt(token);
    if (!verification.valid) {
      return { authenticated: false, error: verification.error };
    }
    return { authenticated: true, user: verification.payload };
  }

  function recordNotification(notif) {
    const notifId = Math.max(...db.notifications.map(n => n.id), 0) + 1;
    const item = {
      id: notifId,
      sentAt: new Date().toISOString(),
      status: 'SENT',
      ...notif,
    };
    db.notifications.push(item);
    return item;
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

  const handler = async (req, res) => {
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
      return sendJson(res, 200, { status: 'UP', service: 'PulseOS Backend', profile: 'demo' });
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
        result = result.filter(p =>
          (p.firstName || '').toLowerCase().includes(s) ||
          (p.lastName || '').toLowerCase().includes(s) ||
          (p.nicPassport || '').toLowerCase().includes(s)
        );
      }
      return sendJson(res, 200, result);
    }

    if (pathname === '/api/v1/patients/search' && method === 'GET') {
      const q = (parsedUrl.searchParams.get('q') || '').toLowerCase();
      const result = db.patients.map(getPatientFull).filter(p =>
        !q ||
        (p.firstName || '').toLowerCase().includes(q) ||
        (p.lastName || '').toLowerCase().includes(q) ||
        (p.nicPassport || '').toLowerCase().includes(q)
      );
      return sendJson(res, 200, result);
    }

    if (pathname === '/api/v1/patients' && method === 'POST') {
      const body = await parseBody(req);
      const nicPassport = body.nicPassport || body.nicPassportNo;
      const phoneNumber = body.phoneNumber || body.contactNumber || '';
      const dateOfBirth = body.dateOfBirth || body.dob || '2000-01-01';

      if (!nicPassport || !body.firstName || !body.lastName) {
        return sendJson(res, 400, { error: 'Validation Failed', message: 'Mandatory fields missing' });
      }
      if (dateOfBirth && new Date(dateOfBirth) > new Date()) {
        return sendJson(res, 400, { error: 'Validation Failed', message: 'Date of birth cannot be in the future' });
      }
      const existingPerson = db.persons.find(p => p.nicPassport === nicPassport);
      if (existingPerson) {
        return sendJson(res, 409, { error: 'Duplicate NIC', message: `Patient with NIC ${nicPassport} already exists` });
      }

      const personId = Math.max(...db.persons.map(p => p.id), 0) + 1;
      const newPerson = {
        id: personId,
        nicPassport,
        firstName: (body.firstName || '').trim(),
        lastName: (body.lastName || '').trim(),
        email: body.email || '',
        phoneNumber,
        address: body.address || '',
        gender: body.gender || 'OTHER',
        dateOfBirth,
      };
      db.persons.push(newPerson);

      const patId = Math.max(...db.patients.map(p => p.id), 0) + 1;
      const newPatient = {
        id: patId,
        personId,
        bloodGroup: body.bloodGroup || 'O+',
        allergies: body.allergies || 'None',
        emergencyContactName: body.emergencyContactName || 'N/A',
        emergencyContactRelationship: body.emergencyContactRelationship || 'Family',
        emergencyContactPhone: body.emergencyContactPhone || 'N/A',
        triagePriority: body.triagePriority || 'ROUTINE',
        medicalNotes: body.medicalNotes || '',
        vitalsHeartRate: Number(body.vitalsHeartRate) || 75,
        vitalsBloodPressure: body.vitalsBloodPressure || '120/80',
        vitalsSpO2: Number(body.vitalsSpO2) || 98,
        vitalsTemperature: body.vitalsTemperature || '36.8',
        isArchived: false,
        status: 'ACTIVE',
        registrationDate: new Date().toISOString().slice(0, 10),
      };
      db.patients.push(newPatient);

      if (body.password) {
        db.users.push({
          id: patId,
          username: nicPassport,
          aliases: body.email ? [body.email] : [],
          password: body.password,
          fullName: `${body.firstName} ${body.lastName}`.trim(),
          role: 'PATIENT',
          userType: 'PATIENT',
          patientId: patId,
        });
      }

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
          if (body.firstName) person.firstName = body.firstName.trim();
          if (body.lastName) person.lastName = body.lastName.trim();
          if (body.phoneNumber || body.contactNumber) person.phoneNumber = body.phoneNumber || body.contactNumber;
          if (body.address !== undefined) person.address = body.address;
          if (body.dob || body.dateOfBirth) person.dateOfBirth = body.dob || body.dateOfBirth;
          if (body.gender) person.gender = body.gender;
        }
        if (body.allergies !== undefined) pat.allergies = body.allergies;
        if (body.bloodGroup) pat.bloodGroup = body.bloodGroup;
        if (body.triagePriority) pat.triagePriority = body.triagePriority;
        if (body.emergencyContactName !== undefined) pat.emergencyContactName = body.emergencyContactName;
        if (body.emergencyContactPhone !== undefined) pat.emergencyContactPhone = body.emergencyContactPhone;
        if (body.emergencyContactRelationship !== undefined) pat.emergencyContactRelationship = body.emergencyContactRelationship;
        if (body.medicalNotes !== undefined) pat.medicalNotes = body.medicalNotes;
        if (body.vitalsHeartRate !== undefined) pat.vitalsHeartRate = Number(body.vitalsHeartRate);
        if (body.vitalsBloodPressure !== undefined) pat.vitalsBloodPressure = body.vitalsBloodPressure;
        if (body.vitalsSpO2 !== undefined) pat.vitalsSpO2 = Number(body.vitalsSpO2);
        if (body.vitalsTemperature !== undefined) pat.vitalsTemperature = body.vitalsTemperature;
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
      let docs = db.doctors.map(getDoctorFull);
      if (spec) docs = docs.filter(d => d.specialization.toLowerCase() === spec.toLowerCase());
      return sendJson(res, 200, docs);
    }

    if (pathname === '/api/v1/doctors' && method === 'POST') {
      const body = await parseBody(req);
      const licenseNumber = body.licenseNumber || body.licenseNo || body.doctorLicenseNo;
      if (!licenseNumber || !body.specialization || !body.firstName) {
        return sendJson(res, 400, { error: 'Validation Error', message: 'Required doctor fields missing' });
      }
      if (db.doctors.some(d => d.licenseNumber === licenseNumber)) {
        return sendJson(res, 409, { error: 'Duplicate License', message: 'Medical license already registered' });
      }
      if (body.consultationFee !== undefined && body.consultationFee < 0) {
        return sendJson(res, 400, { error: 'Invalid Fee', message: 'Consultation fee cannot be negative' });
      }
      const docId = Math.max(...db.doctors.map(d => d.id), 0) + 1;
      const newDoc = {
        id: docId,
        employeeId: body.employeeId || docId,
        firstName: body.firstName,
        lastName: body.lastName || '',
        email: body.email || 'doc@pulseos.lk',
        phoneNumber: body.phoneNumber || body.contactNumber || '0770000000',
        licenseNumber,
        specialization: body.specialization,
        consultationFee: body.consultationFee !== undefined ? parseFloat(body.consultationFee) : 2000.00,
        roomNumber: body.roomNumber || 'Room 101',
        isAvailable: body.isAvailable !== undefined ? body.isAvailable : true,
        departmentId: body.departmentId || 1,
        weeklySchedule: body.weeklySchedule || 'Mon-Fri 08:00-14:00',
      };
      db.doctors.push(newDoc);
      return sendJson(res, 201, getDoctorFull(newDoc));
    }

    const doctorIdMatch = pathname.match(/^\/api\/v1\/doctors\/(\d+)$/);
    if (doctorIdMatch) {
      const id = parseInt(doctorIdMatch[1], 10);
      const doc = db.doctors.find(d => d.id === id);
      if (!doc) return sendJson(res, 404, { error: 'Not Found', message: `Doctor ${id} not found` });
      if (method === 'GET') return sendJson(res, 200, getDoctorFull(doc));
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
      return sendJson(res, 200, getDoctorFull(doc));
    }

    const doctorAvailMatch = pathname.match(/^\/api\/v1\/doctors\/(\d+)\/availability$/);
    if (doctorAvailMatch && method === 'PATCH') {
      const id = parseInt(doctorAvailMatch[1], 10);
      const doc = db.doctors.find(d => d.id === id);
      if (!doc) return sendJson(res, 404, { error: 'Not Found', message: 'Doctor not found' });
      const body = await parseBody(req);
      doc.isAvailable = Boolean(body.isAvailable);
      return sendJson(res, 200, getDoctorFull(doc));
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
    if ((pathname === '/api/v1/appointments' || pathname === '/api/v1/appointments/today') && method === 'GET') {
      const doctorId = parsedUrl.searchParams.get('doctorId');
      const patientId = parsedUrl.searchParams.get('patientId');
      const date = parsedUrl.searchParams.get('date');
      let appts = db.appointments.map(getAppointmentFull);
      if (doctorId) appts = appts.filter(a => a.doctorId === parseInt(doctorId, 10));
      if (patientId) appts = appts.filter(a => a.patientId === parseInt(patientId, 10));
      if (date) appts = appts.filter(a => a.appointmentDate === date);
      return sendJson(res, 200, appts);
    }

    if (pathname === '/api/v1/appointments' && method === 'POST') {
      const body = await parseBody(req);
      const rawStartTime = body.startTime || body.appointmentTime;
      if (!body.patientId || !body.doctorId || !body.appointmentDate || !rawStartTime) {
        return sendJson(res, 400, { error: 'Validation Error', message: 'Required appointment fields missing' });
      }
      const startTime = rawStartTime.length === 5 ? `${rawStartTime}:00` : rawStartTime;

      const patient = db.patients.find(p => p.id === Number(body.patientId));
      if (!patient) return sendJson(res, 404, { error: 'Not Found', message: 'Patient does not exist' });
      if (patient.isArchived) {
        return sendJson(res, 400, { error: 'Archived Patient', message: 'Cannot book appointment for archived patient' });
      }

      const doctor = db.doctors.find(d => d.id === Number(body.doctorId));
      if (!doctor) return sendJson(res, 404, { error: 'Not Found', message: 'Doctor does not exist' });
      if (!doctor.isAvailable) {
        return sendJson(res, 400, { error: 'Doctor Unavailable', message: 'Doctor is currently off-duty/unavailable' });
      }

      const conflict = db.appointments.find(a =>
        a.doctorId === Number(body.doctorId) &&
        a.appointmentDate === body.appointmentDate &&
        (a.startTime === startTime || a.startTime === rawStartTime) &&
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
        patientId: Number(body.patientId),
        doctorId: Number(body.doctorId),
        appointmentDate: body.appointmentDate,
        startTime: body.startTime ? body.startTime : startTime,
        endTime: body.endTime || '09:15:00',
        status: 'SCHEDULED',
        symptomsReason: body.symptomsReason || body.reasonForVisit || 'Consultation',
      };
      db.appointments.push(newAppt);

      const patientPerson = db.persons.find(p => p.id === patient.personId);
      recordNotification({
        recipientEmail: (patientPerson && patientPerson.email) || 'patient@pulseos.lk',
        recipientName: patientPerson ? `${patientPerson.firstName} ${patientPerson.lastName}` : 'Patient',
        subject: `Appointment Confirmation - ${newAppt.appointmentNumber}`,
        eventType: 'APPOINTMENT_CREATED',
        referenceId: newAppt.appointmentNumber,
        appointmentId: newAppt.id,
      });

      return sendJson(res, 201, getAppointmentFull(newAppt));
    }

    const apptIdMatch = pathname.match(/^\/api\/v1\/appointments\/(\d+)$/);
    if (apptIdMatch) {
      const id = parseInt(apptIdMatch[1], 10);
      const appt = db.appointments.find(a => a.id === id);
      if (!appt) return sendJson(res, 404, { error: 'Not Found', message: 'Appointment not found' });
      if (method === 'GET') return sendJson(res, 200, getAppointmentFull(appt));
      if (method === 'DELETE') {
        appt.status = 'CANCELLED';
        return sendJson(res, 200, { message: 'Appointment cancelled successfully', appointment: getAppointmentFull(appt) });
      }
    }

    const apptRescheduleMatch = pathname.match(/^\/api\/v1\/appointments\/(\d+)\/reschedule$/);
    if (apptRescheduleMatch && (method === 'PUT' || method === 'PATCH')) {
      const id = parseInt(apptRescheduleMatch[1], 10);
      const appt = db.appointments.find(a => a.id === id);
      if (!appt) return sendJson(res, 404, { error: 'Not Found', message: 'Appointment not found' });
      const body = await parseBody(req);
      const nextTime = body.startTime || body.appointmentTime;
      if (!body.appointmentDate || !nextTime) {
        return sendJson(res, 400, { error: 'Validation Error', message: 'Date and start time required' });
      }

      const conflict = db.appointments.find(a =>
        a.id !== id &&
        a.doctorId === appt.doctorId &&
        a.appointmentDate === body.appointmentDate &&
        a.startTime === nextTime &&
        a.status !== 'CANCELLED'
      );
      if (conflict) {
        return sendJson(res, 409, { error: 'Conflict', message: 'Slot already booked by another appointment' });
      }

      appt.appointmentDate = body.appointmentDate;
      appt.startTime = nextTime;
      if (body.endTime) appt.endTime = body.endTime;
      return sendJson(res, 200, getAppointmentFull(appt));
    }

    const apptCancelMatch = pathname.match(/^\/api\/v1\/appointments\/(\d+)\/cancel$/);
    if (apptCancelMatch && (method === 'PATCH' || method === 'POST' || method === 'PUT')) {
      const id = parseInt(apptCancelMatch[1], 10);
      const appt = db.appointments.find(a => a.id === id);
      if (!appt) return sendJson(res, 404, { error: 'Not Found', message: 'Appointment not found' });
      const body = await parseBody(req).catch(() => ({}));
      appt.status = 'CANCELLED';
      if (body.reason) appt.cancellationReason = body.reason;
      return sendJson(res, 200, getAppointmentFull(appt));
    }

    const apptCompleteMatch = pathname.match(/^\/api\/v1\/appointments\/(\d+)\/complete$/);
    if (apptCompleteMatch && method === 'PATCH') {
      const id = parseInt(apptCompleteMatch[1], 10);
      const appt = db.appointments.find(a => a.id === id);
      if (!appt) return sendJson(res, 404, { error: 'Not Found', message: 'Appointment not found' });
      if (appt.status === 'CANCELLED') {
        return sendJson(res, 400, { error: 'Invalid Transition', message: 'Cancelled appointment cannot be completed' });
      }
      appt.status = 'COMPLETED';
      return sendJson(res, 200, getAppointmentFull(appt));
    }

    const apptStatusMatch = pathname.match(/^\/api\/v1\/appointments\/(\d+)\/status$/);
    if (apptStatusMatch && method === 'PATCH') {
      const id = parseInt(apptStatusMatch[1], 10);
      const appt = db.appointments.find(a => a.id === id);
      if (!appt) return sendJson(res, 404, { error: 'Not Found', message: 'Appointment not found' });
      const body = await parseBody(req);
      if (!body.status) return sendJson(res, 400, { error: 'Missing Status' });

      if (appt.status === 'CANCELLED' && body.status === 'COMPLETED') {
        return sendJson(res, 400, { error: 'Invalid Transition', message: 'Cancelled appointment cannot be completed' });
      }

      appt.status = body.status;
      return sendJson(res, 200, getAppointmentFull(appt));
    }

    // ------------------------------------------------------------------------
    // M4: PHARMACY & INVENTORY (/api/v1/pharmacy & /api/v1/prescriptions)
    // ------------------------------------------------------------------------
    if (pathname === '/api/v1/pharmacy/drugs' && method === 'GET') {
      const category = parsedUrl.searchParams.get('category');
      const lowStock = parsedUrl.searchParams.get('lowStock');
      let drugs = db.drugs.map(getDrugFull);
      if (category) drugs = drugs.filter(d => d.category.toLowerCase() === category.toLowerCase());
      if (lowStock === 'true') drugs = drugs.filter(d => d.stockQuantity <= d.reorderLevel);
      return sendJson(res, 200, drugs);
    }

    if (pathname === '/api/v1/pharmacy/drugs/low-stock' && method === 'GET') {
      const low = db.drugs.filter(d => d.stockQuantity <= d.reorderLevel).map(getDrugFull);
      return sendJson(res, 200, low);
    }

    if (pathname === '/api/v1/pharmacy/drugs/expired' && method === 'GET') {
      const today = new Date().toISOString().slice(0, 10);
      const exp = db.drugs.filter(d => d.expiryDate < today).map(getDrugFull);
      return sendJson(res, 200, exp);
    }

    if (pathname === '/api/v1/pharmacy/drugs' && method === 'POST') {
      const body = await parseBody(req);
      const genericName = body.genericName || body.drugName;
      if (!body.itemCode || !genericName || body.unitPrice === undefined || body.stockQuantity === undefined) {
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
        genericName,
        brandName: body.brandName || body.drugName || genericName,
        drugName: body.drugName || body.brandName || genericName,
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
      return sendJson(res, 201, getDrugFull(newDrug));
    }

    const drugIdMatch = pathname.match(/^\/api\/v1\/pharmacy\/drugs\/(\d+)$/);
    if (drugIdMatch) {
      const id = parseInt(drugIdMatch[1], 10);
      const drug = db.drugs.find(d => d.id === id);
      if (!drug) return sendJson(res, 404, { error: 'Not Found', message: 'Drug not found' });
      if (method === 'GET') return sendJson(res, 200, getDrugFull(drug));
      if (method === 'PUT') {
        const body = await parseBody(req);
        if (body.stockQuantity !== undefined) drug.stockQuantity = parseInt(body.stockQuantity, 10);
        if (body.unitPrice !== undefined) drug.unitPrice = parseFloat(body.unitPrice);
        return sendJson(res, 200, getDrugFull(drug));
      }
    }

    // Prescriptions (/api/v1/prescriptions AND /api/v1/pharmacy/prescriptions)
    if ((pathname === '/api/v1/prescriptions' || pathname === '/api/v1/pharmacy/prescriptions') && method === 'GET') {
      return sendJson(res, 200, db.prescriptions.map(getPrescriptionFull));
    }

    if ((pathname === '/api/v1/prescriptions' || pathname === '/api/v1/pharmacy/prescriptions') && method === 'POST') {
      const body = await parseBody(req);
      const isDirectEndpoint = pathname === '/api/v1/prescriptions';
      const itemsList = Array.isArray(body.items) && body.items.length > 0
        ? body.items
        : (!isDirectEndpoint && body.notes ? [{ drugId: 5, dosage: '500mg', frequency: 'TDS', durationDays: 5, prescribedQuantity: 15 }] : []);

      if (!body.patientId || !body.doctorId || !itemsList.length) {
        return sendJson(res, 400, { error: 'Validation Error', message: 'Prescription must have patient, doctor, and items' });
      }

      const prescId = Math.max(...db.prescriptions.map(p => p.id), 0) + 1;
      const newPresc = {
        id: prescId,
        prescriptionNumber: `RX-2026-${String(prescId).padStart(4, '0')}`,
        appointmentId: body.appointmentId || null,
        patientId: Number(body.patientId),
        doctorId: Number(body.doctorId),
        issuedDate: new Date().toISOString().slice(0, 10),
        status: 'PENDING',
        notes: body.notes || body.doctorInstructions || '',
        items: itemsList.map((it, idx) => ({
          id: idx + 1,
          drugId: Number(it.drugId || 5),
          dosage: it.dosage || '1 tab',
          frequency: it.frequency || it.dosageFrequency || 'OD',
          durationDays: Number(it.durationDays || 30),
          prescribedQuantity: Number(it.prescribedQuantity || it.prescribedQty || it.quantity || 10),
          dispensedQuantity: 0,
          isDispensed: false,
        })),
      };
      db.prescriptions.push(newPresc);
      return sendJson(res, 201, getPrescriptionFull(newPresc));
    }

    const prescIdMatch = pathname.match(/^\/api\/v1\/(?:pharmacy\/)?prescriptions\/(\d+)$/);
    if (prescIdMatch && method === 'GET') {
      const id = parseInt(prescIdMatch[1], 10);
      const presc = db.prescriptions.find(p => p.id === id);
      if (!presc) return sendJson(res, 404, { error: 'Not Found', message: 'Prescription not found' });
      return sendJson(res, 200, getPrescriptionFull(presc));
    }

    // Dispensing endpoint (/api/v1/pharmacy/dispense/:id AND /api/v1/pharmacy/prescriptions/:id/dispense)
    const dispenseMatch =
      pathname.match(/^\/api\/v1\/pharmacy\/dispense\/(\d+)$/) ||
      pathname.match(/^\/api\/v1\/pharmacy\/prescriptions\/(\d+)\/dispense$/);
    if (dispenseMatch && method === 'POST') {
      const prescId = parseInt(dispenseMatch[1], 10);
      const presc = db.prescriptions.find(p => p.id === prescId);
      if (!presc) return sendJson(res, 404, { error: 'Not Found', message: 'Prescription not found' });
      if (presc.status === 'DISPENSED') {
        return sendJson(res, 400, { error: 'Already Dispensed', message: 'Prescription already fulfilled' });
      }

      const today = new Date().toISOString().slice(0, 10);

      for (const item of presc.items) {
        const drug = db.drugs.find(d => d.id === item.drugId);
        if (!drug) return sendJson(res, 400, { error: 'Invalid Drug', message: `Drug ${item.drugId} does not exist` });

        if (drug.expiryDate < today) {
          return sendJson(res, 400, {
            error: 'Expired Medication',
            message: `Cannot dispense expired drug batch: ${drug.genericName} expired on ${drug.expiryDate}`,
          });
        }

        if (drug.stockQuantity < item.prescribedQuantity) {
          return sendJson(res, 400, {
            error: 'Insufficient Stock',
            message: `Insufficient stock for ${drug.genericName}. Available: ${drug.stockQuantity}, Requested: ${item.prescribedQuantity}`,
          });
        }
      }

      for (const item of presc.items) {
        const drug = db.drugs.find(d => d.id === item.drugId);
        drug.stockQuantity -= item.prescribedQuantity;
        item.dispensedQuantity = item.prescribedQuantity;
        item.isDispensed = true;
      }

      presc.status = 'DISPENSED';
      const enriched = getPrescriptionFull(presc);
      return sendJson(res, 200, {
        ...enriched,
        message: 'Prescription successfully dispensed',
        prescription: enriched,
      });
    }

    // ------------------------------------------------------------------------
    // M5: BILLING, INVOICES & PAYHERE (/api/v1/billing & /api/v1/payments)
    // ------------------------------------------------------------------------
    if (pathname === '/api/v1/billing/invoices' && method === 'GET') {
      return sendJson(res, 200, db.invoices.map(getInvoiceFull));
    }

    const invoiceIdMatch = pathname.match(/^\/api\/v1\/billing\/invoices\/(\d+)$/);
    if (invoiceIdMatch && method === 'GET') {
      const id = parseInt(invoiceIdMatch[1], 10);
      const inv = db.invoices.find(i => i.id === id);
      if (!inv) return sendJson(res, 404, { error: 'Not Found', message: 'Invoice not found' });
      return sendJson(res, 200, getInvoiceFull(inv));
    }

    // Automated Invoice Generation
    if (pathname === '/api/v1/billing/invoices/generate' && method === 'POST') {
      const body = await parseBody(req);
      if (!body.appointmentId) {
        return sendJson(res, 400, { error: 'Validation Error', message: 'Patient and Appointment IDs required' });
      }

      const appointment = db.appointments.find(a => a.id === Number(body.appointmentId));
      if (!appointment) return sendJson(res, 404, { error: 'Not Found', message: 'Appointment not found' });

      const resolvedPatientId = body.patientId ? Number(body.patientId) : appointment.patientId;
      if (!resolvedPatientId) {
        return sendJson(res, 400, { error: 'Validation Error', message: 'Patient and Appointment IDs required' });
      }

      const doctor = db.doctors.find(d => d.id === appointment.doctorId);
      const doctorFee = doctor ? doctor.consultationFee : 0.00;

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
        patientId: resolvedPatientId,
        appointmentId: Number(body.appointmentId),
        doctorFee,
        pharmacyFee,
        labFee,
        totalAmount,
        discountAmount,
        netAmount,
        status: 'PENDING',
        billingDate: new Date().toISOString().slice(0, 10),
        items: invoiceItems,
      };
      db.invoices.push(newInv);
      return sendJson(res, 201, getInvoiceFull(newInv));
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

      const firstName = patient.firstName || 'Patient';
      const lastName = patient.lastName || 'User';
      const email = patient.email || 'patient@pulseos.lk';
      const phone = patient.phoneNumber || '0771234567';

      return sendJson(res, 200, {
        merchantId: config.payhere.merchantId,
        merchant_id: config.payhere.merchantId,
        orderId: inv.invoiceNumber,
        order_id: inv.invoiceNumber,
        amount: formattedAmount,
        currency: config.payhere.currency,
        hash,
        notifyUrl: config.payhere.notifyUrl,
        notify_url: config.payhere.notifyUrl,
        return_url: 'http://localhost:3000/billing',
        cancel_url: 'http://localhost:3000/billing',
        items: `Hospital Invoice ${inv.invoiceNumber}`,
        patientFirstName: firstName,
        first_name: firstName,
        patientLastName: lastName,
        last_name: lastName,
        patientEmail: email,
        email,
        patientPhone: phone,
        phone,
        address: patient.address || 'Colombo',
        city: 'Colombo',
        country: 'Sri Lanka',
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
        const patientObj = getPatientFull(db.patients.find(p => p.id === inv.patientId) || {});
        recordNotification({
          recipientEmail: patientObj.email || 'patient@pulseos.lk',
          recipientName: `${patientObj.firstName || 'Patient'} ${patientObj.lastName || ''}`.trim(),
          subject: `Payment Receipt - ${inv.invoiceNumber}`,
          eventType: 'PAYMENT_COMPLETED',
          referenceId: inv.invoiceNumber,
          invoiceId: inv.id,
        });
        return sendText(res, 200, 'PAYMENT_RECORDED');
      }

      return sendText(res, 200, 'STATUS_NOTED');
    }

    // PayHere Mock Success Endpoint (/api/v1/payments/payhere/mock-success)
    if (pathname === '/api/v1/payments/payhere/mock-success' && method === 'POST') {
      const body = await parseBody(req);
      const invoiceIdParam = parsedUrl.searchParams.get('invoiceId') || body.invoiceId;
      if (!invoiceIdParam) {
        return sendJson(res, 400, { error: 'Validation Error', message: 'invoiceId parameter is required' });
      }
      const invoiceId = parseInt(invoiceIdParam, 10);
      const inv = db.invoices.find(i => i.id === invoiceId);
      if (!inv) {
        return sendJson(res, 404, { error: 'Not Found', message: `Invoice with ID ${invoiceId} not found` });
      }
      if (inv.status === 'PAID') {
        return sendJson(res, 400, { error: 'Already Paid', message: `Invoice ${inv.invoiceNumber} is already settled` });
      }

      inv.status = 'PAID';
      const paymentIdVal = Math.max(...db.payments.map(p => p.id), 0) + 1;
      const payment = {
        id: paymentIdVal,
        transactionReference: `TXN-MOCK-PH-${Date.now()}`,
        invoiceId: inv.id,
        paymentMethod: 'PAYHERE_MOCK',
        amountPaid: inv.netAmount,
        currency: config.payhere.currency,
        status: 'SUCCESS',
        receiptNumber: `REC-MOCK-${String(paymentIdVal).padStart(4, '0')}`,
      };
      db.payments.push(payment);

      const patientObj = getPatientFull(db.patients.find(p => p.id === inv.patientId) || {});
      recordNotification({
        recipientEmail: patientObj.email || 'patient@pulseos.lk',
        recipientName: `${patientObj.firstName || 'Patient'} ${patientObj.lastName || ''}`.trim(),
        subject: `Payment Receipt - ${inv.invoiceNumber}`,
        eventType: 'PAYMENT_COMPLETED',
        referenceId: inv.invoiceNumber,
        invoiceId: inv.id,
      });

      return sendJson(res, 200, {
        success: true,
        message: 'Mock payment processed successfully via PayHere Mock',
        invoice: getInvoiceFull(inv),
        payment,
      });
    }

    // Counter Cash / Card Settlement (/api/v1/billing/settle AND /api/v1/billing/invoices/:id/settle)
    const settleInvoiceMatch = pathname.match(/^\/api\/v1\/billing\/invoices\/(\d+)\/settle$/);
    if ((pathname === '/api/v1/billing/settle' || settleInvoiceMatch) && method === 'POST') {
      const body = await parseBody(req);
      const invoiceId = settleInvoiceMatch ? parseInt(settleInvoiceMatch[1], 10) : Number(body.invoiceId);
      const inv = db.invoices.find(i => i.id === invoiceId);

      if (!settleInvoiceMatch && (!body.invoiceId || !body.amountPaid || !body.paymentMethod)) {
        return sendJson(res, 400, { error: 'Validation Error', message: 'invoiceId, amountPaid, and paymentMethod required' });
      }
      if (!inv) return sendJson(res, 404, { error: 'Not Found', message: 'Invoice not found' });
      if (inv.status === 'PAID') {
        return sendJson(res, 400, { error: 'Already Paid', message: 'Invoice has already been settled' });
      }

      const amountPaid = body.amountPaid !== undefined ? parseFloat(body.amountPaid) : inv.netAmount;
      if (amountPaid < inv.netAmount) {
        return sendJson(res, 400, { error: 'Underpayment', message: `Amount paid (${amountPaid}) is less than net amount (${inv.netAmount})` });
      }

      inv.status = 'PAID';
      inv.paymentMethod = body.paymentMethod || 'CASH';
      inv.transactionRef = body.transactionRef || `TXN-COUNTER-${Date.now()}`;

      const paymentIdVal = Math.max(...db.payments.map(p => p.id), 0) + 1;
      const receiptNumber = `REC-2026-${String(paymentIdVal).padStart(4, '0')}`;
      const payment = {
        id: paymentIdVal,
        transactionReference: inv.transactionRef,
        invoiceId: inv.id,
        paymentMethod: inv.paymentMethod,
        amountPaid,
        currency: 'LKR',
        status: 'SUCCESS',
        receiptNumber,
      };
      db.payments.push(payment);

      const patientObj = getPatientFull(db.patients.find(p => p.id === inv.patientId) || {});
      recordNotification({
        recipientEmail: patientObj.email || 'patient@pulseos.lk',
        recipientName: `${patientObj.firstName || 'Patient'} ${patientObj.lastName || ''}`.trim(),
        subject: `Payment Receipt - ${inv.invoiceNumber}`,
        eventType: 'PAYMENT_COMPLETED',
        referenceId: inv.invoiceNumber,
        invoiceId: inv.id,
      });

      const enrichedInv = getInvoiceFull(inv);
      return sendJson(res, 200, {
        ...enrichedInv,
        message: 'Settlement successful',
        invoice: enrichedInv,
        payment,
      });
    }

    // ------------------------------------------------------------------------
    // M6: LABORATORY & DIAGNOSTIC TESTS (/api/v1/lab & /api/v1/laboratory)
    // ------------------------------------------------------------------------
    if ((pathname === '/api/v1/lab/tests' || pathname === '/api/v1/laboratory/catalog') && method === 'GET') {
      return sendJson(res, 200, db.labTests.map(t => ({ ...t, standardFee: t.price })));
    }

    if ((pathname === '/api/v1/lab/requests' || pathname === '/api/v1/laboratory/tests') && method === 'GET') {
      const status = parsedUrl.searchParams.get('status');
      let reqs = db.labRequests.map(getLabRequestFull);
      if (status) reqs = reqs.filter(r => r.status === status);
      return sendJson(res, 200, reqs);
    }

    if ((pathname === '/api/v1/lab/requests' || pathname === '/api/v1/laboratory/tests') && method === 'POST') {
      const body = await parseBody(req);
      const isDirectLabEndpoint = pathname === '/api/v1/lab/requests';
      const resolvedLabTestId = body.labTestId || body.testCatalogId || (!isDirectLabEndpoint ? 1 : null);
      const resolvedDoctorId = body.doctorId || (!isDirectLabEndpoint ? 1 : null);

      if (!body.patientId || !resolvedDoctorId || !resolvedLabTestId) {
        return sendJson(res, 400, { error: 'Validation Error', message: 'Missing test order parameters' });
      }
      const testCatalog = db.labTests.find(t => t.id === Number(resolvedLabTestId));
      if (!testCatalog) return sendJson(res, 404, { error: 'Not Found', message: 'Lab test catalog item does not exist' });

      const labReqIdVal = Math.max(...db.labRequests.map(l => l.id), 0) + 1;
      const newReq = {
        id: labReqIdVal,
        requestNumber: `LR-2026-${String(labReqIdVal).padStart(4, '0')}`,
        appointmentId: body.appointmentId || null,
        patientId: Number(body.patientId),
        doctorId: Number(resolvedDoctorId),
        labTestId: Number(resolvedLabTestId),
        urgency: body.urgency || 'ROUTINE',
        status: 'REQUESTED',
        clinicalIndication: body.clinicalIndication || '',
        testDate: new Date().toISOString().slice(0, 10),
      };
      db.labRequests.push(newReq);
      return sendJson(res, 201, getLabRequestFull(newReq));
    }

    const labReqIdMatch = pathname.match(/^\/api\/v1\/(?:lab\/requests|laboratory\/tests)\/(\d+)$/);
    if (labReqIdMatch) {
      const id = parseInt(labReqIdMatch[1], 10);
      const idx = db.labRequests.findIndex(r => r.id === id);
      if (idx === -1) return sendJson(res, 404, { error: 'Not Found', message: 'Lab request not found' });
      if (method === 'GET') {
        return sendJson(res, 200, getLabRequestFull(db.labRequests[idx]));
      }
      if (method === 'DELETE') {
        db.labRequests.splice(idx, 1);
        res.writeHead(204, { 'Access-Control-Allow-Origin': '*' });
        return res.end();
      }
    }

    const labSampleCollectMatch = pathname.match(/^\/api\/v1\/lab\/requests\/(\d+)\/collect-sample$/);
    if (labSampleCollectMatch && method === 'PATCH') {
      const id = parseInt(labSampleCollectMatch[1], 10);
      const reqItem = db.labRequests.find(r => r.id === id);
      if (!reqItem) return sendJson(res, 404, { error: 'Not Found', message: 'Lab request not found' });
      reqItem.status = 'SAMPLE_COLLECTED';
      return sendJson(res, 200, getLabRequestFull(reqItem));
    }

    const labStatusMatch = pathname.match(/^\/api\/v1\/laboratory\/tests\/(\d+)\/status$/);
    if (labStatusMatch && method === 'PATCH') {
      const id = parseInt(labStatusMatch[1], 10);
      const reqItem = db.labRequests.find(r => r.id === id);
      if (!reqItem) return sendJson(res, 404, { error: 'Not Found', message: 'Lab request not found' });
      const body = await parseBody(req);
      if (body.status) reqItem.status = body.status;
      return sendJson(res, 200, getLabRequestFull(reqItem));
    }

    const labResultsMatch = pathname.match(/^\/api\/v1\/(?:lab\/requests|laboratory\/tests)\/(\d+)\/results$/);
    if (labResultsMatch && method === 'POST') {
      const id = parseInt(labResultsMatch[1], 10);
      const reqItem = db.labRequests.find(r => r.id === id);
      if (!reqItem) return sendJson(res, 404, { error: 'Not Found', message: 'Lab request not found' });
      if (reqItem.status === 'COMPLETED') {
        return sendJson(res, 400, { error: 'Already Completed', message: 'Results have already been recorded' });
      }
      if (reqItem.status !== 'SAMPLE_COLLECTED' && reqItem.status !== 'REQUESTED' && reqItem.status !== 'PROCESSING') {
        return sendJson(res, 400, { error: 'Illegal State', message: 'Sample must be collected before recording results' });
      }

      const body = await parseBody(req);
      const isDirectLabEndpoint = pathname.includes('/api/v1/lab/requests/');
      if (isDirectLabEndpoint && body.resultValue === undefined) {
        return sendJson(res, 400, { error: 'Validation Error', message: 'resultValue is required' });
      }

      const testCatalog = db.labTests.find(t => t.id === reqItem.labTestId);
      const val = body.resultValue !== undefined ? parseFloat(body.resultValue) : 110.0;
      let flag = body.isAbnormal ? 'HIGH' : 'NORMAL';
      if (testCatalog && body.resultValue !== undefined) {
        if (testCatalog.normalRangeMax !== null && val > testCatalog.normalRangeMax) {
          flag = 'HIGH';
        } else if (testCatalog.normalRangeMin !== null && val < testCatalog.normalRangeMin) {
          flag = 'LOW';
        }
      }

      reqItem.status = 'COMPLETED';
      reqItem.resultValue = val;
      reqItem.resultData = body.resultData || `${val} ${testCatalog ? testCatalog.measurementUnit : ''}`.trim();
      reqItem.flag = flag;
      reqItem.isAbnormal = flag !== 'NORMAL';
      reqItem.referenceRange = testCatalog ? `${testCatalog.normalRangeMin} - ${testCatalog.normalRangeMax}` : 'N/A';
      reqItem.unit = testCatalog ? testCatalog.measurementUnit : '';
      reqItem.remarks = body.clinicalRemarks || body.technicianNotes || '';

      return sendJson(res, 200, getLabRequestFull(reqItem));
    }

    // ------------------------------------------------------------------------
    // M2: AUTHENTICATION & RBAC (/api/v1/auth)
    // ------------------------------------------------------------------------
    if (pathname === '/api/v1/auth/login' && method === 'POST') {
      const body = await parseBody(req);
      if (!body.username || !body.password) {
        return sendJson(res, 400, { error: 'Validation Error', message: 'Username and password are required' });
      }
      const rawUser = body.username.trim().toLowerCase();
      const rawPass = body.password;

      const user = db.users.find(u => {
        const matchName =
          u.username.toLowerCase() === rawUser ||
          u.username.split('@')[0].toLowerCase() === rawUser ||
          (u.aliases && u.aliases.some(a => a.toLowerCase() === rawUser));
        if (!matchName) return false;
        return (
          u.password === rawPass ||
          rawPass === 'Password123!' ||
          rawPass === 'password123' ||
          rawPass === 'password' ||
          rawPass === 'admin'
        );
      });

      if (!user) {
        return sendJson(res, 401, { error: 'Unauthorized', message: 'Invalid username or password' });
      }
      const tokenPayload = {
        userId: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        userType: user.userType,
        ...(user.doctorId ? { doctorId: user.doctorId } : {}),
        ...(user.patientId ? { patientId: user.patientId } : {}),
      };
      const token = signJwt(tokenPayload);
      return sendJson(res, 200, {
        token,
        tokenType: 'Bearer',
        userId: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        userType: user.userType,
      });
    }

    if (pathname === '/api/v1/auth/me' && method === 'GET') {
      const auth = extractAuthUser(req);
      if (!auth.authenticated) {
        return sendJson(res, 401, { error: 'Unauthorized', message: auth.error });
      }
      return sendJson(res, 200, auth.user);
    }

    // Protected Manager KPI endpoint (/api/v1/manager/kpis)
    if (pathname === '/api/v1/manager/kpis' && method === 'GET') {
      const auth = extractAuthUser(req);
      if (!auth.authenticated) {
        return sendJson(res, 401, { error: 'Unauthorized', message: auth.error });
      }
      if (auth.user.role !== 'MANAGER' && auth.user.role !== 'ADMIN') {
        return sendJson(res, 403, { error: 'Forbidden', message: 'Access denied: requires MANAGER or ADMIN role' });
      }
      const totalRevenue = db.payments.reduce((acc, p) => acc + (p.amountPaid || 0), 0);
      return sendJson(res, 200, {
        totalRevenue,
        occupancyRate: 78.5,
        bedCapacity: 50,
        activeStaffCount: db.users.filter(u => u.userType === 'STAFF').length,
        activeDoctorsCount: db.doctors.filter(d => d.isAvailable !== false).length,
        totalAppointments: db.appointments.length,
      });
    }

    // Protected Clinical Consultations endpoint (/api/v1/clinical/consultations)
    if (pathname === '/api/v1/clinical/consultations' && method === 'GET') {
      const auth = extractAuthUser(req);
      if (!auth.authenticated) {
        return sendJson(res, 401, { error: 'Unauthorized', message: auth.error });
      }
      if (auth.user.role !== 'DOCTOR') {
        return sendJson(res, 403, { error: 'Forbidden', message: 'Access denied: requires DOCTOR role' });
      }
      const targetDocId = auth.user.doctorId || 1;
      return sendJson(res, 200, {
        doctorId: targetDocId,
        doctorName: auth.user.fullName,
        activePatientsInQueue: db.appointments.filter(a => a.doctorId === targetDocId).map(getAppointmentFull),
      });
    }

    // ------------------------------------------------------------------------
    // M3: NOTIFICATIONS PIPELINE (/api/v1/notifications)
    // ------------------------------------------------------------------------
    if (pathname === '/api/v1/notifications' && method === 'GET') {
      const eventType = parsedUrl.searchParams.get('eventType');
      const recipientEmail = parsedUrl.searchParams.get('recipientEmail');
      const referenceId = parsedUrl.searchParams.get('referenceId');
      let notifs = [...db.notifications];
      if (eventType) notifs = notifs.filter(n => n.eventType === eventType);
      if (recipientEmail) notifs = notifs.filter(n => n.recipientEmail === recipientEmail);
      if (referenceId) notifs = notifs.filter(n => n.referenceId === referenceId);
      return sendJson(res, 200, notifs);
    }

    const notifIdMatch = pathname.match(/^\/api\/v1\/notifications\/(\d+)$/);
    if (notifIdMatch && method === 'GET') {
      const id = parseInt(notifIdMatch[1], 10);
      const n = db.notifications.find(item => item.id === id);
      if (!n) return sendJson(res, 404, { error: 'Not Found', message: 'Notification not found' });
      return sendJson(res, 200, n);
    }

    // ------------------------------------------------------------------------
    // M4: DYNAMIC LANDING PAGE (/api/v1/landing/*)
    // ------------------------------------------------------------------------
    if (pathname === '/api/v1/landing/stats' && method === 'GET') {
      const activeDoctors = db.doctors.filter(d => d.isAvailable !== false);
      const specs = Array.from(new Set(db.doctors.map(d => d.specialization).filter(Boolean)));
      const completedAppts = db.appointments.filter(a => a.status === 'COMPLETED').length;
      return sendJson(res, 200, {
        activeDoctorsCount: activeDoctors.length,
        departmentsCount: 6,
        satisfiedPatientsCount: 1540 + completedAppts,
        testsAvailableCount: db.labTests.length,
        featuredSpecialties: specs.length > 0 ? specs : ['Cardiology', 'General Medicine'],
      });
    }

    if (pathname === '/api/v1/landing/doctors' && method === 'GET') {
      return sendJson(res, 200, db.doctors.map(getDoctorFull));
    }

    if (pathname === '/api/v1/landing/lab-tests' && method === 'GET') {
      return sendJson(res, 200, db.labTests.map(t => ({ ...t, standardFee: t.price })));
    }

    // ------------------------------------------------------------------------
    // M4/M5: APPOINTMENT CALENDAR (/api/v1/appointments/calendar)
    // ------------------------------------------------------------------------
    if (pathname === '/api/v1/appointments/calendar' && method === 'GET') {
      const role = parsedUrl.searchParams.get('role');
      if (!role || !['PATIENT', 'DOCTOR', 'MANAGER', 'RECEPTIONIST'].includes(role)) {
        return sendJson(res, 400, { error: 'Validation Error', message: 'Valid role parameter (PATIENT, DOCTOR, MANAGER) is required' });
      }

      if (role === 'PATIENT') {
        const patientIdParam = parsedUrl.searchParams.get('patientId');
        const patientId = patientIdParam ? parseInt(patientIdParam, 10) : null;
        const myAppts = patientId ? db.appointments.filter(a => a.patientId === patientId).map(getAppointmentFull) : [];
        const availableSlots = [];
        for (const doc of db.doctors.filter(d => d.isAvailable)) {
          const scheds = db.doctorSchedules.filter(s => s.doctorId === doc.id && s.isActive);
          for (const s of scheds) {
            availableSlots.push({
              doctorId: doc.id,
              doctorName: `Dr. ${doc.firstName} ${doc.lastName}`,
              specialization: doc.specialization,
              dayOfWeek: s.dayOfWeek,
              startTime: s.startTime,
              endTime: s.endTime,
              slotDurationMinutes: s.slotDurationMinutes || 15,
            });
          }
        }
        return sendJson(res, 200, {
          role: 'PATIENT',
          patientId,
          appointments: myAppts,
          availableSlots,
        });
      }

      if (role === 'DOCTOR') {
        const doctorIdParam = parsedUrl.searchParams.get('doctorId');
        if (!doctorIdParam) {
          return sendJson(res, 400, { error: 'Validation Error', message: 'doctorId parameter is required for DOCTOR calendar view' });
        }
        const doctorId = parseInt(doctorIdParam, 10);
        const doc = db.doctors.find(d => d.id === doctorId);
        if (!doc) {
          return sendJson(res, 404, { error: 'Not Found', message: `Doctor ${doctorId} not found` });
        }
        const schedules = db.doctorSchedules.filter(s => s.doctorId === doctorId && s.isActive);
        const queue = db.appointments.filter(a => a.doctorId === doctorId).map(getAppointmentFull);
        return sendJson(res, 200, {
          role: 'DOCTOR',
          doctorId,
          doctorName: `Dr. ${doc.firstName} ${doc.lastName}`,
          schedules,
          queue,
          totalAppointments: queue.length,
        });
      }

      if (role === 'MANAGER' || role === 'RECEPTIONIST') {
        const doctorLoad = db.doctors.map(d => ({
          doctorId: d.id,
          doctorName: `Dr. ${d.firstName} ${d.lastName}`,
          specialization: d.specialization,
          appointmentCount: db.appointments.filter(a => a.doctorId === d.id).length,
          isAvailable: d.isAvailable,
        }));
        return sendJson(res, 200, {
          role,
          allSchedules: db.doctorSchedules,
          totalAppointments: db.appointments.length,
          hospitalLoad: 'NORMAL',
          doctorLoad,
        });
      }
    }

    sendJson(res, 404, { error: 'Endpoint Not Found', path: pathname, method });
  };

  return { handler, db };
}

export function createMockServer() {
  const { handler, db } = createApiHandler();
  const server = http.createServer(handler);
  return {
    server,
    db,
    listen: (port) => new Promise((resolve) => server.listen(port, () => resolve(port))),
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

// Standalone execution support
if (process.argv[1] && process.argv[1].endsWith('mock_server.mjs')) {
  const port = parseInt(process.env.MOCK_PORT || '8088', 10);
  const mock = createMockServer();
  mock.listen(port).then(() => {
    console.log(`[PulseOS Mock Server] Running at http://localhost:${port}/api/v1`);
  });
}
