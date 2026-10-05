# Handoff Report: Definitive Class-to-Package Mapping & Git Move Plan for Backend DDD Refactoring

**Agent:** `teamwork_preview_explorer_m1_2` (M1 DDD Architecture Explorer)  
**Date:** 2026-10-04  
**Target Milestone:** Milestone 1 — Backend DDD Restructuring (Feature 2)  
**Target Recipient:** Worker Agent (`teamwork_preview_worker_m1_*` / Orchestrator)  
**Target Path:** `/Users/admin/Projects/honda_leda/.agents/teamwork/teamwork_preview_explorer_m1_2/handoff.md`

---

## 1. Observation

### 1.1 Codebase File Inventory & Git Tracking Status
A recursive scan of `backend/src/main/java/com/pulseos` revealed **exactly 97 Java source files**.
- **Execution Command**:
  ```bash
  find backend/src/main/java/com/pulseos -type f -name "*.java" | wc -l
  git ls-files backend/src/main/java/com/pulseos | wc -l
  ```
- **Result**: Exactly **97 files** exist on disk, and all **97 files** are currently tracked by git.
- **Git MV Safety**: Because all files are tracked in git index, executing `git mv <source> <target>` preserves complete commit history, diff continuity, and blame attribution.

### 1.2 Current Package Architecture (Flat Layered Layout)
The current backend is structured horizontally by technical layer (package-by-layer) under `com.pulseos`:
```text
backend/src/main/java/com/pulseos/
├── PulseOsApplication.java               # 1 application entrypoint
├── common/                              # 5 files (controller, dto, exception, util)
├── config/                              # 3 files (H2TcpServerConfig, PayHereConfig, SecurityConfig)
├── controller/                          # 7 controllers
├── dto/                                 # 6 multi-class DTO files
├── entity/                              # 30 entities + 13 enums under entity/enums/
├── repository/                          # 25 Spring Data JPA repositories
├── seeder/                              # 1 file (DataSeeder)
└── service/                             # 6 service classes
```

### 1.3 Spring Boot Application Configuration & Scanning
Inspection of `backend/src/main/java/com/pulseos/PulseOsApplication.java`:
```java
package com.pulseos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PulseOsApplication {
    public static void main(String[] args) {
        SpringApplication.run(PulseOsApplication.class, args);
    }
}
```
- The application class is located directly in the root base package `com.pulseos`.
- It is annotated with `@SpringBootApplication` without custom configuration parameters.

### 1.4 Downstream Test Dependencies
Two test classes directly reference backend classes:
1. `backend/src/test/java/com/pulseos/PulseOsApplicationTests.java`
   - Imports: `com.pulseos.entity.Doctor`, `com.pulseos.entity.Patient`, `com.pulseos.entity.Invoice`, `com.pulseos.entity.enums.*`, `com.pulseos.repository.*`.
2. `backend/src/test/java/com/pulseos/challenge/PersistenceEmpiricalChallengeTest.java`
   - Imports: `com.pulseos.entity.*`, `com.pulseos.entity.enums.*`, `com.pulseos.repository.*`, `com.pulseos.seeder.DataSeeder`.

---

## 2. Logic Chain

### 2.1 Premise 1: Domain-Driven Bounded Context Architecture
- In accordance with `PROJECT.md` (lines 147–161) and `ORIGINAL_REQUEST.md` (Requirement R2), domain artifacts (Entity, Enums, Repository, Service, Controller, DTOs) belonging to the same business capability must be co-located within a single bounded-context package.
- This creates high cohesion, isolates changes, minimizes cross-domain leakage, and enables package-private visibility where appropriate.
- Across the 97 files:
  - 4 files remain in their existing locations (`PulseOsApplication.java`, `H2TcpServerConfig.java`, `SecurityConfig.java`, `DataSeeder.java`).
  - 93 files are relocated into domain bounded contexts:
    - `com.pulseos.patient` (12 files)
    - `com.pulseos.doctor` (9 files)
    - `com.pulseos.appointment` (6 files)
    - `com.pulseos.pharmacy` (21 files)
    - `com.pulseos.laboratory` (10 files)
    - `com.pulseos.billing` (18 files)
    - `com.pulseos.common` (17 files)

### 2.2 Premise 2: Infrastructure & Base Entities in `com.pulseos.common`
- `Person` is the root joined-inheritance entity extended by both `Patient` and `Employee`.
- `Employee` is the staff base entity extended by `Doctor`, `Pharmacist`, `LabTechnician`, `Receptionist`, and `SystemAdmin`.
- `EmployeeRepository`, `EmployeeRole`, `EmploymentType`, `PersonRepository`, `PersonType`, `Gender`, `Receptionist`, `ReceptionistRepository`, `ShiftBlock`, `SystemAdmin`, and `SystemAdminRepository` represent core human resource and identity primitives shared across clinical and administrative domains.
- Moving them into `com.pulseos.common` alongside `ApiResponse`, `PulseException`, `GlobalExceptionHandler`, and `HealthCheckController` ensures a clean, acyclic dependency model.

### 2.3 Premise 3: Department and Specialty Management in `com.pulseos.doctor`
- `Department` and `DepartmentRepository` are directly used by `DoctorService` and `DoctorDTOs` (`departmentId`, `departmentName`, `departmentRepository.findById()`).
- There is no independent `DepartmentService` or `DepartmentController`.
- In `PROJECT.md:155`, the blueprint specifies: `com.pulseos.doctor (Doctor, DoctorSchedule, Repositories, DoctorService, DoctorController, DTOs)`.
- Co-locating `Department` and `DepartmentRepository` within `com.pulseos.doctor` satisfies the blueprint and encapsulates clinical department management within the doctor domain.
- *(Note: If a strict acyclic DAG where `common.Employee` never references `doctor.Department` is desired, `Department` can alternatively reside in `com.pulseos.common`. Both options are documented below; Option A in `doctor` is the primary recommendation).*

### 2.4 Premise 4: Automatic `@SpringBootApplication` Scanning Verification
- `@SpringBootApplication` is a meta-annotation that includes `@ComponentScan`, `@EnableAutoConfiguration`, and `@SpringBootConfiguration`.
- Under Spring Boot 3.2 conventions:
  1. **Component Scanning**: By default, `@ComponentScan` without explicit `basePackages` scans the package of the declaring class (`com.pulseos`) and **all its sub-packages recursively**. All `@Component`, `@Service`, `@Repository`, `@RestController`, and `@Configuration` beans in `com.pulseos.*` are automatically discovered.
  2. **JPA Entity Scanning**: `HibernateJpaAutoConfiguration` defaults entity discovery to the package of the `@SpringBootApplication` class (`com.pulseos`) and all child sub-packages. Every class annotated with `@Entity`, `@MappedSuperclass`, or `@Embeddable` in `com.pulseos.*` is automatically registered with Hibernate's `EntityManagerFactory`.
  3. **Spring Data JPA Repositories**: `JpaRepositoriesAutoConfiguration` scans the `@SpringBootApplication` base package (`com.pulseos`) and all sub-packages, automatically creating proxy implementations for all `JpaRepository` interfaces in `com.pulseos.*`.
- **Verdict**: No extra `@ComponentScan`, `@EntityScan`, or `@EnableJpaRepositories` annotations are required on `PulseOsApplication`. Moving classes to sub-packages under `com.pulseos.*` is 100% covered automatically.

---

## 3. Caveats

1. **Package Declarations**: Moving files via `git mv` only relocates files on disk; the Worker must update the `package <name>;` statement at the top of each moved file.
2. **Cross-Package Imports**: After moving classes, all intra-package references that previously relied on horizontal packages (`com.pulseos.entity.*`, `com.pulseos.repository.*`) must be replaced with the appropriate domain imports (e.g., `import com.pulseos.patient.Patient;`, `import com.pulseos.doctor.Doctor;`).
3. **Seeder & Test Imports**: `DataSeeder.java`, `PulseOsApplicationTests.java`, and `PersistenceEmpiricalChallengeTest.java` contain wildcard imports (`com.pulseos.entity.*`, `com.pulseos.repository.*`) that will fail to compile until updated to import from the new domain packages.
4. **Cleanup of Empty Directories**: Git does not track empty directories, but the Worker should clean up stale empty folders (`controller/`, `dto/`, `entity/`, `repository/`, `service/`, `common/controller/`, `common/dto/`, `common/exception/`, `common/util/`) using `rm -rf` or `rmdir` after moves.
5. **Zero Source Code Changes in this Exploration**: As an explorer, no files were renamed or edited during this task.

---

## 4. Conclusion & Actionable Worker Plan

### 4.1 Definitive Class-to-Package Mapping Table (All 97 Files)

| Current Relative Path | Target Package | Target Relative Path | Rationale / Role |
| :--- | :--- | :--- | :--- |
| **Root Application (1 file)** | | | |
| `PulseOsApplication.java` | `com.pulseos` | `PulseOsApplication.java` | Main Spring Boot application entrypoint (in-place) |
| **com.pulseos.patient (12 files)** | | | |
| `entity/Patient.java` | `com.pulseos.patient` | `patient/Patient.java` | Core Patient entity |
| `entity/PatientAdmission.java` | `com.pulseos.patient` | `patient/PatientAdmission.java` | Inpatient admission entity |
| `entity/Ward.java` | `com.pulseos.patient` | `patient/Ward.java` | Hospital ward & bed capacity entity |
| `entity/enums/BloodGroup.java` | `com.pulseos.patient` | `patient/BloodGroup.java` | Patient blood group enumeration |
| `entity/enums/TriagePriority.java` | `com.pulseos.patient` | `patient/TriagePriority.java` | Patient triage category (CRITICAL, URGENT, ROUTINE) |
| `entity/enums/WardType.java` | `com.pulseos.patient` | `patient/WardType.java` | Ward classification enum |
| `repository/PatientRepository.java` | `com.pulseos.patient` | `patient/PatientRepository.java` | Patient repository |
| `repository/PatientAdmissionRepository.java` | `com.pulseos.patient` | `patient/PatientAdmissionRepository.java` | Admission repository |
| `repository/WardRepository.java` | `com.pulseos.patient` | `patient/WardRepository.java` | Ward repository |
| `service/PatientService.java` | `com.pulseos.patient` | `patient/PatientService.java` | Patient management service |
| `controller/PatientController.java` | `com.pulseos.patient` | `patient/PatientController.java` | Patient REST API controller (`/api/v1/patients`) |
| `dto/PatientDTOs.java` | `com.pulseos.patient` | `patient/PatientDTOs.java` | Patient request/response DTOs |
| **com.pulseos.doctor (9 files)** | | | |
| `entity/Doctor.java` | `com.pulseos.doctor` | `doctor/Doctor.java` | Doctor clinician entity |
| `entity/DoctorSchedule.java` | `com.pulseos.doctor` | `doctor/DoctorSchedule.java` | Doctor timetable/schedule entity |
| `entity/Department.java` | `com.pulseos.doctor` | `doctor/Department.java` | Clinical department entity |
| `repository/DoctorRepository.java` | `com.pulseos.doctor` | `doctor/DoctorRepository.java` | Doctor repository |
| `repository/DoctorScheduleRepository.java` | `com.pulseos.doctor` | `doctor/DoctorScheduleRepository.java` | Schedule repository |
| `repository/DepartmentRepository.java` | `com.pulseos.doctor` | `doctor/DepartmentRepository.java` | Department repository |
| `service/DoctorService.java` | `com.pulseos.doctor` | `doctor/DoctorService.java` | Doctor & schedule service |
| `controller/DoctorController.java` | `com.pulseos.doctor` | `doctor/DoctorController.java` | Doctor REST API controller (`/api/v1/doctors`) |
| `dto/DoctorDTOs.java` | `com.pulseos.doctor` | `doctor/DoctorDTOs.java` | Doctor request/response & schedule DTOs |
| **com.pulseos.appointment (6 files)** | | | |
| `entity/Appointment.java` | `com.pulseos.appointment` | `appointment/Appointment.java` | Appointment booking entity |
| `entity/enums/AppointmentStatus.java` | `com.pulseos.appointment` | `appointment/AppointmentStatus.java` | Appointment status enum |
| `repository/AppointmentRepository.java` | `com.pulseos.appointment` | `appointment/AppointmentRepository.java` | Appointment repository |
| `service/AppointmentService.java` | `com.pulseos.appointment` | `appointment/AppointmentService.java` | Appointment management service |
| `controller/AppointmentController.java` | `com.pulseos.appointment` | `appointment/AppointmentController.java` | Appointment REST API controller (`/api/v1/appointments`) |
| `dto/AppointmentDTOs.java` | `com.pulseos.appointment` | `appointment/AppointmentDTOs.java` | Appointment request/response DTOs |
| **com.pulseos.pharmacy (21 files)** | | | |
| `entity/Drug.java` | `com.pulseos.pharmacy` | `pharmacy/Drug.java` | Drug inventory catalog entity |
| `entity/DrugDispensation.java` | `com.pulseos.pharmacy` | `pharmacy/DrugDispensation.java` | Dispensation record entity |
| `entity/Pharmacist.java` | `com.pulseos.pharmacy` | `pharmacy/Pharmacist.java` | Pharmacist staff entity |
| `entity/Prescription.java` | `com.pulseos.pharmacy` | `pharmacy/Prescription.java` | Prescription header entity |
| `entity/PrescriptionItem.java` | `com.pulseos.pharmacy` | `pharmacy/PrescriptionItem.java` | Prescription line item entity |
| `entity/PrescriptionItemId.java` | `com.pulseos.pharmacy` | `pharmacy/PrescriptionItemId.java` | Composite PK for prescription line item |
| `entity/PurchaseOrder.java` | `com.pulseos.pharmacy` | `pharmacy/PurchaseOrder.java` | Pharmacy inventory purchase order entity |
| `entity/PurchaseOrderItem.java` | `com.pulseos.pharmacy` | `pharmacy/PurchaseOrderItem.java` | Purchase order line item entity |
| `entity/PurchaseOrderItemId.java` | `com.pulseos.pharmacy` | `pharmacy/PurchaseOrderItemId.java` | Composite PK for purchase order line item |
| `entity/Supplier.java` | `com.pulseos.pharmacy` | `pharmacy/Supplier.java` | Pharmaceutical supplier entity |
| `entity/enums/PurchaseOrderStatus.java` | `com.pulseos.pharmacy` | `pharmacy/PurchaseOrderStatus.java` | Purchase order status enum |
| `repository/DrugRepository.java` | `com.pulseos.pharmacy` | `pharmacy/DrugRepository.java` | Drug repository |
| `repository/DrugDispensationRepository.java` | `com.pulseos.pharmacy` | `pharmacy/DrugDispensationRepository.java` | Dispensation repository |
| `repository/PharmacistRepository.java` | `com.pulseos.pharmacy` | `pharmacy/PharmacistRepository.java` | Pharmacist repository |
| `repository/PrescriptionRepository.java` | `com.pulseos.pharmacy` | `pharmacy/PrescriptionRepository.java` | Prescription repository |
| `repository/PrescriptionItemRepository.java` | `com.pulseos.pharmacy` | `pharmacy/PrescriptionItemRepository.java` | Prescription item repository |
| `repository/PurchaseOrderRepository.java` | `com.pulseos.pharmacy` | `pharmacy/PurchaseOrderRepository.java` | Purchase order repository |
| `repository/SupplierRepository.java` | `com.pulseos.pharmacy` | `pharmacy/SupplierRepository.java` | Supplier repository |
| `service/PharmacyService.java` | `com.pulseos.pharmacy` | `pharmacy/PharmacyService.java` | Pharmacy & formulary service |
| `controller/PharmacyController.java` | `com.pulseos.pharmacy` | `pharmacy/PharmacyController.java` | Pharmacy REST API controller (`/api/v1/pharmacy`) |
| `dto/PharmacyDTOs.java` | `com.pulseos.pharmacy` | `pharmacy/PharmacyDTOs.java` | Pharmacy & prescription DTOs |
| **com.pulseos.laboratory (10 files)** | | | |
| `entity/LabTechnician.java` | `com.pulseos.laboratory` | `laboratory/LabTechnician.java` | Laboratory technician entity |
| `entity/LabTest.java` | `com.pulseos.laboratory` | `laboratory/LabTest.java` | Lab test order/result entity |
| `entity/LabTestCatalog.java` | `com.pulseos.laboratory` | `laboratory/LabTestCatalog.java` | Lab diagnostic catalog entity |
| `entity/enums/LabTestStatus.java` | `com.pulseos.laboratory` | `laboratory/LabTestStatus.java` | Lab test lifecycle status enum |
| `repository/LabTechnicianRepository.java` | `com.pulseos.laboratory` | `laboratory/LabTechnicianRepository.java` | Lab technician repository |
| `repository/LabTestRepository.java` | `com.pulseos.laboratory` | `laboratory/LabTestRepository.java` | Lab test repository |
| `repository/LabTestCatalogRepository.java` | `com.pulseos.laboratory` | `laboratory/LabTestCatalogRepository.java` | Lab catalog repository |
| `service/LaboratoryService.java` | `com.pulseos.laboratory` | `laboratory/LaboratoryService.java` | Lab diagnostic service |
| `controller/LaboratoryController.java` | `com.pulseos.laboratory` | `laboratory/LaboratoryController.java` | Lab REST API controller (`/api/v1/laboratory`) |
| `dto/LabDTOs.java` | `com.pulseos.laboratory` | `laboratory/LabDTOs.java` | Lab order & result DTOs |
| **com.pulseos.billing (18 files)** | | | |
| `entity/Invoice.java` | `com.pulseos.billing` | `billing/Invoice.java` | Billing invoice entity |
| `entity/InvoiceDrugItem.java` | `com.pulseos.billing` | `billing/InvoiceDrugItem.java` | Invoice drug charge item entity |
| `entity/InvoiceDrugItemId.java` | `com.pulseos.billing` | `billing/InvoiceDrugItemId.java` | Composite PK for invoice drug item |
| `entity/InvoiceLabItem.java` | `com.pulseos.billing` | `billing/InvoiceLabItem.java` | Invoice lab test charge item entity |
| `entity/InvoiceLabItemId.java` | `com.pulseos.billing` | `billing/InvoiceLabItemId.java` | Composite PK for invoice lab item |
| `entity/PaymentTransaction.java` | `com.pulseos.billing` | `billing/PaymentTransaction.java` | Payment transaction audit entity |
| `entity/enums/PaymentMethod.java` | `com.pulseos.billing` | `billing/PaymentMethod.java` | Payment method enum (CASH, CARD, PAYHERE) |
| `entity/enums/PaymentStatus.java` | `com.pulseos.billing` | `billing/PaymentStatus.java` | Payment status enum (UNPAID, PAID, PARTIAL) |
| `repository/InvoiceRepository.java` | `com.pulseos.billing` | `billing/InvoiceRepository.java` | Invoice repository |
| `repository/InvoiceDrugItemRepository.java` | `com.pulseos.billing` | `billing/InvoiceDrugItemRepository.java` | Invoice drug item repository |
| `repository/InvoiceLabItemRepository.java` | `com.pulseos.billing` | `billing/InvoiceLabItemRepository.java` | Invoice lab item repository |
| `repository/PaymentRepository.java` | `com.pulseos.billing` | `billing/PaymentRepository.java` | Payment transaction repository |
| `service/BillingService.java` | `com.pulseos.billing` | `billing/BillingService.java` | Aggregation billing & settlement service |
| `controller/BillingController.java` | `com.pulseos.billing` | `billing/BillingController.java` | Billing invoice REST API (`/api/v1/billing`) |
| `controller/PaymentController.java` | `com.pulseos.billing` | `billing/PaymentController.java` | PayHere checkout & IPN REST API (`/api/v1/payments`) |
| `dto/BillingDTOs.java` | `com.pulseos.billing` | `billing/BillingDTOs.java` | Billing, settlement, & PayHere DTOs |
| `config/PayHereConfig.java` | `com.pulseos.billing` | `billing/PayHereConfig.java` | PayHere merchant configuration bean |
| `common/util/PayHereSecurityUtil.java` | `com.pulseos.billing` | `billing/PayHereSecurityUtil.java` | PayHere MD5 checksum hashing utility |
| **com.pulseos.common (17 files)** | | | |
| `entity/Person.java` | `com.pulseos.common` | `common/Person.java` | Root joined-inheritance entity |
| `entity/enums/PersonType.java` | `com.pulseos.common` | `common/PersonType.java` | Discriminator enum for Person |
| `entity/enums/Gender.java` | `com.pulseos.common` | `common/Gender.java` | Gender enum |
| `repository/PersonRepository.java` | `com.pulseos.common` | `common/PersonRepository.java` | Person base repository |
| `entity/Employee.java` | `com.pulseos.common` | `common/Employee.java` | Joined-inheritance base entity for staff |
| `entity/enums/EmployeeRole.java` | `com.pulseos.common` | `common/EmployeeRole.java` | Role enum for hospital employees |
| `entity/enums/EmploymentType.java` | `com.pulseos.common` | `common/EmploymentType.java` | Employment contract type enum |
| `repository/EmployeeRepository.java` | `com.pulseos.common` | `common/EmployeeRepository.java` | Staff employee repository |
| `entity/Receptionist.java` | `com.pulseos.common` | `common/Receptionist.java` | Front desk staff entity |
| `entity/enums/ShiftBlock.java` | `com.pulseos.common` | `common/ShiftBlock.java` | Work shift block enum |
| `repository/ReceptionistRepository.java` | `com.pulseos.common` | `common/ReceptionistRepository.java` | Receptionist repository |
| `entity/SystemAdmin.java` | `com.pulseos.common` | `common/SystemAdmin.java` | System administration staff entity |
| `repository/SystemAdminRepository.java` | `com.pulseos.common` | `common/SystemAdminRepository.java` | System admin repository |
| `common/dto/ApiResponse.java` | `com.pulseos.common` | `common/ApiResponse.java` | Unified JSON envelope wrapper |
| `common/exception/PulseException.java` | `com.pulseos.common` | `common/PulseException.java` | Global unchecked domain exception |
| `common/exception/GlobalExceptionHandler.java` | `com.pulseos.common` | `common/GlobalExceptionHandler.java` | RestControllerAdvice exception handler |
| `common/controller/HealthCheckController.java` | `com.pulseos.common` | `common/HealthCheckController.java` | Backend healthcheck endpoint (`/api/v1/health`) |
| **com.pulseos.config (2 files)** | | | |
| `config/H2TcpServerConfig.java` | `com.pulseos.config` | `config/H2TcpServerConfig.java` | H2 TCP Server configuration bean (in-place) |
| `config/SecurityConfig.java` | `com.pulseos.config` | `config/SecurityConfig.java` | Spring Security filter chain configuration (in-place) |
| **com.pulseos.seeder (1 file)** | | | |
| `seeder/DataSeeder.java` | `com.pulseos.seeder` | `seeder/DataSeeder.java` | Demo data seeder runner (in-place) |

---

### 4.2 Exact Executable Bash Script for Worker (`git mv`)

The Worker can execute the following shell commands verbatim from the project root `/Users/admin/Projects/honda_leda`:

```bash
#!/bin/bash
set -e

BASE="backend/src/main/java/com/pulseos"

# 1. Create target bounded context directories
mkdir -p "$BASE/patient"
mkdir -p "$BASE/doctor"
mkdir -p "$BASE/appointment"
mkdir -p "$BASE/pharmacy"
mkdir -p "$BASE/laboratory"
mkdir -p "$BASE/billing"
mkdir -p "$BASE/common"

# 2. Move patient domain files (12 files)
git mv "$BASE/entity/Patient.java" "$BASE/patient/Patient.java"
git mv "$BASE/entity/PatientAdmission.java" "$BASE/patient/PatientAdmission.java"
git mv "$BASE/entity/Ward.java" "$BASE/patient/Ward.java"
git mv "$BASE/entity/enums/BloodGroup.java" "$BASE/patient/BloodGroup.java"
git mv "$BASE/entity/enums/TriagePriority.java" "$BASE/patient/TriagePriority.java"
git mv "$BASE/entity/enums/WardType.java" "$BASE/patient/WardType.java"
git mv "$BASE/repository/PatientRepository.java" "$BASE/patient/PatientRepository.java"
git mv "$BASE/repository/PatientAdmissionRepository.java" "$BASE/patient/PatientAdmissionRepository.java"
git mv "$BASE/repository/WardRepository.java" "$BASE/patient/WardRepository.java"
git mv "$BASE/service/PatientService.java" "$BASE/patient/PatientService.java"
git mv "$BASE/controller/PatientController.java" "$BASE/patient/PatientController.java"
git mv "$BASE/dto/PatientDTOs.java" "$BASE/patient/PatientDTOs.java"

# 3. Move doctor domain files (9 files)
git mv "$BASE/entity/Doctor.java" "$BASE/doctor/Doctor.java"
git mv "$BASE/entity/DoctorSchedule.java" "$BASE/doctor/DoctorSchedule.java"
git mv "$BASE/entity/Department.java" "$BASE/doctor/Department.java"
git mv "$BASE/repository/DoctorRepository.java" "$BASE/doctor/DoctorRepository.java"
git mv "$BASE/repository/DoctorScheduleRepository.java" "$BASE/doctor/DoctorScheduleRepository.java"
git mv "$BASE/repository/DepartmentRepository.java" "$BASE/doctor/DepartmentRepository.java"
git mv "$BASE/service/DoctorService.java" "$BASE/doctor/DoctorService.java"
git mv "$BASE/controller/DoctorController.java" "$BASE/doctor/DoctorController.java"
git mv "$BASE/dto/DoctorDTOs.java" "$BASE/doctor/DoctorDTOs.java"

# 4. Move appointment domain files (6 files)
git mv "$BASE/entity/Appointment.java" "$BASE/appointment/Appointment.java"
git mv "$BASE/entity/enums/AppointmentStatus.java" "$BASE/appointment/AppointmentStatus.java"
git mv "$BASE/repository/AppointmentRepository.java" "$BASE/appointment/AppointmentRepository.java"
git mv "$BASE/service/AppointmentService.java" "$BASE/appointment/AppointmentService.java"
git mv "$BASE/controller/AppointmentController.java" "$BASE/appointment/AppointmentController.java"
git mv "$BASE/dto/AppointmentDTOs.java" "$BASE/appointment/AppointmentDTOs.java"

# 5. Move pharmacy domain files (21 files)
git mv "$BASE/entity/Drug.java" "$BASE/pharmacy/Drug.java"
git mv "$BASE/entity/DrugDispensation.java" "$BASE/pharmacy/DrugDispensation.java"
git mv "$BASE/entity/Pharmacist.java" "$BASE/pharmacy/Pharmacist.java"
git mv "$BASE/entity/Prescription.java" "$BASE/pharmacy/Prescription.java"
git mv "$BASE/entity/PrescriptionItem.java" "$BASE/pharmacy/PrescriptionItem.java"
git mv "$BASE/entity/PrescriptionItemId.java" "$BASE/pharmacy/PrescriptionItemId.java"
git mv "$BASE/entity/PurchaseOrder.java" "$BASE/pharmacy/PurchaseOrder.java"
git mv "$BASE/entity/PurchaseOrderItem.java" "$BASE/pharmacy/PurchaseOrderItem.java"
git mv "$BASE/entity/PurchaseOrderItemId.java" "$BASE/pharmacy/PurchaseOrderItemId.java"
git mv "$BASE/entity/Supplier.java" "$BASE/pharmacy/Supplier.java"
git mv "$BASE/entity/enums/PurchaseOrderStatus.java" "$BASE/pharmacy/PurchaseOrderStatus.java"
git mv "$BASE/repository/DrugRepository.java" "$BASE/pharmacy/DrugRepository.java"
git mv "$BASE/repository/DrugDispensationRepository.java" "$BASE/pharmacy/DrugDispensationRepository.java"
git mv "$BASE/repository/PharmacistRepository.java" "$BASE/pharmacy/PharmacistRepository.java"
git mv "$BASE/repository/PrescriptionRepository.java" "$BASE/pharmacy/PrescriptionRepository.java"
git mv "$BASE/repository/PrescriptionItemRepository.java" "$BASE/pharmacy/PrescriptionItemRepository.java"
git mv "$BASE/repository/PurchaseOrderRepository.java" "$BASE/pharmacy/PurchaseOrderRepository.java"
git mv "$BASE/repository/SupplierRepository.java" "$BASE/pharmacy/SupplierRepository.java"
git mv "$BASE/service/PharmacyService.java" "$BASE/pharmacy/PharmacyService.java"
git mv "$BASE/controller/PharmacyController.java" "$BASE/pharmacy/PharmacyController.java"
git mv "$BASE/dto/PharmacyDTOs.java" "$BASE/pharmacy/PharmacyDTOs.java"

# 6. Move laboratory domain files (10 files)
git mv "$BASE/entity/LabTechnician.java" "$BASE/laboratory/LabTechnician.java"
git mv "$BASE/entity/LabTest.java" "$BASE/laboratory/LabTest.java"
git mv "$BASE/entity/LabTestCatalog.java" "$BASE/laboratory/LabTestCatalog.java"
git mv "$BASE/entity/enums/LabTestStatus.java" "$BASE/laboratory/LabTestStatus.java"
git mv "$BASE/repository/LabTechnicianRepository.java" "$BASE/laboratory/LabTechnicianRepository.java"
git mv "$BASE/repository/LabTestRepository.java" "$BASE/laboratory/LabTestRepository.java"
git mv "$BASE/repository/LabTestCatalogRepository.java" "$BASE/laboratory/LabTestCatalogRepository.java"
git mv "$BASE/service/LaboratoryService.java" "$BASE/laboratory/LaboratoryService.java"
git mv "$BASE/controller/LaboratoryController.java" "$BASE/laboratory/LaboratoryController.java"
git mv "$BASE/dto/LabDTOs.java" "$BASE/laboratory/LabDTOs.java"

# 7. Move billing domain files (18 files)
git mv "$BASE/entity/Invoice.java" "$BASE/billing/Invoice.java"
git mv "$BASE/entity/InvoiceDrugItem.java" "$BASE/billing/InvoiceDrugItem.java"
git mv "$BASE/entity/InvoiceDrugItemId.java" "$BASE/billing/InvoiceDrugItemId.java"
git mv "$BASE/entity/InvoiceLabItem.java" "$BASE/billing/InvoiceLabItem.java"
git mv "$BASE/entity/InvoiceLabItemId.java" "$BASE/billing/InvoiceLabItemId.java"
git mv "$BASE/entity/PaymentTransaction.java" "$BASE/billing/PaymentTransaction.java"
git mv "$BASE/entity/enums/PaymentMethod.java" "$BASE/billing/PaymentMethod.java"
git mv "$BASE/entity/enums/PaymentStatus.java" "$BASE/billing/PaymentStatus.java"
git mv "$BASE/repository/InvoiceRepository.java" "$BASE/billing/InvoiceRepository.java"
git mv "$BASE/repository/InvoiceDrugItemRepository.java" "$BASE/billing/InvoiceDrugItemRepository.java"
git mv "$BASE/repository/InvoiceLabItemRepository.java" "$BASE/billing/InvoiceLabItemRepository.java"
git mv "$BASE/repository/PaymentRepository.java" "$BASE/billing/PaymentRepository.java"
git mv "$BASE/service/BillingService.java" "$BASE/billing/BillingService.java"
git mv "$BASE/controller/BillingController.java" "$BASE/billing/BillingController.java"
git mv "$BASE/controller/PaymentController.java" "$BASE/billing/PaymentController.java"
git mv "$BASE/dto/BillingDTOs.java" "$BASE/billing/BillingDTOs.java"
git mv "$BASE/config/PayHereConfig.java" "$BASE/billing/PayHereConfig.java"
git mv "$BASE/common/util/PayHereSecurityUtil.java" "$BASE/billing/PayHereSecurityUtil.java"

# 8. Move common base and shared files (17 files)
git mv "$BASE/entity/Person.java" "$BASE/common/Person.java"
git mv "$BASE/entity/enums/PersonType.java" "$BASE/common/PersonType.java"
git mv "$BASE/entity/enums/Gender.java" "$BASE/common/Gender.java"
git mv "$BASE/repository/PersonRepository.java" "$BASE/common/PersonRepository.java"
git mv "$BASE/entity/Employee.java" "$BASE/common/Employee.java"
git mv "$BASE/entity/enums/EmployeeRole.java" "$BASE/common/EmployeeRole.java"
git mv "$BASE/entity/enums/EmploymentType.java" "$BASE/common/EmploymentType.java"
git mv "$BASE/repository/EmployeeRepository.java" "$BASE/common/EmployeeRepository.java"
git mv "$BASE/entity/Receptionist.java" "$BASE/common/Receptionist.java"
git mv "$BASE/entity/enums/ShiftBlock.java" "$BASE/common/ShiftBlock.java"
git mv "$BASE/repository/ReceptionistRepository.java" "$BASE/common/ReceptionistRepository.java"
git mv "$BASE/entity/SystemAdmin.java" "$BASE/common/SystemAdmin.java"
git mv "$BASE/repository/SystemAdminRepository.java" "$BASE/common/SystemAdminRepository.java"
git mv "$BASE/common/dto/ApiResponse.java" "$BASE/common/ApiResponse.java"
git mv "$BASE/common/exception/PulseException.java" "$BASE/common/PulseException.java"
git mv "$BASE/common/exception/GlobalExceptionHandler.java" "$BASE/common/GlobalExceptionHandler.java"
git mv "$BASE/common/controller/HealthCheckController.java" "$BASE/common/HealthCheckController.java"

# 9. Clean up empty historical directories
rm -rf "$BASE/controller"
rm -rf "$BASE/dto"
rm -rf "$BASE/entity"
rm -rf "$BASE/repository"
rm -rf "$BASE/service"
rm -rf "$BASE/common/controller"
rm -rf "$BASE/common/dto"
rm -rf "$BASE/common/exception"
rm -rf "$BASE/common/util"
```

---

## 5. Verification Method

### 5.1 Pre-Migration Integrity Check
Run this check to ensure all 97 files are accounted for prior to running `git mv`:
```bash
python3 -c '
import os
root = "backend/src/main/java/com/pulseos"
files = [os.path.join(r, f) for r, _, fs in os.walk(root) for f in fs if f.endswith(".java")]
print("Java file count:", len(files))
assert len(files) == 97, "Expected exactly 97 files"
'
```

### 5.2 Post-Migration Integrity Check
After executing the script, verify that no uncommitted untracked deletions or duplicate files remain:
```bash
# 1. Total Java files must remain exactly 97
find backend/src/main/java/com/pulseos -name "*.java" | wc -l
# Expected: 97

# 2. Verify git status shows exactly 93 renames and 0 untracked deletions
git status -s backend/src/main/java/com/pulseos | grep "^R" | wc -l
# Expected: 93
```

### 5.3 Compilation & Test Verification
After the Worker updates package declarations and import statements:
```bash
# 1. Test compilation
cd /Users/admin/Projects/honda_leda/backend && ./mvnw test-compile

# 2. Run unit tests
cd /Users/admin/Projects/honda_leda/backend && ./mvnw test
```
*Expected Result*: `BUILD SUCCESS` with zero compilation errors and passing unit tests (once M1 Explorer 3's test assertion count fix of 13 patients and 6 lab tests is applied).
