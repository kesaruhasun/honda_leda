# PulseOS — Viva Technical Defense & Module Source Code Dossier
## SLIIT SE2030 Software Engineering Project — Batch 02 | Group 60
### Academic Year 2026 | Year 2 Semester 1

---

### Student Information:
- **Full Name**: `Thilakarathne H. S. K. P. N.`
- **Preferred Name**: `Nethuli`
- **Student ID (IT Number)**: `IT25103363`
- **Official SLIIT Email**: `it25103363@my.sliit.lk`
- **Assigned Major Function**: **M6: Pathology Laboratory Investigations & Diagnostic Result Lifecycle**
- **Dedicated Git Branch**: `feature/laboratory-investigations`
- **Production URL**: `https://pulseos.tekkeys.com`
- **Database Web Interface (Adminer)**: `https://pulseos.tekkeys.com/adminer`

---

## 1. Key Design Patterns in Your Module

During the viva, examiners will ask: *"What design patterns did you use in your code?"*
You have **4 concrete, real design patterns** implemented in your Java files:

### 1. Data Transfer Object (DTO) Pattern (`LabDTOs.java`)
* **Where to show it**: Open `backend/LabDTOs.java` (show `LabOrderRequest`, `LabRequestResponse`, `LabResultRequest`).
* **Why we use it**: 
  - We never expose the raw database entity (`LabTest.java`) directly to frontend REST requests.
  - DTOs act as a security barrier, validate input data, prevent circular JSON reference loops, and ensure only necessary fields are sent over the network.

### 2. Repository Pattern (`LabTestRepository.java`)
* **Where to show it**: Open `backend/LabTestRepository.java` (`public interface LabTestRepository extends JpaRepository<LabTest, Long>`).
* **Why we use it**: 
  - Provides a clean separation of concerns between business logic and database access.
  - Spring Data JPA handles all MySQL queries automatically without writing raw JDBC boilerplate.

### 3. Builder Pattern (`LabDTOs.java` & `LaboratoryService.java`)
* **Where to show it**: Look at `@Builder` on `LabRequestResponse` in `LabDTOs.java`, and in `LaboratoryService.java` (`toResponse()` method: `LabRequestResponse.builder().id(...).testName(...).build()`).
* **Why we use it**: 
  - Allows constructing complex response objects step-by-step cleanly and immutably without having massive 15-parameter constructors.

### 4. State-Driven Lifecycle / Finite State Machine (`LabTestStatus.java` + `LaboratoryService.java`)
* **Where to show it**: `LabTestStatus.java` (Enum) and `LaboratoryService.java` (`updateTestStatus()`, `submitResults()`).
* **Why we use it**: 
  - A medical lab test follows a regulated clinical lifecycle: `REQUESTED` -> `SAMPLE_COLLECTED` -> `PROCESSING` -> `COMPLETED` (or `CANCELLED`).
  - In modern enterprise Spring Boot, this deterministic lifecycle is implemented via an Enum + Service state-transition methods rather than cluttered polymorphic classes, ensuring it maps cleanly to the MySQL database column.

> **Viva Tip**: If the lecturer asks: *"Where is your design pattern?"*, open **`LabDTOs.java`** and say:  
> *"In my module, I implemented the **DTO (Data Transfer Object) Pattern** in `LabDTOs.java` to decouple our API from the database models, the **Repository Pattern** in `LabTestRepository.java` for data access, the **Builder Pattern** for constructing responses, and a **State-driven Lifecycle** in `LaboratoryService` using `LabTestStatus` to manage the test order progression."*


---

## 2. Complete CRUD Implementation Map

Every team member is evaluated on having complete **CRUD (Create, Read, Update, Delete)** functionality in both the **Backend (Java Spring Boot)** and **Frontend (React TypeScript)**, connected to a live database.

| Operation | Action Description | Backend Location (Controller & Service) | Frontend UI Component | Database SQL Executed |
| :--- | :--- | :--- | :--- | :--- |
| **CREATE** | Order diagnostic pathology test with specimen type, urgency priority, and dynamic ETA calculation | `LaboratoryController.java -> @PostMapping("") orderLabTest() | LaboratoryService.java -> orderLabTest()` | `LaboratoryView.tsx -> handleOrderTest() & 'Order Investigation' Modal` | `INSERT INTO lab_test (requisition_number, test_name, sample_type, status, test_date, price) VALUES (...)` |
| **READ** | Monitor lab queue, filter by status (Requested, Sample Collected, Completed), and review clinical findings | `LaboratoryController.java -> @GetMapping("") getAllTests() & @GetMapping("/patient/{patientId}")` | `LaboratoryView.tsx -> Investigation Registry DataTable with status filter pills` | `SELECT * FROM lab_test ORDER BY id DESC` |
| **UPDATE** | Advance test state (Collect Sample), input quantitative results, evaluate reference ranges, and sign report | `LaboratoryController.java -> @PutMapping("/{id}/sample") & @PutMapping("/{id}/result") updateLabTestResult()` | `LaboratoryView.tsx -> 'Collect Specimen' button & 'Enter Result' Modal` | `UPDATE lab_test SET status = 'COMPLETED', result_value = ?, is_abnormal = ?, comments = ? WHERE id = ?` |
| **DELETE** | Revoke / cancel test order prior to specimen processing with audit notation | `LaboratoryController.java -> @DeleteMapping("/{id}") cancelLabTest() | LaboratoryService.java -> cancelLabTest()` | `LaboratoryView.tsx -> 'Cancel Test' button in action column with confirmation modal` | `UPDATE lab_test SET status = 'CANCELLED' WHERE id = ?` |

---

## 3. Step-by-Step Live Viva Demonstration Script

Follow this exact sequence on your screen when demonstrating to the lecturer:
1. Open **Pathology Laboratory Station** (`https://pulseos.tekkeys.com/laboratory`).
2. Demonstrate CREATE: Click **'Order Investigation'**, select patient (e.g. Kamal Perera), choose investigation (e.g. `Full Blood Count (FBC)` or `Fasting Blood Sugar`), set Urgency to `Stat Urgent` -> Click **Submit** -> Show `LAB-XXXXXX` created in `REQUESTED` state.
3. Demonstrate UPDATE (State 1 -> 2): Click **'Collect Specimen'** -> Show state advancing to `SAMPLE_COLLECTED` with sample collection timestamp recorded.
4. Demonstrate UPDATE (State 2 -> 3): Click **'Enter Result'** -> Enter measured value (e.g. `Fasting Blood Sugar: 165 mg/dL`) -> Flag as Abnormal -> Add clinical interpretation -> Click **Save Report** -> Show status changing to `COMPLETED` with an abnormal rose badge!
5. Demonstrate DELETE / CANCEL: Cancel a pending test order to demonstrate deletion/revocation.
6. Open Adminer and show the `lab_test` table in MySQL.

---

## 4. Live Database Verification Query

Keep **Adminer** (`https://pulseos.tekkeys.com/adminer`) or your local MySQL client open. Run this SQL query to show the lecturer that your data is actively persisting:

```sql
-- Database: pulseos_db
SELECT id, requisition_number, test_name, sample_type, status, result_value, is_abnormal FROM lab_test ORDER BY id DESC LIMIT 5;
```

---

## 5. High-Probability Viva Questions & Model Answers

### Q1: Explain the medical lifecycle stages of a diagnostic test in your module.
> **Answer**: A test progresses through three distinct states: (1) `REQUESTED`: Physician or patient initiates the diagnostic request; (2) `SAMPLE_COLLECTED`: Phlebotomy draws the biological specimen (e.g. Venous Whole Blood, Serum, Urine) and stamps the collection time; (3) `COMPLETED`: Medical laboratory technologist performs the biochemical assay, inputs quantitative numerical results, compares them against established biological reference intervals, flags abnormalities, and signs the report.

### Q2: How does the system automatically detect abnormal pathology results?
> **Answer**: Each test in our catalog defines biological reference ranges (e.g. Fasting Blood Sugar: 70–100 mg/dL, Platelet count: 150,000–450,000 /µL). When the technologist inputs results, values exceeding or falling below reference limits set `isAbnormal = true`, which renders a high-visibility coral-red alert pill across clinical workstations.

### Q3: How does the lab module integrate with Billing?
> **Answer**: Each test in the catalog has an authorized tariff fee (e.g. Lipid Profile: LKR 2,200.00). When Kesaru's billing module generates the patient's comprehensive outpatient bill, it queries `labTestRepository` for all investigations conducted during that encounter, appending the lab charges into the final invoice.


---

## 6. Included Source Code Files in This Folder

### Backend Java Files (`backend/`):
- `LabTest.java`
- `LabTestCatalog.java`
- `LabTechnician.java`
- `LabTestStatus.java`
- `LabTestRepository.java`
- `LabTestCatalogRepository.java`
- `LaboratoryService.java`
- `LaboratoryController.java`
- `LabDTOs.java`

### Frontend React Files (`frontend/`):
- `LaboratoryView.tsx`

---
*Generated for SLIIT SE2030 Group 60 Evaluation | PulseOS Hospital Management System*
