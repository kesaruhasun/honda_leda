package com.pulseos.challenge;

import com.pulseos.entity.*;
import com.pulseos.entity.enums.AppointmentStatus;
import com.pulseos.entity.enums.BloodGroup;
import com.pulseos.entity.enums.EmployeeRole;
import com.pulseos.entity.enums.TriagePriority;
import com.pulseos.repository.*;
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
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
}
