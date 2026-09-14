# PulseOS — Module 6: Pathology Laboratory Investigations & Sample Lifecycle Tracker
**Assigned Student**: Thilakarathne H.S.K.P.N (IT25103363)
**Dedicated Git Branch**: `feature/laboratory-tests`
**Main Project Repository**: `https://github.com/kesaruhasun/honda_leda`

---

## 1. Module Overview
This module represents the complete **Clinical Pathology Laboratory & Diagnostic Lifecycle Management System** for PulseOS (SLIIT SE2030 Group 60).

### Key Clinical Capabilities:
1. **Clinical Workstation for Laboratory Assistants / Technologists**:
   - Dedicated station for Senior Pathology Technologists (N. Thilakarathne, MLT - SLMC 7741).
   - Real-time assay roster monitoring Sysmex XN-1000 & Roche Cobas c311 diagnostic analyzers.
2. **Diagnostic Test Catalog & Investigation Ordering**:
   - 9 accredited diagnostic assays: FBC with ESR, FBS, Lipid Profile, KFT, LFT, HbA1c, TSH, UFR, and Dengue Rapid.
   - Ordering interface supporting patient selection, physician assignment, sample container assignment, and clinical urgency (ROUTINE vs STAT / URGENT).
3. **Four-Stage Sample Lifecycle Tracking**:
   - `REQUESTED` -> Awaiting Phlebotomy / Specimen intake.
   - `COLLECTED` (`SAMPLE_COLLECTED`) -> Specimen scanned, tube barcoded (EDTA, SST, Fluoride) and placed in lab rack.
   - `PROCESSING` -> Specimen loaded into automated analyzer.
   - `COMPLETED` -> Verified quantitative results entered, reference range comparison, abnormal detection, and report release.
4. **Automated Patient Notification Simulation**:
   - Immediate dispatch of SMS and Patient Portal notifications when a report is certified.
5. **Official Printable Diagnostic Pathology Report**:
   - Accredited PulseOS Laboratory report format with Hospital Letterhead, ISO 15189 credentials, patient demographics, results table with reference intervals, technologist observations, and dual digital pathologist signatures.

### Included Backend Files (Spring Boot 3.2+ Java 17):
- `LabTest.java` (Entity with lifecycle status, specimen type, test code, abnormal flag, technician link)
- `LabTestCatalog.java` (Entity for diagnostic investigation catalog)
- `LabTestStatus.java` (Enum: REQUESTED, SAMPLE_COLLECTED, PROCESSING, COMPLETED, CANCELLED)
- `LabTestRepository.java` & `LabTestCatalogRepository.java` (Spring Data JPA Repositories)
- `LaboratoryService.java` (Service implementing full CRUD, catalog retrieval, status lifecycle, and result certification)
- `LaboratoryController.java` (REST Controller exposing /api/v1/laboratory endpoints)
- `LabDTOs.java` (DTOs for Catalog, Order, Result submission, and Responses)

### Included Frontend Files (React 19 + TypeScript + Tailwind CSS):
- `LaboratoryView.tsx` (Laboratory assistant workstation, worklists, order modal, certification modal)
- `DiagnosticReportModal.tsx` (Accredited printable diagnostic pathology report)

---

## 2. Git Commit Instructions
```bash
git checkout feature/laboratory-tests
git config user.name "Thilakarathne H.S.K.P.N"
git config user.email "it25103363@my.sliit.lk"
git add .
git commit -m "feat(lab): implement clinical pathology assistant panel, sample lifecycle tracking, and accredited diagnostic reports"
git push origin feature/laboratory-tests
```

---

## 3. Evaluation Viva Demonstration Steps
1. **CREATE**: Click `+ Order New Investigation` -> Select `Kasun Perera` -> Select `Lipid Profile Panel` -> Urgency: `STAT / URGENT` -> Submit. Show that status is `REQUESTED`.
2. **READ & LIFECYCLE PROGRESSION**:
   - Click `Collect Specimen` -> Status transitions to `COLLECTED`.
   - Click `Load into Analyzer` -> Status transitions to `PROCESSING`.
3. **UPDATE / CERTIFY RESULTS**:
   - Click `Certify Results` -> Enter reading (e.g. `195 mg/dL`) -> Check `Flag as abnormal` if out of range -> Submit.
   - Show notification toast dispatched to patient.
4. **OFFICIAL REPORT**:
   - Click `Official Report` -> View accredited PulseOS laboratory report with patient demographics, reference range, and pathologist signatures.
   - Click `Print Official PDF` to show print layout.
5. **DELETE / CANCEL**:
   - Click trash icon to cancel/archive contaminated specimen.
6. **SQL VERIFICATION**:
   ```sql
   SELECT ID, REQUEST_NUMBER, TEST_NAME, STATUS, RESULT_DATA, FLAG FROM LAB_TEST ORDER BY ID DESC;
   ```
