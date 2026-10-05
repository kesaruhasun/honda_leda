package com.pulseos.challenge;

import com.pulseos.patient.*;
import com.pulseos.doctor.*;
import com.pulseos.appointment.*;
import com.pulseos.pharmacy.*;
import com.pulseos.laboratory.*;
import com.pulseos.billing.*;
import com.pulseos.common.*;
import com.pulseos.seeder.DataSeeder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("demo")
public class PersistenceEmpiricalChallengeTest {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private PersonRepository personRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private DrugRepository drugRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private LabTestRepository labTestRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private PrescriptionItemRepository prescriptionItemRepository;

    @Autowired
    private InvoiceDrugItemRepository invoiceDrugItemRepository;

    @Autowired
    private InvoiceLabItemRepository invoiceLabItemRepository;

    @Autowired
    private PatientAdmissionRepository patientAdmissionRepository;

    @Autowired
    private WardRepository wardRepository;

    @Autowired
    private DoctorScheduleRepository doctorScheduleRepository;

    @Autowired
    private DataSeeder dataSeeder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private Long dynamicTestAppointmentId;

    @AfterEach
    void tearDown() {
        if (dynamicTestAppointmentId != null) {
            appointmentRepository.findById(dynamicTestAppointmentId).ifPresent(appointmentRepository::delete);
            dynamicTestAppointmentId = null;
        }
        // Clean up any test records with future dates >= 2026-12-01
        jdbcTemplate.update("DELETE FROM appointments WHERE appointment_date >= '2026-12-01'");
        // Clean up any dynamically seeded test doctors or patients respecting Table-Per-Type FK order
        jdbcTemplate.update("DELETE FROM doctors WHERE employee_id IN (SELECT person_id FROM persons WHERE nic_passport_no IN ('888888888V', '999999999V'))");
        jdbcTemplate.update("DELETE FROM employees WHERE employee_id IN (SELECT person_id FROM persons WHERE nic_passport_no IN ('888888888V', '999999999V'))");
        jdbcTemplate.update("DELETE FROM patients WHERE patient_id IN (SELECT person_id FROM persons WHERE nic_passport_no IN ('888888888V', '999999999V'))");
        jdbcTemplate.update("DELETE FROM persons WHERE nic_passport_no IN ('888888888V', '999999999V')");
    }

    @Nested
    @DisplayName("Challenge 1: Double-Booking Unique Constraint Stress-Testing")
    class DoubleBookingConstraintTests {

        @Test
        @DisplayName("Inserting duplicate appointment into pre-seeded doctor slot must fail with DataIntegrityViolationException")
        void testDuplicateSeededDoctorSlotFails() {
            List<Doctor> doctors = doctorRepository.findBySpecialization("Cardiology");
            assertThat(doctors).isNotEmpty();
            Doctor docKavinda = doctors.get(0);

            List<Patient> patients = patientRepository.findByIsArchivedFalse();
            assertThat(patients).hasSizeGreaterThanOrEqualTo(2);
            Patient patient2 = patients.get(1);

            // In DataSeeder: docKavinda has apt1 on LocalDate.now() at 09:30:00
            LocalDate seededDate = LocalDate.now();
            LocalTime seededTime = LocalTime.of(9, 30);

            Appointment duplicateAppointment = new Appointment(
                    null,
                    patient2,
                    docKavinda,
                    LocalDateTime.now(),
                    "204",
                    seededDate,
                    seededTime,
                    AppointmentStatus.SCHEDULED,
                    "Adversarial double-booking attempt on seeded slot"
            );

            assertThatThrownBy(() -> appointmentRepository.saveAndFlush(duplicateAppointment))
                    .isInstanceOf(DataIntegrityViolationException.class);
        }

        @Test
        @DisplayName("Inserting two appointments for same doctor at same date and time slot must violate uq_doctor_slot at JPA level")
        void testDynamicDoubleBookingFailsAtJpaLevel() {
            List<Doctor> doctors = doctorRepository.findBySpecialization("Cardiology");
            Doctor doc = doctors.get(0);

            List<Patient> patients = patientRepository.findByIsArchivedFalse();
            Patient patientA = patients.get(0);
            Patient patientB = patients.get(1);

            LocalDate testDate = LocalDate.of(2026, 12, 15);
            LocalTime testTime = LocalTime.of(14, 0);

            // Step 1: Initial booking should succeed
            Appointment aptA = new Appointment(
                    null,
                    patientA,
                    doc,
                    LocalDateTime.now(),
                    "204",
                    testDate,
                    testTime,
                    AppointmentStatus.SCHEDULED,
                    "First legitimate consultation booking"
            );
            Appointment savedA = appointmentRepository.saveAndFlush(aptA);
            dynamicTestAppointmentId = savedA.getAppointmentId();
            assertThat(savedA.getAppointmentId()).isNotNull();

            // Step 2: Second booking for same doctor, same date, same time (different patient) MUST fail
            Appointment aptB = new Appointment(
                    null,
                    patientB,
                    doc,
                    LocalDateTime.now(),
                    "204",
                    testDate,
                    testTime,
                    AppointmentStatus.SCHEDULED,
                    "Conflicting overlapping booking attempt"
            );

            assertThatThrownBy(() -> appointmentRepository.saveAndFlush(aptB))
                    .isInstanceOf(DataIntegrityViolationException.class);
        }

        @Test
        @DisplayName("Inserting duplicate slot directly via JDBC raw SQL must fail on database constraint uq_doctor_slot")
        void testDoubleBookingFailsAtJdbcLevel() {
            List<Doctor> doctors = doctorRepository.findBySpecialization("Cardiology");
            Doctor doc = doctors.get(0);
            List<Patient> patients = patientRepository.findByIsArchivedFalse();
            Patient p1 = patients.get(0);
            Patient p2 = patients.get(1);

            LocalDate sqlDate = LocalDate.of(2026, 12, 20);
            LocalTime sqlTime = LocalTime.of(16, 0);

            String insertSql = "INSERT INTO appointments (patient_id, doctor_id, booking_date, room_number, appointment_date, appointment_time, status, reason_for_visit) " +
                    "VALUES (?, ?, CURRENT_TIMESTAMP, '301', ?, ?, 'SCHEDULED', 'Raw JDBC test')";

            // First insert succeeds
            int rows1 = jdbcTemplate.update(insertSql, p1.getId(), doc.getId(), Date.valueOf(sqlDate), Time.valueOf(sqlTime));
            assertThat(rows1).isEqualTo(1);

            // Second insert for same doctor, date, time must throw DataIntegrityViolationException
            assertThatThrownBy(() -> jdbcTemplate.update(insertSql, p2.getId(), doc.getId(), Date.valueOf(sqlDate), Time.valueOf(sqlTime)))
                    .isInstanceOf(DataIntegrityViolationException.class);
        }

        @Test
        @DisplayName("Non-overlapping slots for same doctor or different doctors must succeed")
        void testNonOverlappingSlotsSucceed() {
            List<Doctor> doctors = doctorRepository.findBySpecialization("Cardiology");
            Doctor doc = doctors.get(0);
            List<Patient> patients = patientRepository.findByIsArchivedFalse();
            Patient p1 = patients.get(0);

            LocalDate baseDate = LocalDate.of(2026, 12, 25);

            // Same doctor, same date, different time (10:00 vs 10:30)
            Appointment slot1 = new Appointment(null, p1, doc, LocalDateTime.now(), "204", baseDate, LocalTime.of(10, 0), AppointmentStatus.SCHEDULED, "Morning slot 1");
            Appointment slot2 = new Appointment(null, p1, doc, LocalDateTime.now(), "204", baseDate, LocalTime.of(10, 30), AppointmentStatus.SCHEDULED, "Morning slot 2");

            Appointment saved1 = appointmentRepository.saveAndFlush(slot1);
            Appointment saved2 = appointmentRepository.saveAndFlush(slot2);

            assertThat(saved1.getAppointmentId()).isNotNull();
            assertThat(saved2.getAppointmentId()).isNotNull();
            assertThat(saved1.getAppointmentId()).isNotEqualTo(saved2.getAppointmentId());
        }
    }

    @Nested
    @DisplayName("Challenge 2: DataSeeder Idempotency Stress-Testing")
    class DataSeederIdempotencyTests {

        @Test
        @DisplayName("Invoking DataSeeder.run() 10 consecutive times must not duplicate records or throw constraint violations")
        void testRepeatedDataSeederExecutionsAreIdempotent() {
            // Snapshot baseline record counts
            long initialDeptCount = departmentRepository.count();
            long initialDocCount = doctorRepository.count();
            long initialPatCount = patientRepository.count();
            long initialEmpCount = employeeRepository.count();
            long initialDrugCount = drugRepository.count();
            long initialApptCount = appointmentRepository.count();
            long initialInvoiceCount = invoiceRepository.count();
            long initialLabCount = labTestRepository.count();
            long initialPersonCount = personRepository.count();

            assertThat(initialDeptCount).isGreaterThan(0);
            assertThat(initialDocCount).isGreaterThan(0);
            assertThat(initialPatCount).isGreaterThan(0);

            // Stress-test: Invoke run() 10 consecutive times
            for (int i = 1; i <= 10; i++) {
                dataSeeder.run();
            }

            // Assert strict equality across all entity tables (zero record inflation)
            assertThat(departmentRepository.count()).isEqualTo(initialDeptCount);
            assertThat(doctorRepository.count()).isEqualTo(initialDocCount);
            assertThat(patientRepository.count()).isEqualTo(initialPatCount);
            assertThat(employeeRepository.count()).isEqualTo(initialEmpCount);
            assertThat(drugRepository.count()).isEqualTo(initialDrugCount);
            assertThat(appointmentRepository.count()).isEqualTo(initialApptCount);
            assertThat(invoiceRepository.count()).isEqualTo(initialInvoiceCount);
            assertThat(labTestRepository.count()).isEqualTo(initialLabCount);
            assertThat(personRepository.count()).isEqualTo(initialPersonCount);
        }

        @Test
        @DisplayName("Verify that DataSeeder's guard prevents duplicate unique key insertions")
        void testDataSeederGuardPreventsCollisions() {
            // Check that department count acts as an atomic gateway
            long count = departmentRepository.count();
            assertThat(count).isEqualTo(7);

            // If we run the seeder again, it must silently complete without error
            dataSeeder.run("test-arg-1", "test-arg-2");

            // Verify Doctor Kavinda's unique license is still unique and exactly 1 record exists
            List<Doctor> docs = doctorRepository.findBySpecialization("Cardiology");
            assertThat(docs).hasSize(1);
            assertThat(docs.get(0).getDoctorLicenseNo()).isEqualTo("SLMC-48291");
        }
    }

    @Nested
    @DisplayName("Challenge 3: Table-Per-Type (TPT) Joined-Table Inheritance Verification")
    class TablePerTypeInheritanceTests {

        @Test
        @DisplayName("Querying Doctor entity joins persons -> employees -> doctors with consistent polymorphism")
        void testDoctorTablePerTypeJoin() {
            List<Doctor> doctors = doctorRepository.findBySpecialization("Cardiology");
            assertThat(doctors).isNotEmpty();
            Doctor doc = doctors.get(0);
            Long docId = doc.getId();

            // 1. Assert Person tier properties
            assertThat(doc.getFirstName()).isEqualTo("Kavinda");
            assertThat(doc.getLastName()).isEqualTo("Rathnayaka");
            assertThat(doc.getNicPassportNo()).isEqualTo("199912401829");
            assertThat(doc.getDateOfBirth()).isNotNull();
            assertThat(doc.getCity()).isEqualTo("Colombo");

            // 2. Assert Employee tier properties
            assertThat(doc.getSalary()).isEqualByComparingTo(new BigDecimal("450000.00"));
            assertThat(doc.getEmployeeRole()).isEqualTo(EmployeeRole.DOCTOR);
            assertThat(doc.getEmail()).isEqualTo("it25103999@my.sliit.lk");
            assertThat(doc.getDepartment()).isNotNull();
            assertThat(doc.getDepartment().getDepartmentName()).isEqualTo("Cardiology");

            // 3. Assert Doctor tier properties
            assertThat(doc.getDoctorLicenseNo()).isEqualTo("SLMC-48291");
            assertThat(doc.getSpecialization()).isEqualTo("Cardiology");
            assertThat(doc.getConsultationFee()).isEqualByComparingTo(new BigDecimal("3500.00"));

            // 4. Directly verify database joined tables via raw SQL JOIN
            String joinSql = "SELECT p.person_id, p.first_name, p.last_name, p.nic_passport_no, p.person_type, " +
                    "e.salary, e.email, e.employee_role, d.doctor_license_no, d.specialization " +
                    "FROM persons p " +
                    "INNER JOIN employees e ON p.person_id = e.employee_id " +
                    "INNER JOIN doctors d ON e.employee_id = d.employee_id " +
                    "WHERE d.employee_id = ?";

            Map<String, Object> row = jdbcTemplate.queryForMap(joinSql, docId);
            assertThat(row.get("FIRST_NAME")).isEqualTo("Kavinda");
            assertThat(row.get("LAST_NAME")).isEqualTo("Rathnayaka");
            assertThat(row.get("NIC_PASSPORT_NO")).isEqualTo("199912401829");
            assertThat(row.get("DOCTOR_LICENSE_NO")).isEqualTo("SLMC-48291");
            assertThat(row.get("SPECIALIZATION")).isEqualTo("Cardiology");
        }

        @Test
        @DisplayName("Querying Patient entity joins persons -> patients with consistent properties")
        void testPatientTablePerTypeJoin() {
            List<Patient> patients = patientRepository.findByIsArchivedFalse();
            assertThat(patients).isNotEmpty();
            Patient patient = patients.get(0);
            Long patId = patient.getId();

            // 1. Assert Person tier properties
            assertThat(patient.getFirstName()).isNotBlank();
            assertThat(patient.getLastName()).isNotBlank();
            assertThat(patient.getNicPassportNo()).isNotBlank();
            assertThat(patient.getDateOfBirth()).isNotNull();

            // 2. Assert Patient tier properties
            assertThat(patient.getBloodGroup()).isNotNull();
            assertThat(patient.getTriagePriority()).isNotNull();
            assertThat(patient.getIsArchived()).isFalse();

            // 3. Directly verify database joined tables via raw SQL JOIN
            String patientJoinSql = "SELECT p.person_id, p.first_name, p.nic_passport_no, p.person_type, " +
                    "pt.blood_group, pt.triage_priority " +
                    "FROM persons p " +
                    "INNER JOIN patients pt ON p.person_id = pt.patient_id " +
                    "WHERE pt.patient_id = ?";

            Map<String, Object> row = jdbcTemplate.queryForMap(patientJoinSql, patId);
            assertThat(row.get("FIRST_NAME")).isEqualTo(patient.getFirstName());
            assertThat(row.get("NIC_PASSPORT_NO")).isEqualTo(patient.getNicPassportNo());
            assertThat(row.get("BLOOD_GROUP")).isEqualTo(patient.getBloodGroup().name());
            assertThat(row.get("TRIAGE_PRIORITY")).isEqualTo(patient.getTriagePriority().name());
        }

        @Test
        @DisplayName("Polymorphic query via PersonRepository loads both Patients and Employees as Person instances")
        void testPolymorphicPersonRepository() {
            List<Person> allPersons = personRepository.findAll();
            long totalPatients = patientRepository.count();
            long totalEmployees = employeeRepository.count();

            // Total persons must equal total patients + total employees
            assertThat(allPersons).hasSize((int) (totalPatients + totalEmployees));

            // Verify polymorphic type instantiation
            long patientCount = allPersons.stream().filter(p -> p instanceof Patient).count();
            long doctorCount = allPersons.stream().filter(p -> p instanceof Doctor).count();
            long employeeCount = allPersons.stream().filter(p -> p instanceof Employee).count();

            assertThat(patientCount).isEqualTo(totalPatients);
            assertThat(doctorCount).isGreaterThanOrEqualTo(1);
            assertThat(employeeCount).isEqualTo(totalEmployees);

            // Verify discriminator distribution in database table 'persons'
            List<Map<String, Object>> typeDistribution = jdbcTemplate.queryForList(
                    "SELECT person_type, COUNT(*) AS count_val FROM persons GROUP BY person_type ORDER BY person_type"
            );
            assertThat(typeDistribution).isNotEmpty();
            boolean hasPatientType = typeDistribution.stream()
                    .anyMatch(m -> "PATIENT".equals(m.get("PERSON_TYPE")));
            boolean hasDoctorType = typeDistribution.stream()
                    .anyMatch(m -> "DOCTOR".equals(m.get("PERSON_TYPE")));

            assertThat(hasPatientType).isTrue();
            assertThat(hasDoctorType).isTrue();
        }
    }

    @Nested
    @DisplayName("Challenge 4: Foreign Key Constraint Integrity Across Bounded Contexts")
    class ForeignKeyConstraintIntegrityTests {

        @Test
        @DisplayName("Direct database deletion of Doctor with active appointments must fail with foreign key constraint violation")
        void testDeleteDoctorWithActiveAppointmentsFails() {
            List<Doctor> doctors = doctorRepository.findBySpecialization("Cardiology");
            assertThat(doctors).isNotEmpty();
            Long docId = doctors.get(0).getId();

            // Doctor has appointments in database; foreign key constraint must reject direct delete
            assertThatThrownBy(() -> jdbcTemplate.update("DELETE FROM doctors WHERE employee_id = ?", docId))
                    .isInstanceOf(DataIntegrityViolationException.class);
        }

        @Test
        @DisplayName("Direct database deletion of Patient with active appointments/invoices must fail with foreign key constraint violation")
        void testDeletePatientWithActiveEncountersFails() {
            List<Patient> patients = patientRepository.findByIsArchivedFalse();
            assertThat(patients).isNotEmpty();
            Long patientId = patients.get(0).getId(); // Nimal Perera has apt1 and inv1

            assertThatThrownBy(() -> jdbcTemplate.update("DELETE FROM patients WHERE patient_id = ?", patientId))
                    .isInstanceOf(DataIntegrityViolationException.class);
        }

        @Test
        @DisplayName("Direct database deletion of Department with active staff must fail with foreign key constraint violation")
        void testDeleteDepartmentWithActiveStaffFails() {
            Department cardiology = departmentRepository.findByDepartmentName("Cardiology").orElseThrow();

            assertThatThrownBy(() -> jdbcTemplate.update("DELETE FROM departments WHERE department_id = ?", cardiology.getDepartmentId()))
                    .isInstanceOf(DataIntegrityViolationException.class);
        }

        @Test
        @DisplayName("Inserting appointment with non-existent doctor ID must fail foreign key constraint")
        void testInsertAppointmentWithInvalidDoctorFails() {
            List<Patient> patients = patientRepository.findByIsArchivedFalse();
            Long patientId = patients.get(0).getId();

            String insertSql = "INSERT INTO appointments (patient_id, doctor_id, booking_date, appointment_date, appointment_time, status) " +
                    "VALUES (?, 999999, CURRENT_TIMESTAMP, '2026-12-28', '11:00:00', 'SCHEDULED')";

            assertThatThrownBy(() -> jdbcTemplate.update(insertSql, patientId))
                    .isInstanceOf(DataIntegrityViolationException.class);
        }

        @Test
        @DisplayName("Inserting appointment with non-existent patient ID must fail foreign key constraint")
        void testInsertAppointmentWithInvalidPatientFails() {
            List<Doctor> doctors = doctorRepository.findBySpecialization("Cardiology");
            Long doctorId = doctors.get(0).getId();

            String insertSql = "INSERT INTO appointments (patient_id, doctor_id, booking_date, appointment_date, appointment_time, status) " +
                    "VALUES (999999, ?, CURRENT_TIMESTAMP, '2026-12-28', '11:15:00', 'SCHEDULED')";

            assertThatThrownBy(() -> jdbcTemplate.update(insertSql, doctorId))
                    .isInstanceOf(DataIntegrityViolationException.class);
        }
    }

    @Nested
    @DisplayName("Challenge 5: Cross-Package Domain Queries & Traversal Edge Cases")
    class CrossPackageQueryEdgeCaseTests {

        @Test
        @DisplayName("PatientRepository.searchPatients queries inherited Person fields cleanly")
        void testPatientSearchInheritedFields() {
            // First name query
            List<Patient> byFirst = patientRepository.searchPatients("Nimal");
            assertThat(byFirst).isNotEmpty();
            assertThat(byFirst.get(0).getFirstName()).isEqualTo("Nimal");

            // Last name query (multiple matches: Nimal Perera, Kasun Perera)
            List<Patient> byLast = patientRepository.searchPatients("Perera");
            assertThat(byLast).hasSizeGreaterThanOrEqualTo(2);

            // NIC query
            List<Patient> byNic = patientRepository.searchPatients("199012345678");
            assertThat(byNic).hasSize(1);
            assertThat(byNic.get(0).getFirstName()).isEqualTo("Kasun");

            // Case-insensitive query
            List<Patient> byCaseInsensitive = patientRepository.searchPatients("kAsUn");
            assertThat(byCaseInsensitive).isNotEmpty();

            // Non-existent search query returns empty list without exception
            List<Patient> emptySearch = patientRepository.searchPatients("ZZZ_NO_MATCH_XYZ");
            assertThat(emptySearch).isEmpty();
        }

        @Test
        @DisplayName("EmployeeRepository.findByEmployeeRole returns correct polymorphic subclasses across packages")
        void testEmployeeRoleSubclassResolution() {
            List<Employee> doctors = employeeRepository.findByEmployeeRole(EmployeeRole.DOCTOR);
            assertThat(doctors).isNotEmpty();
            assertThat(doctors.get(0)).isInstanceOf(Doctor.class);
            Doctor doc = (Doctor) doctors.get(0);
            assertThat(doc.getDoctorLicenseNo()).isNotBlank();
            assertThat(doc.getSpecialization()).isNotBlank();

            List<Employee> pharmacists = employeeRepository.findByEmployeeRole(EmployeeRole.PHARMACIST);
            assertThat(pharmacists).isNotEmpty();
            assertThat(pharmacists.get(0)).isInstanceOf(Pharmacist.class);
            Pharmacist pharm = (Pharmacist) pharmacists.get(0);
            assertThat(pharm.getPharmacyLicenseNo()).isNotBlank();

            List<Employee> techs = employeeRepository.findByEmployeeRole(EmployeeRole.LAB_TECHNICIAN);
            assertThat(techs).isNotEmpty();
            assertThat(techs.get(0)).isInstanceOf(LabTechnician.class);
            LabTechnician tech = (LabTechnician) techs.get(0);
            assertThat(tech.getCertificationLevel()).isNotBlank();

            List<Employee> receptionists = employeeRepository.findByEmployeeRole(EmployeeRole.RECEPTIONIST);
            assertThat(receptionists).isNotEmpty();
            assertThat(receptionists.get(0)).isInstanceOf(Receptionist.class);
            Receptionist rec = (Receptionist) receptionists.get(0);
            assertThat(rec.getDeskNumber()).isNotBlank();

            List<Employee> admins = employeeRepository.findByEmployeeRole(EmployeeRole.SYSTEM_ADMIN);
            assertThat(admins).isNotEmpty();
            assertThat(admins.get(0)).isInstanceOf(SystemAdmin.class);
            SystemAdmin admin = (SystemAdmin) admins.get(0);
            assertThat(admin.getAdminLevel()).isNotBlank();
        }

        @Test
        @DisplayName("EmployeeRepository.findByEmail resolves employee entities across all domains")
        void testEmployeeEmailLookupAcrossSubclasses() {
            Optional<Employee> docOpt = employeeRepository.findByEmail("it25103999@my.sliit.lk");
            assertThat(docOpt).isPresent();
            assertThat(docOpt.get()).isInstanceOf(Doctor.class);

            Optional<Employee> pharmOpt = employeeRepository.findByEmail("it25100826@my.sliit.lk");
            assertThat(pharmOpt).isPresent();
            assertThat(pharmOpt.get()).isInstanceOf(Pharmacist.class);

            Optional<Employee> techOpt = employeeRepository.findByEmail("it25103363@my.sliit.lk");
            assertThat(techOpt).isPresent();
            assertThat(techOpt.get()).isInstanceOf(LabTechnician.class);

            Optional<Employee> nonExistent = employeeRepository.findByEmail("nobody@pulseos.lk");
            assertThat(nonExistent).isEmpty();
        }

        @Test
        @DisplayName("Cross-package traversal from billing Invoice to patient, appointment, doctor, and department")
        void testCrossPackageInvoiceTraversal() {
            List<Invoice> invoices = invoiceRepository.findAll();
            assertThat(invoices).isNotEmpty();

            for (Invoice inv : invoices) {
                // Billing -> Patient -> Person
                assertThat(inv.getPatient()).isNotNull();
                assertThat(inv.getPatient().getFullName()).isNotBlank();
                assertThat(inv.getPatient().getNicPassportNo()).isNotBlank();
                assertThat(inv.getPatient().getAge()).isGreaterThan(0);

                if (inv.getAppointment() != null) {
                    // Billing -> Appointment -> Doctor -> Employee -> Department
                    Doctor doc = inv.getAppointment().getDoctor();
                    assertThat(doc).isNotNull();
                    assertThat(doc.getSpecialization()).isNotBlank();
                    assertThat(doc.getDepartment()).isNotNull();
                    assertThat(doc.getDepartment().getDepartmentName()).isNotBlank();
                }
            }
        }

        @Test
        @DisplayName("Cross-package traversal from pharmacy Prescription to appointment, doctor, patient, and items")
        void testCrossPackagePrescriptionTraversal() {
            List<Prescription> prescriptions = prescriptionRepository.findAll();
            assertThat(prescriptions).isNotEmpty();

            for (Prescription rx : prescriptions) {
                assertThat(rx.getPatient()).isNotNull();
                assertThat(rx.getPatient().getFullName()).isNotBlank();

                assertThat(rx.getDoctor()).isNotNull();
                assertThat(rx.getDoctor().getDoctorLicenseNo()).isNotBlank();

                assertThat(rx.getItems()).isNotEmpty();
                for (PrescriptionItem item : rx.getItems()) {
                    assertThat(item.getDrug()).isNotNull();
                    assertThat(item.getDrug().getDrugName()).isNotBlank();
                    assertThat(item.getPrescription().getPrescriptionId()).isEqualTo(rx.getPrescriptionId());
                }
            }
        }

        @Test
        @DisplayName("Cross-package traversal from laboratory LabTest to appointment, doctor, patient, and technician")
        void testCrossPackageLabTestTraversal() {
            List<LabTest> tests = labTestRepository.findAll();
            assertThat(tests).isNotEmpty();

            for (LabTest test : tests) {
                assertThat(test.getPatient()).isNotNull();
                assertThat(test.getPatient().getFullName()).isNotBlank();
                assertThat(test.getDoctor()).isNotNull();
                assertThat(test.getDoctor().getSpecialization()).isNotBlank();

                if (test.getTechnician() != null) {
                    assertThat(test.getTechnician().getCertificationLevel()).isNotBlank();
                    assertThat(test.getTechnician().getDepartment()).isNotNull();
                }
            }
        }

        @Test
        @DisplayName("PatientAdmission repository correctly filters active admissions by patient and ward")
        void testPatientAdmissionQueries() {
            List<PatientAdmission> admissions = patientAdmissionRepository.findAll();
            assertThat(admissions).isNotEmpty();

            for (PatientAdmission adm : admissions) {
                if (adm.getDischargeDate() == null) {
                    Optional<PatientAdmission> active = patientAdmissionRepository.findByPatientIdAndDischargeDateIsNull(adm.getPatient().getId());
                    assertThat(active).isPresent();
                    assertThat(active.get().getAdmissionId()).isEqualTo(adm.getAdmissionId());

                    List<PatientAdmission> wardAdmissions = patientAdmissionRepository.findByWardWardIdAndDischargeDateIsNull(adm.getWard().getWardId());
                    assertThat(wardAdmissions).isNotEmpty();
                }
            }
        }
    }

    @Nested
    @DisplayName("Challenge 6: Polymorphic Lifecycle and Joined-Table Synchronization")
    class PolymorphicLifecycleTests {

        @Test
        @DisplayName("Creating new Doctor entity persists rows synchronously across persons, employees, and doctors tables")
        void testDoctorCreationAcrossJoinedTables() {
            Department opd = departmentRepository.findByDepartmentName("Outpatient Department (OPD)").orElseThrow();

            Doctor newDoc = new Doctor();
            newDoc.setNicPassportNo("999999999V");
            newDoc.setFirstName("Empirical");
            newDoc.setLastName("Challenger");
            newDoc.setStreet("Research Lab Way");
            newDoc.setCity("Colombo");
            newDoc.setPostalCode("00100");
            newDoc.setDateOfBirth(LocalDate.of(1982, 4, 15));
            newDoc.setGender(Gender.MALE);
            newDoc.setContactNumbers(new HashSet<>(Collections.singletonList("+94770000000")));
            newDoc.setHireDate(LocalDate.now());
            newDoc.setSalary(new BigDecimal("550000.00"));
            newDoc.setEmploymentType(EmploymentType.FULL_TIME);
            newDoc.setDepartment(opd);
            newDoc.setDeptJoiningDate(LocalDate.now());
            newDoc.setEmployeeRole(EmployeeRole.DOCTOR);
            newDoc.setEmail("test.challenger.doc@pulseos.lk");
            newDoc.setPasswordHash("hashedPassword");
            newDoc.setDoctorLicenseNo("SLMC-TEST-9999");
            newDoc.setSpecialization("Neurology");
            newDoc.setConsultationFee(new BigDecimal("4000.00"));

            Doctor saved = doctorRepository.saveAndFlush(newDoc);
            Long id = saved.getId();
            assertThat(id).isNotNull();

            try {
                // Assert Hibernate polymorphic loads
                Optional<Person> asPerson = personRepository.findById(id);
                assertThat(asPerson).isPresent();
                assertThat(asPerson.get()).isInstanceOf(Doctor.class);
                assertThat(((Doctor) asPerson.get()).getSpecialization()).isEqualTo("Neurology");

                Optional<Employee> asEmployee = employeeRepository.findById(id);
                assertThat(asEmployee).isPresent();
                assertThat(asEmployee.get()).isInstanceOf(Doctor.class);

                Optional<Doctor> asDoctor = doctorRepository.findById(id);
                assertThat(asDoctor).isPresent();
                assertThat(asDoctor.get().getDoctorLicenseNo()).isEqualTo("SLMC-TEST-9999");

                // Direct raw SQL verification: all 3 tables must have exactly 1 corresponding row
                Integer personCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM persons WHERE person_id = ?", Integer.class, id);
                Integer employeeCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM employees WHERE employee_id = ?", Integer.class, id);
                Integer doctorCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM doctors WHERE employee_id = ?", Integer.class, id);

                assertThat(personCount).isEqualTo(1);
                assertThat(employeeCount).isEqualTo(1);
                assertThat(doctorCount).isEqualTo(1);
            } finally {
                // Clean up
                doctorRepository.delete(saved);
                doctorRepository.flush();

                // Direct raw SQL verification: all 3 tables must have row deleted
                Integer personCountAfter = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM persons WHERE person_id = ?", Integer.class, id);
                Integer employeeCountAfter = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM employees WHERE employee_id = ?", Integer.class, id);
                Integer doctorCountAfter = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM doctors WHERE employee_id = ?", Integer.class, id);

                assertThat(personCountAfter).isEqualTo(0);
                assertThat(employeeCountAfter).isEqualTo(0);
                assertThat(doctorCountAfter).isEqualTo(0);
            }
        }

        @Test
        @DisplayName("Creating new Patient entity persists rows synchronously across persons and patients tables")
        void testPatientCreationAcrossJoinedTables() {
            Patient newPatient = new Patient();
            newPatient.setNicPassportNo("888888888V");
            newPatient.setFirstName("Adversarial");
            newPatient.setLastName("Patient");
            newPatient.setStreet("Audit Lane");
            newPatient.setCity("Kandy");
            newPatient.setPostalCode("20000");
            newPatient.setDateOfBirth(LocalDate.of(1995, 6, 15));
            newPatient.setGender(Gender.FEMALE);
            newPatient.setContactNumbers(new HashSet<>(Collections.singletonList("+94711111111")));
            newPatient.setBloodGroup(BloodGroup.B_POSITIVE);
            newPatient.setRegistrationDate(LocalDate.now());
            newPatient.setTriagePriority(TriagePriority.URGENT);
            newPatient.setEmail("test.patient@pulseos.lk");
            newPatient.setIsArchived(false);

            Patient saved = patientRepository.saveAndFlush(newPatient);
            Long id = saved.getId();
            assertThat(id).isNotNull();

            try {
                // Assert Hibernate polymorphic loads
                Optional<Person> asPerson = personRepository.findById(id);
                assertThat(asPerson).isPresent();
                assertThat(asPerson.get()).isInstanceOf(Patient.class);
                assertThat(((Patient) asPerson.get()).getBloodGroup()).isEqualTo(BloodGroup.B_POSITIVE);

                Optional<Patient> asPatient = patientRepository.findById(id);
                assertThat(asPatient).isPresent();

                // Direct raw SQL verification: both tables must have 1 row
                Integer personCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM persons WHERE person_id = ?", Integer.class, id);
                Integer patientCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM patients WHERE patient_id = ?", Integer.class, id);

                assertThat(personCount).isEqualTo(1);
                assertThat(patientCount).isEqualTo(1);
            } finally {
                // Clean up
                patientRepository.delete(saved);
                patientRepository.flush();

                Integer personCountAfter = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM persons WHERE person_id = ?", Integer.class, id);
                Integer patientCountAfter = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM patients WHERE patient_id = ?", Integer.class, id);

                assertThat(personCountAfter).isEqualTo(0);
                assertThat(patientCountAfter).isEqualTo(0);
            }
        }
    }

    @Nested
    @DisplayName("Challenge 7: Composite Key Integrity Across Bounded Contexts")
    class CompositeKeyRelationshipTests {

        @Test
        @DisplayName("PrescriptionItem composite key correctly links Prescription and Drug entities")
        void testPrescriptionItemCompositeKey() {
            List<PrescriptionItem> items = prescriptionItemRepository.findAll();
            assertThat(items).isNotEmpty();

            for (PrescriptionItem item : items) {
                assertThat(item.getId()).isNotNull();
                assertThat(item.getId().getPrescriptionId()).isNotNull();
                assertThat(item.getId().getDrugId()).isNotNull();

                assertThat(item.getPrescription().getPrescriptionId()).isEqualTo(item.getId().getPrescriptionId());
                assertThat(item.getDrug().getDrugId()).isEqualTo(item.getId().getDrugId());
                assertThat(item.getQuantity()).isGreaterThan(0);
            }
        }

        @Test
        @DisplayName("InvoiceDrugItem composite key correctly links Invoice and Drug entities")
        void testInvoiceDrugItemCompositeKey() {
            List<InvoiceDrugItem> items = invoiceDrugItemRepository.findAll();
            assertThat(items).isNotEmpty();

            for (InvoiceDrugItem item : items) {
                assertThat(item.getId()).isNotNull();
                assertThat(item.getId().getInvoiceId()).isNotNull();
                assertThat(item.getId().getDrugId()).isNotNull();

                assertThat(item.getInvoice().getInvoiceId()).isEqualTo(item.getId().getInvoiceId());
                assertThat(item.getDrug().getDrugId()).isEqualTo(item.getId().getDrugId());
            }
        }

        @Test
        @DisplayName("InvoiceLabItem composite key correctly links Invoice and LabTest entities")
        void testInvoiceLabItemCompositeKey() {
            List<InvoiceLabItem> items = invoiceLabItemRepository.findAll();
            assertThat(items).isNotEmpty();

            for (InvoiceLabItem item : items) {
                assertThat(item.getId()).isNotNull();
                assertThat(item.getId().getInvoiceId()).isNotNull();
                assertThat(item.getId().getTestId()).isNotNull();

                assertThat(item.getInvoice().getInvoiceId()).isEqualTo(item.getId().getInvoiceId());
                assertThat(item.getLabTest().getTestId()).isEqualTo(item.getId().getTestId());
            }
        }
    }
}
