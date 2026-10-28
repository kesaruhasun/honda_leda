import { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { mockStore } from './mockStore';
import { PayHereParams } from '../../types';

export class MockServer {
  public async handle(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
    const method = (config.method || 'get').toLowerCase();
    const url = config.url || '';
    
    // Normalize URL path removing baseURL and query string
    let path = url.replace(/^https?:\/\/[^\/]+/, '');
    path = path.replace(/^\/api\/v1/, '');
    const [cleanPath, queryString] = path.split('?');
    const query = new URLSearchParams(queryString || '');
    
    let body: any = null;
    if (config.data) {
      try {
        body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      } catch {
        body = config.data;
      }
    }

    // Small simulated network latency (80ms - 200ms) for snappy, realistic UX
    await new Promise((resolve) => setTimeout(resolve, 80 + Math.random() * 80));

    try {
      const data = this.route(method, cleanPath, query, body);
      return {
        data,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config,
      };
    } catch (err: any) {
      const status = err.status || 400;
      const message = err.message || 'Operation failed';
      return Promise.reject({
        response: {
          data: { message, error: message },
          status,
          statusText: status === 404 ? 'Not Found' : 'Bad Request',
          headers: {},
          config,
        },
      });
    }
  }

  private route(method: string, path: string, query: URLSearchParams, body: any): any {
    // --- 1. Authentication ---
    if (path === '/auth/login' && method === 'post') {
      const username = (body?.username || '').trim().toLowerCase();
      
      // Clinical Staff accounts
      if (username === 'it25103753' || username === 'admin' || username === 'kesaru') {
        return {
          token: 'demo-jwt-token-admin-' + Date.now(),
          tokenType: 'Bearer',
          userId: 105,
          username: 'it25103753',
          fullName: 'Kesaru Hasun (Admin)',
          role: 'CASHIER_ADMIN',
          userType: 'STAFF',
          department: 'Hospital Administration & IT',
          roleTitle: 'Hospital Administrator',
        };
      }
      if (username === 'it25103999' || username === 'doctor' || username === 'kavinda') {
        return {
          token: 'demo-jwt-token-doc-' + Date.now(),
          tokenType: 'Bearer',
          userId: 101,
          username: 'it25103999',
          fullName: 'Dr. Kavinda Rathnayaka',
          role: 'DOCTOR',
          userType: 'STAFF',
          department: 'Cardiology & Cardiovascular Care',
          roleTitle: 'Consultant Cardiologist',
        };
      }
      if (username === 'it25104057' || username === 'receptionist' || username === 'tharindu') {
        return {
          token: 'demo-jwt-token-rec-' + Date.now(),
          tokenType: 'Bearer',
          userId: 102,
          username: 'it25104057',
          fullName: 'Tharindu Madhusanka',
          role: 'RECEPTIONIST',
          userType: 'STAFF',
          department: 'Admissions & Outpatient Triage',
          roleTitle: 'Outpatient Triage Officer',
        };
      }
      if (username === 'it25103821' || username === 'pharmacist' || username === 'harshika') {
        return {
          token: 'demo-jwt-token-phm-' + Date.now(),
          tokenType: 'Bearer',
          userId: 103,
          username: 'it25103821',
          fullName: 'Harshika Udumulla, BPharm',
          role: 'PHARMACIST',
          userType: 'STAFF',
          department: 'Hospital Central Pharmacy',
          roleTitle: 'Head Pharmacist',
        };
      }
      if (username === 'it25104293' || username === 'lab' || username === 'nethuli') {
        return {
          token: 'demo-jwt-token-lab-' + Date.now(),
          tokenType: 'Bearer',
          userId: 104,
          username: 'it25104293',
          fullName: 'Nethuli Perera, MLT',
          role: 'LAB_TECHNICIAN',
          userType: 'STAFF',
          department: 'Clinical Pathology & Diagnostics',
          roleTitle: 'Senior Pathology Technologist',
        };
      }
      if (username === 'it25104125' || username === 'chamudi') {
        return {
          token: 'demo-jwt-token-surg-' + Date.now(),
          tokenType: 'Bearer',
          userId: 106,
          username: 'it25104125',
          fullName: 'Dr. Chamudi Wijesinghe',
          role: 'DOCTOR',
          userType: 'STAFF',
          department: 'General Surgery & Trauma',
          roleTitle: 'General & Trauma Surgeon',
        };
      }

      // Patient accounts
      const patient = mockStore.getPatientByNic(username);
      if (patient) {
        return {
          token: 'demo-jwt-token-patient-' + patient.id + '-' + Date.now(),
          tokenType: 'Bearer',
          userId: patient.id,
          username: patient.nicPassportNo,
          fullName: patient.fullName || `${patient.firstName} ${patient.lastName}`,
          role: 'PATIENT',
          userType: 'PATIENT',
        };
      }

      // Fallback: If unknown username, generate demo patient or receptionist session
      return {
        token: 'demo-jwt-token-generic-' + Date.now(),
        tokenType: 'Bearer',
        userId: 99,
        username: username,
        fullName: username.includes('@') ? username.split('@')[0] : 'Demo User',
        role: username.includes('doc') ? 'DOCTOR' : 'RECEPTIONIST',
        userType: 'STAFF',
      };
    }

    if (path === '/auth/me' && method === 'get') {
      return {
        userId: 101,
        username: 'it25103999',
        fullName: 'Dr. Kavinda Rathnayaka',
        role: 'DOCTOR',
        userType: 'STAFF',
        department: 'Cardiology & Cardiovascular Care',
        roleTitle: 'Consultant Cardiologist',
      };
    }

    if (path === '/auth/change-password' && method === 'post') {
      return { success: true, message: 'Password updated successfully in demo mode.' };
    }

    if (path === '/auth/forgot-password' && method === 'post') {
      return { success: true, message: 'Password reset link simulated and sent to your email.' };
    }

    // --- 2. Patients API ---
    if (path === '/patients') {
      if (method === 'get') {
        return mockStore.getPatients().filter((p) => !p.isArchived);
      }
      if (method === 'post') {
        return mockStore.savePatient(body || {});
      }
    }

    if (path === '/patients/archived' && method === 'get') {
      return mockStore.getPatients().filter((p) => p.isArchived);
    }

    if (path.startsWith('/patients/nic/')) {
      const nic = decodeURIComponent(path.replace('/patients/nic/', ''));
      const p = mockStore.getPatientByNic(nic);
      if (!p) throw { status: 404, message: 'Patient not found' };
      return p;
    }

    if (path === '/patients/search') {
      const q = (query.get('q') || '').toLowerCase();
      return mockStore.getPatients().filter((p) =>
        (p.fullName && p.fullName.toLowerCase().includes(q)) ||
        (p.firstName && p.firstName.toLowerCase().includes(q)) ||
        (p.lastName && p.lastName.toLowerCase().includes(q)) ||
        (p.nicPassportNo && p.nicPassportNo.toLowerCase().includes(q)) ||
        (p.phoneNumber && p.phoneNumber.includes(q))
      );
    }

    const patientMatch = path.match(/^\/patients\/(\d+)$/);
    if (patientMatch) {
      const id = parseInt(patientMatch[1]);
      if (method === 'get') {
        const p = mockStore.getPatientById(id);
        if (!p) throw { status: 404, message: 'Patient not found' };
        return p;
      }
      if (method === 'put') {
        return mockStore.savePatient({ id, ...body });
      }
    }

    const archiveMatch = path.match(/^\/patients\/(\d+)\/archive$/);
    if (archiveMatch && method === 'post') {
      return mockStore.archivePatient(parseInt(archiveMatch[1]), body?.reason);
    }

    const restoreMatch = path.match(/^\/patients\/(\d+)\/restore$/);
    if (restoreMatch && method === 'post') {
      return mockStore.restorePatient(parseInt(restoreMatch[1]));
    }

    // --- 3. Doctors API ---
    if (path === '/doctors') {
      if (method === 'get') return mockStore.getDoctors();
      if (method === 'post') return { id: Date.now(), ...body };
    }

    const doctorMatch = path.match(/^\/doctors\/(\d+)$/);
    if (doctorMatch && method === 'get') {
      const d = mockStore.getDoctorById(parseInt(doctorMatch[1]));
      if (!d) throw { status: 404, message: 'Doctor not found' };
      return d;
    }

    const doctorSchedMatch = path.match(/^\/doctors\/(\d+)\/schedules$/);
    if (doctorSchedMatch) {
      const docId = parseInt(doctorSchedMatch[1]);
      if (method === 'get') return mockStore.getDoctorSchedules(docId);
      if (method === 'post') return mockStore.addDoctorSchedule(docId, body);
    }

    const doctorAvailMatch = path.match(/^\/doctors\/(\d+)\/availability$/);
    if (doctorAvailMatch && method === 'patch') {
      return mockStore.toggleDoctorAvailability(parseInt(doctorAvailMatch[1]), body?.isAvailable);
    }

    const doctorFeeMatch = path.match(/^\/doctors\/(\d+)\/fee$/);
    if (doctorFeeMatch && method === 'patch') {
      return mockStore.updateDoctorFee(parseInt(doctorFeeMatch[1]), body?.consultationFee);
    }

    const deleteSchedMatch = path.match(/^\/doctors\/(\d+)\/schedules\/(\d+)$/);
    if (deleteSchedMatch && method === 'delete') {
      mockStore.deleteDoctorSchedule(parseInt(deleteSchedMatch[2]));
      return { message: 'Schedule deleted' };
    }

    // --- 4. Appointments API ---
    if (path === '/appointments') {
      if (method === 'get') return mockStore.getAppointments();
      if (method === 'post') return mockStore.createAppointment(body);
    }

    if (path === '/appointments/today' && method === 'get') {
      return mockStore.getTodayAppointments();
    }

    if (path === '/appointments/calendar' && method === 'get') {
      const apts = mockStore.getAppointments();
      return {
        events: apts.map((a) => ({
          id: a.id,
          title: `${a.patientName} (${a.specialization})`,
          start: `${a.appointmentDate}T${a.appointmentTime}:00`,
          status: a.status,
          doctorName: a.doctorName,
          room: a.roomNumber,
        })),
      };
    }

    const aptReschedule = path.match(/^\/appointments\/(\d+)\/reschedule$/);
    if (aptReschedule && method === 'patch') {
      return mockStore.rescheduleAppointment(
        parseInt(aptReschedule[1]),
        body?.appointmentDate,
        body?.appointmentTime
      );
    }

    const aptCancel = path.match(/^\/appointments\/(\d+)\/cancel$/);
    if (aptCancel && method === 'patch') {
      return mockStore.cancelAppointment(parseInt(aptCancel[1]), body?.reason);
    }

    const aptComplete = path.match(/^\/appointments\/(\d+)\/complete$/);
    if (aptComplete && method === 'patch') {
      return mockStore.completeAppointment(parseInt(aptComplete[1]));
    }

    const aptDelete = path.match(/^\/appointments\/(\d+)$/);
    if (aptDelete && method === 'delete') {
      return { message: 'Appointment removed' };
    }

    // --- 5. Pharmacy API ---
    if (path === '/pharmacy/drugs' && method === 'get') {
      return mockStore.getDrugs();
    }

    if (path === '/pharmacy/drugs/low-stock' && method === 'get') {
      return mockStore.getLowStockDrugs();
    }

    if (path === '/pharmacy/dispense' && method === 'post') {
      return mockStore.dispenseDrug(body);
    }

    if (path === '/pharmacy/dispensations' && method === 'get') {
      return [];
    }

    // --- 6. Laboratory API ---
    if (path === '/laboratory/catalog' && method === 'get') {
      return mockStore.getLabCatalog();
    }

    if (path === '/laboratory/tests') {
      if (method === 'get') return mockStore.getLabTests();
      if (method === 'post') return mockStore.orderLabTest(body);
    }

    const labStatusMatch = path.match(/^\/laboratory\/tests\/(\d+)\/status$/);
    if (labStatusMatch && method === 'patch') {
      return mockStore.updateLabTestStatus(parseInt(labStatusMatch[1]), body?.status);
    }

    const labResultsMatch = path.match(/^\/laboratory\/tests\/(\d+)\/results$/);
    if (labResultsMatch && method === 'post') {
      return mockStore.submitLabResults(parseInt(labResultsMatch[1]), body);
    }

    // --- 7. Billing API ---
    if (path === '/billing/invoices') {
      if (method === 'get') return mockStore.getInvoices();
    }

    if (path === '/billing/invoices/pending' && method === 'get') {
      return mockStore.getInvoices().filter((i) => i.status === 'PENDING');
    }

    if (path === '/billing/invoices/paid' && method === 'get') {
      return mockStore.getInvoices().filter((i) => i.status === 'PAID');
    }

    const invPatientMatch = path.match(/^\/billing\/invoices\/patient\/(\d+)$/);
    if (invPatientMatch && method === 'get') {
      const pid = parseInt(invPatientMatch[1]);
      return mockStore.getInvoices().filter((i) => i.patientId === pid);
    }

    const invPayMatch = path.match(/^\/billing\/invoices\/(\d+)\/pay$/);
    if (invPayMatch && method === 'post') {
      return mockStore.settleInvoice(
        parseInt(invPayMatch[1]),
        body?.paymentMethod || 'CARD',
        body?.transactionRef
      );
    }

    const invSettleMatch = path.match(/^\/billing\/invoices\/(\d+)\/settle$/);
    if (invSettleMatch && method === 'post') {
      return mockStore.settleInvoice(
        parseInt(invSettleMatch[1]),
        body?.paymentMethod || 'CARD',
        body?.transactionRef
      );
    }

    if (path === '/payments/payhere/initiate' && method === 'get') {
      const invId = parseInt(query.get('invoiceId') || '1');
      const inv = mockStore.getInvoices().find((i) => i.id === invId);
      const params: PayHereParams = {
        merchant_id: '1220001',
        return_url: `${window.location.origin}/patient/portal?tab=billing&payment=success&order_id=${inv?.invoiceNumber || 'INV-2026-0001'}`,
        cancel_url: `${window.location.origin}/patient/portal?tab=billing&payment=cancelled`,
        notify_url: `${window.location.origin}/api/v1/payments/payhere/notify`,
        order_id: inv?.invoiceNumber || `INV-2026-${invId}`,
        items: `Clinical Services - ${inv?.patientName || 'Patient'}`,
        amount: (inv?.totalAmount || 5000).toFixed(2),
        currency: 'LKR',
        hash: 'DEMO_MOCK_PAYHERE_HASH_2026',
        first_name: inv?.patientName?.split(' ')[0] || 'Kamal',
        last_name: inv?.patientName?.split(' ').slice(1).join(' ') || 'Gunaratne',
        email: 'manetexts@gmail.com',
        phone: '+94771234567',
        address: 'No. 45, Temple Road',
        city: 'Colombo',
        country: 'Sri Lanka',
      };
      return params;
    }

    // --- 8. Wards & Bed Admissions ---
    if (path === '/wards' && method === 'get') {
      return mockStore.getWards();
    }

    if (path === '/wards/admissions' && method === 'get') {
      return mockStore.getAdmissions();
    }

    // --- 9. Landing & Stats API ---
    if (path === '/landing/stats' && method === 'get') {
      return mockStore.getStats();
    }

    if (path === '/landing/doctors' && method === 'get') {
      return mockStore.getDoctors().map((d) => ({
        id: d.id,
        fullName: d.fullName || `Dr. ${d.firstName} ${d.lastName}`,
        specialization: d.specialization,
        roomNumber: d.roomNumber,
        consultationFee: d.consultationFee,
        isAvailable: d.isAvailable,
      }));
    }

    if (path === '/landing/lab-tests' && method === 'get') {
      return mockStore.getLabCatalog();
    }

    // --- 10. Notifications ---
    if (path === '/notifications' && method === 'get') {
      return mockStore.getNotifications();
    }

    // Generic fallback for any unrecognized endpoints
    return [];
  }
}

export const mockServer = new MockServer();
