# Handoff Report: Single-Source-of-Truth DTO Cleansing & Test Assertion Fixes

**Agent:** `teamwork_preview_explorer_m1_3` (M1 Explorer 3)  
**Date:** 2026-10-04  
**Target Milestone:** Milestone 1 — Single-Source-of-Truth DTOs (Feature 3) & Test Count Fixes (Feature 4)  
**Target Recipient:** Worker Agent (`teamwork_preview_worker_m1_*` / Orchestrator)  

---

## 1. Observation

### 1.1 Empirical Test Failure Observations
Command executed:
```bash
./mvnw test -Dtest=PulseOsApplicationTests
```
Verbatim Maven test output:
```text
[ERROR] Failures: 
[ERROR]   PulseOsApplicationTests.verifyClinicalEncountersAndInvoices:86 
expected: 4L
 but was: 6L
[ERROR]   PulseOsApplicationTests.verifyPatientsAndDrugsSeeded:76 
Expected size: 12 but was: 13 in:
[com.pulseos.entity.Patient@1f227c44,
    com.pulseos.entity.Patient@73990c4d,
    com.pulseos.entity.Patient@6e3a9891,
    com.pulseos.entity.Patient@56dce7f7,
    com.pulseos.entity.Patient@7c441275,
    com.pulseos.entity.Patient@43af156a,
    com.pulseos.entity.Patient@5ec40569,
    com.pulseos.entity.Patient@7aa5596f,
    com.pulseos.entity.Patient@7dc56c0a,
    com.pulseos.entity.Patient@3c73a08e,
    com.pulseos.entity.Patient@4f8365b2,
    com.pulseos.entity.Patient@6d093764,
    com.pulseos.entity.Patient@27e05d64]
[INFO] 
[ERROR] Tests run: 13, Failures: 2, Errors: 0, Skipped: 0
[INFO] BUILD FAILURE
```

#### Root Cause Analysis from Seed Data
1. **Patient Count Mismatch (`PulseOsApplicationTests.java:76`)**:
   - `PulseOsApplicationTests.java:75-76`:
     ```java
     List<Patient> activePatients = patientRepository.findByIsArchivedFalse();
     assertThat(activePatients).hasSize(12);
     ```
   - In `backend/src/main/java/com/pulseos/seeder/DataSeeder.java:231-288`:
     The seeder seeds 12 realistic clinical patients (`p1` through `p12`), plus 1 dedicated demo patient (`pDemo`, NIC `199012345678`, email `demo.patient@pulseos.lk`, password `password`) for evaluation login:
     ```java
     List<Patient> patients = Arrays.asList(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, pDemo);
     patientRepository.saveAll(patients);
     ```
   - All 13 patients have `isArchived = false`.
   - Therefore, `patientRepository.findByIsArchivedFalse()` contains 13 active patients, causing the assertion expecting 12 to fail.

2. **Lab Test Count Mismatch (`PulseOsApplicationTests.java:86`)**:
   - `PulseOsApplicationTests.java:85-86`:
     ```java
     assertThat(appointmentRepository.count()).isEqualTo(5);
     assertThat(labTestRepository.count()).isEqualTo(4);
     ```
   - In `backend/src/main/java/com/pulseos/seeder/DataSeeder.java:405-466`:
     The seeder seeds 4 appointment encounter tests (`test1` for `apt1`, `test2` for `apt2`, `test3` for `apt3`, `test4` for `apt5`), plus 2 demo patient lab tests (`testDemoCompleted` and `testDemoProcessing` for `pDemo`):
     ```java
     labTestRepository.saveAll(Arrays.asList(test1, test2, test3, test4, testDemoCompleted, testDemoProcessing));
     ```
   - Total lab tests seeded in the database is 6.
   - Therefore, `labTestRepository.count()` is 6L, causing the assertion expecting 4 to fail.

---

### 1.2 DTO Catalog and Redundant Field Inventory
Across the 6 DTO files in `backend/src/main/java/com/pulseos/dto/`, a total of **47 redundant, duplicated, and synonym fields** were identified:

#### File 1: `PatientDTOs.java` (Path: `backend/src/main/java/com/pulseos/dto/PatientDTOs.java`)
- **`PatientRequest` (Lines 15-47)**:
  - `nicPassport` (Line 16) vs `nicPassportNo` (Line 17): Duplicate fields for patient NIC.
  - `phoneNumber` (Line 22) vs `contactNumber` (Line 23): Duplicate fields for contact number.
  - `dateOfBirth` (Line 26) vs `dob` (Line 27): Duplicate fields for date of birth.
  - Helper fallback methods required due to duplicates: `getResolvedNic()`, `getResolvedPhone()`, `getResolvedDob()` (Lines 36-46).
- **`PatientResponse` (Lines 55-81)**:
  - `id` (Line 56) vs `personId` (Line 57) vs `patientId` (Line 58): 3 separate fields storing the identical primary key `p.getId()`.
  - `nicPassport` (Line 59) vs `nicPassportNo` (Line 60): Duplicate fields storing `p.getNicPassportNo()`.
  - `phoneNumber` (Line 65) vs `contactNumber` (Line 66): Duplicate fields storing the phone number.
  - `dateOfBirth` (Line 69) vs `dob` (Line 70): Duplicate fields storing `dob`.
  - `isArchived` (Line 78) vs `status` (Line 79): `status` is a redundant string representation of boolean `isArchived`.

#### File 2: `DoctorDTOs.java` (Path: `backend/src/main/java/com/pulseos/dto/DoctorDTOs.java`)
- **`DoctorRequest` (Lines 15-35)**:
  - `licenseNumber` (Line 20) vs `licenseNo` (Line 21) vs `doctorLicenseNo` (Line 22): 3 separate fields for the doctor SLMC license.
  - Helper fallback method: `getResolvedLicense()` (Lines 30-34).
- **`DoctorResponse` (Lines 43-61)**:
  - `id` (Line 44) vs `employeeId` (Line 45): 2 separate fields storing doctor PK `d.getId()`.
  - `phoneNumber` (Line 50) vs `contactNumber` (Line 51): Duplicate fields storing phone number.
  - `licenseNumber` (Line 52) vs `licenseNo` (Line 53) vs `doctorLicenseNo` (Line 54): 3 separate fields storing `d.getDoctorLicenseNo()`.

#### File 3: `AppointmentDTOs.java` (Path: `backend/src/main/java/com/pulseos/dto/AppointmentDTOs.java`)
- **`AppointmentRequest` (Lines 13-33)**:
  - `startTime` (Line 17) vs `appointmentTime` (Line 18): Duplicate fields for appointment time slot.
  - `symptomsReason` (Line 20) vs `reasonForVisit` (Line 21): Duplicate fields for consultation reason.
  - Helper methods: `getResolvedStartTime()`, `getResolvedReason()` (Lines 24-32).
- **`AppointmentResponse` (Lines 41-60)**:
  - `id` (Line 42) vs `appointmentId` (Line 43): 2 separate fields storing appointment PK.
  - `startTime` (Line 52) vs `appointmentTime` (Line 53): Duplicate fields storing `a.getAppointmentTime()`.
  - `symptomsReason` (Line 56) vs `reasonForVisit` (Line 57): Duplicate fields storing `a.getReasonForVisit()`.
- **`RescheduleRequest` (Lines 66-77)**:
  - `startTime` (Line 69) vs `appointmentTime` (Line 70): Duplicate fields for time slot.
  - Helper method: `getResolvedStartTime()` (Lines 73-76).

#### File 4: `BillingDTOs.java` (Path: `backend/src/main/java/com/pulseos/dto/BillingDTOs.java`)
- **`InvoiceItemResponse` (Lines 27-36)**:
  - `subtotal` (Line 34) vs `totalPrice` (Line 35): Exact duplicate values representing line item total.
- **`InvoiceResponse` (Lines 44-65)**:
  - `id` (Line 45) vs `invoiceId` (Line 46): 2 separate fields storing invoice PK.
  - `status` (Line 59) vs `paymentStatus` (Line 60): Exact duplicate values storing payment status enum string.
- **`PayHereInitiateResponse` (Lines 72-97)**:
  - `merchantId` (Line 74) vs `merchant_id` (Line 75): Duplicate camelCase vs snake_case.
  - `orderId` (Line 76) vs `order_id` (Line 77): Duplicate camelCase vs snake_case.
  - `notifyUrl` (Line 81) vs `notify_url` (Line 82): Duplicate camelCase vs snake_case.
  - `patientFirstName` (Line 86) vs `first_name` (Line 90): Duplicate first name fields.
  - `patientLastName` (Line 87) vs `last_name` (Line 91): Duplicate last name fields.
  - `patientEmail` (Line 88) vs `email` (Line 92): Duplicate email fields.
  - `patientPhone` (Line 89) vs `phone` (Line 93): Duplicate phone fields.

#### File 5: `LabDTOs.java` (Path: `backend/src/main/java/com/pulseos/dto/LabDTOs.java`)
- **`LabCatalogResponse` (Lines 15-27)**:
  - `price` (Line 21) vs `standardFee` (Line 22): Exact duplicate values storing `c.getPrice()`.
- **`LabOrderRequest` (Lines 33-47)**:
  - `labTestId` (Line 38) vs `testCatalogId` (Line 39): Duplicate fields for catalog reference ID.
  - Helper method: `getResolvedTestCatalogId()` (Lines 43-46).
- **`LabResultRequest` (Lines 53-66)**:
  - `clinicalRemarks` (Line 58) vs `technicianNotes` (Line 59): Duplicate fields for remarks.
  - Helper method: `getResolvedRemarks()` (Lines 62-65).
- **`LabRequestResponse` (Lines 73-103)**:
  - `id` (Line 75) vs `testId` (Line 76): 2 separate fields storing lab test PK.
  - `sampleType` (Line 94) vs `specimenType` (Line 95): Exact duplicate values storing `t.getSampleType()`.

#### File 6: `PharmacyDTOs.java` (Path: `backend/src/main/java/com/pulseos/dto/PharmacyDTOs.java`)
- **`DrugResponse` (Lines 46-65)**:
  - `id` (Line 48) vs `drugId` (Line 49): 2 separate fields storing drug PK.
- **`PrescriptionItemRequest` (Lines 71-91)**:
  - `prescribedQuantity` (Line 78) vs `prescribedQty` (Line 79): Duplicate fields for quantity.
  - `frequency` (Line 75) vs `dosageFrequency` (Line 76): Duplicate fields for dosage frequency.
  - Helper methods: `getResolvedPrescribedQuantity()`, `getResolvedFrequency()`.
- **`PrescriptionItemResponse` (Lines 98-113)**:
  - `id` (Line 100) vs `drugId` (Line 101): Duplicate fields storing drug ID.
  - `prescribedQuantity` (Line 106) vs `prescribedQty` (Line 107): Duplicate fields.
  - `dispensedQuantity` (Line 108) vs `dispensedQty` (Line 109): Duplicate fields.
- **`PrescriptionRequest` (Lines 119-133)**:
  - `notes` (Line 124) vs `doctorInstructions` (Line 125): Duplicate fields for instructions.
  - Helper method: `getResolvedNotes()`.
- **`PrescriptionResponse` (Lines 139-155)**:
  - `id` (Line 141) vs `prescriptionId` (Line 142): Duplicate fields storing prescription PK.
  - `issuedDate` (Line 149) vs `prescriptionDate` (Line 150): Duplicate string representations of the date.
  - `notes` (Line 152) vs `doctorInstructions` (Line 153): Duplicate fields storing `rx.getDoctorInstructions()`.

---

## 2. Logic Chain

1. **Premise 1 (Test Count Assertions must reflect actual Seed Data):**
   - Observations 1.1 confirm that `DataSeeder.java` seeds 13 patients (including `pDemo`) and 6 lab tests (including 2 tests for `pDemo`).
   - The test assertions in `PulseOsApplicationTests.java` were expecting 12 patients and 4 lab tests because they were written before `pDemo` and its lab investigations were added to the seeder.
   - Therefore, updating the expected count in `verifyPatientsAndDrugsSeeded` to 13 and `verifyClinicalEncountersAndInvoices` to 6 aligns test assertions with actual seeder specifications and eliminates 100% of unit test failures.

2. **Premise 2 (Java Memory Model vs JSON Wire Compatibility):**
   - Storing two or three Java fields with identical values in memory violates Single-Source-of-Truth (SSOT) principles, creates state desynchronization risks, and increases heap footprint.
   - For incoming JSON requests, Jackson's `@JsonAlias` accepts any legacy or alternative JSON property name during deserialization and binds it into a single canonical Java field.
   - For outgoing JSON responses, Jackson's `@JsonProperty` on getter methods provides backward-compatible JSON keys to frontend clients without duplicating fields in Java object state.
   - Therefore, canonical DTOs can maintain ZERO redundant fields in Java memory while maintaining 100% contract compatibility with existing frontend views and external APIs.

3. **Premise 3 (Mapper Simplification):**
   - Because canonical DTOs have single fields, service mappers (`toResponse`) no longer need to call redundant builder setters (e.g., calling `.id()`, `.personId()`, and `.patientId()` simultaneously).
   - Removing redundant setters simplifies mapper methods, improves readability, and adheres to deep module design principles.

---

## 3. Caveats

- **No Caveats on Test Execution:** The two test assertions are isolated and have zero side effects on other tests in `PersistenceEmpiricalChallengeTest.java`.
- **Lombok `@Builder` Compatibility:** The service mappers in `PatientService`, `DoctorService`, `AppointmentService`, `BillingService`, `LaboratoryService`, and `PharmacyService` currently invoke `.builder()`. The redesigned DTOs retain Lombok `@Builder` on the canonical class definitions so existing service construction patterns remain fully supported.
- **Frontend Contract Stability:** By utilizing `@JsonProperty` on getter methods for response DTOs (e.g., `@JsonProperty("patientId") public Long getPatientId() { return id; }`), frontend components that access either `patient.id` or `patient.patientId` will continue to function seamlessly without requiring immediate frontend refactoring.

---

## 4. Conclusion & Complete Design Specifications

### 4.1 Exact Fix for `PulseOsApplicationTests.java`

File: `/Users/admin/Projects/honda_leda/backend/src/test/java/com/pulseos/PulseOsApplicationTests.java`

#### Diff / Code Changes:
Lines 72-87:
```java
<<<< OLD CODE (Lines 72-87):
    @Test
    @DisplayName("DataSeeder successfully seeds 12 realistic patients and 23 drugs with low stock triggers")
    void verifyPatientsAndDrugsSeeded() {
        List<Patient> activePatients = patientRepository.findByIsArchivedFalse();
        assertThat(activePatients).hasSize(12);

        assertThat(drugRepository.count()).isEqualTo(23);
        assertThat(drugRepository.findLowStockDrugs()).hasSize(6);
    }

    @Test
    @DisplayName("DataSeeder successfully seeds clinical encounters, lab tests, and aggregated invoices")
    void verifyClinicalEncountersAndInvoices() {
        assertThat(appointmentRepository.count()).isEqualTo(5);
        assertThat(labTestRepository.count()).isEqualTo(4);
==== NEW CODE:
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
>>>>
```

---

### 4.2 Clean Canonical DTO Specifications (Zero Redundant Fields)

The following source code represents the complete canonical designs for all 6 DTO files.

#### File 1: `PatientDTOs.java` (`backend/src/main/java/com/pulseos/dto/PatientDTOs.java`)
```java
package com.pulseos.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

public class PatientDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PatientRequest {
        @JsonProperty("nicPassportNo")
        @JsonAlias({"nicPassport"})
        private String nicPassportNo;

        private String firstName;
        private String lastName;
        private String email;
        private String password;

        @JsonProperty("contactNumber")
        @JsonAlias({"phoneNumber", "phone"})
        private String contactNumber;

        private String address;
        private String gender;

        @JsonProperty("dateOfBirth")
        @JsonAlias({"dob"})
        private String dateOfBirth;

        private String bloodGroup;
        private String allergies;
        private String emergencyContactName;
        private String emergencyContactPhone;
        private String emergencyContactRelationship;
        private String triagePriority;
        private String medicalNotes;

        // Backward compatibility pass-throughs
        public String getResolvedNic() { return nicPassportNo; }
        public String getResolvedPhone() { return contactNumber; }
        public String getResolvedDob() { return dateOfBirth; }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class PatientResponse {
        @JsonProperty("id")
        @JsonAlias({"patientId", "personId"})
        private Long id;

        @JsonProperty("nicPassportNo")
        @JsonAlias({"nicPassport"})
        private String nicPassportNo;

        private String firstName;
        private String lastName;
        private String fullName;
        private String email;

        @JsonProperty("contactNumber")
        @JsonAlias({"phoneNumber"})
        private String contactNumber;

        private String address;
        private String gender;

        @JsonProperty("dateOfBirth")
        @JsonAlias({"dob"})
        private String dateOfBirth;

        private String bloodGroup;
        private String allergies;
        private String emergencyContactName;
        private String emergencyContactPhone;
        private String emergencyContactRelationship;
        private String triagePriority;
        private String medicalNotes;
        private Boolean isArchived;
        private String registrationDate;

        // Zero duplicate fields in Java: JSON getters for contract compatibility
        @JsonProperty("patientId")
        public Long getPatientId() { return id; }

        @JsonProperty("personId")
        public Long getPersonId() { return id; }

        @JsonProperty("nicPassport")
        public String getNicPassport() { return nicPassportNo; }

        @JsonProperty("phoneNumber")
        public String getPhoneNumber() { return contactNumber; }

        @JsonProperty("dob")
        public String getDob() { return dateOfBirth; }

        @JsonProperty("status")
        public String getStatus() { return Boolean.TRUE.equals(isArchived) ? "ARCHIVED" : "ACTIVE"; }
    }
}
```

#### File 2: `DoctorDTOs.java` (`backend/src/main/java/com/pulseos/dto/DoctorDTOs.java`)
```java
package com.pulseos.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.math.BigDecimal;

public class DoctorDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DoctorRequest {
        private String firstName;
        private String lastName;
        private String email;

        @JsonProperty("phoneNumber")
        @JsonAlias({"contactNumber", "phone"})
        private String phoneNumber;

        @JsonProperty("doctorLicenseNo")
        @JsonAlias({"licenseNo", "licenseNumber"})
        private String doctorLicenseNo;

        private String specialization;
        private BigDecimal consultationFee;
        private String roomNumber;
        private Boolean isAvailable;
        private Long departmentId;
        private String departmentName;

        public String getResolvedLicense() { return doctorLicenseNo; }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class DoctorResponse {
        @JsonProperty("id")
        @JsonAlias({"employeeId"})
        private Long id;

        private String firstName;
        private String lastName;
        private String fullName;
        private String email;

        @JsonProperty("contactNumber")
        @JsonAlias({"phoneNumber"})
        private String contactNumber;

        @JsonProperty("doctorLicenseNo")
        @JsonAlias({"licenseNo", "licenseNumber"})
        private String doctorLicenseNo;

        private String specialization;
        private BigDecimal consultationFee;
        private String roomNumber;
        private Boolean isAvailable;
        private Long departmentId;
        private String departmentName;

        // Zero duplicate fields in Java: JSON getters for contract compatibility
        @JsonProperty("employeeId")
        public Long getEmployeeId() { return id; }

        @JsonProperty("phoneNumber")
        public String getPhoneNumber() { return contactNumber; }

        @JsonProperty("licenseNo")
        public String getLicenseNo() { return doctorLicenseNo; }

        @JsonProperty("licenseNumber")
        public String getLicenseNumber() { return doctorLicenseNo; }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DoctorFeeUpdateRequest {
        private BigDecimal consultationFee;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DoctorAvailabilityUpdateRequest {
        private Boolean isAvailable;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DoctorScheduleRequest {
        private String dayOfWeek;
        private String startTime;
        private String endTime;
        private Integer maxPatients;
        private Integer slotDurationMinutes;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DoctorScheduleResponse {
        private Long id;
        private Long doctorId;
        private String dayOfWeek;
        private String startTime;
        private String endTime;
        private Integer maxPatients;
        private Integer slotDurationMinutes;
        private Boolean isActive;
    }
}
```

#### File 3: `AppointmentDTOs.java` (`backend/src/main/java/com/pulseos/dto/AppointmentDTOs.java`)
```java
package com.pulseos.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

public class AppointmentDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AppointmentRequest {
        private Long patientId;
        private Long doctorId;
        private String appointmentDate;

        @JsonProperty("appointmentTime")
        @JsonAlias({"startTime"})
        private String appointmentTime;

        private String endTime;

        @JsonProperty("reasonForVisit")
        @JsonAlias({"symptomsReason"})
        private String reasonForVisit;

        private String roomNumber;

        public String getResolvedStartTime() { return appointmentTime; }
        public String getResolvedReason() { return reasonForVisit; }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class AppointmentResponse {
        @JsonProperty("id")
        @JsonAlias({"appointmentId"})
        private Long id;

        private String appointmentNumber;
        private Long patientId;
        private String patientName;
        private String patientNic;
        private Long doctorId;
        private String doctorName;
        private String specialization;
        private String appointmentDate;

        @JsonProperty("appointmentTime")
        @JsonAlias({"startTime"})
        private String appointmentTime;

        private String endTime;
        private String status;

        @JsonProperty("reasonForVisit")
        @JsonAlias({"symptomsReason"})
        private String reasonForVisit;

        private String roomNumber;
        private String createdAt;

        // Zero duplicate fields in Java: JSON getters for contract compatibility
        @JsonProperty("appointmentId")
        public Long getAppointmentId() { return id; }

        @JsonProperty("startTime")
        public String getStartTime() { return appointmentTime; }

        @JsonProperty("symptomsReason")
        public String getSymptomsReason() { return reasonForVisit; }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RescheduleRequest {
        private String appointmentDate;

        @JsonProperty("appointmentTime")
        @JsonAlias({"startTime"})
        private String appointmentTime;

        private String endTime;

        public String getResolvedStartTime() { return appointmentTime; }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusUpdateRequest {
        private String status;
    }
}
```

#### File 4: `BillingDTOs.java` (`backend/src/main/java/com/pulseos/dto/BillingDTOs.java`)
```java
package com.pulseos.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

public class BillingDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InvoiceGenerateRequest {
        private Long patientId;
        private Long appointmentId;
        private BigDecimal discountAmount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class InvoiceItemResponse {
        private String type;
        private String category;
        private String description;
        private Integer quantity;
        private BigDecimal unitPrice;

        @JsonProperty("totalPrice")
        @JsonAlias({"subtotal"})
        private BigDecimal totalPrice;

        @JsonProperty("subtotal")
        public BigDecimal getSubtotal() { return totalPrice; }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class InvoiceResponse {
        @JsonProperty("id")
        @JsonAlias({"invoiceId"})
        private Long id;

        private String invoiceNumber;
        private Long patientId;
        private String patientName;
        private String patientNic;
        private Long appointmentId;
        private BigDecimal doctorFee;
        private BigDecimal pharmacyFee;
        private BigDecimal labFee;
        private BigDecimal taxAmount;
        private BigDecimal totalAmount;
        private BigDecimal discountAmount;
        private BigDecimal netAmount;

        @JsonProperty("paymentStatus")
        @JsonAlias({"status"})
        private String paymentStatus;

        private String billingDate;
        private String paymentMethod;
        private String transactionRef;
        private List<InvoiceItemResponse> items;

        // Zero duplicate fields in Java: JSON getters for contract compatibility
        @JsonProperty("invoiceId")
        public Long getInvoiceId() { return id; }

        @JsonProperty("status")
        public String getStatus() { return paymentStatus; }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class PayHereInitiateResponse {
        @JsonProperty("merchantId")
        @JsonAlias({"merchant_id"})
        private String merchantId;

        @JsonProperty("orderId")
        @JsonAlias({"order_id"})
        private String orderId;

        private String amount;
        private String currency;
        private String hash;

        @JsonProperty("notifyUrl")
        @JsonAlias({"notify_url"})
        private String notifyUrl;

        @JsonProperty("return_url")
        private String returnUrl;

        @JsonProperty("cancel_url")
        private String cancelUrl;

        private String items;

        @JsonProperty("patientFirstName")
        @JsonAlias({"first_name"})
        private String firstName;

        @JsonProperty("patientLastName")
        @JsonAlias({"last_name"})
        private String lastName;

        @JsonProperty("email")
        @JsonAlias({"patientEmail"})
        private String email;

        @JsonProperty("phone")
        @JsonAlias({"patientPhone"})
        private String phone;

        private String address;
        private String city;
        private String country;

        // PayHere snake_case getters for form generation
        @JsonProperty("merchant_id") public String getMerchant_id() { return merchantId; }
        @JsonProperty("order_id") public String getOrder_id() { return orderId; }
        @JsonProperty("notify_url") public String getNotify_url() { return notifyUrl; }
        @JsonProperty("first_name") public String getFirst_name() { return firstName; }
        @JsonProperty("last_name") public String getLast_name() { return lastName; }
        @JsonProperty("patientEmail") public String getPatientEmail() { return email; }
        @JsonProperty("patientPhone") public String getPatientPhone() { return phone; }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SettlementRequest {
        private Long invoiceId;
        private String paymentMethod;
        private BigDecimal amountPaid;
        private String transactionRef;
        private String cashierNotes;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class PaymentResponse {
        private Long id;
        private String transactionReference;
        private Long invoiceId;
        private String paymentMethod;
        private BigDecimal amountPaid;
        private String currency;
        private String status;
        private String receiptNumber;
        private String paymentDate;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SettlementResponse {
        private String message;
        private InvoiceResponse invoice;
        private PaymentResponse payment;
    }
}
```

#### File 5: `LabDTOs.java` (`backend/src/main/java/com/pulseos/dto/LabDTOs.java`)
```java
package com.pulseos.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.math.BigDecimal;

public class LabDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class LabCatalogResponse {
        private Long id;
        private String testCode;
        private String testName;
        private String category;

        @JsonProperty("price")
        @JsonAlias({"standardFee"})
        private BigDecimal price;

        private String sampleType;
        private Double normalRangeMin;
        private Double normalRangeMax;
        private String measurementUnit;

        @JsonProperty("standardFee")
        public BigDecimal getStandardFee() { return price; }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LabOrderRequest {
        private Long appointmentId;
        private Long patientId;
        private Long doctorId;

        @JsonProperty("testCatalogId")
        @JsonAlias({"labTestId"})
        private Long testCatalogId;

        private String urgency;
        private String clinicalIndication;

        public Long getResolvedTestCatalogId() { return testCatalogId; }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LabResultRequest {
        private Double resultValue;
        private String resultData;
        private Long technicianEmployeeId;

        @JsonProperty("clinicalRemarks")
        @JsonAlias({"technicianNotes", "remarks"})
        private String clinicalRemarks;

        private Boolean isAbnormal;

        public String getResolvedRemarks() { return clinicalRemarks; }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class LabRequestResponse {
        @JsonProperty("id")
        @JsonAlias({"testId"})
        private Long id;

        private String requestNumber;
        private Long appointmentId;
        private Long patientId;
        private String patientName;
        private Long doctorId;
        private String doctorName;
        private Long labTestId;
        private String testName;
        private String category;
        private String urgency;
        private String status;
        private String clinicalIndication;
        private Double resultValue;
        private String resultData;
        private String flag;
        private String referenceRange;
        private String testCode;

        @JsonProperty("sampleType")
        @JsonAlias({"specimenType"})
        private String sampleType;

        private String unit;
        private String remarks;
        private String technicianName;
        private String conductionDate;
        private Boolean isAbnormal;
        private BigDecimal standardFee;
        private String testDate;

        // Zero duplicate fields in Java: JSON getters for contract compatibility
        @JsonProperty("testId")
        public Long getTestId() { return id; }

        @JsonProperty("specimenType")
        public String getSpecimenType() { return sampleType; }
    }
}
```

#### File 6: `PharmacyDTOs.java` (`backend/src/main/java/com/pulseos/dto/PharmacyDTOs.java`)
```java
package com.pulseos.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

public class PharmacyDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DrugRequest {
        private String itemCode;
        private String drugName;
        private String genericName;
        private String brandName;
        private String category;
        private String dosageForm;
        private String strength;
        private BigDecimal unitPrice;
        private Integer stockQuantity;
        private Integer reorderLevel;
        private String expiryDate;
        private String batchNumber;
        private String manufacturer;

        public String getResolvedItemCode() {
            return itemCode != null && !itemCode.isBlank() ? itemCode : "MED-" + System.currentTimeMillis();
        }

        public String getResolvedName() {
            if (genericName != null && !genericName.isBlank()) return genericName;
            return drugName != null ? drugName : "Generic Medicine";
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class DrugResponse {
        @JsonProperty("id")
        @JsonAlias({"drugId"})
        private Long id;

        private String itemCode;
        private String genericName;
        private String drugName;
        private String brandName;
        private String category;
        private String dosageForm;
        private String strength;
        private BigDecimal unitPrice;
        private Integer stockQuantity;
        private Integer reorderLevel;
        private String expiryDate;
        private String batchNumber;
        private String manufacturer;
        private Boolean isLowStock;
        private Boolean isExpired;

        @JsonProperty("drugId")
        public Long getDrugId() { return id; }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PrescriptionItemRequest {
        private Long drugId;
        private String dosage;

        @JsonProperty("frequency")
        @JsonAlias({"dosageFrequency"})
        private String frequency;

        private Integer durationDays;

        @JsonProperty("prescribedQuantity")
        @JsonAlias({"prescribedQty", "quantity"})
        private Integer prescribedQuantity;

        private String instructions;

        public Integer getResolvedPrescribedQuantity() {
            return prescribedQuantity != null ? prescribedQuantity : 1;
        }

        public String getResolvedFrequency() {
            return frequency != null && !frequency.isBlank() ? frequency : "OD";
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class PrescriptionItemResponse {
        @JsonProperty("drugId")
        @JsonAlias({"id"})
        private Long drugId;

        private String drugName;
        private String dosage;
        private String frequency;
        private Integer durationDays;

        @JsonProperty("prescribedQuantity")
        @JsonAlias({"prescribedQty"})
        private Integer prescribedQuantity;

        @JsonProperty("dispensedQuantity")
        @JsonAlias({"dispensedQty"})
        private Integer dispensedQuantity;

        private Boolean isDispensed;
        private BigDecimal unitPrice;
        private String instructions;

        // Zero duplicate fields in Java: JSON getters for contract compatibility
        @JsonProperty("id")
        public Long getId() { return drugId; }

        @JsonProperty("prescribedQty")
        public Integer getPrescribedQty() { return prescribedQuantity; }

        @JsonProperty("dispensedQty")
        public Integer getDispensedQty() { return dispensedQuantity; }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PrescriptionRequest {
        private Long appointmentId;
        private Long patientId;
        private Long doctorId;

        @JsonProperty("doctorInstructions")
        @JsonAlias({"notes", "instructions"})
        private String doctorInstructions;

        private List<PrescriptionItemRequest> items;

        public String getResolvedNotes() { return doctorInstructions; }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class PrescriptionResponse {
        @JsonProperty("id")
        @JsonAlias({"prescriptionId"})
        private Long id;

        private String prescriptionNumber;
        private Long appointmentId;
        private Long patientId;
        private String patientName;
        private Long doctorId;
        private String doctorName;

        @JsonProperty("prescriptionDate")
        @JsonAlias({"issuedDate"})
        private String prescriptionDate;

        private String status;

        @JsonProperty("doctorInstructions")
        @JsonAlias({"notes"})
        private String doctorInstructions;

        private List<PrescriptionItemResponse> items;

        // Zero duplicate fields in Java: JSON getters for contract compatibility
        @JsonProperty("prescriptionId")
        public Long getPrescriptionId() { return id; }

        @JsonProperty("issuedDate")
        public String getIssuedDate() { return prescriptionDate; }

        @JsonProperty("notes")
        public String getNotes() { return doctorInstructions; }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DispenseResponse {
        private String message;
        private PrescriptionResponse prescription;
    }
}
```

---

### 4.3 Service Mapper Adjustments

When the redundant fields are eliminated from the DTOs, the service mappers can be cleaned to remove redundant setter calls on the builders:

1. **`PatientService.java:218-244` (`toResponse`)**:
   - Remove redundant calls: `.personId(p.getId())`, `.patientId(p.getId())`, `.nicPassport(...)`, `.phoneNumber(...)`, `.dob(...)`, `.status(...)`.
   - Keep only: `.id(p.getId())`, `.nicPassportNo(p.getNicPassportNo())`, `.contactNumber(phone)`, `.dateOfBirth(dob)`, `.isArchived(archived)`.
2. **`DoctorService.java:171-189` (`toResponse`)**:
   - Remove redundant calls: `.employeeId(d.getId())`, `.phoneNumber(...)`, `.licenseNumber(...)`, `.licenseNo(...)`.
   - Keep only: `.id(d.getId())`, `.contactNumber(phone)`, `.doctorLicenseNo(d.getDoctorLicenseNo())`.
3. **`AppointmentService.java:137-156` (`toResponse`)**:
   - Remove redundant calls: `.appointmentId(a.getAppointmentId())`, `.startTime(...)`, `.symptomsReason(...)`.
   - Keep only: `.id(a.getAppointmentId())`, `.appointmentTime(...)`, `.reasonForVisit(...)`.
4. **`BillingService.java:168-190` (`initiatePayHereCheckout`) & `226-271` (`toResponse`)**:
   - In `initiatePayHereCheckout`: remove duplicate snake_case builder calls (`.merchant_id(...)`, `.order_id(...)`, etc.).
   - In `toResponse`: remove `.invoiceId(...)`, `.status(...)`, and `.subtotal(...)`.
5. **`LaboratoryService.java:42-53` & `190-219` (`toResponse`)**:
   - In `getCatalog`: remove `.standardFee(c.getPrice())`.
   - In `toResponse`: remove `.testId(...)`, `.specimenType(...)`.
6. **`PharmacyService.java:190-246`**:
   - In `toDrugResponse`: remove `.drugId(...)`.
   - In `toPrescriptionResponse`: in items remove `.id(...)`, `.prescribedQty(...)`, `.dispensedQty(...)`; in response remove `.prescriptionId(...)`, `.issuedDate(...)`, `.notes(...)`.

---

## 5. Verification Method

To independently verify the findings and fixes:

1. **Verify Unit Test Assertion Fixes**:
   Execute the backend unit test suite:
   ```bash
   cd /Users/admin/Projects/honda_leda/backend
   ./mvnw test -Dtest=PulseOsApplicationTests
   ```
   **Expected Result:** Tests run: 4, Failures: 0, Errors: 0, Skipped: 0. Entire test class PASSES.

2. **Verify Full Test Suite Pass**:
   Execute all backend tests:
   ```bash
   cd /Users/admin/Projects/honda_leda/backend
   ./mvnw test
   ```
   **Expected Result:** Tests run: 13, Failures: 0, Errors: 0, Skipped: 0. Build SUCCESS.

3. **Verify DTO Cleanliness**:
   Inspect the modified DTO files:
   - Ensure ZERO overlapping fields exist (e.g. grep for `dob` in `PatientDTOs.java` — it should appear only as an annotation `@JsonAlias({"dob"})` and JSON getter `@JsonProperty("dob")`, never as a declared private field).
   - Ensure all request DTOs successfully deserialize both canonical and legacy JSON payloads via Jackson.
