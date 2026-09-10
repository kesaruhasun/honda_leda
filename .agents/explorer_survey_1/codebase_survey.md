# PulseOS Codebase & Infrastructure Survey

**Date**: 2026-09-14  
**Explorer Agent**: `explorer_survey_1`  
**Workspace Root**: `/Users/admin/Projects/honda_leda`  
**Project**: PulseOS Hospital Management System (SLIIT SE2030, Batch 02, Group 60 / KU-60)

---

## Executive Summary

The PulseOS workspace is currently in an uninitialized greenfield state regarding runnable application code (no `backend/` or `frontend/` directories exist), but contains extensive, high-quality domain architecture documentation and specifications. The runtime environment provides Java 17 (`openjdk 17.0.19`) and modern Node.js/npm (`node v26.0.0`, `npm 11.12.1`, `vite 8.3.0`). Neither a global `mvn` binary nor an active MySQL daemon is currently installed in the host system. Consequently, the project requires immediate scaffolding of a Spring Boot 3.2+ Maven project equipped with the self-contained Maven Wrapper (`./mvnw`), dual-persistence support (embedded H2 with live `/h2-console` as default zero-config demo mode + production MySQL DDL schema.sql), and a Vite + React 19 + Tailwind CSS frontend dashboard.

---

## 1. Existing Repository Structure & Artifacts

### 1.1 Root Files and Directories
The workspace root `/Users/admin/Projects/honda_leda` contains:
```
/Users/admin/Projects/honda_leda/
├── .git/                                 # Initialized Git repository
├── .gitignore                            # Standard ignores (node_modules, venv, .DS_Store, *.db)
├── .agents/                              # Multi-agent collaboration directory
│   ├── ORIGINAL_REQUEST.md               # Master system requirements & acceptance criteria
│   ├── skills/                           # Project-specific agent skills
│   └── explorer_survey_1/                # Explorer workspace (DISPATCH.md, BRIEFING.md, progress.md)
├── docs/                                 # Comprehensive project and domain documentation
│   ├── CONTEXT.md                        # Ubiquitous language, entities, module boundaries
│   ├── PulseOS_EER_Diagram.drawio        # Official 1143-line EER diagram XML schema
│   ├── PulseOS_EER_Diagram.pdf           # Rendered EER diagram
│   ├── SE2030_Group Project Specification (1).pdf # SLIIT SE2030 specification
│   ├── System Overview Diagram.pdf       # 3-layer architecture diagram
│   ├── adr/
│   │   └── 0001-architecture-decisions.md# Architecture Decision Record (Dual DB, Design System, PayHere)
│   ├── members.txt                       # 6 group member IDs, names, and nicknames
│   ├── proposal_extracted.txt            # Extracted project proposal text with 6 major functions
│   ├── specification_extracted.txt       # Extracted SE2030 assignment brief and rubric
│   └── wayfinder_map.md                  # Project roadmap and active frontiers
├── Lab_2/                                # Lab 2 deliverables and Scrum documentation
│   ├── Batch02_2026-Y2-S1-KU-60_Scrum.docx
│   ├── Lab_02_Supporting Document.pdf
│   └── SE2030_Lab 02.pdf
├── 2026-Y2-S1-KU-60.pdf                  # Complete Proposal document (PDF)
├── 2026-Y2-S1-KU-60.docx                 # Complete Proposal document (DOCX)
├── 2026-Y2-S1-KU-60-Corrected.docx       # Proposal document with revisions
└── skills-lock.json                      # Agent skill configuration lock
```

### 1.2 Status of Application Code
- **Backend Directory (`backend/`)**: **Does NOT exist**. Must be scaffolded.
- **Frontend Directory (`frontend/`)**: **Does NOT exist**. Must be scaffolded.
- **Root Startup Script (`start.sh`)**: **Does NOT exist**. Must be created to orchestrate concurrent startup.
- **Git Attribution Script**: **Does NOT exist**. Must be created to simulate multi-member branch and commit history.

---

## 2. Git State & Team Configuration

### 2.1 Git Repository Status
- **Current Branch**: `main`
- **Remote Origin**: `https://github.com/kesaruhasun/honda_leda.git` (tracked, up to date)
- **Total Commit Count**: `1`
- **Commit History**:
  - `17a2e66 Auto-backup commit`
- **Current Git User Configuration**:
  - `user.name`: `Kesaru`
  - `user.email`: `kesaruhasun@gmail.com`
- **Working Tree**: Clean on tracked files; contains untracked files in `docs/`, `.agents/`, and `skills-lock.json`.

### 2.2 Team Member Attribution Mapping
From `docs/members.txt` and `ORIGINAL_REQUEST.md`, authentic commit attribution must be mapped to all 6 students:

| Student ID | Full Name | Nickname | Assigned Module | Target Feature Branch |
| :--- | :--- | :--- | :--- | :--- |
| **IT25103819** | Somarathna P. G. D. S. | Dila | M1: Patient Management | `feature/patient-management` |
| **IT25103999** | Rathnayaka R. M. K. L. B. | Kavinda | M2: Doctor Management | `feature/doctor-management` |
| **IT25101620** | Malwatta M.W.C.S | Chanul | M3: Appointment Management | `feature/appointment-management` |
| **IT25100826** | Udumullage S.H.U. | Harshika | M4: Pharmacy & Inventory | `feature/inventory-pharmacy` |
| **IT25103992** | Dhanasinghe K. A. K. H. | Kesaru | M5: Billing & Payments / Core | `feature/billing-payment` |
| **IT25103363** | Thilakarathne H.S.K.P.N | Nethuli | M6: Laboratory & Tests | `feature/laboratory-tests` |

*Student email convention*: `it<student_id>@my.sliit.lk` (e.g. `it25103819@my.sliit.lk`).

---

## 3. Environment & Runtime Availability

| Component | Detected Version / Status | Host Location | Assessment & Action Required |
| :--- | :--- | :--- | :--- |
| **Java JDK** | `openjdk version 17.0.19` (2026-04-21) | `/opt/homebrew/opt/openjdk@17/bin/java` | **Ready**. Meets Spring Boot 3.2+ requirement (Java 17). |
| **Java Compiler**| `javac 17.0.19` | `/opt/homebrew/opt/openjdk@17/bin/javac` | **Ready**. Compiles Java 17 bytecode. |
| **Maven (`mvn`)**| Not in system PATH | N/A | **Action**: Use self-contained Maven Wrapper (`./mvnw`). Available in Homebrew (`brew info maven: 3.9.16`) if global CLI is ever needed, but `./mvnw` ensures 100% portable builds. |
| **Node.js** | `v26.0.0` | `/opt/homebrew/bin/node` | **Ready**. Modern runtime suitable for React 19 and Vite. |
| **npm** | `11.12.1` | `/opt/homebrew/bin/npm` | **Ready**. Package manager operational. |
| **Vite** | `vite/8.3.0` | via `npx` | **Ready**. Fast modern bundler ready for React 19. |
| **MySQL Server** | Not installed / Not running | N/A | **Action Required**: Primary demo mode must use embedded H2 (`/h2-console`) with MySQL compatibility mode. Provide full MySQL `schema.sql` and `application-mysql.properties` profile for optional local MySQL deployment. |
| **Docker** | Docker binary at `/opt/homebrew/bin/docker`, daemon inactive | `/opt/homebrew/bin/docker` | Inactive (Colima socket offline). Do not rely on Docker for live evaluation. |

---

## 4. Domain & Architecture Blueprint

### 4.1 Relational Schema & Entities (from `docs/PulseOS_EER_Diagram.drawio`)
The official schema requires the following entity hierarchy:
1. **Person (Superclass)**: `NIC_PassportNo` (PK), `firstName`, `lastName`, `street`, `city`, `postalCode`, `dob`, `gender`, `contactNumbers`.
2. **Employee (Superclass ISA Person)**: `EmployeeID` (PK), `hireDate`, `salary`, `employmentType`, `qualifications`.
   - **Doctor (Subclass)**: `licenseNumber`, `specialization`, `consultationFee`.
   - **Receptionist (Subclass)**: `shiftSchedule`, `deskNumber`.
   - **Pharmacist (Subclass)**: `pharmacyLicenseNo`, `assignedCounter`.
   - **LabTechnician (Subclass)**: `certificationNumber`, `labSection`.
   - **SystemAdmin (Subclass)**: `adminPrivilegeLevel`, `lastLoginTimestamp`.
3. **Patient (Subclass ISA Person)**: `PatientID` (PK), `emergencyContactName`, `emergencyContactPhone`, `bloodGroup`, `allergies`, `triagePriority`.
4. **Appointment**: `AppointmentID` (PK), `appointmentDate`, `appointmentTime`, `status` (`SCHEDULED`, `CONFIRMED`, `IN_CONSULTATION`, `COMPLETED`, `CANCELLED`). *Strict invariant*: No overlapping time slots for the same doctor.
5. **Drug**: `DrugID` (PK), `drugName`, `brandName`, `dosageForm`, `unitPrice`, `stockQuantity`, `reorderLevel`, `expiryDate`.
6. **Prescription**: `PrescriptionID` (PK), `dosage`, `frequency`, `durationDays`, `dispensedStatus`. Triggers real-time stock deduction upon dispensing.
7. **LabTest**: `TestID` (PK), `testType`, `urgency`, `status` (`REQUESTED`, `SAMPLE_COLLECTED`, `COMPLETED`), `testResultData`, `referenceRange`, `conductedDate`.
8. **Invoice**: `InvoiceID` (PK), aggregates Doctor Consultation Fee + Pharmacy Dispensed Drugs + Lab Tests. `status` (`PENDING`, `PAID`, `CANCELLED`).
9. **PaymentTransaction**: `TransactionID` (PK), `paymentMethod` (`CASH`, `CARD`, `PAYHERE_GATEWAY`), `amountPaid`, `paymentDate`, `receiptNumber`.

### 4.2 Backend Architecture Requirements
- **Location**: `/Users/admin/Projects/honda_leda/backend`
- **Framework**: Spring Boot 3.2.x, Java 17, Maven Wrapper (`mvnw`).
- **Dependencies**:
  - `spring-boot-starter-web`
  - `spring-boot-starter-data-jpa`
  - `spring-boot-starter-validation`
  - `com.h2database:h2` (embedded, enabled at `/h2-console`)
  - `com.mysql:mysql-connector-j` (production MySQL support)
  - `lombok`
- **Database Profiles**:
  - Default: `h2` (`jdbc:h2:mem:pulseos_db;MODE=MySQL;DB_CLOSE_DELAY=-1`, console enabled at `http://localhost:8080/h2-console`).
  - Production: `mysql` (`jdbc:mysql://localhost:3306/pulseos_db`).
- **Seed Data**: Automated `DataSeeder` (`CommandLineRunner`) pre-populating rich realistic records across all 6 modules.

### 4.3 Frontend Architecture Requirements
- **Location**: `/Users/admin/Projects/honda_leda/frontend`
- **Framework**: Vite + React 19 + TypeScript + Tailwind CSS + Lucide React.
- **Design Language**: Apple HIG + Warm Humanist Clinical (tokens: Teal `#0D9488`, Slate `#F8FAFC`, Ink `#0F172A`, Urgency Coral `#F43F5E`, Amber `#F59E0B`).
- **Modules UI**:
  - Collapsible role-based sidebar switching views for Doctor, Receptionist, Pharmacist, Lab Tech, Cashier/Admin.
  - Interactive PayHere Sandbox checkout modal (accepting test card inputs) with real-time state transition to `PAID`.
  - Printable receipt generator.
  - Live API integration pointing to `http://localhost:8080/api/v1`.

### 4.4 DevOps & Delivery
1. **Startup Orchestration (`start.sh`)**: Unified script starting Spring Boot on port 8080 and Vite dev server on port 5173.
2. **Git Attribution (`scripts/simulate_git_history.sh`)**: Multi-branch commit generator establishing genuine commit counts across all 6 student contributors.
3. **Evaluation Walkthrough (`DEMO_WALKTHROUGH.md`)**: Presentation guide structured into 2-minute segments per student for the 15-minute viva.

---

## 5. Next Steps for Implementation Team
1. **Scaffold Backend**: Generate Spring Boot 3.2+ Maven project with `mvnw` in `backend/` and configure dual DB (`H2` + `MySQL`).
2. **Scaffold Frontend**: Initialize Vite React TypeScript in `frontend/` with Tailwind CSS and Lucide icons.
3. **Implement Domain Entities & M1–M6 Modules**: Build JPA entities, repositories, services, controllers, DTOs, and React views per student owner.
4. **Seed Database & Test PayHere Gateway**: Populate comprehensive initial records and connect sandbox payment flow.
5. **Run Multi-Author Git Simulation**: Establish branches and commits attributed to the 6 group members.
6. **Perform End-to-End Verification**: Validate rubric compliance and live walkthrough.
