package com.pulseos;

import com.pulseos.appointment.*;
import com.pulseos.billing.*;
import com.pulseos.common.*;
import com.pulseos.doctor.*;
import com.pulseos.laboratory.*;
import com.pulseos.patient.*;
import com.pulseos.pharmacy.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("demo")
class PulseOsApplicationTests {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DrugRepository drugRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private LabTestRepository labTestRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Test
    @DisplayName("Spring ApplicationContext loads cleanly with demo H2 profile")
    void contextLoads() {
        assertThat(departmentRepository).isNotNull();
        assertThat(doctorRepository).isNotNull();
    }

    @Test
    @DisplayName("DataSeeder successfully seeds all 7 departments and 6 SLIIT staff members")
    void verifyStaffAndDepartmentsSeeded() {
        assertThat(departmentRepository.count()).isEqualTo(7);
        assertThat(employeeRepository.count()).isGreaterThanOrEqualTo(6);

        // Verify Doctor Kavinda (Group 60)
        List<Doctor> doctors = doctorRepository.findBySpecialization("Cardiology");
        assertThat(doctors).isNotEmpty();
        Doctor kavinda = doctors.get(0);
        assertThat(kavinda.getFirstName()).isEqualTo("Kavinda");
        assertThat(kavinda.getLastName()).isEqualTo("Rathnayaka");
        assertThat(kavinda.getEmployeeRole()).isEqualTo(EmployeeRole.DOCTOR);
        assertThat(kavinda.getDoctorLicenseNo()).isEqualTo("SLMC-48291");
        assertThat(kavinda.getConsultationFee()).isEqualByComparingTo(new BigDecimal("3500.00"));
    }

    @Test
    @DisplayName("DataSeeder successfully seeds 13 patients (12 clinical + 1 demo) and 23 drugs with low stock triggers")
    void verifyPatientsAndDrugsSeeded() {
        List<Patient> activePatients = patientRepository.findByIsArchivedFalse();
        assertThat(activePatients).hasSize(13);

        assertThat(drugRepository.count()).isEqualTo(23);
        assertThat(drugRepository.findLowStockDrugs()).hasSize(6);
    }

    @Test
    @DisplayName("DataSeeder successfully seeds clinical encounters, lab tests, and aggregated invoices")
    void verifyClinicalEncountersAndInvoices() {
        assertThat(appointmentRepository.count()).isEqualTo(5);
        assertThat(labTestRepository.count()).isEqualTo(6);

        List<Invoice> paidInvoices = invoiceRepository.findByPaymentStatus(PaymentStatus.PAID);
        assertThat(paidInvoices).isNotEmpty();
        Invoice settledInv = paidInvoices.get(0);
        // Doctor 3500 + Drugs 2190 + Lab 2200 = 7890.00
        assertThat(settledInv.getTotalAmount()).isEqualByComparingTo(new BigDecimal("7890.00"));

        List<Invoice> pendingInvoices = invoiceRepository.findByPaymentStatus(PaymentStatus.PENDING);
        assertThat(pendingInvoices).isNotEmpty();
        Invoice pendingInv = pendingInvoices.get(0);
        // Doctor 3500 + Lab 650 = 4150.00
        assertThat(pendingInv.getTotalAmount()).isEqualByComparingTo(new BigDecimal("4150.00"));
    }
}
