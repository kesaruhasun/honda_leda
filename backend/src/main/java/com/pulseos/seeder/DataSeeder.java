package com.pulseos.seeder;

import com.pulseos.entity.*;
import com.pulseos.entity.enums.*;
import com.pulseos.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Component
@Order(1)
@Slf4j
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;
    private final ReceptionistRepository receptionistRepository;
    private final PharmacistRepository pharmacistRepository;
    private final LabTechnicianRepository labTechnicianRepository;
    private final SystemAdminRepository systemAdminRepository;
    private final WardRepository wardRepository;
    private final PatientRepository patientRepository;
    private final PatientAdmissionRepository patientAdmissionRepository;
    private final SupplierRepository supplierRepository;
    private final DrugRepository drugRepository;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final DrugDispensationRepository drugDispensationRepository;
    private final LabTestRepository labTestRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceDrugItemRepository invoiceDrugItemRepository;
    private final InvoiceLabItemRepository invoiceLabItemRepository;
    private final PaymentRepository paymentRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (departmentRepository.count() > 0) {
            log.info("DataSeeder: Database already initialized. Skipping seeding.");
            return;
        }

        log.info("DataSeeder: Beginning clinical database population for PulseOS Group 60...");

        // 1. Departments
        Department cardiology = new Department(null, "Cardiology", "Building B, Floor 2", new BigDecimal("15000000.00"), null, null);
        Department opd = new Department(null, "Outpatient Department (OPD)", "Ground Floor, Main Wing", new BigDecimal("8500000.00"), null, null);
        Department pharmacyDept = new Department(null, "Pharmacy & Stores", "Ground Floor, East Wing", new BigDecimal("25000000.00"), null, null);
        Department labDept = new Department(null, "Laboratory Services", "Building A, Floor 1", new BigDecimal("12000000.00"), null, null);
        Department surgery = new Department(null, "General Surgery", "Building C, Floor 3", new BigDecimal("30000000.00"), null, null);
        Department pediatrics = new Department(null, "Pediatrics", "Building B, Floor 1", new BigDecimal("10000000.00"), null, null);
        Department itDept = new Department(null, "Finance & Hospital IT Operations", "Administrative Tower, Level 4", new BigDecimal("5000000.00"), null, null);

        departmentRepository.saveAll(Arrays.asList(cardiology, opd, pharmacyDept, labDept, surgery, pediatrics, itDept));

        // 2. Staff Members (The 6 SLIIT Team Members)
        // Doctor Kavinda (Rathnayaka R. M. K. L. B. - IT25103999)
        Doctor docKavinda = new Doctor();
        docKavinda.setNicPassportNo("199912401829");
        docKavinda.setFirstName("Kavinda");
        docKavinda.setLastName("Rathnayaka");
        docKavinda.setStreet("SLIIT Campus Road");
        docKavinda.setCity("Colombo");
        docKavinda.setPostalCode("10115");
        docKavinda.setDateOfBirth(LocalDate.of(1999, 5, 14));
        docKavinda.setGender(Gender.MALE);
        docKavinda.setContactNumbers(new HashSet<>(Arrays.asList("+94771239990", "+94112876543")));
        docKavinda.setHireDate(LocalDate.of(2022, 1, 10));
        docKavinda.setSalary(new BigDecimal("450000.00"));
        docKavinda.setEmploymentType(EmploymentType.FULL_TIME);
        docKavinda.setDepartment(cardiology);
        docKavinda.setDeptJoiningDate(LocalDate.of(2022, 1, 10));
        docKavinda.setEmployeeRole(EmployeeRole.DOCTOR);
        docKavinda.setEmail("it25103999@my.sliit.lk");
        docKavinda.setPasswordHash("$2a$10$7R6vD8xPulseOSHashKavinda2026");
        docKavinda.setQualifications(new HashSet<>(Arrays.asList("MBBS (Colombo)", "MD (Cardiology)", "MRCP (UK)")));
        docKavinda.setDoctorLicenseNo("SLMC-48291");
        docKavinda.setSpecialization("Cardiology");
        docKavinda.setConsultationFee(new BigDecimal("3500.00"));
        docKavinda = doctorRepository.save(docKavinda);

        cardiology.setManager(docKavinda);
        cardiology.setManagerAppointedDate(LocalDate.of(2023, 1, 1));
        departmentRepository.save(cardiology);

        // Receptionist Dila (Somarathna P. G. D. S. - IT25103819)
        Receptionist recDila = new Receptionist();
        recDila.setNicPassportNo("200165809124");
        recDila.setFirstName("Dila");
        recDila.setLastName("Somarathna");
        recDila.setStreet("Peradeniya Road");
        recDila.setCity("Kandy");
        recDila.setPostalCode("20000");
        recDila.setDateOfBirth(LocalDate.of(2001, 8, 20));
        recDila.setGender(Gender.FEMALE);
        recDila.setContactNumbers(new HashSet<>(Collections.singletonList("+94718238190")));
        recDila.setHireDate(LocalDate.of(2023, 3, 15));
        recDila.setSalary(new BigDecimal("120000.00"));
        recDila.setEmploymentType(EmploymentType.FULL_TIME);
        recDila.setDepartment(opd);
        recDila.setDeptJoiningDate(LocalDate.of(2023, 3, 15));
        recDila.setEmployeeRole(EmployeeRole.RECEPTIONIST);
        recDila.setEmail("it25103819@my.sliit.lk");
        recDila.setPasswordHash("$2a$10$7R6vD8xPulseOSHashDila2026");
        recDila.setQualifications(new HashSet<>(Arrays.asList("Diploma in Hospital Administration", "Cert. Front Office Mgmt")));
        recDila.setDeskNumber("DESK-01");
        recDila.setShiftBlock(ShiftBlock.MORNING);
        receptionistRepository.save(recDila);

        // Pharmacist Harshika (Udumullage S.H.U. - IT25100826)
        Pharmacist pharmHarshika = new Pharmacist();
        pharmHarshika.setNicPassportNo("200078403319");
        pharmHarshika.setFirstName("Harshika");
        pharmHarshika.setLastName("Udumullage");
        pharmHarshika.setStreet("Galle Road");
        pharmHarshika.setCity("Colombo");
        pharmHarshika.setPostalCode("00300");
        pharmHarshika.setDateOfBirth(LocalDate.of(2000, 3, 12));
        pharmHarshika.setGender(Gender.FEMALE);
        pharmHarshika.setContactNumbers(new HashSet<>(Collections.singletonList("+94765008260")));
        pharmHarshika.setHireDate(LocalDate.of(2022, 6, 1));
        pharmHarshika.setSalary(new BigDecimal("185000.00"));
        pharmHarshika.setEmploymentType(EmploymentType.FULL_TIME);
        pharmHarshika.setDepartment(pharmacyDept);
        pharmHarshika.setDeptJoiningDate(LocalDate.of(2022, 6, 1));
        pharmHarshika.setEmployeeRole(EmployeeRole.PHARMACIST);
        pharmHarshika.setEmail("it25100826@my.sliit.lk");
        pharmHarshika.setPasswordHash("$2a$10$7R6vD8xPulseOSHashHarshika2026");
        pharmHarshika.setQualifications(new HashSet<>(Arrays.asList("B.Pharm (Hons)", "Reg. Pharmacist SL")));
        pharmHarshika.setPharmacyLicenseNo("PHARM-7721");
        pharmHarshika.setAssignedUnit("Main Outpatient Dispensary");
        pharmHarshika = pharmacistRepository.save(pharmHarshika);

        // Lab Tech Nethuli (Thilakarathne H.S.K.P.N - IT25103363)
        LabTechnician techNethuli = new LabTechnician();
        techNethuli.setNicPassportNo("200155204481");
        techNethuli.setFirstName("Nethuli");
        techNethuli.setLastName("Thilakarathne");
        techNethuli.setStreet("Wakwella Road");
        techNethuli.setCity("Galle");
        techNethuli.setPostalCode("80000");
        techNethuli.setDateOfBirth(LocalDate.of(2001, 11, 25));
        techNethuli.setGender(Gender.FEMALE);
        techNethuli.setContactNumbers(new HashSet<>(Collections.singletonList("+94773103363")));
        techNethuli.setHireDate(LocalDate.of(2023, 2, 1));
        techNethuli.setSalary(new BigDecimal("165000.00"));
        techNethuli.setEmploymentType(EmploymentType.FULL_TIME);
        techNethuli.setDepartment(labDept);
        techNethuli.setDeptJoiningDate(LocalDate.of(2023, 2, 1));
        techNethuli.setEmployeeRole(EmployeeRole.LAB_TECHNICIAN);
        techNethuli.setEmail("it25103363@my.sliit.lk");
        techNethuli.setPasswordHash("$2a$10$7R6vD8xPulseOSHashNethuli2026");
        techNethuli.setQualifications(new HashSet<>(Arrays.asList("BSc Medical Laboratory Science", "SLMC Registered MLT")));
        techNethuli.setCertificationLevel("Senior Medical Technologist (MLT-1)");
        techNethuli.setLabSection("Hematology & Clinical Biochemistry");
        techNethuli = labTechnicianRepository.save(techNethuli);

        // Cashier / Admin Kesaru (Dhanasinghe K. A. K. H. - IT25103992)
        SystemAdmin adminKesaru = new SystemAdmin();
        adminKesaru.setNicPassportNo("200018902271");
        adminKesaru.setFirstName("Kesaru");
        adminKesaru.setLastName("Dhanasinghe");
        adminKesaru.setStreet("New Kandy Road");
        adminKesaru.setCity("Malabe");
        adminKesaru.setPostalCode("10115");
        adminKesaru.setDateOfBirth(LocalDate.of(2000, 7, 8));
        adminKesaru.setGender(Gender.MALE);
        adminKesaru.setContactNumbers(new HashSet<>(Collections.singletonList("+94772103992")));
        adminKesaru.setHireDate(LocalDate.of(2021, 11, 1));
        adminKesaru.setSalary(new BigDecimal("380000.00"));
        adminKesaru.setEmploymentType(EmploymentType.FULL_TIME);
        adminKesaru.setDepartment(itDept);
        adminKesaru.setDeptJoiningDate(LocalDate.of(2021, 11, 1));
        adminKesaru.setEmployeeRole(EmployeeRole.SYSTEM_ADMIN);
        adminKesaru.setEmail("it25103992@my.sliit.lk");
        adminKesaru.setPasswordHash("$2a$10$7R6vD8xPulseOSHashKesaru2026");
        adminKesaru.setQualifications(new HashSet<>(Arrays.asList("BSc (Hons) Software Engineering (SLIIT)", "CISA")));
        adminKesaru.setAdminLevel("SUPER_ADMIN");
        adminKesaru.setSecurityClearance("TOP_SECRET");
        adminKesaru = systemAdminRepository.save(adminKesaru);

        itDept.setManager(adminKesaru);
        itDept.setManagerAppointedDate(LocalDate.of(2022, 1, 1));
        departmentRepository.save(itDept);

        // Receptionist Chanul (Malwatta M.W.C.S - IT25101620)
        Receptionist recChanul = new Receptionist();
        recChanul.setNicPassportNo("200021405592");
        recChanul.setFirstName("Chanul");
        recChanul.setLastName("Malwatta");
        recChanul.setStreet("High Level Road");
        recChanul.setCity("Nugegoda");
        recChanul.setPostalCode("10250");
        recChanul.setDateOfBirth(LocalDate.of(2000, 9, 18));
        recChanul.setGender(Gender.MALE);
        recChanul.setContactNumbers(new HashSet<>(Collections.singletonList("+94719201620")));
        recChanul.setHireDate(LocalDate.of(2023, 4, 1));
        recChanul.setSalary(new BigDecimal("120000.00"));
        recChanul.setEmploymentType(EmploymentType.FULL_TIME);
        recChanul.setDepartment(opd);
        recChanul.setDeptJoiningDate(LocalDate.of(2023, 4, 1));
        recChanul.setEmployeeRole(EmployeeRole.RECEPTIONIST);
        recChanul.setEmail("it25101620@my.sliit.lk");
        recChanul.setPasswordHash("$2a$10$7R6vD8xPulseOSHashChanul2026");
        recChanul.setQualifications(new HashSet<>(Collections.singletonList("BSc Health Services Management")));
        recChanul.setDeskNumber("DESK-02");
        recChanul.setShiftBlock(ShiftBlock.EVENING);
        receptionistRepository.save(recChanul);

        // 3. Wards
        Ward wardSurgical = new Ward(null, "Surgical Ward A", WardType.SURGICAL, 20, 12);
        Ward wardCcu = new Ward(null, "Cardiology Care Unit (CCU)", WardType.ICU, 8, 5);
        Ward wardPediatric = new Ward(null, "Pediatric Ward", WardType.PEDIATRIC, 15, 8);
        Ward wardMaternity = new Ward(null, "Maternity Ward", WardType.MATERNITY, 18, 10);
        Ward wardGeneral = new Ward(null, "General Medical Ward", WardType.GENERAL, 25, 14);
        wardRepository.saveAll(Arrays.asList(wardSurgical, wardCcu, wardPediatric, wardMaternity, wardGeneral));

        // 4. Patients (12 Realistic Patients)
        Patient p1 = createPatient("198512304561", "Nimal", "Perera", "No. 15, Flower Road", "Colombo", "00700",
                LocalDate.of(1985, 3, 12), Gender.MALE, BloodGroup.O_POSITIVE, TriagePriority.ROUTINE, "None",
                "+94771234567", "Sunil Perera", "Brother", "+94779876543");

        Patient p2 = createPatient("197265408923", "Sunethra", "Jayawardena", "42 Hill Street", "Kandy", "20000",
                LocalDate.of(1972, 7, 24), Gender.FEMALE, BloodGroup.B_POSITIVE, TriagePriority.URGENT, "Penicillin, Aspirin",
                "+94712345678", "Sarath Jayawardena", "Spouse", "+94718765432");

        Patient p3 = createPatient("199423107845", "Kasun", "Wickramasinghe", "88 Beach Road", "Galle", "80000",
                LocalDate.of(1994, 11, 5), Gender.MALE, BloodGroup.A_POSITIVE, TriagePriority.EMERGENCY, "Sulfa drugs",
                "+94783456789", "Anura Wickramasinghe", "Father", "+94787654321");

        Patient p4 = createPatient("196589201234", "Anula", "Ratnayake", "12 Circular Road", "Kurunegala", "60000",
                LocalDate.of(1965, 2, 18), Gender.FEMALE, BloodGroup.AB_POSITIVE, TriagePriority.ROUTINE, "Ibuprofen",
                "+94704567890", "Kamani Ratnayake", "Daughter", "+94701234567");

        Patient p5 = createPatient("199014506789", "Dilshan", "Fernando", "23 Main Street", "Negombo", "11500",
                LocalDate.of(1990, 9, 30), Gender.MALE, BloodGroup.O_NEGATIVE, TriagePriority.URGENT, "None",
                "+94775678901", "Rohan Fernando", "Brother", "+94776543210");

        Patient p6 = createPatient("200278103456", "Sanduni", "Silva", "55 Kaduwela Road", "Malabe", "10115",
                LocalDate.of(2002, 4, 14), Gender.FEMALE, BloodGroup.A_NEGATIVE, TriagePriority.ROUTINE, "None",
                "+94766789012", "Champa Silva", "Mother", "+94761234567");

        Patient p7 = createPatient("198031209876", "Priyantha", "Kumara", "10 Station Road", "Gampaha", "11000",
                LocalDate.of(1980, 8, 22), Gender.MALE, BloodGroup.B_NEGATIVE, TriagePriority.EMERGENCY, "Latex",
                "+94717890123", "Nayana Kumara", "Spouse", "+94719876543");

        Patient p8 = createPatient("199564208765", "Chathurika", "Mendis", "34 Cross Street", "Panadura", "12500",
                LocalDate.of(1995, 12, 10), Gender.FEMALE, BloodGroup.O_POSITIVE, TriagePriority.ROUTINE, "Amoxicillin",
                "+94758901234", "Lal Mendis", "Father", "+94751234567");

        Patient p9 = createPatient("197824105432", "Chaminda", "Bandara", "90 Beach Road", "Matara", "81000",
                LocalDate.of(1978, 6, 3), Gender.MALE, BloodGroup.AB_NEGATIVE, TriagePriority.URGENT, "Ciprofloxacin",
                "+94729012345", "Manel Bandara", "Spouse", "+94723456789");

        Patient p10 = createPatient("198875302198", "Fathima", "Rizwan", "17 Mosque Road", "Colombo", "01000",
                LocalDate.of(1988, 10, 15), Gender.FEMALE, BloodGroup.B_POSITIVE, TriagePriority.ROUTINE, "None",
                "+94770123456", "Mohamed Rizwan", "Spouse", "+94771239876");

        Patient p11 = createPatient("199219804321", "Ravi", "Shanmuganathan", "4 Hospital Road", "Jaffna", "40000",
                LocalDate.of(1992, 1, 28), Gender.MALE, BloodGroup.A_POSITIVE, TriagePriority.URGENT, "Codeine",
                "+94711234567", "S. Shanmuganathan", "Father", "+94719871234");

        Patient p12 = createPatient("200181206543", "Niluka", "Dissanayake", "72 Passara Road", "Badulla", "90000",
                LocalDate.of(2001, 5, 19), Gender.FEMALE, BloodGroup.O_POSITIVE, TriagePriority.EMERGENCY, "None",
                "+94782345678", "Sirisena Dissanayake", "Father", "+94789012345");

        List<Patient> patients = Arrays.asList(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12);
        patientRepository.saveAll(patients);

        // 5. Patient Admissions (2 Active Admissions)
        PatientAdmission adm1 = new PatientAdmission(null, p3, wardSurgical, "BED-04", LocalDateTime.now().minusDays(2), null);
        PatientAdmission adm2 = new PatientAdmission(null, p7, wardCcu, "CCU-02", LocalDateTime.now().minusDays(1), null);
        patientAdmissionRepository.saveAll(Arrays.asList(adm1, adm2));

        // 6. Suppliers (3 Suppliers)
        Supplier sup1 = new Supplier(null, "State Pharmaceuticals Corporation (SPC)", "orders@spc.gov.lk",
                "No. 75, Sir Baron Jayathilake Mawatha", "Colombo", "00100",
                new HashSet<>(Collections.singletonList("+94112320356")));
        Supplier sup2 = new Supplier(null, "GlaxoSmithKline Ceylon Ltd (GSK)", "supply@gsk.com.lk",
                "121 Galle Road", "Ratmalana", "10390",
                new HashSet<>(Collections.singletonList("+94112636363")));
        Supplier sup3 = new Supplier(null, "Hemas Pharmaceuticals (Pvt) Ltd", "distribution@hemas.com",
                "Hemas House, Braybrooke Place", "Colombo", "00200",
                new HashSet<>(Collections.singletonList("+94114731731")));
        supplierRepository.saveAll(Arrays.asList(sup1, sup2, sup3));

        // 7. Drugs Catalog (23 Drugs, 6 Low-Stock Triggers)
        List<Drug> drugs = Arrays.asList(
                // Antibiotics
                new Drug(null, "Amoxicillin 500mg", "Amoxicillin", "Antibiotic", new BigDecimal("35.00"), 250, "BAT-AMX-2026", LocalDate.of(2027, 8, 31), 50),
                new Drug(null, "Ciprofloxacin 500mg", "Ciprofloxacin", "Antibiotic", new BigDecimal("48.00"), 180, "BAT-CIP-2026", LocalDate.of(2027, 10, 15), 40),
                new Drug(null, "Azithromycin 250mg", "Azithromycin", "Antibiotic", new BigDecimal("110.00"), 25, "BAT-AZI-2026", LocalDate.of(2027, 4, 30), 50), // Low stock
                new Drug(null, "Ceftriaxone 1g Inj", "Ceftriaxone Sodium", "Antibiotic", new BigDecimal("650.00"), 15, "BAT-CEF-2026", LocalDate.of(2026, 12, 31), 30), // Low stock
                new Drug(null, "Augmentin 625mg", "Amoxicillin / Clavulanic Acid", "Antibiotic", new BigDecimal("125.00"), 90, "BAT-AUG-2026", LocalDate.of(2027, 6, 30), 40),
                // Analgesics
                new Drug(null, "Paracetamol 500mg", "Acetaminophen", "Analgesic", new BigDecimal("8.50"), 1200, "BAT-PCM-2026", LocalDate.of(2028, 1, 31), 200),
                new Drug(null, "Ibuprofen 400mg", "Ibuprofen", "Analgesic", new BigDecimal("16.00"), 350, "BAT-IBU-2026", LocalDate.of(2027, 9, 30), 60),
                new Drug(null, "Diclofenac Sodium 50mg", "Diclofenac Sodium", "Analgesic", new BigDecimal("22.00"), 20, "BAT-DIC-2026", LocalDate.of(2026, 11, 30), 50), // Low stock
                new Drug(null, "Tramadol 50mg", "Tramadol HCl", "Analgesic", new BigDecimal("45.00"), 80, "BAT-TRA-2026", LocalDate.of(2027, 5, 15), 30),
                new Drug(null, "Mefenamic Acid 500mg", "Mefenamic Acid", "Analgesic", new BigDecimal("28.00"), 140, "BAT-MEF-2026", LocalDate.of(2027, 11, 20), 40),
                // Cardiovascular
                new Drug(null, "Amlodipine 5mg", "Amlodipine Besylate", "Cardiovascular", new BigDecimal("18.00"), 400, "BAT-AML-2026", LocalDate.of(2027, 12, 31), 80),
                new Drug(null, "Losartan Potassium 50mg", "Losartan Potassium", "Cardiovascular", new BigDecimal("32.00"), 320, "BAT-LOS-2026", LocalDate.of(2028, 2, 28), 60),
                new Drug(null, "Atenolol 50mg", "Atenolol", "Cardiovascular", new BigDecimal("15.00"), 10, "BAT-ATE-2026", LocalDate.of(2026, 10, 31), 50), // Low stock
                new Drug(null, "Atorvastatin 20mg", "Atorvastatin Calcium", "Cardiovascular", new BigDecimal("55.00"), 280, "BAT-ATV-2026", LocalDate.of(2027, 7, 31), 50),
                new Drug(null, "Glyceryl Trinitrate 0.5mg SL", "Nitroglycerin", "Cardiovascular", new BigDecimal("25.00"), 65, "BAT-GTN-2026", LocalDate.of(2027, 3, 31), 30),
                // Antidiabetics
                new Drug(null, "Metformin HCl 500mg", "Metformin Hydrochloride", "Antidiabetic", new BigDecimal("12.00"), 600, "BAT-MET-2026", LocalDate.of(2028, 3, 31), 100),
                new Drug(null, "Gliclazide 80mg", "Gliclazide", "Antidiabetic", new BigDecimal("24.00"), 210, "BAT-GLI-2026", LocalDate.of(2027, 9, 15), 50),
                new Drug(null, "Human Insulin 100 IU/ml", "Biphasic Isophane Insulin", "Antidiabetic", new BigDecimal("1450.00"), 8, "BAT-INS-2026", LocalDate.of(2026, 12, 15), 25), // Low stock
                new Drug(null, "Sitagliptin 100mg", "Sitagliptin Phosphate", "Antidiabetic", new BigDecimal("180.00"), 75, "BAT-SIT-2026", LocalDate.of(2027, 8, 20), 30),
                // Antihistamines & Respiratory
                new Drug(null, "Cetirizine HCl 10mg", "Cetirizine Dihydrochloride", "Antihistamine", new BigDecimal("14.00"), 450, "BAT-CET-2026", LocalDate.of(2028, 4, 30), 80),
                new Drug(null, "Salbutamol Inhaler 100mcg", "Salbutamol Sulfate", "Respiratory", new BigDecimal("850.00"), 18, "BAT-SAL-2026", LocalDate.of(2027, 1, 31), 40), // Low stock
                new Drug(null, "Montelukast Sodium 10mg", "Montelukast Sodium", "Respiratory", new BigDecimal("65.00"), 160, "BAT-MON-2026", LocalDate.of(2027, 11, 15), 40),
                new Drug(null, "Fexofenadine 120mg", "Fexofenadine HCl", "Antihistamine", new BigDecimal("58.00"), 190, "BAT-FEX-2026", LocalDate.of(2027, 6, 25), 50)
        );
        drugRepository.saveAll(drugs);

        Drug atorvastatin = drugs.get(13); // Atorvastatin 20mg
        Drug amlodipine = drugs.get(10);   // Amlodipine 5mg
        Drug losartan = drugs.get(11);     // Losartan 50mg
        Drug metformin = drugs.get(15);    // Metformin 500mg

        // 8. Appointments
        LocalDate today = LocalDate.now();
        Appointment apt1 = new Appointment(null, p1, docKavinda, LocalDateTime.now().minusDays(1), "204",
                today, LocalTime.of(9, 30), AppointmentStatus.COMPLETED, "Routine cardiac follow-up");

        Appointment apt2 = new Appointment(null, p2, docKavinda, LocalDateTime.now().minusHours(3), "204",
                today, LocalTime.of(10, 30), AppointmentStatus.IN_CONSULTATION, "Chest pain and hypertension evaluation");

        Appointment apt3 = new Appointment(null, p3, docKavinda, LocalDateTime.now().minusHours(1), "204",
                today.plusDays(1), LocalTime.of(9, 0), AppointmentStatus.CONFIRMED, "Post-op evaluation");

        Appointment apt4 = new Appointment(null, p4, docKavinda, LocalDateTime.now(), "204",
                today.plusDays(1), LocalTime.of(10, 0), AppointmentStatus.SCHEDULED, "Shortness of breath on exertion");

        Appointment apt5 = new Appointment(null, p5, docKavinda, LocalDateTime.now(), "204",
                today.plusDays(3), LocalTime.of(11, 0), AppointmentStatus.SCHEDULED, "ECG consultation");

        appointmentRepository.saveAll(Arrays.asList(apt1, apt2, apt3, apt4, apt5));

        // 9. Prescriptions & Items
        Prescription rx1 = new Prescription(null, apt1, docKavinda, p1, LocalDateTime.now().minusHours(2),
                "Take Atorvastatin at bedtime. Take Amlodipine in the morning after breakfast.", new ArrayList<>());
        rx1.setStatus("DISPENSED");
        rx1 = prescriptionRepository.save(rx1);

        PrescriptionItem item1 = new PrescriptionItem(new PrescriptionItemId(rx1.getPrescriptionId(), atorvastatin.getDrugId()),
                rx1, atorvastatin, "20mg", "Once daily at bedtime", 30, 30, true);
        PrescriptionItem item2 = new PrescriptionItem(new PrescriptionItemId(rx1.getPrescriptionId(), amlodipine.getDrugId()),
                rx1, amlodipine, "5mg", "Once daily morning", 30, 30, true);
        prescriptionItemRepository.saveAll(Arrays.asList(item1, item2));

        // Log dispensations for rx1
        DrugDispensation disp1 = new DrugDispensation(null, pharmHarshika, atorvastatin, rx1, LocalDateTime.now().minusHours(1), 30);
        DrugDispensation disp2 = new DrugDispensation(null, pharmHarshika, amlodipine, rx1, LocalDateTime.now().minusHours(1), 30);
        drugDispensationRepository.saveAll(Arrays.asList(disp1, disp2));

        Prescription rx2 = new Prescription(null, apt2, docKavinda, p2, LocalDateTime.now(),
                "Avoid sodium intake. Take Losartan daily with breakfast.", new ArrayList<>());
        rx2.setStatus("PENDING");
        rx2 = prescriptionRepository.save(rx2);

        PrescriptionItem item3 = new PrescriptionItem(new PrescriptionItemId(rx2.getPrescriptionId(), losartan.getDrugId()),
                rx2, losartan, "50mg", "Once daily", 30, 30, false);
        PrescriptionItem item4 = new PrescriptionItem(new PrescriptionItemId(rx2.getPrescriptionId(), metformin.getDrugId()),
                rx2, metformin, "500mg", "Twice daily with meals", 30, 60, false);
        prescriptionItemRepository.saveAll(Arrays.asList(item3, item4));

        // 10. Lab Tests
        LabTest test1 = new LabTest(null, apt1, p1, docKavinda, "Routine lipid monitoring", techNethuli,
                LocalDateTime.now().minusHours(1), "Lipid Profile", "Biochemistry", new BigDecimal("2200.00"),
                today, "Total Cholesterol: 185 mg/dL, HDL: 48 mg/dL, LDL: 110 mg/dL, Triglycerides: 135 mg/dL",
                "Total < 200 mg/dL, LDL < 130 mg/dL, HDL > 40 mg/dL", LabTestStatus.COMPLETED);

        LabTest test2 = new LabTest(null, apt2, p2, docKavinda, "Suspected Type 2 Diabetes", techNethuli,
                null, "Fasting Blood Sugar (FBS)", "Biochemistry", new BigDecimal("650.00"),
                today, null, "70 - 99 mg/dL", LabTestStatus.SAMPLE_COLLECTED);

        LabTest test3 = new LabTest(null, apt3, p3, docKavinda, "Pre-operative screening", null,
                null, "Full Blood Count (FBC)", "Hematology", new BigDecimal("1200.00"),
                today.plusDays(1), null, "WBC: 4.5-11.0, Hb: 13.5-17.5 g/dL", LabTestStatus.REQUESTED);

        LabTest test4 = new LabTest(null, apt5, p5, docKavinda, "Electrolyte evaluation", techNethuli,
                LocalDateTime.now().minusDays(1), "Serum Creatinine & Electrolytes", "Biochemistry", new BigDecimal("1800.00"),
                today.minusDays(1), "Serum Creatinine: 0.9 mg/dL, Sodium: 138 mmol/L, Potassium: 4.2 mmol/L",
                "Creatinine: 0.7 - 1.2 mg/dL, Na: 135 - 145 mmol/L, K: 3.5 - 5.0 mmol/L", LabTestStatus.COMPLETED);

        labTestRepository.saveAll(Arrays.asList(test1, test2, test3, test4));

        // 11. Invoices & Payments
        // Invoice 1: Settled encounter for Nimal Perera (Doctor 3500 + Drugs 2190 + Lab 2200 = LKR 7,890.00)
        Invoice inv1 = new Invoice();
        inv1.setPatient(p1);
        inv1.setAppointment(apt1);
        inv1.setBillingDate(LocalDateTime.now().minusHours(1));
        inv1.setInvoiceDate(today);
        inv1.setInvoiceNumber("INV-2026-0001");
        inv1.setDoctorFee(new BigDecimal("3500.00"));
        inv1.setPharmacyFee(new BigDecimal("2190.00"));
        inv1.setLabFee(new BigDecimal("2200.00"));
        inv1.setTaxAmount(BigDecimal.ZERO);
        inv1.setDiscountAmount(BigDecimal.ZERO);
        inv1.setTotalAmount(new BigDecimal("7890.00"));
        inv1.setNetAmount(new BigDecimal("7890.00"));
        inv1.setPaymentStatus(PaymentStatus.PAID);
        inv1 = invoiceRepository.save(inv1);

        InvoiceDrugItem invDrug1 = new InvoiceDrugItem(new InvoiceDrugItemId(inv1.getInvoiceId(), atorvastatin.getDrugId()),
                inv1, atorvastatin, 30, new BigDecimal("1650.00"));
        InvoiceDrugItem invDrug2 = new InvoiceDrugItem(new InvoiceDrugItemId(inv1.getInvoiceId(), amlodipine.getDrugId()),
                inv1, amlodipine, 30, new BigDecimal("540.00"));
        invoiceDrugItemRepository.saveAll(Arrays.asList(invDrug1, invDrug2));

        InvoiceLabItem invLab1 = new InvoiceLabItem(new InvoiceLabItemId(inv1.getInvoiceId(), test1.getTestId()),
                inv1, test1, new BigDecimal("2200.00"));
        invoiceLabItemRepository.save(invLab1);

        PaymentTransaction pay1 = new PaymentTransaction(null, inv1, LocalDateTime.now().minusMinutes(50),
                new BigDecimal("7890.00"), PaymentMethod.CASH, "RCPT-2026-00891");
        paymentRepository.save(pay1);

        // Invoice 2: Active pending encounter for Sunethra Jayawardena (Doctor 3500 + Lab 650 = LKR 4,150.00)
        Invoice inv2 = new Invoice();
        inv2.setPatient(p2);
        inv2.setAppointment(apt2);
        inv2.setBillingDate(LocalDateTime.now().minusMinutes(15));
        inv2.setInvoiceDate(today);
        inv2.setInvoiceNumber("INV-2026-0002");
        inv2.setDoctorFee(new BigDecimal("3500.00"));
        inv2.setPharmacyFee(BigDecimal.ZERO);
        inv2.setLabFee(new BigDecimal("650.00"));
        inv2.setTaxAmount(BigDecimal.ZERO);
        inv2.setDiscountAmount(BigDecimal.ZERO);
        inv2.setTotalAmount(new BigDecimal("4150.00"));
        inv2.setNetAmount(new BigDecimal("4150.00"));
        inv2.setPaymentStatus(PaymentStatus.PENDING);
        inv2 = invoiceRepository.save(inv2);

        InvoiceLabItem invLab2 = new InvoiceLabItem(new InvoiceLabItemId(inv2.getInvoiceId(), test2.getTestId()),
                inv2, test2, new BigDecimal("650.00"));
        invoiceLabItemRepository.save(invLab2);

        log.info("DataSeeder: Database successfully populated! All 6 team members, 12 patients, 23 drugs, and clinical encounters ready.");
    }

    private Patient createPatient(String nic, String first, String last, String street, String city, String postal,
                                  LocalDate dob, Gender gender, BloodGroup bg, TriagePriority triage, String allergies,
                                  String phone, String emgName, String emgRel, String emgPhone) {
        Patient p = new Patient();
        p.setNicPassportNo(nic);
        p.setFirstName(first);
        p.setLastName(last);
        p.setStreet(street);
        p.setCity(city);
        p.setPostalCode(postal);
        p.setDateOfBirth(dob);
        p.setGender(gender);
        p.setContactNumbers(new HashSet<>(Collections.singletonList(phone)));
        p.setBloodGroup(bg);
        p.setRegistrationDate(LocalDate.now().minusDays(new Random().nextInt(30)));
        p.setTriagePriority(triage);
        p.setAllergies(allergies);
        p.setIsArchived(false);
        p.setEmergencyContactName(emgName);
        p.setEmergencyContactRelation(emgRel);
        p.setEmergencyContactPhone(emgPhone);
        return p;
    }
}
